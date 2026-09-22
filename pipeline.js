/* ==========================================================================
   EcoTrace — Supply Chain Pipeline
   The business's one live pipeline: Sourcing → Manufacturing → Quality
   Check → Warehousing → Transportation → Delivery. Each stage can have a
   provider assigned from providers.js (filtered by the stage's category),
   a status, and a running update feed. Only the role that owns a stage
   (or the Owner) can change it — see STAGE_ROLE + EcoTraceAuth.hasRole().
   Renders into #page-pipeline using the same helpers/CSS as the rest of
   the app (esc, ic, mount, $, openModal, refreshIcons… all declared in
   script.js and reachable here as bare identifiers by call time — see the
   note in auth.js/providers.js for why this works despite const/let never
   landing on `window`).
   ========================================================================== */
(function () {
  'use strict';

  var PIPELINE_KEY = 'ecotrace.pipeline';

  var DEFAULT_STAGES = [
    { key: 'sourcing', icon: 'sprout', titleKey: 'pipeline.stage.sourcing', category: 'supplier' },
    { key: 'manufacturing', icon: 'factory', titleKey: 'pipeline.stage.manufacturing', category: null },
    { key: 'quality', icon: 'clipboard-check', titleKey: 'pipeline.stage.quality', category: null },
    { key: 'warehousing', icon: 'warehouse', titleKey: 'pipeline.stage.warehousing', category: 'logistics' },
    { key: 'transportation', icon: 'truck', titleKey: 'pipeline.stage.transportation', category: 'transporter' },
    { key: 'delivery', icon: 'package-check', titleKey: 'pipeline.stage.delivery', category: 'logistics' }
  ];

  var STAGE_ROLE = { sourcing: 'procurement', manufacturing: 'production', quality: 'production', warehousing: 'logistics', transportation: 'logistics', delivery: 'logistics' };

  var STATUS_ORDER = ['not_started', 'in_progress', 'completed', 'blocked'];
  var STATUS_STYLE = {
    not_started: { tone: 'gray', icon: 'circle' },
    in_progress: { tone: 'blue', icon: 'clock' },
    completed: { tone: 'green', icon: 'badge-check' },
    blocked: { tone: 'red', icon: 'triangle-alert' }
  };

  function readJSON(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ } }

  function seedPipeline() {
    return DEFAULT_STAGES.map(function (s) {
      return { key: s.key, status: 'not_started', assignedProviderId: null, updates: [] };
    });
  }

  function getPipeline() {
    var stored = readJSON(PIPELINE_KEY, null);
    if (!stored || !Array.isArray(stored) || !stored.length) {
      stored = seedPipeline();
      writeJSON(PIPELINE_KEY, stored);
    }
    // Heal against a stage list change (e.g. app update) by re-seeding any missing keys.
    var byKey = {};
    stored.forEach(function (s) { byKey[s.key] = s; });
    var healed = DEFAULT_STAGES.map(function (def) {
      return byKey[def.key] || { key: def.key, status: 'not_started', assignedProviderId: null, updates: [] };
    });
    return healed;
  }
  function savePipeline(list) { writeJSON(PIPELINE_KEY, list); }

  function stageDef(key) {
    for (var i = 0; i < DEFAULT_STAGES.length; i++) if (DEFAULT_STAGES[i].key === key) return DEFAULT_STAGES[i];
    return null;
  }

  function canEditStage(key) {
    var Auth = window.EcoTraceAuth;
    if (!Auth) return false;
    var role = STAGE_ROLE[key];
    return Auth.hasRole(role);
  }

  function fmtDateTime(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  /* ---------- top summary strip (read-only), reusing .journey CSS ---------- */
  function pipelineStripHtml(pipeline) {
    var t = window.t;
    return '<div class="journey" style="--steps:' + pipeline.length + '">' + pipeline.map(function (stage, i) {
      var def = stageDef(stage.key);
      var st = STATUS_STYLE[stage.status] || STATUS_STYLE.not_started;
      return (
        '<div class="journey__step tone-' + st.tone + (stage.status === 'completed' ? ' is-verified' : '') + '" style="--i:' + i + '">' +
          '<span class="journey__node">' + ic(def.icon) + '</span>' +
          '<div class="journey__content">' +
            '<div class="journey__title">' + esc(t(def.titleKey)) + '</div>' +
            '<div class="journey__badge">' + badge(t('pipeline.status.' + stage.status), st.tone, st.icon) + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('') + '</div>';
  }

  /* ---------- assign-provider modal ---------- */
  function providerPickRowHtml(p, score) {
    var t = window.t;
    var tone = ratingTone(score.score);
    var chips = p.category === 'supplier' ? (p.materials || []) : [p.serviceType];
    return (
      '<div class="provider-pick-row">' +
        '<span class="tile tile--sm tone-' + window.CATEGORY_TONE[p.category] + '">' + ic(window.CATEGORY_ICON[p.category]) + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<strong class="cell-product__name">' + esc(p.name) + '</strong>' +
          '<div class="chips" style="margin-top:4px">' + chips.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div>' +
        '</div>' +
        '<span class="rating tone-' + tone + '" title="' + esc(t('provider.sustainability_score')) + '">' + score.score + '</span>' +
        '<button class="btn btn--primary btn--sm" type="button" data-choose-provider="' + esc(p.id) + '">' + esc(t('pipeline.choose')) + '</button>' +
      '</div>'
    );
  }

  function openAssignModal(stageKey) {
    var t = window.t;
    var def = stageDef(stageKey);
    if (!def.category) return;
    var list = window.getProvidersByCategory(def.category).map(function (p) { return { p: p, score: window.computeProviderScore(p) }; })
      .sort(function (a, b) { return b.score.score - a.score.score; });
    var body = '<div class="provider-pick-list">' + list.map(function (row) { return providerPickRowHtml(row.p, row.score); }).join('') + '</div>';
    openModal({
      title: t('pipeline.choose_provider_title') + ' ' + t(def.titleKey),
      subtitle: window.categoryLabel(def.category),
      body: body,
      size: 'md',
      onOpen: function (overlay) {
        overlay.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-choose-provider]');
          if (!btn) return;
          assignProvider(stageKey, btn.getAttribute('data-choose-provider'));
          closeModal();
        });
      }
    });
    if (typeof refreshIcons === 'function') refreshIcons();
  }

  function assignProvider(stageKey, providerId) {
    var pipeline = getPipeline();
    var stage = pipeline.filter(function (s) { return s.key === stageKey; })[0];
    if (!stage) return;
    stage.assignedProviderId = providerId;
    var provider = window.getProviderById(providerId);
    var user = window.EcoTraceAuth ? window.EcoTraceAuth.getCurrentUser() : null;
    stage.updates.unshift({
      id: 'upd_' + Date.now().toString(36),
      byUserId: user ? user.id : null,
      byName: user ? user.name : 'Someone',
      byRole: user ? user.role : null,
      note: window.t('pipeline.assigned_note') + ' ' + (provider ? provider.name : ''),
      status: null,
      at: new Date().toISOString()
    });
    savePipeline(pipeline);
    renderPipeline();
    if (typeof showToast === 'function') showToast(window.t('pipeline.assigned_note') + ' ' + (provider ? provider.name : ''), 'success');
  }

  /* ---------- update feed + status form ---------- */
  function updateItemHtml(u) {
    var t = window.t;
    return (
      '<li class="update-item">' +
        '<span class="tile tile--sm tone-gray">' + ic('user') + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="update-item__head"><strong>' + esc(u.byName) + '</strong>' + (u.byRole ? '<span class="badge tone-gray">' + esc(window.EcoTraceAuth ? window.EcoTraceAuth.roleLabel(u.byRole) : u.byRole) + '</span>' : '') + '<small>' + esc(fmtDateTime(u.at)) + '</small></div>' +
          (u.status ? '<div style="margin:4px 0">' + badge(t('pipeline.status.' + u.status), (STATUS_STYLE[u.status] || STATUS_STYLE.not_started).tone, (STATUS_STYLE[u.status] || STATUS_STYLE.not_started).icon) + '</div>' : '') +
          (u.note ? '<p class="update-item__note">' + esc(u.note) + '</p>' : '') +
        '</div>' +
      '</li>'
    );
  }

  function statusOptionsHtml(current) {
    var t = window.t;
    return STATUS_ORDER.map(function (s) { return '<option value="' + s + '"' + (s === current ? ' selected' : '') + '>' + esc(t('pipeline.status.' + s)) + '</option>'; }).join('');
  }

  function stageCardHtml(stage) {
    var t = window.t;
    var def = stageDef(stage.key);
    var st = STATUS_STYLE[stage.status] || STATUS_STYLE.not_started;
    var provider = stage.assignedProviderId ? window.getProviderById(stage.assignedProviderId) : null;
    var providerScore = provider ? window.computeProviderScore(provider) : null;
    var editable = canEditStage(stage.key);
    var updates = stage.updates || [];

    return (
      '<section class="card card--pad pipeline-stage" data-stage="' + esc(stage.key) + '">' +
        '<div class="card__head">' +
          '<div style="display:flex;align-items:center;gap:14px">' +
            '<span class="tile tone-' + st.tone + '">' + ic(def.icon) + '</span>' +
            '<div><h2>' + esc(t(def.titleKey)) + '</h2><p>' + (def.category ? esc(window.categoryLabel(def.category)) : esc(t('pipeline.internal_stage'))) + '</p></div>' +
          '</div>' +
          badge(t('pipeline.status.' + stage.status), st.tone, st.icon) +
        '</div>' +

        (def.category ? (
          '<div class="sup-card__grid">' +
            '<div><small>' + esc(t('pipeline.provider')) + '</small><strong>' + (provider ? esc(provider.name) : esc(t('pipeline.no_provider'))) + '</strong></div>' +
            (provider ? '<div><small>' + esc(t('provider.sustainability_score')) + '</small><button type="button" class="rating tone-' + ratingTone(providerScore.score) + '" style="border:0;cursor:pointer" data-open-score="' + esc(provider.id) + '">' + providerScore.score + '</button></div>' : '<div></div>') +
          '</div>' +
          (editable ? '<button class="btn btn--ghost btn--sm" type="button" data-assign-stage="' + esc(stage.key) + '">' + ic('shuffle') + esc(provider ? t('pipeline.change_provider') : t('pipeline.assign_provider')) + '</button>' : '')
        ) : '') +

        '<div class="pipeline-updates">' +
          '<h3>' + esc(t('pipeline.updates')) + ' <small style="color:var(--text-faint);font-weight:500">(' + updates.length + ')</small></h3>' +
          (updates.length ? '<ul class="update-list">' + updates.slice(0, 4).map(updateItemHtml).join('') + '</ul>' : '<p class="score-note">' + esc(t('pipeline.no_updates')) + '</p>') +
          (editable
            ? '<form class="pipeline-update-form" data-stage-form="' + esc(stage.key) + '">' +
                '<div class="field"><label>' + esc(t('pipeline.update_status')) + '</label><select class="select" data-field="status">' + statusOptionsHtml(stage.status) + '</select></div>' +
                '<div class="field"><label>' + esc(t('pipeline.add_update')) + '</label><textarea class="textarea" data-field="note" rows="2" placeholder="' + esc(t('pipeline.update_placeholder')) + '"></textarea></div>' +
                '<button class="btn btn--primary btn--sm" type="submit">' + ic('send') + esc(t('pipeline.post_update')) + '</button>' +
              '</form>'
            : '<p class="callout" style="margin-top:12px">' + ic('lock') + '<span>' + esc(t('pipeline.read_only_hint')) + '</span></p>') +
        '</div>' +
      '</section>'
    );
  }

  function postUpdate(stageKey, status, note) {
    var pipeline = getPipeline();
    var stage = pipeline.filter(function (s) { return s.key === stageKey; })[0];
    if (!stage) return;
    var user = window.EcoTraceAuth ? window.EcoTraceAuth.getCurrentUser() : null;
    var statusChanged = status !== stage.status;
    stage.status = status;
    stage.updates.unshift({
      id: 'upd_' + Date.now().toString(36),
      byUserId: user ? user.id : null,
      byName: user ? user.name : 'Someone',
      byRole: user ? user.role : null,
      note: note || '',
      status: statusChanged ? status : null,
      at: new Date().toISOString()
    });
    savePipeline(pipeline);
    renderPipeline();
    if (typeof showToast === 'function') showToast(window.t('pipeline.update_posted'), 'success');
  }

  function wirePipelineEvents(root) {
    root.addEventListener('click', function (e) {
      var assignBtn = e.target.closest('[data-assign-stage]');
      if (assignBtn) { openAssignModal(assignBtn.getAttribute('data-assign-stage')); return; }
      var scoreBtn = e.target.closest('[data-open-score]');
      if (scoreBtn) { window.openProviderScoreModal(scoreBtn.getAttribute('data-open-score')); return; }
    });
    root.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-stage-form]');
      if (!form) return;
      e.preventDefault();
      var stageKey = form.getAttribute('data-stage-form');
      var status = form.querySelector('[data-field="status"]').value;
      var note = form.querySelector('[data-field="note"]').value.trim();
      postUpdate(stageKey, status, note);
    });
  }

  function renderPipeline() {
    var t = window.t;
    var pipeline = getPipeline();
    var html =
      '<div class="section-head"><div><h2>' + esc(t('pipeline.heading')) + '</h2><p>' + esc(t('pipeline.subheading')) + '</p></div></div>' +
      pipelineStripHtml(pipeline) +
      '<div class="pipeline-stages">' + pipeline.map(stageCardHtml).join('') + '</div>';

    var el = $('#page-pipeline');
    mount(el, html);
    wirePipelineEvents(el);
    if (typeof refreshIcons === 'function') refreshIcons();
  }

  window.renderPipeline = renderPipeline;
})();
