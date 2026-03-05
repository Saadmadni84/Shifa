export default function Tabs({ tabs, active, onChange, className = '', sticky = false }) {
  return (
    <div className={['flex overflow-x-auto scrollbar-hide border-b border-gray-200', sticky ? 'sticky top-0 z-10 bg-white' : '', className].join(' ')} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          disabled={tab.disabled}
          className={[
            'flex-shrink-0 flex items-center gap-2 px-5 py-3 text-sm font-medium',
            'border-b-2 -mb-px transition-all duration-150 whitespace-nowrap',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400',
            tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            active === tab.id ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ].join(' ')}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.count != null && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
