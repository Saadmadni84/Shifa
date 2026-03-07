import React, { useState, useRef, useEffect } from 'react'

export function AudioPlayer({ src, fallbackText }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    // Reset state when src changes
    setIsPlaying(false)
    setProgress(0)
    setError(false)
  }, [src])

  const togglePlay = () => {
    if (error) return
    
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play().catch(e => {
        console.error('Audio play failed:', e)
        setError(true)
      })
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleError = () => {
    setError(true)
    setIsPlaying(false)
  }

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00'
    const m = Math.floor(timeInSeconds / 60)
    const s = Math.floor(timeInSeconds % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 relative overflow-hidden">
      <audio 
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
        className="hidden"
      />
      
      {error ? (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">Audio playback unavailable in demo</p>
            <p className="text-xs text-amber-700 mt-1">{fallbackText}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-md transition-colors shrink-0"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          <div className="flex-1">
            <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs font-semibold text-emerald-700">
              <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
