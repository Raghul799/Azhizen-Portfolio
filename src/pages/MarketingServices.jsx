import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Palette, Smartphone, Check, Loader2 } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { marketingServices } from '../data/marketingServicesNew';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, push, set } from "firebase/database";
import { db, realtimeDb } from "../components/firebase";
// Trigger rebuild with cache-bypassed data source

// Standard up-right arrow icon
const ArrowUpRight = ({ className = "w-[16px] h-[16px]" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="square"
    strokeLinejoin="miter"
  >
    <polyline points="11 6 18 6 18 13" />
    <polyline points="6 11 13 11 13 18" />
  </svg>
);

// Reusable Floating Badge component with custom delay/duration for organic movement
const FloatingBadge = ({ children, className, delay = 0, duration = 3 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -8, 0] }}
    transition={{
      duration: duration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay: delay
    }}
  >
    {children}
  </motion.div>
);

const MarketingServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCard, setActiveCard] = useState(1);

  // Mobile Auto-scrolling carousel effect (cycles active card every 3s)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeCard]);

  // 3D Carousel positions for mobile view (returns matching translate, scale, zIndex, rotate, and opacity)
  const getCardStyles = (cardIndex) => {
    let position = 0; // 0: Center, -1: Left, 1: Right
    if (activeCard === cardIndex) {
      position = 0;
    } else if (
      (activeCard === 0 && cardIndex === 2) || 
      (activeCard === 1 && cardIndex === 0) || 
      (activeCard === 2 && cardIndex === 1)
    ) {
      position = -1;
    } else {
      position = 1;
    }

    return {
      x: position === 0 ? 0 : position === -1 ? -95 : 95,
      y: position === 0 ? -15 : 15,
      scale: position === 0 ? 1 : 0.82,
      zIndex: position === 0 ? 40 : 20,
      rotate: position === 0 ? 0 : position === -1 ? -8 : 8,
      opacity: position === 0 ? 1 : 0.85,
    };
  };

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getGridCardVariants = (index) => ({
    hidden: isMobile
      ? { opacity: 0, x: index % 2 === 0 ? -100 : 100 }
      : { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: isMobile
        ? { duration: 0.6, ease: "easeOut" }
        : { duration: 0.6, ease: "easeOut", delay: index * 0.1 }
    }
  });

  const handleApplyClick = (service) => {
    setSelectedService(service);
    setIsSubmitted(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceData = {
        serviceCategory: "Digital Marketing",
        selectedService: selectedService?.title || "",
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        details: formData.message || "",
        timestamp: Timestamp.now(),
      };

      // Primary write: Cloud Firestore 'Service' collection
      await addDoc(collection(db, "Service"), serviceData);

      // Secondary write: Realtime Database 'Service' node
      try {
        await set(push(ref(realtimeDb, "Service")), {
          ...serviceData,
          timestamp: Date.now(),
        });
      } catch (rtdbErr) {
        console.warn("Realtime Database permission notice:", rtdbErr.message);
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setSelectedService(null);
        setIsSubmitted(false);
      }, 2500);
    } catch (err) {
      console.error("Firebase Marketing Service submission error:", err);
      alert("Failed to submit consultation request. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcademyClick = () => {
    const el = document.getElementById("services-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Entrance animations definition
  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const cardsContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="font-poppins bg-white w-full min-h-screen overflow-x-hidden">
      
      {/* ── HERO SECTION ── */}
      <div
        className="relative w-full bg-cover bg-center bg-no-repeat overflow-visible pt-[96px] pb-[100px] lg:pb-[230px]"
        style={{
          backgroundImage: "url('/093d9e168be8563656ac2661688920c1fda133cf.png')",
        }}
      >
        {/* ── Title — centered, white ── */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-6 pt-8 pb-5"
        >
          <h1
            style={{ color: '#ffffff' }}
            className="font-poppins font-extrabold text-[28px] sm:text-[38px] lg:text-[44px] leading-tight max-w-[820px] mx-auto"
          >
            Next-Gen Digital Marketing<br />by Azhizen Media
          </h1>
        </motion.div>

        {/* ── THREE-COLUMN LAYOUT (matches Figma exactly) ── */}
        {/*
            LEFT  col : image card  (top = same level as button)
            CENTER col: [button] then [center white card below]
            RIGHT  col: [Logo badge] then [right white card below] then [Mobile badge]
        */}
        {/* Desktop View (Three Columns) */}
        <motion.div
          variants={cardsContainerVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex lg:flex-row items-start justify-center gap-10 pb-4 z-20 relative w-full max-w-[1200px] mx-auto px-6"
        >

          {/* ══ LEFT COLUMN : Image Card + badges below ══ */}
          <div className="flex flex-col self-center lg:self-start order-2 lg:order-1 overflow-visible">

            {/* Image card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="relative w-[260px] h-[260px] shrink-0"
            >
              <img
                src="/63f3b2d49cbe4d045aafdb6f4177d911f7ed72ff.png"
                alt="What We Do — Azhizen"
                className="w-full h-full object-cover rounded-[20px] shadow-[6px_8px_20px_rgba(0,0,0,0.25)]"
              />
            </motion.div>

            {/* Website Development badge — below card, shifted slightly left */}
            <FloatingBadge
              delay={0.2}
              duration={3.2}
              className="mt-3 -ml-4 flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-[6px_8px_12px_rgba(0,0,0,0.18)]"
            >
              <img
                src="/a0ca5728adf4f3483881e71386b34061c9289922.png"
                alt="Website Development"
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="text-slate-800 font-poppins font-medium text-[12.5px] whitespace-nowrap">
                Website Development
              </span>
            </FloatingBadge>

            {/* UI/UX Design badge — below Website Dev, shifted right */}
            <FloatingBadge
              delay={0.6}
              duration={3.6}
              className="mt-2 ml-[35px] flex items-center gap-2 bg-white pl-2 pr-3 py-1.5 rounded-xl shadow-[6px_8px_12px_rgba(0,0,0,0.18)]"
            >
              <img
                src="/9795a08d13bc8ef72ac67ba281e7618cf4319f00.png"
                alt="UI/UX Design"
                className="w-7 h-7 object-contain rounded-md shrink-0"
              />
              <span className="text-slate-800 font-poppins font-semibold text-[12.5px] whitespace-nowrap">
                UI/UX Design
              </span>
            </FloatingBadge>
          </div>

          {/* ══ CENTER COLUMN : Button → Center Card ══ */}
          <div className="flex flex-col items-center shrink-0 order-1 lg:order-2 self-center lg:self-start">

            {/* Explore Button — sits above center card */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAcademyClick}
              className="bg-[#1877F2] hover:bg-[#1565C0] text-white font-poppins font-semibold text-[15px] px-6 py-3 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer border-none mb-5 shadow-[0_4px_14px_rgba(24,119,242,0.35)]"
              style={{ color: '#ffffff', backgroundColor: '#1877F2' }}
            >
              Explore Azhizen Acedemy <ArrowUpRight />
            </motion.button>

            {/* Center white card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="relative w-[300px] bg-gradient-to-b from-slate-100 to-white rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,.15)] p-6 flex flex-col z-20"
              style={{ minHeight: '390px' }}
            >
              {/* Azhizen Media badge inside the card top (static, no floating animation) */}
              <div
                className="self-center flex items-center bg-white px-5 py-2 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] mb-3"
              >
                <span style={{ color: '#050505' }} className="font-poppins font-semibold text-[14px]">
                  Azhizen Media
                </span>
              </div>

              <h3 style={{ color: '#000000' }} className="font-poppins font-semibold text-[24px] mt-2 leading-tight">
                Providing 10+<br />Marketing Service
              </h3>

              <div className="flex items-start gap-3 mt-3 mb-4">
                <Check className="w-7 h-7 text-[#1877F2] shrink-0 mt-0.5 stroke-[3]" />
                <span className="text-[16px] text-[#000000] font-poppins font-medium leading-relaxed">
                  grow your business<br />
                  through Digital platform<br />
                  to get Sucess
                </span>
              </div>

              <div className="w-full mt-auto">
                <img
                  src="/Frame 1268.png"
                  alt="Digital Marketing Preview"
                  className="w-full h-auto object-cover rounded-xl"
                />
              </div>
            </motion.div>
          </div>

          {/* ══ RIGHT COLUMN : Logo Badge → Right Card → Mobile Badge ══ */}
          <div className="flex flex-col items-start shrink-0 order-3 self-center lg:self-start">

            {/* Logo And Poster Design badge — ABOVE right card */}
            <FloatingBadge
              delay={0.4}
              duration={3.4}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] mb-4 self-end"
            >
              <img
                src="/f56ccd0b935ef7dfbcda12e105db5f6c6c1db522.png"
                alt="Logo And Poster Design"
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="text-slate-800 font-poppins font-semibold text-[12.5px] whitespace-nowrap">
                Logo And Poster Design
              </span>
            </FloatingBadge>

            {/* Right white card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="relative w-[260px] bg-white rounded-[20px] shadow-[-6px_8px_20px_rgba(0,0,0,0.20)] p-6 flex flex-col items-center justify-between"
              style={{ height: '240px' }}
            >
              <h3 style={{ color: '#050505' }} className="font-poppins font-medium text-[15px] leading-snug mt-1 text-center w-full">
                Advanced Billing System<br />for Modern Businesses
              </h3>

              <div className="w-full flex justify-center my-1">
                <img
                  src="/64e37823845fcd721b630868cf1244cdfca89c9d.png"
                  alt="Billing Dashboard"
                  className="w-[120px] h-[125px] object-contain"
                />
              </div>

              <div style={{ color: '#050505' }} className="font-poppins font-medium text-[15px] text-center mt-auto mb-2">
                Grow your Business
              </div>
            </motion.div>

            {/* Mobile App Development badge — BELOW right card */}
            <FloatingBadge
              delay={0.8}
              duration={3.8}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] mt-4 self-start"
            >
              <img
                src="/3f80251d3161d5439bee3d41bea64dbc4b3c2600.png"
                alt="Mobile App Development"
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="text-slate-800 font-poppins font-semibold text-[12.5px] whitespace-nowrap">
                Mobile App Development
              </span>
            </FloatingBadge>
          </div>

        </motion.div>

        {/* Mobile/Tablet View (Hand of Cards Fan layout) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex lg:hidden flex-col items-center w-full px-4 overflow-visible pb-4 relative z-20"
        >
          {/* Explore Button — sits above center card */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAcademyClick}
            className="bg-[#1877F2] hover:bg-[#1565C0] text-white font-poppins font-semibold text-[15px] px-6 py-3 rounded-md transition-all duration-200 flex items-center gap-2 cursor-pointer border-none mb-6 shadow-[0_4px_14px_rgba(24,119,242,0.35)]"
            style={{ color: '#ffffff', backgroundColor: '#1877F2' }}
          >
            Explore Azhizen Acedemy <ArrowUpRight />
          </motion.button>

          {/* Interactive 3D Carousel Cards Container */}
          <div className="relative w-full h-[320px] xs:h-[350px] sm:h-[400px] flex items-center justify-center overflow-visible select-none mt-2">
            {/* Card 0: Left Card (Image card) */}
            <motion.div
              animate={getCardStyles(0)}
              transition={{ type: "spring", stiffness: 100, damping: 16 }}
              onClick={() => setActiveCard(0)}
              className="absolute w-[220px] xs:w-[245px] h-[290px] xs:h-[320px] shrink-0 cursor-pointer rounded-3xl overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,.15)]"
            >
              <img
                src="/63f3b2d49cbe4d045aafdb6f4177d911f7ed72ff.png"
                alt="What We Do — Azhizen"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Card 1: Center Card (Marketing Service) */}
            <motion.div
              animate={getCardStyles(1)}
              transition={{ type: "spring", stiffness: 100, damping: 16 }}
              onClick={() => setActiveCard(1)}
              className="absolute w-[220px] xs:w-[245px] bg-gradient-to-b from-slate-100 to-white rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,.15)] p-4 flex flex-col cursor-pointer text-left"
              style={{ minHeight: '290px', height: '290px' }}
            >
              <div
                className="self-center flex items-center bg-white px-4 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.06)] mb-2"
              >
                <span style={{ color: '#050505' }} className="font-poppins font-semibold text-[11px]">
                  Azhizen Media
                </span>
              </div>

              <h3 style={{ color: '#000000' }} className="font-poppins font-semibold text-[17px] mt-1 leading-tight text-left">
                Providing 10+<br />Marketing Service
              </h3>

              <div className="flex items-start gap-2 mt-2 mb-3 text-left">
                <Check className="w-5 h-5 text-[#1877F2] shrink-0 mt-0.5 stroke-[3]" />
                <span className="text-[12.5px] text-[#000000] font-poppins font-medium leading-normal">
                  grow your business through Digital platform to get Sucess
                </span>
              </div>

              <div className="w-full mt-auto">
                <img
                  src="/Frame 1268.png"
                  alt="Digital Marketing Preview"
                  className="w-full h-[95px] object-cover rounded-xl"
                />
              </div>
            </motion.div>

            {/* Card 2: Right Card (Billing System) */}
            <motion.div
              animate={getCardStyles(2)}
              transition={{ type: "spring", stiffness: 100, damping: 16 }}
              onClick={() => setActiveCard(2)}
              className="absolute w-[220px] xs:w-[245px] bg-white rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,.15)] p-4 flex flex-col items-center justify-between cursor-pointer"
              style={{ minHeight: '290px', height: '290px' }}
            >
              <h3 style={{ color: '#050505' }} className="font-poppins font-semibold text-[15px] leading-snug text-center w-full mb-1">
                Advanced Billing System<br />for Modern Businesses
              </h3>

              <div className="w-full flex justify-center my-1">
                <img
                  src="/64e37823845fcd721b630868cf1244cdfca89c9d.png"
                  alt="Billing Dashboard"
                  className="w-[135px] h-[135px] object-contain"
                />
              </div>

              <div style={{ color: '#050505' }} className="font-poppins font-medium text-[13px] text-center mt-auto">
                Grow your Business
              </div>
            </motion.div>
          </div>

          {/* Floating Badges 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3.5 px-4 w-full max-w-[480px] mt-8 z-10">
            <FloatingBadge delay={0.1} duration={3} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] justify-center">
              <img src="/a0ca5728adf4f3483881e71386b34061c9289922.png" className="w-6 h-6 object-contain shrink-0" />
              <span className="text-slate-800 font-poppins font-medium text-[11px] whitespace-nowrap">Website Dev</span>
            </FloatingBadge>
            <FloatingBadge delay={0.3} duration={3.2} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] justify-center">
              <img src="/9795a08d13bc8ef72ac67ba281e7618cf4319f00.png" className="w-6 h-6 object-contain shrink-0" />
              <span className="text-slate-800 font-poppins font-medium text-[11px] whitespace-nowrap">UI/UX Design</span>
            </FloatingBadge>
            <FloatingBadge delay={0.5} duration={3.4} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] justify-center">
              <img src="/f56ccd0b935ef7dfbcda12e105db5f6c6c1db522.png" className="w-6 h-6 object-contain shrink-0" />
              <span className="text-slate-800 font-poppins font-medium text-[11px] whitespace-nowrap">Logo & Poster</span>
            </FloatingBadge>
            <FloatingBadge delay={0.7} duration={3.6} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] justify-center">
              <img src="/3f80251d3161d5439bee3d41bea64dbc4b3c2600.png" className="w-6 h-6 object-contain shrink-0" />
              <span className="text-slate-800 font-poppins font-medium text-[11px] whitespace-nowrap">Mobile App Dev</span>
            </FloatingBadge>
          </div>
        </motion.div>

        {/* White Vector path bridging into next section */}
        <div className="absolute -bottom-[80px] lg:-bottom-[100px] left-1/2 -translate-x-1/2 w-[850px] lg:w-[1300px] xl:w-[1400px] h-[390px] lg:h-[350px] z-[5] pointer-events-none">
          <img
            src="/Vector 131 (1).png"
            alt="White Centre Path"
            className="w-full h-full object-fill"
          />
        </div>
      </div>

      {/* ── SECTION 2 ── */}
      <section
        id="services-section"
        className="bg-[#eef2f6] pt-[70px] pb-[120px] w-full flex flex-col items-center relative z-10 -mt-20"
      >
        <div className="max-w-[1320px] mx-auto w-full px-6 flex flex-col items-center">
          
          {/* Centered Badge (Lavender/Soft Blue BG and Dark Blue Text/Icon) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#DFE5EE] text-[#0F2C59] font-poppins font-medium text-[14px] px-5 py-1.5 rounded-full inline-flex items-center gap-2 mb-6"
          >
            <svg className="w-4 h-4 text-[#0F2C59]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
            </svg>
            Services Designed for Results
          </motion.div>

          {/* Heading with explicit line breaks and wider container to enforce two lines */}
          <motion.h2 
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-poppins font-bold text-[32px] sm:text-[40px] md:text-[48px] text-[#050505] leading-tight max-w-[1200px] text-center mb-4 mx-auto"
          >
            Delivering strategic, creative, and data-<br className="hidden md:block" />
            driven services to grow your business.
          </motion.h2>

          {/* Paragraph with explicit line breaks */}
          <motion.p 
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="font-poppins font-normal text-[15px] text-gray-500 max-w-[700px] text-center mb-8 leading-relaxed mx-auto"
          >
            We offer a comprehensive suite of creative services designed to<br className="hidden md:block" />
            elevate your brand and captivate your audience.
          </motion.p>

          {/* Explore Button */}
          <motion.a
            href="https://media.azhizen.com/#services"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="!bg-[#1877F2] hover:!bg-[#1565C0] text-white font-poppins font-semibold text-[16px] px-8 py-3.5 rounded-[12px] transition-all duration-200 shadow-[0_4px_14px_rgba(24,119,242,0.3)] flex items-center gap-2 cursor-pointer mb-16 no-underline"
          >
            Explore Azhizen Media <ArrowUpRight />
          </motion.a>

          {/* ── SERVICES GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4">
            {marketingServices.map((service, index) => (
              <motion.div
                key={index}
                variants={getGridCardVariants(index)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="h-full"
              >
                <ServiceCard
                  title={service.title}
                  description={service.description}
                  image={service.image}
                  onApply={() => handleApplyClick(service)}
                />
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── APPLICATION DIALOG MODAL ── */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[20px] w-full max-w-[640px] shadow-[0_24px_60px_rgba(15,23,42,0.18)] border border-slate-100/80 overflow-hidden font-poppins text-slate-800 relative"
            >
              {/* Premium Gradient Top Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#1877F2] to-[#00A3FF]" />

              {/* Header */}
              <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                    <img
                      src={selectedService.image}
                      alt={selectedService.title}
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <h3 className="text-[17px] font-bold text-[#0f172a] leading-tight">
                      Request Consultation
                    </h3>
                    <span className="text-[12px] text-slate-400 font-medium">Azhizen Digital Media</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 sm:p-7">
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <h4 className="text-[20px] font-bold text-slate-800 mb-2">
                      Application Submitted!
                    </h4>
                    <p className="text-[14px] text-slate-500 max-w-[320px] leading-relaxed">
                      Thank you for choosing Azhizen. Our marketing experts will reach out to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Selected Service Badge */}
                    <div className="flex flex-col text-left gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selected Service</span>
                      <div className="flex items-center gap-2 bg-[#1877F2]/5 border border-[#1877F2]/15 px-3.5 py-2 rounded-xl text-[14px] font-semibold text-[#1877F2] w-fit shadow-[0_2px_8px_rgba(24,119,242,0.04)]">
                        <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-pulse" />
                        {selectedService.title}
                      </div>
                    </div>

                    {/* Two-Column Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      {/* Left Column: Full Name & Email */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-semibold text-slate-600">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-[4px] focus:ring-[#1877F2]/10 focus:border-[#1877F2] hover:border-slate-300 text-[14.5px] transition-all bg-slate-50/30 hover:bg-white focus:bg-white text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-semibold text-slate-600">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-[4px] focus:ring-[#1877F2]/10 focus:border-[#1877F2] hover:border-slate-300 text-[14.5px] transition-all bg-slate-50/30 hover:bg-white focus:bg-white text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Right Column: Phone & Project Details */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-semibold text-slate-600">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-[4px] focus:ring-[#1877F2]/10 focus:border-[#1877F2] hover:border-slate-300 text-[14.5px] transition-all bg-slate-50/30 hover:bg-white focus:bg-white text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-semibold text-slate-600">Project Details (Optional)</label>
                          <input
                            type="text"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Briefly describe your goals..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-[4px] focus:ring-[#1877F2]/10 focus:border-[#1877F2] hover:border-slate-300 text-[14.5px] transition-all bg-slate-50/30 hover:bg-white focus:bg-white text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 bg-gradient-to-r from-[#1877F2] to-[#0084FF] hover:opacity-95 text-white font-bold text-[15px] py-3.5 rounded-xl shadow-[0_4px_16px_rgba(24,119,242,0.25)] hover:shadow-[0_8px_24px_rgba(24,119,242,0.35)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Application</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default MarketingServices;
