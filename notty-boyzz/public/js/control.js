/* ==========================================================================
   NOTTY BOYZZ - CONTROL DESK SCRIPT
   Real-Time Feed, PIN Authentication, 1-Click Call/WhatsApp, CSV Export
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let inquiries = [];
  let currentFilter = 'ALL';
  let searchQuery = '';
  let soundEnabled = true;
  const ADMIN_PIN = '1234';

  // DOM Elements
  const pinOverlay = document.getElementById('pinOverlay');
  const pinInput = document.getElementById('pinInput');
  const pinSubmitBtn = document.getElementById('pinSubmitBtn');
  const pinErrMsg = document.getElementById('pinErrMsg');
  const btnLogout = document.getElementById('btnLogout');

  const leadsTableBody = document.getElementById('leadsTableBody');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('leadSearch');
  const statusFilter = document.getElementById('statusFilter');
  const refreshBtn = document.getElementById('btnRefresh');
  const exportCsvBtn = document.getElementById('btnExportCsv');
  const soundToggleBtn = document.getElementById('btnSoundToggle');
  const liveIndicator = document.getElementById('liveIndicator');

  // Stat counters
  const totalLeadsCount = document.getElementById('statTotalLeads');
  const newLeadsCount = document.getElementById('statNewLeads');
  const contactedCount = document.getElementById('statContacted');
  const todayCount = document.getElementById('statTodayLeads');

  // Live Toast
  const liveToast = document.getElementById('liveToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastSubtitle = document.getElementById('toastSubtitle');

  // 1. Audio Notification using Web Audio API (Crystal-clear Synthesized Chime)
  function playNotificationSound() {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.35); // D6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime + 0.1);
      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio play restricted by browser policy until interaction:', e);
    }
  }

  // 2. PIN Lock Verification
  function checkAuth() {
    const isUnlocked = sessionStorage.getItem('nbz_control_auth') === 'true';
    if (isUnlocked) {
      if (pinOverlay) pinOverlay.style.display = 'none';
      initControlDesk();
    } else {
      if (pinOverlay) {
        pinOverlay.style.display = 'grid';
        if (pinInput) {
          pinInput.value = '';
          pinInput.focus();
        }
      }
    }
  }

  function handleUnlock() {
    const entered = pinInput.value.trim();
    if (entered === ADMIN_PIN) {
      sessionStorage.setItem('nbz_control_auth', 'true');
      if (pinErrMsg) pinErrMsg.textContent = '';
      if (pinOverlay) pinOverlay.style.display = 'none';
      initControlDesk();
    } else {
      if (pinErrMsg) pinErrMsg.textContent = 'Galat PIN! Default PIN: 1234';
      pinInput.value = '';
      pinInput.focus();
    }
  }

  if (pinSubmitBtn) pinSubmitBtn.addEventListener('click', handleUnlock);
  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUnlock();
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('nbz_control_auth');
      checkAuth();
    });
  }

  // 3. Data Fetching
  async function fetchInquiries() {
    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const json = await res.json();
        inquiries = json.data || [];
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      // Fallback: LocalStorage
      const local = JSON.parse(localStorage.getItem('notty_inquiries') || '[]');
      inquiries = local;
    }
    renderTable();
    updateStats();
  }

  // 4. Update Stats Counters
  function updateStats() {
    const total = inquiries.length;
    const newCount = inquiries.filter(i => (i.status || 'New').toLowerCase() === 'new').length;
    const contacted = inquiries.filter(i => (i.status || '').toLowerCase() === 'contacted').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayNum = inquiries.filter(i => (i.createdAt || '').startsWith(todayStr)).length;

    if (totalLeadsCount) totalLeadsCount.textContent = total;
    if (newLeadsCount) newLeadsCount.textContent = newCount;
    if (contactedCount) contactedCount.textContent = contacted;
    if (todayCount) todayCount.textContent = todayNum;
  }

  // 5. Render Inquiries Table
  function renderTable() {
    if (!leadsTableBody) return;

    let filtered = inquiries.filter(item => {
      // Status filter
      if (currentFilter !== 'ALL' && (item.status || 'New').toLowerCase() !== currentFilter.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (item.name || '').toLowerCase().includes(q);
        const matchMobile = (item.mobile || '').includes(q);
        const matchWa = (item.whatsapp || '').includes(q);
        const matchId = (item.id || '').toLowerCase().includes(q);
        const matchCity = (item.city || '').toLowerCase().includes(q);
        if (!matchName && !matchMobile && !matchWa && !matchId && !matchCity) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      leadsTableBody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    leadsTableBody.innerHTML = filtered.map(item => {
      const cleanMobile = (item.mobile || '').replace(/\D/g, '');
      const cleanWa = (item.whatsapp || item.mobile || '').replace(/\D/g, '');
      const waNumber = cleanWa.length === 10 ? `91${cleanWa}` : cleanWa;

      const waMessage = encodeURIComponent(
        `Namaste ${item.name}! Hum Notty Boyzz Control Desk se baat kar rahe hain regarding your enquiry (${item.id}).`
      );

      const status = item.status || 'New';

      return `
        <tr id="row-${item.id}">
          <td>
            <span class="lead-id">${item.id}</span>
          </td>
          <td>
            <div class="customer-name">
              ${escapeHtml(item.name)}
            </div>
            <div class="customer-age">
              ${item.age ? `${item.age} saal` : 'Age: N/A'} • ${escapeHtml(item.city || 'India')}
            </div>
          </td>
          <td>
            <div class="contact-actions">
              <a href="tel:${cleanMobile}" class="btn-call" title="Call directly">
                📞 <span>${item.mobile}</span>
              </a>
            </div>
          </td>
          <td>
            <div class="contact-actions">
              <a href="https://wa.me/${waNumber}?text=${waMessage}" target="_blank" rel="noopener noreferrer" class="btn-wa-chat" title="Send WhatsApp Message">
                💬 <span>${item.whatsapp || item.mobile}</span>
              </a>
            </div>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: #cbd5e1; font-weight: 600;">
              ${escapeHtml(item.category || 'VIP Clan Entry')}
            </span>
            ${item.note ? `<div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">"${escapeHtml(item.note)}"</div>` : ''}
          </td>
          <td>
            <span class="lead-time">${item.formattedDate || formatTimeAgo(item.createdAt)}</span>
          </td>
          <td>
            <select class="status-select status-${status}" onchange="window.updateStatus('${item.id}', this.value)">
              <option value="New" ${status === 'New' ? 'selected' : ''}>🟡 New Lead</option>
              <option value="Contacted" ${status === 'Contacted' ? 'selected' : ''}>🔵 Contacted</option>
              <option value="Confirmed" ${status === 'Confirmed' ? 'selected' : ''}>🟢 Confirmed VIP</option>
              <option value="Rejected" ${status === 'Rejected' ? 'selected' : ''}>🔴 Rejected</option>
            </select>
          </td>
          <td>
            <button class="btn-del-lead" onclick="window.deleteInquiry('${item.id}')" title="Delete Inquiry">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 6. Global Action Handlers
  window.updateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn('Backend patch failed, updating locally:', e);
    }

    const item = inquiries.find(i => i.id === id);
    if (item) {
      item.status = newStatus;
      // Sync local storage
      localStorage.setItem('notty_inquiries', JSON.stringify(inquiries));
    }
    renderTable();
    updateStats();
  };

  window.deleteInquiry = async (id) => {
    if (!confirm(`Kya aap enquiry "${id}" ko sach me delete karna chahte hain?`)) return;

    try {
      await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete failed, updating locally:', e);
    }

    inquiries = inquiries.filter(i => i.id !== id);
    localStorage.setItem('notty_inquiries', JSON.stringify(inquiries));
    renderTable();
    updateStats();
  };

  // 7. Show Toast Alert on New Inquiry
  function showNewInquiryToast(item) {
    if (!liveToast) return;
    if (toastTitle) toastTitle.textContent = `⚡ Nayi Enquiry Ayi: ${item.name}`;
    if (toastSubtitle) toastSubtitle.textContent = `Mobile: ${item.mobile} • Age: ${item.age || 'N/A'}`;

    liveToast.classList.add('show');
    playNotificationSound();

    setTimeout(() => {
      liveToast.classList.remove('show');
    }, 6000);
  }

  // 8. Real-time Listeners (Server-Sent Events + BroadcastChannel)
  function setupRealtimeListeners() {
    // SSE Stream
    try {
      const eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_INQUIRY' && payload.data) {
            handleIncomingInquiry(payload.data);
          } else if (payload.type === 'INQUIRY_UPDATED') {
            fetchInquiries();
          } else if (payload.type === 'INQUIRY_DELETED') {
            fetchInquiries();
          }
        } catch (e) {}
      };

      eventSource.onerror = () => {
        if (liveIndicator) {
          liveIndicator.innerHTML = '<span class="pulse" style="background:#f59e0b"></span> Local Mode';
        }
      };

      eventSource.onopen = () => {
        if (liveIndicator) {
          liveIndicator.innerHTML = '<span class="pulse"></span> LIVE - Connected';
        }
      };
    } catch (e) {
      console.warn('SSE unsupported or unavailable:', e);
    }

    // BroadcastChannel for cross-tab communication
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel('notty_boyzz_channel');
      channel.onmessage = (msg) => {
        if (msg.data && msg.data.type === 'NEW_INQUIRY') {
          handleIncomingInquiry(msg.data.data);
        }
      };
    }

    // Storage Event listener
    window.addEventListener('storage', (e) => {
      if (e.key === 'notty_inquiries') {
        fetchInquiries();
      }
    });
  }

  function handleIncomingInquiry(item) {
    // Avoid duplicates
    if (!inquiries.some(i => i.id === item.id)) {
      inquiries.unshift(item);
      renderTable();
      updateStats();
      showNewInquiryToast(item);
    }
  }

  // 9. Export to CSV
  function exportToCSV() {
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
  }

  // 10. Helpers & Utilities
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function formatTimeAgo(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  // 11. Initial Setup
  function initControlDesk() {
    fetchInquiries();
    setupRealtimeListeners();

    // Sound toggle
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggleBtn.innerHTML = soundEnabled ? '🔔 Alert Sound: ON' : '🔕 Alert Sound: OFF';
        soundToggleBtn.style.color = soundEnabled ? '#00f2fe' : '#94a3b8';
      });
    }

    // Refresh button
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        fetchInquiries();
      });
    }

    // Export CSV
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', exportToCSV);
    }

    // Search filter
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderTable();
      });
    }

    // Status filter
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTable();
      });
    }
  }

  // Run Auth Check on start
  checkAuth();
});
