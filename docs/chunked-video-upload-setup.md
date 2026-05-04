# Chunked video upload — deploy notes

A partir desta versão, uploads de vídeo passam a ser fatiados em chunks de
~50 MB e enviados em sequência para a API, que os reagrupa via S3 multipart
upload no MinIO. Isso contorna o limite de 100 MB por requisição que a
Cloudflare aplica (no plano Free) ao tráfego que entra pela rede deles —
incluindo o Cloudflare Tunnel usado pelo `educado.tominho.com`.

Imagens (≤ 10 MB) seguem usando o upload direto.
Streaming de mídia (`/media/:id/stream`) segue como pipe pela API.

## Mudanças que precisam ser aplicadas em produção

### 1. Migrations no banco

```bash
psql $POSTGRES_URI -f migrations/003-add-media-pending-status.sql
psql $POSTGRES_URI -f migrations/004-add-media-upload-id.sql
```

Ambas são idempotentes. Adicionam respectivamente:
- O valor `PENDING` ao enum `media_assets.status` (rows em upload em andamento)
- A coluna `upload_id` em `media_assets` (S3 multipart upload ID enquanto a
  sessão está aberta)

### 2. Variáveis de ambiente

Nenhuma variável nova é necessária. As envs S3 existentes (`S3_ENDPOINT`,
`S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`) continuam servindo.

### 3. Cloudflare e rede

Nenhuma alteração de DNS ou de proxy é necessária — todo o tráfego continua
passando pelo Cloudflare Tunnel existente.

### 4. Limite do reverse proxy / Coolify

Garantir que o Traefik / qualquer proxy à frente da API aceite requisições
de pelo menos **60 MB** (cada chunk vem como `multipart/form-data`, ~50 MB
de payload + overhead). O default do Traefik não impõe limite, então
geralmente nada precisa ser ajustado, mas vale conferir caso haja
configuração custom.

## Endpoints novos

- `POST /media/videos/init` → `{ id, chunkSize, totalParts }`
- `POST /media/videos/:id/parts/:partNumber` (multipart, campo `chunk`) →
  `{ partNumber, etag }`
- `POST /media/videos/:id/complete` (`{ parts: [{ partNumber, etag }] }`) →
  `MediaResponse`
- `POST /media/videos/:id/abort` → cleanup do multipart no S3 + remove o row

A rota legada `POST /media/videos` (upload em uma só requisição) foi
mantida pra compatibilidade durante a transição, mas continua sujeita ao
limite de 100 MB do Cloudflare. Pode ser removida depois que o frontend
novo estiver no ar.

## Validação

Após deploy:

1. No frontend, fazer upload de um vídeo > 100 MB.
2. Em DevTools → Network esperar ver:
   - 1× `POST /media/videos/init` → 201
   - N× `POST /media/videos/<id>/parts/<n>` → 200 cada (cada um com ~50 MB
     no payload; nenhum > 100 MB)
   - 1× `POST /media/videos/<id>/complete` → 200
3. O vídeo aparece no Media Bank com status `ACTIVE`.

## Limpeza de uploads abortados

Se o cliente cair sem chamar `/abort`, fica:
- Um row em `media_assets` com `status = PENDING` e `upload_id` preenchido
- Uma sessão multipart aberta no MinIO

As listagens já filtram `PENDING`, então não aparece pro usuário. Pra
limpar o lixo periodicamente vale criar um job que:
1. Encontra rows `PENDING` com `created_at < now() - 24h`
2. Chama `AbortMultipartUpload` no MinIO usando `upload_id`
3. Deleta o row

Não está implementado nesta entrega.
