import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const normalizeUserRecord = (user, userData = {}) => ({
  ...user,
  ...userData,
  id: user?.id || userData?.id,
  uid: user?.id || userData?.id,
  name: userData?.name || user?.user_metadata?.name || user?.email,
  role: userData?.role || null,
  buildingId: userData?.building_id ?? userData?.buildingId ?? null
})

const normalizeBuildingRecord = (building) => {
  if (!building) return null
  return {
    ...building,
    id: building.id,
    createdBy: building.created_by ?? building.createdBy,
    inviteCode: building.invite_code ?? building.inviteCode
  }
}

const normalizeIssueRecord = (issue) => {
  if (!issue) return null
  return {
    ...issue,
    id: issue.id,
    buildingId: issue.building_id ?? issue.buildingId,
    createdBy: issue.created_by ?? issue.createdBy,
    createdAt: issue.created_at ?? issue.createdAt,
    updatedAt: issue.updated_at ?? issue.updatedAt
  }
}

const normalizeCommentRecord = (comment) => {
  if (!comment) return null
  return {
    ...comment,
    id: comment.id,
    issueId: comment.issue_id ?? comment.issueId,
    userId: comment.user_id ?? comment.userId,
    timestamp: comment.timestamp
  }
}

const createPollingSubscription = (load, onData, onError, intervalMs = 5000) => {
  let active = true

  const run = async () => {
    try {
      const data = await load()
      if (active) onData(data)
    } catch (error) {
      if (active) onError?.(error)
    }
  }

  run()
  const timer = setInterval(run, intervalMs)

  return () => {
    active = false
    clearInterval(timer)
  }
}

/**
 * Authentication Service
 */
export const SupabaseAuthService = {
  signup: async (email, password, name, role) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) throw authError

    const userId = authData.user.id

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name,
        email,
        role,
        building_id: null
      })

    if (insertError) throw insertError

    return normalizeUserRecord(authData.user, {
      id: userId,
      name,
      email,
      role,
      building_id: null
    })
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return normalizeUserRecord(data.user)
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })

    if (error) throw error
    return data
  },

  completeOnboarding: async (userId, email, role) => {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        role,
        building_id: null
      })

    if (error) throw error
    return { success: true }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return normalizeUserRecord(user, userData || {})
  },

  onAuthStateChange: (callback) => {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        callback(normalizeUserRecord(session.user, userData || {}))
      } else {
        callback(null)
      }
    })

    return () => data.subscription.unsubscribe()
  }
}

/**
 * Building Service
 */
export const SupabaseBuildingService = {
  createBuilding: async (name, createdBy) => {
    const inviteCode = Math.random().toString(36).substr(2, 9).toUpperCase()

    const { data, error } = await supabase
      .from('buildings')
      .insert({
        name,
        created_by: createdBy,
        invite_code: inviteCode
      })
      .select('*')
      .single()

    if (error) throw error

    await supabase
      .from('users')
      .update({ building_id: data.id })
      .eq('id', createdBy)

    return normalizeBuildingRecord(data)
  },

  joinBuilding: async (inviteCode, userId) => {
    const { data: buildingData, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('invite_code', inviteCode)
      .single()

    if (buildingError || !buildingData) {
      throw new Error('Invalid invite code')
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ building_id: buildingData.id })
      .eq('id', userId)

    if (updateError) throw updateError

    return normalizeBuildingRecord(buildingData)
  },

  getBuilding: async (buildingId) => {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', buildingId)
      .single()

    if (error) throw error
    return normalizeBuildingRecord(data)
  }
}

/**
 * Issue Service
 */
export const SupabaseIssueService = {
  createIssue: async (buildingId, title, description, category, severity, createdBy) => {
    const { data, error } = await supabase
      .from('issues')
      .insert({
        building_id: buildingId,
        title,
        description,
        category,
        severity,
        status: 'Open',
        created_by: createdBy
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  },

  getIssuesByBuilding: async (buildingId) => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(normalizeIssueRecord)
  },

  getIssueById: async (issueId) => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single()

    if (error) throw error
    return normalizeIssueRecord(data)
  },

  subscribeToBuildingIssues: (buildingId, callback, onError) => createPollingSubscription(
    () => SupabaseIssueService.getIssuesByBuilding(buildingId),
    callback,
    onError
  ),

  subscribeToIssue: (issueId, callback, onError) => createPollingSubscription(
    () => SupabaseIssueService.getIssueById(issueId),
    callback,
    onError
  ),

  updateIssueStatus: async (issueId, status) => {
    const { error } = await supabase
      .from('issues')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', issueId)

    if (error) throw error
  },

  updateIssue: async (issueId, updates) => {
    const { error } = await supabase
      .from('issues')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', issueId)

    if (error) throw error
  }
}

/**
 * Comment Service
 */
export const SupabaseCommentService = {
  addComment: async (issueId, userId, text) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        issue_id: issueId,
        user_id: userId,
        text
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  },

  getCommentsByIssue: async (issueId) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('issue_id', issueId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return (data || []).map(normalizeCommentRecord)
  },

  subscribeToComments: (issueId, callback, onError) => createPollingSubscription(
    () => SupabaseCommentService.getCommentsByIssue(issueId),
    callback,
    onError
  )
}

export default {
  SupabaseAuthService,
  SupabaseBuildingService,
  SupabaseIssueService,
  SupabaseCommentService
}
