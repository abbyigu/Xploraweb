// Decorative line-art illustration of Old Québec — Château Frontenac's
// turrets, the terrace wall and boardwalk, the village below, and a couple
// walking — drawn in the app's brand teal so it sits naturally in the
// itinerary hero. Hand-vectorized to follow a reference illustration (not a
// traced copy: the source was only ever visible in chat, never a file this
// component could read).
const LINE = '#155E66';
const WALL_FILL = '#119FB3';
const ROOF_FILL = '#33C0A3';
const FOLIAGE = '#33C0A3';

// The castle's tower massing — each entry draws one pyramidal-roofed block
// sitting on the terrace wall (y=300); varying width/height is what reads as
// "a cluster of turrets" rather than one flat building.
const TOWERS: { x1: number; x2: number; wallTop: number; roofApex: number }[] = [
  { x1: 220, x2: 270, wallTop: 220, roofApex: 195 },
  { x1: 270, x2: 320, wallTop: 190, roofApex: 152 },
  { x1: 320, x2: 380, wallTop: 165, roofApex: 128 },
  { x1: 470, x2: 540, wallTop: 150, roofApex: 108 },
  { x1: 540, x2: 610, wallTop: 178, roofApex: 142 },
  { x1: 610, x2: 680, wallTop: 140, roofApex: 98 },
  { x1: 680, x2: 750, wallTop: 198, roofApex: 162 },
  { x1: 750, x2: 820, wallTop: 238, roofApex: 206 },
];

const CASTLE_WINDOWS: [number, number][] = [
  [236, 232], [252, 232], [284, 202], [300, 202], [334, 178], [350, 178],
  [400, 135], [420, 135], [440, 135], [400, 165], [420, 165], [440, 165],
  [488, 165], [504, 165], [560, 192], [576, 192], [628, 155], [644, 155],
  [696, 210], [712, 210], [766, 250], [782, 250],
];

const VILLAGE_HOUSES: { x: number; w: number; roofH: number; dormer: boolean }[] = [
  { x: 6, w: 92, roofH: 34, dormer: true },
  { x: 104, w: 78, roofH: 30, dormer: false },
  { x: 190, w: 88, roofH: 32, dormer: true },
  { x: 924, w: 84, roofH: 30, dormer: false },
  { x: 1014, w: 92, roofH: 34, dormer: true },
  { x: 1112, w: 82, roofH: 28, dormer: false },
];

const BUSHES: [number, number, number][] = [
  [252, 452, 1], [340, 462, .8], [560, 458, .9], [780, 452, 1], [860, 462, .75],
];

const BIRDS: [number, number][] = [[250, 108], [470, 66], [820, 138], [1010, 88]];

