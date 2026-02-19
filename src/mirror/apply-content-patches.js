function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function compileFlexibleExactPattern(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return null;
  const parts = normalized.split(/\s+/).map(escapeRegExp);
  if (parts.length === 0) return null;
  return new RegExp(parts.join('\\s+'), 'g');
}

function normalizeAbsoluteUrl(value, fallbackValue) {
  const fallback = String(fallbackValue || '');
  if (!value || typeof value !== 'string') return fallback;
  try {
    const parsed = new URL(value);
    return parsed.toString();
  } catch {
    return fallback;
  }
}

function setAttributeInTag(tag, attrName, attrValue) {
  const escapedValue = escapeHtml(attrValue);
  const attrPattern = new RegExp(`\\b${escapeRegExp(attrName)}\\s*=\\s*(?:"[^"]*"|'[^']*')`, 'i');
  if (attrPattern.test(tag)) {
    return tag.replace(attrPattern, `${attrName}="${escapedValue}"`);
  }
  return tag.replace(/\s*\/?>$/, (closing) => ` ${attrName}="${escapedValue}"${closing}`);
}

function upsertMetaTag(headInner, attrName, attrValue, contentValue) {
  const attrValuePattern = escapeRegExp(attrValue);
  const tagPattern = new RegExp(`<meta\\b[^>]*\\b${escapeRegExp(attrName)}\\s*=\\s*(?:"${attrValuePattern}"|'${attrValuePattern}')[^>]*>`, 'i');
  if (tagPattern.test(headInner)) {
    return headInner.replace(tagPattern, (tag) => setAttributeInTag(tag, 'content', contentValue));
  }
  return `${headInner}<meta ${attrName}="${escapeHtml(attrValue)}" content="${escapeHtml(contentValue)}"/>`;
}

function upsertCanonicalLink(headInner, canonicalUrl) {
  const canonicalPattern = /<link\b[^>]*\brel\s*=\s*(?:"canonical"|'canonical')[^>]*>/i;
  if (canonicalPattern.test(headInner)) {
    return headInner.replace(canonicalPattern, (tag) => setAttributeInTag(tag, 'href', canonicalUrl));
  }
  return `${headInner}<link rel="canonical" href="${escapeHtml(canonicalUrl)}"/>`;
}

function upsertTitle(headInner, title) {
  const titlePattern = /<title\b[^>]*>[\s\S]*?<\/title>/i;
  if (titlePattern.test(headInner)) {
    return headInner.replace(titlePattern, `<title>${escapeHtml(title)}</title>`);
  }
  return `<title>${escapeHtml(title)}</title>${headInner}`;
}

function removeAttributeFromTag(tag, attrName) {
  const attrPattern = new RegExp(`\\s+${escapeRegExp(attrName)}\\s*=\\s*(?:"[^"]*"|'[^']*')`, 'gi');
  return tag.replace(attrPattern, '');
}

function splitBodyAtFirstScript(bodyInner) {
  const firstScriptIndex = bodyInner.search(/<script\b/i);
  if (firstScriptIndex === -1) {
    return {
      markupBeforeScripts: bodyInner,
      scriptsAndTail: '',
    };
  }

  return {
    markupBeforeScripts: bodyInner.slice(0, firstScriptIndex),
    scriptsAndTail: bodyInner.slice(firstScriptIndex),
  };
}

const HERO_DEFAULT_CONTENT = Object.freeze({
  titleLine1: 'Your Best Years',
  titleLine2: "Haven't Happened Yet.",
  description:
    'Comprehensive blood testing and personalized care designed to keep you thriving, today and for decades to come.',
  primaryCtaLabel: 'Start Testing',
});

const BIOMARKER_PANEL_DEFAULT_CONTENT = Object.freeze({
  titleLine1: 'One Blood Test',
  titleLine2: 'Total Optimization',
  primaryCtaLabel: 'Test My Biomarkers Now',
  items: [
    {
      label: 'Metabolic Health',
      imagePath: '/api/media/file/Metabolic%20Health.png',
    },
    {
      label: 'Kidney and Liver Function',
      imagePath: '/api/media/file/Kidney%20and%20Liver%20Function.png',
    },
    {
      label: 'Cardiovascular Health',
      imagePath: '/api/media/file/Cardiovascular%20Health.png',
    },
    {
      label: 'Hormone Levels',
      imagePath: '/api/media/file/Hormone%20Levels.png',
    },
    {
      label: 'Nutrient Levels',
      imagePath: '/api/media/file/Nutrient%20Levels.png',
    },
    {
      label: 'Inflammation Markers',
      imagePath: '/api/media/file/Inflammation%20Markers.png',
    },
    {
      label: 'Immunity Markers',
      imagePath: '/api/media/file/Immunity%20Markers.png',
    },
    {
      label: 'Biological Aging Rate',
      imagePath: '/api/media/file/Biological%20Aging%20Rate.png',
    },
    {
      label: 'Autoimmune Indicators',
      imagePath: '/api/media/file/Autoimmune%20Indicators.png',
    },
    {
      label: 'Blood Cell Analysis',
      imagePath: '/api/media/file/Blood%20Cell%20Analysis.png',
    },
  ],
});

const FEATURE_PANEL_DEFAULT_CONTENT = Object.freeze({
  cardCtaLabel: 'Learn More',
  cards: [
    {
      alt: 'At-home',
      titleLine1: 'At-home',
      titleLine2: 'Lab Tests',
      href: '/longeviti-panel',
      imagePath: '/api/media/file/Testing%20for%20home%20page.webp',
    },
    {
      alt: 'Customized',
      titleLine1: 'Customized',
      titleLine2: 'Supplements',
      href: '/longeviti-blend',
      imagePath: '/api/media/file/Supps%20for%20home%20page.webp',
    },
  ],
  headingLine1: 'Not Just Bloodwork,',
  headingLine2: 'Total Body Optimization',
  description:
    'Other testing companies stop at the bloodwork. We go beyond by offering access to personalized supplement packs and tailored health protocols, custom built according to the needs of your body. No more guesswork. ',
  stat1: {
    value: '100+',
    line1: 'Biomarkers',
    line2: 'Tested',
  },
  stat2: {
    value: '12+',
    line1: 'Health',
    line2: 'Categories',
  },
  prescriptionCard: {
    alt: 'Prescription',
    titleLine1: 'Prescription',
    titleLine2: 'Medications',
    href: '/product-list-rx',
    imagePath: '/api/media/file/Longevity%20Rx%20for%20home%20page.webp',
    ctaLabel: 'Learn More',
  },
  careHeadingLine1: 'Bye bye sick care,',
  careHeadingLine2: 'hello true health care',
  careDescription:
    'Our team of functional medicine experts approach care from a proactive and preventative lens. By marrying this approach with our cutting edge technology, and the most advanced longevity therapeutics, we help you achieve a longer, healthier life. ',
  testimonialAlt: 'Testimonial',
  badgeTitle: 'HSA/FSA',
  badgeStatus: 'ACCEPTED',
});

const TRUST_SECTION_DEFAULT_CONTENT = Object.freeze({
  headingLine1: 'Thousands trust geviti',
  headingLine2: 'with their health',
  memberLabel: 'Verified Geviti Member',
  readMoreLabel: 'Read More',
  videoCards: [
    {
      thumbnailAlt: 'Thumbnail for @realalexclark',
      profileAlt: 'Profile @realalexclark',
      handle: '@realalexclark',
      meta: 'Host of Culture Apothecary, 553K followers',
    },
    {
      thumbnailAlt: 'Thumbnail for @flyingwithbigern',
      profileAlt: 'Profile @flyingwithbigern',
      handle: '@flyingwithbigern',
      meta: '130K followers',
    },
    {
      thumbnailAlt: 'Thumbnail for @nobleroadranch',
      profileAlt: 'Profile @nobleroadranch',
      handle: '@nobleroadranch',
      meta: '1.4M followers',
    },
    {
      thumbnailAlt: 'Thumbnail for @baiwood',
      profileAlt: 'Profile @baiwood',
      handle: '@baiwood',
      meta: '15.8k followers',
    },
  ],
  textCards: [
    {
      profileAlt: 'Profile Mark L.',
      name: 'Mark L.',
      quote:
        'As someone who used to struggle with constant fatigue, low energy, and poor sleep, I can honestly say that Geviti has been a life-changing experience...Within a few weeks, I noticed a significant boost in my energy levels, and my sleep habits improved dramatically. The personalized wellness plan gave me the tools I needed to not only feel better in the short term but also improve my overall health as I age. Geviti’s approach to health is unlike anything I’ve experienced before.',
    },
    {
      profileAlt: 'Profile Cathy F.',
      name: 'Cathy F.',
      quote:
        'I love that I get to meet with the clinician online and get personalized care rather than having to go into an office.',
    },
    {
      profileAlt: 'Profile Angela D.',
      name: 'Angela D.',
      quote:
        'In the two months since beginning the supplementation protocol given to me by my provider, I have only noticed positive changes... Instead of feeling as though I could fall asleep at any point throughout the day, I have noticed that my energy levels feel more like they used to be... I thought I was a healthy 50-year-old and that I would use Geviti to stay ahead of any future problems, but I am so happy to find that I am feeling better than I thought was possible.',
    },
    {
      profileAlt: 'Profile Brenda M.',
      name: 'Brenda M.',
      quote:
        'They really dug into my results and looked for my root cause of issues I’ve been experiencing for years. I finally feel like I’m not crazy for how I feel everyday and why I had no energy or anything just to do the simplest tasks day to day. It’s nice to feel my body responding well to the supplements and the care I am receiving from my care team.',
    },
  ],
});

const COMMAND_CENTER_SECTION_DEFAULT_CONTENT = Object.freeze({
  headingLine1: 'Your Health Command Center,',
  headingLine2: 'All in one place.',
  loadingAnimationLabel: 'Loading animation...',
  description:
    'The Geviti app brings together your bloodwork, dedicated care team, supplements, appointments, and daily health tracking into a single, seamless experience—making it effortless to stay on top of your longevity journey.',
  ctaLabel: 'Start With Geviti Today',
  appImageAlt: 'English Plumber hero image',
});

const OUR_PROCESS_SECTION_DEFAULT_CONTENT = Object.freeze({
  imageAlt: 'Our Process',
  headingLine1: 'How Does',
  headingLine2: 'it work',
  steps: [
    {
      title: 'At-Home Labs',
      description:
        'A licensed phlebotomist comes to your home, on your schedule. No waiting rooms, no hassle.',
    },
    {
      title: 'Makor AI Analyzes',
      description:
        'Makor AI analyzes your biomarkers against optimal health ranges and validated clinical protocols.',
    },
    {
      title: 'Personalized Care Plan',
      description:
        'Our expert team builds your Longeviti Blueprint with personalized nutrition, supplements, and lifestyle guidance.',
    },
    {
      title: 'Ongoing Optimization',
      description: 'Retest every 6 months. Your care team refines your plan as your body evolves.',
    },
  ],
});

const CHOOSE_PATH_SECTION_DEFAULT_CONTENT = Object.freeze({
  title: 'Choose Your Path',
  subtitle: 'Explore The Right Plan Tailored To Match Your Specific Requirements And Ambitions',
  plans: [
    {
      name: 'Geviti',
      nameStyle: 'Lite',
      tagline: 'Advanced Bloodwork twice annually',
      isPopular: false,
      pricing: {
        oneTimePrice: '$66.67/mo',
        recurringPrice: '$53.33/mo',
        oneTimeLabel: 'Semi-Annually',
        recurringLabel: 'Annually',
        discountPercentage: '-15%',
        twiceAnnuallyBillingText: '(billed at $399.99 every 6mo)',
        annuallyBillingText: '(billed at $679.99 annually)',
      },
      feature: [
        {
          categoryName: 'Comprehensive Labs and Review',
          features: [
            { name: '100+  biomarker bloodwork every 6mo' },
            { name: 'At-home blood draw*' },
            { name: 'Personalized longevity action plan' },
            { name: 'Access to custom supplement packs' },
            { name: 'In-app support' },
          ],
        },
      ],
      restriction: [
        {
          categoryName: 'Currently unavailable in',
          features: [{ name: 'AK, HI, RI' }],
        },
      ],
      link: {
        label: 'Get Started',
      },
    },
    {
      name: 'Geviti',
      nameStyle: 'Plus',
      tagline: 'Ideal for those serious about longevity',
      isPopular: true,
      pricing: {
        oneTimePrice: '$129.99/mo',
        recurringPrice: '$110.50/mo',
        oneTimeLabel: 'Semi-Annually',
        recurringLabel: 'Annually',
        discountPercentage: '-15%',
        twiceAnnuallyBillingText: '(billed at $779.99 every 6mo)',
        annuallyBillingText: '(billed at $1,325.99 annually)',
      },
      feature: [
        {
          categoryName: 'Everything in Lite, and',
          features: [
            { name: '45 min expert bloodwork review' },
            { name: 'Dedicated Functional Longevity Specialist' },
            { name: 'Quarterly Virtual Visits' },
          ],
        },
        {
          categoryName: 'Exclusive Savings',
          features: [
            { name: '40% off custom supplement protocol' },
            { name: 'Preferred pricing on specialty diagnostics' },
          ],
        },
      ],
      restriction: [
        {
          categoryName: 'Currently unavailable in',
          features: [{ name: 'AK, HI, RI' }],
        },
      ],
      link: {
        label: 'Get Started',
      },
    },
    {
      name: 'Geviti',
      nameStyle: 'Plus Rx',
      tagline: 'Complete clinical care solution',
      isPopular: false,
      pricing: {
        oneTimePrice: '$149.83/mo',
        recurringPrice: '$127.35/mo',
        oneTimeLabel: 'Semi-Annually',
        recurringLabel: 'Annually',
        discountPercentage: '-15%',
        twiceAnnuallyBillingText: '(billed at $898.98 every 6mo)',
        annuallyBillingText: '(billed at $1,528.27 annually)',
      },
      feature: [
        {
          categoryName: 'Everything in Plus, and',
          features: [
            { name: 'Quarterly Longevity Practitioner visits ' },
            { name: 'Peptide therapy protocols' },
            { name: 'Hormone optimization therapies' },
            { name: 'Access to other longevity solutions' },
          ],
        },
        {
          categoryName: 'Plus Rx is exclusively available in:',
          features: [
            {
              name: 'AZ, CA, CO, DE, FL, GA, IL, IN, KS, LA, MA, MD, MI, MN, MO, MS, NC, NH, NM, NV, OH, OR, PA, TN, TX, UT, VA, WA, WI',
            },
          ],
        },
      ],
      restriction: [],
      link: {
        label: 'Get Started',
      },
    },
  ],
});

const FAQ_SECTION_DEFAULT_CONTENT = Object.freeze({
  headingLine1: 'Frequently Asked',
  headingLine2: 'Questions',
  items: [
    {
      question: 'What states does Geviti Lite and Geviti Plus cover?',
      answer:
        'Geviti Lite and Geviti plus are available in all states with the exception of AK, HI, and RI. ',
    },
    {
      question: 'What states does Geviti Plus Rx cover?',
      answer:
        'Geviti Plus Rx is available in AZ, CA, CO, DE, FL, GA, IL, IN, KS, LA, MA, MD, MI, MN, MO, MS, NC, NH, NM, NV, OH, OR, PA, TN, TX, UT, VA, WA, WI. We are actively working to expand to all 50 states in the future.',
    },
    {
      question: 'Why should I choose Geviti’s Longeviti Blend instead of buying my own supplements?',
      answer:
        'The Longeviti Blend is personalized to your bloodwork, ensuring you get exactly what your body needs. While you are not required to purchase supplements from us, many members choose to because of the quality and convenience. We use Xymogen, one of the most trusted and well-researched brands in the industry, so you can feel confident in what you’re taking. Your blend also comes in ready-to-go morning and evening packets, making it simple to stay consistent and stick with your plan long term.',
    },
    {
      question:
        "How does Geviti's 'Longeviti Panel' compare to the bloodwork from my Primary Care Physician?",
      answer:
        'Most primary care physicians test for only a small set of markers that insurance will cover, often focused on detecting disease once it is already present. The Longeviti Panel takes a broader, more proactive approach by measuring over five times as many biomarkers. Beyond the basics, we look at key areas such as kidney and liver function, cardiovascular health, hormones, nutrients, inflammation, and immunity. This broader view helps us uncover insights into your metabolic health and longevity pathways, so you can take action to optimize your health before problems develop.',
    },
  ],
  cardImageAlt: 'faq',
  supportTitle: 'Still have questions?',
  supportDescription: 'Feel free to leave a message for us',
  supportCtaLabel: 'Message us',
  supportCtaHref: '/contact-us',
});

const MISSION_SECTION_DEFAULT_CONTENT = Object.freeze({
  mission: {
    imageAlt: 'Image for Nathan Graville',
    imagePath: '/api/media/file/nate%20%2B%20fam.png',
    name: 'Nathan Graville',
    role: 'Founder and CEO @ Geviti',
    headingLine1: 'We Are On A',
    headingLine2: 'Personal Mission',
    description:
      'After our Founder, Nate Graville, lost his father to what he believes to be a largely preventable disease, he felt compelled to build the system his father never had. Geviti exists to keep you healthy and vibrant through all stages of life, to allow for more memories with your loved ones.',
    ctaLabel: 'Start Your Journey',
    ctaHref: '/pricing',
  },
  gallery: {
    headingLine1: 'Seamlessly Connected',
    headingLine2: 'to Your Life',
    ctaLabel: 'Start Your Journey',
    ctaHref: '/pricing',
    images: [
      {
        imagePath: '/api/media/file/Image%20Container-3.webp',
        alt: 'Gallery image 1',
      },
      {
        imagePath: '/api/media/file/Image%20Container.webp',
        alt: 'Gallery image 2',
      },
    ],
  },
});

const NEWSLETTER_SECTION_DEFAULT_CONTENT = Object.freeze({
  backgroundImagePath: '/api/media/file/woman%20newsletter.jpg',
  backgroundImageAlt: 'Newsletter Background',
  headingLine1: 'Ready to experience',
  headingLine2: 'the future of health?',
  description: "Your body is sending signals. We’ll help you decode them before it's too late.",
  ctaLabel: 'Join Today',
  ctaHref: '/pricing',
});

