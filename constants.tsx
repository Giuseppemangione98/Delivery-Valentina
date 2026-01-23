
import { Product } from './types';

export const PRODUCTS: Product[] = [
  // CIBO
  {
    id: 'f1',
    name: 'Panino',
    price: 1,
    category: 'Cibo',
    emoji: '🥪',
    description: 'Un panino veloce fatto con tutto il mio amore.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=600&fit=crop'
  },
  {
    id: 'f2',
    name: 'Sushi',
    price: 3,
    category: 'Cibo',
    emoji: '🍣',
    description: 'Nigiri, Sashimi e Uramaki per una serata orientale.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop'
  },
  {
    id: 'h1',
    name: 'Pizza',
    price: 2,
    category: 'Cibo',
    emoji: '🍕',
    description: 'La tua pizza preferita, calda e fumante direttamente a casa.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop'
  },
  {
    id: 'f4',
    name: 'Cena',
    price: 5,
    category: 'Cibo',
    emoji: '🕯️',
    description: 'Candele, vino e tre portate speciali preparate da me.',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop'
  },
  // LOGISTICA
  {
    id: 'h2',
    name: 'Viaggio',
    price: 50,
    category: 'Logistica',
    emoji: '✈️',
    description: 'Prepariamo le valigie! Un weekend tutto per noi in una capitale europea.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop'
  },
  {
    id: 'h3',
    name: 'Gita',
    price: 4,
    category: 'Logistica',
    emoji: '🎒',
    description: 'Una giornata fuori porta tra natura, relax e sorrisi.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop'
  },
  {
    id: 'h4',
    name: 'Shopping',
    price: 6,
    category: 'Logistica',
    emoji: '🛍️',
    description: 'Oggi decidi tu il negozio! Un pomeriggio di acquisti sfrenati.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop'
  },
  {
    id: 'l1',
    name: 'Passaggio',
    price: 1,
    category: 'Logistica',
    emoji: '🚗',
    description: 'Taxi Giuseppe al tuo servizio ovunque tu sia.',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop'
  },
  // AMORE
  {
    id: 'a1',
    name: 'Coccole',
    price: 0,
    category: 'Amore',
    emoji: '🧸',
    description: 'Grattini e abbracci infiniti senza limiti di tempo.',
    image: 'https://i.postimg.cc/tJ3yVb8L/Coccole-Smiley.avif'
  },
  {
    id: 'a2',
    name: 'Sesso',
    price: 0,
    category: 'Amore',
    emoji: '🔥',
    description: 'Momento speciale tutto per noi.',
    image: 'https://i.postimg.cc/hGtjWXNJ/gallery-1465570288-sesso-buoni-motivi-per-fare-amore-spesso.avif'
  },
  {
    id: 'a3',
    name: 'Grattini',
    price: 7,
    category: 'Amore',
    emoji: '✨',
    description: 'Sessione intensiva di grattini dove preferisci tu. Relax totale garantito.',
    image: 'https://i.postimg.cc/dt9TTZMH/Grattini-Braccio-Slide-3-1.jpg'
  },
  {
    id: 'a4',
    name: 'Massaggio',
    price: 7,
    category: 'Amore',
    emoji: '💆‍♀️',
    description: 'Un massaggio rilassante e rigenerante per sciogliere ogni tua tensione.',
    image: 'https://i.postimg.cc/wvJ1x7Qg/Massoterapia.jpg'
  }
];

export const VITTORIA_KITCHEN = { lat: 37.433, lng: 14.924 };
