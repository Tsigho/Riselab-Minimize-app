import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase"; // Ajuste o caminho
import { Wallet, Smartphone, DollarSign, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Card, Input } from "../../components/ui/Primitives"; // Ajuste o caminho

export const WithdrawRequest = () => {
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    
    // Novos estados para a Matemática Financeira
    const [availableBalance, setAvailableBalance] = useState<number>(0);
    const [calculating, setCalculating] = useState(true);

    useEffect(() => {
        calculateBalance();
    }, []);

    const calculateBalance = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Soma todo o ganho líquido (Os 86% do vendedor)
            const { data: sales } = await supabase
                .from('sales')
                .select('seller_net')
                .eq('seller_id', user.id);
            
            const totalEarned = sales ? sales.reduce((acc, curr) => acc + Number(curr.seller_net), 0) : 0;

            // 2. Soma todos os saques Aprovados E Pendentes (dinheiro já tirado ou travado na fila)
            const { data: withdrawals } = await supabase
                .from('withdrawals')
                .select('amount')
                .eq('vendor_id', user.id)
                .in('status', ['approved', 'pending']); // Ignora os 'rejected'
            
            const totalWithdrawn = withdrawals ? withdrawals.reduce((acc, curr) => acc + Number(curr.amount), 0) : 0;

            // 3. A Matemática final
            const saldoReal = totalEarned - totalWithdrawn;
            setAvailableBalance(saldoReal > 0 ? saldoReal : 0);

        } catch (error) {
            console.error("Erro ao calcular saldo:", error);
        } finally {
            setCalculating(false);
        }
    };

    const handleRequestWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const valorSaque = parseFloat(amount);

        // 🚨 VALIDAÇÕES DE SEGURANÇA (O Escudo)
        if (!valorSaque || valorSaque <= 0) {
            alert("Digite um valor válido para sacar.");
            return;
        }

        if (valorSaque > availableBalance) {
            alert(`Saldo insuficiente! O seu limite de saque atual é de ${availableBalance.toFixed(2)} MZN.`);
            return;
        }

        if (!phone || phone.length < 9) {
            alert("Digite um número de telefone válido (Ex: 84xxxxxxx ou 86xxxxxxx).");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // Envia o pedido para o Admin
            const { error } = await supabase.from('withdrawals').insert([{
                vendor_id: user.id,
                amount: valorSaque,
                phone_number: phone
            }]);

            if (error) throw error;

            setSucesso(true);
            setAmount("");
            setPhone("");
            
            // Atualiza o saldo na tela imediatamente, subtraindo o valor pedido
            setAvailableBalance(prev => prev - valorSaque);

            setTimeout(() => setSucesso(false), 5000);

        } catch (error: any) {
            alert("Erro ao solicitar saque: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-[#12101b] border-white/5 max-w-md">
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                    <Wallet className="w-6 h-6 text-green-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Solicitar Saque</h2>
                    <p className="text-sm text-slate-400">Transferência M-Pesa / E-Mola</p>
                </div>
            </div>

            {/* 💰 DISPLAY DO SALDO DISPONÍVEL */}
            <div className="bg-[#0b0811] border border-white/5 rounded-xl p-4 mb-6 flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Saldo Disponível</p>
                    {calculating ? (
                        <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                    ) : (
                        <p className="text-2xl font-black text-green-400">
                            {availableBalance.toFixed(2)} <span className="text-sm font-medium text-slate-500">MZN</span>
                        </p>
                    )}
                </div>
                <AlertCircle className="w-8 h-8 text-white/10" />
            </div>

            {sucesso ? (
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-400 font-bold">Pedido Enviado!</p>
                    <p className="text-sm text-green-500/80 mt-1">Aguarde a aprovação da administração.</p>
                </div>
            ) : (
                <form onSubmit={handleRequestWithdrawal} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Valor a Sacar (MZN)
                        </label>
                        <Input 
                            type="number" 
                            step="0.01"
                            max={availableBalance}
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="Ex: 1500" 
                            className="bg-white/5 border-white/10 text-white"
                            disabled={availableBalance <= 0 || calculating}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Smartphone className="w-4 h-4" /> Conta M-Pesa/E-Mola
                        </label>
                        <Input 
                            type="tel" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            placeholder="Ex: 841234567" 
                            className="bg-white/5 border-white/10 text-white"
                            disabled={availableBalance <= 0 || calculating}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading || availableBalance <= 0 || calculating}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Saque"}
                    </Button>
                </form>
            )}
        </Card>
    );
};