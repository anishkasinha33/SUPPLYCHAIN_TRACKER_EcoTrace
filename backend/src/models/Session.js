import mongoose from 'mongoose';

// Only a SHA-256 hash of the session token is stored, so a leaked database cannot be used to log in.
const sessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String, maxlength: 200 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB deletes expired sessions

export const Session = mongoose.model('Session', sessionSchema);
