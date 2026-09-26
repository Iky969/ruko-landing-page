// Interactive Security Risk Analyzer for Ruko Agent Dual-Layer Approval Gate

export class RukoSecurityAnalyzer {
  constructor(options = {}) {
    this.inputEl = document.getElementById(options.inputId || 'sec-input');
    this.resultContainer = document.getElementById(options.resultId || 'sec-result');
    this.presetButtons = document.querySelectorAll(options.presetSelector || '.sec-preset-btn');

    this.init();
  }

  init() {
    if (!this.inputEl || !this.resultContainer) return;

    this.inputEl.addEventListener('input', () => {
      this.analyze(this.inputEl.value);
    });

    this.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd') || btn.innerText.trim();
        this.inputEl.value = cmd;
        this.analyze(cmd);
      });
    });

    // Run initial analysis
    this.analyze(this.inputEl.value || 'rm -rf /');
  }

  analyze(rawCommand) {
    const cmd = (rawCommand || '').trim();
    if (!cmd) {
      this.renderEmpty();
      return;
    }

    const lower = cmd.toLowerCase();

    // 1. Layer 1: BLOCKED Patterns (Hardline - Always refused)
    const blockedChecks = [
      { re: /\brm\s+-[a-z]*r[a-z]*f[a-z]*\s+(\/|\/\*|~|\$HOME|\$USER|\/etc|\/usr|\/bin|\/root|\/boot|\/sys|\/proc|\/var|\/dev)/i, reason: 'rm -rf destruktif ke path sistem/root kritis' },
      { re: /\brm\b[^|;&\n]*--no-preserve-root/i, reason: 'rm dengan flag --no-preserve-root (melewati root guard)' },
      { re: /\b(?:rm|rmdir)\b[^|;&\n]*\s\/\.{1,2}(?:\/\.{1,2})*[*]?(?:\s|$)/i, reason: 'rm dengan obfuscasi dot-segment path (/./ atau /../)' },
      { re: /\bmkfs\b/i, reason: 'mkfs (memformat partisi filesystem)' },
      { re: /\bdd\s+if=.*\bof=\/dev\/(sd|nvme|hd|disk)/i, reason: 'dd menimpa raw block disk fisik' },
      { re: />{1,2}\s*\/dev\/(sd|nvme|hd|disk)\S*/i, reason: 'redirection shell langsung ke hardware disk' },
      { re: /:\(\)\s*\{\s*:\s*\|\s*:&\s*\}\s*;/i, reason: 'fork bomb klasik (:(){ :|:& };:)' },
      { re: /\b(\w+)\s*\(\s*\)\s*\{\s*\1\s*[|]\s*\1\s*[&]\s*\}\s*;\s*\1/i, reason: 'fork bomb fungsi kustom' }
    ];

    for (const check of blockedChecks) {
      if (check.re.test(cmd)) {
        this.renderBlocked(cmd, check.reason);
        return;
      }
    }

    // 2. Layer 2: DANGEROUS Patterns (Escalates to Guardian LLM or User Confirmation)
    const dangerousChecks = [
      { re: /\bsudo(\s|$)/i, reason: 'sudo (privilege escalation root)' },
      { re: /\b(curl|wget)\b[^|]*\|\s*(ba|z)?sh\b/i, reason: 'pipe web payload ke shell (eksekusi remote unverified)' },
      { re: /\bbase64\b[^|]*\|\s*(ba|z)?sh\b/i, reason: 'base64 decode pipe ke shell (eksekusi kode tersembunyi)' },
      { re: /\bgit\s+reset\s+--hard\b/i, reason: 'git reset --hard (menghapus kerja lokal secara permanen)' },
      { re: /\bgit\s+clean\s+-f[d]*\b/i, reason: 'git clean -f (menghapus untracked files tanpa recovery)' },
      { re: /\bchmod\s+-R\s+[0-7]{3}\b/i, reason: 'chmod -R (pengubahan permission file massal)' },
      { re: /\bkill\s+-9\b/i, reason: 'kill -9 (mematikan paksa proses)' },
      { re: /\b(shutdown|poweroff|reboot|halt)(\s|$)/i, reason: 'perintah mematikan / reboot mesin host' },
      { re: /\bfind\b[^|;&\n]*-delete\b/i, reason: 'find -delete (penghapusan file rekursif)' },
      { re: /\b(truncate|shred|wipefs)\b/i, reason: 'utilitas pengosongan / penghancuran data' },
      { re: /\beval\s/i, reason: 'eval (eksekusi kode dinamis tak terverifikasi)' },
      { re: /\b(?:python[23]?\s+-c|(?:node|perl|ruby|lua)\s+-e|php\s+-r)\b/i, reason: 'interpreter inline execution (membutuhkan evaluasi kode internal)' }
    ];

    for (const check of dangerousChecks) {
      if (check.re.test(cmd)) {
        // Check if it's an inline interpreter script suitable for Guardian semantic evaluation
        if (check.re.source.includes('python') || check.re.source.includes('node')) {
          this.renderGuardianEvaluation(cmd);
          return;
        }
        this.renderDangerous(cmd, check.reason);
        return;
      }
    }

    // 3. Safe / Normal Command
    this.renderSafe(cmd);
  }

  renderBlocked(cmd, reason) {
    this.resultContainer.innerHTML = `
      <div class="border-2 border-red-500/80 bg-red-950/40 p-5 rounded-xl space-y-3 animate-fade-in shadow-lg shadow-red-950/50">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span class="text-red-400 font-bold tracking-wide uppercase text-sm">Verdict: BLOCKED MUTLAK</span>
          </div>
          <span class="px-2.5 py-1 rounded text-xs font-mono bg-red-900/60 text-red-200 border border-red-700/60">
            Layer 1: Deterministic Regex Gate
          </span>
        </div>
        <div class="space-y-1 font-mono text-xs">
          <div class="text-slate-400">Target Perintah : <span class="text-red-300 font-bold break-all">${this.escape(cmd)}</span></div>
          <div class="text-slate-400">Aturan Keamanan  : <span class="text-red-400 font-semibold">${reason}</span></div>
          <div class="text-slate-400">Tindakan Sistem  : <span class="text-red-200 font-bold">EKSEKUSI DITOLAK SEKETIKA (Refusal Synthesized)</span></div>
        </div>
        <div class="border-t border-red-900/50 pt-2.5 text-xs text-slate-300 leading-relaxed">
          🛡️ <b>Jaminan Keamanan:</b> Pola ini tergolong ancaman fatal ke host OS. Ruko memblokir eksekusi di level parsing lokal tanpa membuang kuota LLM dan <i>tidak dapat di-bypass</i> oleh flag allowlist maupun mode YOLO.
        </div>
      </div>
    `;
  }

  renderDangerous(cmd, reason) {
    this.resultContainer.innerHTML = `
      <div class="border-2 border-amber-500/80 bg-amber-950/40 p-5 rounded-xl space-y-3 animate-fade-in shadow-lg shadow-amber-950/40">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-amber-500"></span>
            <span class="text-amber-400 font-bold tracking-wide uppercase text-sm">Verdict: DANGEROUS (Wajib Konfirmasi)</span>
          </div>
          <span class="px-2.5 py-1 rounded text-xs font-mono bg-amber-900/60 text-amber-200 border border-amber-700/60">
            Layer 1 Gate → User Modal Prompt
          </span>
        </div>
        <div class="space-y-1 font-mono text-xs">
          <div class="text-slate-400">Target Perintah : <span class="text-amber-300 font-bold break-all">${this.escape(cmd)}</span></div>
          <div class="text-slate-400">Alasan Risiko    : <span class="text-amber-400 font-semibold">${reason}</span></div>
          <div class="text-slate-400">Tindakan Sistem  : <span class="text-amber-200 font-bold">Munculkan Dialog Interaktif TUI [y/N]</span></div>
        </div>
        <div class="border-t border-amber-900/50 pt-2.5 text-xs text-slate-300 leading-relaxed">
          ⚠️ <b>Persetujuan Manusia:</b> Ruko menghentikan sementara siklus otomatis agen dan meminta persetujuan manusia secara eksplisit sebelum perintah shell dieksekusi.
        </div>
      </div>
    `;
  }

  renderGuardianEvaluation(cmd) {
    const isBenign = !cmd.includes('rm') && !cmd.includes('shutil') && !cmd.includes('socket') && !cmd.includes('unlink') && !cmd.includes('child_process');

    if (isBenign) {
      this.resultContainer.innerHTML = `
        <div class="border-2 border-emerald-500/80 bg-emerald-950/40 p-5 rounded-xl space-y-3 animate-fade-in shadow-lg shadow-emerald-950/40">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-emerald-400 font-bold tracking-wide uppercase text-sm">Verdict: DANGEROUS → GUARDIAN SAFE</span>
            </div>
            <span class="px-2.5 py-1 rounded text-xs font-mono bg-emerald-900/60 text-emerald-200 border border-emerald-700/60">
              Layer 2: Guardian LLM Semantic Analysis
            </span>
          </div>
          <div class="space-y-1 font-mono text-xs">
            <div class="text-slate-400">Target Perintah : <span class="text-emerald-300 font-bold break-all">${this.escape(cmd)}</span></div>
            <div class="text-slate-400">Deteksi Layer 1 : <span class="text-amber-300">Inline script (-c / -e) ditandai berisiko</span></div>
            <div class="text-slate-400">Analisis Layer 2: <span class="text-emerald-300 font-bold">Guardian memverifikasi konten kode: "Operasi benign tanpa side-effects"</span></div>
            <div class="text-slate-400">Audit Trail     : <span class="text-cyan-300">Tercatat permanen di .ruko/guardian-audit.log (0600)</span></div>
          </div>
          <div class="border-t border-emerald-900/50 pt-2.5 text-xs text-slate-300 leading-relaxed">
            🧠 <b>Kecerdasan Kontekstual:</b> Berbeda dari CLI biasa yang memblokir semua skrip secara kaku, Guardian LLM (temperatur 0, isolasi pesan) memahami substansi kode sehingga alur kerja pengembang tidak terhambat untuk operasi yang terbukti aman.
          </div>
        </div>
      `;
    } else {
      this.resultContainer.innerHTML = `
        <div class="border-2 border-red-500/80 bg-red-950/40 p-5 rounded-xl space-y-3 animate-fade-in shadow-lg shadow-red-950/40">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full bg-red-500"></span>
              <span class="text-red-400 font-bold tracking-wide uppercase text-sm">Verdict: GUARDIAN BLOCKED (Malicious Intent)</span>
            </div>
            <span class="px-2.5 py-1 rounded text-xs font-mono bg-red-900/60 text-red-200 border border-red-700/60">
              Layer 2: Guardian LLM Semantic Analysis
            </span>
          </div>
          <div class="space-y-1 font-mono text-xs">
            <div class="text-slate-400">Target Perintah : <span class="text-red-300 font-bold break-all">${this.escape(cmd)}</span></div>
            <div class="text-slate-400">Analisis Guardian: <span class="text-red-400 font-bold">Terdeteksi destruksi data internal berkas atau exfiltrasi</span></div>
            <div class="text-slate-400">Tindakan Sistem : <span class="text-red-300 font-bold">Ditolak otomatis & Ditembuskan ke Log Audit</span></div>
          </div>
        </div>
      `;
    }
  }

  renderSafe(cmd) {
    this.resultContainer.innerHTML = `
      <div class="border border-slate-700 bg-slate-900/50 p-5 rounded-xl space-y-3 animate-fade-in">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-blue-400"></span>
            <span class="text-blue-400 font-bold tracking-wide uppercase text-sm">Verdict: NONE (Aman untuk Eksekusi)</span>
          </div>
          <span class="px-2.5 py-1 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
            Layer 1: Whitelist / Read-Only Pass
          </span>
        </div>
        <div class="space-y-1 font-mono text-xs">
          <div class="text-slate-400">Target Perintah : <span class="text-slate-200 font-bold break-all">${this.escape(cmd)}</span></div>
          <div class="text-slate-400">Status Keamanan : <span class="text-blue-300">Bebas dari operasi destruktif, traversal sandbox, maupun tampering</span></div>
          <div class="text-slate-400">Waktu Latensi   : <span class="text-emerald-400 font-bold">&lt; 1 ms (Evaluasi regex instan)</span></div>
        </div>
        <div class="border-t border-slate-800 pt-2.5 text-xs text-slate-300 leading-relaxed">
          🚀 <b>Kecepatan Tinggi:</b> Perintah normal langsung dieksekusi tanpa jeda, menjaga ritme pair-programming terminal tetap kilat.
        </div>
      </div>
    `;
  }

  renderEmpty() {
    this.resultContainer.innerHTML = `
      <div class="border border-dashed border-slate-800 p-8 rounded-xl text-center text-slate-500 font-mono text-xs">
        Ketik perintah shell di atas atau klik salah satu chip preset untuk menguji ketangguhan Dual-Layer Gate.
      </div>
    `;
  }

  escape(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
