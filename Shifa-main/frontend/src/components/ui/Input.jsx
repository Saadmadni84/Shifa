import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

const Input = forwardRef(function Input(
  { label, error, helper, leftIcon, rightIcon, required, className = '', containerClassName = '', id, ...props },
  ref,
) {
  const uid = id || `i-${Math.random().toString(36).slice(2, 7)}`
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={uid} className="text-sm font-medium text-gray-700 select-none">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{leftIcon}</div>
        )}
        <input
          ref={ref}
          id={uid}
          className={[
            'w-full h-10 rounded-xl border bg-white text-sm text-gray-900',
            'placeholder:text-gray-400 transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            leftIcon ? 'pl-10' : 'pl-3.5',
            rightIcon || error ? 'pr-10' : 'pr-3.5',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50'
              : 'border-gray-300 focus:border-emerald-400 focus:ring-emerald-100',
            props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {(rightIcon || error) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {error ? <AlertCircle size={16} className="text-red-500" /> : rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  )
})
export default Input

export const Textarea = forwardRef(function Textarea(
  { label, error, helper, required, rows = 4, className = '', containerClassName = '', id, ...props },
  ref,
) {
  const uid = id || `ta-${Math.random().toString(36).slice(2, 7)}`
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={uid} className="text-sm font-medium text-gray-700 select-none">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={uid}
        rows={rows}
        className={[
          'w-full rounded-xl border bg-white text-sm text-gray-900',
          'placeholder:text-gray-400 resize-none p-3.5 transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-emerald-400 focus:ring-emerald-100',
          props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  )
})

export const Select = forwardRef(function Select(
  { label, error, helper, required, className = '', containerClassName = '', id, children, ...props },
  ref,
) {
  const uid = id || `s-${Math.random().toString(36).slice(2, 7)}`
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={uid} className="text-sm font-medium text-gray-700 select-none">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={uid}
        className={[
          'w-full h-10 rounded-xl border bg-white text-sm text-gray-900',
          'transition-all duration-150 px-3.5',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-emerald-400 focus:ring-emerald-100',
          props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  )
})
