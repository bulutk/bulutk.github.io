/* "How this was made" (made.html): rendered from EE.story.made (story.launch.js), in the chosen language when a
 * translation of these strings exists (js/lang/launch.<code>.js), else in English. Text only, set with textContent. */
(function () {
  'use strict';
  var EE = window.EE;
  /* analytics (js/track.js): only in the website build */
  function track(name, params) { if (EE.track) EE.track(name, params); }
  function el(tag, cls, text, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  /* A section may carry a picture (shot, shotAlt, shotCaption), set after its second paragraph, and one quiet link
   * (link → EE.story.links[linkTo], a new tab; an empty address hides it). */
  function extras(s, sec) {
    if (sec.shot) {
      var fig = el('figure', 'shot');
      fig.appendChild(el('img', null, null, { src: sec.shot, alt: sec.shotAlt || '', loading: 'lazy' }));
      if (sec.shotCaption) fig.appendChild(el('figcaption', null, sec.shotCaption));
      s.appendChild(fig);
    }
    var to = sec.linkTo && EE.story.links && EE.story.links[sec.linkTo];
    if (sec.link && to) {
      var p = el('p', 'shot-link'), a = el('a', null, sec.link, { href: to, target: '_blank', rel: 'noopener' });
      if (sec.linkTo === 'proto2025') a.addEventListener('click', function () { track('proto2025_open'); });
      p.appendChild(a);
      s.appendChild(p);
    }
  }
  function render() {
    var ST = EE.story, M = ST.made, code = EE.i18n ? EE.i18n.code : 'en';
    var tr = EE.langLaunch && EE.langLaunch[code] && EE.langLaunch[code].made;
    /* only the strings on this page decide its language: without a translation of them, it is an English page */
    if (code !== 'en' && !tr) {
      document.documentElement.lang = 'en';
      document.documentElement.removeAttribute('data-cjk');
    }
    var box = document.getElementById('made');
    document.title = M.title + ' · ' + ST.share.foot;
    box.appendChild(el('div', 'label kicker', ST.share.foot));
    box.appendChild(el('h1', null, M.title));
    box.appendChild(el('div', 'rule'));
    M.sections.forEach(function (sec) {
      var s = el('section');
      s.appendChild(el('h2', 'label', sec.h));
      sec.p.forEach(function (p, i) {
        s.appendChild(el('p', null, p));
        if (i === 1) extras(s, sec);
      });
      if (sec.p.length < 2) extras(s, sec);
      box.appendChild(s);
    });
    /* the website build only, where analytics is on: what it counts, at the end of the last section */
    if (window.EE_ANALYTICS && M.counting) {
      var last = box.querySelectorAll('section');
      if (last.length) last[last.length - 1].appendChild(el('p', 'counting', M.counting));
    }
    track('made_page_view', { lang: code });
    if (code !== 'en' && tr) {
      var note = el('p', 'lang-note', ST.langUi.note + ' ');
      note.appendChild(el('a', null, ST.links.feedbackEmail, { href: EE.i18n.mailto() }));
      box.appendChild(note);
    }
    var back = el('p', 'back');
    back.appendChild(el('a', null, M.back, { href: 'index.html', 'data-back': '1' }));
    box.appendChild(back);
  }
  if (EE.i18n) EE.i18n.ready(render); else render();
})();
