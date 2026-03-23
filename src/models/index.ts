// Import all models
import { User } from './user.model'
import { Course } from './course.model'
import { Section } from './section.model'
import { Activity } from './activity.model'
import { CourseProgress } from './course-progress.model'
import { SectionProgress } from './section-progress.model'
import { Certificate } from './certificate.model'
import { RegistrationProfile } from './registration-profile.model'
import { RegistrationReview } from './registration-review.model'
import { Tag } from './tag.model'
import { CourseTag } from './course-tag.model'
import { MediaAsset } from './media-asset.model'
import { Institution } from './institution.model'
import { EmailVerification } from './email-verification.model'
import { PasswordReset } from './password-reset.model'
import { Enrollment } from './enrollment.model'
import { ActivityProgress } from './activity-progress.model'
import { PointsLedger } from './points-ledger.model'
import { StudentStats } from './student-stats.model'
import { Badge } from './badge.model'
import { StudentBadge } from './student-badge.model'
import { CourseReview } from './course-review.model'

// Define all associations here to avoid circular dependency issues

// Course relationships
Course.hasMany(Section, { foreignKey: 'courseId', as: 'sections' })
Course.hasMany(CourseProgress, { foreignKey: 'courseId', as: 'progress' })
Course.hasMany(Certificate, { foreignKey: 'courseId', as: 'certificates' })
Course.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' })
Course.belongsToMany(Tag, {
  through: CourseTag,
  foreignKey: 'courseId',
  otherKey: 'tagId',
  as: 'reusableTags',
})

// User relationships
User.hasMany(CourseProgress, { foreignKey: 'userId', as: 'courseProgress' })
User.hasMany(Certificate, { foreignKey: 'userId', as: 'certificates' })
User.hasMany(Course, { foreignKey: 'ownerId', as: 'ownedCourses' })
User.hasMany(MediaAsset, { foreignKey: 'ownerId', as: 'mediaAssets' })
User.hasOne(RegistrationProfile, {
  foreignKey: 'userId',
  as: 'registrationProfile',
})
User.hasMany(RegistrationReview, {
  foreignKey: 'userId',
  as: 'registrationReviews',
})
User.hasMany(RegistrationReview, {
  foreignKey: 'reviewedBy',
  as: 'reviewsGiven',
})
User.hasMany(EmailVerification, {
  foreignKey: 'userId',
  as: 'emailVerifications',
})
User.hasMany(PasswordReset, {
  foreignKey: 'userId',
  as: 'passwordResets',
})

// Section relationships
Section.belongsTo(Course, { foreignKey: 'courseId', as: 'course' })
Section.hasMany(Activity, { foreignKey: 'sectionId', as: 'activities' })
Section.hasMany(SectionProgress, {
  foreignKey: 'sectionId',
  as: 'sectionProgress',
})

// Activity relationships
Activity.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' })

// CourseProgress relationships
CourseProgress.belongsTo(Course, { foreignKey: 'courseId', as: 'course' })
CourseProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' })
CourseProgress.hasMany(SectionProgress, {
  foreignKey: 'courseProgressId',
  as: 'sections',
})

// SectionProgress relationships
SectionProgress.belongsTo(CourseProgress, {
  foreignKey: 'courseProgressId',
  as: 'courseProgress',
})
SectionProgress.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' })

// Certificate relationships
Certificate.belongsTo(Course, { foreignKey: 'courseId', as: 'course' })
Certificate.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Tag relationships
Tag.belongsToMany(Course, {
  through: CourseTag,
  foreignKey: 'tagId',
  otherKey: 'courseId',
  as: 'courses',
})
CourseTag.belongsTo(Course, { foreignKey: 'courseId', as: 'course' })
CourseTag.belongsTo(Tag, { foreignKey: 'tagId', as: 'tag' })
Course.hasMany(CourseTag, { foreignKey: 'courseId', as: 'courseTags' })
Tag.hasMany(CourseTag, { foreignKey: 'tagId', as: 'courseTags' })

// Registration relationships
RegistrationProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' })
RegistrationReview.belongsTo(User, { foreignKey: 'userId', as: 'user' })
RegistrationReview.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' })
MediaAsset.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' })
User.belongsTo(MediaAsset, { foreignKey: 'avatarMediaId', as: 'avatar' })
EmailVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' })
PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Enrollment relationships
User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' })
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' })
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' })

// ActivityProgress relationships
SectionProgress.hasMany(ActivityProgress, {
  foreignKey: 'sectionProgressId',
  as: 'activityProgress',
})
ActivityProgress.belongsTo(SectionProgress, {
  foreignKey: 'sectionProgressId',
  as: 'sectionProgress',
})
ActivityProgress.belongsTo(Activity, {
  foreignKey: 'activityId',
  as: 'activity',
})
ActivityProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Gamification relationships
User.hasMany(PointsLedger, { foreignKey: 'userId', as: 'pointsLedger' })
User.hasOne(StudentStats, { foreignKey: 'userId', as: 'studentStats' })
User.hasMany(StudentBadge, { foreignKey: 'userId', as: 'studentBadges' })
PointsLedger.belongsTo(User, { foreignKey: 'userId', as: 'user' })
PointsLedger.belongsTo(Course, { foreignKey: 'courseId', as: 'course' })
StudentStats.belongsTo(User, { foreignKey: 'userId', as: 'user' })
StudentBadge.belongsTo(User, { foreignKey: 'userId', as: 'user' })
StudentBadge.belongsTo(Badge, { foreignKey: 'badgeId', as: 'badge' })
Badge.hasMany(StudentBadge, { foreignKey: 'badgeId', as: 'studentBadges' })

// CourseReview relationships
User.hasMany(CourseReview, { foreignKey: 'userId', as: 'reviews' })
Course.hasMany(CourseReview, { foreignKey: 'courseId', as: 'reviews' })
CourseReview.belongsTo(User, { foreignKey: 'userId', as: 'user' })
CourseReview.belongsTo(Course, { foreignKey: 'courseId', as: 'course' })

export {
  User,
  Course,
  Section,
  Activity,
  CourseProgress,
  SectionProgress,
  Certificate,
  RegistrationProfile,
  RegistrationReview,
  Tag,
  CourseTag,
  MediaAsset,
  Institution,
  EmailVerification,
  PasswordReset,
  Enrollment,
  ActivityProgress,
  PointsLedger,
  StudentStats,
  Badge,
  StudentBadge,
  CourseReview,
}
