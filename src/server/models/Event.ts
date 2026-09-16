import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventUpdateRecord {
  announcementId: string;
  timestamp: Date;
  updateType: string; // 'venue_change' | 'time_rescheduled' | 'cancellation' | 'deadline_extension' | 'general_update';
  summary: string;
  previousValues: Record<string, any>;
}

export interface IEvent extends Document {
  eventId: string;
  societyId: string;
  societyName: string;
  title: string;
  description: string;
  eventType: string; // e.g., 'Workshop', 'Hackathon', 'Seminar', 'Competition', 'Orientation', 'Social', 'Meeting', etc.
  date: string;
  dateIso?: Date;
  startTime?: string;
  endTime?: string;
  venue: string;
  mode: 'Online' | 'Offline' | 'Hybrid' | string;
  onlineMeetingLink?: string;
  registrationLink?: string;
  registrationDeadline?: string;
  registrationDeadlineIso?: Date;
  registrationStatus: 'not_announced' | 'open' | 'closing_soon' | 'closed' | 'completed' | string;
  eligibility?: string;
  fees?: string;
  prizes?: string;
  speakers?: string[];
  contactInformation?: string;
  tags: string[];
  sourceAnnouncementId?: string;
  status: 'scheduled' | 'rescheduled' | 'cancelled' | 'registration_open' | 'registration_closed' | 'completed' | 'APPROVED' | 'PENDING' | 'REJECTED' | string;
  category?: string;
  attendeesCount: number;
  maxAttendees?: number;
  isToday?: boolean;
  updatesHistory: IEventUpdateRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    eventId: {
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
    title: {
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
    eventType: {
      type: String,
      default: 'Campus Event',
      trim: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    dateIso: {
      type: Date,
      index: true,
    },
    startTime: {
      type: String,
      default: '',
    },
    endTime: {
      type: String,
      default: '',
    },
    venue: {
      type: String,
      default: 'Campus Wide',
      trim: true,
      index: true,
    },
    mode: {
      type: String,
      default: 'Offline',
    },
    onlineMeetingLink: {
      type: String,
      default: '',
    },
    registrationLink: {
      type: String,
      default: '',
    },
    registrationDeadline: {
      type: String,
      default: '',
    },
    registrationDeadlineIso: {
      type: Date,
      index: true,
    },
    registrationStatus: {
      type: String,
      default: 'not_announced',
      index: true,
    },
    eligibility: {
      type: String,
      default: 'Open to all students',
    },
    fees: {
      type: String,
      default: 'Free',
    },
    prizes: {
      type: String,
      default: '',
    },
    speakers: {
      type: [String],
      default: [],
    },
    contactInformation: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    sourceAnnouncementId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      default: 'scheduled',
      index: true,
    },
    category: {
      type: String,
      default: 'Campus Event',
    },
    attendeesCount: {
      type: Number,
      default: 0,
    },
    maxAttendees: {
      type: Number,
    },
    isToday: {
      type: Boolean,
      default: false,
    },
    updatesHistory: [
      {
        announcementId: { type: String },
        timestamp: { type: Date, default: Date.now },
        updateType: { type: String },
        summary: { type: String },
        previousValues: { type: Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound and text indexes for generalized retrieval:
// event name, society name, description, venue, tags, category
EventSchema.index({
  title: 'text',
  description: 'text',
  societyName: 'text',
  venue: 'text',
  eventType: 'text',
  tags: 'text',
});

export const EventModel: Model<IEvent> =
  mongoose.models.EventModel || mongoose.model<IEvent>('EventModel', EventSchema);
