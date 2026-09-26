// Main JavaScript Controller for Ruko Agent Landing Page
// Incorporating Owens Liquid Glass Design System, Theme Toggle, Cursor Glow & Spotlight
import { RUKO_TOOLS, RUKO_COMMANDS } from './tools-data.js';
import { RukoSecurityAnalyzer } from './security-analyzer.js';
import { RukiMascot } from './ruki-mascot.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme Engine (Dark / Light with persistence)
  initThemeEngine();

  // 2. Initialize Liquid Background & Particles
  initFloatingParticles();

  // 3. Initialize Interactive Cursor Glow & Spotlight Sheen
  initSpotlightAndCursorGlow();

  // 4. Initialize Terminal Simulator
  let terminalSim = null;
  const termContainer = document.getElementById('terminal-simulator-container');
  if (termContainer && window.RukoTerminalSimulator) {
    terminalSim = new window.RukoTerminalSimulator('terminal-simulator-container');
  }

  // Connect hero quick chip buttons to terminal simulator
  document.querySelectorAll('.term-quick-cmd').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = btn.getAttribute('data-cmd') || btn.innerText.trim();
      if (terminalSim) {
        terminalSim.execute(cmd);
        if (window.innerWidth < 768) {
          termContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  // 5. Initialize Security Analyzer
  new RukoSecurityAnalyzer({
    inputId: 'sec-input',
    resultId: 'sec-result',
    presetSelector: '.sec-preset-btn'
  });

  // 6. Populate Tech Marquee
  initTechMarquee();

  // 7. Render 24 Tools Matrix
  renderToolsGrid('all', '');
  setupToolsFilter();

  // 8. Render Slash Commands Cheat Sheet
  renderCommandsList('');
  setupCommandsSearch();

  // 9. Copy-to-Clipboard Functionality
  setupCopyButtons();

  // 10. Installation Tabs
  setupInstallTabs();

  // 11. Visual Diff Tab Toggle
  setupDiffViewer();

  // 12. FAQ Accordion
  setupFaqAccordion();

  // 13. Mobile Navigation Toggle
  setupMobileNav();

  // 14. Initialize Interactive Mascot "Ruki"
  const rukiSlot = document.getElementById('ruki-mascot-slot');
  if (rukiSlot) {
    new RukiMascot('ruki-mascot-slot', {
      pointTargetSelector: '#cmd-curl'
    });
  }
});

// ============================================================
// 1. Theme Engine (Dark / Light Mode)
// ============================================================
function initThemeEngine() {
  const savedTheme = localStorage.getItem('ruko_theme') || 'dark';
  applyTheme(savedTheme);

  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ruko_theme', theme);

  // Update toggle button icons
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    if (theme === 'dark') {
      btn.innerHTML = `<svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
      btn.setAttribute('title', 'Beralih ke mode terang');
    } else {
      btn.innerHTML = `<svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
      btn.setAttribute('title', 'Beralih ke mode gelap');
    }
  });
}

// ============================================================
// 2. Floating Particles Generator
// ============================================================
function initFloatingParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const count = 12;
  const particles = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.floor(Math.random() * 8) + 4; // 4px - 12px
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const dur = Math.floor(Math.random() * 16) + 12; // 12s - 28s
    const delay = -(Math.random() * 10);
    const dx = Math.floor(Math.random() * 90) - 45;
    const dy = Math.floor(Math.random() * 110) - 55;

    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.top = `${top}%`;
    p.style.left = `${left}%`;
    p.style.setProperty('--dur', `${dur}s`);
    p.style.setProperty('--delay', `${delay}s`);
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);

    container.appendChild(p);
  }
}

// ============================================================
// 3. Spotlight Sheen & Cursor Glow
// ============================================================
function initSpotlightAndCursorGlow() {
  const cursorGlow = document.getElementById('cursor-glow');

  window.addEventListener('mousemove', (e) => {
    // 1. Move Cursor Glow Blob
    if (cursorGlow) {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
      cursorGlow.style.opacity = '1';
    }
  });

  // 2. Spotlight Move on cards
  document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });
}

