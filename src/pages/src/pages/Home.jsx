import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../main.jsx'

export default function Home() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [balance, setBalance] = useState(0)
  const navigate = useNavigate()

  useEffect(() => { fetchBalance() }, [])

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.totalBalance !== undefined) {
        setBalance(data.totalBalance)
        setUser(prev => ({ ...prev, ...data }))
      }
    } catch (err) { console.error(err) }
  }

  const quickActions = [
    { icon: '📢', label: 'Announcement' },
    { icon: '💰', label: 'Deposit', path: '/deposit' },
    { icon: '💳', label: 'Withdraw', path: '/withdraw' },
    { icon: '🎁', label: 'Activity' },
    { icon: '👥', label: 'Invite', path: '/invite' },
    { icon: '📊', label: 'Markets' },
    { icon: '📖', label: 'Help' },
    { icon: '🎧', label: 'Service' }
  ]

  const games = [
    { emoji: '🎨', name: 'Win Go', desc: 'Predict colors & win big', path: '/wingo' },
    { emoji: '💥', name: 'Crash', desc: 'Trade before it crashes!' },
    { emoji: '🎱', name: 'Lottery', desc: 'Pick numbers to win' },
    { emoji: '🎰', name: 'Slots', desc: 'Spin to win jackpot' }
  ]

  const navItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🎮', label: 'Games', path: '/wingo' },
    { icon: '👛', label: 'Wallet', path: '/wallet' },
    { icon: '👥', label: 'Invite', path: '/invite' },
    { icon: '👤', label: 'Profile', path: '/profile' }
  ]

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.logo}>BezzTrade</div>
        <button style={s.notifBtn}>🔔</button>
      </div>

      <div style={s.banner}>
        <div style={s.bannerTitle}>🎉 Welcome Bonus</div>
        <div style={s.bannerSub}>Get 100% bonus on first deposit!</div>
      </div>

      <div style={s.balanceCard}>
        <div style={s.welcomeText}>Welcome back,</div>
        <div style={s.username}>{user.username || 'User'}</div>
        <div style={s.balanceLabel}>Total Balance</div>
        <div style={s.balanceAmount}>${balance.toFixed(2)}</div>
        <div style={s.balanceSub}>USDT</div>
        <div style={s.actionRow}>
          <button style={s.actionBtn} onClick={() => navigate('/deposit')}>⬇️ Deposit</button>
          <button style={s.actionBtnOutline} onClick={() => navigate('/withdraw')}>⬆️ Withdraw</button>
        </div>
      </div>

      <div style={s.quickGrid}>
        {quickActions.map((item, i) => (
          <div key={i} style={s.quickItem} onClick={() => item.path && navigate(item.path)}>
            <div style={s.quickIcon}>{item.icon}</div>
            <div style={s.quickLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={s.sectionTitle}>— Games —</div>

      <div style={s.gamesGrid}>
        {games.map((game, i) => (
          <div key={i} style={s.gameCard} onClick={() => game.path && navigate(game.path)}>
            <div style={s.gameEmoji}>{game.emoji}</div>
            <div style={s.gameName}>{game.name}</div>
            <div style={s.gameDesc}>{game.desc}</div>
          </div>
        ))}
      </div>

      <div style={s.bottomNav}>
        {navItems.map((item, i) => (
          <div key={i} style={i === 0 ? s.navActive : s.navItem} onClick={() => navigate(item.path)}>
            <div style={s.navIcon}>{item.icon}</div>
            <div style={i === 0 ? s.navLabelActive : s.navLabel}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#0a0b0f', paddingBottom: '80px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px' },
  logo: { fontSize: '22px', fontWeight: '800', color: '#f0b90b' },
  notifBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
  banner: { margin: '8px 16px', background: 'linear-gradient(135deg, #1a2a3a, #0d1f2d)', borderRadius: '16px', padding: '20px', border: '1px solid #2a3a4a' },
  bannerTitle: { fontSize: '20px', fontWeight: '700', color: '#f0b90b', marginBottom: '4px' },
  bannerSub: { color: '#8a8f9b', fontSize: '14px' },
  balanceCard: { margin: '12px 16px', background: '#161920', borderRadius: '20px', padding: '20px', border: '1px solid #2a2d3e' },
  welcomeText: { color: '#8a8f9b', fontSize: '13px' },
  username: { color: 'white', fontSize: '22px', fontWeight: '700', marginBottom: '12px' },
  balanceLabel: { color: '#8a8f9b', fontSize: '12px' },
  balanceAmount: { color: '#f0b90b', fontSize: '36px', fontWeight: '800' },
  balanceSub: { color: '#8a8f9b', fontSize: '12px', marginBottom: '16px' },
  actionRow: { display: 'flex', gap: '12px' },
  actionBtn: { flex: 1, background: '#f0b90b', color: '#0a0b0f', fontWeight: '700', fontSize: '14px', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' },
  actionBtnOutline: { flex: 1, background: 'transparent', color: '#f0b90b', fontWeight: '700', fontSize: '14px', padding: '12px', borderRadius: '12px', border: '2px solid #f0b90b', cursor: 'pointer' },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px 16px' },
  quickItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' },
  quickIcon: { width: '52px', height: '52px', background: '#1c1f2a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
  quickLabel: { color: 'white', fontSize: '11px', textAlign: 'center' },
  sectionTitle: { color: '#8a8f9b', fontSize: '14px', textAlign: 'center', margin: '8px 0' },
  gamesGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '8px 16px' },
  gameCard: { background: '#161920', borderRadius: '16px', padding: '20px 16px', cursor: 'pointer', border: '1px solid #2a2d3e' },
  gameEmoji: { fontSize: '32px', marginBottom: '8px' },
  gameName: { color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '4px' },
  gameDesc: { color: '#8a8f9b', fontSize: '12px' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#161920', borderTop: '1px solid #2a2d3e', display: 'flex', padding: '8px 0' },
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', padding: '4px' },
  navActive: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', padding: '4px' },
  navIcon: { fontSize: '20px' },
  navLabel: { color: '#8a8f9b', fontSize: '11px' },
  navLabelActive: { color: '#f0b90b', fontSize: '11px', fontWeight: '700' }
}
