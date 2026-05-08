import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App.jsx';

const GAME_TYPES = [
  { key: 'wingo30s', label: '30 Sec' },
  { key: 'wingo3m', label: '3 Min' },
  { key: 'wingo5m', label: '5 Min' }
];

const NUMBER_COLORS = {
  0: 'violet_red', 1: 'green', 2: 'red', 3: 'green',
  4: 'red', 5: 'violet_green', 6: 'red', 7: 'green',
  8: 'red', 9: 'green'
};

function getNumberBg(num) {
  const c = NUMBER_COLORS[num];
  if (c === 'violet_red') return 'linear-gradient(135deg, #8b5cf6 50%, #f6465d 50%)';
  if (c === 'violet_green') return 'linear-gradient(135deg, #8b5cf6 50%, #00c087 50%)';
  if (c === 'green') return '#00c087';
  return '#f6465d';
}

function getResultBg(result) {
  if (result === 'violet_red') return 'linear-gradient(135deg, #8b5cf6 50%, #f6465d 50%)';
  if (result === 'violet_green') return 'linear-gradient(135deg, #8b5cf6 50%, #00c087 50%)';
  if (result === 'green') return '#00c087';
  if (result === 'violet') return '#8b5cf6';
  return '#f6465d';
}

export default function WinGo() {
  const [gameType, setGameType] = useState('wingo30s');
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundId, setRoundId] = useState('');
  const [recentResults, setRecentResults] = useState([]);
  const [balance, setBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [betAmount, setBetAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [myBets, setMyBets] = useState([]);
  const [activeTab, setActiveTab] = useState('game');
  const intervalRef = useRef(null);
  const fetchRef = useRef(null);
  const navigate = useNavigate();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCurrentRound = async () => {
    try {
      const res = await fetch(
        `${API}/api/game/wingo/current/${gameType}`
      );
      const data = await res.json();
      if (data.roundId) {
        setRoundId(data.roundId);
        setTimeLeft(data.timeLeft);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentResults = async () => {
    try {
      const res = await fetch(
        `${API}/api/game/wingo/recent/${gameType}`
      );
      const data = await res.json();
      setRecentResults(data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBalance(data.balance || 0);
      setBonusBalance(data.bonusBalance || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyBets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API}/api/game/wingo/history?gameType=${gameType}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setMyBets(data.bets || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCurrentRound();
    fetchRecentResults();
    fetchBalance();
    fetchMyBets();

    fetchRef.current = setInterval(() => {
      fetchCurrentRound();
      fetchRecentResults();
    }, 3000);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          fetchCurrentRound();
          fetchRecentResults();
          fetchBalance();
          fetchMyBets();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(fetchRef.current);
    };
  }, [gameType]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const placeBet = async () => {
    if (!selectedColor && selectedNumber === null && !selectedSize) {
      showToast('Please select a color, number or Big/Small', 'error');
      return;
    }
    if (betAmount < 1) {
      showToast('Minimum bet is 1 USDT', 'error');
      return;
    }
    if (timeLeft < 5) {
      showToast('Betting is closed for this round', 'error');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const body = { roundId, gameType, amount: betAmount };
      if (selectedNumber !== null) body.number = selectedNumber;
      else if (selectedColor) body.color = selectedColor;
      else if (selectedSize) body.size = selectedSize;

      const res = await fetch(`${API}/api/game/wingo/bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Bet placed! Potential: $${data.bet.potentialPayout}`);
        setBalance(data.newBalance);
        setBonusBalance(data.newBonusBalance);
        setSelectedColor(null);
        setSelectedNumber(null);
        setSelectedSize(null);
        fetchMyBets();
      } else {
        showToast(data.error || 'Bet failed', 'error');
      }
    } catch (err) {
      showToast('Connection failed', 'error');
    }
    setLoading(false);
  };

  const isBettingClosed = timeLeft < 5;
  const totalBalance = balance + bonusBalance;

  return (
    <div style={styles.container}>
      {/* Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          background: toast.type === 'error' ? '#f6465d' : '#00c087'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={styles.headerTitle}>Win Go</div>
        <button style={styles.refreshBtn} onClick={() => {
          fetchCurrentRound();
          fetchRecentResults();
          fetchBalance();
        }}>↻</button>
      </div>

      {/* Balance */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceLabel}>Wallet Balance</div>
        <div style={styles.balanceAmount}>${totalBalance.toFixed(2)} USDT</div>
        <div style={styles.balanceSub}>
          Main: ${balance.toFixed(2)} | Bonus: ${bonusBalance.toFixed(2)}
        </div>
        <div style={styles.balanceBtns}>
          <button style={styles.withdrawBtn} onClick={() => navigate('/withdraw')}>
            Withdraw
          </button>
          <button style={styles.depositBtn} onClick={() => navigate('/deposit')}>
            Deposit
          </button>
        </div>
      </div>

      {/* Game Type Tabs */}
      <div style={styles.gameTabs}>
        {GAME_TYPES.map(gt => (
          <button
            key={gt.key}
            style={gameType === gt.key ? styles.gameTabActive : styles.gameTab}
            onClick={() => setGameType(gt.key)}
          >
            WinGo {gt.label}
          </button>
        ))}
      </div>

      {/* Game Info Card */}
      <div style={styles.gameInfoCard}>
        <div style={styles.gameInfoLeft}>
          <div style={styles.howToPlay}>📋 How to play</div>
          <div style={styles.gameTypeLabel}>
            WinGo {GAME_TYPES.find(g => g.key === gameType)?.label}
          </div>
          {/* Recent results */}
          <div style={styles.resultsRow}>
            {recentResults.slice(0, 6).map((r, i) => (
              <div key={i} style={{
                ...styles.resultCircle,
                background: getResultBg(r.result)
              }}>
                {r.resultNumber}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.gameInfoRight}>
          <div style={styles.timeLabel}>Time Remaining</div>
          <div style={{
            ...styles.timer,
            color: timeLeft < 10 ? '#f6465d' : 'white'
          }}>
            {formatTime(timeLeft)}
          </div>
          {isBettingClosed && (
            <div style={styles.closedText}>🔴 Closed!</div>
          )}
          <div style={styles.roundId}>
            #{roundId.slice(-8) || '--------'}
          </div>
        </div>
      </div>

      {/* Color Buttons */}
      <div style={styles.colorBtns}>
        <button
          style={{
            ...styles.greenBtn,
            opacity: isBettingClosed ? 0.5 : 1,
            border: selectedColor === 'green' ? '3px solid #f0b90b' : '3px solid transparent'
          }}
          onClick={() => {
            if (isBettingClosed) return;
            setSelectedColor('green');
            setSelectedNumber(null);
            setSelectedSize(null);
          }}
        >
          <div style={styles.colorBtnText}>Green</div>
          <div style={styles.colorBtnPayout}>1.95x</div>
        </button>

        <button
          style={{
            ...styles.violetBtn,
            opacity: isBettingClosed ? 0.5 : 1,
            border: selectedColor === 'violet' ? '3px solid #f0b90b' : '3px solid transparent'
          }}
          onClick={() => {
            if (isBettingClosed) return;
            setSelectedColor('violet');
            setSelectedNumber(null);
            setSelectedSize(null);
          }}
        >
          <div style={styles.colorBtnText}>Violet</div>
          <div style={styles.colorBtnPayout}>4.5x</div>
        </button>

        <button
          style={{
            ...styles.redBtn,
            opacity: isBettingClosed ? 0.5 : 1,
            border: selectedColor === 'red' ? '3px solid #f0b90b' : '3px solid transparent'
          }}
          onClick={() => {
            if (isBettingClosed) return;
            setSelectedColor('red');
            setSelectedNumber(null);
            setSelectedSize(null);
          }}
        >
          <div style={styles.colorBtnText}>Red</div>
          <div style={styles.colorBtnPayout}>1.95x</div>
        </button>
      </div>

      {/* Number Grid */}
      <div style={styles.numberGrid}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            style={{
              ...styles.numberBtn,
              background: getNumberBg(num),
              border: selectedNumber === num
                ? '3px solid #f0b90b'
                : '3px solid transparent',
              opacity: isBettingClosed ? 0.5 : 1
            }}
            onClick={() => {
              if (isBettingClosed) return;
              setSelectedNumber(num);
              setSelectedColor(null);
              setSelectedSize(null);
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Big Small Buttons */}
      <div style={styles.bigSmallRow}>
        <button
          style={{
            ...styles.bigBtn,
            opacity: isBettingClosed ? 0.5 : 1,
            border: selectedSize === 'big' ? '3px solid #f0b90b' : '3px solid transparent'
          }}
          onClick={() => {
            if (isBettingClosed) return;
            setSelectedSize('big');
            setSelectedColor(null);
            setSelectedNumber(null);
          }}
        >
          <div style={styles.colorBtnText}>Big</div>
          <div style={styles.colorBtnPayout}>1.95x (5-9)</div>
        </button>

        <button
          style={{
            ...styles.smallBtn,
            opacity: isBettingClosed ? 0.5 : 1,
            border: selectedSize === 'small' ? '3px solid #f0b90b' : '3px solid transparent'
          }}
          onClick={() => {
            if (isBettingClosed) return;
            setSelectedSize('small');
            setSelectedColor(null);
            setSelectedNumber(null);
          }}
        >
          <div style={styles.colorBtnText}>Small</div>
          <div style={styles.colorBtnPayout}>1.95x (0-4)</div>
        </button>
      </div>

      {/* Selected bet display */}
      {(selectedColor || selectedNumber !== null || selectedSize) && (
        <div style={styles.selectedBet}>
          Selected: <span style={{ color: '#f0b90b', fontWeight: '700' }}>
            {selectedColor?.toUpperCase() ||
              (selectedNumber !== null ? `Number ${selectedNumber}` : '') ||
              selectedSize?.toUpperCase()}
          </span>
          {' '}— Potential: <span style={{ color: '#00c087', fontWeight: '700' }}>
            ${(betAmount * (
              selectedColor === 'violet' ? 4.5 :
              selectedNumber !== null ? 9 : 1.95
            )).toFixed(2)}
          </span>
        </div>
      )}

      {/* Bet Amount */}
      <div style={styles.betSection}>
        <div style={styles.betLabel}>Bet Amount (USDT)</div>
        <div style={styles.presetRow}>
          {[1, 5, 10, 50, 100].map(amt => (
            <button
              key={amt}
              style={betAmount === amt ? styles.presetActive : styles.presetBtn}
              onClick={() => setBetAmount(amt)}
            >
              ${amt}
            </button>
          ))}
        </div>
        <input
          style={styles.betInput}
          type="number"
          min="1"
          value={betAmount}
          onChange={e => setBetAmount(Number(e.target.value))}
          placeholder="Custom amount"
        />
      </div>

      {/* Place Bet Button */}
      <button
        style={
          isBettingClosed || loading ||
          (!selectedColor && selectedNumber === null && !selectedSize)
            ? styles.betBtnDisabled
            : styles.betBtn
        }
        onClick={placeBet}
        disabled={isBettingClosed || loading}
      >
        {isBettingClosed
          ? '⏰ Betting Closed'
          : loading
          ? 'Placing Bet...'
          : `Place Bet — $${betAmount} on ${
              selectedColor?.toUpperCase() ||
              (selectedNumber !== null ? `No.${selectedNumber}` : '') ||
              selectedSize?.toUpperCase() ||
              '...'
            }`}
      </button>

      {/* Bottom Tabs */}
      <div style={styles.tabRow}>
        <button
          style={activeTab === 'game' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('game')}
        >
          Game Record
        </button>
        <button
          style={activeTab === 'my' ? styles.tabActive : styles.tab}
          onClick={() => { setActiveTab('my'); fetchMyBets(); }}
        >
          My Record
        </button>
      </div>

      {activeTab === 'game' && (
        <div style={styles.recordList}>
          {recentResults.map((r, i) => (
            <div key={i} style={styles.recordRow}>
              <div style={styles.recordId}>#{r.roundId.slice(-8)}</div>
              <div style={{
                ...styles.recordCircle,
                background: getResultBg(r.result)
              }}>
                {r.resultNumber}
              </div>
              <div style={styles.recordColor}>
                {r.result?.replace('_', ' + ').toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'my' && (
        <div style={styles.recordList}>
          {myBets.length === 0 ? (
            <div style={styles.emptyText}>No bets yet</div>
          ) : myBets.map((bet, i) => (
            <div key={i} style={styles.betRow}>
              <div>
                <div style={styles.betRowId}>#{bet.roundId?.slice(-8)}</div>
                <div style={styles.betRowDetail}>
                  {bet.color?.toUpperCase() ||
                    (bet.number !== null ? `No.${bet.number}` : '') ||
                    bet.size?.toUpperCase()} — ${bet.amount}
                </div>
              </div>
              <div style={{
                ...styles.betStatus,
                color: bet.status === 'won' ? '#00c087' : '#f6465d'
              }}>
                {bet.status === 'won'
                  ? `+$${bet.payout?.toFixed(2)}`
                  : `-$${bet.amount}`}
                <div style={styles.betStatusLabel}>
                  {bet.status?.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: '100px' }} />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#ffffff',
    paddingBottom: '20px'
  },
  toast: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '700',
    fontSize: '14px',
    zIndex: 1000,
    maxWidth: '350px',
    textAlign: 'center'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'white',
    borderBottom: '1px solid #f0f0f0'
  },
  backBtn: {
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '18px',
    cursor: 'pointer'
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  refreshBtn: {
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '18px',
    cursor: 'pointer'
  },
  balanceCard: {
    background: '#1c1f2a',
    padding: '16px',
    margin: '0'
  },
  balanceLabel: { color: '#8a8f9b', fontSize: '12px' },
  balanceAmount: {
    color: '#f0b90b',
    fontSize: '28px',
    fontWeight: '800',
    margin: '4px 0'
  },
  balanceSub: { color: '#8a8f9b', fontSize: '12px', marginBottom: '12px' },
  balanceBtns: { display: 'flex', gap: '8px' },
  withdrawBtn: {
    flex: 1,
    background: 'transparent',
    border: '2px solid white',
    color: 'white',
    fontWeight: '700',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  depositBtn: {
    flex: 1,
    background: '#f0b90b',
    border: 'none',
    color: '#0a0b0f',
    fontWeight: '700',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  gameTabs: {
    display: 'flex',
    background: '#f5f5f5',
    padding: '8px',
    gap: '8px'
  },
  gameTab: {
    flex: 1,
    background: '#e0e0e0',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 4px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer'
  },
  gameTabActive: {
    flex: 1,
    background: '#f0b90b',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 4px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'white',
    cursor: 'pointer'
  },
  gameInfoCard: {
    display: 'flex',
    background: 'white',
    margin: '8px',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  gameInfoLeft: { flex: 1 },
  gameInfoRight: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  howToPlay: {
    color: '#f0b90b',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '4px',
    cursor: 'pointer'
  },
  gameTypeLabel: {
    color: '#f6465d',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  resultsRow: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  resultCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '11px',
    fontWeight: '700'
  },
  timeLabel: { color: '#f6465d', fontSize: '12px', fontWeight: '600' },
  timer: {
    fontSize: '36px',
    fontWeight: '900',
    letterSpacing: '2px',
    fontVariantNumeric: 'tabular-nums'
  },
  closedText: { color: '#f6465d', fontSize: '13px', fontWeight: '700' },
  roundId: { color: '#8a8f9b', fontSize: '11px', marginTop: '4px' },
  colorBtns: {
    display: 'flex',
    gap: '8px',
    padding: '8px 12px'
  },
  greenBtn: {
    flex: 1,
    background: '#00c087',
    borderRadius: '14px',
    padding: '14px 8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,192,135,0.3)'
  },
  violetBtn: {
    flex: 1,
    background: '#8b5cf6',
    borderRadius: '14px',
    padding: '14px 8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
  },
  redBtn: {
    flex: 1,
    background: '#f6465d',
    borderRadius: '14px',
    padding: '14px 8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(246,70,93,0.3)'
  },
  colorBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: '15px',
    textAlign: 'center'
  },
  colorBtnPayout: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '2px'
  },
  numberGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
    padding: '8px 12px'
  },
  numberBtn: {
    height: '52px',
    borderRadius: '50%',
    color: 'white',
    fontWeight: '800',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bigSmallRow: {
    display: 'flex',
    gap: '8px',
    padding: '8px 12px'
  },
  bigBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #f97316, #f0b90b)',
    borderRadius: '14px',
    padding: '14px 8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(249,115,22,0.3)'
  },
  smallBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '14px',
    padding: '14px 8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
  },
  selectedBet: {
    background: '#fff8e7',
    border: '1px solid #f0b90b',
    borderRadius: '12px',
    padding: '12px 16px',
    margin: '4px 12px',
    fontSize: '14px',
    color: '#1a1a1a'
  },
  betSection: {
    padding: '8px 12px'
  },
  betLabel: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: '14px',
    marginBottom: '8px'
  },
  presetRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px'
  },
  presetBtn: {
    flex: 1,
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer'
  },
  presetActive: {
    flex: 1,
    background: '#00c087',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 4px',
    fontSize: '13px',
    fontWeight: '700',
    color: 'white',
    cursor: 'pointer'
  },
  betInput: {
    width: '100%',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '15px',
    color: '#1a1a1a',
    outline: 'none'
  },
  betBtn: {
    width: 'calc(100% - 24px)',
    margin: '8px 12px',
    background: 'linear-gradient(135deg, #f6465d, #f0b90b)',
    color: 'white',
    fontWeight: '700',
    fontSize: '15px',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(246,70,93,0.3)'
  },
  betBtnDisabled: {
    width: 'calc(100% - 24px)',
    margin: '8px 12px',
    background: '#e0e0e0',
    color: '#999',
    fontWeight: '700',
    fontSize: '15px',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'not-allowed'
  },
  tabRow: {
    display: 'flex',
    background: '#f5f5f5',
    margin: '8px 12px',
    borderRadius: '12px',
    padding: '4px'
  },
  tab: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '10px',
    fontSize: '13px',
    color: '#666',
    cursor: 'pointer',
    fontWeight: '600'
  },
  tabActive: {
    flex: 1,
    background: 'white',
    border: 'none',
    padding: '10px',
    fontSize: '13px',
    color: '#1a1a1a',
    cursor: 'pointer',
    fontWeight: '700',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  recordList: { padding: '0 12px' },
  recordRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  recordId: { color: '#8a8f9b', fontSize: '12px', flex: 1 },
  recordCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '14px'
  },
  recordColor: { color: '#1a1a1a', fontSize: '13px', fontWeight: '600' },
  betRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  betRowId: { color: '#8a8f9b', fontSize: '11px' },
  betRowDetail: {
    color: '#1a1a1a',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '2px'
  },
  betStatus: {
    fontSize: '16px',
    fontWeight: '800',
    textAlign: 'right'
  },
  betStatusLabel: {
    fontSize: '11px',
    fontWeight: '600',
    marginTop: '2px'
  },
  emptyText: {
    textAlign: 'center',
    color: '#8a8f9b',
    padding: '40px 0',
    fontSize: '14px'
  }
};
