/* The Enlightenment Engine — the analytics hook (EE.track). Loaded before the game code on every page.
 *
 *   EE.track(name, params)          send one event, if analytics is on
 *   EE.track.once(key, name, params) the same, at most once per page load for `key` (a local string, never sent)
 *
 * It does nothing at all unless the website build (tools/build-site.js) has set window.EE_ANALYTICS and defined
 * window.gtag. The file itself never loads anything, never throws, never waits: if the network is down or a blocker
 * has removed Google's script, the game behaves exactly the same. The artifact and the local game never turn it on.
 *
 * HARD RULE: nothing a player typed ever leaves the browser (not the person's name, not Hum's name, not an answer),
 * and nothing read from localStorage. That is enforced here, not trusted to the callers: an event must be in SPEC,
 * every parameter key must be listed for that event, and every value must be a boolean, a whole number in range, or
 * one of a fixed set of values. Anything else is dropped. There are no free strings and no patterns: a string is sent
 * only if it is spelled out below.
 */
(function () {
  'use strict';
  var EE = window.EE = window.EE || {};

  var LANGS = ['en', 'de', 'es', 'fr', 'pt', 'tr', 'ja', 'ko', 'zh'];
  var ACT = [1, 2, 3, 4];
  var MINUTES = { min: 0, max: 600 };
  var DAYS = { min: 0, max: 1000000 };

  /* event → { key: allowed } where allowed is 'bool', {min, max} (a whole number, rounded and clamped), or a list */
  var SPEC = {
    game_start: { lang: LANGS, returning: 'bool' },
    first_press: {},
    act_reached: { act: [2, 3, 4], minutes: MINUTES },
    person_named: {},
    knot_confessed: { act: ACT },          /* round 2, bundle C: sent when a knot has been sat through to the end */
    ending: { kind: ['merge', 'coexist', 'sit'], tangled: 'bool', minutes: MINUTES, days: DAYS },
    keepsake_screen: { screen: [1, 2] },
    card_saved: { kind: ['card', 'desktop', 'phone'], via: ['share', 'download', 'viewer'] },
    copy_text: {},
    bowl_seen: { from: ['ending', 'menu'] },
    bowl_amount: { amount: ['3', '5', '10', 'other'] },
    bowl_decline: { from: ['ending', 'menu'] },
    language_changed: { from: LANGS, to: LANGS },
    sit_again: {},
    made_page_view: { lang: LANGS },
    proto2025_open: {}
  };

  function value(rule, v) {
    if (rule === 'bool') return typeof v === 'boolean' ? { ok: true, v: v } : null;
    if (Array.isArray(rule)) return rule.indexOf(v) >= 0 ? { ok: true, v: v } : null;   /* same type, same value */
    if (rule && typeof v === 'number' && isFinite(v)) return { ok: true, v: Math.max(rule.min, Math.min(rule.max, Math.round(v))) };
    return null;
  }
  /* the event as it may leave the page, or null */
  function clean(name, params) {
    if (typeof name !== 'string' || !Object.prototype.hasOwnProperty.call(SPEC, name)) return null;
    var spec = SPEC[name], out = {};
    if (params && typeof params === 'object') {
      for (var k in spec) {
        if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
        var r = value(spec[k], params[k]);
        if (r) out[k] = r.v;
      }
    }
    return out;
  }

  var sent = {};
  function track(name, params) {
    try {
      if (!window.EE_ANALYTICS || typeof window.gtag !== 'function') return;
      var p = clean(name, params);
      if (!p) return;
      window.gtag('event', name, p);
    } catch (e) { /* analytics never breaks the game */ }
  }
  track.once = function (key, name, params) {
    try {
      if (!window.EE_ANALYTICS) return;
      key = String(key);
      if (sent[key]) return;
      sent[key] = 1;
    } catch (e) { return; }
    track(name, params);
  };
  track.on = function () { return !!window.EE_ANALYTICS; };
  track.clean = clean;          /* for the playtest */
  track.SPEC = SPEC;
  EE.track = track;
})();
