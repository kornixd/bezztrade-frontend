import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../main.jsx'
import { QRCodeSVG } from 'qrcode.react'

export default function Deposit() {
  const [depositAddress, setDepositAddress] = useState('')
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchBalance() }, [])

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/balance`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      setDepositAddress(data.depositAddress || '')
    } catch (err) { console.error(err) }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/wallet')}>←</button>
        <div style={s.title}>Deposit</div>
        <div style={{ width: '36px' }} />
      </div>
      <div style={s.content}>
        <div style={s.section}>
          <div style={s.sectionLabel}>| Currency</div>
          <div style={s.inputCard}>USDT</div>
        </div>
        <div style={s.section}>
          <div style={s.sectionLabel}>| Deposit Address (TRC20)</div>
          <div style={s.addressCard}>
            <div style={s.addressText}>{depositAddress || 'Loading...'}</div>
            <button style={s.copyBtn} onClick={copyAddress}>{copied ? '✅' : '📋'}</button>
          </div>
        </div>
        <div style={s.warning}>
          ⚠️ The current chain type is TRC20. Please ensure the selected chain type is consistent when transferring, otherwise it will cause financial losses and cannot be recovered.
        </div>
        <div style={s.section}>
          <div style={s.sectionLabel}>| Deposit Address QR Code</div>
          <div style={s.qrCard}>
            {depositAddress && depositAddress !== 'PENDING' ? (
              <QRCodeSVG value={depositAddress} size={200} level="H" includeMargin={true} />
            ) : (
              <div style={{ color: '#8a8f9b', fontSize: '14px' }}>Generating address...</div>
            )}
          </div>
        </div>
        <button style={s.copyAddressBtn} onClick={copyAddress}>
          {copied ? '✅ Copied!' : '📋 Copy Address'}
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
  section: { marginBottom: '20px' },
  sectionLabel: { color: '#f0b90b', fontSize: '14px', fontWeight: '700', marginBottom: '8px', borderLeft: '3px solid #f0b90b', paddingLeft: '8px' },
  inputCard: { background: '#161920', border: '1px solid #2a2d3e', borderRadius: '12px', padding: '14px 16px', color: '#8a8f9b', fontSize: '15px' },
  addressCard: { background: '#161920', border: '1px solid #2a2d3e', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '8px' },
  addressText: { color: 'white', fontSize: '13px', flex: 1, wordBreak: 'break-all' },
  copyBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
  warning: { background: '#1a1200', border: '1px solid #f0b90b', borderRadius: '12px', padding: '14px', color: '#f0b90b', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' },
  qrCard: { background: 'white', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '240px' },
  copyAddressBtn: { width: '100%', background: '#f0b90b', color: '#0a0b0f', fontWeight: '700', fontSize: '16px', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer', marginTop: '8px' }
}
