
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
  status: OrderStatus;
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

// Type guard functions
export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && Object.values(OrderStatus).includes(value as OrderStatus);
}

export function isOrderHistoryItem(value: unknown): value is OrderHistoryItem {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    Array.isArray(obj.items) &&
    typeof obj.totalFavors === 'number' &&
    isOrderStatus(obj.status)
  );
}

export interface ApiOrderResponse {
  status?: string;
  [key: string]: unknown;
}
