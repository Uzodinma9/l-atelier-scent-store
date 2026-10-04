import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import type { CartItem } from '../types'
import { formatCurrency } from '../utils/formatCurrency'
import { placeOrder, type DeliveryDetails, type OrderReceipt } from '../lib/orders'
import { ProductImage } from './ProductImage'

type CartDrawerProps = {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
  onContinueShopping: () => void
  onChangeQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onClearCart: () => void
}

const stepTitles = {
  cart: 'Your Cart',
  delivery: 'Delivery details',
  review: 'Order review',
  confirmation: 'Order placed',
} as const

export function CartDrawer({ items, isOpen, onClose, onContinueShopping, onChangeQuantity, onRemove, onClearCart }: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<keyof typeof stepTitles>('cart')
  const [delivery, setDelivery] = useState<DeliveryDetails | null>(null)
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [orderError, setOrderError] = useState('')
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  if (!isOpen) return null

  const closeDrawer = () => {
    setCheckoutStep('cart')
    setDelivery(null)
    setReceipt(null)
    setOrderError('')
    onClose()
  }

  const continueToReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const read = (field: string) => String(formData.get(field) ?? '').trim()
    setDelivery({
      fullName: read('fullName'),
      email: read('email'),
      phone: read('phone'),
      address: read('address'),
      city: read('city'),
      state: read('state'),
    })
    setOrderError('')
    setCheckoutStep('review')
  }

  const submitOrder = async () => {
    if (!delivery || items.length === 0) return
    setIsSending(true)
    setOrderError('')
    try {
      const result = await placeOrder(delivery, items)
      setReceipt(result)
      onClearCart()
      setCheckoutStep('confirmation')
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'The order could not be placed. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="lux-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeDrawer()}>
      <aside className="lux-side-drawer lux-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="drawer-heading">
          <div><p className="eyebrow">L'Atelier Scent</p><h2 id="cart-title">{stepTitles[checkoutStep]} <span>{itemCount.toString().padStart(2, '0')}</span></h2></div>
          <button className="lux-close" type="button" aria-label="Close cart" onClick={closeDrawer}><X size={19} /></button>
        </div>
        {checkoutStep === 'confirmation' ? (
          <div className="checkout-review">
            <p className="checkout-intro"><Check size={15} /> Thank you — your order is confirmed.</p>
            <div className="review-lines">
              <div className="review-total"><span>Order reference</span><strong>{receipt?.reference}</strong></div>
              <div className="review-total"><span>Subtotal</span><strong>{formatCurrency(receipt?.subtotal ?? subtotal)}</strong></div>
            </div>
            <p className="checkout-notice">A confirmation email is on its way to {delivery?.email}. We will follow up about delivery.</p>
            <button className="lux-button lux-button-dark checkout-button" type="button" onClick={() => { onContinueShopping(); closeDrawer() }}>Continue shopping <ArrowRight size={15} /></button>
          </div>
        ) : items.length === 0 ? (
          <div className="drawer-empty"><ShoppingBag size={25} strokeWidth={1.2} /><h3>Your cart is<br />waiting for a scent.</h3><p>Discover a fragrance to make your own.</p><button className="lux-button lux-button-dark" type="button" onClick={onContinueShopping}>Continue Shopping <ArrowRight size={15} /></button></div>
        ) : checkoutStep === 'delivery' ? (
          <form className="checkout-form" onSubmit={continueToReview}>
            <p className="checkout-intro">Enter your delivery details, then review the order before placing it.</p>
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
            <p className="checkout-intro">Review your selection, then place the order. A confirmation email goes to you and to the atelier.</p>
            <div className="review-lines">{items.map(({ product, quantity }) => <div key={product.id}><span>{product.name} × {quantity}</span><strong>{formatCurrency(product.price * quantity, product.currency)}</strong></div>)}<div className="review-total"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div></div>
            {delivery && <p className="checkout-notice">Delivering to {delivery.fullName}, {delivery.address}, {delivery.city}, {delivery.state} · {delivery.phone}</p>}
            {orderError && <p className="checkout-notice" role="alert">{orderError}</p>}
            <button className="lux-button lux-button-dark checkout-button" type="button" disabled={isSending} onClick={() => { void submitOrder() }}>{isSending ? 'Sending order…' : 'Place order'} <ArrowRight size={15} /></button>
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
