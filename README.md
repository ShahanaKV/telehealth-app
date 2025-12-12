# Telehealth Application

A streamlined telehealth platform enabling virtual consultations with video calls, real-time chat, and secure medical record management.

Features

Role-based access for patients and doctors

Appointment booking and management

Real-time chat using Stream SDK

HD video consultations

Medical records and prescription handling

Secure authentication with email verification

Tech Stack

Frontend: React, Tailwind CSS, Redux Toolkit
Backend: Node.js, Express, MongoDB
Real-Time: Stream Chat & Video SDK
Auth: JWT, bcrypt, Nodemailer

Project Overview

A full-stack telehealth solution that supports end-to-end remote healthcare workflows, including doctor–patient communication, appointment scheduling, and secure medical record management.

Quick Start
 Clone repository
git clone https://github.com/ShahanaKV/telehealth-app.git
cd telehealth-app

Backend Setup
cd backend
npm install
npm start

Frontend Setup
cd frontend
npm install
npm run dev

Environment Variables

Backend (config.env)

DB=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
HOST_EMAIL=your_email
EMAIL_PASS=your_email_app_password


Frontend (.env)

VITE_API_URL=http://localhost:8000/api/v1
VITE_STREAM_API_KEY=your_stream_api_key

Project Structure
telehealth-app/
  backend/
  frontend/
