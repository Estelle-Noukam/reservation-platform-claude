const CATEGORY_ICONS = {
  'salle':'🏢', 'équipement':'💻', 'véhicule':'🚗',
  'service':'🎙️', 'espace':'🏃', 'default':'📦'
};

function getCategoryIcon(cat) {
  return CATEGORY_ICONS[cat] || CATEGORY_ICONS.default;
}

function renderNavbar() {
  const u = Auth.current;
  if (!u) return '';
  return `
  <nav class="navbar">
    <div class="navbar-brand" onclick="Router.go('home')">
      <div class="brand-icon">📅</div>
      ReservaSpace
    </div>
    <div class="navbar-links">
      <button class="nav-link ${Router.current==='home'?'active':''}" onclick="Router.go('home')">Accueil</button>
      <button class="nav-link ${Router.current==='resources'?'active':''}" onclick="Router.go('resources')">Ressources</button>
      <button class="nav-link ${Router.current==='history'?'active':''}" onclick="Router.go('history')">Mes réservations</button>
      ${Auth.isAdmin()?`<button class="nav-link ${Router.current==='admin'?'active':''}" onclick="Router.go('admin')">Admin</button>`:''}
    </div>
    <div class="navbar-right">
      <span class="badge badge-${u.role}">${u.role}</span>
      <span style="font-size:0.85rem;color:var(--text-dim);font-family:var(--mono)">${esc(u.username)}</span>
      <button class="nav-link danger" onclick="doLogout()">Déconnexion</button>
    </div>
  </nav>`;
}

async function doLogout() {
  await Auth.logout();
  Router.go('login');
  toast('Déconnexion réussie', 'info');
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
}

function fmtDateTime(d) {
  return new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function fmtDuration(start, end) {
  const ms = new Date(end) - new Date(start);
  const h = Math.floor(ms/3600000);
  const m = Math.floor((ms%3600000)/60000);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}min`;
}

function avatarInitials(u) {
  const fn = (u.first_name||'').trim();
  const ln = (u.last_name||'').trim();
  if (fn && ln) return (fn[0]+ln[0]).toUpperCase();
  return (u.username||'?').substring(0,2).toUpperCase();
}

function renderModal({title, body, footer}) {
  return `
  <div class="modal-overlay" id="modal-overlay" onclick="closeModalOutside(event)">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer?`<div class="modal-footer">${footer}</div>`:''}
    </div>
  </div>`;
}

function openModal(html) {
  closeModal();
  const el = document.createElement('div');
  el.id = 'modal-root';
  el.innerHTML = html;
  document.body.appendChild(el);
}

function closeModal() {
  const el = document.getElementById('modal-root');
  if (el) el.remove();
}

function closeModalOutside(e) {
  if (e.target.id === 'modal-overlay') closeModal();
}

function getField(id) { return (document.getElementById(id)||{}).value||''; }

function statusBadge(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}

function toLocalDatetimeValue(d) {
  const dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0,16);
}

function minDatetime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 5);
  return now.toISOString().slice(0,16);
}
