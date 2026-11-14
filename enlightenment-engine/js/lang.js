/* The Enlightenment Engine — languages.
 * English is EE.story (story.js + story.launch.js). A translation file defines EE.lang["<code>"] = { langName, ...the
 * same shape as EE.story... } (js/lang/story.<code>.js), and optionally EE.langLaunch["<code>"] with the launch keys
 * (js/lang/launch.<code>.js). Only the chosen language is loaded: its script tags are added to the page, which works
 * from file:// as well as from a server.
 *
 * The translation is written INTO EE.story, in place, key by key, over a pristine English copy: every module that
 * holds a reference to EE.story (or to any object inside it) reads the active language, and whatever a translation
 * leaves out stays English. Switching back restores English the same way.
 *
 *   EE.i18n.ready(fn)        start: pick the language (?lang=, the remembered choice, the browser's), load it, apply it, fn()
 *   EE.i18n.use(code, fn)    switch now (loads if needed), remember the choice; fn(ok)
 *   EE.i18n.code             the active code ("en", "tr", ...)
 *   EE.i18n.list()           [{code, name, active, beta}] for the picker, each named in its own language
 *   EE.i18n.locale()         the Intl locale of the active language (null for English: the original number rules)
 *   EE.i18n.cjk()            true for ja, ko, zh
 *   EE.i18n.mailto()         the feedback link for the active language (subject + code)
 */
