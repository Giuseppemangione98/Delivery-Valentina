
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

  // 1. Inizializzazione: Cronologia, PWA e Notifiche
  useEffect(() => {
    // Caricamento Cronologia
    const savedHistory = localStorage.getItem('valentina_order_history');
    if (savedHistory) {
      try {
        setOrderHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    // Registrazione PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker Registrato!'))
        .catch(err => console.log('Errore SW:', err));
    }

    // Richiesta Permessi Notifiche
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []); // Qui si chiude correttamente tutto il blocco di avvio

  // Save history to localStorage whenever it changes
  useEffect(() => {
    // --- SENSORE TRACKING REALE ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (view === 'tracking' && lastOrder.length > 0) {
      interval = setInterval(async () => {
        try {
          const API_URL = "https://script.google.com/macros/s/AKfycbxUNiIGJckV4Y6edK-hikVPMx8kEgySjT3az-apjwP1uy-VlHZMr_XZ6p_vxPhm9A5j/exec";
          // Chiediamo al database lo stato di questo specifico ordine
          const response = await fetch(`${API_URL}?orderId=${lastOrder[0].id}`);
          const data = await response.json();
          
          if (data.status) {
            setOrderStatus(data.status as OrderStatus);
          }
        } catch (e) {
          console.log("In attesa di aggiornamenti da Giuseppe...");
        }
      }, 5000); // Controlla ogni 5 secondi
    }

    return () => clearInterval(interval);
  }, [view, lastOrder]);
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsProcessing(true);
    // --- AGGIUNGI DA QUI ---
    const API_URL = "https://script.google.com/macros/s/AKfycbxUNiIGJckV4Y6edK-hikVPMx8kEgySjT3az-apjwP1uy-VlHZMr_XZ6p_vxPhm9A5j/exec";
    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        id: `VALE-${Date.now()}`,
        items: cart.map(i => ({ name: i.name, emoji: i.emoji, quantity: i.quantity })),
        total: cart.reduce((acc, i) => acc + (i.price * i.quantity), 0)
      })
    });
    // --- A QUI ---
    // Cycle through loading messages
    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[msgIndex]);
      }
    }, 1000);

    // After 3 seconds, complete the order
    setTimeout(() => {
      clearInterval(interval);
      const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const newOrder: OrderHistoryItem = {
        id: `VALE-${Date.now()}`,
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
  };

  const totalAccumulatedFavors = orderHistory.reduce((acc, order) => acc + order.totalFavors, 0);

  const categories: Category[] = ['Cibo', 'Amore', 'Logistica'];
  
  const categoryMeta: Record<string, { emoji: string; color: string; icon: any; glow: string }> = {
    'Cibo': { emoji: '🍣', color: 'bg-rose-500', glow: 'shadow-rose-500/30', icon: Utensils },
    'Amore': { emoji: '❤️', color: 'bg-red-600', glow: 'shadow-red-600/30', icon: HeartIcon },
    'Logistica': { emoji: '✈️', color: 'bg-rose-400', glow: 'shadow-rose-400/30', icon: Car },
    'Tutti': { emoji: '✨', color: 'bg-zinc-800', glow: 'shadow-zinc-800/30', icon: Sparkles }
  };

  // Reusable Quote Component
  const LoveQuote = () => (
    <section className="bg-zinc-900 border border-white/5 rounded-[3rem] p-10 text-center space-y-6 relative overflow-hidden group">
      <div className="relative z-10 space-y-4">
         <div className="flex justify-center gap-1">
           {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-rose-500 fill-rose-500" />)}
         </div>
         <p className="text-rose-100 font-medium italic text-lg leading-relaxed">
           "come sempre, farò di tutto per renderti felice. Preparati perchè sto preparando il tuo ordine e quando verrai potrai ritirarlo. Ti amo"
         </p>
         <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Il tuo Giuseppe</p>
      </div>
    </section>
  );

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[300] animate-in fade-in duration-500">
        <div className="absolute inset-0 bg-rose-600/5 radial-gradient blur-3xl opacity-50" />
        <div className="relative flex flex-col items-center space-y-8 text-center px-10">
          <div className="relative">
            <div className="bg-rose-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(225,29,72,0.4)] animate-pulse border border-white/20">
              <Gift size={40} className="text-white" />
            </div>
            <Loader2 className="absolute -inset-4 text-rose-500/30 animate-spin w-32 h-32" strokeWidth={1} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Elaborazione in corso</h2>
            <p className="text-rose-300 font-bold uppercase tracking-widest text-[10px] animate-pulse h-4">
              {loadingMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'splash') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[200] overflow-hidden px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] animate-pulse" />
        
        <div className="relative flex flex-col items-center max-sm w-full text-center">
          <div className="relative mb-10 animate-in zoom-in-90 duration-1000">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[6px] border-white shadow-[0_0_80px_rgba(225,29,72,0.5)] overflow-hidden relative z-10">
              <img 
                src="https://i.postimg.cc/FHPWpq4G/IMG-4475.jpg" 
                className="w-full h-full object-cover"
                alt="Valentina e Giuseppe"
                style={{ objectPosition: 'center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            
            <div className="absolute -top-4 -right-2 animate-bounce delay-150 z-20">
              <div className="bg-rose-600 p-4 rounded-[2rem] shadow-2xl border border-white/20">
                <Heart className="text-white fill-white" size={28} />
              </div>
            </div>
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                Buon San Valentino
              </h1>
              <p className="text-rose-400 text-sm md:text-base font-black uppercase tracking-[0.4em] opacity-90">
                Valentina's Delivery ❤️
              </p>
            </div>
            
 <button 
  onClick={async () => {
    try {
      if (!("Notification" in window)) {
        alert("Questo browser non supporta le notifiche.");
      } else {
        const permission = await Notification.requestPermission();
        alert("Risposta permesso: " + permission);
        if (permission === "granted") {
          new Notification("Notifiche Attive!", { body: "Ora riceverai gli aggiornamenti ❤️" });
        }
      }
    } catch (error) {
      alert("Errore durante la richiesta: " + error);
    }
    setView('selection');
  }} 
  className="w-full py-7 bg-white text-zinc-950 rounded-[2.5rem] font-black uppercase tracking-[0.5em]"
>
  Entra
</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'selection') {
    return (
      <div className="h-screen w-full bg-transparent text-white px-6 flex flex-col items-center justify-center animate-in fade-in duration-700 overflow-hidden">
        <div className="max-w-md w-full flex flex-col items-center justify-center h-full">
          <header className="text-center space-y-2 mb-10">
             <div className="flex justify-center mb-4">
               <Gift className="text-rose-500 animate-bounce" size={40} />
             </div>
            <h2 className="text-4xl font-black tracking-tighter leading-tight">Auguri Ninni! ❤️</h2>
            <p className="text-rose-200/70 font-bold text-sm uppercase tracking-widest px-4">Cosa vorresti oggi?</p>
          </header>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8">
            {categories.map((cat) => {
              const meta = categoryMeta[cat];
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setView('home');
                  }}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className={`w-28 h-28 rounded-full ${meta.color} flex items-center justify-center text-4xl shadow-2xl ${meta.glow} transition-all duration-500 group-hover:scale-105 active:scale-90 border-4 border-white/10 group-hover:border-white/40 overflow-hidden relative`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                    {meta.emoji}
                  </div>
                  <span className="font-black text-[10px] uppercase tracking-[0.2em] text-rose-300 group-hover:text-white transition-colors">
                    {cat}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => {
                setSelectedCategory('Tutti');
                setView('home');
              }}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={`w-28 h-28 rounded-full bg-zinc-800 flex items-center justify-center text-4xl shadow-2xl shadow-zinc-800/30 transition-all duration-500 group-hover:scale-105 active:scale-90 border-4 border-white/10 group-hover:border-white/40 overflow-hidden relative`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                ✨
              </div>
              <span className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">
                Tutti
              </span>
            </button>
          </div>

          <button 
            onClick={() => setView('history')}
            className="mt-14 py-4 px-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-rose-200 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-rose-600 hover:text-white transition-all active:scale-95 flex items-center gap-2"
          >
            <History size={14} /> Vedi lo storico
          </button>
        </div>
      </div>
    );
  }

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
