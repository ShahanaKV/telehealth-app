<h1 style="font-size: 42px; font-weight: 800;">
 Telehealth Application
</h1>

A modern telehealth platform enabling virtual consultations with video calls, real-time chat, and secure medical record management.

---

##  Features
- **Role-Based Access** for doctors and patients  
- **Appointment Booking & Management**  
- **Real-Time Chat** (Stream SDK)  
- **HD Video Consultations**  
- **Medical Records & Prescriptions**  
- **Secure Authentication** with email verification  

---

##  Tech Stack
### **Frontend**
- React  
- Tailwind CSS  
- Redux Toolkit  

### **Backend**
- Node.js  
- Express  
- MongoDB  

### **Real-Time**
- Stream Chat & Video SDK  

### **Authentication**
- JWT  
- bcrypt  
- Nodemailer  

---

##  Quick Start

### **1. Clone the Repository**
```bash
git clone https://github.com/ShahanaKV/telehealth-app.git
cd telehealth-app
2. Backend Setup
bash
Copy code
cd backend
npm install
npm start
3. Frontend Setup
bash
Copy code
cd frontend
npm install
npm run dev
🔧 Environment Variables
Backend (config.env)
ini
Copy code
DB=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
HOST_EMAIL=your_email
EMAIL_PASS=your_email_app_password
Frontend (.env)
ini
Copy code
VITE_API_URL=http://localhost:8000/api/v1
VITE_STREAM_API_KEY=your_stream_api_key
Project Structure
Copy code
telehealth-app/
  ├── backend/
  └── frontend/
