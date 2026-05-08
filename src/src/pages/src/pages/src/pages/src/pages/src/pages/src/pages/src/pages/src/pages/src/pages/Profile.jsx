import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App.jsx';

export default function Profile() {
  const [user, setUser] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUser(data);

      const txRes = await fetch(`${API}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const txData = await txRes.json();
      setTransactions(txData.transactions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const gameBets = transactions.filter(tx =>
    tx.type === 'game_bet' || tx.type === 'game_win'
  );
  const wins = transactions.filter(tx => tx.type === 'game_win');
  const totalProfit = wins.reduce((sum, tx) => sum + tx.amount, 0) -
    Math.abs(transactions
      .filter(tx => tx.type === 'game_bet')
      .reduce((sum, tx) => sum + tx.amount, 0));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Profile</div>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>

      {/* User Card */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>
          <div style={styles.avatarText}>
            {user.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.username}>{user.username || 'User'}</div>
          <div style={styles.email}>{user.email || ''}</div>
          <div style={styles.vipBadge}>👑 VIP {user.vipLevel || 0}</div>
        </div>
        <div style={styles.balanceInfo}>
          <div style={styles.balanceLabel}>Balance</div>
          <div style={styles.balanceValue}>${(user.totalBalance || 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{gameBets.length}</div>
          <div style={styles.statLabel}>Games</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{wins.length}</div>
          <div style={styles.statLabel}>Won</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {gameBets.length > 0
              ? Math.round((wins.length / gameBets.length) * 100)
              : 0}%
          </div>
          <div style={styles.statLabel}>Win Rate</div>
        </div>
        <div style={styles.statCard}>
          <div style={{
            ...styles.statValue,
            color: totalProfit >= 0 ? '#00c087' : '#f6465d'
          }}>
            ${Math.abs(totalProfit).toFixed(0)}
          </div>
          <div style={styles.statLabel}>Profit</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { key: 'orders', label: 'Game Orders' },
          { key: 'transactions', label: 'Transactions' },
          { key: 'account', label: 'Account' }
        ].map(tab => (
          <button
            key={tab.key}
            style={activeTab === tab.key ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div style={styles.list}>
          {gameBets.length === 0 ? (
            <div style={styles.empty}>No game orders yet</div>
          ) : gameBets.map((tx, i) => (
            <div key={i} style={styles.txRow}>
              <div>
                <div style={styles.txType}>
                  {tx.type === 'game_win' ? '🏆 Game Win' : '🎮 Game Bet'}
                </div>
                <div style={styles.txDate}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{
                color: tx.amount > 0 ? '#00c087' : '#f6465d',
                fontWeight: '700'
              }}>
                {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div style={styles.list}>
          {transactions.length === 0 ? (
            <div style={styles.empty}>No transactions yet</div>
          ) : transactions.map((tx, i) => (
            <div key={i} style={styles.txRow}>
              <div>
                <div style={styles.txType}>
                  {tx.type?.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={styles.txDate}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{
                color: tx.amount > 0 ? '#00c087' : '#f6465d',
                fontWeight: '700'
              }}>
                {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'account' && (
        <div style={styles.list}>
          {[
            { label: 'Username', value: user.username },
            { label: 'Email', value: user.email },
            { label: 'VIP Level', value: `VIP ${user.vipLevel || 0}` },
            { label: 'Total Deposited', value: `$${(user.totalDeposited || 0).toFixed(2)}` },
            { label: 'Total Withdrawn', value: `$${(user.totalWithdrawn || 0).toFixed(2)}` },
            { label: 'Referral Code', value: user.referralCode }
          ].map((item, i) => (
            <div key={i} style={styles.accountRow}>
              <div style={styles.accountLabel}>{item.label}</div>
              <div style={styles.accountValue}>{item.value || '—'}</div>
            </div>
          ))}
        </div>
      )}

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
            style={i === 4 ? styles.navItemActive : styles.navItem}
            onClick={() => navigate(item.path)}
          >
            <div>{item.icon}</div>
            <div style={i === 4 ? styles.navLabelActive : styles.navLabel}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0b0f', paddingBottom: '80px' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #2a2d3e'
  },
  title: { color: 'white', fontWeight: '700', fontSize: '18px' },
  logoutBtn: {
    background: '#f6465d',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 16px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px'
  },
  userCard: {
    background: '#161920',
    margin: '16px',
    borderRadius: '20px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #2a2d3e'
  },
  avatar: {
    width: '64px',
    height: '64px',
    background: '#1c1f2a',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { color: '#f0b90b', fontSize: '28px', fontWeight: '800' },
  userInfo: { flex: 1 },
  username: { color: 'white', fontWeight: '700', fontSize: '18px' },
  email: { color: '#8a8f9b', fontSize: '12px', marginTop: '2px' },
  vipBadge: { color: '#f0b90b', fontSize: '13px', fontWeight: '600', marginTop: '4px' },
  balanceInfo: { textAlign: 'right' },
  balanceLabel: { color: '#8a8f9b', fontSize: '12px' },
  balanceValue: { color: '#f0b90b', fontSize: '20px', fontWeight: '800' },
  statsRow: {
    display: 'flex',
    gap: '8px',
    padding: '0 16px',
    marginBottom: '16px'
  },
  statCard: {
    flex: 1,
    background: '#161920',
    borderRadius: '14px',
    padding: '14px 8px',
    textAlign: 'center',
    border: '1px solid #2a2d3e'
  },
  statValue: { color: 'white', fontWeight: '800', fontSize: '18px' },
  statLabel: { color: '#8a8f9b', fontSize: '11px', marginTop: '4px' },
  tabs: {
    display: 'flex',
    background: '#161920',
    margin: '0 16px 16px',
    borderRadius: '14px',
    padding: '4px'
  },
  tab: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#8a8f9b',
    padding: '10px 4px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },
  tabActive: {
    flex: 1,
    background: 'white',
    border: 'none',
    color: '#0a0b0f',
    padding: '10px 4px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700'
  },
  list: { padding: '0 16px' },
  empty: {
    textAlign: 'center',
    color: '#8a8f9b',
    padding: '40px 0',
    fontSize: '14px'
  },
  txRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #2a2d3e'
  },
  txType: { color: 'white', fontWeight: '600', fontSize: '14px' },
  txDate: { color: '#8a8f9b', fontSize: '12px', marginTop: '2px' },
  accountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #2a2d3e'
  },
  accountLabel: { color: '#8a8f9b', fontSize: '14px' },
  accountValue: { color: 'white', fontWeight: '600', fontSize: '14px' },
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
    padding: '4px',
    fontSize: '20px'
  },
  navItemActive: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
    padding: '4px',
    fontSize: '20px'
  },
  navLabel: { color: '#8a8f9b', fontSize: '11px' },
  navLabelActive: { color: '#f0b90b', fontSize: '11px', fontWeight: '700' }
};
