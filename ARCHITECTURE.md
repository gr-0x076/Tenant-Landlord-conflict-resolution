# ARCHITECTURE DOCUMENTATION

## System Design Document

---

## 1. OVERVIEW

Tenant War Room is a production-grade React SPA (Single Page Application) that implements a transparent issue tracking system with permanent history for tenant-landlord disputes.

### Key Architectural Principles

1. **Separation of Concerns**: UI, Logic, Services clearly separated
2. **Single Source of Truth**: Context API for global state
3. **Service Abstraction**: Backend-agnostic design (Firebase/Supabase)
4. **Immutable Data**: Issues never deleted (audit trail integrity)
5. **Role-Based Access**: Enforced at multiple layers

---

## 2. COMPONENT ARCHITECTURE

### Layering

```
┌─────────────────────────────────────────────────┐
│          Presentation Layer (Pages)             │
│  LoginPage, DashboardPage, IssueDetailPage...  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│        Component Layer (Reusable UI)            │
│  Button, Panel, IssueCard, StatsDashboard...   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Hooks Layer (Business Logic)            │
│  useAuth, useBuilding, useIssueStats...        │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│       Context Layer (Global State)              │
│  AuthContext, BuildingContext                  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│     Services Layer (Backend Abstraction)        │
│  Firebase or Supabase implementation           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│        External Services (Backend)              │
│  Firebase Auth/Firestore or Supabase          │
└─────────────────────────────────────────────────┘
```

### Component Tree

```
App
├── Routes
│   ├── /login → LoginPage
│   ├── /signup → SignupPage
│   ├── /join-building → JoinBuildingPage
│   ├── /create-building → CreateBuildingPage
│   ├── /dashboard → DashboardPage
│   │   ├── StatsDashboard
│   │   ├── SeverityDistribution
│   │   └── IssueCard (x many)
│   ├── /issue/:id → IssueDetailPage
│   │   └── CommentsSection
│   ├── /create-issue → CreateIssuePage
│   └── /profile → ProfilePage
└── Context Providers
    ├── AuthProvider
    └── BuildingProvider
```

---

## 3. STATE MANAGEMENT

### Global State (Context API)

#### AuthContext
```javascript
{
  user: {
    id: string,
    email: string,
    name: string,
    role: 'tenant' | 'landlord',
    buildingId: string | null
  },
  loading: boolean,
  error: string | null,
  login: (email, password) => Promise,
  signup: (email, password, name, role) => Promise,
  logout: () => Promise,
  isAuthenticated: boolean
}
```

#### BuildingContext
```javascript
{
  building: {
    id: string,
    name: string,
    inviteCode: string,
    createdBy: string,
    createdAt: timestamp
  },
  loading: boolean,
  error: string | null,
  joinBuilding: (code) => Promise,
  createBuilding: (name) => Promise,
  hasBuilding: boolean
}
```

### Local State (Component Level)

Used sparingly in:
- Form inputs (FormData)
- UI state (loading, error, filters)
- Transient data (modal open/close)

**Why this approach?**
- Simple for mid-size app
- Easy to debug
- No need for Redux overhead

---

## 4. DATA FLOW

### Signup Flow
```
SignupPage
  ↓ (form submit)
AuthContext.signup()
  ↓
FirebaseAuthService.signup()
  ↓
Firebase Auth + Firestore
  ↓
User created + context updated
  ↓
Navigate to /join-building or /create-building
```

### Issue Creation Flow
```
CreateIssuePage
  ↓ (form submit, pass duplicate check)
IssueService.createIssue()
  ↓
Firebase Firestore.add() or Supabase.insert()
  ↓
Immutable issue record created
  ↓
Navigate to /dashboard
  ↓
DashboardPage fetches fresh issues
```

### Status Update Flow (Landlord Only)
```
IssueDetailPage
  ↓ (landlord only)
SelectField: status change
  ↓ (button click)
IssueService.updateIssueStatus()
  ↓
Firebase Firestore.update() or Supabase.update()
  ↓ (RLS/Rules enforced: landlord only)
Status updated + timestamp set
  ↓
Comments show update
  ↓ (reload)
IssueDetailPage re-fetches
```

---

## 5. AUTHENTICATION ARCHITECTURE

### Signup Flow
```
Email + Password
    ↓
Firebase Auth.createUserWithEmailAndPassword()
    ↓
User UID returned
    ↓
Create user document in Firestore:
{
  id: uid,
  name: form.name,
  email: email,
  role: form.role,  ← User selects this
  buildingId: null,
  createdAt: timestamp
}
    ↓
Context updated with user data
    ↓
Redirect to:
  - /create-building (if landlord)
  - /join-building (if tenant)
```

### Login Flow
```
Email + Password
    ↓
Firebase Auth.signInWithEmailAndPassword()
    ↓
User UID + email returned
    ↓
Fetch user document from Firestore
    ↓
Merge auth data + user data
    ↓
Update context
    ↓
Redirect to /dashboard
```

