import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English
import enCommon from '../locales/en/common.json';
import enPublic from '../locales/en/public.json';
import enDashboard from '../locales/en/dashboard.json';
import enProperties from '../locales/en/properties.json';
import enPropertyDetails from '../locales/en/propertyDetails.json';
import enRequests from '../locales/en/requests.json';
import enVisits from '../locales/en/visits.json';
import enInspectionReports from '../locales/en/inspectionReports.json';
import enVerificationReports from '../locales/en/verificationReports.json';
import enProfile from '../locales/en/profile.json';

// Urdu
import urCommon from '../locales/ur/common.json';
import urPublic from '../locales/ur/public.json';
import urDashboard from '../locales/ur/dashboard.json';
import urProperties from '../locales/ur/properties.json';
import urPropertyDetails from '../locales/ur/propertyDetails.json';
import urRequests from '../locales/ur/requests.json';
import urVisits from '../locales/ur/visits.json';
import urInspectionReports from '../locales/ur/inspectionReports.json';
import urVerificationReports from '../locales/ur/verificationReports.json';
import urProfile from '../locales/ur/profile.json';

const resources = {
  en: {
    common: enCommon,
    public: enPublic,
    dashboard: enDashboard,
    properties: enProperties,
    propertyDetails: enPropertyDetails,
    requests: enRequests,
    visits: enVisits,
    inspectionReports: enInspectionReports,
    verificationReports: enVerificationReports,
    profile: enProfile
  },
  ur: {
    common: urCommon,
    public: urPublic,
    dashboard: urDashboard,
    properties: urProperties,
    propertyDetails: urPropertyDetails,
    requests: urRequests,
    visits: urVisits,
    inspectionReports: urInspectionReports,
    verificationReports: urVerificationReports,
    profile: urProfile
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['common', 'public', 'dashboard', 'properties', 'propertyDetails', 'requests', 'visits', 'inspectionReports', 'verificationReports', 'profile'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'ppc-language',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Handle RTL/LTR document direction
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ur' ? 'rtl' : 'ltr';
});

// Run once on load
const currentLng = window.localStorage.getItem('ppc-language') || i18n.language || 'en';
document.documentElement.lang = currentLng;
document.documentElement.dir = currentLng === 'ur' ? 'rtl' : 'ltr';

export default i18n;