// ============================================================
// 4. Tech Marquee
// ============================================================
function initTechMarquee() {
  const marqueeTrack = document.getElementById('tech-marquee-track');
  if (!marqueeTrack) return;

  const techItems = [
    'Node.js 18+ (ESM)',
    'TypeScript 5.5',
    'OpenAI GPT-4o',
    'DeepSeek V3 / R1',
    'Ollama (Offline)',
    'Groq Cloud (Ultra-Fast)',
    'Together AI',
    'OpenRouter',
    'LM Studio',
    'vLLM',
    'Termux Android (40 cols)',
    'Linux / macOS / WSL',
    'Zero Runtime Dependencies',
    'Dual-Layer Guardian',
    'LCS Visual Diff',
    'Snapshot Undo Journal'
  ];

  // Repeat twice for seamless infinite marquee loop
  const doubleList = [...techItems, ...techItems];

  marqueeTrack.innerHTML = doubleList.map(item => `
    <span class="flex items-center gap-4 flex-shrink-0">
      <span class="glass-pill px-5 py-2 text-xs font-mono font-medium text-white/90 whitespace-nowrap hover:border-emerald-500/50 transition">
        &gt;_ ${item}
      </span>
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400/40"></span>
    </span>
  `).join('');
}

// ============================================================
// 5. 24 Tools Matrix
// ============================================================
function renderToolsGrid(category = 'all', searchQuery = '') {
  const container = document.getElementById('tools-grid-container');
  if (!container) return;

  const query = (searchQuery || '').toLowerCase().trim();
  const filtered = RUKO_TOOLS.filter(tool => {
    const matchCat = category === 'all' || tool.category === category;
    const matchQuery = !query || 
      tool.name.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query) ||
      tool.categoryLabel.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-muted font-mono text-sm">
        Tidak ditemukan tool yang cocok dengan pencarian "${escapeHtml(searchQuery)}".
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(tool => `
    <div class="glass-card spotlight-card p-6 rounded-2xl flex flex-col justify-between group">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center space-x-2.5">
            <span class="text-xl p-2 rounded-xl glass-button">${tool.icon}</span>
            <span class="font-mono font-bold text-white text-base group-hover:text-emerald-400 transition-colors">${tool.name}</span>
          </div>
          <span class="text-[10px] font-mono px-2.5 py-1 rounded-full glass-pill text-emerald-300 font-semibold">
            ${tool.badge}
          </span>
        </div>
        <p class="text-xs text-muted leading-relaxed mb-4">
          ${tool.description}
        </p>
      </div>
      <div class="pt-3 border-t border-white/10 font-mono text-[11px] text-muted-soft glass-panel px-3 py-2 rounded-xl flex items-center justify-between">
        <code class="text-white/80 truncate">${escapeHtml(tool.usage)}</code>
        <button class="text-white/40 hover:text-emerald-400 copy-snippet-btn transition ml-2 flex-shrink-0" data-copy="${escapeHtml(tool.usage)}" title="Salin Cuplikan">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
      </div>
    </div>
  `).join('');

  // Re-bind dynamic copy buttons inside tools
  container.querySelectorAll('.copy-snippet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      copyToClipboard(text, btn);
    });
  });

  // Re-attach spotlight handler
  container.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });
}

function setupToolsFilter() {
  const catButtons = document.querySelectorAll('.tools-cat-btn');
  const searchInput = document.getElementById('tools-search-input');
  let currentCat = 'all';
  let currentSearch = '';

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => {
        b.classList.remove('bg-glass-highlight', 'text-white', 'shadow-sm');
        b.classList.add('text-white/70');
      });
      btn.classList.add('bg-glass-highlight', 'text-white', 'shadow-sm');
      btn.classList.remove('text-white/70');

      currentCat = btn.getAttribute('data-cat') || 'all';
      renderToolsGrid(currentCat, currentSearch);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderToolsGrid(currentCat, currentSearch);
    });
  }
}

