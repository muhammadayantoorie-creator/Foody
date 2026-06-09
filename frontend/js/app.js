// DOM Elements
const pages = {
  home: document.getElementById('home-page'),
  restaurant: document.getElementById('restaurant-page'),
  tracking: document.getElementById('tracking-page')
};

const elements = {
  categoriesGrid: document.getElementById('categories-grid'),
  offersGrid: document.getElementById('offers-grid'),
  restaurantGrid: document.getElementById('restaurant-grid'),
  cartOverlay: document.getElementById('cart-overlay'),
  cartBtn: document.getElementById('cart-btn'),
  closeCartBtn: document.getElementById('close-cart'),
  cartBadge: document.getElementById('cart-badge'),
  cartItemsContainer: document.getElementById('cart-items-container'),
  emptyCartState: document.getElementById('empty-cart-state'),
  billDetails: document.getElementById('bill-details'),
  cartTotal: document.getElementById('cart-total'),
  checkoutBtn: document.getElementById('checkout-btn'),
  searchInput: document.getElementById('search-input'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  navLogo: document.getElementById('nav-logo')
};

// Initialize App
function initApp() {
  renderCategories();
  renderOffers();
  renderRestaurants(restaurants);
  updateCartUI();
  setupEventListeners();
}

// Render Categories
function renderCategories() {
  elements.categoriesGrid.innerHTML = categories.map(cat => `
    <div class="category-card" onclick="filterByCategory('${cat.name}')">
      <div class="category-icon">${cat.icon}</div>
      <div class="category-name">${cat.name}</div>
    </div>
  `).join('');
}

// Render Offers
function renderOffers() {
  elements.offersGrid.innerHTML = offers.map(offer => `
    <div class="offer-card" style="background: ${offer.gradient}">
      <div class="offer-icon">${offer.icon}</div>
      <div class="offer-title">${offer.title}</div>
      <p>${offer.subtitle}</p>
      <div class="offer-code">${offer.code}</div>
    </div>
  `).join('');
}

// Render Restaurants
function renderRestaurants(data) {
  if(data.length === 0) {
    elements.restaurantGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-light);">No restaurants found.</div>`;
    return;
  }

  elements.restaurantGrid.innerHTML = data.map(res => `
    <div class="restaurant-card" onclick="openRestaurant(${res.id})">
      <div class="restaurant-img-wrapper" style="position:relative;">
        <img src="${res.image}" alt="${res.name}" class="restaurant-img">
        ${res.offer ? `<div class="restaurant-offer">${res.offer}</div>` : ''}
        ${!res.isOpen ? `<div style="position:absolute; inset:0; background:rgba(255,255,255,0.7); display:flex; align-items:center; justify-content:center; font-weight:bold; color:var(--primary); font-size:1.2rem;">Currently Closed</div>` : ''}
      </div>
      <div class="restaurant-info">
        <div class="restaurant-header">
          <div class="restaurant-name">${res.name}</div>
          <div class="restaurant-rating"><i class="fas fa-star"></i> ${res.rating}</div>
        </div>
        <div class="restaurant-meta">
          <div class="restaurant-cuisine">${res.cuisine.join(', ')}</div>
          <div class="restaurant-price">${res.priceRange}</div>
        </div>
        <div class="restaurant-footer">
          <span><i class="far fa-clock"></i> ${res.deliveryTime}</span>
          <span style="margin-left: 15px;"><i class="fas fa-map-marker-alt"></i> ${res.distance}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Navigation
function navigateTo(pageId) {
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[pageId].classList.add('active');
  currentPage = pageId;
  window.scrollTo(0, 0);
}

// Open Restaurant
function openRestaurant(id) {
  const res = restaurants.find(r => r.id === id);
  if(!res || !res.isOpen) return;

  selectedRestaurant = res;
  
  // Render Cover & Info
  document.getElementById('detail-cover').src = res.image;
  document.getElementById('detail-title').innerText = res.name;
  document.getElementById('detail-tags').innerText = res.cuisine.join(', ');
  document.getElementById('detail-meta').innerHTML = `
    <span class="restaurant-rating"><i class="fas fa-star"></i> ${res.rating} (${res.reviews}+)</span>
    <span style="margin-left: 20px;"><i class="far fa-clock"></i> ${res.deliveryTime}</span>
    <span style="margin-left: 20px;"><i class="fas fa-map-marker-alt"></i> ${res.distance}</span>
  `;

  // Render Menu
  const menuData = menuItems[id];
  if(menuData) {
    const navHtml = menuData.categories.map((cat, index) => `
      <div class="menu-nav-item ${index === 0 ? 'active' : ''}" onclick="scrollToCategory('${cat.name.replace(/\s+/g, '-')}')">
        ${cat.name}
      </div>
    `).join('');
    
    document.getElementById('menu-nav').innerHTML = navHtml;

    const contentHtml = menuData.categories.map(cat => `
      <div class="menu-category" id="cat-${cat.name.replace(/\s+/g, '-')}">
        <h3 class="menu-category-title">${cat.name}</h3>
        ${cat.items.map(item => renderMenuItem(item)).join('')}
      </div>
    `).join('');

    document.getElementById('menu-content').innerHTML = contentHtml;
  } else {
    document.getElementById('menu-content').innerHTML = "<p>Menu updating...</p>";
  }

  navigateTo('restaurant');
}

function renderMenuItem(item) {
  const cartItem = cart.find(c => c.id === item.id);
  const qty = cartItem ? cartItem.qty : 0;

  return `
    <div class="menu-item">
      <div class="item-info">
        <div class="item-type ${item.isVeg ? 'veg' : 'non-veg'}"></div>
        <div class="item-name">${item.name}</div>
        <div class="item-price">Rs. ${item.price}</div>
        <div class="item-desc">${item.desc}</div>
      </div>
      <div class="item-image-wrapper">
        <img src="${item.image}" alt="${item.name}" class="item-image">
        ${qty === 0 
          ? `<button class="add-btn" onclick="addToCart(${item.id})">ADD</button>`
          : `<div class="qty-control">
              <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
              <span class="qty-val">${qty}</span>
              <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
             </div>`
        }
      </div>
    </div>
  `;
}

// Cart Logic
function addToCart(itemId) {
  if(!selectedRestaurant) return;
  
  // Check if adding from different restaurant
  if(cart.length > 0 && currentRestaurantId !== selectedRestaurant.id) {
    if(confirm("Your cart contains items from another restaurant. Do you want to discard them and add this item?")) {
      cart = [];
      appliedCoupon = null;
    } else {
      return;
    }
  }

  currentRestaurantId = selectedRestaurant.id;
  
  // Find item in menu
  let itemToAdd;
  menuItems[currentRestaurantId].categories.forEach(cat => {
    const found = cat.items.find(i => i.id === itemId);
    if(found) itemToAdd = found;
  });

  if(itemToAdd) {
    cart.push({...itemToAdd, qty: 1});
    saveCart();
    renderMenuUpdates();
    updateCartUI();
  }
}

function updateQty(itemId, change) {
  const itemIndex = cart.findIndex(c => c.id === itemId);
  if(itemIndex > -1) {
    cart[itemIndex].qty += change;
    if(cart[itemIndex].qty <= 0) {
      cart.splice(itemIndex, 1);
    }
    if(cart.length === 0) {
      currentRestaurantId = null;
      appliedCoupon = null;
    }
    saveCart();
    renderMenuUpdates();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem("foodCart", JSON.stringify(cart));
}

function renderMenuUpdates() {
  if(currentPage === 'restaurant' && selectedRestaurant) {
    openRestaurant(selectedRestaurant.id); // Re-render to update buttons
  }
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  elements.cartBadge.innerText = totalQty;
  elements.cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';

  if(cart.length === 0) {
    elements.cartItemsContainer.style.display = 'none';
    elements.billDetails.style.display = 'none';
    elements.checkoutBtn.style.display = 'none';
    elements.emptyCartState.style.display = 'block';
    return;
  }

  elements.emptyCartState.style.display = 'none';
  elements.cartItemsContainer.style.display = 'flex';
  elements.billDetails.style.display = 'block';
  elements.checkoutBtn.style.display = 'block';

  elements.cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-name">
        <div class="item-type ${item.isVeg ? 'veg' : 'non-veg'}" style="display:inline-flex; width:10px; height:10px; margin-right:5px;"></div>
        ${item.name}
      </div>
      <div class="cart-item-controls">
        <button onclick="updateQty(${item.id}, -1)">-</button>
        <span>${item.qty}</span>
        <button onclick="updateQty(${item.id}, 1)">+</button>
      </div>
      <div class="cart-item-price">Rs. ${item.price * item.qty}</div>
    </div>
  `).join('');

  calculateBill();
}

