const Appointment = require("../model/appointmentModel");
const User = require("../model/userModel");
const MedicalRecord = require("../model/medicalRecordModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get all doctors with filters
exports.getAllDoctors = catchAsync(async (req, res, next) => {
  const { 
    specialization, 
    minExperience, 
    maxFee,
    minRating,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const filter = { role: "doctor", isVerified: true, isActive: true };

  if (specialization) filter.specialization = specialization;
  if (minExperience) filter.experience = { $gte: parseInt(minExperience) };
  if (maxFee) filter.consultationFee = { $lte: parseInt(maxFee) };
  if (minRating) filter.rating = { $gte: parseFloat(minRating) };
  
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const doctors = await User.find(filter)
    .select("username email specialization experience consultationFee qualifications availability profileImage bio rating totalReviews")
    .sort("-rating -experience")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: "success",
    results: doctors.length,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: { doctors },
  });
});

// Get doctor by ID with availability
exports.getDoctorById = catchAsync(async (req, res, next) => {
  const doctor = await User.findById(req.params.id).select(
    "username email specialization experience consultationFee qualifications availability profileImage bio rating totalReviews"
  );

  if (!doctor || doctor.role !== "doctor") {
    return next(new AppError("Doctor not found", 404));
  }

  // Get doctor's upcoming appointments to show unavailable slots
  const upcomingAppointments = await Appointment.find({
    doctor: req.params.id,
    status: { $in: ["pending", "confirmed"] },
    appointmentDate: { $gte: new Date() },
  }).select("appointmentDate appointmentTime");

  res.status(200).json({
    status: "success",
    data: { 
      doctor,
      upcomingAppointments,
    },
  });
});

// Get all specializations
exports.getSpecializations = catchAsync(async (req, res, next) => {
  const specializations = await User.distinct("specialization", {
    role: "doctor",
    isVerified: true,
    isActive: true,
  });

  res.status(200).json({
    status: "success",
    results: specializations.length,
    data: { specializations: specializations.sort() },
  });
});

// Create appointment
exports.createAppointment = catchAsync(async (req, res, next) => {
  const {
    doctorId,
    appointmentDate,
    appointmentTime,
    reason,
    symptoms,
    appointmentType,
  } = req.body;

  // Verify patient
  if (req.user.role !== "patient") {
    return next(new AppError("Only patients can book appointments", 403));
  }

  // Verify doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== "doctor" || !doctor.isVerified) {
    return next(new AppError("Doctor not found or not available", 404));
  }

  // Validate appointment date (cannot be in the past)
  const appointmentDateTime = new Date(appointmentDate);
  if (appointmentDateTime < new Date()) {
    return next(new AppError("Cannot book appointments in the past", 400));
  }

  // Check if appointment slot is available
  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate: appointmentDateTime,
    appointmentTime,
    status: { $in: ["pending", "confirmed"] },
  });

  if (existingAppointment) {
    return next(new AppError("This time slot is already booked. Please choose another time.", 400));
  }

  // Create appointment
  const appointment = await Appointment.create({
    patient: req.user.id,
    doctor: doctorId,
    appointmentDate: appointmentDateTime,
    appointmentTime,
    reason,
    symptoms: symptoms || [],
    appointmentType: appointmentType || "video",
    payment: {
      amount: doctor.consultationFee,
      status: "pending",
    },
  });

  // Populate the appointment
  await appointment.populate("doctor", "username specialization consultationFee profileImage");

  res.status(201).json({
    status: "success",
    message: "Appointment created successfully",
    data: { appointment },
  });
});

// Get user's appointments
exports.getMyAppointments = catchAsync(async (req, res, next) => {
  const { status, upcoming, past, page = 1, limit = 10 } = req.query;

  const filter = {};

  // Filter by user role
  if (req.user.role === "patient") {
    filter.patient = req.user.id;
  } else if (req.user.role === "doctor") {
    filter.doctor = req.user.id;
  } else {
    return next(new AppError("Invalid user role", 400));
  }

  // Filter by status
  if (status) filter.status = status;

  // Filter by time
  if (upcoming === "true") {
    filter.appointmentDate = { $gte: new Date() };
    filter.status = { $in: ["pending", "confirmed"] };
  }

  if (past === "true") {
    filter.$or = [
      { appointmentDate: { $lt: new Date() } },
      { status: { $in: ["completed", "cancelled", "no-show"] } }
    ];
  }

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(filter)
    .sort("-appointmentDate -appointmentTime")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(filter);

  res.status(200).json({
    status: "success",
    results: appointments.length,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: { appointments },
  });
});

// Get appointment by ID
exports.getAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Check authorization
  const isPatient = req.user.id === appointment.patient._id.toString();
  const isDoctor = req.user.id === appointment.doctor._id.toString();

  if (!isPatient && !isDoctor && req.user.role !== "admin") {
    return next(new AppError("You are not authorized to view this appointment", 403));
  }

  res.status(200).json({
    status: "success",
    data: { appointment },
  });
});

