/**
 * Evostr — GA4 conversion tracking.
 *
 * Everything downstream of a pageview: CTA clicks, newsletter subscribes,
 * Gap Check completions (with score), contact-request submissions, outbound
 * clicks and article read-through. Loaded on every page after gtag has been
 * configured.
 *
 * Key event to mark as a conversion in the GA4 admin UI: book_conversation.
 * Secondary: gap_check_complete, newsletter_subscribe.
 *
 * book_conversation used to fire on a Calendly booking (postMessage from the
 * embedded widget). book.html dropped Calendly for a qualifying contact form
 * 2026-09 — same event name preserved here so the existing GA4 conversion
 * goal keeps working with no reconfiguration; it now fires on a successful
 * form submission instead (see contact-form.js).
 *
 * Depends on nothing. Safe to load before or after the gtag snippet resolves —
 * calls queue on window.dataLayer either way.
 */
(function () {
  'use strict';

  function track(name, params) {
    var payload = params || {};
    payload.page_path = window.location.pathname;
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
    } else {
      // gtag.js still loading — dataLayer is created by the inline snippet in
      // <head>, so pushing directly is not lost.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(['event', name, payload]);
    }
  }

  // Expose for inline use and manual debugging in the console.
  window.evostrTrack = track;

  /* ---------- 1. CTA and link clicks ---------- */

  var MONEY_PAGES = ['book.html', 'assessment.html', 'commercial-gap-check.html', 'qualification.html'];

  function zoneOf(el) {
    if (el.closest('header')) return 'nav';
    if (el.closest('footer')) return 'footer';
    if (el.closest('.final-cta, .cta-section')) return 'closing_cta';
    return 'body';
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a') : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';
    var label = (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100);

    if (href.indexOf('mailto:') === 0) {
      track('email_click', { link_url: href.replace('mailto:', ''), cta_location: zoneOf(link) });
      return;
    }

    if (/^https?:\/\//.test(href) && href.indexOf('evostr.com') === -1) {
      var domain = '';
      try { domain = new URL(href).hostname.replace(/^www\./, ''); } catch (err) { domain = 'unknown'; }
      track('outbound_click', { link_domain: domain, link_url: href, link_text: label });
      return;
    }

    var isMoneyPage = MONEY_PAGES.some(function (p) { return href.indexOf(p) !== -1; });
    var isButton = /\bbtn\b/.test(link.className || '');

    if (isMoneyPage || isButton) {
      track('cta_click', {
        cta_text: label,
        cta_destination: href.split('/').pop() || href,
        cta_location: zoneOf(link)
      });
    }
  }, true);

  /* ---------- 2. Newsletter subscribes ---------- */

  document.addEventListener('evostr:newsletter_subscribe', function (e) {
    track('newsletter_subscribe', {
      form_location: (e.detail && e.detail.form) || 'unknown',
      score: (e.detail && e.detail.score) || undefined,
      band: (e.detail && e.detail.band) || undefined
    });
  });

  /* ---------- 3. Commercial Gap Check ---------- */

  document.addEventListener('evostr:gap_check_complete', function (e) {
    track('gap_check_complete', {
      score: e.detail ? e.detail.score : undefined,
      band: e.detail ? e.detail.band : undefined
    });
  });

  /* ---------- 4. Contact request form (book.html) ---------- */

  document.addEventListener('evostr:contact_request_submitted', function (e) {
    track('book_conversation', {
      value: 1,
      currency: 'USD',
      company_size: (e.detail && e.detail.company_size) || undefined,
      driver: (e.detail && e.detail.driver) || undefined
    });
  });

  /* ---------- 5. Article read-through ---------- */

  if (window.location.pathname.indexOf('/articles/') !== -1) {
    var fired = false;
    var onScroll = function () {
      if (fired) return;
      var doc = document.documentElement;
      var scrolled = (window.scrollY + window.innerHeight) / doc.scrollHeight;
      if (scrolled >= 0.75) {
        fired = true;
        window.removeEventListener('scroll', onScroll);
        var h1 = document.querySelector('h1');
        track('article_read', {
          article_title: h1 ? h1.textContent.replace(/\s+/g, ' ').trim().slice(0, 100) : undefined
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
