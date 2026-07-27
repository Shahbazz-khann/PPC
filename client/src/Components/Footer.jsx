import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';
import LogoS from '../assets/LogoS.png';

const companyLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Our Team', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'News & Media', href: '#' },
];

const serviceLinks = [
  { label: 'All Services', href: '#' },
  { label: 'Property Care', href: '#' },
  { label: 'Renovation', href: '#' },
  { label: 'Legal Services', href: '#' },
  { label: 'Investment Advisory', href: '#' },
];

const resourceLinks = [
  { label: 'Property Guide', href: '#' },
  { label: 'Market Insights', href: '#' },
  { label: 'FAQs', href: '#' },
  { label: 'Videos', href: '#' },
  { label: 'Downloads', href: '#' },
];

const contactInfo = [
  'Head Office, Islamabad',
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
              COMPANY
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
              SERVICES
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
              RESOURCES
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
              CONTACT US
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
              FOLLOW US
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
          <p>© 2025 Property Care Pakistan. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <a href="#">Privacy Policy</a>
            <span>|</span>
            <a href="#">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
