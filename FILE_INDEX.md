# PROJECT FILE INDEX

## 📚 DOCUMENTATION FILES (Start Here!)

| File | Purpose | Read Time |
|------|---------|-----------|
| **DELIVERY_SUMMARY.md** | Overview of everything delivered | 10 min |
| **QUICK_START.md** | Get running in 5 minutes | 5 min |
| **README.md** | Comprehensive guide & reference | 20 min |
| **ARCHITECTURE.md** | System design & technical details | 15 min |
| **VIVA_PREP.md** | Interview preparation guide | 25 min |

---

## 🎯 START HERE GUIDE

### If you have 5 minutes:
1. Read QUICK_START.md
2. Run `npm install && npm run dev`
3. Try signing up

### If you have 15 minutes:
1. Read DELIVERY_SUMMARY.md
2. Read QUICK_START.md
3. Run the app

### If you have 30 minutes:
1. Read DELIVERY_SUMMARY.md
2. Read QUICK_START.md + README.md
3. Run the app
4. Explore the code

### If you have 1 hour (Evaluator):
1. Read DELIVERY_SUMMARY.md
2. Read README.md (full)
3. Read ARCHITECTURE.md
4. Run and demo the app
5. Skim through src/App.jsx and src/pages/DashboardPage.jsx

### If you're preparing for Viva:
1. Read VIVA_PREP.md
2. Practice demo flow
3. Read ARCHITECTURE.md for deep understanding
4. Trace code for key flows

---

## 📁 SOURCE CODE STRUCTURE

### Pages (Full-screen components)
```
src/pages/
├── LoginPage.jsx              - Email/password login
├── SignupPage.jsx             - Account creation + role selection
├── JoinBuildingPage.jsx       - Tenant: enter invite code
├── CreateBuildingPage.jsx     - Landlord: create building + get code
├── DashboardPage.jsx          - Main dashboard with issue list
├── IssueDetailPage.jsx        - View single issue + status updates
├── CreateIssuePage.jsx        - File new issue (tenant)
└── ProfilePage.jsx            - User profile + logout
```

### Components (Reusable UI)
```
src/components/
├── UIElements.jsx             - Button, Panel, Card, Input, Badge, etc
├── ProtectedRoute.jsx         - Route guards (auth + role-based)
├── CommentsSection.jsx        - Issue comment thread
└── StatsDashboard.jsx         - Stats display + severity chart
```

### Global State Management
```
src/context/
├── AuthContext.jsx            - User authentication state
└── BuildingContext.jsx        - Current building state
```

### Custom Hooks (Business Logic)
```
src/hooks/
├── useAuth.js                 - Access auth context
├── useBuilding.js             - Access building context
├── useDuplicateCheck.js       - Detect duplicate issues (5 min window)
└── useIssueStats.js           - Calculate stats (useMemo), filter issues (useCallback)
```

### Backend Services (Database Access)
```
src/services/
├── index.js                   - Service abstraction (chooses Firebase or Supabase)
├── firebase.js                - Firebase implementation
└── supabase.js                - Supabase implementation
```

### Utilities
```
src/utils/
└── helpers.js                 - Formatting, validation, constants, colors

src/styles/
└── globals.css                - Global styles + war room theme
```

### Entry Points
```
src/
├── App.jsx                    - Main app component + routing setup
└── main.jsx                   - React DOM render entry point
```

### Configuration
```
├── package.json               - Dependencies + scripts
├── vite.config.js             - Vite dev server config
├── tailwind.config.js         - Tailwind theme (war room colors)
├── postcss.config.js          - CSS processing
├── index.html                 - HTML template
└── .env.example               - Environment variables template
```

---

## 🔍 HOW TO FIND THINGS

### If you want to understand...

**Authentication**:
- Read: `src/pages/LoginPage.jsx` + `src/pages/SignupPage.jsx`
- Then: `src/context/AuthContext.jsx`
- Then: `src/services/firebase.js` (login/signup functions)

**Building System**:
- Read: `src/pages/CreateBuildingPage.jsx` + `src/pages/JoinBuildingPage.jsx`
- Then: `src/context/BuildingContext.jsx`
- Then: `src/services/firebase.js` (building functions)

**Issue Management**:
- Read: `src/pages/CreateIssuePage.jsx` (file issue)
- Read: `src/pages/IssueDetailPage.jsx` (view/update issue)
- Then: `src/pages/DashboardPage.jsx` (list issues)
- Then: `src/services/firebase.js` (issue CRUD)

**Dashboard Stats**:
- Read: `src/pages/DashboardPage.jsx`
- See: `src/components/StatsDashboard.jsx`
- Then: `src/hooks/useIssueStats.js` (stats + filtering)

**Styling & Theme**:
- Read: `tailwind.config.js` (colors + fonts)
- Then: `src/styles/globals.css` (animations + utilities)
- Then: `src/components/UIElements.jsx` (component styling)

**Advanced React Concepts**:
- useMemo: `src/hooks/useIssueStats.js` line ~10
- useCallback: `src/hooks/useIssueStats.js` line ~40
- Custom hooks: All files in `src/hooks/`
- Context API: `src/context/AuthContext.jsx` + usage in `src/pages/LoginPage.jsx`
- Routing: `src/App.jsx`
- Protected routes: `src/components/ProtectedRoute.jsx`

**Backend Abstraction**:
- Read: `src/services/index.js` (how it works)
- See: `src/services/firebase.js` (Firebase implementation)
- Compare: `src/services/supabase.js` (Supabase implementation)

---

## 🎬 DEMO FLOWS TO UNDERSTAND

### Signup Flow
```
SignupPage.jsx
  → Form submit
  → AuthContext.signup()
  → authService.auth.signup()
  → Firebase.createUserWithEmailAndPassword()
  → Create user document in Firestore
  → setUser() in context
  → Navigate to /create-building or /join-building
```

