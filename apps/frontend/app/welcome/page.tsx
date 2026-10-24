'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const FLOATING_CARDS = [
  { emoji: '◓', label: 'Pokeball',    delay: '0s',    x: '6%',  y: '12%', dur: '4s'   },
  { emoji: '▼ω▼',  label: 'Pikachu',    delay: '0.4s',  x: '88%', y: '8%',  dur: '4.5s' },
  { emoji: '◉_◉',  label: 'MTG',        delay: '0.8s',  x: '4%',  y: '62%', dur: '3.8s' },
  { emoji: '✦◓✦',  label: 'One Piece',  delay: '1.2s',  x: '90%', y: '58%', dur: '5s'   },
  { emoji: '◣д◢', label: 'Yu-Gi-Oh',  delay: '0.6s',  x: '48%', y: '4%',  dur: '4.2s' },
  { emoji: '〇o〇',  label: 'Dragon',     delay: '1.4s',  x: '10%', y: '85%', dur: '3.6s' },
  { emoji: '◥◣_◢◤',  label: 'Card',       delay: '0.2s',  x: '82%', y: '82%', dur: '4.8s' },
  { emoji: '⚆ _ ⚆',  label: 'Star',       delay: '1.6s',  x: '55%', y: '90%', dur: '4.4s' },
]

