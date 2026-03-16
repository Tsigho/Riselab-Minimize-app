import { useState, useEffect } from "react";
import { Search, Download, Filter, User, Mail, Phone, Calendar, ShoppingBag } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Badge } from "../../components/ui/Primitives";

export const TransactionsPage = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('sales')
                .select('*, products(name)')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            if (data) setSales(data);
        } catch (error) {
            console.error("Erro ao buscar vendas:", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Minhas Transações</h1>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrar
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-md">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            <div className="rounded-xl glass-panel shadow-sm overflow-hidden border-green-500/10">
                <div className="p-4 border-b border-white/5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por referência..."
                            className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-400">
                            <tr>
                                <th className="p-4 rounded-tl-lg font-medium">Data da Compra</th>
                                <th className="p-4 font-medium">Dados do Cliente</th>
                                <th className="p-4 font-medium">Contato</th>
                                <th className="p-4 font-medium">Produto</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 rounded-tr-lg text-right font-medium">Seu Ganho Líquido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale) => (
                                <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    {/* DATA */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            {new Date(sale.created_at).toLocaleDateString('pt-MZ')}
                                        </div>
                                        <div className="text-xs text-slate-500 ml-6">
                                            {new Date(sale.created_at).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>

                                    {/* NOME E EMAIL DO CLIENTE */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-white font-medium">
                                            <User className="w-4 h-4 text-primary" />
                                            {sale.customer_name || 'Desconhecido'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 ml-6">
                                            <Mail className="w-3 h-3" />
                                            {sale.customer_email || 'N/A'}
                                        </div>
                                    </td>

                                    {/* NÚMERO DE TELEFONE */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Phone className="w-4 h-4 text-green-500" />
                                            {sale.customer_phone || 'N/A'}
                                        </div>
                                    </td>

                                    {/* PRODUTO */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <ShoppingBag className="w-4 h-4 text-blue-500" />
                                            <span className="truncate max-w-[150px]" title={sale.products?.name || sale.product_id}>
                                                {sale.products?.name || (sale.product_id ? String(sale.product_id).substring(0, 8) + '...' : 'N/A')}
                                            </span>
                                        </div>
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-4">
                                        {sale.status === 'approved' ? (
                                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                                                🟢 Aprovada
                                            </Badge>
                                        ) : sale.status === 'pending' ? (
                                            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                🟡 Aguardando Pagamento
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                                                🔴 Cancelada
                                            </Badge>
                                        )}
                                    </td>

                                    {/* GANHO LÍQUIDO DO VENDEDOR (Os 86%) */}
                                    <td className="p-4 text-right">
                                        <span className="text-green-400 font-bold text-base">
                                            + {Number(sale.seller_net || 0).toFixed(2)} MZN
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {/* Caso a lista esteja vazia */}
                            {sales.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        Nenhuma venda registrada ainda. Seus clientes aparecerão aqui!
                                    </td>
                                </tr>
                            )}
                            
                            {/* Caso esteja carregando */}
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        Carregando clientes...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
