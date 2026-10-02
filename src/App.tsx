import { useEffect, useState } from 'react'
import { AccountModal } from './components/AccountModal'
import { CartDrawer } from './components/CartDrawer'
import { Header } from './components/Header'
import { ProductCard } from './components/ProductCard'
import { products } from './data/products'
import type { CartItem, Product, ProductCategory } from './types'
import './App.css'
import './storefront.css'

const cartStorageKey = 'latelier-scent-cart'
const productCategories = ['All', 'Designer', 'Niche', 'Arabic', 'Signature'] as const
type ProductFilter = (typeof productCategories)[number]

function restoreCart(): CartItem[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(cartStorageKey) ?? '[]')
    if (!Array.isArray(stored)) return []

    return stored.flatMap((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) return []
      const savedItem = entry as { productId?: unknown; quantity?: unknown }
      if (typeof savedItem.productId !== 'string' || typeof savedItem.quantity !== 'number' || !Number.isInteger(savedItem.quantity) || savedItem.quantity < 1) return []

      const product = products.find((item) => item.id === savedItem.productId)
      return product ? [{ product, quantity: savedItem.quantity }] : []
    })
  } catch {
    return []
  }
}

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(restoreCart)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ProductFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity }))))
    } catch {
      // Keep the in-memory cart usable when browser storage is unavailable.
    }
  }, [cartItems])

  const addToCart = (product: Product) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.product.id === product.id)
      return existing
        ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const changeQuantity = (productId: string, change: number) => {
    setCartItems((items) => items
      .map((item) => item.product.id === productId ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0))
  }

  const removeFromCart = (productId: string) => {
    setCartItems((items) => items.filter((item) => item.product.id !== productId))
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase()
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeFilter === 'All' || product.category === activeFilter as ProductCategory
    const searchText = `${product.name} ${product.brand} ${product.family} ${product.description}`.toLocaleLowerCase()
    return matchesCategory && (!normalizedSearch || searchText.includes(normalizedSearch))
  })

  return (
    <>
      <div className="announcement">Designer favourites · Arabic scents · The L'Atelier signature</div>
      <Header
        cartCount={cartCount}
        wishlistCount={0}
        onAccount={() => setIsAccountOpen(true)}
        onCart={() => setIsCartOpen(true)}
        onWishlist={() => undefined}
      />

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">A considered fragrance edit · Nigeria</p>
            <h1>Find your<br /><em>signature.</em></h1>
            <p className="hero-intro">From iconic designer houses to sought-after Arabic fragrances, discover a scent that feels unmistakably yours.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#shop">Shop fragrances <span aria-hidden="true">↗</span></a>
              <a className="text-link" href="#about">Meet our signature <span aria-hidden="true">→</span></a>
            </div>
            <div className="hero-signature"><span className="signature-rule" /> Find the one that feels like you</div>
          </div>
          <div className="hero-image-wrap">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1400&q=85"
              alt="Perfume bottles arranged with botanical ingredients in a still life"
            />
            <div className="hero-image-caption"><span>01 / 20</span><span>THE FRAGRANCE EDIT</span></div>
            <div className="hero-seal" aria-hidden="true"><span>EAU<br />DE<br />PARFUM</span></div>
          </div>
          <div className="hero-index" aria-hidden="true">L'ATELIER / 2025</div>
        </section>

        <section className="values-bar" aria-label="Our approach">
          <div><span className="value-number">01</span><span>Designer and niche houses</span></div>
          <div><span className="value-number">02</span><span>Arabic fragrance discoveries</span></div>
          <div><span className="value-number">03</span><span>One L'Atelier signature</span></div>
        </section>

        <section className="shop-section section-shell" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The fragrance edit</p>
              <h2>Find your <em>next favourite.</em></h2>
            </div>
            <span className="shop-count">{visibleProducts.length} fragrances</span>
          </div>
          <div className="shop-tools">
            <div className="category-tabs" role="tablist" aria-label="Filter fragrances by collection">
              {productCategories.map((category) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === category}
                  className={activeFilter === category ? 'category-tab is-active' : 'category-tab'}
                  key={category}
                  onClick={() => setActiveFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="product-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                aria-label="Search fragrances and brands"
                placeholder="Search fragrances or brands"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
          </div>
          <div className="product-grid">
            {visibleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onAdd={addToCart} />
            ))}
          </div>
          {visibleProducts.length === 0 && <p className="no-products">No fragrances match that search. Try another name or collection.</p>}
        </section>

        <section className="atelier-note" id="about">
          <div className="atelier-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1100&q=85"
              alt="Perfume and botanical ingredients arranged on a studio table"
              loading="lazy"
            />
            <span className="image-index">ATELIER NOTES / 014</span>
          </div>
          <div className="atelier-copy">
            <p className="eyebrow">A little less, a little better</p>
            <h2>We believe scent<br />should <em>mean something.</em></h2>
            <p>We bring together much-loved designer houses, expressive Middle Eastern perfumery and our own signature blend, so finding your next favourite feels personal.</p>
            <p>Explore familiar icons or discover something unexpected, all in one carefully chosen collection.</p>
            <a className="text-link" href="#contact">Get to know our atelier <span aria-hidden="true">→</span></a>
            <div className="atelier-stamp" aria-hidden="true">L<span>A</span>S</div>
          </div>
        </section>

        <section className="closing-note" id="contact">
          <p className="eyebrow">A note from the atelier</p>
          <h2>Good things take<br /><em>their own time.</em></h2>
          <a className="button button-outline" href="mailto:bonjour@latelierscent.com">Write to us <span aria-hidden="true">↗</span></a>
          <span className="closing-decoration" aria-hidden="true">L' · S</span>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="#home" className="wordmark">L'Atelier <span>Scent</span></a>
            <p>Fragrance for the<br />beautifully individual.</p>
          </div>
          <div className="footer-column"><p className="footer-label">Explore</p><a href="#shop">Shop all</a><a href="#about">Our story</a><a href="#contact">Contact</a></div>
          <div className="footer-column"><p className="footer-label">A little help</p><a href="#contact">Delivery & returns</a><a href="#contact">Fragrance care</a><a href="#contact">FAQs</a></div>
          <div className="footer-column"><p className="footer-label">Find us elsewhere</p><a href="#social">Instagram ↗</a><a href="#social">Pinterest ↗</a><a href="#social">TikTok ↗</a></div>
        </div>
        <div className="footer-bottom" id="social"><span>© 2025 L'Atelier Scent</span><span>Curated for fragrance lovers in Nigeria</span><a href="#home">Back to top ↑</a></div>
      </footer>

      <CartDrawer
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onContinueShopping={() => setIsCartOpen(false)}
        onChangeQuantity={changeQuantity}
        onRemove={removeFromCart}
      />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </>
  )
}

export default App