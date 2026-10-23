/**
 * shortcuts.js — Premium Keyboard Shortcuts, Command Palette & Interactive Navigation
 * Portfolio: Venkata Sudheer Kalahasthi
 * 
 * Features:
 * - Direct letter shortcuts (H, P, S, C, I, G, L, W, LC, R, E, ?, Ctrl/Cmd+K)
 * - Two-key sequence handler for LC (LeetCode) vs L (LinkedIn) with 800ms timeout
 * - Searchable Command Palette with live filter & keyboard navigation (Arrow Up/Down, Enter, Esc)
 * - Keyboard Shortcuts Help Modal with categorized keycap badges
 * - Safe form input isolation (never intercepts typing in contact inputs/textareas)
 * - Mobile discovery hint & touch trigger
 * - Full Dark/Light theme integration
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONFIGURATION & PROFILE DESTINATIONS
  // --------------------------------------------------------------------------
  const CONFIG = {
    urls: {
      instagram: 'https://www.instagram.com/venkatasudheer.kalahasthi?exln=MWt4YjA4ZjFzdWg0NQ==',
      github: 'https://github.com/VenkataSudheerKalahasthi',
      linkedin: 'https://www.linkedin.com/in/kalahasthi-venkata-sudheer-39a022322?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      whatsapp: 'https://wa.me/919848148009',
      leetcode: 'https://leetcode.com/u/venkata_sudheer_kalahasthi/',
      resume: './assets/Sudheer_NasdaqResume.pdf',
      email: 'venkatasudheerkalahasthi@gmail.com'
    },
    sequenceTimeoutMs: 800
  };

  // Detect platform for Mac (⌘) vs Windows/Linux (Ctrl)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKeySymbol = isMac ? '⌘' : 'Ctrl';
  const modKeyName = isMac ? 'Cmd' : 'Ctrl';

  // --------------------------------------------------------------------------
  // 2. STATE MANAGEMENT
  // --------------------------------------------------------------------------
  let pendingLTimeout = null;
  let previousActiveElement = null;
  let selectedCommandIndex = 0;
  let filteredCommands = [];

  // --------------------------------------------------------------------------
  // 3. SAFE ACTIONS & NAVIGATION HELPERS
  // --------------------------------------------------------------------------
  function openExternalUrl(url) {
    if (!url) return;
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) win.focus();
  }

  function navigateToSection(target) {
    // Reuse existing portfolio navbar logic
    const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
    if (!navLinks.length) return;

    let targetLink = null;
    const normalized = target.toLowerCase();

    if (normalized === 'home' || normalized === 'about') {
      targetLink = navLinks.find((l) => l.textContent.trim().toLowerCase() === 'about');
    } else if (normalized === 'projects' || normalized === 'portfolio') {
      targetLink = navLinks.find((l) => l.textContent.trim().toLowerCase() === 'projects');
    } else if (normalized === 'resume') {
      targetLink = navLinks.find((l) => l.textContent.trim().toLowerCase() === 'resume');
    } else if (normalized === 'skills') {
      targetLink = navLinks.find((l) => l.textContent.trim().toLowerCase() === 'resume');
    } else if (normalized === 'contact') {
      targetLink = navLinks.find((l) => l.textContent.trim().toLowerCase() === 'contact');
    }

    if (targetLink) {
      targetLink.click();

      // If targeting skills, scroll smoothly to the skills section inside Resume
      if (normalized === 'skills') {
        setTimeout(() => {
          const skillsSection = document.querySelector('.skills-title') || document.querySelector('.skill');
          if (skillsSection) {
            skillsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. COMMAND PALETTE DEFINITIONS
  // --------------------------------------------------------------------------
  const COMMANDS = [
    // Navigation
    {
      id: 'nav-home',
      category: 'Navigation',
      title: 'Home',
      description: 'Navigate to the Home / About section',
      shortcut: ['H'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      action: () => navigateToSection('about')
    },
    {
      id: 'nav-projects',
      category: 'Navigation',
      title: 'Projects',
      description: 'View portfolio projects and web applications',
      shortcut: ['P'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
      action: () => navigateToSection('projects')
    },
    {
      id: 'nav-skills',
      category: 'Navigation',
      title: 'Skills',
      description: 'Jump to technical skills & programming proficiencies',
      shortcut: ['S'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      action: () => navigateToSection('skills')
    },
    {
      id: 'nav-contact',
      category: 'Navigation',
      title: 'Contact',
      description: 'Reach out via the contact form or send a message',
      shortcut: ['C'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
      action: () => navigateToSection('contact')
    },

    // Social Media
    {
      id: 'social-instagram',
      category: 'Social',
      title: 'Instagram',
      description: 'Open Instagram profile in a new tab',
      shortcut: ['I'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
      action: () => openExternalUrl(CONFIG.urls.instagram)
    },
    {
      id: 'social-github',
      category: 'Social',
      title: 'GitHub',
      description: 'Open GitHub profile & open-source repositories',
      shortcut: ['G'],
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>',
      action: () => openExternalUrl(CONFIG.urls.github)
    },
    {
      id: 'social-linkedin',
      category: 'Social',
      title: 'LinkedIn',
      description: 'Open LinkedIn profile & professional network',
      shortcut: ['L'],
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
      action: () => openExternalUrl(CONFIG.urls.linkedin)
    },
    {
      id: 'social-whatsapp',
      category: 'Social',
      title: 'WhatsApp',
      description: 'Open direct WhatsApp chat with Sudheer',
      shortcut: ['W'],
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
      action: () => openExternalUrl(CONFIG.urls.whatsapp)
    },

    // Developer Profiles
    {
      id: 'dev-leetcode',
      category: 'Developer Profiles',
      title: 'LeetCode',
      description: 'Open LeetCode profile (Two-key sequence: L then C)',
      shortcut: ['L', '→', 'C'],
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z" /><path fill="#FFA116" d="M10.617 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" /></svg>',
      action: () => openExternalUrl(CONFIG.urls.leetcode)
    },

    // Resources
    {
      id: 'res-resume',
      category: 'Resources',
      title: 'Resume (PDF)',
      description: 'Open Sudheer\'s resume in a new tab',
      shortcut: ['R'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
      action: () => openExternalUrl(CONFIG.urls.resume)
    },
    {
      id: 'res-email',
      category: 'Resources',
      title: 'Send Email',
      description: 'Open default email app to email Sudheer',
      shortcut: ['E'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
      action: () => { window.location.href = `mailto:${CONFIG.urls.email}`; }
    },

    // Interface
    {
      id: 'ui-help',
      category: 'Interface',
      title: 'Keyboard Shortcuts',
      description: 'View full cheat sheet of keyboard shortcuts',
      shortcut: ['?'],
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      action: () => openHelpModal()
    }
  ];

  // --------------------------------------------------------------------------
  // 5. DOM CREATION & UI INITIALIZATION
  // --------------------------------------------------------------------------
  let paletteEl, paletteInput, paletteList, paletteClearBtn;
  let helpModalEl;

  function renderKeyBadges(keys) {
    return keys.map((k) => {
      if (k === '→' || k === 'then') {
        return `<span class="kbd-separator">then</span>`;
      }
      return `<kbd class="kbd-key">${k}</kbd>`;
    }).join('');
  }

  function injectModals() {
    // 1. Command Palette DOM
    const paletteBackdrop = document.createElement('div');
    paletteBackdrop.id = 'cmd-palette-backdrop';
    paletteBackdrop.className = 'cmd-palette-backdrop';
    paletteBackdrop.setAttribute('role', 'dialog');
    paletteBackdrop.setAttribute('aria-modal', 'true');
    paletteBackdrop.setAttribute('aria-label', 'Command Palette');

    paletteBackdrop.innerHTML = `
      <div class="cmd-palette-modal" onclick="event.stopPropagation()">
        <div class="cmd-palette-header">
          <div class="cmd-palette-search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            id="cmd-palette-input"
            class="cmd-palette-input"
            type="text"
            placeholder="Type a command or search..."
            autocomplete="off"
            spellcheck="false"
          />
          <button id="cmd-palette-clear-btn" class="cmd-palette-clear-btn" type="button" aria-label="Clear search">×</button>
          <div class="cmd-palette-esc-badge">
            <kbd class="kbd-key">ESC</kbd>
          </div>
        </div>

        <div id="cmd-palette-body" class="cmd-palette-body" role="listbox">
          <!-- Dynamically populated rows -->
        </div>

        <div class="cmd-palette-footer">
          <div class="cmd-palette-footer-hints">
            <span class="cmd-palette-footer-hint hide-mobile">
              <kbd class="kbd-key">↑</kbd><kbd class="kbd-key">↓</kbd> Navigate
            </span>
            <span class="cmd-palette-footer-hint hide-mobile">
              <kbd class="kbd-key">↵</kbd> Select
            </span>
            <span class="cmd-palette-footer-hint">
              <kbd class="kbd-key">ESC</kbd> Close
            </span>
          </div>
          <div class="cmd-palette-footer-credit">
            Portfolio Navigation
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(paletteBackdrop);

    paletteEl = paletteBackdrop;
    paletteInput = paletteBackdrop.querySelector('#cmd-palette-input');
    paletteList = paletteBackdrop.querySelector('#cmd-palette-body');
    paletteClearBtn = paletteBackdrop.querySelector('#cmd-palette-clear-btn');

    // Close palette on backdrop click
    paletteBackdrop.addEventListener('click', closeCommandPalette);

    // Search input events
    paletteInput.addEventListener('input', (e) => {
      const q = e.target.value;
      if (q.trim()) {
        paletteClearBtn.classList.add('has-value');
      } else {
        paletteClearBtn.classList.remove('has-value');
      }
      filterCommands(q);
    });

    paletteClearBtn.addEventListener('click', () => {
      paletteInput.value = '';
      paletteClearBtn.classList.remove('has-value');
      filterCommands('');
      paletteInput.focus();
    });

    // Keydown inside input for arrow navigation & Enter
    paletteInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveSelection(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveSelection(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSelectedCommand();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
      }
    });

    // 2. Keyboard Shortcuts Help Modal DOM
    const helpBackdrop = document.createElement('div');
    helpBackdrop.id = 'shortcuts-modal-backdrop';
    helpBackdrop.className = 'shortcuts-modal-backdrop';
    helpBackdrop.setAttribute('role', 'dialog');
    helpBackdrop.setAttribute('aria-modal', 'true');
    helpBackdrop.setAttribute('aria-label', 'Keyboard Shortcuts Guide');

    helpBackdrop.innerHTML = `
      <div class="shortcuts-modal" onclick="event.stopPropagation()">
        <div class="shortcuts-modal-header">
          <div class="shortcuts-modal-header-left">
            <div class="shortcuts-modal-header-icon">⌨️</div>
            <h2 class="shortcuts-modal-title">Keyboard Shortcuts</h2>
          </div>
          <button id="shortcuts-modal-close-btn" class="shortcuts-modal-close-btn" type="button" aria-label="Close shortcuts modal">×</button>
        </div>

        <div class="shortcuts-modal-body">
          <!-- Navigation -->
          <div class="shortcuts-section">
            <div class="shortcuts-section-title">Navigation</div>
            <div class="shortcuts-section-grid">
              <div class="shortcut-row">
                <span class="shortcut-name">Home / About</span>
                <span class="shortcut-badges"><kbd class="kbd-key">H</kbd></span>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-name">Projects</span>
                <span class="shortcut-badges"><kbd class="kbd-key">P</kbd></span>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-name">Skills</span>
                <span class="shortcut-badges"><kbd class="kbd-key">S</kbd></span>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-name">Contact</span>
                <span class="shortcut-badges"><kbd class="kbd-key">C</kbd></span>
              </div>
            </div>
          </div>

          <!-- Social Profiles -->
          <div class="shortcuts-section">
            <div class="shortcuts-section-title">Social Media</div>
            <div class="shortcuts-section-grid">
              <div class="shortcut-row">
                <span class="shortcut-name">Instagram</span>
                <span class="shortcut-badges"><kbd class="kbd-key">I</kbd></span>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-name">GitHub</span>
                <span class="shortcut-badges"><kbd class="kbd-key">G</kbd></span>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-name">LinkedIn</span>
                <span class="shortcut-badges"><kbd class="kbd-key">L</kbd></span>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-name">WhatsApp</span>
                <span class="shortcut-badges"><kbd class="kbd-key">W</kbd></span>
              </div>
            </div>
          </div>

          <!-- Developer Profiles -->
          <div class="shortcuts-section">
            <div class="shortcuts-section-title">Developer Platform</div>
            <div class="shortcuts-section-grid">
              <div class="shortcut-row" style="grid-column: 1 / -1;">
                <div>
                  <span class="shortcut-name">LeetCode</span>
                  <div class="shortcut-sequence-note">Two-key sequence: press <strong>L</strong>, then press <strong>C</strong> within 800ms</div>
                </div>
                <span class="shortcut-badges">
                  <kbd class="kbd-key">L</kbd>
                  <span class="kbd-separator">then</span>
                  <kbd class="kbd-key">C</kbd>
                </span>
              </div>
            </div>
          </div>

          <!-- Resources -->
          <div class="shortcuts-section">
            <div class="shortcuts-section-title">Resources</div>
            <div class="shortcuts-section-grid">
              <div class="shortcut-row">
                <span class="shortcut-name">Resume (PDF)</span>
                <span class="shortcut-badges"><kbd class="kbd-key">R</kbd></span>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-name">Email Application</span>
                <span class="shortcut-badges"><kbd class="kbd-key">E</kbd></span>
              </div>
            </div>
          </div>

          <!-- Interface -->
          <div class="shortcuts-section">
            <div class="shortcuts-section-title">Interface</div>
            <div class="shortcuts-section-grid">
              <div class="shortcut-row">
                <span class="shortcut-name">Command Palette</span>
                <span class="shortcut-badges">
                  <kbd class="kbd-key">${modKeySymbol}</kbd>
                  <span class="kbd-separator">+</span>
                  <kbd class="kbd-key">K</kbd>
                </span>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-name">Help Modal</span>
                <span class="shortcut-badges"><kbd class="kbd-key">?</kbd></span>
              </div>
              <div class="shortcut-row" style="grid-column: 1 / -1;">
                <span class="shortcut-name">Close Active Modal / Palette</span>
                <span class="shortcut-badges"><kbd class="kbd-key">ESC</kbd></span>
              </div>
            </div>
          </div>
        </div>

        <div class="shortcuts-modal-footer">
          <span>Shortcuts are active across the portfolio</span>
          <span>Press <kbd class="kbd-key">ESC</kbd> to close</span>
        </div>
      </div>
    `;
    document.body.appendChild(helpBackdrop);
    helpModalEl = helpBackdrop;

    helpBackdrop.addEventListener('click', closeHelpModal);
    helpBackdrop.querySelector('#shortcuts-modal-close-btn').addEventListener('click', closeHelpModal);

    // 3. Floating Discovery Hint & Mobile FAB Trigger
    const floatingTrigger = document.createElement('button');
    floatingTrigger.className = 'shortcuts-floating-trigger';
    floatingTrigger.type = 'button';
    floatingTrigger.setAttribute('aria-label', 'Open Command Palette and Shortcuts');
    floatingTrigger.innerHTML = `
      <div class="shortcuts-trigger-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <div class="shortcuts-trigger-text">
        <span class="desktop-only">Commands</span>
        <span class="shortcuts-trigger-keys">
          <kbd class="kbd-key">${modKeySymbol}</kbd><kbd class="kbd-key">K</kbd>
        </span>
      </div>
    `;
    document.body.appendChild(floatingTrigger);

    floatingTrigger.addEventListener('click', () => {
      toggleCommandPalette();
    });
  }

  // --------------------------------------------------------------------------
  // 6. COMMAND PALETTE RENDERING & FILTERING
  // --------------------------------------------------------------------------
  function filterCommands(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      filteredCommands = [...COMMANDS];
    } else {
      filteredCommands = COMMANDS.filter((cmd) => {
        const titleMatch = cmd.title.toLowerCase().includes(q);
        const descMatch = cmd.description.toLowerCase().includes(q);
        const catMatch = cmd.category.toLowerCase().includes(q);
        const shortcutMatch = cmd.shortcut.some((k) => k.toLowerCase().includes(q));
        return titleMatch || descMatch || catMatch || shortcutMatch;
      });
    }

    selectedCommandIndex = 0;
    renderCommandList();
  }

  function renderCommandList() {
    if (!paletteList) return;

    if (!filteredCommands.length) {
      paletteList.innerHTML = `
        <div class="cmd-palette-empty">
          <div class="cmd-palette-empty-icon">🔍</div>
          <div class="cmd-palette-empty-text">No matching commands found</div>
        </div>
      `;
      return;
    }

    // Group commands by category
    const grouped = {};
    filteredCommands.forEach((cmd, idx) => {
      if (!grouped[cmd.category]) grouped[cmd.category] = [];
      grouped[cmd.category].push({ cmd, flatIndex: idx });
    });

    let html = '';
    Object.keys(grouped).forEach((cat) => {
      html += `<div class="cmd-palette-group-title">${cat}</div>`;
      grouped[cat].forEach(({ cmd, flatIndex }) => {
        const isSelected = flatIndex === selectedCommandIndex;
        html += `
          <div
            class="cmd-palette-item ${isSelected ? 'is-selected' : ''}"
            data-index="${flatIndex}"
            role="option"
            aria-selected="${isSelected}"
          >
            <div class="cmd-palette-item-left">
              <div class="cmd-palette-item-icon">${cmd.icon}</div>
              <div class="cmd-palette-item-info">
                <div class="cmd-palette-item-title">${cmd.title}</div>
                <div class="cmd-palette-item-desc">${cmd.description}</div>
              </div>
            </div>
            <div class="cmd-palette-item-keys">
              ${renderKeyBadges(cmd.shortcut)}
            </div>
          </div>
        `;
      });
    });

    paletteList.innerHTML = html;

    // Attach click handlers to items
    paletteList.querySelectorAll('.cmd-palette-item').forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          selectedCommandIndex = idx;
          updateSelectedHighlight();
        }
      });

      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        if (!isNaN(idx) && filteredCommands[idx]) {
          executeCommand(filteredCommands[idx]);
        }
      });
    });

    scrollSelectedIntoView();
  }

  function updateSelectedHighlight() {
    if (!paletteList) return;
    const items = paletteList.querySelectorAll('.cmd-palette-item');
    items.forEach((item) => {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      const isSel = idx === selectedCommandIndex;
      item.classList.toggle('is-selected', isSel);
      item.setAttribute('aria-selected', isSel);
    });
    scrollSelectedIntoView();
  }

  function scrollSelectedIntoView() {
    if (!paletteList) return;
    const selectedItem = paletteList.querySelector(`.cmd-palette-item[data-index="${selectedCommandIndex}"]`);
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }

  function moveSelection(direction) {
    if (!filteredCommands.length) return;
    selectedCommandIndex = (selectedCommandIndex + direction + filteredCommands.length) % filteredCommands.length;
    updateSelectedHighlight();
  }

  function executeSelectedCommand() {
    if (filteredCommands.length && filteredCommands[selectedCommandIndex]) {
      executeCommand(filteredCommands[selectedCommandIndex]);
    }
  }

  function executeCommand(cmd) {
    closeCommandPalette();
    if (cmd && typeof cmd.action === 'function') {
      setTimeout(() => {
        cmd.action();
      }, 50);
    }
  }

  // --------------------------------------------------------------------------
  // 7. MODAL OPEN/CLOSE ORCHESTRATION
  // --------------------------------------------------------------------------
  function openCommandPalette() {
    if (isHelpModalOpen()) {
      closeHelpModal(false);
    }
    cancelPendingSequence();

    previousActiveElement = document.activeElement;
    paletteEl.classList.add('is-open');
    paletteInput.value = '';
    paletteClearBtn.classList.remove('has-value');
    filterCommands('');

    setTimeout(() => {
      paletteInput.focus();
    }, 50);
  }

  function closeCommandPalette(restoreFocus = true) {
    if (!paletteEl) return;
    paletteEl.classList.remove('is-open');
    cancelPendingSequence();

    if (restoreFocus && previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  }

  function toggleCommandPalette() {
    if (isPaletteOpen()) {
      closeCommandPalette();
    } else {
      openCommandPalette();
    }
  }

  function openHelpModal() {
    if (isPaletteOpen()) {
      closeCommandPalette(false);
    }
    cancelPendingSequence();

    previousActiveElement = document.activeElement;
    helpModalEl.classList.add('is-open');

    setTimeout(() => {
      const closeBtn = helpModalEl.querySelector('#shortcuts-modal-close-btn');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function closeHelpModal(restoreFocus = true) {
    if (!helpModalEl) return;
    helpModalEl.classList.remove('is-open');
    cancelPendingSequence();

    if (restoreFocus && previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  }

  function isPaletteOpen() {
    return paletteEl && paletteEl.classList.contains('is-open');
  }

  function isHelpModalOpen() {
    return helpModalEl && helpModalEl.classList.contains('is-open');
  }

  function closeAnyOpenModal() {
    let closed = false;
    if (isPaletteOpen()) {
      closeCommandPalette();
      closed = true;
    }
    if (isHelpModalOpen()) {
      closeHelpModal();
      closed = true;
    }
    return closed;
  }

  function cancelPendingSequence() {
    if (pendingLTimeout !== null) {
      clearTimeout(pendingLTimeout);
      pendingLTimeout = null;
    }
  }

  // --------------------------------------------------------------------------
  // 8. FORM SAFETY & KEYBOARD EVENT HANDLER
  // --------------------------------------------------------------------------
  function isTypingInFormField(e) {
    const target = e.target;
    if (!target) return false;
    const tagName = target.tagName;
    if (
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT' ||
      target.isContentEditable ||
      (target.classList && target.classList.contains('form-input')) ||
      target.closest('form')
    ) {
      return true;
    }
    return false;
  }

  function handleGlobalKeyDown(e) {
    // 1. Check for Command Palette Toggle (Ctrl+K or Cmd+K)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      toggleCommandPalette();
      return;
    }

    // 2. Escape closes active modal/palette
    if (e.key === 'Escape') {
      cancelPendingSequence();
      closeAnyOpenModal();
      return;
    }

    // 3. If visitor is typing in a form or input, DO NOT trigger shortcuts!
    if (isTypingInFormField(e)) {
      cancelPendingSequence();
      return;
    }

    // 4. If intro animation is still active on screen, do not trigger shortcuts
    if (document.body.classList.contains('intro-active')) {
      return;
    }

    // 5. If Palette or Help modal is open, let modal handle its own keys (arrows, esc, typing)
    if (isPaletteOpen() || isHelpModalOpen()) {
      return;
    }

    // 6. Ignore repeated keydown events when key is held down
    if (e.repeat) {
      return;
    }

    // 7. Ignore keys if other modifier keys like Alt/Ctrl/Cmd are pressed (except Shift for '?')
    if (e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }

    // Normalize shortcut input to lowercase
    const key = (e.key || '').toLowerCase();

    // ------------------------------------------------------------------------
    // LC TWO-KEY SEQUENCE HANDLER (LeetCode vs LinkedIn)
    // ------------------------------------------------------------------------
    if (pendingLTimeout !== null) {
      // Clear timeout regardless of what key was pressed
      clearTimeout(pendingLTimeout);
      pendingLTimeout = null;

      if (key === 'c') {
        // User pressed 'L' followed by 'C' within 800ms -> Open LeetCode!
        e.preventDefault();
        openExternalUrl(CONFIG.urls.leetcode);
        return;
      } else {
        // Another key was pressed: LinkedIn is canceled, and we proceed to handle the new key!
      }
    }

    // Visitor pressed 'L' (or 'l')
    if (key === 'l') {
      e.preventDefault();
      // Start 800ms window waiting for 'C'
      pendingLTimeout = setTimeout(() => {
        pendingLTimeout = null;
        // Timeout expired without 'C' -> Open LinkedIn!
        openExternalUrl(CONFIG.urls.linkedin);
      }, CONFIG.sequenceTimeoutMs);
      return;
    }

    // ------------------------------------------------------------------------
    // SINGLE-LETTER SHORTCUTS
    // ------------------------------------------------------------------------
    // Help modal: '?' (or Shift + '/')
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      openHelpModal();
      return;
    }

    switch (key) {
      // Navigation
      case 'h':
        e.preventDefault();
        navigateToSection('about');
        break;
      case 'p':
        e.preventDefault();
        navigateToSection('projects');
        break;
      case 's':
        e.preventDefault();
        navigateToSection('skills');
        break;
      case 'c':
        e.preventDefault();
        navigateToSection('contact');
        break;

      // Social Media
      case 'i':
        e.preventDefault();
        openExternalUrl(CONFIG.urls.instagram);
        break;
      case 'g':
        e.preventDefault();
        openExternalUrl(CONFIG.urls.github);
        break;
      case 'w':
        e.preventDefault();
        openExternalUrl(CONFIG.urls.whatsapp);
        break;

      // Resources
      case 'r':
        e.preventDefault();
        openExternalUrl(CONFIG.urls.resume);
        break;
      case 'e':
        e.preventDefault();
        window.location.href = `mailto:${CONFIG.urls.email}`;
        break;

      default:
        break;
    }
  }

  // --------------------------------------------------------------------------
  // 9. CLEANUP & INITIALIZATION
  // --------------------------------------------------------------------------
  function init() {
    injectModals();
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('beforeunload', cancelPendingSequence);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
