'use client';

import React from 'react';

interface CityDriveBackgroundProps {
  variant?: 'hero' | 'ambient' | 'banner';
  className?: string;
  showCar?: boolean;
}

/**
 * Single modular repeating block of the outline City Skyline & Trees
 * Exactly inspired by the reference image with line-art skyscrapers,
 * window grids, stepped rooftops, antennas, and roadside trees.
 */
const SkylineSegment: React.FC = () => {
  return (
    <svg
      viewBox="0 0 1600 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[1600px] h-[160px] flex-shrink-0"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Subtle shadow for skyline line art */}
        <filter id="glow-skyline" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#000000" floodOpacity="0.08" />
        </filter>
        <linearGradient id="building-stroke-grad" x1="0" y1="0" x2="0" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#334155" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Baseline Road Line */}
      <line x1="0" y1="156" x2="1600" y2="156" stroke="#0f172a" strokeOpacity="0.85" strokeWidth="2.5" />

      {/* Group of Outlined Buildings & Trees matching reference image */}
      <g stroke="url(#building-stroke-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        
        {/* Building 1: Stepped Small Block */}
        <path d="M 10 156 V 92 H 36 V 156" />
        <line x1="18" y1="104" x2="28" y2="104" strokeWidth="1.5" />
        <line x1="18" y1="116" x2="28" y2="116" strokeWidth="1.5" />
        <line x1="18" y1="128" x2="28" y2="128" strokeWidth="1.5" />
        <line x1="18" y1="140" x2="28" y2="140" strokeWidth="1.5" />

        {/* Tree 1 */}
        <circle cx="56" cy="126" r="14" strokeWidth="1.6" />
        <circle cx="56" cy="126" r="6" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="56" y1="140" x2="56" y2="156" strokeWidth="1.8" />

        {/* Building 2: Slanted Roof Commercial Highrise */}
        <path d="M 80 156 V 68 L 108 54 V 156" />
        {/* Window Grids */}
        <line x1="88" y1="80" x2="100" y2="76" strokeWidth="1.4" />
        <line x1="88" y1="94" x2="100" y2="90" strokeWidth="1.4" />
        <line x1="88" y1="108" x2="100" y2="104" strokeWidth="1.4" />
        <line x1="88" y1="122" x2="100" y2="118" strokeWidth="1.4" />
        <line x1="88" y1="136" x2="100" y2="132" strokeWidth="1.4" />

        {/* Tree 2 */}
        <circle cx="128" cy="132" r="11" strokeWidth="1.5" />
        <line x1="128" y1="143" x2="128" y2="156" strokeWidth="1.8" />

        {/* Building 3: Mid-rise with Antennas */}
        <path d="M 152 156 V 76 H 188 V 156" />
        <path d="M 164 76 V 62 H 176 V 76" />
        <line x1="170" y1="62" x2="170" y2="44" strokeWidth="1.5" />
        <circle cx="170" cy="42" r="2" fill="#0f172a" />
        {/* Dual Window columns */}
        <line x1="160" y1="90" x2="166" y2="90" strokeWidth="1.5" />
        <line x1="174" y1="90" x2="180" y2="90" strokeWidth="1.5" />
        <line x1="160" y1="104" x2="166" y2="104" strokeWidth="1.5" />
        <line x1="174" y1="104" x2="180" y2="104" strokeWidth="1.5" />
        <line x1="160" y1="118" x2="166" y2="118" strokeWidth="1.5" />
        <line x1="174" y1="118" x2="180" y2="118" strokeWidth="1.5" />
        <line x1="160" y1="132" x2="166" y2="132" strokeWidth="1.5" />
        <line x1="174" y1="132" x2="180" y2="132" strokeWidth="1.5" />

        {/* Tree 3 */}
        <circle cx="210" cy="130" r="12" strokeWidth="1.5" />
        <line x1="210" y1="142" x2="210" y2="156" strokeWidth="1.8" />

        {/* Building 4: Tall Stepped Tower (Centerpiece 1) */}
        <path d="M 234 156 V 82 H 246 V 48 H 272 V 82 H 284 V 156" />
        <line x1="259" y1="48" x2="259" y2="30" strokeWidth="1.6" />
        <circle cx="259" cy="28" r="2.5" fill="#0f172a" />
        {/* Tower Windows */}
        <line x1="252" y1="62" x2="266" y2="62" strokeWidth="1.5" />
        <line x1="252" y1="74" x2="266" y2="74" strokeWidth="1.5" />
        <line x1="240" y1="96" x2="248" y2="96" strokeWidth="1.5" />
        <line x1="255" y1="96" x2="263" y2="96" strokeWidth="1.5" />
        <line x1="270" y1="96" x2="278" y2="96" strokeWidth="1.5" />
        <line x1="240" y1="112" x2="248" y2="112" strokeWidth="1.5" />
        <line x1="255" y1="112" x2="263" y2="112" strokeWidth="1.5" />
        <line x1="270" y1="112" x2="278" y2="112" strokeWidth="1.5" />
        <line x1="240" y1="128" x2="248" y2="128" strokeWidth="1.5" />
        <line x1="255" y1="128" x2="263" y2="128" strokeWidth="1.5" />
        <line x1="270" y1="128" x2="278" y2="128" strokeWidth="1.5" />
        <line x1="240" y1="144" x2="248" y2="144" strokeWidth="1.5" />
        <line x1="255" y1="144" x2="263" y2="144" strokeWidth="1.5" />
        <line x1="270" y1="144" x2="278" y2="144" strokeWidth="1.5" />

        {/* Tree 4 & 5 */}
        <circle cx="304" cy="134" r="10" strokeWidth="1.5" />
        <line x1="304" y1="144" x2="304" y2="156" strokeWidth="1.8" />
        <circle cx="324" cy="130" r="12" strokeWidth="1.5" />
        <line x1="324" y1="142" x2="324" y2="156" strokeWidth="1.8" />

        {/* Building 5: Angular Modern Office Complex */}
        <path d="M 346 156 V 56 L 382 72 V 156" />
        <line x1="356" y1="80" x2="372" y2="86" strokeWidth="1.5" />
        <line x1="356" y1="96" x2="372" y2="102" strokeWidth="1.5" />
        <line x1="356" y1="112" x2="372" y2="118" strokeWidth="1.5" />
        <line x1="356" y1="128" x2="372" y2="134" strokeWidth="1.5" />
        <line x1="356" y1="144" x2="372" y2="150" strokeWidth="1.5" />

        {/* Tree 6 */}
        <circle cx="404" cy="128" r="13" strokeWidth="1.5" />
        <circle cx="404" cy="128" r="5" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="404" y1="141" x2="404" y2="156" strokeWidth="1.8" />

        {/* Building 6: Cathedral/Arch Roof Highrise */}
        <path d="M 428 156 V 78 L 444 60 L 460 78 V 156" />
        <circle cx="444" cy="74" r="6" strokeWidth="1.4" />
        <line x1="436" y1="94" x2="452" y2="94" strokeWidth="1.5" />
        <line x1="436" y1="108" x2="452" y2="108" strokeWidth="1.5" />
        <line x1="436" y1="122" x2="452" y2="122" strokeWidth="1.5" />
        <line x1="436" y1="136" x2="452" y2="136" strokeWidth="1.5" />
        <line x1="436" y1="148" x2="452" y2="148" strokeWidth="1.5" />

        {/* Attached Block */}
        <path d="M 460 156 V 90 H 488 V 156" />
        <line x1="468" y1="102" x2="480" y2="102" strokeWidth="1.5" />
        <line x1="468" y1="116" x2="480" y2="116" strokeWidth="1.5" />
        <line x1="468" y1="130" x2="480" y2="130" strokeWidth="1.5" />
        <line x1="468" y1="144" x2="480" y2="144" strokeWidth="1.5" />

        {/* Tree 7 */}
        <circle cx="508" cy="133" r="11" strokeWidth="1.5" />
        <line x1="508" y1="144" x2="508" y2="156" strokeWidth="1.8" />

        {/* Building 7: Twin Peak Tower */}
        <path d="M 528 156 V 64 L 544 50 L 560 64 V 156" />
        <path d="M 560 156 V 76 L 576 62 L 592 76 V 156" />
        <line x1="536" y1="84" x2="552" y2="84" strokeWidth="1.4" />
        <line x1="536" y1="100" x2="552" y2="100" strokeWidth="1.4" />
        <line x1="536" y1="116" x2="552" y2="116" strokeWidth="1.4" />
        <line x1="536" y1="132" x2="552" y2="132" strokeWidth="1.4" />
        <line x1="568" y1="92" x2="584" y2="92" strokeWidth="1.4" />
        <line x1="568" y1="108" x2="584" y2="108" strokeWidth="1.4" />
        <line x1="568" y1="124" x2="584" y2="124" strokeWidth="1.4" />
        <line x1="568" y1="140" x2="584" y2="140" strokeWidth="1.4" />

        {/* Trees 8 & 9 */}
        <circle cx="612" cy="130" r="13" strokeWidth="1.5" />
        <line x1="612" y1="143" x2="612" y2="156" strokeWidth="1.8" />
        <circle cx="634" cy="135" r="9" strokeWidth="1.5" />
        <line x1="634" y1="144" x2="634" y2="156" strokeWidth="1.8" />

        {/* Building 8: Modern Concave Centerpiece Tower */}
        <path d="M 654 156 V 40 H 688 V 156" />
        <line x1="671" y1="40" x2="671" y2="18" strokeWidth="1.8" />
        <circle cx="671" cy="16" r="3" fill="#0f172a" />
        {/* Modern vertical split and horizontal stripes */}
        <line x1="671" y1="40" x2="671" y2="156" strokeWidth="1.2" strokeOpacity="0.6" />
        <line x1="660" y1="56" x2="682" y2="56" strokeWidth="1.5" />
        <line x1="660" y1="72" x2="682" y2="72" strokeWidth="1.5" />
        <line x1="660" y1="88" x2="682" y2="88" strokeWidth="1.5" />
        <line x1="660" y1="104" x2="682" y2="104" strokeWidth="1.5" />
        <line x1="660" y1="120" x2="682" y2="120" strokeWidth="1.5" />
        <line x1="660" y1="136" x2="682" y2="136" strokeWidth="1.5" />

        {/* Tree 10 */}
        <circle cx="708" cy="130" r="12" strokeWidth="1.5" />
        <circle cx="708" cy="130" r="5" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="708" y1="142" x2="708" y2="156" strokeWidth="1.8" />

        {/* Building 9: Stepped Residential Block */}
        <path d="M 730 156 V 96 H 746 V 74 H 768 V 96 H 782 V 156" />
        <line x1="757" y1="74" x2="757" y2="58" strokeWidth="1.4" />
        <line x1="738" y1="110" x2="774" y2="110" strokeWidth="1.4" />
        <line x1="738" y1="126" x2="774" y2="126" strokeWidth="1.4" />
        <line x1="738" y1="142" x2="774" y2="142" strokeWidth="1.4" />

        {/* Tree 11 */}
        <circle cx="802" cy="134" r="11" strokeWidth="1.5" />
        <line x1="802" y1="145" x2="802" y2="156" strokeWidth="1.8" />

        {/* Building 10: Mirrored Modern Highrise */}
        <path d="M 824 156 V 70 L 856 52 V 156" />
        <line x1="832" y1="80" x2="848" y2="72" strokeWidth="1.4" />
        <line x1="832" y1="96" x2="848" y2="88" strokeWidth="1.4" />
        <line x1="832" y1="112" x2="848" y2="104" strokeWidth="1.4" />
        <line x1="832" y1="128" x2="848" y2="120" strokeWidth="1.4" />
        <line x1="832" y1="144" x2="848" y2="136" strokeWidth="1.4" />

        {/* Tree 12 & 13 */}
        <circle cx="878" cy="130" r="12" strokeWidth="1.5" />
        <line x1="878" y1="142" x2="878" y2="156" strokeWidth="1.8" />
        <circle cx="900" cy="136" r="9" strokeWidth="1.5" />
        <line x1="900" y1="145" x2="900" y2="156" strokeWidth="1.8" />

        {/* Building 11: Grand City Center with Crown */}
        <path d="M 922 156 V 58 H 936 V 34 H 968 V 58 H 982 V 156" />
        <line x1="952" y1="34" x2="952" y2="16" strokeWidth="1.8" />
        <circle cx="952" cy="14" r="3" fill="#0f172a" />
        {/* Crown & grid */}
        <line x1="942" y1="48" x2="962" y2="48" strokeWidth="1.5" />
        <line x1="930" y1="74" x2="974" y2="74" strokeWidth="1.5" />
        <line x1="930" y1="92" x2="974" y2="92" strokeWidth="1.5" />
        <line x1="930" y1="110" x2="974" y2="110" strokeWidth="1.5" />
        <line x1="930" y1="128" x2="974" y2="128" strokeWidth="1.5" />
        <line x1="930" y1="144" x2="974" y2="144" strokeWidth="1.5" />

        {/* Tree 14 */}
        <circle cx="1004" cy="130" r="13" strokeWidth="1.5" />
        <circle cx="1004" cy="130" r="5" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="1004" y1="143" x2="1004" y2="156" strokeWidth="1.8" />

        {/* Building 12: Angled Office Block */}
        <path d="M 1028 156 V 66 L 1060 82 V 156" />
        <line x1="1036" y1="88" x2="1052" y2="96" strokeWidth="1.4" />
        <line x1="1036" y1="104" x2="1052" y2="112" strokeWidth="1.4" />
        <line x1="1036" y1="120" x2="1052" y2="128" strokeWidth="1.4" />
        <line x1="1036" y1="136" x2="1052" y2="144" strokeWidth="1.4" />

        {/* Tree 15 */}
        <circle cx="1082" cy="133" r="11" strokeWidth="1.5" />
        <line x1="1082" y1="144" x2="1082" y2="156" strokeWidth="1.8" />

        {/* Building 13: Highrise with Rooftop Gazebo */}
        <path d="M 1104 156 V 80 H 1144 V 156" />
        <path d="M 1114 80 L 1124 66 L 1134 80" />
        <line x1="1124" y1="66" x2="1124" y2="52" strokeWidth="1.4" />
        <circle cx="1124" cy="50" r="2" fill="#0f172a" />
        <line x1="1112" y1="96" x2="1136" y2="96" strokeWidth="1.5" />
        <line x1="1112" y1="112" x2="1136" y2="112" strokeWidth="1.5" />
        <line x1="1112" y1="128" x2="1136" y2="128" strokeWidth="1.5" />
        <line x1="1112" y1="144" x2="1136" y2="144" strokeWidth="1.5" />

        {/* Trees 16 & 17 */}
        <circle cx="1166" cy="130" r="12" strokeWidth="1.5" />
        <line x1="1166" y1="142" x2="1166" y2="156" strokeWidth="1.8" />
        <circle cx="1188" cy="135" r="9" strokeWidth="1.5" />
        <line x1="1188" y1="144" x2="1188" y2="156" strokeWidth="1.8" />

        {/* Building 14: Modern Slanted Skyscraper */}
        <path d="M 1210 156 V 46 L 1248 64 V 156" />
        <line x1="1220" y1="74" x2="1238" y2="82" strokeWidth="1.5" />
        <line x1="1220" y1="92" x2="1238" y2="100" strokeWidth="1.5" />
        <line x1="1220" y1="110" x2="1238" y2="118" strokeWidth="1.5" />
        <line x1="1220" y1="128" x2="1238" y2="136" strokeWidth="1.5" />
        <line x1="1220" y1="144" x2="1238" y2="152" strokeWidth="1.5" />

        {/* Tree 18 */}
        <circle cx="1270" cy="128" r="13" strokeWidth="1.5" />
        <circle cx="1270" cy="128" r="5" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="1270" y1="141" x2="1270" y2="156" strokeWidth="1.8" />

        {/* Building 15: Cathedral Dome Center */}
        <path d="M 1294 156 V 82 L 1312 62 L 1330 82 V 156" />
        <circle cx="1312" cy="76" r="6" strokeWidth="1.4" />
        <line x1="1302" y1="96" x2="1322" y2="96" strokeWidth="1.5" />
        <line x1="1302" y1="112" x2="1322" y2="112" strokeWidth="1.5" />
        <line x1="1302" y1="128" x2="1322" y2="128" strokeWidth="1.5" />
        <line x1="1302" y1="144" x2="1322" y2="144" strokeWidth="1.5" />

        {/* Attached Block */}
        <path d="M 1330 156 V 94 H 1358 V 156" />
        <line x1="1338" y1="108" x2="1350" y2="108" strokeWidth="1.5" />
        <line x1="1338" y1="124" x2="1350" y2="124" strokeWidth="1.5" />
        <line x1="1338" y1="140" x2="1350" y2="140" strokeWidth="1.5" />

        {/* Tree 19 */}
        <circle cx="1380" cy="133" r="11" strokeWidth="1.5" />
        <line x1="1380" y1="144" x2="1380" y2="156" strokeWidth="1.8" />

        {/* Building 16: Stepped Tower with Antenna */}
        <path d="M 1402 156 V 84 H 1416 V 50 H 1442 V 84 H 1456 V 156" />
        <line x1="1429" y1="50" x2="1429" y2="30" strokeWidth="1.6" />
        <circle cx="1429" cy="28" r="2.5" fill="#0f172a" />
        <line x1="1410" y1="98" x2="1448" y2="98" strokeWidth="1.5" />
        <line x1="1410" y1="114" x2="1448" y2="114" strokeWidth="1.5" />
        <line x1="1410" y1="130" x2="1448" y2="130" strokeWidth="1.5" />
        <line x1="1410" y1="144" x2="1448" y2="144" strokeWidth="1.5" />

        {/* Trees 20 & 21 */}
        <circle cx="1478" cy="130" r="12" strokeWidth="1.5" />
        <line x1="1478" y1="142" x2="1478" y2="156" strokeWidth="1.8" />
        <circle cx="1500" cy="135" r="9" strokeWidth="1.5" />
        <line x1="1500" y1="144" x2="1500" y2="156" strokeWidth="1.8" />

        {/* Building 17: Finishing Block connecting seamlessly */}
        <path d="M 1522 156 V 72 L 1554 56 V 156" />
        <line x1="1530" y1="84" x2="1546" y2="76" strokeWidth="1.4" />
        <line x1="1530" y1="102" x2="1546" y2="94" strokeWidth="1.4" />
        <line x1="1530" y1="120" x2="1546" y2="112" strokeWidth="1.4" />
        <line x1="1530" y1="138" x2="1546" y2="130" strokeWidth="1.4" />

        {/* Final Tree connecting to next loop */}
        <circle cx="1576" cy="128" r="13" strokeWidth="1.5" />
        <circle cx="1576" cy="128" r="5" strokeWidth="1.2" strokeOpacity="0.7" />
        <line x1="1576" y1="141" x2="1576" y2="156" strokeWidth="1.8" />
      </g>
    </svg>
  );
};

