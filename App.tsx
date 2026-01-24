
import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './constants.tsx';
import { CartItem, Product, OrderStatus, Category, Location, OrderHistoryItem } from './types';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import { Heart, ArrowLeft, CheckCircle2, ShoppingBag, Utensils, Sparkles, Car, Heart as HeartIcon, Gift, Clock, Star, Sparkle, ChevronRight, History, Wallet, Loader2 } from 'lucide-react';

type AppView = 'splash' | 'selection' | 'home' | 'tracking' | 'history';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('splash');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.RECEIVED);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Tutti'>('Tutti');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // New state for persistent history
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);

  const loadingMessages = [
    "Confezionando i tuoi desideri con amore...",
    "Avvisando Giuseppe del tuo ordine speciale...",
    "Preparando il corriere del cuore...",
    "Quasi pronto, Valentina! ❤️"
  ];

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('valentina_order_history');
    if (savedHistory) {
      try {
        setOrderHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geo denied")
      );
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('valentina_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleCheckout = async () => {
    setIsCartOpen(false);
    setIsProcessing(true);
    
    // URL del tuo database Google
    const API_URL = "https://script.google.com/macros/s/AKfycbxUNiIGJckV4Y6edK-hikVPMx8kEgySjT3az-apjwP1uy-VlHZMr_XZ6p_vxPhm9A5j/exec";

    // Gestione messaggi di caricamento originali
    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[msgIndex]);
      }
    }, 1000);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const orderId = `VALE-${Date.now()}`;

    // Prepariamo i dati per Giuseppe
    const orderData = {
      id: orderId,
      message: "Nuova richiesta speciale! ❤️", 
      items: cart.map(item => ({
        name: item.name,
        emoji: item.emoji,
        quantity: item.quantity
      })),
      total: total
    };

    try {
      // INVIO AL DATABASE (In background)
      fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      // Manteniamo l'animazione originale di 3.5 secondi prima di cambiare vista
      setTimeout(() => {
        clearInterval(interval);
        const newOrder: OrderHistoryItem = {
          id: orderId,
          date: new Date().toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          items: [...cart],
          totalFavors: total
        };

        setOrderHistory(prev => [newOrder, ...prev]);
        setLastOrder([...cart]);
        setView('tracking');
        setOrderStatus(OrderStatus.RECEIVED);
        setCart([]);
        setIsProcessing(false);
      }, 3500);

    } catch (error) {
      console.error(error);
      clearInterval(interval);
      setIsProcessing(false);
    }
  };
  const filteredProducts = PRODUCTS.filter(product => 
    selectedCategory === 'Tutti' || product.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 pb-32">
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-3xl px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (view === 'history' || view === 'tracking') setView('home');
              else setView('selection');
            }}
            className="bg-white/5 p-3 rounded-2xl border border-white/10 active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} className="text-rose-400" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white">Giuseppe ❤️ Vale</h1>
            <p className="text-[8px] text-rose-500 font-bold uppercase tracking-[0.2em]">Valentina's Delivery</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('history')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border active:scale-90 transition-all ${view === 'history' ? 'bg-rose-600 border-white/20' : 'bg-white/5 border-white/10'}`}
          >
            <History size={20} className={view === 'history' ? 'text-white' : 'text-rose-400'} />
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-white/5 w-12 h-12 rounded-2xl flex items-center justify-center relative border border-white/10 active:scale-90 transition-transform"
          >
            <ShoppingBag size={22} className="text-rose-500" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-950">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </nav>

      {view === 'home' && (
        <main className="animate-in fade-in slide-in-from-bottom-2 duration-700 relative z-10">
          <section className="px-6 mb-8 pt-10 overflow-visible">
            <h2 className="text-[10px] font-black text-rose-300/40 uppercase tracking-[0.3em] mb-6 ml-1">Filtra per Amore</h2>
            <div className="flex gap-6 overflow-x-auto pb-10 pt-2 px-2 -mx-2 no-scrollbar scroll-smooth">
              {['Tutti', ...categories].map((cat) => {
                const isActive = selectedCategory === cat;
                const meta = categoryMeta[cat] || { emoji: '✨', color: 'bg-zinc-800' };
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className="flex flex-col items-center gap-3 shrink-0 transition-transform active:scale-90"
                  >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-500 border-2 ${
                      isActive 
                        ? `${meta.color} border-white shadow-[0_0_20px_rgba(225,29,72,0.5)] scale-110` 
                        : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'
                    }`}>
                      {meta.emoji}
                    </div>
                    <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${isActive ? 'text-white' : 'text-zinc-600'}`}>{cat}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="px-6 grid grid-cols-2 gap-5">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))}
          </div>
        </main>
      )}

      {view === 'history' && (
        <main className="px-6 pt-10 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-4">
             <div className="relative inline-block">
                <div className="bg-zinc-900 p-8 rounded-[3rem] border border-white/10 shadow-2xl relative z-10">
                   <Wallet className="text-rose-500 w-10 h-10" />
                </div>
                <div className="absolute -inset-2 bg-rose-500/10 rounded-[3.5rem] blur-xl" />
             </div>
             <div>
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Spesa d'Amore ❤️</h2>
               <p className="text-rose-300/40 font-bold uppercase tracking-[0.2em] text-[10px]">Quanto hai accumulato finora</p>
             </div>
          </div>

          <section className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.3em] mb-2">Totale Favori Spesi</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">{totalAccumulatedFavors}</span>
                <span className="text-xl font-black text-white/80 tracking-tight uppercase">Favori ❤️</span>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                 <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-relaxed">
                   Giuseppe è felice di servirti ogni volta. Questi "debiti" sono solo giornate da passare con me!
                 </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] ml-2">Storico delle richieste</h3>
            <div className="space-y-4">
              {orderHistory.length === 0 ? (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center">
                  <Heart size={40} className="mx-auto text-zinc-800 mb-4" />
                  <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Ancora nessuna spesa... sei troppo buona! 😇</p>
                </div>
              ) : (
                orderHistory.map((order) => (
                  <div key={order.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{order.date}</span>
                       <span className="text-sm font-black text-white">{order.totalFavors} F.</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map(item => (
                        <div key={item.id} className="bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2">
                           <span className="text-xs">{item.emoji}</span>
                           <span className="text-[9px] font-black text-white/60 uppercase">{item.quantity}x {item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <LoveQuote />
          <div className="pb-10" />
        </main>
      )}

      {view === 'tracking' && (
        <main className="px-6 pt-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className="bg-rose-600 p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(225,29,72,0.5)] relative z-10">
                  <CheckCircle2 className="text-white w-12 h-12" />
               </div>
               <div className="absolute -inset-4 bg-rose-500/20 rounded-[3.5rem] animate-ping duration-[4000ms]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Promessa Inviata! ❤️</h2>
              <p className="text-rose-300 font-bold uppercase tracking-[0.2em] text-[10px]">Giuseppe ha accettato i tuoi desideri</p>
            </div>
          </div>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Riepilogo</h3>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-6">
              <div className="space-y-5">
                {lastOrder.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border border-white/10 relative">
                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                        <span className="absolute inset-0 flex items-center justify-center text-xl">{item.emoji}</span>
                      </div>
                      <div>
                        <p className="font-black text-sm text-white uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.quantity}x • {item.price === 0 ? 'Gratis' : `${item.price} F.`}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <LoveQuote />

          <div className="pt-8 pb-16 px-4">
            <button 
              onClick={() => setView('home')}
              className="w-full py-6 rounded-full bg-white text-zinc-950 text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
            >
              <Sparkles size={16} /> Altri desideri
            </button>
          </div>
        </main>
      )}

      <Cart 
        isOpen={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={(id) => updateQuantity(id, -1000)}
        onCheckout={handleCheckout}
      />

      {cart.length > 0 && view === 'home' && !isCartOpen && (
        <div className="fixed bottom-10 left-0 right-0 px-6 z-40 animate-in slide-in-from-bottom-8">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-rose-600 text-white py-6 rounded-[3rem] font-black shadow-[0_20px_50px_rgba(225,29,72,0.4)] flex items-center justify-between px-10 border border-white/20"
          >
            <div className="flex items-center gap-4">
               <span className="bg-white text-rose-600 w-7 h-7 rounded-full text-[11px] flex items-center justify-center font-black">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
              <span className="tracking-tight uppercase text-sm">Vedi Scelte</span>
            </div>
            <span className="text-xl font-black">{cart.reduce((a, b) => a + (b.price * b.quantity), 0)} F. ❤️</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
