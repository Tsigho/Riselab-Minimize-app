'use client';

import { useState, useEffect } from 'react';
import { Activity, Eye, EyeOff, Save, Link2, Zap, LogOut, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getIntegration, saveIntegration } from '../../lib/api/integrations';

export default function RastroMozIntegration() {
    // Estados Locais
    const [token, setToken] = useState('');
    const [s2sEnabled, setS2sEnabled] = useState(false);
    const [pageViewEnabled, setPageViewEnabled] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isIntegrated, setIsIntegrated] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await getIntegration('rastromoz');
            if (data) {
                setToken(data.api_token || '');
                if (data.metadata) {
                    setS2sEnabled(data.metadata.s2s_enabled || false);
                    setPageViewEnabled(data.metadata.page_view_enabled || false);
                }
                if (data.api_token) setIsIntegrated(true);
            }
        } catch (error) {
            console.error("Error loading RastroMoz config", error);
        }
    };

    const handleSave = async () => {
        if (!token) {
            toast.error("Por favor, insira o token.");
            return;
        }
        setIsLoading(true);

        try {
            await saveIntegration('rastromoz', {
                api_token: token,
                // @ts-ignore
                s2s_enabled: s2sEnabled,
                page_view_enabled: pageViewEnabled
            });

            setIsIntegrated(true);
            toast.success('Integração com a Rastroy esta concluida');
        } catch (error) {
            toast.error('Erro ao salvar integração.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!confirm("Tem certeza que deseja remover essa integração? O rastreamento irá parar.")) return;

        setIsLoading(true);
        try {
            // Save empty token to "disconnect"
            await saveIntegration('rastromoz', { api_token: '' });
            setToken('');
            setS2sEnabled(false);
            setPageViewEnabled(false);
            setIsIntegrated(false);
            toast.success('Integração removida.');
        } catch (error) {
            toast.error('Erro ao sair da integração.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`group relative overflow-hidden rounded-2xl border ${isIntegrated ? 'border-green-500/30' : 'border-white/10'} bg-gray-900/60 p-6 backdrop-blur-xl transition-all hover:border-[#00ff9d]/30`}>

            {/* Glow Effect no Hover */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#00ff9d]/10 blur-3xl transition-all group-hover:bg-[#00ff9d]/20" />

            {/* Header do Card */}
            <div className="mb-6 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isIntegrated ? 'bg-green-500/20 text-green-500' : 'bg-[#00ff9d]/10 text-[#00ff9d]'}`}>
                    {isIntegrated ? <CheckCircle size={20} /> : <Activity size={20} />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Rastroy Inteligente</h3>
                    <p className="text-xs text-gray-400">
                        {isIntegrated ? 'Conectado e Rastreando' : 'Rastreamento S2S e Atribuição'}
                    </p>
                </div>
            </div>

            {/* Corpo do Formulário */}
            <div className="space-y-6">

                {/* Input de Token */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Cole seu Token de Integração</label>
                    <div className="relative">
                        <input
                            type={showToken ? 'text' : 'password'}
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="rm_live_sk_..."
                            disabled={isIntegrated} // Disable input when integrated
                            className={`w-full rounded-lg border ${isIntegrated ? 'border-green-500/20 bg-green-500/5 text-gray-400' : 'border-white/10 bg-black/40 text-white'} px-4 py-2.5 text-sm placeholder-gray-600 focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                        >
                            {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {!isIntegrated && (
                        <p className="text-[10px] text-gray-500">
                            Obtenha este token no painel do RastroMoz {'>'} Integrações.
                        </p>
                    )}
                </div>

                {/* Switches de Configuração */}
                <div className="space-y-4 rounded-xl bg-white/5 p-4">

                    {/* Switch 1: S2S */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link2 size={16} className="text-[#00ff9d]" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">Ativar Rastreamento S2S</span>
                                <span className="text-[10px] text-gray-400">Server-to-Server (Imune a AdBlock)</span>
                            </div>
                        </div>
                        <Toggle checked={s2sEnabled} onChange={setS2sEnabled} disabled={isIntegrated} />
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    {/* Switch 2: PageView */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-purple-400" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">Enviar Eventos de PageView</span>
                                <span className="text-[10px] text-gray-400">Opcional: Rastrear visitas, não só vendas</span>
                            </div>
                        </div>
                        <Toggle checked={pageViewEnabled} onChange={setPageViewEnabled} disabled={isIntegrated} />
                    </div>

                </div>

                {/* Botoes de Acao */}
                {!isIntegrated ? (
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00ff9d] py-2.5 text-sm font-bold text-black transition-all hover:bg-[#00ff9d]/90 hover:shadow-[0_0_20px_rgba(0,255,157,0.3)] disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Salvando...</span>
                        ) : (
                            <>
                                <Save size={16} />
                                Salvar Configuração
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 border border-red-500/50 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-500/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Saindo...</span>
                        ) : (
                            <>
                                <LogOut size={16} />
                                Sair da integração
                            </>
                        )}
                    </button>
                )}

            </div>
        </div>
    );
}

// Subcomponente Toggle (Switch) minimalista
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#00ff9d]' : 'bg-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
}
