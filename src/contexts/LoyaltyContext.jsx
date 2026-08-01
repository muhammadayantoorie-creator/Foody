import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LoyaltyContext = createContext();

// Badge definitions
export const BADGES = [
  { id: 'first_order', name: 'First Bite', emoji: '🍽️', desc: 'Placed your first order', points: 100, condition: (stats) => stats.totalOrders >= 1 },
  { id: 'ten_orders', name: 'Regular Foodie', emoji: '🔟', desc: 'Completed 10 orders', points: 200, condition: (stats) => stats.totalOrders >= 10 },
  { id: 'night_owl', name: 'Night Owl', emoji: '🦉', desc: 'Ordered after midnight', points: 150, condition: (stats) => stats.midnightOrders >= 1 },
  { id: 'big_spender', name: 'Big Spender', emoji: '💸', desc: 'Spent Rs. 5,000+ total', points: 300, condition: (stats) => stats.totalSpent >= 5000 },
  { id: 'explorer', name: 'Food Explorer', emoji: '🗺️', desc: 'Ordered from 5 different restaurants', points: 200, condition: (stats) => stats.uniqueRestaurants >= 5 },
  { id: 'streak_7', name: '7-Day Streak', emoji: '🔥', desc: 'Ordered 7 days in a row', points: 500, condition: (stats) => stats.streak >= 7 },
  { id: 'referral', name: 'Team Player', emoji: '🤝', desc: 'Referred a friend', points: 250, condition: (stats) => stats.referrals >= 1 },
  { id: 'review_king', name: 'Review King', emoji: '⭐', desc: 'Left 5 reviews', points: 150, condition: (stats) => stats.reviews >= 5 },
];

// Tier system
export const TIERS = [
  { id: 'bronze', name: 'Bronze', emoji: '🥉', minPoints: 0, color: '#CD7F32', perks: ['5% discount on 3rd order', 'Priority support'] },
  { id: 'silver', name: 'Silver', emoji: '🥈', minPoints: 500, color: '#C0C0C0', perks: ['10% discount every order', 'Free delivery 2x/month', '2x points weekends'] },
  { id: 'gold', name: 'Gold', emoji: '🥇', minPoints: 1500, color: '#FFD700', perks: ['15% discount every order', 'Free delivery unlimited', '3x points always'] },
  { id: 'platinum', name: 'Platinum', emoji: '💎', minPoints: 4000, color: '#E5E4E2', perks: ['20% discount always', 'Dedicated concierge', '5x points', 'Early access'] },
];

function loadLoyalty() {
  try {
    const raw = localStorage.getItem('fooddash_loyalty');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    points: 0,
    lifetimePoints: 0,
    earnedBadges: [],
    lastCheckIn: null,
    stats: {
      totalOrders: 0,
      totalSpent: 0,
      midnightOrders: 0,
      uniqueRestaurants: [],
      streak: 0,
      lastOrderDate: null,
      referrals: 0,
      reviews: 0,
    },
    referralCode: 'FOOD-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
  };
}

export function LoyaltyProvider({ children }) {
  const [loyalty, setLoyalty] = useState(loadLoyalty);

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem('fooddash_loyalty', JSON.stringify(loyalty));
    } catch {}
  }, [loyalty]);

  const currentTier = TIERS.slice().reverse().find(t => loyalty.lifetimePoints >= t.minPoints) || TIERS[0];
  const nextTier = TIERS.find(t => t.minPoints > loyalty.lifetimePoints) || null;

  // Award points
  const awardPoints = useCallback((amount, reason = '') => {
    setLoyalty(prev => ({
      ...prev,
      points: prev.points + amount,
      lifetimePoints: prev.lifetimePoints + amount,
    }));
  }, []);

  // Spend points (redemption)
  const spendPoints = useCallback((amount) => {
    setLoyalty(prev => {
      if (prev.points < amount) return prev;
      return { ...prev, points: prev.points - amount };
    });
  }, []);

  // Record an order (updates stats)
  const recordOrder = useCallback((orderAmount, restaurantId) => {
    setLoyalty(prev => {
      const now = new Date();
      const isNight = now.getHours() >= 0 && now.getHours() < 4;
      const todayStr = now.toDateString();
      const lastStr = prev.stats.lastOrderDate;
      const isConsecutive = lastStr && new Date(lastStr).toDateString() !== todayStr && 
        (now - new Date(lastStr)) < 172800000; // within 2 days

      const newStats = {
        ...prev.stats,
        totalOrders: prev.stats.totalOrders + 1,
        totalSpent: prev.stats.totalSpent + orderAmount,
        midnightOrders: prev.stats.midnightOrders + (isNight ? 1 : 0),
        uniqueRestaurants: prev.stats.uniqueRestaurants.includes(restaurantId)
          ? prev.stats.uniqueRestaurants
          : [...prev.stats.uniqueRestaurants, restaurantId],
        streak: isConsecutive ? prev.stats.streak + 1 : (todayStr === lastStr ? prev.stats.streak : 1),
        lastOrderDate: now.toISOString(),
      };

      // Check new badges
      const newBadges = BADGES.filter(b =>
        !prev.earnedBadges.includes(b.id) && b.condition({ ...newStats, uniqueRestaurants: newStats.uniqueRestaurants.length })
      ).map(b => b.id);

      const pointsEarned = Math.floor(orderAmount / 100) * 10; // 10 pts per Rs.100
      const badgePoints = newBadges.reduce((acc, bid) => acc + (BADGES.find(b => b.id === bid)?.points || 0), 0);

      return {
        ...prev,
        points: prev.points + pointsEarned + badgePoints,
        lifetimePoints: prev.lifetimePoints + pointsEarned + badgePoints,
        earnedBadges: [...prev.earnedBadges, ...newBadges],
        stats: newStats,
      };
    });
  }, []);

  // Daily check-in
  const checkIn = useCallback(() => {
    const today = new Date().toDateString();
    if (loyalty.lastCheckIn === today) return { success: false, reason: 'Already checked in today' };

    setLoyalty(prev => ({
      ...prev,
      points: prev.points + 50,
      lifetimePoints: prev.lifetimePoints + 50,
      lastCheckIn: today,
    }));
    return { success: true, points: 50 };
  }, [loyalty.lastCheckIn]);

  const canCheckIn = loyalty.lastCheckIn !== new Date().toDateString();

  return (
    <LoyaltyContext.Provider value={{
      loyalty,
      currentTier,
      nextTier,
      badges: BADGES,
      tiers: TIERS,
      awardPoints,
      spendPoints,
      recordOrder,
      checkIn,
      canCheckIn,
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  return useContext(LoyaltyContext);
}
