/* ==========================================================================
   EcoTrace — Vendor Discovery
   Mock raw-material vendor marketplace: search, geographic/cost sorting,
   sustainability ranking, and a contact-reveal card. Renders into the
   existing #page-vendors section using the same helpers/CSS classes as the
   rest of the app (esc, ic, badge, chip, mount, $, refreshIcons, ratingTone…
   all defined in script.js and available by the time these functions run).
   ========================================================================== */
(function () {
  'use strict';

  var INDIA_STATES = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
    'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  var STATE_ADJACENCY = {
    'Gujarat': ['Rajasthan', 'Maharashtra', 'Madhya Pradesh'],
    'Rajasthan': ['Gujarat', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh'],
    'Maharashtra': ['Gujarat', 'Madhya Pradesh', 'Karnataka', 'Telangana', 'Andhra Pradesh'],
    'Karnataka': ['Maharashtra', 'Telangana', 'Andhra Pradesh', 'Tamil Nadu', 'Kerala'],
    'Kerala': ['Karnataka', 'Tamil Nadu'],
    'Tamil Nadu': ['Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana'],
    'Telangana': ['Maharashtra', 'Karnataka', 'Andhra Pradesh'],
    'Andhra Pradesh': ['Telangana', 'Karnataka', 'Tamil Nadu', 'Odisha'],
    'West Bengal': ['Odisha', 'Bihar', 'Assam'],
    'Assam': ['West Bengal'],
    'Punjab': ['Rajasthan', 'Haryana'],
    'Haryana': ['Punjab', 'Rajasthan', 'Uttar Pradesh', 'Delhi'],
    'Uttar Pradesh': ['Rajasthan', 'Haryana', 'Madhya Pradesh', 'Uttarakhand', 'Bihar', 'Delhi'],
    'Uttarakhand': ['Uttar Pradesh'],
    'Madhya Pradesh': ['Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Maharashtra'],
    'Delhi': ['Haryana', 'Uttar Pradesh'],
    'Bihar': ['Uttar Pradesh', 'West Bengal'],
    'Odisha': ['West Bengal', 'Andhra Pradesh']
  };

  var VENDORS = [
    { id: 'VND-01', name: 'Satvik Organic Farms', materials: ['Organic Cotton'], state: 'Gujarat', city: 'Bhuj', country: 'India', phone: '+91 98250 11223', email: 'sales@satvikorganic.example', costPerKg: 165, sustainabilityScore: 91, certifications: ['GOTS', 'Fair Trade'], minOrderKg: 50 },
    { id: 'VND-02', name: 'Vidarbha Cotton Cooperative', materials: ['Organic Cotton'], state: 'Maharashtra', city: 'Nagpur', country: 'India', phone: '+91 94220 55678', email: 'contact@vidarbhacotton.example', costPerKg: 142, sustainabilityScore: 78, certifications: ['GOTS'], minOrderKg: 100 },
    { id: 'VND-03', name: 'Malwa Ginning Mills', materials: ['Conventional Cotton'], state: 'Punjab', city: 'Bathinda', country: 'India', phone: '+91 98140 33221', email: 'orders@malwaginning.example', costPerKg: 98, sustainabilityScore: 52, certifications: [], minOrderKg: 200 },
    { id: 'VND-04', name: 'Panipat Textile Recyclers', materials: ['Recycled Cotton'], state: 'Haryana', city: 'Panipat', country: 'India', phone: '+91 98120 66554', email: 'info@panipatrecyclers.example', costPerKg: 110, sustainabilityScore: 82, certifications: ['GRS'], minOrderKg: 150 },
    { id: 'VND-05', name: 'Mysuru Silk Reelers Guild', materials: ['Silk'], state: 'Karnataka', city: 'Mysuru', country: 'India', phone: '+91 99001 44556', email: 'guild@mysuresilk.example', costPerKg: 1850, sustainabilityScore: 84, certifications: ['Silk Mark'], minOrderKg: 10 },
    { id: 'VND-06', name: 'Murshidabad Silk House', materials: ['Silk'], state: 'West Bengal', city: 'Murshidabad', country: 'India', phone: '+91 90330 22114', email: 'sales@murshidabadsilk.example', costPerKg: 1620, sustainabilityScore: 69, certifications: [], minOrderKg: 15 },
    { id: 'VND-07', name: 'Bikaner Wool Traders', materials: ['Wool'], state: 'Rajasthan', city: 'Bikaner', country: 'India', phone: '+91 94141 77889', email: 'trade@bikanerwool.example', costPerKg: 410, sustainabilityScore: 74, certifications: ['Woolmark'], minOrderKg: 25 },
    { id: 'VND-08', name: 'Hooghly Jute Mills', materials: ['Jute'], state: 'West Bengal', city: 'Hooghly', country: 'India', phone: '+91 98300 66112', email: 'export@hooghlyjute.example', costPerKg: 58, sustainabilityScore: 88, certifications: ['ISO 14001'], minOrderKg: 500 },
    { id: 'VND-09', name: 'Kannur Flax & Linen Co.', materials: ['Linen'], state: 'Kerala', city: 'Kannur', country: 'India', phone: '+91 94470 12398', email: 'hello@kannurlinen.example', costPerKg: 520, sustainabilityScore: 80, certifications: ['OEKO-TEX'], minOrderKg: 40 },
    { id: 'VND-10', name: 'Himalayan Hemp Growers', materials: ['Hemp Fiber'], state: 'Uttarakhand', city: 'Dehradun', country: 'India', phone: '+91 94120 88776', email: 'coop@himalayanhemp.example', costPerKg: 340, sustainabilityScore: 95, certifications: ['Fair Trade', 'B Corp'], minOrderKg: 20 },
    { id: 'VND-11', name: 'Assam Bamboo Textiles', materials: ['Bamboo'], state: 'Assam', city: 'Guwahati', country: 'India', phone: '+91 98640 55321', email: 'sales@assambamboo.example', costPerKg: 210, sustainabilityScore: 86, certifications: ['FSC'], minOrderKg: 60 },
    { id: 'VND-12', name: 'Surat Recycled Fibres Pvt. Ltd.', materials: ['Recycled Polyester'], state: 'Gujarat', city: 'Surat', country: 'India', phone: '+91 98980 12233', email: 'b2b@suratrecycled.example', costPerKg: 128, sustainabilityScore: 90, certifications: ['GRS', 'OEKO-TEX'], minOrderKg: 100 },
    { id: 'VND-13', name: 'Jaipur Natural Dye Works', materials: ['Natural Dye'], state: 'Rajasthan', city: 'Jaipur', country: 'India', phone: '+91 94140 99887', email: 'orders@jaipurdyeworks.example', costPerKg: 380, sustainabilityScore: 87, certifications: ['GOTS'], minOrderKg: 10 },
    { id: 'VND-14', name: 'Zhejiang Textile Group', materials: ['Conventional Cotton', 'Recycled Polyester'], state: null, city: 'Zhejiang', country: 'China', phone: '+86 571 8888 0000', email: 'trade@zhejiangtextile.example', costPerKg: 120, sustainabilityScore: 61, certifications: [], minOrderKg: 500 },
    { id: 'VND-15', name: 'Dhaka Silk Traders', materials: ['Silk'], state: null, city: 'Dhaka', country: 'Bangladesh', phone: '+880 1711 223344', email: 'sales@dhakasilk.example', costPerKg: 1400, sustainabilityScore: 58, certifications: [], minOrderKg: 30 }
  ];

  var TOP_VENDOR_IDS = VENDORS.slice().sort(function (a, b) { return b.sustainabilityScore - a.sustainabilityScore; }).slice(0, 3).map(function (v) { return v.id; });

  var vendorFilters = { q: '', sort: 'recommended' };

  function getBusinessLocation() {
    try { return JSON.parse(localStorage.getItem('ecotrace.businessLocation')); } catch (e) { return null; }
  }

  function proximityInfo(vendor, biz) {
    if (!vendor.state) return { tier: 3, key: 'intl' };
    if (!biz || !biz.state) return { tier: 2, key: 'domestic' };
    if (vendor.state === biz.state) return { tier: 0, key: 'local' };
    var bizNeighbors = STATE_ADJACENCY[biz.state] || [];
    var vendorNeighbors = STATE_ADJACENCY[vendor.state] || [];
    if (bizNeighbors.indexOf(vendor.state) !== -1 || vendorNeighbors.indexOf(biz.state) !== -1) return { tier: 1, key: 'nearby' };
    return { tier: 2, key: 'domestic' };
  }

  function getFilteredVendors() {
    var biz = getBusinessLocation();
    var q = vendorFilters.q.trim().toLowerCase();
    var list = VENDORS.filter(function (v) {
      if (!q) return true;
      var hay = [v.name, v.city, v.state, v.country].concat(v.materials).join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    }).map(function (v) {
      var copy = Object.assign({}, v);
      copy._prox = proximityInfo(v, biz);
      return copy;
    });
    var sorters = {
      recommended: function (a, b) { return b.sustainabilityScore - a.sustainabilityScore || a._prox.tier - b._prox.tier; },
      sustainability: function (a, b) { return b.sustainabilityScore - a.sustainabilityScore; },
      proximity: function (a, b) { return a._prox.tier - b._prox.tier || b.sustainabilityScore - a.sustainabilityScore; },
      cost: function (a, b) { return a.costPerKg - b.costPerKg; }
    };
    list.sort(sorters[vendorFilters.sort] || sorters.recommended);
    return list;
  }

  function proximityLabel(key) {
    return (typeof window.t === 'function') ? window.t('vendor.proximity.' + key) : key;
  }

  /* esc/ic/ratingTone/initials/fmtNum/$/debounce/mount are declared with
     const/let at the top level of script.js, which loads before this file
     runs its render calls. Those bindings live in the shared global lexical
     scope for classic scripts but are never copied onto `window` (only
     function declarations are) — so they're used here as bare identifiers,
     not window.esc etc. See the equivalent note in auth.js. */
  function vendorCardHtml(v) {
    var t = window.t;
    var tone = ratingTone(v.sustainabilityScore);
    var isTop = TOP_VENDOR_IDS.indexOf(v.id) !== -1;
    var proxTone = { local: 'green', nearby: 'blue', domestic: 'gray', intl: 'purple' }[v._prox.key] || 'gray';
    var place = [v.city, v.state || v.country].filter(Boolean).join(', ');
    return (
      '<article class="card vendor-card">' +
        '<div class="vendor-card__top">' +
          '<span class="tile tone-' + tone + '"><b style="font-size:14px">' + esc(initials(v.name)) + '</b></span>' +
          '<div style="flex:1;min-width:0">' +
            '<strong class="cell-product__name">' + esc(v.name) + '</strong>' +
            '<div class="sup-card__loc">' + ic('map-pin') + esc(place) + '</div>' +
          '</div>' +
          (isTop ? '<span class="badge tone-green">' + ic('sparkles') + esc(t('vendor.top_rated')) + '</span>' : '') +
        '</div>' +
        '<div class="chips">' + v.materials.map(function (m) { return '<span class="chip">' + esc(m) + '</span>'; }).join('') + '</div>' +
        '<div class="sup-card__grid">' +
          '<div><small>' + esc(t('vendor.cost')) + '</small><strong>₹' + fmtNum(v.costPerKg) + '/kg</strong></div>' +
          '<div><small>&nbsp;</small><span class="badge tone-' + proxTone + '">' + ic('navigation') + esc(proximityLabel(v._prox.key)) + '</span></div>' +
        '</div>' +
        '<div class="sup-card__score">' +
          '<small style="color:var(--text-muted);font-size:13px">' + esc(t('vendor.sustainability_score')) + '</small>' +
          '<span class="rating tone-' + tone + '" title="' + esc(t('vendor.info_body')) + '">' + Math.round(v.sustainabilityScore) + '</span>' +
        '</div>' +
        '<details class="vendor-contact">' +
          '<summary>' + ic('chevron-down', 'vendor-contact__chev') + '<span>' + esc(t('vendor.view_contact')) + '</span></summary>' +
          '<div class="vendor-contact__body">' +
            '<div>' + ic('phone') + '<span>' + esc(v.phone) + '</span></div>' +
            '<div>' + ic('mail') + '<span>' + esc(v.email) + '</span></div>' +
            '<div>' + ic('package') + '<span>' + esc(t('vendor.min_order')) + ': ' + fmtNum(v.minOrderKg) + ' kg</span></div>' +
            (v.certifications.length ? '<div class="chips" style="margin-top:8px">' + v.certifications.map(function (c) { return '<span class="cert">' + ic('badge-check') + esc(c) + '</span>'; }).join('') + '</div>' : '') +
          '</div>' +
        '</details>' +
      '</article>'
    );
  }

  function vendorListHtml() {
    var t = window.t;
    var list = getFilteredVendors();
    if (!list.length) {
      return emptyState({ icon: 'search', title: t('vendor.no_results_title'), text: t('vendor.no_results_text') });
    }
    return '<div class="result-meta"><span>' + list.length + ' ' + esc(t('vendor.results_count')) + '</span></div><div class="grid-cards">' + list.map(vendorCardHtml).join('') + '</div>';
  }

  function refreshVendorList() {
    var box = document.getElementById('vendorList');
    if (!box) return;
    if (typeof mount === 'function') mount(box, vendorListHtml(), false);
    else box.innerHTML = vendorListHtml();
    if (typeof refreshIcons === 'function') refreshIcons();
  }

  function renderVendorDiscovery() {
    var t = window.t;
    var biz = getBusinessLocation();
    var sortOptions = [
      ['recommended', 'vendor.sort_recommended'],
      ['sustainability', 'vendor.sort_sustainability'],
      ['proximity', 'vendor.sort_proximity'],
      ['cost', 'vendor.sort_cost']
    ];
    var html =
      '<div class="section-head"><div><h2>' + esc(t('vendor.heading')) + '</h2><p>' + esc(t('vendor.subheading')) + '</p></div></div>' +
      '<details class="acc"><summary>' + ic('info') + '<span>' + esc(t('vendor.info_summary')) + '</span></summary><p>' + esc(t('vendor.info_body')) + '</p></details>' +
      (!biz || !biz.state ? '<div class="callout">' + ic('map-pin') + '<span>' + esc(t('vendor.set_location_hint')) + '</span></div>' : '') +
      '<div class="toolbar">' +
        '<div class="input-affix toolbar__search">' + ic('search') + '<input class="input" type="search" id="vendorSearch" placeholder="' + esc(t('vendor.search_placeholder')) + '" value="' + esc(vendorFilters.q) + '" aria-label="' + esc(t('vendor.search_placeholder')) + '"></div>' +
        '<select class="select select--sm" style="width:auto" id="vendorSort" aria-label="Sort vendors">' +
          sortOptions.map(function (o) { return '<option value="' + o[0] + '"' + (vendorFilters.sort === o[0] ? ' selected' : '') + '>' + esc(t(o[1])) + '</option>'; }).join('') +
        '</select>' +
      '</div>' +
      '<div id="vendorList">' + vendorListHtml() + '</div>';

    mount($('#page-vendors'), html);
    if (typeof refreshIcons === 'function') refreshIcons();

    var search = document.getElementById('vendorSearch');
    var sort = document.getElementById('vendorSort');
    var deb = typeof debounce === 'function' ? debounce : function (fn) { return fn; };
    if (search) search.addEventListener('input', deb(function (e) { vendorFilters.q = e.target.value; refreshVendorList(); }, 120));
    if (sort) sort.addEventListener('change', function (e) { vendorFilters.sort = e.target.value; refreshVendorList(); });
  }

  window.INDIA_STATES = INDIA_STATES;
  window.getBusinessLocation = getBusinessLocation;
  window.renderVendorDiscovery = renderVendorDiscovery;
})();
