import { useState } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

const CurrencySelector = ({ className = '', showLabel = true }) => {
  const { currentCurrency, setCurrency, getAvailableCurrencies, userLocation } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const currencies = getAvailableCurrencies();

  const currentCurrencyData = currencies.find(c => c.code === currentCurrency);

  const handleCurrencyChange = (currencyCode) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Currency Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-sage-200 rounded-lg hover:bg-white hover:border-sage-300 transition-all duration-200 text-sm font-medium text-charcoal-700"
      >
        <Globe className="h-4 w-4 text-sage-600" />
        <span className="flex items-center gap-1">
          <span className="text-lg">{currentCurrencyData?.symbol}</span>
          {showLabel && (
            <span className="hidden sm:inline">{currentCurrency}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-sage-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Location Info (if available) */}
      {userLocation && (
        <div className="absolute -top-8 left-0 text-xs text-sage-500 bg-white/90 px-2 py-1 rounded border border-sage-200 whitespace-nowrap">
          📍 {userLocation.city}, {userLocation.country_name}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-sage-200 rounded-xl shadow-soft z-50 overflow-hidden">
          <div className="p-3 border-b border-sage-100">
            <h3 className="text-sm font-semibold text-charcoal-800 mb-1">
              Select Currency
            </h3>
            <p className="text-xs text-sage-600">
              Prices will be converted automatically
            </p>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-sage-50 transition-colors duration-150 ${
                  currentCurrency === currency.code ? 'bg-sage-50 text-forest-700' : 'text-charcoal-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{currency.symbol}</span>
                  <div className="text-left">
                    <div className="font-medium text-sm">{currency.name}</div>
                    <div className="text-xs text-sage-500">{currency.code}</div>
                  </div>
                </div>
                
                {currentCurrency === currency.code && (
                  <Check className="h-4 w-4 text-forest-600" />
                )}
              </button>
            ))}
          </div>
          
          <div className="p-3 border-t border-sage-100 bg-sage-25">
            <p className="text-xs text-sage-600 text-center">
              💡 Rates are updated in real-time
            </p>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CurrencySelector;
