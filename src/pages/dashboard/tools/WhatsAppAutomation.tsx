
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Button, Input, Textarea } from "../../../components/ui/Primitives";
import { Plus, Trash, Bot, Power, X } from "lucide-react";
import { toast } from "sonner";

export function WhatsAppAutomation() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newRule, setNewRule] = useState({ keyword: "", response_text: "", match_type: "contains", is_active: true });

    // 1. Carregar Regras
    useEffect(() => {
        fetchRules();
    }, []);

    async function fetchRules() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase.from('whatsapp_automations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setRules(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    // 2. Criar Regra
    async function handleCreate() {
        if (!newRule.keyword || !newRule.response_text) return toast.error("Preencha tudo!");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('whatsapp_automations').insert([{
            user_id: user.id,
            ...newRule
        }]);

        if (error) {
            toast.error("Erro ao criar regra");
            console.error(error);
        } else {
            toast.success("Automação criada!");
            setOpen(false);
            setNewRule({ keyword: "", response_text: "", match_type: "contains", is_active: true });
            fetchRules();
        }
    }

    // 3. Deletar Regra
    async function handleDelete(id: string) {
        if (!confirm("Tem certeza?")) return;
        const { error } = await supabase.from('whatsapp_automations').delete().eq('id', id);
        if (!error) {
            toast.success("Regra removida");
            fetchRules();
        } else {
            toast.error("Erro ao remover");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Bot className="h-5 w-5 text-green-500" />
                        Regras de Resposta Automática
                    </h2>
                    <p className="text-sm text-gray-500">O robô responderá automaticamente quando detectar estas palavras.</p>
                </div>

                <Button onClick={() => setOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Nova Regra
                </Button>
            </div>

            {/* Modal Customizado */}
            {open && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setOpen(false)} />
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg pointer-events-auto p-6 space-y-4 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="text-lg font-bold">Criar Nova Automação</h3>
                                <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Se o cliente disser (Palavra-chave):</label>
                                    <Input
                                        placeholder="Ex: preço, pix, comprar"
                                        value={newRule.keyword}
                                        onChange={e => setNewRule({ ...newRule, keyword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">O robô responde:</label>
                                    <Textarea
                                        className="min-h-[100px] w-full p-2 border rounded-md"
                                        placeholder="Ex: O preço é 500MT. Pague pelo M-Pesa..."
                                        value={newRule.response_text}
                                        onChange={e => setNewRule({ ...newRule, response_text: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleCreate} className="w-full bg-green-600 text-white hover:bg-green-700">
                                    Salvar Automação
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="rounded-md border bg-white overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Gatilho</th>
                            <th className="px-6 py-3">Resposta</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map((rule) => (
                            <tr key={rule.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">
                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                        "{rule.keyword}"
                                    </span>
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate text-gray-500">{rule.response_text}</td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-2 ${rule.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                        <Power className="h-4 w-4" />
                                        {rule.is_active ? 'Ativo' : 'Pausado'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDelete(rule.id)}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {rules.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                    Nenhuma automação criada ainda. O robô está mudo. 😶
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