const FOOTER_SECTION_DEFAULT_CONTENT = Object.freeze({
  logoAlt: 'Geviti Logo',
  subscriptionText: 'Stay in the loop with exclusive offers and product previews.',
  emailPlaceholder: 'Email*',
  subscribeLabel: 'Subscribe',
  followUsLabel: 'Follow us',
  supportTitle: 'Help & Support',
  supportLinks: [
    { label: 'Contact Us', href: '/contact-us' },
    { label: 'FAQs', href: 'https://help.gogeviti.com/' },
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    { label: 'Become An Ambassador', href: 'https://yrrkurnnqg3.typeform.com/to/CKMfYD2j' },
    { label: 'Become A Brand Partner', href: 'https://yrrkurnnqg3.typeform.com/to/mFJOjvpC' },
  ],
  aboutTitle: 'About Geviti',
  aboutLinks: [
    { label: 'About Us', href: '/about-us' },
    { label: 'Careers', href: 'https://geviti-inc.breezy.hr/' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Blogs', href: '/blog' },
  ],
  legalDisclaimer:
    'LAB TESTS ARE ORDERED SOLELY AT THE DISCRETION OF LICENSED CLINICIANS. IF A PHYSICIAN DECIDES NOT TO ORDER A TEST, THE COST WILL BE REFUNDED. PRODUCT IMAGES ARE FOR DISPLAY PURPOSES ONLY; ACTUAL ITEMS DISPENSED FROM U.S.-BASED PHARMACIES MAY VARY. THE COST PER MONTH FOR PRESCRIPTION (RX) PRODUCTS IS BASED ON AN AVERAGE DOSING. YOUR COST MAY BE HIGHER OR LOWER DEPENDING ON YOUR PERSONALIZED CARE PLAN. ALL PROFESSIONAL MEDICAL SERVICES ARE PROVIDED BY LICENSED PHYSICIANS AND CLINICIANS PRACTICING THROUGH INDEPENDENTLY OWNED AND PROFESSIONALLY MANAGED MEDICAL GROUPS. GEVITI IS A HEALTHCARE TECHNOLOGY COMPANY AND NOT A LABORATORY OR MEDICAL PROVIDER. ALL LABORATORY AND MEDICAL SERVICES ARE DELIVERED BY INDEPENDENT THIRD-PARTY ENTITIES.',
  cardImageAlt: 'card',
  cardDesktopImagePath: '/footer/footer-dekstop.webp',
  cardMobileImagePath: '/footer/footer-mobile.webp',
  appPrompt: 'Find us on the App Store and Google Play Store',
  appStoreAlt: 'app store',
  appStoreHref: 'https://apps.apple.com/us/app/geviti/id6451433757',
  appStoreImagePath: '/socials/appstore.svg',
  googlePlayAlt: 'googleplay',
  googlePlayHref: 'https://play.google.com',
  googlePlayImagePath: '/socials/googleplay.svg',
  copyrightText: '© 2026 Geviti Inc. | All Rights Reserved',
});

function toPricingMarkupMoneyValue(value) {
  const normalized = String(value || '');
  if (normalized.startsWith('$$')) {
    return normalized.slice(1);
  }
  return normalized;
}

function toPricingFlightMoneyValue(value) {
  const normalized = String(value || '');
  if (normalized.startsWith('$$')) {
    return normalized;
  }
  if (normalized.startsWith('$')) {
    return `$${normalized}`;
  }
  return normalized;
}

function resolveHeroContent(siteContent) {
  const heroConfig =
    siteContent && typeof siteContent.hero === 'object' && siteContent.hero
      ? siteContent.hero
      : {};

  const pickText = (key, fallback) => {
    const value = heroConfig[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  return {
    titleLine1: pickText('titleLine1', HERO_DEFAULT_CONTENT.titleLine1),
    titleLine2: pickText('titleLine2', HERO_DEFAULT_CONTENT.titleLine2),
    description: pickText('description', HERO_DEFAULT_CONTENT.description),
    primaryCtaLabel: pickText('primaryCtaLabel', HERO_DEFAULT_CONTENT.primaryCtaLabel),
  };
}

function resolveBiomarkerPanelContent(siteContent) {
  const panelConfig =
    siteContent && typeof siteContent.biomarkerPanel === 'object' && siteContent.biomarkerPanel
      ? siteContent.biomarkerPanel
      : {};

  const pickText = (key, fallback) => {
    const value = panelConfig[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  const sourceItems = Array.isArray(panelConfig.items) ? panelConfig.items : [];
  const items = BIOMARKER_PANEL_DEFAULT_CONTENT.items.map((defaultItem, index) => {
    const override = sourceItems[index];
    if (!override || typeof override !== 'object') return defaultItem;

    const label =
      typeof override.label === 'string' && override.label.trim()
        ? override.label
        : defaultItem.label;
    const imagePath =
      typeof override.imagePath === 'string' && override.imagePath.trim()
        ? override.imagePath
        : defaultItem.imagePath;

    return {
      label,
      imagePath,
    };
  });

  return {
    titleLine1: pickText('titleLine1', BIOMARKER_PANEL_DEFAULT_CONTENT.titleLine1),
    titleLine2: pickText('titleLine2', BIOMARKER_PANEL_DEFAULT_CONTENT.titleLine2),
    primaryCtaLabel: pickText('primaryCtaLabel', BIOMARKER_PANEL_DEFAULT_CONTENT.primaryCtaLabel),
    items,
  };
}

function resolveFeaturePanelContent(siteContent) {
  const panelConfig =
    siteContent && typeof siteContent.featurePanel === 'object' && siteContent.featurePanel
      ? siteContent.featurePanel
      : {};

  const pickText = (key, fallback) => {
    const value = panelConfig[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  const defaultCardCtaLabel = FEATURE_PANEL_DEFAULT_CONTENT.cardCtaLabel;
  const cardCtaLabel = pickText('cardCtaLabel', defaultCardCtaLabel);

  const sourceCards = Array.isArray(panelConfig.cards) ? panelConfig.cards : [];
  const cards = FEATURE_PANEL_DEFAULT_CONTENT.cards.map((defaultCard, index) => {
    const override = sourceCards[index];
    if (!override || typeof override !== 'object') return defaultCard;

    const pickCardText = (key, fallback) => {
      const value = override[key];
      if (typeof value !== 'string') return fallback;
      if (!value.trim()) return fallback;
      return value;
    };

    return {
      alt: pickCardText('alt', defaultCard.alt),
      titleLine1: pickCardText('titleLine1', defaultCard.titleLine1),
      titleLine2: pickCardText('titleLine2', defaultCard.titleLine2),
      href: pickCardText('href', defaultCard.href),
      imagePath: pickCardText('imagePath', defaultCard.imagePath),
    };
  });

  const pickStat = (key, fallback) => {
    const value = panelConfig[key];
    if (!value || typeof value !== 'object') return fallback;

    const pickStatText = (statKey, statFallback) => {
      const statValue = value[statKey];
      if (typeof statValue !== 'string') return statFallback;
      if (!statValue.trim()) return statFallback;
      return statValue.trim();
    };

    return {
      value: pickStatText('value', fallback.value),
      line1: pickStatText('line1', fallback.line1),
      line2: pickStatText('line2', fallback.line2),
    };
  };

  const basePrescriptionCard = FEATURE_PANEL_DEFAULT_CONTENT.prescriptionCard;
  const prescriptionOverride =
    panelConfig.prescriptionCard && typeof panelConfig.prescriptionCard === 'object'
      ? panelConfig.prescriptionCard
      : {};
  const pickPrescriptionText = (key, fallback) => {
    const value = prescriptionOverride[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  return {
    cardCtaLabel,
    cards,
    headingLine1: pickText('headingLine1', FEATURE_PANEL_DEFAULT_CONTENT.headingLine1),
    headingLine2: pickText('headingLine2', FEATURE_PANEL_DEFAULT_CONTENT.headingLine2),
    description: pickText('description', FEATURE_PANEL_DEFAULT_CONTENT.description),
    stat1: pickStat('stat1', FEATURE_PANEL_DEFAULT_CONTENT.stat1),
    stat2: pickStat('stat2', FEATURE_PANEL_DEFAULT_CONTENT.stat2),
    prescriptionCard: {
      alt: pickPrescriptionText('alt', basePrescriptionCard.alt),
      titleLine1: pickPrescriptionText('titleLine1', basePrescriptionCard.titleLine1),
      titleLine2: pickPrescriptionText('titleLine2', basePrescriptionCard.titleLine2),
      href: pickPrescriptionText('href', basePrescriptionCard.href),
      imagePath: pickPrescriptionText('imagePath', basePrescriptionCard.imagePath),
      ctaLabel: pickPrescriptionText('ctaLabel', basePrescriptionCard.ctaLabel),
    },
    careHeadingLine1: pickText('careHeadingLine1', FEATURE_PANEL_DEFAULT_CONTENT.careHeadingLine1),
    careHeadingLine2: pickText('careHeadingLine2', FEATURE_PANEL_DEFAULT_CONTENT.careHeadingLine2),
    careDescription: pickText('careDescription', FEATURE_PANEL_DEFAULT_CONTENT.careDescription),
    testimonialAlt: pickText('testimonialAlt', FEATURE_PANEL_DEFAULT_CONTENT.testimonialAlt),
    badgeTitle: pickText('badgeTitle', FEATURE_PANEL_DEFAULT_CONTENT.badgeTitle),
    badgeStatus: pickText('badgeStatus', FEATURE_PANEL_DEFAULT_CONTENT.badgeStatus),
  };
}

function resolveTrustSectionContent(siteContent) {
  const sectionConfig =
    siteContent && typeof siteContent.trustSection === 'object' && siteContent.trustSection
      ? siteContent.trustSection
      : {};

  const pickText = (key, fallback) => {
    const value = sectionConfig[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  const sourceVideoCards = Array.isArray(sectionConfig.videoCards) ? sectionConfig.videoCards : [];
  const videoCards = TRUST_SECTION_DEFAULT_CONTENT.videoCards.map((defaultCard, index) => {
    const override = sourceVideoCards[index];
    if (!override || typeof override !== 'object') return defaultCard;

    const pickCardText = (key, fallback) => {
      const value = override[key];
      if (typeof value !== 'string') return fallback;
      if (!value.trim()) return fallback;
      return value;
    };

    return {
      thumbnailAlt: pickCardText('thumbnailAlt', defaultCard.thumbnailAlt),
      profileAlt: pickCardText('profileAlt', defaultCard.profileAlt),
      handle: pickCardText('handle', defaultCard.handle),
      meta: pickCardText('meta', defaultCard.meta),
    };
  });

  const sourceTextCards = Array.isArray(sectionConfig.textCards) ? sectionConfig.textCards : [];
  const textCards = TRUST_SECTION_DEFAULT_CONTENT.textCards.map((defaultCard, index) => {
    const override = sourceTextCards[index];
    if (!override || typeof override !== 'object') return defaultCard;

    const pickCardText = (key, fallback) => {
      const value = override[key];
      if (typeof value !== 'string') return fallback;
      if (!value.trim()) return fallback;
      return value;
    };

    return {
      profileAlt: pickCardText('profileAlt', defaultCard.profileAlt),
      name: pickCardText('name', defaultCard.name),
      quote: pickCardText('quote', defaultCard.quote),
    };
  });

  return {
    headingLine1: pickText('headingLine1', TRUST_SECTION_DEFAULT_CONTENT.headingLine1),
    headingLine2: pickText('headingLine2', TRUST_SECTION_DEFAULT_CONTENT.headingLine2),
    memberLabel: pickText('memberLabel', TRUST_SECTION_DEFAULT_CONTENT.memberLabel),
    readMoreLabel: pickText('readMoreLabel', TRUST_SECTION_DEFAULT_CONTENT.readMoreLabel),
    videoCards,
    textCards,
  };
}

function resolveCommandCenterSectionContent(siteContent) {
  const sectionConfig =
    siteContent &&
    typeof siteContent.commandCenterSection === 'object' &&
    siteContent.commandCenterSection
      ? siteContent.commandCenterSection
      : {};

  const pickText = (key, fallback) => {
    const value = sectionConfig[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  return {
    headingLine1: pickText('headingLine1', COMMAND_CENTER_SECTION_DEFAULT_CONTENT.headingLine1),
    headingLine2: pickText('headingLine2', COMMAND_CENTER_SECTION_DEFAULT_CONTENT.headingLine2),
    loadingAnimationLabel: pickText(
      'loadingAnimationLabel',
      COMMAND_CENTER_SECTION_DEFAULT_CONTENT.loadingAnimationLabel,
    ),
    description: pickText('description', COMMAND_CENTER_SECTION_DEFAULT_CONTENT.description),
    ctaLabel: pickText('ctaLabel', COMMAND_CENTER_SECTION_DEFAULT_CONTENT.ctaLabel),
    appImageAlt: pickText('appImageAlt', COMMAND_CENTER_SECTION_DEFAULT_CONTENT.appImageAlt),
  };
}

function resolveOurProcessSectionContent(siteContent) {
  const sectionConfig =
    siteContent && typeof siteContent.ourProcessSection === 'object' && siteContent.ourProcessSection
      ? siteContent.ourProcessSection
      : {};

  const pickText = (key, fallback) => {
    const value = sectionConfig[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  const sourceSteps = Array.isArray(sectionConfig.steps) ? sectionConfig.steps : [];
  const steps = OUR_PROCESS_SECTION_DEFAULT_CONTENT.steps.map((defaultStep, index) => {
    const override = sourceSteps[index];
    if (!override || typeof override !== 'object') return defaultStep;

    const pickStepText = (key, fallback) => {
      const value = override[key];
      if (typeof value !== 'string') return fallback;
      if (!value.trim()) return fallback;
      return value;
    };

    return {
      title: pickStepText('title', defaultStep.title),
      description: pickStepText('description', defaultStep.description),
    };
  });

  return {
    imageAlt: pickText('imageAlt', OUR_PROCESS_SECTION_DEFAULT_CONTENT.imageAlt),
    headingLine1: pickText('headingLine1', OUR_PROCESS_SECTION_DEFAULT_CONTENT.headingLine1),
    headingLine2: pickText('headingLine2', OUR_PROCESS_SECTION_DEFAULT_CONTENT.headingLine2),
    steps,
  };
}

function resolveChoosePathSectionContent(siteContent) {
  const sectionConfig =
    siteContent && typeof siteContent.choosePathSection === 'object' && siteContent.choosePathSection
      ? siteContent.choosePathSection
      : {};

  const pickText = (source, key, fallback) => {
    const value = source[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  const sourcePlans = Array.isArray(sectionConfig.plans) ? sectionConfig.plans : [];
  const plans = CHOOSE_PATH_SECTION_DEFAULT_CONTENT.plans.map((defaultPlan, planIndex) => {
    const planOverride = sourcePlans[planIndex];
    if (!planOverride || typeof planOverride !== 'object') return defaultPlan;

    const pricingOverride =
      planOverride.pricing && typeof planOverride.pricing === 'object' ? planOverride.pricing : {};
    const linkOverride = planOverride.link && typeof planOverride.link === 'object' ? planOverride.link : {};

    const sourceFeatureGroups = Array.isArray(planOverride.feature) ? planOverride.feature : [];
    const feature = defaultPlan.feature.map((defaultGroup, groupIndex) => {
      const groupOverride = sourceFeatureGroups[groupIndex];
      if (!groupOverride || typeof groupOverride !== 'object') return defaultGroup;

      const sourceFeatures = Array.isArray(groupOverride.features) ? groupOverride.features : [];
      const features = defaultGroup.features.map((defaultFeature, featureIndex) => {
        const featureOverride = sourceFeatures[featureIndex];
        if (!featureOverride || typeof featureOverride !== 'object') return defaultFeature;
        return {
          name: pickText(featureOverride, 'name', defaultFeature.name),
        };
      });

      return {
        categoryName: pickText(groupOverride, 'categoryName', defaultGroup.categoryName),
        features,
      };
    });

    const sourceRestrictionGroups = Array.isArray(planOverride.restriction) ? planOverride.restriction : [];
    const restriction = defaultPlan.restriction.map((defaultGroup, groupIndex) => {
      const groupOverride = sourceRestrictionGroups[groupIndex];
      if (!groupOverride || typeof groupOverride !== 'object') return defaultGroup;

      const sourceFeatures = Array.isArray(groupOverride.features) ? groupOverride.features : [];
      const features = defaultGroup.features.map((defaultFeature, featureIndex) => {
        const featureOverride = sourceFeatures[featureIndex];
        if (!featureOverride || typeof featureOverride !== 'object') return defaultFeature;
        return {
          name: pickText(featureOverride, 'name', defaultFeature.name),
        };
      });

      return {
        categoryName: pickText(groupOverride, 'categoryName', defaultGroup.categoryName),
        features,
      };
    });

    return {
      name: pickText(planOverride, 'name', defaultPlan.name),
      nameStyle: pickText(planOverride, 'nameStyle', defaultPlan.nameStyle),
      tagline: pickText(planOverride, 'tagline', defaultPlan.tagline),
      isPopular:
        typeof planOverride.isPopular === 'boolean' ? planOverride.isPopular : defaultPlan.isPopular,
      pricing: {
        oneTimePrice: pickText(pricingOverride, 'oneTimePrice', defaultPlan.pricing.oneTimePrice),
        recurringPrice: pickText(pricingOverride, 'recurringPrice', defaultPlan.pricing.recurringPrice),
        oneTimeLabel: pickText(pricingOverride, 'oneTimeLabel', defaultPlan.pricing.oneTimeLabel),
        recurringLabel: pickText(pricingOverride, 'recurringLabel', defaultPlan.pricing.recurringLabel),
        discountPercentage: pickText(
          pricingOverride,
          'discountPercentage',
          defaultPlan.pricing.discountPercentage,
        ),
        twiceAnnuallyBillingText: pickText(
          pricingOverride,
          'twiceAnnuallyBillingText',
          defaultPlan.pricing.twiceAnnuallyBillingText,
        ),
        annuallyBillingText: pickText(
          pricingOverride,
          'annuallyBillingText',
          defaultPlan.pricing.annuallyBillingText,
        ),
      },
      feature,
      restriction,
      link: {
        label: pickText(linkOverride, 'label', defaultPlan.link.label),
      },
    };
  });

  return {
    title: pickText(sectionConfig, 'title', CHOOSE_PATH_SECTION_DEFAULT_CONTENT.title),
    subtitle: pickText(sectionConfig, 'subtitle', CHOOSE_PATH_SECTION_DEFAULT_CONTENT.subtitle),
    plans,
  };
}

function resolveFaqSectionContent(siteContent) {
  const sectionConfig =
    siteContent && typeof siteContent.faqSection === 'object' && siteContent.faqSection
      ? siteContent.faqSection
      : {};

  const pickText = (source, key, fallback) => {
    const value = source[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  const sourceItems = Array.isArray(sectionConfig.items) ? sectionConfig.items : [];
  const items = FAQ_SECTION_DEFAULT_CONTENT.items.map((defaultItem, index) => {
    const itemOverride = sourceItems[index];
    if (!itemOverride || typeof itemOverride !== 'object') return defaultItem;
    return {
      question: pickText(itemOverride, 'question', defaultItem.question),
      answer: pickText(itemOverride, 'answer', defaultItem.answer),
    };
  });

  return {
    headingLine1: pickText(sectionConfig, 'headingLine1', FAQ_SECTION_DEFAULT_CONTENT.headingLine1),
    headingLine2: pickText(sectionConfig, 'headingLine2', FAQ_SECTION_DEFAULT_CONTENT.headingLine2),
    items,
    cardImageAlt: pickText(sectionConfig, 'cardImageAlt', FAQ_SECTION_DEFAULT_CONTENT.cardImageAlt),
    supportTitle: pickText(sectionConfig, 'supportTitle', FAQ_SECTION_DEFAULT_CONTENT.supportTitle),
    supportDescription: pickText(
      sectionConfig,
      'supportDescription',
      FAQ_SECTION_DEFAULT_CONTENT.supportDescription,
    ),
    supportCtaLabel: pickText(sectionConfig, 'supportCtaLabel', FAQ_SECTION_DEFAULT_CONTENT.supportCtaLabel),
    supportCtaHref: pickText(sectionConfig, 'supportCtaHref', FAQ_SECTION_DEFAULT_CONTENT.supportCtaHref),
  };
}

function resolveMissionSectionContent(siteContent) {
  const sectionConfig =
    siteContent && typeof siteContent.missionSection === 'object' && siteContent.missionSection
      ? siteContent.missionSection
      : {};
  const missionConfig =
    sectionConfig && typeof sectionConfig.mission === 'object' && sectionConfig.mission
      ? sectionConfig.mission
      : {};
  const galleryConfig =
    sectionConfig && typeof sectionConfig.gallery === 'object' && sectionConfig.gallery
      ? sectionConfig.gallery
      : {};

  const pickText = (source, key, fallback) => {
    const value = source[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  const sourceImages = Array.isArray(galleryConfig.images) ? galleryConfig.images : [];
  const images = MISSION_SECTION_DEFAULT_CONTENT.gallery.images.map((defaultImage, index) => {
    const override = sourceImages[index];
    if (!override || typeof override !== 'object') return defaultImage;
    return {
      imagePath: pickText(override, 'imagePath', defaultImage.imagePath),
      alt: pickText(override, 'alt', defaultImage.alt),
    };
  });

  return {
    mission: {
      imageAlt: pickText(missionConfig, 'imageAlt', MISSION_SECTION_DEFAULT_CONTENT.mission.imageAlt),
      imagePath: pickText(missionConfig, 'imagePath', MISSION_SECTION_DEFAULT_CONTENT.mission.imagePath),
      name: pickText(missionConfig, 'name', MISSION_SECTION_DEFAULT_CONTENT.mission.name),
      role: pickText(missionConfig, 'role', MISSION_SECTION_DEFAULT_CONTENT.mission.role),
      headingLine1: pickText(
        missionConfig,
        'headingLine1',
        MISSION_SECTION_DEFAULT_CONTENT.mission.headingLine1,
      ),
      headingLine2: pickText(
        missionConfig,
        'headingLine2',
        MISSION_SECTION_DEFAULT_CONTENT.mission.headingLine2,
      ),
      description: pickText(
        missionConfig,
        'description',
        MISSION_SECTION_DEFAULT_CONTENT.mission.description,
      ),
      ctaLabel: pickText(missionConfig, 'ctaLabel', MISSION_SECTION_DEFAULT_CONTENT.mission.ctaLabel),
      ctaHref: pickText(missionConfig, 'ctaHref', MISSION_SECTION_DEFAULT_CONTENT.mission.ctaHref),
    },
    gallery: {
      headingLine1: pickText(
        galleryConfig,
        'headingLine1',
        MISSION_SECTION_DEFAULT_CONTENT.gallery.headingLine1,
      ),
      headingLine2: pickText(
        galleryConfig,
        'headingLine2',
        MISSION_SECTION_DEFAULT_CONTENT.gallery.headingLine2,
      ),
      ctaLabel: pickText(galleryConfig, 'ctaLabel', MISSION_SECTION_DEFAULT_CONTENT.gallery.ctaLabel),
      ctaHref: pickText(galleryConfig, 'ctaHref', MISSION_SECTION_DEFAULT_CONTENT.gallery.ctaHref),
      images,
    },
  };
}

function resolveNewsletterSectionContent(siteContent) {
  const sectionConfig =
    siteContent && typeof siteContent.newsletterSection === 'object' && siteContent.newsletterSection
      ? siteContent.newsletterSection
      : {};

  const pickText = (key, fallback) => {
    const value = sectionConfig[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  return {
    backgroundImagePath: pickText(
      'backgroundImagePath',
      NEWSLETTER_SECTION_DEFAULT_CONTENT.backgroundImagePath,
    ),
    backgroundImageAlt: pickText(
      'backgroundImageAlt',
      NEWSLETTER_SECTION_DEFAULT_CONTENT.backgroundImageAlt,
    ),
    headingLine1: pickText('headingLine1', NEWSLETTER_SECTION_DEFAULT_CONTENT.headingLine1),
    headingLine2: pickText('headingLine2', NEWSLETTER_SECTION_DEFAULT_CONTENT.headingLine2),
    description: pickText('description', NEWSLETTER_SECTION_DEFAULT_CONTENT.description),
    ctaLabel: pickText('ctaLabel', NEWSLETTER_SECTION_DEFAULT_CONTENT.ctaLabel),
    ctaHref: pickText('ctaHref', NEWSLETTER_SECTION_DEFAULT_CONTENT.ctaHref),
  };
}

function resolveFooterSectionContent(siteContent) {
  const sectionConfig =
    siteContent && typeof siteContent.footerSection === 'object' && siteContent.footerSection
      ? siteContent.footerSection
      : {};

  const pickText = (source, key, fallback) => {
    const value = source[key];
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
  };

  const pickLinks = (sourceLinks, defaultLinks) => {
    const linksSource = Array.isArray(sourceLinks) ? sourceLinks : [];
    return defaultLinks.map((defaultLink, index) => {
      const override = linksSource[index];
      if (!override || typeof override !== 'object') return defaultLink;
      return {
        label: pickText(override, 'label', defaultLink.label),
        href: pickText(override, 'href', defaultLink.href),
      };
    });
  };

  return {
    logoAlt: pickText(sectionConfig, 'logoAlt', FOOTER_SECTION_DEFAULT_CONTENT.logoAlt),
    subscriptionText: pickText(
      sectionConfig,
      'subscriptionText',
      FOOTER_SECTION_DEFAULT_CONTENT.subscriptionText,
    ),
    emailPlaceholder: pickText(
      sectionConfig,
      'emailPlaceholder',
      FOOTER_SECTION_DEFAULT_CONTENT.emailPlaceholder,
    ),
    subscribeLabel: pickText(
      sectionConfig,
      'subscribeLabel',
      FOOTER_SECTION_DEFAULT_CONTENT.subscribeLabel,
    ),
    followUsLabel: pickText(sectionConfig, 'followUsLabel', FOOTER_SECTION_DEFAULT_CONTENT.followUsLabel),
    supportTitle: pickText(sectionConfig, 'supportTitle', FOOTER_SECTION_DEFAULT_CONTENT.supportTitle),
    supportLinks: pickLinks(sectionConfig.supportLinks, FOOTER_SECTION_DEFAULT_CONTENT.supportLinks),
    aboutTitle: pickText(sectionConfig, 'aboutTitle', FOOTER_SECTION_DEFAULT_CONTENT.aboutTitle),
    aboutLinks: pickLinks(sectionConfig.aboutLinks, FOOTER_SECTION_DEFAULT_CONTENT.aboutLinks),
    legalDisclaimer: pickText(
      sectionConfig,
      'legalDisclaimer',
      FOOTER_SECTION_DEFAULT_CONTENT.legalDisclaimer,
    ),
    cardImageAlt: pickText(sectionConfig, 'cardImageAlt', FOOTER_SECTION_DEFAULT_CONTENT.cardImageAlt),
    cardDesktopImagePath: pickText(
      sectionConfig,
      'cardDesktopImagePath',
      FOOTER_SECTION_DEFAULT_CONTENT.cardDesktopImagePath,
    ),
    cardMobileImagePath: pickText(
      sectionConfig,
      'cardMobileImagePath',
      FOOTER_SECTION_DEFAULT_CONTENT.cardMobileImagePath,
    ),
    appPrompt: pickText(sectionConfig, 'appPrompt', FOOTER_SECTION_DEFAULT_CONTENT.appPrompt),
    appStoreAlt: pickText(sectionConfig, 'appStoreAlt', FOOTER_SECTION_DEFAULT_CONTENT.appStoreAlt),
    appStoreHref: pickText(sectionConfig, 'appStoreHref', FOOTER_SECTION_DEFAULT_CONTENT.appStoreHref),
    appStoreImagePath: pickText(
      sectionConfig,
      'appStoreImagePath',
      FOOTER_SECTION_DEFAULT_CONTENT.appStoreImagePath,
    ),
    googlePlayAlt: pickText(sectionConfig, 'googlePlayAlt', FOOTER_SECTION_DEFAULT_CONTENT.googlePlayAlt),
    googlePlayHref: pickText(
      sectionConfig,
      'googlePlayHref',
      FOOTER_SECTION_DEFAULT_CONTENT.googlePlayHref,
    ),
    googlePlayImagePath: pickText(
      sectionConfig,
      'googlePlayImagePath',
      FOOTER_SECTION_DEFAULT_CONTENT.googlePlayImagePath,
    ),
    copyrightText: pickText(
      sectionConfig,
      'copyrightText',
      FOOTER_SECTION_DEFAULT_CONTENT.copyrightText,
    ),
  };
}

function normalizeHeaderNavItems(headerConfig) {
  if (!headerConfig || typeof headerConfig !== 'object') return [];
  if (!Array.isArray(headerConfig.navItems)) return [];

  return headerConfig.navItems
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      if (typeof item.label !== 'string' || !item.label.trim()) return null;
      if (typeof item.href !== 'string' || !item.href.trim()) return null;
      return {
        label: item.label,
        href: item.href,
        newTab: false,
      };
    })
    .filter(Boolean);
}

function resolveHeaderPrimaryCta(siteContent, headerConfig) {
  const sourceNumber =
    typeof siteContent.whatsappNumber === 'string' && siteContent.whatsappNumber
      ? siteContent.whatsappNumber
      : '+31 6 428 699 31';
  const digits = sourceNumber.replace(/\D/g, '');
  const whatsAppFallback = digits ? `https://wa.me/${digits}` : '#';

  return {
    label:
      typeof headerConfig.primaryCtaLabel === 'string' && headerConfig.primaryCtaLabel
        ? headerConfig.primaryCtaLabel
        : 'WhatsApp',
    href:
      typeof headerConfig.whatsAppHref === 'string' && headerConfig.whatsAppHref
        ? headerConfig.whatsAppHref
        : whatsAppFallback,
    newTab: true,
  };
}

function resolveHeaderSecondaryCta(headerConfig) {
  return {
    label:
      typeof headerConfig.secondaryCtaLabel === 'string' && headerConfig.secondaryCtaLabel
        ? headerConfig.secondaryCtaLabel
        : 'Free Quote',
    href:
      typeof headerConfig.secondaryCtaHref === 'string' && headerConfig.secondaryCtaHref
        ? headerConfig.secondaryCtaHref
        : '#free-quote',
    newTab: false,
  };
}

function patchFirstSpanText(innerHtml, label) {
  const spanPattern = /<span\b[^>]*>[\s\S]*?<\/span>/i;
  if (!spanPattern.test(innerHtml)) {
    return escapeHtml(label);
  }

  return innerHtml.replace(spanPattern, (fullSpan) =>
    fullSpan.replace(/(<span\b[^>]*>)[\s\S]*?(<\/span>)/i, `$1${escapeHtml(label)}$2`),
  );
}

function patchAnchorNode(anchorHtml, update) {
  const openTagMatch = anchorHtml.match(/^<a\b[^>]*>/i);
  if (!openTagMatch) return anchorHtml;

  const openTag = openTagMatch[0];
  const closeTag = '</a>';
  if (!anchorHtml.endsWith(closeTag)) return anchorHtml;

  let patchedOpenTag = setAttributeInTag(openTag, 'href', update.href || '#');

  if (update.newTab) {
    patchedOpenTag = setAttributeInTag(patchedOpenTag, 'target', '_blank');
    patchedOpenTag = setAttributeInTag(patchedOpenTag, 'rel', 'noopener noreferrer');
  } else {
    patchedOpenTag = removeAttributeFromTag(patchedOpenTag, 'target');
    patchedOpenTag = removeAttributeFromTag(patchedOpenTag, 'rel');
  }

  const innerHtml = anchorHtml.slice(openTag.length, -closeTag.length);
  const patchedInner = patchFirstSpanText(innerHtml, update.label || '');
  return `${patchedOpenTag}${patchedInner}${closeTag}`;
}

function patchAnchorsByIndex(sectionHtml, updates, sectionName) {
  if (!updates || updates.length === 0) {
    return sectionHtml;
  }

  const anchorPattern = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
  let cursor = 0;
  let anchorIndex = 0;
  let patched = '';
  let match = anchorPattern.exec(sectionHtml);

  while (match) {
    const anchorHtml = match[0];
    const anchorStart = match.index;
    const anchorEnd = anchorStart + anchorHtml.length;

    patched += sectionHtml.slice(cursor, anchorStart);
    if (anchorIndex < updates.length) {
      patched += patchAnchorNode(anchorHtml, updates[anchorIndex]);
    } else {
      patched += anchorHtml;
    }

    cursor = anchorEnd;
    anchorIndex += 1;
    match = anchorPattern.exec(sectionHtml);
  }

  patched += sectionHtml.slice(cursor);
  if (anchorIndex < updates.length) {
    console.warn(
      `[mirror slots] ${sectionName}: expected at least ${updates.length} anchors but found ${anchorIndex}. Skipping missing slots.`,
    );
  }

  return patched;
}

function findBalancedElementRange(sourceHtml, elementStartIndex, tagName) {
  if (elementStartIndex < 0) return null;

  const openToken = `<${tagName}`;
  const closeToken = `</${tagName}>`;
  let cursor = elementStartIndex;
  let depth = 0;

  while (cursor < sourceHtml.length) {
    const nextOpen = sourceHtml.indexOf(openToken, cursor);
    const nextClose = sourceHtml.indexOf(closeToken, cursor);

    if (nextClose === -1) return null;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      const openTagEnd = sourceHtml.indexOf('>', nextOpen);
      if (openTagEnd === -1) return null;
      depth += 1;
      cursor = openTagEnd + 1;
      continue;
    }

    depth -= 1;
    cursor = nextClose + closeToken.length;
    if (depth === 0) {
      return {
        start: elementStartIndex,
        end: cursor,
      };
    }
  }

  return null;
}

function findBalancedSymbolRange(source, startIndex, openSymbol, closeSymbol) {
  if (startIndex < 0) return null;
  if (source[startIndex] !== openSymbol) return null;

  let depth = 0;
  for (let cursor = startIndex; cursor < source.length; cursor += 1) {
    const char = source[cursor];
    if (char === openSymbol) {
      depth += 1;
      continue;
    }
    if (char === closeSymbol) {
      depth -= 1;
      if (depth === 0) {
        return {
          start: startIndex,
          end: cursor + 1,
        };
      }
    }
  }

  return null;
}

function tokenizePreservingWhitespace(value) {
  const tokens = String(value).match(/\S+|\s+/g);
  return tokens && tokens.length > 0 ? tokens : [String(value)];
}

function patchAnimatedTextElement(elementHtml, nextText) {
  let nextElement = elementHtml;

  nextElement = nextElement.replace(/\baria-label="[^"]*"/i, `aria-label="${escapeHtml(nextText)}"`);
  nextElement = nextElement.replace(
    /<span class="sr-only">[\s\S]*?<\/span>/i,
    `<span class="sr-only">${escapeHtml(nextText)}</span>`,
  );

  const tokenPattern = /<span class="inline-block whitespace-pre"[^>]*>[\s\S]*?<\/span>/gi;
  const tokenMatches = [];
  let tokenMatch = tokenPattern.exec(nextElement);
  while (tokenMatch) {
    tokenMatches.push({
      index: tokenMatch.index,
      fullMatch: tokenMatch[0],
    });
    tokenMatch = tokenPattern.exec(nextElement);
  }

  if (tokenMatches.length === 0) return nextElement;

  const firstToken = tokenMatches[0];
  const lastToken = tokenMatches[tokenMatches.length - 1];
  const openTagMatch = firstToken.fullMatch.match(/^<span\b[^>]*>/i);
  if (!openTagMatch) return nextElement;

  const tokenOpenTag = openTagMatch[0];
  const replacementTokens = tokenizePreservingWhitespace(nextText)
    .map((token) => `${tokenOpenTag}${escapeHtml(token)}</span>`)
    .join('');

  const replacementStart = firstToken.index;
  const replacementEnd = lastToken.index + lastToken.fullMatch.length;
  return `${nextElement.slice(0, replacementStart)}${replacementTokens}${nextElement.slice(replacementEnd)}`;
}

function patchBalancedElementByStartMarker(sourceHtml, startMarker, tagName, patchFn) {
  const elementStart = sourceHtml.indexOf(startMarker);
  if (elementStart === -1) return sourceHtml;

  const elementRange = findBalancedElementRange(sourceHtml, elementStart, tagName);
  if (!elementRange) return sourceHtml;

  const elementHtml = sourceHtml.slice(elementRange.start, elementRange.end);
  const patchedElement = patchFn(elementHtml);
  return `${sourceHtml.slice(0, elementRange.start)}${patchedElement}${sourceHtml.slice(elementRange.end)}`;
}

function patchHeroPrimaryCtaAnchor(heroSectionHtml, ctaLabel) {
  const primaryCtaAnchorPattern = /<a\b[^>]*href="\/pricing"[^>]*>[\s\S]*?<\/a>/i;
  const anchorMatch = heroSectionHtml.match(primaryCtaAnchorPattern);
  if (!anchorMatch) return heroSectionHtml;

  const anchorHtml = anchorMatch[0];
  const hrefMatch = anchorHtml.match(/\bhref="([^"]*)"/i);
  const href = hrefMatch ? hrefMatch[1] : '/pricing';
  const patchedAnchor = patchAnchorNode(anchorHtml, {
    label: ctaLabel,
    href,
    newTab: false,
  });

  return heroSectionHtml.replace(anchorHtml, patchedAnchor);
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function buildMediaPathReplacementPairs(fromPath, toPath) {
  const fromRaw = String(fromPath || '');
  const toRaw = String(toPath || '');
  const fromDecoded = safeDecodeURIComponent(fromRaw);
  const toDecoded = safeDecodeURIComponent(toRaw);

  const pairs = [
    [fromRaw, toRaw],
    [fromDecoded, toDecoded],
    [encodeURIComponent(fromRaw), encodeURIComponent(toRaw)],
    [encodeURIComponent(fromDecoded), encodeURIComponent(toDecoded)],
  ];

  const unique = [];
  const seen = new Set();
  for (const [fromValue, toValue] of pairs) {
    if (!fromValue || fromValue === toValue) continue;
    const key = `${fromValue}__${toValue}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push([fromValue, toValue]);
  }
  return unique;
}

function buildTrustSectionReplacementPairs(sectionContent) {
  const pairs = [
    [TRUST_SECTION_DEFAULT_CONTENT.memberLabel, sectionContent.memberLabel],
    [TRUST_SECTION_DEFAULT_CONTENT.readMoreLabel, sectionContent.readMoreLabel],
  ];

  for (let index = 0; index < TRUST_SECTION_DEFAULT_CONTENT.videoCards.length; index += 1) {
    const defaultCard = TRUST_SECTION_DEFAULT_CONTENT.videoCards[index];
    const nextCard = sectionContent.videoCards[index];
    if (!defaultCard || !nextCard) continue;

    pairs.push([defaultCard.thumbnailAlt, nextCard.thumbnailAlt]);
    pairs.push([defaultCard.profileAlt, nextCard.profileAlt]);
    pairs.push([defaultCard.handle, nextCard.handle]);
    pairs.push([defaultCard.meta, nextCard.meta]);

    pairs.push([`Play video by ${defaultCard.handle}`, `Play video by ${nextCard.handle}`]);
    pairs.push([`Video player for ${defaultCard.handle}`, `Video player for ${nextCard.handle}`]);
  }

  for (let index = 0; index < TRUST_SECTION_DEFAULT_CONTENT.textCards.length; index += 1) {
    const defaultCard = TRUST_SECTION_DEFAULT_CONTENT.textCards[index];
    const nextCard = sectionContent.textCards[index];
    if (!defaultCard || !nextCard) continue;

    pairs.push([defaultCard.profileAlt, nextCard.profileAlt]);
    pairs.push([defaultCard.name, nextCard.name]);
    pairs.push([defaultCard.quote, nextCard.quote]);
  }

  return pairs;
}

function findBalancedElementRangesByStartMarker(
  sourceHtml,
  startMarker,
  tagName,
  limit = Number.POSITIVE_INFINITY,
  fromIndex = 0,
) {
  const ranges = [];
  if (!startMarker) return ranges;

  let searchIndex = fromIndex;
  while (searchIndex >= 0 && searchIndex < sourceHtml.length && ranges.length < limit) {
    const startIndex = sourceHtml.indexOf(startMarker, searchIndex);
    if (startIndex === -1) break;

    const range = findBalancedElementRange(sourceHtml, startIndex, tagName);
    if (!range) break;

    ranges.push(range);
    searchIndex = range.end;
  }

  return ranges;
}

function replaceRangesByOffsets(sourceHtml, ranges) {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return sourceHtml;
  }

  const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);
  let cursor = 0;
  let output = '';

  for (const range of sortedRanges) {
    if (
      !range ||
      typeof range.start !== 'number' ||
      typeof range.end !== 'number' ||
      typeof range.content !== 'string'
    ) {
      continue;
    }
    if (range.start < cursor || range.end < range.start) {
      continue;
    }

    output += sourceHtml.slice(cursor, range.start);
    output += range.content;
    cursor = range.end;
  }

  output += sourceHtml.slice(cursor);
  return output;
}

function patchFeaturePanelCardMarkup(cardHtml, defaultCard, nextCard, ctaLabel) {
  let nextCardHtml = cardHtml;

  nextCardHtml = nextCardHtml.replace(
    /(<img\b[^>]*\balt=")[^"]*(")/i,
    `$1${escapeHtml(nextCard.alt)}$2`,
  );

  const mediaPathPairs = buildMediaPathReplacementPairs(defaultCard.imagePath, nextCard.imagePath);
  for (const [fromPath, toPath] of mediaPathPairs) {
    nextCardHtml = nextCardHtml.replaceAll(fromPath, toPath);
  }

  nextCardHtml = patchBalancedElementByStartMarker(
    nextCardHtml,
    '<h3 class="text-[32px] relative z-10">',
    'h3',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = nextHeading.replace(
        /(<span\b[^>]*>)[\s\S]*?(<\/span>)/i,
        `$1${escapeHtml(nextCard.titleLine1)}$2`,
      );
      nextHeading = nextHeading.replace(
        /(<em\b[^>]*>)[\s\S]*?(<\/em>)/i,
        `$1${escapeHtml(nextCard.titleLine2)}$2`,
      );
      return nextHeading;
    },
  );

  nextCardHtml = nextCardHtml.replace(/<a\b[^>]*>[\s\S]*?<\/a>/i, (anchorHtml) =>
    patchAnchorNode(anchorHtml, {
      label: ctaLabel,
      href: nextCard.href,
      newTab: false,
    }),
  );

  return nextCardHtml;
}

function patchFeaturePanelStatsMarkup(sectionHtml, panelContent) {
  const stats = [panelContent.stat1, panelContent.stat2];
  let nextSection = sectionHtml;

  let valueIndex = 0;
  nextSection = nextSection.replace(
    /(<div class="italic text-\[80px\] font-medium text-blueZodiac font-victorSerif">)([\s\S]*?)(<\/div>)/g,
    (match, startTag, currentValue, endTag) => {
      const stat = stats[valueIndex];
      valueIndex += 1;
      if (!stat) return match;
      const trailing = typeof currentValue === 'string' ? currentValue.match(/\s+$/)?.[0] || '' : '';
      return `${startTag}${escapeHtml(stat.value)}${trailing}${endTag}`;
    },
  );

  let lineIndex = 0;
  nextSection = nextSection.replace(
    /(<div class="text-grey-500 text-2xl">)[\s\S]*?(<\/div>)/g,
    (match, startTag, endTag) => {
      const stat = stats[lineIndex];
      lineIndex += 1;
      if (!stat) return match;
      return `${startTag}${escapeHtml(stat.line1)}<br/>${escapeHtml(stat.line2)}${endTag}`;
    },
  );

  return nextSection;
}

function patchFeaturePanelPrimarySectionMarkup(sectionHtml, panelContent) {
  const cardStartMarker =
    '<div class="relative shrink-0 w-[280px] max-lg:w-[80vw] overflow-hidden rounded-[14px] max-lg:last:mr-4">';
  const cardRanges = findBalancedElementRangesByStartMarker(
    sectionHtml,
    cardStartMarker,
    'div',
    FEATURE_PANEL_DEFAULT_CONTENT.cards.length,
  );
  if (cardRanges.length < FEATURE_PANEL_DEFAULT_CONTENT.cards.length) {
    console.warn(
      `[mirror slots] feature-panel-primary: expected ${FEATURE_PANEL_DEFAULT_CONTENT.cards.length} cards but found ${cardRanges.length}.`,
    );
  }

  const cardReplacements = [];
  for (let index = 0; index < cardRanges.length; index += 1) {
    const range = cardRanges[index];
    const defaultCard = FEATURE_PANEL_DEFAULT_CONTENT.cards[index];
    const nextCard = panelContent.cards[index];
    if (!defaultCard || !nextCard) continue;

    const cardHtml = sectionHtml.slice(range.start, range.end);
    const patchedCard = patchFeaturePanelCardMarkup(
      cardHtml,
      defaultCard,
      nextCard,
      panelContent.cardCtaLabel,
    );
    cardReplacements.push({
      start: range.start,
      end: range.end,
      content: patchedCard,
    });
  }

  let nextSection = replaceRangesByOffsets(sectionHtml, cardReplacements);

  nextSection = patchBalancedElementByStartMarker(
    nextSection,
    '<h2 class="font-450 mb-4 lg:text-[36px] !leading-none text-heading-section">',
    'h2',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, panelContent.headingLine1),
      );
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap italic font-victorSerif font-medium lg:text-[36px] text-heading-section" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, panelContent.headingLine2),
      );
      return nextHeading;
    },
  );

  nextSection = patchBalancedElementByStartMarker(
    nextSection,
    '<p class="whitespace-pre-wrap text-muted-foreground mb-4.5 leading-relaxed"',
    'p',
    (elementHtml) => patchAnimatedTextElement(elementHtml, panelContent.description),
  );

  nextSection = patchFeaturePanelStatsMarkup(nextSection, panelContent);
  return nextSection;
}

function patchFeaturePanelPrescriptionSectionMarkup(sectionHtml, panelContent) {
  const cardStartMarker =
    '<div class="relative shrink-0 w-[280px] max-lg:w-[80vw] overflow-hidden rounded-[14px] max-lg:last:mr-4">';
  const cardRanges = findBalancedElementRangesByStartMarker(sectionHtml, cardStartMarker, 'div', 1);
  if (cardRanges.length === 0) {
    console.warn('[mirror slots] feature-panel-prescription: expected at least one card but none were found.');
    return sectionHtml;
  }

  const defaultCard = FEATURE_PANEL_DEFAULT_CONTENT.prescriptionCard;
  const nextCard = panelContent.prescriptionCard;
  const range = cardRanges[0];
  const cardHtml = sectionHtml.slice(range.start, range.end);
  const patchedCard = patchFeaturePanelCardMarkup(cardHtml, defaultCard, nextCard, nextCard.ctaLabel);

  let nextSection = replaceRangesByOffsets(sectionHtml, [
    {
      start: range.start,
      end: range.end,
      content: patchedCard,
    },
  ]);

  nextSection = patchBalancedElementByStartMarker(
    nextSection,
    '<h2 class="font-450 mb-4 lg:text-[36px] !leading-none text-heading-section">',
    'h2',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, panelContent.careHeadingLine1),
      );
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap italic font-victorSerif font-medium lg:text-[36px] text-heading-section" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, panelContent.careHeadingLine2),
      );
      return nextHeading;
    },
  );

  nextSection = patchBalancedElementByStartMarker(
    nextSection,
    '<p class="whitespace-pre-wrap text-muted-foreground mb-4.5 leading-relaxed"',
    'p',
    (elementHtml) => patchAnimatedTextElement(elementHtml, panelContent.careDescription),
  );

  if (FEATURE_PANEL_DEFAULT_CONTENT.testimonialAlt !== panelContent.testimonialAlt) {
    nextSection = nextSection.replaceAll(
      `alt="${escapeHtml(FEATURE_PANEL_DEFAULT_CONTENT.testimonialAlt)}"`,
      `alt="${escapeHtml(panelContent.testimonialAlt)}"`,
    );
  }

  if (FEATURE_PANEL_DEFAULT_CONTENT.badgeTitle !== panelContent.badgeTitle) {
    nextSection = nextSection.replaceAll(
      FEATURE_PANEL_DEFAULT_CONTENT.badgeTitle,
      panelContent.badgeTitle,
    );
  }

  if (FEATURE_PANEL_DEFAULT_CONTENT.badgeStatus !== panelContent.badgeStatus) {
    nextSection = nextSection.replaceAll(
      FEATURE_PANEL_DEFAULT_CONTENT.badgeStatus,
      panelContent.badgeStatus,
    );
  }

  return nextSection;
}

function applyFeaturePanelPatchesToMarkup(markupBeforeScripts, siteContent) {
  const panelContent = resolveFeaturePanelContent(siteContent);
  const sectionStartMarker = '<div class="mt-[52px] lg:mt-[265px] mb-[63px] lg:mb-[198px]">';
  const sectionRanges = findBalancedElementRangesByStartMarker(
    markupBeforeScripts,
    sectionStartMarker,
    'div',
    2,
  );
  if (sectionRanges.length === 0) return markupBeforeScripts;
  if (sectionRanges.length < 2) {
    console.warn(
      `[mirror slots] feature-panel: expected 2 sections but found ${sectionRanges.length}.`,
    );
  }

  const replacements = [];
  const primaryRange = sectionRanges[0];
  if (primaryRange) {
    const primaryHtml = markupBeforeScripts.slice(primaryRange.start, primaryRange.end);
    const patchedPrimary = patchFeaturePanelPrimarySectionMarkup(primaryHtml, panelContent);
    replacements.push({
      start: primaryRange.start,
      end: primaryRange.end,
      content: patchedPrimary,
    });
  }

  const prescriptionRange = sectionRanges[1];
  if (prescriptionRange) {
    const prescriptionHtml = markupBeforeScripts.slice(prescriptionRange.start, prescriptionRange.end);
    const patchedPrescription = patchFeaturePanelPrescriptionSectionMarkup(
      prescriptionHtml,
      panelContent,
    );
    replacements.push({
      start: prescriptionRange.start,
      end: prescriptionRange.end,
      content: patchedPrescription,
    });
  }

  return replaceRangesByOffsets(markupBeforeScripts, replacements);
}

function applyTrustSectionPatchesToMarkup(markupBeforeScripts, siteContent) {
  const sectionContent = resolveTrustSectionContent(siteContent);
  const sectionStartMarker = '<div class="mb-[78px] lg:mb-[263px] mt-[87px] lg:mt-[188px]">';
  const sectionStartIndex = markupBeforeScripts.indexOf(sectionStartMarker);
  if (sectionStartIndex === -1) return markupBeforeScripts;

  const sectionRange = findBalancedElementRange(markupBeforeScripts, sectionStartIndex, 'div');
  if (!sectionRange) return markupBeforeScripts;

  let sectionHtml = markupBeforeScripts.slice(sectionRange.start, sectionRange.end);

  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    '<h2 class="capitalize font-450 whitespace-nowrap text-heading">',
    'h2',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.headingLine1),
      );
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<em class="whitespace-pre-wrap font-victorSerif font-medium italic text-heading" aria-label=',
        'em',
        (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.headingLine2),
      );
      return nextHeading;
    },
  );

  const replacementPairs = buildTrustSectionReplacementPairs(sectionContent);
  sectionHtml = applyExactReplacements(sectionHtml, replacementPairs);

  return `${markupBeforeScripts.slice(0, sectionRange.start)}${sectionHtml}${markupBeforeScripts.slice(sectionRange.end)}`;
}

function applyCommandCenterSectionPatchesToMarkup(markupBeforeScripts, siteContent) {
  const sectionContent = resolveCommandCenterSectionContent(siteContent);
  const sectionStartMarker = '<div class="mb-[127px] lg:mb-[167px]">';
  const sectionStartIndex = markupBeforeScripts.indexOf(sectionStartMarker);
  if (sectionStartIndex === -1) return markupBeforeScripts;

  const sectionRange = findBalancedElementRange(markupBeforeScripts, sectionStartIndex, 'div');
  if (!sectionRange) return markupBeforeScripts;

  let sectionHtml = markupBeforeScripts.slice(sectionRange.start, sectionRange.end);

  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    '<h2 class="font-450 text-center text-heading">',
    'h2',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.headingLine1),
      );
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<em class="whitespace-pre-wrap font-victorSerif capitalize font-medium text-heading" aria-label=',
        'em',
        (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.headingLine2),
      );
      return nextHeading;
    },
  );

  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    '<p class="whitespace-pre-wrap text-grey-500 text-xl" aria-label=',
    'p',
    (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.description),
  );

  const ctaAnchorPattern = /<a\b[^>]*href="\/pricing"[^>]*>[\s\S]*?<\/a>/i;
  sectionHtml = sectionHtml.replace(ctaAnchorPattern, (anchorHtml) => {
    const hrefMatch = anchorHtml.match(/\bhref="([^"]*)"/i);
    const href = hrefMatch ? hrefMatch[1] : '/pricing';
    return patchAnchorNode(anchorHtml, {
      label: sectionContent.ctaLabel,
      href,
      newTab: false,
    });
  });

  if (
    COMMAND_CENTER_SECTION_DEFAULT_CONTENT.loadingAnimationLabel !==
    sectionContent.loadingAnimationLabel
  ) {
    sectionHtml = sectionHtml.replaceAll(
      COMMAND_CENTER_SECTION_DEFAULT_CONTENT.loadingAnimationLabel,
      sectionContent.loadingAnimationLabel,
    );
  }

  sectionHtml = sectionHtml.replace(
    /<img\b[^>]*class="w-full lg:w-\[301px\] h-\[673px\] object-contain"[^>]*>/i,
    (imageTag) => setAttributeInTag(imageTag, 'alt', sectionContent.appImageAlt),
  );

  return `${markupBeforeScripts.slice(0, sectionRange.start)}${sectionHtml}${markupBeforeScripts.slice(sectionRange.end)}`;
}

function applyOurProcessSectionPatchesToMarkup(markupBeforeScripts, siteContent) {
  const sectionContent = resolveOurProcessSectionContent(siteContent);
  const headingStartMarker = '<h3 class="text-4xl lg:text-[48px] font-450 capitalize mb-6 lg:mb-10">';
  const headingStartIndex = markupBeforeScripts.indexOf(headingStartMarker);
  if (headingStartIndex === -1) return markupBeforeScripts;

  const sectionStartMarker = '<div class="mt-24 lg:mt-30 mb-24 lg:mb-30">';
  const sectionStartIndex = markupBeforeScripts.lastIndexOf(sectionStartMarker, headingStartIndex);
  if (sectionStartIndex === -1) return markupBeforeScripts;

  const sectionRange = findBalancedElementRange(markupBeforeScripts, sectionStartIndex, 'div');
  if (!sectionRange) return markupBeforeScripts;

  let sectionHtml = markupBeforeScripts.slice(sectionRange.start, sectionRange.end);

  sectionHtml = sectionHtml.replace(
    /<img\b[^>]*class="rounded-\[14px\] absolute object-cover w-full h-full"[^>]*>/i,
    (imageTag) => setAttributeInTag(imageTag, 'alt', sectionContent.imageAlt),
  );

  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    headingStartMarker,
    'h3',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = nextHeading.replace(
        /(<h3\b[^>]*>)[\s\S]*?(<em\b[^>]*>)/i,
        `$1${escapeHtml(sectionContent.headingLine1)}<!-- --> $2`,
      );
      nextHeading = nextHeading.replace(
        /(<em\b[^>]*>)[\s\S]*?(<\/em>)/i,
        `$1${escapeHtml(sectionContent.headingLine2)}$2`,
      );
      return nextHeading;
    },
  );

  let stepTitleIndex = 0;
  sectionHtml = sectionHtml.replace(
    /(<span class="text-2xl lg:text-\[36px\] font-400 capitalize ml-2 text-primary-blue-zodiac">)[\s\S]*?(<\/span>)/g,
    (match, startTag, endTag) => {
      const step = sectionContent.steps[stepTitleIndex];
      stepTitleIndex += 1;
      if (!step) return match;
      return `${startTag}${escapeHtml(step.title)}${endTag}`;
    },
  );

  let stepDescriptionIndex = 0;
  sectionHtml = sectionHtml.replace(
    /(<p class="font-400 text-grey-500 lg:text-xl text-lg">)[\s\S]*?(<\/p>)/g,
    (match, startTag, endTag) => {
      const step = sectionContent.steps[stepDescriptionIndex];
      stepDescriptionIndex += 1;
      if (!step) return match;
      return `${startTag}${escapeHtml(step.description)}${endTag}`;
    },
  );

  return `${markupBeforeScripts.slice(0, sectionRange.start)}${sectionHtml}${markupBeforeScripts.slice(sectionRange.end)}`;
}

function patchChoosePathPlanGroupMarkup(groupHtml, groupContent, planIndex, groupIndex) {
  let nextGroup = groupHtml;
  nextGroup = nextGroup.replace(
    /(<h4 class="text-grey-500 text-xl">)[\s\S]*?(<\/h4>)/i,
    `$1${escapeHtml(groupContent.categoryName)}$2`,
  );

  let featureIndex = 0;
  nextGroup = nextGroup.replace(
    /(<li class="text-grey-500 flex items-center gap-\[10px\]">[\s\S]*?<span>)[\s\S]*?(<\/span>[\s\S]*?<\/li>)/g,
    (match, startTag, endTag) => {
      const feature = groupContent.features[featureIndex];
      featureIndex += 1;
      if (!feature || typeof feature.name !== 'string') return match;
      return `${startTag}${escapeHtml(feature.name)}${endTag}`;
    },
  );

  if (featureIndex < groupContent.features.length) {
    console.warn(
      `[mirror slots] choose-path-card-${planIndex + 1}-group-${groupIndex + 1}: expected at least ${groupContent.features.length} list items but found ${featureIndex}.`,
    );
  }

  return nextGroup;
}

function patchChoosePathPlanGroupsMarkup(groupsContainerHtml, planContent, planIndex) {
  const groupStartMarker = '<div class="flex flex-col gap-3">';
  const targetGroups = [...planContent.feature, ...planContent.restriction];
  if (targetGroups.length === 0) return groupsContainerHtml;

  const groupRanges = findBalancedElementRangesByStartMarker(
    groupsContainerHtml,
    groupStartMarker,
    'div',
    targetGroups.length,
  );
  if (groupRanges.length < targetGroups.length) {
    console.warn(
      `[mirror slots] choose-path-card-${planIndex + 1}: expected ${targetGroups.length} list groups but found ${groupRanges.length}.`,
    );
  }

  const replacements = [];
  for (let groupIndex = 0; groupIndex < groupRanges.length; groupIndex += 1) {
    const targetGroup = targetGroups[groupIndex];
    const range = groupRanges[groupIndex];
    if (!range || !targetGroup) continue;

    const groupHtml = groupsContainerHtml.slice(range.start, range.end);
    const patchedGroup = patchChoosePathPlanGroupMarkup(groupHtml, targetGroup, planIndex, groupIndex);
    replacements.push({
      start: range.start,
      end: range.end,
      content: patchedGroup,
    });
  }

  return replaceRangesByOffsets(groupsContainerHtml, replacements);
}

function patchChoosePathPlanCardMarkup(cardHtml, planContent, planIndex) {
  let nextCardHtml = cardHtml;

  nextCardHtml = nextCardHtml.replace(
    /(<h3 class="text-\[42px\] font-450 text-center">)[\s\S]*?(<em class="font-victorSerif font-medium italic">)[\s\S]*?(<\/em><\/h3>)/i,
    `$1${escapeHtml(planContent.name)}<!-- --> $2${escapeHtml(planContent.nameStyle)}$3`,
  );
  nextCardHtml = nextCardHtml.replace(
    /(<p class="capitalize text-center text-sm">)[\s\S]*?(<\/p>)/i,
    `$1${escapeHtml(planContent.tagline)}$2`,
  );
  nextCardHtml = nextCardHtml.replace(
    /(<h3 class="text-center italic font-victorSerif font-semibold text-\[40px\] text-blueZodiac mt-4">)[\s\S]*?(<\/h3>)/i,
    `$1${escapeHtml(toPricingMarkupMoneyValue(planContent.pricing.oneTimePrice))}$2`,
  );
  nextCardHtml = nextCardHtml.replace(
    /(<p class="text-center italic font-victorSerif font-semibold text-xl text-blueZodiac mb-4">)[\s\S]*?(<\/p>)/i,
    `$1${escapeHtml(planContent.pricing.twiceAnnuallyBillingText)}$2`,
  );

  const pricingLabels = [planContent.pricing.oneTimeLabel, planContent.pricing.recurringLabel];
  let labelIndex = 0;
  nextCardHtml = nextCardHtml.replace(
    /(<span class="italic font-medium font-victorSerif text-black">\s*<!-- -->)[\s\S]*?(<\/span>)/g,
    (match, startTag, endTag) => {
      const label = pricingLabels[labelIndex];
      labelIndex += 1;
      if (typeof label !== 'string') return match;
      return `${startTag}${escapeHtml(label)}${endTag}`;
    },
  );
  if (labelIndex < pricingLabels.length) {
    console.warn(
      `[mirror slots] choose-path-card-${planIndex + 1}: expected at least ${pricingLabels.length} billing labels but found ${labelIndex}.`,
    );
  }

  nextCardHtml = patchBalancedElementByStartMarker(
    nextCardHtml,
    '<div class="ml-2 flex items-center font-poppins rounded-full justify-center gap-1 px-2 py-[6px] border-[0.5px] border-[#DCFCE7] text-[10px] text-[#15803D] bg-[#F0FDF4]">',
    'div',
    (discountHtml) =>
      discountHtml.replace(
        /(<span>)[\s\S]*?(<\/span>)/i,
        `$1${escapeHtml(planContent.pricing.discountPercentage)}$2`,
      ),
  );

  nextCardHtml = patchBalancedElementByStartMarker(
    nextCardHtml,
    '<div class="flex flex-col gap-6 mt-8">',
    'div',
    (groupsContainerHtml) => patchChoosePathPlanGroupsMarkup(groupsContainerHtml, planContent, planIndex),
  );

  const ctaAnchorPattern = /<a\b[^>]*href="\/pricing"[^>]*>[\s\S]*?<\/a>/i;
  nextCardHtml = nextCardHtml.replace(ctaAnchorPattern, (anchorHtml) => {
    const hrefMatch = anchorHtml.match(/\bhref="([^"]*)"/i);
    const href = hrefMatch ? hrefMatch[1] : '/pricing';
    return patchAnchorNode(anchorHtml, {
      label: planContent.link.label,
      href,
      newTab: false,
    });
  });

  return nextCardHtml;
}

function applyChoosePathSectionPatchesToMarkup(markupBeforeScripts, siteContent) {
  const sectionContent = resolveChoosePathSectionContent(siteContent);
  const headingStartMarker =
    '<h2 class="text-blueZodiac font-medium italic font-victorSerif text-heading-sm">Choose Your Path</h2>';
  const headingStartIndex = markupBeforeScripts.indexOf(headingStartMarker);
  if (headingStartIndex === -1) return markupBeforeScripts;

  const sectionStartMarker = '<div class="mt-24 lg:mt-30 mb-24 lg:mb-30">';
  const sectionStartIndex = markupBeforeScripts.lastIndexOf(sectionStartMarker, headingStartIndex);
  if (sectionStartIndex === -1) return markupBeforeScripts;

  const sectionRange = findBalancedElementRange(markupBeforeScripts, sectionStartIndex, 'div');
  if (!sectionRange) return markupBeforeScripts;

  let sectionHtml = markupBeforeScripts.slice(sectionRange.start, sectionRange.end);
  sectionHtml = sectionHtml.replace(
    /(<h2 class="text-blueZodiac font-medium italic font-victorSerif text-heading-sm">)[\s\S]*?(<\/h2>)/i,
    `$1${escapeHtml(sectionContent.title)}$2`,
  );
  sectionHtml = sectionHtml.replace(
    /(<p class="capitalize mt-2 text-blueZodiac font-450 text-sm  sm:text-base">)[\s\S]*?(<\/p>)/i,
    `$1${escapeHtml(sectionContent.subtitle)}$2`,
  );

  const cardStartMarker = '<div class="flex flex-col h-full gap-6 relative">';
  const cardRanges = findBalancedElementRangesByStartMarker(
    sectionHtml,
    cardStartMarker,
    'div',
    sectionContent.plans.length,
  );
  if (cardRanges.length < sectionContent.plans.length) {
    console.warn(
      `[mirror slots] choose-path-section: expected ${sectionContent.plans.length} cards but found ${cardRanges.length}.`,
    );
  }

  const cardReplacements = [];
  for (let planIndex = 0; planIndex < cardRanges.length; planIndex += 1) {
    const range = cardRanges[planIndex];
    const nextPlan = sectionContent.plans[planIndex];
    if (!range || !nextPlan) continue;
    const cardHtml = sectionHtml.slice(range.start, range.end);
    const patchedCard = patchChoosePathPlanCardMarkup(cardHtml, nextPlan, planIndex);
    cardReplacements.push({
      start: range.start,
      end: range.end,
      content: patchedCard,
    });
  }

  sectionHtml = replaceRangesByOffsets(sectionHtml, cardReplacements);
  return `${markupBeforeScripts.slice(0, sectionRange.start)}${sectionHtml}${markupBeforeScripts.slice(sectionRange.end)}`;
}

function applyFaqSectionPatchesToMarkup(markupBeforeScripts, siteContent) {
  const sectionContent = resolveFaqSectionContent(siteContent);
  const sectionStartMarker = '<div class="mt-11 lg:mt-[177px] mb-[76px] lg:mb-[188px]">';
  const sectionStartIndex = markupBeforeScripts.indexOf(sectionStartMarker);
  if (sectionStartIndex === -1) return markupBeforeScripts;

  const sectionRange = findBalancedElementRange(markupBeforeScripts, sectionStartIndex, 'div');
  if (!sectionRange) return markupBeforeScripts;

  let sectionHtml = markupBeforeScripts.slice(sectionRange.start, sectionRange.end);
  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    '<h2 class="darkBg:text-white capitalize font-450 whitespace-nowrap text-heading">',
    'h2',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.headingLine1),
      );
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<em class="whitespace-pre-wrap font-victorSerif font-medium italic text-heading" aria-label=',
        'em',
        (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.headingLine2),
      );
      return nextHeading;
    },
  );

  let questionIndex = 0;
  sectionHtml = sectionHtml.replace(
    /(<span class="max-lg:text-sm text-balticSea">)[\s\S]*?(<\/span>)/g,
    (match, startTag, endTag) => {
      const item = sectionContent.items[questionIndex];
      questionIndex += 1;
      if (!item) return match;
      return `${startTag}${escapeHtml(item.question)}${endTag}`;
    },
  );
  if (questionIndex < sectionContent.items.length) {
    console.warn(
      `[mirror slots] faq-section: expected at least ${sectionContent.items.length} question labels but found ${questionIndex}.`,
    );
  }

  let answerIndex = 0;
  sectionHtml = sectionHtml.replace(
    /(<p class="text-\[#99A0AE\] max-lg:text-sm">)[\s\S]*?(<\/p>)/g,
    (match, startTag, endTag) => {
      const item = sectionContent.items[answerIndex];
      answerIndex += 1;
      if (!item) return match;
      return `${startTag}${escapeHtml(item.answer)}${endTag}`;
    },
  );
  if (answerIndex < sectionContent.items.length) {
    console.warn(
      `[mirror slots] faq-section: expected at least ${sectionContent.items.length} answers but found ${answerIndex}.`,
    );
  }

  sectionHtml = sectionHtml.replace(
    /<img\b[^>]*class="w-full h-full object-cover rounded-2xl"[^>]*>/i,
    (imageTag) => setAttributeInTag(imageTag, 'alt', sectionContent.cardImageAlt),
  );
  sectionHtml = sectionHtml.replace(
    /(<h5 class="font-medium text-xl text-white">)[\s\S]*?(<\/h5>)/i,
    `$1${escapeHtml(sectionContent.supportTitle)}$2`,
  );
  sectionHtml = sectionHtml.replace(
    /(<p class="italic text-grey-100 mt-1 font-victorSerif font-medium">)[\s\S]*?(<\/p>)/i,
    `$1${escapeHtml(sectionContent.supportDescription)}$2`,
  );

  const supportAnchorPattern = /<a\b[^>]*href="\/contact-us"[^>]*>[\s\S]*?<\/a>/i;
  sectionHtml = sectionHtml.replace(supportAnchorPattern, (anchorHtml) =>
    patchAnchorNode(anchorHtml, {
      label: sectionContent.supportCtaLabel,
      href: sectionContent.supportCtaHref,
      newTab: false,
    }),
  );

  return `${markupBeforeScripts.slice(0, sectionRange.start)}${sectionHtml}${markupBeforeScripts.slice(sectionRange.end)}`;
}

function applyMissionSectionPatchesToMarkup(markupBeforeScripts, siteContent) {
  const sectionContent = resolveMissionSectionContent(siteContent);
  const missionContent = sectionContent.mission;
  const sectionStartMarker = '<div class="mt-[76px] lg:mt-[188px] mb-[87px] lg:mb-[188px]">';
  const sectionStartIndex = markupBeforeScripts.indexOf(sectionStartMarker);
  if (sectionStartIndex === -1) return markupBeforeScripts;

  const sectionRange = findBalancedElementRange(markupBeforeScripts, sectionStartIndex, 'div');
  if (!sectionRange) return markupBeforeScripts;

  let sectionHtml = markupBeforeScripts.slice(sectionRange.start, sectionRange.end);

  sectionHtml = sectionHtml.replace(
    /<img\b[^>]*class="w-full lg:w-\[519px\] h-\[544px\] object-cover"[^>]*>/i,
    (imageTag) => {
      let nextTag = setAttributeInTag(imageTag, 'alt', missionContent.imageAlt);
      nextTag = setAttributeInTag(nextTag, 'src', missionContent.imagePath);
      return nextTag;
    },
  );

  const missionImagePairs = buildMediaPathReplacementPairs(
    MISSION_SECTION_DEFAULT_CONTENT.mission.imagePath,
    missionContent.imagePath,
  );
  for (const [fromPath, toPath] of missionImagePairs) {
    sectionHtml = sectionHtml.replaceAll(fromPath, toPath);
  }

  sectionHtml = sectionHtml.replace(
    /(<h3 class="mt-5 text-balticSea text-xl">)[\s\S]*?(<\/h3>)/i,
    `$1${escapeHtml(missionContent.name)}$2`,
  );
  sectionHtml = sectionHtml.replace(
    /(<p class="text-grey-500 italic font-medium font-victorSerif text-xl">)[\s\S]*?(<\/p>)/i,
    `$1${escapeHtml(missionContent.role)}$2`,
  );

  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    '<h2 class="font-450 text-heading">',
    'h2',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, missionContent.headingLine1),
      );
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<em class="whitespace-pre-wrap font-victorSerif font-medium',
        'em',
        (elementHtml) => patchAnimatedTextElement(elementHtml, missionContent.headingLine2),
      );
      return nextHeading;
    },
  );

  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    '<p class="whitespace-pre-wrap text-grey-500',
    'p',
    (elementHtml) => patchAnimatedTextElement(elementHtml, missionContent.description),
  );

  const ctaAnchorPattern = /<a\b[^>]*href="\/pricing"[^>]*>[\s\S]*?<\/a>/i;
  sectionHtml = sectionHtml.replace(ctaAnchorPattern, (anchorHtml) =>
    patchAnchorNode(anchorHtml, {
      label: missionContent.ctaLabel,
      href: missionContent.ctaHref,
      newTab: false,
    }),
  );

  return `${markupBeforeScripts.slice(0, sectionRange.start)}${sectionHtml}${markupBeforeScripts.slice(sectionRange.end)}`;
}

function applyMissionGallerySectionPatchesToMarkup(markupBeforeScripts, siteContent) {
  const sectionContent = resolveMissionSectionContent(siteContent);
  const galleryContent = sectionContent.gallery;
  const sectionStartMarker = '<div class="mb-[78px] lg:mb-[123px] mt-[78px] lg:mt-[263px]">';
  const sectionStartIndex = markupBeforeScripts.indexOf(sectionStartMarker);
  if (sectionStartIndex === -1) return markupBeforeScripts;

  const sectionRange = findBalancedElementRange(markupBeforeScripts, sectionStartIndex, 'div');
  if (!sectionRange) return markupBeforeScripts;

  let sectionHtml = markupBeforeScripts.slice(sectionRange.start, sectionRange.end);
  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    '<h2 class="font-450 text-heading">',
    'h2',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = nextHeading.replace(
        /(<span>)[\s\S]*?(<\/span>)/i,
        `$1${escapeHtml(galleryContent.headingLine1)}$2`,
      );
      nextHeading = nextHeading.replace(
        /(<em\b[^>]*>)[\s\S]*?(<\/em>)/i,
        `$1${escapeHtml(galleryContent.headingLine2)}$2`,
      );
      return nextHeading;
    },
  );

  const ctaAnchorPattern = /<a\b[^>]*href="\/pricing"[^>]*>[\s\S]*?<\/a>/i;
  sectionHtml = sectionHtml.replace(ctaAnchorPattern, (anchorHtml) =>
    patchAnchorNode(anchorHtml, {
      label: galleryContent.ctaLabel,
      href: galleryContent.ctaHref,
      newTab: false,
    }),
  );

  for (let index = 0; index < MISSION_SECTION_DEFAULT_CONTENT.gallery.images.length; index += 1) {
    const defaultImage = MISSION_SECTION_DEFAULT_CONTENT.gallery.images[index];
    const nextImage = galleryContent.images[index];
    if (!defaultImage || !nextImage) continue;

    if (defaultImage.alt !== nextImage.alt) {
      sectionHtml = sectionHtml.replaceAll(
        `alt="${escapeHtml(defaultImage.alt)}"`,
        `alt="${escapeHtml(nextImage.alt)}"`,
      );
    }

    const mediaPathPairs = buildMediaPathReplacementPairs(defaultImage.imagePath, nextImage.imagePath);
    for (const [fromPath, toPath] of mediaPathPairs) {
      sectionHtml = sectionHtml.replaceAll(fromPath, toPath);
    }
  }

  return `${markupBeforeScripts.slice(0, sectionRange.start)}${sectionHtml}${markupBeforeScripts.slice(sectionRange.end)}`;
}

function applyNewsletterSectionPatchesToMarkup(markupBeforeScripts, siteContent) {
  const sectionContent = resolveNewsletterSectionContent(siteContent);
  const sectionStartMarker = '<div class="mt-0 mb-0">';
  const sectionStartIndex = markupBeforeScripts.indexOf(sectionStartMarker);
  if (sectionStartIndex === -1) return markupBeforeScripts;

  const sectionRange = findBalancedElementRange(markupBeforeScripts, sectionStartIndex, 'div');
  if (!sectionRange) return markupBeforeScripts;

  let sectionHtml = markupBeforeScripts.slice(sectionRange.start, sectionRange.end);

  sectionHtml = sectionHtml.replace(
    /<img\b[^>]*class="w-full h-\[625px\] lg:h-\[847px\] object-cover"[^>]*>/i,
    (imageTag) => {
      let nextTag = setAttributeInTag(imageTag, 'alt', sectionContent.backgroundImageAlt);
      nextTag = setAttributeInTag(nextTag, 'src', sectionContent.backgroundImagePath);
      return nextTag;
    },
  );

  const backgroundImagePairs = buildMediaPathReplacementPairs(
    NEWSLETTER_SECTION_DEFAULT_CONTENT.backgroundImagePath,
    sectionContent.backgroundImagePath,
  );
  for (const [fromPath, toPath] of backgroundImagePairs) {
    sectionHtml = sectionHtml.replaceAll(fromPath, toPath);
  }

  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    '<h2 class="text-[7.96vw]/[46px] xs:text-[32px]/[46px] lg:text-[64px]/[92px] font-550">',
    'h2',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.headingLine1),
      );
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<em class="whitespace-pre-wrap font-victorSerif leading-[42px] lg:leading-[84px] font-medium" aria-label=',
        'em',
        (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.headingLine2),
      );
      return nextHeading;
    },
  );

  sectionHtml = patchBalancedElementByStartMarker(
    sectionHtml,
    '<p class="whitespace-pre-wrap text-sm/[141%] sm:text-xl lg:text-2xl',
    'p',
    (elementHtml) => patchAnimatedTextElement(elementHtml, sectionContent.description),
  );

  const ctaAnchorPattern = /<a\b[^>]*href="\/pricing"[^>]*>[\s\S]*?<\/a>/i;
  sectionHtml = sectionHtml.replace(ctaAnchorPattern, (anchorHtml) =>
    patchAnchorNode(anchorHtml, {
      label: sectionContent.ctaLabel,
      href: sectionContent.ctaHref,
      newTab: false,
    }),
  );

  return `${markupBeforeScripts.slice(0, sectionRange.start)}${sectionHtml}${markupBeforeScripts.slice(sectionRange.end)}`;
}

function applyFooterSectionPatchesToMarkup(markupBeforeScripts, siteContent) {
  const sectionContent = resolveFooterSectionContent(siteContent);
  const sectionStartMarker = '<footer class="rounded-t-[30px] relative z-10 bg-blueZodiac text-white">';
  const sectionStartIndex = markupBeforeScripts.indexOf(sectionStartMarker);
  if (sectionStartIndex === -1) return markupBeforeScripts;

  const sectionRange = findBalancedElementRange(markupBeforeScripts, sectionStartIndex, 'footer');
  if (!sectionRange) return markupBeforeScripts;

  let sectionHtml = markupBeforeScripts.slice(sectionRange.start, sectionRange.end);

  if (FOOTER_SECTION_DEFAULT_CONTENT.logoAlt !== sectionContent.logoAlt) {
    sectionHtml = sectionHtml.replaceAll(
      `alt="${escapeHtml(FOOTER_SECTION_DEFAULT_CONTENT.logoAlt)}"`,
      `alt="${escapeHtml(sectionContent.logoAlt)}"`,
    );
  }

  sectionHtml = sectionHtml.replace(
    /<input\b[^>]*type="email"[^>]*>/i,
    (inputTag) => setAttributeInTag(inputTag, 'placeholder', sectionContent.emailPlaceholder),
  );

  sectionHtml = sectionHtml.replace(
    /(<button\b[^>]*>)[\s\S]*?(<\/button>)/i,
    `$1${escapeHtml(sectionContent.subscribeLabel)}$2`,
  );

  let textSmGreyIndex = 0;
  sectionHtml = sectionHtml.replace(
    /(<p class="text-sm text-grey-50">)[\s\S]*?(<\/p>)/g,
    (match, startTag, endTag) => {
      const replacementText =
        textSmGreyIndex === 0
          ? sectionContent.subscriptionText
          : textSmGreyIndex === 1
            ? sectionContent.followUsLabel
            : null;
      textSmGreyIndex += 1;
      if (!replacementText) return match;
      return `${startTag}${escapeHtml(replacementText)}${endTag}`;
    },
  );

  sectionHtml = sectionHtml.replace(
    /(<p class="text-grey-50">)Help &amp; Support(<\/p>)/i,
    `$1${escapeHtml(sectionContent.supportTitle)}$2`,
  );
  sectionHtml = sectionHtml.replace(
    /(<p class="text-grey-50">)About Geviti(<\/p>)/i,
    `$1${escapeHtml(sectionContent.aboutTitle)}$2`,
  );

  const linkListStartMarker = '<ul class="mt-6 flex flex-col gap-2 text-xs text-grey-200">';
  const linkListRanges = findBalancedElementRangesByStartMarker(sectionHtml, linkListStartMarker, 'ul', 2);
  if (linkListRanges.length < 2) {
    console.warn(`[mirror slots] footer-section: expected 2 footer link lists but found ${linkListRanges.length}.`);
  }

  const listReplacements = [];
  const listUpdates = [sectionContent.supportLinks, sectionContent.aboutLinks];
  for (let listIndex = 0; listIndex < linkListRanges.length; listIndex += 1) {
    const listRange = linkListRanges[listIndex];
    const updates = Array.isArray(listUpdates[listIndex]) ? listUpdates[listIndex] : [];
    if (!listRange || updates.length === 0) continue;

    const listHtml = sectionHtml.slice(listRange.start, listRange.end);
    const patchedList = patchAnchorsByIndex(
      listHtml,
      updates.map((entry) => ({ label: entry.label, href: entry.href, newTab: false })),
      `footer-links-${listIndex + 1}`,
    );
    listReplacements.push({
      start: listRange.start,
      end: listRange.end,
      content: patchedList,
    });
  }
  sectionHtml = replaceRangesByOffsets(sectionHtml, listReplacements);

  sectionHtml = sectionHtml.replace(
    /(<p class="text-\[10px\][^"]*">)[\s\S]*?(<\/p>)/g,
    `$1${escapeHtml(sectionContent.legalDisclaimer)}$2`,
  );

  if (FOOTER_SECTION_DEFAULT_CONTENT.cardImageAlt !== sectionContent.cardImageAlt) {
    sectionHtml = sectionHtml.replaceAll(
      `alt="${escapeHtml(FOOTER_SECTION_DEFAULT_CONTENT.cardImageAlt)}"`,
      `alt="${escapeHtml(sectionContent.cardImageAlt)}"`,
    );
  }

  const cardDesktopPairs = buildMediaPathReplacementPairs(
    FOOTER_SECTION_DEFAULT_CONTENT.cardDesktopImagePath,
    sectionContent.cardDesktopImagePath,
  );
  for (const [fromPath, toPath] of cardDesktopPairs) {
    sectionHtml = sectionHtml.replaceAll(fromPath, toPath);
  }

  const cardMobilePairs = buildMediaPathReplacementPairs(
    FOOTER_SECTION_DEFAULT_CONTENT.cardMobileImagePath,
    sectionContent.cardMobileImagePath,
  );
  for (const [fromPath, toPath] of cardMobilePairs) {
    sectionHtml = sectionHtml.replaceAll(fromPath, toPath);
  }

  if (FOOTER_SECTION_DEFAULT_CONTENT.appPrompt !== sectionContent.appPrompt) {
    sectionHtml = sectionHtml.replaceAll(
      FOOTER_SECTION_DEFAULT_CONTENT.appPrompt,
      sectionContent.appPrompt,
    );
  }

  if (FOOTER_SECTION_DEFAULT_CONTENT.appStoreHref !== sectionContent.appStoreHref) {
    sectionHtml = sectionHtml.replaceAll(
      `href="${escapeHtml(FOOTER_SECTION_DEFAULT_CONTENT.appStoreHref)}"`,
      `href="${escapeHtml(sectionContent.appStoreHref)}"`,
    );
  }
  if (FOOTER_SECTION_DEFAULT_CONTENT.googlePlayHref !== sectionContent.googlePlayHref) {
    sectionHtml = sectionHtml.replaceAll(
      `href="${escapeHtml(FOOTER_SECTION_DEFAULT_CONTENT.googlePlayHref)}"`,
      `href="${escapeHtml(sectionContent.googlePlayHref)}"`,
    );
  }

  if (FOOTER_SECTION_DEFAULT_CONTENT.appStoreAlt !== sectionContent.appStoreAlt) {
    sectionHtml = sectionHtml.replaceAll(
      `alt="${escapeHtml(FOOTER_SECTION_DEFAULT_CONTENT.appStoreAlt)}"`,
      `alt="${escapeHtml(sectionContent.appStoreAlt)}"`,
    );
  }
  if (FOOTER_SECTION_DEFAULT_CONTENT.googlePlayAlt !== sectionContent.googlePlayAlt) {
    sectionHtml = sectionHtml.replaceAll(
      `alt="${escapeHtml(FOOTER_SECTION_DEFAULT_CONTENT.googlePlayAlt)}"`,
      `alt="${escapeHtml(sectionContent.googlePlayAlt)}"`,
    );
  }

  const appStoreImagePairs = buildMediaPathReplacementPairs(
    FOOTER_SECTION_DEFAULT_CONTENT.appStoreImagePath,
    sectionContent.appStoreImagePath,
  );
  for (const [fromPath, toPath] of appStoreImagePairs) {
    sectionHtml = sectionHtml.replaceAll(fromPath, toPath);
  }
  const googlePlayImagePairs = buildMediaPathReplacementPairs(
    FOOTER_SECTION_DEFAULT_CONTENT.googlePlayImagePath,
    sectionContent.googlePlayImagePath,
  );
  for (const [fromPath, toPath] of googlePlayImagePairs) {
    sectionHtml = sectionHtml.replaceAll(fromPath, toPath);
  }

  sectionHtml = sectionHtml.replace(
    /(<p class="text-grey-500 text-sm font-medium">)[\s\S]*?(<\/p>)/i,
    `$1${escapeHtml(sectionContent.copyrightText)}$2`,
  );

  return `${markupBeforeScripts.slice(0, sectionRange.start)}${sectionHtml}${markupBeforeScripts.slice(sectionRange.end)}`;
}

function applyHeaderSlotPatchesToMarkup(markupBeforeScripts, siteContent) {
  const headerConfig =
    siteContent && typeof siteContent.header === 'object' && siteContent.header
      ? siteContent.header
      : {};
  const navUpdates = normalizeHeaderNavItems(headerConfig);
  const primaryCta = resolveHeaderPrimaryCta(siteContent, headerConfig);
  const secondaryCta = resolveHeaderSecondaryCta(headerConfig);
  const ctaUpdates = [primaryCta, secondaryCta];

  let nextMarkup = markupBeforeScripts;

  const desktopNavStartMarker = '<ul class=" flex items-center space-x-0 hidden lg:flex">';
  const desktopNavStart = nextMarkup.indexOf(desktopNavStartMarker);
  if (desktopNavStart !== -1) {
    const navInnerStart = desktopNavStart + desktopNavStartMarker.length;
    const navEnd = nextMarkup.indexOf('</ul>', navInnerStart);

    if (navEnd !== -1) {
      const navInner = nextMarkup.slice(navInnerStart, navEnd);
      const patchedNavInner = patchAnchorsByIndex(navInner, navUpdates, 'desktop-nav');
      nextMarkup = `${nextMarkup.slice(0, navInnerStart)}${patchedNavInner}${nextMarkup.slice(navEnd)}`;
    }
  }

  const desktopCtaStartMarker = '<div class="max-lg:hidden flex items-center gap-4">';
  const desktopCtaStart = nextMarkup.indexOf(desktopCtaStartMarker);
  if (desktopCtaStart !== -1) {
    const ctaRange = findBalancedElementRange(nextMarkup, desktopCtaStart, 'div');
    if (ctaRange) {
      const ctaSection = nextMarkup.slice(ctaRange.start, ctaRange.end);
      const patchedCtaSection = patchAnchorsByIndex(ctaSection, ctaUpdates, 'desktop-cta');
      nextMarkup = `${nextMarkup.slice(0, ctaRange.start)}${patchedCtaSection}${nextMarkup.slice(ctaRange.end)}`;
    }
  }

  return nextMarkup;
}

function applyHeroSlotPatchesToMarkup(markupBeforeScripts, siteContent) {
  const heroContent = resolveHeroContent(siteContent);
  const heroStartMarker =
    '<div class="relative safe-h-screen flex items-end justify-center text-white overflow-hidden" data-theme="dark">';
  const heroStartIndex = markupBeforeScripts.indexOf(heroStartMarker);
  if (heroStartIndex === -1) return markupBeforeScripts;

  const heroRange = findBalancedElementRange(markupBeforeScripts, heroStartIndex, 'div');
  if (!heroRange) return markupBeforeScripts;

  let heroSection = markupBeforeScripts.slice(heroRange.start, heroRange.end);

  heroSection = patchBalancedElementByStartMarker(
    heroSection,
    '<span class="whitespace-pre-wrap" aria-label=',
    'span',
    (elementHtml) => patchAnimatedTextElement(elementHtml, heroContent.titleLine1),
  );

  heroSection = patchBalancedElementByStartMarker(
    heroSection,
    '<em class="whitespace-pre-wrap text-skyBlue font-victorSerif font-medium text-[35px]/[46px] lg:text-[80px]/[105px]"',
    'em',
    (elementHtml) => patchAnimatedTextElement(elementHtml, heroContent.titleLine2),
  );

  heroSection = patchBalancedElementByStartMarker(
    heroSection,
    '<p class="whitespace-pre-wrap text-sm max-lg:max-w-[271px] lg:text-xl mt-6 font-light"',
    'p',
    (elementHtml) => patchAnimatedTextElement(elementHtml, heroContent.description),
  );

  heroSection = patchHeroPrimaryCtaAnchor(heroSection, heroContent.primaryCtaLabel);
  return `${markupBeforeScripts.slice(0, heroRange.start)}${heroSection}${markupBeforeScripts.slice(heroRange.end)}`;
}

function applyBiomarkerPanelPatchesToMarkup(markupBeforeScripts, siteContent) {
  const panelContent = resolveBiomarkerPanelContent(siteContent);
  const panelStartMarker = '<div class="mt-[52px] lg:mt-[110px] mb-[52px] lg:mb-[110px]">';
  const panelStartIndex = markupBeforeScripts.indexOf(panelStartMarker);
  if (panelStartIndex === -1) return markupBeforeScripts;

  const panelRange = findBalancedElementRange(markupBeforeScripts, panelStartIndex, 'div');
  if (!panelRange) return markupBeforeScripts;

  let panelSection = markupBeforeScripts.slice(panelRange.start, panelRange.end);

  panelSection = patchBalancedElementByStartMarker(
    panelSection,
    '<h2 class="font-450 text-heading-section">',
    'h2',
    (headingHtml) => {
      let nextHeading = headingHtml;
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<span class="whitespace-pre-wrap" aria-label=',
        'span',
        (elementHtml) => patchAnimatedTextElement(elementHtml, panelContent.titleLine1),
      );
      nextHeading = patchBalancedElementByStartMarker(
        nextHeading,
        '<em class="whitespace-pre-wrap capitalize font-medium font-victorSerif text-heading-section"',
        'em',
        (elementHtml) => patchAnimatedTextElement(elementHtml, panelContent.titleLine2),
      );
      return nextHeading;
    },
  );

  const ctaAnchorPattern = /<a\b[^>]*href="\/pricing"[^>]*>[\s\S]*?<\/a>/gi;
  panelSection = panelSection.replace(ctaAnchorPattern, (anchorHtml) => {
    if (!anchorHtml.includes(BIOMARKER_PANEL_DEFAULT_CONTENT.primaryCtaLabel)) {
      return anchorHtml;
    }
    return patchAnchorNode(anchorHtml, {
      label: panelContent.primaryCtaLabel,
      href: '/pricing',
      newTab: false,
    });
  });

  for (let index = 0; index < BIOMARKER_PANEL_DEFAULT_CONTENT.items.length; index += 1) {
    const defaultItem = BIOMARKER_PANEL_DEFAULT_CONTENT.items[index];
    const nextItem = panelContent.items[index];
    if (!nextItem) continue;

    if (defaultItem.label !== nextItem.label) {
      panelSection = panelSection.replaceAll(defaultItem.label, nextItem.label);
    }

    const mediaPathPairs = buildMediaPathReplacementPairs(defaultItem.imagePath, nextItem.imagePath);
    for (const [fromPath, toPath] of mediaPathPairs) {
      panelSection = panelSection.replaceAll(fromPath, toPath);
    }
  }

  return `${markupBeforeScripts.slice(0, panelRange.start)}${panelSection}${markupBeforeScripts.slice(panelRange.end)}`;
}

function applyHeaderSlotPatchesToFlightPayload(scriptsAndTail, siteContent) {
  if (!scriptsAndTail) return scriptsAndTail;

  const headerConfig =
    siteContent && typeof siteContent.header === 'object' && siteContent.header
      ? siteContent.header
      : {};
  const navUpdates = normalizeHeaderNavItems(headerConfig);
  if (navUpdates.length === 0) return scriptsAndTail;

  const primaryCta = resolveHeaderPrimaryCta(siteContent, headerConfig);
  const secondaryCta = resolveHeaderSecondaryCta(headerConfig);
  const ctaUpdates = [primaryCta, secondaryCta];

  const headerTypeMarker = '\\"globalType\\":\\"header\\"';
  const headerTypeIndex = scriptsAndTail.indexOf(headerTypeMarker);
  if (headerTypeIndex === -1) return scriptsAndTail;

  const headerDataToken = '\\"data\\":{';
  const headerDataTokenIndex = scriptsAndTail.lastIndexOf(headerDataToken, headerTypeIndex);
  if (headerDataTokenIndex === -1) return scriptsAndTail;

  const headerDataObjectStart = headerDataTokenIndex + headerDataToken.length - 1;
  const headerDataRange = findBalancedSymbolRange(scriptsAndTail, headerDataObjectStart, '{', '}');
  if (!headerDataRange) return scriptsAndTail;

  const encodedHeaderData = scriptsAndTail.slice(headerDataRange.start, headerDataRange.end);

  let headerDataObject;
  try {
    const decodedHeaderData = JSON.parse(`"${encodedHeaderData}"`);
    headerDataObject = JSON.parse(decodedHeaderData);
  } catch {
    return scriptsAndTail;
  }

  if (Array.isArray(headerDataObject.navItems)) {
    for (let index = 0; index < navUpdates.length; index += 1) {
      const navItem = headerDataObject.navItems[index];
      const update = navUpdates[index];
      if (!navItem || typeof navItem !== 'object' || !update) continue;
      navItem.label = update.label;
      navItem.link = update.href;
    }
  }

  if (Array.isArray(headerDataObject.links)) {
    for (let index = 0; index < ctaUpdates.length; index += 1) {
      const entry = headerDataObject.links[index];
      const update = ctaUpdates[index];
      if (!entry || typeof entry !== 'object' || !entry.link || typeof entry.link !== 'object' || !update) continue;
      entry.link.url = update.href;
      entry.link.label = update.label;
      entry.link.newTab = Boolean(update.newTab);
    }
  }

  const patchedHeaderData = JSON.stringify(headerDataObject);
  const patchedHeaderDataEncoded = JSON.stringify(patchedHeaderData).slice(1, -1);
  return `${scriptsAndTail.slice(0, headerDataRange.start)}${patchedHeaderDataEncoded}${scriptsAndTail.slice(headerDataRange.end)}`;
}

function replaceEscapedScriptStringValue(source, fromValue, toValue) {
  if (fromValue === toValue) return source;
  const encodedFrom = JSON.stringify(String(fromValue)).slice(1, -1);
  const encodedTo = JSON.stringify(String(toValue)).slice(1, -1);
  return source.replaceAll(encodedFrom, encodedTo);
}

function replaceEscapedScriptFieldValue(source, fieldName, fromValue, toValue) {
  if (fromValue === toValue) return source;
  const encodedFrom = JSON.stringify(String(fromValue)).slice(1, -1);
  const encodedTo = JSON.stringify(String(toValue)).slice(1, -1);
  const fromToken = `\\\"${fieldName}\\\":\\\"${encodedFrom}\\\"`;
  const toToken = `\\\"${fieldName}\\\":\\\"${encodedTo}\\\"`;
  return source.replaceAll(fromToken, toToken);
}

function patchFlightPayloadWindow(source, startMarker, endMarker, patchFn, windowName) {
  const startIndex = source.indexOf(startMarker);
  if (startIndex === -1) {
    console.warn(`[mirror slots] ${windowName}: start marker not found.`);
    return source;
  }

  const endIndex =
    typeof endMarker === 'string' && endMarker
      ? source.indexOf(endMarker, startIndex + startMarker.length)
      : -1;
  const windowEnd = endIndex === -1 ? source.length : endIndex;

  const windowSource = source.slice(startIndex, windowEnd);
  const patchedWindow = patchFn(windowSource);
  return `${source.slice(0, startIndex)}${patchedWindow}${source.slice(windowEnd)}`;
}

function findFirstObjectByPredicate(node, predicate) {
  if (!node || typeof node !== 'object') return null;

  if (predicate(node)) return node;

  if (Array.isArray(node)) {
    for (const item of node) {
      const match = findFirstObjectByPredicate(item, predicate);
      if (match) return match;
    }
    return null;
  }

  for (const value of Object.values(node)) {
    const match = findFirstObjectByPredicate(value, predicate);
    if (match) return match;
  }

  return null;
}

function findAllObjectsByPredicate(node, predicate, matches = []) {
  if (!node || typeof node !== 'object') return matches;

  if (predicate(node)) {
    matches.push(node);
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      findAllObjectsByPredicate(item, predicate, matches);
    }
    return matches;
  }

  for (const value of Object.values(node)) {
    findAllObjectsByPredicate(value, predicate, matches);
  }

  return matches;
}

function buildEncodedNeedleVariants(encodedNeedle) {
  const baseNeedle = typeof encodedNeedle === 'string' ? encodedNeedle : '';
  if (!baseNeedle) return [];

  const variants = new Set([baseNeedle]);
  const escapedLiteralPairs = [
    ['>', '\\u003e'],
    ['<', '\\u003c'],
    ['&', '\\u0026'],
  ];

  for (const [literal, escaped] of escapedLiteralPairs) {
    const snapshot = Array.from(variants);
    for (const variant of snapshot) {
      if (variant.includes(literal)) {
        variants.add(variant.replaceAll(literal, escaped));
      }
      if (variant.includes(escaped)) {
        variants.add(variant.replaceAll(escaped, literal));
      }
    }
  }

  return Array.from(variants);
}

function patchFlightPushChunkByNeedle(source, encodedNeedle, patchFn, windowName) {
  const needleCandidates = buildEncodedNeedleVariants(encodedNeedle);
  let needleIndex = -1;

  for (const candidate of needleCandidates) {
    needleIndex = source.indexOf(candidate);
    if (needleIndex !== -1) break;
  }

  if (needleIndex === -1) {
    console.warn(`[mirror slots] ${windowName}: needle not found.`);
    return source;
  }

  const chunkStartToken = 'self.__next_f.push([1,"';
  const chunkStartIndex = source.lastIndexOf(chunkStartToken, needleIndex);
  if (chunkStartIndex === -1) {
    console.warn(`[mirror slots] ${windowName}: chunk start token not found.`);
    return source;
  }

  const encodedChunkStart = chunkStartIndex + chunkStartToken.length;
  const chunkEndToken = '"])</script>';
  const chunkEndIndex = source.indexOf(chunkEndToken, needleIndex);
  if (chunkEndIndex === -1) {
    console.warn(`[mirror slots] ${windowName}: chunk end token not found.`);
    return source;
  }

  const encodedChunk = source.slice(encodedChunkStart, chunkEndIndex);
  let decodedChunk;
  try {
    decodedChunk = JSON.parse(`"${encodedChunk}"`);
  } catch {
    console.warn(`[mirror slots] ${windowName}: failed to decode chunk payload.`);
    return source;
  }

  const patchedChunk = patchFn(decodedChunk);
  if (typeof patchedChunk !== 'string') {
    return source;
  }

  const encodedPatchedChunk = JSON.stringify(patchedChunk).slice(1, -1);
  return `${source.slice(0, encodedChunkStart)}${encodedPatchedChunk}${source.slice(chunkEndIndex)}`;
}

function applyHeroSlotPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const heroContent = resolveHeroContent(siteContent);
  let nextScripts = scriptsAndTail;

  nextScripts = replaceEscapedScriptStringValue(
    nextScripts,
    HERO_DEFAULT_CONTENT.titleLine1,
    heroContent.titleLine1,
  );
  nextScripts = replaceEscapedScriptStringValue(
    nextScripts,
    HERO_DEFAULT_CONTENT.titleLine2,
    heroContent.titleLine2,
  );
  nextScripts = replaceEscapedScriptStringValue(
    nextScripts,
    HERO_DEFAULT_CONTENT.description,
    heroContent.description,
  );
  nextScripts = replaceEscapedScriptStringValue(
    nextScripts,
    HERO_DEFAULT_CONTENT.primaryCtaLabel,
    heroContent.primaryCtaLabel,
  );

  return nextScripts;
}

function applyBiomarkerPanelPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const panelContent = resolveBiomarkerPanelContent(siteContent);
  let nextScripts = scriptsAndTail;

  nextScripts = replaceEscapedScriptStringValue(
    nextScripts,
    BIOMARKER_PANEL_DEFAULT_CONTENT.titleLine1,
    panelContent.titleLine1,
  );
  nextScripts = replaceEscapedScriptStringValue(
    nextScripts,
    BIOMARKER_PANEL_DEFAULT_CONTENT.titleLine2,
    panelContent.titleLine2,
  );
  nextScripts = replaceEscapedScriptStringValue(
    nextScripts,
    BIOMARKER_PANEL_DEFAULT_CONTENT.primaryCtaLabel,
    panelContent.primaryCtaLabel,
  );

  for (let index = 0; index < BIOMARKER_PANEL_DEFAULT_CONTENT.items.length; index += 1) {
    const defaultItem = BIOMARKER_PANEL_DEFAULT_CONTENT.items[index];
    const nextItem = panelContent.items[index];
    if (!nextItem) continue;

    nextScripts = replaceEscapedScriptStringValue(nextScripts, defaultItem.label, nextItem.label);

    const mediaPathPairs = buildMediaPathReplacementPairs(defaultItem.imagePath, nextItem.imagePath);
    for (const [fromPath, toPath] of mediaPathPairs) {
      nextScripts = replaceEscapedScriptStringValue(nextScripts, fromPath, toPath);
    }
  }

  return nextScripts;
}

function applyFeaturePanelPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const panelContent = resolveFeaturePanelContent(siteContent);
  let nextScripts = scriptsAndTail;

  const primaryStartMarker =
    '\\"src\\":\\"/api/media/file/Testing%20for%20home%20page.webp\\"';
  const primaryEndMarker =
    '\\"src\\":\\"/api/media/file/Longevity%20Rx%20for%20home%20page.webp\\"';

  nextScripts = patchFlightPayloadWindow(
    nextScripts,
    primaryStartMarker,
    primaryEndMarker,
    (windowSource) => {
      let nextWindow = windowSource;

      for (let index = 0; index < FEATURE_PANEL_DEFAULT_CONTENT.cards.length; index += 1) {
        const defaultCard = FEATURE_PANEL_DEFAULT_CONTENT.cards[index];
        const nextCard = panelContent.cards[index];
        if (!defaultCard || !nextCard) continue;

        nextWindow = replaceEscapedScriptFieldValue(nextWindow, 'alt', defaultCard.alt, nextCard.alt);
        nextWindow = replaceEscapedScriptFieldValue(
          nextWindow,
          'children',
          defaultCard.titleLine1,
          nextCard.titleLine1,
        );
        nextWindow = replaceEscapedScriptFieldValue(
          nextWindow,
          'children',
          defaultCard.titleLine2,
          nextCard.titleLine2,
        );
        nextWindow = replaceEscapedScriptFieldValue(nextWindow, 'href', defaultCard.href, nextCard.href);

        const mediaPathPairs = buildMediaPathReplacementPairs(defaultCard.imagePath, nextCard.imagePath);
        for (const [fromPath, toPath] of mediaPathPairs) {
          nextWindow = replaceEscapedScriptFieldValue(nextWindow, 'src', fromPath, toPath);
        }
      }

      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.cardCtaLabel,
        panelContent.cardCtaLabel,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.headingLine1,
        panelContent.headingLine1,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.headingLine2,
        panelContent.headingLine2,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.description,
        panelContent.description,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.stat1.value,
        panelContent.stat1.value,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.stat1.line1,
        panelContent.stat1.line1,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.stat1.line2,
        panelContent.stat1.line2,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.stat2.value,
        panelContent.stat2.value,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        `${FEATURE_PANEL_DEFAULT_CONTENT.stat2.value} `,
        `${panelContent.stat2.value} `,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.stat2.line1,
        panelContent.stat2.line1,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.stat2.line2,
        panelContent.stat2.line2,
      );

      return nextWindow;
    },
    'feature-panel-primary-flight',
  );

  const prescriptionStartMarker =
    '\\"src\\":\\"/api/media/file/Longevity%20Rx%20for%20home%20page.webp\\"';
  const prescriptionEndMarker =
    '\\"src\\":\\"/api/media/file/Care%20team%20for%20home%20page.webp\\"';
  nextScripts = patchFlightPayloadWindow(
    nextScripts,
    prescriptionStartMarker,
    prescriptionEndMarker,
    (windowSource) => {
      let nextWindow = windowSource;
      const defaultCard = FEATURE_PANEL_DEFAULT_CONTENT.prescriptionCard;
      const nextCard = panelContent.prescriptionCard;

      nextWindow = replaceEscapedScriptFieldValue(nextWindow, 'alt', defaultCard.alt, nextCard.alt);
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        defaultCard.titleLine1,
        nextCard.titleLine1,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        defaultCard.titleLine2,
        nextCard.titleLine2,
      );
      nextWindow = replaceEscapedScriptFieldValue(nextWindow, 'href', defaultCard.href, nextCard.href);
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        defaultCard.ctaLabel,
        nextCard.ctaLabel,
      );

      const mediaPathPairs = buildMediaPathReplacementPairs(defaultCard.imagePath, nextCard.imagePath);
      for (const [fromPath, toPath] of mediaPathPairs) {
        nextWindow = replaceEscapedScriptFieldValue(nextWindow, 'src', fromPath, toPath);
      }

      return nextWindow;
    },
    'feature-panel-prescription-flight',
  );

  const careTextStartMarker = '\\"children\\":\\"Bye bye sick care,\\"';
  const careTextEndMarker = '\\"children\\":\\"Thousands trust geviti\\"';
  nextScripts = patchFlightPayloadWindow(
    nextScripts,
    careTextStartMarker,
    careTextEndMarker,
    (windowSource) => {
      let nextWindow = windowSource;
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.careHeadingLine1,
        panelContent.careHeadingLine1,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.careHeadingLine2,
        panelContent.careHeadingLine2,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        FEATURE_PANEL_DEFAULT_CONTENT.careDescription,
        panelContent.careDescription,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'alt',
        FEATURE_PANEL_DEFAULT_CONTENT.testimonialAlt,
        panelContent.testimonialAlt,
      );
      return nextWindow;
    },
    'feature-panel-care-text-flight',
  );

  nextScripts = replaceEscapedScriptFieldValue(
    nextScripts,
    'children',
    FEATURE_PANEL_DEFAULT_CONTENT.badgeTitle,
    panelContent.badgeTitle,
  );
  nextScripts = replaceEscapedScriptFieldValue(
    nextScripts,
    'children',
    FEATURE_PANEL_DEFAULT_CONTENT.badgeStatus,
    panelContent.badgeStatus,
  );

  return nextScripts;
}

function applyTrustSectionPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const sectionContent = resolveTrustSectionContent(siteContent);
  const replacementPairs = [
    [TRUST_SECTION_DEFAULT_CONTENT.headingLine1, sectionContent.headingLine1],
    [TRUST_SECTION_DEFAULT_CONTENT.headingLine2, sectionContent.headingLine2],
    ...buildTrustSectionReplacementPairs(sectionContent),
  ];

  // Replace longer source strings first to reduce accidental partial overlaps.
  const sortedPairs = replacementPairs.sort((left, right) => String(right[0]).length - String(left[0]).length);

  let nextScripts = scriptsAndTail;
  for (const [fromValue, toValue] of sortedPairs) {
    nextScripts = replaceEscapedScriptStringValue(nextScripts, fromValue, toValue);
    nextScripts = replaceEscapedScriptStringValue(nextScripts, `${fromValue}\n`, `${toValue}\n`);
  }

  return nextScripts;
}

function applyCommandCenterSectionPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const sectionContent = resolveCommandCenterSectionContent(siteContent);
  const sectionStartMarker = '\\"children\\":\\"Your Health Command Center,\\"';
  const sectionEndMarker = '4b:[\\"$\\",\\"div\\",\\"5\\"';

  return patchFlightPayloadWindow(
    scriptsAndTail,
    sectionStartMarker,
    sectionEndMarker,
    (windowSource) => {
      let nextWindow = windowSource;

      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        COMMAND_CENTER_SECTION_DEFAULT_CONTENT.headingLine1,
        sectionContent.headingLine1,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        COMMAND_CENTER_SECTION_DEFAULT_CONTENT.headingLine2,
        sectionContent.headingLine2,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        COMMAND_CENTER_SECTION_DEFAULT_CONTENT.loadingAnimationLabel,
        sectionContent.loadingAnimationLabel,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        COMMAND_CENTER_SECTION_DEFAULT_CONTENT.description,
        sectionContent.description,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'children',
        COMMAND_CENTER_SECTION_DEFAULT_CONTENT.ctaLabel,
        sectionContent.ctaLabel,
      );

      const imageClassToken = '\\"className\\":\\"w-full lg:w-[301px] h-[673px] object-contain\\"';
      const encodedNextAlt = JSON.stringify(String(sectionContent.appImageAlt)).slice(1, -1);
      const encodedDefaultAlt = JSON.stringify(
        String(COMMAND_CENTER_SECTION_DEFAULT_CONTENT.appImageAlt),
      ).slice(1, -1);
      const defaultAltToken = `\\"alt\\":\\"${encodedDefaultAlt}\\",${imageClassToken}`;
      const emptyAltToken = `\\"alt\\":\\"\\",${imageClassToken}`;
      const nextAltToken = `\\"alt\\":\\"${encodedNextAlt}\\",${imageClassToken}`;

      nextWindow = nextWindow.replaceAll(defaultAltToken, nextAltToken);
      nextWindow = nextWindow.replaceAll(emptyAltToken, nextAltToken);
      return nextWindow;
    },
    'command-center-section-flight',
  );
}

function applyOurProcessSectionPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const sectionContent = resolveOurProcessSectionContent(siteContent);
  const sectionStartMarker = '\\"heading\\":\\"How Does\\"';
  const sectionEndMarker = '\\"heading\\":\\"Choose Your Path\\"';

  return patchFlightPayloadWindow(
    scriptsAndTail,
    sectionStartMarker,
    sectionEndMarker,
    (windowSource) => {
      let nextWindow = windowSource;

      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'heading',
        OUR_PROCESS_SECTION_DEFAULT_CONTENT.headingLine1,
        sectionContent.headingLine1,
      );
      nextWindow = replaceEscapedScriptFieldValue(
        nextWindow,
        'headingItalic',
        OUR_PROCESS_SECTION_DEFAULT_CONTENT.headingLine2,
        sectionContent.headingLine2,
      );

      for (let index = 0; index < OUR_PROCESS_SECTION_DEFAULT_CONTENT.steps.length; index += 1) {
        const defaultStep = OUR_PROCESS_SECTION_DEFAULT_CONTENT.steps[index];
        const nextStep = sectionContent.steps[index];
        if (!defaultStep || !nextStep) continue;
        nextWindow = replaceEscapedScriptFieldValue(
          nextWindow,
          'title',
          defaultStep.title,
          nextStep.title,
        );
        nextWindow = replaceEscapedScriptFieldValue(
          nextWindow,
          'description',
          defaultStep.description,
          nextStep.description,
        );
      }

      const encodedNextAlt = JSON.stringify(String(sectionContent.imageAlt)).slice(1, -1);
      const encodedDefaultAlt = JSON.stringify(String(OUR_PROCESS_SECTION_DEFAULT_CONTENT.imageAlt)).slice(1, -1);
      const nextAltToken = `\\"alt\\":\\"${encodedNextAlt}\\",\\"caption\\":null`;
      const nullAltToken = '\\"alt\\":null,\\"caption\\":null';
      const defaultAltToken = `\\"alt\\":\\"${encodedDefaultAlt}\\",\\"caption\\":null`;

      nextWindow = nextWindow.replaceAll(nullAltToken, nextAltToken);
      nextWindow = nextWindow.replaceAll(defaultAltToken, nextAltToken);
      return nextWindow;
    },
    'our-process-section-flight',
  );
}

function patchChoosePathPlanGroupsInFlight(targetGroups, sourceGroups) {
  if (!Array.isArray(targetGroups) || !Array.isArray(sourceGroups)) return;

  for (let groupIndex = 0; groupIndex < sourceGroups.length; groupIndex += 1) {
    const sourceGroup = sourceGroups[groupIndex];
    const targetGroup = targetGroups[groupIndex];
    if (!sourceGroup || typeof sourceGroup !== 'object') continue;
    if (!targetGroup || typeof targetGroup !== 'object') continue;

    targetGroup.categoryName = sourceGroup.categoryName;

    if (!Array.isArray(targetGroup.features) || !Array.isArray(sourceGroup.features)) continue;
    for (let featureIndex = 0; featureIndex < sourceGroup.features.length; featureIndex += 1) {
      const sourceFeature = sourceGroup.features[featureIndex];
      const targetFeature = targetGroup.features[featureIndex];
      if (!sourceFeature || typeof sourceFeature !== 'object') continue;
      if (!targetFeature || typeof targetFeature !== 'object') continue;
      targetFeature.name = sourceFeature.name;
    }
  }
}

function patchChoosePathFlightChunk(chunkSource, sectionContent) {
  const lines = chunkSource.split('\n');
  let didPatch = false;

  const patchedLines = lines.map((line) => {
    if (!line.includes('"blockType":"newPricingBlock"')) return line;

    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex === -1) return line;
    const linePrefix = line.slice(0, delimiterIndex);
    const payloadSource = line.slice(delimiterIndex + 1);

    let payload;
    try {
      payload = JSON.parse(payloadSource);
    } catch {
      console.warn('[mirror slots] choose-path-section-flight: failed to parse payload line.');
      return line;
    }

    const pricingBlock = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.blockType === 'newPricingBlock' &&
        candidate.pricing &&
        typeof candidate.pricing === 'object' &&
        Array.isArray(candidate.pricing.plans),
    );
    if (!pricingBlock) {
      console.warn('[mirror slots] choose-path-section-flight: pricing block not found in payload.');
      return line;
    }

    pricingBlock.title = sectionContent.title;
    pricingBlock.subtitle = sectionContent.subtitle;

    const targetPlans = Array.isArray(pricingBlock.pricing.plans) ? pricingBlock.pricing.plans : [];
    if (targetPlans.length < sectionContent.plans.length) {
      console.warn(
        `[mirror slots] choose-path-section-flight: expected ${sectionContent.plans.length} plans but found ${targetPlans.length}.`,
      );
    }

    for (let planIndex = 0; planIndex < sectionContent.plans.length; planIndex += 1) {
      const sourcePlan = sectionContent.plans[planIndex];
      const targetPlan = targetPlans[planIndex];
      if (!sourcePlan || !targetPlan || typeof targetPlan !== 'object') continue;

      targetPlan.name = sourcePlan.name;
      targetPlan.nameStyle = sourcePlan.nameStyle;
      targetPlan.tagline = sourcePlan.tagline;
      targetPlan.isPopular = sourcePlan.isPopular;

      if (!targetPlan.pricing || typeof targetPlan.pricing !== 'object') {
        targetPlan.pricing = {};
      }
      targetPlan.pricing.oneTimePrice = toPricingFlightMoneyValue(sourcePlan.pricing.oneTimePrice);
      targetPlan.pricing.recurringPrice = toPricingFlightMoneyValue(sourcePlan.pricing.recurringPrice);
      targetPlan.pricing.oneTimeLabel = sourcePlan.pricing.oneTimeLabel;
      targetPlan.pricing.recurringLabel = sourcePlan.pricing.recurringLabel;
      targetPlan.pricing.discountPercentage = sourcePlan.pricing.discountPercentage;
      targetPlan.pricing.twiceAnnuallyBillingText = sourcePlan.pricing.twiceAnnuallyBillingText;
      targetPlan.pricing.annuallyBillingText = sourcePlan.pricing.annuallyBillingText;

      if (!targetPlan.link || typeof targetPlan.link !== 'object') {
        targetPlan.link = {};
      }
      targetPlan.link.label = sourcePlan.link.label;

      patchChoosePathPlanGroupsInFlight(targetPlan.feature, sourcePlan.feature);
      patchChoosePathPlanGroupsInFlight(targetPlan.restriction, sourcePlan.restriction);
    }

    didPatch = true;
    return `${linePrefix}:${JSON.stringify(payload)}`;
  });

  if (!didPatch) {
    console.warn('[mirror slots] choose-path-section-flight: no matching chunk lines were patched.');
  }
  return patchedLines.join('\n');
}

function applyChoosePathSectionPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const sectionContent = resolveChoosePathSectionContent(siteContent);
  const pricingBlockNeedle = '\\"blockType\\":\\"newPricingBlock\\"';

  return patchFlightPushChunkByNeedle(
    scriptsAndTail,
    pricingBlockNeedle,
    (chunkSource) => patchChoosePathFlightChunk(chunkSource, sectionContent),
    'choose-path-section-flight',
  );
}

function patchFaqSectionFlightChunk(chunkSource, sectionContent) {
  const lines = chunkSource.split('\n');
  let didPatch = false;

  const patchedLines = lines.map((line) => {
    if (!line.includes('"blockType":"faq"')) return line;

    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex === -1) return line;
    const linePrefix = line.slice(0, delimiterIndex);
    const payloadSource = line.slice(delimiterIndex + 1);

    let payload;
    try {
      payload = JSON.parse(payloadSource);
    } catch {
      console.warn('[mirror slots] faq-section-flight: failed to parse payload line.');
      return line;
    }

    const faqBlock = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.blockType === 'faq' &&
        Array.isArray(candidate.faqs),
    );
    if (!faqBlock) {
      console.warn('[mirror slots] faq-section-flight: faq block not found in payload.');
      return line;
    }

    faqBlock.title = sectionContent.headingLine1;
    faqBlock.subtitle = sectionContent.headingLine2;

    if (faqBlock.faqs.length < sectionContent.items.length) {
      console.warn(
        `[mirror slots] faq-section-flight: expected ${sectionContent.items.length} faq items but found ${faqBlock.faqs.length}.`,
      );
    }

    for (let index = 0; index < sectionContent.items.length; index += 1) {
      const sourceItem = sectionContent.items[index];
      const targetItem = faqBlock.faqs[index];
      if (!sourceItem || !targetItem || typeof targetItem !== 'object') continue;
      targetItem.question = sourceItem.question;
      targetItem.answer = sourceItem.answer;
    }

    didPatch = true;
    return `${linePrefix}:${JSON.stringify(payload)}`;
  });

  if (!didPatch) {
    console.warn('[mirror slots] faq-section-flight: no matching chunk lines were patched.');
  }
  return patchedLines.join('\n');
}

function applyFaqSectionPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const sectionContent = resolveFaqSectionContent(siteContent);
  const faqBlockNeedle = '\\"blockType\\":\\"faq\\"';

  return patchFlightPushChunkByNeedle(
    scriptsAndTail,
    faqBlockNeedle,
    (chunkSource) => patchFaqSectionFlightChunk(chunkSource, sectionContent),
    'faq-section-flight',
  );
}

function patchMissionSectionFlightChunk(chunkSource, sectionContent) {
  const lines = chunkSource.split('\n');
  let didPatch = false;

  const patchedLines = lines.map((line) => {
    if (!line.includes('blocks/RenderBlocks.tsx -> @/blocks/Team/Component')) return line;

    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex === -1) return line;
    const linePrefix = line.slice(0, delimiterIndex);
    const payloadSource = line.slice(delimiterIndex + 1);

    let payload;
    try {
      payload = JSON.parse(payloadSource);
    } catch {
      console.warn('[mirror slots] mission-section-flight: failed to parse payload line.');
      return line;
    }

    const missionContent = sectionContent.mission;

    const imageNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.src === MISSION_SECTION_DEFAULT_CONTENT.mission.imagePath,
    );
    if (imageNode) {
      imageNode.src = missionContent.imagePath;
      imageNode.alt = missionContent.imageAlt;
    }

    const nameNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === MISSION_SECTION_DEFAULT_CONTENT.mission.name,
    );
    if (nameNode) {
      nameNode.children = missionContent.name;
    }

    const roleNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === MISSION_SECTION_DEFAULT_CONTENT.mission.role,
    );
    if (roleNode) {
      roleNode.children = missionContent.role;
    }

    const headingLine1Node = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === MISSION_SECTION_DEFAULT_CONTENT.mission.headingLine1,
    );
    if (headingLine1Node) {
      headingLine1Node.children = missionContent.headingLine1;
    }

    const headingLine2Node = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === MISSION_SECTION_DEFAULT_CONTENT.mission.headingLine2,
    );
    if (headingLine2Node) {
      headingLine2Node.children = missionContent.headingLine2;
    }

    const descriptionNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === MISSION_SECTION_DEFAULT_CONTENT.mission.description,
    );
    if (descriptionNode) {
      descriptionNode.children = missionContent.description;
    }

    const ctaAnchorNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.href === MISSION_SECTION_DEFAULT_CONTENT.mission.ctaHref &&
        typeof candidate.className === 'string' &&
        candidate.className.includes('shadow-buttonred'),
    );
    if (ctaAnchorNode) {
      ctaAnchorNode.href = missionContent.ctaHref;
    }

    const ctaLabelNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === MISSION_SECTION_DEFAULT_CONTENT.mission.ctaLabel &&
        candidate.className === 'inline align-middle',
    );
    if (ctaLabelNode) {
      ctaLabelNode.children = missionContent.ctaLabel;
    }

    didPatch = true;
    return `${linePrefix}:${JSON.stringify(payload)}`;
  });

  if (!didPatch) {
    console.warn('[mirror slots] mission-section-flight: no matching chunk lines were patched.');
  }

  return patchedLines.join('\n');
}

function applyMissionSectionPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const sectionContent = resolveMissionSectionContent(siteContent);
  const missionSectionNeedle =
    '\\"moduleIds\\":[\\"blocks/RenderBlocks.tsx -> @/blocks/Team/Component\\"]';

  return patchFlightPushChunkByNeedle(
    scriptsAndTail,
    missionSectionNeedle,
    (chunkSource) => patchMissionSectionFlightChunk(chunkSource, sectionContent),
    'mission-section-flight',
  );
}

function patchMissionGallerySectionFlightChunk(chunkSource, sectionContent) {
  const lines = chunkSource.split('\n');
  let didPatch = false;

  const patchedLines = lines.map((line) => {
    if (!line.includes('blocks/RenderBlocks.tsx -> @/blocks/ImageGallery/Component')) return line;

    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex === -1) return line;
    const linePrefix = line.slice(0, delimiterIndex);
    const payloadSource = line.slice(delimiterIndex + 1);

    let payload;
    try {
      payload = JSON.parse(payloadSource);
    } catch {
      console.warn('[mirror slots] mission-gallery-section-flight: failed to parse payload line.');
      return line;
    }

    const galleryContent = sectionContent.gallery;

    const headingLine1Node = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === MISSION_SECTION_DEFAULT_CONTENT.gallery.headingLine1,
    );
    if (headingLine1Node) {
      headingLine1Node.children = galleryContent.headingLine1;
    }

    const headingLine2Node = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === MISSION_SECTION_DEFAULT_CONTENT.gallery.headingLine2,
    );
    if (headingLine2Node) {
      headingLine2Node.children = galleryContent.headingLine2;
    }

    const ctaAnchorNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.href === MISSION_SECTION_DEFAULT_CONTENT.gallery.ctaHref &&
        typeof candidate.className === 'string' &&
        candidate.className.includes('!bg-transparent'),
    );
    if (ctaAnchorNode) {
      ctaAnchorNode.href = galleryContent.ctaHref;
    }

    const ctaLabelNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === MISSION_SECTION_DEFAULT_CONTENT.gallery.ctaLabel &&
        candidate.className === 'inline align-middle',
    );
    if (ctaLabelNode) {
      ctaLabelNode.children = galleryContent.ctaLabel;
    }

    for (let index = 0; index < MISSION_SECTION_DEFAULT_CONTENT.gallery.images.length; index += 1) {
      const defaultImage = MISSION_SECTION_DEFAULT_CONTENT.gallery.images[index];
      const nextImage = galleryContent.images[index];
      if (!defaultImage || !nextImage) continue;

      const imageNode = findFirstObjectByPredicate(
        payload,
        (candidate) =>
          candidate &&
          typeof candidate === 'object' &&
          candidate.src === defaultImage.imagePath &&
          candidate.alt === defaultImage.alt,
      );
      if (!imageNode) continue;
      imageNode.src = nextImage.imagePath;
      imageNode.alt = nextImage.alt;
    }

    didPatch = true;
    return `${linePrefix}:${JSON.stringify(payload)}`;
  });

  if (!didPatch) {
    console.warn(
      '[mirror slots] mission-gallery-section-flight: no matching chunk lines were patched.',
    );
  }

  return patchedLines.join('\n');
}

function applyMissionGallerySectionPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const sectionContent = resolveMissionSectionContent(siteContent);
  const missionGallerySectionNeedle =
    '\\"moduleIds\\":[\\"blocks/RenderBlocks.tsx -> @/blocks/ImageGallery/Component\\"]';

  return patchFlightPushChunkByNeedle(
    scriptsAndTail,
    missionGallerySectionNeedle,
    (chunkSource) => patchMissionGallerySectionFlightChunk(chunkSource, sectionContent),
    'mission-gallery-section-flight',
  );
}

function patchNewsletterSectionFlightChunk(chunkSource, sectionContent) {
  const lines = chunkSource.split('\n');
  let didPatch = false;

  const patchedLines = lines.map((line) => {
    if (!line.includes('blocks/RenderBlocks.tsx -> @/blocks/Newsletter/Component')) return line;

    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex === -1) return line;
    const linePrefix = line.slice(0, delimiterIndex);
    const payloadSource = line.slice(delimiterIndex + 1);

    let payload;
    try {
      payload = JSON.parse(payloadSource);
    } catch {
      console.warn('[mirror slots] newsletter-section-flight: failed to parse payload line.');
      return line;
    }

    const imageNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.src === NEWSLETTER_SECTION_DEFAULT_CONTENT.backgroundImagePath,
    );
    if (imageNode) {
      imageNode.src = sectionContent.backgroundImagePath;
      imageNode.alt = sectionContent.backgroundImageAlt;
    }

    const headingLine1Node = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === NEWSLETTER_SECTION_DEFAULT_CONTENT.headingLine1,
    );
    if (headingLine1Node) {
      headingLine1Node.children = sectionContent.headingLine1;
    }

    const headingLine2Node = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === NEWSLETTER_SECTION_DEFAULT_CONTENT.headingLine2,
    );
    if (headingLine2Node) {
      headingLine2Node.children = sectionContent.headingLine2;
    }

    const descriptionNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === NEWSLETTER_SECTION_DEFAULT_CONTENT.description,
    );
    if (descriptionNode) {
      descriptionNode.children = sectionContent.description;
    }

    const ctaAnchorNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.href === NEWSLETTER_SECTION_DEFAULT_CONTENT.ctaHref &&
        typeof candidate.className === 'string' &&
        candidate.className.includes('!bg-transparent'),
    );
    if (ctaAnchorNode) {
      ctaAnchorNode.href = sectionContent.ctaHref;
    }

    const ctaLabelNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === NEWSLETTER_SECTION_DEFAULT_CONTENT.ctaLabel &&
        candidate.className === 'inline align-middle',
    );
    if (ctaLabelNode) {
      ctaLabelNode.children = sectionContent.ctaLabel;
    }

    didPatch = true;
    return `${linePrefix}:${JSON.stringify(payload)}`;
  });

  if (!didPatch) {
    console.warn('[mirror slots] newsletter-section-flight: no matching chunk lines were patched.');
  }

  return patchedLines.join('\n');
}

function applyNewsletterSectionPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const sectionContent = resolveNewsletterSectionContent(siteContent);
  const newsletterSectionNeedle =
    '\\"moduleIds\\":[\\"blocks/RenderBlocks.tsx -> @/blocks/Newsletter/Component\\"]';

  return patchFlightPushChunkByNeedle(
    scriptsAndTail,
    newsletterSectionNeedle,
    (chunkSource) => patchNewsletterSectionFlightChunk(chunkSource, sectionContent),
    'newsletter-section-flight',
  );
}

function toCopyrightChildren(copyrightText) {
  const normalized = String(copyrightText || '').trim();
  const match = normalized.match(/^©\s*(\d{4})([\s\S]*)$/);
  if (!match) return normalized;

  const yearValue = Number(match[1]);
  const suffixRaw = String(match[2] || '');
  const suffixTrimmed = suffixRaw.trim();
  const suffix = suffixTrimmed ? ` ${suffixTrimmed}` : '';
  return ['© ', Number.isNaN(yearValue) ? match[1] : yearValue, suffix];
}

function patchFooterRootFlightChunk(chunkSource, sectionContent) {
  const lines = chunkSource.split('\n');
  let didPatch = false;

  const patchedLines = lines.map((line) => {
    if (!line.includes('"$","footer",null')) return line;

    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex === -1) return line;
    const linePrefix = line.slice(0, delimiterIndex);
    const payloadSource = line.slice(delimiterIndex + 1);

    let payload;
    try {
      payload = JSON.parse(payloadSource);
    } catch {
      console.warn('[mirror slots] footer-root-flight: failed to parse payload line.');
      return line;
    }

    const desktopLogoNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.src === '/big-logo.svg' &&
        candidate.className === 'max-lg:hidden',
    );
    if (desktopLogoNode) {
      desktopLogoNode.alt = sectionContent.logoAlt;
    }

    const subscriptionNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === FOOTER_SECTION_DEFAULT_CONTENT.subscriptionText,
    );
    if (subscriptionNode) {
      subscriptionNode.children = sectionContent.subscriptionText;
    }

    const followUsNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === FOOTER_SECTION_DEFAULT_CONTENT.followUsLabel,
    );
    if (followUsNode) {
      followUsNode.children = sectionContent.followUsLabel;
    }

    didPatch = true;
    return `${linePrefix}:${JSON.stringify(payload)}`;
  });

  if (!didPatch) {
    console.warn('[mirror slots] footer-root-flight: no matching chunk lines were patched.');
  }

  return patchedLines.join('\n');
}

