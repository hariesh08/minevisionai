import React, { useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Activity,
  Layers,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import * as LNamespace from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MineZone, mineZones } from '../../data/mockData';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { useRealTime } from '../../hooks/useRealTime';

/* Leaflet ships a UMD bundle; Vite's CJS interop can expose the module
   either as the namespace or under `default`. Normalize both cases. */
const L: typeof LNamespace =
  (LNamespace as unknown as { default: typeof LNamespace }).default ?? LNamespace;

export interface MineZoneMapProps {
  onSelectZone?: (zone: MineZone) => void;
  onOpenCCTV?: (zoneCode: string) => void;
  searchQuery?: string;
}

/* Georeference for the mine showcase area (Singrauli coal belt, India).
   Zone polygons from mockData are stored as fractional (0-100) map
   coordinates, so they are re-projected onto these real-world bounds. */
const MAP_CENTER: [number, number] = [24.12, 82.682];
const INITIAL_ZOOM = 14;

/* Esri World Imagery is a public tile service that needs NO API key.
   It is the preferred provider for the satellite layer. */
const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const TILE_ATTRIBUTION =
  '&copy; Esri, Maxar, Earthstar Geographics &copy; GIS User Community';

interface ZonePaintState {
  weight: number;
  fillOpacity: number;
  dash: string | undefined;
}

const ZONE_PAINT: Record<string, ZonePaintState> = {
  ZONE_A: { weight: 2.5, fillOpacity: 0.28, dash: '4 2' },
  ZONE_B: { weight: 3, fillOpacity: 0.38, dash: undefined },
  ZONE_C: { weight: 2.5, fillOpacity: 0.32, dash: undefined },
  ZONE_D: { weight: 2.5, fillOpacity: 0.28, dash: '4 2' },
};

const STATUS_SHORT: Record<string, string> = {
  Normal: 'Normal',
  'High Risk': 'High Risk',
  Warning: 'Warning',
  'Environmental Warning': 'Env. Warning',
};

