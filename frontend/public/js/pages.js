/* ===== LOGIN ===== */
async function renderLogin() {
  document.getElementById('app').innerHTML = `
  <div class="page auth-page">
    <div class="auth-left">
      <div class="auth-brand-large">ReservaSpace</div>
      <p class="auth-tagline">Gérez vos réservations de salles, équipements et services en toute simplicité.</p>
      <div class="auth-features">
        <div class="auth-feature"><div class="auth-feature-icon">🏢</div>Salles de réunion</div>
        <div class="auth-feature"><div class="auth-feature-icon">💻</div>Équipements informatiques</div>
        <div class="auth-feature"><div class="auth-feature-icon">🚗</div>Véhicules de service</div>
        <div class="auth-feature"><div class="auth-feature-icon">📅</div>Historique complet</div>
      </div>
    </div>
    <div class="auth-right">
      <h2>Connexion</h2>
      <p class="subtitle">Accédez à votre espace de réservation</p>
      <div class="error-banner" id="login-error"></div>
      <div class="form-group"><label>E-mail</label><input type="email" id="login-email" placeholder="vous@exemple.fr" /></div>
      <div class="form-group"><label>Mot de passe</label><input type="password" id="login-password" placeholder="••••••••" /></div>
      <button class="btn btn-primary btn-full mt-2" onclick="submitLogin()">Se connecter</button>
      <hr class="divider">
      <p class="text-center text-muted" style="font-size:0.85rem">Pas de compte ? <a href="#" onclick="Router.go('register')">S'inscrire</a></p>
      <p class="text-center" style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;font-family:var(--mono)">admin@example.com / Admin1234!</p>
    </div>
  </div>`;
  document.getElementById('login-password').addEventListener('keydown', e => { if(e.key==='Enter') submitLogin(); });
}

async function submitLogin() {
  try {
    await Auth.login(document.getElementById('login-email').value.trim(), document.getElementById('login-password').value);
    Router.go('home');
    toast('Bienvenue ' + Auth.current.username + ' !', 'success');
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur de connexion'}], 'login-error');
  }
}

/* ===== REGISTER ===== */
async function renderRegister() {
  document.getElementById('app').innerHTML = `
  <div class="page auth-page">
    <div class="auth-left">
      <div class="auth-brand-large">ReservaSpace</div>
      <p class="auth-tagline">Créez votre compte et commencez à réserver en quelques secondes.</p>
    </div>
    <div class="auth-right">
      <h2>Inscription</h2>
      <p class="subtitle">Rejoignez la plateforme</p>
      <div class="error-banner" id="register-error"></div>
      <div class="form-row">
        <div class="form-group"><label>Prénom</label><input type="text" id="r-first_name" placeholder="Marie" /></div>
        <div class="form-group"><label>Nom</label><input type="text" id="r-last_name" placeholder="Dupont" /></div>
      </div>
      <div class="form-group"><label>Nom d'utilisateur *</label><input type="text" id="r-username" placeholder="marie_dupont" /></div>
      <div class="form-group"><label>E-mail *</label><input type="email" id="r-email" placeholder="vous@exemple.fr" /></div>
      <div class="form-group"><label>Mot de passe *</label><input type="password" id="r-password" placeholder="Min. 8 car., 1 maj., 1 chiffre" /></div>
      <div class="form-group"><label>Confirmation *</label><input type="password" id="r-confirm" placeholder="Répéter" /></div>
      <button class="btn btn-primary btn-full mt-2" onclick="submitRegister()">Créer mon compte</button>
      <hr class="divider">
      <p class="text-center text-muted" style="font-size:0.85rem">Déjà inscrit ? <a href="#" onclick="Router.go('login')">Se connecter</a></p>
    </div>
  </div>`;
}

