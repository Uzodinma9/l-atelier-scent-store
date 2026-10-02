import { useState } from 'react'
import { ArrowRight, Check, Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { ProductImage } from './ProductImage'

type ProductCardProps = {
  product: Product
  onAdd: (product: Product) => void
  index?: number
  isWishlisted?: boolean
  onToggleWishlist?: (productId: string) => void
}

export function ProductCard({ product, onAdd, isWishlisted = false, onToggleWishlist = () => undefined }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    onAdd(product)
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1100)
  }

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link to={`/products/${product.id}`} className="product-image-link" aria-label={`View ${product.brand} ${product.name}`}>
          <ProductImage product={product} className="product-card-image" />
        </Link>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button
          className={isWishlisted ? 'wishlist-toggle is-saved' : 'wishlist-toggle'}
          type="button"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
          onClick={() => onToggleWishlist(product.id)}
        >
          <Heart size={17} strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-details">
        <Link to={`/products/${product.id}`} className="product-title-link">
          <span className="product-brand">{product.brand}</span>
          <span className="product-title-row"><h3>{product.name}</h3><span className="product-price">{formatCurrency(product.price, product.currency)}</span></span>
        </Link>
        <div className="product-meta"><span>{product.size}</span><span>{product.family}</span></div>
        <p className="product-description">{product.description}</p>
        <button type="button" className={justAdded ? 'add-button is-added' : 'add-button'} onClick={handleAdd}>
          {justAdded ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> Add to Cart</>}
          {!justAdded && <ArrowRight size={14} />}
        </button>
      </div>
    </article>
  )
}