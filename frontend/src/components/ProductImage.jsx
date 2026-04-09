import { useState } from 'react'

export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'Product')}&size=400&background=F2E0DC&color=9E6B63&font-size=0.25`

  const isValidUrl = src && !src.includes('undefined') && !src.includes('null') && src.startsWith('http')

  const imageSrc = (!isValidUrl || failed) ? fallback : src

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-rose-50 animate-pulse rounded-xl" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}