export function QuebecWalkIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Line illustration of Château Frontenac's skyline, the terrace and village below, and a couple walking the boardwalk in Old Québec"
    >
      {/* Sky */}
      <path d="M100 108c-10 0-18 7-18 16 0 1 .1 2 .3 3-8 1-14 7-14 15 0 8 8 14 17 14h56c9 0 16-6 16-14 0-7-6-13-14-15a18 18 0 0 0-17-21c-7 0-13 4-16 9-2-4-5-7-10-7Z" stroke={LINE} strokeOpacity=".5" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M636 88c-8 0-14 5-14 12 0 1 .1 1.6 .2 2.4-6 1-11 5.6-11 11.6 0 6.4 6 11.4 13 11.4h44c7 0 12.5-5 12.5-11.4 0-5.6-4.5-10.4-11-11.6a14.5 14.5 0 0 0-13.7-16.4c-5.5 0-10 3.2-12.5 7.4-1.6-3.2-3.8-5.4-7.5-5.4Z" stroke={LINE} strokeOpacity=".4" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M1058 118c-10 0-18 7-18 16 0 1 .1 2 .3 3-8 1-14 7-14 15 0 8 8 14 17 14h56c9 0 16-6 16-14 0-7-6-13-14-15a18 18 0 0 0-17-21c-7 0-13 4-16 9-2-4-5-7-10-7Z" stroke={LINE} strokeOpacity=".45" strokeWidth="2.5" strokeLinejoin="round" />

      <g stroke={LINE} strokeOpacity=".5" strokeWidth="2.5" strokeLinecap="round">
        {BIRDS.map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 11} ${y}c3.5-3.5 8-3.5 11 0c3-3.5 7.5-3.5 11 0`} />
        ))}
      </g>

      {/* mountains behind the dome building */}
      <path d="M980 300C1030 220 1080 202 1130 244C1150 218 1170 228 1200 238V300H980Z" fill={ROOF_FILL} fillOpacity=".12" />

      {/* Château Frontenac tower cluster */}
      <g stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        {TOWERS.map(({ x1, x2, wallTop, roofApex }) => {
          const mid = (x1 + x2) / 2;
          return (
            <g key={`${x1}-${x2}`}>
              <path d={`M${x1} 300V${wallTop}H${x2}V300`} fill={WALL_FILL} fillOpacity=".07" />
              <path d={`M${x1} ${wallTop}L${mid} ${roofApex}L${x2} ${wallTop}`} fill={ROOF_FILL} fillOpacity=".22" />
              <circle cx={mid} cy={roofApex} r="2.5" fill={LINE} />
            </g>
          );
        })}

        {/* central tall keep, with corner pinnacles and a dormer-studded hip roof */}
        <path d="M380 300V120H470V300" fill={WALL_FILL} fillOpacity=".07" />
        <path d="M380 120L425 45L470 120Z" fill={ROOF_FILL} fillOpacity=".26" />
        <path d="M425 45V22" />
        <circle cx="425" cy="20" r="3" fill={LINE} />
        <path d="M390 120V95L398 84L406 95V120" fill={WALL_FILL} fillOpacity=".1" />
        <path d="M444 120V95L452 84L460 95V120" fill={WALL_FILL} fillOpacity=".1" />
        <path d="M402 108L412 88L422 108Z" fill={ROOF_FILL} fillOpacity=".3" />
        <path d="M428 108L438 88L448 108Z" fill={ROOF_FILL} fillOpacity=".3" />

        {/* small left dormer + gable adjoining the low building */}
        <path d="M40 260V235H140V260" fill={WALL_FILL} fillOpacity=".07" />
        <path d="M40 235L90 205L140 235Z" fill={ROOF_FILL} fillOpacity=".22" />
        <path d="M75 205V180" />

        {/* church spire */}
        <path d="M150 300V210L180 100L210 210V300" fill={WALL_FILL} fillOpacity=".07" />
        <path d="M180 100V78" />
        <path d="M172 86H188" />
        <circle cx="180" cy="150" r="9" />

        {/* right dome building */}
        <path d="M850 300V250H1000V300" fill={WALL_FILL} fillOpacity=".07" />
        <path d="M862 250C868 205 982 205 988 250" fill={ROOF_FILL} fillOpacity=".26" />
        <path d="M925 205V158" />
        <path d="M925 158L950 166L925 174" fill={ROOF_FILL} fillOpacity=".3" />
      </g>

      <g fill={LINE}>
        {CASTLE_WINDOWS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="9" height="13" rx="1.5" fillOpacity=".55" />
        ))}
        <rect x="868" y="262" width="9" height="13" rx="1.5" fillOpacity=".55" />
        <rect x="920" y="262" width="9" height="13" rx="1.5" fillOpacity=".55" />
        <rect x="972" y="262" width="9" height="13" rx="1.5" fillOpacity=".55" />
      </g>

      {/* terrace wall, tapering down to the water on the right */}
      <path d="M0 300H1000C1030 300 1060 312 1090 340L1160 340" stroke={LINE} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M0 311H1000" stroke={LINE} strokeWidth="1.75" strokeDasharray="1 15" strokeLinecap="round" />
      <path d="M1010 345L1030 335M1040 348L1060 338M1070 351L1090 341" stroke={LINE} strokeOpacity=".5" strokeWidth="1.75" strokeLinecap="round" />

      {/* ferry on the river */}
      <g stroke={LINE} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round">
        <path d="M1090 352H1150L1140 364H1102Z" fill={ROOF_FILL} fillOpacity=".2" />
        <path d="M1108 352V338H1130V352" />
        <path d="M1119 338V326" />
      </g>

      {/* winding boardwalk */}
      <path
        d="M0 452C120 428 210 478 320 458S500 410 610 438S840 494 1000 460S1140 428 1200 442"
        stroke={LINE}
        strokeOpacity=".35"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M0 452C120 428 210 478 320 458S500 410 610 438S840 494 1000 460S1140 428 1200 442"
        stroke="#F7F8F5"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* foreground shrubs along the path */}
      <g fill={FOLIAGE} fillOpacity=".28">
        {BUSHES.map(([x, y, s]) => (
          <path
            key={`${x}-${y}`}
            transform={`translate(${x} ${y}) scale(${s})`}
            d="M-40 40C-34 12 -6 4 0 26C6 4 34 12 40 40Z"
          />
        ))}
      </g>

      {/* foreground trees, two styles: bushy canopy and bare branches */}
      <g stroke={LINE} strokeWidth="2.5" strokeLinecap="round">
        <path d="M118 596V500" />
        <path d="M118 540L96 512M118 528L142 502M118 552L104 534" strokeWidth="1.75" />
        <path d="M446 604V520" />
        <circle cx="446" cy="494" r="36" fill={FOLIAGE} fillOpacity=".3" stroke={LINE} strokeWidth="2" />
        <path d="M690 604V520" />
        <circle cx="690" cy="494" r="34" fill={FOLIAGE} fillOpacity=".3" stroke={LINE} strokeWidth="2" />
        <path d="M902 596V512" />
        <path d="M902 548L880 520M902 536L926 510M902 560L888 542" strokeWidth="1.75" />
      </g>

      {/* village houses flanking the boardwalk */}
      <g stroke={LINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {VILLAGE_HOUSES.map(({ x, w, roofH, dormer }) => {
          const wallTop = 460;
          const roofApex = wallTop - roofH;
          const mid = x + w / 2;
          return (
            <g key={x}>
              <path d={`M${x} 620V${wallTop}H${x + w}V620`} fill={WALL_FILL} fillOpacity=".06" />
              <path d={`M${x} ${wallTop}L${mid} ${roofApex}L${x + w} ${wallTop}Z`} fill={ROOF_FILL} fillOpacity=".2" />
              {dormer && (
                <path d={`M${mid - 12} ${wallTop - 4}L${mid} ${roofApex + 10}L${mid + 12} ${wallTop - 4}`} fill={ROOF_FILL} fillOpacity=".26" />
              )}
              <path d={`M${x + 6} ${wallTop - 2}V${roofApex + 6}`} strokeWidth="1.5" />
              <rect x={x + w * 0.22} y={wallTop + 20} width="12" height="16" rx="1.5" fill={LINE} fillOpacity=".4" stroke="none" />
              <rect x={x + w * 0.62} y={wallTop + 20} width="12" height="16" rx="1.5" fill={LINE} fillOpacity=".4" stroke="none" />
            </g>
          );
        })}
      </g>

      {/* left lamp post + bench */}
      <g stroke={LINE} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M186 604V500" />
        <path d="M186 500H170L186 482L202 500H186" />
        <circle cx="186" cy="472" r="9" fill={FOLIAGE} fillOpacity=".35" />
        <path d="M164 604H208" />

        <path d="M18 566H108" />
        <path d="M18 548H108" />
        <path d="M26 548V578M100 548V578" />
        <path d="M18 604V582M108 604V582" />
      </g>

      {/* right lamp post */}
      <g stroke={LINE} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1000 604V510" />
        <path d="M1000 510H984L1000 492L1016 510H1000" />
        <circle cx="1000" cy="482" r="9" fill={FOLIAGE} fillOpacity=".35" />
        <path d="M978 604H1022" />
      </g>

      {/* walking couple, seen from behind */}
      <g stroke={LINE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="588" cy="486" r="9" fill={LINE} />
        <path d="M579 495Q588 508 583 522" fill={WALL_FILL} fillOpacity=".3" strokeWidth="2.5" />
        <path d="M588 500V520" />
        <path d="M588 507L572 517M588 507L603 501" />
        <path d="M580 522L570 546M596 522L601 546" />

        <circle cx="618" cy="481" r="9" fill={LINE} />
        <path d="M618 493V518" />
        <path d="M618 500L635 510M618 500L604 495" />
        <path d="M627 518L637 546M609 518L600 546" />
      </g>
    </svg>
  );
}
