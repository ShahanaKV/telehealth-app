const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide username"],
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Please Provide an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a Password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your Password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
    // Role System
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    // Doctor-specific fields
    specialization: {
      type: String,
      required: function() {
        return this.role === "doctor";
      }
    },
    licenseNumber: {
      type: String,
      required: function() {
        return this.role === "doctor";
      },
      unique: true,
      sparse: true,
    },
    qualifications: [String],
    experience: {
      type: Number, // years of experience
      min: 0,
      default: 0,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    availability: [{
      day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      },
      startTime: String, // e.g., "09:00"
      endTime: String,   // e.g., "17:00"
      isAvailable: {
        type: Boolean,
        default: true,
      }
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Patient-specific fields
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\+?[\d\s-()]+$/.test(v);
        },
        message: "Please provide a valid phone number"
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    medicalHistory: [String],
    allergies: [String],
    currentMedications: [{
      name: String,
      dosage: String,
      frequency: String,
    }],
    // Common fields
    profileImage: {
      type: String,
      default: "https://via.placeholder.com/150"
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    otp: String,
    otpExpires: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    lastLogin: Date,
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ specialization: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Compare password method
userSchema.methods.correctPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const User = mongoose.model("User", userSchema);
module.exports = User;