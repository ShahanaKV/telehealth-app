Telehealth Application

A streamlined telehealth platform enabling virtual consultations with video calls, real-time chat, and secure medical record management.

Features

Role-based access for patients and doctors

Appointment booking & management system

Real-time chat using Stream SDK

HD video consultations

Medical records & prescriptions

Secure authentication with email verification

Tech Stack

Frontend: React, Tailwind, Redux Toolkit

Backend: Node.js, Express, MongoDB

Real-Time: Stream Chat & Video SDK

Auth: JWT, bcrypt, Nodemailer

Project Overview

A full-stack telehealth solution enabling remote healthcare workflows—from booking appointments to completing live video consultations. The system provides dedicated dashboards for patients and doctors, integrates secure messaging, and supports prescription management.

Quick Start
# Clone repo
git clone https://github.com/ShahanaKV/telehealth-app.git
cd telehealth-app

Backend
cd backend
npm install
npm start

Frontend
cd frontend
npm install
npm run dev

Environment Variables

Backend (config.env):

DB=...
JWT_SECRET=...
STREAM_API_KEY=...
STREAM_API_SECRET=...
HOST_EMAIL=...
EMAIL_PASS=...


Frontend (.env):

VITE_API_URL=...
VITE_STREAM_API_KEY=...

Project Structure
telehealth-app/
  backend/
  frontend/
