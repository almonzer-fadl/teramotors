import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  // Multi-tenant support
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true,
    // Not required for SUPER_ADMIN users who can access all tenants
  },
  email: { type: String, required: true, unique: true }, // john.doe@example.com
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: String, // firstName + lastName // John Doe
  displayName: String, // Custom display name for the user
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'admin', 'mechanic', 'inspector'],
    default: 'mechanic'
  },
  phone: String, // +5511999999999
  isActive: { type: Boolean, default: true }, // true if user is active
  emailVerified: { type: Boolean, default: false }, // true if email is verified
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  needsPasswordChange: { type: Boolean, default: false }, // Force password change on first login
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ tenantId: 1, email: 1 });
UserSchema.index({ tenantId: 1, isActive: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ emailVerified: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save hook to set fullName and displayName
UserSchema.pre('save', function(next) {
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
    // Set displayName to fullName if not already set
    if (!this.displayName) {
      this.displayName = this.fullName;
    }
  }
  next();
});

// Export the User model, reusing existing model if available
// This prevents "OverwriteModelError" in development with hot reloading
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;