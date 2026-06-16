import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, Search, LogOut, Home, Store, Gem, CircleDot, Crown, Sparkles, Diamond } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useProducts } from '../../context/ProductContext';
import { getCategoryLabel } from '../../utils/categoryLabels';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { searchProducts } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchInput = (value) => {
    setSearchQuery(value);
    if (value.trim().length > 0) {
      const results = searchProducts(value).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const currentCategory = new URLSearchParams(location.search).get('category');
  const navItems = [
    { to: '/', label: 'Home', icon: Home, isActive: location.pathname === '/' },
    { to: '/products', label: 'Shop', icon: Store, isActive: location.pathname === '/products' && !currentCategory },
    { to: '/products?category=Gold', label: getCategoryLabel('Gold'), icon: Gem, isActive: location.pathname === '/products' && currentCategory === 'Gold' },
    { to: '/products?category=Silver', label: getCategoryLabel('Silver'), icon: CircleDot, isActive: location.pathname === '/products' && currentCategory === 'Silver' },
    { to: '/products?category=Lux Wear', label: getCategoryLabel('Lux Wear'), icon: Crown, isActive: location.pathname === '/products' && currentCategory === 'Lux Wear' },
    { to: '/category/elegant-spark', label: getCategoryLabel('Elegant Spark'), icon: Sparkles, isActive: location.pathname === '/category/elegant-spark' },
    { to: '/products?category=Piercings', label: getCategoryLabel('Piercings'), icon: Diamond, isActive: location.pathname === '/products' && currentCategory === 'Piercings' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center md:gap-2">
            <img src="/favicon.svg" alt="Panstellia" className="hidden md:flex h-16 w-auto" />
            <span className="font-serif text-xl md:text-2xl font-bold text-luxury-800">Panstellia</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {navItems.map(({ to, label, icon: Icon, isActive }) => (
              <Link
                key={to}
                to={to}
                onClick={closeSearch}
                className={`nav-glow-link ${isActive ? 'nav-glow-link--active' : ''}`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="relative z-10 w-5 h-5" />
                {isActive && <span className="nav-active-label">{label}</span>}
                {!isActive && <span className="nav-tooltip">{label}</span>}
              </Link>
            ))}
          </div>

          {/* Search & Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full text-luxury-600 hover:text-gold-600 transition-colors"
              style={{ background: 'rgba(245, 187, 71, 0.12)' }}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" onClick={closeSearch} className="p-2 rounded-full text-luxury-600 hover:text-gold-600 transition-colors relative" style={{ background: 'rgba(245, 187, 71, 0.12)' }}>
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" onClick={closeSearch} className="p-2 rounded-full text-luxury-600 hover:text-gold-600 transition-colors relative" style={{ background: 'rgba(245, 187, 71, 0.12)' }}>
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="p-2 rounded-full text-luxury-600 hover:text-gold-600 transition-colors" style={{ background: 'rgba(245, 187, 71, 0.12)' }}>
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <p className="px-4 py-2 text-sm text-luxury-600 border-b">
                      {user.email}
                    </p>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-luxury-700 hover:bg-luxury-50">
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-luxury-700 hover:bg-luxury-50">
                        Admin Panel
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" onClick={closeSearch} className="p-2 rounded-full text-luxury-600 hover:text-gold-600 transition-colors" style={{ background: 'rgba(245, 187, 71, 0.12)' }}>
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => {
                closeSearch();
                setIsOpen(!isOpen);
              }}
              className="md:hidden p-2 rounded-full text-luxury-600"
              style={{ background: 'rgba(245, 187, 71, 0.12)' }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Dropdown */}
      {searchOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white shadow-lg p-4 animate-slide-down">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search necklaces..."
                className="w-full px-4 py-3 border border-luxury-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <button type="submit" className="absolute right-2 top-2 bg-gold-500 text-white px-4 py-1 rounded-md">
                Search
              </button>
            </div>
          </form>
          {searchResults.length > 0 && (
            <div className="max-w-2xl mx-auto mt-2">
              {searchResults.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-4 p-2 hover:bg-luxury-50 rounded-lg"
                >
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <p className="font-medium text-luxury-800">{product.name}</p>
                    <p className="text-sm text-gold-600">₹{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gold-100/80 bg-white/95 shadow-lg backdrop-blur animate-slide-up">
          <div className="grid grid-cols-2 gap-2 px-4 py-4">
            {navItems.map(({ to, label, icon: Icon, isActive }) => (
              <Link
                key={to}
                to={to}
                className={`mobile-nav-glow-link ${isActive ? 'mobile-nav-glow-link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  closeSearch();
                  setIsOpen(false);
                }}
              >
                <Icon className="relative z-10 h-5 w-5 flex-shrink-0" />
                <span className="relative z-10 truncate">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
