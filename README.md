# StudySync AI

<p align="center">
  AI-powered student productivity platform designed to help students plan smarter, study efficiently, and generate intelligent study materials using Gemini AI.
</p>

---

## Overview

StudySync AI is a modern SaaS-style productivity dashboard built for students.  
The platform combines task management, Pomodoro focus sessions, analytics, smart notes, and AI-powered study assistance into one responsive web application.

Unlike demo-only student dashboards, StudySync AI uses:

- Firebase Authentication
- Firestore cloud database
- Real Gemini AI integration
- Persistent cloud-synced data
- Modern scalable React architecture

The project was designed as a production-style flagship portfolio application.

---

# Features

## AI Features
- AI-generated summaries
- AI flashcards
- AI quiz generation
- Concept explanation assistant
- AI study planner using task prioritization

## Productivity Features
- Task manager
- Planner workspace
- Pomodoro timer
- Study analytics dashboard
- Smart notes system
- Focus tracking

## Authentication & Backend
- Firebase Authentication
- Firestore database
- Cloud-synced user data
- Protected dashboard routes
- Session persistence

## UI / UX
- Premium dark SaaS-inspired design
- Fully responsive layout
- Smooth animations
- Loading skeletons
- Toast notifications
- Optimistic UI updates

---

# Tech Stack

| Frontend | Backend | AI | Deployment |
|---|---|---|---|
| React | Firebase | Gemini API | Vercel |
| Vite | Firestore | Gemini Flash | GitHub |
| Tailwind CSS | Firebase Auth | Google AI Studio | |

---

# Architecture

StudySync AI uses a scalable React architecture with modular Context Providers and Firestore subcollections.

users/{uid}/
├── tasks
├── notes
├── planner
├── pomodoro
└── analytics


The app was migrated from localStorage to Firestore for scalability and production readiness.

---

# Installation

Clone the repository:

```bash
git clone https://github.com/SidharthMonangi/studysync.git