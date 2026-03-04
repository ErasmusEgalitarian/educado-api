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
}
