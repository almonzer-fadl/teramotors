import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true }, // john.doe@example.com
  password: { type: String, required: true },
  fullName: String, // firstName + lastName // John Doe
  role: { type: String, enum: ['admin', 'mechanic', 'inspector'], default: 'mechanic' },
  phone: String, // +5511999999999
  isActive: { type: Boolean, default: true }, // true if user is active
  emailVerified: { type: Boolean, default: false }, // true if email is verified
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = (mongoose.models && mongoose.models.User) || mongoose.model('User', UserSchema);

export default User;