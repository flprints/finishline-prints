/* Client site: lean interactions (menu, nav state, reveal, year, Netlify form).
   No client-specific text lives here. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.remove('no-js');
  body.classList.add('is-ready');

  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* Nav: scrolled state */
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = $('.nav__burger');
  const menu = $('#menu');
  if (burger && menu) {
    const setMenu = open => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
        body.style.overflow = 'hidden';
      } else {
        menu.classList.remove('is-open');
        body.style.overflow = '';
        setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 400);
      }
    };
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  }

  /* Reveal on scroll */
  const items = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty('--d', `${Math.min(i * 0.08, 0.4)}s`);
      io.observe(el);
    });
  }

  /* Contact form (Netlify Forms, submitted without leaving the page) */
  const form = $('form[name="contact"]');
  if (form) {
    const status = $('.form__status', form);
    form.addEventListener('submit', async e => {
      if (!form.checkValidity()) return;
      e.preventDefault();
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      status.classList.remove('is-error');
      status.textContent = 'Sending your request…';
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.textContent = 'Thank you! Your request is in. We will get back to you shortly.';
      } catch (err) {
        status.classList.add('is-error');
        status.textContent = 'Could not send right now. Please try again, or contact us by phone or email.';
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
