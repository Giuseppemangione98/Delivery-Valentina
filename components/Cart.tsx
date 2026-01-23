
import React from 'react';
import { CartItem } from '../types';
import { X, ShoppingBag, Plus, Minus, Trash2, Heart, Gift } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ items, isOpen, onClose, onUpdateQuantity, onRemove, onCheckout }) => {
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-950 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-white/5">
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-rose-600 p-3 rounded-2xl shadow-lg shadow-rose-600/20">
               <Gift className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-white">I tuoi Desideri ❤️</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-rose-500">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-6">
              <Heart size={100} strokeWidth={1} className="opacity-10 animate-pulse text-rose-500 fill-rose-500" />
              <div className="text-center space-y-2">
                <p className="font-black text-sm uppercase tracking-[0.3em] text-rose-300 opacity-40">Nessuna richiesta fatta...</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-5 bg-white/5 p-5 rounded-[2.5rem] border border-white/5 items-center">
                <div className="relative">
                  <img src={item.image} className="w-20 h-20 rounded-[2rem] object-cover border border-white/10" alt="" />
                  <div className="absolute -top-2 -right-2 bg-rose-600 text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-950">
                    {item.emoji}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-sm uppercase tracking-tight text-white">{item.name}</h4>
                    <button onClick={() => onRemove(item.id)} className="text-rose-900 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-rose-400 font-black text-xs uppercase tracking-widest">{item.price * item.quantity} Favori</span>
                    <div className="flex items-center gap-4 bg-zinc-950 border border-white/5 rounded-2xl p-1.5 px-3">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-white/5 rounded-lg text-rose-500">
                        <Minus size={14} strokeWidth={4} />
                      </button>
                      <span className="text-sm font-black min-w-[1.2rem] text-center text-white">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-white/5 rounded-lg text-rose-500">
                        <Plus size={14} strokeWidth={4} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-white/5 space-y-8 bg-zinc-950">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-rose-300/40 uppercase tracking-[0.3em] mb-2">Totale Promessa</p>
                <span className="text-4xl font-black text-white tracking-tighter">{total} Favori ❤️</span>
              </div>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-rose-600 hover:bg-rose-500 py-6 rounded-[3rem] font-black text-lg shadow-[0_20px_40px_rgba(225,29,72,0.3)] active:scale-95 transition-all text-white border border-white/20 uppercase tracking-widest"
            >
              Invio con Amore 💌
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
