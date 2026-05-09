(function () {
  /* ── CSS ─────────────────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = `
    .nav {
      display: flex; align-items: center; padding: 1rem 2rem;
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: rgba(10,22,40,0.96);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 1px 0 rgba(10,22,40,0.96);
    }
    .nav-logo {
      font-size: 20px; font-weight: 600; letter-spacing: 1px;
      color: #f0c040; white-space: nowrap; flex: 0 0 auto; cursor: pointer;
      text-decoration: none;
    }
    .nav-links {
      display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0;
      position: absolute; left: 50%; transform: translateX(-50%);
      pointer-events: none;
    }
    .nav-links li { pointer-events: all; list-style: none; }
    .nav-links a {
      color: rgba(255,255,255,0.85); text-decoration: none;
      font-size: 15px; font-weight: 500; pointer-events: all;
    }
    .nav-links a:hover, .nav-links a.active { color: #f0c040; }
    .hamburger {
      display: none; flex-direction: column; gap: 6px; cursor: pointer;
      background: none; border: none; padding: 4px; margin-left: auto; flex-shrink: 0;
    }
    .hamburger span {
      display: block; width: 22px; height: 2px;
      background: white; border-radius: 2px; transition: all 0.3s;
    }
    .hamburger.open span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
    .mobile-menu {
      position: fixed; top: var(--nav-h, 62px); left: 0; right: 0;
      background: #0a1628; z-index: 9999;
      border-top: 0.5px solid rgba(255,255,255,0.1);
      overflow: hidden; max-height: 0;
      transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1);
      display: none;
    }
    .mobile-menu.open { display: block; max-height: 400px; }
    .mobile-menu a {
      display: block; padding: 14px 2rem;
      color: rgba(255,255,255,0.85); text-decoration: none;
      font-size: 15px; border-bottom: 0.5px solid rgba(255,255,255,0.07);
    }
    .mobile-menu a:hover { color: #f0c040; background: rgba(255,255,255,0.04); }
    @media(max-width:1150px) {
      .hamburger { display: flex !important; }
      .nav-links  { display: none !important; }
    }
    @media(max-width:600px) {
      .nav { padding: 0.85rem 1rem; }
      .nav-logo { font-size: 17px; letter-spacing: 0.4px; }
    }
    @media(max-width:419.98px) {
      .nav { padding: 0.75rem 0.75rem; }
      .nav-logo { font-size: 15px; letter-spacing: 0.3px; }
    }
  `;
  document.head.appendChild(style);

  /* ── Sayfa bazlı link ayarı ─────────────────────────────────────────────── */
  // index.html'de Our Fleet anchor link, diğer sayfalarda index.html#vehicles'e gider
  var isHome = (
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname.endsWith('/')
  );

  var fleetHref   = isHome ? '#vehicles'       : 'index.html#vehicles';
  var fleetOnclick= isHome ? 'smoothTo(event,"vehicles")' : '';
  var homeHref    = isHome ? '#hero'            : 'index.html';
  var homeOnclick = isHome ? 'smoothTo(event,"hero")' : '';

  /* ── HTML inject ─────────────────────────────────────────────────────────── */
  var navHTML = `
    <nav class="nav" id="mainNav">
      <a class="nav-logo" href="index.html">AIRPORTS TRANSFER TURKEY</a>
      <ul class="nav-links">
        <li><a href="${homeHref}" ${homeOnclick ? 'onclick="'+homeOnclick+'"' : ''}>Home</a></li>
        <li><a href="about-us.html">About Us</a></li>
        <li><a href="${fleetHref}" ${fleetOnclick ? 'onclick="'+fleetOnclick+'"' : ''}>Our Fleet</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="drivers-team.html">Our Team</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
      <button class="hamburger" id="hamburger" onclick="toggleNavMenu()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <div class="mobile-menu" id="mobileMenu" style="overflow:hidden;max-height:0;transition:max-height 0.4s cubic-bezier(0.4,0,0.2,1);display:none;">
      <a href="${homeHref}" ${homeOnclick ? 'onclick="mobileNavTo(event,\'hero\')"' : ''}>Home</a>
      <a href="about-us.html">About Us</a>
      <a href="${fleetHref}" ${fleetOnclick ? 'onclick="mobileNavTo(event,\'vehicles\')"' : ''}>Our Fleet</a>
      <a href="blog.html">Blog</a>
      <a href="drivers-team.html">Our Team</a>
      <a href="contact.html">Contact</a>
    </div>
  `;

  // Body'nin en başına ekle
  document.body.insertAdjacentHTML('afterbegin', navHTML);

  /* ── Aktif link vurgusu ──────────────────────────────────────────────────── */
  var currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    var hrefFile = href.split('/').pop().split('#')[0] || 'index.html';
    if (hrefFile === currentFile) a.classList.add('active');
  });

  /* ── JS Fonksiyonlar ─────────────────────────────────────────────────────── */
  window.toggleNavMenu = function () {
    var btn  = document.getElementById('hamburger');
    var menu = document.getElementById('mobileMenu');
    var nav  = document.getElementById('mainNav');
    document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    btn.classList.toggle('open');
    if (menu.dataset.open === 'true') {
      menu.style.maxHeight = '0';
      menu.dataset.open = 'false';
      setTimeout(function () { menu.style.display = 'none'; }, 300);
    } else {
      menu.style.display = 'block';
      requestAnimationFrame(function () {
        menu.style.maxHeight = '400px';
        menu.dataset.open = 'true';
      });
    }
  };

  window.mobileNavTo = function (e, id) {
    e.preventDefault();
    var btn  = document.getElementById('hamburger');
    var menu = document.getElementById('mobileMenu');
    btn.classList.remove('open');
    menu.style.maxHeight = '0';
    menu.dataset.open = 'false';
    setTimeout(function () {
      menu.style.display = 'none';
      if (id === 'hero') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  };

  // Body'e nav yüksekliği kadar padding ekle (hero olan sayfalar hariç)
  function setBodyPadding() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    var hasHero = document.getElementById('hero') || document.querySelector('.hero');
    if (!hasHero) {
      document.body.style.paddingTop = nav.offsetHeight + 'px';
    }
  }
  setBodyPadding();
  window.addEventListener('resize', setBodyPadding);

  // Dışarı tıklayınca menüyü kapat
  document.addEventListener('click', function (e) {
    var menu = document.getElementById('mobileMenu');
    var btn  = document.getElementById('hamburger');
    if (!menu || !btn) return;
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      if (menu.dataset.open === 'true') {
        btn.classList.remove('open');
        menu.style.maxHeight = '0';
        menu.dataset.open = 'false';
        setTimeout(function () { menu.style.display = 'none'; }, 300);
      }
    }
  });

  // ── Scroll davranışı ──────────────────────────────────────────────────────
  // Başta görünür
  // Aşağı kaydırınca gizlenir
  // 500px geçtikten sonra yukarı kaydırınca tekrar çıkar
  // Tekrar en üste gelince görünür kalır
  var nav = document.getElementById('mainNav');
  var lastScrollY = window.scrollY || window.pageYOffset;
  var navHidden = false;

  nav.style.transition = 'none';
  nav.style.transform = 'translateY(0)';

  window.addEventListener('scroll', function () {
    var currentY = window.scrollY || window.pageYOffset;
    var scrollingDown = currentY > lastScrollY;

    if (currentY <= 0) {
      // En tepede — her zaman göster
      navHidden = false;
      nav.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
      nav.style.transform = 'translateY(0)';
    } else if (scrollingDown && currentY < 500) {
      // 0-500px arası aşağı gidince gizle
      if (!navHidden) {
        navHidden = true;
        nav.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
        nav.style.transform = 'translateY(-100%)';
      }
    } else if (currentY >= 500) {
      // 500px geçince her zaman göster
      if (navHidden) {
        navHidden = false;
        nav.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
        nav.style.transform = 'translateY(0)';
      }
    }

    lastScrollY = currentY;

    // Mobile menu açıksa scroll'da kapat
    var menu = document.getElementById('mobileMenu');
    var btn  = document.getElementById('hamburger');
    if (menu && menu.dataset.open === 'true') {
      btn.classList.remove('open');
      menu.style.maxHeight = '0';
      menu.dataset.open = 'false';
      setTimeout(function () { menu.style.display = 'none'; }, 300);
    }
  }, { passive: true });

})();
