import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle, Smartphone } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// --- TIPO DO PRODUTO ---
interface Product {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    user_id?: string;
    file_url?: string;
    funnel_config?: any;
}

export function CheckoutPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // Estados do Formulário e Fluxo
    const [step, setStep] = useState<'checkout' | 'processing'>('checkout');
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [isBumpSelected, setIsBumpSelected] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            if (!productId) return;
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (data) {
                setProduct(data);
            } else {
                console.error("Produto não encontrado");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const orderBumpPrice = product?.funnel_config?.orderBump?.price || 250;
    const total = product ? (isBumpSelected ? Number(product.price) + Number(orderBumpPrice) : Number(product.price)) : 0;

    const validate = () => {
        let tempErrors: any = {};
        const phoneRegex = /^(82|83|84|85|86|87)\d{7}$/;

        if (!formData.name) tempErrors.name = "Nome é obrigatório";
        if (!formData.phone.match(phoneRegex)) tempErrors.phone = "Número inválido (Ex: 841234567)";
        if (!formData.email || !formData.email.includes('@')) tempErrors.email = "Email inválido";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        setStep('processing');

        try {
            if (!product) return;

            // 1. Criamos a venda pendente no Supabase para rastreio
            const { data: sale, error: saleError } = await supabase.from('sales').insert([{
                product_id: product.id,
                seller_id: product.user_id,
                amount: total,
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_email: formData.email,
                status: 'pending'
            }]).select().single();

            if (saleError) throw saleError;

            // Detecta o canal automaticamente pelo número
            const canal = (formData.phone.startsWith('84') || formData.phone.startsWith('85')) ? 'MPESA' : 'EMOLA';

            // 2. Chamamos o Render para gerar o link da PaySuite 🚀
            const response = await fetch("https://risilabteste.onrender.com/api/pagar-paysuite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_name: formData.name,
                    customer_email: formData.email,
                    phone: formData.phone,
                    amount: total,
                    channel: canal,
                    reference: `REF-${sale.id.substring(0,8)}`,
                    // O retorno leva o link do arquivo para a página de sucesso
                    return_url: `${window.location.origin}/checkout-success?saleId=${sale.id}&link=${encodeURIComponent(product.file_url || '#')}`
                })
            });

            const result = await response.json();
            
            if (result.success && result.data.payment_url) {
                // 3. Redirecionamento Direto para a PaySuite
                window.location.href = result.data.payment_url;
            } else {
                alert("Erro ao conectar com a PaySuite. Verifique se o seu servidor Render está online.");
                setStep('checkout');
            }
        } catch (err) {
            console.error(err);
            alert("Ocorreu um erro ao processar o seu pagamento. Verifique sua conexão.");
            setStep('checkout');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Produto não encontrado.</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex justify-center py-10 px-4 font-sans selection:bg-blue-100">
            <div className="w-full max-w-lg">

                {/* Header Compacto */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Lock className="w-4 h-4" /> Pagamento Seguro
                    </div>
                    <div className="text-xs font-bold bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-500 uppercase tracking-wide">
                        Passo 1 de 2
                    </div>
                </div>

                {/* Resumo do Produto */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 bg-cover bg-center border border-gray-100" style={{ backgroundImage: `url(${product.image_url || 'https://via.placeholder.com/150'})` }}></div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">Acesso vitalício</p>
                        <p className="text-blue-600 font-bold mt-2 text-lg">MT {product.price}</p>
                    </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-6">

                    {/* Dados do Cliente */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Seus Dados</h4>

                        <input
                            type="text"
                            placeholder="Nome Completo"
                            className={`w-full bg-white border ${errors.name ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 shadow-sm`}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />

                        <div className="relative">
                            <span className="absolute left-4 top-4 text-gray-400 select-none font-medium">+258</span>
                            <input
                                type="tel"
                                placeholder="84 123 4567"
                                className={`w-full pl-16 bg-white border ${errors.phone ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 shadow-sm`}
                                maxLength={9}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <input
                            type="email"
                            placeholder="Seu melhor Email"
                            className={`w-full bg-white border ${errors.email ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 shadow-sm`}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* ORDER BUMP (OFERTA) - Só aparece se estiver ativo no produto */}
                    {product?.funnel_config?.orderBump?.enabled && (
                        <div
                            className={`border-2 border-dashed p-4 rounded-xl relative overflow-hidden cursor-pointer transition-all duration-200 ${isBumpSelected ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-300 hover:border-yellow-400/50'}`}
                            onClick={() => setIsBumpSelected(!isBumpSelected)}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isBumpSelected ? 'bg-yellow-500 border-yellow-500 shadow-sm' : 'border-gray-300 bg-white'}`}>
                                    {isBumpSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 text-sm leading-snug">SIM, quero adicionar esta oferta!</p>
                                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{product.funnel_config.orderBump.description}</p>
                                    <p className="text-yellow-600 font-bold text-sm mt-1.5">+ MT {orderBumpPrice}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-bold text-blue-900">Pagamento Automático</p>
                            <p className="text-xs text-blue-700">Canal detetado pelo número de telefone.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={step === 'processing'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {step === 'processing' ? "Processando..." : `Pagar MT ${total}`}
                    </button>

                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-green-500" /> Pagamento Seguro
                    </p>
                </form>
            </div>
        </div>
    );
}