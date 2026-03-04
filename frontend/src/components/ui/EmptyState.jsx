import Button from './Button'

export default function EmptyState({ icon, title, description, actionLabel, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      {icon && <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">{description}</p>}
      {onAction && actionLabel && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