function patchFooterLinksFlightChunk(chunkSource, sectionContent) {
  const lines = chunkSource.split('\n');
  let didPatch = false;

  const patchedLines = lines.map((line) => {
    if (!line.includes('"children":"Help & Support"')) return line;

    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex === -1) return line;
    const linePrefix = line.slice(0, delimiterIndex);
    const payloadSource = line.slice(delimiterIndex + 1);

    let payload;
    try {
      payload = JSON.parse(payloadSource);
    } catch {
      console.warn('[mirror slots] footer-links-flight: failed to parse payload line.');
      return line;
    }

    const supportTitleNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === FOOTER_SECTION_DEFAULT_CONTENT.supportTitle,
    );
    if (supportTitleNode) {
      supportTitleNode.children = sectionContent.supportTitle;
    }

    const aboutTitleNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === FOOTER_SECTION_DEFAULT_CONTENT.aboutTitle,
    );
    if (aboutTitleNode) {
      aboutTitleNode.children = sectionContent.aboutTitle;
    }

    const linkNodes = findAllObjectsByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.className === 'cursor-pointer hover:underline hover:text-grey-50' &&
        typeof candidate.href === 'string' &&
        typeof candidate.children === 'string',
    );

    const allLinks = [...sectionContent.supportLinks, ...sectionContent.aboutLinks];
    if (linkNodes.length < allLinks.length) {
      console.warn(
        `[mirror slots] footer-links-flight: expected ${allLinks.length} links but found ${linkNodes.length}.`,
      );
    }

    for (let index = 0; index < allLinks.length; index += 1) {
      const sourceLink = allLinks[index];
      const targetNode = linkNodes[index];
      if (!sourceLink || !targetNode) continue;
      targetNode.href = sourceLink.href;
      targetNode.children = sourceLink.label;
    }

    didPatch = true;
    return `${linePrefix}:${JSON.stringify(payload)}`;
  });

  if (!didPatch) {
    console.warn('[mirror slots] footer-links-flight: no matching chunk lines were patched.');
  }

  return patchedLines.join('\n');
}

