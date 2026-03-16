import { CheckCircle2, Download } from "lucide-react";
import { Button, Card } from "../../components/ui/Primitives";
import { Link } from "react-router-dom";

export const CheckoutSuccessPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full animate-in zoom-in duration-500">
                <Card className="p-8 text-center space-y-6 shadow-2xl border-t-8 border-t-green-500">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-green-700">Pagamento Confirmado!</h1>
                        <p className="text-muted-foreground">Obrigado pela sua compra. Enviamos os detalhes para o seu email.</p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg border border-border/50 text-left space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">ID do Pedido:</span>
                            <span className="font-mono font-bold">#ORD-9382</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="text-green-600 font-bold bg-green-100 px-2 rounded-full text-xs">PAGO</span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Button className="w-full gap-2 text-lg h-12 shadow-lg shadow-primary/20">
                            <Download className="w-5 h-5" /> Acessar Meu Produto
                        </Button>
                        <Link to="/" className="block">
                            <Button variant="ghost" className="w-full text-muted-foreground">
                                Voltar para Loja
                            </Button>
                        </Link>
                    </div>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    &copy; 2026 Paymoz Secure Payments.
                </p>
            </div>
        </div>
    );
};
