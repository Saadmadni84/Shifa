import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus-visible:ring-emerald-400 shadow-sm',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-300',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-400 shadow-sm',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-300',
  outline: 'bg-transparent text-emerald-600 border border-emerald-400 hover:bg-emerald-50 focus-visible:ring-emerald-400',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1ebe5d] focus-visible:ring-green-400 shadow-sm',
}
const SIZES = {
  xs: 'h-7  px-2.5 text-xs  rounded-lg  gap-1',
  sm: 'h-8  px-3   text-sm  rounded-lg  gap-1.5',
  md: 'h-10 px-4   text-sm  rounded-xl  gap-2',
  lg: 'h-12 px-6   text-base rounded-xl gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}) {
  const off = disabled || loading
  return (
    <button
      type={type}
      disabled={off}
      className={[
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-150 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        off ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'lg' ? 20 : 16} className="animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0 flex items-center">{leftIcon}</span>
      ) : null}
      {children && <span className="truncate">{children}</span>}
      {!loading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
    </button>
  )
}