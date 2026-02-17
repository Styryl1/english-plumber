import { useEffect } from 'react';
import { tinaField, useTina } from 'tinacms/dist/react';

const SiteContentBridge = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const site = data?.site || {};

  useEffect(() => {
    const fieldMap = {
      businessName: tinaField(site, 'businessName'),
      baseCity: tinaField(site, 'baseCity'),
      whatsappNumber: tinaField(site, 'whatsappNumber'),
      primaryArea: tinaField(site, 'primaryArea'),
      heroHeading: tinaField(site, 'heroHeading'),
      heroHeadingAccent: tinaField(site, 'heroHeadingAccent'),
      heroSubheading: tinaField(site, 'heroSubheading'),
      heroImagePath: tinaField(site, 'heroImagePath'),
      headerMenu: tinaField(site, 'headerMenu'),
      headerWhatsappLabel: tinaField(site, 'headerWhatsappLabel'),
      headerWhatsappUrl: tinaField(site, 'headerWhatsappUrl'),
      headerPrimaryCtaLabel: tinaField(site, 'headerPrimaryCtaLabel'),
      headerPrimaryCtaUrl: tinaField(site, 'headerPrimaryCtaUrl'),
      heroPrimaryCtaLabel: tinaField(site, 'heroPrimaryCtaLabel'),
      heroPrimaryCtaUrl: tinaField(site, 'heroPrimaryCtaUrl'),
      autoPilotHeading: tinaField(site, 'autoPilotHeading'),
      autoPilotHeadingAccent: tinaField(site, 'autoPilotHeadingAccent'),
      autoPilotCtaLabel: tinaField(site, 'autoPilotCtaLabel'),
      autoPilotCtaUrl: tinaField(site, 'autoPilotCtaUrl'),
      autoPilotChips: tinaField(site, 'autoPilotChips'),
      quickFixHeading: tinaField(site, 'quickFixHeading'),
      quickFixHeadingAccent: tinaField(site, 'quickFixHeadingAccent'),
      quickFixBody: tinaField(site, 'quickFixBody'),
      quickFixStatOneValue: tinaField(site, 'quickFixStatOneValue'),
      quickFixStatOneLabelTop: tinaField(site, 'quickFixStatOneLabelTop'),
      quickFixStatOneLabelBottom: tinaField(site, 'quickFixStatOneLabelBottom'),
      quickFixStatTwoValue: tinaField(site, 'quickFixStatTwoValue'),
      quickFixStatTwoLabelTop: tinaField(site, 'quickFixStatTwoLabelTop'),
      quickFixStatTwoLabelBottom: tinaField(site, 'quickFixStatTwoLabelBottom'),
      quickFixCards: tinaField(site, 'quickFixCards'),
    };

    window.__SITE_CONTENT__ = site;
    window.__SITE_TINA_FIELDS__ = fieldMap;

    window.dispatchEvent(
      new CustomEvent('site-content:update', {
        detail: site,
      }),
    );

    window.dispatchEvent(
      new CustomEvent('site-tina-fields:update', {
        detail: fieldMap,
      }),
    );
  }, [site]);

  return null;
};

export default SiteContentBridge;
