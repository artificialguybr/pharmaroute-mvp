import React from 'react';
import { 
  ChevronRight, MapPin, Phone, Mail, MessageSquareQuote, 
  BarChart3, CheckCircle2, Clock, TrendingUp, CalendarDays, 
  Search, Plus 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Seller, Schedule } from '../../data/pharmacies';
import { cn } from '../../lib/utils';

interface TeamTabProps {
  selectedTeamMember: Seller | null;
  setSelectedTeamMember: (member: Seller | null) => void;
  sellers: Seller[];
  mockSchedules: Schedule[];
  setIsAddSellerModalOpen: (open: boolean) => void;
  setActiveTab: (tab: 'dashboard' | 'team' | 'territories' | 'calendar') => void;
  setSelectedSeller: (seller: Seller | null) => void;
  setCalendarSellerId: (id: string) => void;
}

export function TeamTab({
  selectedTeamMember,
  setSelectedTeamMember,
  sellers,
  mockSchedules,
  setIsAddSellerModalOpen,
  setActiveTab,
  setSelectedSeller,
  setCalendarSellerId
}: TeamTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 relative z-10 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto">
        {selectedTeamMember ? (
          /* Detailed Team Member View */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="duration-300">
            <button 
              onClick={() => setSelectedTeamMember(null)}
              className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-[#2D2926] hover:text-white hover:bg-[#2D2926] mb-8 transition-colors border-2 border-[#2D2926] rounded-sm bg-transparent px-5 py-3 shadow-none inline-flex"
            >
              <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={2} /> Voltar para Elenco
            </button>
            
            <div className="bg-white rounded-sm shadow-sm border-2 border-[#2D2926] mb-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-40 bg-[#FFC600] border-b-2 border-[#2D2926]">
                <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2D2926 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              </div>
              
              <div className="p-8 pt-20 flex flex-col md:flex-row items-start md:items-end gap-8 relative z-10">
                <div className="w-40 h-40 bg-[#2D2926] border-4 border-white rounded-sm shadow-xl flex items-center justify-center font-display font-bold tracking-tight text-7xl text-white shrink-0">
                  {selectedTeamMember.avatar}
                </div>
                <div className="flex-1 pb-2 w-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl text-[#2D2926] leading-none uppercase">{selectedTeamMember.name}</h1>
                      <p className="font-display text-[10px] tracking-widest uppercase mt-2 text-[#2D2926] flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-[#FFC600]" strokeWidth={2} /> Agente de Campo • {selectedTeamMember.region}
                      </p>
                    </div>
                    <span className={cn("inline-flex items-center px-4 py-2 text-[10px] font-display font-bold tracking-widest uppercase rounded-sm border", selectedTeamMember.efficiency > 70 ? "bg-[#FFC600] text-[#2D2926] border-[#2D2926]" : selectedTeamMember.efficiency > 40 ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-red-100 text-red-700 border-red-300")}>
                      Eficiência de Operação: {selectedTeamMember.efficiency}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 mt-8">
                    <div className="flex items-center gap-4 text-xs font-bold text-[#2D2926] bg-[#F7F7F7] border border-[#2D2926]/10 px-5 py-3 rounded-sm">
                      <Phone className="w-4 h-4 text-[#FFC600]" strokeWidth={2} /> {selectedTeamMember.phone}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-[#2D2926] bg-[#F7F7F7] border border-[#2D2926]/10 px-5 py-3 rounded-sm">
                      <Mail className="w-4 h-4 text-[#FFC600]" strokeWidth={2} /> {selectedTeamMember.email}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 border-t-2 border-[#2D2926]/10 pt-6">
                    <button className="px-8 py-4 bg-[#2D2926] text-white rounded-sm hover:bg-[#FFC600] hover:text-[#2D2926] transition-colors font-display font-bold text-[10px] tracking-widest uppercase">
                      Enviar Comando
                    </button>
                    <button className="px-8 py-4 bg-transparent text-[#2D2926] border-2 border-[#2D2926]/20 hover:border-[#2D2926] transition-colors font-display font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" strokeWidth={2} /> Extrair Auditoria
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 border-t-2 border-[#2D2926]">
                <div className="p-8 flex flex-col items-start justify-center text-left group hover:bg-[#FFC600] hover:text-[#2D2926] transition-colors border-b-2 border-[#2D2926] md:border-b-0 md:border-r-2 bg-[#F7F7F7]">
                  <CheckCircle2 className="w-6 h-6 text-[#2D2926] mb-4 opacity-50 group-hover:opacity-100" strokeWidth={2} />
                  <p className="font-display text-[10px] font-bold tracking-widest uppercase opacity-70 mb-2">Visitas Concluídas</p>
                  <p className="font-display font-bold tracking-tight text-5xl leading-none">{selectedTeamMember.completedVisits}</p>
                </div>
                <div className="p-8 flex flex-col items-start justify-center text-left group hover:bg-[#2D2926] hover:text-white transition-colors border-b-2 border-[#2D2926] md:border-b-0 md:border-r-2 bg-[#F7F7F7]">
                  <Clock className="w-6 h-6 text-[#2D2926] mb-4 opacity-50 group-hover:opacity-100 group-hover:text-[#FFC600]" strokeWidth={2} />
                  <p className="font-display text-[10px] font-bold tracking-widest uppercase opacity-70 mb-2">Alvos Pendentes</p>
                  <p className="font-display font-bold tracking-tight text-5xl leading-none">{selectedTeamMember.pendingVisits}</p>
                </div>
                <div className="p-8 flex flex-col items-start justify-center text-left group transition-colors bg-[#2D2926] text-white">
                  <TrendingUp className="w-6 h-6 text-[#FFC600] mb-4 opacity-50 group-hover:opacity-100" strokeWidth={2} />
                  <p className="font-display text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">Total de Missões</p>
                  <p className="font-display font-bold tracking-tight text-5xl leading-none text-[#FFC600]">{selectedTeamMember.completedVisits + selectedTeamMember.pendingVisits}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-[#2D2926]/10 rounded-sm shadow-sm p-10 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold tracking-tight text-3xl mb-8 flex items-center gap-3 uppercase text-[#2D2926]">
                    <MapPin className="w-6 h-6 text-[#FFC600]" strokeWidth={2} /> Parâmetros de Zona
                  </h3>
                  <div className="border-l-2 border-[#2D2926] pl-6 mb-8">
                    <p className="font-display text-[10px] tracking-widest uppercase font-bold text-[#2D2926]/50 mb-1">Raio Operacional</p>
                    <p className="text-3xl font-bold font-display text-[#2D2926]">{(selectedTeamMember.territory.radius / 1000).toFixed(1)} km</p>
                  </div>
                  <div className="border-l-2 border-[#2D2926]/20 pl-6 mb-8">
                    <p className="font-display text-[10px] tracking-widest uppercase font-bold text-[#2D2926]/50 mb-1">Coordenadas Centroide</p>
                    <p className="text-xl font-bold font-display text-[#2D2926] tracking-wider">{selectedTeamMember.territory.lat.toFixed(4)}, {selectedTeamMember.territory.lng.toFixed(4)}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedSeller(selectedTeamMember);
                    setActiveTab('territories');
                  }}
                  className="w-full py-5 bg-[#FFC600] text-[#2D2926] border-2 border-[#2D2926] rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors font-display font-bold text-[10px] tracking-widest uppercase shadow-[4px_4px_0_rgba(45,41,38,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
                >
                  Modificar Alocação Espacial
                </button>
              </div>

              <div className="bg-[#2D2926] border border-[#2D2926] text-white rounded-sm shadow-sm p-10">
                <h3 className="font-display font-bold tracking-tight text-3xl mb-8 flex items-center gap-3 uppercase text-white">
                  <CalendarDays className="w-6 h-6 text-[#FFC600]" strokeWidth={2} /> Próximas Operações
                </h3>
                <div className="space-y-4">
                  {mockSchedules.filter(s => s.sellerId === selectedTeamMember.id).slice(0, 3).map(schedule => (
                    <div key={schedule.id} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-sm hover:border-[#FFC600] transition-colors group cursor-default">
                      <div className="w-12 h-12 bg-[#FFC600] text-[#2D2926] flex items-center justify-center shrink-0">
                        <span className="font-display font-bold tracking-tighter text-2xl leading-none">{new Date(schedule.date).getDate()}</span>
                      </div>
                      <div className="pt-0.5">
                        <p className="text-xs font-bold font-display uppercase tracking-widest text-white group-hover:text-[#FFC600] transition-colors">{schedule.pharmacyName}</p>
                        <p className="text-[10px] font-bold font-display tracking-widest opacity-50 mt-1 text-white">{new Date(schedule.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setCalendarSellerId(selectedTeamMember.id);
                    setActiveTab('calendar');
                  }}
                  className="w-full mt-8 py-4 bg-transparent text-white border-2 border-white/20 rounded-sm hover:bg-white/10 transition-colors font-display font-bold text-[10px] tracking-widest uppercase"
                >
                  Abrir Agenda Completa
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Team List View */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#2D2926]/10 pb-8">
              <div>
                <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl uppercase text-[#2D2926] leading-none mb-2">Composição<br/>da Equipe</h1>
                <p className="font-display text-xs font-bold tracking-widest uppercase opacity-50 text-[#2D2926]">Visão Tática de Representantes</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-[#2D2926] absolute left-4 top-1/2 -translate-y-1/2 opacity-50" strokeWidth={2} />
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome..." 
                    className="w-full pl-12 pr-4 py-4 bg-transparent border-2 border-[#2D2926]/20 focus:border-[#2D2926] text-[#2D2926] text-xs font-bold tracking-widest uppercase focus:outline-none transition-colors rounded-sm placeholder-[#2D2926]/30"
                  />
                </div>
                <button 
                  onClick={() => setIsAddSellerModalOpen(true)}
                  className="px-6 py-4 bg-[#FFC600] text-[#2D2926] border-2 border-[#2D2926] rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors flex items-center justify-center gap-2 shrink-0 font-display font-bold text-[10px] tracking-widest uppercase shadow-[4px_4px_0_rgba(45,41,38,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} /> Recrutar Unidade
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((seller, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  key={seller.id} 
                  className="bg-white border-2 border-[#2D2926]/10 rounded-sm shadow-sm p-6 hover:border-[#2D2926] transition-colors cursor-pointer group relative overflow-hidden flex flex-col" 
                  onClick={() => setSelectedTeamMember(seller)}
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#FFC600] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 bg-[#2D2926] flex items-center justify-center font-display font-bold tracking-tight text-2xl text-white shrink-0 shadow-md">
                      {seller.avatar}
                    </div>
                    <div>
                      <h3 className="font-display font-bold tracking-tight text-xl text-[#2D2926] uppercase leading-none mb-2">{seller.name}</h3>
                      <p className="text-[10px] font-display font-bold tracking-widest uppercase opacity-50 flex items-center gap-1 text-[#2D2926]">
                        <MapPin className="w-3 h-3" strokeWidth={2}/> {seller.region}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                    <div className="bg-[#F7F7F7] p-4 border border-[#2D2926]/5 rounded-sm flex flex-col justify-end">
                      <p className="font-display text-[9px] font-bold uppercase tracking-widest text-[#2D2926]/50 mb-1">Concluídas</p>
                      <p className="font-display font-bold tracking-tight text-4xl leading-none text-[#2D2926]">{seller.completedVisits}</p>
                    </div>
                    <div className="bg-[#2D2926] p-4 border border-[#2D2926] rounded-sm flex flex-col justify-end">
                      <p className="font-display text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Pendentes</p>
                      <p className="font-display font-bold tracking-tight text-4xl leading-none text-[#FFC600]">{seller.pendingVisits}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-[#2D2926]/10 flex items-center justify-between">
                    <span className="font-display text-[10px] font-bold uppercase tracking-widest text-[#2D2926]/70">Eficiência Geral</span>
                    <span className={cn("font-display font-bold tracking-widest uppercase px-3 py-1 text-[10px] border rounded-sm", seller.efficiency > 70 ? "bg-[#FFC600]/20 text-[#2D2926] border-[#FFC600]" : seller.efficiency > 40 ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-red-100 text-red-700 border-red-300")}>
                      {seller.efficiency}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
