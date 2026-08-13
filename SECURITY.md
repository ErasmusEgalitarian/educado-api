# Security Policy

Educado is an educational platform for waste pickers in Brazil, run as a
partnership between the University of Brasilia (UnB) and Aalborg University.
This repository is the backend REST API. It handles personal data of students
and content creators, so we take security reports seriously.

## Supported Versions

Only the current release line receives security updates. Older tags are not
patched: upgrade to the latest `1.0.x`.

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |
| < 1.0   | No        |

The deployed production instance is https://api-educado.tominho.com and it
always tracks the supported line.

## Reporting a Vulnerability

Do not open a public GitHub issue, pull request or discussion for a security
vulnerability.

Report it privately by email to **190091681@aluno.unb.br**. If you prefer, you
can also use GitHub's private vulnerability reporting on this repository
(Security tab, "Report a vulnerability").

Please include, as far as you can:

- A description of the vulnerability and its impact.
- The affected endpoint, file or component.
- Steps to reproduce, ideally with a minimal request or script.
- The version, commit hash or deployment you tested against.
- Any logs, screenshots or proof of concept you have.
- How you would like to be credited, if you want credit.

## What to expect

| Stage | Target |
| ----- | ------ |
| Acknowledgement of your report | within 5 business days |
| Initial assessment and severity triage | within 10 business days |
| Progress updates | every 15 days while the issue is open |
| Fix for a critical or high severity issue | within 30 days of triage |
| Fix for medium or low severity | scheduled into the normal release flow |

If we accept the report, we will work on a fix, keep you updated, and credit you
in the release notes unless you ask us not to. If we decline it, we will explain
why. Please keep the details private until a fix is released.

This is an academic project maintained by students and researchers, so response
times can stretch during exam periods and university holidays. We will tell you
if that happens.

## Scope

In scope:

- The source code in this repository, including the HTTP API, authentication and
  authorization logic, the media upload and streaming pipeline, the BullMQ email
  worker, and the Sequelize data layer.
- The production API at https://api-educado.tominho.com.
- Secrets, credentials or personal data accidentally committed to this
  repository.

Out of scope:

- Denial of service, volumetric or brute force load testing against the
  production environment.
- Social engineering, phishing or physical attacks against contributors or
  university staff.
- Vulnerabilities in third party dependencies that already have a public
  advisory and an open Dependabot pull request here. Report those upstream
  instead.
- Reports produced only by an automated scanner, with no demonstrated impact.
- Missing hardening headers or best practice suggestions with no exploitable
  impact. These are welcome, but as a normal issue, not as a vulnerability
  report.
- Third party services we do not operate (Resend, Coolify, the hosting
  provider). Report those to the vendor.

## Testing guidelines

If you test against the production API, use accounts you created yourself, do
not access or modify data belonging to other users, do not run destructive
operations, and stop as soon as you have confirmed the issue. Do not exfiltrate
personal data: a count or a redacted sample is enough to prove impact.
