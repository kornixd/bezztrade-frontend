import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App.jsx';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('deposit');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBalance(data.balance || 0);
      setBonusBalance(data.bonusBalance || 0);
      setTotalDeposited(data.totalDeposited || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const totalBalance = balance + bonusBalance;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={styles.title}>Wallet</div>
        <div style={{ width: '36px' }} />
      </div>

      {/* Total Balance Card */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceLabel}>Total Balance</div>
        <div style={styles.balanceAmount}>${totalBalance.toFixed(2)}</div>
        <div style={styles.balanceRow}>
          <div style={styles.balanceSub}>
            <div style={styles.subLabel}>Main Balance</div>
            <div style={styles.subValue}>${balance.toFixed(2)}</div>
          </div>
          <div style={styles.divider} />
          <div style={styles.balanceSub}>
            <div style={styles.subLabel}>Bonus</div>
            <div style={{ ...styles.subValue, color: '#f0b90b' }}>
              ${bonusBalance.toFixed(2)}
            </div>
          </div>
          <div style={styles.divider} />
          <div style={styles.balanceSub}>
            <div style={styles.subLabel}>Deposited</div>
            <div style={{ ...styles.subValue, color: '#00c087' }}>
              ${totalDeposited.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Requirements */}
      <div style={styles.requirementsCard}>
        <div style={styles.reqTitle}>⚠️ Withdrawal Requirements</div>
        <div style={styles.reqItem}>
          <span style={totalDeposited >= 5 ? styles.checkGreen : styles.checkGrey}>
            {totalDeposited >= 5 ? '✅' : '⬜'}
          </span>
          Deposit at least $5 (${totalDeposited.toFixed(2)} / $5)
        </div>
        <div style={styles.reqItem}>
          <span style={styles.checkGreen}>✅</span>
          1x trading volume (Done)
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['deposit', 'withdraw', 'history'].map(tab => (
          <button
            key={tab}
            style={activeTab === tab ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bonus Banner */}
      <div style={styles.bonusBanner}>
        🎁 <span style={{ color: '#00c087', fontWeight: '700' }}>
          Free $10 bonus
        </span> credited on account creation! Deposit $5 to unlock withdrawals.
      </div>

      {activeTab === 'deposit' && (
        <div style={styles.section}>
          <div style={styles.paymentLabel}>Payment Method</div>
          <div style={styles.paymentCard} onClick={() => navigate('/deposit')}>
            <div style={styles.paymentIcon}>💎</div>
            <div>
              <div style={styles.paymentName}>USDT TRC20</div>
              <div style={styles.paymentSub}>Unlimited amount</div>
            </div>
            <div style={styles.chevron}>›</div>
          </div>
          <button style={styles.actionBtn} onClick={() => navigate('/deposit')}>
            Deposit Now
          </button>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div style={styles.section}>
          <button style={styles.actionBtn} onClick={() => navigate('/withdraw')}>
            Withdraw Now
          </button>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={styles.section}>
          {transactions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <div style={styles.emptyText}>No transactions yet</div>
            </div>
          ) : transactions.map((tx, i) => (
            <div key={i} style={styles.txRow}>
              <div>
                <div style={styles.txType}>{tx.type?.replace('_', ' ').toUpperCase()}</div>
                <div style={styles.txDate}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{
                ...styles.txAmount,
                color: tx.amount > 0 ? '#00c087' : '#f6465d'
              }}>
                {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
              </div>
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
            style={i === 2 ? styles.navItemActive : styles.navItem}
            onClick={() => navigate(item.path)}
          >
            <div>{item.icon}</div>
            <div style={i === 2 ? styles.navLabelActive : styles.navLabel}>
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
    padding: '16px',
    borderBottom: '1px solid #2a2d3e'
  },
  backBtn: {
    background: '#1c1f2a',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer'
  },
  title: { color: 'white', fontWeight: '700', fontSize: '18px' },
  balanceCard: {
    background: '#161920',
    margin: '16px',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #2a2d3e'
  },
  balanceLabel: { color: '#8a8f9b', fontSize: '13px' },
  balanceAmount: {
    color: '#f0b90b',
    fontSize: '40px',
    fontWeight: '800',
    margin: '8px 0'
  },
  balanceRow: {
    display: 'flex',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #2a2d3e'
  },
  balanceSub: { flex: 1, textAlign: 'center' },
  subLabel: { color: '#8a8f9b', fontSize: '12px' },
  subValue: { color: 'white', fontWeight: '700', fontSize: '16px', marginTop: '4px' },
  divider: { width: '1px', background: '#2a2d3e' },
  requirementsCard: {
    background: '#1a1500',
    border: '1px solid #f0b90b',
    margin: '0 16px',
    borderRadius: '14px',
    padding: '16px'
  },
  reqTitle: { color: '#f0b90b', fontWeight: '700', fontSize: '14px', marginBottom: '10px' },
  reqItem: {
    color: '#8a8f9b',
    fontSize: '13px',
    marginBottom: '6px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  checkGreen: { color: '#00c087' },
  checkGrey: { color: '#4a4f5e' },
  tabs: {
    display: 'flex',
    background: '#161920',
    margin: '16px',
    borderRadius: '14px',
    padding: '4px'
  },
  tab: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#8a8f9b',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  tabActive: {
    flex: 1,
    background: 'white',
    border: 'none',
    color: '#0a0b0f',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700'
  },
  bonusBanner: {
    background: '#0d2016',
    border: '1px solid #00c087',
    margin: '0 16px',
    borderRadius: '14px',
    padding: '14px',
    color: '#00c087',
    fontSize: '13px'
  },
  section: { padding: '16px' },
  paymentLabel: { color: '#8a8f9b', fontSize: '13px', marginBottom: '8px' },
  paymentCard: {
    background: '#161920',
    border: '2px solid #f0b90b',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    marginBottom: '16px'
  },
  paymentIcon: { fontSize: '28px' },
  paymentName: { color: 'white', fontWeight: '700', fontSize: '15px' },
  paymentSub: { color: '#8a8f9b', fontSize: '12px' },
  chevron: { color: '#8a8f9b', fontSize: '20px', marginLeft: 'auto' },
  actionBtn: {
    width: '100%',
    background: '#f0b90b',
    color: '#0a0b0f',
    fontWeight: '700',
    fontSize: '16px',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 0'
  },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { color: '#8a8f9b', fontSize: '14px' },
  txRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #2a2d3e'
  },
  txType: { color: 'white', fontWeight: '600', fontSize: '14px' },
  txDate: { color: '#8a8f9b', fontSize: '12px', marginTop: '2px' },
  txAmount: { fontWeight: '700', fontSize: '16px' },
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