// ============================================================
// 6. Slash Commands Cheat Sheet
// ============================================================
function renderCommandsList(searchQuery = '') {
  const container = document.getElementById('commands-list-container');
  if (!container) return;

  const query = (searchQuery || '').toLowerCase().trim();
  const filtered = RUKO_COMMANDS.filter(c => {
    return !query || 
      c.name.toLowerCase().includes(query) || 
      c.desc.toLowerCase().includes(query) ||
      c.alias.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-muted font-mono text-xs">
        Tidak ada perintah slash yang cocok dengan "${escapeHtml(searchQuery)}".
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="divide-y divide-white/10 font-mono text-xs">
      ${filtered.map(cmd => `
        <div class="py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/5 rounded-xl transition-colors">
          <div class="flex items-center space-x-2">
            <span class="text-cyan-400 font-bold text-sm glass-pill px-2.5 py-0.5">${cmd.name}</span>
            ${cmd.alias ? `<span class="text-amber-400 text-xs">${escapeHtml(cmd.alias)}</span>` : ''}
          </div>
          <div class="text-muted font-sans text-xs sm:text-right max-w-lg">
            ${cmd.desc}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function setupCommandsSearch() {
  const input = document.getElementById('cmd-search-input');
  if (input) {
    input.addEventListener('input', (e) => {
      renderCommandsList(e.target.value);
    });
  }
}

// ============================================================
// 7. Copy Buttons
// ============================================================
function setupCopyButtons() {
  document.querySelectorAll('.copy-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.getAttribute('data-target');
      let text = '';
      if (targetSelector) {
        const targetEl = document.querySelector(targetSelector);
        if (targetEl) text = targetEl.innerText.trim();
      } else {
        text = btn.getAttribute('data-copy') || '';
      }

      if (text) {
        copyToClipboard(text, btn);
      }
    });
  });
}

function copyToClipboard(text, buttonEl) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = buttonEl.innerHTML;
    buttonEl.innerHTML = `
      <span class="flex items-center space-x-1 text-emerald-400 font-mono text-xs">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span>Tersalin!</span>
      </span>
    `;
    setTimeout(() => {
      buttonEl.innerHTML = originalText;
    }, 2000);
  }).catch(() => {
    alert('Gagal menyalin ke clipboard.');
  });
}

// ============================================================
// 8. Installation Tabs
// ============================================================
function setupInstallTabs() {
  const tabs = document.querySelectorAll('.install-tab-btn');
  const panels = document.querySelectorAll('.install-tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      tabs.forEach(t => {
        t.classList.remove('text-emerald-400', 'bg-glass-highlight', 'shadow-sm');
        t.classList.add('text-white/60');
      });
      tab.classList.add('text-emerald-400', 'bg-glass-highlight', 'shadow-sm');
      tab.classList.remove('text-white/60');

      panels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });
}

// ============================================================
// 9. Visual Diff Viewer
// ============================================================
function setupDiffViewer() {
  const diffBtns = document.querySelectorAll('.diff-toggle-btn');
  const diffUnified = document.getElementById('diff-unified-view');
  const diffSplit = document.getElementById('diff-split-view');

  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      diffBtns.forEach(b => {
        b.classList.remove('bg-glass-highlight', 'text-emerald-400');
        b.classList.add('text-white/60');
      });
      btn.classList.add('bg-glass-highlight', 'text-emerald-400');
      btn.classList.remove('text-white/60');

      if (mode === 'unified') {
        if (diffUnified) diffUnified.classList.remove('hidden');
        if (diffSplit) diffSplit.classList.add('hidden');
      } else {
        if (diffUnified) diffUnified.classList.add('hidden');
        if (diffSplit) diffSplit.classList.remove('hidden');
      }
    });
  });
}

// ============================================================
// 10. FAQ Accordion
// ============================================================
function setupFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        
        faqItems.forEach(otherItem => {
          const otherContent = otherItem.querySelector('.faq-content');
          const otherIcon = otherItem.querySelector('.faq-icon');
          if (otherContent && otherContent !== content) {
            otherContent.classList.add('hidden');
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
          }
        });

        if (isOpen) {
          content.classList.add('hidden');
          if (icon) icon.style.transform = 'rotate(0deg)';
        } else {
          content.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  });
}

// ============================================================
// 11. Mobile Navigation
// ============================================================
function setupMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
