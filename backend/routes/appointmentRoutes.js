const express = require("express");
const protect = require("../middlewares/protect");
const {
  getAllDoctors,
  getDoctorById,
  getSpecializations,
  createAppointment,
  getMyAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  addPrescription,
  addVitalSigns,
  rateAppointment,
  getAppointmentStats,
} = require("../controller/appointmentController");

const router = express.Router();

// Public routes
router.get("/doctors", getAllDoctors);
router.get("/doctors/:id", getDoctorById);
router.get("/specializations", getSpecializations);

// Protected routes (require authentication)
router.use(protect);

// Appointment management
router.post("/", createAppointment);
router.get("/my-appointments", getMyAppointments);
router.get("/stats", getAppointmentStats);
router.get("/:id", getAppointment);
router.patch("/:id/status", updateAppointmentStatus);
router.patch("/:id/cancel", cancelAppointment);

// Doctor-only routes
router.post("/:id/prescription", addPrescription);
router.post("/:id/vital-signs", addVitalSigns);

// Patient-only routes
router.post("/:id/rate", rateAppointment);

module.exports = router;