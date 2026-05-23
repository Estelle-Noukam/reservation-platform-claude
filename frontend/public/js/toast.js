const ICONS = { success: '✓', error: '✕', info: 'ℹ' };

function toast(msg, type = 'info', duration = 3500) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${ICONS[type]||''}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = '0.3s ease';
    setTimeout(() => el.remove(), 350);
  }, duration);
}

function showErrors(errors, bannerId) {
  const banner = document.getElementById(bannerId);
  if (!banner) return;
  if (!errors || !errors.length) { banner.classList.remove('show'); return; }
  banner.innerHTML = errors.map(e => e.msg || e.message || String(e)).join('<br>');
  banner.classList.add('show');
}
