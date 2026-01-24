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
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);

  const loadingMessages = [
    "Confezionando i tuoi desideri con amore...",
    "Avvisando Giuseppe del tuo ordine speciale...",
    "Quasi pronto, Giuseppe si sta già mettendo all'opera!"
  ];

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(item => item.id !== productId);
        return prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item);
      }
      if (delta > 0) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) return [...prev, { ...product, quantity: 1 }];
      }
      return prev;
    });
  };

  // --- FUNZIONE AGGIORNATA PER COLLEGAMENTO HUB GIUSEPPE ---
  const handleCheckout = async () => {
    setIsCartOpen(false);
    setIsProcessing(true);
    
    // URL del tuo Google Apps Script
    const API_URL = "https://script.google.com/macros/s/AKfycbxUNiIGJckV4Y6edK-hikVPMx8kEgySjT3az-apjwP1uy-VlHZMr_XZ6p_vxPhm9A5j/exec";

    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[msgIndex]);
      }
    }, 1200);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const orderId = `VALE-${Date.now()}`;
    
    // Prepariamo i dati per il tuo database
    const orderData = {
      id: orderId,
      message: "Richiesta inviata dall'App! ❤️",
      items: cart.map(item => ({
        name: item.name,
        emoji: item.emoji,
        quantity: item.quantity
      })),
      total: total
    };

    try {
      // Invio dei dati al Foglio Google
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      // Gestione UI post-invio
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
      
      // Simulazione stati per Valentina (per ora restano simulati sul suo telefono)
      setTimeout(() => setOrderStatus(OrderStatus.PREPARING), 5000);
      setTimeout(() => setOrderStatus(OrderStatus.ON_THE_WAY), 12000);

    } catch (error) {
      console.error("Errore nell'invio:", error);
      clearInterval(interval);
      setIsProcessing(false);
      alert("C'è stato un problema di connessione. Riprova, Giuseppe ti aspetta!");
    }
  };

  const filteredProducts = selectedCategory === 'Tutti' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-['Plus_Jakarta_Sans'] overflow-x-hidden">
      {/* Splash Screen */}
      {view === 'splash' && (
        <main className="h-screen flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-zinc-950 to-zinc-950">
          <div className="relative mb-12 animate-bounce">
             <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20"></div>
             <Heart size={100} className="text-rose-600 relative z-10 fill-rose-600" />
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase italic">
            Vale <span className="text-rose-500">Delivery</span>
          </h1>
          <p className="text-zinc-400 max-w-xs mb-12 font-medium leading-relaxed">
            Il tuo servizio privato di coccole, cibo e amore, gestito da Giuseppe.
          </p>
          <button 
            onClick={() => setView('home')}
            className="w-full max-w-xs bg-white text-zinc-950 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all"
          >
            Inizia l'esperienza
          </button>
        </main>
      )}

      {/* Home Page */}
      {view === 'home' && (
        <main className="pb-32 pt-8 animate-in fade-in duration-700">
          <header className="px-6 mb-10 flex items-center justify-between">
            <div>
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Bentornata Principessa</p>
              <h2 className="text-3xl font-black tracking-tighter italic uppercase">Cosa desideri?</h2>
            </div>
            <button 
              onClick={() => setView('history')}
              className="p-4 bg-zinc-900 rounded-3xl border border-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors"
            >
              <History size={24} />
            </button>
          </header>

          {/* Categories */}
          <div className="flex gap-4 overflow-x-auto px-6 mb-10 no-scrollbar py-2">
            {['Tutti', 'Cibo', 'Amore', 'Logistica', 'Faccende'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 border-none' 
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 px-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                quantity={cart.find(item => item.id === product.id)?.quantity || 0}
                onUpdate={updateQuantity} 
              />
            ))}
          </div>
        </main>
      )}

      {/* Tracking View */}
      {view === 'tracking' && (
        <main className="min-h-screen p-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
           <div className="w-full max-w-sm space-y-12">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 blur-[100px] opacity-10"></div>
              <div className="w-32 h-32 bg-zinc-900 border border-zinc-800 rounded-[3rem] mx-auto flex items-center justify-center shadow-2xl relative z-10">
                {orderStatus === OrderStatus.DELIVERED ? (
                  <CheckCircle2 size={64} className="text-emerald-500 animate-bounce" />
                ) : (
                  <Loader2 size={64} className="text-rose-500 animate-spin" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">{orderStatus}</h2>
              <p className="text-zinc-500 text-sm font-medium">L'ID del tuo ordine è #{lastOrder[0]?.id?.substring(0, 8) || '...'}</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-4">
                <span>Riepilogo Ordine</span>
                <span>{lastOrder.length} Oggetti</span>
              </div>
              <div className="space-y-4">
                {lastOrder.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="font-bold text-sm">{item.name}</span>
                    </div>
                    <span className="text-zinc-500 font-bold">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setView('home')}
              className="w-full py-5 rounded-full bg-white text-zinc-950 text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-rose-500 hover:text-white transition-all"
            >
              Torna alla Home
            </button>
          </div>
        </main>
      )}

      {/* History View */}
      {view === 'history' && (
        <main className="min-h-screen p-8 animate-in slide-in-from-right duration-500">
          <button onClick={() => setView('home')} className="mb-10 p-4 bg-zinc-900 rounded-3xl border border-zinc-800">
            <ArrowLeft size={24} />
          </button>
          
          <h1 className="text-4xl font-black mb-10 tracking-tighter uppercase italic">I tuoi <span className="text-rose-500 text-6xl block mt-1">Desideri</span></h1>
          
          <div className="space-y-6">
            {orderHistory.length === 0 ? (
              <div className="py-20 text-center bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-800">
                <p className="text-zinc-500 italic font-medium">Non hai ancora espresso desideri...</p>
              </div>
            ) : (
              orderHistory.map(order => (
                <div key={order.id} className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{order.date}</p>
                      <p className="text-xs font-mono text-zinc-500 uppercase tracking-tighter">ID: {order.id.substring(0, 12)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black">{order.totalFavors} <span className="text-[10px] text-rose-500 uppercase">Fav</span></p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-xl shadow-lg">
                        {item.emoji}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
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

      {/* Processing Loader Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
           <div className="relative mb-8">
              <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-30 animate-pulse"></div>
              <Loader2 size={80} className="text-rose-500 animate-spin relative z-10" />
           </div>
           <p className="text-2xl font-black italic uppercase tracking-tighter animate-pulse">{loadingMessage}</p>
        </div>
      )}

      {cart.length > 0 && view === 'home' && !isCartOpen && (
        <div className="fixed bottom-10 left-0 right-0 px-6 z-40 animate-in slide-in-from-bottom-8">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-rose-600 text-white py-6 rounded-[3rem] font-black shadow-[0_20px_50px_rgba(225,29,72,0.4)] flex items-center justify-between px-10 border border-white/20 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
               <span className="bg-white text-rose-600 w-7 h-7 rounded-full text-[11px] flex items-center justify-center font-black">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
              <span className="text-[11px] uppercase tracking-[0.2em]">Vedi Scelte</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-xl font-black tracking-tighter">
                {cart.reduce((a, b) => a + (b.price * b.quantity), 0)}
              </span>
              <span className="text-[9px] uppercase font-black opacity-70 tracking-widest">Fav</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;