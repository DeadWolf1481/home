/* ── Date-Time Picker ── */
var dtCurYear, dtCurMonth, dtSelDay = null, dtSelMonth = null, dtSelYear = null, dtHour = 8, dtMin = 0;
var MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getMinDateTime() {
  return new Date(Date.now() + 12 * 60 * 60 * 1000);
}

function isSelectedMinDay() {
  if (dtSelDay === null) return false;
  var min = getMinDateTime();
  var selDate = new Date(dtSelYear, dtSelMonth, dtSelDay);
  var minDate = new Date(min.getFullYear(), min.getMonth(), min.getDate());
  return selDate.getTime() === minDate.getTime();
}

function clampTime() {
  if (!isSelectedMinDay()) return;
  var min = getMinDateTime();
  var minH = min.getHours();
  var minM = min.getMinutes();
  if (dtHour < minH || (dtHour === minH && dtMin < minM)) {
    dtHour = minH;
    dtMin = minM;
  }
}

function initPicker() {
  var min = getMinDateTime();
  dtCurYear = min.getFullYear(); dtCurMonth = min.getMonth();
  dtHour = min.getHours();
  dtMin = Math.ceil(min.getMinutes() / 5) * 5;
  if (dtMin >= 60) { dtMin = 0; dtHour = (dtHour + 1) % 24; }
  var ms = document.getElementById('dtMonthSel');
  var ys = document.getElementById('dtYearSel');
  MONTHS_LONG.forEach(function(m, i) {
    var o = document.createElement('option'); o.value = i; o.text = m; ms.appendChild(o);
  });
  for (var y = min.getFullYear(); y <= min.getFullYear() + 3; y++) {
    var o = document.createElement('option'); o.value = y; o.text = y; ys.appendChild(o);
  }
  ms.value = dtCurMonth; ys.value = dtCurYear;
  renderCal();
}

var dtTrackRAF = null;

function positionPicker() {
  var p = document.getElementById('dtPicker');
  var t = document.getElementById('dtTrigger');
  if (!p || !t) return;
  var rect = t.getBoundingClientRect();
  var pickerW = 280;
  var pickerH = 380;
  var left = rect.left;
  if (left + pickerW > window.innerWidth - 8) left = window.innerWidth - pickerW - 8;
  var top = rect.bottom + 6;
  if (top + pickerH > window.innerHeight) top = rect.top - pickerH - 6;
  p.style.top = top + 'px';
  p.style.left = left + 'px';
  p.style.width = pickerW + 'px';
}

function startTracking() {
  function loop() { positionPicker(); dtTrackRAF = requestAnimationFrame(loop); }
  dtTrackRAF = requestAnimationFrame(loop);
}

function stopTracking() {
  if (dtTrackRAF) { cancelAnimationFrame(dtTrackRAF); dtTrackRAF = null; }
}

function togglePicker() {
  var p = document.getElementById('dtPicker');
  var arrow = document.getElementById('dtArrow');
  if (p.classList.contains('open')) {
    p.classList.remove('open');
    arrow.style.transform = 'rotate(0deg)';
    arrow.style.opacity = '0.5';
    stopTracking();
    document.removeEventListener('click', closePicker, true);
    return;
  }
  positionPicker();
  p.classList.add('open');
  arrow.style.transform = 'rotate(180deg)';
  arrow.style.opacity = '0.8';
  startTracking();
  document.addEventListener('click', closePicker, true);
}

function closePicker(e) {
  var p = document.getElementById('dtPicker');
  var t = document.getElementById('dtTrigger');
  var arrow = document.getElementById('dtArrow');
  if (!p.contains(e.target) && !t.contains(e.target)) {
    p.classList.remove('open');
    arrow.style.transform = 'rotate(0deg)';
    arrow.style.opacity = '0.5';
    stopTracking();
    document.removeEventListener('click', closePicker, true);
  }
}

function goToMonth() {
  dtCurMonth = parseInt(document.getElementById('dtMonthSel').value);
  dtCurYear = parseInt(document.getElementById('dtYearSel').value);
  renderCal();
}

