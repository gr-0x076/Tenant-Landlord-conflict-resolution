# VIVA PREPARATION GUIDE

## What to Expect & How to Answer

---

## SECTION 1: PROBLEM STATEMENT (Expected: 15 mins)

### Q1: Why is this a real problem?

**Expected Answer**:
- Students/young professionals rent PGs/flats
- Landlord communication is fragmented (WhatsApp chaos)
- Unverifiable disputes ("you never told me")
- No accountability, delayed repairs, deposit fights

**Demonstrate With**:
- Show user personas (Tenant, Landlord)
- Explain pain point for each
- Link to real-world impact

---

### Q2: How does your solution solve it?

**Expected Answer**:
- Transparent issue logging (public visibility)
- Permanent history (no "accidental" deletion)
- Role-based authority (landlord controls)
- Timestamped updates (proof)

**Demo**:
1. File an issue as tenant
2. Show it's immediately visible
3. Landlord updates status
4. Show permanent record

---

### Q3: Who is the user? What do they get?

**Expected Answer**:

**Tenant**:
- File issues without WhatsApp chaos
- Track status in real-time
- Have permanent evidence for disputes
- Know exactly what's being done

**Landlord**:
- Transparent view of all issues
- Respond officially (not in DMs)
- Control workflow (status updates)
- Complete audit trail (protection)

---

## SECTION 2: REACT FUNDAMENTALS (Expected: 15 mins)

### Q1: Explain your component structure

**Expected Answer**:
```
Pages (LoginPage, DashboardPage, IssueDetailPage...)
  ↓
Components (Button, Panel, IssueCard, StatsDashboard...)
  ↓
Context API (AuthContext, BuildingContext)
  ↓
Services (Firebase/Supabase abstraction)
```

**Demonstrate**:
- Show folder structure
- Explain each layer's purpose
- Show how data flows

---

### Q2: How do you use Context API?

**Expected Answer**:
```jsx
// Created in src/context/AuthContext.jsx
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // ... more state
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Used in any component
const { user, login } = useAuth()
```

**Demonstrate**:
- Navigate to App.jsx → Show providers wrapping
- Navigate to useAuth hook → Show usage
- Explain: Global state without Redux

---

### Q3: Walk me through rendering a list of issues

**Expected Answer**:
```jsx
const [issues, setIssues] = useState([])

useEffect(() => {
  // Fetch issues on mount
  loadIssues()
}, [])

const loadIssues = async () => {
  const data = await issueService.issue.getIssuesByBuilding(buildingId)
  setIssues(data)
}

// Render
{issues.map(issue => (
  <IssueCard key={issue.id} issue={issue} />
))}
```

**Key Points**:
- ✅ State management (useState)
- ✅ Side effect (useEffect)
- ✅ Async data loading
- ✅ Keys on list items

---

### Q4: How do you handle routing?

**Expected Answer**:
```jsx
// App.jsx
<Router>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    } />
    <Route path="/issue/:id" element={
      <ProtectedRoute>
        <IssueDetailPage />
      </ProtectedRoute>
    } />
  </Routes>
</Router>
```

**Demonstrate**:
- Show navigation between pages
- Try accessing /dashboard without login → redirects to /login
- Explain ProtectedRoute logic

---

## SECTION 3: ADVANCED REACT (Expected: 15 mins)

### Q1: Why did you use useMemo?

**Expected Answer**:
```jsx
// StatsDashboard.jsx
const stats = useMemo(() => {
  // Expensive calculation: filter + group + count
  const total = issues.length
  const open = issues.filter(i => i.status === 'Open').length
  const severity = {}
  issues.forEach(issue => {
    severity[issue.severity] = (severity[issue.severity] || 0) + 1
  })
  return { total, open, severity, ... }
}, [issues])
```

**Problem**: Without useMemo, this recalculates on EVERY render

**Solution**: Only recalculate when `issues` actually changes

**Benefit**: Performance optimization

