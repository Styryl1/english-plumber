import { defineConfig } from 'tinacms';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
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
        label: 'Site Content',
        name: 'site',
        path: 'content/site',
        format: 'json',
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: 'string',
            name: 'businessName',
            label: 'Business Name',
            required: true,
          },
          {
            type: 'string',
            name: 'baseCity',
            label: 'Base City',
            required: true,
          },
          {
            type: 'string',
            name: 'whatsappNumber',
            label: 'WhatsApp Number',
            required: true,
          },
          {
            type: 'string',
            name: 'primaryArea',
            label: 'Primary Service Area',
            required: true,
          },
          {
            type: 'string',
            name: 'heroImagePath',
            label: 'Hero Image Path',
            required: true,
            ui: {
              description: 'Keep this as a local /public path, e.g. /IMG_8233.PNG',
            },
          },
          {
            type: 'string',
            name: 'heroHeading',
            label: 'Hero Heading',
            required: true,
          },
          {
            type: 'string',
            name: 'heroHeadingAccent',
            label: 'Hero Heading Accent',
            required: true,
          },
          {
            type: 'string',
            name: 'heroSubheading',
            label: 'Hero Subheading',
            required: true,
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'object',
            name: 'headerMenu',
            label: 'Header Menu',
            list: true,
            fields: [
              {
                type: 'string',
                name: 'label',
                label: 'Label',
                required: true,
              },
              {
                type: 'string',
                name: 'href',
                label: 'URL',
                required: true,
              },
            ],
          },
          {
            type: 'string',
            name: 'headerWhatsappLabel',
            label: 'Header WhatsApp Button Label',
            required: true,
          },
          {
            type: 'string',
            name: 'headerWhatsappUrl',
            label: 'Header WhatsApp Button URL',
            required: true,
          },
          {
            type: 'string',
            name: 'headerPrimaryCtaLabel',
            label: 'Header Primary CTA Label',
            required: true,
          },
          {
            type: 'string',
            name: 'headerPrimaryCtaUrl',
            label: 'Header Primary CTA URL',
            required: true,
          },
          {
            type: 'string',
            name: 'heroPrimaryCtaLabel',
            label: 'Hero CTA Label',
            required: true,
          },
          {
            type: 'string',
            name: 'heroPrimaryCtaUrl',
            label: 'Hero CTA URL',
            required: true,
          },
          {
            type: 'string',
            name: 'autoPilotHeading',
            label: 'AutoPilot Heading',
            required: true,
          },
          {
            type: 'string',
            name: 'autoPilotHeadingAccent',
            label: 'AutoPilot Heading Accent',
            required: true,
          },
          {
            type: 'string',
            name: 'autoPilotCtaLabel',
            label: 'AutoPilot CTA Label',
            required: true,
          },
          {
            type: 'string',
            name: 'autoPilotCtaUrl',
            label: 'AutoPilot CTA URL',
            required: true,
          },
          {
            type: 'object',
            name: 'autoPilotChips',
            label: 'AutoPilot Chips',
            list: true,
            fields: [
              {
                type: 'string',
                name: 'label',
                label: 'Label',
                required: true,
              },
              {
                type: 'string',
                name: 'iconPath',
                label: 'Icon Path',
                required: true,
              },
            ],
          },
        ],
      },
    ],
  },
});
