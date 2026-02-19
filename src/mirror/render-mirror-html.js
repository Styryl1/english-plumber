import fs from 'node:fs';
import path from 'node:path';
import { applyContentPatches } from './apply-content-patches.js';

const SOURCE_PATH = path.join(process.cwd(), 'src/mirror/live-index.html');
const INJECTION_DIR = path.join(process.cwd(), 'src/mirror/injections');
const SITE_CONTENT_PATH = path.join(process.cwd(), 'content/site/mirror-content.json');
const TINA_SITE_OVERRIDES_PATH = path.join(process.cwd(), 'content/tina/site.json');
const MEDIA_MANIFEST_PATH = path.join(process.cwd(), 'src/generated/media-manifest.json');
const LEGACY_NEXT_PREFIX = '/_next/static/';
const LOCAL_MIRROR_NEXT_PREFIX = '/mirror_next/static/';

function decodeEntities(input) {
  return input
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function escapeAttr(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function extractOpenTag(sourceHtml, tagName) {
  const match = sourceHtml.match(new RegExp(`<${tagName}\\b[^>]*>`, 'i'));
  return match ? match[0] : '';
}

function extractInner(sourceHtml, tagName) {
  const match = sourceHtml.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? match[1] : '';
}

function parseAttrs(openTag, tagName) {
  const attrs = {};
  if (!openTag) return attrs;

  const tagOnlyPattern = new RegExp(`^<${tagName}\\b|>$`, 'gi');
  const attrSource = openTag.replace(tagOnlyPattern, '');
  const attrPattern = /([:@A-Za-z0-9_-]+)(?:="([^"]*)")?/g;

  for (const match of attrSource.matchAll(attrPattern)) {
    const key = match[1];
    if (!key) continue;
    const value = match[2] ? decodeEntities(match[2]) : '';
    attrs[key] = value;
  }

  return attrs;
}

function attrsToString(attrs) {
  return Object.entries(attrs)
    .map(([name, value]) => {
      if (value === '') return name;
      return `${name}="${escapeAttr(value)}"`;
    })
    .join(' ');
}

function loadInjection(fileName) {
  const fullPath = path.join(INJECTION_DIR, fileName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing injection file: ${path.relative(process.cwd(), fullPath)}`);
  }
  return fs.readFileSync(fullPath, 'utf-8').trim();
}

function loadJson(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) return fallbackValue;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallbackValue;
  }
}

function stringifyForInlineScript(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function attrSection(value) {
  return value ? ` ${value}` : '';
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toNonEmptyString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeExactEntries(entries) {
  if (!Array.isArray(entries)) return [];

  const normalized = [];
  for (const entry of entries) {
    if (Array.isArray(entry)) {
      const from = toNonEmptyString(entry[0]);
      const to = typeof entry[1] === 'string' ? entry[1] : null;
      if (from && to !== null) {
        normalized.push([from, to]);
      }
      continue;
    }

    if (!isObject(entry)) continue;
    const from = toNonEmptyString(entry.from);
    const to = typeof entry.to === 'string' ? entry.to : null;
    if (from && to !== null) {
      normalized.push([from, to]);
    }
  }

  return normalized;
}

function normalizeRegexEntries(entries) {
  if (!Array.isArray(entries)) return [];

  const normalized = [];
  for (const entry of entries) {
    if (!isObject(entry)) continue;
    const pattern = toNonEmptyString(entry.pattern);
    const replacement = typeof entry.replacement === 'string' ? entry.replacement : null;
    if (!pattern || replacement === null) continue;

    normalized.push({
      pattern,
      flags: typeof entry.flags === 'string' ? entry.flags : '',
      replacement,
    });
  }

  return normalized;
}

function mergeExactEntries(baseEntries, overrideEntries) {
  const merged = [];
  const bySource = new Map();

  for (const [from, to] of baseEntries) {
    bySource.set(from, to);
    merged.push(from);
  }

  for (const [from, to] of overrideEntries) {
    if (!bySource.has(from)) {
      merged.push(from);
    }
    bySource.set(from, to);
  }

  return merged.map((from) => [from, bySource.get(from)]);
}

function mergeRegexEntries(baseEntries, overrideEntries) {
  const toKey = (entry) => `${entry.pattern}__${entry.flags || ''}`;
  const mergedKeys = [];
  const byKey = new Map();

  for (const entry of baseEntries) {
    const key = toKey(entry);
    byKey.set(key, entry);
    mergedKeys.push(key);
  }

  for (const entry of overrideEntries) {
    const key = toKey(entry);
    if (!byKey.has(key)) {
      mergedKeys.push(key);
    }
    byKey.set(key, entry);
  }

  return mergedKeys.map((key) => byKey.get(key));
}

function mergeSiteContent(baseContent, tinaOverrides) {
  const merged = isObject(baseContent) ? { ...baseContent } : {};
  if (!isObject(tinaOverrides)) return merged;

  const siteOverrides = isObject(tinaOverrides.site) ? tinaOverrides.site : {};
  const seoOverrides = isObject(tinaOverrides.seo) ? tinaOverrides.seo : {};
  const controlOverrides = isObject(tinaOverrides.controls) ? tinaOverrides.controls : {};
  const heroOverrides = isObject(tinaOverrides.hero) ? tinaOverrides.hero : null;
  const biomarkerPanelOverrides = isObject(tinaOverrides.biomarkerPanel) ? tinaOverrides.biomarkerPanel : null;
  const featurePanelOverrides = isObject(tinaOverrides.featurePanel) ? tinaOverrides.featurePanel : null;
  const trustSectionOverrides = isObject(tinaOverrides.trustSection) ? tinaOverrides.trustSection : null;
  const commandCenterSectionOverrides = isObject(tinaOverrides.commandCenterSection)
    ? tinaOverrides.commandCenterSection
    : null;
  const ourProcessSectionOverrides = isObject(tinaOverrides.ourProcessSection)
    ? tinaOverrides.ourProcessSection
    : null;
  const choosePathSectionOverrides = isObject(tinaOverrides.choosePathSection)
    ? tinaOverrides.choosePathSection
    : null;
  const faqSectionOverrides = isObject(tinaOverrides.faqSection) ? tinaOverrides.faqSection : null;
  const missionSectionOverrides = isObject(tinaOverrides.missionSection) ? tinaOverrides.missionSection : null;
  const newsletterSectionOverrides = isObject(tinaOverrides.newsletterSection)
    ? tinaOverrides.newsletterSection
    : null;
  const footerSectionOverrides = isObject(tinaOverrides.footerSection) ? tinaOverrides.footerSection : null;
  const headerOverrides = isObject(tinaOverrides.header) ? tinaOverrides.header : null;
  const copyOverrides = isObject(tinaOverrides.copy) ? tinaOverrides.copy : {};

  const businessName = toNonEmptyString(siteOverrides.businessName);
  if (businessName) merged.businessName = businessName;

  const baseCity = toNonEmptyString(siteOverrides.baseCity);
  if (baseCity) merged.baseCity = baseCity;

  const whatsappNumber = toNonEmptyString(siteOverrides.whatsappNumber);
  if (whatsappNumber) merged.whatsappNumber = whatsappNumber;

  const primaryArea = toNonEmptyString(siteOverrides.primaryArea);
  if (primaryArea) merged.primaryArea = primaryArea;

  const heroImagePath = toNonEmptyString(siteOverrides.heroImagePath);
  if (heroImagePath) merged.heroImagePath = heroImagePath;

  const seoTitle = toNonEmptyString(seoOverrides.title);
  if (seoTitle) merged.seoTitle = seoTitle;

  const seoDescription = toNonEmptyString(seoOverrides.description);
  if (seoDescription) merged.seoDescription = seoDescription;

  const canonicalUrl = toNonEmptyString(seoOverrides.canonicalUrl);
  if (canonicalUrl) merged.canonicalOrigin = canonicalUrl;

  const homepageUrl = toNonEmptyString(seoOverrides.homepageUrl);
  if (homepageUrl) merged.homepageUrl = homepageUrl;

  const ogImage = toNonEmptyString(seoOverrides.ogImage);
  if (ogImage) merged.ogImage = ogImage;

  if (typeof controlOverrides.enableRuntimeCopyRewrite === 'boolean') {
    merged.enableRuntimeCopyRewrite = controlOverrides.enableRuntimeCopyRewrite;
  }

  if (typeof controlOverrides.enableServerCopyRewrite === 'boolean') {
    merged.enableServerCopyRewrite = controlOverrides.enableServerCopyRewrite;
  }

  if (typeof controlOverrides.enableServerHeaderSlotRewrite === 'boolean') {
    merged.enableServerHeaderSlotRewrite = controlOverrides.enableServerHeaderSlotRewrite;
  }

  if (heroOverrides) {
    const baseHero = isObject(merged.hero) ? merged.hero : {};
    const nextHero = { ...baseHero };

    const titleLine1 = toNonEmptyString(heroOverrides.titleLine1);
    if (titleLine1) nextHero.titleLine1 = titleLine1;

    const titleLine2 = toNonEmptyString(heroOverrides.titleLine2);
    if (titleLine2) nextHero.titleLine2 = titleLine2;

    const description = toNonEmptyString(heroOverrides.description);
    if (description) nextHero.description = description;

    const primaryCtaLabel = toNonEmptyString(heroOverrides.primaryCtaLabel);
    if (primaryCtaLabel) nextHero.primaryCtaLabel = primaryCtaLabel;

    merged.hero = nextHero;
  }

  if (biomarkerPanelOverrides) {
    const baseBiomarkerPanel = isObject(merged.biomarkerPanel) ? merged.biomarkerPanel : {};
    const nextBiomarkerPanel = { ...baseBiomarkerPanel };

    const titleLine1 = toNonEmptyString(biomarkerPanelOverrides.titleLine1);
    if (titleLine1) nextBiomarkerPanel.titleLine1 = titleLine1;

    const titleLine2 = toNonEmptyString(biomarkerPanelOverrides.titleLine2);
    if (titleLine2) nextBiomarkerPanel.titleLine2 = titleLine2;

    const primaryCtaLabel = toNonEmptyString(biomarkerPanelOverrides.primaryCtaLabel);
    if (primaryCtaLabel) nextBiomarkerPanel.primaryCtaLabel = primaryCtaLabel;

    if (
      Array.isArray(biomarkerPanelOverrides.items) &&
      biomarkerPanelOverrides.items.length > 0
    ) {
      const items = biomarkerPanelOverrides.items
        .map((item) => {
          if (!isObject(item)) return null;
          const label = toNonEmptyString(item.label);
          const imagePath = toNonEmptyString(item.imagePath);
          if (!label && !imagePath) return null;
          return {
            ...(label ? { label } : {}),
            ...(imagePath ? { imagePath } : {}),
          };
        })
        .filter(Boolean);

      if (items.length > 0) {
        nextBiomarkerPanel.items = items;
      }
    }

    merged.biomarkerPanel = nextBiomarkerPanel;
  }

  if (featurePanelOverrides) {
    const baseFeaturePanel = isObject(merged.featurePanel) ? merged.featurePanel : {};
    const nextFeaturePanel = { ...baseFeaturePanel };

    const cardCtaLabel = toNonEmptyString(featurePanelOverrides.cardCtaLabel);
    if (cardCtaLabel) nextFeaturePanel.cardCtaLabel = cardCtaLabel;

    const headingLine1 = toNonEmptyString(featurePanelOverrides.headingLine1);
    if (headingLine1) nextFeaturePanel.headingLine1 = headingLine1;

    const headingLine2 = toNonEmptyString(featurePanelOverrides.headingLine2);
    if (headingLine2) nextFeaturePanel.headingLine2 = headingLine2;

    const description = toNonEmptyString(featurePanelOverrides.description);
    if (description) nextFeaturePanel.description = description;

    const careHeadingLine1 = toNonEmptyString(featurePanelOverrides.careHeadingLine1);
    if (careHeadingLine1) nextFeaturePanel.careHeadingLine1 = careHeadingLine1;

    const careHeadingLine2 = toNonEmptyString(featurePanelOverrides.careHeadingLine2);
    if (careHeadingLine2) nextFeaturePanel.careHeadingLine2 = careHeadingLine2;

    const careDescription = toNonEmptyString(featurePanelOverrides.careDescription);
    if (careDescription) nextFeaturePanel.careDescription = careDescription;

    const testimonialAlt = toNonEmptyString(featurePanelOverrides.testimonialAlt);
    if (testimonialAlt) nextFeaturePanel.testimonialAlt = testimonialAlt;

    const badgeTitle = toNonEmptyString(featurePanelOverrides.badgeTitle);
    if (badgeTitle) nextFeaturePanel.badgeTitle = badgeTitle;

    const badgeStatus = toNonEmptyString(featurePanelOverrides.badgeStatus);
    if (badgeStatus) nextFeaturePanel.badgeStatus = badgeStatus;

    const normalizeFeatureStat = (value) => {
      if (!isObject(value)) return null;
      const statValue = toNonEmptyString(value.value);
      const line1 = toNonEmptyString(value.line1);
      const line2 = toNonEmptyString(value.line2);
      if (!statValue && !line1 && !line2) return null;
      return {
        ...(statValue ? { value: statValue } : {}),
        ...(line1 ? { line1 } : {}),
        ...(line2 ? { line2 } : {}),
      };
    };

    const stat1Override = normalizeFeatureStat(featurePanelOverrides.stat1);
    if (stat1Override) {
      const baseStat1 = isObject(nextFeaturePanel.stat1) ? nextFeaturePanel.stat1 : {};
      nextFeaturePanel.stat1 = { ...baseStat1, ...stat1Override };
    }

    const stat2Override = normalizeFeatureStat(featurePanelOverrides.stat2);
    if (stat2Override) {
      const baseStat2 = isObject(nextFeaturePanel.stat2) ? nextFeaturePanel.stat2 : {};
      nextFeaturePanel.stat2 = { ...baseStat2, ...stat2Override };
    }

    if (Array.isArray(featurePanelOverrides.cards) && featurePanelOverrides.cards.length > 0) {
      const cards = featurePanelOverrides.cards
        .map((card) => {
          if (!isObject(card)) return null;
          const alt = toNonEmptyString(card.alt);
          const titleLine1 = toNonEmptyString(card.titleLine1);
          const titleLine2 = toNonEmptyString(card.titleLine2);
          const href = toNonEmptyString(card.href);
          const imagePath = toNonEmptyString(card.imagePath);
          if (!alt && !titleLine1 && !titleLine2 && !href && !imagePath) return null;
          return {
            ...(alt ? { alt } : {}),
            ...(titleLine1 ? { titleLine1 } : {}),
            ...(titleLine2 ? { titleLine2 } : {}),
            ...(href ? { href } : {}),
            ...(imagePath ? { imagePath } : {}),
          };
        })
        .filter(Boolean);

      if (cards.length > 0) {
        nextFeaturePanel.cards = cards;
      }
    }

    if (isObject(featurePanelOverrides.prescriptionCard)) {
      const basePrescription = isObject(nextFeaturePanel.prescriptionCard)
        ? nextFeaturePanel.prescriptionCard
        : {};
      const nextPrescription = { ...basePrescription };

      const alt = toNonEmptyString(featurePanelOverrides.prescriptionCard.alt);
      if (alt) nextPrescription.alt = alt;

      const titleLine1 = toNonEmptyString(featurePanelOverrides.prescriptionCard.titleLine1);
      if (titleLine1) nextPrescription.titleLine1 = titleLine1;

      const titleLine2 = toNonEmptyString(featurePanelOverrides.prescriptionCard.titleLine2);
      if (titleLine2) nextPrescription.titleLine2 = titleLine2;

      const href = toNonEmptyString(featurePanelOverrides.prescriptionCard.href);
      if (href) nextPrescription.href = href;

      const imagePath = toNonEmptyString(featurePanelOverrides.prescriptionCard.imagePath);
      if (imagePath) nextPrescription.imagePath = imagePath;

      const ctaLabel = toNonEmptyString(featurePanelOverrides.prescriptionCard.ctaLabel);
      if (ctaLabel) nextPrescription.ctaLabel = ctaLabel;

      nextFeaturePanel.prescriptionCard = nextPrescription;
    }

    merged.featurePanel = nextFeaturePanel;
  }

  if (trustSectionOverrides) {
    const baseTrustSection = isObject(merged.trustSection) ? merged.trustSection : {};
    const nextTrustSection = { ...baseTrustSection };

    const headingLine1 = toNonEmptyString(trustSectionOverrides.headingLine1);
    if (headingLine1) nextTrustSection.headingLine1 = headingLine1;

    const headingLine2 = toNonEmptyString(trustSectionOverrides.headingLine2);
    if (headingLine2) nextTrustSection.headingLine2 = headingLine2;

    const memberLabel = toNonEmptyString(trustSectionOverrides.memberLabel);
    if (memberLabel) nextTrustSection.memberLabel = memberLabel;

    const readMoreLabel = toNonEmptyString(trustSectionOverrides.readMoreLabel);
    if (readMoreLabel) nextTrustSection.readMoreLabel = readMoreLabel;

    if (Array.isArray(trustSectionOverrides.videoCards) && trustSectionOverrides.videoCards.length > 0) {
      const videoCards = trustSectionOverrides.videoCards
        .map((card) => {
          if (!isObject(card)) return null;
          const thumbnailAlt = toNonEmptyString(card.thumbnailAlt);
          const profileAlt = toNonEmptyString(card.profileAlt);
          const handle = toNonEmptyString(card.handle);
          const meta = toNonEmptyString(card.meta);
          if (!thumbnailAlt && !profileAlt && !handle && !meta) return null;
          return {
            ...(thumbnailAlt ? { thumbnailAlt } : {}),
            ...(profileAlt ? { profileAlt } : {}),
            ...(handle ? { handle } : {}),
            ...(meta ? { meta } : {}),
          };
        })
        .filter(Boolean);

      if (videoCards.length > 0) {
        nextTrustSection.videoCards = videoCards;
      }
    }

    if (Array.isArray(trustSectionOverrides.textCards) && trustSectionOverrides.textCards.length > 0) {
      const textCards = trustSectionOverrides.textCards
        .map((card) => {
          if (!isObject(card)) return null;
          const profileAlt = toNonEmptyString(card.profileAlt);
          const name = toNonEmptyString(card.name);
          const quote = toNonEmptyString(card.quote);
          if (!profileAlt && !name && !quote) return null;
          return {
            ...(profileAlt ? { profileAlt } : {}),
            ...(name ? { name } : {}),
            ...(quote ? { quote } : {}),
          };
        })
        .filter(Boolean);

      if (textCards.length > 0) {
        nextTrustSection.textCards = textCards;
      }
    }

    merged.trustSection = nextTrustSection;
  }

  if (commandCenterSectionOverrides) {
    const baseCommandCenterSection = isObject(merged.commandCenterSection)
      ? merged.commandCenterSection
      : {};
    const nextCommandCenterSection = { ...baseCommandCenterSection };

    const headingLine1 = toNonEmptyString(commandCenterSectionOverrides.headingLine1);
    if (headingLine1) nextCommandCenterSection.headingLine1 = headingLine1;

    const headingLine2 = toNonEmptyString(commandCenterSectionOverrides.headingLine2);
    if (headingLine2) nextCommandCenterSection.headingLine2 = headingLine2;

    const loadingAnimationLabel = toNonEmptyString(commandCenterSectionOverrides.loadingAnimationLabel);
    if (loadingAnimationLabel) nextCommandCenterSection.loadingAnimationLabel = loadingAnimationLabel;

    const description = toNonEmptyString(commandCenterSectionOverrides.description);
    if (description) nextCommandCenterSection.description = description;

    const ctaLabel = toNonEmptyString(commandCenterSectionOverrides.ctaLabel);
    if (ctaLabel) nextCommandCenterSection.ctaLabel = ctaLabel;

    const appImageAlt = toNonEmptyString(commandCenterSectionOverrides.appImageAlt);
    if (appImageAlt) nextCommandCenterSection.appImageAlt = appImageAlt;

    merged.commandCenterSection = nextCommandCenterSection;
  }

  if (ourProcessSectionOverrides) {
    const baseOurProcessSection = isObject(merged.ourProcessSection) ? merged.ourProcessSection : {};
    const nextOurProcessSection = { ...baseOurProcessSection };

    const imageAlt = toNonEmptyString(ourProcessSectionOverrides.imageAlt);
    if (imageAlt) nextOurProcessSection.imageAlt = imageAlt;

    const headingLine1 = toNonEmptyString(ourProcessSectionOverrides.headingLine1);
    if (headingLine1) nextOurProcessSection.headingLine1 = headingLine1;

    const headingLine2 = toNonEmptyString(ourProcessSectionOverrides.headingLine2);
    if (headingLine2) nextOurProcessSection.headingLine2 = headingLine2;

    if (Array.isArray(ourProcessSectionOverrides.steps) && ourProcessSectionOverrides.steps.length > 0) {
      const steps = ourProcessSectionOverrides.steps
        .map((step) => {
          if (!isObject(step)) return null;
          const title = toNonEmptyString(step.title);
          const description = toNonEmptyString(step.description);
          if (!title && !description) return null;
          return {
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
          };
        })
        .filter(Boolean);

      if (steps.length > 0) {
        nextOurProcessSection.steps = steps;
      }
    }

    merged.ourProcessSection = nextOurProcessSection;
  }

  if (choosePathSectionOverrides) {
    const baseChoosePathSection = isObject(merged.choosePathSection) ? merged.choosePathSection : {};
    const nextChoosePathSection = { ...baseChoosePathSection };

    const title = toNonEmptyString(choosePathSectionOverrides.title);
    if (title) nextChoosePathSection.title = title;

    const subtitle = toNonEmptyString(choosePathSectionOverrides.subtitle);
    if (subtitle) nextChoosePathSection.subtitle = subtitle;

    const normalizePlanGroups = (value) => {
      if (!Array.isArray(value)) return [];
      return value
        .map((group) => {
          if (!isObject(group)) return null;
          const categoryName = toNonEmptyString(group.categoryName);

          const features = Array.isArray(group.features)
            ? group.features
                .map((feature) => {
                  if (!isObject(feature)) return null;
                  const name = toNonEmptyString(feature.name);
                  if (!name) return null;
                  return { name };
                })
                .filter(Boolean)
            : [];

          if (!categoryName && features.length === 0) return null;
          return {
            ...(categoryName ? { categoryName } : {}),
            ...(features.length > 0 ? { features } : {}),
          };
        })
        .filter(Boolean);
    };

    if (Array.isArray(choosePathSectionOverrides.plans) && choosePathSectionOverrides.plans.length > 0) {
      const plans = choosePathSectionOverrides.plans
        .map((plan) => {
          if (!isObject(plan)) return null;

          const nextPlan = {};

          const name = toNonEmptyString(plan.name);
          if (name) nextPlan.name = name;

          const nameStyle = toNonEmptyString(plan.nameStyle);
          if (nameStyle) nextPlan.nameStyle = nameStyle;

          const tagline = toNonEmptyString(plan.tagline);
          if (tagline) nextPlan.tagline = tagline;

          if (typeof plan.isPopular === 'boolean') {
            nextPlan.isPopular = plan.isPopular;
          }

          if (isObject(plan.pricing)) {
            const pricing = {};
            const oneTimePrice = toNonEmptyString(plan.pricing.oneTimePrice);
            if (oneTimePrice) pricing.oneTimePrice = oneTimePrice;

            const recurringPrice = toNonEmptyString(plan.pricing.recurringPrice);
            if (recurringPrice) pricing.recurringPrice = recurringPrice;

            const oneTimeLabel = toNonEmptyString(plan.pricing.oneTimeLabel);
            if (oneTimeLabel) pricing.oneTimeLabel = oneTimeLabel;

            const recurringLabel = toNonEmptyString(plan.pricing.recurringLabel);
            if (recurringLabel) pricing.recurringLabel = recurringLabel;

            const discountPercentage = toNonEmptyString(plan.pricing.discountPercentage);
            if (discountPercentage) pricing.discountPercentage = discountPercentage;

            const twiceAnnuallyBillingText = toNonEmptyString(plan.pricing.twiceAnnuallyBillingText);
            if (twiceAnnuallyBillingText) pricing.twiceAnnuallyBillingText = twiceAnnuallyBillingText;

            const annuallyBillingText = toNonEmptyString(plan.pricing.annuallyBillingText);
            if (annuallyBillingText) pricing.annuallyBillingText = annuallyBillingText;

            if (Object.keys(pricing).length > 0) {
              nextPlan.pricing = pricing;
            }
          }

          const featureGroups = normalizePlanGroups(plan.feature);
          if (featureGroups.length > 0) {
            nextPlan.feature = featureGroups;
          }

          const restrictionGroups = normalizePlanGroups(plan.restriction);
          if (restrictionGroups.length > 0) {
            nextPlan.restriction = restrictionGroups;
          }

          if (isObject(plan.link)) {
            const label = toNonEmptyString(plan.link.label);
            if (label) {
              nextPlan.link = { label };
            }
          }

          if (Object.keys(nextPlan).length === 0) return null;
          return nextPlan;
        })
        .filter(Boolean);

      if (plans.length > 0) {
        nextChoosePathSection.plans = plans;
      }
    }

    merged.choosePathSection = nextChoosePathSection;
  }

  if (faqSectionOverrides) {
    const baseFaqSection = isObject(merged.faqSection) ? merged.faqSection : {};
    const nextFaqSection = { ...baseFaqSection };

    const headingLine1 = toNonEmptyString(faqSectionOverrides.headingLine1);
    if (headingLine1) nextFaqSection.headingLine1 = headingLine1;

    const headingLine2 = toNonEmptyString(faqSectionOverrides.headingLine2);
    if (headingLine2) nextFaqSection.headingLine2 = headingLine2;

    const cardImageAlt = toNonEmptyString(faqSectionOverrides.cardImageAlt);
    if (cardImageAlt) nextFaqSection.cardImageAlt = cardImageAlt;

    const supportTitle = toNonEmptyString(faqSectionOverrides.supportTitle);
    if (supportTitle) nextFaqSection.supportTitle = supportTitle;

    const supportDescription = toNonEmptyString(faqSectionOverrides.supportDescription);
    if (supportDescription) nextFaqSection.supportDescription = supportDescription;

    const supportCtaLabel = toNonEmptyString(faqSectionOverrides.supportCtaLabel);
    if (supportCtaLabel) nextFaqSection.supportCtaLabel = supportCtaLabel;

    const supportCtaHref = toNonEmptyString(faqSectionOverrides.supportCtaHref);
    if (supportCtaHref) nextFaqSection.supportCtaHref = supportCtaHref;

    if (Array.isArray(faqSectionOverrides.items) && faqSectionOverrides.items.length > 0) {
      const items = faqSectionOverrides.items
        .map((item) => {
          if (!isObject(item)) return null;
          const question = toNonEmptyString(item.question);
          const answer = toNonEmptyString(item.answer);
          if (!question && !answer) return null;
          return {
            ...(question ? { question } : {}),
            ...(answer ? { answer } : {}),
          };
        })
        .filter(Boolean);

      if (items.length > 0) {
        nextFaqSection.items = items;
      }
    }

    merged.faqSection = nextFaqSection;
  }

  if (missionSectionOverrides) {
    const baseMissionSection = isObject(merged.missionSection) ? merged.missionSection : {};
    const nextMissionSection = { ...baseMissionSection };

    if (isObject(missionSectionOverrides.mission)) {
      const baseMission = isObject(nextMissionSection.mission) ? nextMissionSection.mission : {};
      const nextMission = { ...baseMission };

      const imageAlt = toNonEmptyString(missionSectionOverrides.mission.imageAlt);
      if (imageAlt) nextMission.imageAlt = imageAlt;

      const imagePath = toNonEmptyString(missionSectionOverrides.mission.imagePath);
      if (imagePath) nextMission.imagePath = imagePath;

      const name = toNonEmptyString(missionSectionOverrides.mission.name);
      if (name) nextMission.name = name;

      const role = toNonEmptyString(missionSectionOverrides.mission.role);
      if (role) nextMission.role = role;

      const headingLine1 = toNonEmptyString(missionSectionOverrides.mission.headingLine1);
      if (headingLine1) nextMission.headingLine1 = headingLine1;

      const headingLine2 = toNonEmptyString(missionSectionOverrides.mission.headingLine2);
      if (headingLine2) nextMission.headingLine2 = headingLine2;

      const description = toNonEmptyString(missionSectionOverrides.mission.description);
      if (description) nextMission.description = description;

      const ctaLabel = toNonEmptyString(missionSectionOverrides.mission.ctaLabel);
      if (ctaLabel) nextMission.ctaLabel = ctaLabel;

      const ctaHref = toNonEmptyString(missionSectionOverrides.mission.ctaHref);
      if (ctaHref) nextMission.ctaHref = ctaHref;

      nextMissionSection.mission = nextMission;
    }

    if (isObject(missionSectionOverrides.gallery)) {
      const baseGallery = isObject(nextMissionSection.gallery) ? nextMissionSection.gallery : {};
      const nextGallery = { ...baseGallery };

      const headingLine1 = toNonEmptyString(missionSectionOverrides.gallery.headingLine1);
      if (headingLine1) nextGallery.headingLine1 = headingLine1;

      const headingLine2 = toNonEmptyString(missionSectionOverrides.gallery.headingLine2);
      if (headingLine2) nextGallery.headingLine2 = headingLine2;

      const ctaLabel = toNonEmptyString(missionSectionOverrides.gallery.ctaLabel);
      if (ctaLabel) nextGallery.ctaLabel = ctaLabel;

      const ctaHref = toNonEmptyString(missionSectionOverrides.gallery.ctaHref);
      if (ctaHref) nextGallery.ctaHref = ctaHref;

      if (Array.isArray(missionSectionOverrides.gallery.images) && missionSectionOverrides.gallery.images.length > 0) {
        const images = missionSectionOverrides.gallery.images
          .map((image) => {
            if (!isObject(image)) return null;
            const alt = toNonEmptyString(image.alt);
            const imagePath = toNonEmptyString(image.imagePath);
            if (!alt && !imagePath) return null;
            return {
              ...(alt ? { alt } : {}),
              ...(imagePath ? { imagePath } : {}),
            };
          })
          .filter(Boolean);

        if (images.length > 0) {
          nextGallery.images = images;
        }
      }

      nextMissionSection.gallery = nextGallery;
    }

    merged.missionSection = nextMissionSection;
  }

  if (newsletterSectionOverrides) {
    const baseNewsletterSection = isObject(merged.newsletterSection) ? merged.newsletterSection : {};
    const nextNewsletterSection = { ...baseNewsletterSection };

    const backgroundImagePath = toNonEmptyString(newsletterSectionOverrides.backgroundImagePath);
    if (backgroundImagePath) nextNewsletterSection.backgroundImagePath = backgroundImagePath;

    const backgroundImageAlt = toNonEmptyString(newsletterSectionOverrides.backgroundImageAlt);
    if (backgroundImageAlt) nextNewsletterSection.backgroundImageAlt = backgroundImageAlt;

    const headingLine1 = toNonEmptyString(newsletterSectionOverrides.headingLine1);
    if (headingLine1) nextNewsletterSection.headingLine1 = headingLine1;

    const headingLine2 = toNonEmptyString(newsletterSectionOverrides.headingLine2);
    if (headingLine2) nextNewsletterSection.headingLine2 = headingLine2;

    const description = toNonEmptyString(newsletterSectionOverrides.description);
    if (description) nextNewsletterSection.description = description;

    const ctaLabel = toNonEmptyString(newsletterSectionOverrides.ctaLabel);
    if (ctaLabel) nextNewsletterSection.ctaLabel = ctaLabel;

    const ctaHref = toNonEmptyString(newsletterSectionOverrides.ctaHref);
    if (ctaHref) nextNewsletterSection.ctaHref = ctaHref;

    merged.newsletterSection = nextNewsletterSection;
  }

  if (footerSectionOverrides) {
    const baseFooterSection = isObject(merged.footerSection) ? merged.footerSection : {};
    const nextFooterSection = { ...baseFooterSection };

    const logoAlt = toNonEmptyString(footerSectionOverrides.logoAlt);
    if (logoAlt) nextFooterSection.logoAlt = logoAlt;

    const subscriptionText = toNonEmptyString(footerSectionOverrides.subscriptionText);
    if (subscriptionText) nextFooterSection.subscriptionText = subscriptionText;

    const emailPlaceholder = toNonEmptyString(footerSectionOverrides.emailPlaceholder);
    if (emailPlaceholder) nextFooterSection.emailPlaceholder = emailPlaceholder;

    const subscribeLabel = toNonEmptyString(footerSectionOverrides.subscribeLabel);
    if (subscribeLabel) nextFooterSection.subscribeLabel = subscribeLabel;

    const followUsLabel = toNonEmptyString(footerSectionOverrides.followUsLabel);
    if (followUsLabel) nextFooterSection.followUsLabel = followUsLabel;

    const supportTitle = toNonEmptyString(footerSectionOverrides.supportTitle);
    if (supportTitle) nextFooterSection.supportTitle = supportTitle;

    const aboutTitle = toNonEmptyString(footerSectionOverrides.aboutTitle);
    if (aboutTitle) nextFooterSection.aboutTitle = aboutTitle;

    const legalDisclaimer = toNonEmptyString(footerSectionOverrides.legalDisclaimer);
    if (legalDisclaimer) nextFooterSection.legalDisclaimer = legalDisclaimer;

    const cardImageAlt = toNonEmptyString(footerSectionOverrides.cardImageAlt);
    if (cardImageAlt) nextFooterSection.cardImageAlt = cardImageAlt;

    const cardDesktopImagePath = toNonEmptyString(footerSectionOverrides.cardDesktopImagePath);
    if (cardDesktopImagePath) nextFooterSection.cardDesktopImagePath = cardDesktopImagePath;

    const cardMobileImagePath = toNonEmptyString(footerSectionOverrides.cardMobileImagePath);
    if (cardMobileImagePath) nextFooterSection.cardMobileImagePath = cardMobileImagePath;

    const appPrompt = toNonEmptyString(footerSectionOverrides.appPrompt);
    if (appPrompt) nextFooterSection.appPrompt = appPrompt;

    const appStoreAlt = toNonEmptyString(footerSectionOverrides.appStoreAlt);
    if (appStoreAlt) nextFooterSection.appStoreAlt = appStoreAlt;

    const appStoreHref = toNonEmptyString(footerSectionOverrides.appStoreHref);
    if (appStoreHref) nextFooterSection.appStoreHref = appStoreHref;

    const appStoreImagePath = toNonEmptyString(footerSectionOverrides.appStoreImagePath);
    if (appStoreImagePath) nextFooterSection.appStoreImagePath = appStoreImagePath;

    const googlePlayAlt = toNonEmptyString(footerSectionOverrides.googlePlayAlt);
    if (googlePlayAlt) nextFooterSection.googlePlayAlt = googlePlayAlt;

    const googlePlayHref = toNonEmptyString(footerSectionOverrides.googlePlayHref);
    if (googlePlayHref) nextFooterSection.googlePlayHref = googlePlayHref;

    const googlePlayImagePath = toNonEmptyString(footerSectionOverrides.googlePlayImagePath);
    if (googlePlayImagePath) nextFooterSection.googlePlayImagePath = googlePlayImagePath;

    const copyrightText = toNonEmptyString(footerSectionOverrides.copyrightText);
    if (copyrightText) nextFooterSection.copyrightText = copyrightText;

    const normalizeFooterLinks = (links) => {
      if (!Array.isArray(links)) return [];
      return links
        .map((link) => {
          if (!isObject(link)) return null;
          const label = toNonEmptyString(link.label);
          const href = toNonEmptyString(link.href);
          if (!label && !href) return null;
          return {
            ...(label ? { label } : {}),
            ...(href ? { href } : {}),
          };
        })
        .filter(Boolean);
    };

    const supportLinks = normalizeFooterLinks(footerSectionOverrides.supportLinks);
    if (supportLinks.length > 0) {
      nextFooterSection.supportLinks = supportLinks;
    }

    const aboutLinks = normalizeFooterLinks(footerSectionOverrides.aboutLinks);
    if (aboutLinks.length > 0) {
      nextFooterSection.aboutLinks = aboutLinks;
    }

    merged.footerSection = nextFooterSection;
  }

  if (headerOverrides) {
    const baseHeader = isObject(merged.header) ? merged.header : {};
    const nextHeader = { ...baseHeader };

    const whatsAppHref = toNonEmptyString(headerOverrides.whatsAppHref);
    if (whatsAppHref) nextHeader.whatsAppHref = whatsAppHref;

    const primaryCtaLabel = toNonEmptyString(headerOverrides.primaryCtaLabel);
    if (primaryCtaLabel) nextHeader.primaryCtaLabel = primaryCtaLabel;

    const secondaryCtaLabel = toNonEmptyString(headerOverrides.secondaryCtaLabel);
    if (secondaryCtaLabel) nextHeader.secondaryCtaLabel = secondaryCtaLabel;

    const secondaryCtaHref = toNonEmptyString(headerOverrides.secondaryCtaHref);
    if (secondaryCtaHref) nextHeader.secondaryCtaHref = secondaryCtaHref;

    if (Array.isArray(headerOverrides.navItems) && headerOverrides.navItems.length > 0) {
      const navItems = headerOverrides.navItems
        .map((item) => {
          if (!isObject(item)) return null;
          const label = toNonEmptyString(item.label);
          const href = toNonEmptyString(item.href);
          if (!label || !href) return null;
          return { label, href };
        })
        .filter(Boolean);
      if (navItems.length > 0) {
        nextHeader.navItems = navItems;
      }
    }

    merged.header = nextHeader;
  }

  const baseExactEntries = normalizeExactEntries(merged.exactTextReplacements);
  const overrideExactEntries = normalizeExactEntries(copyOverrides.exactTextReplacements);
  if (overrideExactEntries.length > 0) {
    merged.exactTextReplacements = mergeExactEntries(baseExactEntries, overrideExactEntries);
  } else {
    merged.exactTextReplacements = baseExactEntries;
  }

  const baseRegexEntries = normalizeRegexEntries(merged.regexTextReplacements);
  const overrideRegexEntries = normalizeRegexEntries(copyOverrides.regexTextReplacements);
  if (overrideRegexEntries.length > 0) {
    merged.regexTextReplacements = mergeRegexEntries(baseRegexEntries, overrideRegexEntries);
  } else {
    merged.regexTextReplacements = baseRegexEntries;
  }

  return merged;
}

export function renderMirrorHtml() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error('Missing src/mirror/live-index.html. Run: npm run clone:live');
  }

  const sourceHtml = fs.readFileSync(SOURCE_PATH, 'utf-8');

  const htmlAttrs = parseAttrs(extractOpenTag(sourceHtml, 'html'), 'html');
  const bodyAttrs = parseAttrs(extractOpenTag(sourceHtml, 'body'), 'body');

  const htmlLang = htmlAttrs.lang || 'en';
  const htmlClass = htmlAttrs.class || '';
  const bodyClass = bodyAttrs.class || '';

  delete htmlAttrs.lang;
  delete htmlAttrs.class;
  delete bodyAttrs.class;

  let headInner = extractInner(sourceHtml, 'head');
  let bodyInner = extractInner(sourceHtml, 'body');

  // Avoid Next.js reserved /_next conflicts by remapping mirrored bundle assets.
  headInner = headInner.replaceAll(LEGACY_NEXT_PREFIX, LOCAL_MIRROR_NEXT_PREFIX);
  bodyInner = bodyInner.replaceAll(LEGACY_NEXT_PREFIX, LOCAL_MIRROR_NEXT_PREFIX);

  const htmlAttrString = attrsToString(htmlAttrs);
  const bodyAttrString = attrsToString(bodyAttrs);

  const guardScript = loadInjection('guard.js');
  const overridesCss = loadInjection('overrides.css');
  const runtimeScript = loadInjection('runtime.js');
  const siteContent = loadJson(SITE_CONTENT_PATH, {});
  const siteRuntimeDefaults =
    siteContent && typeof siteContent === 'object' && siteContent.site && typeof siteContent.site === 'object'
      ? siteContent.site
      : {};
  const tinaSiteOverrides = loadJson(TINA_SITE_OVERRIDES_PATH, {});
  const siteRuntimeContent = mergeSiteContent(siteRuntimeDefaults, tinaSiteOverrides);
  const mediaManifest = loadJson(MEDIA_MANIFEST_PATH, {});
  const mediaMap =
    mediaManifest && typeof mediaManifest === 'object' && mediaManifest.media && typeof mediaManifest.media === 'object'
      ? mediaManifest.media
      : {};
  const siteContentScript = `window.__MIRROR_SITE_CONTENT__=${stringifyForInlineScript(siteRuntimeContent)};`;
  const mediaMapScript = `window.__MIRROR_MEDIA_MAP__=${stringifyForInlineScript(mediaMap)};`;

  const patchedContent = applyContentPatches({
    headInner,
    bodyInner,
    siteContent: siteRuntimeContent,
  });
  headInner = patchedContent.headInner;
  bodyInner = patchedContent.bodyInner;

  const langAttr = ` lang="${escapeAttr(htmlLang)}"`;
  const htmlClassAttr = htmlClass ? ` class="${escapeAttr(htmlClass)}"` : '';
  const bodyClassAttr = bodyClass ? ` class="${escapeAttr(bodyClass)}"` : '';

  return `<!DOCTYPE html><html${langAttr}${htmlClassAttr}${attrSection(htmlAttrString)}><head><script>${guardScript}</script>${headInner}<style>${overridesCss}</style><script>${siteContentScript}${mediaMapScript}</script><script>${runtimeScript}</script></head><body${bodyClassAttr}${attrSection(bodyAttrString)}>${bodyInner}</body></html>`;
}
