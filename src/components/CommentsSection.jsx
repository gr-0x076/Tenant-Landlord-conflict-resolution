import { useState } from 'react'
import { timeAgo } from '../utils/helpers'
import { Button } from './UIElements'

/**
 * Comments Section Component
 * Displays threaded comments with no-edit policy
 */
export function CommentsSection({ comments, userRole, onAddComment, loading, error }) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <h3 className="font-display font-bold text-war-gold text-lg mb-4">ORDERS & UPDATES</h3>
      
      {error && (
        <div className="bg-war-red bg-opacity-20 border-l-6 border-war-red p-3 rounded mb-4 text-war-red text-sm">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {loading ? (
          <p className="text-war-neutral">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-war-neutral italic">No updates yet. Awaiting response...</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-war-dark border-l-3 border-war-gold border-opacity-50 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <p className="font-body font-semibold text-war-gold">{comment.userId}</p>
                <span className="text-war-neutral text-xs">{timeAgo(comment.timestamp)}</span>
              </div>
              <p className="text-white font-body text-sm">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {userRole && (
        <form onSubmit={handleSubmit} className="border-t-2 border-war-neutral border-opacity-20 pt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Record your response here..."
            rows={3}
            className="w-full bg-war-dark border-2 border-war-neutral border-opacity-40 p-3 text-white rounded focus:border-war-gold focus:outline-none transition-colors resize-none mb-3"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="w-full"
          >
            {isSubmitting ? 'RECORDING...' : 'RECORD RESPONSE'}
          </Button>
        </form>
      )}
    </div>
  )
}
