/* ============================================================
   layout.js — Shared Layout: Navbar + Sidebar injection
   ============================================================ */

'use strict';

const Layout = (() => {

  function farmerNav(activePage) {
    const links = [
      { href: 'dashboard.html',       icon: '🏠', label: 'Dashboard',          page: 'farmer-dashboard' },
      { href: 'report.html',          icon: '🦠', label: 'Report Disease',      page: 'report' },
      { href: 'alerts.html',          icon: '📢', label: 'View Alerts',         page: 'alerts',   notif: true },
      { href: 'solutions.html',       icon: '💡', label: 'Community Solutions', page: 'solutions' },
      { href: 'submit-solution.html', icon: '✍️', label: 'Give Solution',       page: 'submit-solution' },
      { href: 'my-reports.html',      icon: '📋', label: 'My Reports',          page: 'my-reports' },
      { href: 'history.html',         icon: '📊', label: 'Outbreak History',    page: 'history' },
    ];
    return renderSidebar(links, activePage);
  }

  function adminNav(activePage) {
    const links = [
      { href: 'dashboard.html',  icon: '🏠', label: 'Dashboard',        page: 'admin-dashboard' },
      { href: 'pending.html',    icon: '📝', label: 'Pending Reports',   page: 'admin-pending', notif: true },
      { href: 'verified.html',   icon: '✅', label: 'Verified Reports',  page: 'admin-verified' },
      { href: 'farmers.html',    icon: '👥', label: 'Manage Farmers',    page: 'admin-farmers' },
      { href: 'analytics.html',  icon: '📊', label: 'Analytics',         page: 'admin-analytics' },
    ];
    return renderSidebar(links, activePage);
  }

  function renderSidebar(links, activePage) {
    const items = links.map(l => `
      <a href="${l.href}" class="sidebar-link${l.page === activePage ? ' active' : ''}" data-page="${l.page}">
        <span class="s-icon">${l.icon}</span>
        ${l.label}
        ${l.notif ? '<span class="notif"></span>' : ''}
      </a>`).join('');
    return `
      <div class="sidebar-section-label">Navigation</div>
      ${items}
      <div class="sidebar-spacer"></div>
      <div class="sidebar-section-label">Account</div>
      <a href="../index.html" class="sidebar-link" onclick="App.logout();return false;">
        <span class="s-icon">🚪</span> Logout
      </a>`;
  }

  function farmerNavbar(userName = 'Farmer') {
    return `
      <nav class="navbar">
        <a class="navbar-brand" href="dashboard.html">
          <span class="brand-icon">🌾</span>
          <div class="brand-text">CropCare Community <span>Outbreak Reporting System</span></div>
        </a>
        <div class="navbar-right">
          <div class="nav-location" onclick="LocationAPI.detect({btnId:null,statusId:null,onSuccess(l){LocationAPI.updateNavbar(l.display);App.toast('Location updated!','success',2000);}})">
            <div class="loc-dot"></div>
            <span class="nav-loc-text">Detecting location…</span>
          </div>
          <div class="nav-user">
            <span class="nav-user-name">👤 ${userName}</span>
            <span class="role-badge farmer">Farmer</span>
            <button class="btn-logout" onclick="App.logout()">Logout</button>
          </div>
        </div>
      </nav>`;
  }

  function adminNavbar(userName = 'Admin') {
    return `
      <nav class="navbar">
        <a class="navbar-brand" href="dashboard.html">
          <span class="brand-icon">🌾</span>
          <div class="brand-text">CropCare Community <span>Admin Control Panel</span></div>
        </a>
        <div class="navbar-right">
          <div class="nav-user">
            <span class="nav-user-name">🛡️ ${userName}</span>
            <span class="role-badge admin">Admin</span>
            <button class="btn-logout" onclick="App.logout()">Logout</button>
          </div>
        </div>
      </nav>`;
  }

  function inject(type, activePage) {
    const user  = App.getUser();
    const uName = user.currentUser || (type === 'admin' ? 'Admin' : 'Farmer');

    // Inject navbar
    const navEl = document.getElementById('navbar-slot');
    if (navEl) navEl.innerHTML = type === 'admin' ? adminNavbar(uName) : farmerNavbar(uName);

    // Inject sidebar
    const sideEl = document.getElementById('sidebar-slot');
    if (sideEl) sideEl.innerHTML = type === 'admin' ? adminNav(activePage) : farmerNav(activePage);
  }

  return { inject, farmerNavbar, adminNavbar, farmerNav, adminNav };
})();
