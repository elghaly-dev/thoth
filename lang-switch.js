// Language switch for the static pages: हिन्दी (default) · العربية · 中文.
// The page markup is Hindi; ?lang=ar or ?lang=zh swaps the text of every
// [data-i18n] element, sets <html lang/dir> and carries the language on to
// /use/. Nothing is stored. Credits ("by Elghaly LLC", "Wyndham Heaven")
// are never translated.
(function () {
  'use strict';
  // Arabic and Chinese lines are machine-drafted: [VERIFY] by native speakers.
  var T = {
    ar: {
      'title.home': 'Thoth — الخادم الأمين للمصدّرين',
      'title.404': 'Thoth — الصفحة غير موجودة',
      'title.agent': 'اسأل Thoth',
      mark: 'الخادم الأمين للمصدّرين',
      name: 'Thoth',
      line: 'خادم أمين متعدد اللغات يعمل بالصوت، يساعد المصدّرين على التحدث مع المشترين في الخارج بلغتهم.',
      badge: 'لكل مصدّر، صغيرًا كان أو كبيرًا',
      cta: 'افتح Thoth',
      notFound: 'لم يتم العثور على هذه الصفحة.',
      home: 'الصفحة الرئيسية',
      'agent.h1': 'اسأل Thoth',
      'agent.lead': 'Thoth خادم أمين للمصدّرين. اسأله هنا في متصفحك، بمزوّد النموذج والمفتاح اللذين تختارهما. للصوت والترجمة المباشرة في الاتجاهين، افتح',
      'agent.app': 'تطبيق Thoth الكامل',
      'agent.tools': 'ماذا يفعل Thoth',
      'agent.languages': 'اللغات:',
      'agent.charter': 'وعود Thoth',
      'agent.cannot': 'ما لا يستطيع Thoth فعله',
      'agent.ask': 'اسأل Thoth',
      'agent.askText': 'اسأل عمّا يقدّمه Thoth، أو احصل على عرض صادق للمشتري من معلوماتك، أو ترجم رسالة لمشتريك، أو اسأل عن أساسيات التصدير مثل FOB وCIF.',
      'agent.note': 'رسائلك ومعلومات هذه الصفحة تذهب إلى مزوّد النموذج الذي تختاره في الإعدادات أدناه؛ وطريقة تعامله معها خارجة عن هذه الصفحة. استخدم مفتاحًا له حدّ إنفاق.',
      'agent.status': 'جارٍ توصيل المساعد… إذا بقيت هذه الرسالة، فلم يتم تحميل المساعد. ما زال بإمكانك قراءة هذه الصفحة واستخدام تطبيق Thoth الكامل.',
      'agent.lead2': '.',
      'agent.f1': 'يعمل هذا المساعد في متصفحك. شبكة الوكلاء الخاصة به منشورة علنًا في',
      'agent.f2': '، ووصفها في',
      'agent.f3': '. بيئة التشغيل في المتصفح: Apache-2.0، من مشروع Open Agentic Web (انظر runtime/LICENSE.txt).'
    },
    zh: {
      'title.home': 'Thoth — 为出口商打造的 Faithful Servant',
      'title.404': 'Thoth — 找不到页面',
      'title.agent': '问问 Thoth',
      mark: '为出口商打造的 Faithful Servant',
      name: 'Thoth',
      line: '以语音为主的多语言 Faithful Servant，帮助出口商用买家自己的语言与海外买家沟通。',
      badge: '面向每一位出口商，无论大小',
      cta: '打开 Thoth',
      notFound: '找不到此页面。',
      home: '首页',
      'agent.h1': '问问 Thoth',
      'agent.lead': 'Thoth 是为出口商打造的 Faithful Servant。您可以在浏览器里，用自己选择的模型服务商和密钥向它提问。如需语音和实时双向翻译，请打开',
      'agent.app': '完整的 Thoth 应用',
      'agent.tools': 'Thoth 能做什么',
      'agent.languages': '语言：',
      'agent.charter': 'Thoth 的承诺',
      'agent.cannot': 'Thoth 不能做什么',
      'agent.ask': '问问 Thoth',
      'agent.askText': '问问 Thoth 提供什么，用您自己的信息生成一份诚实的买家推介，为买家翻译一条消息，或询问 FOB、CIF 等出口基础知识。',
      'agent.note': '您的消息和本页的信息会发送给您在下方设置中选择的模型服务商；该服务商如何处理不在本页控制范围内。请使用设有消费上限的密钥。',
      'agent.status': '正在连接助手……如果这条消息一直不消失，说明助手没有加载。您仍然可以阅读本页并使用完整的 Thoth 应用。',
      'agent.lead2': '。',
      'agent.f1': '这个助手在您的浏览器中运行。它的代理网络公开发布在',
      'agent.f2': '，说明见',
      'agent.f3': '。浏览器运行环境：Apache-2.0，来自 Open Agentic Web 项目（见 runtime/LICENSE.txt）。'
    }
  };
  var LANGS = ['hi', 'ar', 'zh'];

  function current() {
    var q = '';
    try { q = new URLSearchParams(window.location.search).get('lang') || ''; } catch (e) {}
    return LANGS.indexOf(q) >= 0 ? q : 'hi';
  }

  function apply() {
    var lang = current();
    var root = document.documentElement;
    var nodes = document.querySelectorAll('[data-i18n]');
    var links = document.querySelectorAll('[data-lang-link]');
    for (var i = 0; i < links.length; i++) {
      var on = links[i].getAttribute('data-lang-link') === lang;
      if (on) links[i].setAttribute('aria-current', 'true'); else links[i].removeAttribute('aria-current');
    }
    if (lang === 'hi') return;
    var t = T[lang];
    root.lang = lang === 'zh' ? 'zh-CN' : 'ar';
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    for (var j = 0; j < nodes.length; j++) {
      var k = nodes[j].getAttribute('data-i18n');
      if (t[k]) nodes[j].textContent = t[k];
    }
    var tk = root.getAttribute('data-i18n-title');
    if (tk && t[tk]) document.title = t[tk];
    var go = document.querySelectorAll('a[href="/use/"], a[href="https://thoth.elghaly.dev/use/"]');
    for (var m = 0; m < go.length; m++) go[m].setAttribute('href', go[m].getAttribute('href') + '?lang=' + lang);
    var home = document.querySelectorAll('a[href="/"]');
    for (var n = 0; n < home.length; n++) home[n].setAttribute('href', '/?lang=' + lang);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