function calculateBill() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = selectedRestaurant ? selectedRestaurant.deliveryFee : (currentRestaurantId ? restaurants.find(r=>r.id===currentRestaurantId).deliveryFee : 30);
  const taxes = Math.round(subtotal * 0.05); // 5% tax
  
  let discount = 0;
  if(appliedCoupon && coupons[appliedCoupon]) {
    const coupon = coupons[appliedCoupon];
    if(subtotal >= coupon.minOrder) {
      if(coupon.type === 'percent') discount = Math.round(subtotal * (coupon.discount / 100));
      if(coupon.type === 'flat') discount = coupon.discount;
      if(coupon.type === 'delivery') discount = deliveryFee;
    } else {
      appliedCoupon = null; // invalid
    }
  }

  const total = subtotal + deliveryFee + taxes - discount;

  document.getElementById('bill-subtotal').innerText = `Rs. ${subtotal}`;
  document.getElementById('bill-delivery').innerText = `Rs. ${deliveryFee}`;
  document.getElementById('bill-tax').innerText = `Rs. ${taxes}`;
  
  if(discount > 0) {
    document.getElementById('bill-discount').parentElement.style.display = 'flex';
    document.getElementById('bill-discount').innerText = `-Rs. ${discount}`;
  } else {
    document.getElementById('bill-discount').parentElement.style.display = 'none';
  }

  elements.cartTotal.innerText = `Rs. ${total}`;
}

