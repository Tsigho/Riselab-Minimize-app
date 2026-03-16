import { useState, useEffect } from "react";
import { Card, Button, Input, Label, Badge } from "../../components/ui/Primitives";
import { Wallet, ArrowUpRight, History, AlertCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

// Mock Data for consistent UI before DB connection or empty state
const MOCK_WITHDRAWALS: any[] = [];

export const FinancialPage = () => {
    const [balance, setBalance] = useState({ available: 0, pending: 0 });
    const [withdrawals, setWithdrawals] = useState(MOCK_WITHDRAWALS);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("mpesa");
    const [number, setNumber] = useState("");

    // Fetch real data
    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Approved Sales logic
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('seller_net')
                .eq('seller_id', user.id)
                .eq('status', 'approved');

            const { data: withdrawalsData, error: withdrawalsError } = await supabase
                .from('withdrawals')
                .select('amount, status')
                .eq('vendor_id', user.id);

            if (salesError || withdrawalsError) throw Error("Error fetching data");

            // Compute Total Earned
            const totalEarned = salesData?.reduce((acc, curr) => acc + (Number(curr.seller_net) || 0), 0) || 0;
            const totalWithdrawn = withdrawalsData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
            const computedAvailable = totalEarned - totalWithdrawn;

            setBalance({
                available: computedAvailable > 0 ? computedAvailable : 0, 
                pending: 0 // Modify if you track pending withdrawals strictly
            });
            // Update UI list for withdrawals
            // Example mapping: setWithdrawals(withdrawalsData || []);
        } catch (error) {
            console.error("Erro ao buscar dados financeiros:", error);
        }
    };

    const handleWithdraw = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Usuário não autenticado");
                return;
            }

            await supabase.from('withdrawals').insert([{
                vendor_id: user.id,
                amount: Number(amount),
                phone_number: number
            }]);

            alert("Pedido de saque enviado para a administração!");

            setShowModal(false);
            setAmount("");
            
            const newWithdrawal = {
                id: Math.random().toString(),
                amount: Number(amount),
                method: method === 'mpesa' ? 'M-Pesa' : 'E-Mola',
                status: 'pending',
                date: new Date().toISOString().split('T')[0],
                number
            };
            setWithdrawals([newWithdrawal as any, ...withdrawals]);
            setBalance(prev => ({ ...prev, pending: prev.pending + Number(amount), available: prev.available - Number(amount) }));
        } catch (error: any) {
            alert("Erro ao solicitar saque: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Financeiro</h1>
                    <p className="text-muted-foreground">Gerencie seus ganhos e solicite saques.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                    <Wallet className="w-4 h-4 mr-2" />
                    Solicitar Saque
                </Button>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-green-600/20 to-green-900/40 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl backdrop-blur-sm border border-green-500/30">
                            <Wallet className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-100">Saldo Disponível</p>
                            <h3 className="text-2xl font-bold text-white">{formatCurrency(balance.available)}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 glass-panel">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <History className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Em Processamento</p>
                            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(balance.pending)}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 glass-panel">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <ArrowUpRight className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Sacado</p>
                            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(0)}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Withdrawals Table */}
            <Card className="overflow-hidden glass-panel">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-semibold text-lg">Histórico de Saques</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-muted-foreground font-medium border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Método</th>
                                <th className="px-6 py-4">Detalhes</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {withdrawals.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium">{item.date}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <Badge variant="outline" className="bg-white/5 border-white/10">{item.method}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{item.number}</td>
                                    <td className="px-6 py-4 font-semibold">{formatCurrency(item.amount)}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline"
                                            className={`capitalize border-0 ${item.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                                item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-400'
                                                }`}
                                        >
                                            {item.status === 'paid' ? 'Pago' : item.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Withdrawal Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 bg-background shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">✕</button>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wallet className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Solicitar Saque</h2>
                            <p className="text-sm text-muted-foreground">O valor será enviado para sua conta móvel.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Valor (MZN)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-lg font-bold"
                                />
                                <p className="text-xs text-muted-foreground flex justify-between">
                                    <span>Disponível: {formatCurrency(balance.available)}</span>
                                    {Number(amount) > balance.available && <span className="text-red-500">Saldo insuficiente</span>}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Método de Recebimento</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setMethod('mpesa')}
                                        className={`p-3 border rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all ${method === 'mpesa' ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' : 'hover:bg-accent'}`}
                                    >
                                        <span className="font-bold">M-Pesa</span>
                                    </div>
                                    <div
                                        onClick={() => setMethod('emola')}
                                        className={`p-3 border rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all ${method === 'emola' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'hover:bg-accent'}`}
                                    >
                                        <span className="font-bold">E-Mola</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Número de Telefone</Label>
                                <Input
                                    placeholder="84/85 xxx xxxx"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                />
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start border border-blue-100">
                                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700">O saque geralmente é processado em até 24 horas úteis. Taxa de saque: 3%.</p>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={!amount || Number(amount) > balance.available || !number || loading}
                            onClick={handleWithdraw}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Confirmar Solicitação'}
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
};
