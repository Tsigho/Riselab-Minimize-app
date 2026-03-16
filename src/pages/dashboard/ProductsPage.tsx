import { useState, useEffect } from "react";
import { Plus, Search, Filter, Loader2, Trash } from "lucide-react";
import { Button, Input, Badge } from "../../components/ui/Primitives";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { deleteProduct } from "../../lib/api/products";

export const ProductsPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert("Erro ao excluir produto");
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meus Motores de Vendas</h1>
                    <p className="text-muted-foreground">Gerencie seus produtos, funis e ofertas.</p>
                </div>
                <Link to="/dashboard/products/new">
                    <Button className="shadow-lg hover:shadow-primary/25">
                        <Plus className="w-5 h-5 mr-2" />
                        Criar Novo Produto
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar produtos..." className="pl-9" />
                </div>
                <Button variant="outline" size="md">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </Button>
            </div>

            {/* Product List */}
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-card/50">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Você ainda não tem produtos</h3>
                    <p className="text-muted-foreground mb-6">Crie seu primeiro motor de vendas agora.</p>
                    <Link to="/dashboard/products/new">
                        <Button>
                            Começar Agora
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="group relative glass-panel rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300 border-green-500/10 hover:border-green-500/50 cursor-pointer flex flex-col h-full">
                            <div className="aspect-video bg-muted relative overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-4xl">
                                        IMG
                                    </div>
                                )}

                                {product.marketplace_visible && (
                                    <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded shadow-sm backdrop-blur-sm">
                                        Marketplace
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 flex items-center gap-2">
                                    <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/10">
                                        0 Vendas
                                    </div>
                                    <button
                                        className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (confirm("Tem certeza que deseja excluir este produto?")) {
                                                handleDelete(product.id);
                                            }
                                        }}
                                        title="Excluir"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold truncate pr-2 flex-1" title={product.name}>{product.name}</h3>
                                    <div className="flex flex-col items-end">
                                        {product.offer_price && product.offer_price < product.price && (
                                            <span className="text-xs text-muted-foreground line-through">MT {product.price}</span>
                                        )}
                                        <span className="text-sm font-bold text-primary whitespace-nowrap">
                                            MT {product.offer_price || product.price}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5">
                                    {product.status === 'approved' ? (
                                        <div className="flex flex-col gap-2">
                                            <Badge className="bg-green-500/20 text-green-400 w-fit">🟢 Aprovado</Badge>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => window.open(`${window.location.origin}/checkout/${product.id}`, '_blank')}
                                            >
                                                🔗 Ver Link de Venda
                                            </Button>
                                        </div>
                                    ) : product.status === 'rejected' ? (
                                        <div className="flex flex-col gap-2">
                                            <Badge className="bg-red-500/20 text-red-400 w-fit mb-1">🔴 Rejeitado (Veja Recomendações)</Badge>
                                            {product.admin_feedback && (
                                                <div className="text-xs text-red-300 bg-red-500/10 p-2 rounded mb-1">{product.admin_feedback}</div>
                                            )}
                                            <Button size="sm" onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}>
                                                ✏️ Corrigir Produto
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <Badge className="bg-amber-500/20 text-amber-400 w-fit">🟡 Aguardando Aprovação</Badge>
                                            <Button size="sm" variant="ghost" disabled>
                                                Link será gerado após aprovação
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}>
                                                ✏️ Editar Detalhes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
