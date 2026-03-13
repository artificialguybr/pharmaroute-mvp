import React from 'react';
import { X, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pharmacy } from '../../../data/pharmacies';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: Pharmacy | null;
  onSubmit: (e: React.FormEvent) => void;
  reportReason: string;
  setReportReason: (reason: string) => void;
}

export function ReportModal({
  isOpen, onClose, pharmacy, onSubmit, reportReason, setReportReason
}: ReportModalProps) {
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-sm shadow-[8px_8px_0_rgba(45,41,38,1)] w-full max-w-md overflow-hidden border-2 border-[#2D2926]"
          >
            <div className="p-8 border-b-2 border-[#2D2926] flex justify-between items-start bg-red-600">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-sm bg-white flex items-center justify-center border-2 border-[#2D2926]">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-white mb-1 uppercase tracking-tight leading-none">Anomalia</h3>
                  <p className="font-display text-[10px] font-bold text-white/70 uppercase tracking-widest">{pharmacy.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-transparent text-white border-2 border-white rounded-sm hover:bg-white hover:text-red-600 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" strokeWidth={2}/>
              </button>
            </div>
            
            <form onSubmit={onSubmit} className="p-8 space-y-8 bg-[#F7F7F7]">
              <div>
                <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-4">
                  Código do Problema
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-xs font-display font-bold uppercase tracking-widest text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors appearance-none cursor-pointer"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="" disabled>SELECIONE O CÓDIGO...</option>
                    <option value="not_found">ALVO INEXISTENTE NESSA COORDENADA</option>
                    <option value="closed_permanently">ALVO INATIVO / FECHADO</option>
                    <option value="wrong_address">INFORMAÇÃO GEOGRÁFICA INCORRETA</option>
                    <option value="duplicate">ALVO DUPLICADO NA MATRIZ</option>
                    <option value="other">OUTRO / NÃO ESPECIFICADO</option>
                  </select>
                  <ChevronRight className="w-4 h-4 text-[#2D2926] absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" strokeWidth={2} />
                </div>
              </div>

              {reportReason === 'other' && (
                <div>
                  <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-4">
                    Detalhes do Report
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-sans font-medium text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors resize-none placeholder:text-[#2D2926]/40"
                    placeholder="Descreva a anomalia verificada..."
                  />
                </div>
              )}
              
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
                  className="flex-[2] py-5 bg-red-600 text-white border-2 border-[#2D2926] rounded-sm hover:bg-black hover:text-red-500 transition-colors font-display font-bold tracking-widest text-[10px] uppercase shadow-[4px_4px_0_rgba(45,41,38,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
                >
                  Enviar Alerta
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