**Demonstrate**:
- Show component in DevTools
- Click button on page (unrelated update)
- Show stats NOT recalculated (useMemo working)

---

### Q2: How do you use useCallback?

**Expected Answer**:
```jsx
// useIssueFilter.js
export function useIssueFilter(issues) {
  const filter = useCallback((status, category) => {
    return issues.filter(issue => {
      if (status && issue.status !== status) return false
      if (category && issue.category !== category) return false
      return true
    })
  }, [issues])
  
  return filter
}
```

**Problem**: Without useCallback, function is recreated every render

**Solution**: Memoize the function, only recreate when dependencies change

**Benefit**: Child components receiving this function don't re-render unnecessarily

---

### Q3: Explain custom hooks

**Expected Answer**:
- Custom hooks extract reusable logic
- Example: `useAuth()` encapsulates authentication
- Can be reused across multiple components

**Show Examples**:
```jsx
// useAuth.js
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// Usage in any component
const { user, login, logout } = useAuth()
```

**Benefits**:
- DRY (Don't Repeat Yourself)
- Encapsulation
- Easy testing

---

### Q4: How would you implement lazy loading?

**Expected Answer**:
```jsx
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
</Suspense>
```

**Benefit**: 
- DashboardPage JS bundle only loaded when needed
- Initial app load faster
- Better performance on slower networks

---

## SECTION 4: BACKEND INTEGRATION (Expected: 15 mins)

### Q1: Why did you abstract Firebase & Supabase?

**Expected Answer**:
```javascript
// services/index.js
const backend = import.meta.env.VITE_BACKEND

if (backend === 'firebase') {
  import('./firebase.js')
} else if (backend === 'supabase') {
  import('./supabase.js')
}

// All services exported with unified interface
export { authService, buildingService, issueService, commentService }
```

**Benefit**: 
- Switch backends by changing .env var
- No code changes needed
- Flexibility

**Demonstrate**:
- Show .env.example
- Show how VITE_BACKEND controls behavior
- Explain switching is easy

---

### Q2: Walk me through the Firebase setup

**Expected Answer**:
1. Create Firebase project
2. Enable Authentication (email/password)
3. Create Firestore database
4. Create collections: users, buildings, issues, comments
5. Set security rules to enforce role-based access
6. Get credentials, add to .env

**Security Rules**:
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

match /buildings/{buildingId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == resource.data.createdBy;
}

match /issues/{issueId} {
  allow read: if in building;
  allow update: if request.auth.token.role == 'landlord';
}
```

---

### Q3: Explain your CRUD operations

**Expected Answer**:

**Create**:
```jsx
await issueService.issue.createIssue(
  buildingId, title, description, category, severity, userId
)
```

**Read**:
```jsx
const issues = await issueService.issue.getIssuesByBuilding(buildingId)
const issue = await issueService.issue.getIssueById(issueId)
```

**Update**:
```jsx
await issueService.issue.updateIssueStatus(issueId, newStatus)
```

**Delete**: 
❌ NOT IMPLEMENTED (Immutable by design)

**Key Point**: Issues are permanent, cannot be deleted

---

### Q4: How do you ensure data security?

**Expected Answer**:

**Frontend**:
- ProtectedRoute blocks unauthenticated access
- RoleProtectedRoute blocks unauthorized users
- Conditionally render UI based on role

**Backend**:
- Firebase Rules or Supabase RLS enforce permissions
- Only authenticated users can access data
- Only landlord can update status
- Only users in same building can see issues

**Database**:
- User IDs linked to building
- Building ID linked to issues
- Comments linked to issues
- All queries filtered by user's building

---

## SECTION 5: UI/UX & DESIGN (Expected: 10 mins)

### Q1: Explain your war room theme

**Expected Answer**:
- **Not** a cheerful startup UI
- **Is** neo-brutalism: thick borders, dark surfaces, authoritative
- **Metaphor**: Military command center or courtroom
- **Message**: "Once logged, it's permanent. History doesn't forget."

**Design Elements**:
- Colors: Gold (#d4af37) for authority, Red (#c0392b) for conflict, Teal (#1abc9c) for resolution
- Typography: Cinzel (headings - inscribed), Inter (body - readable)
- Borders: Thick, deliberate (6px), not soft shadows
- Panels: Dark glass effect with backdrop blur

---

### Q2: Demonstrate responsiveness

**Expected Answer**:
- Open on desktop → full layout
- Resize to mobile → stacks vertically
- Tailwind's responsive utilities handle it

**Demonstrate**:
1. Open dashboard on desktop
2. Open DevTools → toggle device toolbar
3. Show mobile layout
4. Show tablet layout

---

### Q3: Show me loading & error states

**Expected Answer**:

**Loading**:
```jsx
{loading ? (
  <LoadingSpinner />
) : (
  // content
)}
```

**Error**:
```jsx
{error && (
  <ErrorAlert message={error} onClose={() => setError(null)} />
)}
```

**Empty State**:
```jsx
{issues.length === 0 ? (
  <p>No incidents reported yet.</p>
) : (
  // issues list
)}
```

**Demonstrate**: 
- Show each state in app
- Explain user experience

---

## SECTION 6: EDGE CASES (Expected: 10 mins)

### Q1: How do you prevent duplicate issue spam?

**Expected Answer**:
```jsx
// useDuplicateCheck.js
const checkDuplicate = (title) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const recentSimilar = issues.filter(issue => 
    issue.createdBy === userId &&
    issue.createdAt > fiveMinutesAgo &&
    issue.title.toLowerCase().includes(title)
  )
  
  if (recentSimilar.length > 0) {
    setDuplicateWarning(...)
    return false
  }
  return true
}
```

**Demonstrate**:
1. Try filing same issue twice in quick succession
2. Show warning dialog
3. Option to continue anyway or cancel

---

### Q2: What happens if a tenant tries to update status?

**Expected Answer**:
```jsx
// IssueDetailPage.jsx
const isLandlord = user?.role === 'landlord'

