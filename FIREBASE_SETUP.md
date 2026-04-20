# 🚀 QUICK FIREBASE SETUP (5 minutes)

## Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **"Create a project"** or select existing
3. Name: `tenant-war-room` (or your choice)
4. Enable Google Analytics (optional)
5. Click **Create project** (wait 1-2 minutes)

## Step 2: Get Your Credentials
1. Once project loads, go to **⚙️ Project Settings** (gear icon, top left)
2. Click **"Your apps"** section
3. Click the **Web app icon** `</>` (create web app)
4. Copy the entire config object - you'll see 6 values

## Step 3: Update .env.local
Replace the placeholder values in `.env.local` with your real Firebase config:

```
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yourproject
VITE_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_BACKEND=firebase
```

## Step 4: Restart Dev Server
```bash
npm run dev
```

## Step 5: Verify Setup
- Open browser console
- Should see no more "Firebase credentials not configured" errors
- App should load with login page instead of setup wizard

---

## 🔍 How to Find Each Value

### API Key
- In Firebase Console → Project Settings → General → Your apps
- Look for "Web API Key" or in the config snippet

### Auth Domain
- Usually: `your-project-id.firebaseapp.com`

### Project ID
- The project ID you chose when creating the project

### Storage Bucket
- Usually: `your-project-id.appspot.com`

### Messaging Sender ID
- A long number (12-15 digits)

### App ID
- Format: `1:xxxxxxxxxxxx:web:xxxxxxxxxxxx`

---

## 🐛 Troubleshooting

### Still seeing errors?
1. **Check file name**: Must be exactly `.env.local` (no `.txt`)
2. **Check location**: Must be in project root (same level as `package.json`)
3. **No spaces**: `VITE_FIREBASE_API_KEY=value` (no spaces around `=`)
4. **No quotes**: Don't put quotes around values
5. **Restart server**: Vite needs restart to pick up env changes

### Test if env vars are loading:
Add this to any React component:
```javascript
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY)
```
Should show your actual key, not `undefined`.

---

## 🎯 Alternative: Use Supabase (PostgreSQL)

If Firebase is too complex, use Supabase instead:

1. Go to https://supabase.com
2. Sign up → Create project
3. Get URL and anon key from Settings → API
4. Update `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND=supabase
```

Both options work perfectly! Choose what you prefer. 🚀