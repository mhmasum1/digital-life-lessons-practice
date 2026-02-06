📘 Digital Life Lessons

Digital Life Lessons is a full-stack web platform where users can create, save, and share meaningful life lessons, personal growth insights, and real-world wisdom.
The platform encourages reflection, learning from experiences, and community-driven growth.

🌐 Live Website:
👉 https://digital-life-lessons-b2d6b.web.app

🔗 Client Repository:
👉 https://github.com/mhmasum1/digital-life-lessons

🔗 Server Repository:
👉 https://github.com/mhmasum1/digital-life-lessons-server

🚀 Key Features

🔐 Authentication & Authorization

Email & Password login

Google authentication

Firebase token verification on protected routes

📝 Life Lesson Management

Create, update, and delete life lessons

Set lesson visibility (Public / Private)

Choose access level (Free / Premium)

🌍 Public Lessons Browsing

Browse all public lessons without login

Search by title or keyword

Filter by category and emotional tone

Sort by newest or most saved

Pagination support

⭐ Premium System

Free vs Premium access control

Stripe one-time payment (৳1500 – lifetime)

Premium lessons locked for free users with upgrade prompt

❤️ User Engagement

Like lessons

Save lessons to Favorites

Comment on lessons

Report inappropriate content

📊 Dashboard (User & Admin)

User dashboard with stats and shortcuts

Admin dashboard for managing users & lessons

Reported/flagged lessons moderation

Featured lessons control

🧑‍💻 Tech Stack
Frontend

React

React Router

Tailwind CSS + DaisyUI

Firebase Authentication

Axios

Lottie React

SweetAlert2 & React Hot Toast

Backend

Node.js

Express.js

MongoDB

Firebase Admin SDK

Stripe Payment Gateway

JWT & Firebase Token Verification

🔐 Security & Best Practices

Environment variables used for all secrets

Firebase Admin SDK for secure token verification

Role-based access control (User / Admin)

Only lesson owner or admin can edit/delete lessons

CORS configured properly for production deployment

📂 Main Pages & Routes

Home

Login / Register

Public Lessons

Lesson Details (Protected)

Add Lesson (Protected)

My Lessons (Protected)

My Favorites (Protected)

Pricing / Upgrade (Protected)

User Dashboard

Admin Dashboard

Reported Lessons (Admin)

404 Not Found

Access Denied

💳 Payment Flow

User clicks Upgrade to Premium

Redirected to Stripe Checkout

Successful payment updates user plan in MongoDB

Premium access unlocked instantly

Cancelled payment redirects to cancel page

📱 Responsiveness & UI

Fully responsive for mobile, tablet, and desktop

Clean, modern UI with consistent spacing and typography

Uniform card layouts and button styles

Smooth user experience with loading spinners and animations

📌 Author

Mahmudul Hasan Masum
Frontend & Full-Stack Developer

GitHub: https://github.com/mhmasum1