{isLandlord ? (
  <StatusUpdatePanel />
) : (
  <p>Awaiting landlord response...</p>
)}
```

**Backend also checks**:
```javascript
// Firebase Rules
allow update: if request.auth.token.role == 'landlord'
```

**Result**: UI won't show, backend will reject anyway

---

### Q3: How do you handle network failures?

**Expected Answer**:
```jsx
try {
  await apiCall()
  setSuccess('Success!')
} catch (error) {
  setError('Network failed. Please try again.')
  // Show retry button
}
```

**User Experience**:
- Error message shown
- Can retry
- No silent failure

---

## SECTION 7: TECHNICAL QUESTIONS (Expected: 10 mins)

### Q1: Why Vite instead of Create React App?

**Expected Answer**:
- Vite is 100x faster dev server
- Better hot module reloading
- Faster builds
- Modern ES modules
- Industry standard now

---

### Q2: Why Tailwind CSS?

**Expected Answer**:
- Utility-first approach
- No context switching between CSS and JSX
- Customizable color scheme (war room theme)
- Responsive utilities built-in
- Smaller final bundle

---

### Q3: Explain your service layer

**Expected Answer**:
```
UI Components
    ↓
Custom Hooks (useAuth, useIssueStats)
    ↓
Context API (AuthContext, BuildingContext)
    ↓
Services Abstraction (src/services/index.js)
    ↓
Backend Implementation (Firebase.js OR Supabase.js)
    ↓
