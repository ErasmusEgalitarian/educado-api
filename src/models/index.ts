// Import all models
import { User } from './user.model'
import { Course } from './course.model'
import { Section } from './section.model'
import { Activity } from './activity.model'
import { CourseProgress } from './course-progress.model'
import { SectionProgress } from './section-progress.model'
import { Certificate } from './certificate.model'

// Define all associations here to avoid circular dependency issues

// Course relationships
Course.hasMany(Section, { foreignKey: 'courseId', as: 'sections' })
Course.hasMany(CourseProgress, { foreignKey: 'courseId', as: 'progress' })
Course.hasMany(Certificate, { foreignKey: 'courseId', as: 'certificates' })

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

export {
  User,
  Course,
  Section,
  Activity,
  CourseProgress,
  SectionProgress,
  Certificate,
}
