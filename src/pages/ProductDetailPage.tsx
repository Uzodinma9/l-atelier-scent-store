import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ProductImage } from '../components/ProductImage'
import { formatCurrency } from '../utils/formatCurrency'
import type { Product } from '../types'

type ProductDetailPageProps = {
  products: Product[]
  productsLoading: boolean
  productsError: string | null
  onRetry: () => void
  onAddToCart: (product: Product, quantity: number) => void
  wishlistIds: string[]
  onToggleWishlist: (productId: string) => void
}

export function ProductDetailPage({ products, productsLoading, productsError, onRetry, onAddToCart, wishlistIds, onToggleWishlist }: ProductDetailPageProps) {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  if (!product && productsLoading) return <main className="detail-page section-shell"><p className="catalog-feedback" role="status">Loading fragrance…</p></main>
  if (!product && productsError) return <main className="detail-page section-shell"><div className="catalog-feedback catalog-feedback-error" role="alert"><p>{productsError}</p><button type="button" onClick={onRetry}>Try again</button></div></main>
  if (!product) return <Navigate to="/shop" replace />

  const relatedProducts = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4)
  const handleAdd = () => {
    onAddToCart(product, quantity)
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <main className="detail-page section-shell">
      <Link className="detail-back" to="/shop"><ArrowLeft size={14} /> Back to the collection</Link>
      <div className="detail-layout">
        <div className="detail-image-panel"><ProductImage product={product} className="detail-product-image" /></div>
        <section className="detail-copy">
          <p className="eyebrow">{product.brand} · {product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-family">{product.family}</p>
          <p className="detail-price">{formatCurrency(product.price, product.currency)}</p>
          <p className="detail-size">{product.size} <span>·</span> Fragrance</p>
          <p className="detail-description">{product.description}</p>
          <div className="notes-block"><span className="detail-label">Fragrance notes</span><div className="note-list">{product.fragranceNotes.map((note) => <span key={note}>{note}</span>)}</div></div>
          <div className="detail-buy-row">
            <div className="detail-quantity" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((amount) => Math.max(1, amount - 1))}><Minus size={14} /></button>
              <span>{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((amount) => amount + 1)}><Plus size={14} /></button>
            </div>
            <button className="lux-button lux-button-dark detail-add" type="button" onClick={handleAdd}>
              {justAdded ? <><Check size={15} /> Added to cart</> : <><ShoppingBag size={15} /> Add to Cart</>}
            </button>
            <button className={wishlistIds.includes(product.id) ? 'detail-wishlist is-saved' : 'detail-wishlist'} type="button" aria-label={wishlistIds.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={wishlistIds.includes(product.id)} onClick={() => onToggleWishlist(product.id)}><Heart size={18} fill={wishlistIds.includes(product.id) ? 'currentColor' : 'none'} /></button>
          </div>
          <p className="detail-delivery-note">A considered selection, delivered with care.</p>
        </section>
      </div>
      {relatedProducts.length > 0 && <section className="related-section"><div className="section-heading"><div><p className="eyebrow">Continue exploring</p><h2>More from <em>{product.category.toLowerCase()}.</em></h2></div><Link className="inline-link" to="/shop">All fragrances <ArrowRight size={14} /></Link></div><div className="product-grid">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} onAdd={(relatedProduct) => onAddToCart(relatedProduct, 1)} isWishlisted={wishlistIds.includes(item.id)} onToggleWishlist={onToggleWishlist} />)}</div></section>}
    </main>
  )
}