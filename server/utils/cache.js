const redis = require('redis');

let client;
let isConnected = false;

// Initialize Redis client
const connectRedis = async () => {
  if (isConnected) return client;

  try {
    // Only connect to Redis if URL is provided
    if (!process.env.REDIS_URL) {
      console.log('Redis URL not provided, skipping Redis connection');
      return null;
    }

    client = redis.createClient({
      url: process.env.REDIS_URL,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('Redis connection refused');
          return new Error('Redis connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          console.error('Redis max connection attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    client.on('error', (err) => {
      console.error('Redis client error:', err);
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('Connected to Redis');
      isConnected = true;
    });

    client.on('disconnect', () => {
      console.log('Disconnected from Redis');
      isConnected = false;
    });

    await client.connect();
    return client;

  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    isConnected = false;
    return null;
  }
};

// Cache middleware factory
const createCacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not available
    if (!isConnected || !client) {
      return next();
    }

    try {
      const key = `cache:${req.originalUrl || req.url}`;
      const cachedData = await client.get(key);

      if (cachedData) {
        console.log(`Cache hit for ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json function
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function(data) {
        // Cache successful responses only
        if (res.statusCode === 200) {
          client.setex(key, duration, JSON.stringify(data))
            .catch(err => console.error('Failed to cache data:', err));
        }
        return originalJson.call(this, data);
      };

      next();

    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache utility functions
const cache = {
  // Get data from cache
  async get(key) {
    if (!isConnected || !client) return null;
    
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Set data in cache
  async set(key, data, duration = 300) {
    if (!isConnected || !client) return false;
    
    try {
      await client.setex(key, duration, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Delete data from cache
  async del(key) {
    if (!isConnected || !client) return false;
    
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Delete multiple keys (pattern)
  async delPattern(pattern) {
    if (!isConnected || !client) return false;
    
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    if (!isConnected || !client) return false;
    
    try {
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  // Get TTL (time to live) for a key
  async ttl(key) {
    if (!isConnected || !client) return -1;
    
    try {
      return await client.ttl(key);
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -1;
    }
  },

  // Increment a counter
  async incr(key, duration = 3600) {
    if (!isConnected || !client) return 0;
    
    try {
      const result = await client.incr(key);
      if (result === 1) {
        // Set expiration only for new keys
        await client.expire(key, duration);
      }
      return result;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }
};

// Predefined cache configurations
const cacheConfigs = {
  // Short-term cache (5 minutes)
  short: createCacheMiddleware(300),
  
  // Medium-term cache (15 minutes)
  medium: createCacheMiddleware(900),
  
  // Long-term cache (1 hour)
  long: createCacheMiddleware(3600),
  
  // Extended cache (6 hours)
  extended: createCacheMiddleware(21600),
  
  // Products cache (30 minutes)
  products: createCacheMiddleware(1800),
  
  // Categories cache (1 hour)
  categories: createCacheMiddleware(3600),
  
  // Search results cache (10 minutes)
  search: createCacheMiddleware(600),
  
  // User profile cache (15 minutes)
  profile: createCacheMiddleware(900)
};

// Cache invalidation helpers
const invalidateCache = {
  // Invalidate product-related caches
  async products() {
    await cache.delPattern('cache:*/api/products*');
    await cache.delPattern('cache:*/api/search/products*');
    console.log('Product caches invalidated');
  },

  // Invalidate category caches
  async categories() {
    await cache.delPattern('cache:*/api/search/categories*');
    console.log('Category caches invalidated');
  },

  // Invalidate search caches
  async search() {
    await cache.delPattern('cache:*/api/search*');
    console.log('Search caches invalidated');
  },

  // Invalidate user-specific caches
  async user(userId) {
    await cache.delPattern(`cache:*/api/users/${userId}*`);
    await cache.delPattern(`cache:*/api/orders*user=${userId}*`);
    console.log(`User ${userId} caches invalidated`);
  },

  // Invalidate all caches
  async all() {
    await cache.delPattern('cache:*');
    console.log('All caches invalidated');
  }
};

// Disconnect Redis client
const disconnectRedis = async () => {
  if (client && isConnected) {
    try {
      await client.quit();
      console.log('Redis client disconnected');
    } catch (error) {
      console.error('Error disconnecting Redis:', error);
    }
  }
};

module.exports = {
  connectRedis,
  cache,
  cacheConfigs,
  invalidateCache,
  disconnectRedis,
  isRedisConnected: () => isConnected
};