function changeMonth(dir) {
  dtCurMonth += dir;
  if (dtCurMonth < 0) { dtCurMonth = 11; dtCurYear--; }
  if (dtCurMonth > 11) { dtCurMonth = 0; dtCurYear++; }
  document.getElementById('dtMonthSel').value = dtCurMonth;
  document.getElementById('dtYearSel').value = dtCurYear;
  renderCal();
}

function renderCal() {
  var container = document.getElementById('dtDays');
  container.innerHTML = '';
  var min = getMinDateTime();
  var minDate = new Date(min.getFullYear(), min.getMonth(), min.getDate());
  var first = new Date(dtCurYear, dtCurMonth, 1).getDay();
  var daysInMonth = new Date(dtCurYear, dtCurMonth + 1, 0).getDate();
  var prevDays = new Date(dtCurYear, dtCurMonth, 0).getDate();
  for (var i = first - 1; i >= 0; i--) {
    var d = document.createElement('div'); d.className = 'dt-day other-month'; d.textContent = prevDays - i; container.appendChild(d);
  }
  for (var d2 = 1; d2 <= daysInMonth; d2++) {
    var el = document.createElement('div'); el.className = 'dt-day';
    var thisDate = new Date(dtCurYear, dtCurMonth, d2);
    if (thisDate < minDate) { el.classList.add('disabled'); }
    if (d2 === min.getDate() && dtCurMonth === min.getMonth() && dtCurYear === min.getFullYear()) el.classList.add('today');
    if (dtSelDay === d2 && dtSelMonth === dtCurMonth && dtSelYear === dtCurYear) el.classList.add('selected');
    el.textContent = d2;
    (function(day) {
      el.onclick = function() { dtSelDay = day; dtSelMonth = dtCurMonth; dtSelYear = dtCurYear; clampTime(); renderCal(); };
    })(d2);
    container.appendChild(el);
  }
  var total = first + daysInMonth;
  var rem = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (var n = 1; n <= rem; n++) {
    var e2 = document.createElement('div'); e2.className = 'dt-day other-month'; e2.textContent = n; container.appendChild(e2);
  }
  document.getElementById('dtHour').value = String(dtHour).padStart(2, '0');
  document.getElementById('dtMin').value = String(dtMin).padStart(2, '0');
}

function changeHour(d) {
  dtHour = (dtHour + d + 24) % 24;
  clampTime();
  document.getElementById('dtHour').value = String(dtHour).padStart(2, '0');
}

function changeMin(d) {
  dtMin = (dtMin + d * 5 + 60) % 60;
  clampTime();
  document.getElementById('dtMin').value = String(dtMin).padStart(2, '0');
}

function onHourInput(el) {
  var v = parseInt(el.value);
  if (!isNaN(v)) { dtHour = Math.max(0, Math.min(23, v)); clampTime(); }
}

function onHourBlur(el) {
  dtHour = Math.max(0, Math.min(23, parseInt(el.value) || 0));
  clampTime();
  el.value = String(dtHour).padStart(2, '0');
}

function onMinInput(el) {
  var v = parseInt(el.value);
  if (!isNaN(v)) { dtMin = Math.max(0, Math.min(59, v)); clampTime(); }
}

function onMinBlur(el) {
  var v = parseInt(el.value) || 0;
  dtMin = Math.round(Math.max(0, Math.min(59, v)) / 5) * 5;
  if (dtMin >= 60) { dtMin = 55; }
  clampTime();
  el.value = String(dtMin).padStart(2, '0');
}

function confirmDate() {
  if (!dtSelDay) { alert('Please select a date.'); return; }
  var display = dtSelDay + ' ' + MONTHS_SHORT[dtSelMonth] + ' ' + dtSelYear + ' ' + String(dtHour).padStart(2, '0') + ':' + String(dtMin).padStart(2, '0');
  var span = document.getElementById('dtDisplay');
  var trigger = document.getElementById('dtTrigger');
  var arrow = document.getElementById('dtArrow');
  span.textContent = display;
  span.style.color = '#1a1a1a';
  span.style.fontWeight = '500';
  trigger.classList.add('has-val');
  trigger.style.borderColor = '#1a3a5c';
  arrow.style.transform = 'rotate(0deg)';
  arrow.style.opacity = '0.5';
  document.getElementById('dtPicker').classList.remove('open');
  stopTracking();
  document.removeEventListener('click', closePicker, true);
}

