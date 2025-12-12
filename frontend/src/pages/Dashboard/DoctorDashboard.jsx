import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  Video,
  FileText,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');

      // Fetch appointment stats
      const statsRes = await axios.get(`${API_URL}/appointments/stats`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsRes = await axios.get(
        `${API_URL}/appointments/my-appointments`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const allAppointments = appointmentsRes.data.data.appointments;
      
      // Filter today's appointments
      const todayAppts = allAppointments.filter(
        (apt) => apt.appointmentDate.split('T')[0] === today
      );

      // Filter pending appointments
      const pendingAppts = allAppointments.filter(
        (apt) => apt.status === 'pending'
      );

      setStats(statsRes.data.data);
      setTodayAppointments(todayAppts);
      setPendingAppointments(pendingAppts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      await axios.patch(
        `${API_URL}/appointments/${appointmentId}/status`,
        { status: 'confirmed' },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      
      alert('Appointment confirmed successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment');
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Welcome, Dr. {user?.name}!</h1>
          <p className="text-indigo-100">Your practice dashboard</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Today's Appointments</h3>
            <p className="text-3xl font-bold text-gray-800">{todayAppointments.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Pending</h3>
            <p className="text-3xl font-bold text-gray-800">{pendingAppointments.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Completed</h3>
            <p className="text-3xl font-bold text-gray-800">{stats?.completed || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Patients</h3>
            <p className="text-3xl font-bold text-gray-800">{stats?.completed || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Star className="text-orange-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Rating</h3>
            <p className="text-3xl font-bold text-gray-800">4.8</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Today's Schedule</h2>
                <button
                  onClick={() => navigate('/dashboard/appointments')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>

              {todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[80px]">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatTime(appointment.appointmentTime)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {appointment.duration || 30} min
                          </div>
                        </div>

                        <div className="h-12 w-px bg-gray-300"></div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800">
                              {appointment.patient?.username}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                appointment.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">Reason:</span> {appointment.reason}
                          </p>
                          {appointment.symptoms && appointment.symptoms.length > 0 && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Symptoms:</span>{' '}
                              {appointment.symptoms.join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {appointment.appointmentType === 'video' && (
                            <button
                              onClick={() => navigate('/videoCall')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                            >
                              <Video size={18} />
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/appointments/${appointment._id}`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Approvals */}
            {pendingAppointments.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <AlertCircle className="text-yellow-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {pendingAppointments.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {pendingAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 mb-1">
                            {appointment.patient?.username}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">Date:</span>{' '}
                            {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                            {formatTime(appointment.appointmentTime)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Reason:</span> {appointment.reason}
                          </p>
                        </div>
                        <button
                          onClick={() => handleConfirmAppointment(appointment._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition whitespace-nowrap"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pendingAppointments.length > 3 && (
                  <button
                    onClick={() => navigate('/dashboard/appointments?status=pending')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all {pendingAppointments.length} pending appointments →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/appointments')}
                  className="w-full bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="text-blue-600" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-800">View Schedule</h4>
                      <p className="text-xs text-gray-600">Manage appointments</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/dashboard/patients')}
                  className="w-full bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Users className="text-purple-600" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-800">Patient Records</h4>
                      <p className="text-xs text-gray-600">View medical history</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/dashboard/profile')}
                  className="w-full bg-green-50 hover:bg-green-100 p-4 rounded-lg transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-green-600" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-800">Update Profile</h4>
                      <p className="text-xs text-gray-600">Edit availability</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Earnings Summary */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={24} />
                <h3 className="text-xl font-bold">This Month</h3>
              </div>
              <div className="mb-4">
                <p className="text-green-100 text-sm mb-1">Total Earnings</p>
                <p className="text-4xl font-bold">$4,250</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Consultations</span>
                  <span className="font-semibold">85</span>
                </div>
              </div>
            </div>

            {/* Patient Satisfaction */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Patient Satisfaction</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall Rating</span>
                    <span className="font-semibold text-gray-800">4.8/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= 4.8 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">Recent Review</p>
                  <p className="text-sm text-gray-800 italic">
                    "Very professional and caring. Highly recommend!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;