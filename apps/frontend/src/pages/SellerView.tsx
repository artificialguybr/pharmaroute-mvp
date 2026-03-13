import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { Pharmacy, Visit, Schedule, mockUserLocation } from '../data/pharmacies';
import { api, ApiPharmacy } from '../lib/api';
import { CheckCircle2, Clock, Navigation, Map as MapIcon, Menu, AlertCircle, Minimize2 } from 'lucide-react';
import { cn, getDistance } from '../lib/utils';
import L from 'leaflet';

import { SellerSidebar } from '../components/Seller/SellerSidebar';
import { DetailsPanel } from '../components/Seller/DetailsPanel';
import { VisitModal } from '../components/Seller/Modals/VisitModal';
import { ReportModal } from '../components/Seller/Modals/ReportModal';
import { AddPharmacyModal } from '../components/Seller/Modals/AddPharmacyModal';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createMarkerIcon = (color: string) => {
  return new L.DivIcon({
    className: 'bg-transparent',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <div style="position: relative; width: 20px; height: 20px; background-color: ${color}; border: 3px solid #0A0A0A; border-radius: 50%; box-shadow: 2px 2px 0 rgba(10,10,10,1);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const icons = {
  needs_visit: createMarkerIcon('#FFC600'),
  visited_recently: createMarkerIcon('#10b981'),
  scheduled: createMarkerIcon('#f97316'),
  user: createMarkerIcon('#2D2926'),
};

const statusConfig = {
  needs_visit: { label: 'Prioridade', color: 'text-[#2D2926] bg-[#FFC600]/20 border-[#FFC600]/50 font-bold', icon: AlertCircle },
  visited_recently: { label: 'Concluído', color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/30 font-bold', icon: CheckCircle2 },
  scheduled: { label: 'Agendado', color: 'text-orange-700 bg-orange-500/10 border-orange-500/30 font-bold', icon: Clock },
};

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
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

export default function SellerView({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'map' | 'calendar'>('map');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  
  // UI State - on mobile, sidebar starts closed so the map is immediately visible
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [sortByDistance, setSortByDistance] = useState(false);
  const [isCalendarFullscreen, setIsCalendarFullscreen] = useState(false);
  
  // Visit Modal State
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isAddPharmacyModalOpen, setIsAddPharmacyModalOpen] = useState(false);

  const [visitNote, setVisitNote] = useState('');
  const [visitProducts, setVisitProducts] = useState('');
  const [visitNextSteps, setVisitNextSteps] = useState('');
  const [visitStatus, setVisitStatus] = useState<'completed' | 'issue' | 'rescheduled'>('completed');
  const [rescheduleDate, setRescheduleDate] = useState('');

  // Calendar State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Generate week days for calendar
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  let filteredPharmacies = pharmacies.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesRegion = selectedRegion === 'all' || p.region === selectedRegion;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  if (sortByDistance) {
    filteredPharmacies = [...filteredPharmacies].sort((a, b) => {
      const distA = getDistance(mockUserLocation.lat, mockUserLocation.lng, a.lat, a.lng);
      const distB = getDistance(mockUserLocation.lat, mockUserLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }

  // Fetch schedules for selected date from API
  const fetchSchedulesForDate = async (date: Date) => {
    try {
      const isoDate = date.toISOString();
      const apiSchedules = await api.schedules.list({ date: isoDate });
      const mapped: Schedule[] = apiSchedules.map(s => ({
        id: s.id,
        sellerId: (s.seller as any)?.id || '',
        pharmacyId: (s.pharmacy as any)?.id || '',
        pharmacyName: (s.pharmacy as any)?.name || '',
        date: s.date,
        notes: s.notes,
        status: s.status,
      }));
      setSchedules(mapped);
    } catch (err) {
      console.warn('Failed to fetch schedules:', err);
    }
  };

  // Map API pharmacy (snake_case) to frontend Pharmacy (camelCase)
  const mapApiPharmacy = (p: ApiPharmacy): Pharmacy => ({
    id: p.id,
    name: p.name,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    phone: p.phone,
    email: p.email,
    lastVisit: p.last_visit,
    status: p.status,
    region: p.region,
    notes: p.notes,
    contactPerson: p.contact_person,
    visitHistory: [],
  });

  // --- Real BBox Fetching from API ---
  const fetchPharmaciesInBounds = async (bounds: L.LatLngBounds) => {
    setIsLoadingPharmacies(true);
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
      const data = await api.pharmacies.list({ bbox });
      setPharmacies(data.map(mapApiPharmacy));
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error);
    } finally {
      setIsLoadingPharmacies(false);
    }
  };

  const handleBoundsChange = (bounds: L.LatLngBounds) => {
    fetchPharmaciesInBounds(bounds);
  };

  useEffect(() => {
    const center = L.latLng(mapCenter[0], mapCenter[1]);
    const initBounds = center.toBounds(2000);
    fetchPharmaciesInBounds(initBounds);
    fetchSchedulesForDate(selectedDate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePharmacyClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setMapCenter([pharmacy.lat, pharmacy.lng]);
    setMapZoom(16);
    setActiveTab('map');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleReportPharmacy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPharmacy) return;
    
    console.log(`Reported pharmacy ${selectedPharmacy.id} for: ${reportReason}`);
    
    setPharmacies(pharmacies.filter(p => p.id !== selectedPharmacy.id));
    setSelectedPharmacy(null);
    setIsReportModalOpen(false);
    setReportReason('');
  };

  // Called by AddPharmacyModal after successfully creating the pharmacy via API
  const handlePharmacyAdded = (created: any) => {
    const pharmacy: Pharmacy = {
      id: created.id,
      name: created.name,
      address: created.address,
      lat: created.lat,
      lng: created.lng,
      phone: created.phone ?? '',
      email: created.email ?? '',
      lastVisit: null,
      status: 'needs_visit',
      region: created.region ?? 'Outros',
      notes: created.notes ?? '',
      contactPerson: created.contact_person ?? '',
      visitHistory: [],
    };
    setPharmacies(prev => [...prev, pharmacy]);
    handlePharmacyClick(pharmacy);
  };

  const handleRegisterVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPharmacy) return;

    try {
      await api.visits.create({
        pharmacy_id: selectedPharmacy.id,
        notes: visitNote.trim() || 'Sem observações.',
        status: visitStatus,
        products_presented: visitProducts.trim() || undefined,
        next_steps: visitNextSteps.trim() || undefined,
      });

      // Update local state optimistically
      const newPharmacyStatus = visitStatus === 'completed' ? 'visited_recently'
        : visitStatus === 'rescheduled' ? 'scheduled' : 'needs_visit';

      setPharmacies(prev => prev.map(p =>
        p.id === selectedPharmacy.id
          ? { ...p, status: newPharmacyStatus as any, lastVisit: new Date().toISOString() }
          : p
      ));
      setSelectedPharmacy(prev => prev ? { ...prev, status: newPharmacyStatus as any } : prev);
    } catch (err) {
      console.error('Failed to register visit:', err);
    }

    setIsVisitModalOpen(false);
    setVisitNote('');
    setVisitProducts('');
    setVisitNextSteps('');
    setVisitStatus('completed');
    setRescheduleDate('');
  };

  // Re-fetch schedules whenever selected date changes
  useEffect(() => {
    fetchSchedulesForDate(selectedDate);
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const schedulesForSelectedDate = schedules.filter(s => {
    const sDate = new Date(s.date);
    return sDate.getDate() === selectedDate.getDate() &&
           sDate.getMonth() === selectedDate.getMonth() &&
           sDate.getFullYear() === selectedDate.getFullYear();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex h-screen w-full bg-[#F7F7F7] text-[#2D2926] font-sans overflow-hidden relative selection:bg-[#FFC600] selection:text-[#2D2926]">
      
      {/* DESKTOP-ONLY MENU TOGGLE (when sidebar is closed) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:flex absolute top-6 left-6 z-40 bg-[#2D2926] text-[#FFC600] w-12 h-12 items-center justify-center rounded-sm shadow-[4px_4px_0_rgba(255,198,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all border-2 border-[#2D2926]"
        >
          <Menu className="w-6 h-6" strokeWidth={2} />
        </button>
      )}

      {/* MOBILE BOTTOM ACTION BAR */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-40">
        <div className="bg-[#2D2926] border-t-2 border-[#FFC600] flex items-center justify-around px-2 py-3 safe-area-pb">
          <button
            onClick={() => { setActiveTab('map'); setIsSidebarOpen(true); }}
            className={`flex flex-col items-center gap-1 px-5 py-1 font-display font-bold text-[9px] uppercase tracking-widest transition-colors rounded-sm ${
              isSidebarOpen && activeTab === 'map' ? 'text-[#FFC600]' : 'text-white/50'
            }`}
          >
            <MapIcon className="w-5 h-5" strokeWidth={2} />
            <span>Lista</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`flex flex-col items-center gap-1 px-5 py-1 font-display font-bold text-[9px] uppercase tracking-widest transition-colors rounded-sm ${
              !isSidebarOpen ? 'text-[#FFC600]' : 'text-white/50'
            }`}
          >
            <Navigation className="w-5 h-5" strokeWidth={2} />
            <span>Mapa</span>
          </button>
          <button
            onClick={() => { setActiveTab('calendar'); setIsSidebarOpen(true); }}
            className={`flex flex-col items-center gap-1 px-5 py-1 font-display font-bold text-[9px] uppercase tracking-widest transition-colors rounded-sm ${
              isSidebarOpen && activeTab === 'calendar' ? 'text-[#FFC600]' : 'text-white/50'
            }`}
          >
            <Clock className="w-5 h-5" strokeWidth={2} />
            <span>Agenda</span>
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR (List & Filters) */}
      <SellerSidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        onAddPharmacy={() => setIsAddPharmacyModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortByDistance={sortByDistance}
        setSortByDistance={setSortByDistance}
        filteredPharmacies={filteredPharmacies}
        selectedPharmacy={selectedPharmacy}
        handlePharmacyClick={handlePharmacyClick}
        statusConfig={statusConfig}
        weekDays={weekDays}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        schedulesForSelectedDate={schedulesForSelectedDate}
        pharmacies={pharmacies}
        onCalendarFullscreen={() => { setIsCalendarFullscreen(true); setIsSidebarOpen(false); }}
      />

      {/* FULLSCREEN CALENDAR OVERLAY */}
      {isCalendarFullscreen && (
        <div className="absolute inset-0 z-40 bg-[#F7F7F7] flex flex-col">
          {/* Fullscreen Header */}
          <div className="h-16 bg-[#FFC600] border-b-2 border-[#2D2926] flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-[#2D2926] flex items-center justify-center">
                <Minimize2 className="w-4 h-4 text-[#FFC600]" strokeWidth={2} />
              </div>
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-[#2D2926] leading-none">Cronograma Completo</h2>
            </div>
            <button
              onClick={() => { setIsCalendarFullscreen(false); setIsSidebarOpen(true); }}
              className="flex items-center gap-2 h-10 px-4 bg-[#2D2926] text-[#FFC600] border-2 border-[#2D2926] rounded-sm font-display font-bold text-[10px] uppercase tracking-widest hover:bg-[#FFC600] hover:text-[#2D2926] transition-colors"
            >
              <Minimize2 className="w-4 h-4" strokeWidth={2} /> Voltar ao Mapa
            </button>
          </div>
          {/* Week days nav */}
          <div className="p-6 border-b-2 border-[#2D2926]/10 bg-white shrink-0">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {weekDays.map((date, i) => {
                const isSelected = date.getDate() === selectedDate.getDate();
                const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center min-w-[80px] py-4 border-2 rounded-sm transition-all shrink-0 font-display ${isSelected ? 'bg-[#2D2926] border-[#2D2926] text-[#FFC600] shadow-[4px_4px_0_rgba(255,198,0,1)] -translate-y-1' : 'bg-white border-[#2D2926]/20 text-[#2D2926]/60 hover:border-[#2D2926] hover:text-[#2D2926]'}`}
                  >
                    <span className="text-[10px] font-bold tracking-widest uppercase mb-2">{dayName.replace('.', '')}</span>
                    <span className="font-bold text-3xl leading-none">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Schedule content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <p className="font-display text-[10px] font-bold tracking-widest uppercase text-[#2D2926]/50 mb-6">
                ITINERÁRIO • {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
              {schedulesForSelectedDate.length === 0 ? (
                <div className="text-center p-20 border-2 border-dashed border-[#2D2926]/20 rounded-sm">
                  <p className="font-display text-[10px] font-bold uppercase tracking-widest text-[#2D2926]/40">Nenhuma missão alocada para este ciclo.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {schedulesForSelectedDate.map(schedule => {
                    const sDate = new Date(schedule.date);
                    const timeString = sDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    const pharmacy = pharmacies.find(p => p.id === schedule.pharmacyId);
                    return (
                      <div key={schedule.id} className="bg-white p-8 border-2 border-[#2D2926]/20 rounded-sm flex gap-8 hover:border-[#2D2926] hover:shadow-[4px_4px_0_rgba(45,41,38,1)] transition-all group">
                        <div className="flex flex-col items-center shrink-0 pt-1">
                          <span className="font-display text-base font-bold tracking-widest text-[#2D2926]">{timeString}</span>
                          <div className="w-2 h-2 bg-[#FFC600] border border-[#2D2926] mt-4"></div>
                          <div className="w-0.5 flex-1 bg-[#2D2926]/10 mt-3"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-2xl uppercase mb-2 text-[#2D2926]">{schedule.pharmacyName}</h3>
                          <p className="font-display text-[9px] font-bold tracking-widest uppercase text-[#2D2926]/50 mb-4">{pharmacy?.address || 'LOCAL NÃO DEFINIDO'}</p>
                          <p className="font-sans text-sm text-[#2D2926]/70 italic border-l-4 border-[#FFC600] pl-4">"{schedule.notes}"</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN MAP */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full brutalist-map" zoomControl={false}>
          {/* Custom style logic to make map grayscale if desired, kept colored but muted */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <MapEvents onBoundsChange={handleBoundsChange} />
          
          <Marker position={[mockUserLocation.lat, mockUserLocation.lng]} icon={icons.user}>
            <Popup className="cimed-popup p-0 m-0">
              <div className="p-3 bg-[#2D2926] text-white border-2 border-[#2D2926]">
                <p className="font-display font-bold text-[10px] uppercase tracking-widest text-[#FFC600]">Sua Localização</p>
              </div>
            </Popup>
          </Marker>

          <MarkerClusterGroup chunkedLoading>
            {filteredPharmacies.map(pharmacy => (
              <Marker 
                key={pharmacy.id} 
                position={[pharmacy.lat, pharmacy.lng]}
                icon={icons[pharmacy.status]}
                eventHandlers={{ click: () => handlePharmacyClick(pharmacy) }}
              >
                <Popup className="cimed-popup p-0 m-0">
                  <div className="p-5 min-w-[220px] bg-white text-[#2D2926] border-2 border-[#2D2926] shadow-[6px_6px_0_rgba(45,41,38,1)] rounded-sm">
                    <h3 className="font-display font-bold text-lg mb-2 text-[#2D2926] uppercase line-clamp-1">{pharmacy.name}</h3>
                    <p className="font-display text-[9px] font-bold text-[#2D2926]/50 mb-4 line-clamp-2 tracking-widest uppercase">{pharmacy.address}</p>
                    <span className={cn("font-display text-[9px] px-3 py-1.5 font-bold uppercase tracking-widest rounded-sm border-2 inline-block", 
                      pharmacy.status === 'needs_visit' ? "bg-amber-100 text-amber-700 border-amber-300" : 
                      pharmacy.status === 'visited_recently' ? "bg-emerald-100 text-emerald-700 border-emerald-300" : 
                      "bg-orange-100 text-orange-700 border-orange-300"
                    )}>
                      {statusConfig[pharmacy.status].label}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
        
        {/* MAP CONTROLS */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-4">
          <button 
            onClick={() => {
              setMapCenter([mockUserLocation.lat, mockUserLocation.lng]);
              setMapZoom(14);
            }}
            className="w-12 h-12 bg-white flex items-center justify-center border-2 border-[#2D2926] rounded-sm text-[#2D2926] hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors shadow-[4px_4px_0_rgba(45,41,38,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            title="Minha Localização Coordenada"
          >
            <Navigation className="w-5 h-5" strokeWidth={2} />
          </button>
          <button 
            onClick={() => {
              setMapCenter([-23.5505, -46.6333]);
              setMapZoom(12);
              setSelectedPharmacy(null);
            }}
            className="w-12 h-12 bg-white flex items-center justify-center border-2 border-[#2D2926] rounded-sm text-[#2D2926] hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors shadow-[4px_4px_0_rgba(45,41,38,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            title="Visão Geral Matriz"
          >
            <MapIcon className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* RIGHT DETAILS PANEL */}
      <DetailsPanel 
        pharmacy={selectedPharmacy}
        activeTab={activeTab}
        onClose={() => setSelectedPharmacy(null)}
        onReport={() => setIsReportModalOpen(true)}
        onRegisterVisit={() => setIsVisitModalOpen(true)}
        openGoogleMaps={openGoogleMaps}
        statusConfig={statusConfig}
      />

      {/* VISIT MODAL */}
      <VisitModal 
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        pharmacy={selectedPharmacy}
        onSubmit={handleRegisterVisit}
        visitStatus={visitStatus}
        setVisitStatus={setVisitStatus}
        rescheduleDate={rescheduleDate}
        setRescheduleDate={setRescheduleDate}
        visitProducts={visitProducts}
        setVisitProducts={setVisitProducts}
        visitNextSteps={visitNextSteps}
        setVisitNextSteps={setVisitNextSteps}
        visitNote={visitNote}
        setVisitNote={setVisitNote}
      />

      {/* REPORT MODAL */}
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        pharmacy={selectedPharmacy}
        onSubmit={handleReportPharmacy}
        reportReason={reportReason}
        setReportReason={setReportReason}
      />

      <AddPharmacyModal
        isOpen={isAddPharmacyModalOpen}
        onClose={() => setIsAddPharmacyModalOpen(false)}
        mapCenter={mapCenter}
        onSuccess={handlePharmacyAdded}
      />
    </div>
  );
}
