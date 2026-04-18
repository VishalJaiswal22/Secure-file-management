# Secure File Management System

Full-stack secure file management app with React, Tailwind CSS, Node.js, Express, and MongoDB.

## Features

- Registration, login, JWT auth, and OTP verification UI
- AES encrypted file storage with decrypted downloads
- Upload, rename, delete, share, and metadata views
- Activity logs, storage usage, notifications, and dark mode
- Role-based access and permission-aware sharing
- File validation, size limits, and simulated malware detection

## Structure

```text
.
├── client
│   ├── src
│   │   ├── components
│   │   ├── lib
│   │   ├── utils
│   │   ├── App.jsx

│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── seed
│   │   ├── services
│   │   ├── utils
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## Run

1. `npm install`
2. Start MongoDB locally or update `server/.env`
3. Copy `server/.env.example` to `server/.env`
4. `npm run seed`
5. `npm start`

## Sample Accounts

- `admin@example.com` / `Admin@123`
- `user@example.com` / `User@123`
- Demo OTP: `123456`
