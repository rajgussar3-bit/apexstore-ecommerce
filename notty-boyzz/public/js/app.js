/* ==========================================================================
   NOTTY BOYZZ - PUBLIC FRONTEND APPLICATION SCRIPT
   Theme: Exclusive Companion & Love Service for Women
   Features: Female-Only Validation, Male Name Blocker, Form Submit, Feedback
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('nottyForm');
  const nameInput = document.getElementById('customerName');
  const ageInput = document.getElementById('customerAge');
  const mobileInput = document.getElementById('customerMobile');
  const whatsappInput = document.getElementById('customerWhatsapp');
  const sameAsMobileCheck = document.getElementById('sameAsMobile');
  const categoryInput = document.getElementById('customerCategory');
  const cityInput = document.getElementById('customerCity');
  const noteInput = document.getElementById('customerNote');
  const submitBtn = document.getElementById('btnSubmitForm');
  const btnSpinner = document.getElementById('submitSpinner');
  const btnText = document.getElementById('submitBtnText');

  // Success Modal
  const successModal = document.getElementById('successModal');
  const refIdDisplay = document.getElementById('modalRefId');
  const waDirectBtn = document.getElementById('modalWaBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  // Male Blocked Modal
  const blockedModal = document.getElementById('blockedModal');
  const blockedCloseBtn = document.getElementById('blockedCloseBtn');

  // BroadcastChannel for instant local communication between tabs
  const broadcast = window.BroadcastChannel ? new BroadcastChannel('notty_boyzz_channel') : null;

  // 1. Comprehensive Male Name Detection Engine
  const MALE_NAMES = new Set([
    // Popular Indian Male Names
    "rahul", "amit", "rohit", "mohit", "vikas", "ajay", "deepak", "suresh", "ramesh", "raj", "rajesh",
    "sachin", "karan", "arjun", "aman", "sumit", "abhishek", "vivek", "sunil", "anil", "pawan",
    "manoj", "ravi", "sanjay", "vijay", "vishal", "sandeep", "pradeep", "gaurav", "saurav", "kunal",
    "neeraj", "manish", "sunny", "vicky", "nitin", "ashish", "harsh", "aditya", "shubham", "mayank",
    "akash", "varun", "chetan", "dev", "rohan", "kabir", "aryan", "ayush", "kartik", "ankit",
    "sourabh", "pankaj", "alok", "anand", "ashok", "bharat", "brijesh", "chandan", "dharmendra",
    "dinesh", "ganesh", "gopal", "govind", "harish", "hemant", "himanshu", "ishaan", "jagdish",
    "jitendra", "kamal", "kapil", "keshav", "kishore", "krishna", "kuldeep", "lalit", "lokesh",
    "mahesh", "mithun", "mukesh", "naresh", "narendra", "naveen", "nikhil", "om", "parveen",
    "prashant", "praveen", "prem", "raghav", "rajat", "rajeev", "rakesh", "ram", "ranjeet",
    "ratnesh", "rishi", "ritesh", "samir", "sameer", "santosh", "sarvesh", "satish", "shankar",
    "shantanu", "shashi", "shivam", "shiv", "sid", "siddharth", "sonu", "monu", "tarun", "tushar",
    "umesh", "upendra", "vinay", "vinod", "vipin", "yash", "yogesh", "bablu", "chintu", "monty",
    "bunty", "rocky", "tony", "lucky", "bobby", "deep", "jeet", "meet", "gagan", "mandeep",
    "gurpreet", "harpreet", "jaspreet", "gursewak", "kulwant", "balwinder", "satnam", "manpreet",
    "mohammed", "mohammad", "ali", "ahmed", "imran", "salman", "sahil", "faizan", "bilal", "zeeshan",
    "farhan", "arbaaz", "rehan", "asif", "arif", "irfan", "wasim", "shahrukh", "aamir", "saif",
    // Western / Global Male Names
    "john", "david", "michael", "alex", "chris", "mike", "james", "robert", "william", "daniel",
    "matthew", "anthony", "mark", "paul", "steven", "andrew", "brian", "kevin", "george", "edward"
  ]);

  function isMaleName(fullName) {
    if (!fullName) return false;
    const clean = fullName.trim().toLowerCase();
    const parts = clean.split(/[\s._-]+/).filter(Boolean);

    // Check titles / prefixes
    if (['mr', 'mr.', 'shri', 'master', 'bhai', 'kumar', 'boy', 'guy'].includes(parts[0])) {
      return true;
    }

    // Check first name or any individual token
    for (const token of parts) {
      if (MALE_NAMES.has(token)) {
        return true;
      }
    }

    // Check suffix/keywords
    if (clean.endsWith('kumar') || clean.endsWith(' bhai') || clean.includes(' boy')) {
      return true;
    }

    return false;
  }

  // 2. "Same as Mobile Number" Synchronization
  if (sameAsMobileCheck) {
    sameAsMobileCheck.addEventListener('change', () => {
      if (sameAsMobileCheck.checked) {
        whatsappInput.value = mobileInput.value;
        whatsappInput.setAttribute('readonly', 'true');
        whatsappInput.style.opacity = '0.75';
      } else {
        whatsappInput.removeAttribute('readonly');
        whatsappInput.style.opacity = '1';
      }
    });

    mobileInput.addEventListener('input', () => {
      if (sameAsMobileCheck.checked) {
        whatsappInput.value = mobileInput.value;
      }
    });
  }

  // 3. Form Validation & Interaction Sync
  const syncAria = (el) => {
    if (!el) return;
    try {
      el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    } catch (e) {}
  };

  [nameInput, ageInput, mobileInput, whatsappInput].forEach(field => {
    if (!field) return;
    field.addEventListener('blur', () => syncAria(field));
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) syncAria(field);
    });
  });

  // 4. Form Submit Handler with Female-Only Check
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const age = ageInput.value.trim() ? parseInt(ageInput.value, 10) : null;
      const mobile = mobileInput.value.trim();
      const whatsapp = (sameAsMobileCheck && sameAsMobileCheck.checked)
        ? mobile
        : (whatsappInput.value.trim() || mobile);
      const category = categoryInput ? categoryInput.value : 'Romantic & Caring Companion';
      const city = cityInput ? cityInput.value.trim() : '';
      const note = noteInput ? noteInput.value.trim() : '';

      // --- CRITICAL SYSTEM CHECK: FEMALE ONLY ---
      if (isMaleName(name)) {
        // Block process immediately
        showBlockedModal();
        nameInput.focus();
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Basic client mobile check (10 digits)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(mobile)) {
        alert('Kripya valid 10-digit mobile number enter karein (starting with 6,7,8,9)');
        mobileInput.focus();
        return;
      }

      // UI Loading State
      submitBtn.disabled = true;
      if (btnSpinner) btnSpinner.style.display = 'inline-block';
      if (btnText) btnText.textContent = 'CONFIRMING PRIVATE PASS...';

      const payload = {
        name,
        age,
        mobile,
        whatsapp,
        category,
        city,
        note,
        clientType: 'Female Client'
      };

      let submittedInquiry = null;

      try {
        // Backend REST API
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          submittedInquiry = result.inquiry;
        } else {
          if (result.error && result.error.includes('Women')) {
            showBlockedModal();
            submitBtn.disabled = false;
            if (btnSpinner) btnSpinner.style.display = 'none';
            if (btnText) btnText.textContent = 'REQUEST PRIVATE VIP PASS 💖';
            return;
          }
          throw new Error(result.error || 'Server rejected');
        }
      } catch (err) {
        console.warn('Backend offline or failed, using local storage fallback:', err);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        }) + ', ' + now.toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: true
        });

        submittedInquiry = {
          id: `NBZ-${randomNum}`,
          name,
          age,
          mobile,
          whatsapp,
          category,
          city: city || 'India',
          note,
          clientType: 'Female Client',
          status: 'New',
          createdAt: now.toISOString(),
          formattedDate
        };

        try {
          const existing = JSON.parse(localStorage.getItem('notty_inquiries') || '[]');
          existing.unshift(submittedInquiry);
          localStorage.setItem('notty_inquiries', JSON.stringify(existing));
        } catch (storageErr) {
          console.error(storageErr);
        }
      }

      // Notify Control Desk via BroadcastChannel
      if (broadcast && submittedInquiry) {
        try {
          broadcast.postMessage({ type: 'NEW_INQUIRY', data: submittedInquiry });
        } catch (e) {}
      }

      // Reset loading state
      submitBtn.disabled = false;
      if (btnSpinner) btnSpinner.style.display = 'none';
      if (btnText) btnText.textContent = 'REQUEST PRIVATE VIP PASS 💖';

      // Reset form
      form.reset();
      if (sameAsMobileCheck) sameAsMobileCheck.checked = false;
      if (whatsappInput) {
        whatsappInput.removeAttribute('readonly');
        whatsappInput.style.opacity = '1';
      }

      // Show Success Modal
      if (submittedInquiry) {
        showSuccessModal(submittedInquiry);
      }
    });
  }

  function showSuccessModal(inquiry) {
    if (refIdDisplay) {
      refIdDisplay.textContent = inquiry.id || 'NBZ-CONFIRMED';
    }

    if (waDirectBtn) {
      const msg = encodeURIComponent(`Hello Notty Boyzz! I just requested a private VIP pass (Ref: ${inquiry.id}, Name: ${inquiry.name}). Looking forward to meeting a handsome companion.`);
      waDirectBtn.href = `https://wa.me/919876543210?text=${msg}`;
    }

    if (successModal) {
      successModal.classList.add('active');
    }
  }

  function showBlockedModal() {
    if (blockedModal) {
      blockedModal.classList.add('active');
    } else {
      alert('⚠️ Access Denied: Notty Boyzz premium companion services exclusively reserved for Female / Women clients only. Male applications are strictly not accepted.');
    }
  }

  if (modalCloseBtn && successModal) {
    modalCloseBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
    });

    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) successModal.classList.remove('active');
    });
  }

  if (blockedCloseBtn && blockedModal) {
    blockedCloseBtn.addEventListener('click', () => {
      blockedModal.classList.remove('active');
    });

    blockedModal.addEventListener('click', (e) => {
      if (e.target === blockedModal) blockedModal.classList.remove('active');
    });
  }
});
