import { AtSign } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="lux-footer">
      <div className="lux-footer-main">
        <div className="lux-footer-brand"><Link to="/" className="wordmark">L'Atelier <span>Scent</span></Link><p>Fragrance, for your own reasons.</p></div>
        <div className="lux-footer-column"><span>Discover</span><Link to="/shop">Shop all</Link><Link to="/shop?category=Designer">Designer houses</Link><Link to="/shop?category=Arabic">Arabic fragrance</Link></div>
        <div className="lux-footer-column"><span>Atelier</span><Link to="/#about">Our story</Link><a href="mailto:bonjour@latelierscent.com">Contact</a><a href="mailto:bonjour@latelierscent.com">Delivery & care</a></div>
        <a className="social-link" href="https://instagram.com" aria-label="Instagram"><AtSign size={17} /> Instagram</a>
      </div>
      <div className="lux-footer-bottom"><span>© 2026 L'Atelier Scent</span><span>Curated for fragrance lovers in Nigeria</span><span>All prices in NGN</span></div>
    </footer>
  )
}