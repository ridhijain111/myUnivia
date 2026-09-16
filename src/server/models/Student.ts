import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject {
  title: string;
  description: string;
  link?: string;
  techStack?: string[];
}

export interface ICertification {
  name: string;
  issuer?: string;
  year?: string;
  url?: string;
}

export interface IStudentStats {
  societiesJoined: number;
  eventsAttended: number;
  upcomingDeadlines: number;
  savedOpportunities: number;
}

export interface IStudent extends Document {
  // Core Identifiers
  studentId: string;
  campusCardId: string;
  name: string;
  email: string;
  handle: string;
  role: string;
  phone?: string;
  avatar: string;
  status: string;

  // Academic Details
  university: string;
  course?: string;
  department?: string;
  major: string;
  classYear: string;
  semester?: string;

  // Personal & Campus Details
  bio?: string;
  hostelBlock?: string;

  // Competencies & Campus Life
  skills: string[];
  interests: string[];
  clubs: string[];
  projects: IProject[];
  achievements: string[];
  certifications: ICertification[];

  // Social & External Links
  linkedin?: string;
  github?: string;

  // Metrics
  stats: IStudentStats;
  isGuest?: boolean;
  isNewUser?: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    link: { type: String, trim: true },
    techStack: [{ type: String, trim: true }],
  },
  { _id: false }
);

const CertificationSchema = new Schema<ICertification>(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, trim: true },
    year: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const StudentStatsSchema = new Schema<IStudentStats>(
  {
    societiesJoined: { type: Number, default: 0, min: 0 },
    eventsAttended: { type: Number, default: 0, min: 0 },
    upcomingDeadlines: { type: Number, default: 0, min: 0 },
    savedOpportunities: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const StudentSchema = new Schema<IStudent>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID / Roll Number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    campusCardId: {
      type: String,
      required: [true, 'Campus Card ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Valid institutional email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    handle: {
      type: String,
      trim: true,
      default: function (this: IStudent) {
        return this.name
          ? `@${this.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
          : '@student';
      },
    },
    role: {
      type: String,
      enum: ['Guest', 'Student', 'Student Lead', 'Society Admin', 'Super Admin', 'Fresher Student'],
      default: 'Student',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: '🟢 Active on Campus',
      trim: true,
    },

    // Academics
    university: {
      type: String,
      default: '',
      trim: true,
    },
    course: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    major: {
      type: String,
      default: '',
      trim: true,
    },
    classYear: {
      type: String,
      default: '',
      trim: true,
    },
    semester: {
      type: String,
      default: '1st Semester',
      trim: true,
    },

    // Personal & Campus Details
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
      trim: true,
    },
    hostelBlock: {
      type: String,
      default: 'Day Scholar',
      trim: true,
    },

    // Skills, Clubs, Projects, etc.
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    clubs: {
      type: [String],
      default: [],
    },
    projects: {
      type: [ProjectSchema],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [CertificationSchema],
      default: [],
    },

    // Social Links
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },

    // Stats
    stats: {
      type: StudentStatsSchema,
      default: () => ({
        societiesJoined: 0,
        eventsAttended: 0,
        upcomingDeadlines: 0,
        savedOpportunities: 0,
      }),
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    isNewUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Prevent re-compilation in development watch mode
export const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
