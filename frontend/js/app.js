/**
 * ReliefTrack - Web3 Relief Protocol
 * Global Interactive Application Script
 */

(function () {
  'use strict';

  // --- Centralized Shared Data Store (Synchronized across Donor, NGO, Manager) ---
  window.ReliefTrackStore = {
    // Initial users (Donors & NGOs)
    defaultUsers: [
      {
        id: 'USR-DON-101',
        name: 'Rahul Sharma',
        role: 'DONOR',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        credentials: 'Individual KYC Verified',
        status: 'ACTIVE',
        totalDonated: 85000,
        joinedDate: '2026-08-10',
        wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
      },
      {
        id: 'USR-DON-102',
        name: 'Priya Verma',
        role: 'DONOR',
        email: 'priya.verma@techcorp.org',
        phone: '+91 91234 56789',
        credentials: 'CSR Corporate Donor',
        status: 'ACTIVE',
        totalDonated: 35000,
        joinedDate: '2026-08-15',
        wallet: '0x3F4b89A002b545dE434914197e93700b659c41E5'
      },
      {
        id: 'USR-NGO-201',
        name: 'Red Cross Relief India',
        role: 'NGO',
        email: 'contact@redcrossindia.org',
        phone: '+91 98221 00112',
        ngoCode: 'NGO-1042',
        regNumber: '80G-AAATC1234F2026',
        credentials: '80G / FCRA Registered',
        status: 'VERIFIED ✓',
        joinedDate: '2026-07-20',
        wallet: '0x8a7291bc44f128e932104975193a218f77361a90'
      },
      {
        id: 'USR-NGO-202',
        name: 'Care Foundation India',
        role: 'NGO',
        email: 'info@carefoundation.in',
        phone: '+91 98334 11223',
        ngoCode: 'NGO-2089',
        regNumber: '80G-DELC9876K2025',
        credentials: '80G / FCRA Registered',
        status: 'VERIFIED ✓',
        joinedDate: '2026-08-01',
        wallet: '0x99A8b11D001eA7F8548972E21013442A042784d1'
      }
    ],

    // Initial 3-way transactions ledger
    defaultTransactions: [
      {
        id: 'TX-DON-2026-8F72',
        type: 'DONATION',
        sender: 'Rahul Sharma (Donor)',
        recipient: 'Emergency Medical Relief Campaign 2026',
        ngo: 'Red Cross Relief India',
        beneficiary: 'Sunita Sharma (BEN-72A91)',
        amount: 10000,
        paymentMethod: 'UPI',
        txHash: '0x8a7291bc44f128e932104975193a218f77361a90c4217734891a274191bc44f1',
        status: 'CONFIRMED ON-CHAIN ✓',
        date: '2026-08-22 10:21'
      },
      {
        id: 'TX-ALLOC-2026-91A7',
        type: 'ALLOCATION',
        sender: 'Manager Auditor (Pool)',
        recipient: 'Red Cross Relief India (NGO-1042)',
        ngo: 'Red Cross Relief India',
        beneficiary: 'Sunita Sharma (BEN-72A91)',
        amount: 8500,
        paymentMethod: 'Pool Allocation',
        txHash: '0x991823abf772183e910293a8172bc9102931bc77261a90c4217734891a274191',
        status: 'APPROVED & LOCKED',
        date: '2026-08-22 11:18'
      },
      {
        id: 'TX-AID-2026-0012',
        type: 'DISBURSEMENT',
        sender: 'Red Cross Relief India',
        recipient: 'Sunita Sharma (BEN-72A91)',
        ngo: 'Red Cross Relief India',
        beneficiary: 'Sunita Sharma (BEN-72A91)',
        amount: 15000,
        aidType: 'Medical Surgery Advance',
        paymentMethod: 'UPI',
        txHash: '0x77f92a10c92138e9182b881a72019b88271a920b771629a810293481029a8712',
        status: 'DISBURSED TO VENDOR ✓',
        date: '2026-08-22 12:45'
      },
      {
        id: 'TX-EXP-2026-77A2',
        type: 'EXPENSE',
        sender: 'Red Cross Relief India',
        recipient: 'XYZ Super Specialty Hospital',
        ngo: 'Red Cross Relief India',
        beneficiary: 'Sunita Sharma (BEN-72A91)',
        amount: 6500,
        category: 'Surgical OT Charges & Diagnostic',
        paymentMethod: 'Bank Transfer',
        txHash: '0x38a192b0c91823abf772183e910293a8172bc9102931bc77261a90c421773489',
        status: 'VERIFIED & AUDITED ✓',
        date: '2026-08-22 14:10'
      },
      {
        id: 'TX-DON-2026-99A1',
        type: 'DONATION',
        sender: 'Priya Verma (Donor)',
        recipient: 'Flood Disaster Reconstruction & Aid',
        ngo: 'Care Foundation India',
        beneficiary: 'Ramesh Kumar (BEN-88B14)',
        amount: 25000,
        paymentMethod: 'Credit Card',
        txHash: '0x55c182a901823b771629a810293481029a87120x8a7291bc44f128e93210497519',
        status: 'CONFIRMED ON-CHAIN ✓',
        date: '2026-08-21 16:30'
      }
    ],

    // User Operations
    getUsers: function (roleFilter) {
      try {
        const stored = localStorage.getItem('relieftrack_all_users');
        const users = stored ? JSON.parse(stored) : this.defaultUsers;
        if (!stored) localStorage.setItem('relieftrack_all_users', JSON.stringify(this.defaultUsers));
        if (roleFilter && roleFilter !== 'ALL') {
          return users.filter(u => u.role === roleFilter);
        }
        return users;
      } catch (e) {
        return this.defaultUsers;
      }
    },

    registerUser: function (userData) {
      const users = this.getUsers();
      const newId = userData.role === 'DONOR' 
        ? 'USR-DON-' + Math.floor(100 + Math.random() * 900)
        : userData.role === 'NGO'
          ? 'USR-NGO-' + Math.floor(200 + Math.random() * 800)
          : 'USR-MGR-' + Math.floor(300 + Math.random() * 700);

      const newUser = {
        id: newId,
        name: userData.name || 'Anonymous User',
        role: userData.role || 'DONOR',
        email: userData.email,
        phone: userData.phone || '',
        ngoCode: userData.role === 'NGO' ? 'NGO-' + Math.floor(1000 + Math.random() * 9000) : undefined,
        regNumber: userData.regNumber || (userData.role === 'NGO' ? '80G-TEMP' + Math.floor(1000 + Math.random() * 9000) : undefined),
        credentials: userData.role === 'NGO' ? '80G / FCRA Registered' : 'Individual KYC Verified',
        status: userData.role === 'NGO' ? 'VERIFIED ✓' : 'ACTIVE',
        totalDonated: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        wallet: userData.wallet || '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6)
      };

      users.unshift(newUser);
      localStorage.setItem('relieftrack_all_users', JSON.stringify(users));
      return newUser;
    },

    // Transaction Operations (3-way visibility)
    getTransactions: function (typeFilter) {
      try {
        const stored = localStorage.getItem('relieftrack_all_transactions');
        const list = stored ? JSON.parse(stored) : this.defaultTransactions;
        if (!stored) localStorage.setItem('relieftrack_all_transactions', JSON.stringify(this.defaultTransactions));
        if (typeFilter && typeFilter !== 'ALL') {
          return list.filter(t => t.type === typeFilter);
        }
        return list;
      } catch (e) {
        return this.defaultTransactions;
      }
    },

    addTransaction: function (txData) {
      const list = this.getTransactions();
      const randHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const randId = 'TX-' + (txData.type ? txData.type.substring(0, 3) : 'GEN') + '-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase();

      const newTx = {
        id: txData.id || randId,
        type: txData.type || 'DONATION',
        sender: txData.sender || 'Anonymous Donor',
        recipient: txData.recipient || 'Relief Fund Pool',
        ngo: txData.ngo || 'Red Cross Relief India',
        beneficiary: txData.beneficiary || 'Sunita Sharma (BEN-72A91)',
        amount: Number(txData.amount) || 5000,
        paymentMethod: txData.paymentMethod || 'UPI',
        category: txData.category,
        aidType: txData.aidType,
        txHash: txData.txHash || randHash,
        status: txData.status || 'CONFIRMED ON-CHAIN ✓',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      list.unshift(newTx);
      localStorage.setItem('relieftrack_all_transactions', JSON.stringify(list));
      return newTx;
    }
  };

  // Initialize store immediately
  window.ReliefTrackStore.getUsers();
  window.ReliefTrackStore.getTransactions();

  // --- Session & Role Management ---
  window.ReliefTrack = {
    getSession: function () {
      try {
        const data = localStorage.getItem('relieftrack_session');
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    },
    saveSession: function (role, userDetails) {
      const session = {
        role: role,
        user: userDetails || { email: role.toLowerCase() + '@relieftrack.org', full_name: role + ' User' },
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('relieftrack_session', JSON.stringify(session));
      return session;
    },
    clearSession: function () {
      localStorage.removeItem('relieftrack_session');
      sessionStorage.removeItem('relieftrack_target_role');
    },
    logout: function () {
      this.clearSession();
      window.location.href = 'index.html';
    }
  };

  // Global state
  let connectedWalletAddress = localStorage.getItem('relieftrack_wallet') || null;

  // --- Wallet Modal Handlers ---
  window.openWalletModal = function () {
    const modal = document.getElementById('wallet-modal');
    if (modal) modal.classList.add('active');
  };

  window.closeWalletModal = function () {
    const modal = document.getElementById('wallet-modal');
    if (modal) modal.classList.remove('active');
  };

  window.connectWallet = function (walletType) {
    const addresses = {
      metamask: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      coinbase: '0x3F4b89A002b545dE434914197e93700b659c41E5',
      walletconnect: '0x99A8b11D001eA7F8548972E21013442A042784d1'
    };
    connectedWalletAddress = addresses[walletType] || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    localStorage.setItem('relieftrack_wallet', connectedWalletAddress);
    
    // Update navbar buttons
    const btn = document.getElementById('wallet-connect-btn');
    if (btn) {
      btn.innerHTML = `<svg class="w-4 h-4 text-emerald-400 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> ${connectedWalletAddress.substring(0, 6)}...${connectedWalletAddress.substring(connectedWalletAddress.length - 4)}`;
      btn.className = 'btn btn-secondary btn-sm';
    }
    window.closeWalletModal();
  };

  window.disconnectWallet = function () {
    localStorage.removeItem('relieftrack_wallet');
    connectedWalletAddress = null;
    const btn = document.getElementById('wallet-connect-btn');
    if (btn) {
      btn.innerHTML = `<svg class="w-4 h-4 text-emerald-400 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Connect Wallet`;
      btn.className = 'btn btn-primary btn-sm';
    }
  };

  // --- Modal Dialog Generic Open/Close ---
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  // --- Payment Tab Switching ---
  window.switchPaymentTab = function (tabId) {
    const tabs = ['upi', 'card', 'netbanking', 'crypto'];
    tabs.forEach(t => {
      const el = document.getElementById(`tab-content-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (el) el.classList.add('hidden');
      if (btn) {
        btn.classList.remove('bg-emerald-950/40', 'border-emerald-500', 'text-emerald-400', 'ring-1', 'ring-emerald-500/50');
        btn.classList.add('bg-slate-950', 'border-slate-800', 'text-slate-400');
      }
    });

    const activeEl = document.getElementById(`tab-content-${tabId}`);
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeEl) activeEl.classList.remove('hidden');
    if (activeBtn) {
      activeBtn.classList.remove('bg-slate-950', 'border-slate-800', 'text-slate-400');
      activeBtn.classList.add('bg-emerald-950/40', 'border-emerald-500', 'text-emerald-400', 'ring-1', 'ring-emerald-500/50');
    }
  };

  // --- Camera Capture Simulation ---
  let activeStream = null;

  window.startCameraCapture = async function () {
    const video = document.getElementById('camera-video');
    const previewDiv = document.getElementById('camera-preview-container');
    const captureBtn = document.getElementById('capture-btn');
    if (!video || !previewDiv) return;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = activeStream;
        video.classList.remove('hidden');
        if (captureBtn) captureBtn.classList.remove('hidden');
      } else {
        alert('Camera access not available on this browser. Simulated camera feed active.');
      }
    } catch (e) {
      console.warn('Live camera stream unavailable, using simulation mode.', e);
    }
  };

  window.captureSnapshot = function () {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const photoInput = document.getElementById('captured-photo-result');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    if (video && !video.classList.contains('hidden') && video.readyState === 4) {
      ctx.drawImage(video, 0, 0, 640, 480);
    } else {
      // Draw simulated camera snapshot text & watermark
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('EMERGENCY AID RECEIPT PROOF', 140, 200);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(`GPS: 31.1048° N, 77.1734° E • timestamp: ${new Date().toLocaleString()}`, 110, 240);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 600, 440);
    }

    const dataUrl = canvas.toDataURL('image/jpeg');
    if (photoInput) photoInput.value = dataUrl;

    const capturedStatus = document.getElementById('captured-status-badge');
    if (capturedStatus) {
      capturedStatus.innerHTML = '<span class="badge badge-success">✓ Photo Captured & Geo-Tagged</span>';
    }
    alert('Evidence photo captured and GPS timestamp anchored!');
  };

  window.stopCameraCapture = function () {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
    }
  };

  // DOM Content Loaded Initializer
  document.addEventListener('DOMContentLoaded', function () {
    // Check saved wallet state
    if (connectedWalletAddress) {
      const btn = document.getElementById('wallet-connect-btn');
      if (btn) {
        btn.innerHTML = `<svg class="w-4 h-4 text-emerald-400 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> ${connectedWalletAddress.substring(0, 6)}...${connectedWalletAddress.substring(connectedWalletAddress.length - 4)}`;
        btn.className = 'btn btn-secondary btn-sm';
      }
    }
  });
})();
