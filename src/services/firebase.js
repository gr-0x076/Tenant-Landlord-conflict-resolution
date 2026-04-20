import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { getFirestore, initializeFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, query, where, serverTimestamp, onSnapshot, limit } from 'firebase/firestore'
import { normalizeTimestamp } from '../utils/helpers'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const maskEnvValue = (value) => {
  if (!value) return 'missing'
  if (value.length <= 10) return '***'
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
  const missing = required.filter(key => {
    const value = firebaseConfig[key]
    return !value || value.trim() === '' || value.includes('your_') || value.includes('your-') || value.includes('_here')
  })

  return {
    isValid: missing.length === 0,
    missing
  }
}

let app, auth, db

const initResult = validateFirebaseConfig()
if (!initResult.isValid) {
  const errorMessage = `Firebase configuration invalid. Missing/placeholder keys: ${initResult.missing.join(', ')}`
  if (import.meta.env.DEV) {
    console.error('Firebase startup validation failed:', errorMessage)
    console.info('Firebase values in use:', {
      projectId: firebaseConfig.projectId || 'missing',
      authDomain: firebaseConfig.authDomain || 'missing',
      storageBucket: firebaseConfig.storageBucket || 'missing',
      appId: firebaseConfig.appId ? 'set' : 'missing',
      apiKey: maskEnvValue(firebaseConfig.apiKey)
    })
  }
  throw new Error(errorMessage)
}

app = initializeApp(firebaseConfig)
auth = getAuth(app)

// Initialize Firestore with optimized settings
// Use try/catch to handle HMR reloads that try to reinitialize with different options
try {
  db = initializeFirestore(app, {
    cacheSizeBytes: 40 * 1024 * 1024,
    experimentalForceLongPolling: true,
    useFetchStreams: false,
    ignoreUndefinedProperties: true,
    maxConcurrentListeners: 100
  })
} catch (e) {
  // If Firestore was already initialized (HMR reload), just get the existing instance
  if (e.message?.includes('already been called')) {
    db = getFirestore(app)
  } else {
    throw e
  }
}

const ensureFirebaseInitialized = () => {
  if (!auth || !db) {
    throw new Error(
      'Firebase is not initialized. Check your VITE_FIREBASE_* environment variables in .env.local and restart the dev server.'
    )
  }
}

const withTimeout = (operation, timeoutMs, message) => Promise.race([
  operation(),
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs))
])

const isTransientFirestoreError = (error) => {
  const message = error?.message || ''
  const code = error?.code || ''

  return (
    message.includes('offline') ||
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('ERR_ABORTED') ||
    code === 'unavailable' ||
    code === 'deadline-exceeded'
  )
}

const isPermissionDeniedError = (error) => {
  const message = error?.message || ''
  const code = error?.code || ''

  return (
    code === 'permission-denied' ||
    code === 'PERMISSION_DENIED' ||
    message.includes('Missing or insufficient permissions')
  )
}

// Helper function for retrying Firestore reads with intelligent backoff
// Detects connection issues early and fails fast to prevent UI hangs
const retryFirestoreRead = async (operation, maxRetries = 2, timeoutMs = 5000, operationTimeoutMs = 2000) => {
  let lastError
  const startTime = Date.now()
  let consecutiveNetworkErrors = 0
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check total timeout
      if (Date.now() - startTime > timeoutMs) {
        console.warn(`Firestore read timeout after ${attempt} attempts`)
        throw lastError || new Error('Firestore read timeout')
      }
      
      // Set aggressive timeout for individual operation
      const operationPromise = withTimeout(operation, operationTimeoutMs, 'Operation timeout')
      
      return await operationPromise
    } catch (e) {
      lastError = e
      const isNetworkError = isTransientFirestoreError(e)
      
      if (isNetworkError) {
        consecutiveNetworkErrors++
        // After 2 consecutive network errors, give up and use fallback
        if (consecutiveNetworkErrors >= 2) {
          console.warn('Multiple network errors detected, using fallback data')
          throw e
        }
        
        if (attempt < maxRetries - 1) {
          // Exponential backoff: 500ms, 1s, 2s, 4s
          const delayMs = 300 * Math.pow(2, attempt)
          console.log(`Firestore error (attempt ${attempt + 1}/${maxRetries}): ${e.message}, retrying in ${delayMs}ms...`)
          await new Promise(r => setTimeout(r, delayMs))
        }
      } else {
        // For non-network errors (permission denied, invalid data, etc), fail fast
        throw e
      }
    }
  }
  
  // If all retries failed, throw the last error
  throw lastError
}

