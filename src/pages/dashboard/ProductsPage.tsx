import { useState, useEffect } from "react";
import { Plus, Search, Filter, Loader2, Trash } from "lucide-react";
import { Button, Input } from "../../components/ui/Primitives";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { deleteProduct } from "../../lib/api/products";

export const ProductsPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/10">
                                    0 Vendas
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

                                <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    {product.is_active ? 'Ativo' : 'Rascunho'}
                                    {product.enable_affiliates && (
                                        <span className="ml-auto text-blue-500 font-medium bg-blue-500/10 px-1.5 py-0.5 rounded">Afiliados {product.affiliate_commission}%</span>
                                    )}
                                </div>
                            </div>

                            {/* Hover Action */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex gap-2">
                                <Link to={`/dashboard/products/edit/${product.id}`} className="w-full">
                                    <Button size="sm" className="w-full bg-white text-black hover:bg-white/90 font-medium shadow-lg">Editar</Button>
                                </Link>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="w-12 bg-red-500/80 hover:bg-red-600 text-white backdrop-blur-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm("Tem certeza que deseja excluir este produto?")) {
                                            handleDelete(product.id);
                                        }
                                    }}
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                                <Link to={`/checkout/${product.id}`} className="w-full">
                                    <Button size="sm" variant="outline" className="w-full border-white/30 text-white hover:bg-white/20 font-medium backdrop-blur-sm">Ver</Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
