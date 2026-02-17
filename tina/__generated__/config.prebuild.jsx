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
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
