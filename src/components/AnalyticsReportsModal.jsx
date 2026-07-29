import React, { useState } from 'react';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import toast from 'react-hot-toast';
import {
  BarChart3, TrendingUp, DollarSign, Users, Award, Calendar, Download,
  Printer, Mail, FileSpreadsheet, FileText, RefreshCw, X, ArrowUpRight, Clock
} from 'lucide-react';

export default function AnalyticsReportsModal({ isOpen, onClose }) {
  const { formatPrice, formatPKRDate, isRTL } = useLanguageCurrency();
  const [timeframe, setTimeframe] = useState('weekly'); // daily | weekly | monthly

  // Mock revenue chart points
  const REVENUE_DATA = {
    daily: [
      { label: '08:00', revenue: 4200, orders: 12 },
      { label: '12:00', revenue: 18500, orders: 48 },
      { label: '16:00', revenue: 9800, orders: 24 },
      { label: '20:00', revenue: 34200, orders: 92 },
      { label: '23:00', revenue: 12400, orders: 31 },
    ],
    weekly: [
      { label: 'Mon', revenue: 48000, orders: 140 },
      { label: 'Tue', revenue: 56000, orders: 165 },
      { label: 'Wed', revenue: 62000, orders: 180 },
      { label: 'Thu', revenue: 74000, orders: 210 },
      { label: 'Fri', revenue: 110000, orders: 340 },
      { label: 'Sat', revenue: 135000, orders: 410 },
      { label: 'Sun', revenue: 128000, orders: 390 },
    ],
    monthly: [
      { label: 'Week 1', revenue: 380000, orders: 1120 },
      { label: 'Week 2', revenue: 420000, orders: 1250 },
      { label: 'Week 3', revenue: 490000, orders: 1480 },
      { label: 'Week 4', revenue: 560000, orders: 1710 },
    ]
  };

  if (!isOpen) return null;

  const currentData = REVENUE_DATA[timeframe];
  const maxRev = Math.max(...currentData.map(d => d.revenue));
  const totalPeriodRevenue = currentData.reduce((acc, d) => acc + d.revenue, 0);
  const totalPeriodOrders = currentData.reduce((acc, d) => acc + d.orders, 0);

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Period,Revenue_PKR,Orders\n";
    currentData.forEach(row => {
      csvContent += `${row.label},${row.revenue},${row.orders}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FoodDash_Analytics_${timeframe}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Analytics CSV report exported successfully! 📊');
  };

  // Export PDF simulation
  const handleExportPDF = () => {
    toast.success('Generating Executive PDF Report… File ready! 📄');
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Email Report
  const handleEmailReport = () => {
    toast.success('Executive summary report emailed to your address 📩');
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={{ ...styles.modal, direction: isRTL ? 'rtl' : 'ltr' }}
        onClick={e => e.stopPropagation()}
        className="animate-scale-in"
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.iconWrap}>
              <BarChart3 size={22} color="#FF6B35" />
            </div>
            <div>
              <h3 style={styles.title}>
                {isRTL ? 'اینالیٹکس اور مالیاتی رپورٹس' : 'Enterprise Analytics & Financial Reports'}
              </h3>
              <p style={styles.subtitle}>Revenue performance, peak hours, and product growth in Pakistan</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close (Esc)">
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div style={styles.toolbar}>
          {/* Timeframe selector */}
          <div style={styles.timeframePills}>
            {['daily', 'weekly', 'monthly'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  ...styles.tfBtn,
                  background: timeframe === tf ? '#FF6B35' : '#FFFFFF',
                  color: timeframe === tf ? '#FFFFFF' : '#475569',
                  fontWeight: timeframe === tf ? 800 : 600,
                }}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export Action Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={handleExportCSV} style={styles.exportBtn} title="Export Excel / CSV">
              <FileSpreadsheet size={14} color="#10B981" /> CSV
            </button>
            <button onClick={handleExportPDF} style={styles.exportBtn} title="Export PDF">
              <FileText size={14} color="#EF4444" /> PDF
            </button>
            <button onClick={handlePrint} style={styles.exportBtn} title="Print Report">
              <Printer size={14} color="#3B82F6" /> Print
            </button>
            <button onClick={handleEmailReport} style={styles.exportBtn} title="Email Report">
              <Mail size={14} color="#8B5CF6" /> Email
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div style={styles.bodyContent}>
          {/* Top KPI Cards */}
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={styles.kpiLabel}>Total Period Revenue</span>
                <div style={{ background: '#FFF7F0', padding: '6px', borderRadius: '8px' }}><DollarSign size={16} color="#FF6B35" /></div>
              </div>
              <div style={styles.kpiValue}>{formatPrice(totalPeriodRevenue)}</div>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>↑ +24.8% vs last period</span>
            </div>

            <div style={styles.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={styles.kpiLabel}>Completed Orders</span>
                <div style={{ background: '#EEF2FF', padding: '6px', borderRadius: '8px' }}><TrendingUp size={16} color="#6366F1" /></div>
              </div>
              <div style={styles.kpiValue}>{totalPeriodOrders.toLocaleString()}</div>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>↑ +18.2% vs last period</span>
            </div>

            <div style={styles.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={styles.kpiLabel}>Peak Order Hour</span>
                <div style={{ background: '#ECFDF5', padding: '6px', borderRadius: '8px' }}><Clock size={16} color="#10B981" /></div>
              </div>
              <div style={styles.kpiValue}>8:00 PM - 10:00 PM</div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Pakistani Dinner Peak</span>
            </div>
          </div>

          {/* Revenue Visual Chart */}
          <div style={styles.chartBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                Revenue Distribution ({timeframe.toUpperCase()})
              </h4>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Amounts in PKR (₨)</span>
            </div>

            {/* Custom CSS Bar Chart */}
            <div style={styles.barChartContainer}>
              {currentData.map((pt, i) => {
                const heightPct = Math.round((pt.revenue / maxRev) * 100);
                return (
                  <div key={i} style={styles.barCol}>
                    <div style={styles.barTooltip}>{formatPrice(pt.revenue)}</div>
                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.barFill,
                          height: `${heightPct}%`,
                          background: i === currentData.length - 1 ? 'linear-gradient(180deg, #FF6B35, #FF8C42)' : 'linear-gradient(180deg, #3B82F6, #60A5FA)',
                        }}
                      />
                    </div>
                    <div style={styles.barLabel}>{pt.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popular Products Ranking Table */}
          <div style={styles.rankingBox}>
            <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
              🏆 Top Performing Dishes in Pakistan
            </h4>
            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', textTransform: 'uppercase', color: '#64748B', fontSize: '0.7rem' }}>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Item Name</th>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Units Sold</th>
                    <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Double Bacon Smash Burger', cat: 'Burgers', qty: 1420, rev: 21285 },
                    { name: 'Margherita DOC Pizza', cat: 'Pizzas', qty: 980, rev: 17640 },
                    { name: 'Shahi Special Chicken Biryani', cat: 'Desi Cuisine', qty: 890, rev: 11560 },
                    { name: 'Carnitas & Birria Tacos', cat: 'Tacos', qty: 640, rev: 8950 },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#0F172A' }}>{row.name}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#64748B' }}>{row.cat}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#334155' }}>{row.qty.toLocaleString()} units</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#FF6B35' }}>{formatPrice(row.rev)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            Automated Financial Intelligence · FoodDash Pakistan
          </span>
          <button onClick={onClose} style={styles.primaryBtn}>
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(11, 15, 25, 0.75)',
    backdropFilter: 'blur(12px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  modal: {
    width: '100%',
    maxWidth: '820px',
    background: '#FFFFFF',
    borderRadius: '28px',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '88vh',
    border: '1.5px solid #F1F5F9',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.75rem',
    borderBottom: '1.5px solid #F1F5F9',
    background: '#FAFAFA',
  },
  iconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#FFF7F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #FFE0D1',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#0F172A',
    fontFamily: 'var(--font-heading)',
  },
  subtitle: {
    margin: '2px 0 0',
    fontSize: '0.78rem',
    color: '#64748B',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.75rem',
    background: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  timeframePills: {
    display: 'flex',
    gap: '4px',
    background: '#E2E8F0',
    padding: '3px',
    borderRadius: '10px',
  },
  tfBtn: {
    padding: '0.35rem 0.85rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.72rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0.4rem 0.75rem',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#334155',
    fontWeight: 700,
    fontSize: '0.76rem',
    cursor: 'pointer',
  },
  bodyContent: {
    padding: '1.5rem 1.75rem',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  kpiCard: {
    background: '#F8FAFC',
    borderRadius: '18px',
    padding: '1.1rem',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  kpiLabel: {
    fontSize: '0.76rem',
    fontWeight: 700,
    color: '#64748B',
  },
  kpiValue: {
    fontSize: '1.35rem',
    fontWeight: 900,
    color: '#0F172A',
    fontFamily: 'var(--font-heading)',
  },
  chartBox: {
    background: '#F8FAFC',
    borderRadius: '20px',
    padding: '1.25rem',
    border: '1px solid #E2E8F0',
  },
  barChartContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '180px',
    paddingTop: '20px',
    gap: '1rem',
  },
  barCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
  },
  barTooltip: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: '#0F172A',
    marginBottom: '6px',
  },
  barTrack: {
    width: '100%',
    maxWidth: '40px',
    flex: 1,
    background: '#E2E8F0',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: '8px 8px 0 0',
    transition: 'height 0.5s ease',
  },
  barLabel: {
    fontSize: '0.74rem',
    fontWeight: 700,
    color: '#64748B',
    marginTop: '8px',
  },
  rankingBox: {
    background: '#FFFFFF',
  },
  primaryBtn: {
    padding: '0.65rem 1.4rem',
    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.75rem',
    background: '#FAFAFA',
    borderTop: '1px solid #F1F5F9',
  }
};
