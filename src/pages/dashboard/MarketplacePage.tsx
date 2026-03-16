import { useState, useEffect } from "react";
import { Search, ShoppingBag, Loader2, Tag, Handshake } from "lucide-react";
import { Button, Input, Card, Badge } from "../../components/ui/Primitives";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface MarketplacePageProps {
    isPublic?: boolean;
}

export const MarketplacePage = ({ isPublic = false }: MarketplacePageProps) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [priceRange] = useState<[number, number]>([0, 1000000]);
    const [selectedType, setSelectedType] = useState<string>("all");

    // Affiliation Modal State
    const [affiliateModalOpen, setAffiliateModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [affiliating, setAffiliating] = useState(false);

    useEffect(() => {
        fetchMarketplaceProducts();
    }, []);

    const fetchMarketplaceProducts = async () => {
        try {
            let query = supabase
                .from('products')
                .select('*')
                .eq('marketplace_visible', true)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching marketplace:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAffiliate = async () => {
        if (!selectedProduct) return;
        setAffiliating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não logado");

            const { error } = await supabase.from('affiliations').insert({
                affiliate_id: user.id,
                product_id: selectedProduct.id,
                commission_rate: selectedProduct.affiliate_commission || 0
            });

            if (error) {
                if (error.code === '42P01') { // undefined_table
                    alert("Afiliação simulada com sucesso! (Tabela 'affiliations' pendente no banco)");
                } else {
                    throw error;
                }
            } else {
                alert(`Parabéns! Você agora é afiliado do produto "${selectedProduct.name}"`);
            }
            setAffiliateModalOpen(false);
        } catch (error: any) {
            console.error("Affiliation error:", error);
            if (error.code === '23505') { // unique_violation
                alert("Você já é afiliado deste produto!");
                setAffiliateModalOpen(false);
            } else {
                alert("Erro ao se afiliar: " + error.message);
            }
        } finally {
            setAffiliating(false);
        }
    };

    // Client-side Filtering
    const filteredProducts = (products || []).filter(product => {
        if (!product) return false;

        const productName = product.name || "";
        const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const price = Number(product.price) || 0;
        const offerPrice = product.offer_price ? Number(product.offer_price) : undefined;
        const finalPrice = offerPrice || price;

        const isHighTicket = price > 5000;
        const matchesCategory = selectedCategory === "all" ||
            (selectedCategory === "highticket" && isHighTicket) ||
            (selectedCategory === "lowticket" && !isHighTicket);

        const withinPrice = finalPrice >= priceRange[0] && finalPrice <= priceRange[1];

        const matchesType = selectedType === "all" || product.delivery_type === selectedType;

        return matchesSearch && matchesCategory && withinPrice && matchesType;
    });

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl font-black tracking-tight mb-2">Encontre o produto ideal.</h1>
                    <p className="text-muted-foreground text-lg mb-6">
                        Explore o marketplace, promova produtos vencedores e ganhe comissões ou compre ferramentas para escalar seu negócio.
                    </p>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar produtos, ferramentas, serviços..."
                            className="pl-12 h-14 rounded-2xl bg-background/80 backdrop-blur-sm border-2 focus-visible:ring-offset-0 focus-visible:border-primary text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                {/* Decoration Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl translate-y-1/2" />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
                    <Card className="p-5 space-y-6 sticky top-24">
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Categorias</h3>
                            <div className="space-y-2">
                                {['all', 'highticket', 'lowticket'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                                    >
                                        {cat === 'all' && 'Todas as Categorias'}
                                        {cat === 'highticket' && 'High Ticket (> 5k)'}
                                        {cat === 'lowticket' && 'Low Ticket (< 5k)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                            <h3 className="font-semibold mb-3">Formato</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                    <input type="radio" name="format" checked={selectedType === 'all'} onChange={() => setSelectedType('all')} /> Todos
                                </label>
                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                    <input type="radio" name="format" checked={selectedType === 'file'} onChange={() => setSelectedType('file')} /> Arquivo (PDF/Ebook)
                                </label>
                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                    <input type="radio" name="format" checked={selectedType === 'link'} onChange={() => setSelectedType('link')} /> Curso / Link
                                </label>
                            </div>
                        </div>
                    </Card>
                </aside>

                {/* Grid */}
                <div className="flex-1">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">Nenhum produto encontrado</h3>
                            <p className="text-muted-foreground">Tente ajustar seus filtros de busca.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => {
                                const productName = product.name || "Produto sem nome";
                                const price = Number(product.price) || 0;
                                const offerPrice = product.offer_price ? Number(product.offer_price) : undefined;
                                const finalPrice = offerPrice || price;

                                return (
                                    <div
                                        key={product.id}
                                        className="group glass-panel rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300 flex flex-col h-full animate-in fade-in duration-500 border-green-500/10 hover:border-green-500/50"
                                    >
                                        {/* Cover */}
                                        <div className="aspect-video bg-muted relative overflow-hidden">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={productName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-muted-foreground/20 bg-gradient-to-br from-muted to-muted/50">
                                                    {productName.charAt(0)}
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                {product.delivery_type === 'file' && (
                                                    <Badge variant="secondary" className="bg-black/70 backdrop-blur text-white border-none shadow-sm">
                                                        ⚡ Entrega Imediata
                                                    </Badge>
                                                )}
                                                {product.delivery_type === 'link' && (
                                                    <Badge variant="secondary" className="bg-blue-600/90 text-white border-none shadow-sm">
                                                        🎓 Área de Membros
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg leading-tight line-clamp-1" title={productName}>{productName}</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                                {product.description || "Sem descrição disponível para este produto."}
                                            </p>

                                            {/* Price & Actions */}
                                            <div className="border-t pt-4 mt-auto">
                                                <div className="flex items-end justify-between mb-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">Preço</span>
                                                        <div className="flex flex-col items-end">
                                                            {offerPrice && offerPrice < price ? (
                                                                <>
                                                                    <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                                                                        {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(price)}
                                                                    </span>
                                                                    <span className="font-bold text-xl text-green-600 animate-pulse">
                                                                        {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(finalPrice)}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="font-bold text-xl text-green-600">
                                                                    {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(finalPrice)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {product.enable_affiliates && (
                                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
                                                            Comissão {product.affiliate_commission}%
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <Link to={product.sales_page_url || `/checkout/${product.id}`} target={product.sales_page_url ? "_blank" : "_self"} className={product.enable_affiliates ? "" : "col-span-2"}>
                                                        <Button className="w-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                                            Comprar
                                                        </Button>
                                                    </Link>

                                                    {!isPublic && product.enable_affiliates && (
                                                        <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setAffiliateModalOpen(true);
                                                            }}
                                                        >
                                                            <Handshake className="w-4 h-4 mr-2" />
                                                            Promover
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Affiliate Modal */}
            {affiliateModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                                <Handshake className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Afiliar-se a {selectedProduct.name}</h2>
                            <p className="text-muted-foreground mb-6">
                                Ao se afiliar, você receberá um link único. Para cada venda realizada através dele, você ganha:
                            </p>

                            <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-border/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Preço do Produto</span>
                                    <span className="font-bold">{new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(selectedProduct.offer_price || selectedProduct.price)}</span>
                                </div>
                                <div className="flex justify-between items-center text-purple-600">
                                    <span className="text-sm font-medium">Sua Comissão ({selectedProduct.affiliate_commission}%)</span>
                                    <span className="font-bold">
                                        {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(
                                            ((selectedProduct.offer_price || selectedProduct.price) * (selectedProduct.affiliate_commission || 0)) / 100
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAffiliate} disabled={affiliating}>
                                    {affiliating ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirmar Afiliação"}
                                </Button>
                                <Button variant="ghost" className="w-full" onClick={() => setAffiliateModalOpen(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