async function submitRegister() {
  try {
    await Auth.register({
      first_name: getField('r-first_name'), last_name: getField('r-last_name'),
      username: getField('r-username'), email: getField('r-email'),
      password: getField('r-password'), confirm_password: getField('r-confirm'),
    });
    Router.go('home');
    toast('Compte créé avec succès !', 'success');
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}], 'register-error');
  }
}

/* ===== HOME ===== */
async function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  let myRes = [], stats = null;
  try {
    myRes = await api.get('/api/reservations');
    if (Auth.isAdmin()) stats = await api.get('/api/reservations/stats');
  } catch {}

  const upcoming = myRes.filter(r => r.status === 'confirmed' && new Date(r.start_time) > new Date());
  const today = myRes.filter(r => {
    const d = new Date(r.start_time);
    const now = new Date();
    return r.status === 'confirmed' && d.toDateString() === now.toDateString();
  });

  app.innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="container">
      <div class="page-header">
        <div>
          <h2>Bonjour, ${esc(Auth.current.username)} 👋</h2>
          <div class="sub">${new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        </div>
        <button class="btn btn-primary" onclick="Router.go('resources')">+ Nouvelle réservation</button>
      </div>

      ${Auth.isAdmin() && stats ? `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${stats.total}</div><div class="stat-label">Réservations total</div></div>
        <div class="stat-card green"><div class="stat-value">${stats.confirmed}</div><div class="stat-label">Confirmées</div></div>
        <div class="stat-card orange"><div class="stat-value">${stats.cancelled}</div><div class="stat-label">Annulées</div></div>
        <div class="stat-card purple"><div class="stat-value">${stats.pending}</div><div class="stat-label">En attente</div></div>
      </div>` : `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${myRes.length}</div><div class="stat-label">Mes réservations</div></div>
        <div class="stat-card green"><div class="stat-value">${upcoming.length}</div><div class="stat-label">À venir</div></div>
        <div class="stat-card orange"><div class="stat-value">${today.length}</div><div class="stat-label">Aujourd'hui</div></div>
      </div>`}

      <div class="card mb-2">
        <div class="card-header">
          <div class="card-header-title">Prochaines réservations</div>
          <button class="btn btn-ghost btn-sm" onclick="Router.go('history')">Voir tout →</button>
        </div>
        <div class="card-body">
          ${upcoming.length === 0 ? `
          <div class="empty-state" style="padding:2rem">
            <div class="icon">📅</div>
            <h3>Aucune réservation à venir</h3>
            <p style="margin-bottom:1rem">Réservez une ressource dès maintenant</p>
            <button class="btn btn-primary btn-sm" onclick="Router.go('resources')">Parcourir les ressources</button>
          </div>` : `
          <div class="reservation-list">
            ${upcoming.slice(0,5).map(r => renderReservationItem(r)).join('')}
          </div>`}
        </div>
      </div>
    </div>
  </div>`;
}

function renderReservationItem(r) {
  const isFuture = new Date(r.start_time) > new Date();
  return `
  <div class="reservation-item ${r.status}">
    <div class="res-icon">${getCategoryIcon(r.category)}</div>
    <div class="res-info">
      <div class="res-name">${esc(r.resource_name)}</div>
      <div class="res-time">${fmtDateTime(r.start_time)} → ${fmtDateTime(r.end_time)} · ${fmtDuration(r.start_time, r.end_time)}</div>
      ${r.location?`<div class="res-time">📍 ${esc(r.location)}</div>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      ${statusBadge(r.status)}
      ${r.status==='confirmed' && isFuture ? `<button class="btn btn-danger btn-sm" onclick="cancelReservation(${r.id})">Annuler</button>`:''}
    </div>
  </div>`;
}

/* ===== RESOURCES ===== */
let _resources = [];
let _activeFilter = 'all';

async function renderResources() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  try { _resources = await api.get('/api/resources'); } catch {}

  const categories = ['all', ...new Set(_resources.map(r => r.category))];
  renderResourcesView(categories);
}

