import { Heart, ShoppingBag, X } from 'lucide-react'
import type { Product } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { ProductImage } from './ProductImage'

type WishlistDrawerProps = {
  items: Product[]
  isOpen: boolean
  onClose: () => void
  onToggleWishlist: (productId: string) => void
  onAddToCart: (product: Product) => void
}

export function WishlistDrawer({ items, isOpen, onClose, onToggleWishlist, onAddToCart }: WishlistDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="lux-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="lux-side-drawer wishlist-drawer" role="dialog" aria-modal="true" aria-labelledby="wishlist-title">
        <div className="drawer-heading">
          <div><p className="eyebrow">L'Atelier Scent</p><h2 id="wishlist-title">Your Wishlist <span>{items.length.toString().padStart(2, '0')}</span></h2></div>
          <button className="lux-close" type="button" aria-label="Close wishlist" onClick={onClose}><X size={19} /></button>
        </div>
        {items.length === 0 ? (
          <div className="drawer-empty"><Heart size={25} strokeWidth={1.2} /><h3>Keep the ones<br />that stay with you.</h3><p>Save a fragrance here and return to it when the moment feels right.</p></div>
        ) : (
          <div className="wishlist-list">
            {items.map((product) => (
              <article className="wishlist-row" key={product.id}>
                <ProductImage product={product} className="wishlist-image" />
                <div className="wishlist-info"><span>{product.brand}</span><h3>{product.name}</h3><p>{formatCurrency(product.price, product.currency)} <span>· {product.size}</span></p><button type="button" onClick={() => onAddToCart(product)}><ShoppingBag size={13} /> Add to Cart</button></div>
                <button className="wishlist-remove" type="button" aria-label={`Remove ${product.name} from wishlist`} onClick={() => onToggleWishlist(product.id)}><Heart size={16} fill="currentColor" /></button>
              </article>
            ))}
          </div>
        )}
      </aside>
    </div>
  )
}