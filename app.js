/* =============================================================
   Food Roulette — app.js
   Phase 1: Data layer + Roulette spin with slot-machine animation
   ============================================================= */

'use strict';

const STORAGE_KEY = 'foodRoulette_restos';
const SEED_URL    = 'resto.json';

/* ───────────────────────────────────────────────────────────
   DATA LAYER
   ─────────────────────────────────────────────────────────── */

/** Generate a simple UUID v4 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Load restaurants. If localStorage is empty, seed from resto.json */
async function loadRestos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through to seed */ }
  }

  // Seed from resto.json
  const res   = await fetch(SEED_URL);
  const seed  = await res.json();
  const restos = seed.map(r => ({
    id:      uuid(),
    name:    r.name    || '',
    address: r.address || '',
    tags:    Array.isArray(r.tags) ? r.tags : [],
    ratings: [],
  }));
  saveRestos(restos);
  return restos;
}

/** Persist restaurants list to localStorage */
function saveRestos(restos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(restos));
}

/* ───────────────────────────────────────────────────────────
   ROULETTE LOGIC
   ─────────────────────────────────────────────────────────── */

/** Uniform random pick */
function uniformRandom(restos) {
  return restos[Math.floor(Math.random() * restos.length)];
}

/** Get average rating for a restaurant (default 3 if unrated) */
function getAvgRating(resto) {
  if (!resto.ratings || resto.ratings.length === 0) return 3;
  const sum = resto.ratings.reduce((acc, r) => acc + r.score, 0);
  return sum / resto.ratings.length;
}

/** Weighted random pick — probability proportional to avgRating */
function weightedRandom(restos) {
  const weights = restos.map(r => getAvgRating(r));
  const total   = weights.reduce((a, b) => a + b, 0);
  let rand      = Math.random() * total;
  for (let i = 0; i < restos.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return restos[i];
  }
  return restos[restos.length - 1];
}

/** Main spin entry — picks winner (uniform or weighted) */
function pick(restos, weighted) {
  if (restos.length === 0) return null;
  return weighted ? weightedRandom(restos) : uniformRandom(restos);
}

/* ───────────────────────────────────────────────────────────
   SLOT-MACHINE ANIMATION
   ─────────────────────────────────────────────────────────── */

const SLOT_DURATION_MS = 2200; // total spin time
const SPIN_ITEMS       = 18;   // how many cards to cycle through

/** Build one slot card DOM element */
function buildSlotItem(resto) {
  const item = document.createElement('div');
  item.className = 'slot-item';
  item.innerHTML = `
    <div class="item-name">${escHtml(resto.name)}</div>
    <div class="item-address">${escHtml(resto.address)}</div>
    <div class="item-tags">
      ${resto.tags.slice(0, 3).map(t => `<span class="badge">${escHtml(t)}</span>`).join('')}
    </div>
  `;
  return item;
}

/**
 * Animate the slot reel:
 * - Build SPIN_ITEMS random cards + winner at the end
 * - Use CSS scroll-based approach: move reel up to reveal cards
 * - After landing on winner, update result card
 */
function animateSpin(restos, winner, onDone) {
  const slotWindow = document.getElementById('slot-window');
  const slotReel   = document.getElementById('slot-reel');
  const slotIdle   = document.getElementById('slot-idle');

  // Hide idle state
  slotIdle.style.display = 'none';
  slotReel.style.display = 'flex';
  slotWindow.classList.add('spinning');

  // Clear previous items
  slotReel.innerHTML = '';

  // Build shuffle sequence ending with the winner
  const shuffled = [];
  for (let i = 0; i < SPIN_ITEMS; i++) {
    shuffled.push(restos[Math.floor(Math.random() * restos.length)]);
  }
  shuffled.push(winner); // winner always last

  shuffled.forEach(r => slotReel.appendChild(buildSlotItem(r)));

  // Each card is 200px tall
  const CARD_H    = 200;
  const totalCards = shuffled.length;

  // Start position: reel at top (showing first card)
  slotReel.style.transform  = 'translateY(0)';
  slotReel.style.transition = 'none';

  // Target: move up so winner (last card) is in view
  const finalY = -((totalCards - 1) * CARD_H);

  // Use requestAnimationFrame for smooth JS-driven easing
  const startTime = performance.now();

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / SLOT_DURATION_MS, 1);
    const eased    = easeOutQuart(progress);
    const currentY = finalY * eased;

    slotReel.style.transform = `translateY(${currentY}px)`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Landed on winner
      slotWindow.classList.remove('spinning');
      onDone();
    }
  }

  requestAnimationFrame(step);
}

