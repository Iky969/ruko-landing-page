// Interactive Ruko Terminal Simulator with Aquarium Animation & Dual-Layer Guard Simulation

class RukoTerminalSimulator {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.history = [];
    this.historyIndex = -1;
    this.audioEnabled = false;
    this.isAnimating = false;
    this.planMode = false;
    this.yoloMode = false;
    this.audioCtx = null;

    this.initAudio();
    this.initDOM();
    this.startAquariumSplash();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch {
      // Audio optional
    }
  }

  playKeySound(type = 'click') {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(450 + Math.random() * 100, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'beep') {
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch {
      // ignore
    }
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="terminal-body space-y-2 select-text" id="term-output"></div>
      <div class="ruko-dark-green-bar px-3 py-1.5 text-xs font-mono flex items-center justify-between shadow-inner" id="term-status-bar">
        <div class="flex items-center space-x-2">
          <span class="text-emerald-300 font-bold font-mono">&gt;_ [gemini]</span>
          <span id="term-badges" class="space-x-1"></span>
          <span class="text-slate-300 hidden sm:inline">| ctx 28% (8.4k/30k)</span>
          <span class="text-slate-400 hidden md:inline">· ↑ 2.1kt ↓ 650t</span>
        </div>
        <div class="text-emerald-200 text-xs flex items-center space-x-2">
          <span class="hidden lg:inline text-slate-300">/? untuk bantuan</span>
          <span class="text-emerald-400 font-bold">LIVE</span>
        </div>
      </div>
      <div class="p-3 bg-[#0a0f16] border-t border-slate-800 flex items-center space-x-2 font-mono text-sm">
        <span class="text-emerald-400 font-bold">›</span>
        <input 
          type="text" 
          id="term-input" 
          class="flex-1 bg-transparent border-none outline-none text-emerald-100 placeholder-slate-600 focus:ring-0 font-mono text-sm" 
          placeholder="Ketik perintah (contoh: /help, exec npm test, exec rm -rf /) ..." 
          autocomplete="off" 
          spellcheck="false"
        />
        <div class="flex items-center space-x-2 text-xs">
          <button id="btn-sound-toggle" class="px-2 py-0.5 rounded text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition" title="Toggle Sound">
            🔇 Sound Off
          </button>
          <button id="btn-replay-splash" class="px-2 py-0.5 rounded text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition" title="Putar Ulang Animasi Aquarium">
            🌊 Splash
          </button>
        </div>
      </div>
    `;

    this.output = this.container.querySelector('#term-output');
    this.input = this.container.querySelector('#term-input');
    this.statusBar = this.container.querySelector('#term-status-bar');
    this.badgesContainer = this.container.querySelector('#term-badges');
    this.soundToggleBtn = this.container.querySelector('#btn-sound-toggle');
    this.replaySplashBtn = this.container.querySelector('#btn-replay-splash');

    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.input.addEventListener('input', () => this.playKeySound('click'));

    this.soundToggleBtn.addEventListener('click', () => {
      this.audioEnabled = !this.audioEnabled;
      if (this.audioEnabled && this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.soundToggleBtn.innerText = this.audioEnabled ? '🔊 Sound On' : '🔇 Sound Off';
      this.soundToggleBtn.classList.toggle('text-emerald-400', this.audioEnabled);
      if (this.audioEnabled) this.playKeySound('beep');
    });

    this.replaySplashBtn.addEventListener('click', () => {
      if (!this.isAnimating) {
        this.output.innerHTML = '';
        this.startAquariumSplash();
      }
    });

    this.updateBadges();
  }

  updateBadges() {
    let badges = [];
    if (this.planMode) badges.push('<span class="bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded text-[10px] font-bold">⏸ PLAN</span>');
    if (this.yoloMode) badges.push('<span class="bg-red-500/20 text-red-300 px-1 py-0.2 rounded text-[10px] font-bold">[YOLO]</span>');
    this.badgesContainer.innerHTML = badges.join(' ');
  }

  async startAquariumSplash() {
    this.isAnimating = true;
    this.input.disabled = true;

    const splashBox = document.createElement('div');
    splashBox.className = 'font-mono text-xs leading-tight py-2 text-cyan-300 overflow-x-auto whitespace-pre';
    this.output.appendChild(splashBox);

    const fishFrames = [
      { f1: '><(((o>', f2: '<o)))><', f3: '}-(((o>' },
      { f1: '}-(((o>', f2: '<o)))-{', f3: '><(((o>' }
    ];

    // Aquarium swim animation frames
    for (let frame = 0; frame < 16; frame++) {
      const fish = fishFrames[frame % 2];
      const p1 = (frame * 3) % 45;
      const p2 = Math.max(0, 42 - (frame * 3) % 45);
      const p3 = (frame * 2 + 10) % 45;

      const ripple = (frame % 3 === 0) ? '~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.' : '.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~';
      const bubbleRow = frame % 2 === 0 ? '     o        o            o         o         ' : '        o           o           o              ';
      
      const swim1 = ' '.repeat(p1) + fish.f1 + ' '.repeat(Math.max(0, 45 - p1));
      const swim2 = ' '.repeat(p2) + fish.f2 + ' '.repeat(Math.max(0, 45 - p2));
      const swim3 = ' '.repeat(p3) + fish.f3 + ' '.repeat(Math.max(0, 45 - p3));
      const plants = (frame % 2 === 0) 
        ? '_..._..(\\|/).._..._..._(\\|/).._..._..(\\|/)..._' 
        : '_..._..(/|\\).._..._..._(/|\\).._..._..(/|\\)..._';

      splashBox.innerHTML = 
`┌─ Ruko Aquarium TUI ─────────────────────────┐
│ <span class="text-blue-400">${ripple}</span> │
│ <span class="text-cyan-200">${bubbleRow}</span> │
│ <span class="text-yellow-300">${swim1.slice(0, 45)}</span> │
│ <span class="text-emerald-400">${swim2.slice(0, 45)}</span> │
│ <span class="text-cyan-300">${swim3.slice(0, 45)}</span> │
│ <span class="text-slate-400">${plants}</span> │
└─────────────────────────────────────────────┘`;
      
      await new Promise(r => setTimeout(r, 110));
    }

    // Freeze into final Ruko banner
    splashBox.innerHTML = 
`┌─ Ruko-agent ───────────────────── version 1.8.0 ─┐
│                                                  │
│  <span class="text-emerald-400 font-bold">"Masuk Ruko..."</span>                                 │
│                                                  │
│  <span class="text-slate-300">model: gemini ──── provider: custom</span>             │
│                                                  │
│  <span class="text-cyan-300">Ketik / untuk daftar perintah, Ctrl+C keluar</span>    │
└──────────────────────────────────────────────────┘`;

    this.printLine('<span class="text-emerald-400">✓ Ruko siap melayani. Ketik perintah atau pilih tombol demo di bawah.</span>', 'mt-2 mb-2');
    this.isAnimating = false;
    this.input.disabled = false;
    this.input.focus();
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.output.scrollTop = this.output.scrollHeight;
  }

  printLine(html, extraClasses = '') {
    const div = document.createElement('div');
    div.className = `font-mono text-sm leading-relaxed ${extraClasses}`;
    div.innerHTML = html;
    this.output.appendChild(div);
    this.scrollToBottom();
  }

  execute(commandText) {
    const raw = commandText.trim();
    if (!raw) return;

    this.history.push(raw);
    this.historyIndex = this.history.length;

    this.printLine(`<span class="text-emerald-400 font-bold">› </span><span class="text-white">${this.escapeHtml(raw)}</span>`, 'mt-1');
    this.input.value = '';

    const cmd = raw.toLowerCase();

    if (cmd === 'clear') {
      this.output.innerHTML = '';
      return;
    }

    if (cmd === 'help' || cmd === '/?' || cmd === '/help') {
      this.playKeySound('beep');
      this.printLine(`
<div class="border border-slate-700 bg-slate-900/80 p-3 rounded text-xs space-y-2">
  <div class="text-emerald-400 font-bold">📋 Ruko Slash Commands (Ringkasan Bantuan):</div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
    <div><span class="text-cyan-400 font-bold">/plan [on|off]</span> : Mode rencana (kunci eksekusi)</div>
    <div><span class="text-cyan-400 font-bold">/yolo [on|off]</span> : Mode auto-approve</div>
    <div><span class="text-cyan-400 font-bold">/undo [path]</span>   : Batalkan perubahan berkas</div>
    <div><span class="text-cyan-400 font-bold">/ctx</span>          : Status limit context window</div>
    <div><span class="text-cyan-400 font-bold">/role [nama]</span>   : Ganti peran kepribadian AI</div>
    <div><span class="text-cyan-400 font-bold">/sessions</span>      : Lihat riwayat sesi tersimpan</div>
    <div><span class="text-cyan-400 font-bold">/compact</span>       : Ringkas konteks percakapan</div>
    <div><span class="text-cyan-400 font-bold">/settings</span>      : Panel dashboard konfigurasi</div>
  </div>
  <div class="text-slate-400 pt-1 text-[11px]">Ketik <span class="text-emerald-300 font-mono">exec &lt;cmd&gt;</span> untuk mengeksekusi shell langsung dengan penjagaan Dual-Layer Gate.</div>
</div>
      `);
      return;
    }

    if (cmd.startsWith('/plan')) {
      const arg = cmd.replace('/plan', '').trim();
      if (arg === 'on') {
        this.planMode = true;
        this.updateBadges();
        this.playKeySound('beep');
        this.printLine('<span class="text-amber-400">⏸ Mode Rencana Aktif: Seluruh operasi write, edit, delete, dan shell diblokir sampai dinonaktifkan.</span>');
      } else if (arg === 'off') {
        this.planMode = false;
        this.updateBadges();
        this.printLine('<span class="text-emerald-400">✓ Mode Rencana Nonaktif: Izin operasi tulis dan shell kembali normal.</span>');
      } else {
        this.printLine(`<span class="text-slate-300">Status Plan Mode: <b>${this.planMode ? 'AKTIF (Read-Only)' : 'NONAKTIF'}</b>. Gunakan <code class="text-cyan-400">/plan on</code> atau <code class="text-cyan-400">/plan off</code>.</span>`);
      }
      return;
    }

    if (cmd.startsWith('/yolo')) {
      const arg = cmd.replace('/yolo', '').trim();
      if (arg === 'on') {
        this.yoloMode = true;
        this.updateBadges();
        this.playKeySound('beep');
        this.printLine('<span class="text-red-400 font-bold">⚠️ YOLO Mode Aktif: Konfirmasi manual dilompati (Pola BLOCKED mutlak tetap dijaga aktif!).</span>');
      } else if (arg === 'off') {
        this.yoloMode = false;
        this.updateBadges();
        this.printLine('<span class="text-emerald-400">✓ YOLO Mode Dimatikan: Konfirmasi Dual-Layer Gate kembali diwajibkan.</span>');
      } else {
        this.printLine(`<span class="text-slate-300">Status YOLO Mode: <b>${this.yoloMode ? 'AKTIF' : 'NONAKTIF'}</b>.</span>`);
      }
      return;
    }

    if (cmd === '/ctx' || cmd.startsWith('/context')) {
      this.playKeySound('beep');
      this.printLine(`
<div class="border border-slate-700 bg-slate-900/60 p-3 rounded text-xs space-y-1">
  <div class="text-emerald-400 font-bold">📊 Context Budget Monitor:</div>
  <div>Kapasitas Maksimal : <span class="text-cyan-300 font-bold">30,000 karakter (~7,500 token)</span></div>
  <div>Karakter Terpakai  : <span class="text-yellow-300">8,412 karakter (28%)</span></div>
  <div class="w-full bg-slate-800 rounded-full h-2 my-2 overflow-hidden">
    <div class="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style="width: 28%"></div>
  </div>
  <div class="text-slate-400 text-[11px]">Sistem kompresor adaptif akan memangkas history lama otomatis jika pemakaian > 85%.</div>
</div>
      `);
      return;
    }

    if (cmd === '/undo') {
      this.playKeySound('beep');
      this.printLine(`
<div class="border border-slate-700 bg-slate-900/60 p-2.5 rounded text-xs space-y-1">
  <div class="text-emerald-400 font-bold">⏪ Snapshot Undo Journal:</div>
  <div class="text-slate-300">Menemukan snapshot cadangan terakhir: <span class="font-mono text-cyan-300">.ruko/undo/src-config.ts.177263004.bak</span></div>
  <div class="text-emerald-300">✓ Berkas <span class="font-mono">src/config.ts</span> berhasil dikembalikan ke snapshot sebelumnya (mode 0600 terverifikasi).</div>
</div>
      `);
      return;
    }

    // Shell command execution simulation with Dual Layer Gate!
    if (cmd.startsWith('exec ') || cmd.startsWith('bash ') || cmd.startsWith('run ')) {
      const shellCmd = raw.slice(raw.indexOf(' ') + 1).trim();
      this.simulateShellCommand(shellCmd);
      return;
    }

    if (cmd === 'npm test') {
      this.simulateNpmTest();
      return;
    }

    if (cmd.includes('rm -rf /') || cmd.includes(':(){ :|:& };:') || cmd.includes('mkfs')) {
      this.simulateShellCommand(raw);
      return;
    }

    // Generic chat prompt
    this.simulateAgentThinking(raw);
  }

  simulateShellCommand(shellCmd) {
    const lower = shellCmd.toLowerCase();

    // Check Plan Mode
    if (this.planMode) {
      this.playKeySound('error');
      this.printLine(`<span class="text-red-400 font-bold">⛔ Operasi ditolak: Plan Mode sedang AKTIF. Operasi shell tidak diizinkan.</span>`);
      return;
    }

    // Layer 1: BLOCKED Patterns
    if (
      lower.includes('rm -rf /') || 
      lower.includes('rm -fr /') || 
      lower.includes('rm --no-preserve-root') ||
      lower.includes(':(){ :|:& };:') ||
      lower.includes('mkfs') ||
      lower.includes('of=/dev/sd')
    ) {
      this.playKeySound('error');
      this.printLine(`
<div class="border-2 border-red-500 bg-red-950/80 p-3 rounded text-xs space-y-1.5 my-2">
  <div class="text-red-300 font-bold text-sm flex items-center space-x-1">
    <span>🛑 [BLOCKED OLEH RUKO - LAYER 1 REGEX GATE]</span>
  </div>
  <div class="text-slate-200">Perintah : <code class="text-red-200 font-mono font-bold">${this.escapeHtml(shellCmd)}</code></div>
  <div class="text-red-300">Alasan   : Terdeteksi pola destruktif yang mengancam integritas sistem host/root.</div>
  <div class="text-slate-400 text-[11px] border-t border-red-800/60 pt-1">
    🛡️ Eksekusi ditolak seketika. Pola BLOCKED tidak dapat dilewati bahkan dengan mode YOLO maupun allowlist.
  </div>
</div>
      `);
      return;
    }

    // Layer 2: Guardian LLM Semantic Analysis (Nuanced command)
    if (lower.includes('python3 -c') || lower.includes('node -e')) {
      this.printLine(`<span class="text-yellow-400">🔍 Layer 1 Regex mendeteksi inline script → Mengeskalasi ke Layer 2: Guardian LLM...</span>`);
      setTimeout(() => {
        this.playKeySound('beep');
        this.printLine(`
<div class="border border-emerald-500/80 bg-emerald-950/40 p-2.5 rounded text-xs space-y-1 my-1">
  <div class="text-emerald-300 font-bold">✓ Guardian LLM (Analisis Semantik): AMAN</div>
  <div class="text-slate-300">Reasoning : Skrip bersifat evaluasi murni tanpa filesystem wipe atau network exfiltration.</div>
  <div class="text-emerald-400">Audit Log : Dicatat ke <code class="text-slate-200 font-mono">.ruko/guardian-audit.log</code> (mode 0600)</div>
</div>
        `);
        // Simulated output
        if (lower.includes('1 + 1') || lower.includes('1+1')) {
          this.printLine(`<span class="font-mono text-slate-100">2</span>`);
        } else {
          this.printLine(`<span class="font-mono text-slate-100">[Output eksekusi berhasil dicatat]</span>`);
        }
      }, 500);
      return;
    }

    // Dangerous pattern asking confirmation
    if (lower.includes('curl') && lower.includes('|') && lower.includes('sh')) {
      this.playKeySound('beep');
      this.printLine(`
<div class="border border-amber-500 bg-amber-950/70 p-3 rounded text-xs space-y-1.5 my-2">
  <div class="text-amber-300 font-bold">⚠ KONFIRMASI BERISIKO [Layer 1 Regex]</div>
  <div class="text-slate-200">Perintah : <code class="text-amber-200 font-mono">${this.escapeHtml(shellCmd)}</code></div>
  <div class="text-amber-300">Alasan   : pipe ke shell (eksekusi remote tak terverifikasi)</div>
  <div class="text-slate-300 font-bold mt-2">Jalankan perintah ini? (y/N) › <span class="text-slate-400">[Simulasi: Menunggu konfirmasi user]</span></div>
</div>
      `);
      return;
    }

    // Normal safe execution
    this.printLine(`<span class="text-slate-400 text-xs">├── [1] 🖥️ Bash(${this.escapeHtml(shellCmd)}) (42ms)</span>`);
    if (lower.includes('git status')) {
      this.printLine(`
<pre class="text-slate-300 text-xs font-mono">On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean</pre>
      `);
    } else {
      this.printLine(`<span class="text-emerald-300 font-mono text-xs">✓ Perintah selesai dengan exit code 0.</span>`);
    }
  }

  simulateNpmTest() {
    this.printLine(`<span class="text-cyan-400 text-xs font-mono">▸ Menjalankan suite pengujian unit Ruko...</span>`);
    setTimeout(() => {
      this.playKeySound('beep');
      this.printLine(`
<pre class="text-emerald-400 text-xs font-mono leading-tight bg-slate-950/70 p-3 rounded border border-emerald-800/40">
▶ approval.test.ts (24 tests) ........................... <span class="text-emerald-300">PASSED</span>
▶ guardian.test.ts (18 tests) ........................... <span class="text-emerald-300">PASSED</span>
▶ sensitive_protection.test.ts (32 tests) ............... <span class="text-emerald-300">PASSED</span>
▶ file_security.test.ts (15 tests) ...................... <span class="text-emerald-300">PASSED</span>
▶ tui_workflow.test.ts (12 tests) ....................... <span class="text-emerald-300">PASSED</span>
▶ undo.test.ts (8 tests) ................................ <span class="text-emerald-300">PASSED</span>
▶ webtools_ssrf.test.ts (14 tests) ...................... <span class="text-emerald-300">PASSED</span>

ℹ tests 901
ℹ suites 72
ℹ pass 901
ℹ fail 0
ℹ cancelled 0
ℹ todo 0
ℹ duration_ms 4210.8

<span class="text-emerald-300 font-bold">✔ 901 tests passed successfully! Zero regressions.</span>
</pre>
      `);
      this.scrollToBottom();
    }, 600);
  }

  simulateAgentThinking(prompt) {
    this.printLine(`<span class="text-slate-400 text-xs">• Thinking: Menganalisis repositori dan merencanakan tindakan...</span>`);
    setTimeout(() => {
      this.playKeySound('beep');
      this.printLine(`
<div class="space-y-1.5 text-xs text-slate-200">
  <div class="text-slate-400">├── [1] 🔍 find src/**/*.{ts,json} (16ms)</div>
  <div class="text-slate-400">├── [2] 📖 Read package.json (8ms)</div>
  <div class="mt-2 text-slate-100">
    Halo! Saya agen Ruko. Berdasarkan analisis, saya siap membantu refactoring, penulisan tes, atau debugging proyek Anda dengan keamanan dual-layer gate. Apa yang ingin kita kerjakan hari ini?
  </div>
</div>
      `);
      this.scrollToBottom();
    }, 700);
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      const val = this.input.value;
      if (val.trim()) {
        this.execute(val);
      }
    } else if (e.key === 'ArrowUp') {
      if (this.history.length > 0 && this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = '';
      }
      e.preventDefault();
    }
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.RukoTerminalSimulator = RukoTerminalSimulator;
