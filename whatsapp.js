(function() {
  var btn = document.createElement('a');
  btn.href = 'https://wa.me/905441021414';
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'WhatsApp');

  btn.innerHTML =
    '<img src="pngler/whatsapp.png" alt="WhatsApp" style="width:28px;height:28px;display:block;object-fit:contain" />' +
    '<span style="font-size:14px;font-weight:600;color:white;white-space:nowrap">WhatsApp</span>';

  btn.style.cssText =
    'position:fixed;' +
    'bottom:24px;' +
    'right:24px;' +
    'display:flex;' +
    'align-items:center;' +
    'gap:8px;' +
    'background:#25D366;' +
    'border-radius:50px;' +
    'padding:12px 20px 12px 14px;' +
    'box-shadow:0 4px 20px rgba(37,211,102,0.45);' +
    'z-index:99999;' +
    'text-decoration:none;' +
    'transition:transform 0.2s,box-shadow 0.2s;';

  btn.addEventListener('mouseenter', function() {
    btn.style.transform = 'scale(1.05)';
    btn.style.boxShadow = '0 6px 28px rgba(37,211,102,0.6)';
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)';
  });

  document.body.appendChild(btn);
})();