### File Issue Flow
```
CreateIssuePage.jsx
  → Form submit
  → Validate form
  → Check duplicate (useDuplicateCheck)
  → issueService.issue.createIssue()
  → Firebase.addDoc(collection(db, 'issues'))
  → Issue created in Firestore
  → Navigate to /dashboard
  → DashboardPage loads issues
  → New issue appears
```

### Update Status Flow
```
IssueDetailPage.jsx
  → Landlord only (RoleProtectedRoute)
  → SelectField: status change
  → Button click
  → issueService.issue.updateIssueStatus()
  → Firebase.updateDoc()
  → Firebase Rules: only landlord allowed
  → Status updated + timestamp
  → Comments reload
  → UI refreshes
```

---

## 📊 STATISTICS

| Metric | Value |
|--------|-------|
| **Total Files** | 30+ |
| **Source Code Files** | 16 |
| **Documentation Files** | 5 |
| **Configuration Files** | 6 |
| **Total Lines of Code** | ~5,000+ |
| **React Components** | 12 |
| **Custom Hooks** | 4 |
| **Context Providers** | 2 |
| **Service Implementations** | 2 |
| **Documentation Lines** | ~2,000 |

---

## ✅ VERIFICATION CHECKLIST

Before submitting, verify:

- [ ] Can run `npm install` without errors
- [ ] Can run `npm run dev` and see app at localhost:5173
- [ ] Can sign up (create account)
- [ ] Can login with created account
- [ ] Can create building (if landlord) or join building (if tenant)
- [ ] Can file issue (if tenant)
- [ ] Can see issue in dashboard
- [ ] Can update status (if landlord)
- [ ] Can add comments
- [ ] Stats dashboard shows numbers
- [ ] Can filter by status/category
- [ ] Responsive design works (resize browser)
- [ ] No console errors
- [ ] Error messages appear on validation
- [ ] Loading states show during operations

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying:

- [ ] Set all env variables (VITE_FIREBASE_* or VITE_SUPABASE_*)
- [ ] Run `npm run build` (should succeed)
- [ ] Check `dist/` folder has files
- [ ] Run `npm run preview` (should work)
- [ ] Test in preview mode
- [ ] Deploy to Vercel/Netlify/Self-hosted
- [ ] Test in production

---

## 📞 TROUBLESHOOTING QUICK LINKS

| Problem | Solution File |
|---------|---|
| App won't start | QUICK_START.md #Common Issues |
| Can't find env vars | README.md #Environment Configuration |
| Understanding auth flow | ARCHITECTURE.md #Authentication Architecture |
| How to deploy | README.md #Deployment |
| Interview questions | VIVA_PREP.md |
| Design philosophy | ARCHITECTURE.md #Design Decisions |

---

## 🎯 WHAT EACH FILE IS GOOD FOR

### ReadMe
- **Best for**: Complete overview, learning everything
- **Length**: 700+ lines
- **Time**: 20-30 minutes
- **Sections**: Problem, Architecture, Tech stack, Setup, Features, etc.

### Architecture.md
- **Best for**: Understanding system design, technical depth
- **Length**: 600+ lines
- **Time**: 15-20 minutes
- **Sections**: Layering, data flow, database schema, decisions

### VIVA_PREP.md
- **Best for**: Interview/evaluation preparation
- **Length**: 500+ lines
- **Time**: 25-30 minutes
- **Sections**: Expected questions with detailed answers

### QUICK_START.md
- **Best for**: Getting running immediately
- **Length**: 2-3 pages
- **Time**: 5 minutes
- **Sections**: Step-by-step, troubleshooting, test accounts

### DELIVERY_SUMMARY.md
- **Best for**: High-level overview of what was built
- **Length**: 3-4 pages
- **Time**: 10 minutes
- **Sections**: What you have, features, evaluation mapping

---

## 🎓 FOR EVALUATORS

**Recommended reading order**:
1. DELIVERY_SUMMARY.md (overview - 10 min)
2. README.md #Problem Statement (context - 5 min)
3. ARCHITECTURE.md (how it works - 15 min)
4. Run the demo (15 min)
5. Look at src/App.jsx (routing - 5 min)
6. Look at src/pages/DashboardPage.jsx (main feature - 10 min)
7. Look at src/hooks/useIssueStats.js (advanced React - 5 min)

**Total time: ~60 minutes for complete evaluation**

---

## 🎬 FOR VIVA/INTERVIEWS

**Recommended preparation**:
1. Read VIVA_PREP.md (100+ questions & answers)
2. Understand ARCHITECTURE.md completely
3. Be able to trace:
   - Signup flow (start to finish)
   - Issue creation flow (start to finish)
   - Status update flow (start to finish)
4. Explain:
   - Why useMemo in StatsDashboard
   - Why useCallback in useIssueFilter
   - How service abstraction works
   - Why issues are immutable
   - How role-based access works

---

## 📋 FILE SIZE REFERENCE

| File | Lines | Purpose |
|------|-------|---------|
| README.md | 700+ | Complete reference |
| ARCHITECTURE.md | 600+ | Technical design |
| VIVA_PREP.md | 500+ | Interview prep |
| DashboardPage.jsx | 180 | Main feature |
| IssueDetailPage.jsx | 150 | Issue view/edit |
| firebase.js | 350+ | Firebase impl |
| supabase.js | 300+ | Supabase impl |
| App.jsx | 100 | Routing |
| useIssueStats.js | 80 | Advanced hooks |
| UIElements.jsx | 200+ | Reusable components |

---

**Navigation tip**: Ctrl+Click on file paths to open them directly!

Good luck! 🚀
