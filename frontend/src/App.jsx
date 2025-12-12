import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Link } from 'react-router-dom';
import HomeIndex from './pages/Home/HomeIndex';
import Hero from './pages/Home/Hero';
import NewUser from './pages/Auth/Join/NewUser';
import Login from './pages/Auth/login/Login';
import VerifyAcct from './pages/Auth/login/VerifyAcct';
import Dashboard from './pages/Dashboard/Dashboard';
import VideoStream from './components/VideoStream';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Doctor & Patient Dashboards
import PatientDashboard from './pages/Dashboard/PatientDashboard';
import DoctorDashboard from './pages/Dashboard/DoctorDashboard';

// Doctors
import DoctorList from './pages/Doctors/DoctorList';
import DoctorProfile from './pages/Doctors/DoctorProfile';

// Appointments
import AppointmentsList from './pages/Dashboard/AppointmentsList';

// Medical Records
import MedicalRecords from './pages/Dashboard/MedicalRecords';
import PrescriptionViewer from './pages/Dashboard/PrescriptionViewer';

// Role-based redirect component
const RoleBasedDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.role === 'doctor') {
    return <Navigate to="/dashboard/doctor" replace />;
  } else if (user.role === 'patient') {
    return <Navigate to="/dashboard/patient" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <HomeIndex />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Hero /> }
    ],
  },
  {
    path: 'signup',
    element: <NewUser />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: 'login',
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: 'verifyAcct',
    element: <VerifyAcct />,
    errorElement: <ErrorBoundary />,
  },

  // Doctor Listing (Public - can browse doctors)
  {
    path: 'doctors',
    element: <DoctorList />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: 'doctors/:id',
    element: <DoctorProfile />,
    errorElement: <ErrorBoundary />,
  },

  // Protected Routes - Main Dashboard (redirects based on role)
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <RoleBasedDashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Protected Routes - Patient Dashboard
  {
    path: 'dashboard/patient',
    element: (
      <ProtectedRoute allowedRoles={['patient']}>
        <PatientDashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Protected Routes - Doctor Dashboard
  {
    path: 'dashboard/doctor',
    element: (
      <ProtectedRoute allowedRoles={['doctor']}>
        <DoctorDashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Protected Routes - Appointments (Both roles)
  {
    path: 'dashboard/appointments',
    element: (
      <ProtectedRoute>
        <AppointmentsList />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: 'appointments/:id',
    element: (
      <ProtectedRoute>
        <AppointmentsList />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Protected Routes - Prescriptions
  {
    path: 'appointments/:id/prescription',
    element: (
      <ProtectedRoute>
        <PrescriptionViewer />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Protected Routes - Medical Records
  {
    path: 'dashboard/medical-records',
    element: (
      <ProtectedRoute>
        <MedicalRecords />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: 'medical-records/:id',
    element: (
      <ProtectedRoute>
        <MedicalRecords />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Protected Routes - Video Call
  {
    path: 'videoCall',
    element: (
      <ProtectedRoute>
        <VideoStream />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Protected Routes - Chat (Legacy - using Dashboard component)
  {
    path: 'dashboard/chat',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },

  // Catch all - 404
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">Page not found</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    ),
  },
]);

function App() {
  return (
    <div className="w-full min-w-[100vw] min-h-[100vh]">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;