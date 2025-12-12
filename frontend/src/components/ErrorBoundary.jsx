import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-center">
        <div className="mb-6">
          <AlertTriangle className="mx-auto text-red-600 mb-4" size={80} />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-xl text-gray-600 mb-4">Something went wrong</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-red-800 mb-2">Error Details:</p>
            <p className="text-sm text-red-700 font-mono">
              {error.statusText || error.message || 'Unknown error'}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Home size={20} />
            Go Home
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-600">
            If this problem persists, please contact support
          </p>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
