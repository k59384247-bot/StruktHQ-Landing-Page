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
  const cookieValue = 'essential-only-v1';
  const cookieMaxAge = 180 * 24 * 60 * 60;
  const cookieBanner = $('#cookie-banner');
  const cookieDialog = $('#cookie-dialog');
  const cookieStatus = $('#cookie-status');
  const clearCookieChoice = $('#clear-cookie-choice');
  const hasCookieChoice = () => {
    try {
      return document.cookie.split(';').some(part => part.trim() === `${cookieName}=${cookieValue}`);
    } catch {
      return false;
    }
  };
  const updateCookieStatus = () => {
    const saved = hasCookieChoice();
    cookieStatus.textContent = saved
      ? 'Your essential-only choice is saved in this browser.'
      : 'Your choice has not been saved in this browser yet.';
    clearCookieChoice.disabled = !saved;
    return saved;
  };
  cookieBanner.hidden = updateCookieStatus();
  $('#dismiss-cookie-notice').addEventListener('click', () => {
    cookieBanner.hidden = true;
    $('.nav-button')?.focus({ preventScroll: true });
  });
  $$('[data-cookie-settings]').forEach(button => button.addEventListener('click', () => {
    updateCookieStatus();
    showDialog(cookieDialog, button);
  }));
  $$('[data-save-cookies]').forEach(button => button.addEventListener('click', () => {
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${cookieName}=${cookieValue}; Max-Age=${cookieMaxAge}; Path=/; SameSite=Lax${secure}`;
    } catch {
      // The current visit still works when a browser blocks cookie storage.
    }
    cookieBanner.hidden = true;
    const saved = updateCookieStatus();
    if (saved && cookieDialog.open) cookieDialog.close();
    else if (saved && button.closest('#cookie-banner')) $('.nav-button')?.focus({ preventScroll: true });
    if (!saved) {
      cookieStatus.textContent = 'Your browser could not save this choice. The site still works with essential cookies only.';
      if (!cookieDialog.open) showDialog(cookieDialog, button);
    }
  }));
  clearCookieChoice.addEventListener('click', () => {
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${cookieName}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
    } catch {
      // Report the resulting state rather than assuming storage succeeded.
    }
    if (updateCookieStatus()) {
      cookieStatus.textContent = 'This browser could not clear the choice. You can also remove it through your browser settings.';
      return;
    }
    cookieBanner.hidden = false;
    cookieDialog.close();
  });
  cookieDialog.addEventListener('close', () => {
    if (opener?.closest('#cookie-banner') && cookieBanner.hidden) {
      $('.nav-button')?.focus({ preventScroll: true });
    }
  });

})();
