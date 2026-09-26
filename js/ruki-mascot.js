// Ruki Mascot Component - Interactive, Animated Cyber-Monitor Bot
// Created for Ruko-CLI Landing Page & Docs

export class RukiMascot {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      defaultExpression: '>__<',
      pointTargetSelector: options.pointTargetSelector || '#cmd-curl',
      autoBlink: true,
      ...options
    };

    this.expressions = {
      default: '>__<',
      blink: '─ __ ─',
      happy: '^__^',
      focused: '[o_o]',
      wink: '^_<',
      excited: '>o<',
      cheers: '◕‿◕'
    };

    this.tips = [
      'Bip bop! Ruko jalan 100% aman di terminalmu! 🛡️',
      'Salin perintah di samping untuk install instan! 👉',
      'Zero dependencies: bebas supply-chain attacks! ⚡',
      'Dual-Layer Guardian selalu siap menjagamu! 🤖',
      '901+ unit test lulus tanpa celah! ✨',
      'Snapshot Undo siap rollback kapan saja! ⏪',
      'Bisa jalan offline pakai Ollama lho! 🚀'
    ];

    this.tipIndex = 0;
    this.currentExpression = this.options.defaultExpression;
    this.isBlinking = false;
    this.isPoked = false;
    this.audioCtx = null;

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.render();
    this.setupAudio();
    this.setupMouseTracking();
    this.setupBlinkTimer();
    this.setupInteractivity();
  }

  setupAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    } catch {
      // Audio optional
    }
  }

  playChirp(type = 'happy') {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'happy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'poke') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.05);
        osc.frequency.setValueAtTime(990, now + 0.1);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch {
      // ignore
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="ruki-container" id="ruki-interactive" title="Klik saya untuk berinteraksi!">
        
        <!-- Speech Bubble Tooltip -->
        <div class="ruki-speech-bubble" id="ruki-bubble">
          ${this.tips[0]}
        </div>

        <!-- 3D Chassis Wrapper -->
        <div class="ruki-chassis-wrapper" id="ruki-wrapper">
          
          <!-- Top Antenna -->
          <div class="ruki-antenna"></div>

          <!-- Main Monitor Body -->
          <div class="ruki-monitor">
            
            <!-- Shockwave Ring (triggered on click) -->
            <div class="ruki-shockwave" id="ruki-shock"></div>

            <!-- OLED Screen -->
            <div class="ruki-screen" id="ruki-screen">
              <div class="ruki-face" id="ruki-face-display">${this.currentExpression}</div>
              <div class="ruki-blush">
                <span>///</span>
                <span>///</span>
              </div>
              <div class="ruki-chin-badge">RUKO·AGENT</div>
            </div>

          </div>

          <!-- Floating Left Hand (Mitten/Paw) -->
          <div class="ruki-hand ruki-hand-left" id="ruki-hand-l" title="Hai!">
            <span>🐾</span>
          </div>

          <!-- Floating Right Hand (Pointing at Install Box) -->
          <div class="ruki-hand ruki-hand-right" id="ruki-hand-r" title="Install di sini!">
            <span>👉</span>
          </div>

        </div>

        <!-- Ground Shadow -->
        <div class="ruki-shadow"></div>

      </div>
    `;

    this.wrapper = this.container.querySelector('#ruki-wrapper');
    this.screen = this.container.querySelector('#ruki-screen');
    this.faceDisplay = this.container.querySelector('#ruki-face-display');
    this.bubble = this.container.querySelector('#ruki-bubble');
    this.shock = this.container.querySelector('#ruki-shock');
    this.interactiveEl = this.container.querySelector('#ruki-interactive');
  }

  setExpression(expr) {
    if (this.faceDisplay) {
      this.faceDisplay.innerText = expr;
    }
  }

  setupBlinkTimer() {
    if (!this.options.autoBlink) return;

    const scheduleNextBlink = () => {
      const nextTime = Math.random() * 3500 + 2500; // 2.5s - 6s
      setTimeout(() => {
        if (!this.isPoked) {
          this.blink();
        }
        scheduleNextBlink();
      }, nextTime);
    };

    scheduleNextBlink();
  }

  blink() {
    if (this.isBlinking) return;
    this.isBlinking = true;
    const prev = this.currentExpression;
    this.setExpression(this.expressions.blink);
    setTimeout(() => {
      this.setExpression(prev);
      this.isBlinking = false;
    }, 180);
  }

  setupMouseTracking() {
    if (!this.wrapper) return;

    window.addEventListener('mousemove', (e) => {
      const rect = this.wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamped rotation
      const rotY = Math.max(-16, Math.min(16, deltaX * 16));
      const rotX = Math.max(-14, Math.min(14, -deltaY * 14));

      // Parallax shift for inside face
      const faceShiftX = deltaX * 8;
      const faceShiftY = deltaY * 6;

      this.wrapper.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      if (this.screen) {
        this.screen.style.transform = `translate(${faceShiftX}px, ${faceShiftY}px)`;
      }
    });

    window.addEventListener('mouseleave', () => {
      this.wrapper.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      if (this.screen) {
        this.screen.style.transform = 'translate(0px, 0px)';
      }
    });
  }

  setupInteractivity() {
    if (!this.interactiveEl) return;

    // Hover
    this.interactiveEl.addEventListener('mouseenter', () => {
      if (!this.isPoked) {
        this.currentExpression = this.expressions.focused;
        this.setExpression(this.currentExpression);
      }
      this.showBubble();
      this.playChirp('happy');
    });

    this.interactiveEl.addEventListener('mouseleave', () => {
      if (!this.isPoked) {
        this.currentExpression = this.options.defaultExpression;
        this.setExpression(this.currentExpression);
      }
      this.hideBubble();
    });

    // Click / Poke
    this.interactiveEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.poke();
    });
  }

  poke() {
    this.isPoked = true;
    this.playChirp('poke');

    // Trigger shockwave animation
    if (this.shock) {
      this.shock.classList.remove('active');
      void this.shock.offsetWidth; // trigger reflow
      this.shock.classList.add('active');
    }

    // Bounce wrapper
    this.wrapper.style.transform = 'perspective(800px) translateY(-14px) scale(1.08)';
    setTimeout(() => {
      this.wrapper.style.transform = 'perspective(800px) translateY(0px) scale(1)';
    }, 220);

    // Random happy expression on click
    const clickExprs = [
      this.expressions.happy,
      this.expressions.excited,
      this.expressions.cheers,
      this.expressions.wink
    ];
    const picked = clickExprs[Math.floor(Math.random() * clickExprs.length)];
    this.setExpression(picked);

    // Cycle speech tip
    this.tipIndex = (this.tipIndex + 1) % this.tips.length;
    if (this.bubble) {
      this.bubble.innerText = this.tips[this.tipIndex];
    }
    this.showBubble();

    setTimeout(() => {
      this.isPoked = false;
      this.currentExpression = this.options.defaultExpression;
      this.setExpression(this.currentExpression);
    }, 1800);
  }

  showBubble() {
    if (this.bubble) {
      this.bubble.classList.add('visible');
    }
  }

  hideBubble() {
    if (this.bubble && !this.isPoked) {
      this.bubble.classList.remove('visible');
    }
  }
}

window.RukiMascot = RukiMascot;
