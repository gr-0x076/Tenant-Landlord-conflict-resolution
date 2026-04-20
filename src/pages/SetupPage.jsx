import { useState } from 'react'

export default function SetupPage() {
  const [backend, setBackend] = useState('firebase')
  const [showCopied, setShowCopied] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const firebaseEnv = `VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND=firebase`

  const supabaseEnv = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND=supabase`

  const envContent = backend === 'firebase' ? firebaseEnv : supabaseEnv

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(envContent)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const debugInfo = {
    backend: import.meta.env.VITE_BACKEND,
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
      appId: import.meta.env.VITE_FIREBASE_APP_ID ? 'Set' : 'Missing'
    },
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center font-['Inter']">
      <div className="max-w-3xl w-full">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-3 text-yellow-500 font-['Cinzel']">
            SETUP REQUIRED
          </h1>
          <p className="text-gray-300 text-lg">
            Welcome to Tenant War Room. Let&apos;s configure your backend.
          </p>
        </div>

        <div className="bg-gray-900 border-4 border-yellow-500 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-yellow-500 font-['Cinzel']">
            CHOOSE YOUR BACKEND
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              type="button"
              onClick={() => setBackend('firebase')}
              className={`p-6 border-4 text-left transition ${
                backend === 'firebase'
                  ? 'border-yellow-500 bg-gray-800'
                  : 'border-gray-600 bg-gray-950 hover:border-yellow-500'
              }`}
            >
              <h3 className="text-xl font-bold mb-2 text-yellow-500">Firebase</h3>
              <p className="text-sm text-gray-300 mb-3">Google&apos;s Realtime Database</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>Easy setup</li>
                <li>Real-time updates</li>
                <li>Firebase Security Rules</li>
              </ul>
            </button>

            <button
              type="button"
              onClick={() => setBackend('supabase')}
              className={`p-6 border-4 text-left transition ${
                backend === 'supabase'
                  ? 'border-yellow-500 bg-gray-800'
                  : 'border-gray-600 bg-gray-950 hover:border-yellow-500'
              }`}
            >
              <h3 className="text-xl font-bold mb-2 text-yellow-500">Supabase</h3>
              <p className="text-sm text-gray-300 mb-3">PostgreSQL and Firebase alternative</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>PostgreSQL</li>
                <li>Row-level security</li>
                <li>Full SQL power</li>
              </ul>
            </button>
          </div>

          <div className="bg-gray-950 border-2 border-gray-700 p-6 mb-6">
            {backend === 'firebase' ? (
              <div>
                <h3 className="text-lg font-bold mb-4 text-teal-400">Firebase Setup Steps:</h3>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li>
                    <strong>1. Go to Firebase Console</strong>
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-500 hover:underline ml-2"
                    >
                      console.firebase.google.com
                    </a>
                  </li>
                  <li><strong>2. Create a new project</strong> or select an existing one.</li>
                  <li><strong>3. Open Project Settings</strong> from the gear icon.</li>
                  <li><strong>4. Scroll to &quot;Your apps&quot;</strong>.</li>
                  <li>
                    <strong>5. Click &quot;Web&quot;</strong> and create a web app.
                  </li>
                  <li>
                    <strong>6. Copy the config object</strong> with apiKey, authDomain, projectId,
                    storageBucket, messagingSenderId, and appId.
                  </li>
                </ol>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-4 text-teal-400">Supabase Setup Steps:</h3>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li>
                    <strong>1. Go to Supabase</strong>
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-500 hover:underline ml-2"
                    >
                      supabase.com
                    </a>
                  </li>
                  <li><strong>2. Sign up</strong> with GitHub or email.</li>
                  <li><strong>3. Create a new project</strong>.</li>
                  <li><strong>4. Open Settings and then API</strong>.</li>
                  <li>
                    <strong>5. Copy these values:</strong>
                    <div className="ml-4 mt-2 space-y-1">
                      <div>Project URL (`VITE_SUPABASE_URL`)</div>
                      <div>Anon Public Key (`VITE_SUPABASE_ANON_KEY`)</div>
                    </div>
                  </li>
                </ol>
              </div>
            )}
          </div>

          <div className="bg-gray-950 border-2 border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-teal-400">3. Create .env.local file</h3>
              <button
                type="button"
                onClick={copyToClipboard}
                className={`px-3 py-1 text-sm font-bold border-2 transition ${
                  showCopied
                    ? 'border-green-500 bg-green-900 text-green-300'
                    : 'border-yellow-500 bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
                }`}
              >
                {showCopied ? 'COPIED' : 'COPY'}
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-3">
              Create a new file named <code className="bg-gray-800 px-2 py-1">.env.local</code> in
              your project root and paste:
            </p>

            <pre className="bg-black border-2 border-yellow-500 p-4 text-yellow-500 font-mono text-xs overflow-x-auto rounded">
              {envContent}
            </pre>
          </div>
        </div>

        <div className="bg-red-950 border-4 border-red-700 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-red-400 font-['Cinzel']">
            4. RESTART DEV SERVER
          </h2>
          <ol className="space-y-2 text-gray-300">
            <li>
              <strong>1. Stop the dev server:</strong> Press <code className="bg-red-900 px-2 py-1">Ctrl+C</code> in the terminal.
            </li>
            <li>
              <strong>2. Start again:</strong> Run <code className="bg-red-900 px-2 py-1">npm run dev</code>.
            </li>
            <li>
              <strong>3. Done:</strong> The app should load with your backend configured.
            </li>
          </ol>
        </div>

        <div className="bg-teal-950 border-4 border-teal-600 p-8 text-center">
          <p className="text-teal-300 mb-3">
            <strong>Need a quick demo?</strong>
          </p>
          <p className="text-sm text-gray-300 mb-4">
            Firebase and Supabase both offer free tiers for testing. Add the credentials to
            `.env.local`, restart, and reload.
          </p>
          <p className="text-xs text-gray-400">
            Having issues? Check `QUICK_START.md` in the project for troubleshooting.
          </p>
        </div>

        <div className="bg-gray-950 border-4 border-purple-600 p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-purple-400 font-['Cinzel']">
              DEBUG INFO
            </h2>
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              className="px-3 py-1 text-sm font-bold border-2 border-purple-500 bg-purple-900 text-purple-300 hover:bg-purple-800"
            >
              {showDebug ? 'HIDE' : 'SHOW'}
            </button>
          </div>

          {showDebug && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-purple-300 mb-2">Current Backend:</h3>
                <p className="text-sm text-gray-300 bg-black p-2 border-2 border-gray-700">
                  {debugInfo.backend || 'firebase (default)'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-purple-300 mb-2">Firebase Config:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black p-2 border-2 border-gray-700">
                    <span className="text-yellow-400">API Key:</span> {debugInfo.firebase.apiKey}
                  </div>
                  <div className="bg-black p-2 border-2 border-gray-700">
                    <span className="text-yellow-400">Auth Domain:</span> {debugInfo.firebase.authDomain}
                  </div>
                  <div className="bg-black p-2 border-2 border-gray-700">
                    <span className="text-yellow-400">Project ID:</span> {debugInfo.firebase.projectId}
                  </div>
                  <div className="bg-black p-2 border-2 border-gray-700">
                    <span className="text-yellow-400">App ID:</span> {debugInfo.firebase.appId}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-purple-300 mb-2">Supabase Config:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black p-2 border-2 border-gray-700">
                    <span className="text-yellow-400">URL:</span> {debugInfo.supabase.url}
                  </div>
                  <div className="bg-black p-2 border-2 border-gray-700">
                    <span className="text-yellow-400">Anon Key:</span> {debugInfo.supabase.anonKey}
                  </div>
                </div>
              </div>

              <div className="bg-red-950 border-2 border-red-700 p-4">
                <p className="text-red-300 text-sm">
                  <strong>If you see &quot;Missing&quot; values:</strong><br />
                  1. Check that `.env.local` exists in the project root.<br />
                  2. Ensure there are no spaces around `=` signs.<br />
                  3. Restart the dev server after editing env values.<br />
                  4. Make sure the file is named exactly `.env.local`.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
