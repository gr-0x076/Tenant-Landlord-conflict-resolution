# QUICK START GUIDE

## ⚡ Get Running in 5 Minutes

This guide assumes you have Node.js 18+ installed.

---

## STEP 1: Install Dependencies (2 mins)

```bash
cd "Tenet war room - Copy"
npm install
```

---

## STEP 2: Choose Backend

### Option A: Firebase (Recommended for Quick Start)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name: `tenant-war-room`
4. Create project
5. Add web app
6. Copy credentials

### Option B: Supabase (Alternative)

1. Go to [Supabase](https://supabase.io/)
2. Create new project
3. Get API URL and anon key

---

## STEP 3: Configure Environment

```bash
# Copy template
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

### Firebase Users:
```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_BACKEND=firebase
```

### Supabase Users:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_BACKEND=supabase
```

---

## STEP 4: Initialize Firebase Firestore (Firebase Only)

1. Go to Firebase Console → Your Project
2. Go to Firestore Database
3. Click "Create Database"
4. Choose location (closest to you)
5. Start in test mode (for development)

Collections will auto-create when first user signs up.

---

## STEP 5: Run Dev Server (1 min)

```bash
npm run dev
```

Visit: `http://localhost:5173`

---

## STEP 6: Test Complete Flow (2 mins)

### As Tenant:
1. Click "CREATE ACCOUNT"
2. Fill details, select "TENANT" role
3. Sign up
4. Enter building invite code (you'll create this as landlord first)
5. Join building
6. Go to dashboard

### As Landlord:
1. Click "CREATE ACCOUNT"
2. Fill details, select "LANDLORD" role
3. Sign up
4. Enter building name
5. **Copy the INVITE CODE** (displayed)
6. Give code to tenant
7. Go to dashboard

### File Issue (Tenant):
1. Click "+ FILE INCIDENT"
2. Fill form (title min 5 chars, description min 10 chars)
3. Choose category & severity
4. File issue
5. **Issue appears immediately in dashboard**

### Update Status (Landlord):
1. Click issue in dashboard
2. See "COMMAND - UPDATE STATUS" section (landlord only)
3. Change status
4. Click "UPDATE STATUS"
5. Status changes + timestamp updates

---

## 🎯 TEST ACCOUNTS

For quick testing without signing up:

**Test Landlord**:
- Email: `landlord@test.com`
- Password: `password123`
- Building: `Test Apartments`

**Test Tenant**:
- Email: `tenant@test.com`
- Password: `password123`

*(Create these manually or use credentials from signup)*

---

## 📁 Key Files to Understand

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app + routing |
| `src/pages/LoginPage.jsx` | Authentication |
| `src/pages/DashboardPage.jsx` | Issue list + stats |
| `src/pages/IssueDetailPage.jsx` | View/update issue |
| `src/context/AuthContext.jsx` | Global auth state |
| `src/services/firebase.js` | Firebase implementation |
| `src/hooks/useIssueStats.js` | Stats calculation (useMemo) |
| `tailwind.config.js` | War room theme colors |

---

## 🔥 Common Issues

### Issue: "Cannot find module firebase"

**Solution**:
```bash
npm install firebase
# or
npm install
```

### Issue: "VITE_FIREBASE_API_KEY is undefined"

**Solution**:
1. Check `.env.local` file exists
2. Check credentials are correct
3. Restart dev server: `npm run dev`

### Issue: "Failed to create issue"

**Solution**:
1. Check Firestore is initialized
2. Check user is in a building
3. Check security rules allow writes
4. Check browser console for errors

### Issue: "Build fails"

**Solution**:
```bash
# Clear cache
rm -rf node_modules/.vite
npm run build
```

---

## 🚀 Deployment Quick Links

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts, add env variables in dashboard
```

### Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
# Add env variables in Netlify dashboard
```

### Self-Hosted
```bash
npm run build
npm install -g serve
serve -s dist
```

---

## 📊 Project Structure Quick Reference

```
src/
├── components/       → Reusable UI (Button, Panel, etc)
├── pages/           → Full pages (Dashboard, Issue, etc)
├── context/         → Global state (Auth, Building)
├── hooks/           → Custom logic (useAuth, useIssueStats)
├── services/        → Backend abstraction
├── utils/           → Helpers, constants
└── styles/          → CSS

Key files:
- App.jsx → Routing hub
- main.jsx → Entry point
```

---

## ✅ CHECKLIST

Before you start:
- [ ] Node.js 18+ installed
- [ ] Cloned repo
- [ ] npm install run
- [ ] Firebase/Supabase account created
- [ ] .env.local configured
- [ ] Dev server running

Ready to use:
- [ ] Can sign up
- [ ] Can create building (landlord)
- [ ] Can join building (tenant)
- [ ] Can file issue (tenant)
- [ ] Can update status (landlord)
- [ ] Dashboard shows stats
- [ ] Comments work

---

## 📚 NEXT STEPS

1. **Understand the code**: Read through src/App.jsx → src/pages/DashboardPage.jsx
2. **Trace a request**: File issue → see how it flows through services
3. **Modify styling**: Change tailwind.config.js colors
4. **Add features**: Study the pattern, add similar features

---

## 💡 TIPS

- **Dev Tools**: Use React DevTools browser extension to inspect component state
- **Network Tab**: Check API calls to Firebase
- **Console**: Check for errors during operations
- **Hot Reload**: Changes auto-reload (thanks Vite!)
- **Testing**: Create multiple users/buildings to test flows

---

**Happy building! 🎉**

Questions? Check README.md, ARCHITECTURE.md, or VIVA_PREP.md
