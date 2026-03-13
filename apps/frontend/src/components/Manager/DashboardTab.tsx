import React from 'react';
import { 
  ChevronRight, Plus, MessageSquareQuote, BarChart3, 
  CheckCircle2, ArrowUpRight, ArrowDownRight, Clock, Target, 
  Users, Activity, MapPin, TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell 
} from 'recharts';

interface DashboardTabProps {
  dashboardPeriod: 'today' | 'week' | 'month';
  setDashboardPeriod: (val: 'today' | 'week' | 'month') => void;
  performanceData: PerformancePoint[];
  regionData: RegionPoint[];
  mockActivities: ActivityPoint[];
  mockAnnotations: AnnotationPoint[];
  dashboardStats?: {
    visitsToday: number;
    totalPharmacies: number;
    needsVisit: number;
    activeSellers: number;
  } | null;
}

export interface PerformancePoint {
  name: string;
  concluídas: number;
  pendentes: number;
}

export interface RegionPoint {
  name: string;
  visitas: number;
}

export interface ActivityPoint {
  id: string;
  seller: string;
  action: string;
  target: string;
  time: string;
  status: 'completed' | 'issue' | 'rescheduled';
}

export interface AnnotationPoint {
  id: string;
  seller: string;
  pharmacy: string;
  note: string;
  time: string;
}