// Filtering & Search
function filterByCategory(catName) {
  activeCategoryFilter = activeCategoryFilter === catName ? null : catName;
  applyFilters();
}

function applyFilters() {
  let filtered = [...restaurants];
  
  // Search
  if(searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.cuisine.join(' ').toLowerCase().includes(q)
    );
  }

  // Category
  if(activeCategoryFilter) {
    filtered = filtered.filter(r => r.category === activeCategoryFilter || r.cuisine.includes(activeCategoryFilter));
  }

  // Sort
  if(activeFilter === 'rating') filtered.sort((a,b) => b.rating - a.rating);
  if(activeFilter === 'delivery') filtered.sort((a,b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
  if(activeFilter === 'cost-lh') filtered.sort((a,b) => parseInt(a.priceRange.replace(/\D/g,'')) - parseInt(b.priceRange.replace(/\D/g,'')));

  renderRestaurants(filtered);
}

function placeOrder() {
  if(cart.length === 0) return;
  elements.cartOverlay.classList.remove('active');
  navigateTo('tracking');
  startTracking();
  cart = [];
  saveCart();
  updateCartUI();
}

function startTracking() {
  const steps = document.querySelectorAll('.step');
  const fill = document.getElementById('progress-fill');
  
  let currentStep = 0;
  steps.forEach(s => s.classList.remove('active'));
  steps[0].classList.add('active');
  fill.style.width = '0%';

  const interval = setInterval(() => {
    currentStep++;
    if(currentStep < steps.length) {
      steps[currentStep].classList.add('active');
      fill.style.width = `${(currentStep / (steps.length - 1)) * 100}%`;
    } else {
      clearInterval(interval);
    }
  }, 3000); // simulate progress every 3s
}

function setupEventListeners() {
  elements.navLogo.addEventListener('click', () => {
    activeCategoryFilter = null;
    activeFilter = 'all';
    searchQuery = "";
    elements.searchInput.value = "";
    applyFilters();
    navigateTo('home');
  });

  elements.cartBtn.addEventListener('click', () => {
    elements.cartOverlay.classList.add('active');
  });

  elements.closeCartBtn.addEventListener('click', () => {
    elements.cartOverlay.classList.remove('active');
  });

  elements.searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    applyFilters();
  });

  elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      elements.filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.dataset.filter;
      applyFilters();
    });
  });

  elements.checkoutBtn.addEventListener('click', placeOrder);

  const citySelector = document.getElementById('city-selector');
  if(citySelector) {
    citySelector.addEventListener('change', (e) => {
      userLocation = e.target.value;
      const deliveryTitle = document.getElementById('delivery-title');
      if (deliveryTitle) {
        deliveryTitle.innerText = `Delivery Restaurants in ${userLocation}`;
      }
    });
  }
}

// Init
window.onload = initApp;
