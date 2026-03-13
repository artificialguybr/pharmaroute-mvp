import React, { useState, useEffect } from 'react';
import { MapPin, Check, Copy, User, Phone, Mail, Target, History, Calendar, Navigation, CheckCircle2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pharmacy } from '../../data/pharmacies';
import { cn } from '../../lib/utils';
import { api, ApiVisit } from '../../lib/api';

interface DetailsPanelProps {
  pharmacy: Pharmacy | null;
  activeTab: 'map' | 'calendar';
  onClose: () => void;
  onReport: () => void;
  onRegisterVisit: () => void;
  openGoogleMaps: (lat: number, lng: number) => void;
  statusConfig: any;
}

export function DetailsPanel({
  pharmacy,
  activeTab,
  onClose,
  onReport,
  onRegisterVisit,
  openGoogleMaps,
  statusConfig
}: DetailsPanelProps) {
  const [detailsTab, setDetailsTab] = useState<'info' | 'history'>('info');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visitHistory, setVisitHistory] = useState<ApiVisit[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Fetch real visit history when switching to history tab or when pharmacy changes
  useEffect(() => {
    if (!pharmacy || detailsTab !== 'history') return;
    setLoadingHistory(true);
    setHistoryError(null);
    api.visits.listByPharmacy(pharmacy.id)
      .then(data => setVisitHistory(data))
      .catch(() => setHistoryError('Não foi possível carregar o histórico.'))
      .finally(() => setLoadingHistory(false));
  }, [pharmacy?.id, detailsTab]);

  // Reset tab when pharmacy changes
  useEffect(() => {
    setDetailsTab('info');
    setVisitHistory([]);
  }, [pharmacy?.id]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <AnimatePresence>
      {pharmacy && activeTab === 'map' && (
        <motion.div
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="absolute right-0 top-0 bottom-0 w-full md:w-[420px] bg-[#F7F7F7] border-l-2 border-[#2D2926] z-30 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b-2 border-[#2D2926] bg-[#FFC600] text-[#2D2926] shrink-0 relative">
            <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-2">
              <button
                onClick={onReport}
                className="w-9 h-9 flex items-center justify-center bg-transparent text-red-600 border-2 border-red-600 rounded-sm hover:bg-red-600 hover:text-white transition-colors"
                title="Reportar Erro"
              >
                <AlertTriangle className="w-4 h-4" strokeWidth={2} />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center bg-transparent text-[#2D2926] border-2 border-[#2D2926] rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            <div className="mb-4 mt-1">
              <span className={cn(
                "inline-flex items-center gap-2 font-display text-[9px] px-3 py-1.5 font-bold uppercase tracking-widest rounded-sm border-2",
                pharmacy.status === 'needs_visit' ? "bg-amber-100 text-amber-700 border-amber-300" :
                pharmacy.status === 'visited_recently' ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                "bg-orange-100 text-orange-700 border-orange-300"
              )}>
                {(() => { const Icon = statusConfig[pharmacy.status].icon; return <Icon className="w-3 h-3" strokeWidth={2} />; })()}
                {statusConfig[pharmacy.status].label}
              </span>
            </div>

            <h2 className="font-display font-bold text-2xl md:text-4xl mb-3 pr-24 text-[#2D2926] uppercase leading-none tracking-tight">
              {pharmacy.name}
            </h2>
            <div className="flex items-start justify-between gap-4">
              <p className="font-display text-[10px] uppercase tracking-widest font-bold text-[#2D2926] flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} /> {pharmacy.address}
              </p>
              <button
                onClick={() => handleCopy(pharmacy.address, 'address')}
                className="w-8 h-8 flex items-center justify-center bg-transparent text-[#2D2926] border-2 border-[#2D2926] rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors shrink-0"
                title="Copiar Endereço"
              >
                {copiedField === 'address' ? <Check className="w-3 h-3" strokeWidth={2} /> : <Copy className="w-3 h-3" strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-[#2D2926] bg-white shrink-0">
            <button
              onClick={() => setDetailsTab('info')}
              className={cn("flex-1 py-3 md:py-4 text-[10px] font-display font-bold uppercase tracking-widest transition-all border-b-4",
                detailsTab === 'info' ? "border-[#FFC600] text-[#2D2926] bg-[#2D2926]/5" : "border-transparent text-[#2D2926]/50 hover:text-[#2D2926]")}
            >
              Inteligência
            </button>
            <button
              onClick={() => setDetailsTab('history')}
              className={cn("flex-1 py-3 md:py-4 text-[10px] font-display font-bold uppercase tracking-widest transition-all border-b-4 border-l-2 border-l-[#2D2926]/10",
                detailsTab === 'history' ? "border-[#FFC600] text-[#2D2926] bg-[#2D2926]/5" : "border-transparent text-[#2D2926]/50 hover:text-[#2D2926]")}
            >
              Histórico {visitHistory.length > 0 && <span className="ml-1 text-[8px] bg-[#FFC600] text-[#2D2926] px-1.5 py-0.5 rounded-sm">{visitHistory.length}</span>}
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[#F7F7F7]">
            {detailsTab === 'info' ? (
              <>
                {/* Contact Info */}
                <div className="bg-white border-2 border-[#2D2926]/10 rounded-sm p-6 hover:border-[#2D2926] transition-colors">
                  <h4 className="font-display text-[10px] font-bold text-[#2D2926]/50 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <User className="w-4 h-4 text-[#FFC600]" strokeWidth={2} /> Contato
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2D2926] text-[#FFC600] rounded-sm flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-display text-[9px] font-bold text-[#2D2926]/50 uppercase tracking-widest mb-1">Responsável</p>
                        <p className="font-display text-lg font-bold uppercase tracking-tight text-[#2D2926]">{pharmacy.contactPerson || 'Não designado'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 pt-4 border-t-2 border-[#2D2926]/10">
                      <div className="flex items-center justify-between group">
                        <div>
                          <p className="font-display text-[9px] font-bold uppercase tracking-widest text-[#2D2926]/50 flex items-center gap-2 mb-1"><Phone className="w-3 h-3 text-[#FFC600]" strokeWidth={2} /> Telefone</p>
                          <p className="font-display text-base tracking-widest font-bold text-[#2D2926]">{pharmacy.phone || '—'}</p>
                        </div>
                        {pharmacy.phone && (
                          <button onClick={() => handleCopy(pharmacy.phone, 'phone')} className="w-9 h-9 flex items-center justify-center border-2 border-[#2D2926]/20 rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors">
                            {copiedField === 'phone' ? <Check className="w-4 h-4" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t-2 border-[#2D2926]/10 group">
                        <div className="overflow-hidden">
                          <p className="font-display text-[9px] font-bold uppercase tracking-widest text-[#2D2926]/50 flex items-center gap-2 mb-1"><Mail className="w-3 h-3 text-[#FFC600]" strokeWidth={2} /> E-mail</p>
                          <p className="font-display text-sm uppercase font-bold text-[#2D2926] truncate">{pharmacy.email || 'Não designado'}</p>
                        </div>
                        {pharmacy.email && (
                          <button onClick={() => handleCopy(pharmacy.email, 'email')} className="w-9 h-9 flex items-center justify-center border-2 border-[#2D2926]/20 rounded-sm hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors shrink-0">
                            {copiedField === 'email' ? <Check className="w-4 h-4" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-[#2D2926] text-white border-2 border-[#2D2926] rounded-sm p-6 shadow-[4px_4px_0_rgba(255,198,0,1)]">
                  <h4 className="font-display text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-3">
                    <Target className="w-4 h-4 text-[#FFC600]" strokeWidth={2} /> Observações
                  </h4>
                  <div className="bg-white/5 border border-white/10 rounded-sm p-4 text-sm font-medium font-sans italic opacity-90 border-l-4 border-l-[#FFC600]">
                    "{pharmacy.notes || 'Nenhuma observação registrada.'}"
                  </div>
                </div>
              </>
            ) : (
              /* History Tab */
              <div className="bg-white border-2 border-[#2D2926]/10 rounded-sm p-6">
                <h4 className="font-display text-[10px] font-bold text-[#2D2926]/50 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <History className="w-4 h-4 text-[#FFC600]" strokeWidth={2} /> Histórico de Visitas
                </h4>

                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FFC600]" strokeWidth={2} />
                    <p className="font-display text-[10px] uppercase tracking-widest font-bold text-[#2D2926]/40">Carregando histórico...</p>
                  </div>
                ) : historyError ? (
                  <div className="text-center p-8 bg-red-50 border-2 border-red-200 rounded-sm">
                    <p className="font-display text-[10px] uppercase tracking-widest font-bold text-red-500">{historyError}</p>
                  </div>
                ) : visitHistory.length > 0 ? (
                  <div className="space-y-4">
                    {visitHistory.map((visit) => (
                      <div key={visit.id} className="bg-[#F7F7F7] p-5 border-2 border-[#2D2926]/10 rounded-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="font-display text-[10px] font-bold uppercase tracking-widest text-[#2D2926] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#FFC600]" strokeWidth={2} />
                            {new Date(visit.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                          <span className={cn(
                            "font-display text-[9px] px-2 py-1 font-bold uppercase tracking-widest rounded-sm border-2",
                            visit.status === 'completed' ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                            visit.status === 'issue' ? "bg-red-100 text-red-700 border-red-300" :
                            "bg-orange-100 text-orange-700 border-orange-300"
                          )}>
                            {visit.status === 'completed' ? 'Concluída' : visit.status === 'issue' ? 'Falha' : 'Remarcada'}
                          </span>
                        </div>
                        {visit.seller && (
                          <p className="font-display text-[9px] uppercase tracking-widest font-bold text-[#2D2926]/50 mb-3 flex items-center gap-1">
                            <User className="w-3 h-3" strokeWidth={2} />
                            {visit.seller.name}
                          </p>
                        )}
                        <p className="text-sm font-sans mb-4 text-[#2D2926]/80 leading-relaxed italic border-l-2 border-[#FFC600] pl-3">
                          "{visit.notes}"
                        </p>
                        {(visit.products_presented || visit.next_steps) && (
                          <div className="bg-[#2D2926] text-white p-4 rounded-sm border-2 border-[#2D2926] space-y-3 mt-3">
                            {visit.products_presented && (
                              <div className="text-sm">
                                <span className="font-display text-[9px] uppercase tracking-widest font-bold text-white/50 block mb-1">Produtos Apresentados:</span>
                                <span className="font-sans font-bold text-[#FFC600]">{visit.products_presented}</span>
                              </div>
                            )}
                            {visit.next_steps && (
                              <div className="text-sm">
                                <span className="font-display text-[9px] uppercase tracking-widest font-bold text-white/50 block mb-1">Próximos Passos:</span>
                                <span className="font-sans font-bold text-[#FFC600]">{visit.next_steps}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 bg-[#F7F7F7] border-2 border-dashed border-[#2D2926]/20 rounded-sm">
                    <History className="w-8 h-8 text-[#2D2926]/20 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-display text-[10px] uppercase tracking-widest font-bold text-[#2D2926]/40">Nenhuma visita registrada.</p>
                    <p className="font-display text-[9px] uppercase tracking-widest text-[#2D2926]/30 mt-2">Registre a primeira visita abaixo.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-6 border-t-2 border-[#2D2926] bg-[#FFC600] flex flex-col gap-3 shrink-0">
            <div className="flex gap-3">
              <button
                onClick={onRegisterVisit}
                className="flex-[2] bg-[#2D2926] text-white hover:bg-black py-4 px-4 rounded-sm font-display text-[10px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 border-2 border-[#2D2926] shadow-[3px_3px_0_rgba(255,255,255,0.4)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFC600]" strokeWidth={2} />
                Registrar Visita
              </button>
              <button
                onClick={() => openGoogleMaps(pharmacy.lat, pharmacy.lng)}
                className="flex-1 bg-transparent hover:bg-[#2D2926] hover:text-[#FFC600] text-[#2D2926] border-2 border-[#2D2926] rounded-sm flex items-center justify-center transition-all font-display text-[10px] uppercase font-bold tracking-widest gap-2"
              >
                <Navigation className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Navegar</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
