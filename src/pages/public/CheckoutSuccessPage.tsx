import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle2, Download, Home, Loader2 } from "lucide-react";
import { Button, Card } from "../../components/ui/Primitives";
import { useNavigate } from "react-router-dom";

export const CheckoutSuccessPage = () => {
    const [downloadLink, setDownloadLink] = useState<string>("");
    const [isReady, setIsReady] = useState(false);
    const hasRegistered = useRef(false); // Evita que a venda seja registrada duas vezes se a pessoa atualizar a página
    const navigate = useNavigate();

    useEffect(() => {
        const processSaleAndLink = async () => {
            const params = new URLSearchParams(window.location.search);
            const link = params.get('link');
            const saleId = params.get('saleId');

            // 1. Libera o link de Download
            if (link && link !== '#' && link !== 'null') {
                setDownloadLink(decodeURIComponent(link));
            }

            // 2. Confirma a Venda no Banco de Dados (Muda de pending para approved/completed)
            if (!hasRegistered.current && saleId) {
                hasRegistered.current = true; // Trava para não registrar de novo

                try {
                    await supabase
                        .from('sales')
                        .update({ status: 'approved' })
                        .eq('id', saleId);
                        
                    console.log("Venda Aprovada e Confirmada!");
                } catch (error) {
                    console.error("Erro ao atualizar a venda:", error);
                }
            }
            
            setIsReady(true);
        };

        processSaleAndLink();
    }, []);

    if (!isReady) return <div className="min-h-screen bg-[#0b0811] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-[#0b0811] flex items-center justify-center p-4 text-white">
            <Card className="max-w-md w-full p-8 text-center bg-[#12101b] border-white/5 shadow-2xl animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Compra Concluída!</h1>
                <p className="text-slate-400 mb-8">O pagamento foi aprovado. A RiseLab agradece a confiança!</p>

                <div className="space-y-4">
                    {downloadLink ? (
                        <a href={downloadLink} target="_blank" rel="noopener noreferrer">
                            <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-bold gap-2 shadow-[0_0_15px_rgba(0,181,116,0.3)] transition-all hover:scale-105">
                                <Download className="w-6 h-6" /> BAIXAR PRODUTO AGORA
                            </Button>
                        </a>
                    ) : (
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500 text-sm">
                            Link indisponível. Por favor, contate o suporte.
                        </div>
                    )}

                    <Button variant="outline" onClick={() => navigate("/")} className="w-full h-12 border-white/10 hover:bg-white/5 gap-2">
                        <Home className="w-4 h-4" /> Voltar para o Início
                    </Button>
                </div>
            </Card>
        </div>
    );
};