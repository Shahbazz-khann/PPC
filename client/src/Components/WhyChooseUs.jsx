import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  UserCheck,
  Cpu,
  Award,
  Phone,
  X,
  CheckCircle2,
  Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WHATSAPP_NUMBER = '03009562656';
const WHATSAPP_INTL = '+92 300 9562656';
const WHATSAPP_CLEAN = '923009562656';

const CALL_NUMBER = '03335373095';
const CALL_INTL = '+92 333 5373095';
const CALL_TEL = '+923335373095';

const getFeatures = (t) => [
  {
    id: 1,
    title: t('public:onePlatform'),
    description: t('public:onePlatformDesc'),
    icon: LayoutGrid,
  },
  {
    id: 2,
    title: t('public:verifiedTeam'),
    description: t('public:verifiedTeamDesc'),
    icon: UserCheck,
  },
  {
    id: 3,
    title: t('public:techDriven'),
    description: t('public:techDrivenDesc'),
    icon: Cpu,
  },
  {
    id: 4,
    title: t('public:customerFirst'),
    description: t('public:customerFirstDesc'),
    icon: Award,
  },
];

const WhyChooseUs = () => {
  const { t } = useTranslation(['public']);
  const features = getFeatures(t);

  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSent, setCallbackSent] = useState(false);

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (!callbackName.trim() || !callbackPhone.trim()) return;

    const message = encodeURIComponent(
      `Hello Pakistan Property Care, my name is ${callbackName.trim()}. Please call me back at ${callbackPhone.trim()} regarding property services.`
    );
    window.open(`https://wa.me/${WHATSAPP_CLEAN}?text=${message}`, '_blank', 'noopener,noreferrer');

    setCallbackSent(true);
    setTimeout(() => {
      setCallbackSent(false);
      setIsCallbackOpen(false);
      setCallbackName('');
      setCallbackPhone('');
    }, 2500);
  };

  const whatsappDefaultUrl = `https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent(
    'Hello Pakistan Property Care, I would like to inquire about your property services.'
  )}`;

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        {/* Left Column */}
        <div>
          <h2 className="text-[#063B29] font-bold text-lg md:text-xl tracking-tight uppercase mb-8">
            {t('public:whyChoosePCP')}
          </h2>

          <div className="space-y-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-[#063B29] flex items-center justify-center shrink-0">
                    <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-[#063B29] stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-sm md:text-base leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (CTA Card) */}
        <div className="bg-[#063B29] text-white rounded-2xl p-6 md:py-8 md:pl-26 md:pr-6 shadow-md relative overflow-hidden">
          <h3 className="text-[#C48C33] font-bold text-lg md:text-xl uppercase tracking-wide leading-snug mb-2">
            {t('public:letsCare')}
            <br />
            {t('public:getStartedToday')}
          </h3>

          <p className="text-emerald-100/90 text-xs md:text-sm mb-6">
            {t('public:talkToExperts')}
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Request a call back button */}
            <button
              type="button"
              onClick={() => setIsCallbackOpen(true)}
              className="bg-[#C48C33] hover:bg-[#b07d2c] text-white font-bold text-xs md:text-sm px-5 py-3 rounded-lg uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm active:scale-95 flex items-center gap-2"
            >
              <Phone size={15} />
              <span>{t('public:requestCallBack')}</span>
            </button>

            {/* WhatsApp us button */}
            <a
              href={whatsappDefaultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#256b45] hover:bg-[#1e5838] border border-white/80 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-lg uppercase tracking-wider flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <svg
                className="w-4 h-4 fill-white shrink-0"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.553 4.11 1.519 5.84L.07 23.518l5.857-1.417A11.936 11.936 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.84 0-3.578-.49-5.088-1.344l-.365-.213-3.473.84.856-3.393-.235-.377C2.753 15.969 2 14.07 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              <span>{t('public:whatsappUs')}</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <span className="text-emerald-100/80 text-xs md:text-sm font-medium">
              {t('public:orCallUsNow')}
            </span>
            <div className="flex flex-col gap-1">
              {/* Call Number 03335373095 */}
              <a
                href={`tel:${CALL_TEL}`}
                className="text-white hover:text-[#C48C33] font-bold text-base md:text-lg tracking-wide transition-colors inline-flex items-center gap-2 cursor-pointer"
                title={`Call ${CALL_INTL}`}
              >
                <Phone size={15} className="text-[#C48C33] shrink-0" />
                <span>{CALL_INTL}</span>
              </a>

              {/* WhatsApp Number 03009562656 */}
              <a
                href={whatsappDefaultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#25D366] font-bold text-sm md:text-base tracking-wide transition-colors inline-flex items-center gap-2 cursor-pointer"
                title={`WhatsApp ${WHATSAPP_INTL}`}
              >
                <svg
                  className="w-3.5 h-3.5 fill-[#25D366] shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.553 4.11 1.519 5.84L.07 23.518l5.857-1.417A11.936 11.936 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.84 0-3.578-.49-5.088-1.344l-.365-.213-3.473.84.856-3.393-.235-.377C2.753 15.969 2 14.07 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                <span>
                  {WHATSAPP_INTL}{' '}
                  <span className="text-[11px] font-semibold text-emerald-200/90 lowercase tracking-normal">
                    (whatsapp)
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Call Back Request Modal ── */}
      {isCallbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-gray-800">
            <button
              type="button"
              onClick={() => {
                setIsCallbackOpen(false);
                setCallbackSent(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {callbackSent ? (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#063B29] mb-1">
                  Request Initiated!
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-xs">
                  Opening WhatsApp to deliver your call back request directly to our property experts.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[#063B29] mb-1">
                    Request a Call Back
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Leave your contact details and a property care expert will reach out to you shortly.
                  </p>
                </div>

                <form onSubmit={handleCallbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Capt. Mubashir"
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#063B29] focus:ring-1 focus:ring-[#063B29] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0333 5373095"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#063B29] focus:ring-1 focus:ring-[#063B29] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#C48C33] hover:bg-[#af7b29] text-white font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Send size={15} />
                    <span>Send Call Back Request</span>
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                  <span>Need instant help?</span>
                  <a
                    href={`tel:${CALL_TEL}`}
                    className="font-bold text-[#063B29] hover:underline inline-flex items-center gap-1"
                  >
                    <Phone size={13} /> Call {CALL_INTL}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default WhyChooseUs;
