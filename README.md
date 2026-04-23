# Secure File Management System

Full-stack secure file management app with React, Tailwind CSS, Node.js, Express, and MongoDB.

## Features

- Registration, login, JWT auth, and OTP verification UI
- AES encrypted file storage with decrypted downloads
- Upload, rename, delete, share, and metadata views
- Activity logs, storage usage, notifications, and dark mode
- Role-based access and permission-aware sharing
- File validation, size limits, and simulated malware detection
- Email OTP and email attachment sharing when SMTP is configured

## Structure

```text
.
├── client
│   ├── src
│   ├── .env.example
│   └── package.json
├── server
│   ├── src
│   ├── .env.example
│   └── package.json
├── render.yaml
├── package.json
└── README.md
```

## Local Run

1. `npm install`
2. Copy `server/.env.example` to `server/.env`
3. Copy `client/.env.example` to `client/.env` if you want a custom frontend API URL
4. Start MongoDB locally or provide a cloud `MONGO_URI`
5. `npm run seed`
6. `npm start`

## Render Deploy

This repo includes `render.yaml` with two services:

- Backend web service rooted at `server`
- Frontend static site rooted at `client`

Backend env vars you must set in Render:

```env
MONGO_URI=your-mongodb-atlas-uri
CLIENT_URL=https://your-frontend-service.onrender.com
JWT_SECRET=your-secret
JWT_EXPIRES_IN=8h
ENCRYPTION_SECRET=12345678901234567890123456789012
MAX_FILE_SIZE_MB=10
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=Secure File Manager <your-email@gmail.com>
EMAIL_ATTACHMENT_LIMIT_MB=20
```

Frontend env vars you must set in Render:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## Sample Accounts

- `admin@example.com` / `Admin@123`
- `user@example.com` / `User@123`
- Demo OTP: `123456`
