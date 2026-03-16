
import { Plus, Users } from "lucide-react";

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
    );
};
