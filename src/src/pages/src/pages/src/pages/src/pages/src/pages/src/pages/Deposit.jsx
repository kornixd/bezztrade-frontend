import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App.jsx';
import { QRCodeSVG } from 'qrcode.react';

export default function Deposit() {
  const [depositAddress, setDepositAddress] = useState('');
  const [copied, setCopied] = useState(false);
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
      setDepositAddress(data.depositAddress || '');
    } catch (err) {
      console.error(err);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/wallet')}>←</button>
        <div style={styles.title}>Deposit</div>
        <div style={{ width: '36px' }} />
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <div style={styles.sectionLabel}>| Currency</div>
          <div style={styles.currencyCard}>USDT</div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionLabel}>| Deposit Address (TRC20)</div>
          <div style={styles.addressCard}>
            <div style={styles.addressText}>{depositAddress || 'Loading...'}</div>
            <button style={styles.copyBtn} onClick={copyAddress}>
              {copied ? '✅' : '📋'}
            </button>
          </div>
        </div>

        <div style={styles.warning}>
          ⚠️ The current chain type is TRC20. Please ensure the selected chain type is consistent when transferring, otherwise it will cause financial losses and cannot be recovered.
        </div>

        <div style={styles.section}>
          <div style={styles.sectionLabel}>| Deposit Address QR Code</div>
          <div style={styles.qrCard}>
            {depositAddress && depositAddress !== 'PENDING' ? (
              <QRCodeSVG
                value={depositAddress}
                size={200}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div style={styles.qrPlaceholder}>Generating address...</div>
            )}
          </div>
        </div>

        <button style={styles.copyAddressBtn} onClick={copyAddress}>
          {copied ? '✅ Copied!' : '📋 Copy Address'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0b0f'
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
  content: { padding: '16px' },
  section: { marginBottom: '20px' },
  sectionLabel: {
    color: '#f0b90b',
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '8px',
    borderLeft: '3px solid #f0b90b',
    paddingLeft: '8px'
  },
  currencyCard: {
    background: '#161920',
    border: '1px solid #2a2d3e',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#8a8f9b',
    fontSize: '15px'
  },
  addressCard: {
    background: '#161920',
    border: '1px solid #2a2d3e',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  addressText: {
    color: 'white',
    fontSize: '13px',
    flex: 1,
    wordBreak: 'break-all'
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer'
  },
  warning: {
    background: '#1a1200',
    border: '1px solid #f0b90b',
    borderRadius: '12px',
    padding: '14px',
    color: '#f0b90b',
    fontSize: '13px',
    marginBottom: '20px',
    lineHeight: '1.5'
  },
  qrCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '240px'
  },
  qrPlaceholder: {
    color: '#8a8f9b',
    fontSize: '14px'
  },
  copyAddressBtn: {
    width: '100%',
    background: '#f0b90b',
    color: '#0a0b0f',
    fontWeight: '700',
    fontSize: '16px',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px'
  }
};
