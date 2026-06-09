
// ===================== CATEGORIES =====================
const categories = [
  { id: 1, name: "Pizza", icon: "🍕", color: "#FF6B6B" },
  { id: 2, name: "Burger", icon: "🍔", color: "#FFB347" },
  { id: 3, name: "Biryani", icon: "🍛", color: "#F7DC6F" },
  { id: 4, name: "Sushi", icon: "🍱", color: "#82E0AA" },
  { id: 5, name: "Chinese", icon: "🥡", color: "#85C1E9" },
  { id: 6, name: "Desserts", icon: "🍰", color: "#F1948A" },
  { id: 7, name: "Drinks", icon: "🧃", color: "#A9CCE3" },
  { id: 8, name: "Rolls", icon: "🌯", color: "#A3E4D7" },
  { id: 9, name: "Pasta", icon: "🍝", color: "#F0B27A" },
  { id: 10, name: "Sandwich", icon: "🥪", color: "#D7BDE2" },
];

// ===================== RESTAURANTS =====================
const restaurants = [
  {
    id: 1,
    name: "Pizza Paradise",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    cuisine: ["Pizza", "Italian", "Fast Food"],
    rating: 4.5,
    reviews: 2341,
    deliveryTime: "25-35 min",
    deliveryFee: 30,
    minOrder: 150,
    distance: "1.2 km",
    priceRange: "Rs. 200 for two",
    offer: "50% OFF up to Rs. 100",
    tags: ["Bestseller", "Trending"],
    isOpen: true,
    category: "Pizza",
  },
  {
    id: 2,
    name: "Burger Barn",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    cuisine: ["Burger", "American", "Snacks"],
    rating: 4.3,
    reviews: 1876,
    deliveryTime: "20-30 min",
    deliveryFee: 20,
    minOrder: 100,
    distance: "0.8 km",
    priceRange: "Rs. 300 for two",
    offer: "Free Delivery",
    tags: ["Top Rated"],
    isOpen: true,
    category: "Burger",
  },
  {
    id: 3,
    name: "Biryani House",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96f?w=600&auto=format&fit=crop&q=80",
    cuisine: ["Biryani", "Mughlai", "North Indian"],
    rating: 4.7,
    reviews: 5120,
    deliveryTime: "35-45 min",
    deliveryFee: 0,
    minOrder: 200,
    distance: "2.1 km",
    priceRange: "Rs. 400 for two",
    offer: "BOGO on Weekends",
    tags: ["Bestseller", "Popular"],
    isOpen: true,
    category: "Biryani",
  },
  {
    id: 4,
    name: "Sushi Garden",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80",
    cuisine: ["Sushi", "Japanese", "Asian"],
    rating: 4.6,
    reviews: 987,
    deliveryTime: "40-50 min",
    deliveryFee: 50,
    minOrder: 300,
    distance: "3.5 km",
    priceRange: "Rs. 800 for two",
    offer: "20% OFF on first order",
    tags: ["Premium"],
    isOpen: true,
    category: "Sushi",
  },
  {
    id: 5,
    name: "Dragon Wok",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
    cuisine: ["Chinese", "Asian", "Noodles"],
    rating: 4.2,
    reviews: 1543,
    deliveryTime: "30-40 min",
    deliveryFee: 25,
    minOrder: 150,
    distance: "1.8 km",
    priceRange: "Rs. 350 for two",
    offer: "Rs. 50 OFF on Rs. 249",
    tags: ["Trending"],
    isOpen: true,
    category: "Chinese",
  },
  {
    id: 6,
    name: "Sweet Tooth Bakery",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80",
    cuisine: ["Desserts", "Cakes", "Ice Cream"],
    rating: 4.8,
    reviews: 3210,
    deliveryTime: "20-25 min",
    deliveryFee: 15,
    minOrder: 100,
    distance: "0.5 km",
    priceRange: "Rs. 250 for two",
    offer: "Free Dessert on Rs. 300",
    tags: ["New", "Trending"],
    isOpen: true,
    category: "Desserts",
  },
  {
    id: 7,
    name: "The Shawarma Stop",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80",
    cuisine: ["Rolls", "Lebanese", "Wraps"],
    rating: 4.4,
    reviews: 2097,
    deliveryTime: "15-25 min",
    deliveryFee: 10,
    minOrder: 80,
    distance: "0.3 km",
    priceRange: "Rs. 200 for two",
    offer: "Buy 2 Get 1 Free",
    tags: ["Bestseller"],
    isOpen: true,
    category: "Rolls",
  },
  {
    id: 8,
    name: "Pasta Palace",
    image: "https://images.unsplash.com/photo-1551183053-bf91798d9fd4?w=600&auto=format&fit=crop&q=80",
    cuisine: ["Pasta", "Italian", "Continental"],
    rating: 4.1,
    reviews: 876,
    deliveryTime: "30-40 min",
    deliveryFee: 30,
    minOrder: 200,
    distance: "2.4 km",
    priceRange: "Rs. 450 for two",
    offer: "15% OFF",
    tags: ["Premium"],
    isOpen: false,
    category: "Pasta",
  },
];

