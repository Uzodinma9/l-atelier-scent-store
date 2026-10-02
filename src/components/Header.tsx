import { useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

type HeaderProps = {
  cartCount: number
  wishlistCount: number
  onAccount: () => void
  onCart: () => void
  onWishlist: () => void
}

export function Header({ cartCount, wishlistCount, onAccount, onCart, onWishlist }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(`/shop${searchValue.trim() ? `?search=${encodeURIComponent(searchValue.trim())}` : ''}`)
    setIsSearchOpen(false)
    setIsMenuOpen(false)
  }

  return (
    <header className="lux-header">
      <button
        className="lux-menu-toggle"
        type="button"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
      <Link className="lux-wordmark" to="/" aria-label="L'Atelier Scent home">L'Atelier <span>Scent</span></Link>
      <nav className={isMenuOpen ? 'lux-nav is-open' : 'lux-nav'} aria-label="Main navigation">
        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
        <Link to="/#about" onClick={() => setIsMenuOpen(false)}>About</Link>
        <Link to="/#contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
      </nav>
      <div className="lux-header-actions">
        <button className="lux-icon-button" type="button" title="Search" aria-label="Search" aria-expanded={isSearchOpen} onClick={() => setIsSearchOpen((open) => !open)}><Search size={18} /></button>
        <button className="lux-icon-button account-action" type="button" title="Account" aria-label="Account, log in or sign up" onClick={onAccount}><UserRound size={18} /></button>
        <button className="lux-icon-button has-count" type="button" title="Wishlist" aria-label={`Open wishlist, ${wishlistCount} saved`} onClick={onWishlist}><Heart size={18} />{wishlistCount > 0 && <span className="header-count">{wishlistCount}</span>}</button>
        <button className="lux-icon-button has-count" type="button" title="Cart" aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`} onClick={onCart}><ShoppingBag size={18} />{cartCount > 0 && <span className="header-count">{cartCount}</span>}</button>
      </div>
      {isSearchOpen && (
        <form className="header-search-panel" onSubmit={submitSearch}>
          <Search size={16} />
          <input autoFocus value={searchValue} onChange={(event) => setSearchValue(event.target.value)} aria-label="Search fragrances" placeholder="Search a fragrance or house" />
          <button type="submit">Search</button>
          <button className="search-close" type="button" aria-label="Close search" onClick={() => setIsSearchOpen(false)}><X size={17} /></button>
        </form>
      )}
      {isMenuOpen && <button className="mobile-nav-account" type="button" onClick={() => { setIsMenuOpen(false); onAccount() }}>Account · Log in / Sign up</button>}
    </header>
  )
}