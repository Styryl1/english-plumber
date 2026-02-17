// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        label: "Site Content",
        name: "site",
        path: "content/site",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "string",
            name: "businessName",
            label: "Business Name",
            required: true
          },
          {
            type: "string",
            name: "baseCity",
            label: "Base City",
            required: true
          },
          {
            type: "string",
            name: "whatsappNumber",
            label: "WhatsApp Number",
            required: true
          },
          {
            type: "string",
            name: "primaryArea",
            label: "Primary Service Area",
            required: true
          },
          {
            type: "string",
            name: "seoTitle",
            label: "SEO Title",
            required: true
          },
          {
            type: "string",
            name: "seoDescription",
            label: "SEO Description",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "heroImagePath",
            label: "Hero Image Path",
            required: true,
            ui: {
              description: "Keep this as a local /public path, e.g. /IMG_8233.PNG"
            }
          },
          {
            type: "string",
            name: "heroHeading",
            label: "Hero Heading",
            required: true
          },
          {
            type: "string",
            name: "heroHeadingAccent",
            label: "Hero Heading Accent",
            required: true
          },
          {
            type: "string",
            name: "heroSubheading",
            label: "Hero Subheading",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "heroImageAlt",
            label: "Hero Image Alt",
            required: true
          },
          {
            type: "object",
            name: "headerMenu",
            label: "Header Menu",
            list: true,
            fields: [
              {
                type: "string",
                name: "label",
                label: "Label",
                required: true
              },
              {
                type: "string",
                name: "href",
                label: "URL",
                required: true
              }
            ]
          },
          {
            type: "string",
            name: "headerLogoPath",
            label: "Header Logo Path",
            required: true
          },
          {
            type: "string",
            name: "headerLogoAlt",
            label: "Header Logo Alt",
            required: true
          },
          {
            type: "string",
            name: "mobileMenuToggleLabel",
            label: "Mobile Menu Toggle Label",
            required: true
          },
          {
            type: "string",
            name: "headerWhatsappLabel",
            label: "Header WhatsApp Button Label",
            required: true
          },
          {
            type: "string",
            name: "headerWhatsappUrl",
            label: "Header WhatsApp Button URL",
            required: true
          },
          {
            type: "string",
            name: "headerPrimaryCtaLabel",
            label: "Header Primary CTA Label",
            required: true
          },
          {
            type: "string",
            name: "headerPrimaryCtaUrl",
            label: "Header Primary CTA URL",
            required: true
          },
          {
            type: "string",
            name: "heroPrimaryCtaLabel",
            label: "Hero CTA Label",
            required: true
          },
          {
            type: "string",
            name: "heroPrimaryCtaUrl",
            label: "Hero CTA URL",
            required: true
          },
          {
            type: "string",
            name: "autoPilotHeading",
            label: "AutoPilot Heading",
            required: true
          },
          {
            type: "string",
            name: "autoPilotHeadingAccent",
            label: "AutoPilot Heading Accent",
            required: true
          },
          {
            type: "string",
            name: "autoPilotCtaLabel",
            label: "AutoPilot CTA Label",
            required: true
          },
          {
            type: "string",
            name: "autoPilotCtaUrl",
            label: "AutoPilot CTA URL",
            required: true
          },
          {
            type: "object",
            name: "autoPilotChips",
            label: "AutoPilot Chips",
            list: true,
            fields: [
              {
                type: "string",
                name: "label",
                label: "Label",
                required: true
              },
              {
                type: "string",
                name: "iconPath",
                label: "Icon Path",
                required: true
              }
            ]
          },
          {
            type: "string",
            name: "quickFixHeading",
            label: "Quick Fix Heading",
            required: true
          },
          {
            type: "string",
            name: "quickFixHeadingAccent",
            label: "Quick Fix Heading Accent",
            required: true
          },
          {
            type: "string",
            name: "quickFixBody",
            label: "Quick Fix Body",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "quickFixStatOneValue",
            label: "Quick Fix Stat 1 Value",
            required: true
          },
          {
            type: "string",
            name: "quickFixStatOneLabelTop",
            label: "Quick Fix Stat 1 Label (Top)",
            required: true
          },
          {
            type: "string",
            name: "quickFixStatOneLabelBottom",
            label: "Quick Fix Stat 1 Label (Bottom)",
            required: true
          },
          {
            type: "string",
            name: "quickFixStatTwoValue",
            label: "Quick Fix Stat 2 Value",
            required: true
          },
          {
            type: "string",
            name: "quickFixStatTwoLabelTop",
            label: "Quick Fix Stat 2 Label (Top)",
            required: true
          },
          {
            type: "string",
            name: "quickFixStatTwoLabelBottom",
            label: "Quick Fix Stat 2 Label (Bottom)",
            required: true
          },
          {
            type: "object",
            name: "quickFixCards",
            label: "Quick Fix Cards",
            list: true,
            fields: [
              {
                type: "string",
                name: "title",
                label: "Title",
                required: true
              },
              {
                type: "string",
                name: "accent",
                label: "Accent",
                required: true
              },
              {
                type: "string",
                name: "href",
                label: "URL",
                required: true
              },
              {
                type: "string",
                name: "imagePath",
                label: "Image Path",
                required: true
              },
              {
                type: "string",
                name: "linkLabel",
                label: "Link Label",
                required: true
              }
            ]
          },
          {
            type: "string",
            name: "noJargonHeading",
            label: "No Jargon Heading",
            required: true
          },
          {
            type: "string",
            name: "noJargonHeadingAccent",
            label: "No Jargon Heading Accent",
            required: true
          },
          {
            type: "string",
            name: "noJargonBody",
            label: "No Jargon Body",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "noJargonBadgeLabel",
            label: "No Jargon Badge Label",
            required: true
          },
          {
            type: "string",
            name: "noJargonBadgeValue",
            label: "No Jargon Badge Value",
            required: true
          },
          {
            type: "object",
            name: "noJargonCards",
            label: "No Jargon Cards",
            list: true,
            fields: [
              {
                type: "string",
                name: "title",
                label: "Title",
                required: true
              },
              {
                type: "string",
                name: "accent",
                label: "Accent",
                required: true
              },
              {
                type: "string",
                name: "href",
                label: "URL",
                required: true
              },
              {
                type: "string",
                name: "imagePath",
                label: "Image Path",
                required: true
              },
              {
                type: "string",
                name: "linkLabel",
                label: "Link Label",
                required: true
              }
            ]
          },
          {
            type: "string",
            name: "testimonialsHeading",
            label: "Testimonials Heading",
            required: true
          },
          {
            type: "string",
            name: "testimonialsHeadingAccent",
            label: "Testimonials Heading Accent",
            required: true
          },
          {
            type: "object",
            name: "testimonialsList",
            label: "Testimonials",
            list: true,
            fields: [
              {
                type: "string",
                name: "name",
                label: "Name",
                required: true
              },
              {
                type: "string",
                name: "area",
                label: "Area",
                required: true
              },
              {
                type: "string",
                name: "quote",
                label: "Quote",
                required: true,
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "imagePath",
                label: "Image Path",
                required: true
              }
            ]
          },
          {
            type: "string",
            name: "commandCenterHeading",
            label: "Command Center Heading",
            required: true
          },
          {
            type: "string",
            name: "commandCenterHeadingAccent",
            label: "Command Center Heading Accent",
            required: true
          },
          {
            type: "string",
            name: "commandCenterBody",
            label: "Command Center Body",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "commandCenterImagePath",
            label: "Command Center Image Path",
            required: true
          },
          {
            type: "string",
            name: "commandCenterImageAlt",
            label: "Command Center Image Alt",
            required: true
          },
          {
            type: "string",
            name: "howItWorksHeading",
            label: "How It Works Heading",
            required: true
          },
          {
            type: "string",
            name: "howItWorksHeadingAccent",
            label: "How It Works Heading Accent",
            required: true
          },
          {
            type: "string",
            name: "howItWorksImagePath",
            label: "How It Works Image Path",
            required: true
          },
          {
            type: "string",
            name: "howItWorksImageAlt",
            label: "How It Works Image Alt",
            required: true
          },
          {
            type: "object",
            name: "howItWorksSteps",
            label: "How It Works Steps",
            list: true,
            fields: [
              {
                type: "string",
                name: "title",
                label: "Title",
                required: true
              },
              {
                type: "string",
                name: "description",
                label: "Description",
                required: true,
                ui: {
                  component: "textarea"
                }
              }
            ]
          },
          {
            type: "string",
            name: "pricingHeading",
            label: "Pricing Heading",
            required: true
          },
          {
            type: "string",
            name: "pricingSubheading",
            label: "Pricing Subheading",
            required: true
          },
          {
            type: "object",
            name: "pricingPlans",
            label: "Pricing Plans",
            list: true,
            fields: [
              {
                type: "string",
                name: "name",
                label: "Name",
                required: true
              },
              {
                type: "string",
                name: "subtitle",
                label: "Subtitle",
                required: true
              },
              {
                type: "string",
                name: "price",
                label: "Price",
                required: true
              },
              {
                type: "string",
                name: "note",
                label: "Note",
                required: true
              },
              {
                type: "string",
                name: "badge",
                label: "Badge"
              },
              {
                type: "string",
                name: "features",
                label: "Features",
                list: true,
                required: true
              },
              {
                type: "string",
                name: "buttonLabel",
                label: "Button Label",
                required: true
              },
              {
                type: "string",
                name: "buttonUrl",
                label: "Button URL",
                required: true
              }
            ]
          },
          {
            type: "string",
            name: "faqHeading",
            label: "FAQ Heading",
            required: true
          },
          {
            type: "string",
            name: "faqHeadingAccent",
            label: "FAQ Heading Accent",
            required: true
          },
          {
            type: "object",
            name: "faqList",
            label: "FAQ List",
            list: true,
            fields: [
              {
                type: "string",
                name: "question",
                label: "Question",
                required: true
              },
              {
                type: "string",
                name: "answer",
                label: "Answer",
                required: true,
                ui: {
                  component: "textarea"
                }
              }
            ]
          },
          {
            type: "string",
            name: "faqImagePath",
            label: "FAQ Image Path",
            required: true
          },
          {
            type: "string",
            name: "faqImageAlt",
            label: "FAQ Image Alt",
            required: true
          },
          {
            type: "string",
            name: "faqCtaHeading",
            label: "FAQ CTA Heading",
            required: true
          },
          {
            type: "string",
            name: "faqCtaBody",
            label: "FAQ CTA Body",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "faqCtaLabel",
            label: "FAQ CTA Label",
            required: true
          },
          {
            type: "string",
            name: "faqCtaUrl",
            label: "FAQ CTA URL",
            required: true
          },
          {
            type: "string",
            name: "aboutHeading",
            label: "About Heading",
            required: true
          },
          {
            type: "string",
            name: "aboutHeadingAccent",
            label: "About Heading Accent",
            required: true
          },
          {
            type: "string",
            name: "aboutBody",
            label: "About Body",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "aboutImagePath",
            label: "About Image Path",
            required: true
          },
          {
            type: "string",
            name: "aboutImageAlt",
            label: "About Image Alt",
            required: true
          },
          {
            type: "string",
            name: "aboutName",
            label: "About Name",
            required: true
          },
          {
            type: "string",
            name: "aboutRole",
            label: "About Role",
            required: true
          },
          {
            type: "string",
            name: "aboutCtaLabel",
            label: "About CTA Label",
            required: true
          },
          {
            type: "string",
            name: "aboutCtaUrl",
            label: "About CTA URL",
            required: true
          },
          {
            type: "string",
            name: "connectedHeading",
            label: "Connected Heading",
            required: true
          },
          {
            type: "string",
            name: "connectedHeadingAccent",
            label: "Connected Heading Accent",
            required: true
          },
          {
            type: "string",
            name: "connectedCtaLabel",
            label: "Connected CTA Label",
            required: true
          },
          {
            type: "string",
            name: "connectedCtaUrl",
            label: "Connected CTA URL",
            required: true
          },
          {
            type: "string",
            name: "finalCtaImagePath",
            label: "Final CTA Image Path",
            required: true
          },
          {
            type: "string",
            name: "finalCtaImageAlt",
            label: "Final CTA Image Alt",
            required: true
          },
          {
            type: "string",
            name: "finalCtaHeading",
            label: "Final CTA Heading",
            required: true
          },
          {
            type: "string",
            name: "finalCtaHeadingAccent",
            label: "Final CTA Heading Accent",
            required: true
          },
          {
            type: "string",
            name: "finalCtaBody",
            label: "Final CTA Body",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "finalCtaButtonLabel",
            label: "Final CTA Button Label",
            required: true
          },
          {
            type: "string",
            name: "finalCtaButtonUrl",
            label: "Final CTA Button URL",
            required: true
          },
          {
            type: "string",
            name: "footerDescription",
            label: "Footer Description",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "footerSupportTitle",
            label: "Footer Support Title",
            required: true
          },
          {
            type: "object",
            name: "footerSupportLinks",
            label: "Footer Support Links",
            list: true,
            fields: [
              {
                type: "string",
                name: "label",
                label: "Label",
                required: true
              },
              {
                type: "string",
                name: "href",
                label: "URL",
                required: true
              }
            ]
          },
          {
            type: "string",
            name: "footerAboutTitle",
            label: "Footer About Title",
            required: true
          },
          {
            type: "object",
            name: "footerAboutLinks",
            label: "Footer About Links",
            list: true,
            fields: [
              {
                type: "string",
                name: "label",
                label: "Label",
                required: true
              },
              {
                type: "string",
                name: "href",
                label: "URL",
                required: true
              }
            ]
          },
          {
            type: "string",
            name: "footerCopyright",
            label: "Footer Copyright",
            required: true
          },
          {
            type: "string",
            name: "footerNote",
            label: "Footer Note",
            required: true
          },
          {
            type: "string",
            name: "footerLogoPath",
            label: "Footer Logo Path",
            required: true
          },
          {
            type: "string",
            name: "footerLogoAlt",
            label: "Footer Logo Alt",
            required: true
          },
          {
            type: "string",
            name: "footerBigLogoPath",
            label: "Footer Big Logo Path",
            required: true
          },
          {
            type: "string",
            name: "footerBigLogoAlt",
            label: "Footer Big Logo Alt",
            required: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
