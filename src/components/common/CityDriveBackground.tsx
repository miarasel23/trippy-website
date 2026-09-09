'use client';

import React from 'react';

interface CityDriveBackgroundProps {
  variant?: 'hero' | 'ambient' | 'banner';
  className?: string;
  showCar?: boolean;
}

/**
 * Distant Skyline Parallax Segment (Atmospheric Far Layer)
 * Soft-toned communication spires, suspension bridge towers & cables, and distant landmarks
 * moving at a slower speed (60s) to create authentic 3D parallax depth.
 */
const DistantSkylineSegment: React.FC = () => {
  return (
    <svg
      viewBox="0 0 1600 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[1600px] h-[180px] flex-shrink-0 pointer-events-none select-none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="distant-facade" x1="0" y1="0" x2="0" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <g stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="url(#distant-facade)">
        {/* Distant Landmark 1: Communication Tower with Observation Pod */}
        <path d="M 88 172 L 104 48 L 98 46 L 98 36 L 118 36 L 118 46 L 112 48 L 128 172 Z" />
        <ellipse cx="108" cy="40" rx="16" ry="5" fill="#cbd5e1" stroke="#94a3b8" />
        <line x1="108" y1="36" x2="108" y2="10" stroke="#64748b" strokeWidth="1.6" />
        <circle cx="108" cy="8" r="2.5" fill="#ef4444" stroke="#dc2626" />

        {/* Distant Office Tower 1 */}
        <rect x="144" y="68" width="46" height="104" />
        <line x1="144" y1="90" x2="190" y2="90" />
        <line x1="144" y1="112" x2="190" y2="112" />
        <line x1="144" y1="134" x2="190" y2="134" />
        <line x1="144" y1="154" x2="190" y2="154" />

        {/* Distant Landmark 2: Pyramid Spire Tower (The Shard Style) */}
        <path d="M 276 172 L 314 20 L 352 172 Z" />
        <line x1="314" y1="20" x2="314" y2="172" strokeDasharray="3 3" />

        {/* Distant Stepped Tower */}
        <path d="M 392 172 V 62 H 418 V 40 H 438 V 62 H 464 V 172 Z" />
        <line x1="428" y1="40" x2="428" y2="22" strokeWidth="1.5" />
        <circle cx="428" cy="20" r="2" fill="#ef4444" />

        {/* Distant Landmark 3: Suspension Bridge Cable Towers */}
        <path d="M 568 172 V 32 H 584 V 172 Z" />
        <path d="M 680 172 V 32 H 696 V 172 Z" />
        <path d="M 515 172 Q 576 32 632 112 T 688 32 Q 745 172 755 172" fill="none" strokeWidth="1.6" stroke="#94a3b8" />

        {/* Distant Slanted Roof Landmark */}
        <path d="M 792 172 V 52 L 836 30 V 172 Z" />

        {/* Distant Landmark 4: Supertall Center Spire */}
        <path d="M 912 172 V 38 H 938 V 18 H 948 V 38 H 974 V 172 Z" />
        <line x1="943" y1="18" x2="943" y2="4" strokeWidth="1.6" stroke="#64748b" />
        <circle cx="943" cy="3" r="2.5" fill="#ef4444" stroke="#dc2626" />

        {/* Distant Blocks */}
        <rect x="1040" y="58" width="72" height="114" />
        <rect x="1134" y="42" width="52" height="130" />
        <line x1="1160" y1="42" x2="1160" y2="26" />

        {/* Distant Landmark 5: Crown Spire */}
        <path d="M 1272 172 V 48 L 1294 28 L 1316 48 V 172 Z" />
        <rect x="1392" y="66" width="56" height="106" />
        <path d="M 1482 172 V 40 L 1524 60 V 172 Z" />
      </g>
    </svg>
  );
};

/**
 * Real Architectural Foreground Skyline Segment (1600px width modular loop)
 * Detailed solid architectural archetypes:
 * 1. Modern 12-Story Commercial High-Rise with stepped penthouse deck & antenna.
 * 2. Diagrid Skyscraper with iconic structural steel X-bracing.
 * 3. Contemporary Slanted Glass Tower with horizontal & vertical mullions.
 * 4. Iconic Twin Towers with suspended Skybridge and pinnacle spires.
 * 5. Luxury Residential Tower with staggered cantilevered balconies and sky lounge.
 * 6. Stepped Art Deco Landmark with fluted columns & stainless spire.
 * 7. High-Tech Diamond Facet Tower with geometric light reflections.
 * 8. Corporate Grand Atrium Complex with emerald-tinted grand glass arch.
 * 9. Aerodynamic Curvilinear Tower with wave louvers.
 * 10. Connecting block and realistic streetscape with boulevard trees & modern LED lamps.
 */
const RealArchitecturalSkylineSegment: React.FC = () => {
  return (
    <svg
      viewBox="0 0 1600 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[1600px] h-[180px] flex-shrink-0 pointer-events-none select-none"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Realistic Solid Glass Facade Gradient */}
        <linearGradient id="real-glass-tower" x1="0" y1="0" x2="0" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="45%" stopColor="#f8fafc" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.95" />
        </linearGradient>

        {/* Sky-Blue Modern Glass Gradient */}
        <linearGradient id="glass-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.6" />
        </linearGradient>

        {/* Atrium Emerald Glass Gradient */}
        <linearGradient id="glass-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Buildings Group with Architectural Linework and Solid Mass */}
      <g stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="url(#real-glass-tower)">
        
        {/* ========================================================
            BUILDING 1: Modern 12-Story Commercial High-Rise (x=12..86)
            ======================================================== */}
        <path d="M 12 172 V 52 H 86 V 172 Z" />
        {/* Penthouse & Roof Mechanical Deck */}
        <path d="M 28 52 V 36 H 70 V 52 Z" fill="#ffffff" />
        <line x1="49" y1="36" x2="49" y2="16" strokeWidth="1.6" />
        <circle cx="49" cy="14" r="2.5" fill="#ef4444" stroke="#dc2626" />
        {/* Window Grids */}
        <line x1="12" y1="66" x2="86" y2="66" stroke="#64748b" strokeWidth="1.2" />
        <line x1="12" y1="80" x2="86" y2="80" stroke="#64748b" strokeWidth="1.2" />
        <line x1="12" y1="94" x2="86" y2="94" stroke="#64748b" strokeWidth="1.2" />
        <line x1="12" y1="108" x2="86" y2="108" stroke="#64748b" strokeWidth="1.2" />
        <line x1="12" y1="122" x2="86" y2="122" stroke="#64748b" strokeWidth="1.2" />
        <line x1="12" y1="136" x2="86" y2="136" stroke="#64748b" strokeWidth="1.2" />
        <line x1="12" y1="150" x2="86" y2="150" stroke="#64748b" strokeWidth="1.2" />
        {/* Vertical Structural Mullions */}
        <line x1="28" y1="52" x2="28" y2="166" stroke="#64748b" strokeWidth="1.2" />
        <line x1="44" y1="52" x2="44" y2="166" stroke="#64748b" strokeWidth="1.2" />
        <line x1="60" y1="52" x2="60" y2="166" stroke="#64748b" strokeWidth="1.2" />
        <line x1="74" y1="52" x2="74" y2="166" stroke="#64748b" strokeWidth="1.2" />
        {/* Glowing Office Windows */}
        <rect x="30" y="82" width="12" height="10" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
        <rect x="62" y="110" width="10" height="10" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
        {/* Entrance Portico Canopy */}
        <rect x="36" y="160" width="26" height="12" fill="#0f172a" stroke="#0f172a" />

        {/* Landscaped Tree 1 & Modern LED Streetlamp */}
        <circle cx="106" cy="144" r="14" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <circle cx="106" cy="144" r="7" fill="#10b981" stroke="#047857" strokeWidth="1" />
        <line x1="106" y1="158" x2="106" y2="172" stroke="#78350f" strokeWidth="2.2" />
        {/* LED Streetlamp 1 */}
        <path d="M 126 172 V 116 H 136" fill="none" strokeWidth="1.6" stroke="#0f172a" />
        <rect x="133" y="114" width="7" height="3" rx="1" fill="#0f172a" />
        <circle cx="136" cy="120" r="1.5" fill="#fde047" />

        {/* ========================================================
            BUILDING 2: Diagonal Braced Mega-Skyscraper (x=150..274)
            ======================================================== */}
        <path d="M 152 172 V 74 L 168 46 H 258 L 274 74 V 172 Z" />
        {/* Crown & Dual Antenna Spires */}
        <rect x="194" y="22" width="38" height="24" fill="#ffffff" />
        <line x1="203" y1="22" x2="203" y2="6" strokeWidth="1.6" />
        <circle cx="203" cy="5" r="2.5" fill="#ef4444" stroke="#dc2626" />
        <line x1="223" y1="22" x2="223" y2="6" strokeWidth="1.6" />
        <circle cx="223" cy="5" r="2.5" fill="#ef4444" stroke="#dc2626" />
        {/* Heavy Diagrid Structural X-Bracing */}
        <line x1="168" y1="46" x2="274" y2="108" stroke="#1e293b" strokeWidth="1.8" />
        <line x1="258" y1="46" x2="152" y2="108" stroke="#1e293b" strokeWidth="1.8" />
        <line x1="152" y1="108" x2="274" y2="172" stroke="#1e293b" strokeWidth="1.8" />
        <line x1="274" y1="108" x2="152" y2="172" stroke="#1e293b" strokeWidth="1.8" />
        {/* Floor Tie Beams */}
        <line x1="162" y1="78" x2="264" y2="78" stroke="#64748b" strokeWidth="1.4" />
        <line x1="152" y1="108" x2="274" y2="108" stroke="#1e293b" strokeWidth="2" />
        <line x1="152" y1="138" x2="274" y2="138" stroke="#64748b" strokeWidth="1.4" />
        {/* Glowing Office Windows in Diagrid */}
        <rect x="208" y="86" width="12" height="10" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
        <rect x="180" y="120" width="10" height="9" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />

        {/* Boulevard Trees 2 */}
        <circle cx="295" cy="146" r="13" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="295" y1="159" x2="295" y2="172" stroke="#78350f" strokeWidth="2.2" />
        <circle cx="316" cy="140" r="15" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="316" y1="155" x2="316" y2="172" stroke="#78350f" strokeWidth="2.2" />

        {/* ========================================================
            BUILDING 3: Contemporary Slanted Glass Tower (x=338..428)
            ======================================================== */}
        <path d="M 338 172 V 40 L 428 70 V 172 Z" fill="url(#glass-blue)" />
        {/* Slanted Glass Facade Lines */}
        <line x1="338" y1="62" x2="428" y2="92" stroke="#64748b" strokeWidth="1.4" />
        <line x1="338" y1="84" x2="428" y2="114" stroke="#64748b" strokeWidth="1.4" />
        <line x1="338" y1="106" x2="428" y2="136" stroke="#64748b" strokeWidth="1.4" />
        <line x1="338" y1="128" x2="428" y2="158" stroke="#64748b" strokeWidth="1.4" />
        {/* Vertical Aerodynamic Fins */}
        <line x1="360" y1="47" x2="360" y2="172" stroke="#64748b" strokeWidth="1.2" />
        <line x1="384" y1="55" x2="384" y2="172" stroke="#64748b" strokeWidth="1.2" />
        <line x1="406" y1="63" x2="406" y2="172" stroke="#64748b" strokeWidth="1.2" />

        {/* LED Streetlamp 2 & Bush */}
        <path d="M 446 172 V 120 H 456" fill="none" strokeWidth="1.6" stroke="#0f172a" />
        <rect x="453" y="118" width="7" height="3" rx="1" fill="#0f172a" />
        <circle cx="456" cy="124" r="1.5" fill="#fde047" />
        <circle cx="470" cy="146" r="14" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="470" y1="160" x2="470" y2="172" stroke="#78350f" strokeWidth="2.2" />

        {/* ========================================================
            BUILDING 4: Iconic Twin Towers with Skybridge (x=496..656)
            ======================================================== */}
        {/* Tower A (Left) */}
        <path d="M 496 172 V 34 L 526 20 L 556 34 V 172 Z" />
        <line x1="526" y1="20" x2="526" y2="4" strokeWidth="1.8" />
        <circle cx="526" cy="3" r="2.5" fill="#ef4444" stroke="#dc2626" />
        {/* Tower B (Right) */}
        <path d="M 596 172 V 34 L 626 20 L 656 34 V 172 Z" />
        <line x1="626" y1="20" x2="626" y2="4" strokeWidth="1.8" />
        <circle cx="626" cy="3" r="2.5" fill="#ef4444" stroke="#dc2626" />
        {/* Suspended Iconic Two-Tier Skybridge */}
        <rect x="556" y="84" width="40" height="24" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
        <line x1="562" y1="96" x2="590" y2="96" stroke="#64748b" strokeWidth="1.4" />
        <line x1="570" y1="84" x2="570" y2="108" stroke="#64748b" strokeWidth="1" />
        <line x1="582" y1="84" x2="582" y2="108" stroke="#64748b" strokeWidth="1" />
        {/* Tower A Floor Bands */}
        <line x1="496" y1="54" x2="556" y2="54" stroke="#64748b" strokeWidth="1.2" />
        <line x1="496" y1="70" x2="556" y2="70" stroke="#64748b" strokeWidth="1.2" />
        <line x1="496" y1="118" x2="556" y2="118" stroke="#64748b" strokeWidth="1.2" />
        <line x1="496" y1="136" x2="556" y2="136" stroke="#64748b" strokeWidth="1.2" />
        <line x1="496" y1="152" x2="556" y2="152" stroke="#64748b" strokeWidth="1.2" />
        {/* Tower B Floor Bands */}
        <line x1="596" y1="54" x2="656" y2="54" stroke="#64748b" strokeWidth="1.2" />
        <line x1="596" y1="70" x2="656" y2="70" stroke="#64748b" strokeWidth="1.2" />
        <line x1="596" y1="118" x2="656" y2="118" stroke="#64748b" strokeWidth="1.2" />
        <line x1="596" y1="136" x2="656" y2="136" stroke="#64748b" strokeWidth="1.2" />
        <line x1="596" y1="152" x2="656" y2="152" stroke="#64748b" strokeWidth="1.2" />
        {/* Illuminated Skybridge Windows */}
        <rect x="564" y="88" width="10" height="7" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
        <rect x="578" y="88" width="10" height="7" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />

        {/* Boulevard Trees 3 */}
        <circle cx="678" cy="144" r="14" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="678" y1="158" x2="678" y2="172" stroke="#78350f" strokeWidth="2.2" />
        <circle cx="700" cy="140" r="16" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="700" y1="156" x2="700" y2="172" stroke="#78350f" strokeWidth="2.2" />

        {/* ========================================================
            BUILDING 5: Luxury Residential Tower with Balconies (x=724..826)
            ======================================================== */}
        <path d="M 724 172 V 46 H 826 V 172 Z" />
        {/* Rooftop Sky Lounge Pergola */}
        <rect x="744" y="30" width="62" height="16" fill="#ffffff" stroke="#0f172a" />
        <line x1="758" y1="30" x2="758" y2="46" stroke="#64748b" />
        <line x1="775" y1="30" x2="775" y2="46" stroke="#64748b" />
        <line x1="792" y1="30" x2="792" y2="46" stroke="#64748b" />
        {/* Cantilevered Glass Balconies */}
        <rect x="718" y="60" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="784" y="60" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="718" y="78" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="784" y="78" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="718" y="96" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="784" y="96" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="718" y="114" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="784" y="114" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="718" y="132" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="784" y="132" width="48" height="8" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />

        {/* LED Streetlamp 3 */}
        <path d="M 842 172 V 118 H 832" fill="none" strokeWidth="1.6" stroke="#0f172a" />
        <rect x="829" y="116" width="7" height="3" rx="1" fill="#0f172a" />
        <circle cx="832" cy="122" r="1.5" fill="#fde047" />

        {/* ========================================================
            BUILDING 6: Stepped Art Deco Landmark Tower (x=856..966)
            ======================================================== */}
        <path d="M 856 172 V 86 H 870 V 56 H 890 V 30 H 932 V 56 H 952 V 86 H 966 V 172 Z" />
        {/* Tapered Crown & Stainless Needle Spire */}
        <path d="M 902 30 L 911 10 L 920 30 Z" fill="#ffffff" />
        <line x1="911" y1="10" x2="911" y2="1" strokeWidth="1.8" />
        <circle cx="911" cy="1" r="2.5" fill="#ef4444" stroke="#dc2626" />
        {/* Fluted Vertical Mullion Columns */}
        <line x1="880" y1="92" x2="880" y2="168" stroke="#64748b" strokeWidth="1.4" />
        <line x1="895" y1="62" x2="895" y2="168" stroke="#64748b" strokeWidth="1.4" />
        <line x1="911" y1="34" x2="911" y2="168" stroke="#64748b" strokeWidth="1.4" />
        <line x1="927" y1="62" x2="927" y2="168" stroke="#64748b" strokeWidth="1.4" />
        <line x1="942" y1="92" x2="942" y2="168" stroke="#64748b" strokeWidth="1.4" />
        {/* Illuminated Crown Windows */}
        <rect x="906" y="44" width="10" height="8" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />

        {/* Boulevard Trees 4 */}
        <circle cx="985" cy="146" r="13" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="985" y1="159" x2="985" y2="172" stroke="#78350f" strokeWidth="2.2" />
        <circle cx="1006" cy="140" r="16" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="1006" y1="156" x2="1006" y2="172" stroke="#78350f" strokeWidth="2.2" />

        {/* ========================================================
            BUILDING 7: High-Tech Diamond Facet Tower (x=1030..1134)
            ======================================================== */}
        <path d="M 1030 172 V 60 L 1082 26 L 1134 60 V 172 Z" fill="url(#glass-blue)" />
        {/* Diamond Facet Spine & Reflection Ribs */}
        <line x1="1082" y1="26" x2="1082" y2="172" stroke="#1e293b" strokeWidth="1.6" />
        <line x1="1030" y1="60" x2="1082" y2="90" stroke="#64748b" strokeWidth="1.4" />
        <line x1="1134" y1="60" x2="1082" y2="90" stroke="#64748b" strokeWidth="1.4" />
        <line x1="1030" y1="100" x2="1082" y2="130" stroke="#64748b" strokeWidth="1.4" />
        <line x1="1134" y1="100" x2="1082" y2="130" stroke="#64748b" strokeWidth="1.4" />
        <line x1="1030" y1="140" x2="1082" y2="170" stroke="#64748b" strokeWidth="1.4" />
        <line x1="1134" y1="140" x2="1082" y2="170" stroke="#64748b" strokeWidth="1.4" />

        {/* LED Streetlamp 4 & Tree */}
        <path d="M 1152 172 V 120 H 1162" fill="none" strokeWidth="1.6" stroke="#0f172a" />
        <rect x="1159" y="118" width="7" height="3" rx="1" fill="#0f172a" />
        <circle cx="1162" cy="124" r="1.5" fill="#fde047" />
        <circle cx="1178" cy="144" r="14" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="1178" y1="158" x2="1178" y2="172" stroke="#78350f" strokeWidth="2.2" />

        {/* ========================================================
            BUILDING 8: Corporate Grand Atrium Complex (x=1202..1304)
            ======================================================== */}
        <path d="M 1202 172 V 66 H 1304 V 172 Z" />
        {/* Emerald Grand Glass Atrium Entrance */}
        <path d="M 1236 172 V 108 Q 1253 92 1270 108 V 172 Z" fill="url(#glass-emerald)" stroke="#059669" strokeWidth="1.6" />
        {/* Office Window Grid */}
        <line x1="1202" y1="82" x2="1304" y2="82" stroke="#64748b" strokeWidth="1.2" />
        <line x1="1202" y1="100" x2="1304" y2="100" stroke="#64748b" strokeWidth="1.2" />
        <line x1="1202" y1="118" x2="1304" y2="118" stroke="#64748b" strokeWidth="1.2" />
        <line x1="1202" y1="136" x2="1304" y2="136" stroke="#64748b" strokeWidth="1.2" />
        <line x1="1202" y1="154" x2="1304" y2="154" stroke="#64748b" strokeWidth="1.2" />
        {/* Lit Windows */}
        <rect x="1214" y="86" width="10" height="9" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
        <rect x="1282" y="122" width="10" height="9" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />

        {/* Boulevard Trees 5 */}
        <circle cx="1326" cy="144" r="14" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="1326" y1="158" x2="1326" y2="172" stroke="#78350f" strokeWidth="2.2" />
        <circle cx="1348" cy="140" r="16" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="1348" y1="156" x2="1348" y2="172" stroke="#78350f" strokeWidth="2.2" />

        {/* ========================================================
            BUILDING 9: Aerodynamic Curvilinear Tower (x=1372..1484)
            ======================================================== */}
        <path d="M 1372 172 V 44 Q 1428 18 1484 44 V 172 Z" fill="url(#glass-blue)" />
        <line x1="1428" y1="26" x2="1428" y2="8" strokeWidth="1.8" />
        <circle cx="1428" cy="6" r="2.5" fill="#ef4444" stroke="#dc2626" />
        {/* Curvilinear Aerodynamic Louver Lines */}
        <path d="M 1372 66 Q 1428 46 1484 66" fill="none" stroke="#64748b" strokeWidth="1.4" />
        <path d="M 1372 88 Q 1428 68 1484 88" fill="none" stroke="#64748b" strokeWidth="1.4" />
        <path d="M 1372 110 Q 1428 90 1484 110" fill="none" stroke="#64748b" strokeWidth="1.4" />
        <path d="M 1372 132 Q 1428 112 1484 132" fill="none" stroke="#64748b" strokeWidth="1.4" />
        <path d="M 1372 152 Q 1428 134 1484 152" fill="none" stroke="#64748b" strokeWidth="1.4" />

        {/* ========================================================
            BUILDING 10: Seamless Connecting High-Rise (x=1502..1582)
            ======================================================== */}
        <path d="M 1502 172 V 58 L 1542 40 L 1582 58 V 172 Z" />
        <line x1="1542" y1="40" x2="1542" y2="172" stroke="#64748b" strokeWidth="1.4" />
        <line x1="1502" y1="76" x2="1582" y2="76" stroke="#64748b" strokeWidth="1.2" />
        <line x1="1502" y1="100" x2="1582" y2="100" stroke="#64748b" strokeWidth="1.2" />
        <line x1="1502" y1="124" x2="1582" y2="124" stroke="#64748b" strokeWidth="1.2" />
        <line x1="1502" y1="148" x2="1582" y2="148" stroke="#64748b" strokeWidth="1.2" />

        {/* Final Connecting Tree seamlessly bridging with Building 1 */}
        <circle cx="1594" cy="146" r="12" fill="#ecfdf5" stroke="#059669" strokeWidth="1.6" />
        <line x1="1594" y1="158" x2="1594" y2="172" stroke="#78350f" strokeWidth="2.2" />
      </g>

      {/* Baseline Solid Highway Asphalt Line */}
      <line x1="0" y1="172" x2="1600" y2="172" stroke="#0f172a" strokeWidth="2.5" />
    </svg>
  );
};

