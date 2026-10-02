import { useState } from 'react'
import type { Product } from '../types'
import { ProductBottle } from './ProductBottle'

type ProductImageProps = {
  product: Product
  className?: string
}

export function ProductImage({ product, className = '' }: ProductImageProps) {
  const compact = className.includes('cart') || className.includes('wishlist')
  const [hasError, setHasError] = useState(false)

  if (!product.image || hasError) return <ProductBottle product={product} compact={compact} />

  return (
    <img
      className={className}
      src={product.image}
      alt={product.imageAlt}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}