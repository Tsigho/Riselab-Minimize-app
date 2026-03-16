import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle, Smartphone, CreditCard } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// --- TIPO DO PRODUTO ---
interface Product {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
}

export function CheckoutPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // Estados do Formulário e Fluxo
    const [step, setStep] = useState<'checkout' | 'processing' | 'upsell' | 'success'>('checkout');
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola'>('mpesa');
    const [isBumpSelected, setIsBumpSelected] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const orderBumpProduct = {
        name: "Pack de 500 Templates Editáveis",
        price: 250,
        description: "Adicione por apenas 250 MT e economize horas de design."
    };

    const upsellProduct = {
        name: "Mentoria VIP Individual",
        price: 5000,
        originalPrice: 10000
    };

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            if (!productId) return;
            // Fetch real product from Supabase if ID is UUID, else mock for "1"
            if (productId.length > 5) {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single();

                if (data) setProduct(data);
            } else {
                // Fallback Mock for test IDs
                setProduct({
                    id: '1',
                    name: "Curso Mestre do Marketing Digital",
                    price: 1500,
                    description: "Acesso vitalício ao curso completo."
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const total = product ? (isBumpSelected ? product.price + orderBumpProduct.price : product.price) : 0;

    const validate = () => {
        let tempErrors: any = {};
        const phoneRegex = /^(82|83|84|85|86|87)\d{7}$/;

        if (!formData.name) tempErrors.name = "Nome é obrigatório";
        if (!formData.phone.match(phoneRegex)) tempErrors.phone = "Número inválido (Ex: 841234567)";
        if (!formData.email || !formData.email.includes('@')) tempErrors.email = "Email inválido";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            window.alert("Por favor, corrija os erros no formulário.");
            return;
        }

        setStep('processing');

        // SIMULAÇÃO DE PAGAMENTO
        setTimeout(() => {
            setStep('upsell');
        }, 2000);
    };

    const handleUpsellDecision = (accepted: boolean) => {
        setStep('processing');
        setTimeout(() => {
            console.log(accepted ? "Upsell Comprado" : "Upsell Rejeitado");
            setStep('success');
        }, 1500);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Produto não encontrado.</div>;

    // 1. Tela de Upsell
    if (step === 'upsell') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-yellow-200">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-yellow-600 uppercase tracking-tight">Espere!</h2>
                        <p className="text-gray-600 mt-2 font-medium">Seu pedido principal foi confirmado ✅</p>
                        <div className="w-full h-2 bg-gray-100 mt-4 rounded-full overflow-hidden">
                            <div className="w-2/3 h-full bg-yellow-500 animate-pulse"></div>
                        </div>
                        <p className="text-xs text-yellow-600 mt-2 font-semibold">Oferta especial expira em breve...</p>
                    </div>

                    <div className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-100 mb-8">
                        <h3 className="text-xl font-bold text-gray-900">{upsellProduct.name}</h3>
                        <p className="text-gray-600 text-sm mt-2">Acelere seus resultados.</p>
                        <div className="mt-4 flex items-center justify-center gap-3">
                            <span className="text-gray-400 line-through text-sm">MT {upsellProduct.originalPrice}</span>
                            <span className="text-2xl font-bold text-green-600">MT {upsellProduct.price}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleUpsellDecision(true)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-green-200 transition-all transform hover:scale-[1.02]"
                        >
                            SIM! Adicionar ao meu pedido
                        </button>

                        <button
                            onClick={() => handleUpsellDecision(false)}
                            className="w-full bg-transparent text-gray-400 text-sm hover:text-gray-600 transition-colors py-2 underline-offset-4 hover:underline"
                        >
                            Não obrigado
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Tela de Sucesso
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
                    <div className="inline-flex bg-green-100 p-4 rounded-full mb-6 ring-8 ring-green-50">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Pagamento Confirmado!</h2>
                    <p className="text-gray-500 mt-3 leading-relaxed">Enviamos os detalhes para <strong>{formData.email}</strong>.</p>
                    <button onClick={() => window.location.href = '/'} className="mt-8 w-full border border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    // 3. Tela Principal (Checkout)
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

                        <div>
                            <input
                                type="text"
                                placeholder="Nome Completo"
                                className={`w-full bg-white border ${errors.name ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 shadow-sm`}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">{errors.name}</span>}
                        </div>

                        <div>
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
                            {errors.phone && <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">{errors.phone}</span>}
                        </div>

                        <div>
                            <input
                                type="email"
                                placeholder="Seu melhor Email"
                                className={`w-full bg-white border ${errors.email ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 shadow-sm`}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            {errors.email && <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">{errors.email}</span>}
                        </div>
                    </div>

                    {/* ORDER BUMP */}
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
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{orderBumpProduct.description}</p>
                                <p className="text-yellow-600 font-bold text-sm mt-1.5">+ MT {orderBumpProduct.price}</p>
                            </div>
                        </div>
                    </div>

                    {/* Método de Pagamento */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mb-3">Forma de Pagamento</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('mpesa')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${paymentMethod === 'mpesa' ? 'bg-red-50 border-red-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-100 hover:border-red-100 text-gray-400'}`}
                            >
                                <Smartphone className={`w-6 h-6 ${paymentMethod === 'mpesa' ? 'text-red-500' : 'text-gray-300'}`} />
                                <span className={`text-sm font-bold ${paymentMethod === 'mpesa' ? 'text-red-900' : 'text-gray-400'}`}>M-Pesa</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('emola')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${paymentMethod === 'emola' ? 'bg-purple-50 border-purple-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-100 hover:border-purple-100 text-gray-400'}`}
                            >
                                <CreditCard className={`w-6 h-6 ${paymentMethod === 'emola' ? 'text-purple-500' : 'text-gray-300'}`} />
                                <span className={`text-sm font-bold ${paymentMethod === 'emola' ? 'text-purple-900' : 'text-gray-400'}`}>E-Mola</span>
                            </button>
                        </div>
                    </div>

                    {/* Botão Final */}
                    <button
                        type="submit"
                        disabled={step === 'processing'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {step === 'processing' ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processando...
                            </div>
                        ) : (
                            <>
                                <Lock className="w-5 h-5 opacity-80" /> Pagar MT {total}
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5 bg-gray-100/50 py-2 rounded-lg">
                            <ShieldCheck className="w-3 h-3 text-green-500" />
                            Pagamento processado com segurança de nível bancário
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
}