export default function WelcomePage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setTimeout(() => setReady(true), 80)
  }, [])

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      <style>{`
        /* Card fan/spread reveal animation */
        @keyframes cardFan {
          0%   { 
            transform: translateY(100vh) rotate(0deg) scale(0.3); 
            opacity: 0; 
          }
          60%  { 
            transform: translateY(-20px) rotate(5deg) scale(1.15); 
            opacity: 1; 
          }
          80%  { 
            transform: translateY(10px) rotate(-3deg) scale(0.95); 
          }
          100% { 
            transform: translateY(0) rotate(0deg) scale(1); 
            opacity: 1; 
          }
        }

        /* Foil shine sweep across card */
        @keyframes foilSweep {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        /* Magic circle rotation */
        @keyframes magicSpin {
          0%   { transform: rotate(0deg) translateY(0) scale(1); }
          25%  { transform: rotate(90deg) translateY(-25px) scale(1.1); }
          50%  { transform: rotate(180deg) translateY(0) scale(1); }
          75%  { transform: rotate(270deg) translateY(-15px) scale(1.05); }
          100% { transform: rotate(360deg) translateY(0) scale(1); }
        }

        /* Card summoning circle */
        @keyframes summonRitual {
          0%   { 
            transform: rotate(0deg) scale(0); 
            opacity: 0;
            filter: blur(10px);
          }
          40%  { 
            transform: rotate(180deg) scale(1.2); 
            opacity: 0.8;
            filter: blur(0px);
          }
          70%  { 
            transform: rotate(340deg) scale(0.9); 
            opacity: 1;
          }
          100% { 
            transform: rotate(360deg) scale(1); 
            opacity: 1;
          }
        }

        /* Holographic shimmer border */
        @keyframes holoShimmer {
          0%   { 
            box-shadow: 
              0 0 10px rgba(255,0,128,0.4),
              0 0 20px rgba(0,255,255,0.2),
              inset 0 0 10px rgba(255,255,255,0.1);
            border-color: #ff0080;
          }
          33%  { 
            box-shadow: 
              0 0 10px rgba(0,255,255,0.4),
              0 0 20px rgba(128,0,255,0.2),
              inset 0 0 10px rgba(255,255,255,0.1);
            border-color: #00ffff;
          }
          66%  { 
            box-shadow: 
              0 0 10px rgba(128,0,255,0.4),
              0 0 20px rgba(255,0,128,0.2),
              inset 0 0 10px rgba(255,255,255,0.1);
            border-color: #8000ff;
          }
          100% { 
            box-shadow: 
              0 0 10px rgba(255,0,128,0.4),
              0 0 20px rgba(0,255,255,0.2),
              inset 0 0 10px rgba(255,255,255,0.1);
            border-color: #ff0080;
          }
        }

        /* Rare card pull glow */
        @keyframes rarePull {
          0%   { 
            transform: perspective(800px) rotateY(0deg) translateY(0);
            filter: brightness(1);
          }
          20%  { 
            transform: perspective(800px) rotateY(180deg) translateY(-30px);
            filter: brightness(2);
          }
          40%  { 
            transform: perspective(800px) rotateY(360deg) translateY(0);
            filter: brightness(1.5);
          }
          60%  { 
            transform: perspective(800px) rotateY(360deg) translateY(-15px) scale(1.15);
            filter: brightness(2.5);
          }
          80%  { 
            transform: perspective(800px) rotateY(360deg) translateY(0) scale(1);
            filter: brightness(1.2);
          }
          100% { 
            transform: perspective(800px) rotateY(360deg) translateY(0) scale(1);
            filter: brightness(1);
          }
        }

        /* Floating card pack opening */
        @keyframes packCrack {
          0%   { transform: translateY(0) scale(1) rotate(0deg); }
          15%  { transform: translateY(-40px) scale(1.3) rotate(15deg); }
          30%  { transform: translateY(-20px) scale(0.8) rotate(-10deg); }
          45%  { transform: translateY(-35px) scale(1.1) rotate(5deg); }
          60%  { transform: translateY(-15px) scale(0.95) rotate(-3deg); }
          75%  { transform: translateY(-25px) scale(1.05) rotate(2deg); }
          100% { transform: translateY(0) scale(1) rotate(0deg); }
        }

        @keyframes heroEntrance {
          0%   { opacity:0; transform: scale(0.8) translateY(40px); }
          60%  { opacity:1; transform: scale(1.05) translateY(-8px); }
          100% { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes slideUpFade {
          from { opacity:0; transform: translateY(60px) rotateX(-15deg); }
          to   { opacity:1; transform: translateY(0) rotateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70%  { box-shadow: 0 0 0 25px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        @keyframes bounceIn {
          0%   { opacity:0; transform: scale(0.3); }
          50%  { opacity:1; transform: scale(1.1); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Assign different animations to cards */
        .float-card-fan { animation: cardFan 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards, magicSpin 8s ease-in-out infinite 0.8s; }
        .float-card-rare { animation: rarePull 6s ease-in-out infinite; }
        .float-card-summon { animation: summonRitual 1s cubic-bezier(0.68,-0.55,0.265,1.55) forwards, magicSpin 10s linear infinite 1s; }
        .float-card-pack { animation: packCrack 5s ease-in-out infinite; }
        .float-card-holo { animation: magicSpin 7s ease-in-out infinite; }

        .hero-entrance { 
          opacity:0; 
          animation: heroEntrance 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards; 
        }
        .slide-up-fade { 
          opacity:0; 
          animation: slideUpFade 0.7s cubic-bezier(0.16,1,0.3,1) forwards; 
        }
        .shimmer {
          background: linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899,#f59e0b,#3b82f6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2.5s linear infinite;
        }
        .pulse-cta {
          animation: pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite;
        }
        .bounce-in {
          animation: bounceIn 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) forwards;
        }
        .gradient-bg {
          background: linear-gradient(135deg,#667eea,#764ba2,#f093fb,#667eea);
          background-size: 300% 300%;
          animation: gradientShift 4s ease infinite;
        }

        /* Holographic card effect */
        .holo-card {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.9) 0%,
            rgba(255,200,255,0.9) 25%,
            rgba(200,255,255,0.9) 50%,
            rgba(255,255,200,0.9) 75%,
            rgba(255,255,255,0.9) 100%
          ) !important;
          background-size: 400% 400% !important;
          animation: foilSweep 3s linear infinite, holoShimmer 2s ease-in-out infinite !important;
        }

        /* Magic circle card */
        .magic-card {
          background: radial-gradient(circle at center, rgba(255,215,0,0.3), rgba(128,0,255,0.3)) !important;
          border: 2px solid rgba(255,215,0,0.6) !important;
          box-shadow: 
            0 0 15px rgba(255,215,0,0.4),
            0 0 30px rgba(128,0,255,0.2),
            inset 0 0 20px rgba(255,255,255,0.1) !important;
        }
      `}</style>

      {/* Nav */}
      <nav className="relative z-50 px-5 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="BHT" className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-300" />
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            Pullverse <span className="text-blue-500">TCG</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 px-3 py-1.5 transition-all duration-300 hover:scale-105 hidden sm:block">
            Sign in
          </Link>
          <Link href="/register"
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">

        {/* Dynamic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/40 to-pink-50/60 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-gray-950 pointer-events-none" />
        
        {/* Animated gradient orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating TCG emojis - each with unique animation class */}
        {FLOATING_CARDS.map((c, i) => {
          // Cycle through different card animations
          const animClasses = [
            'float-card-fan holo-card',
            'float-card-rare magic-card',
            'float-card-summon',
            'float-card-pack holo-card',
            'float-card-fan',
            'float-card-rare holo-card',
            'float-card-summon magic-card',
            'float-card-pack'
          ]
          
          return (
            <div
              key={i}
              className={`absolute hidden sm:flex items-center justify-center select-none pointer-events-none ${animClasses[i]}`}
              style={{
                left: c.x, top: c.y,
                animationDelay: c.delay,
                fontSize: '2rem',
                width: 60, height: 76,
                backdropFilter: 'blur(8px)',
                borderRadius: 14,
                border: '2px solid rgba(99,102,241,0.2)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
              } as any}
            >
              {c.emoji}
            </div>
          )
        })}

        {/* Hero content */}
        <div className="relative z-10 text-center px-5 max-w-2xl mx-auto">

          {/* Logo */}
          <div className={`transition-all duration-700 ${ready ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} mb-6`}>
            <img
              src="/logo.png"
              alt="Pullverse TCG"
              className="w-24 h-24 object-contain mx-auto hover:rotate-12 transition-transform duration-500"
            />
          </div>

          {/* PH badge */}
          <div className="slide-up-fade mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-full hover:scale-105 transition-transform duration-300"
            style={{ animationDelay: '0.2s' }}>
            🇵🇭 Philippines TCG Marketplace
          </div>

          {/* Headline */}
          <h1 className="hero-entrance text-5xl sm:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight"
            style={{ animationDelay: '0.3s' }}>
            Hunt Your Next<br />
            <span className="shimmer">Booster Hit.</span>
          </h1>

          {/* Description */}
          <p className="slide-up-fade text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-lg mx-auto leading-relaxed font-medium"
            style={{ animationDelay: '0.4s' }}>
            Buy and sell Pokemon, MTG, Yu-Gi-Oh, One Piece cards and accessories
            from verified sellers. On-hand, pre-order, and delivered.
          </p>

          {/* CTAs */}
          <div className="slide-up-fade flex flex-col sm:flex-row gap-4 justify-center mb-12"
            style={{ animationDelay: '0.5s' }}>
            <Link href="/register"
              className="pulse-cta bg-blue-500 hover:bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all duration-300 shadow-xl shadow-blue-500/30 hover:-translate-y-1 hover:shadow-2xl">
              Start for free →
            </Link>
            <Link href="/"
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold px-10 py-4 rounded-2xl text-base hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              Browse cards
            </Link>
          </div>

          {/* Game tags */}
          <div className="slide-up-fade flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '0.6s' }}>
            {[
             
            ].map((g, i) => (
              <span key={g.n}
                className="bounce-in text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full flex items-center gap-2 hover:scale-110 hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                <span className="text-lg">{g.e}</span> {g.n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Simple 3-feature strip */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-5 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { e: '', t: 'On-hand & Pre-order', d: 'Know availability before you buy — on hand, pre-order, or delivered.' },
            { e: '', t: 'Verified sellers',    d: 'Every seller is vetted. Browse hundreds of shops in one place.' },
            { e: '', t: 'Cash on Delivery',    d: 'Pay when your cards arrive. No upfront risk for buyers.' },
          ].map((f, i) => (
            <div key={f.t} 
              className="text-center group hover:scale-105 transition-all duration-300"
              style={{ animation: `bounceIn 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) forwards ${0.2 + i * 0.15}s` }}>
              <div className="text-5xl mb-4 group-hover:animate-bounce transition-transform duration-300">{f.e}</div>
              <p className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.t}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <img src="/logo.png" alt="BHT" className="w-16 h-16 object-contain mx-auto mb-6 opacity-90 hover:rotate-180 transition-transform duration-700" />
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Ready to hunt?</h2>
        <p className="text-base text-gray-500 dark:text-gray-400 mb-8">Join the Philippine TCG community on Pullverse TCG.</p>
        <Link href="/register"
          className="inline-block gradient-bg text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all duration-300 shadow-2xl hover:-translate-y-1 hover:shadow-3xl">
          Create free account →
        </Link>
        <p className="text-sm text-gray-400 mt-8 font-medium">Pullverse TCG · Made in the Philippines 🇵🇭</p>
      </div>
    </main>
  )
}