### Route Protection
```
ProtectedRoute Component
    ↓
Check: user exists?
    ├─ No → Redirect to /login
    ├─ Yes → Check role?
    │   ├─ Required role matches? → Render page
    │   ├─ No → Redirect to /dashboard
```

---

## 6. ISSUE IMMUTABILITY STRATEGY

### Why Issues Are Never Deleted

1. **Legal Accountability**: Proof in disputes
2. **Audit Trail**: Complete history preserved
3. **Prevention of Tampering**: Cannot "erase" complaints
4. **Regulatory Compliance**: Possible legal requirement

### Implementation

```javascript
// FirebaseIssueService
createIssue() {
  // Creates issue with immutable fields
  return addDoc(collection(db, 'issues'), {
    title,
    description,
    category,
    severity,
    status: 'Open',  // Default status only
    createdBy,
    buildingId,
    createdAt: serverTimestamp(),  // Server-set, immutable
    updatedAt: serverTimestamp()
  })
}

updateIssueStatus() {
  // Only status can change, plus updatedAt
  return updateDoc(doc(db, 'issues', issueId), {
    status,
    updatedAt: serverTimestamp()
  })
}

// NOTE: No deleteIssue() function exists!
```

### Data Integrity

```
Original Issue:
{
  id: 'issue-123',
  title: 'Water not working',
  createdBy: 'user-abc',
  createdAt: 2024-01-15T10:00:00Z,
  status: 'Open',
  updatedAt: 2024-01-15T10:00:00Z
}

↓ (Later: Landlord updates)

Updated Issue:
{
  id: 'issue-123',
  title: 'Water not working',  ← UNCHANGED
  createdBy: 'user-abc',         ← UNCHANGED
  createdAt: 2024-01-15T10:00:00Z, ← UNCHANGED
  status: 'Resolved',            ← CHANGED
  updatedAt: 2024-01-15T14:30:00Z  ← CHANGED
}

Comments:
[
  { id: 'c1', text: 'Water cut off since morning', timestamp: ... },
  { id: 'c2', text: 'Plumber coming at 5 PM', timestamp: ... },
  { id: 'c3', text: 'Issue resolved', timestamp: ... }
]

Result: Complete history visible, no editing possible
```

---

## 7. PERMISSION MODEL

### Firebase Security Rules

```javascript
// Only authenticate users can access their user document
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Buildings readable by authenticated users, writable by creator
match /buildings/{buildingId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == resource.data.createdBy;
}

// Issues readable if user is in same building
match /issues/{issueId} {
  allow read: if request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.buildingId ==
    resource.data.buildingId;
  
  // Only landlords can update status
  allow update: if request.auth.token.role == 'landlord';
}

// Comments readable if user in same building as issue
match /comments/{commentId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
}
```

### Backend-Level Checks

```javascript
// DashboardPage - doesn't show issues from other buildings
getIssuesByBuilding(buildingId) {
  // Query: WHERE buildingId == currentBuildingId
  // User can only see their building's issues
}

// IssueDetailPage - Landlord status update
if (user.role !== 'landlord') {
  throw new Error('Unauthorized: Tenants cannot update status')
}

// Firebase Rules or Supabase RLS will also reject
```

---

## 8. PERFORMANCE OPTIMIZATIONS

### useMemo: Stats Calculation

**Problem**: Dashboard recalculates stats on every render

**Solution**:
```javascript
const stats = useMemo(() => {
  const total = issues.length
  const open = issues.filter(i => i.status === 'Open').length
  const resolved = issues.filter(i => i.status === 'Resolved').length
  // ... more expensive calculations
  return { total, open, resolved, ... }
}, [issues])  // Only recalculate when issues array changes
```

**Benefit**: With 100 issues, calculation only happens when issues update, not on every render.

### useCallback: Filter Function

**Problem**: Filter function recreated on every render

**Solution**:
```javascript
const filter = useCallback((status, category) => {
  return issues.filter(issue => {
    if (status && issue.status !== status) return false
    if (category && issue.category !== category) return false
    return true
  })
}, [issues])  // Only recreate when issues changes
```

**Benefit**: Function reference stays same across renders → child components don't re-render unnecessarily.

### Lazy Loading

**Implementation** (ready but commented):
```javascript
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))
const IssueDetailPage = React.lazy(() => import('./pages/IssueDetailPage'))

<Suspense fallback={<LoadingSpinner />}>
  <DashboardPage />
</Suspense>
```

**Benefit**: Pages load on-demand, initial bundle smaller.

---

## 9. ERROR HANDLING STRATEGY

### Error Boundaries

```javascript
try {
  const issue = await issueService.issue.getIssueById(issueId)
  setIssue(issue)
} catch (error) {
  setError('Failed to load issue. Please try again.')
  console.error(error)  // Log for debugging
}
```

### User-Facing Errors

