/**
 * ReliefTrack - Web3 Relief Protocol
 * Global Interactive Application Script
 */

(function () {
  'use strict';

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
