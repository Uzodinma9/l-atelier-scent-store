import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import type { Product, ProductCategory } from '../types'

type ShopPageProps = {
  products: Product[]
  productsLoading: boolean
  productsError: string | null
  onRetry: () => void
  onAddToCart: (product: Product) => void
  wishlistIds: string[]
  onToggleWishlist: (productId: string) => void
}

const categories: Array<'All' | ProductCategory> = ['All', 'Designer', 'Niche', 'Arabic', 'Signature']

export function ShopPage({ products, productsLoading, productsError, onRetry, onAddToCart, wishlistIds, onToggleWishlist }: ShopPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = categories.find((category) => category === searchParams.get('category')) ?? 'All'
  const [category, setCategory] = useState<'All' | ProductCategory>(initialCategory)
  const [brand, setBrand] = useState('All houses')
  const [sort, setSort] = useState('featured')
  const search = searchParams.get('search') ?? ''
  const brands = ['All houses', ...new Set(products.map((product) => product.brand).sort((a, b) => a.localeCompare(b)))]

  const filteredProducts = products
    .filter((product) => category === 'All' || product.category === category)
    .filter((product) => brand === 'All houses' || product.brand === brand)
    .filter((product) => `${product.brand} ${product.name} ${product.family} ${product.fragranceNotes.join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((first, second) => {
      if (sort === 'price-ascending') return first.price - second.price
      if (sort === 'price-descending') return second.price - first.price
      if (sort === 'name') return first.name.localeCompare(second.name)
      return Number(second.featured) - Number(first.featured)
    })

  const updateSearch = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('search', value)
    else next.delete('search')
    setSearchParams(next, { replace: true })
  }

  return (
    <main className="shop-page section-shell" id="shop">
      <div className="shop-page-heading">
        <p className="eyebrow">The fragrance collection</p>
        <h1>Find your <em>fragrance.</em></h1>
        <p>{productsLoading ? 'Loading the fragrance collection.' : `${products.length} considered fragrances from the L'Atelier collection.`}</p>
      </div>
      <div className="shop-toolbar">
        <label className="shop-search"><Search size={16} /><input type="search" value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search fragrances or houses" aria-label="Search fragrances or houses" /></label>
        <label className="select-control"><span>Collection</span><select value={category} onChange={(event) => setCategory(event.target.value as 'All' | ProductCategory)}>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="select-control"><span>House</span><select value={brand} onChange={(event) => setBrand(event.target.value)}>{brands.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="select-control sort-control"><SlidersHorizontal size={14} /><select value={sort} aria-label="Sort products" onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-ascending">Price: low to high</option><option value="price-descending">Price: high to low</option><option value="name">Name: A to Z</option></select></label>
      </div>
      <div className="shop-result-line"><span>{filteredProducts.length} fragrances</span><span>All prices in Nigerian naira</span></div>
      {productsLoading ? (
        <p className="catalog-feedback" role="status">Loading fragrances…</p>
      ) : productsError ? (
        <div className="shop-empty catalog-feedback-error" role="alert"><p>{productsError}</p><button type="button" onClick={onRetry}>Try again</button></div>
      ) : filteredProducts.length ? (
        <div className="product-grid shop-product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAddToCart}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="shop-empty"><p>No fragrances found.</p><button type="button" onClick={() => { setCategory('All'); setBrand('All houses'); updateSearch('') }}>Clear filters</button></div>
      )}
    </main>
  )
}