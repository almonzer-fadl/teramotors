"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Car,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  MessageCircle,
  FileText,
  AlertCircle,
  Globe,
  Menu,
  Package,
  Play,
  ReceiptText,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { VideoModal } from "@/components/VideoModal";

const fadeInUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const staggerVars = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function BeforeState() {
  return (
    <div className="relative h-full w-full">
      <Image src="/demo/messy-desk.avif" alt="Messy desk with scattered papers" fill className="object-cover" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center sm:p-6">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-[9px] font-bold text-white/85 backdrop-blur-sm sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-[10px]">
            <FileSpreadsheet className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Excel
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-[9px] font-bold text-white/85 backdrop-blur-sm sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-[10px]">
            <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> WhatsApp
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-[9px] font-bold text-white/85 backdrop-blur-sm sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-[10px]">
            <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Paper
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-[9px] font-bold text-white/85 backdrop-blur-sm sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-[10px]">
            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Manual
          </span>
        </div>
        <p className="mt-3 text-xs font-bold text-white/90 sm:mt-4 sm:text-sm sm:text-base">Scattered tools. No system.</p>
        <p className="mt-0.5 text-[10px] text-white/55 sm:mt-1 sm:text-xs sm:text-sm">Job cards, invoicing, tracking — all manual.</p>
      </div>
    </div>
  );
}

function AfterState() {
  return (
    <div className="relative h-full w-full bg-[#efe2c7]">
      <Image src="/demo/teramotors-dashboard.webp" alt="TeraMotors Dashboard" fill className="object-contain p-2 sm:p-4" />
    </div>
  );
}

const modules = [
  { title: "Customer and vehicle records", description: "Customer profiles, vehicle history, plates, VIN, mileage — all linked. No more digging through binders.", icon: Car },
  { title: "Job cards and work orders", description: "Create, assign, track, and complete repair work. Parts, labor, notes, and status visible to the whole team.", icon: ClipboardCheck },
  { title: "Estimates and invoicing", description: "Professional estimates that convert to invoices. Payment tracking and customer-ready PDFs.", icon: ReceiptText },
  { title: "Appointment scheduling", description: "Book visits, plan the day, and reduce front-desk chaos. Customers can self-schedule online.", icon: CalendarDays },
  { title: "Parts inventory", description: "Track stock levels, suppliers, and costs. Low-stock alerts before you run out mid-job.", icon: Package },
  { title: "Vehicle inspections", description: "Digital checklists with photo documentation. Consistent inspections that protect your shop and your customer.", icon: Wrench },
  { title: "Reports and analytics", description: "Revenue, open work, job progress, aging receivables — one dashboard instead of spreadsheets and guesswork.", icon: BarChart3 },
  { title: "Team workflows", description: "Separate views for front desk, technicians, and owners. Clear roles, no confusion.", icon: Users },
];

const workflow = [
  "Customer calls or books online. Front desk pulls up their vehicle history instantly.",
  "Technician gets a clear job card with vehicle context, parts needed, and repair notes.",
  "Parts inventory updates automatically as items are used on the job.",
  "Estimate becomes an invoice. Customer approves, pays, and gets a professional receipt.",
  "Owner reviews revenue, open jobs, and shop performance from one dashboard.",
];

const tiers = [
  {
    name: "Launch",
    price: "$1,500-$3,000",
    retainer: "$200-$500/mo",
    subtitle: "Ready-to-Deploy TeraMotors",
    bestFor: "Small auto repair shops who want a working system quickly.",
    features: ["Branding", "Customer and vehicle records", "Job cards and work orders", "Estimates and invoicing", "Appointment scheduling", "Deployment", "Training"],
    message: "Live in weeks, not months.",
  },
  {
    name: "Custom",
    price: "$3,000-$6,000",
    retainer: "$400-$800/mo",
    subtitle: "TeraMotors + Workflow Customization",
    bestFor: "Workshops with unique processes and workflows.",
    features: ["Everything in Launch", "Custom workflows", "Custom reports", "Staff roles and permissions", "Business-specific processes", "Parts inventory setup"],
    message: "Keep the proven core. Customize the workflow.",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$6,000-$12,000+",
    retainer: "$800-$1,500/mo",
    subtitle: "TeraMotors as Your Operating System",
    bestFor: "Multi-shop owners replacing multiple tools with one owned platform.",
    features: ["Everything in Custom", "Multi-location support", "Advanced automations", "Integrations", "Priority support and updates", "Dedicated roadmap"],
    message: "Replace scattered tools with one operating system.",
  },
];

