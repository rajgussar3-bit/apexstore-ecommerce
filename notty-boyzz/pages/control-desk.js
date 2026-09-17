import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function ControlDesk() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Password / PIN Management
  const [storedPin, setStoredPin] = useState('1234');
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Change PIN fields
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changePinMsg, setChangePinMsg] = useState({ text: '', isError: false });

  // Forgot PIN fields
  const [recoveryCode, setRecoveryCode] = useState('');
  const [resetNewPin, setResetNewPin] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ text: '', isError: false });

  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newToast, setNewToast] = useState(null);

  const prevCountRef = useRef(0);

  // Load saved custom PIN & Auth Session
  useEffect(() => {
    const savedPin = localStorage.getItem('nbz_admin_pin');
    if (savedPin) {
      setStoredPin(savedPin);
    }
    const savedAuth = sessionStorage.getItem('nbz_control_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleUnlock = (e) => {
    e?.preventDefault();
    const currentPin = localStorage.getItem('nbz_admin_pin') || storedPin || '1234';
    if (pin.trim() === currentPin) {
      sessionStorage.setItem('nbz_control_auth', 'true');
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError(`Galat Password / PIN! Please check karein.`);
      setPin('');
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('nbz_control_auth');
    setIsAuthenticated(false);
    setPin('');
  };

  // Change PIN logic
  const handleChangePin = (e) => {
    e.preventDefault();
    const currentPin = localStorage.getItem('nbz_admin_pin') || storedPin || '1234';
    if (oldPin !== currentPin) {
      setChangePinMsg({ text: 'Purana PIN galat hai!', isError: true });
      return;
    }
    if (!newPin || newPin.length < 4) {
      setChangePinMsg({ text: 'Naya PIN minimum 4 characters ka hona chahiye!', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setChangePinMsg({ text: 'Naya PIN aur Confirm PIN match nahi ho rahe!', isError: true });
      return;
    }

    localStorage.setItem('nbz_admin_pin', newPin);
    setStoredPin(newPin);
    setChangePinMsg({ text: '✅ PIN successfully change ho gaya!', isError: false });
    setTimeout(() => {
      setShowChangePinModal(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setChangePinMsg({ text: '', isError: false });
    }, 1500);
  };

  // Forgot PIN logic (Master Recovery Key: 892006 or NOTTY-UDAIPUR)
  const handleForgotReset = (e) => {
    e.preventDefault();
    const cleanKey = recoveryCode.trim();
    if (cleanKey !== '892006' && cleanKey.toUpperCase() !== 'NOTTY-UDAIPUR') {
      setForgotMsg({ text: 'Galat Security Code! Please sahi code enter karein.', isError: true });
      return;
    }
    if (!resetNewPin || resetNewPin.length < 4) {
      setForgotMsg({ text: 'Naya PIN kam se kam 4 digits ka hona chahiye!', isError: true });
      return;
    }

    localStorage.setItem('nbz_admin_pin', resetNewPin);
    setStoredPin(resetNewPin);
    sessionStorage.setItem('nbz_control_auth', 'true');
    setForgotMsg({ text: '✅ PIN Reset Successful! Desk unlock ho rahi hai...', isError: false });
    setTimeout(() => {
      setShowForgotModal(false);
      setIsAuthenticated(true);
      setRecoveryCode('');
      setResetNewPin('');
      setForgotMsg({ text: '', isError: false });
    }, 1500);
  };

  // Audio Chime
  const playSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  // Fetch Inquiries
  const fetchInquiries = async () => {
    try {
      const res = await fetch(`/api/inquiries?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const json = await res.json();
        const serverData = json.data || [];

        if (prevCountRef.current > 0 && serverData.length > prevCountRef.current) {
          const newest = serverData[0];
          setNewToast(newest);
          playSound();
          setTimeout(() => setNewToast(null), 6000);
        }
        prevCountRef.current = serverData.length;
        setInquiries(serverData);
      }
    } catch (err) {
      try {
        const local = JSON.parse(localStorage.getItem('notty_inquiries') || '[]');
        setInquiries(local);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries();
      const interval = setInterval(fetchInquiries, 4000);

      if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('notty_boyzz_channel');
        channel.onmessage = (msg) => {
          if (msg.data?.type === 'NEW_INQUIRY') {
            fetchInquiries();
          }
        };
      }

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Update Status
  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}

    setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  // Delete Inquiry
  const deleteInquiry = async (id) => {
    if (!confirm(`Kya aap enquiry "${id}" ko sach me delete karna chahte hain?`)) return;
    try {
      await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    } catch (e) {}

    setInquiries(prev => prev.filter(item => item.id !== id));
  };

  // CSV Export
  const exportToCSV = () => {
    if (inquiries.length === 0) {
      alert('Export karne ke liye koi inquiry record nahi hai.');
      return;
    }

    const headers = ['Inquiry ID', 'Customer Name', 'Age', 'Mobile Number', 'WhatsApp Number', 'Category', 'City', 'Note', 'Status', 'Date & Time'];
    const rows = inquiries.map(i => [
      `"${i.id}"`,
      `"${(i.name || '').replace(/"/g, '""')}"`,
      `"${i.age || ''}"`,
      `"${i.mobile || ''}"`,
      `"${i.whatsapp || ''}"`,
      `"${(i.category || '').replace(/"/g, '""')}"`,
      `"${(i.city || 'Udaipur').replace(/"/g, '""')}"`,
      `"${(i.note || '').replace(/"/g, '""')}"`,
      `"${i.status || 'New'}"`,
      `"${i.formattedDate || i.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Notty_Boyzz_Udaipur_Leads_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering & Stats
  const filteredInquiries = inquiries.filter(item => {
    if (statusFilter !== 'ALL' && (item.status || 'New').toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchMobile = (item.mobile || '').includes(q);
      const matchWa = (item.whatsapp || '').includes(q);
      const matchId = (item.id || '').toLowerCase().includes(q);
      if (!matchName && !matchMobile && !matchWa && !matchId) return false;
    }
    return true;
  });

  const totalCount = inquiries.length;
  const newCount = inquiries.filter(i => (i.status || 'New').toLowerCase() === 'new').length;
  const contactedCount = inquiries.filter(i => (i.status || '').toLowerCase() === 'contacted').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = inquiries.filter(i => (i.createdAt || '').startsWith(todayStr)).length;

  return (
    <>
      <Head>
        <title>Notty Boyzz - Udaipur Control Desk (Admin Portal)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Ambient Glow */}
      <div className="ambient-glow">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
      </div>

      {/* PIN Security Gate */}
      {!isAuthenticated && (
        <div className="pin-lock-overlay" style={{ display: 'grid' }}>
          <div className="pin-lock-box">
            <div className="pin-icon">🔒</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.3rem' }}>CONTROL DESK ACCESS</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Udaipur Control Desk open karne ke liye Password / PIN enter karein.
            </p>
            
            <form onSubmit={handleUnlock}>
              <input 
                type="password" 
                className="pin-input" 
                placeholder="••••" 
                maxLength={8}
                value={pin}
                onChange={e => setPin(e.target.value)}
                autoFocus
              />
              
              {pinError && <div className="pin-err-msg">{pinError}</div>}
              
              <button type="submit" className="btn-submit" style={{ marginTop: 0 }}>
                UNLOCK CONTROL DESK 🔓
              </button>
            </form>

            <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>🔒 Secured Desk</span>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'transparent', border: 'none', color: '#ff5da8', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
              >
                Forgot PIN?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot PIN / Reset Modal */}
      {showForgotModal && (
        <div className="modal-backdrop active" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>Reset Admin PIN</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              Security Code enter karein apna naya password/PIN set karne ke liye.
            </p>

            <form onSubmit={handleForgotReset}>
              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                  Master Security Code:
                </label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Enter Security Code"
                  value={recoveryCode}
                  onChange={e => setRecoveryCode(e.target.value)}
                  style={{ marginTop: '0.3rem' }}
                  required
                />
              </div>

              <div style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                  Apna Naya Password / PIN Daalein:
                </label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="e.g. 5566 ya 9988"
                  value={resetNewPin}
                  onChange={e => setResetNewPin(e.target.value)}
                  style={{ marginTop: '0.3rem' }}
                  required
                />
              </div>

              {forgotMsg.text && (
                <div style={{ color: forgotMsg.isError ? 'var(--accent-red)' : 'var(--accent-green)', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 600 }}>
                  {forgotMsg.text}
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-submit" style={{ marginTop: 0 }}>
                  SAVE & UNLOCK 🚀
                </button>
                <button type="button" className="btn-modal-close" onClick={() => setShowForgotModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal (Inside Dashboard) */}
      {showChangePinModal && (
        <div className="modal-backdrop active" onClick={() => setShowChangePinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>Change Control PIN</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              Apna purana PIN daal kar naya PIN set karein.
            </p>

            <form onSubmit={handleChangePin}>
              <div style={{ textAlign: 'left', marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>Purana PIN:</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={oldPin}
                  onChange={e => setOldPin(e.target.value)}
                  placeholder="Purana PIN"
                  required
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              <div style={{ textAlign: 'left', marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>Naya PIN (Kam se kam 4 digits):</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder="Naya PIN"
                  required
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>Confirm Naya PIN:</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value)}
                  placeholder="Confirm Naya PIN"
                  required
                  style={{ marginTop: '0.3rem' }}
                />
              </div>

              {changePinMsg.text && (
                <div style={{ color: changePinMsg.isError ? 'var(--accent-red)' : 'var(--accent-green)', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 600 }}>
                  {changePinMsg.text}
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-submit" style={{ marginTop: 0 }}>
                  UPDATE PIN 💾
                </button>
                <button type="button" className="btn-modal-close" onClick={() => setShowChangePinModal(false)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="control-header">
        <div className="container control-nav">
          <div className="control-title-wrap">
            <a href="/" className="brand-logo" title="View Public Website">
              <div className="logo-badge" style={{ width: '38px', height: '38px', fontSize: '1.1rem' }}>NB</div>
              <div className="brand-name" style={{ fontSize: '1.3rem' }}>
                NOTTY BOYZZ
                <span className="brand-sub">UDAIPUR DESK</span>
              </div>
            </a>
            <span className="desk-tag">HQ ADMIN</span>
            <div className="live-indicator">
              <span className="pulse"></span>
              LIVE - Cloud Active
            </div>
          </div>

          <div className="control-actions">
            <button 
              type="button" 
              className="btn-ctrl" 
              onClick={() => setShowChangePinModal(true)}
              title="Change your admin password/PIN"
              style={{ color: '#ff5da8', borderColor: 'rgba(255,0,122,0.4)' }}
            >
              🔑 Change PIN
            </button>
            <button 
              type="button" 
              className="btn-ctrl" 
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{ color: soundEnabled ? '#00f2fe' : '#94a3b8' }}
            >
              {soundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF'}
            </button>
            <button type="button" className="btn-ctrl" onClick={fetchInquiries}>
              🔄 Refresh
            </button>
            <button type="button" className="btn-ctrl btn-ctrl-primary" onClick={exportToCSV}>
              📥 Export CSV
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn-ctrl">
              🌐 Public Site
            </a>
            <button type="button" className="btn-ctrl btn-ctrl-danger" onClick={handleLock}>
              🔒 Lock
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="container">
        
        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card card-cyan">
            <div>
              <div className="stat-val">{totalCount}</div>
              <div className="stat-label">Total Udaipur Inquiries</div>
            </div>
            <div className="stat-icon-wrap">📋</div>
          </div>

          <div className="stat-card card-pink">
            <div>
              <div className="stat-val" style={{ color: '#ff007a' }}>{newCount}</div>
              <div className="stat-label">New / Action Needed</div>
            </div>
            <div className="stat-icon-wrap">⚡</div>
          </div>

          <div className="stat-card card-purple">
            <div>
              <div className="stat-val" style={{ color: '#c084fc' }}>{contactedCount}</div>
              <div className="stat-label">Contacted Customers</div>
            </div>
            <div className="stat-icon-wrap">📞</div>
          </div>

          <div className="stat-card card-green">
            <div>
              <div className="stat-val" style={{ color: '#34d399' }}>{todayCount}</div>
              <div className="stat-label">Today's Fresh Leads</div>
            </div>
            <div className="stat-icon-wrap">🚀</div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="filter-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by customer name, mobile, whatsapp, ref ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <label htmlFor="statusFilter" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Status Filter:
            </label>
            <select 
              id="statusFilter" 
              className="filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses (Sabhi)</option>
              <option value="New">🟡 New Leads Only</option>
              <option value="Contacted">🔵 Contacted Only</option>
              <option value="Confirmed">🟢 Confirmed VIP Only</option>
              <option value="Rejected">🔴 Rejected Only</option>
            </select>
          </div>
        </section>

        {/* Inquiries List (Desktop Table + Mobile Cards) */}
        <section className="table-card">
          
          {/* Desktop Table View */}
          <div className="desktop-table-wrap">
            <div className="table-responsive">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer Name</th>
                    <th style={{ textAlign: 'center', color: '#ff5da8' }}>Age (उम्र)</th>
                    <th>Direct Call (Mobile)</th>
                    <th>Direct WhatsApp</th>
                    <th>Companionship & Notes</th>
                    <th>Submitted Time</th>
                    <th>Status Action</th>
                    <th>Del</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map(item => {
                    const cleanMobile = (item.mobile || '').replace(/\D/g, '');
                    const cleanWa = (item.whatsapp || item.mobile || '').replace(/\D/g, '');
                    const waNumber = cleanWa.length === 10 ? `91${cleanWa}` : cleanWa;
                    const waMessage = encodeURIComponent(
                      `Namaste ${item.name}! Hum Notty Boyzz Udaipur Desk se baat kar rahe hain regarding your companion pass (${item.id}).`
                    );
                    const status = item.status || 'New';

                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="lead-id">{item.id}</span>
                        </td>
                        <td>
                          <div className="customer-name">
                            <span>👩</span>
                            <strong>{item.name}</strong>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px', fontWeight: 600 }}>
                            📍 Udaipur
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="age-badge-pill">
                            <span className="age-val">{item.age ? item.age : '--'}</span>
                            <span className="age-unit">Saal</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-actions">
                            <a href={`tel:${cleanMobile}`} className="btn-call" title="Call directly">
                              📞 <span>{item.mobile}</span>
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="contact-actions">
                            <a 
                              href={`https://wa.me/${waNumber}?text=${waMessage}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn-wa-chat" 
                              title="Send WhatsApp Message"
                            >
                              💬 <span>{item.whatsapp || item.mobile}</span>
                            </a>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>
                            {item.category || 'Romantic Companion'}
                          </span>
                          {item.note && (
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px' }}>
                              "{item.note}"
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="lead-time">{item.formattedDate || 'Today'}</span>
                        </td>
                        <td>
                          <select 
                            className={`status-select status-${status}`}
                            value={status}
                            onChange={e => updateStatus(item.id, e.target.value)}
                          >
                            <option value="New">🟡 New Lead</option>
                            <option value="Contacted">🔵 Contacted</option>
                            <option value="Confirmed">🟢 Confirmed VIP</option>
                            <option value="Rejected">🔴 Rejected</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            className="btn-del-lead" 
                            onClick={() => deleteInquiry(item.id)} 
                            title="Delete Inquiry"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards Feed (For Smartphone Screens) */}
          <div className="mobile-cards-wrap">
            {filteredInquiries.map(item => {
              const cleanMobile = (item.mobile || '').replace(/\D/g, '');
              const cleanWa = (item.whatsapp || item.mobile || '').replace(/\D/g, '');
              const waNumber = cleanWa.length === 10 ? `91${cleanWa}` : cleanWa;
              const waMessage = encodeURIComponent(
                `Namaste ${item.name}! Hum Notty Boyzz Udaipur Desk se baat kar rahe hain regarding your companion pass (${item.id}).`
              );
              const status = item.status || 'New';

              return (
                <article key={`mobile-${item.id}`} className={`lead-card-mobile card-${status}`}>
                  {/* Card Top: ID, Status, Delete */}
                  <div className="lcm-header">
                    <span className="lead-id">{item.id}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select 
                        className={`status-select status-${status}`}
                        value={status}
                        onChange={e => updateStatus(item.id, e.target.value)}
                      >
                        <option value="New">🟡 New</option>
                        <option value="Contacted">🔵 Contacted</option>
                        <option value="Confirmed">🟢 Confirmed</option>
                        <option value="Rejected">🔴 Rejected</option>
                      </select>
                      <button 
                        className="btn-del-lead" 
                        onClick={() => deleteInquiry(item.id)} 
                        title="Delete Inquiry"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Card Body: Name + Dedicated Age Pill */}
                  <div className="lcm-body">
                    <div>
                      <div className="lcm-name">
                        <span>👩</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="lcm-city">
                        <span>📍</span>
                        <span>Udaipur Exclusive Client</span>
                      </div>
                    </div>

                    <div className="age-badge-pill">
                      <span className="age-val">{item.age ? item.age : '--'}</span>
                      <span className="age-unit">Saal</span>
                    </div>
                  </div>

                  {/* Card Contacts: Big 1-tap Call & WhatsApp buttons */}
                  <div className="lcm-contacts">
                    <a href={`tel:${cleanMobile}`} className="lcm-btn-call">
                      <span>📞</span>
                      <span>Call {item.mobile}</span>
                    </a>
                    <a 
                      href={`https://wa.me/${waNumber}?text=${waMessage}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="lcm-btn-wa"
                    >
                      <span>💬</span>
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Card Details: Category & Note */}
                  <div className="lcm-details">
                    <div className="lcm-category">
                      💖 {item.category || 'Romantic Companion'}
                    </div>
                    {item.note && (
                      <div className="lcm-note">
                        "{item.note}"
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Submitted time */}
                  <div className="lcm-footer">
                    <span>🕒 Submitted: {item.formattedDate || 'Today'}</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>✓ Verified Female</span>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredInquiries.length === 0 && (
            <div className="empty-leads">
              <div className="icon">📭</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                Koi Udaipur Enquiry Nahi Mili
              </h3>
              <p style={{ fontSize: '0.85rem' }}>
                Nayi inquiries aane par yahan automatically real-time update ho jayengi.
              </p>
            </div>
          )}
        </section>

      </main>

      {/* Real-time Toast Alert */}
      {newToast && (
        <aside className="live-toast show" aria-live="polite">
          <div className="toast-bell">🔔</div>
          <div className="toast-info">
            <h4>⚡ Nayi Enquiry Ayi: {newToast.name}</h4>
            <p>Mobile: {newToast.mobile} • City: Udaipur</p>
          </div>
        </aside>
      )}
    </>
  );
}
