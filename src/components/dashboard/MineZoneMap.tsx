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
  RefreshCw,
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
/* Fractional (0-100) mock zone coordinates are re-projected onto fixed
   real-world degrees around the anchor. Fixed coordinates keep polygons
   locked to the satellite imagery no matter how the dashboard reflows. */
const SPAN_LAT = 0.042;
const SPAN_LNG = 0.072;
const INITIAL_ZOOM = 14;
const MAX_FIT_ZOOM = 15;

/* Esri World Imagery is a public tile service that needs NO API key.
   Host aliases are rotated for resilience when a tile host is slow. */
const SATELLITE_SOURCES = [
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  'https://basemaps.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
];
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

type SatStatus = 'connecting' | 'live' | 'offline';

/* Convert a fractional (0-100) map coordinate to fixed lat/lng degrees
   around the mine anchor (Singrauli coal belt, India). */
function toLatLng([x, y]: [number, number]): [number, number] {
  return [
    MAP_CENTER[0] + (y / 100 - 0.5) * SPAN_LAT,
    MAP_CENTER[1] + (x / 100 - 0.5) * SPAN_LNG,
  ];
}

export const MineZoneMap: React.FC<MineZoneMapProps> = ({
  onSelectZone,
  onOpenCCTV,
  searchQuery = '',
}) => {
  const [selectedZone, setSelectedZone] = useState<MineZone | null>(null);
  const [activeHoverZone, setActiveHoverZone] = useState<MineZone | null>(null);
  const [satStatus, setSatStatus] = useState<SatStatus>('connecting');
  const { time, formattedTimeWithSeconds } = useRealTime();

  const cardRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const tileTimerRef = useRef(0);
  const loadedRef = useRef(false);
  const failedRef = useRef(0);
  const sourceIdxRef = useRef(0);
  const homeViewRef = useRef<{ center: L.LatLng; zoom: number } | null>(null);
  const zoneLayerRef = useRef<L.Polygon[]>([]);
  const labelLayerRef = useRef<L.LayerGroup | null>(null);

  /* Kept in a ref so Leaflet event handlers always read the latest
     search term without being re-bound. */
  const searchStateRef = useRef<SearchState>({ isSearching: false, matches: () => false });
  searchStateRef.current = buildSearchState(searchQuery);

  const handleZoomIn = () => {
    leafletMapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    leafletMapRef.current?.zoomOut();
  };

  const handleResetView = () => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (homeViewRef.current) {
      map.setView(homeViewRef.current.center, homeViewRef.current.zoom);
    } else {
      map.setView(MAP_CENTER, INITIAL_ZOOM);
    }
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
     Satellite imagery (Esri World Imagery, no API key) is the only
     backdrop. Zones are projected to fixed coordinates and always
     remain interactive, hoverable and clickable.
     --------------------------------------------------------------- */
  function attachTiles() {
    const map = leafletMapRef.current;
    if (!map) return;
    window.clearTimeout(tileTimerRef.current);
    if (tileLayerRef.current) tileLayerRef.current.remove();
    tileLayerRef.current = null;

    const url = SATELLITE_SOURCES[sourceIdxRef.current % SATELLITE_SOURCES.length];
    const layer = L.tileLayer(url, {
      maxZoom: 18,
      maxNativeZoom: 17,
      attribution: TILE_ATTRIBUTION,
      crossOrigin: true,
    });
    tileLayerRef.current = layer;

    layer.on('tileload', () => {
      loadedRef.current = true;
      failedRef.current = 0;
      setSatStatus('live');
    });
    layer.on('tileerror', () => {
      failedRef.current += 1;
      if (failedRef.current >= 6) nextSource();
    });
    layer.addTo(map);

    /* Nothing loaded at all after 15s -> try the next Esri host. */
    tileTimerRef.current = window.setTimeout(() => {
      if (!loadedRef.current) nextSource();
    }, 15000);
  }

  function nextSource() {
    sourceIdxRef.current += 1;
    loadedRef.current = false;
    failedRef.current = 0;
    window.clearTimeout(tileTimerRef.current);
    if (sourceIdxRef.current >= SATELLITE_SOURCES.length) {
      if (tileLayerRef.current) tileLayerRef.current.remove();
      tileLayerRef.current = null;
      setSatStatus('offline');
      return;
    }
    setSatStatus('connecting');
    attachTiles();
  }

  const retrySatellite = () => {
    sourceIdxRef.current = 0;
    loadedRef.current = false;
    failedRef.current = 0;
    setSatStatus('connecting');
    attachTiles();
  };

  /* Mount: init a Leaflet map once with satellite imagery, then draw
     the four zone polygons/labels on top of the imagery. */
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: MAP_CENTER,
      zoom: INITIAL_ZOOM,
      zoomControl: false,
      attributionControl: true,
      minZoom: 11,
      maxZoom: 18,
    });
    map.attributionControl?.setPrefix(false);
    map.attributionControl?.setPosition('bottomright');

    leafletMapRef.current = map;

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
      const poly = L.polygon(zone.polygon.map(toLatLng), {
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
        poly.setStyle({
          weight: 4,
          fillOpacity: (ZONE_PAINT[zone.id.toUpperCase()]?.fillOpacity ?? 0.3) + 0.08,
        });
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
      labelLayerRef.current = labelLayerRef.current ?? L.layerGroup().addTo(map);
      addZoneLabel(toLatLng(zone.center), zone, labelLayerRef.current, handleZoneClick);
    });
    zoneLayerRef.current = zoneLayers;

    /* Zoom so all four zones fit inside the card, then remember it. */
    const fitToZones = () => {
      if (zoneLayerRef.current.length === 0) return;
      const bounds = L.latLngBounds([]);
      zoneLayerRef.current.forEach((p) => bounds.extend(p.getBounds()));
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: MAX_FIT_ZOOM });
      homeViewRef.current = { center: map.getCenter(), zoom: map.getZoom() };
    };

    /* Wait a frame so the grid container can be measured. */
    const raf = window.requestAnimationFrame(() => {
      map.invalidateSize();
      fitToZones();
    });

    /* Keep the Leaflet canvas sharp when the dashboard reflows. */
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());

    attachTiles();

    return () => {
      window.clearTimeout(tileTimerRef.current);
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      try {
        map.remove();
      } catch {
        /* noop */
      }
      leafletMapRef.current = null;
      tileLayerRef.current = null;
      zoneLayerRef.current = [];
      labelLayerRef.current = null;
      homeViewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Repaint zones + labels when the global search filter changes. */
  useEffect(() => {
    const layer = labelLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    mineZones.forEach((zone) => {
      addZoneLabel(toLatLng(zone.center), zone, layer, handleZoneClick);
    });
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
  }, [searchQuery]);

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
        {/* Live Esri World Imagery satellite view via Leaflet */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0" aria-label="Satellite mine map" />

        {/* Imagery / connection badge */}
        <div className="absolute top-2.5 right-3 z-[1100] flex items-center gap-1.5 pointer-events-none">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-xs border border-slate-700/60 font-mono ${
              satStatus === 'live'
                ? 'bg-slate-900/70 text-sky-300 border-sky-500/40'
                : satStatus === 'offline'
                ? 'bg-orange-600/90 text-white border-orange-400'
                : 'bg-slate-900/70 text-amber-300 border-amber-500/40'
            }`}
          >
            {satStatus === 'live'
              ? '● Satellite'
              : satStatus === 'offline'
              ? 'OFFLINE'
              : '● Connecting…'}
          </span>
        </div>

        {/* Offline retry panel (imagery genuinely unreachable) */}
        {satStatus === 'offline' && (
          <div className="absolute inset-0 z-[1100] bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2.5 bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3.5 text-center pointer-events-auto shadow-xl">
              <p className="text-xs text-slate-300 font-medium">
                Satellite imagery is currently unreachable
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Esri World Imagery</p>
              <button
                onClick={retrySatellite}
                className="mt-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

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
          {satStatus === 'live'
            ? 'Satellite 1.2m GSD'
            : satStatus === 'offline'
            ? 'Satellite offline — reconnect'
            : 'Connecting to satellite imagery…'}
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

export default MineZoneMap;