const retryFirestoreWrite = async (operation, { maxRetries = 2, timeoutMs = 3500, retryDelayMs = 400, fallbackValue } = {}) => {
  let lastError

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await withTimeout(operation, timeoutMs, 'Write timeout')
    } catch (error) {
      lastError = error

      if (!isTransientFirestoreError(error) || attempt === maxRetries - 1) {
        break
      }

      const delayMs = retryDelayMs * (attempt + 1)
      console.log(`Firestore write error (attempt ${attempt + 1}/${maxRetries}): ${error.message}, retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  if (fallbackValue !== undefined && isTransientFirestoreError(lastError)) {
    return fallbackValue
  }

  throw lastError
}

const getFriendlyAuthError = (error) => {
  const code = error?.code || ''
  const message = error?.message || 'Authentication failed. Please try again.'

  if (code === 'auth/configuration-not-found') {
    return 'Firebase Authentication is not configured. Enable Email/Password in Firebase Console > Authentication > Sign-in method.'
  }
  if (code === 'auth/user-not-found') {
    return 'No account found with that email address.'
  }
  if (code === 'auth/wrong-password') {
    return 'Incorrect password. Please try again.'
  }
  if (code === 'auth/email-already-in-use') {
    return 'That email is already registered. Please log in instead.'
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  return message
}

const getFriendlyFirestoreError = (error, fallback = 'Could not reach Firestore. Please try again.') => {
  if (isTransientFirestoreError(error)) {
    return 'Firestore is taking too long to respond. Check your internet connection, firewall/VPN, and that Firestore is enabled for this Firebase project.'
  }

  if (isPermissionDeniedError(error)) {
    return 'Firestore rules are blocking this action. Open Firebase Console > Firestore Database > Rules and publish the project rules from firestore.rules.'
  }

  return error?.message || fallback
}

const mapFirestoreDoc = (snapshot) => ({ id: snapshot.id, ...snapshot.data() })

const mapFirestoreCollection = (snapshot) => snapshot.docs.map(docSnap => mapFirestoreDoc(docSnap))

const sortByTimestamp = (items, field, direction = 'desc') => {
  const directionFactor = direction === 'asc' ? 1 : -1

  return [...items].sort((left, right) => {
    const leftTime = normalizeTimestamp(left[field])?.getTime() ?? 0
    const rightTime = normalizeTimestamp(right[field])?.getTime() ?? 0
    return (leftTime - rightTime) * directionFactor
  })
}

/**
 * Authentication Service
 */
export const FirebaseAuthService = {
  signup: async (email, password, name, role) => {
    ensureFirebaseInitialized()
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const userId = userCredential.user.uid

      await setDoc(doc(db, 'users', userId), {
        id: userId,
        name,
        email,
        role,
        buildingId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return userCredential.user
    } catch (error) {
      throw new Error(getFriendlyAuthError(error))
    }
  },

  login: async (email, password) => {
    ensureFirebaseInitialized()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw new Error(getFriendlyAuthError(error))
    }
  },

  loginWithGoogle: async () => {
    ensureFirebaseInitialized()
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      return userCredential.user
    } catch (error) {
      if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completion.')
      }
      throw new Error(getFriendlyAuthError(error))
    }
  },

  completeOnboarding: async (userId, userEmail, role) => {
    ensureFirebaseInitialized()
    try {
      const result = await retryFirestoreWrite(
        () => setDoc(doc(db, 'users', userId), {
          id: userId,
          email: userEmail,
          role,
          buildingId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true }),
        { fallbackValue: { success: false, localOnly: true } }
      )

      if (result?.localOnly) {
        console.warn('Firestore write failed after retries, proceeding with local state only')
        return result
      }

      return { success: true }
    } catch (error) {
       console.error('Complete onboarding error:', error)
       throw new Error(error.message || 'Failed to set onboarding identity')
    }
  },

  logout: async () => {
    ensureFirebaseInitialized()
    await signOut(auth)
  },

  getCurrentUser: () => {
    ensureFirebaseInitialized()
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await retryFirestoreRead(
              () => getDoc(doc(db, 'users', user.uid)),
              2,
              5000,
              2000
            )
            resolve({ ...user, ...(userDoc?.exists() ? userDoc.data() : {}) })
          } catch (e) {
            console.error('Failed to fetch user document, using auth data only:', e.message)
            // Graceful fallback: return auth user without Firestore data
            resolve(user)
          }
        } else {
          resolve(null)
        }
        unsubscribe()
      }, reject)
    })
  },

  onAuthStateChange: (callback) => {
    ensureFirebaseInitialized()
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await retryFirestoreRead(
            () => getDoc(doc(db, 'users', user.uid)),
            2,
            5000,
            2000
          )
          callback({ ...user, ...(userDoc?.exists() ? userDoc.data() : {}) })
        } catch (e) {
          console.error('Failed to fetch user document, using auth data only:', e.message)
          // Graceful fallback: return auth user without Firestore data
          callback(user)
        }
      } else {
        callback(null)
      }
    })
  }
}

/**
 * Building Service
 */
export const FirebaseBuildingService = {
  createBuilding: async (name, createdBy) => {
    ensureFirebaseInitialized()
    const buildingRef = doc(collection(db, 'buildings'))
    const inviteCode = Math.random().toString(36).substr(2, 9).toUpperCase()

    const newBuilding = {
      id: buildingRef.id,
      name,
      createdBy,
      inviteCode
    }

    try {
      await retryFirestoreWrite(() => setDoc(buildingRef, {
        ...newBuilding,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }), {
        maxRetries: 2,
        timeoutMs: 8000,
        retryDelayMs: 750
      })

      // Treat syncing the user's profile as best-effort so a successful building
      // creation is not blocked by a slower secondary write.
      await retryFirestoreWrite(() => updateDoc(doc(db, 'users', createdBy), {
        buildingId: buildingRef.id,
        updatedAt: serverTimestamp()
      }), {
        maxRetries: 1,
        timeoutMs: 5000,
        retryDelayMs: 500,
        fallbackValue: null
      })

      return newBuilding
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to create building'))
    }
  },

  joinBuilding: async (inviteCode, userId) => {
    ensureFirebaseInitialized()
    try {
      const q = query(collection(db, 'buildings'), where('inviteCode', '==', inviteCode))
      const snapshot = await retryFirestoreRead(() => getDocs(q), 2, 7000, 3000)

      if (snapshot.empty) {
        throw new Error('Invalid invite code')
      }

      const building = snapshot.docs[0]
      const buildingId = building.id

      await retryFirestoreWrite(() => updateDoc(doc(db, 'users', userId), {
        buildingId,
        updatedAt: serverTimestamp()
      }), {
        maxRetries: 2,
        timeoutMs: 5000,
        retryDelayMs: 750
      })

      return { id: buildingId, ...building.data() }
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to join building'))
    }
  },

  getBuilding: async (buildingId) => {
    ensureFirebaseInitialized()
    try {
      const snapshot = await retryFirestoreRead(() => getDoc(doc(db, 'buildings', buildingId)), 2, 7000, 3000)
      return { id: snapshot.id, ...snapshot.data() }
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to load building'))
    }
  }
}

/**
 * Issue Service
 */
export const FirebaseIssueService = {
  createIssue: async (buildingId, title, description, category, severity, createdBy) => {
    ensureFirebaseInitialized()
    try {
      const issueRef = await retryFirestoreWrite(() => addDoc(collection(db, 'issues'), {
        buildingId,
        title,
        description,
        category,
        severity,
        status: 'Open',
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        imageUrl: null
      }), {
        maxRetries: 2,
        timeoutMs: 7000,
        retryDelayMs: 750
      })
      return issueRef.id
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to create issue'))
    }
  },

  getIssuesByBuilding: async (buildingId) => {
    ensureFirebaseInitialized()
    try {
      const q = query(collection(db, 'issues'), where('buildingId', '==', buildingId))
      const snapshot = await retryFirestoreRead(() => getDocs(q), 2, 7000, 3000)
      return mapFirestoreCollection(snapshot)
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to load issues'))
    }
  },

  subscribeToBuildingIssues: (buildingId, callback, onError) => {
    ensureFirebaseInitialized()
    const q = query(collection(db, 'issues'), where('buildingId', '==', buildingId), limit(50))
    return onSnapshot(q, (snapshot) => {
      callback(sortByTimestamp(mapFirestoreCollection(snapshot), 'createdAt', 'desc'))
    }, (error) => {
      console.error('Issues snapshot error:', error)
      onError?.(new Error(getFriendlyFirestoreError(error, 'Failed to subscribe to issues')))
      callback([])
    })
  },

  getIssueById: async (issueId) => {
    ensureFirebaseInitialized()
    try {
      const snapshot = await retryFirestoreRead(() => getDoc(doc(db, 'issues', issueId)), 2, 7000, 3000)
      return mapFirestoreDoc(snapshot)
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to load issue'))
    }
  },

  subscribeToIssue: (issueId, callback, onError) => {
    ensureFirebaseInitialized()
    const docRef = doc(db, 'issues', issueId)
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(mapFirestoreDoc(docSnap))
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Issue detail snapshot error:', error)
      onError?.(new Error(getFriendlyFirestoreError(error, 'Failed to subscribe to issue')))
      callback(null)
    })
  },

  updateIssueStatus: async (issueId, status) => {
    ensureFirebaseInitialized()
    try {
      await retryFirestoreWrite(() => updateDoc(doc(db, 'issues', issueId), {
        status,
        updatedAt: serverTimestamp()
      }), {
        maxRetries: 2,
        timeoutMs: 5000,
        retryDelayMs: 750
      })
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to update issue status'))
    }
  },

  updateIssue: async (issueId, updates) => {
    ensureFirebaseInitialized()
    try {
      await retryFirestoreWrite(() => updateDoc(doc(db, 'issues', issueId), {
        ...updates,
        updatedAt: serverTimestamp()
      }), {
        maxRetries: 2,
        timeoutMs: 5000,
        retryDelayMs: 750
      })
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to update issue'))
    }
  }
}

/**
 * Comment Service
 */
export const FirebaseCommentService = {
  addComment: async (issueId, userId, text) => {
    ensureFirebaseInitialized()
    try {
      const commentRef = await retryFirestoreWrite(() => addDoc(collection(db, 'comments'), {
        issueId,
        userId,
        text,
        timestamp: serverTimestamp()
      }), {
        maxRetries: 2,
        timeoutMs: 5000,
        retryDelayMs: 750
      })
      return commentRef.id
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to add comment'))
    }
  },

  getCommentsByIssue: async (issueId) => {
    ensureFirebaseInitialized()
    try {
      const q = query(collection(db, 'comments'), where('issueId', '==', issueId))
      const snapshot = await retryFirestoreRead(() => getDocs(q), 2, 7000, 3000)
      return mapFirestoreCollection(snapshot)
    } catch (error) {
      throw new Error(getFriendlyFirestoreError(error, 'Failed to load comments'))
    }
  },

  subscribeToComments: (issueId, callback, onError) => {
    ensureFirebaseInitialized()
    const q = query(collection(db, 'comments'), where('issueId', '==', issueId), limit(100))
    return onSnapshot(q, (snapshot) => {
      callback(sortByTimestamp(mapFirestoreCollection(snapshot).map(comment => ({
        ...comment,
        timestamp: normalizeTimestamp(comment.timestamp) || comment.timestamp
      })), 'timestamp', 'asc'))
    }, (error) => {
      console.error('Comments snapshot error:', error)
      onError?.(new Error(getFriendlyFirestoreError(error, 'Failed to subscribe to comments')))
      callback([])
    })
  }
}

export default {
  FirebaseAuthService,
  FirebaseBuildingService,
  FirebaseIssueService,
  FirebaseCommentService
}
