import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, Eye, EyeOff, User, Mail, Lock, Briefcase, Award } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function NewUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'patient',
    // Doctor fields
    specialization: '',
    licenseNumber: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    bio: '',
    // Patient fields
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    bloodType: '',
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  // Handle role change
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    setError('');
  };

  // Validate form
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return false;
    }

    // Doctor-specific validation
    if (role === 'doctor') {
      if (!formData.specialization.trim()) {
        setError('Specialization is required for doctors');
        return false;
      }
      if (!formData.licenseNumber.trim()) {
        setError('License number is required for doctors');
        return false;
      }
    }

    return true;
  };

  // Submit handler
  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const dataToSend = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        role: formData.role,
      };

      // Add role-specific fields
      if (role === 'doctor') {
        dataToSend.specialization = formData.specialization.trim();
        dataToSend.licenseNumber = formData.licenseNumber.trim();
        
        if (formData.qualifications.trim()) {
          dataToSend.qualifications = formData.qualifications
            .split(',')
            .map(q => q.trim())
            .filter(Boolean);
        }
        
        if (formData.experience) {
          dataToSend.experience = parseInt(formData.experience) || 0;
        }
        
        if (formData.consultationFee) {
          dataToSend.consultationFee = parseInt(formData.consultationFee) || 50;
        }
        
        if (formData.bio.trim()) {
          dataToSend.bio = formData.bio.trim();
        }
      } else if (role === 'patient') {
        if (formData.dateOfBirth) dataToSend.dateOfBirth = formData.dateOfBirth;
        if (formData.gender) dataToSend.gender = formData.gender;
        if (formData.phoneNumber.trim()) dataToSend.phoneNumber = formData.phoneNumber.trim();
        if (formData.bloodType) dataToSend.bloodType = formData.bloodType;
      }

      const response = await axios.post(`${API_URL}/users/signup`, dataToSend, {
        withCredentials: true,
      });
      
      console.log('Signup successful:', response.data);
      
      // Save email for OTP verification
      localStorage.setItem('pendingEmail', formData.email.trim().toLowerCase());
      
      // Navigate to verification page
      navigate('/verifyAcct');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Join our telehealth platform today</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-4 text-lg">I am a:</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleRoleChange('patient')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                role === 'patient'
                  ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div className="text-5xl mb-3">🏥</div>
              <div className="font-bold text-lg text-gray-800">Patient</div>
              <div className="text-sm text-gray-600 mt-1">Seeking medical care</div>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('doctor')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                role === 'doctor'
                  ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div className="text-5xl mb-3">👨‍⚕️</div>
              <div className="font-bold text-lg text-gray-800">Doctor</div>
              <div className="text-sm text-gray-600 mt-1">Healthcare provider</div>
            </button>
          </div>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          {/* Common Fields */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor-specific fields */}
          {role === 'doctor' && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Cardiology, Pediatrics"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Medical License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter license number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Consultation Fee (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      placeholder="50"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  Qualifications
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="e.g., MBBS, MD, FRCS (comma separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple qualifications with commas</p>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  Bio / About You
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell patients about yourself, your experience, and approach to healthcare..."
                  maxLength="500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
              </div>
            </div>
          )}

          {/* Patient-specific fields */}
          {role === 'patient' && (
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Award size={20} className="text-green-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Blood Type
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={24} />
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default NewUser;