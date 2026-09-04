// Decorative line-art illustration of Old Québec — Château Frontenac's
// turrets, the terrace wall and boardwalk, a couple walking below, drawn in
// the app's brand teal so it sits naturally in the itinerary hero.
export function QuebecWalkIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 580"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Line illustration of Château Frontenac's skyline and a couple walking along the terrace boardwalk in Old Québec"
    >
      {/* Clouds */}
      <path d="M70 66c-9 0-16 6-16 14 0 1 .1 2 .3 3-7 1-12 6-12 13 0 7 7 12 15 12h48c8 0 14-5 14-12 0-6-5-11-12-13a16 16 0 0 0-15-19c-6 0-11 3-14 8-2-4-4-6-8-6Z" stroke="#12343B" strokeOpacity=".4" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M900 46c-8 0-13 5-13 11 0 1 0 2 .2 3-5 1-9 5-9 10 0 6 5 10 11 10h38c6 0 11-4 11-10 0-5-4-9-9-10a13 13 0 0 0-12-15c-5 0-9 3-11 7-1-3-3-6-6-6Z" stroke="#12343B" strokeOpacity=".3" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Birds */}
      <path d="M300 56c3.5-3.5 8-3.5 10.5 0 2.5-3.5 7-3.5 10.5 0" stroke="#12343B" strokeOpacity=".45" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M330 40c3-3 6.5-3 9 0 2-3 5.5-3 8.5 0" stroke="#12343B" strokeOpacity=".45" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M680 82c3-3 6.5-3 9 0 2-3 5.5-3 8.5 0" stroke="#12343B" strokeOpacity=".4" strokeWidth="2.5" strokeLinecap="round" />

      {/* Hills behind the dome building */}
      <path d="M840 280C880 210 920 195 960 232C978 210 992 218 1000 226V280H840Z" fill="#33C0A3" fillOpacity=".12" />

      {/* Château Frontenac skyline */}
      <g stroke="#12343B" strokeWidth="2.75" strokeLinejoin="round" strokeLinecap="round">
        {/* left church spire, topped with a cross */}
        <path d="M128 280V190L146 96L164 190V280" />
        <path d="M146 96V72" />
        <path d="M138 80H154" />

        {/* castle cluster, left to right */}
        <path d="M258 280V200L280 165L302 200V280" />
        <path d="M302 280V175L323 140L344 175V280" />
        <path d="M344 280V110L387 55L430 110V280" />
        <path d="M351 110V90L359 78L367 90V110" />
        <path d="M410 110V90L418 78L426 90V110" />
        <circle cx="387" cy="53" r="3" fill="#12343B" />
        <path d="M430 280V150L455 115L480 150V280" />
        <path d="M480 280V190L510 155L540 190V280" />
        <path d="M508 190V172L516 162L524 172V190" />
        <path d="M540 280V165L565 125L590 165V280" />
        <path d="M590 280V225L620 195L650 225V280" />

        {/* right domed building, flying a small flag */}
        <path d="M762 280V190H860V280" />
        <path d="M772 190C780 152 843 152 851 190" />
        <path d="M807 152V116" />
        <path d="M807 116L826 122L807 128" />
      </g>

      {/* windows */}
      <g fill="#119FB3" fillOpacity=".55">
        <rect x="308" y="200" width="7" height="11" rx="1.5" />
        <rect x="330" y="200" width="7" height="11" rx="1.5" />
        <rect x="360" y="140" width="8" height="12" rx="1.5" />
        <rect x="386" y="140" width="8" height="12" rx="1.5" />
        <rect x="410" y="230" width="7" height="11" rx="1.5" />
        <rect x="438" y="175" width="7" height="11" rx="1.5" />
        <rect x="460" y="175" width="7" height="11" rx="1.5" />
        <rect x="490" y="215" width="7" height="11" rx="1.5" />
        <rect x="514" y="215" width="7" height="11" rx="1.5" />
        <rect x="549" y="195" width="7" height="11" rx="1.5" />
        <rect x="573" y="195" width="7" height="11" rx="1.5" />
        <rect x="778" y="210" width="7" height="11" rx="1.5" />
        <rect x="802" y="210" width="7" height="11" rx="1.5" />
        <rect x="826" y="210" width="7" height="11" rx="1.5" />
      </g>

      {/* terrace wall (Dufferin Terrace) */}
      <path d="M0 280H1000" stroke="#12343B" strokeWidth="3" strokeLinecap="round" />
      <path d="M0 291H1000" stroke="#12343B" strokeWidth="2" strokeDasharray="1 15" strokeLinecap="round" />

      {/* background trees along the wall */}
      <g stroke="#12343B" strokeWidth="2.25" strokeLinecap="round">
        <path d="M64 280V250" />
        <circle cx="64" cy="238" r="15" fill="#33C0A3" fillOpacity=".4" stroke="none" />
        <path d="M726 280V254" />
        <circle cx="726" cy="243" r="13" fill="#33C0A3" fillOpacity=".4" stroke="none" />
        <path d="M958 280V256" />
        <circle cx="958" cy="246" r="12" fill="#33C0A3" fillOpacity=".4" stroke="none" />
      </g>

      {/* ferry on the river */}
      <g stroke="#12343B" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round">
        <path d="M900 250H948L940 260H908Z" fill="#33C0A3" fillOpacity=".25" />
        <path d="M916 250V238H934V250" />
        <path d="M924 238V228" />
      </g>

      {/* winding boardwalk path */}
      <path
        d="M0 428C110 406 190 452 300 434S470 392 560 418S760 468 1000 436"
        stroke="#71D45A"
        strokeOpacity=".55"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="1 16"
      />

      {/* foreground trees */}
      <g stroke="#12343B" strokeWidth="2.5" strokeLinecap="round">
        <path d="M214 560V468" />
        <circle cx="214" cy="448" r="32" fill="#33C0A3" fillOpacity=".3" stroke="#12343B" strokeWidth="2" />
        <path d="M900 560V478" />
        <circle cx="900" cy="460" r="28" fill="#33C0A3" fillOpacity=".3" stroke="#12343B" strokeWidth="2" />
      </g>

      {/* foreground shrubs */}
      <g fill="#33C0A3" fillOpacity=".22">
        <path d="M0 560C10 528 60 524 78 550C96 522 150 528 158 560Z" />
        <path d="M330 566C338 542 378 538 392 560C404 540 448 544 454 566Z" />
        <path d="M600 566C610 540 656 536 670 560C682 538 730 542 738 566Z" />
        <path d="M960 566C968 546 1000 544 1000 566Z" />
      </g>

      {/* left lamp post */}
      <g stroke="#12343B" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M150 560V468" />
        <path d="M150 468H136L150 452L164 468H150" />
        <circle cx="150" cy="440" r="8" fill="#33C0A3" fillOpacity=".35" />
        <path d="M130 560H170" />
      </g>

      {/* bench */}
      <g stroke="#12343B" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 540H110" />
        <path d="M30 524H110" />
        <path d="M36 524V550M104 524V550" />
        <path d="M30 560V552M110 560V552" />
      </g>

      {/* right lamp post */}
      <g stroke="#12343B" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M812 560V478" />
        <path d="M812 478H798L812 462L826 478H812" />
        <circle cx="812" cy="452" r="8" fill="#33C0A3" fillOpacity=".35" />
        <path d="M792 560H832" />
      </g>

      {/* walking couple, seen from behind */}
      <g stroke="#12343B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="452" cy="470" r="8" fill="#12343B" />
        <path d="M452 481V502" />
        <path d="M452 487L438 496M452 487L465 481" />
        <path d="M445 502L436 522M459 502L464 522" />

        <circle cx="478" cy="466" r="8" fill="#12343B" />
        <path d="M478 477V500" />
        <path d="M478 484L493 492M478 484L466 480" />
        <path d="M486 500L495 522M471 500L462 522" />
      </g>
    </svg>
  );
}