export default function Home() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <main className="relative isolate min-h-screen bg-[#f3efe5] text-[#151612]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#e2f1d8_0,#f3efe5_36%,#f7f3ea_100%)]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#f3efe5]/82 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
            <div className="grid size-8 place-items-center overflow-hidden rounded-xl bg-[#151612] p-1 sm:size-10 sm:rounded-2xl sm:p-1.5">
              <Image src="/icon.png" alt="TeraMotors" width={36} height={36} className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[13px] font-bold leading-none tracking-tight sm:text-sm">TeraMotors</p>
              <p className="mt-0.5 text-[10px] font-semibold text-[#667065] sm:mt-1 sm:text-xs">by VantLaunch</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#667065] md:flex">
            <Link href="#system" className="hover:text-[#151612]">System</Link>
            <Link href="#demo" className="hover:text-[#151612]">Demo</Link>
            <Link href="#pricing" className="hover:text-[#151612]">Pricing</Link>
            <Link href="https://vantlaunch.com" className="hover:text-[#151612]">VantLaunch</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="#demo"
              className="hidden min-h-10 items-center justify-center gap-2 rounded-full bg-[#151612] px-4 text-sm font-bold text-white transition hover:bg-[#2a2c24] sm:inline-flex"
            >
              Watch demo
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[#151612] md:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-64 bg-[#f3efe5] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#151612]">Menu</p>
                <button onClick={closeMenu} className="grid size-9 place-items-center rounded-xl border border-black/10 bg-white" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <nav className="mt-8 flex flex-col gap-5">
                <Link href="#system" onClick={closeMenu} className="text-base font-semibold text-[#151612]">System</Link>
                <Link href="#demo" onClick={closeMenu} className="text-base font-semibold text-[#151612]">Demo</Link>
                <Link href="#pricing" onClick={closeMenu} className="text-base font-semibold text-[#151612]">Pricing</Link>
                <Link href="https://vantlaunch.com" onClick={closeMenu} className="text-base font-semibold text-[#151612]">VantLaunch</Link>
              </nav>
              <div className="mt-8">
                <Link
                  href="#demo"
                  onClick={closeMenu}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#151612] px-5 py-3 text-sm font-bold text-white"
                >
                  Watch demo
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 sm:pb-16 sm:pt-20 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-black/[0.06]" />
        <div className="absolute bottom-[-18rem] left-1/2 hidden h-[34rem] w-[72rem] -translate-x-1/2 rounded-full bg-[#5f6f52]/6 blur-[120px] sm:block" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerVars}
          className="relative z-10 mx-auto grid max-w-7xl gap-10 sm:gap-14 lg:grid-cols-2 lg:items-center"
        >
          <motion.div variants={fadeInUp}>
            <p className="inline-flex rounded-full border border-[#cfd8c7] bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5f6f52] sm:px-3 sm:py-1.5 sm:text-xs sm:tracking-[0.2em]">
              Workshop management operating system
            </p>
            <h1 className="mt-4 text-balance text-[1.75rem] font-semibold leading-[1.06] tracking-tight sm:mt-5 sm:text-4xl lg:text-5xl xl:text-6xl">
              Start from a proven workshop management system instead of building from zero.
            </h1>
            <p className="mt-4 max-w-xl text-[0.9375rem] leading-7 text-[#667065] sm:mt-5 sm:text-base sm:leading-8 sm:text-lg">
              TeraMotors already runs in real auto repair shops. We set it up, brand it,
              configure it, customize it, deploy it, and support it — so your team can manage
              customers, vehicles, job cards, invoices, inventory, and reports in one place.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <button
                onClick={() => setDemoOpen(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#151612] px-5 text-sm font-bold text-white shadow-[0_16px_36px_rgba(21,22,18,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2a2c24] sm:min-h-12 sm:px-6"
              >
                <Play size={15} className="sm:size-4" />
                Watch the demo
                <span className="ml-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-[10px]">2 min</span>
              </button>
              <Link
                href="#pricing"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#cfd8c7] bg-white/80 px-5 text-sm font-bold text-[#151612] transition hover:-translate-y-0.5 hover:bg-white sm:min-h-12 sm:px-6"
              >
                View pricing
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-2 text-[13px] font-semibold text-[#3f453b] sm:mt-8 sm:grid-cols-3 sm:gap-3 sm:text-sm">
              {["Ready system", "Live in weeks", "We set it up"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2.5 sm:px-4 sm:py-3">
                  <CheckCircle2 size={16} className="text-[#2d6b3d] sm:size-[17px]" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative">
            <BeforeAfterSlider
              before={<BeforeState />}
              after={<AfterState />}
              beforeLabel="Scattered tools"
              afterLabel="TeraMotors"
              className="aspect-[4/3] w-full sm:aspect-[16/10]"
            />

            <button
              onClick={() => setDemoOpen(true)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5f6f52] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#151612] sm:mt-4 sm:gap-2.5 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Watch full demo
              <span className="ml-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-[10px]">2 min</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="system" className="border-y border-white/70 bg-[#fbfaf5]/55 px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5f6f52] sm:text-xs sm:tracking-[0.2em]">What it replaces</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl sm:text-4xl">
              A product first. Custom software second.
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-7 text-[#667065] sm:mt-4 sm:text-base sm:leading-8">
              You are not paying us to invent workshop management from scratch. TeraMotors already
              includes the core workflows. Your project is setup, branding, configuration,
              customization, deployment, training, and support — not a months-long build from zero.
            </p>
          </motion.div>

          <motion.div
            initial={"hidden"}
            whileInView={"visible"}
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerVars}
            className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
          >
            {modules.map((mod) => (
              <motion.div
                key={mod.title}
                variants={fadeInUp}
                className="rounded-[22px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_50px_rgba(52,64,45,0.08)] ring-1 ring-[#dfe5d8]/70 backdrop-blur sm:rounded-[28px] sm:p-5"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-[#f1eadc] text-[#5f6f52] sm:size-12 sm:rounded-2xl">
                  <mod.icon size={19} className="sm:size-[21px]" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight sm:mt-5 sm:text-lg">{mod.title}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-[#667065] sm:mt-2 sm:text-sm sm:leading-6">{mod.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5f6f52] sm:text-xs sm:tracking-[0.2em]">How we deliver</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl sm:text-4xl">
              From first call to your team using it — in weeks.
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-7 text-[#667065] sm:mt-4 sm:text-base sm:leading-8">
              Here&rsquo;s how a typical TeraMotors project moves. We handle setup, branding,
              configuration, and training. You get a working system your team can actually use.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
              <button
                onClick={() => setDemoOpen(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#151612] px-5 text-sm font-bold text-white shadow-[0_16px_36px_rgba(21,22,18,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2a2c24] sm:min-h-12 sm:px-6"
              >
                <Play size={15} className="sm:size-4" />
                Watch the demo
                <span className="ml-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-[10px]">2 min</span>
              </button>
              <Link
                href="mailto:vantlaunch@gmail.com?subject=TeraMotors%20demo"
                className="inline-flex min-h-11 items-center justify-between gap-2.5 rounded-full border border-[#d8dfd1] bg-white/80 px-5 text-sm font-bold text-[#151612] transition hover:-translate-y-0.5 hover:bg-white sm:min-h-12 sm:gap-3"
              >
                Book a call
                <ArrowRight size={15} className="sm:size-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-[24px] border border-white/70 bg-white/82 p-4 shadow-[0_22px_70px_rgba(52,64,45,0.1)] ring-1 ring-[#dfe5d8]/70 backdrop-blur sm:rounded-[32px] sm:p-7"
          >
            <div className="space-y-3 sm:space-y-4">
              {workflow.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-[18px] bg-[#f7f3ea] p-3 sm:gap-4 sm:rounded-[24px] sm:p-4">
                  <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-[13px] font-bold text-[#5f6f52] shadow-sm sm:size-10 sm:rounded-2xl sm:text-sm">
                    {index + 1}
                  </div>
                  <p className="self-center text-[13px] font-semibold leading-5 text-[#3f453b] sm:text-sm sm:leading-6">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/70 bg-[#f7f3ea]/72 px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5f6f52] sm:text-xs sm:tracking-[0.2em]">Pricing</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl sm:text-4xl">
              Lower-risk pricing for first TeraMotors clients.
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-7 text-[#667065] sm:mt-4 sm:text-base sm:leading-8">
              The goal is to launch real clients, build case studies, and earn testimonials.
              Start with the working product, then we customize only what your business actually needs.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-3">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex flex-col rounded-[24px] border bg-white/82 p-5 shadow-[0_20px_60px_rgba(52,64,45,0.08)] backdrop-blur sm:rounded-[30px] sm:p-6 ${
                  tier.featured ? "border-[#5f6f52] ring-1 ring-[#5f6f52]/20" : "border-white/70 ring-1 ring-[#dfe5d8]/70"
                }`}
              >
                {tier.featured ? (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-[#151612] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white sm:-top-3 sm:left-6 sm:px-4 sm:py-1.5 sm:text-[10px] sm:tracking-[0.16em]">Most useful</span>
                ) : null}
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{tier.name}</h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#667065] sm:text-xs sm:tracking-[0.16em]">{tier.subtitle}</p>
                <div className="mt-5 sm:mt-6">
                  <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{tier.price}</p>
                  <p className="mt-1 text-[13px] font-semibold text-[#5f6f52] sm:text-sm">{tier.retainer} retainer</p>
                </div>
                <p className="mt-4 text-[13px] leading-6 text-[#667065] sm:mt-5 sm:text-sm">{tier.bestFor}</p>
                <p className="mt-3 rounded-xl bg-[#f7f3ea] px-3 py-2.5 text-[13px] font-bold leading-5 text-[#3f453b] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm sm:leading-6">{tier.message}</p>
                <ul className="mt-5 flex-1 space-y-2.5 border-t border-[#dfe5d8] pt-5 sm:mt-6 sm:space-y-3 sm:pt-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-[13px] font-medium leading-5 text-[#3f453b] sm:gap-3 sm:text-sm sm:leading-6">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#2d6b3d] sm:size-[17px]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="mailto:vantlaunch@gmail.com?subject=TeraMotors%20demo"
                  className={`mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-bold transition sm:mt-8 sm:min-h-12 sm:text-sm ${
                    tier.featured ? "bg-[#151612] text-white hover:bg-[#2a2c24]" : "border border-[#cfd8c7] bg-white text-[#151612] hover:bg-[#f7f3ea]"
                  }`}
                >
                  Book a demo
                  <ArrowRight size={15} className="sm:size-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-12 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl rounded-[24px] bg-[#151612] px-5 py-10 text-center text-white shadow-[0_26px_80px_rgba(21,22,18,0.22)] sm:rounded-[34px] sm:px-10 sm:py-16"
        >
          <Globe className="mx-auto text-[#8fd198] sm:size-[34px]" size={28} />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:mt-5 sm:text-3xl sm:text-4xl">
            Want to see if TeraMotors fits your workshop?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[0.9375rem] leading-7 text-white/70 sm:mt-4 sm:text-base sm:leading-8">
            Start with the live demo. If the core system makes sense, we map what needs to be
            branded, configured, customized, and deployed for your team. No obligation.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <button
              onClick={() => setDemoOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#151612] transition hover:bg-[#f7f3ea] sm:min-h-12 sm:px-6"
            >
              <Play size={15} className="sm:size-4" />
              Watch the demo
            </button>
            <Link
              href="https://vantlaunch.com"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-bold text-white transition hover:bg-white/10 sm:min-h-12 sm:px-6"
            >
              Visit VantLaunch
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Video Modal */}
      <VideoModal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        src="/demo/teramotors-demo.mp4"
        poster="/demo/teramotors-demo-poster.jpg"
        title="TeraMotors Demo"
      />
    </main>
  );
}
