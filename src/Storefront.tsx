import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AccountModal } from './components/AccountModal'
import { CartDrawer } from './components/CartDrawer'
import { Header } from './components/Header'
import { SiteFooter } from './components/SiteFooter'
import { WishlistDrawer } from './components/WishlistDrawer'
import { HomePage } from './pages/HomePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ShopPage } from './pages/ShopPage'
import { useStore } from './store/useStore'
import type { Product } from './types'

export function Storefront() {
  const { products, productsLoading, productsError, refreshProducts, cartItems, cartCount, addToCart, changeQuantity, removeFromCart, clearCart, wishlistIds, toggleWishlist } = useStore()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  const addProduct = (product: Product, quantity = 1) => addToCart(product, quantity)
  const wishlistProducts = wishlistIds.flatMap((id) => {
    const product = products.find((item) => item.id === id)
    return product ? [product] : []
  })

  return (
    <>
      <div className="lux-announcement">A considered fragrance edit <span>·</span> All prices in Nigerian naira</div>
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        onAccount={() => setIsAccountOpen(true)}
        onCart={() => setIsCartOpen(true)}
        onWishlist={() => setIsWishlistOpen(true)}
      />
      <Routes>
        <Route path="/" element={<HomePage products={products} productsLoading={productsLoading} productsError={productsError} onRetry={refreshProducts} onAddToCart={addProduct} wishlistIds={wishlistIds} onToggleWishlist={toggleWishlist} />} />
        <Route path="/shop" element={<ShopPage products={products} productsLoading={productsLoading} productsError={productsError} onRetry={refreshProducts} onAddToCart={addProduct} wishlistIds={wishlistIds} onToggleWishlist={toggleWishlist} />} />
        <Route path="/products/:productId" element={<ProductDetailPage products={products} productsLoading={productsLoading} productsError={productsError} onRetry={refreshProducts} onAddToCart={addProduct} wishlistIds={wishlistIds} onToggleWishlist={toggleWishlist} />} />
        <Route path="*" element={<main className="not-found"><p className="eyebrow">Not found</p><h1>This fragrance is elsewhere.</h1><Link className="lux-button lux-button-dark" to="/shop">Return to the collection</Link></main>} />
      </Routes>
      <SiteFooter />
      <CartDrawer
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onContinueShopping={() => setIsCartOpen(false)}
        onChangeQuantity={changeQuantity}
        onRemove={removeFromCart}
        onClearCart={clearCart}
      />
      <WishlistDrawer
        items={wishlistProducts}
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onToggleWishlist={toggleWishlist}
        onAddToCart={(product) => { addProduct(product); setIsWishlistOpen(false); setIsCartOpen(true) }}
      />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </>
  )
}