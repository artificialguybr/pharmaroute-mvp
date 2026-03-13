import React from 'react';
import { ChevronRight, MapPin, Settings, BarChart3, Target } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Popup, FeatureGroup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
// @ts-ignore
import { EditControl } from 'react-leaflet-draw';
import { motion, AnimatePresence } from 'framer-motion';
import { Seller, Pharmacy } from '../../data/pharmacies';
import { cn } from '../../lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

interface TerritoriesTabProps {
  territoryRegionFilter: string;
  setTerritoryRegionFilter: (val: string) => void;
  territoryStatusFilter: string;
  setTerritoryStatusFilter: (val: string) => void;
  sellers: Seller[];
  selectedSeller: Seller | null;
  handleSellerSelect: (seller: Seller) => void;
  handleRadiusChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mapCenter: [number, number];
  mapZoom: number;
  handleBoundsChange: (bounds: L.LatLngBounds) => void;
  filteredPharmacies: Pharmacy[];
  icons: Record<string, L.DivIcon>;
  showMapStats: boolean;
  setShowMapStats: (val: boolean) => void;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

function MapEvents({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  useMapEvents({
    moveend: (e) => {
      onBoundsChange(e.target.getBounds());
    },
    zoomend: (e) => {
      onBoundsChange(e.target.getBounds());
    }
  });
  return null;
}

export function TerritoriesTab({
  territoryRegionFilter,
  setTerritoryRegionFilter,
  territoryStatusFilter,
  setTerritoryStatusFilter,
  sellers,
  selectedSeller,
  handleSellerSelect,
  handleRadiusChange,
  mapCenter,
  mapZoom,
  handleBoundsChange,
  filteredPharmacies,
  icons,
  showMapStats,
  setShowMapStats
}: TerritoriesTabProps) {
  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10 bg-[#F7F7F7]">
      {/* Territory Sidebar */}
      <div className="w-full md:w-80 bg-white border-r-2 border-[#2D2926]/10 flex flex-col shrink-0 md:h-full max-h-[40vh] md:max-h-none border-b-2 md:border-b-0 shadow-none z-20">
        <div className="p-8 border-b-2 border-[#2D2926]/10 shrink-0">
          <h2 className="font-display font-bold tracking-tight text-3xl uppercase text-[#2D2926] mb-1">Controle de Zonas</h2>
          <p className="font-display text-[9px] font-bold tracking-widest uppercase opacity-50 text-[#2D2926] mb-8">Gestão Espacial e Parâmetros</p>
          
          <div className="flex flex-col gap-4">
            <div className="w-full relative">
              <select 
                value={territoryRegionFilter}
                onChange={(e) => setTerritoryRegionFilter(e.target.value)}
                className="w-full bg-transparent border-2 border-[#2D2926]/20 text-[#2D2926] text-xs font-bold tracking-widest uppercase px-5 py-4 focus:outline-none appearance-none rounded-sm cursor-pointer hover:border-[#2D2926] transition-colors"
              >
                <option value="all">Universo Visível</option>
                <option value="Centro">Setor Alpha (Centro)</option>
                <option value="Zona Sul">Setor Beta (Sul)</option>
                <option value="Zona Norte">Setor Gamma (Norte)</option>
                <option value="Zona Oeste">Setor Delta (Oeste)</option>
                <option value="Zona Leste">Setor Epsilon (Leste)</option>
              </select>
              <ChevronRight className="w-4 h-4 text-[#2D2926] absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" strokeWidth={2} />
            </div>
            <div className="w-full relative">
              <select 
                value={territoryStatusFilter}
                onChange={(e) => setTerritoryStatusFilter(e.target.value)}
                className="w-full bg-transparent border-2 border-[#2D2926]/20 text-[#2D2926] text-xs font-bold tracking-widest uppercase px-5 py-4 focus:outline-none appearance-none rounded-sm cursor-pointer hover:border-[#2D2926] transition-colors"
              >
                <option value="all">Status Global</option>
                <option value="needs_visit">Prioridade Pendente</option>
                <option value="visited_recently">Ação Concluída</option>
              </select>
              <ChevronRight className="w-4 h-4 text-[#2D2926] absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" strokeWidth={2} />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F7F7F7]">
          {sellers.map(seller => (
            <button 
              key={seller.id}
              onClick={() => handleSellerSelect(seller)}
              className={cn(
                "w-full text-left p-5 transition-all rounded-sm border-2 relative overflow-hidden group",
                selectedSeller?.id === seller.id 
                  ? "bg-[#2D2926] text-white border-[#2D2926]" 
                  : "bg-white text-[#2D2926] hover:border-[#2D2926] border-[#2D2926]/10"
              )}
            >
              {selectedSeller?.id === seller.id && (
                <div className="absolute top-0 left-0 w-2 h-full bg-[#FFC600]"></div>
              )}
              <div className="flex justify-between items-center mb-4 pl-2">
                <span className="font-display font-bold text-sm uppercase">{seller.name}</span>
              </div>
              <div className="flex justify-between items-center pl-2">
                <span className="font-display text-[9px] font-bold tracking-widest uppercase opacity-70">{seller.region}</span>
                <span className="font-display text-[9px] font-bold tracking-widest uppercase opacity-70 flex items-center gap-1">
                  <MapPin className="w-3 h-3" strokeWidth={2} /> {(seller.territory.radius / 1000).toFixed(1)}KM
                </span>
              </div>
            </button>
          ))}
        </div>

        {selectedSeller && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-8 border-t-2 border-[#2D2926]/10 bg-white">
            <h3 className="font-display font-bold text-lg uppercase text-[#2D2926] mb-6 flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#FFC600]" strokeWidth={2} /> Calibração
            </h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between font-display text-xs font-bold uppercase tracking-widest text-[#2D2926] mb-4">
                  <span>Raio Operacional</span>
                  <span className="text-[#FFC600] bg-[#2D2926] px-2 py-1">{(selectedSeller.territory.radius / 1000).toFixed(1)} km</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="10000" 
                  step="500"
                  value={selectedSeller.territory.radius}
                  onChange={handleRadiusChange}
                  className="w-full h-1 bg-[#2D2926]/20 rounded-none appearance-none cursor-pointer accent-[#FFC600]"
                />
              </div>
              <button className="w-full py-4 bg-[#FFC600] text-[#2D2926] border-2 border-[#2D2926] rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors font-display font-bold text-[10px] tracking-widest uppercase shadow-[4px_4px_0_rgba(45,41,38,1)] active:translate-y-1 active:translate-x-1 active:shadow-none">
                Salvar Parâmetros
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Territory Map */}
      <div className="flex-1 relative h-[50vh] md:h-auto bg-[#F7F7F7]">
        <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full border-l border-[#2D2926]/10" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <MapEvents onBoundsChange={handleBoundsChange} />
          
          <FeatureGroup>
            <EditControl
              position='topright'
              draw={{
                rectangle: true,
                circle: true,
                polygon: true,
                polyline: false,
                marker: false,
                circlemarker: false,
              }}
            />
            {/* Draw all territories */}
            {sellers.map(seller => (
              <Circle 
                key={`circle-${seller.id}`}
                center={[seller.territory.lat, seller.territory.lng]}
                radius={seller.territory.radius}
                pathOptions={{ 
                  color: selectedSeller?.id === seller.id ? '#FFC600' : '#2D2926', 
                  fillColor: selectedSeller?.id === seller.id ? '#FFC600' : '#2D2926', 
                  fillOpacity: selectedSeller?.id === seller.id ? 0.2 : 0.05,
                  weight: selectedSeller?.id === seller.id ? 3 : 1,
                  dashArray: selectedSeller?.id === seller.id ? '10, 10' : undefined
                }}
              />
            ))}
          </FeatureGroup>

          <MarkerClusterGroup chunkedLoading>
            {filteredPharmacies.map(pharmacy => (
              <Marker 
                key={pharmacy.id} 
                position={[pharmacy.lat, pharmacy.lng]}
                icon={icons[pharmacy.status]}
              >
                <Popup className="">
                  <div className="p-4 bg-white border-2 border-[#2D2926] rounded-sm shadow-[4px_4px_0_rgba(45,41,38,1)]">
                    <h3 className="font-display font-bold uppercase text-sm text-[#2D2926] mb-2">{pharmacy.name}</h3>
                    <p className="font-display text-[9px] font-bold tracking-widest uppercase opacity-70 text-[#2D2926] leading-relaxed">{pharmacy.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-6 left-6 z-[400] flex flex-col gap-3">
          <button
            onClick={() => setShowMapStats(!showMapStats)}
            className={cn(
              "w-14 h-14 rounded-sm transition-colors pointer-events-auto flex items-center justify-center border-2 border-[#2D2926]",
              showMapStats 
                ? "bg-[#2D2926] text-[#FFC600]" 
                : "bg-white text-[#2D2926] hover:bg-[#FFC600]"
            )}
            title="Análises da Zona"
          >
            <BarChart3 className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Map Overlay Stats */}
        <AnimatePresence>
          {showMapStats && (
            <motion.div 
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-6 left-6 z-[400] bg-[#2D2926] border-2 border-[#2D2926] p-8 rounded-sm shadow-[8px_8px_0_rgba(255,198,0,1)] pointer-events-auto text-white max-w-sm"
            >
              <div className="relative z-10">
                <h4 className="font-display font-bold tracking-tight text-3xl uppercase text-[#FFC600] mb-8 flex items-center gap-3 border-b-2 border-white/10 pb-4">
                  <Target className="w-6 h-6 text-white" strokeWidth={2} />
                  Telemetria
                </h4>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between font-display text-[10px] font-bold uppercase tracking-widest opacity-80 mb-3">
                      <span>Cobertura de Contato</span>
                      <span className="text-[#FFC600]">
                        {filteredPharmacies.length > 0 
                          ? Math.round((filteredPharmacies.filter(p => p.status === 'visited_recently').length / filteredPharmacies.length) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-sm h-2 overflow-hidden">
                      <div 
                        className="bg-[#FFC600] h-full relative" 
                        style={{ width: `${filteredPharmacies.length > 0 ? (filteredPharmacies.filter(p => p.status === 'visited_recently').length / filteredPharmacies.length) * 100 : 0}%` }}
                      >
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 text-white p-5 rounded-sm">
                      <span className="block font-display text-[9px] font-bold uppercase tracking-widest text-white/50 mb-2">Total Mapeado</span>
                      <span className="font-display font-bold tracking-tight text-5xl leading-none block">{filteredPharmacies.length}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 text-white p-5 rounded-sm">
                      <span className="block font-display text-[9px] font-bold uppercase tracking-widest text-white/50 mb-2">Ação Prioritária</span>
                      <span className="font-display font-bold tracking-tight text-5xl leading-none block text-[#FFC600]">{filteredPharmacies.filter(p => p.status === 'needs_visit').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
