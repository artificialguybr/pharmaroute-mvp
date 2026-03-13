import React, { useState } from 'react';
import { ArrowRight, MapPin, Activity, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Login({ onLogin }: { onLogin: (role: 'seller' | 'manager', user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showDevBypass = true; // MVP: always expose quick role access

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      let role: 'seller' | 'manager' = 'seller';

      const metaRole = data.user?.user_metadata?.role;
      if (metaRole === 'seller' || metaRole === 'manager') {
        role = metaRole;
      } else {
        const profileReq = supabase.from('profiles').select('role').eq('id', data.user.id).single();
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
        const result: any = await Promise.race([profileReq, timeout]).catch(() => null);
        if (result?.data?.role === 'manager') role = 'manager';
      }

      onLogin(role, data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col md:flex-row font-sans text-[#2D2926] selection:bg-[#FFC600] selection:text-[#2D2926]">
      
      {/* LEFT PANEL: The Brand */}
      <div className="md:w-[45%] p-8 md:p-16 flex flex-col justify-between relative bg-[#FFC600] text-[#2D2926] min-h-[40vh] md:min-h-screen">
        {/* Subtle geometric pattern / texture background */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2D2926 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute -left-[20%] -bottom-[20%] w-[80%] h-[80%] border-[1px] border-[#2D2926]/10 rounded-full blur-3xl mix-blend-overlay"></div>

        <div className="relative z-10 flex items-center gap-4 border-b border-[#2D2926]/10 pb-6">
          <div className="w-14 h-14 bg-[#2D2926] flex items-center justify-center pt-1 shadow-xl">
            <Shield className="w-7 h-7 text-[#FFC600]" strokeWidth={2} />
          </div>
          <div>
            <span className="font-display font-bold text-3xl tracking-tight text-[#2D2926] leading-none block">PHARMA</span>
            <span className="font-display font-medium text-xl tracking-[0.2em] text-[#2D2926]/70 leading-none block">ROUTE</span>
          </div>
        </div>

        <div className="relative z-10 mt-20 md:mt-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-4xl md:text-[5rem] font-bold leading-[0.9] mb-6 text-[#2D2926] tracking-tight uppercase">
              Operação<br />
              <span className="text-[#F7F7F7] drop-shadow-sm mix-blend-exclusion">Sincronizada</span><br />
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-[#2D2926] text-lg max-w-sm leading-relaxed font-normal"
          >
            Sistema estrutural para logística de relacionamento farmacêutico e gestão de campo. Alta precisão, zero redundância.
          </motion.p>
          
          <div className="mt-8 md:mt-16 flex flex-col gap-4 md:gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-6 group"
            >
              <div className="w-2 h-12 bg-[#2D2926] scale-y-50 group-hover:scale-y-100 transition-transform origin-left"></div>
              <div>
                <span className="block font-display font-bold text-lg text-[#2D2926] uppercase tracking-wide">Roteirização Inteligente</span>
                <span className="block text-sm text-[#2D2926]/70 font-normal">Matriz de otimização de campo contínua</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-6 group"
            >
              <div className="w-2 h-12 bg-[#2D2926] scale-y-50 group-hover:scale-y-100 transition-transform origin-left"></div>
              <div>
                <span className="block font-display font-bold text-lg text-[#2D2926] uppercase tracking-wide">Dados em Tempo Real</span>
                <span className="block text-sm text-[#2D2926]/70 font-normal">Gestão pautada em métricas precisas</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="relative z-10 mt-4 md:hidden flex items-center justify-between text-xs text-[#2D2926] pt-4 border-t border-[#2D2926]/20 font-medium tracking-widest uppercase">
          <span>&copy; 2026 PharmaRoute</span>
          <span className="bg-[#2D2926] text-[#FFC600] px-3 py-1 font-bold">SYS_V3.1</span>
        </div>
        <div className="relative z-10 hidden md:flex items-center justify-between text-xs text-[#2D2926] mt-12 pt-6 border-t border-[#2D2926]/20 font-medium tracking-widest uppercase">
          <span>&copy; 2026 PharmaRoute Corp</span>
          <span className="bg-[#2D2926] text-[#FFC600] px-3 py-1 font-bold">SYS_V3.1</span>
        </div>
      </div>

      {/* RIGHT PANEL: The Portal (Minimal/Utilitarian) */}
      <div className="md:w-[55%] p-8 md:p-24 flex items-center justify-center bg-[#F7F7F7] relative">
        <div className="w-full max-w-md relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <h2 className="font-display text-4xl font-bold mb-2 text-[#2D2926] tracking-tight uppercase">Acesso Restrito</h2>
            <div className="w-8 h-1 bg-[#FFC600] mb-6"></div>
            <p className="text-sm text-[#2D2926]/60 font-normal tracking-wide">Insira suas credenciais operacionais para iniciar a sessão.</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 text-sm font-bold text-white bg-red-600 border-l-4 border-red-900"
              >
                ACESSO NEGADO: {error}
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <label className="block text-xs font-bold text-[#2D2926] tracking-widest uppercase mb-2">Identificação</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-4 mb-2 bg-transparent border-b-2 border-[#2D2926]/20 focus:outline-none focus:border-[#FFC600] transition-colors font-medium text-lg text-[#2D2926] placeholder-[#2D2926]/30"
                placeholder="agente@pharmaroute.com"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <label className="block text-xs font-bold text-[#2D2926] tracking-widest uppercase mb-2">Chave de Acesso</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-0 py-4 bg-transparent border-b-2 border-[#2D2926]/20 focus:outline-none focus:border-[#FFC600] transition-colors font-bold text-2xl tracking-[0.3em] text-[#2D2926] placeholder-[#2D2926]/30"
                placeholder="••••••••"
              />
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              type="submit"
              disabled={loading}
              className="w-full mt-10 bg-[#2D2926] text-[#F7F7F7] font-bold text-sm tracking-widest uppercase py-5 px-6 hover:bg-[#FFC600] hover:text-[#2D2926] transition-colors disabled:opacity-50 flex items-center justify-between group"
            >
              <span>{loading ? 'Autenticando...' : 'Iniciar Sessão'}</span> 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" strokeWidth={2} />
            </motion.button>
            
            {showDevBypass && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="pt-12 mt-12 border-t border-[#2D2926]/10"
              >
                <p className="text-[10px] font-bold text-[#2D2926]/40 tracking-widest uppercase mb-4">Modo Desenvolvedor (Bypass)</p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => onLogin('manager', { id: 'mock', email: 'manager@mock.com' })}
                    className="flex-1 bg-transparent text-[#2D2926] font-bold py-3 px-4 hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors text-xs tracking-wider uppercase border border-[#2D2926]"
                  >
                    Gestor
                  </button>
                  <button
                    type="button"
                    onClick={() => onLogin('seller', { id: 'mock', email: 'seller@mock.com' })}
                    className="flex-1 bg-transparent text-[#2D2926] font-bold py-3 px-4 hover:bg-[#2D2926] hover:text-[#FFC600] transition-colors text-xs tracking-wider uppercase border border-[#2D2926]"
                  >
                    Agente
                  </button>
                </div>
              </motion.div>
            )}
          </form>
          
        </div>
      </div>
    </div>
  );
}
