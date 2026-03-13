import React from 'react';
import { X, CheckCircle2, RefreshCw, AlertCircle, CalendarDays, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pharmacy } from '../../../data/pharmacies';
import { cn } from '../../../lib/utils';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: Pharmacy | null;
  onSubmit: (e: React.FormEvent) => void;
  visitStatus: 'completed' | 'issue' | 'rescheduled';
  setVisitStatus: (status: 'completed' | 'issue' | 'rescheduled') => void;
  rescheduleDate: string;
  setRescheduleDate: (date: string) => void;
  visitProducts: string;
  setVisitProducts: (products: string) => void;
  visitNextSteps: string;
  setVisitNextSteps: (steps: string) => void;
  visitNote: string;
  setVisitNote: (note: string) => void;
}

export function VisitModal({
  isOpen, onClose, pharmacy, onSubmit,
  visitStatus, setVisitStatus,
  rescheduleDate, setRescheduleDate,
  visitProducts, setVisitProducts,
  visitNextSteps, setVisitNextSteps,
  visitNote, setVisitNote
}: VisitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && pharmacy && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#2D2926]/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-sm shadow-[8px_8px_0_rgba(45,41,38,1)] w-full max-w-lg overflow-hidden border-2 border-[#2D2926]"
          >
            <div className="p-8 border-b-2 border-[#2D2926] bg-[#FFC600] relative">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-transparent border-2 border-[#2D2926] text-[#2D2926] rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-sm bg-[#2D2926] border-2 border-[#2D2926] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#FFC600]" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl uppercase tracking-tight text-[#2D2926] mb-1">Registrar Missão</h3>
                  <p className="font-display text-[10px] font-bold tracking-widest uppercase text-[#2D2926]/60">{pharmacy.name}</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={onSubmit} className="p-8 space-y-8 bg-[#F7F7F7]">
              <div>
                <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-4">Resultado Operacional</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setVisitStatus('completed')}
                    className={cn("py-4 px-3 border-2 rounded-sm text-[10px] font-display font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-3 transition-all", visitStatus === 'completed' ? "bg-[#2D2926] border-[#2D2926] text-[#FFC600] shadow-[2px_2px_0_rgba(255,198,0,1)]" : "bg-transparent border-[#2D2926]/20 text-[#2D2926]/60 hover:border-[#2D2926] hover:text-[#2D2926]")}
                  >
                    <CheckCircle2 className="w-6 h-6 mb-1" strokeWidth={2} /> 
                    <span>Concluída</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitStatus('rescheduled')}
                    className={cn("py-4 px-3 border-2 rounded-sm text-[10px] font-display font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-3 transition-all", visitStatus === 'rescheduled' ? "bg-orange-500 border-orange-600 text-[#2D2926] shadow-[2px_2px_0_rgba(45,41,38,1)]" : "bg-transparent border-[#2D2926]/20 text-[#2D2926]/60 hover:border-[#2D2926] hover:text-[#2D2926]")}
                  >
                    <RefreshCw className="w-6 h-6 mb-1" strokeWidth={2} /> 
                    <span>Retornar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitStatus('issue')}
                    className={cn("py-4 px-3 border-2 rounded-sm text-[10px] font-display font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-3 transition-all", visitStatus === 'issue' ? "bg-red-600 border-red-700 text-white shadow-[2px_2px_0_rgba(45,41,38,1)]" : "bg-transparent border-[#2D2926]/20 text-[#2D2926]/60 hover:border-[#2D2926] hover:text-[#2D2926]")}
                  >
                    <AlertCircle className="w-6 h-6 mb-1" strokeWidth={2} /> 
                    <span>Falha</span>
                  </button>
                </div>
              </div>

              {visitStatus === 'rescheduled' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                  <label htmlFor="rescheduleDate" className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-3 flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 text-orange-600" strokeWidth={2} /> Data do Retorno
                  </label>
                  <input
                    type="datetime-local"
                    id="rescheduleDate"
                    required
                    className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors placeholder:text-[#2D2926]/30 font-display uppercase"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </motion.div>
              )}

              <div>
                <label htmlFor="products" className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-3">
                  Produtos Apresentados <span className="text-[#2D2926]/40 font-medium">(Opcional)</span>
                </label>
                <input
                  type="text"
                  id="products"
                  className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors placeholder:text-[#2D2926]/30 font-display tracking-widest"
                  placeholder="EX: CIMED VITAMINAS..."
                  value={visitProducts}
                  onChange={(e) => setVisitProducts(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="nextSteps" className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-3">
                  Próximos Passos <span className="text-[#2D2926]/40 font-medium">(Opcional)</span>
                </label>
                <input
                  type="text"
                  id="nextSteps"
                  className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors placeholder:text-[#2D2926]/30 font-display tracking-widest"
                  placeholder="EX: ENVIAR CATÁLOGO..."
                  value={visitNextSteps}
                  onChange={(e) => setVisitNextSteps(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-3 flex items-center gap-2">
                  <StickyNote className="w-3 h-3 text-[#2D2926]/40" strokeWidth={2} /> Relatório da Intervenção
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  required
                  className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors resize-none placeholder:text-[#2D2926]/30 font-sans"
                  placeholder="Descreva o que ocorreu..."
                  value={visitNote}
                  onChange={(e) => setVisitNote(e.target.value)}
                />
              </div>
              
              <div className="pt-8 flex gap-4 border-t-2 border-[#2D2926]/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 bg-transparent text-[#2D2926] border-2 border-[#2D2926]/20 rounded-sm hover:border-[#2D2926] transition-colors font-display font-bold tracking-widest text-[10px] uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-5 bg-[#2D2926] text-[#FFC600] border-2 border-[#2D2926] rounded-sm hover:bg-[#FFC600] hover:text-[#2D2926] transition-colors font-display font-bold tracking-widest text-[10px] uppercase shadow-[4px_4px_0_rgba(255,198,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
                >
                  Confirmar Relatório
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
