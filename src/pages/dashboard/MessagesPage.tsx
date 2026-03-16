import { useState, useEffect } from "react";
import { Plus, Users } from "lucide-react";
import { Card, Badge } from "../../components/ui/Primitives";
import { supabase } from "../../lib/supabase";

export const SellerMessages = () => {
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            // Puxa produtos que têm mensagens do administrador
            const { data } = await supabase
                .from('products')
                .select('name, admin_feedback, status, updated_at')
                .eq('user_id', user.id)
                .not('admin_feedback', 'is', null);
            setNotifications(data || []);
        };
        fetchFeedbacks();
    }, []);

    return (
        <div className="space-y-4 mb-10">
            <h2 className="text-xl font-bold text-white mb-6">Mensagens da Administração</h2>
            {notifications.length === 0 ? (
                <p className="text-slate-500">Nenhuma recomendação no momento.</p>
            ) : (
                notifications.map((note, i) => (
                    <Card key={i} className={`p-4 bg-[#12101b] border-l-4 ${note.status === 'approved' ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white">Re: {note.name}</h3>
                            <Badge className={note.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {note.status === 'approved' ? 'Aprovado com notas' : 'Necessita Correção'}
                            </Badge>
                        </div>
                        <p className="text-slate-300 text-sm italic">"{note.admin_feedback}"</p>
                        <p className="text-[10px] text-slate-500 mt-3">Recebido em: {new Date(note.updated_at).toLocaleDateString()}</p>
                    </Card>
                ))
            )}
        </div>
    );
};

export const MessagesPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Mensagens & Comunidades</h1>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md">
                    <Plus className="w-5 h-5" />
                    Adicionar Comunidade
                </button>
            </div>

            <SellerMessages />

            <div className="pt-8 border-t border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">Minhas Comunidades</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Community Card Placeholder */}
                <div className="group relative overflow-hidden rounded-xl glass-panel hover:bg-white/5 transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] cursor-pointer border-green-500/10 hover:border-green-500/50">
                    <div className="p-6 space-y-4">
                        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Comunidade VIP</h3>
                            <p className="text-sm text-muted-foreground">128 Membros</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Criar Nova Comunidade</span>
                </div>
                </div>
            </div>
        </div>
    );
};
