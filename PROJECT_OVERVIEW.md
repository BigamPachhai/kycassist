# KYC Assist - Project Overview

KYC Assist is an AI-powered Know Your Customer verification platform that automates and streamlines the identity verification process for financial institutions and service providers. The system uses advanced AI algorithms to intelligently process, analyze, and validate customer documents in real-time. The workflow begins when a user registers and completes a KYC application by uploading required identity documents (passport, national ID, driver's license) through a secure interface. The OCR system automatically extracts text and key information from these documents, which Google Generative AI and Mistral AI then analyze for authenticity and compliance. The system validates against predefined rules and flags any inconsistencies, while an AI-powered chat assistant guides users through the process. Admins review applications on a dashboard with AI-generated recommendations, and upon approval, users receive instant notifications via email and in-app alerts. The entire process reduces verification time from days to minutes while maintaining regulatory compliance and security, eliminating manual verification bottlenecks.

## 🛠️ Tech Stack

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcryptjs** - Password encryption
- **Google Generative AI** - AI document analysis
- **Mistral AI** - Advanced AI processing
- **Cloudinary** - Cloud image storage and optimization
- **Sharp** - Image processing library
- **Nodemailer** - Email service integration
- **express-validator** - Request validation
- **Morgan** - HTTP request logging
- **Multer** - File upload handling

### Frontend

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **react-hot-toast** - Toast notifications
- **Lucide React** - Icon library
- **@hookform/resolvers** - Form validation resolvers

### Infrastructure & Services

- **MongoDB Atlas** - Cloud database hosting
- **Cloudinary** - Media management and storage
- **Gmail SMTP** - Email service provider
- **Nodemon** - Development server auto-reload
