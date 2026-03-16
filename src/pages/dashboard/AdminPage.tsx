import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ShieldAlert, Trash2, Package, Loader2, AlertOctagon, TrendingUp, DollarSign, CheckCircle, XCircle, ListOrdered, Wallet, User, Mail, Phone, ShoppingBag, Calendar, Eye } from "lucide-react";
import { Button, Card, Badge } from "../../components/ui/Primitives";
import { Link, useNavigate } from "react-router-dom";

export const AdminPage = () => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState('aprovacoes'); // Já abri na aba de aprovações por padrão
    
    // Dados do Banco
    const [products, setProducts] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🚀 NOVO: Estados para a Janela de Análise de Raio-X
    const [viewingProduct, setViewingProduct] = useState<any>(null);
    const [feedbackText, setFeedbackText] = useState("");

    // Taxas e Finanças globais
    const [taxaPlataforma] = useState(14);
    const [taxaGateway] = useState(6);
    const [totalVendido, setTotalVendido] = useState(0);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/");
                return;
            }

            if (user.email === 'vendastsigho@gmail.com') {
                setIsAdmin(true);
                fetchPlatformData();
                return; 
            }

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

            if (profile?.role === 'admin') {
                setIsAdmin(true);
                fetchPlatformData();
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        } catch (error) {
            setIsAdmin(false);
            setLoading(false);
        }
    };

    const fetchPlatformData = async () => {
        const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (prodData) setProducts(prodData);

        const { data: salesData } = await supabase.from('sales').select('*, products(name)').order('created_at', { ascending: false });
        if (salesData) {
            setSales(salesData);
            setTotalVendido(salesData.reduce((acc, curr) => acc + Number(curr.amount), 0));
        }

        const { data: withData } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
        if (withData) setWithdrawals(withData);

        setLoading(false);
    };

    // 🚀 NOVO: APROVAR OU REJEITAR PRODUTOS COM FEEDBACK!
    const handleProductStatus = async (productId: string, status: 'approved' | 'rejected', feedbackMessage?: string) => {
        const isVisible = status === 'approved';
        await supabase.from('products').update({ 
            status: status, 
            marketplace_visible: isVisible,
            admin_feedback: feedbackMessage || null
        }).eq('id', productId);

        setProducts(products.map(p => p.id === productId ? { ...p, status, marketplace_visible: isVisible, admin_feedback: feedbackMessage } : p));
        setViewingProduct(null); // Fecha a janela de análise
        setFeedbackText("");     // Limpa o texto
        alert(status === 'approved' ? "Produto Aprovado e publicado!" : "Recomendação enviada ao vendedor!");
    };

    const handleDeleteProduct = async (productId: string, fileUrl: string) => {
        if (!window.confirm("Certeza que quer banir este produto? Ele será apagado do sistema.")) return;
        try {
            if (fileUrl && fileUrl.includes('supabase.co')) {
                const path = fileUrl.split('/').pop();
                if (path) await supabase.storage.from('product-files').remove([path]);
            }
            await supabase.from('products').delete().eq('id', productId);
            setProducts(products.filter(p => p.id !== productId));
        } catch (error: any) {
            alert("Erro ao deletar: " + error.message);
        }
    };

    const handleWithdrawalStatus = async (withdrawalId: string, status: 'approved' | 'rejected') => {
        await supabase.from('withdrawals').update({ status }).eq('id', withdrawalId);
        setWithdrawals(withdrawals.map(w => w.id === withdrawalId ? { ...w, status } : w));
        if (status === 'approved') alert("Saque marcado como PAGO! Certifique-se de ter transferido o dinheiro via M-Pesa/E-Mola.");
    };

    const handleWipeDatabase = async () => {
        if (window.prompt("Digite LIMPAR para apagar tudo:") === 'LIMPAR') {
            await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('withdrawals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            alert("Sistema limpo.");
            window.location.reload();
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    if (isAdmin === false) return <div className="min-h-screen bg-[#0b0811] flex items-center justify-center"><h1 className="text-white">Acesso Restrito</h1></div>;

    const pendingProducts = products.filter(p => p.status === 'pending');
    const approvedProducts = products.filter(p => p.status === 'approved');

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto text-white">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <ShieldAlert className="w-10 h-10 text-primary" />
                    <div>
                        <h1 className="text-3xl font-black">Sala de Controle RiseLab</h1>
                        <p className="text-slate-400">Visão Global da Plataforma</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 bg-[#12101b] p-1 rounded-xl border border-white/5">
                    <Button variant={activeTab === 'financas' ? 'primary' : 'ghost'} onClick={() => setActiveTab('financas')}><TrendingUp className="w-4 h-4 mr-2"/> Finanças</Button>
                    <Button variant={activeTab === 'aprovacoes' ? 'primary' : 'ghost'} onClick={() => setActiveTab('aprovacoes')}>
                        <CheckCircle className="w-4 h-4 mr-2"/> Aprovações {pendingProducts.length > 0 && <span className="ml-2 bg-red-500 text-white px-2 rounded-full text-xs">{pendingProducts.length}</span>}
                    </Button>
                    <Button variant={activeTab === 'saques' ? 'primary' : 'ghost'} onClick={() => setActiveTab('saques')}><Wallet className="w-4 h-4 mr-2"/> Saques</Button>
                    <Button variant={activeTab === 'transacoes' ? 'primary' : 'ghost'} onClick={() => setActiveTab('transacoes')}><ListOrdered className="w-4 h-4 mr-2"/> Transações</Button>
                    <Button variant={activeTab === 'produtos' ? 'primary' : 'ghost'} onClick={() => setActiveTab('produtos')}><Package className="w-4 h-4 mr-2"/> Catálogo</Button>
                </div>
            </div>

            {/* ABA: FINANÇAS */}
            {activeTab === 'financas' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in">
                    <Card className="p-6 bg-[#12101b] border-white/5"><p className="text-slate-400">Total Movimentado</p><p className="text-3xl font-bold">{totalVendido.toFixed(2)} MZN</p></Card>
                    <Card className="p-6 bg-[#12101b] border-green-500/30 shadow-[0_0_15px_rgba(0,181,116,0.1)]"><p className="text-green-400 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Lucro RiseLab ({(taxaPlataforma - taxaGateway)}%)</p><p className="text-3xl font-black text-green-500">{(totalVendido * ((taxaPlataforma - taxaGateway)/100)).toFixed(2)} MZN</p></Card>
                    <Card className="p-6 bg-[#12101b] border-white/5"><p className="text-blue-400">Repasse Vendedores ({(100 - taxaPlataforma)}%)</p><p className="text-2xl font-bold text-blue-500">{(totalVendido * ((100 - taxaPlataforma)/100)).toFixed(2)} MZN</p></Card>
                </div>
            )}

            {/* 🚀 ABA: APROVAÇÕES DE PRODUTOS (COM A JANELA DE ANÁLISE) */}
            {activeTab === 'aprovacoes' && (
                <Card className="p-6 bg-[#12101b] border-white/5 animate-in fade-in">
                    <h2 className="text-xl font-bold mb-6">Produtos Aguardando Aprovação</h2>
                    
                    {/* TABELA PRINCIPAL DE ESPERA */}
                    {!viewingProduct && (
                        <>
                            {pendingProducts.length === 0 ? <p className="text-slate-400">Nenhum produto na fila de análise.</p> : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-slate-400"><tr><th className="p-4">Produto</th><th className="p-4">Preço</th><th className="p-4 text-right">Ação</th></tr></thead>
                                    <tbody>
                                        {pendingProducts.map(p => (
                                            <tr key={p.id} className="border-b border-white/5">
                                                <td className="p-4 font-medium flex items-center gap-3">
                                                    <img src={p.image_url} alt="Capa" className="w-10 h-10 object-cover rounded" />
                                                    {p.name}
                                                </td>
                                                <td className="p-4 text-green-400 font-bold">{p.price} MZN</td>
                                                <td className="p-4 text-right">
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setViewingProduct(p)}>
                                                        <Eye className="w-4 h-4 mr-2" /> Analisar Detalhes
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {/* JANELA DE ANÁLISE DE RAIO-X (QUANDO O ADMIN CLICA NUM PRODUTO) */}
                    {viewingProduct && (
                        <div className="bg-[#0b0811] p-6 rounded-xl border border-white/10 animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                <h3 className="text-2xl font-bold text-white">Análise de Produto</h3>
                                <Button variant="ghost" onClick={() => { setViewingProduct(null); setFeedbackText(""); }}>Voltar à Lista</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Coluna da Esquerda: Detalhes do Produto */}
                                <div className="space-y-4 text-slate-300 text-sm">
                                    <img src={viewingProduct.image_url} alt="Capa" className="w-full h-48 object-cover rounded-xl border border-white/10 mb-4" />
                                    <p><strong className="text-white">Nome:</strong> {viewingProduct.name}</p>
                                    <p><strong className="text-white">Preço:</strong> <span className="text-green-400 font-bold">{viewingProduct.price} MZN</span></p>
                                    <p><strong className="text-white">Descrição:</strong> {viewingProduct.description || 'Nenhuma descrição fornecida.'}</p>
                                    <p><strong className="text-white">Tipo de Entrega:</strong> {viewingProduct.delivery_type}</p>
                                    
                                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mt-4">
                                        <p className="font-bold text-primary mb-2">Ficheiro do Cliente (Para Análise)</p>
                                        <a href={viewingProduct.file_url || viewingProduct.download_url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-2">
                                            🔗 Clique aqui para baixar e visualizar o ficheiro (PDF/Link)
                                        </a>
                                    </div>
                                </div>

                                {/* Coluna da Direita: Decisão e Feedback */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Decisão e Resposta ao Vendedor</h4>
                                    <p className="text-xs text-slate-400 mb-2">Se houver algo errado, escreva abaixo e clique em "Rejeitar". O vendedor verá isto no seu painel.</p>
                                    <textarea 
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
                                        placeholder="Ex: A capa do livro está com baixa qualidade. Por favor, substitua a imagem e corrija a descrição..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                    />

                                    <div className="flex flex-col gap-3 mt-4">
                                        <Button 
                                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
                                            onClick={() => handleProductStatus(viewingProduct.id, 'approved', feedbackText)}
                                        >
                                            <CheckCircle className="w-5 h-5 mr-2"/> APROVAR E PUBLICAR NA LOJA
                                        </Button>
                                        
                                        <Button 
                                            variant="destructive" 
                                            className="w-full h-12 font-bold"
                                            onClick={() => {
                                                if(!feedbackText) return alert("Por favor, escreva o motivo para o vendedor saber o que corrigir!");
                                                handleProductStatus(viewingProduct.id, 'rejected', feedbackText);
                                            }}
                                        >
                                            <XCircle className="w-5 h-5 mr-2"/> REJEITAR / PEDIR ALTERAÇÕES
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* ABA: SAQUES */}
            {activeTab === 'saques' && (
                <Card className="p-6 bg-[#12101b] border-white/5 animate-in fade-in">
                    <h2 className="text-xl font-bold mb-6">Pedidos de Saque</h2>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-400"><tr><th className="p-4">Vendedor ID</th><th className="p-4">Valor</th><th className="p-4">Telefone (M-Pesa/E-Mola)</th><th className="p-4">Status</th><th className="p-4 text-right">Ação</th></tr></thead>
                        <tbody>
                            {withdrawals.map(w => (
                                <tr key={w.id} className="border-b border-white/5">
                                    <td className="p-4 text-xs text-slate-500">{w.vendor_id.substring(0,8)}...</td>
                                    <td className="p-4 text-green-400 font-bold">{w.amount} MZN</td>
                                    <td className="p-4 font-mono text-amber-400">{w.phone_number}</td>
                                    <td className="p-4">
                                        {w.status === 'pending' ? <Badge className="bg-amber-500/20 text-amber-500">Pendente</Badge> : w.status === 'approved' ? <Badge className="bg-green-500/20 text-green-500">Pago</Badge> : <Badge className="bg-red-500/20 text-red-500">Rejeitado</Badge>}
                                    </td>
                                    <td className="p-4 text-right">
                                        {w.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" className="bg-green-600" onClick={() => handleWithdrawalStatus(w.id, 'approved')}>Marcar Pago</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleWithdrawalStatus(w.id, 'rejected')}>Recusar</Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* ABA: TRANSAÇÕES (RAIO-X DO ADMIN COM DADOS DOS CLIENTES) */}
            {activeTab === 'transacoes' && (
                <Card className="p-6 bg-[#12101b] border-white/5 animate-in fade-in">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <ListOrdered className="w-6 h-6 text-primary" />
                        Histórico Global de Vendas
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 text-slate-400">
                                <tr>
                                    <th className="p-4 rounded-tl-lg font-medium">Data</th>
                                    <th className="p-4 font-medium">Cliente (Comprador)</th>
                                    <th className="p-4 font-medium">Produto & Vendedor</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 rounded-tr-lg text-right font-medium">Valores</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map(s => (
                                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                {new Date(s.created_at).toLocaleDateString('pt-MZ')}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-white font-medium">
                                                <User className="w-4 h-4 text-primary" /> {s.customer_name || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 ml-6">
                                                <Phone className="w-3 h-3 text-green-500" /> {s.customer_phone || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-white font-medium">
                                                <ShoppingBag className="w-4 h-4 text-blue-500" />
                                                <span className="truncate max-w-[150px]" title={s.products?.name}>{s.products?.name || 'Produto Removido'}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 ml-6">Vendedor: {s.seller_id?.substring(0,8)}...</div>
                                        </td>
                                        <td className="p-4">
                                            {s.status === 'approved' ? <Badge className="bg-green-500/20 text-green-500">Aprovada</Badge> : <Badge className="bg-amber-500/20 text-amber-500">Pendente</Badge>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-black text-white text-base">{Number(s.amount).toFixed(2)}</div>
                                            <div className="text-xs mt-1 text-green-400">Vendedor: +{Number(s.seller_net).toFixed(2)}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* ABA: CATÁLOGO DE PRODUTOS APROVADOS */}
            {activeTab === 'produtos' && (
                <Card className="p-6 bg-[#12101b] border-white/5 animate-in fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Catálogo Aprovado</h2>
                        <Button variant="destructive" onClick={handleWipeDatabase}><AlertOctagon className="w-4 h-4 mr-2"/> RESETAR BANCO</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 text-slate-400">
                                <tr>
                                    <th className="p-4 rounded-tl-lg">Produto</th>
                                    <th className="p-4">Preço (MZN)</th>
                                    <th className="p-4 rounded-tr-lg text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedProducts.map(product => (
                                    <tr key={product.id} className="border-b border-white/5">
                                        <td className="p-4 font-medium text-white flex items-center gap-3">
                                            <img src={product.image_url} className="w-10 h-10 object-cover rounded" alt="capa" />
                                            {product.name}
                                        </td>
                                        <td className="p-4 text-green-400 font-bold">{product.price}</td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteProduct(product.id, product.file_url)}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Banir
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};