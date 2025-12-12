import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  User,
  FileText,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  Search,
  Video,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function PatientDashboard() {
  const [stats, setStats] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
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

      // Fetch upcoming appointments
      const appointmentsRes = await axios.get(
        `${API_URL}/appointments/my-appointments?upcoming=true&limit=3`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setStats(statsRes.data.data);
      setUpcomingAppointments(appointmentsRes.data.data.appointments);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-blue-100">Here's your health dashboard</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Appointments</h3>
            <p className="text-3xl font-bold text-gray-800">
              {(stats?.upcoming || 0) + (stats?.completed || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Upcoming</h3>
            <p className="text-3xl font-bold text-gray-800">{stats?.upcoming || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Completed</h3>
            <p className="text-3xl font-bold text-gray-800">{stats?.completed || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FileText className="text-yellow-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Medical Records</h3>
            <p className="text-3xl font-bold text-gray-800">{recentRecords.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h2>
                <button
                  onClick={() => navigate('/dashboard/appointments')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">No upcoming appointments</p>
                  <button
                    onClick={() => navigate('/doctors')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Book Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/appointments/${appointment._id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            appointment.doctor?.profileImage ||
                            'https://via.placeholder.com/60'
                          }
                          alt={appointment.doctor?.username}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">
                            Dr. {appointment.doctor?.username}
                          </h3>
                          <p className="text-sm text-blue-600">
                            {appointment.doctor?.specialization}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(appointment.appointmentDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {appointment.appointmentTime}
                            </span>
                          </div>
                        </div>

                        {appointment.appointmentType === 'video' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/videoCall');
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                          >
                            <Video size={18} /> Join
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/doctors')}
                  className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition text-left"
                >
                  <Search className="text-blue-600 mb-2" size={24} />
                  <h3 className="font-semibold text-gray-800">Find Doctor</h3>
                  <p className="text-sm text-gray-600">Search specialists</p>
                </button>

                <button
                  onClick={() => navigate('/dashboard/appointments')}
                  className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition text-left"
                >
                  <Calendar className="text-green-600 mb-2" size={24} />
                  <h3 className="font-semibold text-gray-800">Appointments</h3>
                  <p className="text-sm text-gray-600">View all</p>
                </button>

                <button
                  onClick={() => navigate('/dashboard/medical-records')}
                  className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition text-left"
                >
                  <FileText className="text-purple-600 mb-2" size={24} />
                  <h3 className="font-semibold text-gray-800">Medical Records</h3>
                  <p className="text-sm text-gray-600">View history</p>
                </button>

                <button
                  onClick={() => navigate('/dashboard/profile')}
                  className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg transition text-left"
                >
                  <User className="text-yellow-600 mb-2" size={24} />
                  <h3 className="font-semibold text-gray-800">Profile</h3>
                  <p className="text-sm text-gray-600">Update info</p>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Tips */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Health Tip of the Day</h3>
              <p className="text-blue-100 mb-4">
                Stay hydrated! Drinking 8 glasses of water daily helps maintain body
                functions and improves overall health.
              </p>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm">💧 Track your water intake today</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-red-600" size={24} />
                <h3 className="text-xl font-bold text-gray-800">Emergency</h3>
              </div>
              <p className="text-gray-600 mb-4">For medical emergencies, contact:</p>

              <a
                href="tel:911"
                className="block w-full bg-red-600 text-white text-center py-3 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Call 911
              </a>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Appointment booked</p>
                    <p className="text-xs text-gray-600">2 days ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <FileText size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Record updated</p>
                    <p className="text-xs text-gray-600">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