// ===================== MENU ITEMS =====================
const menuItems = {
  1: {
    restaurant: restaurants[0],
    categories: [
      {
        name: "Bestsellers 🔥",
        items: [
          { id: 101, name: "Margherita Pizza", desc: "Classic tomato sauce, fresh mozzarella, basil", price: 299, isVeg: true, rating: 4.5, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80", bestseller: true },
          { id: 102, name: "Pepperoni Pizza", desc: "Loaded with pepperoni and melted cheese", price: 349, isVeg: false, rating: 4.6, image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=200&q=80", bestseller: true },
          { id: 103, name: "BBQ Chicken Pizza", desc: "Smoky BBQ sauce, grilled chicken, onions", price: 399, isVeg: false, rating: 4.4, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80", bestseller: false },
        ]
      },
      {
        name: "Starters",
        items: [
          { id: 104, name: "Garlic Bread", desc: "Crispy garlic butter bread with herbs", price: 129, isVeg: true, rating: 4.3, image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=200&q=80", bestseller: false },
          { id: 105, name: "Chicken Wings", desc: "Crispy wings with dipping sauce", price: 249, isVeg: false, rating: 4.2, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=200&q=80", bestseller: false },
        ]
      },
      {
        name: "Drinks",
        items: [
          { id: 106, name: "Lemonade", desc: "Fresh squeezed lemonade", price: 79, isVeg: true, rating: 4.0, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=200&q=80", bestseller: false },
          { id: 107, name: "Coke", desc: "Chilled Coca-Cola 300ml", price: 49, isVeg: true, rating: 4.1, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&q=80", bestseller: false },
        ]
      },
    ]
  },
  2: {
    restaurant: restaurants[1],
    categories: [
      {
        name: "Bestsellers 🔥",
        items: [
          { id: 201, name: "Classic Smash Burger", desc: "Double smash patty, american cheese, pickles", price: 249, isVeg: false, rating: 4.7, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80", bestseller: true },
          { id: 202, name: "Veggie Delight Burger", desc: "Crispy veggie patty with fresh veggies", price: 199, isVeg: true, rating: 4.3, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80", bestseller: true },
        ]
      },
      {
        name: "Sides",
        items: [
          { id: 203, name: "Loaded Fries", desc: "Crispy fries with cheese and jalapeños", price: 149, isVeg: true, rating: 4.5, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&q=80", bestseller: false },
          { id: 204, name: "Onion Rings", desc: "Golden fried onion rings", price: 99, isVeg: true, rating: 4.1, image: "https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=200&q=80", bestseller: false },
        ]
      },
    ]
  },
  3: {
    restaurant: restaurants[2],
    categories: [
      {
        name: "Bestsellers 🔥",
        items: [
          { id: 301, name: "Chicken Biryani", desc: "Aromatic basmati rice with spiced chicken", price: 299, isVeg: false, rating: 4.8, image: "https://images.unsplash.com/photo-1563379091339-03246963d96f?w=200&q=80", bestseller: true },
          { id: 302, name: "Mutton Biryani", desc: "Slow cooked mutton with fragrant rice", price: 399, isVeg: false, rating: 4.7, image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=200&q=80", bestseller: true },
          { id: 303, name: "Veg Biryani", desc: "Mixed vegetables with saffron basmati", price: 229, isVeg: true, rating: 4.4, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200&q=80", bestseller: false },
        ]
      },
      {
        name: "Kebabs",
        items: [
          { id: 304, name: "Seekh Kebab", desc: "Minced lamb kebab with mint chutney", price: 249, isVeg: false, rating: 4.6, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&q=80", bestseller: false },
          { id: 305, name: "Paneer Tikka", desc: "Marinated cottage cheese grilled to perfection", price: 199, isVeg: true, rating: 4.5, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=200&q=80", bestseller: false },
        ]
      },
    ]
  },
};

// ===================== OFFERS / BANNERS =====================
const offers = [
  { id: 1, title: "50% OFF", subtitle: "On orders above Rs. 299", code: "SAVE50", gradient: "linear-gradient(135deg, #E23744, #ff6b35)", icon: "🎉" },
  { id: 2, title: "Free Delivery", subtitle: "On your first 3 orders", code: "FREEDEL", gradient: "linear-gradient(135deg, #11998e, #38ef7d)", icon: "🚀" },
  { id: 3, title: "Rs. 100 Cashback", subtitle: "Pay via UPI & get cashback", code: "UPI100", gradient: "linear-gradient(135deg, #667eea, #764ba2)", icon: "💰" },
  { id: 4, title: "Weekend Special", subtitle: "BOGO on selected items", code: "BOGO", gradient: "linear-gradient(135deg, #f093fb, #f5576c)", icon: "🍕" },
];

// ===================== COUPONS =====================
const coupons = {
  "SAVE50": { discount: 50, type: "percent", minOrder: 299 },
  "FREEDEL": { discount: 100, type: "delivery", minOrder: 0 },
  "UPI100": { discount: 100, type: "flat", minOrder: 200 },
  "BOGO": { discount: 30, type: "percent", minOrder: 150 },
  "WELCOME": { discount: 80, type: "flat", minOrder: 100 },
};

// ===================== CART STATE =====================
let cart = JSON.parse(localStorage.getItem("foodCart")) || [];
let currentRestaurantId = null;
let currentPage = "home";
let selectedRestaurant = null;
let orderStatus = null;
let appliedCoupon = null;
let searchQuery = "";
let activeFilter = "all";
let activeCategoryFilter = null;
let userLocation = "Gulberg, Lahore";
