import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pharmacy, Seller, mockActivities, mockAnnotations } from '../data/pharmacies';
import { api, ApiPharmacy, ApiSchedule, DashboardStatsResponse, SellerWithStats } from '../lib/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { BarChart3, Users, MapPin, CalendarDays, LogOut } from 'lucide-react';


import { ManagerSidebar } from '../components/Manager/ManagerSidebar';
import { ActivityPoint, DashboardTab, PerformancePoint, RegionPoint } from '../components/Manager/DashboardTab';
import { TeamTab } from '../components/Manager/TeamTab';
import { CalendarTab } from '../components/Manager/CalendarTab';
import { TerritoriesTab } from '../components/Manager/TerritoriesTab';
import { AddSellerModal } from '../components/Manager/Modals/AddSellerModal';


// Fix Leaflet default icon issue
const leafletDefaultIcon = L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown };
delete leafletDefaultIcon._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const icons = {
  needs_visit: L.divIcon({
    className: 'bg-transparent',
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center">
        <div class="absolute inset-0 bg-[#FFC500] rounded-none opacity-20 animate-ping"></div>
        <div class="relative z-10 w-4 h-4 bg-[#FFC500] border-[3px] border-[#0A0A0A] rounded-none shadow-md"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }),
  visited_recently: L.divIcon({
    className: 'bg-transparent',
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center">
        <div class="relative z-10 w-4 h-4 bg-emerald-500 border-[3px] border-[#0A0A0A] rounded-none shadow-md"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }),
  scheduled: L.divIcon({
    className: 'bg-transparent',
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center">
        <div class="relative z-10 w-4 h-4 bg-orange-500 border-[3px] border-[#0A0A0A] rounded-none shadow-md"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }),
};

