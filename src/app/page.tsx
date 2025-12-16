"use client";

import React from 'react';
import Header from '@/components/Header';
import { Map, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchEngine from '@/components/SearchEngine';
import FeaturedDestinations from '@/components/FeaturedDestinations';
import Newsletter from '@/components/Newsletter';
import AirlinePartners from '@/components/AirlinePartners';

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-rose-100 selection:text-rose-600">

      {/* HEADER - Premium Glassmorphic Design */}
      <Header />

      {/* HERO SECTION - Modern & Premium (Restored) */}
      <div className="relative pt-44 pb-32 px-6 bg-white">

        {/* Dynamic Background Elements - COSMIC LUXURY */}
        <div className="absolute inset-0 top-0 h-[800px] bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#4c0519] rounded-b-[5rem]"></div>

        {/* Abstract Pattern overlay */}
        <div className="absolute inset-0 top-0 h-[800px] opacity-20 rounded-b-[5rem] pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/50 via-transparent to-transparent"></div>
        <div className="absolute inset-0 top-0 h-[800px] opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] rounded-b-[5rem]"></div>

        {/* Animated Glow Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto text-center z-10">

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-rose-200 text-xs font-bold mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Now searching 728+ airlines
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-tight drop-shadow-2xl">
              Go near. Go far. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-300 to-yellow-200">Go Cheap.</span>
            </h1>
            <p className="text-indigo-100/90 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Unlock secret flight deals airlines don't want you to see. <br className="hidden md:block" />
              We find the cheapest prices in seconds.
            </p>
          </motion.div>

          {/* SEARCH ENGINE - Custom UI */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative z-20 mt-8 max-w-5xl mx-auto text-left transform hover:scale-[1.002] transition-transform duration-500"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-[2rem] opacity-30 blur-2xl animate-pulse"></div>
            <SearchEngine />
          </motion.div>

        </div>
      </div>

      {/* AIRLINE PARTNERS - Marquee */}
      <AirlinePartners />

      {/* FEATURED DESTINATIONS - New Panel */}
      <FeaturedDestinations />

      {/* NEWSLETTER SECTION */}
      <Newsletter />

      {/* FEATURES / VALUE PROPS - Horizontal Cards */}
      <div className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-8 text-zinc-900">Why travelers love All Trip</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {[
            {
              icon: ShieldCheck,
              color: "text-rose-500",
              title: "Trusted Booking",
              desc: "We partner with verified airlines to ensure your ticket is legit and secure."
            },
            {
              icon: Zap,
              color: "text-orange-500",
              title: "Lightning Fast",
              desc: "Our bot searches 728 airlines in seconds to find the absolute lowest price."
            },
            {
              icon: Map,
              color: "text-purple-500",
              title: "Hidden Gems",
              desc: "Don't know where to go? Use our \"Explore\" feature to find cheap adventures."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-zinc-50 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-zinc-200"
            >
              <feature.icon className={`w-10 h-10 ${feature.color} mb-6`} />
              <h3 className="font-bold text-xl mb-2 text-zinc-900">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}

        </div>
      </div>

    </main>
  );
}
