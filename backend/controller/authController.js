const User = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateOtp = require("../utils/generateOtp");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const { StreamChat } = require("stream-chat");

// Initialize Stream client
if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
  console.error("❌ STREAM_API_KEY or STREAM_API_SECRET is missing!");
  throw new Error("Stream credentials are required");
}

const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

console.log("✅ Stream Client initialized with Key:", process.env.STREAM_API_KEY.substring(0, 8) + "...");

// Sign JWT token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });
};

// Create and send token
const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  const streamToken = streamClient.createToken(user._id.toString());

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };

  res.cookie("token", token, cookieOptions);

  user.password = undefined;
  user.passwordConfirm = undefined;
  user.otp = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    streamToken,
    data: {
      user: {
        id: user._id.toString(),
        name: user.username,
        role: user.role,
        email: user.email,
        specialization: user.specialization,
        profileImage: user.profileImage,
      },
    },
  });
};

// SIGNUP
exports.signup = catchAsync(async (req, res, next) => {
  const { 
    email, 
    password, 
    passwordConfirm, 
    username, 
    role,
    // Doctor fields
    specialization,
    licenseNumber,
    qualifications,
    experience,
    consultationFee,
    bio,
    availability,
    // Patient fields
    dateOfBirth,
    gender,
    phoneNumber,
    bloodType,
    address,
    emergencyContact,
  } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  // Validate doctor-specific fields
  if (role === "doctor") {
    if (!specialization || !licenseNumber) {
      return next(new AppError("Doctors must provide specialization and license number", 400));
    }
    
    // Check if license number already exists
    const existingLicense = await User.findOne({ licenseNumber });
    if (existingLicense) {
      return next(new AppError("License number already registered", 400));
    }
  }

  // Generate OTP
  const otp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // Prepare user data
  const userData = {
    username,
    email,
    password,
    passwordConfirm,
    role: role || "patient",
    otp,
    otpExpires,
  };

  // Add doctor-specific fields
  if (role === "doctor") {
    userData.specialization = specialization;
    userData.licenseNumber = licenseNumber;
    userData.qualifications = qualifications || [];
    userData.experience = experience || 0;
    userData.consultationFee = consultationFee || 50;
    userData.bio = bio || "";
    userData.availability = availability || [];
  }

  // Add patient-specific fields
  if (role === "patient") {
    if (dateOfBirth) userData.dateOfBirth = dateOfBirth;
    if (gender) userData.gender = gender;
    if (phoneNumber) userData.phoneNumber = phoneNumber;
    if (bloodType) userData.bloodType = bloodType;
    if (address) userData.address = address;
    if (emergencyContact) userData.emergencyContact = emergencyContact;
  }

  // Create user
  const newUser = await User.create(userData);

  // Send OTP email
  try {
    await sendEmail({
      email: newUser.email,
      subject: "Verify Your Telehealth Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Telehealth! 🏥</h2>
          <p>Thank you for registering as a <strong>${role || 'patient'}</strong>.</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="margin-top: 20px;">This code will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    });

    createSendToken(newUser, 201, res, "Registration successful. Please verify your email.");
  } catch (error) {
    console.error("Email send error:", error);
    await User.findByIdAndDelete(newUser._id);
    return next(
      new AppError("There was an error sending the verification email. Please try again.", 500)
    );
  }
});

// VERIFY ACCOUNT
exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError("Email and OTP are required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user found with this email", 404));
  }

  if (user.isVerified) {
    return next(new AppError("Account is already verified", 400));
  }

  if (user.otp !== otp) {
    return next(new AppError("Invalid OTP", 400));
  }

  if (Date.now() > user.otpExpires) {
    return next(
      new AppError("OTP has expired. Please request a new OTP.", 400)
    );
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Email verified successfully. You can now log in.",
  });
});

// RESEND OTP
exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide your email", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user found with this email", 404));
  }

  if (user.isVerified) {
    return next(new AppError("Account is already verified", 400));
  }

  const otp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "Your New Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Verification Code</h2>
          <p>Your new verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="margin-top: 20px;">This code will expire in 24 hours.</p>
        </div>
      `,
    });

    res.status(200).json({
      status: "success",
      message: "New OTP sent to your email",
    });
  } catch (error) {
    console.error("Email send error:", error);
    return next(new AppError("Failed to send OTP. Please try again.", 500));
  }
});

// LOGIN
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!user.isVerified) {
    return next(new AppError("Please verify your email before logging in", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated. Please contact support.", 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Create Stream user with admin role
  try {
    const streamUser = {
      id: user._id.toString(),
      name: user.username,
      role: "admin",
      image: user.profileImage,
    };

    await streamClient.upsertUser(streamUser);
    console.log("✅ Stream user created/updated:", streamUser.id);

  } catch (streamError) {
    console.error("❌ Stream upsert error:", streamError);
    return next(new AppError("Failed to initialize chat service", 500));
  }

  // Generate Stream token
  const streamToken = streamClient.createToken(user._id.toString());
  console.log("✅ Stream token generated for user:", user._id.toString());

  // Generate JWT token
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 90) *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  };

  res.cookie("token", token, cookieOptions);

  user.password = undefined;

  res.status(200).json({
    status: "success",
    message: "Login successful",
    token,
    user: {
      id: user._id.toString(),
      name: user.username,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      profileImage: user.profileImage,
    },
    streamToken,
  });
});

// GET CURRENT USER
exports.getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// UPDATE PROFILE
exports.updateProfile = catchAsync(async (req, res, next) => {
  // Don't allow password update through this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates", 400));
  }

  const allowedFields = [
    "username", "phoneNumber", "bio", "profileImage",
    "address", "emergencyContact", "dateOfBirth", "gender",
    "bloodType", "medicalHistory", "allergies", "currentMedications",
    "qualifications", "experience", "consultationFee", "availability"
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: { user },
  });
});

// LOGOUT
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "loggedout", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});