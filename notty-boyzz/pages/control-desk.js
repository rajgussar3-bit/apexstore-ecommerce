import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function ControlDesk() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newToast, setNewToast] = useState(null);

  const prevCountRef = useRef(0);

  // 1. PIN Check
  useEffect(() => {
    const saved = sessionStorage.getItem('nbz_control_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleUnlock = (e) => {
    e?.preventDefault();
    if (pin.trim() === '1234') {
      sessionStorage.setItem('nbz_control_auth', 'true');
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Galat PIN! Default Security PIN: 1234');
      setPin('');
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('nbz_control_auth');
    setIsAuthenticated(false);
    setPin('');
  };

  // 2. Audio Chime (Web Audio API)
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

  // 3. Fetch Inquiries
  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const json = await res.json();
        const serverData = json.data || [];

        // Check if new inquiry arrived to trigger sound & toast
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
      // LocalStorage fallback
      try {
        const local = JSON.parse(localStorage.getItem('notty_inquiries') || '[]');
        setInquiries(local);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries();
      const interval = setInterval(fetchInquiries, 4000); // Live polling for Vercel

      // Cross-tab broadcast listener
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

  // 4. Update Status
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

  // 5. Delete Inquiry
  const deleteInquiry = async (id) => {
    if (!confirm(`Kya aap enquiry "${id}" ko sach me delete karna chahte hain?`)) return;
    try {
      await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    } catch (e) {}

    setInquiries(prev => prev.filter(item => item.id !== id));
  };

  // 6. CSV Export
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
      `"${(i.city || '').replace(/"/g, '""')}"`,
      `"${(i.note || '').replace(/"/g, '""')}"`,
      `"${i.status || 'New'}"`,
      `"${i.formattedDate || i.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Notty_Boyzz_Leads_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. Filtering & Stats Calculations
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
      const matchCity = (item.city || '').toLowerCase().includes(q);
      if (!matchName && !matchMobile && !matchWa && !matchId && !matchCity) return false;
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
        <title>Notty Boyzz - Control Desk (Admin Portal)</title>
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
              Security PIN enter karein dashboard open karne ke liye.
            </p>
            
            <form onSubmit={handleUnlock}>
              <input 
                type="password" 
                className="pin-input" 
                placeholder="••••" 
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value)}
                autoFocus
              />
              
              {pinError && <div className="pin-err-msg">{pinError}</div>}
              
              <button type="submit" className="btn-submit" style={{ marginTop: 0 }}>
                UNLOCK CONTROL DESK 🔓
              </button>
            </form>

            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Default Security PIN: <strong style={{ color: 'var(--accent-cyan)' }}>1234</strong>
            </div>
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
                <span className="brand-sub">CONTROL DESK</span>
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
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{ color: soundEnabled ? '#00f2fe' : '#94a3b8' }}
            >
              {soundEnabled ? '🔔 Alert Sound: ON' : '🔕 Alert Sound: OFF'}
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
              <div className="stat-label">Total Inquiries</div>
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

        {/* Inquiries Table */}
        <section className="table-card">
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Customer Details</th>
                  <th>Direct Call (Mobile)</th>
                  <th>Direct WhatsApp</th>
                  <th>Purpose & Notes</th>
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
                    `Namaste ${item.name}! Hum Notty Boyzz Control Desk se baat kar rahe hain regarding your companion enquiry (${item.id}).`
                  );
                  const status = item.status || 'New';

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="lead-id">{item.id}</span>
                      </td>
                      <td>
                        <div className="customer-name">{item.name}</div>
                        <div className="customer-age">
                          {item.age ? `${item.age} saal` : 'Age: N/A'} • {item.city || 'India'}
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
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                          {item.category || 'Romantic Companion'}
                        </span>
                        {item.note && (
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
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

          {filteredInquiries.length === 0 && (
            <div className="empty-leads">
              <div className="icon">📭</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                Koi Enquiry Nahi Mili
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
            <p>Mobile: {newToast.mobile} • City: {newToast.city || 'India'}</p>
          </div>
        </aside>
      )}
    </>
  );
}
