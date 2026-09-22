/* ==========================================================================
   EcoTrace — i18n
   Lightweight English / Hindi dictionary + DOM translation helper.
   Loaded before script.js. Exposes: t(key), applyI18n(root), setLanguage(lang).
   Nothing here touches the existing app's markup or logic — it only
   translates elements that opt in via data-i18n[-*] attributes, plus the
   dynamic strings the Provider Directory / Pipeline / Auth modules build
   with t().
   ========================================================================== */
(function () {
  'use strict';

  var I18N = {
    en: {
      'brand.tagline': 'Sustainable Supply Chain Tracker',

      'nav.dashboard': 'Dashboard',
      'nav.pipeline': 'Pipeline',
      'nav.products': 'Products',
      'nav.suppliers': 'Suppliers',
      'nav.materials': 'Materials',
      'nav.sustainability': 'Sustainability',
      'nav.providers': 'Providers',
      'nav.consumer': 'Consumer View',
      'nav.settings': 'Settings',

      'topbar.menu_toggle': 'Open navigation',
      'topbar.search_aria': 'Search products, suppliers and materials',
      'topbar.search_placeholder': 'Search products, suppliers, materials',
      'topbar.notifications': 'Notifications',
      'topbar.menu_business_settings': 'Business settings',
      'topbar.menu_consumer_view': 'Consumer view',
      'topbar.menu_switch_theme': 'Switch theme',
      'topbar.menu_export': 'Export data',
      'topbar.lang_toggle': 'Switch language',

      'auth.phone_title': 'Welcome to EcoTrace',
      'auth.phone_sub': "Sign in with your phone number to manage your supply chain.",
      'auth.phone_label': 'Phone number',
      'auth.phone_placeholder': '10-digit mobile number',
      'auth.send_otp': 'Send OTP',
      'auth.invalid_phone': 'Enter a valid 10-digit phone number.',
      'auth.otp_title': 'Verify your number',
      'auth.otp_sub': 'Enter the 4-digit code sent to',
      'auth.otp_demo': 'Demo mode — no SMS is sent. Your code is',
      'auth.invalid_otp': "That code doesn't match. Try again.",
      'auth.verify': 'Verify & continue',
      'auth.resend': 'Resend code',
      'auth.resend_in': 'Resend in',
      'auth.change_number': 'Change number',
      'auth.onboard_title': 'Tell us about your business',
      'auth.onboard_sub': 'This appears on your dashboard and helps us find nearby providers.',
      'auth.your_name': 'Your name',
      'auth.your_name_placeholder': 'e.g. Priya Sharma',
      'auth.business_name': 'Business name',
      'auth.business_name_placeholder': 'e.g. GreenLeaf Co.',
      'auth.state': 'State',
      'auth.select_state': 'Select your state',
      'auth.city': 'City / Location',
      'auth.city_placeholder': 'e.g. Ahmedabad',
      'auth.pin': 'PIN code',
      'auth.pin_placeholder': '6-digit PIN code',
      'auth.pin_invalid': 'Enter a valid 6-digit PIN code.',
      'auth.finish': 'Create account',
      'auth.signed_in': 'Signed in successfully.',
      'auth.not_registered_title': "You're not on the team yet",
      'auth.not_registered_body': "This number isn't registered. Ask your Owner to add you from Settings → Team, then try again.",
      'auth.back': 'Back',

      'role.owner': 'Owner',
      'role.procurement': 'Procurement',
      'role.logistics': 'Logistics',
      'role.production': 'Production',
      'role.viewer': 'Viewer',

      'team.title': 'Team',
      'team.desc': 'People who can sign in and update your supply chain.',
      'team.you': 'you',
      'team.remove': 'Remove',
      'team.phone': 'Phone number',
      'team.name': 'Name',
      'team.role': 'Role',
      'team.add': 'Add teammate',
      'team.added': 'Added',
      'team.duplicate': 'That phone number is already on the team.',
      'team.empty_hint': 'Only the Owner can add teammates.',
      'team.switch_user': 'Switch user',
      'team.switched_to': 'Switched to',

      'settings.account_title': 'Business account',
      'settings.account_desc': 'Your phone verification and business location.',
      'settings.signed_in_as': 'Signed in as',
      'settings.account_phone': 'Phone number',
      'settings.account_location': 'Location',
      'settings.account_signout': 'Sign out',

      'provider.heading': 'Provider directory',
      'provider.subheading': 'Compare suppliers, transporters and logistics partners for every stage of your supply chain.',
      'provider.search_placeholder': 'Search by name, material, service or location…',
      'provider.category_all': 'All categories',
      'provider.category_supplier': 'Suppliers',
      'provider.category_transporter': 'Transporters',
      'provider.category_logistics': 'Logistics providers',
      'provider.sort_recommended': 'Sort: Recommended',
      'provider.sort_sustainability': 'Sort: Sustainability score',
      'provider.sort_proximity': 'Sort: Nearest first',
      'provider.sort_cost': 'Sort: Cost — low to high',
      'provider.info_summary': 'How sustainability scores work',
      'provider.info_body': "Each provider's score blends environmental impact, fair-labor practices, certifications and reliability into one 0–100 rating, each weighted differently. Tap a score to see the exact breakdown and the reasons behind it.",
      'provider.top_rated': 'Top rated',
      'provider.sustainability_score': 'Sustainability score',
      'provider.score_breakdown_title': 'Score breakdown',
      'provider.reasons_title': 'Why this score',
      'provider.factor_environment': 'Environmental impact',
      'provider.factor_labor': 'Fair labor practices',
      'provider.factor_certifications': 'Certifications',
      'provider.factor_reliability': 'Reliability',
      'provider.view_contact': 'View contact details',
      'provider.cost': 'Cost',
      'provider.cost_per_kg': 'Cost per kg',
      'provider.cost_per_shipment': 'Cost per shipment',
      'provider.cost_per_month': 'Cost per month',
      'provider.min_order': 'Min. order',
      'provider.avg_transit': 'Avg. transit',
      'provider.days': 'days',
      'provider.on_time_rate': 'on-time',
      'provider.renewable_energy': 'Renewable energy',
      'provider.no_results_title': 'No providers match',
      'provider.no_results_text': 'Try a different search term or category.',
      'provider.results_count': 'providers found',
      'provider.proximity.local': 'In your state',
      'provider.proximity.nearby': 'Neighbouring state',
      'provider.proximity.domestic': 'Elsewhere in India',
      'provider.proximity.intl': 'International',
      'provider.set_location_hint': 'Add your business state in Settings to sort by proximity.',

      'pipeline.heading': 'Supply chain pipeline',
      'pipeline.subheading': 'Track every stage of your business, assign providers, and update status as things move.',
      'pipeline.stage.sourcing': 'Sourcing',
      'pipeline.stage.manufacturing': 'Manufacturing',
      'pipeline.stage.quality': 'Quality check',
      'pipeline.stage.warehousing': 'Warehousing',
      'pipeline.stage.transportation': 'Transportation',
      'pipeline.stage.delivery': 'Delivery',
      'pipeline.status.not_started': 'Not started',
      'pipeline.status.in_progress': 'In progress',
      'pipeline.status.completed': 'Completed',
      'pipeline.status.blocked': 'Blocked',
      'pipeline.internal_stage': 'Handled internally — no external provider needed',
      'pipeline.provider': 'Assigned provider',
      'pipeline.no_provider': 'No provider assigned',
      'pipeline.assign_provider': 'Assign provider',
      'pipeline.change_provider': 'Change provider',
      'pipeline.choose_provider_title': 'Choose a provider for',
      'pipeline.choose': 'Choose',
      'pipeline.assigned_note': 'Assigned',
      'pipeline.updates': 'Updates',
      'pipeline.no_updates': 'No updates yet.',
      'pipeline.update_status': 'Update status',
      'pipeline.add_update': 'Add a note (optional)',
      'pipeline.update_placeholder': "What's the latest on this stage?",
      'pipeline.post_update': 'Post update',
      'pipeline.update_posted': 'Update posted.',
      'pipeline.read_only_hint': 'You can view this stage, but only its role (or the Owner) can update it.'
    },
    hi: {
      'brand.tagline': 'टिकाऊ आपूर्ति श्रृंखला ट्रैकर',

      'nav.dashboard': 'डैशबोर्ड',
      'nav.pipeline': 'पाइपलाइन',
      'nav.products': 'उत्पाद',
      'nav.suppliers': 'आपूर्तिकर्ता',
      'nav.materials': 'सामग्री',
      'nav.sustainability': 'स्थिरता',
      'nav.providers': 'प्रदाता',
      'nav.consumer': 'उपभोक्ता दृश्य',
      'nav.settings': 'सेटिंग्स',

      'topbar.menu_toggle': 'नेविगेशन खोलें',
      'topbar.search_aria': 'उत्पाद, आपूर्तिकर्ता और सामग्री खोजें',
      'topbar.search_placeholder': 'उत्पाद, आपूर्तिकर्ता, सामग्री खोजें',
      'topbar.notifications': 'सूचनाएं',
      'topbar.menu_business_settings': 'व्यवसाय सेटिंग्स',
      'topbar.menu_consumer_view': 'उपभोक्ता दृश्य',
      'topbar.menu_switch_theme': 'थीम बदलें',
      'topbar.menu_export': 'डेटा निर्यात करें',
      'topbar.lang_toggle': 'भाषा बदलें',

      'auth.phone_title': 'EcoTrace में आपका स्वागत है',
      'auth.phone_sub': 'अपनी आपूर्ति श्रृंखला प्रबंधित करने के लिए अपने फ़ोन नंबर से साइन इन करें।',
      'auth.phone_label': 'फ़ोन नंबर',
      'auth.phone_placeholder': '10 अंकों का मोबाइल नंबर',
      'auth.send_otp': 'OTP भेजें',
      'auth.invalid_phone': 'एक मान्य 10 अंकों का फ़ोन नंबर दर्ज करें।',
      'auth.otp_title': 'अपना नंबर सत्यापित करें',
      'auth.otp_sub': 'भेजा गया 4 अंकों का कोड दर्ज करें',
      'auth.otp_demo': 'डेमो मोड — कोई SMS नहीं भेजा जाता। आपका कोड है',
      'auth.invalid_otp': 'यह कोड मेल नहीं खाता। पुनः प्रयास करें।',
      'auth.verify': 'सत्यापित करें और जारी रखें',
      'auth.resend': 'कोड पुनः भेजें',
      'auth.resend_in': 'में पुनः भेजें',
      'auth.change_number': 'नंबर बदलें',
      'auth.onboard_title': 'अपने व्यवसाय के बारे में बताएं',
      'auth.onboard_sub': 'यह आपके डैशबोर्ड पर दिखाई देता है और नज़दीकी प्रदाता खोजने में मदद करता है।',
      'auth.your_name': 'आपका नाम',
      'auth.your_name_placeholder': 'उदा. प्रिया शर्मा',
      'auth.business_name': 'व्यवसाय का नाम',
      'auth.business_name_placeholder': 'उदा. GreenLeaf Co.',
      'auth.state': 'राज्य',
      'auth.select_state': 'अपना राज्य चुनें',
      'auth.city': 'शहर / स्थान',
      'auth.city_placeholder': 'उदा. अहमदाबाद',
      'auth.pin': 'पिन कोड',
      'auth.pin_placeholder': '6 अंकों का पिन कोड',
      'auth.pin_invalid': 'एक मान्य 6 अंकों का पिन कोड दर्ज करें।',
      'auth.finish': 'खाता बनाएं',
      'auth.signed_in': 'सफलतापूर्वक साइन इन हुआ।',
      'auth.not_registered_title': 'आप अभी टीम में नहीं हैं',
      'auth.not_registered_body': 'यह नंबर पंजीकृत नहीं है। अपने ओनर से सेटिंग्स → टीम में जोड़ने के लिए कहें, फिर पुनः प्रयास करें।',
      'auth.back': 'वापस',

      'role.owner': 'ओनर',
      'role.procurement': 'खरीद',
      'role.logistics': 'लॉजिस्टिक्स',
      'role.production': 'उत्पादन',
      'role.viewer': 'दर्शक',

      'team.title': 'टीम',
      'team.desc': 'जो लोग साइन इन करके आपकी आपूर्ति श्रृंखला अपडेट कर सकते हैं।',
      'team.you': 'आप',
      'team.remove': 'हटाएं',
      'team.phone': 'फ़ोन नंबर',
      'team.name': 'नाम',
      'team.role': 'भूमिका',
      'team.add': 'टीम सदस्य जोड़ें',
      'team.added': 'जोड़ा गया',
      'team.duplicate': 'यह फ़ोन नंबर पहले से टीम में है।',
      'team.empty_hint': 'केवल ओनर टीम सदस्य जोड़ सकता है।',
      'team.switch_user': 'उपयोगकर्ता बदलें',
      'team.switched_to': 'बदल दिया गया',

      'settings.account_title': 'व्यवसाय खाता',
      'settings.account_desc': 'आपका फ़ोन सत्यापन और व्यवसाय स्थान।',
      'settings.signed_in_as': 'इस रूप में साइन इन है',
      'settings.account_phone': 'फ़ोन नंबर',
      'settings.account_location': 'स्थान',
      'settings.account_signout': 'साइन आउट करें',

      'provider.heading': 'प्रदाता निर्देशिका',
      'provider.subheading': 'अपनी आपूर्ति श्रृंखला के हर चरण के लिए आपूर्तिकर्ताओं, परिवहनकर्ताओं और लॉजिस्टिक्स भागीदारों की तुलना करें।',
      'provider.search_placeholder': 'नाम, सामग्री, सेवा या स्थान से खोजें…',
      'provider.category_all': 'सभी श्रेणियां',
      'provider.category_supplier': 'आपूर्तिकर्ता',
      'provider.category_transporter': 'परिवहनकर्ता',
      'provider.category_logistics': 'लॉजिस्टिक्स प्रदाता',
      'provider.sort_recommended': 'क्रमबद्ध करें: अनुशंसित',
      'provider.sort_sustainability': 'क्रमबद्ध करें: स्थिरता स्कोर',
      'provider.sort_proximity': 'क्रमबद्ध करें: निकटतम पहले',
      'provider.sort_cost': 'क्रमबद्ध करें: लागत — कम से अधिक',
      'provider.info_summary': 'स्थिरता स्कोर कैसे काम करता है',
      'provider.info_body': 'प्रत्येक प्रदाता का स्कोर पर्यावरणीय प्रभाव, निष्पक्ष श्रम प्रथाओं, प्रमाणपत्रों और विश्वसनीयता को अलग-अलग भार के साथ एक 0–100 रेटिंग में मिलाता है। पूरा विवरण देखने के लिए स्कोर पर टैप करें।',
      'provider.top_rated': 'सर्वश्रेष्ठ रेटेड',
      'provider.sustainability_score': 'स्थिरता स्कोर',
      'provider.score_breakdown_title': 'स्कोर विवरण',
      'provider.reasons_title': 'यह स्कोर क्यों',
      'provider.factor_environment': 'पर्यावरणीय प्रभाव',
      'provider.factor_labor': 'निष्पक्ष श्रम प्रथाएं',
      'provider.factor_certifications': 'प्रमाणपत्र',
      'provider.factor_reliability': 'विश्वसनीयता',
      'provider.view_contact': 'संपर्क विवरण देखें',
      'provider.cost': 'लागत',
      'provider.cost_per_kg': 'प्रति किग्रा लागत',
      'provider.cost_per_shipment': 'प्रति शिपमेंट लागत',
      'provider.cost_per_month': 'प्रति माह लागत',
      'provider.min_order': 'न्यूनतम ऑर्डर',
      'provider.avg_transit': 'औसत परिवहन समय',
      'provider.days': 'दिन',
      'provider.on_time_rate': 'समय पर',
      'provider.renewable_energy': 'नवीकरणीय ऊर्जा',
      'provider.no_results_title': 'कोई प्रदाता मेल नहीं खाता',
      'provider.no_results_text': 'एक अलग खोजशब्द या श्रेणी आज़माएं।',
      'provider.results_count': 'प्रदाता मिले',
      'provider.proximity.local': 'आपके राज्य में',
      'provider.proximity.nearby': 'पड़ोसी राज्य',
      'provider.proximity.domestic': 'भारत में अन्यत्र',
      'provider.proximity.intl': 'अंतरराष्ट्रीय',
      'provider.set_location_hint': 'निकटता के अनुसार क्रमबद्ध करने के लिए सेटिंग्स में अपना व्यवसाय राज्य जोड़ें।',

      'pipeline.heading': 'आपूर्ति श्रृंखला पाइपलाइन',
      'pipeline.subheading': 'अपने व्यवसाय के हर चरण को ट्रैक करें, प्रदाता नियुक्त करें, और स्थिति अपडेट करें।',
      'pipeline.stage.sourcing': 'सोर्सिंग',
      'pipeline.stage.manufacturing': 'विनिर्माण',
      'pipeline.stage.quality': 'गुणवत्ता जांच',
      'pipeline.stage.warehousing': 'गोदाम भंडारण',
      'pipeline.stage.transportation': 'परिवहन',
      'pipeline.stage.delivery': 'डिलीवरी',
      'pipeline.status.not_started': 'शुरू नहीं हुआ',
      'pipeline.status.in_progress': 'प्रगति में',
      'pipeline.status.completed': 'पूर्ण',
      'pipeline.status.blocked': 'अवरुद्ध',
      'pipeline.internal_stage': 'आंतरिक रूप से संभाला गया — किसी बाहरी प्रदाता की आवश्यकता नहीं',
      'pipeline.provider': 'नियुक्त प्रदाता',
      'pipeline.no_provider': 'कोई प्रदाता नियुक्त नहीं',
      'pipeline.assign_provider': 'प्रदाता नियुक्त करें',
      'pipeline.change_provider': 'प्रदाता बदलें',
      'pipeline.choose_provider_title': 'के लिए एक प्रदाता चुनें',
      'pipeline.choose': 'चुनें',
      'pipeline.assigned_note': 'नियुक्त किया गया',
      'pipeline.updates': 'अपडेट',
      'pipeline.no_updates': 'अभी तक कोई अपडेट नहीं।',
      'pipeline.update_status': 'स्थिति अपडेट करें',
      'pipeline.add_update': 'एक नोट जोड़ें (वैकल्पिक)',
      'pipeline.update_placeholder': 'इस चरण पर नवीनतम क्या है?',
      'pipeline.post_update': 'अपडेट पोस्ट करें',
      'pipeline.update_posted': 'अपडेट पोस्ट किया गया।',
      'pipeline.read_only_hint': 'आप इस चरण को देख सकते हैं, लेकिन केवल इसकी भूमिका (या ओनर) ही इसे अपडेट कर सकती है।'
    }
  };

  var currentLang = 'en';
  try { currentLang = localStorage.getItem('ecotrace.lang') || 'en'; } catch (e) { /* ignore */ }
  if (currentLang !== 'en' && currentLang !== 'hi') currentLang = 'en';

  function t(key) {
    var dict = I18N[currentLang] || I18N.en;
    return dict[key] || I18N.en[key] || key;
  }

  function applyI18n(root) {
    var scope = root || document;
    var walk = function (attr, apply) {
      var nodes = scope.querySelectorAll('[' + attr + ']');
      for (var i = 0; i < nodes.length; i++) apply(nodes[i], nodes[i].getAttribute(attr));
    };
    walk('data-i18n', function (el, key) { el.textContent = t(key); });
    walk('data-i18n-placeholder', function (el, key) { el.setAttribute('placeholder', t(key)); });
    walk('data-i18n-aria-label', function (el, key) { el.setAttribute('aria-label', t(key)); });
    walk('data-i18n-title', function (el, key) { el.setAttribute('title', t(key)); });

    var langBtn = document.getElementById('langToggle');
    if (langBtn) {
      langBtn.textContent = currentLang === 'hi' ? 'हिं' : 'EN';
      langBtn.setAttribute('aria-label', t('topbar.lang_toggle'));
      langBtn.setAttribute('aria-pressed', String(currentLang === 'hi'));
    }
    document.documentElement.setAttribute('lang', currentLang === 'hi' ? 'hi' : 'en');
  }

  function setLanguage(lang) {
    currentLang = lang === 'hi' ? 'hi' : 'en';
    try { localStorage.setItem('ecotrace.lang', currentLang); } catch (e) { /* ignore */ }
    applyI18n();
    if (typeof window.renderCurrentPage === 'function') { try { window.renderCurrentPage(); } catch (e) { /* app not ready */ } }
    document.dispatchEvent(new CustomEvent('ecotrace:langchange', { detail: { lang: currentLang } }));
  }

  function getLang() { return currentLang; }

  applyI18n();
  document.addEventListener('DOMContentLoaded', function () { applyI18n(); });
  var btn = document.getElementById('langToggle');
  if (btn) btn.addEventListener('click', function () { setLanguage(currentLang === 'en' ? 'hi' : 'en'); });

  window.t = t;
  window.applyI18n = applyI18n;
  window.setLanguage = setLanguage;
  window.getLang = getLang;
})();
