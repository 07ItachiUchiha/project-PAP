// PlantPAP Service Worker
const CACHE_NAME = 'plantpap-v1.0.0';
const RUNTIME_CACHE = 'plantpap-runtime-v1.0.0';

// Essential files to cache for offline functionality
const ESSENTIAL_CACHE_FILES = [
  '/',
  '/shop',
  '/cart',
  '/wishlist',
  '/manifest.json',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https?:\/\/localhost:5000\/api\/products/,
  /^https?:\/\/localhost:5000\/api\/categories/,
];

// Image cache patterns
const IMAGE_CACHE_PATTERNS = [
  /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
  /^https?:\/\/images\.unsplash\.com\//,
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('🌱 PlantPAP Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🌱 Caching essential files');
        return cache.addAll(ESSENTIAL_CACHE_FILES);
      })
      .then(() => {
        console.log('🌱 PlantPAP Service Worker: Install complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('🌱 Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🌱 PlantPAP Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('🌱 Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('🌱 PlantPAP Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Strategy 1: Network First for API calls (fresh data preferred)
        if (isApiRequest(request)) {
          return await networkFirstStrategy(request);
        }

        // Strategy 2: Cache First for images (performance)
        if (isImageRequest(request)) {
          return await cacheFirstStrategy(request);
        }

        // Strategy 3: Stale While Revalidate for pages
        if (isPageRequest(request)) {
          return await staleWhileRevalidateStrategy(request);
        }

        // Default: Network First
        return await networkFirstStrategy(request);

      } catch (error) {
        console.error('🌱 Fetch error:', error);
        
        // Return offline page for navigation requests
        if (isPageRequest(request)) {
          const offlineResponse = await caches.match('/offline.html');
          return offlineResponse || new Response('Offline', { status: 200 });
        }
        
        return new Response('Network Error', { status: 408 });
      }
    })()
  );
});

// Network First Strategy - Try network, fallback to cache
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌱 Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache First Strategy - Try cache, fallback to network  
async function cacheFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌱 Both cache and network failed for:', request.url);
    throw error;
  }
}

// Stale While Revalidate - Return cache immediately, update in background
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('🌱 Background fetch failed:', error);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cache, wait for network
  return await fetchPromise;
}

// Helper functions
function isApiRequest(request) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

function isImageRequest(request) {
  return IMAGE_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
         request.destination === 'image';
}

function isPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🌱 Background sync:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncOfflineCart());
  } else if (event.tag === 'wishlist-sync') {
    event.waitUntil(syncOfflineWishlist());
  }
});

// Sync offline cart data when connection is restored
async function syncOfflineCart() {
  try {
    // Get offline cart data from IndexedDB or localStorage
    const offlineCartData = localStorage.getItem('offline-cart');
    
    if (offlineCartData) {
      const cartItems = JSON.parse(offlineCartData);
      
      // Send to server
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems })
      });
      
      // Clear offline data
      localStorage.removeItem('offline-cart');
      console.log('🌱 Cart synced successfully');
    }
  } catch (error) {
    console.error('🌱 Cart sync failed:', error);
  }
}

// Sync offline wishlist data
async function syncOfflineWishlist() {
  try {
    const offlineWishlistData = localStorage.getItem('offline-wishlist');
    
    if (offlineWishlistData) {
      const wishlistItems = JSON.parse(offlineWishlistData);
      
      await fetch('/api/wishlist/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: wishlistItems })
      });
      
      localStorage.removeItem('offline-wishlist');
      console.log('🌱 Wishlist synced successfully');
    }
  } catch (error) {
    console.error('🌱 Wishlist sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('🌱 Push notification received');
  
  const options = {
    body: 'Your plant order has been updated!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Order',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.title = payload.title || 'PlantPAP';
  }
  
  event.waitUntil(
    self.registration.showNotification('PlantPAP', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🌱 Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/orders')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

console.log('🌱 PlantPAP Service Worker loaded successfully');
