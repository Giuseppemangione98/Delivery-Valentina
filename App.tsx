import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './constants.tsx';
import { CartItem, Product, OrderStatus, Category, Location, OrderHistoryItem, isOrderStatus, isOrderHistoryItem, ApiOrderResponse } from './types';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import NotificationBanner from './components/NotificationBanner';
import { Heart, ArrowLeft, CheckCircle2, ShoppingBag, Utensils, Sparkles, Car, Heart as HeartIcon, Gift, Clock, Star, Sparkle, ChevronRight, History, Wallet, Loader2 } from 'lucide-react';

type AppView = 'splash' | 'selection' | 'home' | 'tracking' | 'history';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('splash');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.RECEIVED);
  const [previousOrderStatus, setPreviousOrderStatus] = useState<OrderStatus | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerStatus, setBannerStatus] = useState<OrderStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Tutti'>('Tutti');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);

  const loadingMessages = [
    "Confezionando i tuoi desideri con amore...",
    "Avvisando Giuseppe del tuo ordine speciale...",
    "Preparando il corriere del cuore...",
    "Quasi pronto, Valentina! ❤️"
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem('valentina_order_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.every(isOrderHistoryItem)) {
          setOrderHistory(parsed);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker Registrato!'))
        .catch(err => console.log('Errore SW:', err));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('valentina_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    // Don't poll if not in tracking view, no order, or already delivered
    if (view !== 'tracking' || lastOrder.length === 0 || orderStatus === OrderStatus.DELIVERED) {
      setIsPolling(false);
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    let isActive = true;
    let currentRetryCount = 0;
    const MAX_RETRIES = 3;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const stopPolling = () => {
      isActive = false;
      setIsPolling(false);
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = undefined;
      }
    };

    const fetchOrderStatus = async (): Promise<void> => {
      // Stop if view changed, order delivered, or component unmounted
      if (!isActive || view !== 'tracking' || orderStatus === OrderStatus.DELIVERED) {
        return;
      }

      setIsPolling(true);
      try {
        const API_URL = "https://script.google.com/macros/s/AKfycbxUNiIGJckV4Y6edK-hikVPMx8kEgySjT3az-apjwP1uy-VlHZMr_XZ6p_vxPhm9A5j/exec";
        const response = await fetch(`${API_URL}?orderId=${lastOrder[0].id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiOrderResponse = await response.json();
        
        if (data?.status && isOrderStatus(data.status)) {
          const newStatus = data.status;
          
          // Reset retry count on successful fetch
          currentRetryCount = 0;
          setRetryCount(0);
          
          // Only show banner if status actually changed
          if (newStatus !== orderStatus) {
            setBannerStatus(newStatus);
            setShowBanner(true);
          }
          
          setOrderStatus(newStatus);
          
          // Stop polling if order is delivered
          if (newStatus === OrderStatus.DELIVERED) {
            stopPolling();
            return;
          }
          
          // Successfully fetched, hide loader
          setIsPolling(false);
        } else {
          // No valid status in response, hide loader
          setIsPolling(false);
        }
      } catch (e) {
        console.log("Errore nel recupero dello stato...");
        
        // Retry logic
        if (currentRetryCount < MAX_RETRIES && isActive) {
          currentRetryCount++;
          setRetryCount(currentRetryCount);
          
          // Exponential backoff: wait longer between retries
          const retryDelay = Math.min(1000 * Math.pow(2, currentRetryCount - 1), 10000);
          
          // Keep polling state true during retry delay to show loader
          setIsPolling(true);
          
          retryTimeout = setTimeout(() => {
            if (isActive && view === 'tracking' && orderStatus !== OrderStatus.DELIVERED) {
              fetchOrderStatus();
            } else {
              setIsPolling(false);
            }
          }, retryDelay);
        } else {
          // Max retries reached, stop polling
          console.log("Numero massimo di tentativi raggiunto");
          setIsPolling(false);
          setRetryCount(0);
        }
      }
    };

    // Initial fetch
    fetchOrderStatus();

    // Set up polling interval
    interval = setInterval(() => {
      if (isActive && view === 'tracking' && orderStatus !== OrderStatus.DELIVERED && currentRetryCount === 0) {
        fetchOrderStatus();
      }
    }, 5000);

    // Handle visibility change (app goes to background)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background, stop polling
        stopPolling();
      } else if (view === 'tracking' && lastOrder.length > 0 && orderStatus !== OrderStatus.DELIVERED && isActive) {
        // App came back to foreground, resume polling
        if (!interval) {
          currentRetryCount = 0;
          setRetryCount(0);
          fetchOrderStatus();
          interval = setInterval(() => {
            if (isActive && view === 'tracking' && orderStatus !== OrderStatus.DELIVERED && currentRetryCount === 0) {
              fetchOrderStatus();
            }
          }, 5000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setRetryCount(0);
    };
  }, [view, lastOrder, orderStatus]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
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

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsProcessing(true);
    const API_URL = "https://script.google.com/macros/s/AKfycbxUNiIGJckV4Y6edK-hikVPMx8kEgySjT3az-apjwP1uy-VlHZMr_XZ6p_vxPhm9A5j/exec";
    const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const orderId = `VALE-${Date.now()}`;

    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        id: orderId,
        items: cart.map(i => ({ name: i.name, emoji: i.emoji, quantity: i.quantity })),
        total: total
      })
    });

    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const msgInterval = setInterval(() => {
      msgIndex++;
      if (msgIndex < loadingMessages.length) setLoadingMessage(loadingMessages[msgIndex]);
    }, 1000);

    setTimeout(() => {
      clearInterval(msgInterval);
      const newOrder: OrderHistoryItem = {
        id: orderId,
        date: new Date().toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        totalFavors: total,
        status: OrderStatus.RECEIVED
      };
      setOrderHistory(prev => [newOrder, ...prev]);
      setLastOrder([...cart]);
      setPreviousOrderStatus(OrderStatus.RECEIVED);
      setOrderStatus(OrderStatus.RECEIVED);
      setCart([]);
      setIsProcessing(false);
      setView('tracking');
    }, 3500);
  };

  const categories: Category[] = ['Cibo', 'Amore', 'Logistica'];
  const categoryMeta: Record<string, { emoji: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }>; glow: string }> = {
    'Cibo': { emoji: '🍣', color: 'bg-rose-500', glow: 'shadow-rose-500/30', icon: Utensils },
    'Amore': { emoji: '❤️', color: 'bg-red-600', glow: 'shadow-red-600/30', icon: HeartIcon },
    'Logistica': { emoji: '✈️', color: 'bg-rose-400', glow: 'shadow-rose-400/30', icon: Car },
    'Tutti': { emoji: '✨', color: 'bg-zinc-800', glow: 'shadow-zinc-800/30', icon: Sparkles }
  };

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
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[300]">
        <div className="bg-rose-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center animate-pulse mb-8">
          <Gift size={40} className="text-white" />
        </div>
        <p className="text-rose-300 font-bold uppercase tracking-widest text-[10px] animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  if (view === 'splash') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[200] px-6">
        <div className="w-64 h-64 rounded-full border-[6px] border-white shadow-2xl overflow-hidden mb-10">
          <img src="https://i.postimg.cc/FHPWpq4G/IMG-4475.jpg" className="w-full h-full object-cover" alt="Vale" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 text-center">Buon San Valentino</h1>
        <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12">Valentina's Delivery ❤️</p>
        <button 
          onClick={async () => {
            if (typeof window !== 'undefined' && "Notification" in window) {
              await Notification.requestPermission();
            }
            setView('selection');
          }} 
          className="w-full py-7 bg-white text-zinc-950 rounded-[2.5rem] font-black uppercase tracking-[0.5em]"
        >
          Entra
        </button>
      </div>
    );
  }

  const filteredProducts = PRODUCTS.filter(p => selectedCategory === 'Tutti' || p.category === selectedCategory);
  const totalAccumulatedFavors = orderHistory.reduce((acc, order) => acc + order.totalFavors, 0);

  if (view === 'selection') {
    return (
      <div className="h-screen w-full bg-zinc-950 text-white px-6 flex flex-col items-center justify-center overflow-hidden">
        <header className="text-center mb-10">
          <Gift className="text-rose-500 animate-bounce mx-auto mb-4" size={40} />
          <h2 className="text-4xl font-black tracking-tighter">Auguri Ninni! ❤️</h2>
        </header>
        <div className="grid grid-cols-2 gap-8">
          {categories.map((cat) => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setView('home'); }} className="flex flex-col items-center gap-3">
              <div className={`w-24 h-24 rounded-full ${categoryMeta[cat].color} flex items-center justify-center text-3xl border-4 border-white/10`}>
                {categoryMeta[cat].emoji}
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest text-rose-300">{cat}</span>
            </button>
          ))}
          <button onClick={() => { setSelectedCategory('Tutti'); setView('home'); }} className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl border-4 border-white/10">✨</div>
            <span className="font-black text-[10px] uppercase tracking-widest text-zinc-500">Tutti</span>
          </button>
        </div>
        <button onClick={() => setView('history')} className="mt-14 py-4 px-12 bg-white/5 border border-white/10 rounded-full text-rose-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <History size={14} /> Vedi lo storico
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32">
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-3xl px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => setView(view === 'history' || view === 'tracking' ? 'home' : 'selection')} className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <ArrowLeft size={20} className="text-rose-400" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white">Giuseppe ❤️ Vale</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setView('history')} className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${view === 'history' ? 'bg-rose-600' : 'bg-white/5'}`}>
            <History size={20} className="text-white" />
          </button>
          <button onClick={() => setIsCartOpen(true)} className="bg-white/5 w-12 h-12 rounded-2xl flex items-center justify-center relative border border-white/10">
            <ShoppingBag size={22} className="text-rose-500" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>
        </div>
      </nav>

      {view === 'home' && (
        <main className="p-6">
          <div className="flex gap-6 overflow-x-auto pb-10 no-scrollbar">
            {['Tutti', ...categories].map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat as Category | 'Tutti')} className="flex flex-col items-center gap-3 shrink-0">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl border-2 ${selectedCategory === cat ? 'bg-rose-600 border-white' : 'bg-white/5 border-white/5'}`}>
                  {cat === 'Tutti' ? '✨' : categoryMeta[cat].emoji}
                </div>
                <span className="text-[10px] font-black uppercase">{cat}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-5">
            {filteredProducts.map(product => <ProductCard key={product.id} product={product} onAddToCart={addToCart} />)}
          </div>
        </main>
      )}

      {view === 'history' && (
        <main className="p-6 space-y-10">
          <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-[3rem] p-8 shadow-2xl">
            <p className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-2">Totale Favori Spesi</p>
            <span className="text-6xl font-black text-white">{totalAccumulatedFavors} ❤️</span>
          </div>
          <div className="space-y-4">
            {orderHistory.map((order) => (
              <div key={order.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-rose-400 uppercase">{order.date}</span>
                   <span className="text-sm font-black text-white">{order.totalFavors} F.</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.items.map(item => (
                    <div key={item.id} className="bg-zinc-900 px-3 py-1.5 rounded-full text-[9px] font-black text-white/60 uppercase">
                      {item.emoji} {item.quantity}x {item.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <LoveQuote />
        </main>
      )}

      {view === 'tracking' && (
        <main className="p-6 space-y-12">
          {showBanner && bannerStatus && (
            <NotificationBanner
              status={bannerStatus}
              onClose={() => {
                setShowBanner(false);
                setBannerStatus(null);
              }}
            />
          )}
          <div className="text-center space-y-6">
            <div className="bg-rose-600 w-20 h-20 rounded-[3rem] shadow-xl flex items-center justify-center mx-auto relative">
              {isPolling ? (
                <Loader2 className="text-white w-10 h-10 animate-spin" />
              ) : (
                <CheckCircle2 className="text-white w-10 h-10" />
              )}
            </div>
            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Inviato! ❤️</h2>
              <p className="text-rose-300 font-bold uppercase tracking-widest text-[10px] mt-2">{orderStatus}</p>
              {isPolling && (
                <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-2">
                  Aggiornamento in corso...
                </p>
              )}
              {retryCount > 0 && retryCount < 3 && (
                <p className="text-rose-400 text-[9px] font-black uppercase tracking-widest mt-1">
                  Tentativo {retryCount}/3...
                </p>
              )}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-4">
            {lastOrder.map((item) => (
              <div key={item.id} className="flex justify-between items-center font-black uppercase text-xs">
                <span>{item.emoji} {item.name}</span>
                <span className="text-zinc-500">{item.quantity}x</span>
              </div>
            ))}
          </div>
          <LoveQuote />
          <button onClick={() => setView('home')} className="w-full py-6 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-widest">Ordina altro</button>
        </main>
      )}

      <Cart isOpen={isCartOpen} items={cart} onClose={() => setIsCartOpen(false)} onUpdateQuantity={updateQuantity} onRemove={(id) => updateQuantity(id, -1000)} onCheckout={handleCheckout} />
      
      {cart.length > 0 && view === 'home' && !isCartOpen && (
        <div className="fixed bottom-10 left-0 right-0 px-6 z-40">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-rose-600 text-white py-6 rounded-[3rem] font-black shadow-2xl flex items-center justify-between px-10 border border-white/20">
            <span className="uppercase text-sm tracking-tight">Vedi Carrello</span>
            <span className="text-xl font-black">{cart.reduce((a, b) => a + (b.price * b.quantity), 0)} F. ❤️</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;