/* ───────────────────────────────────────────────────────────
   UI — RESULT CARD
   ─────────────────────────────────────────────────────────── */

function showResult(winner) {
  const card    = document.getElementById('result-card');
  const nameEl  = document.getElementById('result-name');
  const addrEl  = document.getElementById('result-address-text');
  const tagsEl  = document.getElementById('result-tags');

  nameEl.textContent = winner.name;
  addrEl.textContent = winner.address;
  tagsEl.innerHTML   = winner.tags
    .map(t => `<span class="badge accent">${escHtml(t)}</span>`)
    .join('');

  card.classList.remove('visible');
  // force reflow for re-animation
  void card.offsetWidth;
  card.classList.add('visible');

  // Update "last winner" stat
  const statLast = document.getElementById('stat-last');
  if (statLast) statLast.textContent = winner.name;
}

/* ───────────────────────────────────────────────────────────
   UI — TOAST
   ─────────────────────────────────────────────────────────── */

function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  const toast     = document.createElement('div');
  toast.className = `toast${type ? ' ' + type : ''}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2800);
}

/* ───────────────────────────────────────────────────────────
   UI — CRUD & MODALS
   ─────────────────────────────────────────────────────────── */

let currentDeleteId = null;

function renderRestoList(restos, filterText = '') {
  const grid = document.getElementById('resto-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  const lowerFilter = filterText.toLowerCase();

  const filtered = restos.filter(r => {
    if (!filterText) return true;
    const matchName = r.name.toLowerCase().includes(lowerFilter);
    const matchTag = r.tags.some(t => t.toLowerCase().includes(lowerFilter));
    return matchName || matchTag;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="placeholder-state"><p>No restaurants found.</p></div>`;
    return;
  }

  filtered.forEach(r => {
    const card = document.createElement('div');
    card.className = 'resto-card';
    card.innerHTML = `
      <h3>${escHtml(r.name)}</h3>
      <div class="card-address">📍 ${escHtml(r.address)}</div>
      <div class="card-tags">
        ${r.tags.map(t => `<span class="badge accent">${escHtml(t)}</span>`).join('')}
      </div>
      <div class="card-actions">
        <button class="btn-edit" data-id="${r.id}">✎ Edit</button>
        <button class="btn-delete" data-id="${r.id}">🗑 Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.showModal();
    // prevent background scrolling
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.close();
    document.body.style.overflow = '';
  }
}

function setupCrud(restos) {
  const searchInput = document.getElementById('search-input');
  const btnAdd = document.getElementById('btn-add-resto');
  const grid = document.getElementById('resto-grid');
  
  const modalResto = document.getElementById('modal-resto');
  const formResto = document.getElementById('form-resto');
  const modalRestoTitle = document.getElementById('modal-resto-title');
  const btnCloseResto = document.getElementById('btn-close-resto');
  const btnCancelResto = document.getElementById('btn-cancel-resto');
  
  const modalDelete = document.getElementById('modal-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const btnCloseDelete = document.getElementById('btn-cancel-delete');
  const deleteRestoName = document.getElementById('delete-resto-name');

  // Initial render
  setTimeout(() => renderRestoList(restos), 0);

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderRestoList(restos, e.target.value);
    });
  }

  // Add Button
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      formResto.reset();
      document.getElementById('input-id').value = '';
      modalRestoTitle.textContent = 'Add Restaurant';
      openModal('modal-resto');
    });
  }

  // Close Modals
  if (btnCloseResto) btnCloseResto.addEventListener('click', () => closeModal('modal-resto'));
  if (btnCancelResto) btnCancelResto.addEventListener('click', () => closeModal('modal-resto'));
  if (btnCloseDelete) btnCloseDelete.addEventListener('click', () => closeModal('modal-delete'));

  // Form Submit (Add/Edit)
  if (formResto) {
    formResto.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('input-id').value;
      const name = document.getElementById('input-name').value.trim();
      const address = document.getElementById('input-address').value.trim();
      const tagsStr = document.getElementById('input-tags').value;
      
      const tags = tagsStr.split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (id) {
        // Edit
        const idx = restos.findIndex(r => r.id === id);
        if (idx !== -1) {
          restos[idx] = { ...restos[idx], name, address, tags };
          showToast(`✅ "${name}" updated!`, 'success');
        }
      } else {
        // Add
        const newResto = { id: uuid(), name, address, tags, ratings: [] };
        // Add to top
        restos.unshift(newResto);
        showToast(`🎉 "${name}" added!`, 'success');
      }

      saveRestos(restos);
      renderRestoList(restos, searchInput ? searchInput.value : '');
      
      // Update count stat
      const statCount = document.getElementById('stat-count');
      if (statCount) statCount.textContent = restos.length;
      
      closeModal('modal-resto');
    });
  }

  // Grid Actions (Edit / Delete)
  if (grid) {
    grid.addEventListener('click', (e) => {
      const btnEdit = e.target.closest('.btn-edit');
      const btnDelete = e.target.closest('.btn-delete');
      
      if (btnEdit) {
        const id = btnEdit.dataset.id;
        const resto = restos.find(r => r.id === id);
        if (resto) {
          document.getElementById('input-id').value = resto.id;
          document.getElementById('input-name').value = resto.name;
          document.getElementById('input-address').value = resto.address;
          document.getElementById('input-tags').value = resto.tags.join(', ');
          
          modalRestoTitle.textContent = 'Edit Restaurant';
          openModal('modal-resto');
        }
      }

      if (btnDelete) {
        const id = btnDelete.dataset.id;
        const resto = restos.find(r => r.id === id);
        if (resto) {
          currentDeleteId = id;
          deleteRestoName.textContent = resto.name;
          openModal('modal-delete');
        }
      }
    });
  }

  // Confirm Delete
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      if (!currentDeleteId) return;
      const idx = restos.findIndex(r => r.id === currentDeleteId);
      if (idx !== -1) {
        const name = restos[idx].name;
        restos.splice(idx, 1);
        saveRestos(restos);
        renderRestoList(restos, searchInput ? searchInput.value : '');
        
        // Update count stat
        const statCount = document.getElementById('stat-count');
        if (statCount) statCount.textContent = restos.length;
        
        showToast(`🗑 "${name}" removed.`, 'success');
      }
      currentDeleteId = null;
      closeModal('modal-delete');
    });
  }
}

/* ───────────────────────────────────────────────────────────
   UI — TABS
   ─────────────────────────────────────────────────────────── */

function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    const activate = () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const sectionId = tab.getAttribute('aria-controls');
      document.getElementById(sectionId).classList.add('active');
    };

    tab.addEventListener('click', activate);
    tab.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

/* ───────────────────────────────────────────────────────────
   UTILITIES
   ─────────────────────────────────────────────────────────── */

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ───────────────────────────────────────────────────────────
   MAIN INIT
   ─────────────────────────────────────────────────────────── */

async function init() {
  initTabs();

  // Load restaurants
  let restos;
  try {
    restos = await loadRestos();
  } catch (err) {
    console.error('Failed to load restaurants:', err);
    showToast('⚠️ Could not load restaurant data.', '');
    return;
  }

  // Update count stat
  const statCount = document.getElementById('stat-count');
  if (statCount) statCount.textContent = restos.length;

  setupCrud(restos);

  // Wire up weighted toggle hint
  const weightedToggle = document.getElementById('weighted-toggle');
  const weightedHint   = document.getElementById('weighted-hint');
  weightedToggle.addEventListener('change', () => {
    weightedHint.classList.toggle('visible', weightedToggle.checked);
  });

  // Wire up spin button
  const btnSpin      = document.getElementById('btn-spin');
  const btnSpinLabel = document.getElementById('btn-spin-label');
  let isSpinning     = false;

  btnSpin.addEventListener('click', () => {
    if (isSpinning || restos.length === 0) return;

    if (restos.length === 1) {
      showResult(restos[0]);
      showToast(`🎉 Only one option — it's ${restos[0].name}!`, 'success');
      return;
    }

    const weighted = weightedToggle.checked;
    const winner   = pick(restos, weighted);
    if (!winner) return;

    isSpinning        = true;
    btnSpin.disabled  = true;
    btnSpinLabel.textContent = 'Spinning…';

    // Hide previous result during spin
    document.getElementById('result-card').classList.remove('visible');

    animateSpin(restos, winner, () => {
      showResult(winner);
      isSpinning            = false;
      btnSpin.disabled      = false;
      btnSpinLabel.textContent = 'Spin again!';
      showToast(`🎉 ${winner.name} it is!`, 'success');
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
