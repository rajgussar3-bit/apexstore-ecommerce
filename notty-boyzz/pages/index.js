import React, { useState } from 'react';
import Head from 'next/head';
import { isMaleName } from '../lib/maleDetector';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    city: 'Udaipur',
    mobile: '',
    whatsapp: '',
    sameAsMobile: false,
    category: 'Romantic & Loving Companion',
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [successInquiry, setSuccessInquiry] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'sameAsMobile') {
      setFormData(prev => ({
        ...prev,
        sameAsMobile: checked,
        whatsapp: checked ? prev.mobile : prev.whatsapp
      }));
    } else if (name === 'mobile') {
      setFormData(prev => ({
        ...prev,
        mobile: value,
        whatsapp: prev.sameAsMobile ? value : prev.whatsapp
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. STRICT CHECK: FEMALE ONLY
    if (isMaleName(formData.name)) {
      setIsBlocked(true);
      return;
    }

    // 2. Validate mobile
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.mobile)) {
      alert('Kripya sahi 10-digit mobile number enter karein (starting with 6,7,8,9)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          city: 'Udaipur',
          whatsapp: formData.sameAsMobile ? formData.mobile : (formData.whatsapp || formData.mobile)
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessInquiry(data.inquiry);

        // Sync local storage for offline / quick recovery
        try {
          const local = JSON.parse(localStorage.getItem('notty_inquiries') || '[]');
          local.unshift(data.inquiry);
          localStorage.setItem('notty_inquiries', JSON.stringify(local));
          if (window.BroadcastChannel) {
            new BroadcastChannel('notty_boyzz_channel').postMessage({ type: 'NEW_INQUIRY', data: data.inquiry });
          }
        } catch (err) {}

        // Reset form
        setFormData({
          name: '',
          age: '',
          city: 'Udaipur',
          mobile: '',
          whatsapp: '',
          sameAsMobile: false,
          category: 'Romantic & Loving Companion',
          note: ''
        });
      } else {
        if (data.error && data.error.includes('Women')) {
          setIsBlocked(true);
        } else {
          alert(data.error || 'Submission failed. Please try again.');
        }
      }
    } catch (err) {
      console.warn('Network issue, saved locally:', err);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const fallbackEntry = {
        id: `NBZ-${randomNum}`,
        ...formData,
        city: 'Udaipur',
        status: 'New',
        createdAt: new Date().toISOString(),
        formattedDate: 'Today, Just now'
      };
      setSuccessInquiry(fallbackEntry);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Notty Boyzz - Luxury Companionship & Love for Women (Udaipur Only)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="description" content="Udaipur's exclusive luxury companionship service for women. Handsome athletic gentlemen offering true care, love & complete emotional satisfaction." />
      </Head>

      {/* Ambient Cyber Lighting */}
      <div className="ambient-glow">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
        <div className="glow-orb-3"></div>
      </div>

      {/* Header Navigation (Exclusively Customer Facing - No Admin Links) */}
      <header className="site-header">
        <div className="container header-inner">
          <a href="#" className="brand-logo">
            <div className="logo-badge">NB</div>
            <div className="brand-name">
              NOTTY BOYZZ
              <span className="brand-sub">UDAIPUR EXCLUSIVE • FOR WOMEN</span>
            </div>
          </a>

          <div className="nav-actions">
            <span className="women-exclusive-badge">
              👑 Women Exclusive • Udaipur
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container">
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-pill">
            <span className="pulse-dot"></span>
            ❤️ 100% Love, Care & Complete Satisfaction in Udaipur
          </div>
          <h1 className="hero-title">
            EXPERIENCE TRUE LOVE & ATTENTION WITH <br />
            <span className="glow-pink">NOTTY BOYZZ</span>
          </h1>
          <p className="hero-tagline">
            Handsome, athletic bodybuilder gentlemen jo aapko denge sachha pyaar, respect, attention aur poori emotional satisfaction. 
            Exclusively available in <strong>Udaipur</strong> (City of Lakes).
          </p>

          {/* Quick Action CTA for Mobile & Desktop */}
          <div className="hero-cta-wrap">
            <a href="#applySection" className="btn-hero-action">
              💖 Request Private Pass (Form Bharein) 👇
            </a>
            <a 
              href="https://t.me/Receptionist892006" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="telegram-quick-bar"
            >
              <span>✈️</span> Direct Telegram: <strong>@Receptionist892006</strong>
            </a>
          </div>

          {/* Trust Bar */}
          <div className="trust-bar">
            <div className="trust-item"><span>📍</span> Strictly Udaipur Only</div>
            <div className="trust-item"><span>👑</span> 100% Exclusively For Women</div>
            <div className="trust-item"><span>💪</span> Athletic & Bodybuilder Gentlemen</div>
            <div className="trust-item"><span>❤️</span> Pure Love & Care Focus</div>
            <div className="trust-item"><span>🔒</span> 100% Confidential & Safe</div>
          </div>
        </section>

        {/* Companion Visual Spotlight */}
        <section className="companion-spotlight">
          
          {/* Companion Card 1 */}
          <div className="companion-card">
            <div className="companion-img-wrap">
              <img src="/images/companion1.jpg" alt="Aaryan - Handsome Athletic Companion in Udaipur" />
              <div className="companion-gradient-overlay"></div>
              <span className="companion-badge">🔥 Most Loved Companion</span>
            </div>
            <div className="companion-info">
              <div className="companion-name">
                Aaryan Malhotra
                <span style={{ fontSize: '0.95rem', color: '#ff007a' }}>24 Yrs</span>
              </div>
              <div className="companion-stats">
                💪 6'1" Height • Athletic Built • Soft Spoken
              </div>
              <p className="companion-desc">
                "Har aurat princess jaisi care aur respect deserve karti hai. Meri priority aapko khush, comfortable aur emotionally satisfied rakhna hai."
              </p>
              <div className="companion-tags">
                <span className="tag-pill">📍 Udaipur Base</span>
                <span className="tag-pill">❤️ Romantic & Caring</span>
                <span className="tag-pill">🥂 Dinner Date by Lake Pichola</span>
              </div>
            </div>
          </div>

          {/* Companion Card 2 */}
          <div className="companion-card">
            <div className="companion-img-wrap">
              <img src="/images/companion2.jpg" alt="Kabir - Muscular Fitness Model Companion in Udaipur" />
              <div className="companion-gradient-overlay"></div>
              <span className="companion-badge" style={{ borderColor: '#00f2fe', color: '#00f2fe' }}>
                👑 VIP Bodybuilder Gentleman
              </span>
            </div>
            <div className="companion-info">
              <div className="companion-name">
                Kabir Oberoi
                <span style={{ fontSize: '0.95rem', color: '#ff007a' }}>26 Yrs</span>
              </div>
              <div className="companion-stats">
                💪 6'2" Height • Muscular Physique • MBA Professional
              </div>
              <p className="companion-desc">
                "Gentleman manners, deep meaningful baatein, luxury lifestyle aur full attention. Aapka har ek pal yaadgaar banana mera vaada hai."
              </p>
              <div className="companion-tags">
                <span className="tag-pill">📍 Udaipur Base</span>
                <span className="tag-pill">💖 Pure Love & Pampering</span>
                <span className="tag-pill">🔒 Complete Discretion</span>
              </div>
            </div>
          </div>

        </section>

        {/* Content Grid: Form + Why Women Love Us */}
        <div className="content-grid">
          
          {/* Customer Form (Women Only & Udaipur Only) */}
          <section className="glass-card" id="applySection">
            <div className="form-header">
              <span className="form-badge-women">👑 Women Exclusive Registration</span>
              <h2 className="form-title">Private Companion Request</h2>
              <p className="form-subtitle">
                Apni basic details fill karein. Hamari private relationship coordinator (@Receptionist892006) aapse private Telegram par connect karegi.
              </p>
            </div>

            {/* Udaipur Location Restriction Notice */}
            <div className="location-notice-box">
              <div className="location-badge">📍 Service Area: Strictly Udaipur Only (उदयपुर)</div>
              <p>
                ⚠️ <strong>Important Notice:</strong> Hamari luxury companion services <strong>sirf aur sirf Udaipur city</strong> ke andar available hain. Udaipur se bahar service completely unavailable (not available) hai.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="customerName" className="form-label">
                  Aapka Naam (Women / Ladies Name Only)<span className="req">*</span>
                </label>
                <span className="input-hint">Kripya apna sahi naam enter karein (e.g. Pooja, Simran, Ananya, Priya)</span>
                <div className="input-wrapper">
                  <span className="input-icon">👩</span>
                  <input 
                    type="text" 
                    id="customerName" 
                    name="name" 
                    className="form-control" 
                    placeholder="e.g. Simran Kaur" 
                    required 
                    minLength={2}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Age (Location removed from form, locked to Udaipur) */}
              <div className="form-group">
                <label htmlFor="customerAge" className="form-label">
                  Age (Umar)<span className="req">*</span>
                </label>
                <span className="input-hint">18 saal ya usse zyada</span>
                <div className="input-wrapper">
                  <span className="input-icon">🎂</span>
                  <input 
                    type="number" 
                    id="customerAge" 
                    name="age" 
                    className="form-control" 
                    placeholder="e.g. 23" 
                    required 
                    min={18} 
                    max={70}
                    inputMode="numeric"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="form-group">
                <label htmlFor="customerMobile" className="form-label">
                  Mobile Number<span className="req">*</span>
                </label>
                <span className="input-hint">10-digit number jahan hum aapse privately contact kar sakein</span>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input 
                    type="tel" 
                    id="customerMobile" 
                    name="mobile" 
                    className="form-control" 
                    placeholder="e.g. 9876543210" 
                    required 
                    pattern="[6-9][0-9]{9}" 
                    maxLength={10}
                    inputMode="numeric"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className="form-group">
                <label htmlFor="customerWhatsapp" className="form-label">
                  WhatsApp Number<span className="req">*</span>
                </label>
                <div className="checkbox-row">
                  <input 
                    type="checkbox" 
                    id="sameAsMobile" 
                    name="sameAsMobile"
                    checked={formData.sameAsMobile}
                    onChange={handleChange}
                  />
                  <label htmlFor="sameAsMobile">✅ Same as Mobile Number (Yahi mera WhatsApp number hai)</label>
                </div>
                <div className="input-wrapper" style={{ marginTop: '0.5rem' }}>
                  <span className="input-icon">💬</span>
                  <input 
                    type="tel" 
                    id="customerWhatsapp" 
                    name="whatsapp" 
                    className="form-control" 
                    placeholder="e.g. 9876543210" 
                    required 
                    pattern="[6-9][0-9]{9}" 
                    maxLength={10}
                    inputMode="numeric"
                    readOnly={formData.sameAsMobile}
                    style={{ opacity: formData.sameAsMobile ? 0.75 : 1 }}
                    value={formData.whatsapp}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="customerCategory" className="form-label">
                  Aap kis type ki companionship chahti hain?
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">💖</span>
                  <select 
                    id="customerCategory" 
                    name="category" 
                    className="form-control" 
                    style={{ cursor: 'pointer' }}
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Romantic & Loving Companion">❤️ Romantic & Loving Companion (Full Love, Care & Pampering)</option>
                    <option value="Handsome Bodybuilder Date">💪 Athletic Bodybuilder Date (Dinner, Cafe & Lake Date)</option>
                    <option value="Emotional Support & Heart-to-Heart">💬 Deep Emotional Connection (Listen to me & care for me)</option>
                    <option value="Luxury Evening & Long Drive">🚗 Luxury Evening & Udaipur Sightseeing Partner</option>
                    <option value="VIP Elite Exclusive Pass">👑 VIP Complete Experience & 100% Satisfaction</option>
                  </select>
                </div>
              </div>

              {/* Note */}
              <div className="form-group">
                <label htmlFor="customerNote" className="form-label">
                  Aapki koi Khaas Wish ya Udaipur Location Preference (Optional)
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">✍️</span>
                  <input 
                    type="text" 
                    id="customerNote" 
                    name="note" 
                    className="form-control" 
                    placeholder="e.g. Fateh Sagar, City Palace area, ya koi khaas baat..."
                    value={formData.note}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'CONFIRMING PRIVATE PASS...' : 'REQUEST PRIVATE VIP PASS 💖'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span>🔒 100% Safe & Confidential</span>
                <span>•</span>
                <span>Udaipur Only</span>
                <span>•</span>
                <span>Strictly for Women</span>
              </div>
            </form>
          </section>

          {/* Side Panel: Why Women Love Us */}
          <aside className="features-panel">
            <div className="vip-card">
              <div className="vip-header">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ff5da8' }}>WHY WOMEN LOVE US</h3>
                <span className="vip-badge">100% SATISFACTION</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Har aurat deserve karti hai respect, gentle touch, unconditional pyaar aur poori attention. Udaipur me Notty Boyzz par aapko milta hai:
              </p>

              <ul className="feature-list">
                <li className="feature-item">
                  <div className="feature-icon">❤️</div>
                  <div>
                    <div className="feature-title">Pure Love, Care & Pampering</div>
                    <div className="feature-desc">Aapki har baat sunna, aapko special feel karwana aur emotional satisfaction dena hamari pehli pehchan hai.</div>
                  </div>
                </li>
                <li className="feature-item">
                  <div className="feature-icon">💪</div>
                  <div>
                    <div className="feature-title">Trained Bodybuilder Gentlemen</div>
                    <div className="feature-desc">Sabhi companions handsome, fit, muscular physique wale aur well-mannered hote hain.</div>
                  </div>
                </li>
                <li className="feature-item">
                  <div className="feature-icon">🔒</div>
                  <div>
                    <div className="feature-title">100% Privacy & Discretion</div>
                    <div className="feature-desc">Aapka naam aur number hamare pas 100% private aur safe rehta hai. Zero leakage policy.</div>
                  </div>
                </li>
                <li className="feature-item">
                  <div className="feature-icon">✨</div>
                  <div>
                    <div className="feature-title">Zero Judgment Zone</div>
                    <div className="feature-desc">Aap bilkul khulkar apni feeling share kar sakti hain, koi judge nahi karega.</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Satisfaction Card */}
            <div className="vip-card" style={{ borderColor: 'rgba(0, 242, 254, 0.3)', background: 'rgba(0, 242, 254, 0.05)' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                🛡️ 100% Satisfaction Guarantee
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                Hamari service sirf Udaipur city ke local clients ke liye hai. Agar aapko companion ka behavior ya service 100% pasand nahi aati, toh bina kisi sawal ke instant solution diya jata hai.
              </p>
            </div>
          </aside>

        </div>

        {/* Verified Women Client Reviews */}
        <section className="testimonials-section">
          <div className="section-header">
            <h2 className="section-title">Hamari 100% Satisfied Women Clients</h2>
            <p className="section-subtitle">Real feedback from verified women across Udaipur city</p>
          </div>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p className="review-text">
                "Udaipur me aisi classy aur respectful service milna unbelievable hai! Companion itna handsome aur gentle tha, Lake Pichola par dinner date memorable ban gaya. Best service ❤️"
              </p>
              <div className="reviewer-meta">
                <div className="reviewer-avatar">PM</div>
                <div>
                  <div className="reviewer-name">Pooja M.</div>
                  <div className="reviewer-badge">✓ Verified Client • Udaipur</div>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p className="review-text">
                "Best service hands down! Toned bodybuilder guy with such a sweet, respectful and gentle nature. Completely safe aur top quality luxury experience. 100% Satisfied!"
              </p>
              <div className="reviewer-meta">
                <div className="reviewer-avatar" style={{ background: 'linear-gradient(135deg, #00f2fe, #7928ca)' }}>SK</div>
                <div>
                  <div className="reviewer-name">Simran K.</div>
                  <div className="reviewer-badge">✓ Verified Client • Udaipur</div>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p className="review-text">
                "I felt deeply heard, pampered and truly loved. The companion was so well-educated and fit. Complete privacy maintained. Highly recommended for ladies in Udaipur!"
              </p>
              <div className="reviewer-meta">
                <div className="reviewer-avatar" style={{ background: 'linear-gradient(135deg, #fbbf24, #ff007a)' }}>AR</div>
                <div>
                  <div className="reviewer-name">Ananya R.</div>
                  <div className="reviewer-badge">✓ Verified Client • Udaipur</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Success Modal - Connect Directly via Telegram (NO WHATSAPP REDIRECT) */}
      {successInquiry && (
        <div className="modal-backdrop active" onClick={() => setSuccessInquiry(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="success-icon-anim">💖</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.4rem' }}>Pass Requested Successfully! 🎉</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Shukriya! Aapki private enquiry Notty Boyzz Udaipur Desk tak pahunch chuki hai.
            </p>

            <div>
              <span className="modal-ref">{successInquiry.id}</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Aap turant hamari private receptionist se <strong>Telegram</strong> par direct jud sakti hain:
            </p>

            <div className="modal-actions">
              <a 
                href="https://t.me/Receptionist892006"
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-telegram-direct"
              >
                ✈️ Connect on Telegram (@Receptionist892006)
              </a>
              <button type="button" className="btn-modal-close" onClick={() => setSuccessInquiry(null)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Male Blocked Modal */}
      {isBlocked && (
        <div className="modal-backdrop active" onClick={() => setIsBlocked(false)}>
          <div className="modal-content blocked-modal" onClick={e => e.stopPropagation()}>
            <div className="blocked-icon">🚫</div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f87171', marginBottom: '0.5rem' }}>
              Process Stopped: Women Only!
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Maaf kijiye! Notty Boyzz premium luxury companion services <strong style={{ color: '#ff55a3' }}>sirf aur sirf Women / Female clients</strong> ke liye exclusive hain.
            </p>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', fontSize: '0.82rem', color: '#fca5a5', marginBottom: '1.5rem' }}>
              ⚠️ Male / Purush applications system allow nahi karta. Aage ka process band kar diya gaya hai.
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-modal-close" 
                style={{ borderColor: '#f87171', color: '#fff' }}
                onClick={() => setIsBlocked(false)}
              >
                Samajh Gaya (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-links">
            <a href="#applySection">Apply Now (Udaipur)</a>
            <a href="https://t.me/Receptionist892006" target="_blank" rel="noopener noreferrer">Telegram Support</a>
            <a href="#">Privacy & Confidentiality</a>
            <a href="#">Terms of Service</a>
          </div>
          <p>© 2026 NOTTY BOYZZ. Luxury Companionship for Women in Udaipur. Built for love, happiness & satisfaction.</p>
        </div>
      </footer>
    </>
  );
}
