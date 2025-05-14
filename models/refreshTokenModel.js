const mongoose = require('mongoose');

const refreshTokenSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    userAgent: {
      type: String,
      required: false
    },
    ipAddress: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Auto-expire tokens based on expiresAt field
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
