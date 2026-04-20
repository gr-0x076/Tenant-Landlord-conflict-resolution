# Tenant War Room

Tenant War Room is a real-time issue reporting platform for tenants and landlords. Users can sign in, join or create buildings, file incidents, track updates, and manage repairs through a shared dashboard.

## Features

- Authentication with role-based onboarding
- Landlord building creation with invite codes
- Tenant building join flow
- Issue creation, tracking, and status updates
- Comment threads on issues
- Real-time dashboard updates
- Firebase and Supabase service support

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Firebase
- Supabase

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root.

Example Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND=firebase
```

Example Supabase configuration:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND=supabase
```

## Run the App

```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Firestore Notes

If you use Firebase, make sure you:

- create the Firestore database
- publish the required Firestore rules
- enable the needed auth providers

## Project Structure

```text
src/
  components/
  context/
  hooks/
  pages/
  services/
  styles/
  utils/
```

## Status

The app has been cleaned up for:

- successful production build
- passing lint
- stable onboarding, building, dashboard, issue, and comment flows

