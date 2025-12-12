const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Appointment must have a patient"],
      index: true,
    },
    doctor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Appointment must have a doctor"],
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Please provide appointment date"],
      index: true,
    },
    appointmentTime: {
      type: String,
      required: [true, "Please provide appointment time"],
    },
    duration: {
      type: Number, // in minutes
      default: 30,
      min: 15,
      max: 120,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending",
      index: true,
    },
    appointmentType: {
      type: String,
      enum: ["video", "chat", "in-person"],
      default: "video",
    },
    reason: {
      type: String,
      required: [true, "Please provide reason for appointment"],
      maxlength: 500,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    prescription: {
      medications: [{
        name: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        instructions: String,
      }],
      diagnosis: String,
      additionalNotes: String,
      prescribedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      prescribedAt: Date,
    },
    vitalSigns: {
      bloodPressure: String, // e.g., "120/80"
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number,
      oxygenLevel: Number,
      recordedAt: Date,
    },
    payment: {
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "refunded", "failed"],
        default: "pending",
      },
      paymentMethod: {
        type: String,
        enum: ["card", "cash", "insurance", "other"],
      },
      transactionId: String,
      paidAt: Date,
    },
    videoCallLink: String,
    chatChannelId: String,
    cancelledBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    cancellationReason: String,
    cancelledAt: Date,
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: Date,
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      ratedAt: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1, appointmentTime: 1 });

// Virtual for calculating BMI if vitals are recorded
appointmentSchema.virtual('bmi').get(function() {
  if (this.vitalSigns && this.vitalSigns.weight && this.vitalSigns.height) {
    const heightInMeters = this.vitalSigns.height / 100;
    return (this.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  return null;
});

// Populate patient and doctor details
appointmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "patient",
    select: "username email phoneNumber dateOfBirth gender profileImage bloodType allergies",
  }).populate({
    path: "doctor",
    select: "username email specialization experience consultationFee profileImage qualifications rating",
  });
  next();
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const hoursDifference = (appointmentDateTime - now) / (1000 * 60 * 60);
  
  // Can cancel if appointment is more than 24 hours away and status is pending or confirmed
  return hoursDifference > 24 && ['pending', 'confirmed'].includes(this.status);
};

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  return appointmentDateTime > now && ['pending', 'confirmed'].includes(this.status);
};

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;