export default function ManagerView({ onLogout }: { onLogout: () => void }) {
  type DashboardStats = DashboardStatsResponse['stats'];

  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'territories' | 'calendar'>('dashboard');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [territoryRegionFilter, setTerritoryRegionFilter] = useState<string>('all');
  const [territoryStatusFilter, setTerritoryStatusFilter] = useState<string>('all');
  const [showMapStats, setShowMapStats] = useState<boolean>(false);
  const [dashboardPeriod, setDashboardPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [mapPharmacies, setMapPharmacies] = useState<ApiPharmacy[]>([]);
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformancePoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityPoint[]>([]);
  const [calendarSchedules, setCalendarSchedules] = useState<ApiSchedule[]>([]);

  const [selectedTeamMember, setSelectedTeamMember] = useState<Seller | null>(null);
  const [isAddSellerModalOpen, setIsAddSellerModalOpen] = useState(false);
  const [newSeller, setNewSeller] = useState({ name: '', region: '', phone: '', email: '' });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarSellerId, setCalendarSellerId] = useState<string>('');

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatTimeAgo = (isoDate?: string) => {
    if (!isoDate) return 'agora';
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMin = Math.max(1, Math.floor(diffMs / 60000));
    if (diffMin < 60) return `${diffMin} min atrás`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h atrás`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d atrás`;
  };

  const mapActivityStatus = (status?: string): 'completed' | 'issue' | 'rescheduled' => {
    if (status === 'completed') return 'completed';
    if (status === 'issue') return 'issue';
    return 'rescheduled';
  };

  const mapRecentActivity = (entries: DashboardStatsResponse['recentActivity']): ActivityPoint[] => {
    return (entries || []).map((item, index) => {
      const mappedStatus = mapActivityStatus(item?.status);
      const action =
        mappedStatus === 'completed'
          ? 'concluiu visita em'
          : mappedStatus === 'issue'
          ? 'relatou problema em'
          : 'remarcou a visita para';

      return {
        id: item?.id ?? `act-${index}`,
        seller: item?.seller?.name ?? 'Agente',
        action,
        target: item?.pharmacy?.name ?? 'farmácia',
        time: formatTimeAgo(item?.date),
        status: mappedStatus,
      };
    });
  };

  const fallbackPerformanceData: PerformancePoint[] = [
    { name: 'Seg', concluídas: 14, pendentes: 6 },
    { name: 'Ter', concluídas: 17, pendentes: 5 },
    { name: 'Qua', concluídas: 12, pendentes: 8 },
    { name: 'Qui', concluídas: 19, pendentes: 4 },
    { name: 'Sex', concluídas: 22, pendentes: 3 },
    { name: 'Sab', concluídas: 9, pendentes: 6 },
    { name: 'Dom', concluídas: 4, pendentes: 5 },
  ];

  const regionData = useMemo<RegionPoint[]>(() => {
    if (!mapPharmacies.length) {
      return [
        { name: 'Centro', visitas: 42 },
        { name: 'Z. Sul', visitas: 38 },
        { name: 'Z. Oeste', visitas: 31 },
        { name: 'Z. Leste', visitas: 27 },
        { name: 'Z. Norte', visitas: 19 },
      ];
    }

    const counts = mapPharmacies.reduce((acc, pharmacy) => {
      const region = (pharmacy.region || 'Outros').replace('Zona ', 'Z. ');
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, visitas]) => ({ name, visitas }))
      .sort((a, b) => b.visitas - a.visitas)
      .slice(0, 6);
  }, [mapPharmacies]);

  const effectivePerformanceData = performanceData.length ? performanceData : fallbackPerformanceData;
  const effectiveActivities = recentActivity.length ? recentActivity : mockActivities;
  const effectiveDashboardStats = dashboardStats ?? {
    visitsToday: effectiveActivities.length,
    totalPharmacies: mapPharmacies.length || 128,
    needsVisit: mapPharmacies.filter((p) => p.status === 'needs_visit').length || 24,
    activeSellers: sellers.length || 6,
  };

  const handleSellerSelect = (seller: Seller) => {
    setSelectedSeller(seller);
    setMapCenter([seller.territory.lat, seller.territory.lng]);
    setMapZoom(13);
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSeller) return;
    const newRadius = parseInt(e.target.value, 10);
    const updatedSellers = sellers.map(s => 
      s.id === selectedSeller.id ? { ...s, territory: { ...s.territory, radius: newRadius } } : s
    );
    setSellers(updatedSellers);
    setSelectedSeller({ ...selectedSeller, territory: { ...selectedSeller.territory, radius: newRadius } });
  };

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.sellers.create({
        name: newSeller.name,
        email: newSeller.email,
        region: newSeller.region,
        phone: newSeller.phone,
      });
      // Refresh sellers list
      const updated = await api.sellers.list();
      const normalized: Seller[] = updated.map((seller: SellerWithStats) => ({
        id: seller.id,
        name: seller.name,
        region: seller.region ?? 'Geral',
        completedVisits: seller.completedVisits,
        pendingVisits: seller.pendingVisits,
        efficiency: seller.efficiency,
        avatar: seller.avatar ?? seller.name.slice(0, 2).toUpperCase(),
        phone: seller.phone ?? '',
        email: seller.email ?? '',
        territory: seller.territory ?? { lat: -23.5505, lng: -46.6333, radius: 3000 },
      }));
      setSellers(normalized);
    } catch (err) {
      console.error('Failed to create seller:', err);
    }
    setIsAddSellerModalOpen(false);
    setNewSeller({ name: '', region: '', phone: '', email: '' });
  };

  const schedulesForSelectedDate = calendarSchedules.filter(s => {
    const sDate = new Date(s.date);
    return sDate.getDate() === selectedDate.getDate() &&
           sDate.getMonth() === selectedDate.getMonth() &&
           sDate.getFullYear() === selectedDate.getFullYear();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const fetchCalendarSchedules = useCallback(async (sellerId: string, date: Date) => {
    try {
      const params: { date: string, sellerId?: string } = { date: date.toISOString() };
      if (sellerId) params.sellerId = sellerId;
      const data = await api.schedules.list(params);
      setCalendarSchedules(data);
    } catch (err) {
      // Ignored for UI flow
    }
  }, []);

  const fetchPharmaciesInBounds = async (bounds: L.LatLngBounds) => {
    setIsLoadingPharmacies(true);
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
      const data = await api.pharmacies.list({ bbox });
      setMapPharmacies(data);
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
    api.sellers.list().then(data => {
      const normalized: Seller[] = data.map((seller: SellerWithStats) => ({
        id: seller.id,
        name: seller.name,
        region: seller.region ?? 'Geral',
        completedVisits: seller.completedVisits,
        pendingVisits: seller.pendingVisits,
        efficiency: seller.efficiency,
        avatar: seller.avatar ?? seller.name.slice(0, 2).toUpperCase(),
        phone: seller.phone ?? '',
        email: seller.email ?? '',
        territory: seller.territory ?? { lat: -23.5505, lng: -46.6333, radius: 3000 },
      }));
      setSellers(normalized);
      if (data.length > 0 && !calendarSellerId) setCalendarSellerId(data[0].id);
      setIsLoadingSellers(false);
    }).catch(() => { setIsLoadingSellers(false); });

    const center = L.latLng(mapCenter[0], mapCenter[1]);
    fetchPharmaciesInBounds(center.toBounds(8000));
    fetchCalendarSchedules('', new Date());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api.dashboard.stats(dashboardPeriod).then((data) => {
      setDashboardStats(data.stats);
      setPerformanceData(data.performanceData ?? []);
      setRecentActivity(mapRecentActivity(data.recentActivity ?? []));
    }).catch(() => {
      setRecentActivity([]);
    });
  }, [dashboardPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCalendarSchedules(calendarSellerId, selectedDate);
  }, [selectedDate, calendarSellerId, fetchCalendarSchedules]);

  const filteredPharmacies = mapPharmacies.filter(p => {
    const matchesRegion = territoryRegionFilter === 'all' || p.region === territoryRegionFilter;
    const matchesStatus = territoryStatusFilter === 'all' || p.status === territoryStatusFilter;
    return matchesRegion && matchesStatus;
  });

  const calendarPharmacies: Pharmacy[] = useMemo(() => {
    return mapPharmacies.map((pharmacy) => ({
      id: pharmacy.id,
      name: pharmacy.name,
      address: pharmacy.address,
      lat: pharmacy.lat,
      lng: pharmacy.lng,
      phone: pharmacy.phone,
      email: pharmacy.email,
      lastVisit: pharmacy.last_visit,
      status: pharmacy.status,
      region: pharmacy.region,
      notes: pharmacy.notes,
      contactPerson: pharmacy.contact_person,
      visitHistory: [],
    }));
  }, [mapPharmacies]);

  return (
    <div className="flex h-screen bg-[#F7F7F7] font-sans text-[#2D2926] overflow-hidden selection:bg-[#FFC600] selection:text-[#2D2926] flex-col md:flex-row">
      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 bg-[#2D2926] border-b-2 border-black/20 shrink-0 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FFC600] flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-sm text-[#2D2926]">P</span>
          </div>
          <span className="font-display font-bold text-sm uppercase tracking-tight text-white">PharmaRoute</span>
        </div>
        {/* Tab pills */}
        <nav className="flex items-center gap-1">
          {[
            { id: 'dashboard' as const, label: 'Dash', Icon: BarChart3 },
            { id: 'team' as const, label: 'Equipe', Icon: Users },
            { id: 'territories' as const, label: 'Zonas', Icon: MapPin },
            { id: 'calendar' as const, label: 'Agenda', Icon: CalendarDays },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-display font-bold text-[9px] uppercase tracking-widest rounded-sm transition-colors ${
                activeTab === id ? 'bg-[#FFC600] text-[#2D2926]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button onClick={onLogout} className="text-white/30 hover:text-white transition-colors p-1.5">
            <LogOut className="w-4 h-4" strokeWidth={2} />
          </button>
        </nav>
      </header>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex">
        <ManagerSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={onLogout} 
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F7] relative min-h-0">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2D2926 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
        
        {activeTab === 'dashboard' && (
          <DashboardTab
            dashboardPeriod={dashboardPeriod}
            setDashboardPeriod={setDashboardPeriod}
            performanceData={effectivePerformanceData}
            regionData={regionData}
            mockActivities={effectiveActivities}
            mockAnnotations={mockAnnotations}
            dashboardStats={effectiveDashboardStats}
          />

        )}
        
        {activeTab === 'team' && (
          <TeamTab 
            selectedTeamMember={selectedTeamMember}
            setSelectedTeamMember={setSelectedTeamMember}
            sellers={sellers}
            mockSchedules={calendarSchedules}
            setIsAddSellerModalOpen={setIsAddSellerModalOpen}
            setActiveTab={setActiveTab}
            setSelectedSeller={setSelectedSeller}
            setCalendarSellerId={setCalendarSellerId}
          />
        )}
        
        {activeTab === 'calendar' && (
          <CalendarTab 
            sellers={sellers}
            calendarSellerId={calendarSellerId}
            setCalendarSellerId={setCalendarSellerId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            weekDays={weekDays}
            schedulesForSelectedDate={schedulesForSelectedDate}
            mockPharmacies={calendarPharmacies}
          />
        )}

        {activeTab === 'territories' && (
          <TerritoriesTab 
            territoryRegionFilter={territoryRegionFilter}
            setTerritoryRegionFilter={setTerritoryRegionFilter}
            territoryStatusFilter={territoryStatusFilter}
            setTerritoryStatusFilter={setTerritoryStatusFilter}
            sellers={sellers}
            selectedSeller={selectedSeller}
            handleSellerSelect={handleSellerSelect}
            handleRadiusChange={handleRadiusChange}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            handleBoundsChange={handleBoundsChange}
            filteredPharmacies={filteredPharmacies}
            icons={icons}
            showMapStats={showMapStats}
            setShowMapStats={setShowMapStats}
          />
        )}
      </div>

      <AddSellerModal 
        isOpen={isAddSellerModalOpen}
        onClose={() => setIsAddSellerModalOpen(false)}
        onSubmit={handleAddSeller}
        newSeller={newSeller}
        setNewSeller={setNewSeller}
      />
    </div>
  );
}
