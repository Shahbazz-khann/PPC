import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';
import LogoS from '../assets/Footery.png';
// import LogoS from '../assets/IMAGEEEEEEEEEEEEEEEEEEEE.png';
import { useTranslation } from 'react-i18next';


const getCompanyLinks = (t) => [
  { label: t('public:aboutUsFooter'), href: '#' },
  { label: t('public:careers'), href: '#' },
  { label: t('public:ourTeam'), href: '#' },
  { label: t('public:blog'), href: '#' },
  { label: t('public:newsMedia'), href: '#' },
];

const getServiceLinks = (t) => [
  { label: t('public:allServices'), href: '#' },
  { label: t('public:propertyCareFooter'), href: '#' },
  { label: t('public:renovation'), href: '#' },
  { label: t('public:legalServices'), href: '#' },
  { label: t('public:investmentAdvisoryFooter'), href: '#' },
];

const getResourceLinks = (t) => [
  { label: t('public:propertyGuide'), href: '#' },
  { label: t('public:marketInsights'), href: '#' },
  { label: t('public:faqs'), href: '#' },
  { label: t('public:videos'), href: '#' },
  { label: t('public:downloads'), href: '#' },
];

const getContactInfo = (t) => [
  t('public:headOffice'),
  'info@propertycare.pk',
  '051-111-CARE-111',
  'www.propertycare.pk',
];

const socialLinks = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

const Footer = () => {
  const { t } = useTranslation(['public']);
  
  const companyLinks = getCompanyLinks(t);
  const serviceLinks = getServiceLinks(t);
  const resourceLinks = getResourceLinks(t);
  const contactInfo = getContactInfo(t);

  return (
    <footer className="w-full bg-[#063B29] text-white pt-10 pb-6 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-10">
          {/* Column 1: Logo */}
          <div className="lg:col-span-1 flex flex-col justify-start">
            <img
              src={LogoS}
              alt="Property Care Pakistan"
              className="h-24 md:h-32 w-auto object-contain self-start"
            />
            {/* <p className="text-[#C48C33] text-xs font-semibold tracking-wide">
              Your Property, Our Priority
            </p> */}
          </div>

          {/* Column 2: Company */}
          <div>
            <h3 className="font-bold text-xs md:text-sm tracking-wider uppercase mb-4 text-white">
              {t('public:company')}
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-emerald-100/80 text-xs md:text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="font-bold text-xs md:text-sm tracking-wider uppercase mb-4 text-white">
              {t('public:servicesFooter')}
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-emerald-100/80 text-xs md:text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h3 className="font-bold text-xs md:text-sm tracking-wider uppercase mb-4 text-white">
              {t('public:resourcesFooter')}
            </h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-emerald-100/80 text-xs md:text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div>
            <h3 className="font-bold text-xs md:text-sm tracking-wider uppercase mb-4 text-white">
              {t('public:contactUsFooter')}
            </h3>
            <ul className="space-y-2.5">
              {contactInfo.map((info, idx) => (
                <li key={idx} className="text-emerald-100/80 text-xs md:text-sm">
                  {info}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 6: Follow Us */}
          <div>
            <h3 className="font-bold text-xs md:text-sm tracking-wider uppercase mb-4 text-white">
              {t('public:followUs')}
            </h3>
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-[#084833] flex items-center justify-center text-white"
                  >
                    <IconComponent className="w-4 h-4 fill-white stroke-none" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-emerald-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-100/70">
          <p>{t('public:copyright')}</p>
          <div className="flex items-center gap-3">
            <a href="#">{t('public:privacyPolicy')}</a>
            <span>|</span>
            <a href="#">{t('public:termsConditions')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
