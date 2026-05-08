import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../main.jsx'

const GAME_TYPES = [
  { key: 'wingo30s', label: '30 Sec' },
  { key: 'wingo3m', label: '3 Min' },
  { key: 'wingo5m', label: '5 Min' }
]

function getNumberBg(num) {
  if (num === 0) return 'linear-gradient(135deg, #8b5cf6 50%, #f6465d 50%)'
  if (num === 5) return 'linear-gradient(135deg, #8b5cf6 50%, #00c087 50%)'
  if ([1,3,7,9].includes(num)) return '#00c087'
  return '#f6465d'
}

function getResultBg(result) {
  if (!result) return '#8a8f9b'
  if (result.includes('violet_red') || result === 'violet_red') return 'linear-gradient(135deg, #8b5cf6 50%, #f6465d 50%)'
  if (result.includes('violet_green') || result === 'violet_green') return 'linear-gradient(135deg, #8b5cf6 50%, #00c087 50%)'
  if (result === 'green') return '#00c087'
  if (result === 'violet') return '#8b5cf6'
  return '#f6465d'
}

export default function WinGo() {
  const [gameType, setGameType] = useState('wingo30s')
  const [timeLeft, setTimeLeft] = useState(30)
  const [roundId, setRoundId] = useState('')
  const [recentResults, setRecentResults] = useState([])
  const [balance, setBalance] = useState(0)
  const [bonusBalance, setBonusBalance] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedNumber, setSelectedNumber] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [betAmount, setBetAmount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [myBets, setMyBets] = useState([])
  const [activeTab, setActiveTab] = useState('game')
  const intervalRef = useRef(null)
  const fetchRef = useRef(null)
  const navigate = useNavigate()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCurrentRound = async () => {
    try {
      const res = await fetch(`${API}/api/game/wingo/current/${gameType}`)
      const data = await res.json()
      if (data.roundId) { setRoundId(data.roundId); setTimeLeft(data.timeLeft) }
    } catch (err) { console.error(err) }
  }

  const fetchRecentResults = async () => {
    try {
      const res = await fetch(`${API}/api/game/wingo/recent/${gameType}`)
      const data = await res.json()
      setRecentResults(data.results || [])
    } catch (err) { console.error(err) }
  }

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setBalance(data.balance || 0)
      setBonusBalance(data.bonusBalance || 0)
    } catch (err) { console.error(err) }
  }

  const fetchMyBets = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/game/wingo/history?gameType=${gameType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setMyBets(data.bets || [])
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    fetchCurrentRound()
    fetchRecentResults()
    fetchBalance()
    fetchMyBets()

    fetchRef.current = setInterval(() => {
      fetchCurrentRound()
      fetchRecentResults()
    }, 3000)

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          fetchCurrentRound()
          fetchRecentResults()
          fetchBalance()
          fetchMyBets()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(intervalRef.current)
      clearInterval(fetchRef.current)
    }
  }, [gameType])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  }

  const placeBet = async () => {
    if (!selectedColor && selectedNumber === null && !selectedSize) {
      showToast('Please select a color, number or Big/Small', 'error'); return
    }
    if (betAmount < 1) { showToast('Minimum bet is 1 USDT', 'error'); return }
    if (timeLeft < 5) { showToast('Betting is closed for this round', 'error'); return }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const body = { roundId, gameType, amount: betAmount }
      if (selectedNumber !== null) body.number = selectedNumber
      else if (selectedColor) body.color = selectedColor
      else if (selectedSize) body.size = selectedSize

      const res = await fetch(`${API}/api/game/wingo/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) {
        showToast(`✅ Bet placed! Potential: $${data.bet.potentialPayout}`)
        setBalance(data.newBalance)
        setBonusBalance(data.newBonusBalance)
        setSelectedColor(null); setSelectedNumber(null); setSelectedSize(null)
        fetchMyBets()
      } else {
        showToast(data.error || 'Bet failed', 'error')
      }
    } catch (err) { showToast('Connection failed', 'error') }
    setLoading(false)
  }

  const isClosed = timeLeft < 5
  const totalBal = balance + bonusBalance

  const getPotential = () => {
    if (selectedNumber !== null) return (betAmount * 9).toFixed(2)
    if (selectedColor === 'violet') return (betAmount * 4.5).toFixed(2)
    return (betAmount * 1.95).toFixed(2)
  }

  const getSelected = () => {
    if (selectedColor) return selectedColor.toUpperCase()
    if (selectedNumber !== null) return `No.${selectedNumber}`
    if (selectedSize) return selectedSize.toUpperCase()
    return '...'
  }

  return (
    <div style={s.container}>
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'error' ? '#f6465d' : '#00c087' }}>
          {toast.msg}
        </div>
      )}

      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={s.title}>Win Go</div>
        <button style={s.refreshBtn} onClick={() => { fetchCurrentRound(); fetchRecentResults(); fetchBalance() }}>↻</button>
      </div>

      <div style={s.balanceCard}>
        <div style={s.balLabel}>Wallet Balance</div>
        <div style={s.balAmount}>${totalBal.toFixed(2)} USDT</div>
        <div style={s.balSub}>Main: ${balance.toFixed(2)} | Bonus: ${bonusBalance.toFixed(2)}</div>
        <div style={s.balBtns}>
          <button style={s.withdrawBtn} onClick={() => navigate('/withdraw')}>Withdraw</button>
          <button style={s.depositBtn} onClick={() => navigate('/deposit')}>Deposit</button>
        </div>
      </div>

      <div style={s.gameTabs}>
        {GAME_TYPES.map(gt => (
          <button key={gt.key}
            style={gameType === gt.key ? s.gameTabActive : s.gameTab}
            onClick={() => setGameType(gt.key)}>
            WinGo {gt.label}
          </button>
        ))}
      </div>

      <div style={s.infoCard}>
        <div style={s.infoLeft}>
          <div style={s.howToPlay}>📋 How to play</div>
          <div style={s.gameLabel}>WinGo {GAME_TYPES.find(g => g.key === gameType)?.label}</div>
          <div style={s.resultsRow}>
            {recentResults.slice(0,6).map((r,i) => (
              <div key={i} style={{ ...s.resultCircle, background: getResultBg(r.result) }}>
                {r.resultNumber}
              </div>
            ))}
          </div>
        </div>
        <div style={s.infoRight}>
          <div style={s.timeLabel}>Time Remaining</div>
          <div style={{ ...s.timer, color: timeLeft < 10 ? '#f6465d' : '#1a1a1a' }}>
            {formatTime(timeLeft)}
          </div>
          {isClosed && <div style={s.closedText}>🔴 Closed!</div>}
          <div style={s.roundLabel}>#{roundId.slice(-8) || '--------'}</div>
        </div>
      </div>

      <div style={s.colorBtns}>
        {[
          { color: 'green', bg: '#00c087', label: 'Green', payout: '1.95x' },
          { color: 'violet', bg: '#8b5cf6', label: 'Violet', payout: '4.5x' },
          { color: 'red', bg: '#f6465d', label: 'Red', payout: '1.95x' }
        ].map(btn => (
          <button key={btn.color}
            style={{ ...s.colorBtn, background: btn.bg, opacity: isClosed ? 0.5 : 1,
              border: selectedColor === btn.color ? '3px solid #f0b90b' : '3px solid transparent' }}
            onClick={() => { if (!isClosed) { setSelectedColor(btn.color); setSelectedNumber(null); setSelectedSize(null) } }}>
            <div style={s.colorBtnText}>{btn.label}</div>
            <div style={s.colorBtnPayout}>{btn.payout}</div>
          </button>
        ))}
      </div>

      <div style={s.numberGrid}>
        {[0,1,2,3,4,5,6,7,8,9].map(num => (
          <button key={num}
            style={{ ...s.numBtn, background: getNumberBg(num), opacity: isClosed ? 0.5 : 1,
              border: selectedNumber === num ? '3px solid #f0b90b' : '3px solid transparent' }}
            onClick={() => { if (!isClosed) { setSelectedNumber(num); setSelectedColor(null); setSelectedSize(null) } }}>
            {num}
          </button>
        ))}
      </div>

      <div style={s.bigSmallRow}>
        {[
          { size: 'big', bg: 'linear-gradient(135deg,#f97316,#f0b90b)', label: 'Big', sub: '1.95x (5-9)' },
          { size: 'small', bg: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', label: 'Small', sub: '1.95x (0-4)' }
        ].map(btn => (
          <button key={btn.size}
            style={{ ...s.sizeBtn, background: btn.bg, opacity: isClosed ? 0.5 : 1,
              border: selectedSize === btn.size ? '3px solid #f0b90b' : '3px solid transparent' }}
            onClick={() => { if (!isClosed) { setSelectedSize(btn.size); setSelectedColor(null); setSelectedNumber(null) } }}>
            <div style={s.colorBtnText}>{btn.label}</div>
            <div style={s.colorBtnPayout}>{btn.sub}</div>
          </button>
        ))}
      </div>

      {(selectedColor || selectedNumber !== null || selectedSize) && (
        <div style={s.selectedBox}>
          Selected: <span style={{ color: '#f0b90b', fontWeight: '700' }}>{getSelected()}</span>
          {' '}— Potential: <span style={{ color: '#00c087', fontWeight: '700' }}>${getPotential()}</span>
        </div>
      )}

      <div style={s.betSection}>
        <div style={s.betLabel}>Bet Amount (USDT)</div>
        <div style={s.presetRow}>
          {[1,5,10,50,100].map(amt => (
            <button key={amt}
              style={betAmount === amt ? s.presetActive : s.presetBtn}
              onClick={() => setBetAmount(amt)}>
              ${amt}
            </button>
          ))}
        </div>
        <input style={s.betInput} type="number" min="1" value={betAmount}
          onChange={e => setBetAmount(Number(e.target.value))} placeholder="Custom amount" />
      </div>

      <button
        style={isClosed || loading || (!selectedColor && selectedNumber === null && !selectedSize) ? s.betBtnDisabled : s.betBtn}
        onClick={placeBet} disabled={isClosed || loading}>
        {isClosed ? '⏰ Betting Closed' : loading ? 'Placing Bet...' : `Place Bet — $${betAmount} on ${getSelected()}`}
      </button>

      <div style={s.tabRow}>
        <button style={activeTab === 'game' ? s.tabActive : s.tab} onClick={() => setActiveTab('game')}>Game Record</button>
        <button style={activeTab === 'my' ? s.tabActive : s.tab} onClick={() => { setActiveTab('my'); fetchMyBets() }}>My Record</button>
      </div>

      {activeTab === 'game' && (
        <div style={s.recordList}>
          {recentResults.map((r,i) => (
            <div key={i} style={s.recordRow}>
              <div style={s.recordId}>#{r.roundId?.slice(-8)}</div>
              <div style={{ ...s.resultCircle, background: getResultBg(r.result), width:'32px', height:'32px' }}>{r.resultNumber}</div>
              <div style={s.recordColor}>{r.result?.replace('_',' + ').toUpperCase()}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'my' && (
        <div style={s.recordList}>
          {myBets.length === 0 ? (
            <div style={s.emptyText}>No bets yet</div>
          ) : myBets.map((bet,i) => (
            <div key={i} style={s.betRow}>
              <div>
                <div style={s.betId}>#{bet.roundId?.slice(-8)}</div>
                <div style={s.betDetail}>
                  {bet.color?.toUpperCase() || (bet.number !== null ? `No.${bet.number}` : '') || bet.size?.toUpperCase()} — ${bet.amount}
                </div>
              </div>
              <div style={{ color: bet.status === 'won' ? '#00c087' : '#f6465d', fontWeight: '700', textAlign: 'right' }}>
                {bet.status === 'won' ? `+$${bet.payout?.toFixed(2)}` : `-$${bet.amount}`}
                <div style={{ fontSize: '11px', marginTop: '2px' }}>{bet.status?.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: '40px' }} />
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#ffffff', paddingBottom: '20px' },
  toast: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', borderRadius: '12px', color: 'white', fontWeight: '700', fontSize: '14px', zIndex: 1000, maxWidth: '350px', textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderBottom: '1px solid #f0f0f0' },
  backBtn: { background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' },
  title: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a' },
  refreshBtn: { background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' },
  balanceCard: { background: '#1c1f2a', padding: '16px' },
  balLabel: { color: '#8a8f9b', fontSize: '12px' },
  balAmount: { color: '#f0b90b', fontSize: '28px', fontWeight: '800', margin: '4px 0' },
  balSub: { color: '#8a8f9b', fontSize: '12px', marginBottom: '12px' },
  balBtns: { display: 'flex', gap: '8px' },
  withdrawBtn: { flex: 1, background: 'transparent', border: '2px solid white', color: 'white', fontWeight: '700', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' },
  depositBtn: { flex: 1, background: '#f0b90b', border: 'none', color: '#0a0b0f', fontWeight: '700', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' },
  gameTabs: { display: 'flex', background: '#f5f5f5', padding: '8px', gap: '8px' },
  gameTab: { flex: 1, background: '#e0e0e0', border: 'none', borderRadius: '10px', padding: '10px 4px', fontSize: '12px', fontWeight: '600', color: '#666', cursor: 'pointer' },
  gameTabActive: { flex: 1, background: '#f0b90b', border: 'none', borderRadius: '10px', padding: '10px 4px', fontSize: '12px', fontWeight: '700', color: 'white', cursor: 'pointer' },
  infoCard: { display: 'flex', background: 'white', margin: '8px', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  infoLeft: { flex: 1 },
  infoRight: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  howToPlay: { color: '#f0b90b', fontSize: '13px', fontWeight: '600', marginBottom: '4px', cursor: 'pointer' },
  gameLabel: { color: '#f6465d', fontSize: '13px', fontWeight: '700', marginBottom: '8px' },
  resultsRow: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  resultCircle: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700' },
  timeLabel: { color: '#f6465d', fontSize: '12px', fontWeight: '600' },
  timer: { fontSize: '36px', fontWeight: '900', letterSpacing: '2px' },
  closedText: { color: '#f6465d', fontSize: '13px', fontWeight: '700' },
  roundLabel: { color: '#8a8f9b', fontSize: '11px', marginTop: '4px' },
  colorBtns: { display: 'flex', gap: '8px', padding: '8px 12px' },
  colorBtn: { flex: 1, borderRadius: '14px', padding: '14px 8px', cursor: 'pointer' },
  colorBtnText: { color: 'white', fontWeight: '700', fontSize: '15px', textAlign: 'center' },
  colorBtnPayout: { color: 'rgba(255,255,255,0.8)', fontSize: '12px', textAlign: 'center', marginTop: '2px' },
  numberGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', padding: '8px 12px' },
  numBtn: { height: '52px', borderRadius: '50%', color: 'white', fontWeight: '800', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bigSmallRow: { display: 'flex', gap: '8px', padding: '8px 12px' },
  sizeBtn: { flex: 1, borderRadius: '14px', padding: '14px 8px', cursor: 'pointer' },
  selectedBox: { background: '#fff8e7', border: '1px solid #f0b90b', borderRadius: '12px', padding: '12px 16px', margin: '4px 12px', fontSize: '14px', color: '#1a1a1a' },
  betSection: { padding: '8px 12px' },
  betLabel: { color: '#1a1a1a', fontWeight: '700', fontSize: '14px', marginBottom: '8px' },
  presetRow: { display: 'flex', gap: '8px', marginBottom: '8px' },
  presetBtn: { flex: 1, background: '#f5f5f5', border: 'none', borderRadius: '8px', padding: '8px 4px', fontSize: '13px', fontWeight: '600', color: '#666', cursor: 'pointer' },
  presetActive: { flex: 1, background: '#00c087', border: 'none', borderRadius: '8px', padding: '8px 4px', fontSize: '13px', fontWeight: '700', color: 'white', cursor: 'pointer' },
  betInput: { width: '100%', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' },
  betBtn: { width: 'calc(100% - 24px)', margin: '8px 12px', background: 'linear-gradient(135deg,#f6465d,#f0b90b)', color: 'white', fontWeight: '700', fontSize: '15px', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer' },
  betBtnDisabled: { width: 'calc(100% - 24px)', margin: '8px 12px', background: '#e0e0e0', color: '#999', fontWeight: '700', fontSize: '15px', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'not-allowed' },
  tabRow: { display: 'flex', background: '#f5f5f5', margin: '8px 12px', borderRadius: '12px', padding: '4px' },
  tab: { flex: 1, background: 'transparent', border: 'none', padding: '10px', fontSize: '13px', color: '#666', cursor: 'pointer', fontWeight: '600' },
  tabActive: { flex: 1, background: 'white', border: 'none', padding: '10px', fontSize: '13px', color: '#1a1a1a', cursor: 'pointer', fontWeight: '700', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  recordList: { padding: '0 12px' },
  recordRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  recordId: { color: '#8a8f9b', fontSize: '12px', flex: 1 },
  recordColor: { color: '#1a1a1a', fontSize: '13px', fontWeight: '600' },
  betRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  betId: { color: '#8a8f9b', fontSize: '11px' },
  betDetail: { color: '#1a1a1a', fontSize: '14px', fontWeight: '600', marginTop: '2px' },
  emptyText: { textAlign: 'center', color: '#8a8f9b', padding: '40px 0', fontSize: '14px' }
        }
