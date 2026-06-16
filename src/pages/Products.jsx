import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Grid, List } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/UI/ProductCard';
import SEOHelmet from '../utils/seoHelmet';
import { getCategoryLabel, categoryLabelMap } from '../utils/categoryLabels';

const ProductsPage = () => {
  const getCanonicalCategoryKeyFromQuery = (queryCategory) => {
    // The app sometimes receives display labels from the URL query (e.g. category=Piercings)
    // while product.category is stored as the canonical key (e.g. Party Wear).
    if (!queryCategory || queryCategory === 'All') return 'All';

    // If the query already matches a canonical key, use it directly.
    if (Object.prototype.hasOwnProperty.call(categoryLabelMap, queryCategory)) return queryCategory;

    // Otherwise try to reverse-map display label -> canonical key.
    const entry = Object.entries(categoryLabelMap).find(([, displayLabel]) => displayLabel === queryCategory);
    return entry ? entry[0] : queryCategory;
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading } = useProducts();

  const visibleProducts = products.filter((p) => (p.productStatus || 'available') === 'available');

  const [filteredProducts, setFilteredProducts] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';
  const minPriceQuery = searchParams.get('minPrice') || '';
  const maxPriceQuery = searchParams.get('maxPrice') || '';
  const sortByQuery = searchParams.get('sortBy') || 'newest';
  
  const [filters, setFilters] = useState({
    categories: categoryQuery ? categoryQuery.split(',') : [],
    minPrice: minPriceQuery,
    maxPrice: maxPriceQuery,
    sortBy: sortByQuery || 'newest',
    inStockOnly: false
  });

  const categories = ['Gold', 'Silver', 'Lux Wear', 'Party Wear', 'Elegant Spark'];
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' }
  ];

  useEffect(() => {
    setFilters((current) => {
      const nextCategories = categoryQuery ? categoryQuery.split(',') : [];
      const categoriesEqual =
        current.categories.length === nextCategories.length &&
        current.categories.every((c) => nextCategories.includes(c));

      if (
        categoriesEqual &&
        current.minPrice === minPriceQuery &&
        current.maxPrice === maxPriceQuery &&
        current.sortBy === sortByQuery
      ) {
        return current;
      }

      return {
        ...current,
        categories: nextCategories,
        minPrice: minPriceQuery,
        maxPrice: maxPriceQuery,
        sortBy: sortByQuery || 'newest'
      };
    });
  }, [categoryQuery, minPriceQuery, maxPriceQuery, sortByQuery]);

  useEffect(() => {
    let result = visibleProducts;

    // Search Query
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(term) ||
          (p.description || '').toLowerCase().includes(term) ||
          (p.category || '').toLowerCase().includes(term)
      );
    }

    // Category
    if (filters.categories.length > 0) {
      result = result.filter((p) => {
        return filters.categories.some(cat => {
          const canonical = getCanonicalCategoryKeyFromQuery(cat);
          return p.category === canonical || p.category === cat;
        });
      });
    }

    // Price filters
    if (filters.minPrice) {
      result = result.filter((p) => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter((p) => p.price <= Number(filters.maxPrice));
    }

    // Stock Filter
    if (filters.inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Sort
    const sorted = [...result];
    switch (filters.sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      default:
        break;
    }
    result = sorted;

    setFilteredProducts(result);
  }, [products, filters, searchQuery]);

  const handleCategoryToggle = (category) => {
    let updatedCategories;
    if (filters.categories.includes(category)) {
      updatedCategories = filters.categories.filter((c) => c !== category);
    } else {
      updatedCategories = [...filters.categories, category];
    }
    
    setFilters((prev) => ({ ...prev, categories: updatedCategories }));
    
    const newParams = new URLSearchParams(searchParams);
    if (updatedCategories.length > 0) {
      newParams.set('category', updatedCategories.join(','));
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleToggleStock = () => {
    setFilters((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      inStockOnly: false
    });
    setSearchParams({});
  };

  const activeFiltersCount = 
    filters.categories.length + 
    (filters.minPrice ? 1 : 0) + 
    (filters.maxPrice ? 1 : 0) + 
    (filters.inStockOnly ? 1 : 0);

  const renderFilterControls = ({ onClose } = {}) => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-luxury-900">Filters</h2>
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gold-600 hover:text-gold-700"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-luxury-600 transition-colors hover:bg-luxury-100 hover:text-gold-600"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-luxury-700 mb-2">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 rounded text-gold-600 border-luxury-300 focus:ring-gold-500 cursor-pointer"
              />
              <span className="ml-2 text-sm text-luxury-600 hover:text-gold-600 transition-colors">
                {getCategoryLabel(category)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6 border-t border-luxury-100 pt-4">
        <h3 className="text-sm font-medium text-luxury-700 mb-2">Availability</h3>
        <label className="flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={handleToggleStock}
            className="w-4 h-4 rounded text-gold-600 border-luxury-300 focus:ring-gold-500 cursor-pointer"
          />
          <span className="ml-2 text-sm text-luxury-600 hover:text-gold-600 transition-colors">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Price Range */}
      <div className="mb-6 border-t border-luxury-100 pt-4">
        <h3 className="text-sm font-medium text-luxury-700 mb-2">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-luxury-200 rounded-lg text-sm"
          />
          <span className="text-luxury-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-luxury-200 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="border-t border-luxury-100 pt-4">
        <h3 className="text-sm font-medium text-luxury-700 mb-2">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 border border-luxury-200 rounded-lg text-sm bg-white"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="min-h-screen bg-luxury-50 py-8"
    >
      <SEOHelmet 
        title={`${filters.categories.length === 1 ? getCategoryLabel(filters.categories[0]) : 'All'} Necklaces | Panstellia`}
        description={`Browse our ${filters.categories.length > 0 ? filters.categories.map(c => getCategoryLabel(c)).join(', ') : 'complete collection of'} necklace jewelry. Premium quality designs for every occasion.`}
        keywords={`${filters.categories.length > 0 ? filters.categories.map(c => getCategoryLabel(c).toLowerCase()).join(', ') : 'necklaces'}, jewelry, luxury jewelry`}
        canonical={`https://panstellia.com/products${filters.categories.length > 0 ? `?category=${filters.categories.join(',')}` : ''}`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-luxury-900">
            {filters.categories.length === 1 
              ? getCategoryLabel(filters.categories[0]) 
              : filters.categories.length > 1 
                ? 'Filtered Collection' 
                : 'All Products'}
          </h1>
          <p className="mt-2 text-luxury-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              {renderFilterControls()}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center px-4 py-2 bg-white rounded-lg shadow text-luxury-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 w-5 h-5 bg-gold-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-4">
                {/* Mobile Filters - Show on mobile */}
                {showFilters && (
                  <div className="lg:hidden fixed inset-x-4 top-24 z-50 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
                    {renderFilterControls({ onClose: () => setShowFilters(false) })}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={clearFilters}
                        className="btn-secondary px-4 py-2 text-sm"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                <div className="hidden md:flex items-center bg-white rounded-lg shadow">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'text-gold-600' : 'text-luxury-400'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'text-gold-600' : 'text-luxury-400'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters Overlay */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)} />
            )}

            {/* Active Filters Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 items-center">
                <span className="text-xs text-luxury-500 font-medium">Active Filters:</span>
                {filters.categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-1 bg-white border border-luxury-200 text-luxury-700 text-xs px-2.5 py-1 rounded-full shadow-sm animate-fade-in"
                  >
                    <span>{getCategoryLabel(cat)}</span>
                    <button
                      onClick={() => handleCategoryToggle(cat)}
                      className="hover:text-red-500 transition-colors ml-1"
                      aria-label={`Remove category filter ${getCategoryLabel(cat)}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {filters.minPrice && (
                  <div className="flex items-center gap-1 bg-white border border-luxury-200 text-luxury-700 text-xs px-2.5 py-1 rounded-full shadow-sm animate-fade-in">
                    <span>Min: ₹{Number(filters.minPrice).toLocaleString()}</span>
                    <button
                      onClick={() => handleFilterChange('minPrice', '')}
                      className="hover:text-red-500 transition-colors ml-1"
                      aria-label="Remove minimum price filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {filters.maxPrice && (
                  <div className="flex items-center gap-1 bg-white border border-luxury-200 text-luxury-700 text-xs px-2.5 py-1 rounded-full shadow-sm animate-fade-in">
                    <span>Max: ₹{Number(filters.maxPrice).toLocaleString()}</span>
                    <button
                      onClick={() => handleFilterChange('maxPrice', '')}
                      className="hover:text-red-500 transition-colors ml-1"
                      aria-label="Remove maximum price filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {filters.inStockOnly && (
                  <div className="flex items-center gap-1 bg-white border border-luxury-200 text-luxury-700 text-xs px-2.5 py-1 rounded-full shadow-sm animate-fade-in">
                    <span>In Stock Only</span>
                    <button
                      onClick={handleToggleStock}
                      className="hover:text-red-500 transition-colors ml-1"
                      aria-label="Remove in stock filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gold-600 hover:text-gold-700 font-medium ml-2 hover:underline animate-fade-in"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden">
                    <div className="skeleton aspect-[3/4]"></div>
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-4 w-3/4"></div>
                      <div className="skeleton h-4 w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-luxury-600 text-lg">No products found</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid auto-rows-fr items-stretch gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 6} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductsPage;
