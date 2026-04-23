# KYCAssist — eSewa × WWF Hackathon 2026

### Challenge 4: Intelligent KYC Experience & Support Ticket Reduction

**Team:** KYCAssist | **Developer:** Bigam Pachhai

---

## 🚀 What It Does

KYCAssist adds an intelligent layer on top of KYC forms to:

- **Auto-fill** form fields using OCR from uploaded documents (OCR.space + Mistral AI)
- **Validate fields in real-time** with contextual hints and error explanations
- **Answer KYC questions** via an AI chat assistant (Claude API)
- **Show verification progress** with a visual stepper
- **Send notifications** on status changes (email + in-app)

---

## 🗂️ Project Structure

```
kycassist/
├── backend/               # Node.js + Express API
│   ├── models/            # MongoDB schemas (User, KYC, Notification)
│   ├── routes/            # auth, kyc, ai, notifications
│   ├── middleware/        # JWT auth
│   ├── utils/             # mailer, kycValidator
│   └── server.js
└── frontend/              # React.js app
    └── src/
        ├── components/    # SmartInput, OCRUpload, KYCProgressTracker, AIChatAssistant, Navbar
        ├── context/       # AuthContext, KYCContext
        ├── hooks/         # useOCR
        ├── pages/         # Login, Register, Dashboard, KYCForm, Notifications
        └── api/           # Axios client
```

---

## 🛠️ Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React.js, Tailwind CSS, React Router            |
| OCR      | OCR.space + Mistral AI (server-side extraction) |
| AI Chat  | Anthropic Claude API (claude-sonnet-4-20250514) |
| Backend  | Node.js, Express.js, JWT                        |
| Database | MongoDB + Mongoose                              |
| Email    | Nodemailer (Gmail SMTP)                         |
| Version  | GitHub                                          |

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Mistral API key

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (MongoDB URI, JWT secret, Mistral API key, email, Cloudinary, OCR.space)
npm run dev
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 🔑 Environment Variables (backend/.env)

| Variable                | Description                     |
| ----------------------- | ------------------------------- |
| `MONGODB_URI`           | MongoDB connection string       |
| `JWT_SECRET`            | Secret for JWT signing          |
| `MISTRAL_API_KEY`       | Your Mistral API key            |
| `ANTHROPIC_API_KEY`     | Your Claude API key             |
| `EMAIL_USER`            | Gmail address for notifications |
| `EMAIL_PASS`            | Gmail app password              |
| `FRONTEND_URL`          | Frontend URL for CORS           |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name           |
| `CLOUDINARY_API_KEY`    | Cloudinary API key              |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret           |
| `OCR_SPACE_API_KEY`     | OCR.space API key               |

---

## 📡 API Endpoints

### Auth

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| POST   | /api/auth/register | Create account   |
| POST   | /api/auth/login    | Login            |
| GET    | /api/auth/me       | Get current user |

### KYC

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | /api/kyc/status              | Get KYC status & data      |
| POST   | /api/kyc/save                | Save draft                 |
| POST   | /api/kyc/submit              | Final submit               |
| POST   | /api/kyc/validate-field      | Real-time field validation |
| GET    | /api/kyc/history             | Status history             |
| POST   | /api/kyc/admin/update-status | Admin: update KYC status   |

### AI

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | /api/ai/chat         | AI chat (Claude)     |
| GET    | /api/ai/hints/:field | Field-specific hints |

### Notifications

| Method | Endpoint                    | Description   |
| ------ | --------------------------- | ------------- |
| GET    | /api/notifications          | Get all       |
| PATCH  | /api/notifications/:id/read | Mark one read |
| PATCH  | /api/notifications/read-all | Mark all read |

---

## 🧪 Demo Admin (update KYC status)

```bash
curl -X POST http://localhost:5000/api/kyc/admin/update-status \
  -H "Content-Type: application/json" \
  -H "x-admin-key: admin123" \
  -d '{"kycId":"<id>","status":"verified","note":"All documents verified"}'
```

---

## 📊 Judging Criteria Alignment

| Criteria                  | How KYCAssist addresses it                                 |
| ------------------------- | ---------------------------------------------------------- |
| Technical Implementation  | Full-stack: React + Node + MongoDB + Mistral + OCR.space   |
| Innovation & Creativity   | OCR auto-fill + AI chat = unique combination for Nepal KYC |
| User Experience (UX/UI)   | Multi-step form, real-time validation, progress tracker    |
| Scalability & Feasibility | Stateless API, CDN-deployable frontend, MongoDB Atlas      |
| Problem Understanding     | Directly targets form errors, abandonment, support tickets |
| Demo & Presentation       | Working prototype with all core features                   |

---

## 👨‍💻 Developer

**Bigam Pachhai** — Full Stack Developer  
📧 bigampachhai2@gmail.com | 🌐 bigampachhai.tech | 📞 +977-9866622412  
GitHub: [BigamPachhai](https://github.com/BigamPachhai)

_eSewa × WWF Hackathon 2026 — Challenge 4_
