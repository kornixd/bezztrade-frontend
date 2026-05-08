import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App.jsx';

export default function Home() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.totalBalance !== undefined) {
        setBalance(data.totalBalance);
        setUser(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>BezzTrade</div>
        <div style={styles.headerRight}>
          <button style={styles.notifBtn}>🔔</button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerLeft}>
          <div style={styles.bannerTitle}>🎉 Welcome Bonus</div>
          <div style={styles.bannerSub}>Get 100% bonus on first deposit!</div>
        </div>
      </div>

      {/* Balance Card */}
      <div style={styles.balanceCard}>
        <div style={styles.welcomeText}>Welcome back,</div>
        <div style={styles.username}>{user.username || 'User'}</div>
        <div style={styles.balanceLabel}>Total Balance</div>
        <div style={styles.balanceAmount}>${balance.toFixed(2)}</div>
        <div style={styles.balanceSub}>USDT</div>

        <div style={styles.actionRow}>
          <button style={styles.actionBtn} onClick={() => navigate('/deposit')}>
            ⬇️ Deposit
          </button>
          <button style={styles.actionBtnOutline} onClick={() => navigate('/withdraw')}>
            ⬆️ Withdraw
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        {[
          { icon: '📢', label: 'Announcement' },
          { icon: '💰', label: 'Deposit', path: '/deposit' },
          { icon: '💳', label: 'Withdraw', path: '/withdraw' },
          { icon: '🎁', label: 'Activity' },
          { icon: '👥', label: 'Invite', path: '/invite' },
          { icon: '📊', label: 'Markets' },
          { icon: '📖', label: 'Help' },
          { icon: '🎧', label: 'Service' }
        ].map((item, i) => (
          <div
            key={i}
            style={styles.quickItem}
            onClick={() => item.path && navigate(item.path)}
          >
            <div style={styles.quickIcon}>{item.icon}</div>
            <div style={styles.quickLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Games Section */}
      <div style={styles.sectionTitle}>— Games —</div>

      <div style={styles.gamesGrid}>
        <div style={styles.gameCard} onClick={() => navigate('/wingo')}>
          <div style={styles.gameEmoji}>🎨</div>
          <div style={styles.gameName}>Win Go</div>
          <div style={styles.gameDesc}>Predict colors & win big</div>
        </div>
        <div style={styles.gameCard}>
          <div style={styles.gameEmoji}>💥</div>
          <div style={styles.gameName}>Crash</div>
          <div style={styles.gameDesc}>Trade before it crashes!</div>
        </div>
        <div style={styles.gameCard}>
          <div style={styles.gameEmoji}>🎱</div>
          <div style={styles.gameName}>Lottery</div>
          <div style={styles.gameDesc}>Pick numbers to win</div>
        </div>
        <div style={styles.gameCard}>
          <div style={styles.gameEmoji}>🎰</div>
          <div style={styles.gameName}>Slots</div>
          <div style={styles.gameDesc}>Spin to win jackpot</div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', path: '/' },
          { icon: '🎮', label: 'Games', path: '/wingo' },
          { icon: '👛', label: 'Wallet', path: '/wallet' },
          { icon: '👥', label: 'Invite', path: '/invite' },
          { icon: '👤', label: 'Profile', path: '/profile' }
        ].map((item, i) => (
          <div
            key={i}
            style={i === 0 ? styles.navItemActive : styles.navItem}
            onClick={() => navigate(item.path)}
          >
            <div style={styles.navIcon}>{item.icon}</div>
            <div style={i === 0 ? styles.navLabelActive : styles.navLabel}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0b0f',
    paddingBottom: '80px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 16px 8px'
  },
  logo: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#f0b90b'
  },
  headerRight: { display: 'flex', gap: '8px' },
  notifBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer'
  },
  banner: {
    margin: '8px 16px',
    background: 'linear-gradient(135deg, #1a2a3a, #0d1f2d)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #2a3a4a'
  },
  bannerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f0b90b',
    marginBottom: '4px'
  },
  bannerSub: { color: '#8a8f9b', fontSize: '14px' },
  balanceCard: {
    margin: '12px 16px',
    background: '#161920',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #2a2d3e'
  },
  welcomeText: { color: '#8a8f9b', fontSize: '13px' },
  username: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '12px'
  },
  balanceLabel: { color: '#8a8f9b', fontSize: '12px' },
  balanceAmount: {
    color: '#f0b90b',
    fontSize: '36px',
    fontWeight: '800'
  },
  balanceSub: { color: '#8a8f9b', fontSize: '12px', marginBottom: '16px' },
  actionRow: { display: 'flex', gap: '12px' },
  actionBtn: {
    flex: 1,
    background: '#f0b90b',
    color: '#0a0b0f',
    fontWeight: '700',
    fontSize: '14px',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer'
  },
  actionBtnOutline: {
    flex: 1,
    background: 'transparent',
    color: '#f0b90b',
    fontWeight: '700',
    fontSize: '14px',
    padding: '12px',
    borderRadius: '12px',
    border: '2px solid #f0b90b',
    cursor: 'pointer'
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    padding: '12px 16px'
  },
  quickItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  },
  quickIcon: {
    width: '52px',
    height: '52px',
    background: '#1c1f2a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px'
  },
  quickLabel: {
    color: 'white',
    fontSize: '11px',
    textAlign: 'center'
  },
  sectionTitle: {
    color: '#8a8f9b',
    fontSize: '14px',
    textAlign: 'center',
    margin: '8px 0'
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    padding: '8px 16px'
  },
  gameCard: {
    background: '#161920',
    borderRadius: '16px',
    padding: '20px 16px',
    cursor: 'pointer',
    border: '1px solid #2a2d3e'
  },
  gameEmoji: { fontSize: '32px', marginBottom: '8px' },
  gameName: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  gameDesc: { color: '#8a8f9b', fontSize: '12px' },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '430px',
    background: '#161920',
    borderTop: '1px solid #2a2d3e',
    display: 'flex',
    padding: '8px 0'
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
    padding: '4px'
  },
  navItemActive: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
    padding: '4px'
  },
  navIcon: { fontSize: '20px' },
  navLabel: { color: '#8a8f9b', fontSize: '11px' },
  navLabelActive: { color: '#f0b90b', fontSize: '11px', fontWeight: '700' }
};
