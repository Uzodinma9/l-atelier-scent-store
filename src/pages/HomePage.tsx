import { ArrowDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ProductBottle } from '../components/ProductBottle'
import type { Product } from '../types'
import { products } from '../data/products'

type HomePageProps = {
  onAddToCart: (product: Product) => void
  wishlistIds: string[]
  onToggleWishlist: (productId: string) => void
}

export function HomePage({ onAddToCart, wishlistIds, onToggleWishlist }: HomePageProps) {
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4)

  return (
    <main>
      <section className="luxe-hero" id="home">
        <div className="luxe-hero-image"><ProductBottle product={products[0]} /></div>
        <div className="luxe-hero-content">
          <p className="eyebrow">L'Atelier Scent · Fragrance house</p>
          <h1>Wear what<br />moves <em>you.</em></h1>
          <p>Considered fragrances from the houses you love, and a signature scent of our own.</p>
          <Link className="lux-button lux-button-light" to="/shop">Discover the collection <ArrowRight size={15} /></Link>
          <span className="hero-caption">A fragrance edit, thoughtfully gathered</span>
        </div>
        <Link className="hero-scroll" to="/shop" aria-label="Scroll to collection"><ArrowDown size={15} /> Explore</Link>
      </section>

      <section className="house-strip" aria-label="Featured fragrance houses">
        <span>VERSACE</span><span>TOM FORD</span><span>DIOR</span><span>LATTAFA</span><span>L'ATELIER SCENT</span>
      </section>

      <section className="editorial-intro" id="about">
        <p className="eyebrow">The art of finding your scent</p>
        <h2>Some things are remembered<br />before they're <em>seen.</em></h2>
        <p>From the unmistakable to the unexpected, find a fragrance that feels entirely your own.</p>
        <Link className="inline-link" to="/shop">Shop all fragrances <ArrowRight size={14} /></Link>
      </section>

      <section className="featured-section section-shell">
        <div className="section-heading">
          <div><p className="eyebrow">A few we love</p><h2>In good <em>company.</em></h2></div>
          <Link className="inline-link" to="/shop">View the full collection <ArrowRight size={14} /></Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAddToCart}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>

      <section className="signature-feature" id="signature">
        <div className="signature-image"><ProductBottle product={products[products.length - 1]} /></div>
        <div className="signature-copy">
          <p className="eyebrow">The L'Atelier signature</p>
          <h2>Close to skin.<br /><em>Impossible to forget.</em></h2>
          <p>Signature No. 01 brings amber, iris and soft woods together in a quietly distinctive composition.</p>
          <Link className="lux-button lux-button-dark" to="/products/latelier-signature-01">Discover Signature No. 01 <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="closing-note" id="contact">
        <p className="eyebrow">A note from the atelier</p>
        <h2>Good things take<br /><em>their own time.</em></h2>
        <a className="inline-link" href="mailto:bonjour@latelierscent.com">Write to the atelier <ArrowRight size={14} /></a>
      </section>
    </main>
  )
}