export const MineZoneMap: React.FC<MineZoneMapProps> = ({
  onSelectZone,
  onOpenCCTV,
  searchQuery = '',
}) => {
  const [selectedZone, setSelectedZone] = useState<MineZone | null>(null);
  const [activeHoverZone, setActiveHoverZone] = useState<MineZone | null>(null);
  /* 'satellite' = live Leaflet imagery; 'demo' = local fallback render */
  const [mode, setMode] = useState<'satellite' | 'demo'>('satellite');
  const [demoZoom, setDemoZoom] = useState(1);
  const { time, formattedTimeWithSeconds } = useRealTime();

  const cardRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const zoneLayerRef = useRef<L.Polygon[]>([]);
  const labelLayerRef = useRef<L.LayerGroup | null>(null);
  const zoneBoundsRef = useRef<L.LatLngBounds | null>(null);

  /* Kept in a ref so Leaflet event handlers always read the latest
     search term without being re-bound. */
  const searchStateRef = useRef<SearchState>({ isSearching: false, matches: () => false });
  searchStateRef.current = buildSearchState(searchQuery);

  const handleZoomIn = () => {
    const map = leafletMapRef.current;
    if (mode === 'satellite' && map) {
      map.zoomIn();
      return;
    }
    setDemoZoom((prev) => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    const map = leafletMapRef.current;
    if (mode === 'satellite' && map) {
      map.zoomOut();
      return;
    }
    setDemoZoom((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleResetView = () => {
    const map = leafletMapRef.current;
    if (mode === 'satellite' && map) {
      map.setView(MAP_CENTER, INITIAL_ZOOM);
      return;
    }
    setDemoZoom(1);
  };

  const handleToggleFullscreen = () => {
    const el = cardRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen();
    }
  };

  const handleZoneClick = (zone: MineZone) => {
    setSelectedZone(zone);
    if (onSelectZone) onSelectZone(zone);
  };

  /* ---------------------------------------------------------------
     Satellite mode: init a Leaflet map once. The map re-projects the
     existing zone polygons onto the current viewport bounds so labels
     and polygons stay aligned with the imagery.
     --------------------------------------------------------------- */
  useEffect(() => {
    if (mode !== 'satellite') return;
    const container = mapContainerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: MAP_CENTER,
      zoom: INITIAL_ZOOM,
      zoomControl: false,
      attributionControl: true,
      minZoom: 10,
      maxZoom: 18,
    });
    map.attributionControl?.setPrefix(false);
    map.attributionControl?.setPosition('bottomright');

    leafletMapRef.current = map;

    let loadedTiles = 0;
    let failedTiles = 0;
    let demoTimer = 0;

    const switchToDemo = () => {
      window.clearTimeout(demoTimer);
      try {
        map.remove();
      } catch {
        /* noop */
      }
      leafletMapRef.current = null;
      zoneLayerRef.current = [];
      labelLayerRef.current = null;
      zoneBoundsRef.current = null;
      setMode((m) => (m === 'satellite' ? 'demo' : m));
    };

    const tiles = L.tileLayer(TILE_URL, {
      maxZoom: 18,
      attribution: TILE_ATTRIBUTION,
      crossOrigin: true,
    });
    tiles.on('tileload', () => {
      loadedTiles += 1;
    });
    tiles.on('tileerror', () => {
      failedTiles += 1;
      if (failedTiles >= 4) switchToDemo();
    });
    tiles.addTo(map);

    /* Banner halfway across the screen, still zero tiles => offline. */
    demoTimer = window.setTimeout(() => {
      if (loadedTiles === 0) switchToDemo();
    }, 8000);

    /* Re-project zone polygons from the existing mockData onto the map. */
    zoneBoundsRef.current = map.getBounds();
    const b = map.getBounds();

    const paintAll = () => {
      zoneLayerRef.current.forEach((poly, i) => {
        const zone = mineZones[i];
        const s = searchStateRef.current;
        const paint = ZONE_PAINT[zone.id.toUpperCase()] ?? ZONE_PAINT.ZONE_A;
        if (s.isSearching && !s.matches(zone)) {
          poly.setStyle({
            color: zone.statusColor,
            fillColor: zone.statusColor,
            fillOpacity: 0.1,
            opacity: 0.25,
          });
        } else {
          poly.setStyle({
            color: zone.statusColor,
            fillColor: zone.statusColor,
            fillOpacity: paint.fillOpacity,
            opacity: 0.95,
            weight: paint.weight,
            dashArray: paint.dash,
          });
        }
      });
    };

    const zoneLayers: L.Polygon[] = [];
    mineZones.forEach((zone) => {
      const paint = ZONE_PAINT[zone.id.toUpperCase()] ?? ZONE_PAINT.ZONE_A;
      const latLngs: [number, number][] = zone.polygon.map(([x, y]) => [
        b.getNorth() - (y / 100) * (b.getNorth() - b.getSouth()),
        b.getWest() + (x / 100) * (b.getEast() - b.getWest()),
      ]);

      const poly = L.polygon(latLngs, {
        color: zone.statusColor,
        weight: paint.weight,
        opacity: 0.95,
        fillColor: zone.statusColor,
        fillOpacity: paint.fillOpacity,
        dashArray: paint.dash,
        className: zone.riskLevel === 'HIGH' ? 'mzv-zone-pulse' : undefined,
      });
      poly.on('mouseover', () => {
        poly.bringToFront();
        poly.setStyle({ weight: 4, fillOpacity: ZONE_PAINT[zone.id.toUpperCase()]?.fillOpacity ?? 0.3 + 0.08 });
        setActiveHoverZone(zone);
      });
      poly.on('mouseout', () => {
        paintAll();
        setActiveHoverZone(null);
      });
      poly.on('click', () => handleZoneClick(zone));
      poly.addTo(map);
      zoneLayers.push(poly);

      /* Floating label marker anchored at the zone center. */
      const [cx, cy] = zone.center;
      const centerLatLng: [number, number] = [
        b.getNorth() - (cy / 100) * (b.getNorth() - b.getSouth()),
        b.getWest() + (cx / 100) * (b.getEast() - b.getWest()),
      ];
      labelLayerRef.current = labelLayerRef.current ?? L.layerGroup().addTo(map);
      addZoneLabel(centerLatLng, zone, labelLayerRef.current, handleZoneClick);
    });
    zoneLayerRef.current = zoneLayers;

    /* Keep the Leaflet canvas sharp when the dashboard reflows. */
    let resizeTicks = 0;
    const ro = new ResizeObserver(() => {
      resizeTicks += 1;
      if (resizeTicks >= 2) {
        map.invalidateSize();
        resizeTicks = 0;
      } else {
        window.setTimeout(() => map.invalidateSize(), 60);
      }
    });
    ro.observe(map.getContainer());

    return () => {
      window.clearTimeout(demoTimer);
      ro.disconnect();
      try {
        map.remove();
      } catch {
        /* noop */
      }
      leafletMapRef.current = null;
      zoneLayerRef.current = [];
      labelLayerRef.current = null;
      zoneBoundsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /* Repaint zones + labels when the global search filter changes. */
  useEffect(() => {
    const layer = labelLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const b = zoneBoundsRef.current;
    if (!b) return;
    mineZones.forEach((zone) => {
      const [cx, cy] = zone.center;
      const ll: [number, number] = [
        b.getNorth() - (cy / 100) * (b.getNorth() - b.getSouth()),
        b.getWest() + (cx / 100) * (b.getEast() - b.getWest()),
      ];
      addZoneLabel(ll, zone, layer, handleZoneClick);
    });
    const map = leafletMapRef.current;
    if (!map) return;
    zoneLayerRef.current.forEach((poly, i) => {
      const s = searchStateRef.current;
      const zone = mineZones[i];
      const paint = ZONE_PAINT[zone.id.toUpperCase()] ?? ZONE_PAINT.ZONE_A;
      if (s.isSearching && !s.matches(zone)) {
        poly.setStyle({
          color: zone.statusColor,
          fillColor: zone.statusColor,
          fillOpacity: 0.1,
          opacity: 0.25,
        });
      } else {
        poly.setStyle({
          color: zone.statusColor,
          fillColor: zone.statusColor,
          fillOpacity: paint.fillOpacity,
          opacity: 0.95,
          weight: paint.weight,
          dashArray: paint.dash,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, mode]);

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;
  const zoneAssignKey = `${mode}-${isSearching}-${query}`;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full"
    >
      {/* Header with Title and Legend */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Mine Zone Map</h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs shadow-red-500/50" />
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
            <span>Warning</span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative z-0 flex-1 min-h-[260px] sm:min-h-[310px] bg-[#1e293b] overflow-hidden group select-none">
        {mode === 'satellite' ? (
          /* Live Esri satellite imagery with Leaflet */
          <div ref={mapContainerRef} className="absolute inset-0 z-0" aria-label="Satellite mine map" />
        ) : (
          /* Offline / tile-failure fallback: satellite-style render */
          <DemoMineMap
            key={zoneAssignKey}
            zoom={demoZoom}
            encouragePulse={false}
            searchState={searchStateRef.current}
            onZoneClick={handleZoneClick}
            onZoneHover={setActiveHoverZone}
          />
        )}

        {/* Imagery / mode badge */}
        <div className="absolute top-2.5 right-3 z-[1100] flex items-center gap-1.5 pointer-events-none">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-xs ${
              mode === 'satellite'
                ? 'bg-slate-900/70 text-sky-300 border border-sky-500/40 font-mono'
                : 'bg-orange-600/90 text-white border border-orange-400 font-mono'
            }`}
          >
            {mode === 'satellite' ? '● Satellite' : 'DEMO DATA'}
          </span>
        </div>

        {/* Hover info tooltip */}
        {activeHoverZone && (
          <div className="absolute top-2.5 left-3 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs shadow-lg backdrop-blur-xs pointer-events-none flex items-center gap-2 z-[1100]">
            <span className="font-bold">{activeHoverZone.code}</span>
            <span className="text-slate-400">|</span>
            <span>{activeHoverZone.workers} Workers</span>
            <span className="text-slate-400">|</span>
            <span
              className={
                activeHoverZone.riskLevel === 'HIGH'
                  ? 'text-red-400 font-bold'
                  : activeHoverZone.riskLevel === 'MEDIUM'
                  ? 'text-amber-400 font-semibold'
                  : 'text-emerald-400'
              }
            >
              Risk: {activeHoverZone.riskScore}/100
            </span>
          </div>
        )}

        {/* Map Controls (Zoom in / out / reset / fullscreen) */}
        <div className="absolute bottom-14 right-3 flex flex-col bg-slate-900/85 border border-slate-700/80 rounded-lg overflow-hidden shadow-lg backdrop-blur-xs z-[1100]">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-700/80"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-700/80"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-700/80"
            title="Reset View"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Fullscreen"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Telemetry footer bar */}
        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-xs pointer-events-none">
          GIS Telemetry: Lat 24.120°N Lon 82.682°E •{' '}
          {mode === 'satellite' ? 'Satellite 1.2m GSD' : 'Offline Demo Render'}
        </div>
      </div>

      {/* Zone Details Modal */}
      {selectedZone && (
        <Modal
          isOpen={!!selectedZone}
          onClose={() => setSelectedZone(null)}
          title={selectedZone.name}
          subtitle={`Mine Sector Code: ${selectedZone.code} • Active Monitoring`}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-mono">
                Telemetry Synced: {time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {formattedTimeWithSeconds}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const zone = selectedZone.code;
                    setSelectedZone(null);
                    if (onOpenCCTV) onOpenCCTV(zone);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Live CCTV</span>
                </button>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Risk and Score Banner */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                selectedZone.riskLevel === 'HIGH'
                  ? 'bg-red-50/80 border-red-200 text-red-900'
                  : selectedZone.riskLevel === 'MEDIUM'
                  ? 'bg-orange-50/80 border-orange-200 text-orange-900'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              }`}
            >
              <div>
                <div className="text-xs font-medium opacity-80 uppercase tracking-wider">
                  Operational Risk Status
                </div>
                <div className="text-lg font-bold flex items-center gap-2 mt-0.5">
                  <span>{selectedZone.status}</span>
                  <Badge
                    variant={
                      selectedZone.riskLevel === 'HIGH'
                        ? 'danger'
                        : selectedZone.riskLevel === 'MEDIUM'
                        ? 'warning'
                        : 'success'
                    }
                  >
                    Risk Level: {selectedZone.riskLevel}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-medium opacity-80">Risk Score</div>
                <div className="text-2xl font-black font-mono leading-none">
                  {selectedZone.riskScore}
                  <span className="text-xs font-normal opacity-70"> / 100</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <div className="text-[11px] text-slate-500">Active Workers</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">
                  {selectedZone.workers}
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <div className="text-[11px] text-slate-500">Active Violations</div>
                <div
                  className={`text-base font-bold mt-0.5 ${
                    selectedZone.activeViolations > 0 ? 'text-red-600' : 'text-slate-800'
                  }`}
                >
                  {selectedZone.activeViolations}
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <div className="text-[11px] text-slate-500">Ambient Temp</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">
                  {selectedZone.temperature}
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <div className="text-[11px] text-slate-500">Dust Level</div>
                <div
                  className={`text-base font-bold mt-0.5 ${
                    selectedZone.code === 'ZONE C' ? 'text-orange-600' : 'text-slate-800'
                  }`}
                >
                  {selectedZone.dustLevel}
                </div>
              </div>
            </div>

            {/* Main Issue & Recommended Action */}
            <div className="space-y-2.5 text-xs">
              <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg">
                <div className="font-semibold text-amber-900 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Main Issue Detected:</span>
                </div>
                <p className="text-amber-800 leading-relaxed">{selectedZone.mainIssue}</p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-lg">
                <div className="font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Recommended Action:</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  {selectedZone.recommendedAction}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  <span>Environmental Status:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {selectedZone.environmentalStatus}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

interface SearchState {
  isSearching: boolean;
  matches: (zone: MineZone) => boolean;
}

function buildSearchState(searchQuery: string): SearchState {
  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;
  const matches = (zone: MineZone) =>
    [zone.code, zone.name, zone.status, zone.mainIssue, zone.recommendedAction]
      .join(' ')
      .toLowerCase()
      .includes(query);
  return { isSearching, matches };
}

/* Shared HTML for the floating zone label (used by Leaflet divIcon). */
function zoneLabelHtml(zone: MineZone, highlight: boolean): string {
  const short = STATUS_SHORT[zone.status] ?? zone.status;
  return `<div class="mzv-label">
    <div class="flex flex-col cursor-pointer bg-slate-900/85 text-white px-2.5 py-1 rounded-lg border shadow-lg backdrop-blur-xs transition-all hover:bg-slate-900${
      highlight ? ' ring-2 ring-cyan-300 scale-110 shadow-cyan-400/50' : ''
    }" style="border-color:${zone.statusColor}66">
      <div class="flex items-center gap-1.5 text-[11px] font-bold leading-tight">
        <span class="w-2 h-2 rounded-full shrink-0" style="background:${zone.statusColor}"></span>
        <span>${zone.code.replace('ZONE ', 'Zone ')}</span>
      </div>
      <div class="text-[9px] font-medium leading-none mt-0.5" style="color:${zone.statusColor}">
        &#9679; ${short}
      </div>
    </div>
  </div>`;
}

function addZoneLabel(
  latlng: [number, number],
  zone: MineZone,
  layer: L.LayerGroup,
  onClick: (zone: MineZone) => void,
) {
  const icon = L.divIcon({
    className: 'mzv-label-anchor',
    html: zoneLabelHtml(zone, false),
    iconAnchor: [0, 0],
  });
  const marker = L.marker(latlng, { icon, interactive: true });
  marker.on('click', () => onClick(zone));
  marker.bindTooltip(`${zone.code} - ${zone.name}`, {
    className: 'mzv-tooltip',
    direction: 'top',
    offset: [0, -4],
  });
  layer.addLayer(marker);
}

/* ---------------------------------------------------------------
   Fallback view: a procedurally drawn "satellite-style" render of the
   same open-pit area. Used only when live imagery cannot load. Zone
   polygons reuse the exact same mineZones records as the live map.
   --------------------------------------------------------------- */
interface DemoMineMapProps {
  zoom: number;
  encouragePulse?: boolean;
  searchState: SearchState;
  onZoneClick: (zone: MineZone) => void;
  onZoneHover: (zone: MineZone | null) => void;
}

const DemoMineMap: React.FC<DemoMineMapProps> = ({
  zoom,
  searchState,
  onZoneClick,
  onZoneHover,
}) => {
  const pts = (zone: MineZone) =>
    zone.polygon.map(([x, y]) => `${(x * 10).toFixed(1)},${(y * 6).toFixed(1)}`).join(' ');

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="w-full h-full relative transition-transform duration-200 ease-out origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          aria-label="Demo mine area satellite render"
        >
          <defs>
            <linearGradient id="demoTerrain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93a376" />
              <stop offset="55%" stopColor="#86956a" />
              <stop offset="100%" stopColor="#7d8b63" />
            </linearGradient>
            <pattern id="demoFields" width="90" height="70" patternUnits="userSpaceOnUse">
              <rect width="90" height="70" fill="#8a9a6d" opacity="0.5" />
              <path
                d="M 0,12 L 90,8 M 0,30 L 90,26 M 0,52 L 90,48 M 0,66 L 90,62"
                stroke="#77875c"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <path d="M 45,0 L 45,70" stroke="#6f7f57" strokeWidth="1" opacity="0.5" />
            </pattern>
            <radialGradient id="demoPit" cx="50%" cy="55%" r="62%">
              <stop offset="0%" stopColor="#3c3226" />
              <stop offset="30%" stopColor="#54432c" />
              <stop offset="60%" stopColor="#75603d" />
              <stop offset="85%" stopColor="#987f52" />
              <stop offset="100%" stopColor="#ab936a" />
            </radialGradient>
            <radialGradient id="demoWater" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#25607a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#143947" stopOpacity="0.6" />
            </radialGradient>
          </defs>

          {/* Farmland / vegetation base */}
          <rect width="1000" height="600" fill="url(#demoTerrain)" />
          <rect width="1000" height="600" fill="url(#demoFields)" opacity="0.55" />

          {/* Field boundary lines */}
          <g stroke="#64754f" strokeWidth="2" opacity="0.5">
            <path d="M 0,140 L 380,120 L 1000,150" fill="none" />
            <path d="M 0,470 L 330,450 L 1000,480" fill="none" />
            <path d="M 620,0 L 640,220 L 1000,240" fill="none" />
          </g>

          {/* Tree clusters */}
          <g fill="#47613c" opacity="0.85">
            <circle cx="70" cy="90" r="22" />
            <circle cx="95" cy="110" r="16" />
            <circle cx="60" cy="120" r="14" />
            <circle cx="880" cy="70" r="18" />
            <circle cx="905" cy="92" r="13" />
            <circle cx="120" cy="520" r="16" />
            <circle cx="930" cy="520" r="20" />
          </g>

          {/* Stream bed */}
          <path
            d="M 0,330 C 120,300 200,340 300,380 C 420,420 500,400 560,430"
            fill="none"
            stroke="#5f7a68"
            strokeWidth="8"
            opacity="0.5"
          />

          {/* Open pit stepped benches */}
          <ellipse cx="500" cy="300" rx="460" ry="250" fill="#a9a183" opacity="0.55" />
          <ellipse cx="492" cy="305" rx="385" ry="205" fill="url(#demoPit)" opacity="0.92" />
          <ellipse cx="485" cy="312" rx="295" ry="152" fill="none" stroke="#5c4b30" strokeWidth="7" opacity="0.7" />
          <ellipse cx="478" cy="320" rx="205" ry="102" fill="none" stroke="#463a26" strokeWidth="8" opacity="0.8" />
          <ellipse cx="470" cy="328" rx="120" ry="60" fill="#3a332b" opacity="0.95" />

          {/* Haul roads curling into the pit */}
          <path
            d="M 40,160 Q 270,205 470,262 T 800,360"
            fill="none"
            stroke="#cdb385"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.65"
          />
          <path
            d="M 40,160 Q 270,205 470,262 T 800,360"
            fill="none"
            stroke="#efe3c2"
            strokeWidth="2"
            strokeDasharray="12,12"
            opacity="0.6"
          />
          <path
            d="M 970,215 Q 690,275 462,338 T 150,500"
            fill="none"
            stroke="#cdb385"
            strokeWidth="13"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Bench spiral roads inside the pit */}
          <path
            d="M 470,262 C 430,290 430,320 470,328"
            fill="none"
            stroke="#c9b085"
            strokeWidth="10"
            opacity="0.55"
          />
          <path
            d="M 470,328 C 510,336 530,320 515,302"
            fill="none"
            stroke="#c9b085"
            strokeWidth="9"
            opacity="0.55"
          />

          {/* Pit floor water retention basin */}
          <path
            d="M 430,330 C 450,318 485,317 505,330 C 525,345 495,360 465,355 Z"
            fill="url(#demoWater)"
          />

          {/* Coal stockpile + rail siding (east) */}
          <ellipse cx="820" cy="430" rx="80" ry="45" fill="#3d3a36" opacity="0.85" />
          <ellipse cx="820" cy="424" rx="55" ry="28" fill="#2a2825" opacity="0.9" />
          <path
            d="M 660,470 L 950,515 M 660,480 L 950,525 M 660,490 L 950,535"
            stroke="#5b5b55"
            strokeWidth="3"
            opacity="0.8"
          />
          <line x1="640" y1="360" x2="880" y2="430" stroke="#d8a64e" strokeWidth="4" strokeDasharray="6,4" opacity="0.8" />

          {/* 4 Interactive Zone Polygons (reuses mineZones records) */}
          {mineZones.map((zone) => {
            const paint = ZONE_PAINT[zone.id.toUpperCase()] ?? ZONE_PAINT.ZONE_A;
            const dim = searchState.isSearching && !searchState.matches(zone);
            const isHigh = zone.riskLevel === 'HIGH';
            return (
              <g
                key={zone.id}
                className="cursor-pointer transition-opacity"
                opacity={dim ? 0.3 : 1}
                onClick={() => onZoneClick(zone)}
                onMouseEnter={() => onZoneHover(zone)}
                onMouseLeave={() => onZoneHover(null)}
              >
                <polygon
                  points={pts(zone)}
                  fill={zone.statusColor}
                  fillOpacity={paint.fillOpacity}
                  stroke={zone.statusColor}
                  strokeWidth={paint.weight}
                  strokeDasharray={paint.dash}
                  className={isHigh ? 'mzv-zone-pulse' : ''}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating zone labels (same data, same styling as live map) */}
        {mineZones.map((zone) => {
          const dim = searchState.isSearching && !searchState.matches(zone);
          const highlight = searchState.isSearching && searchState.matches(zone);
          return (
            <div
              key={`${zone.id}-label`}
              onClick={() => onZoneClick(zone)}
              onMouseEnter={() => onZoneHover(zone)}
              onMouseLeave={() => onZoneHover(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all${
                highlight ? ' ring-2 ring-cyan-300 scale-110 shadow-cyan-400/50 z-10' : ''
              }${dim ? ' opacity-30' : ''}${zone.riskLevel === 'HIGH' ? ' animate-pulse' : ''}`}
              style={{ left: `${zone.center[0]}%`, top: `${zone.center[1]}%` }}
            >
              <div
                className="flex flex-col bg-slate-900/85 hover:bg-slate-900 text-white px-2.5 py-1 rounded-lg border shadow-lg backdrop-blur-xs text-[11px] font-bold"
                style={{ borderColor: `${zone.statusColor}66` }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: zone.statusColor }} />
                  {zone.code.replace('ZONE ', 'Zone ')}
                </span>
                <span className="text-[9px] font-medium leading-none mt-0.5" style={{ color: zone.statusColor }}>
                  ● {STATUS_SHORT[zone.status] ?? zone.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MineZoneMap;