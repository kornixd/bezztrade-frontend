import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../main.jsx'

export default function Profile() {
  const [user, setUser] = useState({})
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState('orders')
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/balance`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      setUser(data)
      const txRes = await fetch(`${API}/api/transactions`, { headers: { 'Authorization': `Bearer ${token}` } })
      const txData = await txRes.json()
      setTransactions(txData.transactions || [])
    } catch (err) { console.error(err) }
  }

  const logout = () => { localStorage.clear(); navigate('/login') }

  const gameBets = transactions.filter(tx => tx.type === 'game_bet' || tx.type === 'game_win')
  const wins = transactions.filter(tx => tx.type === 'game_win')
  const totalProfit = wins.reduce((sum,tx) => sum + tx.amount, 0) - Math.abs(transactions.filter(tx => tx.type === 'game_bet').reduce((sum,tx) => sum + tx.amount, 0))

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.title}>Profile</div>
        <button style={s.logoutBtn} onClick={logout}>Logout</button>
      </div>
      <div style={s.userCard}>
        <div style={s.avatar}><div style={s.avatarText}>{user.username?.charAt(0)?.toUpperCase() || 'U'}</div></div>
        <div style={s.userInfo}>
          <div style={s.username}>{user.username || 'User'}</div>
          <div style={s.email}>{user.email || ''}</div>
          <div style={s.vipBadge}>👑 VIP {user.vipLevel || 0}</div>
        </div>
        <div style={s.balInfo}>
          <div style={s.balLabel}>Balance</div>
          <div style={s.balVal}>${(user.totalBalance || 0).toFixed(2)}</div>
        </div>
      </div>
      <div style={s.statsRow}>
        {[{val:gameBets.length,label:'Games'},{val:wins.length,label:'Won'},{val:`${gameBets.length>0?Math.round((wins.length/gameBets.length)*100):0}%`,label:'Win Rate'},{val:`$${Math.abs(totalProfit).toFixed(0)}`,label:'Profit',color:totalProfit>=0?'#00c087':'#f6465d'}].map((stat,i) => (
          <div key={i} style={s.statCard}>
            <div style={{ ...s.statVal, color: stat.color || 'white' }}>{stat.val}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
      <div style={s.tabs}>
        {[{key:'orders',label:'Game Orders'},{key:'transactions',label:'Transactions'},{key:'account',label:'Account'}].map(tab => (
          <button key={tab.key} style={activeTab===tab.key?s.tabActive:s.tab} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
        ))}
      </div>
      {activeTab === 'orders' && (
        <div style={s.list}>
          {gameBets.length === 0 ? <div style={s.empty}>No game orders yet</div> : gameBets.map((tx,i) => (
            <div key={i} style={s.txRow}>
              <div>
                <div style={s.txType}>{tx.type==='game_win'?'🏆 Game Win':'🎮 Game Bet'}</div>
                <div style={s.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ color: tx.amount>0?'#00c087':'#f6465d', fontWeight: '700' }}>
                {tx.amount>0?'+':''}${Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'transactions' && (
        <div style={s.list}>
          {transactions.length === 0 ? <div style={s.empty}>No transactions yet</div> : transactions.map((tx,i) => (
            <div key={i} style={s.txRow}>
              <div>
                <div style={s.txType}>{tx.type?.replace(/_/g,' ').toUpperCase()}</div>
                <div style={s.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ color: tx.amount>0?'#00c087':'#f6465d', fontWeight: '700' }}>
                {tx.amount>0?'+':''}${Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'account' && (
        <div style={s.list}>
          {[{label:'Username',val:user.username},{label:'Email',val:user.email},{label:'VIP Level',val:`VIP ${user.vipLevel||0}`},{label:'Total Deposited',val:`$${(user.totalDeposited||0).toFixed(2)}`},{label:'Total Withdrawn',val:`$${(user.totalWithdrawn||0).toFixed(2)}`},{label:'Referral Code',val:user.referralCode}].map((item,i) => (
            <div key={i} style={s.accRow}>
              <div style={s.accLabel}>{item.label}</div>
              <div style={s.accVal}>{item.val || '—'}</div>
            </div>
          ))}
        </div>
      )}
      <div style={s.bottomNav}>
        {[{icon:'🏠',label:'Home',path:'/'},{icon:'🎮',label:'Games',path:'/wingo'},{icon:'👛',label:'Wallet',path:'/wallet'},{icon:'👥',label:'Invite',path:'/invite'},{icon:'👤',label:'Profile',path:'/profile'}].map((item,i) => (
          <div key={i} style={i===4?s.navActive:s.navItem} onClick={() => navigate(item.path)}>
            <div style={{ fontSize: '20px' }}>{item.icon}</div>
            <div style={i===4?s.navLabelActive:s.navLabel}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#0a0b0f', paddingBottom: '80px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #2a2d3e' },
  title: { color: 'white', fontWeight: '700', fontSize: '18px' },
  logoutBtn: { background: '#f6465d', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },
  userCard: { background: '#161920', margin: '16px', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #2a2d3e' },
  avatar: { width: '64px', height: '64px', background: '#1c1f2a', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#f0b90b', fontSize: '28px', fontWeight: '800' },
  userInfo: { flex: 1 },
  username: { color: 'white', fontWeight: '700', fontSize: '18px' },
  email: { color: '#8a8f9b', fontSize: '12px', marginTop: '2px' },
  vipBadge: { color: '#f0b90b', fontSize: '13px', fontWeight: '600', marginTop: '4px' },
  balInfo: { textAlign: 'right' },
  balLabel: { color: '#8a8f9b', fontSize: '12px' },
  balVal: { color: '#f0b90b', fontSize: '20px', fontWeight: '800' },
  statsRow: { display: 'flex', gap: '8px', padding: '0 16px', marginBottom: '16px' },
  statCard: { flex: 1, background: '#161920', borderRadius: '14px', padding: '14px 8px', textAlign: 'center', border: '1px solid #2a2d3e' },
  statVal: { fontWeight: '800', fontSize: '18px' },
  statLabel: { color: '#8a8f9b', fontSize: '11px', marginTop: '4px' },
  tabs: { display: 'flex', background: '#161920', margin: '0 16px 16px', borderRadius: '14px', padding: '4px' },
  tab: { flex: 1, background: 'transparent', border: 'none', color: '#8a8f9b', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  tabActive: { flex: 1, background: 'white', border: 'none', color: '#0a0b0f', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  list: { padding: '0 16px' },
  empty: { textAlign: 'center', color: '#8a8f9b', padding: '40px 0', fontSize: '14px' },
  txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #2a2d3e' },
  txType: { color: 'white', fontWeight: '600', fontSize: '14px' },
  txDate: { color: '#8a8f9b', fontSize: '12px', marginTop: '2px' },
  accRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #2a2d3e' },
  accLabel: { color: '#8a8f9b', fontSize: '14px' },
  accVal: { color: 'white', fontWeight: '600', fontSize: '14px' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#161920', borderTop: '1px solid #2a2d3e', display: 'flex', padding: '8px 0' },
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', padding: '4px' },
  navActive: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', padding: '4px' },
  navLabel: { color: '#8a8f9b', fontSize: '11px' },
  navLabelActive: { color: '#f0b90b', fontSize: '11px', fontWeight: '700' }
}