function renderResourcesView(categories) {
  const filtered = _activeFilter === 'all'
    ? _resources
    : _resources.filter(r => r.category === _activeFilter);

  document.getElementById('app').innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="container">
      <div class="page-header">
        <div><h2>Ressources disponibles</h2><div class="sub">${_resources.length} ressource(s) au total</div></div>
        ${Auth.isAdmin()?`<button class="btn btn-primary" onclick="openResourceModal()">+ Ajouter</button>`:''}
      </div>
      <div class="filters">
        ${categories.map(c=>`
        <button class="filter-btn ${_activeFilter===c?'active':''}"
          onclick="_activeFilter='${c}';renderResourcesView(${JSON.stringify(categories)})">
          ${c==='all'?'Toutes':c.charAt(0).toUpperCase()+c.slice(1)}
        </button>`).join('')}
      </div>
      ${filtered.length===0?`<div class="empty-state"><div class="icon">🔍</div><h3>Aucune ressource</h3></div>`:`
      <div class="resources-grid">
        ${filtered.map(r=>`
        <div class="resource-card ${!r.available?'unavailable':''}" onclick="${r.available?`openBookingModal(${r.id})`:''}">
          <div class="resource-status">${r.available?'<span class="badge badge-confirmed">Disponible</span>':'<span class="badge badge-cancelled">Indisponible</span>'}</div>
          <div class="resource-icon">${getCategoryIcon(r.category)}</div>
          <div class="resource-name">${esc(r.name)}</div>
          <div class="resource-desc">${esc(r.description||'')}</div>
          <div class="resource-meta">
            <span class="resource-tag">${esc(r.category)}</span>
            ${r.capacity?`<span class="resource-tag">👥 ${r.capacity}</span>`:''}
            ${r.location?`<span class="resource-tag">📍 ${esc(r.location)}</span>`:''}
          </div>
          ${Auth.isAdmin()?`
          <div style="margin-top:1rem;display:flex;gap:6px" onclick="event.stopPropagation()">
            <button class="btn btn-ghost btn-sm" onclick="openResourceModal(${r.id})">Éditer</button>
            <button class="btn btn-danger btn-sm" onclick="deleteResource(${r.id})">Suppr.</button>
          </div>`:''}
        </div>`).join('')}
      </div>`}
    </div>
  </div>`;
}

async function openBookingModal(resourceId) {
  const r = _resources.find(x => x.id === resourceId);
  if (!r) return;
  const min = minDatetime();
  openModal(renderModal({
    title: `Réserver — ${esc(r.name)}`,
    body: `
    <div style="background:var(--bg);border-radius:var(--radius);padding:1rem;margin-bottom:1.5rem">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:2rem">${getCategoryIcon(r.category)}</div>
        <div>
          <div style="font-weight:700">${esc(r.name)}</div>
          <div style="font-size:0.82rem;color:var(--text-muted)">${r.location?`📍 ${esc(r.location)}`:''} ${r.capacity?`· 👥 ${r.capacity}`:''}</div>
        </div>
      </div>
    </div>
    <div class="error-banner" id="booking-error"></div>
    <div class="form-group">
      <label>Date et heure de début *</label>
      <input type="datetime-local" id="b-start" min="${min}" />
    </div>
    <div class="form-group">
      <label>Date et heure de fin *</label>
      <input type="datetime-local" id="b-end" min="${min}" />
    </div>
    <div class="form-group">
      <label>Notes (optionnel)</label>
      <textarea id="b-notes" placeholder="Objet de la réservation, participants..."></textarea>
    </div>`,
    footer: `
    <button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
    <button class="btn btn-primary" onclick="submitBooking(${resourceId})">Confirmer la réservation</button>`,
  }));
}

async function submitBooking(resourceId) {
  const start = getField('b-start');
  const end = getField('b-end');
  const notes = getField('b-notes');
  if (!start || !end) {
    showErrors([{msg:'Veuillez renseigner les dates'}], 'booking-error');
    return;
  }
  try {
    await api.post('/api/reservations', {
      resource_id: resourceId,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      notes,
    });
    closeModal();
    toast('Réservation confirmée !', 'success');
    Router.go('history');
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}], 'booking-error');
  }
}

function openResourceModal(id) {
  const r = id ? _resources.find(x => x.id === id) : null;
  openModal(renderModal({
    title: r ? 'Modifier la ressource' : 'Ajouter une ressource',
    body: `
    <div class="error-banner" id="res-error"></div>
    <div class="form-group"><label>Nom *</label><input type="text" id="res-name" value="${esc(r?.name||'')}" placeholder="Salle Horizon" /></div>
    <div class="form-row">
      <div class="form-group"><label>Catégorie *</label>
        <select id="res-category">
          ${['salle','équipement','véhicule','service','espace'].map(c=>
            `<option value="${c}" ${r?.category===c?'selected':''}>${c}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group"><label>Capacité</label><input type="number" id="res-capacity" value="${r?.capacity||''}" placeholder="10" min="1" /></div>
    </div>
    <div class="form-group"><label>Localisation</label><input type="text" id="res-location" value="${esc(r?.location||'')}" placeholder="Bâtiment A - RDC" /></div>
    <div class="form-group"><label>Description</label><textarea id="res-description">${esc(r?.description||'')}</textarea></div>
    <div class="form-group"><label>Disponible</label>
      <select id="res-available">
        <option value="true" ${!r||r.available?'selected':''}>Oui</option>
        <option value="false" ${r&&!r.available?'selected':''}>Non</option>
      </select>
    </div>`,
    footer: `
    <button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
    <button class="btn btn-primary" onclick="submitResource(${id||'null'})">${r?'Enregistrer':'Créer'}</button>`,
  }));
}

