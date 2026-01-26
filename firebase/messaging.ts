/**
 * Firebase Cloud Messaging - Gestione notifiche push
 * Gestisce la richiesta di permessi, ottenimento token e ascolto notifiche
 */

import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import app from "./config";

// VAPID Key per le notifiche push web
const VAPID_KEY = "BGMo_1LWZ7KFbWxJBnV4vVIZmkXS46Wk3g-2XR7Wzo6NiKnBRc3ntEZOMvk4hrD3ZDRMyAnVbR1J1m5bF22f4e0";

// Inizializza Firebase Messaging (lazy initialization)
let messaging: Messaging | null = null;

/**
 * Inizializza Firebase Messaging se non è già inizializzato
 */
function getMessagingInstance(): Messaging | null {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error("Errore nell'inizializzazione di Firebase Messaging:", error);
      return null;
    }
  }

  return messaging;
}

/**
 * Richiede il permesso per le notifiche push e ottiene il token FCM
 * PRIMA registra il service worker, POI ottiene il token
 * @returns Promise<string | null> - Il token FCM se il permesso è concesso, null altrimenti
 */
export async function requestNotificationPermission(): Promise<string | null> {
  // Verifica che siamo nel browser
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn("Le notifiche non sono supportate in questo browser");
    return null;
  }

  // Verifica che il service worker sia supportato
  if (!('serviceWorker' in navigator)) {
    console.error("Service Worker non supportato in questo browser");
    return null;
  }

  try {
    // Richiedi il permesso per le notifiche
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log("✅ Permesso notifiche concesso");
      
      try {
        // REGISTRA il service worker PRIMA di ottenere il token
        console.log("📋 Registrazione service worker...");
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // ASPETTA che il service worker sia attivo e pronto
        await navigator.serviceWorker.ready;
        console.log("✅ Service Worker pronto:", registration);
        
        // ORA inizializza Firebase Messaging e ottieni il token
        const messagingInstance = getMessagingInstance();
        if (!messagingInstance) {
          console.error("❌ Impossibile inizializzare Firebase Messaging");
          return null;
        }
        
        const token = await getToken(messagingInstance, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          console.log("🔑 Token FCM ottenuto:", token);
          
          // Salva il token in localStorage per uso futuro
          localStorage.setItem('fcm_token', token);
          
          return token;
        } else {
          console.warn("⚠️ Nessun token FCM disponibile. Verifica la configurazione Firebase.");
          return null;
        }
      } catch (tokenError) {
        console.error("❌ Errore nell'ottenimento del token FCM:", tokenError);
        return null;
      }
    } else if (permission === 'denied') {
      console.warn("⚠️ Permesso notifiche negato dall'utente");
      return null;
    } else {
      console.warn("⚠️ Permesso notifiche non ancora deciso");
      return null;
    }
  } catch (error) {
    console.error("❌ Errore nella richiesta del permesso:", error);
    return null;
  }
}

/**
 * Ascolta le notifiche push quando l'app è aperta (foreground)
 * @param callback - Funzione chiamata quando arriva una notifica
 */
export function onMessageListener(callback: (payload: any) => void): (() => void) | null {
  const messagingInstance = getMessagingInstance();
  
  if (!messagingInstance) {
    console.warn("Firebase Messaging non è inizializzato");
    return null;
  }

  try {
    // Ascolta i messaggi quando l'app è in foreground
    const unsubscribe = onMessage(messagingInstance, (payload) => {
      console.log("📨 Notifica ricevuta in foreground:", payload);
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error("❌ Errore nell'ascolto dei messaggi:", error);
    return null;
  }
}

/**
 * Ottiene il token FCM salvato in localStorage
 * @returns string | null - Il token salvato o null se non presente
 */
export function getSavedToken(): string | null {
  return localStorage.getItem('fcm_token');
}

/**
 * Verifica se il permesso per le notifiche è già stato concesso
 * @returns boolean - true se il permesso è già stato concesso
 */
export function isNotificationPermissionGranted(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

export { messaging };