// Update appointment status (Doctor only)
exports.updateAppointmentStatus = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Only doctor can update status
  if (req.user.id !== appointment.doctor._id.toString() && req.user.role !== "admin") {
    return next(new AppError("Only the assigned doctor can update appointment status", 403));
  }

  // Validate status transition
  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled", "no-show"],
    completed: [],
    cancelled: [],
    "no-show": [],
  };

  if (!validTransitions[appointment.status].includes(status)) {
    return next(new AppError(`Cannot change status from ${appointment.status} to ${status}`, 400));
  }

  appointment.status = status;
  if (notes) appointment.notes = notes;

  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "Appointment status updated successfully",
    data: { appointment },
  });
});

// Cancel appointment
exports.cancelAppointment = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Check authorization
  const isPatient = req.user.id === appointment.patient._id.toString();
  const isDoctor = req.user.id === appointment.doctor._id.toString();

  if (!isPatient && !isDoctor && req.user.role !== "admin") {
    return next(new AppError("You are not authorized to cancel this appointment", 403));
  }

  // Check if appointment can be cancelled
  if (!appointment.canBeCancelled()) {
    return next(new AppError("Cannot cancel appointment less than 24 hours before scheduled time", 400));
  }

  appointment.status = "cancelled";
  appointment.cancelledBy = req.user.id;
  appointment.cancellationReason = reason;
  appointment.cancelledAt = new Date();

  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "Appointment cancelled successfully",
    data: { appointment },
  });
});

// Add prescription to appointment (Doctor only)
exports.addPrescription = catchAsync(async (req, res, next) => {
  const { medications, diagnosis, additionalNotes } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Only the assigned doctor can add prescription
  if (req.user.id !== appointment.doctor._id.toString()) {
    return next(new AppError("Only the assigned doctor can add prescription", 403));
  }

  // Appointment must be completed
  if (appointment.status !== "completed") {
    return next(new AppError("Can only add prescription to completed appointments", 400));
  }

  appointment.prescription = {
    medications,
    diagnosis,
    additionalNotes,
    prescribedBy: req.user.id,
    prescribedAt: new Date(),
  };

  await appointment.save();

  // Create a medical record for the prescription
  await MedicalRecord.create({
    patient: appointment.patient._id,
    appointment: appointment._id,
    recordType: "prescription",
    title: `Prescription - ${new Date().toLocaleDateString()}`,
    description: diagnosis,
    diagnosis,
    medications,
    recordedBy: req.user.id,
    recordDate: new Date(),
  });

  res.status(200).json({
    status: "success",
    message: "Prescription added successfully",
    data: { appointment },
  });
});

// Add vital signs (Doctor only)
exports.addVitalSigns = catchAsync(async (req, res, next) => {
  const { bloodPressure, heartRate, temperature, weight, height, oxygenLevel } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Only the assigned doctor can add vital signs
  if (req.user.id !== appointment.doctor._id.toString()) {
    return next(new AppError("Only the assigned doctor can add vital signs", 403));
  }

  appointment.vitalSigns = {
    bloodPressure,
    heartRate,
    temperature,
    weight,
    height,
    oxygenLevel,
    recordedAt: new Date(),
  };

  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "Vital signs recorded successfully",
    data: { appointment },
  });
});

// Rate appointment (Patient only)
exports.rateAppointment = catchAsync(async (req, res, next) => {
  const { score, comment } = req.body;

  if (!score || score < 1 || score > 5) {
    return next(new AppError("Rating score must be between 1 and 5", 400));
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Only patient can rate
  if (req.user.id !== appointment.patient._id.toString()) {
    return next(new AppError("Only the patient can rate the appointment", 403));
  }

  // Can only rate completed appointments
  if (appointment.status !== "completed") {
    return next(new AppError("Can only rate completed appointments", 400));
  }

  // Check if already rated
  if (appointment.rating && appointment.rating.score) {
    return next(new AppError("Appointment already rated", 400));
  }

  appointment.rating = {
    score,
    comment: comment || "",
    ratedAt: new Date(),
  };

  await appointment.save();

  // Update doctor's overall rating
  const doctor = await User.findById(appointment.doctor._id);
  const completedAppointments = await Appointment.find({
    doctor: doctor._id,
    status: "completed",
    "rating.score": { $exists: true },
  });

  const totalRatings = completedAppointments.length;
  const sumRatings = completedAppointments.reduce(
    (sum, apt) => sum + (apt.rating.score || 0),
    0
  );

  doctor.rating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(2) : 0;
  doctor.totalReviews = totalRatings;

  await doctor.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Rating submitted successfully",
    data: { appointment },
  });
});

// Get appointment statistics (for dashboard)
exports.getAppointmentStats = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.user.role === "patient") {
    filter.patient = req.user.id;
  } else if (req.user.role === "doctor") {
    filter.doctor = req.user.id;
  }

  const stats = await Appointment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const upcoming = await Appointment.countDocuments({
    ...filter,
    appointmentDate: { $gte: new Date() },
    status: { $in: ["pending", "confirmed"] },
  });

  const completed = await Appointment.countDocuments({
    ...filter,
    status: "completed",
  });

  res.status(200).json({
    status: "success",
    data: {
      stats,
      upcoming,
      completed,
    },
  });
});