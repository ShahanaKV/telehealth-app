import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Plus,
  Filter,
  Search,
  Pill,
  Activity,
  Image as ImageIcon,
  Syringe,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchMedicalRecords();
  }, [filter]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');

      // Note: You'll need to create a medical records endpoint
      // For now, we'll use mock data
      
      // Simulating API call
      setTimeout(() => {
        const mockRecords = [
          {
            _id: '1',
            recordType: 'consultation',
            title: 'General Checkup - Dr. Smith',
            description: 'Routine health examination',
            recordDate: new Date('2024-01-15'),
            diagnosis: 'Patient in good health',
            recordedBy: { username: 'Dr. Smith', specialization: 'General Medicine' },
          },
          {
            _id: '2',
            recordType: 'prescription',
            title: 'Medication for Cold',
            description: 'Prescribed medication for common cold',
            recordDate: new Date('2024-01-10'),
            medications: [
              { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily' },
            ],
            recordedBy: { username: 'Dr. Johnson', specialization: 'Internal Medicine' },
          },
          {
            _id: '3',
            recordType: 'lab-result',
            title: 'Blood Test Results',
            description: 'Complete blood count',
            recordDate: new Date('2024-01-05'),
            labResults: [
              { testName: 'Hemoglobin', result: '14.5', unit: 'g/dL', status: 'normal' },
              { testName: 'WBC Count', result: '7500', unit: 'cells/µL', status: 'normal' },
            ],
            recordedBy: { username: 'Dr. Williams', specialization: 'Pathology' },
          },
        ];

        setRecords(mockRecords);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setLoading(false);
    }
  };

  const getRecordIcon = (type) => {
    const icons = {
      consultation: <FileText className="text-blue-600" size={24} />,
      prescription: <Pill className="text-purple-600" size={24} />,
      'lab-result': <Activity className="text-green-600" size={24} />,
      imaging: <ImageIcon className="text-orange-600" size={24} />,
      vaccination: <Syringe className="text-red-600" size={24} />,
    };
    return icons[type] || <FileText className="text-gray-600" size={24} />;
  };

  const getRecordColor = (type) => {
    const colors = {
      consultation: 'bg-blue-50 border-blue-200',
      prescription: 'bg-purple-50 border-purple-200',
      'lab-result': 'bg-green-50 border-green-200',
      imaging: 'bg-orange-50 border-orange-200',
      vaccination: 'bg-red-50 border-red-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredRecords = records.filter((record) => {
    const matchesFilter = filter === 'all' || record.recordType === filter;
    const matchesSearch =
      searchTerm === '' ||
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Medical Records</h1>
          <p className="text-gray-600">Your complete health history</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search records..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { value: 'all', label: 'All Records', icon: Filter },
              { value: 'consultation', label: 'Consultations', icon: FileText },
              { value: 'prescription', label: 'Prescriptions', icon: Pill },
              { value: 'lab-result', label: 'Lab Results', icon: Activity },
              { value: 'imaging', label: 'Imaging', icon: ImageIcon },
              { value: 'vaccination', label: 'Vaccinations', icon: Syringe },
            ].map((filterOption) => {
              const Icon = filterOption.icon;
              return (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    filter === filterOption.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {filterOption.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No records found</h3>
            <p className="text-gray-600">No medical records match your search criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record._id}
                className={`border-2 rounded-lg p-6 hover:shadow-lg transition ${getRecordColor(
                  record.recordType
                )}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getRecordIcon(record.recordType)}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{record.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(record.recordDate)}
                          </span>
                          {record.recordedBy && (
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {record.recordedBy.username}
                              {record.recordedBy.specialization &&
                                ` - ${record.recordedBy.specialization}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 capitalize">
                        {record.recordType.replace('-', ' ')}
                      </span>
                    </div>

                    {record.description && (
                      <p className="text-gray-700 mb-3">{record.description}</p>
                    )}

                    {record.diagnosis && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-800">Diagnosis:</p>
                        <p className="text-sm text-gray-700">{record.diagnosis}</p>
                      </div>
                    )}

                    {record.medications && record.medications.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Medications:</p>
                        <div className="space-y-2">
                          {record.medications.map((med, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 text-sm">
                              <p className="font-medium text-gray-800">{med.name}</p>
                              <p className="text-gray-600">
                                {med.dosage} - {med.frequency}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.labResults && record.labResults.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Test Results:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {record.labResults.map((test, index) => (
                            <div key={index} className="bg-white rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-800">{test.testName}</p>
                              <p className="text-lg font-bold text-gray-900">
                                {test.result} {test.unit}
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  test.status === 'normal'
                                    ? 'bg-green-100 text-green-800'
                                    : test.status === 'abnormal'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {test.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => navigate(`/medical-records/${record._id}`)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        <Eye size={18} />
                        ViewDetails
</button>
<button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
<Download size={18} />
Download
</button>
</div>
</div>
</div>
</div>
))}
</div>
)}
</div>
</div>
);
}export default MedicalRecords;