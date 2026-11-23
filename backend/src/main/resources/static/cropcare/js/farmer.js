/* ============================================================
   farmer.js — Farmer Page Interactions
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const page = document.body.dataset.page;

  /* ════════════════════════════
     REPORT DISEASE PAGE
  ════════════════════════════ */
  if (page === 'report') {

    // GPS detect button
    const locBtn = document.getElementById('loc-detect-btn');
    if (locBtn) {
      locBtn.addEventListener('click', () => {
        LocationAPI.detect({
          btnId:    'loc-detect-btn',
          statusId: 'loc-status',
          onSuccess(loc) {
            LocationAPI.fillFields(loc, {
              village:  'report-village',
              district: 'report-district',
              state:    'report-state',
            });
            LocationAPI.showCoords(loc, 'loc-coords');
            LocationAPI.showMap(loc, 'map-preview', 'map-frame', 'map-label');
            App.toast('Location detected successfully!', 'success');
          },
          onError() {
            App.toast('Could not detect location. Enter manually.', 'warning');
          }
        });
      });
    }

    // Auto-fill if location already saved
    const saved = LocationAPI.getSaved();
    if (saved) {
      LocationAPI.fillFields(saved, {
        village:  'report-village',
        district: 'report-district',
        state:    'report-state',
      });
    }

    // File upload
    const fileInput = document.getElementById('disease-image');
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        App.handleFileUpload(fileInput, 'file-preview');
      });
    }
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
      uploadArea.addEventListener('click', () => fileInput && fileInput.click());
      uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--green-bright)'; });
      uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
      uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        if (e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          App.handleFileUpload(fileInput, 'file-preview');
        }
      });
    }

    // Submit report
    const form = document.getElementById('report-form');
    const submitBtn = document.getElementById('submit-report-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const crop = App.val('crop-type');
        const symptoms = App.val('symptoms');
        if (!crop) { App.toast('Please select a crop type.', 'warning'); return; }
        if (!symptoms) { App.toast('Please describe the symptoms.', 'warning'); return; }

        App.setLoading('submit-report-btn', true, 'Submitting...');
        setTimeout(() => {
          App.setLoading('submit-report-btn', false);
          if (form) form.style.display = 'none';
          const success = document.getElementById('report-success');
          if (success) { success.style.display = 'block'; success.scrollIntoView({ behavior: 'smooth' }); }
        }, 1400);
      });
    }

    // Reset form
    const resetBtn = document.getElementById('reset-report-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (form) form.style.display = 'block';
        const success = document.getElementById('report-success');
        if (success) success.style.display = 'none';
        form && form.querySelectorAll('input,select,textarea').forEach(el => { if (el.type !== 'submit') el.value = ''; });
        App.hideEl('map-preview');
        App.hideEl('loc-coords');
        document.getElementById('loc-status') && (document.getElementById('loc-status').innerHTML = '');
        document.getElementById('file-preview') && (document.getElementById('file-preview').innerHTML = '');
      });
    }
  }

  /* ════════════════════════════
     COMMUNITY SOLUTIONS PAGE
  ════════════════════════════ */
  if (page === 'solutions') {

    // Vote buttons
    document.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', () => App.toggleVote(btn));
    });

    // Filter chips
    App.initFilterChips('.history-filters', filterSolutions);

    function filterSolutions(val) {
      document.querySelectorAll('.solution-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = (!val || val === 'All' || text.includes(val.toLowerCase())) ? '' : 'none';
      });
    }
  }

  /* ════════════════════════════
     SUBMIT SOLUTION PAGE
  ════════════════════════════ */
  if (page === 'submit-solution') {
    const submitBtn = document.getElementById('submit-solution-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const method = App.val('treatment-method');
        if (!method) { App.toast('Please describe the treatment method.', 'warning'); return; }

        App.setLoading('submit-solution-btn', true, 'Submitting...');
        setTimeout(() => {
          App.setLoading('submit-solution-btn', false);
          const form = document.getElementById('solution-form');
          const success = document.getElementById('solution-success');
          if (form) form.style.display = 'none';
          if (success) { success.style.display = 'block'; success.scrollIntoView({ behavior: 'smooth' }); }
        }, 1200);
      });
    }

    const resetBtn = document.getElementById('reset-solution-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const form = document.getElementById('solution-form');
        const success = document.getElementById('solution-success');
        if (form) { form.style.display = 'block'; form.querySelectorAll('textarea,select').forEach(el => el.value = ''); }
        if (success) success.style.display = 'none';
      });
    }
  }

  /* ════════════════════════════
     OUTBREAK HISTORY PAGE
  ════════════════════════════ */
  if (page === 'history') {
    App.initFilterChips('.history-filters', (val) => {
      const tbody = document.getElementById('history-tbody');
      if (!tbody) return;
      tbody.querySelectorAll('tr').forEach(row => {
        row.style.display = (!val || val === 'All Years' || row.textContent.includes(val)) ? '' : 'none';
      });
    });
  }

  /* ════════════════════════════
     MY REPORTS PAGE
  ════════════════════════════ */
  if (page === 'my-reports') {
    App.initTableSearch('reports-search', 'my-reports-tbody', [0, 1, 3]);
  }

  /* ════════════════════════════
     DASHBOARD PAGE
  ════════════════════════════ */
  if (page === 'farmer-dashboard') {
    // Animate stat counters
    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      let current = 0;
      const step = Math.ceil(target / 25);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
      }, 40);
    });
  }

});
