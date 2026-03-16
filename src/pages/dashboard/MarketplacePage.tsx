import { useState, useEffect } from "react";
import { Search, ShoppingBag, Loader2, Tag, Handshake, ShoppingCart, AlertCircle } from "lucide-react";
import { Button, Input, Card, Badge } from "../../components/ui/Primitives";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export const MarketplacePage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchMarketplaceProducts();
    }, []);

    const fetchMarketplaceProducts = async () => {
        try {
            // 🚀 FILTRO MONSTRO: Só mostra o que o Admin deu OK
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'approved') // 🟢 BARREIRA 1
                .eq('marketplace_visible', true) // 🟢 BARREIRA 2
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Erro ao carregar vitrine:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleComprarPaySuite = async (product: any) => {
        const numeroCliente = window.prompt("Para prosseguir com o pagamento, digite o seu número do M-Pesa ou E-Mola (Ex: 841234567):");
        
        if (!numeroCliente || numeroCliente.length < 9) {
            alert("Número inválido. Compra cancelada.");
            return;
        }

        const nomeCliente = window.prompt("Qual é o seu nome?") || "Cliente Anônimo";

        alert("A preparar o seu pedido... Aguarde.");

        try {
            // 1. REGISTRA A VENDA COMO PENDENTE 🚀
            const { data: saleData, error: saleError } = await supabase.from('sales').insert([{
                product_id: product.id,
                seller_id: product.user_id,
                amount: product.price,
                platform_fee: product.price * 0.14,
                seller_net: product.price * 0.86,
                customer_name: nomeCliente,
                customer_phone: numeroCliente,
                status: 'pending' 
            }]).select().single();

            if (saleError) throw saleError;

            // 2. CHAMA O MOTOR NO RENDER
            const payload = {
                customer_name: nomeCliente,
                customer_email: "cliente@riselab.com",
                phone: numeroCliente,
                amount: product.price,
                channel: numeroCliente.startsWith('84') || numeroCliente.startsWith('85') ? 'MPESA' : 'EMOLA',
                reference: `REF-${saleData.id.substring(0,8)}`,
                
                // 3. RETORNO INTELIGENTE
                return_url: `${window.location.origin}/checkout-success?saleId=${saleData.id}&link=${encodeURIComponent(product.file_url || product.download_url || '#')}`
            };

            const response = await fetch("https://risilabteste.onrender.com/api/pagar-paysuite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success && result.data.payment_url) {
                window.location.href = result.data.payment_url;
            } else {
                alert("Erro na PaySuite. Verifique se o seu servidor no Render está Online.");
            }

        } catch (error) {
            console.error("Erro no checkout:", error);
            alert("Erro de conexão com o servidor de pagamentos.");
        }
    };

    const filteredProducts = products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Marketplace <span className="text-primary">RiseLab</span></h1>
                <Input 
                    placeholder="O que você deseja aprender hoje?" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="max-w-md bg-white/5 border-white/10 text-white"
                />
            </div>

            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-3xl">
                    <ShoppingBag className="w-16 h-16 text-white/10 mb-4" />
                    <p className="text-slate-500 text-lg">Nenhum produto aprovado disponível no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <Card key={product.id} className="group p-4 flex flex-col h-full bg-[#12101b] border-white/5 hover:border-primary/50 transition-all duration-300 shadow-2xl">
                            <div className="relative overflow-hidden rounded-xl mb-4">
                                <img src={product.image_url} className="h-48 w-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border-white/10 text-white font-bold">
                                    Digital
                                </Badge>
                            </div>
                            
                            <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">{product.name}</h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{product.description || 'Sem descrição.'}</p>
                            
                            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                <p className="text-green-400 font-black text-2xl tracking-tighter">
                                    {Number(product.price).toFixed(2)} <span className="text-xs font-medium">MT</span>
                                </p>
                                
                                <Button 
                                    onClick={() => handleComprarPaySuite(product)}
                                    className="bg-primary hover:bg-primary/80 text-black font-bold px-6 rounded-full"
                                >
                                    Comprar
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};