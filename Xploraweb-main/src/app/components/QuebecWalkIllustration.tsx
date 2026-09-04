// Decorative line-art illustration of Old Québec's skyline — Château
// Frontenac's turrets, the terrace wall, and a couple walking the boardwalk —
// drawn in the app's brand teal so it sits naturally in the itinerary hero.
export function QuebecWalkIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Line illustration of Château Frontenac and a couple walking along the boardwalk in Old Québec"
    >
      {/* Clouds */}
      <path d="M40 38c-7 0-12 5-12 11 0 1 0 2 .3 3-5 1-9 5-9 10 0 6 5 10 11 10h34c6 0 11-4 11-10 0-5-4-9-9-10a12 12 0 0 0-11-15c-5 0-9 3-11 7-1-4-2-6-4-6Z" stroke="#119FB3" strokeOpacity=".45" strokeWidth="2" strokeLinejoin="round" />
      <path d="M356 26c-6 0-10 4-10 9 0 1 0 2 .2 2.5-4 1-7 4-7 8 0 5 4 8 9 8h28c5 0 9-3 9-8 0-4-3-7-7-8a10 10 0 0 0-9-12c-4 0-7 2-9 6-1-3-2-5.5-4-5.5Z" stroke="#119FB3" strokeOpacity=".35" strokeWidth="2" strokeLinejoin="round" />

      {/* Birds */}
      <path d="M108 22c3-3 7-3 9 0 2-3 6-3 9 0" stroke="#119FB3" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
      <path d="M300 52c2.5-2.5 6-2.5 8 0 2-2.5 5.5-2.5 8 0" stroke="#119FB3" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />

      {/* Château Frontenac skyline */}
      <g stroke="#12343B" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {/* left church spire */}
        <path d="M60 150V96l10-20 10 20v54" />
        <path d="M62 96h16" />
        <path d="M70 70v10" />

        {/* main keep + turrets */}
        <path d="M110 150V88h16V70l10-14 10 14v18h16v22h14V88h16v62" />
        <path d="M182 150V64l14-18 14 18v86" />
        <path d="M210 150V96h18V78l12-16 12 16v18h18v54" />
        <path d="M270 150V100h16V82l12-15 12 15v18h16v50" />

        {/* right domed building */}
        <path d="M336 150v-34c0-11 9-20 20-20s20 9 20 20v34" />
        <path d="M356 78v18" />
        <circle cx="356" cy="74" r="4" />
      </g>

      {/* windows */}
      <g fill="#119FB3" fillOpacity=".55">
        <rect x="118" y="104" width="5" height="8" rx="1" />
        <rect x="131" y="104" width="5" height="8" rx="1" />
        <rect x="187" y="90" width="5" height="8" rx="1" />
        <rect x="200" y="90" width="5" height="8" rx="1" />
        <rect x="217" y="112" width="5" height="8" rx="1" />
        <rect x="230" y="112" width="5" height="8" rx="1" />
        <rect x="277" y="116" width="5" height="8" rx="1" />
        <rect x="290" y="116" width="5" height="8" rx="1" />
      </g>

      {/* terrace wall */}
      <path d="M20 150h380" stroke="#12343B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 150v14M52 150v14M84 150v14M116 150v14M148 150v14M180 150v14M212 150v14M244 150v14M276 150v14M308 150v14M340 150v14M372 150v14M400 150v14" stroke="#12343B" strokeWidth="2" strokeLinecap="round" />

      {/* trees along the wall */}
      <g stroke="#33C0A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 178v20" />
        <circle cx="30" cy="168" r="12" />
        <path d="M394 182v18" />
        <circle cx="394" cy="172" r="11" />
      </g>

      {/* winding path */}
      <path
        d="M0 232c40-14 70-14 96 0s70 18 110 4 84-22 118-6 66 20 96 8"
        stroke="#71D45A"
        strokeOpacity=".6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 14"
      />

      {/* lamp post */}
      <g stroke="#12343B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M64 250v-46" />
        <path d="M64 204h-8l8-10 8 10h-8" />
        <circle cx="64" cy="196" r="5" fill="#33C0A3" fillOpacity=".35" />
        <path d="M50 250h28" />
      </g>

      {/* bench */}
      <g stroke="#12343B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M330 246h48" />
        <path d="M330 236h48" />
        <path d="M334 236v14M374 236v14" />
        <path d="M330 250v-4M378 250v-4" />
      </g>

      {/* walking couple */}
      <g stroke="#12343B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="196" cy="212" r="6" fill="#12343B" />
        <path d="M196 220v16" />
        <path d="M196 224l-8 6M196 224l9 4" />
        <path d="M191 236l-6 12M200 236l3 12" />

        <circle cx="214" cy="210" r="6" fill="#12343B" />
        <path d="M214 218v16" />
        <path d="M214 222l7 6M214 222l-8 4" />
        <path d="M219 234l5 12M209 234l-4 12" />
      </g>
    </svg>
  );
}