function patchFooterCardFlightChunk(chunkSource, sectionContent) {
  const lines = chunkSource.split('\n');
  let didPatch = false;

  const patchedLines = lines.map((line) => {
    if (!line.includes('"children":"Find us on the App Store and Google Play Store"')) return line;

    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex === -1) return line;
    const linePrefix = line.slice(0, delimiterIndex);
    const payloadSource = line.slice(delimiterIndex + 1);

    let payload;
    try {
      payload = JSON.parse(payloadSource);
    } catch {
      console.warn('[mirror slots] footer-card-flight: failed to parse payload line.');
      return line;
    }

    const desktopCardImageNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.src === FOOTER_SECTION_DEFAULT_CONTENT.cardDesktopImagePath,
    );
    if (desktopCardImageNode) {
      desktopCardImageNode.src = sectionContent.cardDesktopImagePath;
      desktopCardImageNode.alt = sectionContent.cardImageAlt;
    }

    const mobileCardImageNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.src === FOOTER_SECTION_DEFAULT_CONTENT.cardMobileImagePath,
    );
    if (mobileCardImageNode) {
      mobileCardImageNode.src = sectionContent.cardMobileImagePath;
      mobileCardImageNode.alt = sectionContent.cardImageAlt;
    }

    const appPromptNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === FOOTER_SECTION_DEFAULT_CONTENT.appPrompt,
    );
    if (appPromptNode) {
      appPromptNode.children = sectionContent.appPrompt;
    }

    const appStoreAnchorNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.href === FOOTER_SECTION_DEFAULT_CONTENT.appStoreHref,
    );
    if (appStoreAnchorNode) {
      appStoreAnchorNode.href = sectionContent.appStoreHref;
    }

    const googlePlayAnchorNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.href === FOOTER_SECTION_DEFAULT_CONTENT.googlePlayHref,
    );
    if (googlePlayAnchorNode) {
      googlePlayAnchorNode.href = sectionContent.googlePlayHref;
    }

    const appStoreImageNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.src === FOOTER_SECTION_DEFAULT_CONTENT.appStoreImagePath,
    );
    if (appStoreImageNode) {
      appStoreImageNode.src = sectionContent.appStoreImagePath;
      appStoreImageNode.alt = sectionContent.appStoreAlt;
    }

    const googlePlayImageNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.src === FOOTER_SECTION_DEFAULT_CONTENT.googlePlayImagePath,
    );
    if (googlePlayImageNode) {
      googlePlayImageNode.src = sectionContent.googlePlayImagePath;
      googlePlayImageNode.alt = sectionContent.googlePlayAlt;
    }

    const mobileDisclaimerNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.children === FOOTER_SECTION_DEFAULT_CONTENT.legalDisclaimer,
    );
    if (mobileDisclaimerNode) {
      mobileDisclaimerNode.children = sectionContent.legalDisclaimer;
    }

    didPatch = true;
    return `${linePrefix}:${JSON.stringify(payload)}`;
  });

  if (!didPatch) {
    console.warn('[mirror slots] footer-card-flight: no matching chunk lines were patched.');
  }

  return patchedLines.join('\n');
}