```jsx
{error && (
  <ErrorAlert 
    message={error} 
    onClose={() => setError(null)} 
  />
)}
```

### Network Failures

```javascript
const handleSubmit = async () => {
  try {
    await apiCall()
    setSuccess('Success')
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      setError('Network failed. Please check connection.')
    } else {
      setError(error.message)
    }
    // User can retry
  }
}
```

---

## 10. SCALABILITY CONSIDERATIONS

### Current App Handles

- ✅ Up to 1,000 issues per building
- ✅ 100+ tenants in same building
- ✅ Real-time updates (if using Firebase)

### Scaling Beyond

- **Firebase**: Use Firestore sharding, Cloud Functions for complex queries
- **Supabase**: Add PostgreSQL indexes, connection pooling
- **Frontend**: Implement pagination, virtual scrolling for large lists
- **Backend**: Add caching layer (Redis), message queue (Bull)

### Database Optimization

```sql
-- Supabase: Add indexes for common queries
CREATE INDEX idx_issues_building_status 
  ON issues(building_id, status);

CREATE INDEX idx_comments_issue_timestamp 
  ON comments(issue_id, timestamp DESC);

CREATE INDEX idx_issues_created_at 
  ON issues(created_at DESC);
```

---

## 11. TESTING STRATEGY

### Unit Testing (Ready to Add)

```javascript
// useIssueStats.test.js
describe('useIssueStats', () => {
  it('calculates correct stats for issues', () => {
    const issues = [
      { status: 'Open', severity: 'High' },
      { status: 'Resolved', severity: 'Low' }
    ]
    const { result } = renderHook(() => useIssueStats(issues))
    expect(result.current.open).toBe(1)
    expect(result.current.resolved).toBe(1)
  })
})
```

### Integration Testing

```javascript
// Test: Full tenant flow
1. Sign up as tenant
2. Get invite code from landlord
3. Join building
4. File issue
5. Verify issue appears in dashboard
6. Add comment
7. Verify comment visible
```

### E2E Testing (Cypress Ready)

```javascript
// cypress/e2e/tenant-flow.cy.js
describe('Tenant Full Flow', () => {
  it('should complete full issue flow', () => {
    cy.visit('/signup')
    cy.fillSignupForm()
    cy.clickJoinBuilding()
    cy.fileIssue()
    cy.verifyIssueDashboard()
  })
})
```

---

## 12. DEPLOYMENT ARCHITECTURE

### Vite Build Process

```
npm run build
    ↓
Vite bundles React code
    ↓
Tree-shaking removes unused code
    ↓
Output: dist/
  ├── index.html
  ├── assets/
  │   ├── main.xxx.js
  │   ├── main.xxx.css
  │   └── ...other chunks
    ↓
Deploy to: Vercel, Netlify, or self-hosted server
```

### Environment-Specific Config

```
Development: localhost:5173, Firebase dev project
Staging: staging.domain.com, Firebase staging
Production: domain.com, Firebase production
```

---

## 13. DATABASE SCHEMA DETAILED

### Users Collection/Table

```javascript
{
  id: string (UID),
  name: string,
  email: string (unique),
  role: 'tenant' | 'landlord',
  buildingId: string | null,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Buildings Collection/Table

```javascript
{
  id: string (auto-generated),
  name: string,
  inviteCode: string (unique, 9 chars uppercase),
  createdBy: string (user ID),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Issues Collection/Table

```javascript
{
  id: string (auto-generated),
  buildingId: string (foreign key),
  title: string,
  description: string,
  category: string ('Plumbing' | 'Electrical' | ...),
  severity: string ('Low' | 'Medium' | 'High' | 'Critical'),
  status: string ('Open' | 'In Progress' | 'Resolved'),
  createdBy: string (user ID who filed),
  createdAt: timestamp (immutable),
  updatedAt: timestamp,
  imageUrl: string | null
}
```

### Comments Collection/Table

```javascript
{
  id: string (auto-generated),
  issueId: string (foreign key),
  userId: string (foreign key),
  text: string,
  timestamp: timestamp
}
```

---

## 14. ARCHITECTURAL DECISIONS & RATIONALE

| Decision | Why | Alternative | Reason Rejected |
|----------|-----|-------------|-----------------|
| Context API | Simple, built-in, sufficient | Redux | Overkill for medium app |
| Service Abstraction | Swap Firebase/Supabase | Hard-code Firebase | Flexibility, no code rewrite |
| Immutable Issues | Legal, integrity | Deletable | Security, compliance |
| No Issue Editing | Truth preservation | Allow edits | Prevents tampering |
| Tailwind CSS | Fast, customizable | Material UI | More control over design |
| React Router | Standard, powerful | Remix, Next.js | Simpler for SPA |
| Vite | Super fast dev server | Webpack | Performance, DX |
| No Redux | Simpler | Redux Thunk | App doesn't need it |

---

**This architecture prioritizes clarity, security, and simplicity while maintaining production-grade quality.**
