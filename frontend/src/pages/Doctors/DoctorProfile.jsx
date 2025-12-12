import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, DollarSign, Award, Clock, Calendar, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    symptoms: '',
    appointmentType: 'video',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/appointments/doctors/${id}`);
      setDoctor(res.data.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      alert('Doctor not found');
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('Please login to book an appointment');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/appointments`,
        {
          doctorId: id,
          ...bookingData,
          symptoms: bookingData.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      alert('Appointment booked successfully!');
      setShowBookingModal(false);
      navigate('/dashboard/appointments');
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Doctor Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={doctor.profileImage || 'https://via.placeholder.com/150'}
              alt={doctor.username}
              className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
            />
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{doctor.username}</h1>
              <p className="text-xl text-blue-600 font-medium mb-3">{doctor.specialization}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(doctor.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-medium">
                  {doctor.rating || 0} ({doctor.totalReviews || 0} reviews)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Award className="text-blue-600" size={20} />
                  <span>{doctor.experience || 0} years of experience</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="text-green-600" size={20} />
                  <span className="font-semibold">${doctor.consultationFee} per consultation</span>
                </div>
              </div>

              {doctor.qualifications && doctor.qualifications.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Qualifications:</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.qualifications.map((qual, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {doctor.bio && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
          </div>
        )}

        {/* Availability Section */}
        {doctor.availability && doctor.availability.length > 0 && (
<div className="bg-white rounded-lg shadow-md p-6">
<h2 className="text-2xl font-bold text-gray-800 mb-4">Availability</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{doctor.availability.map((slot, index) => (
<div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
<span className="font-medium text-gray-800">{slot.day}</span>
<span className="text-gray-600">
{slot.startTime} - {slot.endTime}
</span>
</div>
))}
</div>
</div>
)}
</div>
  {/* Booking Modal */}
  {showBookingModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Book Appointment</h2>
        
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Appointment Date *</label>
            <input
              type="date"
              name="appointmentDate"
              value={bookingData.appointmentDate}
              onChange={handleBookingChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Appointment Time *</label>
            <input
              type="time"
              name="appointmentTime"
              value={bookingData.appointmentTime}
              onChange={handleBookingChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Appointment Type *</label>
            <select
              name="appointmentType"
              value={bookingData.appointmentType}
              onChange={handleBookingChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="video">Video Consultation</option>
              <option value="chat">Chat Consultation</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Reason for Visit *</label>
            <textarea
              name="reason"
              value={bookingData.reason}
              onChange={handleBookingChange}
              rows="3"
              placeholder="Describe your health concern"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Symptoms (comma separated)</label>
            <input
              type="text"
              name="symptoms"
              value={bookingData.symptoms}
              onChange={handleBookingChange}
              placeholder="e.g., fever, headache, cough"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <span className="font-semibold">Consultation Fee:</span> ${doctor.consultationFee}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={bookingLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
            >
              {bookingLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>
);
}
export default DoctorProfile;