export function DashboardTab({
  dashboardPeriod,
  setDashboardPeriod,
  performanceData,
  regionData,
  mockActivities,
  mockAnnotations,
  dashboardStats,
}: DashboardTabProps) {
  const isLoading = dashboardStats === undefined;
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto">
        {/* Compact header with inline actions */}
        <header className="mb-10 pb-6 border-b-2 border-[#2D2926]/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <p className="font-display text-[10px] font-bold tracking-widest uppercase text-[#2D2926]/40 mb-1">
                STATUS DA OPERAÇÃO • {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
              <h1 className="font-display font-bold tracking-tight text-2xl md:text-3xl uppercase text-[#2D2926] leading-none">
                Centro de Comando
              </h1>
            </motion.div>

            {/* Actions toolbar */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="flex items-center gap-3 flex-wrap">
              <button className="h-10 px-4 bg-[#FFC600] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors flex items-center gap-2 font-display font-bold text-[10px] tracking-widest uppercase rounded-sm border-2 border-transparent shadow-[3px_3px_0_rgba(45,41,38,1)]">
                <Plus className="w-4 h-4" strokeWidth={2} /> Nova Missão
              </button>
              <button className="h-10 px-4 bg-transparent text-[#2D2926] border-2 border-[#2D2926]/20 hover:border-[#2D2926] transition-colors flex items-center gap-2 font-display font-bold text-[10px] tracking-widest uppercase rounded-sm">
                <MessageSquareQuote className="w-4 h-4" strokeWidth={2} /> Comunicado
              </button>
              <button className="h-10 px-4 bg-white text-[#2D2926] border-2 border-[#2D2926]/10 hover:border-[#2D2926] transition-colors flex items-center gap-2 font-display font-bold text-[10px] tracking-widest uppercase rounded-sm">
                <BarChart3 className="w-4 h-4" strokeWidth={2} /> Exportar
              </button>
              <div className="w-px h-8 bg-[#2D2926]/10" />
              <div className="relative">
                <select 
                  value={dashboardPeriod}
                  onChange={(e) => {
                    const nextPeriod = e.target.value;
                    if (nextPeriod === 'today' || nextPeriod === 'week' || nextPeriod === 'month') {
                      setDashboardPeriod(nextPeriod);
                    }
                  }}
                  className="appearance-none h-10 bg-transparent border-2 border-[#2D2926] text-[#2D2926] pl-4 pr-10 text-[10px] font-bold tracking-widest uppercase focus:outline-none cursor-pointer rounded-sm hover:bg-[#2D2926] hover:text-white transition-colors"
                >
                  <option value="today">Hoje</option>
                  <option value="week">Semana</option>
                  <option value="month">Mês</option>
                </select>
                <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" strokeWidth={2} />
              </div>
            </motion.div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-[#2D2926] p-5 md:p-6 border border-[#2D2926] text-white relative overflow-hidden group rounded-sm shadow-xl">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FFC600] opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <CheckCircle2 className="w-5 h-5 text-[#FFC600]" strokeWidth={1.5} />
              <span className="flex items-center gap-1 text-[9px] font-bold text-[#2D2926] bg-[#FFC600] px-2 py-1 uppercase tracking-widest rounded-sm">
                <ArrowUpRight className="w-3 h-3" strokeWidth={2} /> Hoje
              </span>
            </div>
            <h3 className="font-display font-bold tracking-tighter text-4xl md:text-5xl mb-1 relative z-10 leading-none">
              {isLoading ? <span className="animate-pulse bg-white/20 rounded w-12 h-8 inline-block" /> : (dashboardStats?.visitsToday ?? 0)}
            </h3>
            <p className="font-display text-[9px] md:text-[10px] font-bold tracking-widest uppercase opacity-70 relative z-10 text-[#FFC600]">Visitas Hoje</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.15 }} className="bg-white p-5 md:p-6 border-2 border-[#2D2926]/10 relative group hover:border-[#2D2926] transition-colors rounded-sm shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Clock className="w-5 h-5 text-[#2D2926]" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-bold tracking-tighter text-4xl md:text-5xl mb-1 leading-none text-[#2D2926]">
              {isLoading ? <span className="animate-pulse bg-[#2D2926]/10 rounded w-12 h-8 inline-block" /> : (dashboardStats?.needsVisit ?? 0)}
            </h3>
            <p className="font-display text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-[#2D2926]/50">Precisam Visita</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white p-5 md:p-6 border-2 border-[#2D2926]/10 relative group hover:border-[#2D2926] transition-colors rounded-sm shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Target className="w-5 h-5 text-[#2D2926]" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-bold tracking-tighter text-4xl md:text-5xl mb-1 leading-none text-[#2D2926]">
              {isLoading ? <span className="animate-pulse bg-[#2D2926]/10 rounded w-12 h-8 inline-block" /> : (dashboardStats?.totalPharmacies?.toLocaleString('pt-BR') ?? 0)}
            </h3>
            <p className="font-display text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-[#2D2926]/50">Total Farmácias</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.25 }} className="bg-white p-5 md:p-6 border-2 border-[#2D2926]/10 relative group hover:border-[#2D2926] transition-colors rounded-sm shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Users className="w-5 h-5 text-[#2D2926]" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-bold tracking-tighter text-4xl md:text-5xl mb-1 leading-none text-[#2D2926]">
              {isLoading ? <span className="animate-pulse bg-[#2D2926]/10 rounded w-12 h-8 inline-block" /> : (dashboardStats?.activeSellers ?? 0)}
            </h3>
            <p className="font-display text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-[#2D2926]/50">Agentes Ativos</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Performance Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-2 bg-white border-2 border-[#2D2926]/10 rounded-sm shadow-sm p-8 flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b-2 border-[#2D2926]/10 pb-4">
              <div>
                <h2 className="font-display font-bold tracking-tight text-xl uppercase text-[#2D2926]">Desempenho da Missão</h2>
                <p className="font-display text-[10px] tracking-widest text-[#2D2926]/50 mt-1 uppercase">Métrica Temporal</p>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConcluidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D2926" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2D2926" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPendentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFC600" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFC600" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={{ stroke: '#2D2926', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#2D2926', fontSize: 10, fontWeight: '700', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#2D2926', fontSize: 10, fontWeight: '700', fontFamily: 'var(--font-display)' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '4px', border: '2px solid #2D2926', boxShadow: '4px 4px 0px rgba(0,0,0,1)', backgroundColor: '#ffffff', padding: '16px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: '#2D2926' }}
                    labelStyle={{ color: '#2D2926', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '10px', paddingTop: '20px', fontWeight: 'bold', fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: '#2D2926' }} />
                  <Area type="step" name="Concluídas" dataKey="concluídas" stroke="#2D2926" strokeWidth={3} fillOpacity={1} fill="url(#colorConcluidas)" />
                  <Area type="step" name="Pendentes" dataKey="pendentes" stroke="#FFC600" strokeWidth={3} fillOpacity={1} fill="url(#colorPendentes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Region Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-[#2D2926] text-white border border-[#2D2926] rounded-sm shadow-xl p-8 flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display font-bold tracking-tight text-xl uppercase text-[#FFC600]">Distribuição Zonal</h2>
                <p className="font-display text-[10px] tracking-widest text-white/40 mt-1 uppercase">Carga Ocupacional</p>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#ffffff" opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={{ stroke: '#ffffff', strokeOpacity: 0.2, strokeWidth: 1 }} tickLine={false} tick={{ fill: '#ffffff', fontSize: 10, fontWeight: '700', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }} width={80} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ borderRadius: '4px', border: 'none', backgroundColor: '#FFC600', padding: '12px' }}
                    itemStyle={{ color: '#2D2926', fontWeight: 'bold', fontSize: '12px', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar name="Visitas" dataKey="visitas" fill="#FFC600" barSize={20}>
                    {
                      regionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#FFC600' : '#ffffff'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Activity Feed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="lg:col-span-2 bg-white border-2 border-[#2D2926]/10 rounded-sm shadow-sm p-8">
            <div className="flex justify-between items-center mb-8 border-b-2 border-[#2D2926]/10 pb-4">
              <h2 className="font-display font-bold tracking-tight text-xl uppercase text-[#2D2926] flex items-center gap-3">
                <Activity className="w-5 h-5 text-[#FFC600]" strokeWidth={2} /> TELEMETRIA
              </h2>
              <button className="font-display text-[10px] font-bold tracking-widest uppercase text-[#2D2926] hover:bg-[#2D2926] hover:text-[#FFC600] border-2 border-[#2D2926] px-4 py-2 transition-colors rounded-sm">
                LOG COMPLETO
              </button>
            </div>
            
            <div className="space-y-6">
              {mockActivities.map(activity => (
                <div key={activity.id} className="flex gap-6 items-start group">
                  <div className="shrink-0 mt-1">
                    {activity.status === 'completed' ? (
                      <div className="w-8 h-8 border-2 border-[#2D2926] text-[#2D2926] flex items-center justify-center relative">
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                      </div>
                    ) : activity.status === 'issue' ? (
                      <div className="w-8 h-8 border-2 border-red-600 bg-red-600 text-white flex items-center justify-center relative">
                        <AlertCircle className="w-4 h-4" strokeWidth={2} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 border-2 border-[#FFC600] bg-[#FFC600] text-[#2D2926] flex items-center justify-center relative">
                        <RefreshCw className="w-4 h-4" strokeWidth={2} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pb-6 border-b border-[#2D2926]/10 group-last:border-none group-last:pb-0">
                    <p className="text-sm font-medium leading-relaxed text-[#2D2926]">
                      <span className="font-display font-bold uppercase tracking-wider">{activity.seller}</span>{' '}
                      <span className="opacity-70">
                        {activity.action === 'concluiu visita em' ? 'concluiu visita em' : 
                         activity.action === 'relatou problema em' ? 'relatou problema em' : 
                         'remarcou a visita para'}
                      </span>{' '} 
                      <span className="font-bold underline decoration-[#FFC600] decoration-2 underline-offset-4">{activity.target}</span>
                    </p>
                    <p className="font-display text-[10px] uppercase tracking-widest mt-3 font-bold flex items-center gap-2 text-[#2D2926]/50">
                      <Clock className="w-3 h-3" strokeWidth={2} /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Attention Required Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-[#FFC600] text-[#2D2926] border-2 border-[#2D2926] p-8 flex flex-col rounded-sm shadow-[8px_8px_0_rgba(45,41,38,1)]">
            <div className="flex justify-between items-center mb-8 border-b-2 border-[#2D2926] pb-4">
              <h2 className="font-display font-bold tracking-tight text-xl uppercase flex items-center gap-3">
                <AlertCircle className="w-6 h-6" strokeWidth={2} /> ALERTAS
              </h2>
            </div>
            <div className="space-y-4">
              <div className="bg-[#2D2926] text-white p-5 border border-[#2D2926] relative group">
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <h3 className="font-display font-bold text-sm tracking-wider uppercase mb-1">Farmácia Central</h3>
                    <p className="text-xs font-medium text-white/70 mb-3">Sem visitas há 15 dias</p>
                    <span className="font-display text-[9px] font-bold tracking-widest bg-white/10 text-white px-2 py-1 uppercase">Zona Sul</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#2D2926] text-white p-5 border border-[#2D2926] relative group">
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-5 h-5 text-red-500 shrink-0 mt-0.5 rotate-180" strokeWidth={2} />
                  <div>
                    <h3 className="font-display font-bold text-sm tracking-wider uppercase mb-1">Carlos Silva</h3>
                    <p className="text-xs font-medium text-white/70 mb-3">Eficiênca abaixo do portal (38%)</p>
                    <span className="font-display text-[9px] font-bold tracking-widest bg-white/10 text-white px-2 py-1 uppercase">Rep</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
