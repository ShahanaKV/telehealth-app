import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, DollarSign, Award, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    minExperience: '',
    maxFee: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecializations();
    fetchDoctors();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const res = await axios.get(`${API_URL}/appointments/specializations`);
      setSpecializations(res.data.data.specializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.minExperience) params.append('minExperience', filters.minExperience);
      if (filters.maxFee) params.append('maxFee', filters.maxFee);

      const res = await axios.get(`${API_URL}/appointments/doctors?${params.toString()}`);
      setDoctors(res.data.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      specialization: '',
      minExperience: '',
      maxFee: '',
    });
    fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Find a Doctor</h1>
          <p className="text-blue-100">Book appointments with experienced healthcare professionals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name or specialization"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Specialization</label>
                <select
                  name="specialization"
                  value={filters.specialization}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Max Fee ($)</label>
                <input
                  type="number"
                  name="maxFee"
                  value={filters.maxFee}
                  onChange={handleFilterChange}
                  placeholder="Any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Doctor List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">No doctors found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={doctor.profileImage || 'https://via.placeholder.com/80'}
                    alt={doctor.username}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{doctor.username}</h3>
                    <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="text-gray-700 font-medium">
                        {doctor.rating || 0} ({doctor.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award size={18} className="text-blue-600" />
                    <span>{doctor.experience || 0} years experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={18} className="text-green-600" />
                    <span>${doctor.consultationFee} per consultation</span>
                  </div>
                </div>

                {doctor.qualifications && doctor.qualifications.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {doctor.qualifications.slice(0, 2).join(', ')}
                    </p>
                  </div>
                )}

                <Link
                  to={`/doctors/${doctor._id}`}
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  View Profile & Book
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorList;