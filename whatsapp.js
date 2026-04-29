(function() {
  var btn = document.createElement('a');
  btn.href = 'https://wa.me/905441021414';
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'WhatsApp');

  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="26" height="26" style="display:block;flex-shrink:0;fill:white">' +
    '<path d="M16 1C7.716 1 1 7.716 1 16c0 2.628.672 5.1 1.852 7.254L1 31l7.95-1.832A14.94 14.94 0 0016 31c8.284 0 15-6.716 15-15S24.284 1 16 1zm0 27.5a12.44 12.44 0 01-6.326-1.724l-.454-.27-4.714 1.086 1.12-4.59-.296-.472A12.5 12.5 0 1116 28.5zm6.844-9.346c-.374-.188-2.214-1.092-2.558-1.216-.344-.124-.594-.188-.844.188s-.968 1.216-1.188 1.466-.438.282-.812.094c-.374-.188-1.578-.582-3.006-1.854-1.11-.99-1.86-2.212-2.08-2.586-.218-.374-.024-.576.164-.762.168-.168.374-.438.562-.656.188-.218.25-.374.374-.624.124-.25.062-.468-.032-.656-.094-.188-.844-2.032-1.156-2.782-.304-.73-.614-.63-.844-.642l-.718-.012c-.25 0-.656.094-.998.468s-1.312 1.28-1.312 3.124 1.344 3.624 1.53 3.874c.188.25 2.644 4.034 6.404 5.658 4.422 1.874 4.422 1.25 5.218 1.172.796-.078 2.558-1.046 2.92-2.058.36-1.01.36-1.876.252-2.058-.106-.168-.356-.264-.73-.452z"/>' +
    '</svg>' +
    '<span style="font-size:14px;font-weight:700;color:white;white-space:nowrap;letter-spacing:0.3px">WhatsApp</span>';

  btn.style.cssText =
    'position:fixed;bottom:24px;right:24px;display:flex;align-items:center;gap:10px;' +
    'background:#25D366;border-radius:50px;padding:11px 20px 11px 14px;' +
    'box-shadow:0 4px 20px rgba(37,211,102,0.5);z-index:99999;text-decoration:none;' +
    'transition:transform 0.2s,box-shadow 0.2s;';

  btn.addEventListener('mouseenter', function() {
    btn.style.transform = 'scale(1.05)';
    btn.style.boxShadow = '0 6px 28px rgba(37,211,102,0.65)';
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 20px rgba(37,211,102,0.5)';
  });

  document.body.appendChild(btn);
})();
