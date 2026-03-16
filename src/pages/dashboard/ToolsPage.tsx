import { MessageCircle, Mail, Smartphone, Globe, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button, Input, Label } from "../../components/ui/Primitives";
import { getIntegration, saveIntegration } from "../../lib/api/integrations";
import { useNavigate } from "react-router-dom";

const tools = [
    {
        id: "whatsapp",
        icon: MessageCircle,
        title: "Automação WhatsApp",
        description: "Envie mensagens automáticas para recuperar carrinhos e engajar leads.",
        color: "text-green-500",
        bg: "bg-green-500/10",
        comingSoon: false
    },
    {
        id: "sms",
        icon: Smartphone,
        title: "SMS Marketing",
        description: "Alcance seus clientes instantaneamente através de campanhas de SMS.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        comingSoon: true
    },
    {
        id: "email",
        icon: Mail,
        title: "Email Marketing",
        description: "Ferramentas completas para newsletters e funis de vendas.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        comingSoon: true
    },
    {
        id: "utmify",
        icon: "utmify-logo", // Special flag to use custom image
        title: "Integração UTMify",
        description: "Rastreie suas vendas com precisão usando parâmetros UTM avançados.",
        color: "text-orange-500",
        bg: "bg-black", // Brand color background
        comingSoon: false
    },
    {
        id: "webhooks",
        icon: Globe,
        title: "Webhooks & API",
        description: "Conecte sua loja a sistemas externos (Zapier, n8n, Slack) via API.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        comingSoon: false
    },
];

export const ToolsPage = () => {
    const navigate = useNavigate();
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [utmToken, setUtmToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch existing token when modal opens
    useEffect(() => {
        if (selectedTool === 'utmify') {
            setIsLoading(true);
            getIntegration('utmify')
                .then(data => {
                    if (data?.api_token) setUtmToken(data.api_token);
                })
                .finally(() => setIsLoading(false));
        }
    }, [selectedTool]);

    const handleSaveUtmify = async () => {
        setIsSaving(true);
        try {
            await saveIntegration('utmify', { api_token: utmToken });
            alert("Token UTMify salvo com sucesso!");
            setSelectedTool(null);
        } catch (error) {
            alert("Erro ao salvar token.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToolClick = (toolId: string, comingSoon: boolean) => {
        if (toolId === 'whatsapp') {
            navigate('/dashboard/tools/whatsapp');
            return;
        }
        if (toolId === 'webhooks') {
            navigate('/dashboard/tools/webhooks');
            return;
        }

        if (!comingSoon) {
            setSelectedTool(toolId);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Ferramentas de Marketing</h1>
            <p className="text-muted-foreground">Potencialize suas vendas com nosso conjunto de ferramentas integradas.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {tools.map((tool) => (
                    <div
                        key={tool.id}
                        onClick={() => handleToolClick(tool.id, tool.comingSoon)}
                        className={`flex items-start gap-4 p-6 rounded-xl glass-panel transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] group relative ${tool.comingSoon ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5 border-green-500/10 hover:border-green-500/50'}`}
                    >
                        <div className={`w-12 h-12 rounded-lg ${tool.bg} ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            {tool.id === 'utmify' ? (
                                <img src="/icons/utmify.png" alt="UTMify" className="w-8 h-8 object-contain" />
                            ) : (
                                <tool.icon className="w-6 h-6" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                {tool.title}
                                {tool.comingSoon && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">Brevemente</span>}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {tool.description}
                            </p>
                            {!tool.comingSoon && (
                                <button className="text-sm font-medium text-primary hover:underline pt-2">
                                    Configurar &rarr;
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* UTMify Config Modal */}
            {selectedTool === 'utmify' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-background w-full max-w-md rounded-xl border shadow-2xl p-6 space-y-6 animate-in zoom-in-95">
                        <div className="flex items-center gap-4 border-b pb-4">
                            <div className="bg-orange-500/10 p-3 rounded-lg text-orange-500">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Configurar UTMify</h2>
                                <p className="text-sm text-muted-foreground">Insira seu Token de API para integrar.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>UTMify API Token</Label>
                                <Input
                                    placeholder="Cole seu token aqui..."
                                    value={utmToken}
                                    onChange={(e) => setUtmToken(e.target.value)}
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Você pode encontrar este token no painel da UTMify em Configurações via API.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setSelectedTool(null)}>Cancelar</Button>
                            <Button onClick={handleSaveUtmify} disabled={isSaving || isLoading}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar Configuração
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
