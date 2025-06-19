import React, { createContext, useContext, useState, useEffect } from 'react';

// Currency configuration
const CURRENCIES = {
  USD: { 
    symbol: '$', 
    code: 'USD', 
    name: 'US Dollar',
    rate: 1, // Base currency
    locale: 'en-US',
    countries: ['US', 'PR', 'VG', 'VI', 'UM', 'MP']
  },
  INR: { 
    symbol: '₹', 
    code: 'INR', 
    name: 'Indian Rupee',
    rate: 83.30, // 1 USD = 83.30 INR (you can update this from an API)
    locale: 'en-IN',
    countries: ['IN']
  },
  EUR: { 
    symbol: '€', 
    code: 'EUR', 
    name: 'Euro',
    rate: 0.85, // 1 USD = 0.85 EUR
    locale: 'en-EU',
    countries: ['DE', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE', 'AT', 'FI', 'IE', 'GR', 'LU', 'CY', 'MT', 'SK', 'SI', 'EE', 'LV', 'LT']
  },
  GBP: { 
    symbol: '£', 
    code: 'GBP', 
    name: 'British Pound',
    rate: 0.73, // 1 USD = 0.73 GBP
    locale: 'en-GB',
    countries: ['GB', 'UK']
  },
  CAD: { 
    symbol: 'C$', 
    code: 'CAD', 
    name: 'Canadian Dollar',
    rate: 1.35, // 1 USD = 1.35 CAD
    locale: 'en-CA',
    countries: ['CA']
  },
  AUD: { 
    symbol: 'A$', 
    code: 'AUD', 
    name: 'Australian Dollar',
    rate: 1.50, // 1 USD = 1.50 AUD
    locale: 'en-AU',
    countries: ['AU']
  }
};

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Detect user location and set appropriate currency
  useEffect(() => {
    const detectLocationAndCurrency = async () => {
      setIsLoading(true);
      
      try {
        // Check if user has a saved currency preference
        const savedCurrency = localStorage.getItem('preferred_currency');
        if (savedCurrency && CURRENCIES[savedCurrency]) {
          setCurrentCurrency(savedCurrency);
          setIsLoading(false);
          return;
        }

        // Try to detect location via IP geolocation API
        try {
          const response = await fetch('https://ipapi.co/json/', {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUserLocation(data);
            
            // Map country code to currency
            const countryCode = data.country_code;
            const detectedCurrency = Object.keys(CURRENCIES).find(currency => 
              CURRENCIES[currency].countries.includes(countryCode)
            );
            
            if (detectedCurrency) {
              setCurrentCurrency(detectedCurrency);
              console.log(`🌍 Detected location: ${data.country_name}, Currency: ${detectedCurrency}`);
            }
          }        } catch {
          console.log('📍 Location detection failed, using default currency');
        }        // Fallback: Try to detect from browser locale
        const locale = navigator.language || navigator.languages[0];
        
        if (locale.includes('en-IN') || locale.includes('hi')) {
          setCurrentCurrency('INR');
        } else if (locale.includes('en-GB')) {
          setCurrentCurrency('GBP');
        } else if (locale.includes('en-CA')) {
          setCurrentCurrency('CAD');
        } else if (locale.includes('en-AU')) {
          setCurrentCurrency('AUD');
        } else if (locale.includes('de') || locale.includes('fr') || locale.includes('it') || locale.includes('es')) {
          setCurrentCurrency('EUR');
        }
        
      } catch (error) {
        console.error('Currency detection error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    detectLocationAndCurrency();
  }, []);

  // Convert price from USD to current currency
  const convertPrice = (usdPrice) => {
    const currency = CURRENCIES[currentCurrency];
    return usdPrice * currency.rate;
  };

  // Format price with currency symbol and locale
  const formatPrice = (usdPrice, options = {}) => {
    const currency = CURRENCIES[currentCurrency];
    const convertedPrice = convertPrice(usdPrice);
    
    const formatted = new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: options.minimumFractionDigits || 2,
      maximumFractionDigits: options.maximumFractionDigits || 2,
      ...options
    }).format(convertedPrice);
    
    return formatted;
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    return CURRENCIES[currentCurrency].symbol;
  };

  // Set currency preference
  const setCurrency = (currencyCode) => {
    if (CURRENCIES[currencyCode]) {
      setCurrentCurrency(currencyCode);
      localStorage.setItem('preferred_currency', currencyCode);
    }
  };

  // Get available currencies for selector
  const getAvailableCurrencies = () => {
    return Object.entries(CURRENCIES).map(([code, config]) => ({
      code,
      name: config.name,
      symbol: config.symbol
    }));
  };

  const value = {
    currentCurrency,
    setCurrency,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
    getAvailableCurrencies,
    isLoading,
    userLocation,
    currencies: CURRENCIES
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider;