(function () {
  'use strict';
  var EE = window.EE = window.EE || {};
  EE.lang = EE.lang || {};
  EE.langLaunch = EE.langLaunch || {};
  var KEY = 'ee.lang';

  /* The languages we ship. `name` is how the picker writes a language that is not loaded yet (the same as the
   * langName in its file; check-lang.js warns if they differ). `locale` is what Intl and <html lang> get.
   * `launch: true` once js/lang/launch.<code>.js exists (the words of story.launch.js): a page cannot ask whether a
   * file is there without a failed request showing up as an error, so the list says it. check-lang.js warns when the
   * list and the folder disagree. */
  var LANGS = [
    { code: 'en', name: 'English', locale: 'en' },
    { code: 'de', name: 'Deutsch', locale: 'de', launch: true },
    { code: 'es', name: 'Español', locale: 'es', launch: true },
    { code: 'fr', name: 'Français', locale: 'fr', launch: true },
    { code: 'pt', name: 'Português (Brasil)', locale: 'pt-BR', launch: true },
    { code: 'tr', name: 'Türkçe', locale: 'tr', launch: true },
    { code: 'ja', name: '日本語', locale: 'ja', launch: true },
    { code: 'ko', name: '한국어', locale: 'ko', launch: true },
    { code: 'zh', name: '简体中文', locale: 'zh-CN', launch: true }
  ];
  var BY = {};
  LANGS.forEach(function (l) { BY[l.code] = l; });

  /* where the language files are: next to this script, in lang/ */
  var BASE = (function () {
    var src = document.currentScript && document.currentScript.src;
    return src ? src.replace(/[^\/]*$/, '') + 'lang/' : 'js/lang/';
  })();

  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function clone(v) {
    if (Array.isArray(v)) return v.map(clone);
    if (isObj(v)) { var o = {}; for (var k in v) o[k] = clone(v[k]); return o; }
    return v;
  }
  var EN = clone(EE.story || {});

  /* English back into EE.story, in place */
  function restore(dst, en) {
    for (var k in en) {
      var e = en[k], d = dst[k];
      if (Array.isArray(e)) {
        if (!Array.isArray(d)) { dst[k] = clone(e); continue; }
        for (var i = 0; i < e.length; i++) {
          if ((Array.isArray(e[i]) && Array.isArray(d[i])) || (isObj(e[i]) && isObj(d[i]))) restore(d[i], e[i]);
          else d[i] = clone(e[i]);
        }
        d.length = e.length;
      } else if (isObj(e)) {
        if (!isObj(d)) dst[k] = clone(e); else restore(d, e);
      } else dst[k] = e;
    }
  }
  /* a translation over it, in place: strings only, where English has a string at the same place */
  function merge(dst, src, top) {
    if (!isObj(src)) return;
    for (var k in src) {
      if (top && (k === 'langName' || k === 'links')) continue;
      if (!Object.prototype.hasOwnProperty.call(dst, k)) continue;
      mergeVal(dst, k, src[k]);
    }
  }
  function mergeVal(dst, k, v) {
    var d = dst[k];
    if (typeof d === 'string') { if (typeof v === 'string' && v.trim() !== '') dst[k] = v; }
    else if (Array.isArray(d)) {
      if (!Array.isArray(v)) return;
      var allStrings = d.every(function (x) { return typeof x === 'string'; }) && v.every(function (x) { return typeof x === 'string' && x.trim() !== ''; });
      if (v.length !== d.length && allStrings && v.length) { d.length = 0; v.forEach(function (x) { d.push(x); }); return; }
      for (var i = 0; i < Math.min(d.length, v.length); i++) mergeVal(d, i, v[i]);
    } else if (isObj(d)) merge(d, v, false);
  }

  var I = EE.i18n = { code: 'en', failed: {} };
  /* A page that needs only the launch words (made.html) sets window.EE_LANG_LAUNCH_ONLY before this script. */
  var LAUNCH_ONLY = !!window.EE_LANG_LAUNCH_ONLY;
  function have(code) { return LAUNCH_ONLY ? !!EE.langLaunch[code] : !!EE.lang[code]; }

  function load(code, done) {
    if (code === 'en' || have(code)) { done(true); return; }
    if (I.failed[code]) { done(false); return; }
    var files = LAUNCH_ONLY ? ['launch.'] : ['story.', 'launch.'];
    if (!BY[code].launch) files = files.filter(function (f) { return f !== 'launch.'; });
    if (!files.length) { done(false); return; }
    var left = files.length, finished = false;
    function one() {
      if (--left > 0 || finished) return;
      finished = true;
      if (!have(code)) I.failed[code] = true;
      done(have(code));
    }
    files.forEach(function (name) {
      var el = document.createElement('script');
      el.src = BASE + name + code + '.js';
      el.async = false;
      el.onload = one;
      el.onerror = function () { el.remove(); one(); };      /* launch.<code>.js is optional; story.<code>.js is not */
      document.head.appendChild(el);
    });
  }

  function apply(code) {
    restore(EE.story, EN);
    if (code !== 'en' && have(code)) {
      merge(EE.story, EE.lang[code], true);
      merge(EE.story, EE.langLaunch[code], true);
    } else code = 'en';
    I.code = code;
    EE.locale = code === 'en' ? null : BY[code].locale;
    var root = document.documentElement;
    root.lang = BY[code].locale;
    if (I.cjk()) root.setAttribute('data-cjk', code); else root.removeAttribute('data-cjk');
  }

  function known(c) { return !!(c && BY[c]); }
  function detect() {
    var q = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) { q = null; }
    if (known(q)) return q;
    try { var v = localStorage.getItem(KEY); if (known(v)) return v; } catch (e) { /* storage blocked */ }
    var list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'en'];
    for (var i = 0; i < list.length; i++) {
      var base = String(list[i] || '').toLowerCase().split('-')[0];
      if (known(base)) return base;
    }
    return 'en';
  }

  I.ready = function (fn) {
    var code = detect(), started = false;
    function go(ok) {
      if (started) return;
      started = true;
      apply(ok ? code : 'en');
      fn();
    }
    if (code === 'en') { go(true); return; }
    setTimeout(function () { go(false); }, 4000);          /* a file that never answers: start in English */
    load(code, go);
  };

  I.use = function (code, fn) {
    if (!known(code)) { if (fn) fn(false); return; }
    load(code, function (ok) {
      if (ok) {
        apply(code);
        try { localStorage.setItem(KEY, code); } catch (e) { /* storage blocked: this visit only */ }
      }
      if (fn) fn(ok);
    });
  };

  I.list = function () {
    return LANGS.filter(function (l) { return !I.failed[l.code]; }).map(function (l) {
      var tr = EE.lang[l.code];
      return { code: l.code, name: (tr && typeof tr.langName === 'string' && tr.langName) || l.name, active: l.code === I.code, beta: l.code !== 'en' };
    });
  };
  I.names = function () { var o = {}; LANGS.forEach(function (l) { o[l.code] = l.name; }); return o; };
  I.locale = function () { return EE.locale || null; };
  I.htmlLang = function () { return BY[I.code].locale; };
  I.cjk = function () { return I.code === 'ja' || I.code === 'ko' || I.code === 'zh'; };
  I.mailto = function () {
    var L = EE.story.links || {}, U = EE.story.langUi || {};
    return 'mailto:' + (L.feedbackEmail || '') + '?subject=' + encodeURIComponent((U.subject || '') + ' (' + I.code + ')');
  };
  /* Uppercase for small-caps text drawn on a canvas (CSS does it by `lang` on the page): Turkish i → İ */
  I.upper = function (s) { try { return String(s).toLocaleUpperCase(BY[I.code].locale); } catch (e) { return String(s).toUpperCase(); } };
})();