/* ── Custom Dropdown ── */
function buildDrop(dropId, listId, items, defaultIndex) {
  var list = document.getElementById(listId);
  var drop = document.getElementById(dropId);
  var val = drop.querySelector('.cs-val');
  items.forEach(function(item, i) {
    var el = document.createElement('div');
    el.className = 'cs-item' + (i === defaultIndex ? ' selected' : '');
    el.textContent = item;
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      list.querySelectorAll('.cs-item').forEach(function(x) { x.classList.remove('selected'); });
      el.classList.add('selected');
      val.textContent = item;
      closeDrop(dropId);
    });
    list.appendChild(el);
  });
}

function positionDrop(dropId) {
  var drop = document.getElementById(dropId);
  var trigger = drop.querySelector('.cs-trigger');
  var list = drop.querySelector('.cs-list');
  var rect = trigger.getBoundingClientRect();
  var w = Math.max(rect.width, 180);
  var left = rect.left;
  var navH = 66;
  var spaceAbove = rect.top - navH - 4;
  var spaceBelow = window.innerHeight - rect.bottom - 4;
  var top, maxH;
  if (spaceAbove >= 120) {
    maxH = Math.min(260, spaceAbove);
    top = rect.top - maxH - 4;
  } else {
    maxH = Math.min(260, spaceBelow);
    top = rect.bottom + 4;
  }
  if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
  list.style.top = top + 'px';
  list.style.left = left + 'px';
  list.style.width = w + 'px';
  list.style.maxHeight = maxH + 'px';
}

function toggleDrop(dropId) {
  var drop = document.getElementById(dropId);
  var isOpen = drop.classList.contains('open');
  closeAllDrops();
  if (!isOpen) {
    positionDrop(dropId);
    drop.classList.add('open');
    document.addEventListener('click', onDocClickDrop, true);
  }
}

function closeDrop(dropId) {
  var drop = document.getElementById(dropId);
  if (drop) drop.classList.remove('open');
}

function closeAllDrops() {
  document.querySelectorAll('.custom-select.open').forEach(function(d) { d.classList.remove('open'); });
}

function onDocClickDrop(e) {
  var inside = false;
  document.querySelectorAll('.custom-select').forEach(function(d) {
    if (d.contains(e.target)) inside = true;
  });
  if (!inside) {
    closeAllDrops();
    document.removeEventListener('click', onDocClickDrop, true);
  }
}

