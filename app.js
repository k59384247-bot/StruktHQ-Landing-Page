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

  const inquiryDialog = $('#inquiry-dialog');
  const inquiryForm = $('#inquiry-form');
  const review = $('#inquiry-review');
  const status = $('#inquiry-status');
  const contactEmail = window.STRUKTHQ_CONFIG?.contactEmail || '';
  let inquiry = { subject: '', body: '' };
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
  const openInquiry = (plan = 'Core Platform', message = '', source) => {
    inquiryForm.hidden = false;
    review.hidden = true;
    inquiryForm.elements.plan.value = plan;
    inquiryForm.elements.message.value = message;
    status.textContent = '';
    closeMenu();
    showDialog(inquiryDialog, source);
  };
  $$('[data-inquiry]').forEach(button => button.addEventListener('click', () => openInquiry(button.dataset.inquiry, button.dataset.inquiryMessage || '', button)));
  inquiryForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!inquiryForm.reportValidity()) return;
    const data = new FormData(inquiryForm);
    const value = key => String(data.get(key) || '').trim();
    inquiry = {
      subject: `StruktHQ ${value('plan')} inquiry — ${value('organization')}`,
      body: `Hello StruktHQ,\n\nI’d like to learn more about ${value('plan')}.\n\nName: ${value('name')}\nEmail: ${value('email')}\nOrganization: ${value('organization')}\nOrganization size: ${value('size') || 'Not specified'}\nInterested in: ${value('plan')}\n\n${value('message') || 'Please let me know the next steps to get started.'}\n\nThank you,\n${value('name')}`
    };
    $('#inquiry-text').textContent = inquiry.body;
    inquiryForm.hidden = true;
    review.hidden = false;
    $('#email-inquiry').disabled = !contactEmail;
    status.textContent = contactEmail ? `Your email app will open a draft addressed to ${contactEmail}. Review it and send when you’re ready.` : 'Copy your inquiry to share it with StruktHQ.';
    $('#email-inquiry').focus();
  });
  $('#email-inquiry').addEventListener('click', () => {
    if (!contactEmail) return;
    window.location.href = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(inquiry.subject)}&body=${encodeURIComponent(inquiry.body)}`;
    status.textContent = 'Your inquiry is ready in your email app. Send it there to contact StruktHQ.';
  });
  $('#copy-inquiry').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(`To: ${contactEmail}\nSubject: ${inquiry.subject}\n\n${inquiry.body}`);
      status.textContent = 'Inquiry copied. You can paste it into your email app.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents($('#inquiry-text'));
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Select and copy the inquiry above, then paste it into your email app.';
    }
  });
  $('#edit-inquiry').addEventListener('click', () => {
    inquiryForm.hidden = false;
    review.hidden = true;
    inquiryForm.elements.name.focus();
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
