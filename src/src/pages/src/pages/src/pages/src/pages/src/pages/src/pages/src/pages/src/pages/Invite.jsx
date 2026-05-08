import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App.jsx';

export default function Invite() {
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/referrals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReferralData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralData?.referralLink || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join BezzTrade',
        text: `Join BezzTrade and get $10 bonus! Use my referral code: ${referralData?.referralCode}`,
        url: referralData?.referralLink
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={styles.title}>Invite & Earn</div>
        <div style={{ width: '36px' }} />
      </div>

      <div style={styles.content}>
        {/* Sub title */}
        <div style={styles.subtitle}>
          Invite friends, earn commissions forever
        </div>

        {/* Telegram Banner */}
        <div style={styles.telegramBanner}>
          <div style={styles.telegramIcon}>✈️</div>
          <div>
            <div style={styles.telegramTitle}>Join Our Telegram Channel</div>
            <div style={styles.telegramSub}>Earn extra rewards for members</div>
          </div>
          <div style={styles.joinBtn}>Join →</div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statValue}>{referralData?.totalReferred || 0}</div>
            <div style={styles.statLabel}>People Invited</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📈</div>
            <div style={styles.statValue}>{referralData?.activeUsers || 0}</div>
            <div style={styles.statLabel}>Active Players</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏆</div>
            <div style={{ ...styles.statValue, color: '#f0b90b' }}>
              ${referralData?.totalCommission || 0}
            </div>
            <div style={styles.statLabel}>Commission</div>
          </div>
        </div>

        {/* Referral Code Card */}
        <div style={styles.codeCard}>
          <div style={styles.codeLabel}>Your Referral Code</div>
          <div style={styles.codeRow}>
            <div style={styles.code}>{referralData?.referralCode || '--------'}</div>
            <button style={styles.copyCodeBtn} onClick={copyLink}>📋</button>
          </div>
          <div style={styles.codeBtns}>
            <button style={styles.copyLinkBtn} onClick={copyLink}>
              📋 {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button style={styles.shareBtn} onClick={share}>
              🔗 Share
            </button>
          </div>
        </div>

        {/* Invitation Balance */}
        <div style={styles.inviteBalanceCard}>
          <div style={styles.inviteBalanceLabel}>Your Invitation Balance</div>
          <div style={styles.inviteBalanceAmount}>
            ${referralData?.totalCommission || '0.00'}
          </div>
          <div style={styles.inviteBalanceSub}>
            Earned from {referralData?.totalReferred || 0} referrals · Auto-credited to wallet
          </div>
        </div>

        {/* Registration Bonus */}
        <div style={styles.bonusCard}>
          <div style={styles.bonusTitle}>🎁 Registration Bonus</div>
          <div style={styles.bonusSub}>
            New users get $10 USDT when they sign up with your referral code.
            You earn $5 USDT for each successful referral!
          </div>
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
            style={i === 3 ? styles.navItemActive : styles.navItem}
            onClick={() => navigate(item.path)}
          >
            <div>{item.icon}</div>
            <div style={i === 3 ? styles.navLabelActive : styles.navLabel}>
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
  content: { padding: '16px' },
  subtitle: { color: '#8a8f9b', fontSize: '14px', marginBottom: '16px' },
  telegramBanner: {
    background: '#0d1526',
    border: '1px solid #3b82f6',
    borderRadius: '14px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  telegramIcon: { fontSize: '24px' },
  telegramTitle: { color: '#3b82f6', fontWeight: '700', fontSize: '14px' },
  telegramSub: { color: '#8a8f9b', fontSize: '12px' },
  joinBtn: { color: '#3b82f6', fontWeight: '700', marginLeft: 'auto', cursor: 'pointer' },
  statsRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  statCard: {
    flex: 1,
    background: '#161920',
    borderRadius: '14px',
    padding: '14px 8px',
    textAlign: 'center',
    border: '1px solid #2a2d3e'
  },
  statIcon: { fontSize: '20px', marginBottom: '4px' },
  statValue: { color: 'white', fontWeight: '800', fontSize: '20px' },
  statLabel: { color: '#8a8f9b', fontSize: '11px', marginTop: '4px' },
  codeCard: {
    background: '#161920',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #f0b90b',
    marginBottom: '16px'
  },
  codeLabel: { color: '#8a8f9b', fontSize: '13px', marginBottom: '8px' },
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  code: { color: '#f0b90b', fontSize: '28px', fontWeight: '900', letterSpacing: '2px' },
  copyCodeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer'
  },
  codeBtns: { display: 'flex', gap: '8px' },
  copyLinkBtn: {
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
  shareBtn: {
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
  inviteBalanceCard: {
    background: '#0d2016',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid #00c087',
    marginBottom: '16px'
  },
  inviteBalanceLabel: { color: '#8a8f9b', fontSize: '13px' },
  inviteBalanceAmount: { color: '#00c087', fontSize: '32px', fontWeight: '800', margin: '4px 0' },
  inviteBalanceSub: { color: '#8a8f9b', fontSize: '12px' },
  bonusCard: {
    background: '#1a1500',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid #f0b90b'
  },
  bonusTitle: { color: '#f0b90b', fontWeight: '700', fontSize: '15px', marginBottom: '8px' },
  bonusSub: { color: '#8a8f9b', fontSize: '13px', lineHeight: '1.5' },
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
