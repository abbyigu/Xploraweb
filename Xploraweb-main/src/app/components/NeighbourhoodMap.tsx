import { useState } from 'react';
import { HtmlMarker, MapView, Polygon, Polyline, type LatLng } from './MapLibre';

// Admin editor: click to drop the centre pin, "Draw boundary"/"Draw walk
// route" to click out a shape, then drag the round handles to reshape it,
// click a faint midpoint handle to insert a vertex, double-click a handle
// to delete it. Fully controlled by `value` — shapes re-render from props.

const QC = { lat: 46.8139, lng: -71.208 };

export interface MapState {
  lat: number | null;
  lng: number | null;
  boundary: [number, number][] | null; // ring of [lat, lng] pairs
  route: [number, number][] | null; // walk-route polyline of [lat, lng] pairs
}

interface Props {
  value: MapState;
  onChange: (v: MapState) => void;
}

type Pt = [number, number];
const round = (n: number) => +n.toFixed(6);
const toLL = ([lat, lng]: Pt): LatLng => ({ lat, lng });

function Handle({ at, faint, onDrag, onClick, onDelete }: {
  at: LatLng; faint?: boolean; onDrag?: (ll: LatLng) => void; onClick?: () => void; onDelete?: () => void;
}) {
  return (
    <HtmlMarker position={at} draggable={!!onDrag} onDragEnd={onDrag}>
      <div
        onClick={onClick}
        onDoubleClick={onDelete}
        title={onDelete ? 'Drag to move · double-click to delete' : onClick ? 'Click to add a point here' : undefined}
        style={{
          width: faint ? 10 : 14, height: faint ? 10 : 14, borderRadius: '50%', boxSizing: 'border-box',
          background: faint ? 'rgba(255,255,255,0.7)' : '#fff', border: '2px solid #12343B',
          opacity: faint ? 0.7 : 1, cursor: onDrag ? 'move' : 'pointer',
        }}
      />
    </HtmlMarker>
  );
}

/** Vertex + midpoint handles for an editable ring/line. */
function ShapeHandles({ pts, closed, min, onChange }: { pts: Pt[]; closed: boolean; min: number; onChange: (p: Pt[]) => void }) {
  const mids: { at: Pt; index: number }[] = [];
  const last = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < last; i++) {
    const [a, b] = [pts[i], pts[(i + 1) % pts.length]];
    mids.push({ at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], index: i + 1 });
  }
  return (
    <>
      {mids.map(m => (
        <Handle key={`m${m.index}-${pts.length}`} faint at={toLL(m.at)}
          onClick={() => onChange([...pts.slice(0, m.index), [round(m.at[0]), round(m.at[1])], ...pts.slice(m.index)])} />
      ))}
      {pts.map((p, i) => (
        <Handle key={`v${i}-${pts.length}`} at={toLL(p)}
          onDrag={ll => onChange(pts.map((q, j) => (j === i ? [round(ll.lat), round(ll.lng)] : q)))}
          onDelete={pts.length > min ? () => onChange(pts.filter((_, j) => j !== i)) : undefined} />
      ))}
    </>
  );
}

export function NeighbourhoodMap({ value, onChange }: Props) {
  const [mode, setMode] = useState<'boundary' | 'route' | null>(null);
  const [draft, setDraft] = useState<Pt[]>([]);

  const boundary = value.boundary && value.boundary.length >= 3 ? value.boundary : null;
  const route = value.route && value.route.length >= 2 ? value.route : null;
  const draftLL = draft.map(toLL);

  const discardDraft = () => { setDraft([]); setMode(null); };

  const finishDraw = () => {
    if (!mode || draft.length < (mode === 'boundary' ? 3 : 2)) { discardDraft(); return; }
    onChange({ ...value, [mode]: draft });
    discardDraft();
  };

  const onMapClick = (ll: LatLng) => {
    if (mode) { setDraft(d => [...d, [round(ll.lat), round(ll.lng)]]); return; }
    onChange({ ...value, lat: round(ll.lat), lng: round(ll.lng) });
  };

  const ptCount = draft.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Map</label>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>📍 Click map to set centre pin</span>
                  </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {mode ? (
          <>
            <span className="text-muted-foreground">
              Click the map to add points ({ptCount}) — {mode === 'boundary' ? 'at least 3' : 'at least 2'}.
            </span>
            <button type="button" onClick={finishDraw} className="px-3 py-1 rounded-lg bg-[#12343B] text-white">Finish</button>
            <button type="button" onClick={discardDraft} className="px-3 py-1 rounded-lg border border-border">Cancel</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => { setDraft([]); setMode('boundary'); }} className="px-3 py-1 rounded-lg border border-border hover:bg-muted">⬡ Draw boundary</button>
            <button type="button" onClick={() => { setDraft([]); setMode('route'); }} className="px-3 py-1 rounded-lg border border-border hover:bg-muted">〰 Draw walk route</button>
          </>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border border-border" style={{ height: 360 }}>
        <MapView
          center={value.lat != null && value.lng != null ? { lat: value.lat, lng: value.lng } : QC}
          zoom={14}
          onClick={onMapClick}
        >
          {boundary && <Polygon path={boundary.map(toLL)} color="#12343B" width={2} fillColor="#7ecfcf" fillOpacity={0.15} />}
          {route && <Polyline path={route.map(toLL)} color="#12343B" width={6} opacity={0.9} />}
          {mode === 'boundary' && draft.length >= 3 && <Polygon path={draftLL} color="#12343B" width={2} fillColor="#7ecfcf" fillOpacity={0.15} />}
          {mode && draft.length >= 2 && !(mode === 'boundary' && draft.length >= 3) && <Polyline path={draftLL} color="#12343B" width={mode === 'route' ? 6 : 2} opacity={0.9} />}
          {mode && draft.map((p, i) => <Handle key={`d${i}`} at={toLL(p)} />)}
          {!mode && boundary && <ShapeHandles pts={boundary} closed min={3} onChange={b => onChange({ ...value, boundary: b })} />}
          {!mode && route && <ShapeHandles pts={route} closed={false} min={2} onChange={r => onChange({ ...value, route: r })} />}
          {value.lat != null && value.lng != null && (
            <HtmlMarker position={{ lat: value.lat, lng: value.lng }} anchor="bottom">
              <svg width="25" height="32" viewBox="0 0 30 38" aria-hidden="true"><path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 13.6 22 14.2 22.5.5.4 1.2.4 1.7 0C16.4 37 30 25.5 30 15 30 6.7 23.3 0 15 0z" fill="#12343B" /></svg>
            </HtmlMarker>
          )}
        </MapView>
      </div>

      {(value.lat != null || value.boundary || value.route) && (
        <div className="flex gap-4 text-xs text-muted-foreground font-mono bg-muted/40 rounded-lg px-3 py-2">
          {value.lat != null && (
            <span>📍 {value.lat}, {value.lng}</span>
          )}
          {value.boundary && (
            <span>⬡ {value.boundary.length} boundary points</span>
          )}
          {value.route && (
            <span>〰 {value.route.length}-point route</span>
          )}
          <button
            type="button"
            onClick={() => onChange({ lat: null, lng: null, boundary: null, route: null })}
            className="ml-auto text-red-400 hover:text-red-600 transition"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