async function submitResource(id) {
  const payload = {
    name: getField('res-name'),
    category: getField('res-category'),
    capacity: getField('res-capacity') ? parseInt(getField('res-capacity')) : null,
    location: getField('res-location'),
    description: getField('res-description'),
    available: getField('res-available') === 'true',
  };
  try {
    if (id) {
      const updated = await api.put(`/api/resources/${id}`, payload);
      const idx = _resources.findIndex(r => r.id === id);
      if (idx !== -1) _resources[idx] = updated;
      toast('Ressource mise à jour', 'success');
    } else {
      const created = await api.post('/api/resources', payload);
      _resources.push(created);
      toast('Ressource créée', 'success');
    }
    closeModal();
    renderResourcesView([...(new Set(['all', ..._resources.map(r=>r.category)]))]);
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}], 'res-error');
  }
}

async function deleteResource(id) {
  if (!confirm('Supprimer cette ressource et toutes ses réservations ?')) return;
  try {
    await api.delete(`/api/resources/${id}`);
    _resources = _resources.filter(r => r.id !== id);
    toast('Ressource supprimée', 'info');
    renderResourcesView([...(new Set(['all', ..._resources.map(r=>r.category)]))]);
  } catch(err) {
    toast(err.data?.error||'Erreur', 'error');
  }
}

/* ===== HISTORY ===== */
let _myReservations = [];

async function renderHistory() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  try { _myReservations = await api.get('/api/reservations'); } catch {}
  renderHistoryView('all');
}

