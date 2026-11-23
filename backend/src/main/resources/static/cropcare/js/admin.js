/* ============================================================
   admin.js — Admin Panel Interactions
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const page = document.body.dataset.page;

  /* ════════════════════════════
     PENDING REPORTS
  ════════════════════════════ */
  if (page === 'admin-pending') {

    // Verify report
    document.querySelectorAll('.btn-verify').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        if (!row) return;
        const statusCell = row.querySelector('.status-cell');
        if (statusCell) statusCell.innerHTML = '<span class="badge badge-verified">Verified ✓</span>';
        row.querySelectorAll('button').forEach(b => b.disabled = true);
        row.style.opacity = '0.75';

        App.toast('Report verified! Alert sent to all farmers in the region.', 'success', 4000);

        // Update pending count badge
        const remaining = document.querySelectorAll('.btn-verify:not([disabled])').length;
        const countEl = document.getElementById('pending-count');
        if (countEl) countEl.textContent = remaining;
      });
    });

    // Reject report
    document.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        if (row && confirm('Reject and remove this report?')) {
          row.style.transition = 'opacity 0.3s';
          row.style.opacity = '0';
          setTimeout(() => row.remove(), 320);
          App.toast('Report rejected and removed.', 'warning');
        }
      });
    });

    // View report modal
    document.querySelectorAll('.btn-view-report').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const cells = row ? row.querySelectorAll('td') : [];
        if (cells.length < 5) return;
        showReportModal({
          farmer:   cells[0].textContent.trim(),
          crop:     cells[1].textContent.trim(),
          symptoms: cells[2].textContent.trim(),
          village:  cells[3].textContent.trim(),
          date:     cells[4].textContent.trim(),
        });
      });
    });
  }

  /* ════════════════════════════
     MANAGE FARMERS
  ════════════════════════════ */
  if (page === 'admin-farmers') {

    // Search
    App.initTableSearch('farmers-search', 'farmers-tbody', [0, 1, 2]);

    // Remove farmer
    document.querySelectorAll('.btn-remove-farmer').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.farmer-list-item');
        const name = row ? row.querySelector('.f-name')?.textContent : 'Farmer';
        if (row && confirm(`Remove ${name} from the system?`)) {
          row.style.transition = 'all 0.3s';
          row.style.opacity = '0'; row.style.transform = 'translateX(20px)';
          setTimeout(() => row.remove(), 320);
          App.toast(`${name} has been removed.`, 'info');
        }
      });
    });
  }

  /* ════════════════════════════
     ANALYTICS PAGE
  ════════════════════════════ */
  if (page === 'admin-analytics') {
    animateProgressBars();
    animateCounters();
  }

  /* ════════════════════════════
     ADMIN DASHBOARD
  ════════════════════════════ */
  if (page === 'admin-dashboard') {
    animateCounters();
  }

  /* ── Helpers ── */
  function animateProgressBars() {
    document.querySelectorAll('.prog-bar-fill[data-width]').forEach(bar => {
      const target = bar.dataset.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = target; }, 300);
    });
  }

  function animateCounters() {
    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 30));
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = el.dataset.suffix ? current + el.dataset.suffix : current;
        if (current >= target) clearInterval(timer);
      }, 40);
    });
  }

  function showReportModal(data) {
    // Remove existing modal
    document.getElementById('report-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'report-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9000;display:flex;align-items:center;justify-content:center;padding:24px;';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:32px;max-width:480px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,0.3);animation:scaleIn 0.3s cubic-bezier(0.16,1,0.3,1);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="font-family:'Playfair Display',serif;font-size:1.3rem;color:#0f2d1e;">📋 Report Details</h2>
          <button onclick="document.getElementById('report-modal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#6c757d;">×</button>
        </div>
        ${renderRow('Farmer', data.farmer)}
        ${renderRow('Crop', data.crop)}
        ${renderRow('Symptoms', data.symptoms)}
        ${renderRow('Village', data.village)}
        ${renderRow('Date', data.date)}
        <p style="font-size:0.78rem;color:#adb5bd;margin-top:16px;">* In production this would show photo, GPS map, and full form data.</p>
      </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  }

  function renderRow(label, val) {
    return `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #e9ecef;">
      <span style="font-size:0.75rem;font-weight:800;color:#6c757d;text-transform:uppercase;letter-spacing:0.5px;width:90px;flex-shrink:0;padding-top:2px;">${label}</span>
      <span style="font-size:0.90rem;color:#343a40;">${val}</span>
    </div>`;
  }

});
