import React, { useState } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle2, Mail, Phone } from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import HeroBg from '../assets/newlilla.png';

/* ─── Component ───────────────────────────────────────────────── */
const Contact = () => {
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const errors = {
    firstName: !form.firstName.trim() ? 'Full name is required.' : '',
    email: !form.email.trim()
      ? 'Email is required.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? 'Please enter a valid email.'
      : '',
    message: !form.message.trim() ? 'Message cannot be empty.' : '',
  };

  const isValid = !errors.firstName && !errors.email && !errors.message;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ firstName: true, email: true, message: true });
    if (!isValid) return;

    setStatus('sending');

    const subject = encodeURIComponent('[PPC] Contact Form Enquiry');
    const body = encodeURIComponent(
      `Name: ${form.firstName}\n` +
      `Email: ${form.email}\n` +
      (form.phone ? `Phone: ${form.phone}\n` : '') +
      `Message:\n${form.message}`
    );
    const mailto = `mailto:info@ppc.com.pk?subject=${subject}&body=${body}`;

    setTimeout(() => {
      window.location.href = mailto;
      setStatus('success');
      setForm({ firstName: '', email: '', phone: '', message: '' });
      setTouched({});
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">

      {/* ── Hero Section — Full Viewport with Mosque BG + Floating Navbar ── */}
      <section className="relative min-h-screen flex flex-col">

        {/* Background Image */}
        <img
          src={HeroBg}
          alt="Contact Us Background"
          className="absolute inset-0 w-full h-full object-cover object-left z-0"
        />

        {/* ── Floating Navbar — sits on top of image ── */}
        <div className="relative z-20">
          <Navbar />
        </div>

        {/* ── Content Grid ──────────────────────────────────────── */}
        <div className="relative z-10 flex-1 w-full px-4 sm:px-8 md:pr-12 lg:pr-16 xl:pr-24 py-12 md:py-16 flex items-center justify-end">
          <div className="w-full max-w-md bg-white/25 backdrop-blur-md border border-white/40 rounded-3xl shadow-2xl p-7 md:p-9">

              {/* Form Header */}
              <div className="mb-7">
                <h2 className="text-2xl font-extrabold text-[#063B29] drop-shadow-sm">Send us a Message</h2>
                <p className="text-gray-700 text-sm mt-1.5 font-medium">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {/* Success Banner */}
              {status === 'success' && (
                <div className="mb-5 p-4 bg-emerald-50/90 backdrop-blur-sm border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-semibold">
                  <CheckCircle2 size={18} className="shrink-0" />
                  Message sent! Your email client has opened with details pre-filled.
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">

                {/* Row 1 — Full Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 transition-all bg-white/40 backdrop-blur-sm ${
                      touched.firstName && errors.firstName
                        ? 'border-red-400 bg-red-50/70 focus-within:ring-2 focus-within:ring-red-200'
                        : 'border-white/60 focus-within:border-[#063B29] focus-within:bg-white/60 focus-within:ring-2 focus-within:ring-[#063B29]/15'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 shrink-0"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      <input
                        name="firstName"
                        type="text"
                        value={form.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Full Name *"
                        className="flex-1 text-sm font-medium text-gray-900 bg-transparent outline-none placeholder-gray-600"
                      />
                    </div>
                    {touched.firstName && errors.firstName && (
                      <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 transition-all bg-white/40 backdrop-blur-sm ${
                      touched.email && errors.email
                        ? 'border-red-400 bg-red-50/70 focus-within:ring-2 focus-within:ring-red-200'
                        : 'border-white/60 focus-within:border-[#063B29] focus-within:bg-white/60 focus-within:ring-2 focus-within:ring-[#063B29]/15'
                    }`}>
                      <Mail size={15} className="text-gray-600 shrink-0" />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Email Address *"
                        className="flex-1 text-sm font-medium text-gray-900 bg-transparent outline-none placeholder-gray-600"
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2 — Phone (full width) */}
                <div className="flex items-center gap-2.5 border border-white/60 bg-white/40 backdrop-blur-sm rounded-xl px-4 py-3 focus-within:border-[#063B29] focus-within:bg-white/60 focus-within:ring-2 focus-within:ring-[#063B29]/15 transition-all">
                  <Phone size={15} className="text-gray-600 shrink-0" />
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number *"
                    className="flex-1 text-sm font-medium text-gray-900 bg-transparent outline-none placeholder-gray-600"
                  />
                </div>

                {/* Row 3 — Message */}
                <div>
                  <div className={`flex gap-2.5 border rounded-xl px-4 py-3 transition-all bg-white/40 backdrop-blur-sm ${
                    touched.message && errors.message
                      ? 'border-red-400 bg-red-50/70 focus-within:ring-2 focus-within:ring-red-200'
                      : 'border-white/60 focus-within:border-[#063B29] focus-within:bg-white/60 focus-within:ring-2 focus-within:ring-[#063B29]/15'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 shrink-0 mt-0.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <textarea
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Your Message *"
                      className="flex-1 text-sm font-medium text-gray-900 bg-transparent outline-none placeholder-gray-600 resize-none"
                    />
                  </div>
                  {touched.message && errors.message && (
                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#063B29] hover:bg-[#0a5a3d] disabled:opacity-60 text-white font-bold text-sm tracking-wide py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Opening Email Client…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>

              </form>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default Contact;
