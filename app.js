(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menu = $('#mobile-nav');
  const menuToggle = $('.menu-toggle');
  const closeMenu = () => {
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  };
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menu.hidden = expanded;
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  });
  $$('a, button', menu).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.matchMedia('(min-width: 601px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  const tabs = $$('.module-tab');
  const activateTab = (tab, focus = false) => {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[next], true);
    });
  });

  const contactDialog = $('#contact-dialog');
  const whatsappLink = $('#whatsapp-chat-link');
  const whatsappNumber = $('#whatsapp-number');
  const whatsappContext = $('#whatsapp-context');
  const whatsappStatus = $('#whatsapp-status');
  const copyWhatsAppNumber = $('#copy-whatsapp-number');
  const configuredWhatsAppNumber = window.STRUKTHQ_CONFIG?.contactWhatsAppNumber || '';
  const whatsappDigits = configuredWhatsAppNumber.replace(/\D/g, '');
  const whatsappDisplay = window.STRUKTHQ_CONFIG?.contactWhatsAppDisplay || configuredWhatsAppNumber;
  let opener = null;
  const showDialog = (dialog, source) => {
    opener = source || document.activeElement;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  };
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      opener?.focus();
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  $$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  const openContact = (topic = 'Core Platform', note = '', source) => {
    const interest = topic === 'General inquiry' ? 'your question' : topic;
    whatsappNumber.textContent = whatsappDisplay;
    whatsappLink.href = 'https://wa.me/' + whatsappDigits;
    whatsappLink.setAttribute('aria-label', 'Open WhatsApp chat with StruktHQ at ' + whatsappDisplay);
    whatsappContext.textContent = note ? 'You can mention: ' + note : 'Tell us what you need for ' + interest + '.';
    whatsappStatus.textContent = 'Nothing is sent until you write and send your message in WhatsApp.';
    closeMenu();
    showDialog(contactDialog, source);
  };
  $$('[data-inquiry]').forEach(button => button.addEventListener('click', () => openContact(button.dataset.inquiry, button.dataset.inquiryMessage || '', button)));
  copyWhatsAppNumber.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(whatsappDisplay);
      whatsappStatus.textContent = 'WhatsApp number copied. Open WhatsApp and start a chat with StruktHQ.';
    } catch {
      whatsappStatus.textContent = 'Copy this WhatsApp number: ' + whatsappDisplay;
    }
  });

  const imageDialog = $('#image-dialog');
  const image = $('#expanded-image');
  $$('[data-image]').forEach(button => button.addEventListener('click', () => {
    image.src = button.dataset.image;
    image.alt = button.dataset.caption;
    $('#original-image-link').href = button.dataset.image;
    $('#expanded-caption').textContent = button.dataset.caption;
    showDialog(imageDialog, button);
  }));
  imageDialog.addEventListener('close', () => image.removeAttribute('src'));

  const cookieName = 'strukthq_cookie_choice';
  const essentialChoice = 'essential-only-v1';
  const analyticsChoice = 'analytics-allowed-v1';
  const cookieMaxAge = 180 * 24 * 60 * 60;
  const measurementId = window.STRUKTHQ_CONFIG?.googleAnalyticsId || '';
  const cookieBanner = $('#cookie-banner');
  const cookieDialog = $('#cookie-dialog');
  const cookieStatus = $('#cookie-status');
  const analyticsBadge = $('#analytics-status-badge');
  const clearCookieChoice = $('#clear-cookie-choice');
  const readCookieChoice = () => {
    try {
      const entry = document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith(cookieName + '='));
      const value = entry?.slice(cookieName.length + 1) || '';
      return value === essentialChoice || value === analyticsChoice ? value : '';
    } catch {
      return '';
    }
  };
  let currentChoice = readCookieChoice();
  let analyticsLoaded = false;
  const googleConsent = analytics_storage => ({
    analytics_storage,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  const loadAnalytics = () => {
    if (!measurementId) return;
    window['ga-disable-' + measurementId] = false;
    if (analyticsLoaded) {
      window.gtag('consent', 'update', googleConsent('granted'));
      window.gtag('event', 'page_view', { page_location: window.location.href, page_title: document.title });
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', googleConsent('denied'));
    window.gtag('consent', 'update', googleConsent('granted'));
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(tag);
    analyticsLoaded = true;
  };
  const clearAnalyticsCookies = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const domains = ['', '; Domain=' + hostname, '; Domain=.' + hostname];
    if (parts.length > 2) domains.push('; Domain=.' + parts.slice(-2).join('.'));
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie.split(';').map(part => part.trim().split('=')[0]).filter(name => name === '_ga' || name.startsWith('_ga_')).forEach(name => {
      domains.forEach(domain => {
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + secure + domain;
      });
    });
  };
  const disableAnalytics = () => {
    if (measurementId) window['ga-disable-' + measurementId] = true;
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', googleConsent('denied'));
    clearAnalyticsCookies();
  };
  const updateCookieStatus = () => {
    const savedChoice = readCookieChoice();
    const choice = currentChoice || savedChoice;
    cookieStatus.textContent = choice === analyticsChoice
      ? 'Analytics is enabled based on your choice.'
      : choice === essentialChoice
        ? 'Your essential-only choice is saved in this browser.'
        : 'No choice has been saved. Analytics is off.';
    analyticsBadge.textContent = choice === analyticsChoice ? 'On' : 'Off';
    analyticsBadge.classList.toggle('inactive', choice !== analyticsChoice);
    clearCookieChoice.disabled = !savedChoice;
    return Boolean(savedChoice);
  };
  cookieBanner.hidden = Boolean(currentChoice);
  updateCookieStatus();
  if (currentChoice === analyticsChoice) loadAnalytics();
  $('#dismiss-cookie-notice').addEventListener('click', () => {
    cookieBanner.hidden = true;
    $('.nav-button')?.focus({ preventScroll: true });
  });
  $$('[data-cookie-settings]').forEach(button => button.addEventListener('click', () => {
    updateCookieStatus();
    showDialog(cookieDialog, button);
  }));
  const saveCookieChoice = (choice, button) => {
    currentChoice = choice;
    if (choice === analyticsChoice) loadAnalytics();
    else disableAnalytics();
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = cookieName + '=' + choice + '; Max-Age=' + cookieMaxAge + '; Path=/; SameSite=Lax' + secure;
    } catch {
      // The selected setting still applies for this visit when cookie storage is blocked.
    }
    cookieBanner.hidden = true;
    const saved = updateCookieStatus();
    if (!saved) cookieStatus.textContent = choice === analyticsChoice
      ? 'Analytics is enabled for this visit, but your browser could not save the choice.'
      : 'Essential-only applies for this visit, but your browser could not save the choice.';
    if (saved && cookieDialog.open) cookieDialog.close();
    else if (saved && button.closest('#cookie-banner')) $('.nav-button')?.focus({ preventScroll: true });
    else if (!cookieDialog.open) showDialog(cookieDialog, button);
  };
  $$('[data-save-cookies]').forEach(button => button.addEventListener('click', () => saveCookieChoice(essentialChoice, button)));
  $$('[data-allow-analytics]').forEach(button => button.addEventListener('click', () => saveCookieChoice(analyticsChoice, button)));
  clearCookieChoice.addEventListener('click', () => {
    disableAnalytics();
    currentChoice = '';
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = cookieName + '=; Max-Age=0; Path=/; SameSite=Lax' + secure;
    } catch {
      // Report the resulting state rather than assuming storage succeeded.
    }
    if (readCookieChoice()) {
      cookieStatus.textContent = 'This browser could not clear the choice. You can also remove it through your browser settings.';
      return;
    }
    cookieBanner.hidden = false;
    updateCookieStatus();
    cookieDialog.close();
  });
  cookieDialog.addEventListener('close', () => {
    if (opener?.closest('#cookie-banner') && cookieBanner.hidden) {
      $('.nav-button')?.focus({ preventScroll: true });
    }
  });

})();
