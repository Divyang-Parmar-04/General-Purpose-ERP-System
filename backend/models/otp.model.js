const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: Number, required: true },
  purpose: {
    type: String,
    enum: ["USER_SIGNUP","USER_LOGIN", "PASSWORD_RESET"],
    required: true
  },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
