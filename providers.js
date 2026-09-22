/* ==========================================================================
   EcoTrace — Provider Directory
   Suppliers, transporters and logistics providers in one searchable,
   scored directory. Every provider's sustainability score is a real
   weighted formula (see PROVIDER_SCORE_WEIGHTS/computeProviderScore) with
   a "why" — a short reasons list — behind every number, not just a flat
   badge. pipeline.js filters this list by category per stage so a stage
   can be assigned a real provider. Renders into #page-providers using the
   same helpers/CSS as the rest of the app (esc, ic, badge, mount, $,
   refreshIcons, ratingTone… all defined in script.js and available by the
   time these functions run — see the note below on why bare identifiers).
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

  /* ---------- Provider data ----------
     category: 'supplier' | 'transporter' | 'logistics'
     Every provider carries the same four raw scoring inputs
     (environmentRating, laborRating, certifications, reliabilityRating)
     plus category-specific business fields, plus a hand-written `reasons`
     list explaining the score in plain language. */
  var PROVIDERS = [
    { id: 'PRV-01', category: 'supplier', name: 'Satvik Organic Farms', materials: ['Organic Cotton'], state: 'Gujarat', city: 'Bhuj', country: 'India', phone: '+91 98250 11223', email: 'sales@satvikorganic.example', costPerKg: 165, minOrderKg: 50, yearsActive: 9, certifications: ['GOTS', 'Fair Trade'], environmentRating: 92, laborRating: 90, reliabilityRating: 88, reasons: ['GOTS and Fair Trade certified organic cotton farm', 'Rainwater harvesting cuts irrigation water use by ~40%', 'Long-standing worker cooperative with profit-sharing'] },
    { id: 'PRV-02', category: 'supplier', name: 'Vidarbha Cotton Cooperative', materials: ['Organic Cotton'], state: 'Maharashtra', city: 'Nagpur', country: 'India', phone: '+91 94220 55678', email: 'contact@vidarbhacotton.example', costPerKg: 142, minOrderKg: 100, yearsActive: 6, certifications: ['GOTS'], environmentRating: 75, laborRating: 80, reliabilityRating: 70, reasons: ['GOTS-certified but limited water-use reporting', 'Smallholder cooperative with fair pricing guarantees', 'Occasional delays during monsoon harvest season'] },
    { id: 'PRV-03', category: 'supplier', name: 'Malwa Ginning Mills', materials: ['Conventional Cotton'], state: 'Punjab', city: 'Bathinda', country: 'India', phone: '+91 98140 33221', email: 'orders@malwaginning.example', costPerKg: 98, minOrderKg: 200, yearsActive: 14, certifications: [], environmentRating: 40, laborRating: 55, reliabilityRating: 60, reasons: ['No environmental certifications on file', 'Conventional (non-organic) cotton ginning', 'Established supplier with consistent volume capacity'] },
    { id: 'PRV-04', category: 'supplier', name: 'Panipat Textile Recyclers', materials: ['Recycled Cotton'], state: 'Haryana', city: 'Panipat', country: 'India', phone: '+91 98120 66554', email: 'info@panipatrecyclers.example', costPerKg: 110, minOrderKg: 150, yearsActive: 5, certifications: ['GRS'], environmentRating: 82, laborRating: 68, reliabilityRating: 75, reasons: ['GRS-certified recycled cotton reduces virgin-fibre demand', 'Labor audit pending renewal this year', 'Growing recycling capacity in the Panipat textile hub'] },
    { id: 'PRV-05', category: 'supplier', name: 'Mysuru Silk Reelers Guild', materials: ['Silk'], state: 'Karnataka', city: 'Mysuru', country: 'India', phone: '+91 99001 44556', email: 'guild@mysuresilk.example', costPerKg: 1850, minOrderKg: 10, yearsActive: 20, certifications: ['Silk Mark'], environmentRating: 65, laborRating: 78, reliabilityRating: 80, reasons: ['Silk Mark certifies authenticity, not environmental impact', 'Traditional reeling guild with fair wage practices', 'Consistent quality across two decades of operation'] },
    { id: 'PRV-06', category: 'supplier', name: 'Murshidabad Silk House', materials: ['Silk'], state: 'West Bengal', city: 'Murshidabad', country: 'India', phone: '+91 90330 22114', email: 'sales@murshidabadsilk.example', costPerKg: 1620, minOrderKg: 15, yearsActive: 11, certifications: [], environmentRating: 55, laborRating: 60, reliabilityRating: 65, reasons: ['No third-party certifications on file', 'Small family-run silk house', 'Moderate consistency — verify labor practices before large orders'] },
    { id: 'PRV-07', category: 'supplier', name: 'Bikaner Wool Traders', materials: ['Wool'], state: 'Rajasthan', city: 'Bikaner', country: 'India', phone: '+91 94141 77889', email: 'trade@bikanerwool.example', costPerKg: 410, minOrderKg: 25, yearsActive: 15, certifications: ['Woolmark'], environmentRating: 70, laborRating: 72, reliabilityRating: 74, reasons: ['Woolmark-certified fibre quality', 'Traditional pastoral sourcing from local herders', 'Reliable but seasonal — tied to shearing cycles'] },
    { id: 'PRV-08', category: 'supplier', name: 'Hooghly Jute Mills', materials: ['Jute'], state: 'West Bengal', city: 'Hooghly', country: 'India', phone: '+91 98300 66112', email: 'export@hooghlyjute.example', costPerKg: 58, minOrderKg: 500, yearsActive: 30, certifications: ['ISO 14001'], environmentRating: 88, laborRating: 74, reliabilityRating: 85, reasons: ['ISO 14001 certified environmental management', 'Jute is biodegradable and low-input to grow', 'Decades-old mill with dependable bulk supply'] },
    { id: 'PRV-09', category: 'supplier', name: 'Kannur Flax & Linen Co.', materials: ['Linen'], state: 'Kerala', city: 'Kannur', country: 'India', phone: '+91 94470 12398', email: 'hello@kannurlinen.example', costPerKg: 520, minOrderKg: 40, yearsActive: 8, certifications: ['OEKO-TEX'], environmentRating: 80, laborRating: 82, reliabilityRating: 78, reasons: ['OEKO-TEX certified — tested for harmful substances', 'Flax needs minimal irrigation and pesticides', 'Small-batch producer; lead times can vary'] },
    { id: 'PRV-10', category: 'supplier', name: 'Himalayan Hemp Growers', materials: ['Hemp Fiber'], state: 'Uttarakhand', city: 'Dehradun', country: 'India', phone: '+91 94120 88776', email: 'coop@himalayanhemp.example', costPerKg: 340, minOrderKg: 20, yearsActive: 12, certifications: ['Fair Trade', 'B Corp'], environmentRating: 96, laborRating: 94, reliabilityRating: 90, reasons: ['Fair Trade and B Corp certified — top-tier ethical sourcing', 'Hemp needs no pesticides and regenerates soil', 'Cooperative model with transparent profit-sharing'] },
    { id: 'PRV-11', category: 'supplier', name: 'Assam Bamboo Textiles', materials: ['Bamboo'], state: 'Assam', city: 'Guwahati', country: 'India', phone: '+91 98640 55321', email: 'sales@assambamboo.example', costPerKg: 210, minOrderKg: 60, yearsActive: 7, certifications: ['FSC'], environmentRating: 90, laborRating: 76, reliabilityRating: 79, reasons: ['FSC-certified sustainable bamboo forestry', 'Fast-growing, low-water bamboo crop', 'Newer supplier with a shorter track record'] },
    { id: 'PRV-12', category: 'supplier', name: 'Surat Recycled Fibres Pvt. Ltd.', materials: ['Recycled Polyester'], state: 'Gujarat', city: 'Surat', country: 'India', phone: '+91 98980 12233', email: 'b2b@suratrecycled.example', costPerKg: 128, minOrderKg: 100, yearsActive: 10, certifications: ['GRS', 'OEKO-TEX'], environmentRating: 89, laborRating: 80, reliabilityRating: 87, reasons: ['GRS and OEKO-TEX certified recycled polyester', 'Closed-loop water treatment at the Surat facility', 'Strong, consistent fulfilment record'] },
    { id: 'PRV-13', category: 'supplier', name: 'Jaipur Natural Dye Works', materials: ['Natural Dye'], state: 'Rajasthan', city: 'Jaipur', country: 'India', phone: '+91 94140 99887', email: 'orders@jaipurdyeworks.example', costPerKg: 380, minOrderKg: 10, yearsActive: 18, certifications: ['GOTS'], environmentRating: 85, laborRating: 78, reliabilityRating: 76, reasons: ['GOTS-certified natural, plant-based dyes', 'Avoids the heavy-metal effluents of synthetic dyeing', 'Long-running family business with steady output'] },
    { id: 'PRV-14', category: 'supplier', name: 'Zhejiang Textile Group', materials: ['Conventional Cotton', 'Recycled Polyester'], state: null, city: 'Zhejiang', country: 'China', phone: '+86 571 8888 0000', email: 'trade@zhejiangtextile.example', costPerKg: 120, minOrderKg: 500, yearsActive: 22, certifications: [], environmentRating: 45, laborRating: 50, reliabilityRating: 82, reasons: ['No environmental or labor certifications on file', 'Large-scale manufacturer with high-volume capacity', 'High reliability, but international shipping adds emissions'] },
    { id: 'PRV-15', category: 'supplier', name: 'Dhaka Silk Traders', materials: ['Silk'], state: null, city: 'Dhaka', country: 'Bangladesh', phone: '+880 1711 223344', email: 'sales@dhakasilk.example', costPerKg: 1400, minOrderKg: 30, yearsActive: 9, certifications: [], environmentRating: 42, laborRating: 48, reliabilityRating: 68, reasons: ['No third-party certifications on file', 'Independent verification of labor conditions recommended', 'Longer international lead times'] },

    { id: 'PRV-16', category: 'transporter', name: 'GreenMile Road Logistics', serviceType: 'Road Freight', state: 'Gujarat', city: 'Ahmedabad', country: 'India', phone: '+91 90990 11224', email: 'ops@greenmile.example', costPerShipment: 8500, avgTransitDays: 2, onTimeRatePct: 96, yearsActive: 8, certifications: ['ISO 14001'], environmentRating: 88, laborRating: 80, reliabilityRating: 96, reasons: ['70% of the fleet runs on CNG, cutting tailpipe emissions', 'ISO 14001 certified environmental management', '96% on-time across the last 200 shipments'] },
    { id: 'PRV-17', category: 'transporter', name: 'Rajasthan Roadways Co.', serviceType: 'Road Freight', state: 'Rajasthan', city: 'Jaipur', country: 'India', phone: '+91 94131 22987', email: 'dispatch@rajroadways.example', costPerShipment: 6200, avgTransitDays: 3, onTimeRatePct: 88, yearsActive: 15, certifications: [], environmentRating: 48, laborRating: 65, reliabilityRating: 88, reasons: ['Older diesel fleet with no emissions certification', 'Established regional carrier with wide route coverage', '88% on-time; occasional delays in peak season'] },
    { id: 'PRV-18', category: 'transporter', name: 'BlueWave Sea Freight', serviceType: 'Sea Freight', state: 'Maharashtra', city: 'Mumbai', country: 'India', phone: '+91 98200 44112', email: 'bookings@bluewave.example', costPerShipment: 45000, avgTransitDays: 12, onTimeRatePct: 90, yearsActive: 20, certifications: ['ISO 14001'], environmentRating: 70, laborRating: 75, reliabilityRating: 90, reasons: ['Sea freight has a lower per-kg carbon footprint than air', 'ISO 14001 certified port operations', 'Reliable for large-volume international shipments'] },
    { id: 'PRV-19', category: 'transporter', name: 'SkyCargo Express', serviceType: 'Air Freight', state: 'Delhi', city: 'New Delhi', country: 'India', phone: '+91 98110 77332', email: 'book@skycargo.example', costPerShipment: 65000, avgTransitDays: 1, onTimeRatePct: 97, yearsActive: 10, certifications: [], environmentRating: 30, laborRating: 70, reliabilityRating: 97, reasons: ['Air freight has the highest carbon footprint per kg', 'Fastest option — 97% on-time, next-day delivery', 'Best reserved for urgent, low-volume shipments'] },
    { id: 'PRV-20', category: 'transporter', name: 'Karnataka Cold Chain Movers', serviceType: 'Refrigerated Road', state: 'Karnataka', city: 'Bengaluru', country: 'India', phone: '+91 90360 55221', email: 'ops@kcoldchain.example', costPerShipment: 12000, avgTransitDays: 3, onTimeRatePct: 92, yearsActive: 6, certifications: ['HACCP'], environmentRating: 65, laborRating: 78, reliabilityRating: 92, reasons: ['HACCP-certified cold-chain handling', 'Refrigerated units add fuel overhead vs. standard road', 'Strong track record for temperature-sensitive goods'] },
    { id: 'PRV-21', category: 'transporter', name: 'EV Fleet Chennai', serviceType: 'Electric Road Freight', state: 'Tamil Nadu', city: 'Chennai', country: 'India', phone: '+91 93840 66123', email: 'hello@evfleetchennai.example', costPerShipment: 7000, avgTransitDays: 2, onTimeRatePct: 90, yearsActive: 3, certifications: ['ISO 14001'], environmentRating: 97, laborRating: 85, reliabilityRating: 90, reasons: ['Fully electric short-haul fleet — zero tailpipe emissions', 'Newest carrier in the network; shorter track record', 'Best suited to shorter, regional routes'] },

    { id: 'PRV-22', category: 'logistics', name: 'GreenStore Warehousing', serviceType: 'Warehousing', state: 'Gujarat', city: 'Ahmedabad', country: 'India', phone: '+91 90990 22887', email: 'sales@greenstore.example', costPerMonth: 45000, renewableEnergyPct: 60, onTimeRatePct: 93, yearsActive: 9, certifications: ['ISO 14001'], environmentRating: 84, laborRating: 82, reliabilityRating: 93, reasons: ['60% of warehouse power comes from rooftop solar', 'ISO 14001 certified facility management', '93% order-accuracy and on-time dispatch rate'] },
    { id: 'PRV-23', category: 'logistics', name: 'Metro Distribution Hub', serviceType: 'Distribution Center', state: 'Maharashtra', city: 'Pune', country: 'India', phone: '+91 98221 33445', email: 'contact@metrodhub.example', costPerMonth: 38000, renewableEnergyPct: 10, onTimeRatePct: 88, yearsActive: 12, certifications: [], environmentRating: 55, laborRating: 70, reliabilityRating: 88, reasons: ['Grid power only — no renewable-energy commitment yet', 'Central location shortens last-mile delivery routes', 'Solid 88% on-time dispatch record'] },
    { id: 'PRV-24', category: 'logistics', name: 'Coastal 3PL Solutions', serviceType: '3PL Fulfilment', state: 'Tamil Nadu', city: 'Chennai', country: 'India', phone: '+91 93450 11223', email: 'partners@coastal3pl.example', costPerMonth: 52000, renewableEnergyPct: 35, onTimeRatePct: 91, yearsActive: 7, certifications: ['B Corp'], environmentRating: 78, laborRating: 88, reliabilityRating: 91, reasons: ['B Corp certified — verified social and environmental standards', 'Fair labor practices audited annually', '91% fulfilment accuracy across recent contracts'] },
    { id: 'PRV-25', category: 'logistics', name: 'Northern Cold Storage', serviceType: 'Cold Storage', state: 'Punjab', city: 'Ludhiana', country: 'India', phone: '+91 98140 55990', email: 'info@northerncold.example', costPerMonth: 60000, renewableEnergyPct: 15, onTimeRatePct: 85, yearsActive: 16, certifications: ['HACCP'], environmentRating: 60, laborRating: 65, reliabilityRating: 85, reasons: ['HACCP-certified cold-storage handling', 'High energy use for refrigeration; limited renewable offset', 'Reliable for perishable, temperature-sensitive goods'] },
    { id: 'PRV-26', category: 'logistics', name: 'EcoHub Fulfilment', serviceType: '3PL Fulfilment', state: 'Karnataka', city: 'Bengaluru', country: 'India', phone: '+91 90360 88774', email: 'grow@ecohubfulfil.example', costPerMonth: 55000, renewableEnergyPct: 70, onTimeRatePct: 89, yearsActive: 5, certifications: ['ISO 14001', 'B Corp'], environmentRating: 90, laborRating: 84, reliabilityRating: 89, reasons: ['70% renewable energy across its fulfilment centres', 'ISO 14001 and B Corp certified', 'Newer network with strong early on-time performance'] }
  ];

  /* ---------- Scoring: a real weighted formula + the "why" behind it ----------
     Mirrors script.js's SCORE_WEIGHTS/calculateSustainabilityScore pattern,
     applied to providers instead of products. */
  var PROVIDER_SCORE_WEIGHTS = [
    { key: 'environment', i18n: 'provider.factor_environment', weight: 0.35 },
    { key: 'labor', i18n: 'provider.factor_labor', weight: 0.25 },
    { key: 'certifications', i18n: 'provider.factor_certifications', weight: 0.15 },
    { key: 'reliability', i18n: 'provider.factor_reliability', weight: 0.25 }
  ];

  function certScore(certs) { return Math.min(100, (certs && certs.length ? certs.length : 0) * 34); }

  function computeProviderScore(p) {
    var t = window.t;
    var values = { environment: p.environmentRating, labor: p.laborRating, certifications: certScore(p.certifications), reliability: p.reliabilityRating };
    var parts = PROVIDER_SCORE_WEIGHTS.map(function (w) { return { key: w.key, label: t(w.i18n), weight: w.weight, value: values[w.key] }; });
    var score = parts.reduce(function (sum, pt) { return sum + pt.value * pt.weight; }, 0);
    return { score: Math.round(score), parts: parts };
  }

  var CATEGORY_ICON = { supplier: 'handshake', transporter: 'truck', logistics: 'warehouse' };
  var CATEGORY_TONE = { supplier: 'green', transporter: 'blue', logistics: 'purple' };

  function categoryLabel(cat) { return window.t('provider.category_' + cat); }

  function topProviderIdsByCategory() {
    var byCat = {};
    PROVIDERS.forEach(function (p) { (byCat[p.category] = byCat[p.category] || []).push(p); });
    var ids = [];
    Object.keys(byCat).forEach(function (cat) {
      byCat[cat]
        .slice()
        .sort(function (a, b) { return computeProviderScore(b).score - computeProviderScore(a).score; })
        .slice(0, 2)
        .forEach(function (p) { ids.push(p.id); });
    });
    return ids;
  }
  var TOP_PROVIDER_IDS = null; // computed lazily once t() is available
  function getTopProviderIds() { return TOP_PROVIDER_IDS || (TOP_PROVIDER_IDS = topProviderIdsByCategory()); }

  var providerFilters = { q: '', category: 'all', sort: 'recommended' };

  function getBusinessLocation() {
    try { return JSON.parse(localStorage.getItem('ecotrace.businessLocation')); } catch (e) { return null; }
  }

  function getProviderById(id) {
    for (var i = 0; i < PROVIDERS.length; i++) if (PROVIDERS[i].id === id) return PROVIDERS[i];
    return null;
  }

  function getProvidersByCategory(category) {
    return PROVIDERS.filter(function (p) { return p.category === category; });
  }

  function proximityInfo(provider, biz) {
    if (!provider.state) return { tier: 3, key: 'intl' };
    if (!biz || !biz.state) return { tier: 2, key: 'domestic' };
    if (provider.state === biz.state) return { tier: 0, key: 'local' };
    var bizNeighbors = STATE_ADJACENCY[biz.state] || [];
    var providerNeighbors = STATE_ADJACENCY[provider.state] || [];
    if (bizNeighbors.indexOf(provider.state) !== -1 || providerNeighbors.indexOf(biz.state) !== -1) return { tier: 1, key: 'nearby' };
    return { tier: 2, key: 'domestic' };
  }
  function proximityLabel(key) { return window.t('provider.proximity.' + key); }

  function getFilteredProviders(overrideCategory) {
    var biz = getBusinessLocation();
    var q = providerFilters.q.trim().toLowerCase();
    var cat = overrideCategory || providerFilters.category;
    var list = PROVIDERS.filter(function (p) {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      var hay = [p.name, p.city, p.state, p.country, p.serviceType].concat(p.materials || []).join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    }).map(function (p) {
      var copy = Object.assign({}, p);
      copy._prox = proximityInfo(p, biz);
      copy._score = computeProviderScore(p);
      return copy;
    });
    var sorters = {
      recommended: function (a, b) { return b._score.score - a._score.score || a._prox.tier - b._prox.tier; },
      sustainability: function (a, b) { return b._score.score - a._score.score; },
      proximity: function (a, b) { return a._prox.tier - b._prox.tier || b._score.score - a._score.score; },
      cost: function (a, b) { return costOf(a) - costOf(b); }
    };
    list.sort(sorters[providerFilters.sort] || sorters.recommended);
    return list;
  }

  function costOf(p) { return p.category === 'supplier' ? p.costPerKg : p.category === 'transporter' ? p.costPerShipment : p.costPerMonth; }
  function costLabelKey(cat) { return cat === 'supplier' ? 'provider.cost_per_kg' : cat === 'transporter' ? 'provider.cost_per_shipment' : 'provider.cost_per_month'; }
  function costUnit(cat) { return cat === 'supplier' ? '/kg' : cat === 'transporter' ? '' : '/mo'; }

  /* esc/ic/ratingTone/initials/fmtNum/$/debounce/mount/openModal/scoreParts
     are declared with const/function at the top level of script.js, which
     loads before this file runs its render calls. const/let bindings never
     copy onto `window` (only function declarations do) — so they're used
     here as bare identifiers, not window.esc etc. See the equivalent note
     in auth.js. */
  function providerFactsHtml(p) {
    var t = window.t;
    if (p.category === 'supplier') {
      return '<div><small>' + esc(t('provider.min_order')) + '</small><strong>' + fmtNum(p.minOrderKg) + ' kg</strong></div>';
    }
    if (p.category === 'transporter') {
      return '<div><small>' + esc(t('provider.avg_transit')) + '</small><strong>' + fmtNum(p.avgTransitDays) + ' ' + esc(t('provider.days')) + '</strong></div>';
    }
    return '<div><small>' + esc(t('provider.renewable_energy')) + '</small><strong>' + fmtNum(p.renewableEnergyPct) + '%</strong></div>';
  }

  function providerCardHtml(p) {
    var t = window.t;
    var tone = ratingTone(p._score.score);
    var isTop = getTopProviderIds().indexOf(p.id) !== -1;
    var proxTone = { local: 'green', nearby: 'blue', domestic: 'gray', intl: 'purple' }[p._prox.key] || 'gray';
    var place = [p.city, p.state || p.country].filter(Boolean).join(', ');
    var chips = p.category === 'supplier' ? (p.materials || []) : [p.serviceType];
    return (
      '<article class="card provider-card">' +
        '<div class="vendor-card__top">' +
          '<span class="tile tone-' + CATEGORY_TONE[p.category] + '">' + ic(CATEGORY_ICON[p.category]) + '</span>' +
          '<div style="flex:1;min-width:0">' +
            '<strong class="cell-product__name">' + esc(p.name) + '</strong>' +
            '<div class="sup-card__loc">' + ic('map-pin') + esc(place) + '</div>' +
          '</div>' +
          (isTop ? '<span class="badge tone-green">' + ic('sparkles') + esc(t('provider.top_rated')) + '</span>' : '') +
        '</div>' +
        '<div class="chips">' + chips.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div>' +
        '<div class="sup-card__grid">' +
          '<div><small>' + esc(t(costLabelKey(p.category))) + '</small><strong>₹' + fmtNum(costOf(p)) + costUnit(p.category) + '</strong></div>' +
          providerFactsHtml(p) +
        '</div>' +
        '<div class="sup-card__grid" style="margin-top:0">' +
          '<div><small>&nbsp;</small><span class="badge tone-' + proxTone + '">' + ic('navigation') + esc(proximityLabel(p._prox.key)) + '</span></div>' +
          '<div><small>&nbsp;</small><span class="badge tone-gray">' + ic('badge-check') + esc(fmtNum(p.onTimeRatePct != null ? p.onTimeRatePct : p.reliabilityRating)) + '% ' + esc(t('provider.on_time_rate')) + '</span></div>' +
        '</div>' +
        '<button class="sup-card__score" type="button" data-open-score="' + esc(p.id) + '" style="cursor:pointer;border:0;background:none;text-align:left;width:100%;padding:0" aria-label="' + esc(t('provider.score_breakdown_title')) + ' — ' + esc(p.name) + '">' +
          '<small style="color:var(--text-muted);font-size:13px">' + esc(t('provider.sustainability_score')) + '</small>' +
          '<span class="rating tone-' + tone + '">' + p._score.score + '</span>' +
        '</button>' +
        '<details class="vendor-contact">' +
          '<summary>' + ic('chevron-down', 'vendor-contact__chev') + '<span>' + esc(t('provider.view_contact')) + '</span></summary>' +
          '<div class="vendor-contact__body">' +
            '<div>' + ic('phone') + '<span>' + esc(p.phone) + '</span></div>' +
            '<div>' + ic('mail') + '<span>' + esc(p.email) + '</span></div>' +
            (p.certifications.length ? '<div class="chips" style="margin-top:8px">' + p.certifications.map(function (c) { return '<span class="cert">' + ic('badge-check') + esc(c) + '</span>'; }).join('') + '</div>' : '') +
          '</div>' +
        '</details>' +
      '</article>'
    );
  }

  function scoreBreakdownBodyHtml(p) {
    var t = window.t;
    return (
      '<div class="score-breakdown">' +
        scoreParts(p._score.parts) +
        '<div class="score-reasons"><h3>' + esc(t('provider.reasons_title')) + '</h3><ul>' +
          p.reasons.map(function (r) { return '<li>' + ic('check') + '<span>' + esc(r) + '</span></li>'; }).join('') +
        '</ul></div>' +
      '</div>'
    );
  }

  function openProviderScoreModal(id) {
    var raw = getProviderById(id);
    if (!raw) return;
    var p = Object.assign({}, raw);
    p._score = computeProviderScore(raw);
    openModal({ title: p.name, subtitle: categoryLabel(p.category), body: scoreBreakdownBodyHtml(p), size: 'sm' });
    if (typeof refreshIcons === 'function') refreshIcons();
  }

  function providerListHtml(overrideCategory) {
    var t = window.t;
    var list = getFilteredProviders(overrideCategory);
    if (!list.length) {
      return emptyState({ icon: 'search', title: t('provider.no_results_title'), text: t('provider.no_results_text') });
    }
    return '<div class="result-meta"><span>' + list.length + ' ' + esc(t('provider.results_count')) + '</span></div><div class="grid-cards">' + list.map(providerCardHtml).join('') + '</div>';
  }

  function refreshProviderList() {
    var box = document.getElementById('providerList');
    if (!box) return;
    if (typeof mount === 'function') mount(box, providerListHtml(), false);
    else box.innerHTML = providerListHtml();
    if (typeof refreshIcons === 'function') refreshIcons();
  }

  function wireProviderListClicks(container) {
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-open-score]');
      if (btn) openProviderScoreModal(btn.getAttribute('data-open-score'));
    });
  }

  function renderProviders() {
    var t = window.t;
    var biz = getBusinessLocation();
    var sortOptions = [
      ['recommended', 'provider.sort_recommended'],
      ['sustainability', 'provider.sort_sustainability'],
      ['proximity', 'provider.sort_proximity'],
      ['cost', 'provider.sort_cost']
    ];
    var categoryOptions = [
      ['all', 'provider.category_all'],
      ['supplier', 'provider.category_supplier'],
      ['transporter', 'provider.category_transporter'],
      ['logistics', 'provider.category_logistics']
    ];
    var html =
      '<div class="section-head"><div><h2>' + esc(t('provider.heading')) + '</h2><p>' + esc(t('provider.subheading')) + '</p></div></div>' +
      '<details class="acc"><summary>' + ic('info') + '<span>' + esc(t('provider.info_summary')) + '</span></summary><p>' + esc(t('provider.info_body')) + '</p></details>' +
      (!biz || !biz.state ? '<div class="callout">' + ic('map-pin') + '<span>' + esc(t('provider.set_location_hint')) + '</span></div>' : '') +
      '<div class="toolbar">' +
        '<div class="input-affix toolbar__search">' + ic('search') + '<input class="input" type="search" id="providerSearch" placeholder="' + esc(t('provider.search_placeholder')) + '" value="' + esc(providerFilters.q) + '" aria-label="' + esc(t('provider.search_placeholder')) + '"></div>' +
        '<select class="select select--sm" style="width:auto" id="providerCategory" aria-label="Filter by category">' +
          categoryOptions.map(function (o) { return '<option value="' + o[0] + '"' + (providerFilters.category === o[0] ? ' selected' : '') + '>' + esc(t(o[1])) + '</option>'; }).join('') +
        '</select>' +
        '<select class="select select--sm" style="width:auto" id="providerSort" aria-label="Sort providers">' +
          sortOptions.map(function (o) { return '<option value="' + o[0] + '"' + (providerFilters.sort === o[0] ? ' selected' : '') + '>' + esc(t(o[1])) + '</option>'; }).join('') +
        '</select>' +
      '</div>' +
      '<div id="providerList">' + providerListHtml() + '</div>';

    var el = $('#page-providers');
    mount(el, html);
    wireProviderListClicks(el);
    if (typeof refreshIcons === 'function') refreshIcons();

    var search = document.getElementById('providerSearch');
    var category = document.getElementById('providerCategory');
    var sort = document.getElementById('providerSort');
    var deb = typeof debounce === 'function' ? debounce : function (fn) { return fn; };
    if (search) search.addEventListener('input', deb(function (e) { providerFilters.q = e.target.value; refreshProviderList(); }, 120));
    if (category) category.addEventListener('change', function (e) { providerFilters.category = e.target.value; refreshProviderList(); });
    if (sort) sort.addEventListener('change', function (e) { providerFilters.sort = e.target.value; refreshProviderList(); });
  }

  window.INDIA_STATES = INDIA_STATES;
  window.getBusinessLocation = getBusinessLocation;
  window.PROVIDERS = PROVIDERS;
  window.getProviderById = getProviderById;
  window.getProvidersByCategory = getProvidersByCategory;
  window.computeProviderScore = computeProviderScore;
  window.proximityInfo = proximityInfo;
  window.proximityLabel = proximityLabel;
  window.categoryLabel = categoryLabel;
  window.CATEGORY_ICON = CATEGORY_ICON;
  window.CATEGORY_TONE = CATEGORY_TONE;
  window.openProviderScoreModal = openProviderScoreModal;
  window.renderProviders = renderProviders;
  window.refreshProviderList = refreshProviderList;
})();
