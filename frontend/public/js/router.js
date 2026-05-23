const Router = {
  current: null,
  routes: {
    login: renderLogin,
    register: renderRegister,
    home: renderHome,
    resources: renderResources,
    history: renderHistory,
    admin: renderAdmin,
  },
  async go(page) {
    Router.current = page;
    window.location.hash = page;
    await Router.render(page);
  },
  async render(page) {
    const fn = Router.routes[page];
    if (fn) await fn();
  },
  async init() {
    document.getElementById('app').innerHTML = `<div class="loading-page"><div class="spinner"></div></div>`;
    await Auth.load();
    const hash = window.location.hash.replace('#','');
    const pub = ['login','register'];
    const priv = ['home','resources','history','admin'];
    if (!Auth.current) Router.go(pub.includes(hash)?hash:'login');
    else Router.go(priv.includes(hash)?hash:'home');
  }
};

window.addEventListener('hashchange', () => {
  const page = window.location.hash.replace('#','');
  Router.current = page;
  if (!Auth.current && !['login','register'].includes(page)) Router.go('login');
  else if (Auth.current && ['login','register'].includes(page)) Router.go('home');
  else Router.render(page);
});

Router.init();