/**
 * High-detail Vector White Sedan Car
 * Styled exactly like the modern luxury white sedan in the user's reference image
 * with rotating alloy wheels, glowing light-green/white headlights, and red taillights.
 */
const ModernWhiteSedan: React.FC = () => {
  return (
    <div className="relative w-[210px] h-[72px] pointer-events-none select-none animate-car-bounce">
      
      {/* Headlight Forward Light Beam (Casting on road) */}
      <div className="headlight-beam absolute top-[30px] right-[-140px] w-[150px] h-[34px] z-0 opacity-80" />

      {/* Car Body SVG */}
      <svg
        viewBox="0 0 240 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[210px] h-[72px] relative z-10 filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.22)]"
      >
        <defs>
          {/* Car Metallic White Gradient */}
          <linearGradient id="carBodyGrad" x1="0" y1="0" x2="0" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Tinted Glass Gradient */}
          <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#090D16" stopOpacity="0.98" />
          </linearGradient>

          {/* Underbody Shadow */}
          <linearGradient id="underbodyGrad" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B0F19" />
            <stop offset="100%" stopColor="#020408" />
          </linearGradient>
        </defs>

        {/* 1. Main Aerodynamic Sedan Chassis (Profile) */}
        <path
          d="M 12 55 
             C 10 55 8 50 10 44
             C 13 36 22 34 32 33
             C 42 32 54 31 66 23
             C 76 16 95 10 128 10
             C 162 10 182 17 194 28
             C 204 35 220 38 230 43
             C 236 46 238 52 236 56
             C 234 58 226 60 216 60
             C 214 53 205 47 194 47
             C 183 47 174 53 172 60
             L 76 60
             C 74 53 65 47 54 47
             C 43 47 34 53 32 60
             L 16 60
             Z"
          fill="url(#carBodyGrad)"
          stroke="#94A3B8"
          strokeWidth="0.8"
        />

        {/* 2. Sleek Tinted Windows & Roof Pillars */}
        <path
          d="M 68 25 
             C 78 18 96 13 126 13 
             C 156 13 174 19 184 29 
             L 190 32 
             L 66 32 
             Z"
          fill="url(#glassGrad)"
          stroke="#334155"
          strokeWidth="0.7"
        />
        {/* Center B-pillar divider */}
        <line x1="126" y1="13" x2="126" y2="32" stroke="#475569" strokeWidth="2.5" />
        {/* Chrome Window Trim Outline */}
        <path
          d="M 66 32 C 78 17 96 12 126 12 C 156 12 175 18 186 30"
          stroke="#E2E8F0"
          strokeWidth="1.2"
          fill="none"
        />

        {/* 3. Aerodynamic Contour Swage Line along Side */}
        <path
          d="M 30 38 C 70 38 150 36 226 46"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* 4. Door Cut Lines */}
        <path d="M 82 32 L 82 58" stroke="#94A3B8" strokeWidth="0.7" />
        <path d="M 128 32 L 128 58" stroke="#94A3B8" strokeWidth="0.7" />
        <path d="M 172 32 L 172 56" stroke="#94A3B8" strokeWidth="0.7" />

        {/* Flush Chrome Door Handles */}
        <rect x="94" y="37" width="10" height="2" rx="1" fill="#475569" stroke="#E2E8F0" strokeWidth="0.5" />
        <rect x="140" y="37" width="10" height="2" rx="1" fill="#475569" stroke="#E2E8F0" strokeWidth="0.5" />

        {/* Side Mirror */}
        <path d="M 70 30 C 66 28 62 30 64 34 L 72 34 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.8" />

        {/* 5. Front Headlight: Modern LED Projector in Pure Crisp White */}
        <path
          d="M 224 44 C 230 45 236 48 234 52 L 222 52 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1"
        />
        <circle cx="228" cy="48" r="2.5" fill="#FFFFFF" />
        <circle cx="228" cy="48" r="1.2" fill="#CBD5E1" />

        {/* 6. Rear Taillight: Distinctive Red LED Wrap-around */}
        <path
          d="M 10 44 C 14 44 18 46 18 49 L 11 49 Z"
          fill="#EF4444"
          stroke="#DC2626"
          strokeWidth="0.8"
        />
        <circle cx="14" cy="46" r="1.5" fill="#F87171" />

        {/* 7. Front Lower Air Dam & Grille Accent */}
        <rect x="220" y="54" width="12" height="4" rx="1.5" fill="#0F172A" />

        {/* 8. Underbody Bottom Skirt */}
        <path d="M 14 60 L 32 60 L 76 60 L 172 60 L 216 60 L 232 60" stroke="#0F172A" strokeWidth="2.5" />

        {/* 9. Wheel Arches Shadow Fill */}
        <circle cx="54" cy="60" r="16" fill="#090D16" />
        <circle cx="194" cy="60" r="16" fill="#090D16" />
      </svg>

      {/* Rotating Rear Wheel (Alloy Rim + Rubber Tire) */}
      <div
        className="absolute top-[44px] left-[38px] w-[32px] h-[32px] z-20 animate-wheel-spin"
        style={{ transformOrigin: 'center' }}
      >
        <svg viewBox="0 0 32 32" className="w-full h-full">
          {/* Black Rubber Tire */}
          <circle cx="16" cy="16" r="15" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          {/* Alloy Rim Inner Ring */}
          <circle cx="16" cy="16" r="11" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1" />
          {/* 5-Spoke Alloy Pattern */}
          <line x1="16" y1="5" x2="16" y2="27" stroke="#CBD5E1" strokeWidth="1.8" />
          <line x1="6" y1="12" x2="26" y2="20" stroke="#CBD5E1" strokeWidth="1.8" />
          <line x1="6" y1="20" x2="26" y2="12" stroke="#CBD5E1" strokeWidth="1.8" />
          {/* Brake Rotor & Caliper accent */}
          <circle cx="16" cy="16" r="6" fill="#475569" />
          {/* Center Chrome Cap */}
          <circle cx="16" cy="16" r="3.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1" />
        </svg>
      </div>

      {/* Rotating Front Wheel (Alloy Rim + Rubber Tire) */}
      <div
        className="absolute top-[44px] left-[160px] w-[32px] h-[32px] z-20 animate-wheel-spin"
        style={{ transformOrigin: 'center' }}
      >
        <svg viewBox="0 0 32 32" className="w-full h-full">
          {/* Black Rubber Tire */}
          <circle cx="16" cy="16" r="15" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          {/* Alloy Rim Inner Ring */}
          <circle cx="16" cy="16" r="11" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1" />
          {/* 5-Spoke Alloy Pattern */}
          <line x1="16" y1="5" x2="16" y2="27" stroke="#CBD5E1" strokeWidth="1.8" />
          <line x1="6" y1="12" x2="26" y2="20" stroke="#CBD5E1" strokeWidth="1.8" />
          <line x1="6" y1="20" x2="26" y2="12" stroke="#CBD5E1" strokeWidth="1.8" />
          {/* Brake Rotor & Caliper accent */}
          <circle cx="16" cy="16" r="6" fill="#475569" />
          {/* Center Chrome Cap */}
          <circle cx="16" cy="16" r="3.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1" />
        </svg>
      </div>

    </div>
  );
};

