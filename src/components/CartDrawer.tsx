import { useState, type FormEvent } from 'react'
import { ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import type { CartItem } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { ProductImage } from './ProductImage'

type CartDrawerProps = {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
  onContinueShopping: () => void
  onChangeQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartDrawer({ items, isOpen, onClose, onContinueShopping, onChangeQuantity, onRemove }: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'delivery' | 'review'>('cart')
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  if (!isOpen) return null

  const closeDrawer = () => {
    setCheckoutStep('cart')
    onClose()
  }

  const continueToReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCheckoutStep('review')
  }

  return (
    <div className="lux-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeDrawer()}>
      <aside className="lux-side-drawer lux-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="drawer-heading">
          <div><p className="eyebrow">L'Atelier Scent</p><h2 id="cart-title">{checkoutStep === 'cart' ? 'Your Cart' : checkoutStep === 'delivery' ? 'Delivery details' : 'Order review'} <span>{itemCount.toString().padStart(2, '0')}</span></h2></div>
          <button className="lux-close" type="button" aria-label="Close cart" onClick={closeDrawer}><X size={19} /></button>
        </div>
        {items.length === 0 ? (
          <div className="drawer-empty"><ShoppingBag size={25} strokeWidth={1.2} /><h3>Your cart is<br />waiting for a scent.</h3><p>Discover a fragrance to make your own.</p><button className="lux-button lux-button-dark" type="button" onClick={onContinueShopping}>Continue Shopping <ArrowRight size={15} /></button></div>
        ) : checkoutStep === 'delivery' ? (
          <form className="checkout-form" onSubmit={continueToReview}>
            <p className="checkout-intro">Enter delivery details to review this order. This preview does not send or save your information.</p>
            <label>Full name<input name="fullName" autoComplete="name" placeholder="Your name" required /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
            <label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+234" required /></label>
            <label>Street address<input name="address" autoComplete="street-address" placeholder="House number and street" required /></label>
            <div className="checkout-form-row"><label>City<input name="city" autoComplete="address-level2" required /></label><label>State<input name="state" autoComplete="address-level1" required /></label></div>
            <button className="lux-button lux-button-dark checkout-button" type="submit">Review order <ArrowRight size={15} /></button>
            <button className="checkout-back" type="button" onClick={() => setCheckoutStep('cart')}>Back to cart</button>
          </form>
        ) : checkoutStep === 'review' ? (
          <div className="checkout-review">
            <p className="checkout-intro">Review your selection. Payment and order placement are not connected yet.</p>
            <div className="review-lines">{items.map(({ product, quantity }) => <div key={product.id}><span>{product.name} × {quantity}</span><strong>{formatCurrency(product.price * quantity, product.currency)}</strong></div>)}<div className="review-total"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div></div>
            <p className="checkout-notice">Delivery details are held only on this page. Nothing has been transmitted or saved.</p>
            <button className="lux-button lux-button-dark checkout-button" type="button" disabled>Checkout <span>Payment setup coming soon</span></button>
            <button className="checkout-back" type="button" onClick={() => setCheckoutStep('delivery')}>Edit delivery details</button>
            <button className="checkout-back" type="button" onClick={() => setCheckoutStep('cart')}>Back to cart</button>
          </div>
        ) : (
          <>
            <div className="cart-table-heading"><span>Product</span><span>Price</span><span>Quantity</span></div>
            <div className="cart-lines">
              {items.map(({ product, quantity }) => (
                <article className="cart-line" key={product.id}>
                  <ProductImage product={product} className="cart-product-image" />
                  <div className="cart-product-info"><span>{product.brand}</span><h3>{product.name}</h3><p>{product.size} · {product.family}</p><strong className="cart-line-total">{formatCurrency(product.price * quantity, product.currency)}</strong></div>
                  <span className="cart-unit-price">{formatCurrency(product.price, product.currency)}</span>
                  <div className="cart-quantity"><button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={quantity <= 1} onClick={() => onChangeQuantity(product.id, quantity - 1)}><Minus size={13} /></button><span>{quantity}</span><button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => onChangeQuantity(product.id, quantity + 1)}><Plus size={13} /></button></div>
                  <button className="cart-remove" type="button" aria-label={`Remove ${product.name}`} onClick={() => onRemove(product.id)}>Remove</button>
                </article>
              ))}
            </div>
            <div className="cart-bottom">
              <div className="cart-subtotal"><span>Subtotal <small>({itemCount} {itemCount === 1 ? 'item' : 'items'})</small></span><strong>{formatCurrency(subtotal)}</strong></div>
              <p>Delivery is calculated before payment.</p>
              <button className="lux-button lux-button-dark checkout-button" type="button" onClick={() => setCheckoutStep('delivery')}>Checkout <ArrowRight size={15} /></button>
              <button className="continue-shopping" type="button" onClick={() => { setCheckoutStep('cart'); onContinueShopping() }}>Continue Shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}