import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { OrderStatus } from '../types';

interface NotificationBannerProps {
  status: OrderStatus;
  onClose: () => void;
}

const statusMessages: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]: 'Giuseppe ha preso in carico il tuo ordine ❤️',
  [OrderStatus.PREPARING]: 'Giuseppe si sta preparando per te... 👔',
  [OrderStatus.ON_THE_WAY]: 'Il corriere Giuseppe sta arrivando! 🚗',
  [OrderStatus.DELIVERED]: 'Servizio completato con tutto il suo amore! ❤️'
};

const NotificationBanner: React.FC<NotificationBannerProps> = ({ status, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    setIsVisible(true);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, onClose]);

  return (
    <>
      <style>{`
        @keyframes slideInBounce {
          0% {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          60% {
            transform: translateY(5px) scale(1.02);
            opacity: 1;
          }
          80% {
            transform: translateY(-2px) scale(0.98);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <div
        className={`fixed top-0 left-0 right-0 z-[200] px-6 pt-6 transition-all duration-500 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div
          className="bg-gradient-to-r from-rose-500 to-purple-500 rounded-3xl p-5 shadow-2xl border border-white/20 backdrop-blur-md flex items-center gap-4"
          style={{
            animation: isVisible ? 'slideInBounce 0.6s ease-out' : 'none'
          }}
        >
        <div className="bg-white/20 p-3 rounded-2xl flex-shrink-0">
          <Heart className="text-white fill-white" size={24} />
        </div>
        <p className="text-white font-black text-sm uppercase tracking-tight flex-1">
          {statusMessages[status]}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
          aria-label="Chiudi"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
    </>
  );
};

export default NotificationBanner;
