# ⚡ NOTTY BOYZZ - Web & Live Control Desk System

Ek modern, high-energy aur dark-neon themed website aur alag dedicated **Control Desk (Admin Portal)** system jisme customer front pe form fill karega aur control desk par instant real-time inquiry show hogi.

---

## 🌟 Features (Kya kya features hain)

### 1. 🌐 Customer Frontend Website (`http://localhost:3000/`)
- **Urban Cyber-Neon Design**: Dark Obsidian Black (`#080a0f`) background, electric cyan & magenta glowing accents, glassmorphic cards aur smooth micro-interactions.
- **Customer Entry Form**:
  - **Aapka Naam (Full Name)**
  - **Age (Umar)**: 16 se 80 tak validated
  - **Mobile Number**: 10-digit validation (`type="tel"`, `inputmode="numeric"`)
  - **WhatsApp Number**: Saath me **"✅ Same as Mobile Number"** 1-click toggle checkbox (tick karne par mobile number apne aap WhatsApp field me copy ho jata hai)
  - **Category**: VIP Clan Member, Event Pass, Merch, Collab, General
  - **City & Note**: Optional fields
- **Instant Validation**: Modern HTML5 `:user-valid` / `:user-invalid` feedback (typing ke dauran galat error nahi dikhata).
- **Success Confirmation Modal**: Form submit hote hi unique Reference ID (`NBZ-XXXX`) aur direct 1-Click WhatsApp Connect button aayega.

---

### 2. 🔒 Control Desk / Admin Portal (`http://localhost:3000/control-desk.html` ya `/control`)
- **PIN Security Lock**: Default PIN **`1234`** (Screen lock hone par bina PIN koi lead nahi dekh sakta).
- **Real-Time Live Feed**:
  - Customer ke form submit karte hi **bina page refresh kiye** Control Desk par turant entry show hoti hai.
  - **Live Audio Chime Alert**: Nayi inquiry aate hi synthesized bell sound play hota hai.
  - **Live Alert Banner**: Screen ke bottom-right par animated notification toast pop up hota hai.
- **1-Click Direct Action Buttons**:
  - 📞 **Direct Call Button (`tel:`)**: Mobile number par click karke turant phone dialer khul jata hai.
  - 💬 **Direct WhatsApp Button (`wa.me`)**: WhatsApp button dabane par customer ka naam aur reference ID pre-typed message ke sath direct open ho jata hai.
- **Lead Status Management**:
  - `🟡 New Lead`
  - `🔵 Contacted`
  - `🟢 Confirmed VIP`
  - `🔴 Rejected`
  - Status change karte hi database me save ho jata hai.
- **Live Counters**:
  - Total Inquiries
  - New / Pending Leads
  - Contacted Customers
  - Today's Fresh Leads
- **Search & Filter**:
  - Real-time search by Name, Mobile, WhatsApp, or Ref ID.
  - Filter by status dropdown.
- **📥 One-Click CSV / Excel Export**: Ek click me sabhi leads ko Excel-ready spreadsheet (`.csv`) me download karein.

---

## 🚀 Run Kaise Karein (How to Start)

### Option 1: 1-Click Batch File (Sabse Aasan)
Sirf `start.bat` file par double click karein! Ye apne aap server start karke browser me website aur control desk open kar dega.

### Option 2: Command Line se
```powershell
cd notty-boyzz
npm start
```
Browser me open karein:
- **Customer Website**: [http://localhost:3000](http://localhost:3000)
- **Control Desk (Admin)**: [http://localhost:3000/control-desk.html](http://localhost:3000/control-desk.html) (Default PIN: `1234`)

---

## 🗄️ Database & Storage
Sabhi customer inquiries `data/inquiries.json` file me automatically persist hoti hain. Server restart hone ke baad bhi data safe rehta hai.
Offline/Direct flat-file mode ke liye LocalStorage aur BroadcastChannel fallback bhi built-in hai.
