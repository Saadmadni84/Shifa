const PAL = [
  ['bg-emerald-100', 'text-emerald-700'],
  ['bg-blue-100', 'text-blue-700'],
  ['bg-amber-100', 'text-amber-700'],
  ['bg-purple-100', 'text-purple-700'],
  ['bg-rose-100', 'text-rose-700'],
  ['bg-teal-100', 'text-teal-700'],
]
const colorFor = (s) => {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = s.charCodeAt(i) + ((h << 5) - h)
  return PAL[Math.abs(h) % PAL.length]
}
const SZ = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
}

export default function Avatar({ firstName = '', lastName = '', src, size = 'md', className = '', badge }) {
  const [bg, text] = colorFor(`${firstName}${lastName}`)
  const sz = SZ[size] ?? SZ.md
  const ini = `${(firstName[0] ?? '').toUpperCase()}${(lastName[0] ?? '').toUpperCase()}` || '?'
  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={`${firstName} ${lastName}`} className={`${sz} rounded-full object-cover`} />
      ) : (
        <div className={`${sz} ${bg} ${text} rounded-full flex items-center justify-center font-bold select-none`}>{ini}</div>
      )}
      {badge && <div className="absolute -bottom-0.5 -right-0.5">{badge}</div>}
    </div>
  )
}
