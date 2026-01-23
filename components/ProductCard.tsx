
import React from 'react';
import { Product } from '../types';
import { Plus, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden p-4 transition-all active:scale-95 group relative hover:border-rose-500/50">
      <div className="h-40 w-full rounded-[2.5rem] overflow-hidden relative mb-4 bg-zinc-800">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
        />
        <div className="absolute top-3 right-3 bg-rose-600/90 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border border-white/20">
          {product.emoji}
        </div>
      </div>
      <div className="px-2 flex flex-col h-[75px] justify-between">
        <div>
          <h3 className="text-[13px] font-black text-white leading-tight line-clamp-1 uppercase tracking-tight">{product.name}</h3>
          <p className="text-[11px] font-black text-rose-400 mt-1 uppercase tracking-widest flex items-center gap-1">
            {product.price === 0 ? 'REGALO ❤️' : `${product.price} ${product.price === 1 ? 'Favore' : 'Favori'}`}
          </p>
        </div>
        <button 
          onClick={() => onAddToCart(product)}
          className="absolute bottom-5 right-5 bg-rose-600 text-white p-3 rounded-2xl shadow-[0_10px_20px_rgba(225,29,72,0.3)] hover:scale-110 active:scale-90 transition-transform flex items-center justify-center"
        >
          <Heart size={20} className="fill-white" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
