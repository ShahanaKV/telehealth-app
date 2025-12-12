const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Medical record must belong to a patient"],
      index: true,
    },
    appointment: {
      type: mongoose.Schema.ObjectId,
      ref: "Appointment",
    },
    recordType: {
      type: String,
      enum: [
        "consultation",
        "lab-result",
        "prescription",
        "imaging",
        "vaccination",
        "surgery",
        "other",
      ],
      required: [true, "Please specify record type"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    diagnosis: {
      type: String,
      maxlength: 1000,
    },
    treatment: {
      type: String,
      maxlength: 1000,
    },

    medications: [
      {
        name: { type: String, required: true },
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
        instructions: String,
      },
    ],

    labResults: [
      {
        testName: { type: String, required: true },
        result: { type: String, required: true },
        unit: String,
        referenceRange: String,
        status: {
          type: String,
          enum: ["normal", "abnormal", "critical"],
          default: "normal",
        },
        date: { type: Date, default: Date.now },
        notes: String,
      },
    ],

    imaging: [
      {
        type: {
          type: String,
          enum: ["X-Ray", "CT-Scan", "MRI", "Ultrasound", "PET-Scan", "Other"],
        },
        bodyPart: String,
        findings: String,
        date: Date,
        imageUrl: String,
      },
    ],

    vaccinations: [
      {
        vaccineName: String,
        date: Date,
        batchNumber: String,
        administeredBy: String,
        nextDueDate: Date,
      },
    ],

    files: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: {
          type: String,
          enum: ["pdf", "image", "document", "other"],
          required: true,
        },
        fileSize: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      respiratoryRate: Number,
      weight: Number,
      height: Number,
      bmi: Number,
      oxygenSaturation: Number,
      recordedAt: Date,
    },

    symptoms: [String],
    allergies: [String],
    chronicConditions: [String],

    familyHistory: [
      {
        condition: String,
        relation: String,
        notes: String,
      },
    ],

    recordedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Record must have a recorder"],
    },

    recordDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    isPrivate: {
      type: Boolean,
      default: true,
    },

    sharedWith: [
      {
        user: { type: mongoose.Schema.ObjectId, ref: "User" },
        sharedAt: Date,
        accessLevel: {
          type: String,
          enum: ["read", "write"],
          default: "read",
        },
      },
    ],

    tags: [String],

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },

    followUpRequired: {
      type: Boolean,
      default: false,
    },

    followUpDate: Date,

    notes: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
medicalRecordSchema.index({ patient: 1, recordDate: -1 });
medicalRecordSchema.index({ recordType: 1, status: 1 });
medicalRecordSchema.index({ recordedBy: 1 });
medicalRecordSchema.index({ tags: 1 });

// Auto-populate references
medicalRecordSchema.pre(/^find/, function (next) {
  this.populate({
    path: "patient",
    select: "username email dateOfBirth gender bloodType",
  })
    .populate({
      path: "recordedBy",
      select: "username role specialization profileImage",
    })
    .populate({
      path: "appointment",
      select: "appointmentDate appointmentTime status",
    });

  next();
});

// Virtual - Record Age
medicalRecordSchema.virtual("recordAge").get(function () {
  const now = new Date();
  const recordDate = new Date(this.recordDate);
  const daysDifference = Math.floor(
    (now - recordDate) / (1000 * 60 * 60 * 24)
  );

  if (daysDifference === 0) return "Today";
  if (daysDifference === 1) return "Yesterday";
  if (daysDifference < 7) return `${daysDifference} days ago`;
  if (daysDifference < 30) return `${Math.floor(daysDifference / 7)} weeks ago`;
  if (daysDifference < 365) return `${Math.floor(daysDifference / 30)} months ago`;
  return `${Math.floor(daysDifference / 365)} years ago`;
});

// Access Control Method
medicalRecordSchema.methods.canBeAccessedBy = function (userId) {
  if (this.patient._id.toString() === userId) return true;
  if (this.recordedBy._id.toString() === userId) return true;

  const sharedAccess = this.sharedWith.find(
    (share) => share.user.toString() === userId
  );

  return !!sharedAccess;
};

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
module.exports = MedicalRecord;
