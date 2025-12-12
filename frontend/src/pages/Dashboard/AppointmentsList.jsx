import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MessageSquare, User, X, Star, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState({ score: 5, comment: '' });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      let url = `${API_URL}/appointments/my-appointments`;
      if (filter === 'upcoming') url += '?upcoming=true';
      if (filter === 'past') url += '?past=true';

      const res = await axios.get(url, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setAppointments(res.data.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      await axios.patch(
        `${API_URL}/appointments/${selectedAppointment._id}/cancel`,
        { reason: cancelReason },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      alert('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleRateAppointment = async () => {
    if (rating.score < 1 || rating.score > 5) {
      alert('Please provide a rating between 1 and 5');
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/appointments/${selectedAppointment._id}/rate`,
        rating,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      alert('Rating submitted successfully');
      setShowRatingModal(false);
      setRating({ score: 5, comment: '' });
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error rating appointment:', error);
      alert(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={18} className="text-blue-600" />;
      case 'chat':
        return <MessageSquare size={18} className="text-green-600" />;
      default:
        return <User size={18} className="text-purple-600" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage and view your appointments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Appointments
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">You don't have any appointments yet</p>
            {user?.role === 'patient' && (
              <button
                onClick={() => navigate('/doctors')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Find a Doctor
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          user?.role === 'patient'
                            ? appointment.doctor?.profileImage
                            : appointment.patient?.profileImage
                        }
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-800">
                            {user?.role === 'patient'
                              ? `Dr. ${appointment.doctor?.username}`
                              : appointment.patient?.username}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        {user?.role === 'patient' && (
                          <p className="text-blue-600 font-medium mb-2">
                            {appointment.doctor?.specialization}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{formatDate(appointment.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(appointment.appointmentType)}
                            <span className="capitalize">{appointment.appointmentType}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Reason:</span> {appointment.reason}
                          </p>
                          {appointment.symptoms && appointment.symptoms.length > 0 && (
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-semibold">Symptoms:</span>{' '}
                              {appointment.symptoms.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    {appointment.status === 'confirmed' &&
                      user?.role === 'patient' &&
                      appointment.appointmentType === 'video' && (
                        <button
                          onClick={() => navigate('/videoCall')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Video size={18} />
                          Join Call
                        </button>
                      )}

                    {appointment.status === 'completed' &&
                      user?.role === 'patient' &&
                      !appointment.rating?.score && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowRatingModal(true);
                          }}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                        >
                          <Star size={18} />
                          Rate
                        </button>
                      )}

                    {appointment.prescription && (
                      <button
                        onClick={() => navigate(`/appointments/${appointment._id}/prescription`)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                      >
                        <FileText size={18} />
                        Prescription
                      </button>
                    )}

                    {['pending', 'confirmed'].includes(appointment.status) && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowCancelModal(true);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/appointments/${appointment._id}`)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Payment Status:</span>{' '}
                    <span
                      className={`${
                        appointment.payment?.status === 'paid'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      } font-medium`}
                    >
                      {appointment.payment?.status}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    ${appointment.payment?.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for cancelling this appointment.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows="4"
              placeholder="Enter cancellation reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancelAppointment}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedAppointment(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Rate Your Experience</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating({ ...rating, score: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={
                        star <= rating.score
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Comment (Optional)</label>
              <textarea
                value={rating.comment}
                onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                rows="4"
                placeholder="Share your experience..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRateAppointment}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Submit Rating
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRating({ score: 5, comment: '' });
                  setSelectedAppointment(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsList;