/* ==========================================================================
   EcoTrace — i18n
   Lightweight English / Hindi dictionary + DOM translation helper.
   Loaded before script.js. Exposes: t(key), applyI18n(root), setLanguage(lang).
   Nothing here touches the existing app's markup or logic — it only
   translates elements that opt in via data-i18n[-*] attributes, plus the
   dynamic strings the new Vendor Discovery / Auth modules build with t().
   ========================================================================== */
(function () {
  'use strict';

  var I18N = {
    en: {
      'brand.tagline': 'Sustainable Supply Chain Tracker',

      'nav.dashboard': 'Dashboard',
      'nav.products': 'Products',
      'nav.suppliers': 'Suppliers',
      'nav.materials': 'Materials',
      'nav.sustainability': 'Sustainability',
      'nav.vendors': 'Vendor Discovery',
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
      'auth.onboard_sub': 'This appears on your dashboard and helps us find nearby vendors.',
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

      'vendor.heading': 'Vendor discovery',
      'vendor.subheading': 'Find raw-material vendors and compare by distance, cost and sustainability.',
      'vendor.search_placeholder': 'Search raw materials — cotton, silk, jute…',
      'vendor.sort_recommended': 'Sort: Recommended',
      'vendor.sort_sustainability': 'Sort: Sustainability score',
      'vendor.sort_proximity': 'Sort: Nearest first',
      'vendor.sort_cost': 'Sort: Cost — low to high',
      'vendor.info_summary': 'How sustainability scores work',
      'vendor.info_body': "Each vendor's score blends environmental impact, fair-labor practices, certifications and recycled or organic material content into one 0–100 rating. Higher-scoring vendors are pinned to the top of your results.",
      'vendor.top_rated': 'Top rated',
      'vendor.sustainability_score': 'Sustainability score',
      'vendor.view_contact': 'View contact details',
      'vendor.phone': 'Phone',
      'vendor.email': 'Email',
      'vendor.cost': 'Cost',
      'vendor.min_order': 'Min. order',
      'vendor.materials_offered': 'Materials offered',
      'vendor.no_results_title': 'No vendors match',
      'vendor.no_results_text': 'Try a different material keyword.',
      'vendor.results_count': 'vendors found',
      'vendor.proximity.local': 'In your state',
      'vendor.proximity.nearby': 'Neighbouring state',
      'vendor.proximity.domestic': 'Elsewhere in India',
      'vendor.proximity.intl': 'International',
      'vendor.set_location_hint': 'Add your business state in Settings to sort by proximity.',

      'settings.account_title': 'Business account',
      'settings.account_desc': 'Your phone verification and business location.',
      'settings.account_phone': 'Phone number',
      'settings.account_location': 'Location',
      'settings.account_signout': 'Sign out'
    },
    hi: {
      'brand.tagline': 'टिकाऊ आपूर्ति श्रृंखला ट्रैकर',

      'nav.dashboard': 'डैशबोर्ड',
      'nav.products': 'उत्पाद',
      'nav.suppliers': 'आपूर्तिकर्ता',
      'nav.materials': 'सामग्री',
      'nav.sustainability': 'स्थिरता',
      'nav.vendors': 'विक्रेता खोज',
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
      'auth.onboard_sub': 'यह आपके डैशबोर्ड पर दिखाई देता है और नज़दीकी विक्रेता खोजने में मदद करता है।',
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

      'vendor.heading': 'विक्रेता खोज',
      'vendor.subheading': 'कच्चे माल के विक्रेता खोजें और दूरी, लागत व स्थिरता के आधार पर तुलना करें।',
      'vendor.search_placeholder': 'कच्चा माल खोजें — कपास, रेशम, जूट…',
      'vendor.sort_recommended': 'क्रमबद्ध करें: अनुशंसित',
      'vendor.sort_sustainability': 'क्रमबद्ध करें: स्थिरता स्कोर',
      'vendor.sort_proximity': 'क्रमबद्ध करें: निकटतम पहले',
      'vendor.sort_cost': 'क्रमबद्ध करें: लागत — कम से अधिक',
      'vendor.info_summary': 'स्थिरता स्कोर कैसे काम करता है',
      'vendor.info_body': 'प्रत्येक विक्रेता का स्कोर पर्यावरणीय प्रभाव, निष्पक्ष श्रम प्रथाओं, प्रमाणपत्रों और पुनर्नवीनीकरण या जैविक सामग्री को एक 0–100 रेटिंग में मिलाता है। उच्च स्कोर वाले विक्रेता आपके परिणामों के शीर्ष पर रखे जाते हैं।',
      'vendor.top_rated': 'सर्वश्रेष्ठ रेटेड',
      'vendor.sustainability_score': 'स्थिरता स्कोर',
      'vendor.view_contact': 'संपर्क विवरण देखें',
      'vendor.phone': 'फ़ोन',
      'vendor.email': 'ईमेल',
      'vendor.cost': 'लागत',
      'vendor.min_order': 'न्यूनतम ऑर्डर',
      'vendor.materials_offered': 'उपलब्ध सामग्री',
      'vendor.no_results_title': 'कोई विक्रेता मेल नहीं खाता',
      'vendor.no_results_text': 'एक अलग सामग्री खोजशब्द आज़माएं।',
      'vendor.results_count': 'विक्रेता मिले',
      'vendor.proximity.local': 'आपके राज्य में',
      'vendor.proximity.nearby': 'पड़ोसी राज्य',
      'vendor.proximity.domestic': 'भारत में अन्यत्र',
      'vendor.proximity.intl': 'अंतरराष्ट्रीय',
      'vendor.set_location_hint': 'निकटता के अनुसार क्रमबद्ध करने के लिए सेटिंग्स में अपना व्यवसाय राज्य जोड़ें।',

      'settings.account_title': 'व्यवसाय खाता',
      'settings.account_desc': 'आपका फ़ोन सत्यापन और व्यवसाय स्थान।',
      'settings.account_phone': 'फ़ोन नंबर',
      'settings.account_location': 'स्थान',
      'settings.account_signout': 'साइन आउट करें'
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
