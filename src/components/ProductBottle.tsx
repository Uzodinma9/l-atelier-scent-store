import type { Product } from '../types'

type ProductBottleProps = {
  product: Product
  compact?: boolean
}

export function ProductBottle({ product, compact = false }: ProductBottleProps) {
  return (
    <div className={`bottle-scene bottle-scene-${product.tone}${compact ? ' bottle-scene-compact' : ''}`} role="img" aria-label={`${product.name} perfume bottle placeholder`}>
      <span className="bottle-scene-caption">CURATED FRAGRANCE <span>·</span> {product.category.toUpperCase()}</span>
      <div className="bottle-shadow" />
      <div className="bottle-object">
        <div className="bottle-cap" />
        <div className="bottle-neck" />
        <div className="bottle-glass">
          <div className="bottle-label">
            <span>{product.brand.toUpperCase()}</span>
            <strong>{product.name}</strong>
            <small>EAU DE PARFUM<br />{product.size.toUpperCase()}</small>
          </div>
        </div>
      </div>
      <span className="bottle-scene-index">{product.category.toUpperCase()} EDIT</span>
    </div>
  )
}