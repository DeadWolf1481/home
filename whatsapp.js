// WhatsApp Floating Button — Airports Transfer Turkey
(function() {
  var btn = document.createElement('a');
  btn.href = 'https://wa.me/905441021414';
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'WhatsApp');
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30">
      <path fill="#fff" d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 9.9L4 44l10.4-2.7C17.1 43 20.5 44 24 44c11 0 20-9 20-20S35 4 24 4z"/>
      <path fill="#25D366" d="M24 6C14.1 6 6 14.1 6 24c0 3.5 1 6.8 2.7 9.6L6.2 41.8l8.4-2.2C17.2 41 20.5 42 24 42c9.9 0 18-8.1 18-18S33.9 6 24 6z"/>
      <path fill="#fff" d="M35.2 30.4c-.5-1.4-2.9-2.7-3.6-2.8-.7-.1-1.2-.2-1.7.5s-1.9 2.3-2.3 2.7c-.4.4-.8.5-1.5.2s-2.9-1-5.5-3.3c-2-1.8-3.4-4-3.8-4.7-.4-.7 0-1.1.3-1.4.3-.3.6-.8.9-1.2.3-.4.4-.7.6-1.1.2-.4.1-.8-.1-1.2-.2-.4-1.7-4-2.3-5.5-.6-1.4-1.3-1.2-1.7-1.2h-1.5c-.5 0-1.4.2-2.1 1s-2.8 2.7-2.8 6.6 2.9 7.6 3.3 8.2c.4.5 5.6 8.8 13.8 12.3 8.2 3.5 8.2 2.3 9.7 2.2 1.5-.1 4.8-1.9 5.5-3.8.7-1.9.7-3.5.5-3.9z"/>
    </svg>`;
  btn.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'right:24px',
    'width:58px',
    'height:58px',
    'background:#25D366',
    'border-radius:50%',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'box-shadow:0 4px 20px rgba(37,211,102,0.45)',
    'z-index:99999',
    'transition:transform 0.2s,box-shadow 0.2s',
    'text-decoration:none',
  ].join(';');

  btn.addEventListener('mouseenter', function() {
    btn.style.transform = 'scale(1.12)';
    btn.style.boxShadow = '0 6px 28px rgba(37,211,102,0.6)';
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)';
  });

  document.body.appendChild(btn);
})();
