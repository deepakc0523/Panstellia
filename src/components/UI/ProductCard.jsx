import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getProductImageUrls } from '../../utils/imageUtils';
import { getCategoryLabel } from '../../utils/categoryLabels';

const ProductCard = ({ product, priority = false }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart!`, {
        position: 'bottom-right'
      });
    } catch (error) {
      toast.error('Failed to add to cart', {
        position: 'bottom-right'
      });
    }
    setIsAdding(false);
  };

  const handleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist', {
        position: 'bottom-right'
      });
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!', {
        position: 'bottom-right'
      });
    }
  };

const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imageUrls = useMemo(() => getProductImageUrls(product), [product]);
  const imageUrl = imageUrls[activeImageIndex] || imageUrls[0] || '';

  useEffect(() => {
    if (!isHovered || imageUrls.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % imageUrls.length);
    }, 900);

    return () => window.clearInterval(timer);
  }, [isHovered, imageUrls.length]);

  useEffect(() => {
    if (!isHovered || imageUrls.length <= 1) return;

    const nextImage = new Image();
    nextImage.decoding = 'async';
    nextImage.src = imageUrls[(activeImageIndex + 1) % imageUrls.length];
  }, [activeImageIndex, imageUrls, isHovered]);

  useEffect(() => {
    if (activeImageIndex >= imageUrls.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, imageUrls.length]);


  const productStatus = product.productStatus || 'available';

  const statusBadge = (
    <div
      className={`absolute top-3 left-3 badge pointer-events-none ${
        productStatus === 'available'
          ? 'badge-success'
          : productStatus === 'shipped'
            ? 'badge-warning'
            : 'badge-error'
      }`}
    >
      {productStatus}
    </div>
  );

  return (
    <div
      className="block h-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImageIndex(0);
      }}
    >
      <div className="card relative flex h-full flex-col overflow-hidden group transition-transform hover:-translate-y-1">


        {/* Image Container */}
        <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[4/5]">
          {statusBadge}
          <img
            key={imageUrl}
            src={imageUrl}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-500"
          />

          {imageUrls.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2 py-1 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              {imageUrls.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeImageIndex === index ? 'w-5 bg-white' : 'w-1.5 bg-white/55'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Discount Badge */}

          {discount > 0 && (
            <div className="absolute top-3 left-3 badge badge-error pointer-events-none">
              -{discount}%
            </div>
          )}
        </Link>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          type="button"
          className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform duration-200 hover:scale-110 z-10 ${
            wishlisted ? 'text-red-500' : 'text-luxury-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
        
        {/* Quick Add Button */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-300 will-change-transform pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto z-20"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isAdding}
            type="button"
            className="w-full bg-white text-luxury-900 py-2 rounded-lg font-medium flex items-center justify-center hover:bg-gold-50 transition-colors disabled:opacity-50"
          >

            <ShoppingBag className="w-4 h-4 mr-2" />
            {isAdding ? 'Adding...' : 'Quick Add'}
          </button>
        </div>

        {/* Content */}
        <Link to={`/product/${product.id}`} className="flex flex-1 flex-col p-4 hover:opacity-90 transition-opacity">
          {/* Category */}
          <p className="h-4 truncate text-xs text-gold-600 font-medium uppercase tracking-wider">
            {getCategoryLabel(product.category)}
          </p>
          
          {/* Name */}
          <h3 className="mt-1 min-h-[2.75rem] text-luxury-900 font-medium leading-snug line-clamp-2 group-hover:text-gold-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="mt-2 flex h-5 items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.ratings || 0)
                      ? 'fill-gold-400 text-gold-400'
                      : 'fill-luxury-200 text-luxury-200'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-luxury-500">
              ({product.reviews || 0})
            </span>
          </div>
          
          {/* Price */}
          <div className="mt-2 flex h-7 items-center gap-2 overflow-hidden">
            <span className="truncate text-lg font-semibold text-luxury-900">
              ₹{product.price?.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="shrink-0 text-sm text-luxury-400 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-auto flex h-6 items-center gap-2 pt-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
