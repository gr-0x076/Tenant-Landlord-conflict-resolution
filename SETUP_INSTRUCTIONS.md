# 🔧 SETUP INSTRUCTIONS

> Your Tenant War Room app needs backend configuration. Follow these simple steps!

---

## ⚡ Quick Start (5 minutes)

### Option 1: Firebase (Recommended for Firebase lovers)

#### 1️⃣ Go to Firebase Console
- Visit: https://console.firebase.google.com
- Click **"Create a new project"** (or select existing)
- Name: `tenant-war-room` (or your choice)
- Click **Create Project**

#### 2️⃣ Get Your Credentials
- Once project loads, go to **⚙️ Project Settings** (gear icon, top left)
- Click **"Your apps"** section
- Click the **Web app icon** `</>` (create web app)
- Copy the entire config object
- You'll need these 6 values:

```javascript
apiKey: "...",
authDomain: "...",
projectId: "...",
storageBucket: "...",
messagingSenderId: "...",
appId: "..."
```

#### 3️⃣ Create `.env.local` File
Create a new file in your project root folder:
**File path**: `c:\Users\grmoh\Downloads\Tenet war room - Copy\.env.local`

**Paste this** (with your values from Step 2):
```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_BACKEND=firebase
```

#### 4️⃣ Restart Dev Server
In your terminal:
```bash
npm run dev
```

Done! ✅ App should load now.

---

### Option 2: Supabase (PostgreSQL Alternative)

#### 1️⃣ Go to Supabase
- Visit: https://supabase.com
- Click **"Sign up"**
- Sign up with GitHub or email
- Create new **Organization**

#### 2️⃣ Create Project
- Click **"New Project"**
- Name: `tenant-war-room`
- Create strong password (or generate one)
- Region: closest to you
- Click **Create new project** (wait 1-2 minutes)

#### 3️⃣ Get Your Credentials
- Once project loads, go to **Settings** (bottom left)
- Click **API**
- Copy these 2 values:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

#### 4️⃣ Create `.env.local` File
Create a new file: `c:\Users\grmoh\Downloads\Tenet war room - Copy\.env.local`

**Paste this** (with your values from Step 3):
```
VITE_SUPABASE_URL=YOUR_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_BACKEND=supabase
```

#### 5️⃣ Restart Dev Server
```bash
npm run dev
```

Done! ✅ App should load now.

---

## ❓ FAQ

### Q: Where do I find my Firebase/Supabase credentials?
**Firebase**: Go to Project Settings (⚙️) → "Your apps" section → Click the Web app `</>`
**Supabase**: Go to Settings → API

### Q: My `.env.local` file isn't being read!
- Make sure the file is in the **project root** (same level as `package.json`)
- Restart the dev server: `npm run dev`
- Don't use `env` or `ENV` file - must be exactly `.env.local`

### Q: Can I use both Firebase and Supabase?
Yes! Just switch by changing `VITE_BACKEND=firebase` or `VITE_BACKEND=supabase` in `.env.local`

### Q: Do I need to pay?
No! Both Firebase and Supabase have free tiers perfect for development/testing.

### Q: I see "SETUP REQUIRED" page in browser
This means your `.env.local` file is missing or credentials are invalid. Follow steps above!

### Q: Error says "Invalid API Key"
Your Firebase API key is wrong or not configured. Double-check you copied it correctly from Firebase Console.

### Q: Supabase page is blank/error
Make sure you set `VITE_BACKEND=supabase` in `.env.local`

---

## 🚀 Test Your Setup

Once app loads, try this flow:

1. **Sign Up**
   - Click "Sign Up"
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Role: Pick "Tenant"
   - Submit

2. **Create Building** (if landlord)
   - Or **Join Building** (if tenant)

3. **File an Issue** (if tenant)
   - Fill in title and description
   - Submit

4. **View Dashboard**
   - See your issue in the list
   - Check stats update

If this works → Backend is configured correctly! ✅

---

## 📞 Still Having Issues?

### Clear browser cache
1. Open Developer Tools (F12)
2. Right-click Reload button → Empty Cache and Hard Reload

### Delete node_modules and reinstall
```bash
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Check terminal for errors
The error message in browser often shows the exact problem. Copy it and check:
- Is `.env.local` in the right place?
- Are credentials from correct service (Firebase vs Supabase)?
- Did you spell `VITE_BACKEND` correctly?

---

## ✅ What Should Happen

### When Setup is Complete
- Page loads with login screen ✅
- No "SETUP REQUIRED" message ✅
- Can sign up without errors ✅
- Can navigate around app ✅

### When Setup is Incomplete
- Page shows "SETUP REQUIRED" ❌
- Console error about Firebase/Supabase ❌
- Can't sign up ❌

---

**You're all set! Now go build something amazing! 🚀**