function patchFooterMetaFlightChunk(chunkSource, sectionContent) {
  const lines = chunkSource.split('\n');
  let didPatch = false;

  const patchedLines = lines.map((line) => {
    if (!line.includes('"className":"text-grey-500 text-sm font-medium"')) return line;

    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex === -1) return line;
    const linePrefix = line.slice(0, delimiterIndex);
    const payloadSource = line.slice(delimiterIndex + 1);

    let payload;
    try {
      payload = JSON.parse(payloadSource);
    } catch {
      console.warn('[mirror slots] footer-meta-flight: failed to parse payload line.');
      return line;
    }

    const mobileLogoNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.src === '/big-logo.svg' &&
        typeof candidate.className === 'string' &&
        candidate.className.includes('lg:hidden'),
    );
    if (mobileLogoNode) {
      mobileLogoNode.alt = sectionContent.logoAlt;
    }

    const copyrightNode = findFirstObjectByPredicate(
      payload,
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.className === 'text-grey-500 text-sm font-medium',
    );
    if (copyrightNode) {
      copyrightNode.children = toCopyrightChildren(sectionContent.copyrightText);
    }

    didPatch = true;
    return `${linePrefix}:${JSON.stringify(payload)}`;
  });

  if (!didPatch) {
    console.warn('[mirror slots] footer-meta-flight: no matching chunk lines were patched.');
  }

  return patchedLines.join('\n');
}

function applyFooterSectionPatchesToFlightPayload(scriptsAndTail, siteContent) {
  const sectionContent = resolveFooterSectionContent(siteContent);
  let nextScripts = scriptsAndTail;

  const footerRootNeedle = '\\"className\\":\\"rounded-t-[30px] relative z-10 bg-blueZodiac text-white\\"';
  nextScripts = patchFlightPushChunkByNeedle(
    nextScripts,
    footerRootNeedle,
    (chunkSource) => patchFooterRootFlightChunk(chunkSource, sectionContent),
    'footer-root-flight',
  );

  const footerLinksNeedle = '\\"children\\":\\"Help & Support\\"';
  nextScripts = patchFlightPushChunkByNeedle(
    nextScripts,
    footerLinksNeedle,
    (chunkSource) => patchFooterLinksFlightChunk(chunkSource, sectionContent),
    'footer-links-flight',
  );

  const footerCardNeedle = '\\"children\\":\\"Find us on the App Store and Google Play Store\\"';
  nextScripts = patchFlightPushChunkByNeedle(
    nextScripts,
    footerCardNeedle,
    (chunkSource) => patchFooterCardFlightChunk(chunkSource, sectionContent),
    'footer-card-flight',
  );

  const footerMetaNeedle = '\\"className\\":\\"text-grey-500 text-sm font-medium\\"';
  nextScripts = patchFlightPushChunkByNeedle(
    nextScripts,
    footerMetaNeedle,
    (chunkSource) => patchFooterMetaFlightChunk(chunkSource, sectionContent),
    'footer-meta-flight',
  );

  nextScripts = replaceEscapedScriptFieldValue(
    nextScripts,
    'children',
    FOOTER_SECTION_DEFAULT_CONTENT.legalDisclaimer,
    sectionContent.legalDisclaimer,
  );
  nextScripts = replaceEscapedScriptFieldValue(
    nextScripts,
    'placeholder',
    FOOTER_SECTION_DEFAULT_CONTENT.emailPlaceholder,
    sectionContent.emailPlaceholder,
  );
  nextScripts = replaceEscapedScriptFieldValue(
    nextScripts,
    'children',
    FOOTER_SECTION_DEFAULT_CONTENT.subscribeLabel,
    sectionContent.subscribeLabel,
  );

  return nextScripts;
}

function buildRegexReplacements(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      if (typeof entry.pattern !== 'string') return null;
      try {
        const pattern = new RegExp(entry.pattern, typeof entry.flags === 'string' ? entry.flags : '');
        const replacement = typeof entry.replacement === 'string' ? entry.replacement : '';
        return [pattern, replacement];
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function applyExactReplacements(source, exactEntries) {
  let next = source;
  for (const entry of exactEntries) {
    if (!Array.isArray(entry) || entry.length < 2) continue;
    const from = typeof entry[0] === 'string' ? entry[0] : '';
    const to = typeof entry[1] === 'string' ? entry[1] : '';
    const pattern = compileFlexibleExactPattern(from);
    if (!pattern) continue;
    next = next.replace(pattern, to);
  }
  return next;
}

function applyRegexReplacements(source, regexEntries) {
  let next = source;
  for (const [pattern, replacement] of regexEntries) {
    next = next.replace(pattern, replacement);
  }
  return next;
}

function applyCopyReplacements(source, siteContent) {
  const exactEntries = Array.isArray(siteContent.exactTextReplacements) ? siteContent.exactTextReplacements : [];
  const regexEntries = buildRegexReplacements(siteContent.regexTextReplacements);

  let next = source;
  next = applyExactReplacements(next, exactEntries);
  next = applyRegexReplacements(next, regexEntries);
  return next;
}

function applyCopyReplacementsOutsideBlockedTags(source, siteContent) {
  const blockedTagPattern = /(<(?:script|style|noscript)\b[^>]*>[\s\S]*?<\/(?:script|style|noscript)>)/gi;
  const chunks = String(source).split(blockedTagPattern);
  return chunks
    .map((chunk) => {
      if (!chunk) return chunk;
      if (/^<(?:script|style|noscript)\b/i.test(chunk)) {
        return chunk;
      }
      return applyCopyReplacements(chunk, siteContent);
    })
    .join('');
}

function applySeoReplacements(headInner, siteContent) {
  const businessName =
    typeof siteContent.businessName === 'string' && siteContent.businessName
      ? siteContent.businessName
      : 'English Plumber';
  const baseCity = typeof siteContent.baseCity === 'string' && siteContent.baseCity ? siteContent.baseCity : 'Medemblik';
  const whatsAppNumber =
    typeof siteContent.whatsappNumber === 'string' && siteContent.whatsappNumber
      ? siteContent.whatsappNumber
      : '+31 6 428 699 31';

  const defaultTitle = `${businessName} | Plumbing & Heating in ${baseCity}`;
  const defaultDescription = `${businessName} is a friendly local plumber in ${baseCity}. Boiler servicing, radiator repairs, tap repairs, and general plumbing handyman work. WhatsApp ${whatsAppNumber}.`;
  const canonicalOrigin = normalizeAbsoluteUrl(siteContent.canonicalOrigin, 'https://englishplumber.nl/');
  const homepageUrl = normalizeAbsoluteUrl(siteContent.homepageUrl, canonicalOrigin);
  const ogImage = typeof siteContent.ogImage === 'string' && siteContent.ogImage ? siteContent.ogImage : '/IMG_8233.PNG';

  const seoTitle = typeof siteContent.seoTitle === 'string' && siteContent.seoTitle ? siteContent.seoTitle : defaultTitle;
  const seoDescription =
    typeof siteContent.seoDescription === 'string' && siteContent.seoDescription ? siteContent.seoDescription : defaultDescription;

  let nextHead = headInner;
  nextHead = upsertTitle(nextHead, seoTitle);
  nextHead = upsertMetaTag(nextHead, 'name', 'description', seoDescription);
  nextHead = upsertMetaTag(nextHead, 'property', 'og:title', seoTitle);
  nextHead = upsertMetaTag(nextHead, 'property', 'og:description', seoDescription);
  nextHead = upsertMetaTag(nextHead, 'property', 'og:url', homepageUrl);
  nextHead = upsertMetaTag(nextHead, 'property', 'og:site_name', businessName);
  nextHead = upsertMetaTag(nextHead, 'property', 'og:image', ogImage);
  nextHead = upsertMetaTag(nextHead, 'name', 'twitter:title', seoTitle);
  nextHead = upsertMetaTag(nextHead, 'name', 'twitter:description', seoDescription);
  nextHead = upsertMetaTag(nextHead, 'name', 'twitter:image', ogImage);
  nextHead = upsertCanonicalLink(nextHead, homepageUrl);

  return nextHead;
}

export function applyContentPatches({ headInner, bodyInner, siteContent }) {
  const safeSiteContent = siteContent && typeof siteContent === 'object' ? siteContent : {};
  const enableServerCopyRewrite =
    typeof safeSiteContent.enableServerCopyRewrite === 'boolean'
      ? safeSiteContent.enableServerCopyRewrite
      : false;
  const enableServerHeaderSlotRewrite =
    typeof safeSiteContent.enableServerHeaderSlotRewrite === 'boolean'
      ? safeSiteContent.enableServerHeaderSlotRewrite
      : true;

  const nextHead = enableServerCopyRewrite
    ? applyCopyReplacementsOutsideBlockedTags(headInner, safeSiteContent)
    : headInner;
  let nextBody = enableServerCopyRewrite
    ? applyCopyReplacementsOutsideBlockedTags(bodyInner, safeSiteContent)
    : bodyInner;
  if (enableServerHeaderSlotRewrite) {
    const { markupBeforeScripts, scriptsAndTail } = splitBodyAtFirstScript(nextBody);
    let patchedMarkup = applyHeaderSlotPatchesToMarkup(markupBeforeScripts, safeSiteContent);
    patchedMarkup = applyHeroSlotPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyBiomarkerPanelPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyFeaturePanelPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyTrustSectionPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyCommandCenterSectionPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyOurProcessSectionPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyChoosePathSectionPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyFaqSectionPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyMissionSectionPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyMissionGallerySectionPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyNewsletterSectionPatchesToMarkup(patchedMarkup, safeSiteContent);
    patchedMarkup = applyFooterSectionPatchesToMarkup(patchedMarkup, safeSiteContent);

    let patchedScriptsAndTail = applyHeaderSlotPatchesToFlightPayload(scriptsAndTail, safeSiteContent);
    patchedScriptsAndTail = applyHeroSlotPatchesToFlightPayload(patchedScriptsAndTail, safeSiteContent);
    patchedScriptsAndTail = applyBiomarkerPanelPatchesToFlightPayload(patchedScriptsAndTail, safeSiteContent);
    patchedScriptsAndTail = applyFeaturePanelPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    patchedScriptsAndTail = applyTrustSectionPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    patchedScriptsAndTail = applyCommandCenterSectionPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    patchedScriptsAndTail = applyOurProcessSectionPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    patchedScriptsAndTail = applyChoosePathSectionPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    patchedScriptsAndTail = applyFaqSectionPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    patchedScriptsAndTail = applyMissionSectionPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    patchedScriptsAndTail = applyMissionGallerySectionPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    patchedScriptsAndTail = applyNewsletterSectionPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    patchedScriptsAndTail = applyFooterSectionPatchesToFlightPayload(
      patchedScriptsAndTail,
      safeSiteContent,
    );
    nextBody = `${patchedMarkup}${patchedScriptsAndTail}`;
  }
  const nextSeoHead = applySeoReplacements(nextHead, safeSiteContent);

  return {
    headInner: nextSeoHead,
    bodyInner: nextBody,
  };
}
