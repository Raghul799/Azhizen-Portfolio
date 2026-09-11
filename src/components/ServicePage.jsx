import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, ArrowRight, Check, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, push, set } from "firebase/database";
import { db, realtimeDb } from "./firebase";

// Standard components for organic floating animation
const FloatingIcon = ({ src, className, delay = 0, duration = 4, yRange = [-8, 8] }) => (
  <motion.div
    className={className}
    animate={{ y: yRange }}
    transition={{
      duration: duration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay: delay
    }}
    whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0], transition: { duration: 0.2 } }}
  >
    <img src={src} alt="floating tech icon" className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] object-contain drop-shadow-sm select-none pointer-events-none" />
  </motion.div>
);

const ServicePage = () => {
  const [showAll, setShowAll] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [bookingService, setBookingService] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: "", company: "", email: "", phone: "", details: "" });

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const initialCards = [
    {
      id: 1,
      image: "/IoT & Smart Automation.jpg",
      title: "IoT & Smart Automation",
      description: "Design and deploy scalable IoT architectures and cloud automation systems.",
      detailedDesc: "We design and deploy scalable IoT architectures, smart sensors, and cloud-connected automation systems for industrial and consumer needs. This includes real-time telemetry, remote actuator control, and custom analytics dashboards.",
      features: ["Scalable IoT architectures", "Smart sensors integration", "Cloud-connected controls"]
    },
    {
      id: 2,
      image: "/Custom Hardware Design.jpg",
      title: "Custom Hardware Design",
      description: "Advanced hardware prototyping and custom schematic development.",
      detailedDesc: "We deliver advanced hardware prototyping with custom PCB design, tailored solutions for embedded systems, and robust IoT hardware innovations optimized for industrial scaling and deployment.",
      features: ["Custom PCB schematic design", "Embedded systems hardware", "Advanced prototyping & testing"]
    },
    {
      id: 3,
      image: "/Machine Vision AI.jpg",
      title: "Machine Vision AI",
      description: "Real-time optical sorting and intelligent decision-based engineering.",
      detailedDesc: "Train intelligent convolutional neural networks for automated defect detection, fruit grading, spatial tracking, and industrial conveyor sorting.",
      features: ["Real-time classification", "Edge device compatibility", "Sub-millisecond inference"]
    },
    {
      id: 4,
      image: "/AIML & Firmware Integration.jpg",
      title: "AI/ML & Firmware Integration",
      description: "Integrate custom machine learning models and embedded system firmware.",
      detailedDesc: "We integrate state-of-the-art AI/ML capabilities and optimized micro-firmware updates, designing smart, adaptable systems built to automate processes and predict diagnostics at the physical device level.",
      features: ["Edge AI inference logic", "Microcontroller C/C++ firmware", "Adaptive system automation"]
    },
    {
      id: 5,
      image: "/Precision Automation.jpg",
      title: "Precision Automation",
      description: "High-accuracy actuator controls and automated machinery.",
      detailedDesc: "Design high-precision motorized controls, pneumatic systems, and linear actuators to automate industrial steps with repeatable accuracy.",
      features: ["Servo/stepper motor controls", "Closed-loop feedback systems", "High-durability components"]
    },
    {
      id: 6,
      image: "/Telemetry & Cloud Dashboards.jpg",
      title: "Telemetry & Cloud Dashboards",
      description: "Real-time IoT data visualization portals and web integrations.",
      detailedDesc: "Build responsive, secure web dashboards visualizing streaming MQTT/HTTP data, offering historical analytics and user configuration controls.",
      features: ["MQTT/WebSockets pipelines", "Interactive chart analytics", "Multi-tenant permissions"]
    },
    {
      id: 7,
      image: "/Robotics Integration.jpg",
      title: "Robotics Integration",
      description: "Custom robotic arms and autonomous guiding systems.",
      detailedDesc: "Integrate multi-axis robotic arms, robotic path guidance systems, and computer vision controls for automated assembly line picking.",
      features: ["Inverse kinematics control", "Collision avoidance maps", "Industrial PLC compatibility"]
    },
    {
      id: 8,
      image: "/Industrial IoT Telemetry.jpg",
      title: "Industrial IoT Telemetry",
      description: "Secure edge gateway controls and sensor data acquisition.",
      detailedDesc: "Implement robust edge gateway architectures to aggregate machinery diagnostics, handle data storage, and bridge legacy hardware to modern clouds.",
      features: ["Modbus/RS485 protocol bridges", "Local data storage buffer", "Over-the-air updates"]
    },
  ];

  const extraCards = [
    {
      id: 9,
      image: "/smart_hydroponics.png",
      title: "Smart Hydroponics",
      description: "Automated nutrient dosing and environmental growth controls.",
      detailedDesc: "Automated pH balance, nutrient dosing, lighting schedules, and water circulation systems designed for high-yield soil-less cultivation.",
      features: ["Automatic pH dosing cycles", "Spectrophotometric light controls", "Water temperature regulation"]
    },
    {
      id: 10,
      image: "/custom_cad_prototyping.png",
      title: "Custom CAD Prototyping",
      description: "Structural 3D CAD modeling and hardware enclosures design.",
      detailedDesc: "Create fully articulated 3D CAD models of mechanical designs, housing enclosures, and structural mounts optimized for CNC machining and 3D printing.",
      features: ["Injection molding feasibility", "Structural load stress testing", "3D print prototype fitment"]
    },
    {
      id: 11,
      image: "/edge_ai_processing.png",
      title: "Edge AI Processing",
      description: "High-performance neural network inference on compact microcomputers.",
      detailedDesc: "Deploy quantized machine learning models to small computers (Jetson Nano, Raspberry Pi) to execute local object detection and telemetry filters without cloud dependencies.",
      features: ["Quantized model execution", "Minimal power footprint", "Zero network dependency backup"]
    },
    {
      id: 12,
      image: "/system_diagnostics_testing.png",
      title: "System Diagnostics & Testing",
      description: "Rigorous hardware-in-the-loop validation and failure analysis.",
      detailedDesc: "Perform rigorous electrical testing, thermal imaging, stress-strain validation, and detailed failure mode effects analyses on physical devices.",
      features: ["Hardware-in-the-loop validation", "Thermal load heat mapping", "Compliance & safety audits"]
    },
  ];

  const allCards = [...initialCards, ...extraCards];
  const displayedCards = showAll ? allCards : initialCards;

  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.selectCardId) {
      const cardId = location.state.selectCardId;
      const foundCard = allCards.find((c) => c.id === cardId);
      if (foundCard) {
        setSelectedCard(foundCard);
        if (cardId > 8) {
          setShowAll(true);
        }
        
        setTimeout(() => {
          const gridEl = document.querySelector(".services-grid");
          if (gridEl) {
            gridEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    }
  }, [location.state]);

  // Stagger variants for the card grid
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12, // Increased delay to show one-by-one loading clearly
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
  };

  const getCardVariants = (index) => ({
    hidden: isMobile
      ? { opacity: 0, x: index % 2 === 0 ? -100 : 100 }
      : { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: isMobile
        ? { duration: 0.6, ease: "easeOut" }
        : { type: "spring", stiffness: 80, damping: 15, delay: index * 0.08 }
    }
  });

  return (
    <div className="font-poppins bg-[#F4F6FB] min-h-screen pt-16 overflow-x-hidden">
      
      {/* ── HERO SECTION ── */}
      <section
        className="relative w-full min-h-[460px] sm:min-h-[520px] md:min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-visible bg-top bg-no-repeat px-6"
        style={{
          backgroundImage: "url('/Desktop - 92 (2).png')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      >
        {/* Decorative Floating Badges - Left Side */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
          <FloatingIcon
            src="/Frame 1549.png"
            className="absolute top-[18%] left-[4%] lg:left-[10%] pointer-events-auto"
            delay={0.2}
            duration={3.5}
            yRange={[-10, 10]}
          />
          <FloatingIcon
            src="/Frame 1550.png"
            className="absolute top-[32%] left-[2%] lg:left-[7%] pointer-events-auto"
            delay={0.8}
            duration={4.2}
            yRange={[-6, 6]}
          />
          <FloatingIcon
            src="/Frame 1554.png"
            className="absolute top-[48%] left-[3%] lg:left-[9%] pointer-events-auto"
            delay={0.4}
            duration={3.8}
            yRange={[-9, 9]}
          />
          <FloatingIcon
            src="/Frame 1556.png"
            className="absolute top-[62%] left-[1%] lg:left-[5%] pointer-events-auto"
            delay={1.2}
            duration={4.5}
            yRange={[-7, 7]}
          />
          <FloatingIcon
            src="/Frame 1557.png"
            className="absolute top-[76%] left-[4%] lg:left-[8%] pointer-events-auto"
            delay={0.6}
            duration={3.9}
            yRange={[-11, 11]}
          />
        </div>

        {/* Center Main Content */}
        <div className="relative z-20 text-center max-w-[850px] mx-auto pt-6 pb-20 md:pb-28 -translate-y-4 sm:-translate-y-8 md:-translate-y-12">
          <motion.h1
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[28px] sm:text-[38px] md:text-[44px] lg:text-[48px] font-semibold leading-tight tracking-tight"
          >
            <span className="text-[#0274D4]">Innovative Software Solutions</span>
            <br />
            <span className="text-slate-900">for Modern Businesses</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="text-[14px] sm:text-[16px] text-slate-600 font-normal leading-relaxed max-w-[680px] mx-auto mt-6 px-2"
          >
            We build secure, scalable, and high performance software solutions that empower
            organizations to innovate, optimize operations, and accelerate digital
            transformation with confidence.
          </motion.p>
        </div>

        {/* Decorative Floating Badges - Right Side */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
          <FloatingIcon
            src="/Frame 1553.png"
            className="absolute top-[18%] right-[4%] lg:right-[10%] pointer-events-auto"
            delay={0.5}
            duration={3.7}
            yRange={[-8, 8]}
          />
          <FloatingIcon
            src="/Frame 1551.png"
            className="absolute top-[32%] right-[2%] lg:right-[7%] pointer-events-auto"
            delay={1.1}
            duration={4.4}
            yRange={[-5, 5]}
          />
          <FloatingIcon
            src="/Frame 1552.png"
            className="absolute top-[48%] right-[3%] lg:right-[9%] pointer-events-auto"
            delay={0.3}
            duration={3.9}
            yRange={[-10, 10]}
          />
          <FloatingIcon
            src="/Frame 1555.png"
            className="absolute top-[62%] right-[1%] lg:right-[5%] pointer-events-auto"
            delay={0.9}
            duration={4.6}
            yRange={[-7, 7]}
          />
          <FloatingIcon
            src="/Frame 1558.png"
            className="absolute top-[76%] right-[4%] lg:right-[8%] pointer-events-auto"
            delay={0.7}
            duration={4.1}
            yRange={[-9, 9]}
          />
        </div>
      </section>

      {/* ── SERVICES LIST SECTION ── */}
      <section className="relative z-20 max-w-[1320px] mx-auto px-[20px] pb-[40px] mt-12 md:mt-20">
        
        {/* Section Header (Matches mockup layout exactly, rendered directly on the page background) */}
        {/* Section Header (Matches mockup layout exactly, rendered directly on the page background) */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-12 mb-12 sm:mb-16 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="md:w-[30%] shrink-0 text-left"
          >
            <h2 className="text-[32px] sm:text-[38px] md:text-[40px] font-semibold leading-[1.1] tracking-tight">
              <span className="text-[#0274D4]">Service</span>
              <br />
              <span className="text-slate-900 font-semibold">that we provide</span>
            </h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            viewport={{ once: true, margin: "-100px" }}
            className="md:w-[70%] md:pt-2 text-left"
          >
            <p className="text-slate-700 text-[14.5px] sm:text-[16.5px] leading-relaxed font-normal">
              We transform innovative ideas into real-world solutions through advanced technology
              <br />
              and intelligent system development, creating scalable and future-ready innovations.
            </p>
          </motion.div>
        </div>

        {/* Cards Grid (Perfect Responsive Columns matching specifications) */}
        <div className="services-grid">
          <AnimatePresence>
            {displayedCards.map((card, index) => (
              <motion.div
                key={card.id}
                layout
                variants={getCardVariants(index)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                className="service-card cursor-pointer"
                onClick={() => setSelectedCard(card)}
              >
                {/* Card Image: height 210px, object-fit cover */}
                <div className="service-card-image-container">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="service-card-image"
                  />
                </div>

                {/* Content section: padding 18px */}
                <div className="service-card-content">
                  <div>
                    {/* Title */}
                    <h3 className="text-[16px] font-semibold text-slate-800 tracking-tight leading-tight mb-1">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[12.5px] text-slate-400 leading-normal line-clamp-1 mb-2">
                      {card.description}
                    </p>
                  </div>

                  {/* CTA Action (Royal Blue Capsule Button: bg #2563EB) */}
                  <motion.button 
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCard(card);
                    }}
                    className="btn-royal-blue btn-explore"
                  >
                    Explore
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View More Button (Royal Blue button: Width 170px, Height 50px, bg #2563EB) */}
        <div className="flex justify-center mt-[30px]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAll(!showAll)}
            className="btn-royal-blue btn-view-more gap-2 border-none"
          >
            <span>{showAll ? "View less" : "View more"}</span>
            <motion.div
              animate={{ rotate: showAll ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

      </section>

      {/* Explore Dialog Modal overlay */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedCard(null)}
          >
            {/* Modal Body container */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-[480px] bg-white rounded-[1.8rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-slate-100 p-6 sm:p-8 text-left flex flex-col justify-between overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Accent Step 1 Progress Bar (50% filled) */}
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-slate-100 z-20"></div>
              <div className="absolute top-0 left-0 w-1/2 h-[6px] bg-[#0274D4] z-20"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedCard(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer border-none z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                {/* Service Details Badge */}
                <div className="bg-[#0274D4]/10 text-[#0274D4] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full w-fit mb-4 select-none">
                  Service Details
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight pr-8">
                  {selectedCard.title}
                </h3>
                
                <p className="text-[13.5px] text-slate-500 mt-3.5 leading-relaxed font-normal">
                  {selectedCard.detailedDesc}
                </p>

                <div className="mt-5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                    Key Deliverables
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedCard.features?.map((feat, idx) => (
                      <li key={idx} className="flex items-center text-xs text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0274D4] mr-2 shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => {
                    setBookingService(selectedCard);
                    setBookingSuccess(false);
                    setBookingForm({ name: "", company: "", email: "", phone: "", details: "" });
                    setSelectedCard(null);
                  }}
                  className="flex-1 py-2.5 !bg-[#0274D4] hover:!bg-[#01559C] text-white font-bold rounded-xl text-xs transition-all shadow-[0_4px_12px_rgba(2,116,212,0.2)] hover:shadow-[0_6px_16px_rgba(2,116,212,0.3)] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-center border-none"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Form Dialog Modal overlay */}
      <AnimatePresence>
        {bookingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setBookingService(null)}
          >
            {/* Modal Body container */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-[540px] bg-white rounded-[1.8rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-slate-100 p-6 sm:p-8 text-left flex flex-col justify-between overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Accent Step 2 Progress Bar (100% filled) */}
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-slate-100 z-20"></div>
              <div className="absolute top-0 left-0 w-full h-[6px] bg-[#0274D4] z-20"></div>

              {/* Close Button */}
              <button 
                onClick={() => setBookingService(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer border-none z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {!bookingSuccess ? (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone) {
                      alert("Please fill in all required fields (Name, Email, Phone).");
                      return;
                    }

                    setIsSubmitting(true);

                    try {
                      const serviceData = {
                        serviceCategory: "Technology Solutions",
                        selectedService: bookingService?.title || "",
                        fullName: bookingForm.name,
                        email: bookingForm.email,
                        phone: bookingForm.phone,
                        details: bookingForm.details || "",
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

                      setBookingSuccess(true);
                    } catch (err) {
                      console.error("Firebase Service submission error:", err);
                      alert("Failed to submit consultation request. Please check your network and try again.");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#0274D4]/10 flex items-center justify-center text-[#0274D4] shrink-0">
                      <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[19px] font-bold text-slate-850 tracking-tight leading-tight">
                        Request Consultation
                      </h3>
                      <p className="text-[11.5px] text-slate-400 font-semibold uppercase tracking-wider">
                        Azhizen Technology Solutions
                      </p>
                    </div>
                  </div>

                  {/* Selected Service Badge */}
                  <div className="text-left mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Selected Service
                    </span>
                    <span className="inline-flex items-center text-xs font-semibold text-[#0274D4] bg-[#0274D4]/10 px-3.5 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0274D4] mr-2" />
                      {bookingService.title}
                    </span>
                  </div>

                  {/* Form Inputs Grid - 2x2 Layout matching Image 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                    <div>
                      <label className="block text-[13.5px] font-semibold text-slate-700 mb-1.5 text-left">
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        required
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full border border-slate-300 focus:border-[#0274D4] focus:ring-2 focus:ring-[#0274D4]/10 transition-all rounded-xl px-4 py-2.5 text-[13px] text-slate-800 bg-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[13.5px] font-semibold text-slate-700 mb-1.5 text-left">
                        Phone Number
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full border border-slate-300 focus:border-[#0274D4] focus:ring-2 focus:ring-[#0274D4]/10 transition-all rounded-xl px-4 py-2.5 text-[13px] text-slate-800 bg-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[13.5px] font-semibold text-slate-700 mb-1.5 text-left">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        required
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full border border-slate-300 focus:border-[#0274D4] focus:ring-2 focus:ring-[#0274D4]/10 transition-all rounded-xl px-4 py-2.5 text-[13px] text-slate-800 bg-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[13.5px] font-semibold text-slate-700 mb-1.5 text-left">
                        Project Details (Optional)
                      </label>
                      <input 
                        type="text" 
                        value={bookingForm.details}
                        onChange={(e) => setBookingForm({ ...bookingForm, details: e.target.value })}
                        placeholder="Briefly describe your goals..."
                        className="w-full border border-slate-300 focus:border-[#0274D4] focus:ring-2 focus:ring-[#0274D4]/10 transition-all rounded-xl px-4 py-2.5 text-[13px] text-slate-800 bg-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 !bg-[#0274D4] hover:!bg-[#01559C] text-white font-bold rounded-xl text-[14px] transition-all shadow-[0_4px_12px_rgba(2,116,212,0.2)] hover:shadow-[0_6px_16px_rgba(2,116,212,0.3)] flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Application</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Success State container */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 border border-green-100 flex items-center justify-center mb-5 shadow-sm">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                    Application Submitted!
                  </h3>
                  
                  <p className="text-[13px] text-slate-500 font-normal leading-relaxed max-w-[360px] mt-2.5">
                    Thank you, <span className="font-semibold text-slate-800">{bookingForm.name}</span>. Our technical team will review your requirements for <span className="font-semibold text-slate-800">{bookingService.title}</span> and contact you within 24 hours.
                  </p>

                  <button
                    onClick={() => setBookingService(null)}
                    className="mt-7 px-8 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer border-none uppercase tracking-wider"
                  >
                    Close Window
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicePage;