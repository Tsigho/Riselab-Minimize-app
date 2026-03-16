
import { Check, CreditCard } from "lucide-react";
import { RevealOnScroll } from "./ui/RevealOnScroll";
import { Link } from "react-router-dom";

const includedFeatures = [
    "Produtos ilimitados",
    "Páginas de vendas otimizadas",
    "Dashboard completo",
    "API para desenvolvedores",
    "Suporte dedicado",
    "Análise em tempo real",
    "Sem taxas de setup",
    "Sem mensalidade fixa",
];

const paymentMethods = ["M-Pesa", "E-Mola", "PayPal", "Visa/Mastercard"];

export const PricingSection = () => {
    return (
        <section id="pricing" className="py-24 px-4 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]"></div>
            <div className="container mx-auto max-w-5xl relative">
                <div className="text-center mb-16 space-y-4">

                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Pague apenas quando <span className="gradient-primary bg-clip-text text-transparent">você vender</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Sem mensalidades. Sem taxas escondidas. Comissão justa que cresce com o seu negócio.
                    </p>
                </div>

                <div className="rounded-lg text-card-foreground border-2 border-primary/20 shadow-2xl bg-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 gradient-primary opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 gradient-secondary opacity-10 blur-3xl"></div>

                    <RevealOnScroll className="flex flex-col p-6 text-center pb-8 pt-12 space-y-6 relative">

                        <div className="space-y-3 pt-4">
                            <div className="inline-flex items-baseline gap-3">
                                <span className="text-7xl md:text-8xl font-bold gradient-primary bg-clip-text text-transparent">
                                    10%
                                </span>
                            </div>
                            <p className="text-xl text-muted-foreground font-medium">comissão por venda realizada</p>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Cobrado apenas quando você receber o pagamento. Zero risco para começar.
                            </p>
                        </div>
                    </RevealOnScroll>

                    <div className="p-6 pt-0 space-y-10 pb-12 px-8 relative">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-center">Tudo incluído no plano:</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {includedFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 group">
                                        <div className="w-6 h-6 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-foreground font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-8 space-y-6 pb-8">
                        <h3 className="text-xl font-bold text-center flex items-center justify-center gap-2">
                            <CreditCard className="w-5 h-5 text-secondary" />
                            Aceite Todos os Métodos de Pagamento
                        </h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {paymentMethods.map((method, index) => (
                                <div
                                    key={index}
                                    className="px-6 py-3 bg-muted/50 border border-border hover:border-primary/30 rounded-xl text-sm font-bold transition-all hover:scale-105"
                                >
                                    {method}
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            Integrações nativas com todos os principais processadores de pagamento em Moçambique
                        </p>
                    </div>

                    <div className="text-center space-y-4 pb-12">
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg rounded-lg gradient-primary shadow-glow w-full md:w-auto px-16 text-lg h-14 group">
                            Começar a Vender Grátis
                            <Check className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        </Link>
                        <p className="text-sm text-muted-foreground font-medium">
                            ✓ Sem cartão de crédito necessário • ✓ Setup em 2 minutos • ✓ Suporte gratuito
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center space-y-3">
                    <p className="text-muted-foreground">Tem perguntas sobre nossos preços ou precisa de um plano personalizado?</p>
                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground h-12 rounded-lg px-8">
                        Falar com a Equipa de Vendas
                    </button>
                </div>
            </div>
        </section>
    );
};