External Service (Firebase/Supabase)
```

**Benefit**: Loose coupling, easy testing, backend agnostic

---

### Q4: How would you test this application?

**Expected Answer**:

**Unit Tests**:
```javascript
// useIssueStats.test.js
test('calculates open count correctly', () => {
  const issues = [{ status: 'Open' }, { status: 'Resolved' }]
  const stats = useIssueStats(issues)
  expect(stats.open).toBe(1)
})
```

**Integration Tests**:
```javascript
// Full tenant flow
1. Sign up → verify user created
2. Join building → verify building linked
3. File issue → verify issue in dashboard
4. Add comment → verify comment visible
```

**E2E Tests** (Cypress):
```javascript
cy.visit('/signup')
cy.fillForm()
cy.should('be.redirected.to', '/join-building')
```

---

## SECTION 8: DEPLOYMENT & PRODUCTION (Expected: 5 mins)

### Q1: How would you deploy this?

**Expected Answer**:
```bash
npm run build  # Creates optimized dist/
```

**Then deploy to**:
- Vercel (recommended, Vite support)
- Netlify (easy, fast)
- Self-hosted (AWS, DigitalOcean)

**Environment Setup**:
- Development: Firebase dev project
- Production: Firebase prod project
- .env files manage credentials

---

### Q2: How would you scale this?

**Expected Answer**:

**Short term**:
- Optimize queries (database indexes)
- Implement pagination
- Cache frequently accessed data

**Long term**:
- Redis caching layer
- Message queues for notifications
- Microservices (auth, issues, comments)
- CDN for static assets

---

## MOCK VIVA QUESTIONS TO PREPARE

1. "Walk me through your login flow"
2. "How do you prevent tenants from deleting issues?"
3. "Why can't issues be edited?"
4. "Explain your state management approach"
5. "Show me how you implemented role-based access"
6. "Walk through filing an issue start to finish"
7. "How do you optimize dashboard performance?"
8. "What happens if Firestore is down?"
9. "Explain your folder structure and why it's organized this way"
10. "How would you add email notifications?"

---

## ANSWERS TO PREPARE

### "Walk me through your login flow"

```
User enters email/password
    ↓
LoginPage component calls useAuth().login()
    ↓
AuthContext calls authService.auth.login()
    ↓
Firebase Auth validates credentials
    ↓
If successful: User UID returned
    ↓
Fetch user document from Firestore
    ↓
AuthContext sets user state
    ↓
useEffect in App listens for auth changes
    ↓
Redirects to /dashboard
    ↓
Dashboard loads (ProtectedRoute allows it)
```

---

### "Walk me through filing an issue"

```
Tenant clicks "File Incident"
    ↓
Navigate to /create-issue
    ↓
Form: title, description, category, severity
    ↓
User submits
    ↓
Validate form (title min 5 chars, etc)
    ↓
Check for duplicates (5 min window, same user)
    ↓
If duplicate detected: Show warning
    ↓
User clicks "Continue Anyway" or "Cancel"
    ↓
Call issueService.issue.createIssue()
    ↓
Firebase Firestore.add() creates issue with:
  - title, description, category, severity
  - status: 'Open'
  - createdBy: userId
  - buildingId: building.id
  - createdAt: server timestamp (immutable)
    ↓
Return issueId
    ↓
Show success message
    ↓
Redirect to /dashboard
    ↓
Dashboard fetches fresh issues
    ↓
New issue appears in list with status "Open"
```

---

## KEY POINTS TO EMPHASIZE

1. **Real-world problem**: Not a toy app
2. **Immutable history**: Cannot delete issues (legal accountability)
3. **Role-based access**: Enforced at multiple layers
4. **Advanced React**: useMemo, useCallback, custom hooks
5. **Service abstraction**: Firebase OR Supabase, not hardcoded
6. **War room theme**: Intentional, reflects product philosophy
7. **Production-ready**: Clean code, error handling, edge cases
8. **Scalable architecture**: Clear layers, separation of concerns

---

## WHAT NOT TO SAY

❌ "I copied from a tutorial"
❌ "I don't know how this works"
❌ "I just used ChatGPT to generate everything"
✅ "I designed this to solve X problem"
✅ "I chose this approach because..."
✅ "This optimization prevents..."

---

**Remember**: You're not just showing code. You're showing you understand the problem, the solution, and the React ecosystem.

Good luck! 🚀
