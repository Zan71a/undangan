// ====== CONFIG ======
const CONFIG = {
  targetDate: '2025-09-13T08:00:00+07:00',
};

// ====== COUNTDOWN ======
const target = new Date(CONFIG.targetDate).getTime();
const fmt = (n) => String(n).padStart(2, '0');
function renderCountdownTo(el) {
  if (!el) return;
  const now = Date.now();
  let s = Math.max(0, Math.floor((target - now) / 1000));
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600);  s %= 3600;
  const m = Math.floor(s / 60);    s %= 60;
  el.innerHTML = [
    ['Hari', d], ['Jam', h], ['Menit', m], ['Detik', s],
  ].map(([l, n]) => `
    <div class="cd-box">
      <div class="cd-num">${fmt(n)}</div>
      <div class="cd-label">${l}</div>
    </div>
  `).join('');
}
const cd1 = document.getElementById('countdown');
const cd2 = document.getElementById('countdown2');
function tick(){ renderCountdownTo(cd1); renderCountdownTo(cd2); }
tick(); setInterval(tick, 1000);

// ====== MUSIC + GATE (support #cover / #gate & aman tanpa mp3) ======
const audio       = document.getElementById('bgm');
const gate        = document.getElementById('gate') || document.getElementById('cover');
const openInvite  = document.getElementById('openInvite');
const toggleBtn   = document.getElementById('toggleMusic');
const iconPlay    = document.getElementById('iconPlay');
const iconPause   = document.getElementById('iconPause');
const vol         = document.getElementById('vol');
let isPlaying = false;

function setIcons(){
  if(!iconPlay || !iconPause) return;
  if(isPlaying){ iconPlay.classList.add('hide'); iconPause.classList.remove('hide'); }
  else         { iconPlay.classList.remove('hide'); iconPause.classList.add('hide'); }
}
async function playMusic(){
  if(!audio) return;
  try{
    const hasSrc = !!(audio.querySelector('source')?.src || audio.src);
    if(!hasSrc) return;
    await audio.play();
    isPlaying=true; setIcons();
  }catch(e){}
}
function pauseMusic(){ if(!audio) return; try{audio.pause()}catch{} isPlaying=false; setIcons(); }

if (vol && audio){ audio.volume = parseFloat(vol.value||'0.7'); vol.addEventListener('input', ()=>{ audio.volume = parseFloat(vol.value||'0.7'); }); }
if (toggleBtn){ toggleBtn.addEventListener('click', async ()=>{ isPlaying?pauseMusic():await playMusic(); }); }

function closeGate(){ if(!gate) return; gate.classList.add('hide'); gate.style.display='none'; gate.style.pointerEvents='none'; }
if (openInvite){
  openInvite.addEventListener('click', async (e)=>{
    e.preventDefault(); await playMusic(); closeGate();
    const home = document.getElementById('home'); if(home) home.scrollIntoView({behavior:'smooth', block:'start'});
  });
}
if (gate){
  gate.addEventListener('click', (e)=>{
    const card = gate.querySelector('.gate-card');
    if(card && card.contains(e.target)) return;
    closeGate();
  });
}

// ====== COPY BUTTONS ======
document.querySelectorAll('.copy-btn').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    const val = btn.dataset.copy || '';
    try{
      await navigator.clipboard.writeText(val);
      const old = btn.textContent; btn.textContent = 'Tersalin ✓';
      setTimeout(()=>btn.textContent = old, 1200);
    }catch{ alert('Gagal menyalin. Salin manual ya.'); }
  });
});

// ====== GATE PARAMS (?to=) + default dari Admin ======
(function applyGuestParams(){
  const p = new URLSearchParams(location.search);
  const nameParam = p.get('to') || p.get('guest') || '';
  const def = localStorage.getItem('WED_GUEST_DEFAULT') || '';
  const name = nameParam || def;
  const el = document.getElementById('guestName');
  if (el && name) el.textContent = decodeURIComponent(name);
})();

// ====== RSVP / GUESTBOOK ======
const RSVP_KEY = 'rsvp_list_v1';
const frm = document.getElementById('formRSVP');
function loadRSVPs(){ try{return JSON.parse(localStorage.getItem(RSVP_KEY)||'[]')}catch{return[]} }
function saveRSVPs(list){ localStorage.setItem(RSVP_KEY, JSON.stringify(list)); }
function initialsOf(name='?'){ const parts = name.trim().split(/\\s+/).slice(0,2); return parts.map(s=>s[0]?.toUpperCase()||'').join('') || '?'; }
function renderGuestbook(){
  const list = loadRSVPs().sort((a,b)=>b.time-a.time);
  const ul = document.getElementById('guestList'); const empty = document.getElementById('emptyGuest');
  if(!ul || !empty) return;
  ul.innerHTML = list.map(item=>`
    <li class="guest-item">
      <div class="avatar">${initialsOf(item.nama)}</div>
      <div>
        <div class="guest-meta">
          <span class="guest-name">${item.nama}</span>
          ${item.grup ? `<span class="guest-group">· ${item.grup}</span>` : ''}
          <span class="badge">${item.status}</span>
        </div>
        ${item.pesan ? `<div class="guest-msg">${item.pesan}</div>` : ''}
      </div>
    </li>`).join('');
  empty.style.display = list.length ? 'none' : 'block';
}
if(frm){
  frm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(frm);
    const data = {
      nama: (fd.get('nama')||'').toString().trim(),
      grup: (fd.get('grup')||'').toString().trim(),
      kode: (fd.get('kode')||'+62').toString(),
      wa:   (fd.get('wa')||'').toString().replace(/\\D/g,''),
      status:(fd.get('status')||'Hadir').toString(),
      pesan:(fd.get('pesan')||'').toString().trim(),
      time: Date.now(),
    };
    if(!data.nama){ alert('Nama wajib diisi'); return; }
    const list = loadRSVPs(); list.push(data); saveRSVPs(list);
    frm.reset(); renderGuestbook();
  });
  renderGuestbook();
}

// ====== LIGHTBOX ======
(function enableLightbox(){
  const lb = document.getElementById('lightbox'); if(!lb) return;
  const imgIn = lb.querySelector('img');
  document.querySelectorAll('#galeri .gallery img').forEach(img=>{
    img.style.cursor='zoom-in';
    img.addEventListener('click', ()=>{ if(imgIn){ imgIn.src = img.src; lb.showModal(); } });
  });
  lb.addEventListener('click', (e)=>{ if(e.target===lb) lb.close(); });
})();

// ====== SMOOTH SCROLL ======
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href'); if(!id || id==='#') return;
    const el = document.querySelector(id); if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
  });
});
