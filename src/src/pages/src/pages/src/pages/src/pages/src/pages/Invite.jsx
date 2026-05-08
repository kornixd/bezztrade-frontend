import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../main.jsx'

export default function Invite() {
  const [referralData, setReferralData] = useState(null)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchReferrals() }, [])

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/referrals`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      setReferralData(data)
    } catch (err) { console.error(err) }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralData?.referralLink || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join BezzTrade', text: `Join BezzTrade and get $10 bonus! Code: ${referralData?.referralCode}`, url: referralData?.referralLink })
    }
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={s.title}>Invite & Earn</div>
        <div style={{ width: '36px' }} />
      </div>
      <div style={s.content}>
        <div style={s.subtitle}>Invite friends, earn commissions forever</div>
        <div style={s.telegramBanner}>
          <div style={{ fontSize: '24px' }}>✈️</div>
          <div><div style={s.telegramTitle}>Join Our Telegram Channel</div><div style={s.telegramSub}>Earn extra rewards for members</div></div>
          <div style={s.joinBtn}>Join →</div>
        </div>
        <div style={s.statsRow}>
          {[{icon:'👥',val:referralData?.totalReferred||0,label:'People Invited'},{icon:'📈',val:referralData?.activeUsers||0,label:'Active Players'},{icon:'🏆',val:`$${referralData?.totalCommission||0}`,label:'Commission',gold:true}].map((stat,i) => (
            <div key={i} style={s.statCard}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ ...s.statVal, color: stat.gold ? '#f0b90b' : 'white' }}>{stat.val}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={s.codeCard}>
          <div style={s.codeLabel}>Your Referral Code</div>
          <div style={s.codeRow}>
            <div style={s.code}>{referralData?.referralCode || '--------'}</div>
            <button style={s.copyCodeBtn} onClick={copyLink}>📋</button>
          </div>
          <div style={s.codeBtns}>
            <button style={s.copyLinkBtn} onClick={copyLink}>📋 {copied ? 'Copied!' : 'Copy Link'}</button>
            <button style={s.shareBtn} onClick={share}>🔗 Share</button>
          </div>
        </div>
        <div style={s.invBalCard}>
          <div style={s.invBalLabel}>Your Invitation Balance</div>
          <div style={s.invBalAmount}>${referralData?.totalCommission || '0.00'}</div>
          <div style={s.invBalSub}>Earned from {referralData?.totalReferred || 0} referrals · Auto-credited to wallet</div>
        </div>
        <div style={s.bonusCard}>
          <div style={s.bonusTitle}>🎁 Registration Bonus</div>
          <div style={s.bonusSub}>New users get $10 USDT when they sign up with your referral code. You earn $5 USDT for each successful referral!</div>
        </div>
      </div>
      <div style={s.bottomNav}>
        {[{icon:'🏠',label:'Home',path:'/'},{icon:'🎮',label:'Games',path:'/wingo'},{icon:'👛',label:'Wallet',path:'/wallet'},{icon:'👥',label:'Invite',path:'/invite'},{icon:'👤',label:'Profile',path:'/profile'}].map((item,i) => (
          <div key={i} style={i===3?s.navActive:s.navItem} onClick={() => navigate(item.path)}>
            <div style={{ fontSize: '20px' }}>{item.icon}</div>
            <div style={i===3?s.navLabelActive:s.navLabel}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#0a0b0f', paddingBottom: '80px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #2a2d3e' },
  backBtn: { background: '#1c1f2a', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'white', fontSize: '18px', cursor: 'pointer' },
  title: { color: 'white', fontWeight: '700', fontSize: '18px' },
  content: { padding: '16px' },
  subtitle: { color: '#8a8f9b', fontSize: '14px', marginBottom: '16px' },
  telegramBanner: { background: '#0d1526', border: '1px solid #3b82f6', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  telegramTitle: { color: '#3b82f6', fontWeight: '700', fontSize: '14px' },
  telegramSub: { color: '#8a8f9b', fontSize: '12px' },
  joinBtn: { color: '#3b82f6', fontWeight: '700', marginLeft: 'auto', cursor: 'pointer' },
  statsRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  statCard: { flex: 1, background: '#161920', borderRadius: '14px', padding: '14px 8px', textAlign: 'center', border: '1px solid #2a2d3e' },
  statVal: { fontWeight: '800', fontSize: '20px' },
  statLabel: { color: '#8a8f9b', fontSize: '11px', marginTop: '4px' },
  codeCard: { background: '#161920', borderRadius: '16px', padding: '20px', border: '1px solid #f0b90b', marginBottom: '16px' },
  codeLabel: { color: '#8a8f9b', fontSize: '13px', marginBottom: '8px' },
  codeRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  code: { color: '#f0b90b', fontSize: '28px', fontWeight: '900', letterSpacing: '2px' },
  copyCodeBtn: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' },
  codeBtns: { display: 'flex', gap: '8px' },
  copyLinkBtn: { flex: 1, background: '#f0b90b', color: '#0a0b0f', fontWeight: '700', fontSize: '14px', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' },
  shareBtn: { flex: 1, background: 'transparent', color: '#f0b90b', fontWeight: '700', fontSize: '14px', padding: '12px', borderRadius: '12px', border: '2px solid #f0b90b', cursor: 'pointer' },
  invBalCard: { background: '#0d2016', borderRadius: '14px', padding: '16px', border: '1px solid #00c087', marginBottom: '16px' },
  invBalLabel: { color: '#8a8f9b', fontSize: '13px' },
  invBalAmount: { color: '#00c087', fontSize: '32px', fontWeight: '800', margin: '4px 0' },
  invBalSub: { color: '#8a8f9b', fontSize: '12px' },
  bonusCard: { background: '#1a1500', borderRadius: '14px', padding: '16px', border: '1px solid #f0b90b' },
  bonusTitle: { color: '#f0b90b', fontWeight: '700', fontSize: '15px', marginBottom: '8px' },
  bonusSub: { color: '#8a8f9b', fontSize: '13px', lineHeight: '1.5' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#161920', borderTop: '1px solid #2a2d3e', display: 'flex', padding: '8px 0' },
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', padding: '4px' },
  navActive: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', padding: '4px' },
  navLabel: { color: '#8a8f9b', fontSize: '11px' },
  navLabelActive: { color: '#f0b90b', fontSize: '11px', fontWeight: '700' }
}
