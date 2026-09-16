import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOpportunity extends Document {
  opportunityId: string;
  societyId?: string;
  organization: string;
  title: string;
  type: 'Recruitment' | 'Internship' | 'Research' | 'Campus Job' | 'Hackathon' | 'Grant' | 'Scholarship' | string;
  location: string;
  compensation: string;
  deadline: string;
  deadlineIso?: Date;
  tags: string[];
  description: string;
  sourceAnnouncementId?: string;
  applicationLink?: string;
  eligibility?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    opportunityId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    societyId: {
      type: String,
      index: true,
    },
    organization: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: 'Opportunity',
      index: true,
    },
    location: {
      type: String,
      default: 'Campus Wide',
    },
    compensation: {
      type: String,
      default: 'N/A',
    },
    deadline: {
      type: String,
      default: 'Rolling',
    },
    deadlineIso: {
      type: Date,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    sourceAnnouncementId: {
      type: String,
      index: true,
    },
    applicationLink: {
      type: String,
      default: '',
    },
    eligibility: {
      type: String,
      default: 'Open to all students',
    },
  },
  {
    timestamps: true,
  }
);

OpportunitySchema.index({
  title: 'text',
  organization: 'text',
  description: 'text',
  tags: 'text',
});

export const OpportunityModel: Model<IOpportunity> =
  mongoose.models.OpportunityModel ||
  mongoose.model<IOpportunity>('OpportunityModel', OpportunitySchema);
