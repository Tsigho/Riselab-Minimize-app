
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Button, Input } from "../../../components/ui/Primitives";
import { Plus, Trash, Globe, Zap, Activity, X } from "lucide-react";
import { toast } from "sonner";

export function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Estado do formulário
    const [newItem, setNewItem] = useState({
        name: "",
        url: "",
        events: ["order.created"] // Padrão: Venda Criada
    });

    useEffect(() => {
        fetchWebhooks();
    }, []);

    async function fetchWebhooks() {
        try {
            const { data } = await supabase.from('webhooks').select('*').order('created_at', { ascending: false });
            if (data) setWebhooks(data);
        } catch (e) {
            console.error("Error fetching webhooks:", e);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!newItem.url || !newItem.name) return toast.error("Preencha Nome e URL");
        if (!newItem.url.startsWith("http")) return toast.error("A URL deve começar com http:// ou https://");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('webhooks').insert([{
            user_id: user.id,
            name: newItem.name,
            url: newItem.url,
            events: newItem.events
        }]);

        if (error) {
            toast.error("Erro ao salvar webhook");
            console.error(error);
        } else {
            toast.success("Webhook ativado!");
            setOpen(false);
            setNewItem({ name: "", url: "", events: ["order.created"] });
            fetchWebhooks();
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja remover este webhook?")) return;
        const { error } = await supabase.from('webhooks').delete().eq('id', id);
        if (!error) {
            toast.success("Webhook removido");
            fetchWebhooks();
        } else {
            toast.error("Erro ao remover webhook");
        }
    }

    // Função para simular um disparo (Teste)
    async function testWebhook(webhook: any) {
        toast.info(`Simulando disparo para ${webhook.name}...`);
        try {
            await fetch(webhook.url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'test_ping',
                    message: 'Isso é um teste do Minimizing App',
                    timestamp: new Date().toISOString()
                })
            });
            toast.success("Disparo enviado (verifique o destino)!");
        } catch (e) {
            console.error(e);
            toast.warning("Erro de rede ao testar (CORS pode estar bloqueando)");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        Webhooks & Integrações
                    </h2>
                    <p className="text-sm text-gray-500">Conecte sua loja a sistemas externos (Zapier, n8n, Slack) via API.</p>
                </div>

                <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Novo Webhook
                </Button>
            </div>

            {/* Modal Customizado */}
            {open && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setOpen(false)} />
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg pointer-events-auto p-6 space-y-4 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="text-lg font-bold">Configurar Integração</h3>
                                <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nome da Integração</label>
                                    <Input
                                        placeholder="Ex: Notificar no Slack"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">URL de Destino (Endpoint)</label>
                                    <Input
                                        placeholder="https://hooks.zapier.com/..."
                                        value={newItem.url}
                                        onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                                    />
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Evento Padrão: <b>Nova Venda (order.created)</b>
                                </div>
                                <Button onClick={handleCreate} className="w-full bg-blue-600 text-white hover:bg-blue-700">
                                    Salvar Webhook
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">URL de Destino</th>
                            <th className="px-6 py-3">Eventos</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {webhooks.map((hook) => (
                            <tr key={hook.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-yellow-500" />
                                        {hook.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate text-gray-500" title={hook.url}>
                                    {hook.url}
                                </td>
                                <td className="px-6 py-4">
                                    {hook.events && hook.events.map((ev: string) => (
                                        <span key={ev} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                            {ev}
                                        </span>
                                    ))}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => testWebhook(hook)} className="h-8 px-2">
                                            <Activity className="h-3 w-3 mr-1" /> Testar
                                        </Button>
                                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDelete(hook.id)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {webhooks.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="text-center py-12 text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Globe className="h-10 w-10 text-gray-300" />
                                        <p>Nenhuma integração ativa. Adicione um Webhook para automatizar.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan={4} className="text-center py-8">Carregando...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
