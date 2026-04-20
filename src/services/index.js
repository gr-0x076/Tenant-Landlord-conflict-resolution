/**
 * Backend Service Abstraction
 * Dynamically selects between Firebase and Supabase
 *
 * IMPORTANT: Environment Configuration
 * - .env.local must be in project root (same level as package.json)
 * - Vite requires server restart after .env.local changes
 * - All VITE_ prefixed variables are exposed to client-side code
 * - Placeholder values containing 'your_' or 'your-' trigger setup mode
 */

const BACKEND = import.meta.env.VITE_BACKEND || 'firebase'

// Check configuration synchronously
const checkFirebaseConfig = () => {
  const firebaseEnv = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const isPlaceholder = (value = '') =>
    !value ||
    value.trim() === '' ||
    value.includes('your_') ||
    value.includes('your-') ||
    value.includes('_here');

  const missingFirebaseKeys = Object.entries(firebaseEnv)
    .filter(([, value]) => isPlaceholder(value))
    .map(([key]) => key);

  return missingFirebaseKeys.length === 0;
}

const checkSupabaseConfig = () => {
  const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('your-') &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your_')

  return hasSupabaseConfig
}

// Determine if backend is configured
let isConfigured = false
let configError = null

if (BACKEND === 'firebase') {
  isConfigured = checkFirebaseConfig()
  if (!isConfigured) {
    // Get detailed missing keys for better error message
    const firebaseEnv = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const isPlaceholder = (value = '') =>
      !value ||
      value.trim() === '' ||
      value.includes('your_') ||
      value.includes('your-') ||
      value.includes('_here');

    const missingFirebaseKeys = Object.entries(firebaseEnv)
      .filter(([, value]) => isPlaceholder(value))
      .map(([key]) => key);

    configError = `Firebase credentials not configured. Missing/placeholder: ${missingFirebaseKeys.join(', ')}`;
  }
} else if (BACKEND === 'supabase') {
  isConfigured = checkSupabaseConfig()
  if (!isConfigured) {
    configError = 'Supabase credentials not configured'
  }
} else {
  configError = `Invalid VITE_BACKEND: ${BACKEND}`
}

if (configError) {
  console.warn('❌ Backend configuration error:', configError)
  console.warn('ℹ️  Current backend selection:', BACKEND)
  console.warn('🔧 To fix: Update .env.local in project root with real credentials, then restart dev server')
}

// Export configuration status
export { isConfigured, configError }

// For backward compatibility, export service wrappers with live bindings
export const authService = { auth: null }
export const buildingService = { building: null }
export const issueService = { issue: null }
export const commentService = { comment: null }

// Async function to get services (call this after configuration is verified)
export const getServices = async () => {
  if (!isConfigured) {
    throw new Error(configError || 'Backend not configured')
  }

  let loadedAuthService, loadedBuildingService, loadedIssueService, loadedCommentService

  if (BACKEND === 'firebase') {
    const firebase = await import('./firebase.js')
    loadedAuthService = firebase.FirebaseAuthService
    loadedBuildingService = firebase.FirebaseBuildingService
    loadedIssueService = firebase.FirebaseIssueService
    loadedCommentService = firebase.FirebaseCommentService
  } else if (BACKEND === 'supabase') {
    const supabase = await import('./supabase.js')
    loadedAuthService = supabase.SupabaseAuthService
    loadedBuildingService = supabase.SupabaseBuildingService
    loadedIssueService = supabase.SupabaseIssueService
    loadedCommentService = supabase.SupabaseCommentService
  }

  authService.auth = loadedAuthService
  buildingService.building = loadedBuildingService
  issueService.issue = loadedIssueService
  commentService.comment = loadedCommentService

  return {
    auth: loadedAuthService,
    building: loadedBuildingService,
    issue: loadedIssueService,
    comment: loadedCommentService
  }
}

export default {
  auth: authService,
  building: buildingService,
  issue: issueService,
  comment: commentService
}
