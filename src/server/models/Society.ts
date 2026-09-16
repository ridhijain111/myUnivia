import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISocietyContact {
  email?: string;
  phone?: string;
  website?: string;
  roomOrOffice?: string;
}

export interface ISocietySocialLinks {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  discord?: string;
  youtube?: string;
}

export interface ISociety extends Document {
  societyId: string;
  name: string;
  description: string;
  category: string; // Flexible category: e.g. Technical, Cultural, Literary, Robotics, E-Cell, Sports, Drama, etc.
  logo?: string;
  avatar?: string;
  imageUrl?: string;
  coverImage?: string;
  contactInformation?: ISocietyContact;
  socialLinks?: ISocietySocialLinks;
  meetingSchedule?: string;
  location?: string;
  bannerColor?: string;
  memberCount: number;
  isOfficial: boolean;
  adminIds: string[]; // Campus IDs or emails of authorized society representatives/admins
  communityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SocietySchema = new Schema<ISociety>(
  {
    societyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'General Student Organization',
      trim: true,
      index: true, // Flexible category index for filtering
    },
    logo: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '🏛️',
    },
    contactInformation: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      website: { type: String, trim: true },
      roomOrOffice: { type: String, trim: true },
    },
    socialLinks: {
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      github: { type: String, trim: true },
      discord: { type: String, trim: true },
      youtube: { type: String, trim: true },
    },
    meetingSchedule: {
      type: String,
      default: 'Announced per meeting',
    },
    location: {
      type: String,
      default: 'Campus Wide',
    },
    bannerColor: {
      type: String,
      default: 'bg-purple-100 text-purple-700',
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    isOfficial: {
      type: Boolean,
      default: true,
    },
    adminIds: {
      type: [String],
      default: [],
    },
    communityId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes for rapid query resolution by name, description, category, location
SocietySchema.index({ name: 'text', description: 'text', category: 'text' });

export const Society: Model<ISociety> =
  mongoose.models.Society || mongoose.model<ISociety>('Society', SocietySchema);
