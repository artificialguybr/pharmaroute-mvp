import React, { useState } from 'react';
import { X, Plus, MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';

interface AddPharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapCenter: [number, number];
  onSuccess: (pharmacy: any) => void; // called with the newly created pharmacy
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=br`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export function AddPharmacyModal({ isOpen, onClose, mapCenter, onSuccess }: AddPharmacyModalProps) {
  const [form, setForm] = useState({ name: '', address: '', contactPerson: '', phone: '', email: '', notes: '' });
  const [step, setStep] = useState<'form' | 'geocoding' | 'saving' | 'success' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');

  const reset = () => {
    setForm({ name: '', address: '', contactPerson: '', phone: '', email: '', notes: '' });
    setStep('form');
    setErrorMsg('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('geocoding');

    // Step 1: Geocode address
    let coords = await geocodeAddress(form.address);
    if (!coords) {
      // Fallback: use current map center
      coords = { lat: mapCenter[0], lng: mapCenter[1] };
    }

    setStep('saving');
    try {
      const created = await api.pharmacies.create({
        name: form.name,
        address: form.address,
        lat: coords.lat,
        lng: coords.lng,
        phone: form.phone,
        email: form.email,
        region: 'Outros',
        notes: form.notes,
        contact_person: form.contactPerson,
      });
      setStep('success');
      setTimeout(() => {
        onSuccess(created);
        handleClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar farmácia.');
      setStep('error');
    }
  };

  const field = (label: string, key: keyof typeof form, placeholder: string, required = false, type = 'text') => (
    <div>
      <label className="block font-display text-[10px] font-bold uppercase tracking-widest text-[#2D2926] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        className="w-full px-4 py-3 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors placeholder:text-[#2D2926]/30 font-display tracking-widest"
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        disabled={step !== 'form'}
      />
    </div>
  );

  const isLoading = step === 'geocoding' || step === 'saving';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#2D2926]/80 backdrop-blur-sm z-[1000] flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={(e) => e.target === e.currentTarget && !isLoading && handleClose()}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-[#F7F7F7] rounded-t-2xl md:rounded-sm shadow-[8px_8px_0_rgba(45,41,38,1)] w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col border-2 border-[#2D2926]"
          >
            {/* Header */}
            <div className="p-6 border-b-2 border-[#2D2926] flex justify-between items-start bg-[#FFC600] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-[#2D2926] text-[#FFC600] flex items-center justify-center">
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl md:text-2xl uppercase tracking-tight text-[#2D2926]">Adicionar Farmácia</h3>
                  <p className="font-display text-[9px] font-bold tracking-widest text-[#2D2926]/60 uppercase">Ponto não catalogado</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="w-9 h-9 flex items-center justify-center bg-transparent border-2 border-[#2D2926] text-[#2D2926] rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Status overlays */}
            {(isLoading || step === 'success' || step === 'error') && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 gap-4 text-center">
                {step === 'geocoding' && (
                  <>
                    <Loader2 className="w-10 h-10 animate-spin text-[#FFC600]" strokeWidth={2} />
                    <p className="font-display text-sm font-bold uppercase tracking-widest text-[#2D2926]">Localizando endereço...</p>
                    <p className="font-display text-[10px] text-[#2D2926]/50 uppercase tracking-widest">Via OpenStreetMap</p>
                  </>
                )}
                {step === 'saving' && (
                  <>
                    <Loader2 className="w-10 h-10 animate-spin text-[#FFC600]" strokeWidth={2} />
                    <p className="font-display text-sm font-bold uppercase tracking-widest text-[#2D2926]">Salvando farmácia...</p>
                  </>
                )}
                {step === 'success' && (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={2} />
                    <p className="font-display text-sm font-bold uppercase tracking-widest text-emerald-600">Farmácia adicionada!</p>
                    <p className="font-display text-[10px] text-[#2D2926]/50 uppercase tracking-widest">Aparecerá no mapa em instantes</p>
                  </>
                )}
                {step === 'error' && (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-500" strokeWidth={2} />
                    <p className="font-display text-sm font-bold uppercase tracking-widest text-red-600">Erro ao salvar</p>
                    <p className="font-display text-[10px] text-[#2D2926]/50 uppercase tracking-widest">{errorMsg}</p>
                    <button
                      onClick={() => setStep('form')}
                      className="mt-4 px-6 py-3 bg-[#2D2926] text-[#FFC600] rounded-sm font-display text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors"
                    >
                      Tentar Novamente
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Form */}
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto bg-white">
                {field('Nome da Farmácia', 'name', 'Ex: Farmácia Central', true)}
                <div>
                  <label className="block font-display text-[10px] font-bold uppercase tracking-widest text-[#2D2926] mb-2">
                    Endereço <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors placeholder:text-[#2D2926]/30 font-display tracking-widest"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                  <p className="font-display text-[9px] font-bold text-[#2D2926]/40 mt-1.5 flex items-center gap-1.5 tracking-widest uppercase">
                    <MapPin className="w-3 h-3 text-[#FFC600]" strokeWidth={2} /> Endereço completo para geocodificação automática
                  </p>
                </div>
                {field('Responsável', 'contactPerson', 'Nome do farmacêutico')}
                {field('Telefone', 'phone', '(11) 99999-9999', false, 'tel')}
                {field('E-mail', 'email', 'contato@farmacia.com', false, 'email')}
                <div>
                  <label className="block font-display text-[10px] font-bold uppercase tracking-widest text-[#2D2926] mb-2">Observações</label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-3 bg-transparent border-2 border-[#2D2926]/20 rounded-sm text-sm font-bold text-[#2D2926] focus:outline-none focus:border-[#2D2926] transition-colors placeholder:text-[#2D2926]/30 font-display resize-none"
                    placeholder="Horário de funcionamento, dica de contato..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleClose} className="flex-1 py-3 bg-transparent border-2 border-[#2D2926]/30 text-[#2D2926] rounded-sm font-display text-[10px] uppercase font-bold tracking-widest hover:border-[#2D2926] transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] py-3 bg-[#2D2926] text-[#FFC600] rounded-sm font-display text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-[3px_3px_0_rgba(255,198,0,1)]">
                    <Plus className="w-4 h-4" strokeWidth={2} /> Adicionar
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
