
import { useEffect, useState } from "react";
import { Search, Tag, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export const AffiliatesPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMarketplaceProducts();
    }, []);

    const fetchMarketplaceProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('marketplace_visible', true)
                .eq('is_active', true);

            if (data) setProducts(data);
            if (error) console.error("Error fetching marketplace:", error);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Painel de Afilhados</h1>
                <p className="text-muted-foreground">Encontre produtos incríveis para promover e ganhe comissões.</p>
            </div>

            <div className="flex items-center gap-4 glass-panel p-4 rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar produtos no marketplace..."
                        className="w-full h-10 pl-9 pr-4 rounded-md border border-white/10 bg-black/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    />
                </div>
                <div className="flex gap-2">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/30">Todos</span>
                    <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-green-500/10 hover:text-green-400 transition-colors border border-white/5">Populares</span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {products.length === 0 ? (
                        <div className="col-span-4 text-center py-12 text-muted-foreground">
                            Nenhum produto encontrado no marketplace.
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="group glass-panel rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all hover:-translate-y-1 border-green-500/10 hover:border-green-500/50">
                                <div className="h-40 bg-muted flex items-center justify-center relative overflow-hidden">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Tag className="w-12 h-12 text-muted-foreground/30" />
                                    )}
                                </div>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Comissão</p>
                                            <p className="text-sm font-bold text-green-600">
                                                {product.affiliate_commission
                                                    ? `${product.affiliate_commission}%`
                                                    : '0%'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Preço</p>
                                            <p className="text-sm font-medium">MT {product.price}</p>
                                        </div>
                                    </div>

                                    <button className="w-full mt-2 h-9 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                                        <ExternalLink className="w-3 h-3" />
                                        Afiliar-se Agora
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
