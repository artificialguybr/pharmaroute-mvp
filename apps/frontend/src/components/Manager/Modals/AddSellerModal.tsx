import React from 'react';
import { X, ChevronRight } from 'lucide-react';

interface AddSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newSeller: { name: string; region: string; phone: string; email: string };
  setNewSeller: (seller: { name: string; region: string; phone: string; email: string }) => void;
}

export function AddSellerModal({ isOpen, onClose, onSubmit, newSeller, setNewSeller }: AddSellerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2D2926]/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-6">
      <div className="bg-white border-2 border-[#2D2926] shadow-[8px_8px_0_rgba(45,41,38,1)] w-full max-w-lg overflow-hidden flex flex-col rounded-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 border-b-2 border-[#2D2926] flex items-start justify-between bg-[#FFC600]">
          <div>
            <h3 className="font-display font-bold tracking-tight text-4xl text-[#2D2926] mb-1 uppercase">Recrutar</h3>
            <p className="font-display text-[10px] tracking-widest uppercase font-bold text-[#2D2926]/70">Adicionar novo representante</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-transparent border-2 border-[#2D2926] rounded-sm flex items-center justify-center text-[#2D2926] hover:bg-[#2D2926] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-8 space-y-8 bg-[#F7F7F7]">
          <div>
            <label htmlFor="sellerName" className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-3">Nome Completo</label>
            <input
              type="text"
              id="sellerName"
              required
              className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors placeholder:text-[#2D2926]/30 uppercase font-display tracking-wider"
              placeholder="Ex: Ana Silva"
              value={newSeller.name}
              onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
            />
          </div>
          
          <div className="relative">
            <label htmlFor="sellerRegion" className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-3">Setor Operacional</label>
            <div className="relative">
              <select
                id="sellerRegion"
                required
                className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] appearance-none cursor-pointer transition-colors uppercase font-display tracking-wider"
                value={newSeller.region}
                onChange={(e) => setNewSeller({ ...newSeller, region: e.target.value })}
              >
                <option value="" disabled>Selecionar Setor</option>
                <option value="Centro">Setor Alpha (Centro)</option>
                <option value="Zona Sul">Setor Beta (Sul)</option>
                <option value="Zona Norte">Setor Gamma (Norte)</option>
                <option value="Zona Leste">Setor Delta (Leste)</option>
                <option value="Zona Oeste">Setor Epsilon (Oeste)</option>
              </select>
              <ChevronRight className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-[#2D2926]" strokeWidth={2} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="sellerPhone" className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-3">Telefone</label>
              <input
                type="tel"
                id="sellerPhone"
                required
                className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors placeholder:text-[#2D2926]/30 font-display tracking-widest"
                placeholder="(00) 00000-0000"
                value={newSeller.phone}
                onChange={(e) => setNewSeller({ ...newSeller, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="sellerEmail" className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#2D2926] mb-3">E-mail</label>
              <input
                type="email"
                id="sellerEmail"
                required
                className="w-full px-5 py-4 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors placeholder:text-[#2D2926]/30 font-display tracking-widest"
                placeholder="email@exemplo.com"
                value={newSeller.email}
                onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-8 flex gap-4 border-t-2 border-[#2D2926]/10">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-5 bg-transparent text-[#2D2926] border-2 border-[#2D2926]/20 rounded-sm hover:border-[#2D2926] transition-colors font-display font-bold tracking-widest text-[10px] uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-5 bg-[#2D2926] text-[#FFC600] border-2 border-[#2D2926] rounded-sm hover:bg-[#FFC600] hover:text-[#2D2926] transition-colors font-display font-bold tracking-widest text-[10px] uppercase shadow-[4px_4px_0_rgba(255,198,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              Confirmar Recrutamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
