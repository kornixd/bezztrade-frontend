import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../main.jsx'

export default function Withdraw() {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchBalance() }, [])

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/balance`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      setBalance(data.balance || 0)
    } catch (err) { console.error(err) }
  }

  const fee = 0.5
  const amountReceived = amount > 0 ? (Number(amount) - fee).toFixed(2) : '0.00'

  const handleWithdraw = async () => {
    if (!amount || amount < 10) { setMessage({ text: 'Minimum withdrawal is 10 USDT', type: 'error' }); return }
    if (!address) { setMessage({ text: 'Please enter your wallet address', type: 'error' }); return }
    if (Number(amount) > balance) { setMessage({ text: 'Insufficient balance', type: 'error' }); return }
    setLoading(true); setMessage(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), address })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ text: `✅ Withdrawal submitted! $${data.amountSent} will arrive shortly.`, type: 'success' })
        setAmount(''); setAddress(''); fetchBalance()
      } else {
        setMessage({ text: data.error || 'Withdrawal failed', type: 'error' })
      }
    } catch (err) { setMessage({ text: 'Connection failed', type: 'error' }) }
    setLoading(false)
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/wallet')}>←</button>
        <div style={s.title}>Withdraw</div>
        <div style={{ width: '36px' }} />
      </div>
      <div style={s.content}>
        <div style={s.balCard}>
          <div style={s.balLabel}>Avail. Balance</div>
          <div style={s.balAmount}>{balance.toFixed(3)} USDT</div>
          <div style={s.balInfo}>
            <div>Unfinished Flow: 0.000 USDT</div>
            <div>Single Transaction Quota: 10–1,000,000 USDT</div>
            <div>Remaining withdrawal times: 5</div>
          </div>
        </div>
        {message && (
          <div style={{ ...s.msg, background: message.type==='error'?'#2d1515':'#0d2016', borderColor: message.type==='error'?'#f6465d':'#00c087', color: message.type==='error'?'#f6465d':'#00c087' }}>
            {message.text}
          </div>
        )}
        <div style={s.section}>
          <div style={s.label}>Withdrawal Address (TRC20)</div>
          <input style={s.input} placeholder="Enter your TRC20 wallet address" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <div style={s.section}>
          <div style={s.label}>Withdrawal Amount</div>
          <div style={s.amtRow}>
            <input style={s.input} type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} />
            <button style={s.allBtn} onClick={() => setAmount(balance.toFixed(2))}>All</button>
          </div>
        </div>
        <div style={s.summary}>
          <div style={s.sumRow}><span style={s.sumLabel}>Fee:</span><span style={s.sumVal}>{fee} USDT</span></div>
          <div style={s.sumRow}><span style={s.sumLabel}>Amount Received:</span><span style={{ ...s.sumVal, color: '#f0b90b' }}>{amountReceived} USDT</span></div>
        </div>
        <button style={loading ? s.btnDisabled : s.btn} onClick={handleWithdraw} disabled={loading}>
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#0a0b0f' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #2a2d3e' },
  backBtn: { background: '#1c1f2a', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'white', fontSize: '18px', cursor: 'pointer' },
  title: { color: 'white', fontWeight: '700', fontSize: '18px' },
  content: { padding: '16px' },
  balCard: { background: '#1c1f2a', borderRadius: '16px', padding: '16px', marginBottom: '16px', border: '1px solid #2a2d3e' },
  balLabel: { color: '#8a8f9b', fontSize: '13px' },
  balAmount: { color: '#f0b90b', fontSize: '28px', fontWeight: '800', margin: '4px 0' },
  balInfo: { color: '#8a8f9b', fontSize: '12px', lineHeight: '1.8' },
  msg: { border: '1px solid', borderRadius: '12px', padding: '12px', fontSize: '14px', marginBottom: '16px' },
  section: { marginBottom: '16px' },
  label: { color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '8px' },
  input: { width: '100%', background: '#161920', border: '1px solid #2a2d3e', borderRadius: '12px', padding: '14px 16px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  amtRow: { display: 'flex', gap: '8px' },
  allBtn: { background: 'transparent', border: '1px solid #f0b90b', color: '#f0b90b', borderRadius: '10px', padding: '0 16px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
  summary: { background: '#161920', borderRadius: '12px', padding: '16px', marginBottom: '20px' },
  sumRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  sumLabel: { color: '#8a8f9b', fontSize: '14px' },
  sumVal: { color: 'white', fontWeight: '700', fontSize: '14px' },
  btn: { width: '100%', background: '#f0b90b', color: '#0a0b0f', fontWeight: '700', fontSize: '16px', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer' },
  btnDisabled: { width: '100%', background: '#4a4f5e', color: '#8a8f9b', fontWeight: '700', fontSize: '16px', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'not-allowed' }
}
