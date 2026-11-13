import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Award, Building2, CheckCircle2,
  ArrowRight, Phone, Mail, Clock, ChevronDown, ChevronUp,
  Sparkles, Users, Eye
} from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import LillaHero from '../assets/tilla.webp';
import PropertyCareImg from '../assets/PropertyCare.webp';

/* ─── Core Values ─────────────────────────────────────────────── */
const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Complete Transparency',
    desc: 'No hidden charges or undocumented dealings. Every transaction, repair, and lease is backed by clear documentation.',
  },
  {
    icon: Users,
    title: 'Overseas & Local Care',
    desc: 'Dedicated relationship managers handle all on-ground matters so overseas owners never have to worry.',
  },
  {
    icon: Building2,
    title: 'Certified Technical Team',
    desc: 'Professional civil engineers, inspectors, and legal advocates ensure your property is structurally and legally secure.',
  },
  {
    icon: Sparkles,
    title: 'Proactive Asset Growth',
    desc: 'Preventative maintenance and market insights that protect your property and maximize long-term capital value.',
  },
];

/* ─── FAQs ────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'Can Pakistan Property Care manage my property if I live abroad?',
    a: 'Yes. Most of our clients are overseas Pakistanis living in the UK, USA, UAE, Canada, and Europe. We manage tenant placement, maintenance, bill payments, and legal vetting with complete digital reporting.',
  },
  {
    q: 'How are tenant verification and rent payments handled?',
    a: 'We conduct full biometric CNIC verification, employment screening, and formal lease agreements. Rental proceeds are collected on a strict timeline and deposited directly into your designated bank account.',
  },
  {
    q: 'Which cities and societies do you cover?',
    a: 'We operate across Islamabad, Rawalpindi, and Lahore, covering CDA sectors, DHA, Bahria Town, Gulberg, and all major authorized housing societies.',
  },
  {
    q: 'How do you handle maintenance and repair costs?',
    a: 'For any maintenance, you receive photographic inspection reports with itemized quotes from vetted contractors for your prior approval before any work begins.',
  },
];

/* ─── Component ───────────────────────────────────────────────── */
const About = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FBFBFA] text-[#1a2b25]">

      {/* ══════════════════════════════════════════════════════════
          HERO — Natural Villa Image with Floating Navbar Only
          (No dark overlay, no text on image)
      ══════════════════════════════════════════════════════════ */}
      <section className="relative h-[380px] sm:h-[460px] md:h-[540px] lg:h-[540px] w-full overflow-hidden">
        {/* Natural Background Image without any dark overlay, anchored from the top */}
        <img
          src={LillaHero}
          alt="Pakistan Property Care"
          className="absolute inset-0 w-full h-full object-cover object-top z-0"
        />

        {/* Floating Navbar */}
        <div className="relative z-20">
          <Navbar />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          INTRODUCTION HEADER
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pt-2 pb-4 text-center">
        <div className="inline-flex items-center gap-2 text-[#063B29] font-bold text-xs uppercase tracking-[0.25em] mb-3">
          <span className="w-6 h-[2px] bg-[#C48C33]" />
          About Us
          <span className="w-6 h-[2px] bg-[#C48C33]" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#063B29] tracking-tight mb-4 leading-tight">
          Pakistan's Most Trusted <br />
          <span className="text-[#C48C33]">Property Care</span> 
        </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          We protect, manage, and care for residential and commercial real estate across Pakistan with certified integrity, legal precision, and complete transparency.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 mb-4 w-full">
        <div className="bg-[#063B29] text-white rounded-2xl md:rounded-3xl p-8 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#C48C33]">500+</p>
            <p className="text-xs uppercase tracking-wider text-emerald-100/80 mt-1 font-semibold">Properties Managed</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#C48C33]">1,200+</p>
            <p className="text-xs uppercase tracking-wider text-emerald-100/80 mt-1 font-semibold">Satisfied Clients</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#C48C33]">8+ Years</p>
            <p className="text-xs uppercase tracking-wider text-emerald-100/80 mt-1 font-semibold">Proven Track Record</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#C48C33]">100%</p>
            <p className="text-xs uppercase tracking-wider text-emerald-100/80 mt-1 font-semibold">Legal Due Diligence</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHO WE ARE (Story + Details)
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 mb-4 w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            
            {/* Story text */}
            <div>
              <span className="text-[#C48C33] font-bold text-xs uppercase tracking-widest block mb-2">
                Our Story & Mission
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B29] mb-4 leading-snug">
                Dedicated Stewardship for Your Real Estate
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Pakistan Property Care was established to eliminate the anxiety and risks often associated with owning property in Pakistan. We act as your on-ground representatives, ensuring that your home, villa, or commercial building receives the same care and attention as if you were managing it yourself.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                From title verification and tenant screening to routine inspections and preventative maintenance, our professional team handles every aspect of property custody with rigorous standards.
              </p>

              {/* Checklist */}
              <div className="space-y-3 mb-8">
                {[
                  'Complete title verification with local authorities (CDA, RDA, LDA, DHA)',
                  'Thorough tenant background checks and registered lease agreements',
                  'Scheduled photographic property inspection reports',
                  'Guaranteed on-time rent collection and direct bank transfers',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={17} className="text-[#063B29] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#063B29] hover:bg-[#0a5a3d] text-white font-bold text-xs sm:text-sm tracking-wide uppercase px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Contact Us <ArrowRight size={15} />
              </Link>
            </div>

            {/* Visual Box */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
                <img
                  src={PropertyCareImg}
                  alt="Property Care Management"
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="mt-4 p-5 rounded-2xl bg-[#063B29]/5 border border-[#063B29]/10 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#063B29] text-white flex items-center justify-center shrink-0">
                  <Award size={22} className="text-[#C48C33]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#063B29]">Quality Guarantee</p>
                  <p className="text-xs text-gray-600 mt-0.5">Every property receives certified inspection and verified documentation.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CORE VALUES
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#f2efe9] py-12 border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[#C48C33] font-bold text-xs uppercase tracking-[0.2em] block mb-2">
              Our Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B29] tracking-tight">
              Why Property Owners Trust Us
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-2">
              Built on transparency, responsiveness, and genuine care for your investment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((val, idx) => {
              const IconComp = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#063B29]/10 text-[#063B29] flex items-center justify-center mb-4">
                    <IconComp size={20} />
                  </div>
                  <h3 className="text-base font-bold text-[#063B29] mb-2">{val.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{val.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SIMPLE ACCORDION FAQS
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="text-center max-w-lg mx-auto mb-12">
          <span className="text-[#C48C33] font-bold text-xs uppercase tracking-[0.2em] block mb-2">
            Questions & Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B29] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-bold text-sm text-[#063B29] hover:bg-gray-50 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="shrink-0 text-[#C48C33]">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-[#FBFBFA]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SIMPLE CTA BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#063B29] text-white py-14 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Ready to Protect Your <span className="text-[#C48C33]">Property?</span>
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            Get in touch with our team today to discuss property management, inspections, or legal verification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="bg-[#C48C33] hover:bg-[#b07d2c] text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all shadow-md"
            >
              Contact Us
            </Link>
            <a
              href="tel:+923335373095"
              className="border border-white/30 hover:border-white text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Phone size={15} /> +92 333 5373095
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-100/70">
            <span className="flex items-center gap-1.5"><Mail size={13} className="text-[#C48C33]" /> info@ppc.com.pk</span>
            <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#C48C33]" /> Mon – Sat: 9:00 AM – 6:00 PM</span>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default About;
