# Deploying the Bhargava Backend to Render

This document explains how to deploy the backend (TypeScript + Node.js) to Render.com.

Prerequisites
- A GitHub repository containing this project and connected to Render (or push this repo to GitHub).
- A Render account.

Quick steps (Dashboard)
1. In Render, click New -> Web Service.
2. Connect your GitHub repo and select the repository that contains this project.
3. If the backend is in a subfolder (this project has a `backend` folder), set "Root Directory" to `backend`.
4. Environment: Node. Plan: Free (or choose a paid plan).
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Set environment variables (see below).
8. Create the service and wait for the build to finish.

Quick steps (Infrastructure as Code with render.yaml)
- This repo contains `render.yaml` in the `backend` folder. You can import this manifest in the Render dashboard when creating a new service or use the Render CLI to create the service.

Required environment variables
- PORT (Render will provide one; the app uses process.env.PORT)
- MONGODB_URI — your MongoDB connection string (Atlas recommended)
- EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE — if you want mailing
- CLINIC_NAME, CLINIC_EMAIL, CLINIC_PHONE, CLINIC_ADDRESS — optional but used in emails
- JWT_SECRET — for any admin authentication

Recommended values and notes
- Use MongoDB Atlas and set `MONGODB_URI` to the provided connection string.
- For Gmail SMTP, prefer an App Password and ensure less-secure access is configured if necessary.
- Ensure `NODE_ENV=production`.

Health check
- The app exposes `/health`. Configure Render's health check to use `/health` (HTTP 200 expected).

Troubleshooting
- If build fails, check the build logs for missing dependencies. Render's build runs in the `backend` folder when you set "Root Directory" accordingly.
- If the app can't connect to MongoDB, verify the URI and network access rules in Atlas (allow Render's IPs or enable access from anywhere during testing).

Local test
1. Copy `.env.example` to `.env` in the `backend` folder and set values.
2. Run `npm install` then `npm run build` then `npm start`.
