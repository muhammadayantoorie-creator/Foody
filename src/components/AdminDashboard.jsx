import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { PageSpinner, SectionSpinner, ErrorBanner } from '../components/LoadingSpinner';

const ORDER_STATUSES = ['Pending', 'Preparing', 'Picked Up', 'Delivered', 'Cancelled'];
// Hex values intentionally match design-system tokens so programmatic alpha suffixes (e.g. + '20') work
// --warning: #DB7C0E | --info: #5D5FEF | --purple: #8B5CF6 | --success: #1BA672 | --danger: #E23744
const STATUS_COLORS = { Pending: '#DB7C0E', Preparing: '#5D5FEF', 'Picked Up': '#8B5CF6', Delivered: '#1BA672', Cancelled: '#E23744' };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Overview State
  const [stats, setStats] = useState({ users: 0, restaurants: 0, orders: 0, revenue: 0 });
  
  // Analytics State
  const [analyticsData, setAnalyticsData] = useState([]);
  const [salesByRestaurant, setSalesByRestaurant] = useState([]);

  // Orders State
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Form States
  const [newRest, setNewRest] = useState({ name: '', description: '', image_url: '', delivery_time: '30 mins' });
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', image_url: '' });
  
  // Edit States
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editingFoodItem, setEditingFoodItem] = useState(null);

  // Error State
  const [error, setError] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({ app_name: 'Online Food Delivery', support_email: 'support@fooddelivery.com', delivery_fee: '2.99', min_order: '10.00' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    fetchRestaurants();
    fetchAnalytics();
    fetchOverviewData();

    // Set up live statistics with Supabase real-time subscriptions
    const orderSub = supabase.channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOverviewData();
        fetchAnalytics();
        fetchAllOrders();
      }).subscribe();

    const userSub = supabase.channel('admin-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchOverviewData();
        fetchAllUsers();
      }).subscribe();

    const restSub = supabase.channel('admin-restaurants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => {
        fetchOverviewData();
        fetchRestaurants();
      }).subscribe();

    return () => {
      supabase.removeChannel(orderSub);
      supabase.removeChannel(userSub);
      supabase.removeChannel(restSub);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchOverviewData();
      fetchAnalytics();
    }
    if (activeTab === 'orders') fetchAllOrders();
    if (activeTab === 'users') fetchAllUsers();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsersList(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchOverviewData = async () => {
    // Fetch counts and data
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: restaurantsCount } = await supabase.from('restaurants').select('*', { count: 'exact', head: true });
    const { data: ordersData } = await supabase.from('orders').select('total_amount');
    
    let totalRevenue = 0;
    if (ordersData) {
      totalRevenue = ordersData.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    }

    setStats({
      users: usersCount || 0,
      restaurants: restaurantsCount || 0,
      orders: ordersData ? ordersData.length : 0,
      revenue: totalRevenue
    });
  };

  const fetchAllOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, restaurants(name), users:user_id(email, full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAllOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      alert('Failed to update status.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) alert('Failed to delete order.');
    else setAllOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRestaurants(data || []);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    const { data: orders, error } = await supabase.from('orders').select('*, restaurants(name)');
    if (orders && !error) {
      const dateMap = {};
      const restMap = {};
      
      orders.forEach(o => {
        const date = new Date(o.created_at).toLocaleDateString();
        if (!dateMap[date]) dateMap[date] = 0;
        dateMap[date] += o.total_amount;
        
        const rName = o.restaurants?.name || 'Unknown';
        if (!restMap[rName]) restMap[rName] = 0;
        restMap[rName] += o.total_amount;
      });
      
      setAnalyticsData(Object.keys(dateMap).map(k => ({ date: k, sales: parseFloat(dateMap[k].toFixed(2)) })));
      setSalesByRestaurant(Object.keys(restMap).map(k => ({ name: k, sales: parseFloat(restMap[k].toFixed(2)) })));
    }
  };

  const exportAnalyticsToCSV = () => {
    if (!analyticsData.length && !salesByRestaurant.length) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Daily Sales\nDate,Sales ($)\n";
    analyticsData.forEach(row => { csvContent += `${row.date},${row.sales}\n`; });
    
    csvContent += "\nSales by Restaurant\nRestaurant Name,Sales ($)\n";
    salesByRestaurant.forEach(row => { csvContent += `"${row.name}",${row.sales}\n`; });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchFoodItems = async (restaurantId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
      
    if (!error) setFoodItems(data || []);
    setLoading(false);
  };

  const handleSelectRestaurant = (r) => {
    setSelectedRestaurant(r);
    fetchFoodItems(r.id);
  };

  // Restaurant Actions
  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    if (!newRest.name) return;
    
    if (editingRestaurant) {
      const { error } = await supabase.from('restaurants').update({
        name: newRest.name,
        description: newRest.description,
        image_url: newRest.image_url,
        delivery_time: newRest.delivery_time
      }).eq('id', editingRestaurant.id);
      
      if (error) alert("Failed to update restaurant");
      else {
        setNewRest({ name: '', description: '', image_url: '', delivery_time: '30 mins' });
        setEditingRestaurant(null);
        fetchRestaurants();
      }
    } else {
      const { error } = await supabase
        .from('restaurants')
        .insert([{ ...newRest, is_active: true, rating: 5.0 }]);
        
      if (error) {
        alert("Failed to add restaurant");
      } else {
        setNewRest({ name: '', description: '', image_url: '', delivery_time: '30 mins' });
        fetchRestaurants();
      }
    }
  };

  const handleEditRestaurantClick = (r) => {
    setEditingRestaurant(r);
    setNewRest({ name: r.name, description: r.description || '', image_url: r.image_url || '', delivery_time: r.delivery_time || '30 mins' });
  };

  const cancelEditRestaurant = () => {
    setEditingRestaurant(null);
    setNewRest({ name: '', description: '', image_url: '', delivery_time: '30 mins' });
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? All menu items will also be deleted.')) return;
    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (error) alert("Failed to delete restaurant");
    else fetchRestaurants();
  };

  // Food Item Actions
  const handleFoodItemSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    
    if (editingFoodItem) {
      const { error } = await supabase.from('food_items').update({
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        image_url: newItem.image_url
      }).eq('id', editingFoodItem.id);
      
      if (error) alert("Failed to update food item");
      else {
        setNewItem({ name: '', description: '', price: '', image_url: '' });
        setEditingFoodItem(null);
        fetchFoodItems(selectedRestaurant.id);
      }
    } else {
      const { error } = await supabase
        .from('food_items')
        .insert([{ 
          ...newItem, 
          price: parseFloat(newItem.price),
          restaurant_id: selectedRestaurant.id, 
          is_available: true 
        }]);
        
      if (error) {
        alert("Failed to add food item");
      } else {
        setNewItem({ name: '', description: '', price: '', image_url: '' });
        fetchFoodItems(selectedRestaurant.id);
      }
    }
  };

  const handleEditFoodItemClick = (item) => {
    setEditingFoodItem(item);
    setNewItem({ name: item.name, description: item.description || '', price: item.price, image_url: item.image_url || '' });
  };

  const cancelEditFoodItem = () => {
    setEditingFoodItem(null);
    setNewItem({ name: '', description: '', price: '', image_url: '' });
  };

  const handleDeleteFoodItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    const { error } = await supabase.from('food_items').delete().eq('id', id);
    if (error) alert("Failed to delete food item");
    else fetchFoodItems(selectedRestaurant.id);
  };

  // Settings Actions
  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const { data, error } = await supabase.from('app_settings').select('*').limit(1).single();
      if (data && !error) {
        setSettings({
          app_name: data.app_name || 'Online Food Delivery',
          support_email: data.support_email || 'support@fooddelivery.com',
          delivery_fee: data.delivery_fee?.toString() || '2.99',
          min_order: data.min_order?.toString() || '10.00',
        });
      }
    } catch (err) {
      // If table doesn't exist yet, just use defaults
      console.log('Settings not configured yet, using defaults.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSaved(false);
    try {
      const { error } = await supabase.from('app_settings').upsert({
        id: 1,
        app_name: settings.app_name,
        support_email: settings.support_email,
        delivery_fee: parseFloat(settings.delivery_fee),
        min_order: parseFloat(settings.min_order),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      alert('Failed to save settings: ' + (err.message || 'Unknown error'));
    } finally {
      setSettingsLoading(false);
    }
  };

  if (loading && restaurants.length === 0 && !error) return <PageSpinner message="Loading Admin Dashboard..." />;

  const renderContent = () => {
    // RENDER FOOD ITEMS VIEW
    if (selectedRestaurant) {
      return (
        <div>
          <button style={styles.backBtn} onClick={() => setSelectedRestaurant(null)}>
            ← Back to Restaurants
          </button>
          <div style={styles.header}>
            <h2 style={styles.title}>Manage Menu: {selectedRestaurant.name}</h2>
          </div>

          <div style={styles.grid}>
            <div style={styles.panel}>
              <h3>{editingFoodItem ? 'Edit Food Item' : 'Add New Food Item'}</h3>
              <form onSubmit={handleFoodItemSubmit} style={styles.form}>
                <input style={styles.input} placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                <input style={styles.input} placeholder="Price (e.g. 12.99)" type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                <textarea style={styles.input} placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                <input style={styles.input} placeholder="Image URL (optional)" value={newItem.image_url} onChange={e => setNewItem({...newItem, image_url: e.target.value})} />
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button style={{...styles.primaryBtn, flex: 1}} type="submit">
                    {editingFoodItem ? 'Save Changes' : 'Add Food Item'}
                  </button>
                  {editingFoodItem && (
                    <button style={{...styles.secondaryBtn, flex: 1}} type="button" onClick={cancelEditFoodItem}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={styles.panel}>
              <h3>Current Menu ({foodItems.length})</h3>
              <div style={styles.list}>
                {foodItems.map(item => (
                  <div key={item.id} style={styles.card}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={styles.thumb} />
                      ) : (
                        <div style={styles.placeholderThumb}>🍲</div>
                      )}
                      <div>
                        <h4 style={{ margin: '0 0 0.3rem 0' }}>{item.name}</h4>
                        <p style={{ margin: 0, color: 'var(--success)', fontWeight: 'bold' }}>${Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem', flexDirection: 'column'}}>
                      <button style={styles.secondaryBtn} onClick={() => handleEditFoodItemClick(item)}>Edit</button>
                      <button style={{...styles.secondaryBtn, color: 'var(--danger, #e74c3c)'}} onClick={() => handleDeleteFoodItem(item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // RENDER MAIN TABS
    return (
      <>
        <div style={styles.header}>
          <h2 style={styles.title}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
        </div>

        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={styles.overviewGrid}>
              <div style={{...styles.statCard, borderLeft: '4px solid var(--info, #3498db)'}}>
                <div style={styles.statIcon}>👥</div>
                <div>
                  <p style={styles.statLabel}>Total Users</p>
                  <h3 style={styles.statValue}>{stats.users}</h3>
                </div>
              </div>
              <div style={{...styles.statCard, borderLeft: '4px solid var(--warning, #e67e22)'}}>
                <div style={styles.statIcon}>🏪</div>
                <div>
                  <p style={styles.statLabel}>Total Restaurants</p>
                  <h3 style={styles.statValue}>{stats.restaurants}</h3>
                </div>
              </div>
              <div style={{...styles.statCard, borderLeft: '4px solid var(--accent, #9b59b6)'}}>
                <div style={styles.statIcon}>📦</div>
                <div>
                  <p style={styles.statLabel}>Total Orders</p>
                  <h3 style={styles.statValue}>{stats.orders}</h3>
                </div>
              </div>
              <div style={{...styles.statCard, borderLeft: '4px solid var(--success, #2ecc71)'}}>
                <div style={styles.statIcon}>💰</div>
                <div>
                  <p style={styles.statLabel}>Total Revenue</p>
                  <h3 style={styles.statValue}>${stats.revenue.toFixed(2)}</h3>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main, #333)' }}>Analytics & Sales</h3>
              <button onClick={exportAnalyticsToCSV} style={{ ...styles.primaryBtn, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                ⬇️ Export CSV
              </button>
            </div>
            <div style={styles.analyticsGrid}>
              <div style={styles.panel}>
                <h3>Daily Sales</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="var(--primary, #E23744)" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div style={styles.panel}>
                <h3>Sales by Restaurant</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={salesByRestaurant}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="var(--info, #3498db)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {['All', ...ORDER_STATUSES].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '0.4rem 1rem', border: 'none', borderRadius: '20px', cursor: 'pointer',
                    fontWeight: '600', fontSize: '0.85rem',
                    background: statusFilter === s ? (STATUS_COLORS[s] || 'var(--border)') : 'var(--background, #eee)',
                    color: statusFilter === s ? 'var(--text-on-primary, white)' : 'var(--text-muted, #555)',
                    transition: 'all 0.2s',
                  }}
                >{s}</button>
              ))}
              <button onClick={fetchAllOrders} style={{ marginLeft: 'auto', padding: '0.4rem 1rem', border: '1px solid var(--border, #ddd)', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', background: 'var(--surface-solid, #fff)' }}>🔄 Refresh</button>
            </div>

            {ordersLoading ? <SectionSpinner message="Loading orders..." /> : (
              <div style={{ overflowX: 'auto', background: 'var(--surface-solid, #fff)', borderRadius: '8px', border: '1px solid var(--border, #edf2f7)', boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.02))' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Order ID</th>
                      <th style={styles.th}>Customer Name</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Total Price</th>
                      <th style={styles.th}>Action Buttons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders
                      .filter(o => statusFilter === 'All' || o.status === statusFilter)
                      .map(order => (
                        <tr key={order.id}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '700', color: 'var(--text-main, #2d3748)' }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #a0aec0)', marginTop: '0.2rem' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '600', color: 'var(--text-main, #4a5568)' }}>{order.users?.full_name || order.users?.email || 'Unknown'}</div>
                            {order.delivery_address && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #718096)', marginTop: '0.2rem' }}>📍 {order.delivery_address}</div>}
                          </td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, background: (STATUS_COLORS[order.status] || '#333') + '20', color: STATUS_COLORS[order.status] || '#333' }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontWeight: '800', color: 'var(--primary, #e23744)' }}>${Number(order.total_amount).toFixed(2)}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                style={{
                                  padding: '0.4rem', border: '1px solid var(--border, #cbd5e0)',
                                  borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem',
                                  color: 'var(--text-main, #4a5568)', cursor: 'pointer', outline: 'none',
                                  background: 'var(--background, #f8f9fa)',
                                }}
                              >
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)} 
                                style={{ ...styles.secondaryBtn, padding: '0.4rem 0.6rem', color: 'var(--danger, #e74c3c)', fontSize: '0.8rem', background: 'var(--danger-light, #fee2e2)' }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                {allOrders.filter(o => statusFilter === 'All' || o.status === statusFilter).length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted, #aaa)', padding: '2rem' }}>No orders found for this filter.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div style={styles.grid}>
            <div style={styles.panel}>
              <h3>{editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
              <form onSubmit={handleRestaurantSubmit} style={styles.form}>
                <input style={styles.input} placeholder="Restaurant Name" value={newRest.name} onChange={e => setNewRest({...newRest, name: e.target.value})} required />
                <input style={styles.input} placeholder="Delivery Time (e.g. 30-45 mins)" value={newRest.delivery_time} onChange={e => setNewRest({...newRest, delivery_time: e.target.value})} />
                <textarea style={styles.input} placeholder="Description" value={newRest.description} onChange={e => setNewRest({...newRest, description: e.target.value})} />
                <input style={styles.input} placeholder="Image URL (optional)" value={newRest.image_url} onChange={e => setNewRest({...newRest, image_url: e.target.value})} />
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button style={{...styles.primaryBtn, flex: 1}} type="submit">
                    {editingRestaurant ? 'Save Changes' : 'Add Restaurant'}
                  </button>
                  {editingRestaurant && (
                    <button style={{...styles.secondaryBtn, flex: 1}} type="button" onClick={cancelEditRestaurant}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={styles.panel}>
              <h3>Manage Restaurants</h3>
              <div style={styles.list}>
                {restaurants.map(r => (
                  <div key={r.id} style={styles.card}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.name} style={styles.thumb} />
                      ) : (
                        <div style={styles.placeholderThumb}>🏪</div>
                      )}
                      <div>
                        <h4 style={{ margin: '0 0 0.3rem 0' }}>{r.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #888)' }}>{r.is_active ? '🟢 Active' : '🔴 Inactive'}</p>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button style={styles.secondaryBtn} onClick={() => handleSelectRestaurant(r)}>Menu</button>
                      <button style={styles.secondaryBtn} onClick={() => handleEditRestaurantClick(r)}>Edit</button>
                      <button style={{...styles.secondaryBtn, color: 'var(--danger, #e74c3c)'}} onClick={() => handleDeleteRestaurant(r.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={styles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Registered Users</h3>
              <button onClick={fetchAllUsers} style={styles.secondaryBtn}>🔄 Refresh</button>
            </div>
            {usersLoading ? <SectionSpinner message="Loading users..." /> : (
              <div style={{ ...styles.list, maxHeight: '600px' }}>
                {usersList.map(user => (
                  <div key={user.id} style={{ ...styles.card, justifyContent: 'flex-start', gap: '1rem' }}>
                    <div style={{ ...styles.statIcon, width: '40px', height: '40px', fontSize: '1.2rem', padding: '0.5rem' }}>
                      👤
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-main, #333)' }}>{user.email}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #777)' }}>
                        ID: {user.id.slice(0, 8)}... • Registered: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {usersList.length === 0 && <p style={{ color: 'var(--text-muted, #aaa)', padding: '1rem 0' }}>No users found.</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={styles.panel}>
              <h3>General Settings</h3>
              <p style={{ color: 'var(--text-muted, #666)' }}>Configure global application settings.</p>
              {settingsSaved && (
                <div style={{ background: 'var(--success-bg)', color: 'var(--success-dark)', padding: '0.8rem 1.2rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ✅ Settings saved successfully!
                </div>
              )}
              <form style={styles.form} onSubmit={handleSaveSettings}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-main, #444)' }}>App Name</label>
                  <input style={styles.input} type="text" value={settings.app_name} onChange={e => setSettings({ ...settings, app_name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-main, #444)' }}>Support Email</label>
                  <input style={styles.input} type="email" value={settings.support_email} onChange={e => setSettings({ ...settings, support_email: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-main, #444)' }}>Default Delivery Fee ($)</label>
                  <input style={styles.input} type="number" step="0.01" value={settings.delivery_fee} onChange={e => setSettings({ ...settings, delivery_fee: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-main, #444)' }}>Minimum Order Amount ($)</label>
                  <input style={styles.input} type="number" step="0.01" value={settings.min_order} onChange={e => setSettings({ ...settings, min_order: e.target.value })} />
                </div>
                <button style={{ ...styles.primaryBtn, width: 'fit-content', opacity: settingsLoading ? 0.7 : 1 }} disabled={settingsLoading}>
                  {settingsLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
            
            <div style={styles.panel}>
              <h3>Platform Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--background, #f8f9fa)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'var(--text-muted, #718096)' }}>Restaurants</p>
                  <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main, #2d3748)' }}>{restaurants.length}</p>
                </div>
                <div style={{ background: 'var(--background, #f8f9fa)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'var(--text-muted, #718096)' }}>Total Orders</p>
                  <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main, #2d3748)' }}>{stats.orders}</p>
                </div>
                <div style={{ background: 'var(--background, #f8f9fa)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'var(--text-muted, #718096)' }}>Revenue</p>
                  <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--success, #27ae60)' }}>${stats.revenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div style={styles.panel}>
              <h3 style={{ color: 'var(--danger, #e74c3c)' }}>Danger Zone</h3>
              <p style={{ color: 'var(--text-muted, #666)' }}>Irreversible actions and system resets.</p>
              <button 
                style={{ ...styles.primaryBtn, background: 'var(--danger, #e74c3c)', width: 'fit-content' }}
                onClick={() => {
                  if (window.confirm('⚠️ Are you absolutely sure? This will permanently delete ALL orders, reviews, and reset analytics data. This action CANNOT be undone.')) {
                    alert('System reset is disabled in this build for safety.');
                  }
                }}
              >
                Reset System Data
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarLogo}>Admin Panel</h2>
        <nav style={styles.navMenu}>
          {['dashboard', 'orders', 'restaurants', 'users', 'settings'].map(tab => (
            <button
              key={tab}
              style={{...styles.navItem, ...(activeTab === tab ? styles.activeNavItem : {})}}
              onClick={() => {
                setActiveTab(tab);
                setSelectedRestaurant(null);
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div style={styles.mainContent}>
        {renderContent()}
      </div>
    </div>
  );
}

const styles = {
  appContainer: { display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: 'var(--background)' },
  sidebar: { width: '250px', background: 'var(--secondary)', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarLogo: { padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--border)', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.5px' },
  navMenu: { display: 'flex', flexDirection: 'column', padding: '1.5rem 0' },
  navItem: { padding: '1rem 1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', textAlign: 'left', fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.8rem' },
  activeNavItem: { background: 'var(--border)', color: 'var(--text-main)', borderLeft: '4px solid var(--primary)' },
  mainContent: { flex: 1, padding: '2rem 3rem', overflowY: 'auto' },
  header: { marginBottom: '2rem' },
  title: { margin: 0, color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' },
  analyticsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' },
  panel: { background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' },
  primaryBtn: { padding: '0.8rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
  secondaryBtn: { padding: '0.6rem 1rem', background: 'var(--border)', color: 'var(--text-main)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' },
  thumb: { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' },
  placeholderThumb: { width: '50px', height: '50px', borderRadius: '8px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' },
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1rem' },
  statCard: { background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: 'var(--shadow-sm)' },
  statIcon: { fontSize: '2rem', background: 'var(--background)', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' },
  statLabel: { margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: '800' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', margin: 0 },
  th: { padding: '1.2rem 1rem', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'var(--background)' },
  td: { padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.95rem', verticalAlign: 'middle' },
  badge: { padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.75rem', display: 'inline-block' }
};
