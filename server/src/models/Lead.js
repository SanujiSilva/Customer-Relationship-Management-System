import mongoose from 'mongoose';

export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
export const LEAD_SOURCES = ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Partner', 'Other'];

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const leadSchema = new mongoose.Schema(
  {
    leadName: {
      type: String,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      required: true
    },
    assignedSalesperson: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'New'
    },
    dealValue: {
      type: Number,
      required: true,
      min: 0
    },
    notes: [noteSchema]
  },
  { timestamps: true }
);

leadSchema.index({
  leadName: 'text',
  companyName: 'text',
  email: 'text'
});

export const Lead = mongoose.model('Lead', leadSchema);
