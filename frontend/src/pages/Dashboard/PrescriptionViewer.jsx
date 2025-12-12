import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  User,
  Pill,
  Clock,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function PrescriptionViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');

      const res = await axios.get(`${API_URL}/appointments/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setAppointment(res.data.data.appointment);
    } catch (error) {
      console.error('Error fetching prescription:', error);
      alert('Failed to load prescription');
      navigate('/dashboard/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementation for downloading PDF
    alert('Download functionality will be implemented');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (!appointment || !appointment.prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Prescription Not Found</h2>
          <p className="text-gray-600 mb-6">This appointment doesn't have a prescription yet</p>
          <button
            onClick={() => navigate('/dashboard/appointments')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  const { prescription, doctor, patient } = appointment;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate('/dashboard/appointments')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Prescription Document */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Medical Prescription</h1>
                <p className="text-gray-600">Prescription ID: #{appointment._id.slice(-8)}</p>
              </div>
              <div className="text-right">
                <div className="bg-blue-100 p-3 rounded-lg inline-block">
                  <FileText className="text-blue-600" size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Prescribed By:</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xl font-bold text-gray-900">Dr. {doctor?.username}</p>
              <p className="text-gray-700">{doctor?.specialization}</p>
              {doctor?.licenseNumber && (
                <p className="text-sm text-gray-600 mt-2">
                  License No: {doctor.licenseNumber}
                </p>
              )}
            </div>
          </div>

          {/* Patient Information */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Patient Information:</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{patient?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(prescription.prescribedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Diagnosis:</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-gray-800">{prescription.diagnosis}</p>
              </div>
            </div>
          )}

          {/* Medications */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Pill className="text-blue-600" size={24} />
              Prescribed Medications:
            </h2>
            <div className="space-y-4">
              {prescription.medications.map((med, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{med.name}</h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Dosage</p>
                      <p className="font-semibold text-gray-900">{med.dosage}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Frequency</p>
                      <p className="font-semibold text-gray-900">{med.frequency}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Duration</p>
                      <p className="font-semibold text-gray-900">{med.duration}</p>
                    </div>
                  </div>

                  {med.instructions && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-1">Instructions:</p>
                      <p className="text-sm text-gray-800">{med.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          {prescription.additionalNotes && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Additional Notes:</h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-800">{prescription.additionalNotes}</p>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-red-900 mb-1">Important Notice</p>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Take medications exactly as prescribed</li>
                  <li>• Do not share medications with others</li>
                  <li>• Contact your doctor if you experience side effects</li>
                  <li>• Complete the full course even if you feel better</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 pt-6">
            <div className="flex justify-between items-end">
              <div className="text-sm text-gray-600">
                <p>This is a digitally generated prescription</p>
                <p>Prescription Date: {new Date(prescription.prescribedAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className="border-t-2 border-gray-800 pt-2 w-48">
                  <p className="text-sm font-semibold">Doctor's Signature</p>
                  <p className="text-xs text-gray-600">Dr. {doctor?.username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionViewer;