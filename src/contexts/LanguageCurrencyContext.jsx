import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageCurrencyContext = createContext();

// Pakistani Market Translation Dictionary
const TRANSLATIONS = {
  en: {
    // Navigation
    home: 'Home',
    restaurants: 'Restaurants',
    myOrders: 'My Orders',
    cart: 'Cart',
    adminPanel: 'Admin Panel',
    riderPortal: 'Rider Portal',
    settings: 'Settings',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    searchPlaceholder: 'Search pizza, biryani, burgers, sushi… (Ctrl + K)',
    liveSystem: 'LIVE SYSTEM',
    enterPriseEdition: 'PAKISTAN ENTERPRISE EDITION',
    
    // Hero & Deals
    heroTitle: 'Gourmet Food Delivered Across Pakistan',
    heroSubtitle: 'Order from 500+ top verified restaurants in Lahore, Karachi, Islamabad & nationwide with sub-meter live GPS tracking.',
    todaysDeals: "TODAY'S PK DEALS",
    dealsTitle: 'Up to 40% OFF Your Orders',
    dealsCode: 'Use code FOODDASH40 at checkout. Valid on all Pakistani restaurants tonight.',
    claimDeal: 'Claim Deal Now',

    // Currency & Checkout
    currencyName: 'Pakistani Rupee (PKR)',
    currencySymbol: '₨',
    selectPaymentMethod: 'Select Pakistani Payment Method',
    jazzcash: 'JazzCash Mobile Wallet',
    easypaisa: 'EasyPaisa Mobile Wallet',
    sadapay: 'SadaPay Mastercard',
    nayapay: 'NayaPay Visa',
    raast: 'Raast Instant Payment (SBP)',
    cod: 'Cash on Delivery (PKR COD)',
    placeOrder: 'Place Order in PKR',
    orderTotal: 'Order Total',
    deliveryFee: 'Delivery Fee',
    gstTax: 'Sales Tax (GST 13%)',
    subtotal: 'Subtotal',

    // Cities
    coverageTitle: 'Serving Major Cities in Pakistan & Global Hubs',
    cityLahore: 'Lahore',
    cityKarachi: 'Karachi',
    cityIslamabad: 'Islamabad',
    cityRawalpindi: 'Rawalpindi',
    cityPeshawar: 'Peshawar',
    cityMultan: 'Multan',

    // FAQ & Support
    faqTitle: 'Frequently Asked Questions',
    contactSupport: '24/7 Enterprise Support (Pakistan)',
    phoneSupport: 'Helpline: 0800-FOOD-DASH',
    emailSupport: 'support@fooddash.pk',

    // Shortcuts & Controls
    commandPalette: 'Command Palette',
    shortcuts: 'Keyboard Shortcuts',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language / زبان',
    backupRestore: 'Data Backup & Audit',
    quickSearch: 'Quick Search',
  },

  ur: {
    // Navigation
    home: 'ہوم',
    restaurants: 'ریسٹورینٹس',
    myOrders: 'میرے آرڈرز',
    cart: 'کارٹ',
    adminPanel: 'ایڈمن پینل',
    riderPortal: 'رائڈر پورٹل',
    settings: 'سیٹنگز',
    signIn: 'سائن ان',
    signOut: 'سائن آؤٹ',
    searchPlaceholder: 'پزا، بریانی، برگر، نہاری تلاش کریں… (Ctrl + K)',
    liveSystem: 'لائیو سسٹم',
    enterPriseEdition: 'پاکستان انٹرپرائز ایڈیشن',

    // Hero & Deals
    heroTitle: 'پاکستان بھر میں لذیذ اور معیاری کھانا آپ کی دہلیز پر',
    heroSubtitle: 'لاہور، کراچی، اسلام آباد اور تمام بڑے شہروں کے 500+ بہترین ریسٹورینٹس سے آرڈر کریں بذریعہ جی پی ایس لائیو ٹریکنگ۔',
    todaysDeals: 'آج کی خاص پیشکش',
    dealsTitle: '40% تک کی خصوصی چھوٹ حاصل کریں',
    dealsCode: 'چیک آؤٹ پر کوڈ FOODDASH40 استعمال کریں۔ تمام پاکستانی ریسٹورینٹس کے لیے کارآمد۔',
    claimDeal: 'ابھی ڈیل حاصل کریں',

    // Currency & Checkout
    currencyName: 'پاکستانی روپیہ (PKR)',
    currencySymbol: 'روپے',
    selectPaymentMethod: 'پاکستان کا طریقہ ادائیگی منتخب کریں',
    jazzcash: 'جاز کیش موبائل والٹ',
    easypaisa: 'ایزی پیسہ موبائل والٹ',
    sadapay: 'سادا پے ماسٹر کارڈ',
    nayapay: 'نیا پے ویزا کارڈ',
    raast: 'راست انسٹنٹ پیمنٹ (اسٹیٹ بینک)',
    cod: 'کیش آن ڈیلیوری (روپے)',
    placeOrder: 'آرڈر کی تصدیق کریں',
    orderTotal: 'کل قیمت',
    deliveryFee: 'ڈیلیوری چارجز',
    gstTax: 'سیلز ٹیکس (جی ایس ٹی 13%)',
    subtotal: 'سب ٹوٹل',

    // Cities
    coverageTitle: 'پاکستان کے تمام بڑے شہروں میں خدمات دستیاب ہیں',
    cityLahore: 'لاہور',
    cityKarachi: 'کراچی',
    cityIslamabad: 'اسلام آباد',
    cityRawalpindi: 'راولپنڈی',
    cityPeshawar: 'پشاور',
    cityMultan: 'ملتان',

    // FAQ & Support
    faqTitle: 'بار بار پوچھے جانے والے سوالات',
    contactSupport: '24/7 انٹرپرائز سپورٹ (پاکستان)',
    phoneSupport: 'ہیلپ لائن: 0800-FOOD-DASH',
    emailSupport: 'support@fooddash.pk',

    // Shortcuts & Controls
    commandPalette: 'کمانڈ پیلیٹ',
    shortcuts: 'کی بورڈ شارٹ کٹس',
    darkMode: 'ڈارک موڈ',
    lightMode: 'لائٹ موڈ',
    language: 'زبان / Language',
    backupRestore: 'ڈیٹا بیک اپ اور آڈٹ',
    quickSearch: 'فوری تلاش',
  }
};

export function LanguageCurrencyProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('fooddash_lang') || 'en';
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('fooddash_currency') || 'PKR';
  });

  // USD to PKR conversion rate (approximate for display conversion if needed)
  const USD_TO_PKR_RATE = 280;

  useEffect(() => {
    localStorage.setItem('fooddash_lang', language);
    const dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('fooddash_currency', currency);
  }, [currency]);

  // Format price smartly based on active currency selection
  const formatPrice = (amountInUSDOrPKR) => {
    const numeric = Number(amountInUSDOrPKR) || 0;
    
    if (currency === 'PKR') {
      // If original number is small (likely in USD), scale to PKR
      const pkrAmount = numeric < 100 ? Math.round(numeric * USD_TO_PKR_RATE) : numeric;
      if (language === 'ur') {
        return `${pkrAmount.toLocaleString('en-PK')} روپے`;
      }
      return `₨ ${pkrAmount.toLocaleString('en-PK')}`;
    } else {
      // USD mode
      const usdAmount = numeric >= 100 ? (numeric / USD_TO_PKR_RATE).toFixed(2) : numeric.toFixed(2);
      return `$${usdAmount}`;
    }
  };

  // Format Pakistani Date & Time
  const formatPKRDate = (dateInput) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) return 'N/A';
    
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Karachi'
    };

    const formatted = new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-PK', options).format(d);
    return `${formatted} ${language === 'ur' ? 'پاکستان وقت' : 'PKT'}`;
  };

  // Translation function helper
  const t = (key) => {
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }
    if (TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ur' : 'en'));
  };

  const toggleCurrency = () => {
    setCurrency(prev => (prev === 'PKR' ? 'USD' : 'PKR'));
  };

  const isRTL = language === 'ur';

  return (
    <LanguageCurrencyContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      currency,
      setCurrency,
      toggleCurrency,
      formatPrice,
      formatPKRDate,
      t,
      isRTL,
      dir: isRTL ? 'rtl' : 'ltr'
    }}>
      {children}
    </LanguageCurrencyContext.Provider>
  );
}

export function useLanguageCurrency() {
  return useContext(LanguageCurrencyContext);
}
