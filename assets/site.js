/* bible.elioraselwyn.com: verse highlight (#v2, #v1-2), text size, Back to article. The page works fully without it. */
(function () {
  'use strict';
  var MAIN = 'https://www.elioraselwyn.com';
  function st(n) { try { var s = window[n], t = '__bsb'; s.setItem(t, t); s.removeItem(t); return s; } catch (e) { return null; } }
  var LS = st('localStorage'), SS = st('sessionStorage');
  function get(s, k) { try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function put(s, k, v) { try { if (s) s.setItem(k, v); } catch (e) {} }
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  var live = $('.sr'), note = $('.r-notice');

  // text size (same steps and storage key as the v1 reader)
  var SIZES = [0.85, 1, 1.15, 1.3, 1.5, 1.75], si = parseInt(get(LS, 'bsbSize') || '1', 10);
  if (!(si >= 0 && si < SIZES.length)) si = 1;
  var sm = $('.r-smaller'), bg = $('.r-bigger');
  function size(announce) {
    document.documentElement.style.setProperty('--r-size', SIZES[si]);
    if (sm) { sm.hidden = false; sm.disabled = si === 0; } if (bg) { bg.hidden = false; bg.disabled = si === SIZES.length - 1; }
    put(LS, 'bsbSize', String(si)); if (announce && live) live.textContent = 'Text size ' + Math.round(SIZES[si] * 100) + ' percent';
  }
  if (sm) sm.onclick = function () { if (si > 0) { si--; size(true); } };
  if (bg) bg.onclick = function () { if (si < SIZES.length - 1) { si++; size(true); } };
  size(false);

  // Back to article: ?from=/path (sent by article links and the Blogger shim) or a referrer from elioraselwyn.com.
  // Browsers send only the origin across subdomains, so without ?from we step back through this tab's history.
  var back = $('.r-back');
  if (back) {
    var from = new URLSearchParams(location.search).get('from'), ref = document.referrer, rh = '';
    try { rh = ref ? new URL(ref).hostname : ''; } catch (e) {}
    if (from && /^\/[^\/]/.test(from)) { put(SS, 'bsbFrom', MAIN + from); put(SS, 'bsbStart', ''); }
    else if (rh === 'www.elioraselwyn.com' || rh === 'elioraselwyn.com') {
      var full = ref.replace(/^https?:\/\/[^\/]+/, '');
      if (full.length > 1) { put(SS, 'bsbFrom', MAIN + full); put(SS, 'bsbStart', ''); }
      else { put(SS, 'bsbFrom', MAIN + '/'); put(SS, 'bsbStart', String(history.length)); }
    }
    var target = get(SS, 'bsbFrom'), start = parseInt(get(SS, 'bsbStart') || '', 10);
    if (target) {
      back.href = target; back.hidden = false;
      if (start > 0) back.onclick = function (ev) { ev.preventDefault(); var n = history.length - start + 1; if (n > 0) history.go(-n); else location.href = target; };
    }
  }

  // verse highlight from #v2 or #v1-2
  function hl() {
    $$('.hl').forEach(function (x) { x.classList.remove('hl'); });
    if (note) note.hidden = true;
    var m = location.hash.match(/^#v(\d+)(?:-(\d+))?$/); if (!m) return;
    var a = +m[1], b = m[2] ? +m[2] : a, title = ($('.r-text h1') || {}).textContent || '';
    var first = document.getElementById('v' + a);
    if (!first) { if (note) { note.textContent = title + ' has ' + $$('.r-text .v').length + ' verses; verse ' + a + ' was not found, so the whole chapter is shown.'; note.hidden = false; } return; }
    for (var v = a; v <= b; v++) $$('.vt[data-v="' + v + '"]').forEach(function (x) { x.classList.add('hl'); });
    var y = first.getBoundingClientRect().top + window.pageYOffset - window.innerHeight * 0.25;
    window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
    if (live) live.textContent = title + (b > a ? ', verses ' + a + ' to ' + b : ', verse ' + a) + ' highlighted';
  }
  window.addEventListener('hashchange', hl);
  if (document.readyState === 'complete') hl(); else window.addEventListener('load', hl);
  put(LS, 'bsbLastPage', location.pathname);
})();
