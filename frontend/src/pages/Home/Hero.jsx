import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
          Welcome to Telehealth
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-100">
          Connect with healthcare providers from anywhere, anytime
        </p>
        <p className="text-lg mb-10 text-gray-200 max-w-2xl mx-auto">
          Experience seamless video consultations, secure messaging, and professional 
          healthcare services from the comfort of your home.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition transform hover:scale-105"
          >
            Login
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl mb-3">🎥</div>
            <h3 className="font-bold text-xl mb-2">Video Consultations</h3>
            <p className="text-sm text-gray-200">
              HD quality video calls with healthcare professionals
            </p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold text-xl mb-2">Real-time Chat</h3>
            <p className="text-sm text-gray-200">
              Instant messaging for quick health queries
            </p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-bold text-xl mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-200">
              Your health data is encrypted and protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;