export const CityDriveBackground: React.FC<CityDriveBackgroundProps> = ({
  variant = 'hero',
  className = '',
  showCar = true,
}) => {
  return (
    <div
      className={`city-drive-container relative w-full overflow-hidden select-none pointer-events-none ${
        variant === 'hero'
          ? 'h-[200px] lg:h-[230px]'
          : variant === 'banner'
          ? 'h-[160px]'
          : 'h-[140px]'
      } ${className}`}
      aria-hidden="true"
    >
      {/* 1. Subtle Dark Vignette & Top Fade */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-transparent via-transparent to-brand-dark/90" />
      <div className="absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-brand-dark to-transparent" />
      <div className="absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-brand-dark to-transparent" />

      {/* 2. Parallax Infinite Skyline Track (Two identical segments looping side-by-side) */}
      <div className="absolute bottom-6 left-0 flex w-[3200px] animate-city-scroll">
        <SkylineSegment />
        <SkylineSegment />
      </div>

      {/* 3. Secondary Slower Far Skyline (Adding Depth Parallax) */}
      <div className="absolute bottom-10 left-0 flex w-[3200px] opacity-35 animate-city-scroll-slow">
        <div className="scale-90 origin-bottom">
          <SkylineSegment />
        </div>
        <div className="scale-90 origin-bottom">
          <SkylineSegment />
        </div>
      </div>

      {/* 4. Moving Road Dashes */}
      <div className="absolute bottom-6 left-0 right-0 h-[3px] overflow-hidden z-10">
        <div className="flex w-[200%] animate-road-dash">
          {Array.from({ length: 80 }).map((_, i) => (
            <span
              key={i}
              className="inline-block w-8 h-[2px] bg-slate-800/80 rounded-full mx-3 flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* 5. Cruising Modern White Sedan (Smooth Highway Drive Position) */}
      {showCar && (
        <div className="absolute bottom-[2px] left-[8%] sm:left-[14%] lg:left-[20%] z-20">
          <ModernWhiteSedan />
        </div>
      )}

      {/* 6. Road Ground Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-brand-dark" />
    </div>
  );
};

export default CityDriveBackground;
