import React from 'react';
import { 
  Leaf, Plus, X, LogOut, Map as MapIcon, CalendarDays, Search, 
  ChevronRight, ArrowUpDown, MapPin, Navigation, Calendar, StickyNote, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getDistance } from '../../lib/utils';
import { Pharmacy, Schedule, mockUserLocation } from '../../data/pharmacies';

interface SellerSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: 'map' | 'calendar';
  setActiveTab: (tab: 'map' | 'calendar') => void;
  onLogout: () => void;
  onAddPharmacy: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortByDistance: boolean;
  setSortByDistance: (sortByDistance: boolean) => void;
  filteredPharmacies: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  handlePharmacyClick: (pharmacy: Pharmacy) => void;
  statusConfig: any;
  weekDays: Date[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  schedulesForSelectedDate: Schedule[];
  pharmacies: Pharmacy[];
  onCalendarFullscreen?: () => void;
}

export function SellerSidebar({
  isSidebarOpen, setIsSidebarOpen,
  activeTab, setActiveTab,
  onLogout, onAddPharmacy,
  searchQuery, setSearchQuery,
  selectedRegion, setSelectedRegion,
  selectedStatus, setSelectedStatus,
  sortByDistance, setSortByDistance,
  filteredPharmacies, selectedPharmacy, handlePharmacyClick,
  statusConfig,
  weekDays, selectedDate, setSelectedDate,
  schedulesForSelectedDate, pharmacies,
  onCalendarFullscreen
}: SellerSidebarProps) {
  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div 
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="absolute left-0 top-0 bottom-0 w-full md:w-[380px] bg-[#F7F7F7] border-r-2 border-[#2D2926]/10 z-30 flex flex-col shadow-[8px_0_30px_rgba(0,0,0,0.12)]"
        >
          {/* Header */}
          <header className="px-8 py-8 border-b-2 border-[#2D2926]/10 flex items-center justify-between bg-[#FFC600] text-[#2D2926] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2D2926] text-[#FFC600] flex items-center justify-center border-2 border-[#2D2926]">
                <Leaf className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h1 className="font-display font-bold tracking-tight text-xl leading-none uppercase">PHARMA<br/>ROUTE</h1>
                <p className="font-display text-[8px] font-bold tracking-widest uppercase mt-0.5 opacity-70">Agente de Campo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={onAddPharmacy}
                className="w-10 h-10 flex items-center justify-center text-[#2D2926] bg-transparent border-2 border-[#2D2926] rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors" 
                title="Novo Alvo"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="w-10 h-10 flex items-center justify-center text-[#2D2926] bg-transparent border-2 border-[#2D2926] rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors"
                title="Esconder Painel"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
              <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center text-[#2D2926]/50 border-2 border-transparent hover:border-[#2D2926] hover:text-[#2D2926] transition-colors rounded-sm" title="Desconectar">
                <LogOut className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="flex border-b-2 border-[#2D2926]/10 bg-white shrink-0 p-4 gap-4">
            <button 
              onClick={() => setActiveTab('map')}
              className={cn("flex-1 py-4 text-[10px] font-display font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all rounded-sm border-2", activeTab === 'map' ? "bg-[#2D2926] text-[#FFC600] border-[#2D2926]" : "bg-transparent text-[#2D2926]/50 border-transparent hover:border-[#2D2926]/20 hover:text-[#2D2926]")}
            >
              <MapIcon className="w-4 h-4" strokeWidth={2} /> Matriz Tática
            </button>
            <button 
              onClick={() => setActiveTab('calendar')}
              className={cn("flex-1 py-4 text-[10px] font-display font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all rounded-sm border-2", activeTab === 'calendar' ? "bg-[#2D2926] text-[#FFC600] border-[#2D2926]" : "bg-transparent text-[#2D2926]/50 border-transparent hover:border-[#2D2926]/20 hover:text-[#2D2926]")}
            >
              <CalendarDays className="w-4 h-4" strokeWidth={2} /> Cronograma
            </button>
          </div>

          {activeTab === 'map' ? (
            <>
              {/* Filters */}
              <div className="p-6 border-b-2 border-[#2D2926]/10 bg-white space-y-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D2926]/40" strokeWidth={2} />
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome..." 
                    className="w-full pl-12 pr-4 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-xs font-display font-bold tracking-widest uppercase text-[#2D2926] placeholder:text-[#2D2926]/40 focus:outline-none focus:border-[#2D2926] transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <select 
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-[#2D2926] text-[9px] font-display font-bold uppercase tracking-widest py-4 pl-4 pr-10 focus:outline-none focus:border-[#2D2926] appearance-none cursor-pointer transition-colors"
                    >
                      <option value="all">Todas Zonas</option>
                      <option value="Centro">Alpha (Centro)</option>
                      <option value="Zona Sul">Beta (Sul)</option>
                      <option value="Zona Oeste">Gamma (Oeste)</option>
                      <option value="Zona Leste">Delta (Leste)</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-[#2D2926] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" strokeWidth={2} />
                  </div>
                  <div className="flex-1 relative">
                    <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as any)}
                      className="w-full bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-[#2D2926] text-[9px] font-display font-bold uppercase tracking-widest py-4 pl-4 pr-10 focus:outline-none focus:border-[#2D2926] appearance-none cursor-pointer transition-colors"
                    >
                      <option value="all">Todos Status</option>
                      <option value="needs_visit">Prioridade</option>
                      <option value="visited_recently">Concluído</option>
                      <option value="scheduled">Agendado</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-[#2D2926] absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" strokeWidth={2} />
                  </div>
                  <button 
                    onClick={() => setSortByDistance(!sortByDistance)}
                    className={cn("w-14 shrink-0 border-2 rounded-sm transition-colors flex items-center justify-center", sortByDistance ? "bg-[#2D2926] border-[#2D2926] text-[#FFC600]" : "bg-transparent border-[#2D2926]/20 text-[#2D2926] hover:border-[#2D2926]")}
                    title="Ordenar Espacialmente"
                  >
                    <ArrowUpDown className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F7F7F7]">
                {filteredPharmacies.length === 0 ? (
                  <div className="text-center p-12 bg-white border-2 border-[#2D2926]/10 rounded-sm">
                    <MapPin className="w-10 h-10 mx-auto mb-4 text-[#2D2926]/20" strokeWidth={2} />
                    <p className="font-display text-xs font-bold uppercase tracking-widest text-[#2D2926]/40">Nenhum alvo listado.</p>
                  </div>
                ) : (
                  filteredPharmacies.map(pharmacy => {
                    const StatusIcon = statusConfig[pharmacy.status].icon;
                    const distance = getDistance(mockUserLocation.lat, mockUserLocation.lng, pharmacy.lat, pharmacy.lng).toFixed(1);
                    
                    return (
                      <div 
                        key={pharmacy.id}
                        onClick={() => handlePharmacyClick(pharmacy)}
                        className={cn(
                          "p-6 cursor-pointer transition-all border-2 rounded-sm group relative overflow-hidden",
                          selectedPharmacy?.id === pharmacy.id 
                            ? "bg-[#2D2926] border-[#2D2926] text-white shadow-[8px_8px_0_rgba(255,198,0,1)]" 
                            : "bg-white border-[#2D2926]/10 text-[#2D2926] hover:border-[#2D2926] hover:shadow-[4px_4px_0_rgba(45,41,38,1)]"
                        )}
                      >
                        {selectedPharmacy?.id === pharmacy.id && (
                          <div className="absolute top-0 left-0 w-2 h-full bg-[#FFC600]"></div>
                        )}
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-display font-bold tracking-tight text-xl uppercase pr-4 leading-none max-w-[70%]">{pharmacy.name}</h3>
                          <span className={cn(
                            "shrink-0 flex items-center gap-1.5 text-[8px] px-2.5 py-1 font-display font-bold uppercase tracking-widest rounded-sm border-2", 
                            pharmacy.status === 'needs_visit' ? "bg-amber-100 text-amber-700 border-amber-300" : 
                            pharmacy.status === 'visited_recently' ? "bg-emerald-100 text-emerald-700 border-emerald-300" : 
                            "bg-orange-100 text-orange-700 border-orange-300"
                          )}>
                            <StatusIcon className="w-3 h-3" strokeWidth={2} />
                            <span className="hidden sm:inline">
                              {statusConfig[pharmacy.status].label}
                            </span>
                          </span>
                        </div>
                        <p className={cn("text-[10px] font-display font-bold uppercase tracking-widest mb-6 line-clamp-1 flex items-center gap-3", selectedPharmacy?.id === pharmacy.id ? "text-white/70" : "text-[#2D2926]/60")}>
                          <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} /> {pharmacy.address}
                        </p>
                        <div className={cn("flex items-center justify-between font-display text-[9px] font-bold uppercase tracking-widest pt-4 border-t", selectedPharmacy?.id === pharmacy.id ? "border-white/10" : "border-[#2D2926]/10")}>
                          <div className="flex items-center gap-6">
                            <span className={cn("flex items-center gap-2", selectedPharmacy?.id === pharmacy.id ? "text-[#FFC600]" : "text-[#2D2926]/80")}>
                              <Navigation className="w-3 h-3" strokeWidth={2} /> {distance} KM
                            </span>
                            <span className={cn("flex items-center gap-2", selectedPharmacy?.id === pharmacy.id ? "text-white/60" : "text-[#2D2926]/50")}>
                              <Calendar className="w-3 h-3" strokeWidth={2} />
                              {pharmacy.lastVisit ? new Date(pharmacy.lastVisit).toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' }) : 'S/ DADO'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* CALENDAR VIEW IN SIDEBAR */
            <div className="flex-1 flex flex-col bg-[#F7F7F7] overflow-hidden">
              <div className="px-5 pt-5 pb-2 border-b-2 border-[#2D2926]/10 bg-white shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-[10px] font-bold tracking-widest uppercase text-[#2D2926]">Próximos 7 Ciclos</h3>
                  <button
                    onClick={onCalendarFullscreen}
                    className="w-8 h-8 flex items-center justify-center border-2 border-[#2D2926]/20 rounded-sm text-[#2D2926]/50 hover:border-[#2D2926] hover:text-[#2D2926] hover:bg-[#FFC600] transition-colors"
                    title="Expandir Cronograma"
                  >
                    <Maximize2 className="w-3 h-3" strokeWidth={2} />
                  </button>
                </div>
                {/* overflow-x-auto with padding so the -translate-y on selected card is visible */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 pt-2">
                  {weekDays.map((date, i) => {
                    const isSelected = date.getDate() === selectedDate.getDate();
                    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "flex flex-col items-center justify-center min-w-[68px] py-3 border-2 rounded-sm transition-all shrink-0 font-display",
                          isSelected 
                            ? "bg-[#2D2926] border-[#2D2926] text-[#FFC600] shadow-[4px_4px_0_rgba(255,198,0,1)] -translate-y-1" 
                            : "bg-white border-[#2D2926]/20 text-[#2D2926]/60 hover:border-[#2D2926] hover:text-[#2D2926]"
                        )}
                      >
                        <span className="text-[9px] font-bold tracking-widest uppercase mb-1">{dayName.replace('.', '')}</span>
                        <span className="font-bold text-2xl leading-none">{date.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6 relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2D2926 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                
                <h4 className="font-display text-[10px] font-bold tracking-widest uppercase text-[#2D2926]/50 mb-6 relative z-10 flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-[#FFC600]" strokeWidth={2} />
                  ITINERÁRIO • {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </h4>
                
                {schedulesForSelectedDate.length === 0 ? (
                  <div className="text-center p-12 bg-transparent border-2 border-dashed border-[#2D2926]/20 rounded-sm relative z-10">
                    <CalendarDays className="w-10 h-10 mx-auto mb-4 text-[#2D2926]/20" strokeWidth={2} />
                    <p className="font-display text-[10px] font-bold uppercase tracking-widest text-[#2D2926]/40">Nenhuma missão alocada.</p>
                  </div>
                ) : (
                  <div className="relative z-10 space-y-6">
                    {schedulesForSelectedDate.map(schedule => {
                      const sDate = new Date(schedule.date);
                      const timeString = sDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                      const pharmacy = pharmacies.find(p => p.id === schedule.pharmacyId);
                      
                      return (
                        <div key={schedule.id} className="bg-white p-6 border-2 border-[#2D2926]/20 rounded-sm flex gap-6 hover:border-[#2D2926] hover:shadow-[4px_4px_0_rgba(45,41,38,1)] transition-all group">
                          <div className="flex flex-col items-center justify-start shrink-0 pt-1">
                            <span className="font-display text-sm font-bold tracking-widest text-[#2D2926]">{timeString}</span>
                            <div className="w-2 h-2 bg-[#FFC600] border border-[#2D2926] rounded-none mt-4"></div>
                            <div className="w-0.5 h-full bg-[#2D2926]/10 mt-3 group-hover:bg-[#FFC600]/50 transition-colors"></div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display font-bold text-lg uppercase mb-2 text-[#2D2926] group-hover:text-[#FFC600] transition-colors">{schedule.pharmacyName}</h3>
                            <p className="font-display text-[9px] font-bold tracking-widest uppercase text-[#2D2926]/50 mb-4 flex items-center gap-2">
                              <MapPin className="w-3 h-3 shrink-0 text-[#FFC600]" strokeWidth={2} /> {pharmacy?.address || 'LOCAL INDI.'}
                            </p>
                            <div className="bg-[#2D2926] text-white p-4 rounded-sm border-l-4 border-[#FFC600]">
                              <p className="font-display text-[10px] font-bold tracking-widest uppercase flex items-start gap-4">
                                <StickyNote className="w-3 h-3 text-[#FFC600] shrink-0 mt-0.5" strokeWidth={2} />
                                "{schedule.notes}"
                              </p>
                            </div>
                            <button 
                              onClick={() => {
                                if (pharmacy) {
                                  handlePharmacyClick(pharmacy);
                                }
                              }}
                              className="mt-6 font-display text-[9px] font-bold tracking-widest uppercase text-[#2D2926] hover:text-[#FFC600] flex items-center gap-2 transition-colors border-2 border-[#2D2926]/10 hover:border-[#2D2926] px-4 py-3 rounded-sm w-max"
                            >
                              Ver na Matriz Tática <ChevronRight className="w-3 h-3" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
