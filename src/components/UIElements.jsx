/**
 * Loading Spinner Component
 */
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-war-gold"></div>
    </div>
  )
}

/**
 * Error Alert Component
 */
export function ErrorAlert({ message, onClose }) {
  if (!message) return null

  return (
    <div className="bg-war-red bg-opacity-20 border-l-6 border-war-red p-4 rounded">
      <div className="flex justify-between items-center gap-4">
        <p className="text-war-red font-body">{message}</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-war-red hover:text-war-gold transition-colors"
          >
            x
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Success Alert Component
 */
export function SuccessAlert({ message, onClose }) {
  if (!message) return null

  return (
    <div className="bg-war-teal bg-opacity-20 border-l-6 border-war-teal p-4 rounded">
      <div className="flex justify-between items-center gap-4">
        <p className="text-war-teal font-body">{message}</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-war-teal hover:text-war-gold transition-colors"
          >
            x
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Primary Button Component
 */
export function Button({ children, onClick, disabled, variant = 'primary', className = '', type = 'button' }) {
  const baseClass = 'px-6 py-3 font-body font-semibold transition-all duration-200 border-2'

  const variants = {
    primary: `${baseClass} border-war-gold text-war-gold hover:bg-war-gold hover:text-war-bg disabled:opacity-50`,
    danger: `${baseClass} border-war-red text-war-red hover:bg-war-red hover:text-white disabled:opacity-50`,
    teal: `${baseClass} border-war-teal text-war-teal hover:bg-war-teal hover:text-war-bg disabled:opacity-50`
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * Panel Component - War Room aesthetic
 */
export function Panel({ children, className = '' }) {
  return (
    <div className={`bg-war-panel border-2 border-war-neutral border-opacity-30 backdrop-blur-md rounded p-6 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Card Component with border-left accent
 */
export function IssueCard({ issue, onClick }) {
  const borderColor = issue.severity === 'Critical'
    ? 'border-war-red'
    : issue.severity === 'High'
      ? 'border-orange-500'
      : issue.severity === 'Medium'
        ? 'border-yellow-500'
        : 'border-war-teal'

  return (
    <div
      onClick={onClick}
      className={`${borderColor} border-l-6 bg-war-panel hover:bg-opacity-100 bg-opacity-70 p-4 cursor-pointer transition-all duration-200 hover:scale-102 border-2 border-l-6 border-war-neutral border-opacity-30 rounded`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-display font-bold text-war-gold text-lg">{issue.title}</h3>
        <span
          className="text-xs font-body font-bold uppercase px-2 py-1 rounded"
          style={{ color: issue.severity === 'Critical' ? '#c0392b' : 'inherit' }}
        >
          {issue.severity}
        </span>
      </div>
      <p className="text-war-neutral text-sm mb-3">{issue.description.substring(0, 100)}...</p>
      <div className="flex justify-between items-center text-xs font-body text-war-neutral">
        <span>{issue.category}</span>
        <span
          className="px-2 py-1 rounded text-white"
          style={{
            backgroundColor: issue.status === 'Resolved'
              ? '#1abc9c'
              : issue.status === 'In Progress'
                ? '#f39c12'
                : '#c0392b'
          }}
        >
          {issue.status}
        </span>
      </div>
    </div>
  )
}

/**
 * Input Field Component
 */
export function InputField({ label, type = 'text', name, id, value, onChange, placeholder, error, className = '' }) {
  const inputId = id || name

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block font-display font-semibold text-war-gold mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-war-dark border-2 border-war-neutral border-opacity-40 p-3 text-white rounded focus:border-war-gold focus:outline-none transition-colors ${className}`}
      />
      {error && <p className="text-war-red text-sm mt-1">{error}</p>}
    </div>
  )
}

/**
 * Textarea Field Component
 */
export function TextareaField({ label, name, id, value, onChange, placeholder, error, rows = 4, className = '' }) {
  const textareaId = id || name

  return (
    <div className="mb-4">
      {label && <label htmlFor={textareaId} className="block font-display font-semibold text-war-gold mb-2">{label}</label>}
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-war-dark border-2 border-war-neutral border-opacity-40 p-3 text-white rounded focus:border-war-gold focus:outline-none transition-colors resize-none ${className}`}
      />
      {error && <p className="text-war-red text-sm mt-1">{error}</p>}
    </div>
  )
}

/**
 * Select Field Component
 */
export function SelectField({ label, name, id, value, onChange, options, error, className = '' }) {
  const selectId = id || name

  return (
    <div className="mb-4">
      {label && <label htmlFor={selectId} className="block font-display font-semibold text-war-gold mb-2">{label}</label>}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-war-dark border-2 border-war-neutral border-opacity-40 p-3 text-white rounded focus:border-war-gold focus:outline-none transition-colors ${className}`}
      >
        <option value="">-- Select --</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-war-red text-sm mt-1">{error}</p>}
    </div>
  )
}

/**
 * Badge Component
 */
export function Badge({ label, color = 'gold' }) {
  const colors = {
    gold: 'bg-war-gold text-war-bg',
    red: 'bg-war-red text-white',
    teal: 'bg-war-teal text-war-bg',
    neutral: 'bg-war-neutral text-war-bg'
  }

  return (
    <span className={`${colors[color]} px-3 py-1 rounded text-xs font-bold font-body uppercase`}>
      {label}
    </span>
  )
}

/**
 * Header Component
 */
export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8 border-b-3 border-war-gold border-opacity-30 pb-6">
      <h1 className="font-display font-bold text-4xl text-war-gold mb-2">{title}</h1>
      {subtitle && <p className="font-body text-war-neutral">{subtitle}</p>}
    </div>
  )
}
