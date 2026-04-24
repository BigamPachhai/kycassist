# KYC Assist - AI-Powered Know Your Customer Platform

An intelligent KYC (Know Your Customer) verification system built with a modern tech stack, featuring AI-powered document processing, OCR capabilities, and automated verification workflows. This project was developed for the **eSewa x WWF Hackathon 2026**.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Contributing](#contributing)

## ✨ Features

### Core KYC Functionality

- **Document Upload & Verification**: Secure upload and processing of KYC documents
- **OCR Processing**: Automatic document text extraction and recognition
- **Smart Form Validation**: Real-time validation with intelligent error handling
- **Multi-step Verification**: Progressive KYC workflow with status tracking

### AI & Automation

- **AI Document Analysis**: Uses Google Generative AI and Mistral AI for intelligent document processing
- **Automated Data Extraction**: AI-powered extraction of key information from documents
- **Smart Chat Assistant**: AI-powered chatbot for user assistance and guidance
- **Intelligent Validation**: Machine learning-based verification of extracted data

### User Features

- **User Authentication**: Secure JWT-based authentication
- **Dashboard**: Personalized dashboard with KYC progress tracking
- **Real-time Notifications**: Email and in-app notifications for verification updates
- **Admin Panel**: Comprehensive admin dashboard for managing KYC applications

### Document Handling

- **Cloud Storage**: Cloudinary integration for secure document storage
- **Image Processing**: Sharp-based image optimization and compression
- **Multiple Format Support**: Support for various document formats

## 🏗️ Project Structure

```
kycassist/
├── backend/                    # Node.js + Express API server
│   ├── models/                 # MongoDB models
│   │   ├── User.js            # User model
│   │   ├── KYC.js             # KYC application model
│   │   └── Notification.js    # Notification model
│   ├── routes/                 # API routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── kyc.js             # KYC management routes
│   │   ├── ai.js              # AI processing routes
│   │   ├── ocr.js             # OCR routes
│   │   ├── notifications.js   # Notification routes
│   │   └── admin.js           # Admin routes
│   ├── middleware/             # Express middleware
│   │   └── auth.js            # JWT authentication middleware
│   ├── utils/                  # Utility functions
│   │   ├── kycValidator.js    # KYC validation logic
│   │   └── mailer.js          # Email sending utility
│   ├── server.js              # Express server entry point
│   └── package.json           # Backend dependencies
│
└── frontend/                   # React.js UI application
    ├── public/                 # Static files
    ├── src/
    │   ├── components/         # Reusable React components
    │   │   ├── AIChatAssistant.jsx
    │   │   ├── KYCProgressTracker.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── OCRUpload.jsx
    │   │   └── SmartInput.jsx
    │   ├── pages/              # Page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── KYCForm.jsx
    │   │   ├── Notifications.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── context/            # React context for state management
    │   │   ├── AuthContext.jsx
    │   │   └── KYCContext.jsx
    │   ├── hooks/              # Custom React hooks
    │   │   └── useOCR.js
    │   ├── api/                # API client
    │   │   └── client.js
    │   ├── App.js              # Main App component
    │   ├── index.js            # React entry point
    │   └── index.css           # Global styles
    ├── tailwind.config.js      # Tailwind CSS configuration
    └── package.json            # Frontend dependencies
```

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **AI/ML**:
  - Google Generative AI
  - Mistral AI
- **Cloud Services**:
  - Cloudinary (Image storage)
  - Nodemailer (Email service)
- **Image Processing**: Sharp
- **Validation**: express-validator
- **Development**: Nodemon

### Frontend

- **Library**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form
- **Validation**: Zod
- **API Client**: Axios
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary Account** (for image storage)
- **Gmail Account** (for email notifications)
- **Google Generative AI API Key**
- **Mistral AI API Key**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BigamPachhai/kycassist.git
cd kycassist
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kycassist

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Google Generative AI
GOOGLE_API_KEY=your_google_generative_ai_key

# Mistral AI
MISTRAL_API_KEY=your_mistral_api_key

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@kycassist.com

# Admin
ADMIN_EMAIL=admin@kycassist.com
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory (optional, uses proxy):

```env
REACT_APP_API_URL=http://localhost:4000/api
```

## 🎯 Running the Application

### Development Mode

#### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

Backend will be available at `http://localhost:4000`

#### Terminal 2 - Frontend Development Server

```bash
cd frontend
npm start
```

Frontend will be available at `http://localhost:3000`

### Production Build

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

### Database Seeding

To seed the database with sample data:

```bash
cd backend
npm run seed
```

## 📡 API Documentation

### Authentication Endpoints

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/logout` - User logout
- **GET** `/api/auth/me` - Get current user

### KYC Endpoints

- **GET** `/api/kyc` - Get all KYC applications
- **POST** `/api/kyc` - Create new KYC application
- **GET** `/api/kyc/:id` - Get KYC application by ID
- **PUT** `/api/kyc/:id` - Update KYC application
- **DELETE** `/api/kyc/:id` - Delete KYC application

### OCR Endpoints

- **POST** `/api/ocr/extract` - Extract text from document image

### AI Endpoints

- **POST** `/api/ai/analyze` - Analyze document with AI
- **POST** `/api/ai/chat` - Chat with AI assistant

### Notifications Endpoints

- **GET** `/api/notifications` - Get user notifications
- **POST** `/api/notifications/mark-read` - Mark notification as read

### Admin Endpoints

- **GET** `/api/admin/statistics` - Get platform statistics
- **GET** `/api/admin/applications` - List all KYC applications
- **PUT** `/api/admin/applications/:id/status` - Update application status

## 💾 Database

### MongoDB Collections

#### Users

```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  role: String (user/admin),
  status: String,
  createdAt: Date
}
```

#### KYC Applications

```javascript
{
  userId: ObjectId,
  status: String (pending/approved/rejected),
  documents: [
    {
      type: String,
      url: String,
      uploadedAt: Date
    }
  ],
  personalInfo: Object,
  addressInfo: Object,
  verificationData: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### Notifications

```javascript
{
  userId: ObjectId,
  title: String,
  message: String,
  type: String,
  read: Boolean,
  createdAt: Date
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **BigamPachhai** - Initial work and development

## 🎓 Project Info

- **Event**: eSewa x WWF Hackathon 2026
- **Date**: April 2026
- **Status**: Active Development

## 📞 Support

For support, email support@kycassist.com or open an issue on GitHub.

---

**Built with ❤️ for automated and intelligent KYC verification**
