
export type Category = 'Cibo' | 'Faccende' | 'Amore' | 'Logistica';

export interface Product {
  id: string;
  name: string;
  price: number; // espresso in "Favori"
  category: Category;
  emoji: string;
  description: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  items: CartItem[];
  totalFavors: number;
}

export enum OrderStatus {
  RECEIVED = 'Richiesta ricevuta! 💌',
  PREPARING = 'Giuseppe si sta preparando... 👔',
  ON_THE_WAY = 'Giuseppe sta arrivando! 🛵💨',
  DELIVERED = 'Servizio completato con amore! ❤️'
}

export interface Location {
  lat: number;
  lng: number;
}
