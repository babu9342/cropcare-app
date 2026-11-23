/* ============================================================
   app.js — Core Application State & Navigation
   Crop Disease Community System
   ============================================================ */

'use strict';

const App = (() => {

  const state = {
    currentUser: null,
    role: 'farmer',
    location: null,
  };

  function navigate(href) { window.location.href = href; }

  function setUser(name, role) {
    state.currentUser = name;
    state.role = role;
    sessionStorage.setItem('cropUser', JSON.stringify({ name, role }));
  }

  function getUser() {
    if (state.currentUser) return state;
    const stored = sessionStorage.getItem('cropUser');
    if (stored) {
      const { name, role } = JSON.parse(stored);
      state.currentUser = name;
      state.role = role;
    }
    return state;
  }

  function logout() {
    sessionStorage.removeItem('cropUser');
    sessionStorage.removeItem('cropLocation');
    sessionStorage.removeItem('token');
    state.currentUser = null;
    state.location = null;
    const isSubFolder = window.location.pathname.includes('/farmer/') ||
                        window.location.pathname.includes('/admin/');
    navigate(isSubFolder ? '../index.html' : 'index.html');
  }

  function $(sel, ctx = document) { return ctx.querySelector(sel); }
  function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
  function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function setVal(id, value) { const el = document.getElementById(id); if (el && value) el.value = value; }
  function show(id) { const el = document.getElementById(id); if (el) { el.style.display = ''; el.hidden = false; } }
  function hide(id) { const el = document.getElementById(id); if (el) { el.style.display = 'none'; el.hidden = true; } }
  function showBlock(id) { const el = document.getElementById(id); if (el) el.style.display = 'block'; }
  function hideEl(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  function toggle(id) { const el = document.getElementById(id); if (el) el.style.display = el.style.display === 'none' ? '' : 'none'; }

  function toast(message, type = 'success', duration = 3500) {
    const existing = document.getElementById('app-toast');
    if (existing) existing.remove();
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const colors = {
      success: 'background:#d1e7dd;border-color:#0a4c2a;color:#0a4c2a;',
      error:   'background:#ffeaea;border-color:#e63946;color:#7b2332;',
      warning: 'background:#fffbeb;border-color:#f59e0b;color:#78350f;',
      info:    'background:#e3f2fd;border-color:#1e88e5;color:#1e3a5f;',
    };
    const t = document.createElement('div');
    t.id = 'app-toast';
    t.style.cssText = `position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;align-items:center;gap:10px;padding:14px 20px;border-radius:12px;border:1.5px solid;max-width:380px;font-family:'DM Sans',sans-serif;font-size:0.88rem;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,0.18);animation:fadeSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) both;${colors[type]}`;
    t.innerHTML = `<span style="font-size:1.1rem;">${icons[type]}</span><span>${message}</span>`;
    document.body.appendChild(t);
    setTimeout(() => { if (t.parentNode) { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); } }, duration);
  }

  function setLoading(btnId, loading, loadingText = 'Please wait...') {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) {
      btn._origText = btn.innerHTML;
      btn.innerHTML = `<span style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span> ${loadingText}`;
      btn.disabled = true;
    } else {
      btn.innerHTML = btn._origText || '';
      btn.disabled = false;
    }
  }

  function handleFileUpload(inputEl, previewId) {
    const file = inputEl.files[0];
    if (!file) return;
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--green-ghost);border-radius:8px;border:1.5px solid var(--green-light);"><span style="font-size:1.4rem;">📎</span><div><div style="font-weight:700;color:var(--green-deep);font-size:0.88rem;">${file.name}</div><div style="font-size:0.74rem;color:var(--gray-500);">${(file.size/1024).toFixed(1)} KB</div></div><span style="margin-left:auto;color:var(--green-mid);font-size:0.78rem;font-weight:700;">Ready ✓</span></div>`;
    }
  }

  function setActiveSidebarLink(href) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === href || link.dataset.page === href);
    });
  }

  /* ── Real API call helper ── */
  async function api(endpoint, method = 'GET', body = null) {
    const token = sessionStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const rawBaseUrl = window.API_BASE_URL || localStorage.getItem('API_BASE_URL') || '';
    const baseUrl = typeof rawBaseUrl === 'string' ? rawBaseUrl.replace(/\/+$/, '') : '';
    const url = endpoint.startsWith('http') ? endpoint : (baseUrl + endpoint);
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  function toggleVote(btnEl) {
    const isVoted = btnEl.classList.contains('voted');
    const countEl = btnEl.querySelector('.vote-count');
    if (!countEl) return;
    const count = parseInt(countEl.textContent);
    if (isVoted) {
      btnEl.classList.remove('voted');
      countEl.textContent = count - 1;
    } else {
      btnEl.classList.add('voted');
      countEl.textContent = count + 1;
      toast('Thanks for your feedback!', 'success', 2000);
    }
  }

  function initFilterChips(containerSel, callback) {
    const container = document.querySelector(containerSel);
    if (!container) return;
    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (callback) callback(chip.dataset.filter || chip.textContent.trim());
      });
    });
  }

  function initTableSearch(inputId, tableBodyId, columns = [0, 1, 2]) {
    const input = document.getElementById(inputId);
    const tbody = document.getElementById(tableBodyId);
    if (!input || !tbody) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      tbody.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        const match = columns.some(i => cells[i] && cells[i].textContent.toLowerCase().includes(q));
        row.style.display = match || !q ? '' : 'none';
      });
    });
  }

  function init() {
    if (!document.getElementById('app-keyframes')) {
      const style = document.createElement('style');
      style.id = 'app-keyframes';
      style.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `;
      document.head.appendChild(style);
    }
    const savedLoc = sessionStorage.getItem('cropLocation');
    if (savedLoc) {
      const loc = JSON.parse(savedLoc);
      if (typeof LocationAPI !== 'undefined') LocationAPI.updateNavbar(loc.display);
    }
  }

  return { state, navigate, setUser, getUser, logout, $, $$, val, setVal,
           show, hide, showBlock, hideEl, toggle, toast, setLoading,
           handleFileUpload, setActiveSidebarLink, init, toggleVote,
           initFilterChips, initTableSearch, api };

})();

document.addEventListener('DOMContentLoaded', App.init);