/**
 * Authentic Photorealistic Toyota Premio Sedan
 * Executive white Toyota Premio sedan with:
 * - Precisely aligned rotating 10-spoke Bridgestone alloy wheels
 * - Forward LED projector headlight beam illuminating the highway
 * - Authentic suspension micro-bounce
 */
const RealToyotaPremio: React.FC = () => {
  return (
    <div className="relative w-[240px] h-[76.5px] pointer-events-none select-none animate-car-bounce">
      {/* 1. Forward LED Projector Headlight Beam */}
      <div className="headlight-beam absolute top-[30px] right-[-135px] w-[150px] h-[34px] z-0 opacity-85" />

      {/* 2. Authentic Toyota Premio Body */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cars/toyota_premio.png"
        alt="Toyota Premio"
        width={240}
        height={76.5}
        className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
      />

      {/* 3. Rotating Rear Toyota Premio Alloy Wheel (Mathematical Center: x=56.0px, y=58.6px, diam=34.6px) */}
      <div
        className="absolute z-20 animate-wheel-spin overflow-hidden rounded-full shadow-sm"
        style={{
          left: '38.7px',
          top: '41.3px',
          width: '34.6px',
          height: '34.6px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cars/toyota_premio_wheel.png"
          alt="Premio Rear Wheel"
          width={35}
          height={35}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 4. Rotating Front Toyota Premio Alloy Wheel (Mathematical Center: x=198.3px, y=58.6px, diam=34.6px) */}
      <div
        className="absolute z-20 animate-wheel-spin overflow-hidden rounded-full shadow-sm"
        style={{
          left: '181.0px',
          top: '41.3px',
          width: '34.6px',
          height: '34.6px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cars/toyota_premio_wheel.png"
          alt="Premio Front Wheel"
          width={35}
          height={35}
          className="w-full h-full object-cover"
        />
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
          ? 'h-[190px] lg:h-[210px]'
          : variant === 'banner'
          ? 'h-[160px]'
          : 'h-[140px]'
      } ${className}`}
      aria-hidden="true"
    >
      {/* 1. Subtle Side Vignettes & Top Fade */}
      <div className="absolute inset-x-0 top-0 h-12 z-10 bg-gradient-to-b from-white via-white/80 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-white to-transparent" />
      <div className="absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-white to-transparent" />

      {/* 2. Distant Skyline Slower Parallax Layer (60s loop) */}
      <div className="absolute bottom-[8px] left-0 flex w-[3200px] opacity-40 animate-city-scroll-slow">
        <DistantSkylineSegment />
        <DistantSkylineSegment />
      </div>

      {/* 3. Foreground Architectural City Skyline (35s dual seamless loop) */}
      <div className="absolute bottom-[8px] left-0 flex w-[3200px] animate-city-scroll">
        <RealArchitecturalSkylineSegment />
        <RealArchitecturalSkylineSegment />
      </div>

      {/* 4. Moving Road Lane Dashes along the Highway */}
      <div className="absolute bottom-[8px] left-0 right-0 h-[3px] overflow-hidden z-10">
        <div className="flex w-[200%] animate-road-dash">
          {Array.from({ length: 80 }).map((_, i) => (
            <span
              key={i}
              className="inline-block w-8 h-[2.5px] bg-slate-700/75 rounded-full mx-3 flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* 5. Cruising Real Toyota Premio on the Highway (Baseline touches road at bottom: 8px) */}
      {showCar && (
        <div className="absolute bottom-[8px] left-[6%] sm:left-[12%] lg:left-[18%] z-20">
          <RealToyotaPremio />
        </div>
      )}

      {/* 6. Road Ground Base Tone */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-900/[0.08] z-10" />
    </div>
  );
};

export default CityDriveBackground;
