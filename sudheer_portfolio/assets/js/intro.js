/**
 * intro.js — Stage 1: Sequential Coding Word Animation
 *          — Stage 2: Glossy Charcoal 3D Pill Button ("Let's Connect")
 * Pure black background (#000000), cinematic transitions, strict sequencing.
 */
(function () {
  'use strict';

  // Words list in exact required order
  const WORDS = [
    'Coding',
    'Developing',
    'Innovating',
    'Building',
    'Exploring',
    'Debugging',
    'Creating'
  ];

  // Timing configuration (milliseconds)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ENTER_DURATION = reduceMotion ? 25 : 120;
  const HOLD_DURATION = reduceMotion ? 175 : 240;
  const EXIT_DURATION = reduceMotion ? 20 : 90;
  const GAP_DURATION = reduceMotion ? 20 : 30;
  const STAGE2_DELAY = reduceMotion ? 30 : 105;

  // Active timers tracking for bulletproof cleanup
  const activeTimers = new Set();
  let isAborted = false;
  let isExiting = false;

  function safeTimeout(fn, delay) {
    if (isAborted) return null;
    const id = setTimeout(() => {
      activeTimers.delete(id);
      fn();
    }, delay);
    activeTimers.add(id);
    return id;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      safeTimeout(resolve, ms);
    });
  }

  function clearAllTimers() {
    isAborted = true;
    activeTimers.forEach((id) => clearTimeout(id));
    activeTimers.clear();
  }

  // Animate a single word through: enter -> visible hold -> exit -> gap
  async function animateWord(word, wordEl) {
    if (isAborted || !wordEl) return;

    // 1. Prepare word
    wordEl.className = 'intro-word hidden';
    wordEl.textContent = word;
    void wordEl.offsetWidth; // Force layout reflow

    // 2. Smooth fade-in + subtle upward motion
    wordEl.className = 'intro-word enter';
    await wait(ENTER_DURATION);
    if (isAborted) return;

    // 3. Visible hold (600–800ms)
    wordEl.className = 'intro-word visible';
    await wait(HOLD_DURATION);
    if (isAborted) return;

    // 4. Smooth fade-out + subtle upward motion
    wordEl.className = 'intro-word exit';
    await wait(EXIT_DURATION);
    if (isAborted) return;

    // 5. Hide word before next word begins
    wordEl.className = 'intro-word hidden';
    wordEl.textContent = '';
    await wait(GAP_DURATION);
  }

  // Smoothly reveal Stage 2 button
  function revealConnectButton(wordContainer, ctaContainer) {
    if (isAborted) return;

    if (wordContainer) {
      wordContainer.style.display = 'none';
    }

    if (ctaContainer) {
      ctaContainer.style.display = 'flex';
      void ctaContainer.offsetWidth; // Force reflow
      ctaContainer.classList.add('visible');
    }
  }

  // Smoothly transition from Intro to Existing Portfolio Homepage
  function handleConnectClick(overlay, connectBtn) {
    if (isExiting) return;
    isExiting = true;

    // Button tactile feedback
    if (connectBtn) {
      connectBtn.setAttribute('disabled', 'true');
    }

    // Smoothly fade out the pure black intro overlay
    if (overlay) {
      overlay.classList.add('fade-out');
    }

    // Allow interaction and remove overlay from layout after fade
    safeTimeout(() => {
      if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
      }
      document.documentElement.classList.remove('intro-active');
      document.body.classList.remove('intro-active');

      // Dispatch event in case any component or 3D scene listens for intro completion
      window.dispatchEvent(new CustomEvent('introFinished'));
    }, 700);
  }

  // Main Intro Sequence Orchestrator
  async function runIntroSequence() {
    const overlay = document.getElementById('intro-overlay');
    const wordContainer = document.getElementById('intro-word-container');
    const wordEl = document.getElementById('intro-word');
    const ctaContainer = document.getElementById('intro-cta-container');
    const connectBtn = document.getElementById('intro-connect-btn');

    if (!overlay || !wordEl || !ctaContainer || !connectBtn) {
      // Fallback: if markup is missing, unlock page immediately
      document.documentElement.classList.remove('intro-active');
      document.body.classList.remove('intro-active');
      return;
    }

    // Bind Stage 2 click event
    connectBtn.addEventListener('click', () => {
      handleConnectClick(overlay, connectBtn);
    });

    // Support keyboard activation (Enter / Space)
    connectBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleConnectClick(overlay, connectBtn);
      }
    });

    // Brief initial stillness on pure black
    await wait(200);
    if (isAborted) return;

    // Stage 1: Play each word sequentially
    for (let i = 0; i < WORDS.length; i++) {
      if (isAborted) return;
      await animateWord(WORDS[i], wordEl);
    }

    // Brief transition pause between Stage 1 and Stage 2
    await wait(STAGE2_DELAY);
    if (isAborted) return;

    // Stage 2: Reveal "Let's Connect" button
    revealConnectButton(wordContainer, ctaContainer);
  }

  // Clean up if window unloads
  window.addEventListener('beforeunload', clearAllTimers);

  // Initialize as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runIntroSequence);
  } else {
    runIntroSequence();
  }
})();
