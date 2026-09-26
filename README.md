# Ruko Agent — Official Landing Page ⚡

Landing page modern, cepat, dan interaktif untuk [Ruko (AI Coding Agent CLI)](https://github.com/Iky969/Ruko-agent).

Dibangun dengan prinsip yang sama dengan Ruko: **Zero build hassle, clean, modern, & zero runtime external dependencies**.

---

## 🌟 Fitur Utama Landing Page

1. **Terminal Simulator Interaktif**:
   - Memutar animasi Aquarium TUI Ruko asli (`splash.ts`) dengan ikan berenang (`><(((o>`, `}-(((o>`, `<o)))><`), riak air, gelembung naik, dan tanaman bergoyang.
   - Status bar dinamis (`⚡ [gemini] | ctx 28% · ↑2.1kt ↓650t`).
   - Simulasi eksekusi shell dengan penolakan **Layer 1 BLOCKED** (`exec rm -rf /`) dan evaluasi semantik **Layer 2 Guardian LLM** (`exec python3 -c "print(1+1)"`).
   - Tombol chip preset perintah cepat.
   - Efek suara audio keyboard opsional menggunakan Web Audio API sintesis lokal.

2. **Laboratorium Keamanan Interaktif (Security Analyzer Playground)**:
   - Pengunjung dapat mengetik perintah shell apa pun atau memilih preset untuk menguji klasifikasi risiko Ruko secara real time (BLOCKED, DANGEROUS, SAFE).

3. **Katalog 24 Built-In Tools**:
   - Filter instan berdasarkan kategori (*Eksekusi*, *Inspeksi*, *Manipulasi Berkas*, *Memori & Skill*, *Subagent*).
   - Pencarian real-time dan tombol satu-klik salin cuplikan penggunaan.

4. **Katalog 24+ Perintah Slash**:
   - Ringkasan cepat seluruh perintah slash bawaan Ruko (`/plan`, `/yolo`, `/undo`, `/ctx`, `/profile`, `/settings`, dll.).

5. **Visual LCS Diff Viewer**:
   - Demonstrasi visual diff berwarna hijau (+) dan merah (-) ala Git untuk menginspeksi mutasi berkas sebelum ditulis ke disk.

6. **Responsif & Mobile/Termux Ready**:
   - Tampilan adaptif sempurna untuk Desktop, Tablet, hingga smartphone (termasuk layout sempit ala Termux 40-kolom).

---

## 🚀 Menjalankan Secara Lokal

### Menggunakan Server Bawaan (Zero Dependencies)

```bash
cd ruko-landing-page
node serve.js
```

Buka peramban Anda di: **`http://localhost:3000`**

### Atau Langsung Buka File `index.html`

Anda juga dapat langsung mengeklik ganda `index.html` di file manager mana pun atau membukanya di browser:

```bash
start index.html
```

---

## 🌐 Panduan Publikasi / Deployment

### Opsi 1: GitHub Pages (Otomatis dari Repo)
1. Salin berkas ke folder `docs/` di repositori GitHub Anda (sudah disalin otomatis ke `Ruko-agent/docs`).
2. Di repositori GitHub: buka tab **Settings** → **Pages**.
3. Pada bagian **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main` / Folder: `/docs`
4. Klik **Save**. Situs akan aktif di `https://iky969.github.io/Ruko-agent/`!

### Opsi 2: Vercel / Netlify
1. Tarik folder `ruko-landing-page` ke dashboard Vercel atau Netlify.
2. Tidak memerlukan konfigurasi build (`Build command: none`, `Output directory: .`).

---

## 📄 Lisensi

MIT License — dibuat untuk ekosistem [Ruko](https://github.com/Iky969/Ruko-agent).
