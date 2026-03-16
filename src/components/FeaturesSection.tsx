import { ShoppingBag, CreditCard, Clock, Shield, Zap, Headphones } from "lucide-react";
import { RevealOnScroll } from "./ui/RevealOnScroll";

const features = [
    {
        icon: ShoppingBag,
        title: "Páginas de Vendas Profissionais",
        description: "Lance produtos em minutos com páginas otimizadas para conversão. Crie sua vitrine digital sem precisar de código.",
    },
    {
        icon: CreditCard,
        title: "5 Métodos de Pagamento",
        description: "Aceite Mpesa, Emola, PayPal, cartões de crédito e débito. Máxima flexibilidade para seus clientes.",
    },
    {
        icon: Clock,
        title: "Pagamentos em 24 Horas",
        description: "Acelere o fluxo de caixa do seu negócio. Seu dinheiro na conta em menos de 24 horas.",
    },
    {
        icon: Shield,
        title: "100% Seguro",
        description: "Transações protegidas com criptografia de última geração. Conformidade total com padrões internacionais.",
    },
    {
        icon: Zap,
        title: "API para Desenvolvedores",
        description: "Integre o RiseLab em qualquer sistema com nossa API RESTful. Documentação completa e exemplos práticos.",
    },
    {
        icon: Headphones,
        title: "Suporte que Realmente Ajuda",
        description: "Equipe de especialistas em português disponível para garantir que suas operações nunca parem.",
    },
];

export const FeaturesSection = () => {
    return (
        <section id="features" className="py-24 px-4 bg-background relative overflow-hidden z-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="container mx-auto relative">
                <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">

                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Tudo que seu negócio precisa para{" "}
                        <span className="relative inline-block">
                            <span className="gradient-secondary bg-clip-text text-transparent">decolar</span>
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Da criação de páginas de vendas à gestão de pagamentos, oferecemos uma solução completa e integrada para o
                        seu sucesso.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <RevealOnScroll
                            key={index}
                            delay={index * 0.1}
                            className="rounded-lg border text-card-foreground shadow-sm border-border bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-8 space-y-4 relative">
                                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
};