/* ── Navigation ── */
function smoothTo(e, id) {
  e.preventDefault();
  if (id === 'hero') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleMenu() {
  var btn = document.getElementById('hamburger');
  var menu = document.getElementById('mobileMenu');
  var nav = document.querySelector('.nav');
  document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
  btn.classList.toggle('open');
  if (menu.dataset.open === 'true') {
    menu.style.maxHeight = '0';
    menu.dataset.open = 'false';
    setTimeout(function(){ menu.style.display="none"; }, 300);
  } else {
    menu.style.display = 'block';
    requestAnimationFrame(function() {
      menu.style.maxHeight = '400px';
      menu.dataset.open = 'true';
    });
  }
}

function mobileNav(e, id) {
  e.preventDefault();
  var btn = document.getElementById('hamburger');
  var menu = document.getElementById('mobileMenu');
  btn.classList.remove('open');
  menu.style.maxHeight = '0';
  menu.dataset.open = 'false';
  setTimeout(function() {
    menu.style.display = 'none';
    if (id === 'hero') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}

function goToResults() {
  var fromEl = document.querySelector('input[placeholder="Istanbul Airport"]');
  var toEl = document.querySelector('input[placeholder="Taksim, Istanbul"]');
  var from = fromEl.value.trim();
  var to = toEl.value.trim();
  var date = document.getElementById('dtDisplay').textContent.trim();
  var passengers = document.querySelector('#passengerDrop .cs-val').textContent.trim();
  var luggage = document.querySelector('#luggageDrop .cs-val').textContent.trim();

  // Validation
  var errors = [];
  if (!from) { errors.push('From'); fromEl.style.borderColor = '#e24b4a'; }
  else { fromEl.style.borderColor = ''; }
  if (!to) { errors.push('To'); toEl.style.borderColor = '#e24b4a'; }
  else { toEl.style.borderColor = ''; }
  if (!dtSelDay) { errors.push('Date'); document.getElementById('dtTrigger').style.borderColor = '#e24b4a'; }
  else { document.getElementById('dtTrigger').style.borderColor = ''; }

  if (errors.length > 0) {
    // Shake the empty fields
    errors.forEach(function(f) {
      var el = f === 'From' ? fromEl : f === 'To' ? toEl : document.getElementById('dtTrigger');
      el.classList.add('shake');
      setTimeout(function() { el.classList.remove('shake'); }, 500);
    });
    return;
  }

  var params = new URLSearchParams({ from: from, to: to, date: date, passengers: passengers, luggage: luggage });
  window.location.href = 'results.html?' + params.toString();
}

function setTab(el) {
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
}

/* ── Init ── */
window.addEventListener('DOMContentLoaded', function() {
  initPicker();

  var passengers = [];
  for (var p = 1; p <= 15; p++) passengers.push(p + ' Passenger' + (p > 1 ? 's' : ''));
  buildDrop('passengerDrop', 'passengerList', passengers, 0);

  var suitcases = [];
  for (var s = 0; s <= 20; s++) suitcases.push(s + ' Suitcase' + (s !== 1 ? 's' : ''));
  buildDrop('luggageDrop', 'luggageList', suitcases, 0);

  // Nav scroll behaviour
  var nav = document.querySelector('.nav');
  var hero = document.getElementById('hero');
  var navH = 0;

  var lastScrollY = 0;
  var navVisible = true;

  function updateNav() {
    navH = nav.offsetHeight;
    var scrollY = window.scrollY || window.pageYOffset;
    var scrollingDown = scrollY > lastScrollY;
    var searchCard = document.querySelector('.search-card');
    var cardBottom = searchCard ? searchCard.getBoundingClientRect().bottom : 0;

    if (cardBottom <= 0) {
      if (!navVisible) {
        navVisible = true;
        nav.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
        nav.style.transform = 'translateY(0)';
      }
    } else if (scrollingDown && scrollY > 10) {
      navVisible = false;
      var ty = Math.min(scrollY, navH);
      nav.style.transition = 'none';
      nav.style.transform = 'translateY(-' + ty + 'px)';
    } else if (!scrollingDown && scrollY <= 10) {
      navVisible = true;
      nav.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
      nav.style.transform = 'translateY(0)';
    } else if (!scrollingDown && !navVisible) {
      var ty2 = Math.min(scrollY, navH);
      nav.style.transition = 'none';
      nav.style.transform = 'translateY(-' + ty2 + 'px)';
    }

    lastScrollY = scrollY;
  }

  // Start with nav visible
  nav.style.transform = 'translateY(0)';

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  window.addEventListener('scroll', function() {
    // Close mobile menu on scroll
    var menu = document.getElementById('mobileMenu');
    var btn = document.getElementById('hamburger');
    if (menu && menu.dataset.open === 'true') {
      menu.style.maxHeight = '0';
      menu.dataset.open = 'false';
      setTimeout(function(){ menu.style.display="none"; }, 300);
      if (btn) btn.classList.remove('open');
    }

    var p = document.getElementById('dtPicker');
    if (p && p.classList.contains('open')) {
      p.classList.remove('open');
      stopTracking();
      var arrow = document.getElementById('dtArrow');
      if (arrow) { arrow.style.transform = 'rotate(0deg)'; arrow.style.opacity = '0.5'; }
      document.removeEventListener('click', closePicker, true);
    }
    closeAllDrops();
  }, { passive: true });
});

function toggleFaq(el) {
  var isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(f) { f.classList.remove('open'); });
  if (!isOpen) el.classList.add('open');
}

function sendMessage() {
  var btn = document.querySelector('.cf-btn');
  btn.textContent = '✓ Sent!';
  btn.style.background = '#1d6a3a';
  setTimeout(function() {
    btn.textContent = 'Send';
    btn.style.background = '';
    document.querySelectorAll('.cf-input').forEach(function(el) { el.value = ''; });
  }, 2500);
}
