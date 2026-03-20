import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-[#F7F5EF] text-[#1C1C1C] font-sans min-h-screen relative">
      {/* NAVBAR */}
      <header className="w-full bg-white border-b border-gray-200/50">
        {/* Top Header Row */}
        <div className="flex justify-between items-center px-8 py-5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-[#1F7A63]/10 flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-[#1F7A63] rounded-full"></div>
            </div>

            {/* Logo Text */}
            <h1
              className="text-4xl text-[#1F7A63] leading-none mb-1"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Shifa
            </h1>
          </div>

          {/* Contact Info (Screenshot Match) */}
          <div className="hidden lg:flex items-center gap-12 text-gray-800">
             <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#54b098]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd"></path></svg>
                <span className="text-[17px] font-medium tracking-wide">support@shifa.ai</span>
             </div>
             <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#54b098]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.036 11.036 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                <span className="text-[17px] font-medium tracking-wide">(+91) 80000 12345</span>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-[#1F7A63] transition-colors uppercase tracking-wide">
              LOGIN
            </Link>
            <Link to="/register" className="border-2 border-[#54b098] text-gray-800 px-8 py-3 rounded-full hover:bg-[#1F7A63] hover:text-white hover:border-[#1F7A63] transition-all text-[15px] font-medium uppercase tracking-wide">
              GET STARTED
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom Nav Row (Sticky) */}
      <div className="sticky top-0 z-50 hidden md:block w-full border-t border-b border-gray-200/40 shadow-sm" style={{ backgroundColor: '#edefef' }}>
        <div className="max-w-7xl mx-auto px-8 py-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
               <div className="flex items-center text-[16px] font-medium w-full">
                  <a href="#" className="py-4 px-8 text-black hover:text-[#1F7A63] transition-colors">Home</a>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <a href="#features" className="py-4 px-8 text-black hover:text-[#1F7A63] transition-colors">Features</a>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <a href="#how" className="py-4 px-8 text-black hover:text-[#1F7A63] transition-colors">How it Works</a>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <Link to="/demo/scenarios" className="py-4 px-8 font-[800] text-gray-800 uppercase hover:text-[#1F7A63] transition-colors">TRY DEMO</Link>

                  <div className="ml-auto flex items-center gap-2 pr-8 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors">
                      <svg className="w-5 h-5 text-[#54b098]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      <span className="text-[15px] font-normal">Search..</span>
                  </div>
               </div>
            </div>
          </div>
      </div>

      {/* HERO */}
      <section className="text-center pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1200px] pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#1F7A63]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-[#1F7A63]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 mb-8 relative z-10 shadow-sm">
          <div className="w-2 h-2 bg-[#1F7A63] rounded-full"></div>
          AI-powered. Built for Bharat.
        </div>

        <h2 className="text-4xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-gray-900 relative z-10">
          Your Health Data Has Answers. <br />
          <span className="mt-2 block">
            <span
              className="text-[#1F7A63] text-5xl md:text-7xl leading-none font-light mr-3"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Shifa
            </span>
            Finds Them.
          </span>
        </h2>
        <p className="mt-8 text-gray-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed relative z-10">
          AI-powered healthcare assistant using RAG to analyze symptoms,
          retrieve patient history, and generate intelligent medical insights.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <Link to="/demo/scenarios" className="bg-[#1F7A63] hover:bg-[#18614f] transition-all text-white px-8 py-3.5 rounded-xl font-medium shadow-lg shadow-[#1F7A63]/30 flex items-center justify-center gap-2">
            Try Interactive Demo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <a href="#how" className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all px-8 py-3.5 rounded-xl text-gray-700 font-medium flex items-center justify-center">
            See How It Works
          </a>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="relative z-10 w-full px-4 sm:px-8">
        <div className="bg-[#1F7A63] text-white py-6 max-w-6xl mx-auto rounded-[40px] shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-10 px-8">
          {[
            { k: "12+", v: "Indian Languages" },
            { k: "<10s", v: "Delivery time" },
            { k: "100%", v: "WhatsApp Native" },
            { k: "24/7", v: "Patient AI Chat" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                {item.k}
              </p>
              <p className="text-xs md:text-sm text-white/80 font-medium uppercase tracking-wider">
                {item.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-8 bg-[#FAF8F3]">
        <p className="text-center text-sm font-bold tracking-[0.2em] text-[#1F7A63] mb-4">
          FEATURES
        </p>

        <h3 className="text-4xl md:text-5xl font-semibold text-center mb-6 text-gray-900 tracking-tight">
          Everything a busy doctor needs
        </h3>

        <p className="text-center text-gray-500 text-lg max-w-2xl mx-auto mb-16 px-4">
          From note entry to patient understanding — Shifa handles the entire
          post-visit communication chain effortlessly.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Instant AI Summary",
              desc: "Doctor jots notes → Shifa converts them into a clear, structured summary in seconds using AI.",
              color: "bg-emerald-100 text-emerald-700",
              icon: "M13 10V3L4 14h7v7l9-11h-7z"
            },
            {
              title: "12+ Indian Languages",
              desc: "Summaries delivered in the patient's native tongue — Hindi, Tamil, Bengali, Marathi and more.",
              color: "bg-blue-100 text-blue-700",
              icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            },
            {
              title: "WhatsApp Delivery",
              desc: "No app install needed. Patient gets a WhatsApp message with a tap-to-open summary link.",
              color: "bg-green-100 text-green-700",
              icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            },
            {
              title: "Patient AI Chat",
              desc: "Patients ask follow-up questions in their language. AI answers using their exact visit context.",
              color: "bg-purple-100 text-purple-700",
              icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            },
            {
              title: "Secure & Private",
              desc: "Token-based patient access. Data encrypted at rest and in transit. Fully compliant by design.",
              color: "bg-orange-100 text-orange-700",
              icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            },
            {
              title: "Blazing Fast",
              desc: "Under 10 seconds from doctor submission to patient WhatsApp delivery.",
              color: "bg-yellow-100 text-yellow-700",
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl mb-6 shadow-sm ${item.color}`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
              </div>

              <h4 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h4>
              <p className="text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-8 bg-white border-t border-gray-100">
        <p className="text-center text-sm font-bold tracking-[0.2em] text-[#1F7A63] mb-4">
          HOW IT WORKS
        </p>

        <h3 className="text-4xl md:text-5xl font-semibold text-center mb-16 text-gray-900 tracking-tight">
          4 steps. Under 30 seconds.
        </h3>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Doctor enters visit notes",
              desc: "Type or dictate the diagnosis, medications, and advice after the consultation.",
            },
            {
              step: "02",
              title: "AI processes instantly",
              desc: "AI extracts key info and generates a clear, patient-friendly summary structure.",
            },
            {
              step: "03",
              title: "Delivered via WhatsApp",
              desc: "Patient receives a rich WhatsApp message link in their preferred language.",
            },
            {
              step: "04",
              title: "Patient chats & understands",
              desc: "Patients read, understand, and can ask Shifa follow-up questions instantly.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#FAF8F3] p-8 rounded-2xl border border-gray-100 flex gap-6 items-start hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#1F7A63] text-white text-lg font-bold shadow-md shadow-[#1F7A63]/20">
                {item.step}
              </div>

              <div>
                <h4 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h4>
                <p className="text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
            <Link to="/demo/scenarios" className="inline-flex items-center gap-2 text-[#1F7A63] font-bold tracking-wide hover:underline px-6 py-3 bg-[#1F7A63]/10 rounded-full hover:bg-[#1F7A63]/20 transition-colors">
                Experience the magic in our Demo Portal &rarr;
            </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-8 bg-[#EAF4F1] border-y border-[#1F7A63]/10">
        <p className="text-center text-sm font-bold tracking-[0.2em] text-[#1F7A63] mb-4">
          TESTIMONIALS
        </p>

        <h3 className="text-4xl md:text-5xl font-semibold text-center mb-16 text-gray-900 tracking-tight">
          Doctors across India love Shifa
        </h3>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              text: "मेरे मरीज अब दवाइयाँ सही तरीके से लेते हैं। शिफा ने हिंदी में सब कुछ समझा दिया।",
              name: "Dr. Priya Sharma",
              role: "General Physician, Jaipur",
            },
            {
              text: "My patients in rural Tamil Nadu can now read their prescriptions clearly. Game changer for adherence.",
              name: "Dr. Karthik Subramanian",
              role: "Family Medicine, Coimbatore",
            },
            {
              text: "Patients used to call me 10 times after a visit. Now Shifa answers their basic questions automatically and accurately.",
              name: "Dr. Anjali Mehta",
              role: "Pediatrician, Pune",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative"
            >
              <div className="absolute top-8 right-8 text-4xl text-gray-200 font-serif leading-none">"</div>
              <div className="flex text-amber-400 mb-6 gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-6 font-medium italic relative z-10">
                "{item.text}"
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="font-bold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500 mt-1">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-8 text-center bg-white">
        <div className="max-w-4xl mx-auto py-16 px-8 rounded-3xl bg-[#1F7A63] text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          
          <h3 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Ready to transform your practice?</h3>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto mb-10 relative z-10">Join forward-thinking doctors across India providing next-level care with AI-powered communication.</p>
          <div className="flex justify-center gap-4 relative z-10">
              <Link to="/register" className="bg-white text-[#1F7A63] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all shadow-lg hover:shadow-xl">
                  Create Free Account
              </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#FAF8F3] px-8 pt-20 pb-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
          {/* LEFT */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#1F7A63]/10 flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#1F7A63] rounded-full"></div>
                </div>
                <h2 className="text-3xl text-[#1F7A63] leading-none mb-1" style={{ fontFamily: "'Great Vibes', cursive" }}>
                Shifa
                </h2>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed w-5/6">
              AI-powered healthcare assistant for modern doctors. Break language barriers instantly.
            </p>
          </div>

          {/* PRODUCT */}
          <div>
            <p className="text-xs font-bold text-gray-900 mb-6 tracking-[0.15em]">PRODUCT</p>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#features" className="hover:text-[#1F7A63] transition-colors">Features</a></li>
              <li><a href="#how" className="hover:text-[#1F7A63] transition-colors">How it Works</a></li>
              <li>
                <Link to="/demo/scenarios" className="hover:text-[#1F7A63] transition-colors flex items-center gap-2">
                    Interactive Demo <span className="bg-[#1F7A63]/10 text-[#1F7A63] text-[10px] px-2 py-0.5 rounded font-bold uppercase">New</span>
                </Link>
              </li>
              <li><Link to="/pricing" className="hover:text-[#1F7A63] transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <p className="text-xs font-bold text-gray-900 mb-6 tracking-[0.15em]">COMPANY</p>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#1F7A63] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#1F7A63] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#1F7A63] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[#1F7A63] transition-colors">Press</a></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <p className="text-xs font-bold text-gray-900 mb-6 tracking-[0.15em]">LEGAL</p>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#1F7A63] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#1F7A63] transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-[#1F7A63] transition-colors">HIPAA & Data Security</a></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="max-w-6xl mx-auto pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2026 Shifa HealthCare Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-6">
              <a href="#" className="hover:text-gray-600 transition-colors">support@shifa.ai</a>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
