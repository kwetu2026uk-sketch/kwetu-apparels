import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCart } from '@/lib/cartContext';
import { priceLabel, ORIGIN_BADGE, isComingSoon } from '@/lib/format';
import { totalStock } from '@/lib/stock';
import Swatch from '@/components/Swatch';
import ProductCard from '@/components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const p = await base44.entities.Product.get(id);
        setProduct(p);
        const variants = p.variants || [];
        if (variants.length) {
          const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
          const colours = [...new Set(variants.map((v) => v.colour).filter(Boolean))];
          if (sizes.length) setSelectedSize(sizes[0]);
          if (colours.length) setSelectedColour(colours[0]);
        } else if (p.sizes?.length) {
          setSelectedSize(p.sizes[0]);
        }
        const all = await base44.entities.Product.list('-created_date', 100);
        setRelated(all.filter((x) => x.category_id === p.category_id && x.id !== p.id).slice(0, 4));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) {
    return <div className="container-academic py-20"><div className="grid md:grid-cols-2 gap-10"><div className="aspect-square bg-muted animate-pulse" /><div className="space-y-4"><div className="h-8 bg-muted animate-pulse w-3/4" /><div className="h-6 bg-muted animate-pulse w-1/2" /><div className="h-32 bg-muted animate-pulse" /></div></div></div>;
  }

  if (!product) {
    return (
      <div className="container-academic py-20 text-center">
        <p className="text-muted-foreground mb-4">Product not found.</p>
        <Link to="/catalog" className="btn-outline">Back to Catalog</Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const sizes = hasVariants ? [...new Set(variants.map((v) => v.size).filter(Boolean))] : (product.sizes || []);
  const colours = hasVariants ? [...new Set(variants.map((v) => v.colour).filter(Boolean))] : (product.colours || []);

  const activeVariant = hasVariants
    ? variants.find((v) => v.size === selectedSize && (!colours.length || v.colour === selectedColour)) || variants.find((v) => v.size === selectedSize) || null
    : null;

  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const stock = activeVariant ? Number(activeVariant.stock || 0) : totalStock(product);
  const comingSoon = isComingSoon(displayPrice) || (activeVariant ? false : product.coming_soon);
  const origin = ORIGIN_BADGE[product.origin] || ORIGIN_BADGE.local;
  const images = product.images?.length ? product.images : [];

  const handleAdd = () => {
    if (comingSoon || stock <= 0) return;
    if (hasVariants && activeVariant) {
      addItem(product, activeVariant, quantity);
    } else {
      addItem(product, { size: selectedSize, price: product.price, stock, label: selectedSize }, quantity);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <div className="container-academic py-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-accent">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="container-academic pb-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="flex flex-col md:flex-row gap-4">
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-visible">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 shrink-0 overflow-hidden border-2 ${activeImage === i ? 'border-accent' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 order-1 md:order-2 aspect-square bg-secondary overflow-hidden">
              {images[activeImage] ? <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image available</div>}
            </div>
          </div>

          <div className="md:pt-4">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">{[product.category_name, product.subtype].filter(Boolean).join(' · ')}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-[10px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: origin.color }} />{origin.label}
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mb-5">{comingSoon ? 'Price on Request' : priceLabel(displayPrice)}</p>

            <div className="flex items-center gap-2 mb-6 stitched-b pb-5">
              <span className={`w-2.5 h-2.5 rounded-full ${stock > 0 ? 'pulse-dot' : ''}`} style={{ backgroundColor: stock <= 0 ? '#94918B' : stock <= 5 ? '#C58F21' : '#3A8A4A' }} />
              <span className="text-sm font-medium text-foreground">{stock <= 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock'}</span>
              {stock > 0 && stock <= 10 && <span className="text-xs text-muted-foreground">· Only {stock} left</span>}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description || 'Quality school uniform essential, crafted for durability and comfort.'}</p>

            {colours.length > 0 && (
              <div className="mb-6">
                <p className="label-field">Colour</p>
                <div className="flex flex-wrap gap-2">
                  {colours.map((c) => (
                    <button key={c} onClick={() => setSelectedColour(c)} className={`inline-flex items-center gap-2 px-3 py-2 text-sm border transition-all ${selectedColour === c ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-primary'}`}>
                      <Swatch colour={c} size={16} /> {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="label-field">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`min-w-[3rem] px-3 py-2.5 text-sm font-medium border transition-all ${selectedSize === s ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card text-foreground hover:border-primary'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="label-field">Quantity</p>
              <div className="flex items-center border border-input w-fit">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2.5 hover:bg-secondary"><Minus className="w-4 h-4" /></button>
                <span className="px-6 text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))} className="px-4 py-2.5 hover:bg-secondary"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={comingSoon || stock <= 0}
              className={`w-full md:w-auto inline-flex items-center justify-center gap-2 ${comingSoon ? 'bg-secondary text-foreground' : stock <= 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : added ? 'bg-[#3A8A4A] text-white' : 'btn-primary'}`}
            >
              {comingSoon ? 'Enquire in store' : stock <= 0 ? 'Out of Stock' : added ? <><Check className="w-4 h-4" /> Added to Cart</> : <><ShoppingBag className="w-4 h-4" /> Add to Cart</>}
            </button>

            <div className="mt-8 grid grid-cols-3 gap-4 stitched-t pt-6">
              <div className="text-center"><p className="text-xs uppercase tracking-wider text-accent mb-1">Pickup</p><p className="text-xs text-muted-foreground">Ridgeways Mall</p></div>
              <div className="text-center"><p className="text-xs uppercase tracking-wider text-accent mb-1">Delivery</p><p className="text-xs text-muted-foreground">Within Nairobi</p></div>
              <div className="text-center"><p className="text-xs uppercase tracking-wider text-accent mb-1">Quality</p><p className="text-xs text-muted-foreground">Guaranteed</p></div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-secondary/30 py-14">
          <div className="container-academic">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}