function renderHistoryView(filter) {
  const filtered = filter === 'all'
    ? _myReservations
    : _myReservations.filter(r => r.status === filter);

  document.getElementById('app').innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="container">
      <div class="page-header">
        <div><h2>Mes réservations</h2><div class="sub">${_myReservations.length} réservation(s) au total</div></div>
        <button class="btn btn-primary" onclick="Router.go('resources')">+ Nouvelle réservation</button>
      </div>
      <div class="tabs">
        <button class="tab ${filter==='all'?'active':''}" onclick="renderHistoryView('all')">Toutes (${_myReservations.length})</button>
        <button class="tab ${filter==='confirmed'?'active':''}" onclick="renderHistoryView('confirmed')">Confirmées (${_myReservations.filter(r=>r.status==='confirmed').length})</button>
        <button class="tab ${filter==='cancelled'?'active':''}" onclick="renderHistoryView('cancelled')">Annulées (${_myReservations.filter(r=>r.status==='cancelled').length})</button>
      </div>
      ${filtered.length===0?`
      <div class="empty-state">
        <div class="icon">📋</div>
        <h3>Aucune réservation</h3>
        <p style="margin-bottom:1rem">Vous n'avez pas encore de réservation dans cette catégorie</p>
        <button class="btn btn-primary btn-sm" onclick="Router.go('resources')">Réserver maintenant</button>
      </div>`:`
      <div class="reservation-list">
        ${filtered.map(r => {
          const isFuture = new Date(r.start_time) > new Date();
          return `
          <div class="reservation-item ${r.status}">
            <div class="res-icon">${getCategoryIcon(r.category)}</div>
            <div class="res-info">
              <div class="res-name">${esc(r.resource_name)}</div>
              <div class="res-time">${fmtDateTime(r.start_time)} → ${fmtDateTime(r.end_time)}</div>
              <div class="res-time">⏱ ${fmtDuration(r.start_time, r.end_time)} ${r.location?`· 📍 ${esc(r.location)}`:''}</div>
              ${r.notes?`<div class="res-time">💬 ${esc(r.notes)}</div>`:''}
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
              ${statusBadge(r.status)}
              ${r.status==='confirmed' && isFuture?`<button class="btn btn-danger btn-sm" onclick="cancelReservation(${r.id})">Annuler</button>`:''}
            </div>
          </div>`;
        }).join('')}
      </div>`}
    </div>
  </div>`;
}

async function cancelReservation(id) {
  if (!confirm('Annuler cette réservation ?')) return;
  try {
    await api.patch(`/api/reservations/${id}/cancel`);
    toast('Réservation annulée', 'info');
    const idx = _myReservations.findIndex(r => r.id === id);
    if (idx !== -1) _myReservations[idx].status = 'cancelled';
    renderHistoryView('all');
  } catch(err) {
    toast(err.data?.error||'Erreur', 'error');
  }
}

/* ===== ADMIN ===== */
let _allReservations = [], _allUsers = [], _adminTab = 'reservations';

async function renderAdmin() {
  if (!Auth.isAdmin()) { Router.go('home'); return; }
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  try {
    [_allReservations, _allUsers] = await Promise.all([
      api.get('/api/reservations'),
      api.get('/api/users'),
    ]);
  } catch {}
  renderAdminView();
}

function renderAdminView(filter='') {
  const res = filter
    ? _allReservations.filter(r =>
        (r.username||'').toLowerCase().includes(filter) ||
        (r.resource_name||'').toLowerCase().includes(filter) ||
        (r.email||'').toLowerCase().includes(filter)
      )
    : _allReservations;

  document.getElementById('app').innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="container">
      <div class="page-header">
        <div><h2>Administration</h2><div class="sub">Gestion des réservations et utilisateurs</div></div>
      </div>
      <div class="tabs">
        <button class="tab ${_adminTab==='reservations'?'active':''}" onclick="_adminTab='reservations';renderAdminView()">Réservations (${_allReservations.length})</button>
        <button class="tab ${_adminTab==='users'?'active':''}" onclick="_adminTab='users';renderAdminView()">Utilisateurs (${_allUsers.length})</button>
      </div>

      ${_adminTab==='reservations'?`
      <div class="table-card">
        <div class="table-header">
          <div class="table-title">Toutes les réservations</div>
          <input class="search-input" type="search" placeholder="Rechercher…" oninput="renderAdminView(this.value.toLowerCase())" />
        </div>
        ${res.length===0?`<div class="empty-state"><div class="icon">📋</div><h3>Aucune réservation</h3></div>`:`
        <div style="overflow-x:auto">
        <table>
          <thead><tr><th>Utilisateur</th><th>Ressource</th><th>Début</th><th>Fin</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            ${res.map(r=>`
            <tr>
              <td><div class="avatar-cell">
                <div class="avatar">${(r.username||'?').substring(0,2).toUpperCase()}</div>
                <div><div style="font-weight:600">${esc(r.username)}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">${esc(r.email)}</div></div>
              </div></td>
              <td><div style="font-weight:600">${esc(r.resource_name)}</div>
              <div style="font-size:0.78rem;color:var(--text-muted)">${esc(r.category)}</div></td>
              <td class="td-mono">${fmtDateTime(r.start_time)}</td>
              <td class="td-mono">${fmtDateTime(r.end_time)}</td>
              <td>${statusBadge(r.status)}</td>
              <td><div class="actions-cell">
                ${r.status!=='confirmed'?`<button class="btn btn-success btn-sm" onclick="adminSetStatus(${r.id},'confirmed')">Confirmer</button>`:''}
                ${r.status!=='cancelled'?`<button class="btn btn-danger btn-sm" onclick="adminSetStatus(${r.id},'cancelled')">Annuler</button>`:''}
                <button class="btn btn-ghost btn-sm" onclick="adminDeleteRes(${r.id})">✕</button>
              </div></td>
            </tr>`).join('')}
          </tbody>
        </table>
        </div>`}
      </div>` : `
      <div class="table-card">
        <div class="table-header"><div class="table-title">Utilisateurs</div></div>
        <table>
          <thead><tr><th>Utilisateur</th><th>E-mail</th><th>Rôle</th><th>Inscription</th><th>Actions</th></tr></thead>
          <tbody>
            ${_allUsers.map(u=>`
            <tr>
              <td><div class="avatar-cell">
                <div class="avatar">${(u.username||'?').substring(0,2).toUpperCase()}</div>
                <div style="font-weight:600">${esc(u.username)}</div>
              </div></td>
              <td class="td-mono">${esc(u.email)}</td>
              <td><span class="badge badge-${u.role}">${u.role}</span></td>
              <td class="td-mono">${fmtDate(u.created_at)}</td>
              <td><div class="actions-cell">
                ${u.id!==Auth.current.id?`<button class="btn btn-danger btn-sm" onclick="adminDeleteUser(${u.id})">Suppr.</button>`:'<span class="text-muted" style="font-size:0.8rem">vous</span>'}
              </div></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>
  </div>`;
}

async function adminSetStatus(id, status) {
  try {
    await api.patch(`/api/reservations/${id}/status`, { status });
    const idx = _allReservations.findIndex(r => r.id === id);
    if (idx !== -1) _allReservations[idx].status = status;
    renderAdminView();
    toast('Statut mis à jour', 'success');
  } catch(err) { toast(err.data?.error||'Erreur', 'error'); }
}

async function adminDeleteRes(id) {
  if (!confirm('Supprimer définitivement cette réservation ?')) return;
  try {
    await api.delete(`/api/reservations/${id}`);
    _allReservations = _allReservations.filter(r => r.id !== id);
    renderAdminView();
    toast('Réservation supprimée', 'info');
  } catch(err) { toast(err.data?.error||'Erreur', 'error'); }
}

async function adminDeleteUser(id) {
  if (!confirm('Supprimer cet utilisateur et toutes ses réservations ?')) return;
  try {
    await api.delete(`/api/users/${id}`);
    _allUsers = _allUsers.filter(u => u.id !== id);
    renderAdminView();
    toast('Utilisateur supprimé', 'info');
  } catch(err) { toast(err.data?.error||'Erreur', 'error'); }
}
