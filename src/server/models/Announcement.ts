import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncementSender {
  id?: string;
  name?: string;
  role?: string;
  avatar?: string;
  studentId?: string;
  email?: string;
}

export interface IExtractedInformation {
  eventName?: string | null;
  eventType?: string | null;
  description?: string | null;
  date?: string | null;
  dateIso?: Date | null;
  startTime?: string | null;
  endTime?: string | null;
  venue?: string | null;
  mode?: 'Online' | 'Offline' | 'Hybrid' | string | null;
  onlineMeetingLink?: string | null;
  registrationLink?: string | null;
  registrationDeadline?: string | null;
  registrationDeadlineIso?: Date | null;
  registrationStatus?: 'not_announced' | 'open' | 'closing_soon' | 'closed' | 'completed' | string | null;
  eligibility?: string | null;
  targetAudience?: string | null;
  yearOrBranchRestrictions?: string | null;
  participationRequirements?: string | null;
  fees?: string | null;
  prizes?: string | null;
  speakers?: string[] | null;
  guests?: string[] | null;
  organizers?: string[] | null;
  contactInformation?: string | null;
  importantInstructions?: string | null;
  requiredDocuments?: string[] | null;
  submissionDeadline?: string | null;
  submissionDeadlineIso?: Date | null;
  eventStatus?: 'scheduled' | 'rescheduled' | 'cancelled' | 'registration_open' | 'registration_closed' | 'completed' | string | null;
  tags?: string[] | null;
  incompleteInfo?: boolean;
  missingFields?: string[] | null;
  notes?: string | null;
}

export interface IAnnouncement extends Document {
  announcementId: string;
  societyId: string;
  societyName: string;
  originalMessage: string; // The original source of truth
  sender?: IAnnouncementSender;
  messageTimestamp: Date;
  messageType: string; // 'event' | 'recruitment' | 'workshop' | 'hackathon' | 'competition' | 'seminar' | 'opportunity' | 'reminder' | 'notice' | 'schedule_change' | 'venue_change' | 'cancellation' | 'general_update' | 'other'
  extractedInformation?: IExtractedInformation;
  relatedEventId?: string;
  isDuplicate: boolean;
  isUpdate: boolean;
  supersedesAnnouncementId?: string;
  channelId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    announcementId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    societyId: {
      type: String,
      required: true,
      index: true,
    },
    societyName: {
      type: String,
      required: true,
      index: true,
    },
    originalMessage: {
      type: String,
      required: true, // Always preserved as the absolute source of truth
    },
    sender: {
      id: { type: String },
      name: { type: String },
      role: { type: String },
      avatar: { type: String },
      studentId: { type: String },
      email: { type: String },
    },
    messageTimestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    messageType: {
      type: String,
      default: 'general_update',
      index: true,
    },
    extractedInformation: {
      eventName: { type: String, default: null },
      eventType: { type: String, default: null },
      description: { type: String, default: null },
      date: { type: String, default: null },
      dateIso: { type: Date, default: null },
      startTime: { type: String, default: null },
      endTime: { type: String, default: null },
      venue: { type: String, default: null },
      mode: { type: String, default: null },
      onlineMeetingLink: { type: String, default: null },
      registrationLink: { type: String, default: null },
      registrationDeadline: { type: String, default: null },
      registrationDeadlineIso: { type: Date, default: null },
      registrationStatus: { type: String, default: null },
      eligibility: { type: String, default: null },
      targetAudience: { type: String, default: null },
      yearOrBranchRestrictions: { type: String, default: null },
      participationRequirements: { type: String, default: null },
      fees: { type: String, default: null },
      prizes: { type: String, default: null },
      speakers: { type: [String], default: [] },
      guests: { type: [String], default: [] },
      organizers: { type: [String], default: [] },
      contactInformation: { type: String, default: null },
      importantInstructions: { type: String, default: null },
      requiredDocuments: { type: [String], default: [] },
      submissionDeadline: { type: String, default: null },
      submissionDeadlineIso: { type: Date, default: null },
      eventStatus: { type: String, default: 'scheduled' },
      tags: { type: [String], default: [] },
      incompleteInfo: { type: Boolean, default: false },
      missingFields: { type: [String], default: [] },
      notes: { type: String, default: null },
    },
    relatedEventId: {
      type: String,
      index: true,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    isUpdate: {
      type: Boolean,
      default: false,
    },
    supersedesAnnouncementId: {
      type: String,
    },
    channelId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching across original message content and society announcements
AnnouncementSchema.index({
  originalMessage: 'text',
  societyName: 'text',
  'extractedInformation.eventName': 'text',
  'extractedInformation.description': 'text',
});

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
