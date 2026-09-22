/* ==========================================================================
   EcoTrace — Auth, Business Onboarding & Team Roles
   Simulated phone + 4-digit SMS OTP login. The FIRST person to sign in on a
   browser does a one-time business profile capture (name, state, city, PIN)
   and becomes the Owner. The Owner can then add teammates (phone, name,
   role) from Settings → Team; when a teammate's phone signs in, they land
   in their own role instead of re-running onboarding. Everyone shares the
   same browser-local data (there is no server — this is a client-side app,
   same as the rest of EcoTrace), but a "Switch user" control makes it easy
   to demo different role views without re-typing OTPs.

   Runs after script.js, so it can read/patch the existing app (state,
   renderSettings, …) without editing it. Gated behind the pre-paint check
   in index.html's <head> script, which adds html.ecotrace-authed for
   returning, already-signed-in users so there is no flash of the app.

   Exposes window.EcoTraceAuth for pipeline.js / providers.js / Settings:
     getCurrentUser(), getTeam(), getBusiness(), hasRole(...roles),
     addTeamMember({phone,name,role}), removeTeamMember(id), switchUser(id),
     roleLabel(role), ROLES, signOut()
   ========================================================================== */
(function () {
  var LEGACY_ACCOUNT_KEY = 'ecotrace.account';
  var BUSINESS_KEY = 'ecotrace.business';
  var TEAM_KEY = 'ecotrace.team';
  var SESSION_KEY = 'ecotrace.session';

  var ROLES = ['owner', 'procurement', 'logistics', 'production', 'viewer'];

  var pendingPhone = '';
  var pendingCode = '';
  var resendTimer = null;
  var resendSeconds = 30;

  /* script.js declares esc()/ic()/state/… with const at the top level of a
     classic (non-module) script, so they live in the shared global lexical
     scope and are reachable here as plain identifiers — but const/let
     bindings are never copied onto `window`, only `function` declarations
     are. auth.js loads after script.js, so by the time any of these run
     (all from later event handlers) the bindings already exist; we simply
     call esc(...) / ic(...) directly below rather than via window.esc. */
  function t(key) { return typeof window.t === 'function' ? window.t(key) : key; }

  /* ---------- storage ---------- */
  function readJSON(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  function getBusiness() { return readJSON(BUSINESS_KEY, null); }
  function saveBusiness(b) { writeJSON(BUSINESS_KEY, b); }
  function getTeam() { return readJSON(TEAM_KEY, []); }
  function saveTeam(list) { writeJSON(TEAM_KEY, list); }
  function getSession() { return readJSON(SESSION_KEY, null); }
  function saveSession(s) { writeJSON(SESSION_KEY, s); }

  function getCurrentUser() {
    var session = getSession();
    if (!session) return null;
    var team = getTeam();
    for (var i = 0; i < team.length; i++) if (team[i].id === session.userId) return team[i];
    return null;
  }

  function hasRole() {
    var user = getCurrentUser();
    if (!user) return false;
    if (user.role === 'owner') return true;
    for (var i = 0; i < arguments.length; i++) if (arguments[i] === user.role) return true;
    return false;
  }

  function roleLabel(role) { return t('role.' + role); }

  function findByPhone(phone) {
    var team = getTeam();
    for (var i = 0; i < team.length; i++) if (team[i].phone === phone) return team[i];
    return null;
  }

  function addTeamMember(data) {
    var team = getTeam();
    if (findByPhone(data.phone)) return { error: 'duplicate' };
    var member = {
      id: 'u_' + data.phone + '_' + Date.now().toString(36),
      phone: data.phone,
      name: data.name,
      role: ROLES.indexOf(data.role) !== -1 ? data.role : 'viewer',
      createdAt: new Date().toISOString()
    };
    team.push(member);
    saveTeam(team);
    return { member: member };
  }

  function removeTeamMember(id) {
    var team = getTeam().filter(function (m) { return m.id !== id; });
    saveTeam(team);
    var session = getSession();
    if (session && session.userId === id) saveSession(null);
  }

  function switchUser(id) {
    saveSession({ userId: id });
    syncIntoApp();
    if (typeof window.closeDropdowns === 'function') window.closeDropdowns();
    if (typeof window.refreshChrome === 'function') window.refreshChrome();
    if (typeof window.renderCurrentPage === 'function') window.renderCurrentPage();
    if (typeof window.showToast === 'function') {
      var u = getCurrentUser();
      window.showToast(t('team.switched_to') + ' ' + (u ? u.name : ''), 'info');
    }
  }

  function signOut() {
    saveSession(null);
    location.reload();
  }

  function markAuthed() {
    document.documentElement.classList.add('ecotrace-authed');
  }

  /* Push the business name + the active user's identity into the existing
     app's own storage/state (the same keys script.js already reads) — no
     edits to script.js needed. */
  function syncIntoApp() {
    var business = getBusiness();
    var user = getCurrentUser();
    if (business) {
      try {
        var raw = localStorage.getItem('ecotrace.settings');
        var settings = raw ? JSON.parse(raw) : {};
        settings.businessName = business.businessName;
        localStorage.setItem('ecotrace.settings', JSON.stringify(settings));
      } catch (e) { /* ignore */ }
      try {
        localStorage.setItem('ecotrace.businessLocation', JSON.stringify({ state: business.state, city: business.city, pin: business.pin }));
      } catch (e) { /* ignore */ }
      if (typeof state !== 'undefined' && state && state.settings && state.settings.businessName !== business.businessName) {
        state.settings.businessName = business.businessName;
        if (typeof window.saveToLocalStorage === 'function') window.saveToLocalStorage();
      }
    }
    updateSidebarIdentity(user);
  }

  function updateSidebarIdentity(user) {
    var label = document.querySelector('.sidebar__footer .profile__text small');
    if (label) label.textContent = user ? (user.name + ' · ' + roleLabel(user.role)) : t('settings.account_signout');
  }

  /* ---------- one-time migration from the old single-account model ---------- */
  function migrateLegacyAccount() {
    if (getTeam().length || getBusiness()) return;
    var legacy = readJSON(LEGACY_ACCOUNT_KEY, null);
    if (!legacy) return;
    var owner = {
      id: 'u_' + legacy.phone + '_' + Date.now().toString(36),
      phone: legacy.phone,
      name: legacy.businessName,
      role: 'owner',
      createdAt: legacy.createdAt || new Date().toISOString()
    };
    saveBusiness({ businessName: legacy.businessName, state: legacy.state, city: legacy.city, pin: legacy.pin, createdAt: legacy.createdAt });
    saveTeam([owner]);
    saveSession({ userId: owner.id });
  }

  /* ---------- sign-in screen ---------- */
  function stateOptionsHtml() {
    var list = window.INDIA_STATES || [];
    return '<option value="" disabled selected>' + esc(t('auth.select_state')) + '</option>' +
      list.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('');
  }

  function authMarkup() {
    return (
      '<div class="auth-screen">' +
        '<div class="auth-card">' +
          '<div class="auth-brand"><span class="brand__mark"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#logo-mark"/></svg></span><strong>EcoTrace</strong></div>' +

          '<div class="auth-step" id="authStepPhone">' +
            '<h1>' + esc(t('auth.phone_title')) + '</h1>' +
            '<p>' + esc(t('auth.phone_sub')) + '</p>' +
            '<div class="field" id="authPhoneField">' +
              '<label for="authPhone">' + esc(t('auth.phone_label')) + '</label>' +
              '<div class="input-affix"><span class="phone-prefix">+91</span><input class="input" id="authPhone" type="tel" inputmode="numeric" maxlength="10" placeholder="' + esc(t('auth.phone_placeholder')) + '" autocomplete="tel"></div>' +
              '<p class="field__error" role="alert">' + esc(t('auth.invalid_phone')) + '</p>' +
            '</div>' +
            '<button class="btn btn--primary btn--lg auth-submit" type="button" id="authSendOtp">' + esc(t('auth.send_otp')) + '</button>' +
          '</div>' +

          '<div class="auth-step" id="authStepOtp" hidden>' +
            '<h1>' + esc(t('auth.otp_title')) + '</h1>' +
            '<p>' + esc(t('auth.otp_sub')) + ' <strong id="authPhoneDisplay"></strong></p>' +
            '<div class="field" id="authOtpField">' +
              '<div class="otp-boxes" id="otpBoxes">' +
                '<input class="otp-box" maxlength="1" inputmode="numeric" aria-label="Digit 1">' +
                '<input class="otp-box" maxlength="1" inputmode="numeric" aria-label="Digit 2">' +
                '<input class="otp-box" maxlength="1" inputmode="numeric" aria-label="Digit 3">' +
                '<input class="otp-box" maxlength="1" inputmode="numeric" aria-label="Digit 4">' +
              '</div>' +
              '<p class="field__error" role="alert">' + esc(t('auth.invalid_otp')) + '</p>' +
            '</div>' +
            '<p class="auth-demo-hint" id="authDemoHint"></p>' +
            '<button class="btn btn--primary btn--lg auth-submit" type="button" id="authVerifyOtp">' + esc(t('auth.verify')) + '</button>' +
            '<div class="auth-links">' +
              '<button class="link-btn" type="button" id="authResend">' + esc(t('auth.resend')) + '</button>' +
              '<button class="link-btn" type="button" id="authChangeNumber">' + esc(t('auth.change_number')) + '</button>' +
            '</div>' +
          '</div>' +

          '<div class="auth-step" id="authStepOnboard" hidden>' +
            '<h1>' + esc(t('auth.onboard_title')) + '</h1>' +
            '<p>' + esc(t('auth.onboard_sub')) + '</p>' +
            '<form id="authOnboardForm">' +
              '<div class="field"><label for="obYourName">' + esc(t('auth.your_name')) + '</label><input class="input" id="obYourName" required placeholder="' + esc(t('auth.your_name_placeholder')) + '"></div>' +
              '<div class="field"><label for="obBusinessName">' + esc(t('auth.business_name')) + '</label><input class="input" id="obBusinessName" required placeholder="' + esc(t('auth.business_name_placeholder')) + '"></div>' +
              '<div class="field"><label for="obState">' + esc(t('auth.state')) + '</label><select class="select" id="obState" required>' + stateOptionsHtml() + '</select></div>' +
              '<div class="field"><label for="obCity">' + esc(t('auth.city')) + '</label><input class="input" id="obCity" required placeholder="' + esc(t('auth.city_placeholder')) + '"></div>' +
              '<div class="field" id="obPinField"><label for="obPin">' + esc(t('auth.pin')) + '</label><input class="input" id="obPin" required maxlength="6" inputmode="numeric" placeholder="' + esc(t('auth.pin_placeholder')) + '"><p class="field__error" role="alert">' + esc(t('auth.pin_invalid')) + '</p></div>' +
              '<button class="btn btn--primary btn--lg auth-submit" type="submit">' + esc(t('auth.finish')) + '</button>' +
            '</form>' +
          '</div>' +

          '<div class="auth-step" id="authStepNotFound" hidden>' +
            '<span class="tile tone-amber" style="margin:0 auto 16px">' + ic('user-x') + '</span>' +
            '<h1 style="text-align:center">' + esc(t('auth.not_registered_title')) + '</h1>' +
            '<p style="text-align:center">' + esc(t('auth.not_registered_body')) + '</p>' +
            '<button class="btn btn--ghost btn--lg auth-submit" type="button" id="authBackFromNotFound">' + esc(t('auth.back')) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function showStep(root, step) {
    var ids = { phone: 'authStepPhone', otp: 'authStepOtp', onboard: 'authStepOnboard', notfound: 'authStepNotFound' };
    Object.keys(ids).forEach(function (key) {
      var el = root.querySelector('#' + ids[key]);
      if (el) el.hidden = key !== step;
    });
  }

  function startResendCountdown(root) {
    var resendBtn = root.querySelector('#authResend');
    resendSeconds = 30;
    clearInterval(resendTimer);
    resendBtn.disabled = true;
    var tick = function () {
      resendBtn.textContent = t('auth.resend_in') + ' ' + resendSeconds + 's';
      if (resendSeconds <= 0) {
        clearInterval(resendTimer);
        resendBtn.disabled = false;
        resendBtn.textContent = t('auth.resend');
        return;
      }
      resendSeconds -= 1;
    };
    tick();
    resendTimer = setInterval(tick, 1000);
  }

  function startOtp(root) {
    pendingCode = String(Math.floor(1000 + Math.random() * 9000));
    root.querySelector('#authPhoneDisplay').textContent = '+91 ' + pendingPhone;
    var boxes = Array.prototype.slice.call(root.querySelectorAll('.otp-box'));
    boxes.forEach(function (b) { b.value = ''; });
    root.querySelector('#authOtpField').classList.remove('has-error');
    var hint = root.querySelector('#authDemoHint');
    if (hint) hint.textContent = t('auth.otp_demo') + ' ' + pendingCode;
    showStep(root, 'otp');
    setTimeout(function () { if (boxes[0]) boxes[0].focus(); }, 30);
    startResendCountdown(root);
  }

  function afterVerified(root) {
    clearInterval(resendTimer);
    var existing = findByPhone(pendingPhone);
    if (existing) {
      saveSession({ userId: existing.id });
      syncIntoApp();
      finishAuth();
    } else if (!getTeam().length) {
      showStep(root, 'onboard');
    } else {
      showStep(root, 'notfound');
    }
  }

  function finishAuth() {
    markAuthed();
    var root = document.getElementById('authRoot');
    if (root) {
      root.classList.add('closing');
      setTimeout(function () { root.hidden = true; }, 200);
    }
    document.body.style.overflow = '';
    if (typeof window.showToast === 'function') window.showToast(t('auth.signed_in'), 'success');
    if (typeof window.renderCurrentPage === 'function') window.renderCurrentPage();
  }

  function wireAuthEvents(root) {
    var phoneField = root.querySelector('#authPhoneField');
    var phoneInput = root.querySelector('#authPhone');
    var sendBtn = root.querySelector('#authSendOtp');
    var otpField = root.querySelector('#authOtpField');
    var otpBoxes = Array.prototype.slice.call(root.querySelectorAll('.otp-box'));
    var verifyBtn = root.querySelector('#authVerifyOtp');
    var resendBtn = root.querySelector('#authResend');
    var changeBtn = root.querySelector('#authChangeNumber');
    var backBtn = root.querySelector('#authBackFromNotFound');
    var onboardForm = root.querySelector('#authOnboardForm');
    var pinField = root.querySelector('#obPinField');

    function trySend() {
      var phone = phoneInput.value.replace(/\D/g, '');
      if (phone.length !== 10) { phoneField.classList.add('has-error'); phoneInput.focus(); return; }
      phoneField.classList.remove('has-error');
      pendingPhone = phone;
      startOtp(root);
    }
    sendBtn.addEventListener('click', trySend);
    phoneInput.addEventListener('input', function () { phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10); phoneField.classList.remove('has-error'); });
    phoneInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); trySend(); } });

    otpBoxes.forEach(function (box, i) {
      box.addEventListener('input', function () {
        box.value = box.value.replace(/\D/g, '').slice(0, 1);
        otpField.classList.remove('has-error');
        if (box.value && otpBoxes[i + 1]) otpBoxes[i + 1].focus();
      });
      box.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !box.value && otpBoxes[i - 1]) otpBoxes[i - 1].focus();
        if (e.key === 'Enter') { e.preventDefault(); verifyBtn.click(); }
      });
    });

    verifyBtn.addEventListener('click', function () {
      var entered = otpBoxes.map(function (b) { return b.value; }).join('');
      if (entered.length === 4 && entered === pendingCode) {
        otpField.classList.remove('has-error');
        afterVerified(root);
      } else {
        otpField.classList.add('has-error');
        otpBoxes.forEach(function (b) { b.value = ''; });
        otpBoxes[0].focus();
      }
    });

    resendBtn.addEventListener('click', function () { if (!resendBtn.disabled) startOtp(root); });
    changeBtn.addEventListener('click', function () { clearInterval(resendTimer); showStep(root, 'phone'); pendingCode = ''; phoneInput.focus(); });
    if (backBtn) backBtn.addEventListener('click', function () { showStep(root, 'phone'); pendingCode = ''; phoneInput.value = ''; phoneInput.focus(); });

    onboardForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var yourName = root.querySelector('#obYourName').value.trim();
      var businessName = root.querySelector('#obBusinessName').value.trim();
      var st = root.querySelector('#obState').value;
      var city = root.querySelector('#obCity').value.trim();
      var pin = root.querySelector('#obPin').value.trim();
      if (!/^[0-9]{6}$/.test(pin)) { pinField.classList.add('has-error'); root.querySelector('#obPin').focus(); return; }
      pinField.classList.remove('has-error');
      if (!yourName || !businessName || !st || !city) return;
      saveBusiness({ businessName: businessName, state: st, city: city, pin: pin, createdAt: new Date().toISOString() });
      var result = addTeamMember({ phone: pendingPhone, name: yourName, role: 'owner' });
      if (result.member) saveSession({ userId: result.member.id });
      syncIntoApp();
      finishAuth();
    });
  }

  function buildAuthScreen() {
    var root = document.getElementById('authRoot');
    if (!root) return;
    root.innerHTML = authMarkup();
    root.hidden = false;
    root.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    if (typeof window.applyI18n === 'function') window.applyI18n(root);
    if (typeof window.refreshIcons === 'function') window.refreshIcons();
    wireAuthEvents(root);
    var firstInput = root.querySelector('#authPhone');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 60);
  }

  /* ---------- Settings page: Business account + Team, appended without
     touching the existing renderSettings() body. ---------- */
  function roleOptionsHtml(selected) {
    return ROLES.filter(function (r) { return r !== 'owner'; }).map(function (r) {
      return '<option value="' + r + '"' + (r === selected ? ' selected' : '') + '>' + esc(roleLabel(r)) + '</option>';
    }).join('');
  }

  function teamRowHtml(member, currentUser) {
    var isYou = currentUser && member.id === currentUser.id;
    var toneByRole = { owner: 'green', procurement: 'blue', logistics: 'purple', production: 'amber', viewer: 'gray' };
    return (
      '<div class="setting-row" data-team-row="' + esc(member.id) + '">' +
        '<div>' +
          '<strong>' + esc(member.name) + (isYou ? ' <span style="color:var(--text-faint);font-weight:500">(' + esc(t('team.you')) + ')</span>' : '') + '</strong>' +
          '<p>+91 ' + esc(member.phone) + '</p>' +
        '</div>' +
        '<span class="badge tone-' + (toneByRole[member.role] || 'gray') + '">' + esc(roleLabel(member.role)) + '</span>' +
        (member.role !== 'owner' && currentUser && currentUser.role === 'owner'
          ? '<button class="icon-btn icon-btn--sm icon-btn--danger" type="button" data-remove-team="' + esc(member.id) + '" aria-label="' + esc(t('team.remove')) + ' ' + esc(member.name) + '" title="' + esc(t('team.remove')) + '">' + ic('trash-2') + '</button>'
          : '') +
      '</div>'
    );
  }

  function injectAccountCard() {
    var grid = document.querySelector('#page-settings .settings-grid');
    var business = getBusiness();
    var user = getCurrentUser();
    if (!grid || !business || grid.querySelector('#accountCard')) return;

    var card = document.createElement('section');
    card.className = 'card card--pad';
    card.id = 'accountCard';
    card.innerHTML =
      '<div class="card__head"><div><h2>' + esc(t('settings.account_title')) + '</h2><p>' + esc(t('settings.account_desc')) + '</p></div></div>' +
      (user ? '<div class="setting-row"><div><strong>' + esc(t('settings.signed_in_as')) + '</strong><p>' + esc(user.name) + ' · +91 ' + esc(user.phone) + '</p></div><span class="badge tone-green">' + esc(roleLabel(user.role)) + '</span></div>' : '') +
      '<div class="setting-row"><div><strong>' + esc(t('settings.account_location')) + '</strong><p>' + esc([business.city, business.state, business.pin].filter(Boolean).join(', ')) + '</p></div>' +
        '<button class="btn btn--ghost" type="button" id="authSignOut">' + ic('log-out') + esc(t('settings.account_signout')) + '</button></div>';
    grid.appendChild(card);
    var btn = card.querySelector('#authSignOut');
    if (btn) btn.addEventListener('click', signOut);

    var teamCard = document.createElement('section');
    teamCard.className = 'card card--pad';
    teamCard.id = 'teamCard';
    var team = getTeam();
    var isOwner = user && user.role === 'owner';
    teamCard.innerHTML =
      '<div class="card__head"><div><h2>' + esc(t('team.title')) + '</h2><p>' + esc(t('team.desc')) + '</p></div></div>' +
      '<div id="teamList">' + team.map(function (m) { return teamRowHtml(m, user); }).join('') + '</div>' +
      (isOwner
        ? '<form id="addTeamForm" class="form-grid" style="margin-top:16px">' +
            '<div class="field"><label for="teamPhone">' + esc(t('team.phone')) + '</label><input class="input" id="teamPhone" inputmode="numeric" maxlength="10" placeholder="' + esc(t('auth.phone_placeholder')) + '" required></div>' +
            '<div class="field"><label for="teamName">' + esc(t('team.name')) + '</label><input class="input" id="teamName" required></div>' +
            '<div class="field"><label for="teamRole">' + esc(t('team.role')) + '</label><select class="select" id="teamRole">' + roleOptionsHtml('viewer') + '</select></div>' +
            '<button class="btn btn--primary" type="submit" style="align-self:end">' + ic('user-plus') + esc(t('team.add')) + '</button>' +
            '<p class="field__error" id="teamFormError" role="alert" style="display:none;grid-column:1/-1">' + esc(t('team.duplicate')) + '</p>' +
          '</form>'
        : '<p class="score-note">' + esc(t('team.empty_hint')) + '</p>');
    grid.appendChild(teamCard);

    teamCard.addEventListener('click', function (e) {
      var delBtn = e.target.closest('[data-remove-team]');
      if (!delBtn) return;
      var id = delBtn.getAttribute('data-remove-team');
      var member = team.filter(function (m) { return m.id === id; })[0];
      if (typeof window.confirmDialog === 'function') {
        window.confirmDialog({
          title: t('team.remove'), message: member ? member.name : '', confirmLabel: t('team.remove'),
          onConfirm: function () { removeTeamMember(id); if (typeof window.renderSettings === 'function') window.renderSettings(); }
        });
      } else {
        removeTeamMember(id);
        if (typeof window.renderSettings === 'function') window.renderSettings();
      }
    });

    var addForm = teamCard.querySelector('#addTeamForm');
    if (addForm) {
      addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var phone = teamCard.querySelector('#teamPhone').value.replace(/\D/g, '');
        var name = teamCard.querySelector('#teamName').value.trim();
        var role = teamCard.querySelector('#teamRole').value;
        var errEl = teamCard.querySelector('#teamFormError');
        if (phone.length !== 10 || !name) return;
        var result = addTeamMember({ phone: phone, name: name, role: role });
        if (result.error) { errEl.style.display = 'block'; return; }
        if (typeof window.renderSettings === 'function') window.renderSettings();
        if (typeof window.showToast === 'function') window.showToast(t('team.added') + ' ' + name, 'success');
      });
    }

    if (typeof window.refreshIcons === 'function') window.refreshIcons();
  }

  function patchRenderSettings() {
    if (typeof window.renderSettings !== 'function' || window.renderSettings.__ecotracePatched) return;
    var original = window.renderSettings;
    var patched = function () { original(); injectAccountCard(); };
    patched.__ecotracePatched = true;
    window.renderSettings = patched;
  }

  /* ---------- profile-dropdown "Switch user" list ---------- */
  function injectUserSwitcher() {
    var panel = document.getElementById('profilePanel');
    if (!panel || panel.querySelector('#userSwitcher')) return;
    var team = getTeam();
    if (team.length < 2) return;
    var current = getCurrentUser();
    var wrap = document.createElement('div');
    wrap.id = 'userSwitcher';
    wrap.innerHTML =
      '<div class="menu-sep"></div>' +
      '<div style="padding:6px 10px 4px;font-size:11.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">' + esc(t('team.switch_user')) + '</div>' +
      team.map(function (m) {
        var isCurrent = current && m.id === current.id;
        return '<button class="menu-item" type="button" data-switch-user="' + esc(m.id) + '"' + (isCurrent ? ' disabled style="opacity:.55"' : '') + '>' +
          ic(isCurrent ? 'check' : 'user') + '<span>' + esc(m.name) + ' · ' + esc(roleLabel(m.role)) + '</span></button>';
      }).join('');
    panel.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-switch-user]');
      if (!btn || btn.disabled) return;
      switchUser(btn.getAttribute('data-switch-user'));
    });
    if (typeof window.refreshIcons === 'function') window.refreshIcons();
  }

  function refreshUserSwitcher() {
    var panel = document.getElementById('profilePanel');
    var old = panel && panel.querySelector('#userSwitcher');
    if (old) old.remove();
    injectUserSwitcher();
  }

  function init() {
    migrateLegacyAccount();
    patchRenderSettings();
    var business = getBusiness();
    var user = getCurrentUser();
    if (business && user) {
      markAuthed();
      syncIntoApp();
      var root = document.getElementById('authRoot');
      if (root) root.hidden = true;
      if (typeof state !== 'undefined' && state && state.page === 'settings' && typeof window.renderSettings === 'function') window.renderSettings();
      refreshUserSwitcher();
    } else {
      buildAuthScreen();
    }
  }

  document.addEventListener('ecotrace:langchange', function () {
    var root = document.getElementById('authRoot');
    if (root && !root.hidden) buildAuthScreen();
    refreshUserSwitcher();
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-action="toggle-dropdown"][aria-controls="profilePanel"]')) refreshUserSwitcher();
  });

  window.EcoTraceAuth = {
    ROLES: ROLES,
    getCurrentUser: getCurrentUser,
    getTeam: getTeam,
    getBusiness: getBusiness,
    hasRole: hasRole,
    addTeamMember: addTeamMember,
    removeTeamMember: removeTeamMember,
    switchUser: switchUser,
    roleLabel: roleLabel,
    signOut: signOut
  };

  init();
})();
