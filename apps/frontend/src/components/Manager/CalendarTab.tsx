import React from 'react';
import { Plus, CalendarDays, MapPin, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
import { Seller, Schedule, Pharmacy } from '../../data/pharmacies';
import { cn } from '../../lib/utils';

interface CalendarTabProps {
  sellers: Seller[];
  calendarSellerId: string;
  setCalendarSellerId: (id: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  weekDays: Date[];
  schedulesForSelectedDate: Schedule[];
  mockPharmacies: Pharmacy[];
}

export function CalendarTab({
  sellers,
  calendarSellerId,
  setCalendarSellerId,
  selectedDate,
  setSelectedDate,
  weekDays,
  schedulesForSelectedDate,
  mockPharmacies
}: CalendarTabProps) {
  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10 m-6 md:m-12 bg-white rounded-sm shadow-[8px_8px_0_rgba(45,41,38,1)] border-2 border-[#2D2926]">
      {/* Sidebar for selecting seller */}
      <div className="w-full md:w-80 bg-[#F7F7F7] border-r-2 border-[#2D2926] flex flex-col shrink-0 md:h-full max-h-[35vh] md:max-h-none border-b-2 md:border-b-0">
        <div className="p-8 border-b-2 border-[#2D2926] shrink-0 bg-[#FFC600]">
          <h2 className="font-display font-bold tracking-tight text-3xl uppercase text-[#2D2926]">Cronograma</h2>
          <p className="font-display text-[9px] font-bold uppercase tracking-widest opacity-80 text-[#2D2926] mt-2">Visão por Operador</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sellers.map(seller => (
            <button 
              key={seller.id}
              onClick={() => setCalendarSellerId(seller.id)}
              className={cn(
                "w-full text-left p-5 transition-all rounded-sm flex items-center gap-4 border-2 group",
                calendarSellerId === seller.id 
                  ? "bg-[#2D2926] text-[#FFC600] border-[#2D2926]" 
                  : "bg-white text-[#2D2926] hover:border-[#2D2926] border-[#2D2926]/10"
              )}
            >
              <div className={cn("w-12 h-12 flex items-center justify-center font-display font-bold tracking-tight text-2xl shrink-0 border-2 rounded-sm", calendarSellerId === seller.id ? "bg-[#FFC600] text-[#2D2926] border-[#FFC600]" : "bg-[#F7F7F7] text-[#2D2926] border-[#2D2926]/10 group-hover:border-[#2D2926]")}>
                {seller.avatar}
              </div>
              <div>
                <span className="font-display font-bold text-sm uppercase block truncate w-40">{seller.name}</span>
                <span className={cn("font-display text-[9px] font-bold tracking-widest uppercase mt-1 block", calendarSellerId === seller.id ? "text-white/60" : "opacity-50")}>{seller.region}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="p-5 md:p-8 border-b-2 border-[#2D2926] shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold tracking-tight text-xl md:text-3xl text-[#2D2926] uppercase">
              {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="h-10 px-4 bg-[#FFC600] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#FFC600] border-2 border-[#2D2926] transition-colors flex items-center justify-center gap-2 font-display font-bold text-[9px] tracking-widest uppercase rounded-sm shadow-[3px_3px_0_rgba(45,41,38,1)] active:translate-y-1 active:translate-x-1 active:shadow-none">
              <Plus className="w-4 h-4" strokeWidth={2} /> Inserir Missão
            </button>
          </div>
          {/* pb-6 pt-2 ensures the -translate-y on selected card is not clipped */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pt-2 pb-6">
            {weekDays.map((date, i) => {
              const isSelected = date.getDate() === selectedDate.getDate();
              const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[68px] py-4 rounded-sm transition-all shrink-0 border-2 uppercase font-display",
                    isSelected 
                      ? "bg-[#2D2926] text-[#FFC600] border-[#2D2926] shadow-[3px_3px_0_rgba(255,198,0,1)] -translate-y-1" 
                      : "bg-[#F7F7F7] text-[#2D2926] border-[#2D2926]/10 hover:border-[#2D2926]"
                  )}
                >
                  <span className="text-[9px] font-bold tracking-widest opacity-60 mb-1">{dayName}</span>
                  <span className="font-bold tracking-tight text-2xl leading-none">{date.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2D2926 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <h4 className="font-display text-[10px] uppercase font-bold text-[#2D2926] tracking-widest mb-8 flex items-center gap-4 border-b-2 border-[#2D2926]/10 pb-4">
              <CalendarDays className="w-5 h-5 text-[#FFC600]" strokeWidth={2} /> 
              ITINERÁRIO REQUISITADO • {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </h4>
            
            {schedulesForSelectedDate.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-20 bg-transparent border-2 border-dashed border-[#2D2926]/20 rounded-sm mt-12">
                <CalendarDays className="w-16 h-16 mx-auto mb-6 text-[#2D2926] opacity-20" strokeWidth={1} />
                <p className="font-display font-bold text-lg uppercase text-[#2D2926] opacity-50">Nenhuma missão alocada para este ciclo.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {schedulesForSelectedDate.map((schedule, i) => {
                  const sDate = new Date(schedule.date);
                  const timeString = sDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const pharmacy = mockPharmacies.find(p => p.id === schedule.pharmacyId);
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      key={schedule.id} 
                      className="bg-white p-5 md:p-8 border-2 border-[#2D2926] rounded-sm flex flex-col sm:flex-row gap-5 md:gap-8 hover:bg-[#F7F7F7] transition-colors group shadow-[4px_4px_0_rgba(45,41,38,1)]"
                    >
                      <div className="flex items-center sm:flex-col sm:items-center sm:justify-start gap-3 sm:gap-0 shrink-0 sm:w-24 sm:pt-1">
                        <span className="font-display text-xl md:text-3xl font-bold tracking-tighter text-[#2D2926]">{timeString}</span>
                        <div className="w-3 h-3 bg-[#FFC600] border-2 border-[#2D2926] rounded-none sm:mt-5"></div>
                        <div className="w-0.5 h-full bg-[#2D2926]/20 mt-4 group-last:hidden"></div>
                      </div>
                      <div className="flex-1 w-full border-l-2 border-[#2D2926]/10 pl-8">
                        <h3 className="font-display font-bold tracking-tight text-3xl uppercase mb-3 text-[#2D2926] group-hover:text-[#FFC600] transition-colors">{schedule.pharmacyName}</h3>
                        <p className="font-display text-[10px] font-bold tracking-widest uppercase opacity-70 mb-6 flex items-center gap-3 text-[#2D2926]">
                          <MapPin className="w-4 h-4 text-[#FFC600]" strokeWidth={2} /> {pharmacy?.address || 'LOCAL INDISPONÍVEL'}
                        </p>
                        <div className="bg-[#2D2926] text-white p-5 rounded-sm border-l-4 border-[#FFC600]">
                          <p className="font-display text-xs tracking-wider uppercase flex items-start gap-4">
                            <StickyNote className="w-4 h-4 text-[#FFC600] shrink-0 mt-0.5" strokeWidth={2} />
                            "{schedule.notes}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
