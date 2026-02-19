import { defineConfig } from 'tinacms';

const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main';

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'tina-admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'siteOverrides',
        label: 'Site Overrides',
        path: 'content/tina',
        format: 'json',
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            name: 'site',
            label: 'Business',
            type: 'object',
            fields: [
              { name: 'businessName', label: 'Business Name', type: 'string' },
              { name: 'baseCity', label: 'Base City', type: 'string' },
              { name: 'whatsappNumber', label: 'WhatsApp Number', type: 'string' },
              { name: 'primaryArea', label: 'Primary Area', type: 'string' },
              { name: 'heroImagePath', label: 'Hero Image Path', type: 'string' },
            ],
          },
          {
            name: 'seo',
            label: 'SEO',
            type: 'object',
            fields: [
              { name: 'title', label: 'SEO Title', type: 'string' },
              {
                name: 'description',
                label: 'SEO Description',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'canonicalUrl', label: 'Canonical URL', type: 'string' },
              { name: 'homepageUrl', label: 'Homepage URL', type: 'string' },
              { name: 'ogImage', label: 'OG Image', type: 'string' },
            ],
          },
          {
            name: 'controls',
            label: 'Render Controls',
            type: 'object',
            fields: [
              {
                name: 'enableRuntimeCopyRewrite',
                label: 'Enable Runtime Copy Rewrite',
                type: 'boolean',
              },
              {
                name: 'enableServerCopyRewrite',
                label: 'Enable Server Copy Rewrite',
                type: 'boolean',
              },
              {
                name: 'enableServerHeaderSlotRewrite',
                label: 'Enable Server Header Slot Rewrite',
                type: 'boolean',
              },
            ],
          },
          {
            name: 'hero',
            label: 'Hero',
            type: 'object',
            fields: [
              { name: 'titleLine1', label: 'Title Line 1', type: 'string' },
              { name: 'titleLine2', label: 'Title Line 2', type: 'string' },
              {
                name: 'description',
                label: 'Description',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'primaryCtaLabel', label: 'Primary CTA Label', type: 'string' },
            ],
          },
          {
            name: 'biomarkerPanel',
            label: 'Biomarker Panel',
            type: 'object',
            fields: [
              { name: 'titleLine1', label: 'Title Line 1', type: 'string' },
              { name: 'titleLine2', label: 'Title Line 2', type: 'string' },
              { name: 'primaryCtaLabel', label: 'Primary CTA Label', type: 'string' },
              {
                name: 'items',
                label: 'Items',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.label || 'Item' }),
                },
                fields: [
                  { name: 'label', label: 'Label', type: 'string' },
                  { name: 'imagePath', label: 'Image Path', type: 'string' },
                ],
              },
            ],
          },
          {
            name: 'featurePanel',
            label: 'Feature Panel',
            type: 'object',
            fields: [
              { name: 'cardCtaLabel', label: 'Card CTA Label', type: 'string' },
              {
                name: 'cards',
                label: 'Top Cards',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.titleLine1 || item?.alt || 'Card' }),
                },
                fields: [
                  { name: 'alt', label: 'Image Alt', type: 'string' },
                  { name: 'titleLine1', label: 'Title Line 1', type: 'string' },
                  { name: 'titleLine2', label: 'Title Line 2', type: 'string' },
                  { name: 'href', label: 'Card Link', type: 'string' },
                  { name: 'imagePath', label: 'Image Path', type: 'string' },
                ],
              },
              { name: 'headingLine1', label: 'Heading Line 1', type: 'string' },
              { name: 'headingLine2', label: 'Heading Line 2', type: 'string' },
              {
                name: 'description',
                label: 'Description',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'careHeadingLine1', label: 'Care Heading Line 1', type: 'string' },
              { name: 'careHeadingLine2', label: 'Care Heading Line 2', type: 'string' },
              {
                name: 'careDescription',
                label: 'Care Description',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'testimonialAlt', label: 'Testimonial Alt Label', type: 'string' },
              { name: 'badgeTitle', label: 'Badge Title', type: 'string' },
              { name: 'badgeStatus', label: 'Badge Status', type: 'string' },
              {
                name: 'stat1',
                label: 'Stat 1',
                type: 'object',
                fields: [
                  { name: 'value', label: 'Value', type: 'string' },
                  { name: 'line1', label: 'Line 1', type: 'string' },
                  { name: 'line2', label: 'Line 2', type: 'string' },
                ],
              },
              {
                name: 'stat2',
                label: 'Stat 2',
                type: 'object',
                fields: [
                  { name: 'value', label: 'Value', type: 'string' },
                  { name: 'line1', label: 'Line 1', type: 'string' },
                  { name: 'line2', label: 'Line 2', type: 'string' },
                ],
              },
              {
                name: 'prescriptionCard',
                label: 'Prescription Card',
                type: 'object',
                fields: [
                  { name: 'alt', label: 'Image Alt', type: 'string' },
                  { name: 'titleLine1', label: 'Title Line 1', type: 'string' },
                  { name: 'titleLine2', label: 'Title Line 2', type: 'string' },
                  { name: 'href', label: 'Card Link', type: 'string' },
                  { name: 'imagePath', label: 'Image Path', type: 'string' },
                  { name: 'ctaLabel', label: 'CTA Label', type: 'string' },
                ],
              },
            ],
          },
          {
            name: 'trustSection',
            label: 'Trust Section',
            type: 'object',
            fields: [
              { name: 'headingLine1', label: 'Heading Line 1', type: 'string' },
              { name: 'headingLine2', label: 'Heading Line 2', type: 'string' },
              { name: 'memberLabel', label: 'Member Label', type: 'string' },
              { name: 'readMoreLabel', label: 'Read More Label', type: 'string' },
              {
                name: 'videoCards',
                label: 'Video Cards',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.handle || item?.profileAlt || 'Video Card' }),
                },
                fields: [
                  { name: 'thumbnailAlt', label: 'Thumbnail Alt', type: 'string' },
                  { name: 'profileAlt', label: 'Profile Alt', type: 'string' },
                  { name: 'handle', label: 'Handle', type: 'string' },
                  { name: 'meta', label: 'Meta Text', type: 'string' },
                ],
              },
              {
                name: 'textCards',
                label: 'Text Cards',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.name || item?.profileAlt || 'Text Card' }),
                },
                fields: [
                  { name: 'profileAlt', label: 'Profile Alt', type: 'string' },
                  { name: 'name', label: 'Name', type: 'string' },
                  {
                    name: 'quote',
                    label: 'Quote',
                    type: 'string',
                    ui: {
                      component: 'textarea',
                    },
                  },
                ],
              },
            ],
          },
          {
            name: 'commandCenterSection',
            label: 'Command Center Section',
            type: 'object',
            fields: [
              { name: 'headingLine1', label: 'Heading Line 1', type: 'string' },
              { name: 'headingLine2', label: 'Heading Line 2', type: 'string' },
              {
                name: 'loadingAnimationLabel',
                label: 'Loading Animation Label',
                type: 'string',
              },
              {
                name: 'description',
                label: 'Description',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'ctaLabel', label: 'CTA Label', type: 'string' },
              { name: 'appImageAlt', label: 'App Image Alt', type: 'string' },
            ],
          },
          {
            name: 'ourProcessSection',
            label: 'Our Process Section',
            type: 'object',
            fields: [
              { name: 'imageAlt', label: 'Image Alt', type: 'string' },
              { name: 'headingLine1', label: 'Heading Line 1', type: 'string' },
              { name: 'headingLine2', label: 'Heading Line 2', type: 'string' },
              {
                name: 'steps',
                label: 'Steps',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.title || 'Step' }),
                },
                fields: [
                  { name: 'title', label: 'Title', type: 'string' },
                  {
                    name: 'description',
                    label: 'Description',
                    type: 'string',
                    ui: {
                      component: 'textarea',
                    },
                  },
                ],
              },
            ],
          },
          {
            name: 'choosePathSection',
            label: 'Choose Path Section',
            type: 'object',
            fields: [
              { name: 'title', label: 'Title', type: 'string' },
              {
                name: 'subtitle',
                label: 'Subtitle',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              {
                name: 'plans',
                label: 'Plans',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.nameStyle || item?.name || 'Plan' }),
                },
                fields: [
                  { name: 'name', label: 'Name', type: 'string' },
                  { name: 'nameStyle', label: 'Name Style', type: 'string' },
                  { name: 'tagline', label: 'Tagline', type: 'string' },
                  {
                    name: 'pricing',
                    label: 'Pricing',
                    type: 'object',
                    fields: [
                      { name: 'oneTimePrice', label: 'One-Time Price Label', type: 'string' },
                      { name: 'recurringPrice', label: 'Recurring Price Label', type: 'string' },
                      { name: 'oneTimeLabel', label: 'One-Time Period Label', type: 'string' },
                      { name: 'recurringLabel', label: 'Recurring Period Label', type: 'string' },
                      { name: 'discountPercentage', label: 'Discount Badge Label', type: 'string' },
                      {
                        name: 'twiceAnnuallyBillingText',
                        label: 'One-Time Billing Text',
                        type: 'string',
                      },
                      {
                        name: 'annuallyBillingText',
                        label: 'Recurring Billing Text',
                        type: 'string',
                      },
                    ],
                  },
                  {
                    name: 'feature',
                    label: 'Feature Groups',
                    type: 'object',
                    list: true,
                    ui: {
                      itemProps: (item) => ({ label: item?.categoryName || 'Feature Group' }),
                    },
                    fields: [
                      { name: 'categoryName', label: 'Category Name', type: 'string' },
                      {
                        name: 'features',
                        label: 'Features',
                        type: 'object',
                        list: true,
                        ui: {
                          itemProps: (item) => ({ label: item?.name || 'Feature' }),
                        },
                        fields: [{ name: 'name', label: 'Feature Name', type: 'string' }],
                      },
                    ],
                  },
                  {
                    name: 'restriction',
                    label: 'Restriction Groups',
                    type: 'object',
                    list: true,
                    ui: {
                      itemProps: (item) => ({ label: item?.categoryName || 'Restriction Group' }),
                    },
                    fields: [
                      { name: 'categoryName', label: 'Category Name', type: 'string' },
                      {
                        name: 'features',
                        label: 'Restrictions',
                        type: 'object',
                        list: true,
                        ui: {
                          itemProps: (item) => ({ label: item?.name || 'Restriction' }),
                        },
                        fields: [{ name: 'name', label: 'Restriction Name', type: 'string' }],
                      },
                    ],
                  },
                  {
                    name: 'link',
                    label: 'CTA',
                    type: 'object',
                    fields: [{ name: 'label', label: 'Label', type: 'string' }],
                  },
                ],
              },
            ],
          },
          {
            name: 'faqSection',
            label: 'FAQ Section',
            type: 'object',
            fields: [
              { name: 'headingLine1', label: 'Heading Line 1', type: 'string' },
              { name: 'headingLine2', label: 'Heading Line 2', type: 'string' },
              {
                name: 'items',
                label: 'FAQ Items',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.question || 'FAQ Item' }),
                },
                fields: [
                  { name: 'question', label: 'Question', type: 'string' },
                  {
                    name: 'answer',
                    label: 'Answer',
                    type: 'string',
                    ui: {
                      component: 'textarea',
                    },
                  },
                ],
              },
              { name: 'cardImageAlt', label: 'Card Image Alt', type: 'string' },
              { name: 'supportTitle', label: 'Support Card Title', type: 'string' },
              {
                name: 'supportDescription',
                label: 'Support Card Description',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'supportCtaLabel', label: 'Support CTA Label', type: 'string' },
              { name: 'supportCtaHref', label: 'Support CTA Href', type: 'string' },
            ],
          },
          {
            name: 'missionSection',
            label: 'Mission Section',
            type: 'object',
            fields: [
              {
                name: 'mission',
                label: 'Founder Mission Block',
                type: 'object',
                fields: [
                  { name: 'imageAlt', label: 'Founder Image Alt', type: 'string' },
                  { name: 'imagePath', label: 'Founder Image Path', type: 'string' },
                  { name: 'name', label: 'Founder Name', type: 'string' },
                  { name: 'role', label: 'Founder Role', type: 'string' },
                  { name: 'headingLine1', label: 'Heading Line 1', type: 'string' },
                  { name: 'headingLine2', label: 'Heading Line 2', type: 'string' },
                  {
                    name: 'description',
                    label: 'Description',
                    type: 'string',
                    ui: {
                      component: 'textarea',
                    },
                  },
                  { name: 'ctaLabel', label: 'CTA Label', type: 'string' },
                  { name: 'ctaHref', label: 'CTA Href', type: 'string' },
                ],
              },
              {
                name: 'gallery',
                label: 'Seamlessly Connected Block',
                type: 'object',
                fields: [
                  { name: 'headingLine1', label: 'Heading Line 1', type: 'string' },
                  { name: 'headingLine2', label: 'Heading Line 2', type: 'string' },
                  { name: 'ctaLabel', label: 'CTA Label', type: 'string' },
                  { name: 'ctaHref', label: 'CTA Href', type: 'string' },
                  {
                    name: 'images',
                    label: 'Gallery Images',
                    type: 'object',
                    list: true,
                    ui: {
                      itemProps: (item) => ({ label: item?.alt || 'Gallery image' }),
                    },
                    fields: [
                      { name: 'alt', label: 'Image Alt', type: 'string' },
                      { name: 'imagePath', label: 'Image Path', type: 'string' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'newsletterSection',
            label: 'Newsletter Section',
            type: 'object',
            fields: [
              { name: 'backgroundImagePath', label: 'Background Image Path', type: 'string' },
              { name: 'backgroundImageAlt', label: 'Background Image Alt', type: 'string' },
              { name: 'headingLine1', label: 'Heading Line 1', type: 'string' },
              { name: 'headingLine2', label: 'Heading Line 2', type: 'string' },
              {
                name: 'description',
                label: 'Description',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'ctaLabel', label: 'CTA Label', type: 'string' },
              { name: 'ctaHref', label: 'CTA Href', type: 'string' },
            ],
          },
          {
            name: 'footerSection',
            label: 'Footer Section',
            type: 'object',
            fields: [
              { name: 'logoAlt', label: 'Logo Alt', type: 'string' },
              {
                name: 'subscriptionText',
                label: 'Subscription Text',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'emailPlaceholder', label: 'Email Placeholder', type: 'string' },
              { name: 'subscribeLabel', label: 'Subscribe Label', type: 'string' },
              { name: 'followUsLabel', label: 'Follow Us Label', type: 'string' },
              { name: 'supportTitle', label: 'Support Column Title', type: 'string' },
              {
                name: 'supportLinks',
                label: 'Support Links',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.label || 'Support link' }),
                },
                fields: [
                  { name: 'label', label: 'Label', type: 'string' },
                  { name: 'href', label: 'Href', type: 'string' },
                ],
              },
              { name: 'aboutTitle', label: 'About Column Title', type: 'string' },
              {
                name: 'aboutLinks',
                label: 'About Links',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.label || 'About link' }),
                },
                fields: [
                  { name: 'label', label: 'Label', type: 'string' },
                  { name: 'href', label: 'Href', type: 'string' },
                ],
              },
              {
                name: 'legalDisclaimer',
                label: 'Legal Disclaimer',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'cardImageAlt', label: 'Card Image Alt', type: 'string' },
              { name: 'cardDesktopImagePath', label: 'Card Desktop Image Path', type: 'string' },
              { name: 'cardMobileImagePath', label: 'Card Mobile Image Path', type: 'string' },
              {
                name: 'appPrompt',
                label: 'App Prompt',
                type: 'string',
                ui: {
                  component: 'textarea',
                },
              },
              { name: 'appStoreAlt', label: 'App Store Alt', type: 'string' },
              { name: 'appStoreHref', label: 'App Store Href', type: 'string' },
              { name: 'appStoreImagePath', label: 'App Store Image Path', type: 'string' },
              { name: 'googlePlayAlt', label: 'Google Play Alt', type: 'string' },
              { name: 'googlePlayHref', label: 'Google Play Href', type: 'string' },
              { name: 'googlePlayImagePath', label: 'Google Play Image Path', type: 'string' },
              { name: 'copyrightText', label: 'Copyright Text', type: 'string' },
            ],
          },
          {
            name: 'header',
            label: 'Header',
            type: 'object',
            fields: [
              { name: 'whatsAppHref', label: 'WhatsApp Link', type: 'string' },
              { name: 'primaryCtaLabel', label: 'Primary CTA Label', type: 'string' },
              { name: 'secondaryCtaLabel', label: 'Secondary CTA Label', type: 'string' },
              { name: 'secondaryCtaHref', label: 'Secondary CTA Href', type: 'string' },
              {
                name: 'navItems',
                label: 'Navigation Items',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.label || 'Nav Item' }),
                },
                fields: [
                  { name: 'label', label: 'Label', type: 'string' },
                  { name: 'href', label: 'Href', type: 'string' },
                ],
              },
            ],
          },
          {
            name: 'copy',
            label: 'Copy Replacements',
            type: 'object',
            fields: [
              {
                name: 'exactTextReplacements',
                label: 'Exact Replacements',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.from || 'Exact replacement' }),
                },
                fields: [
                  {
                    name: 'from',
                    label: 'From',
                    type: 'string',
                    required: true,
                    ui: {
                      component: 'textarea',
                    },
                  },
                  {
                    name: 'to',
                    label: 'To',
                    type: 'string',
                    required: true,
                    ui: {
                      component: 'textarea',
                    },
                  },
                ],
              },
              {
                name: 'regexTextReplacements',
                label: 'Regex Replacements',
                type: 'object',
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.pattern || 'Regex replacement' }),
                },
                fields: [
                  { name: 'pattern', label: 'Pattern', type: 'string', required: true },
                  { name: 'flags', label: 'Flags', type: 'string' },
                  {
                    name: 'replacement',
                    label: 'Replacement',
                    type: 'string',
                    required: true,
                    ui: {
                      component: 'textarea',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
