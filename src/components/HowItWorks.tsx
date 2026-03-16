
import { UserPlus, Package, CreditCard, Rocket } from "lucide-react";
import { RevealOnScroll } from "./ui/RevealOnScroll";

const steps = [
    {
        icon: UserPlus,
        number: "1",
        title: "Crie sua Conta Grátis",
        description: "Preencha um formulário simples e tenha acesso imediato à plataforma. Sem cartão de crédito necessário.",
        image: "/assets/dashboard-placeholder.jpg", // Placeholder
    },
    {
        icon: Package,
        number: "2",
        title: "Adicione seus Produtos",
        description: "Configure seus produtos com fotos, descrições e preços. Produtos digitais ou físicos, você escolhe.",
        image: "/assets/products-placeholder.jpg", // Placeholder
    },
    {
        icon: CreditCard,
        number: "3",
        title: "Receba Pagamentos",
        description: "Seus clientes pagam com Mpesa, Emola, PayPal ou cartões. Você recebe em até 24 horas.",
        image: "/assets/payments-placeholder.jpg", // Placeholder
    },
    {
        icon: Rocket,
        number: "4",
        title: "Escale seu Negócio",
        description: "Acompanhe vendas, gerencie estoque e cresça sem limites. Pagamos apenas 10% por venda.",
        image: "/assets/growth-placeholder.jpg", // Placeholder
    },
];

export const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 px-4 bg-muted/30 relative">
            <div className="container mx-auto">
                <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">

                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Venda Online em{" "}
                        <span className="relative">
                            <span className="gradient-primary bg-clip-text text-transparent">4 Passos Simples</span>
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Nossa plataforma foi projetada para ser tão simples que qualquer pessoa pode começar a vender em minutos.
                    </p>
                </div>

                <div className="relative">
                    <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-20"></div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {steps.map((step, index) => (
                            <RevealOnScroll
                                key={index}
                                delay={index * 0.1}
                                className="rounded-lg border text-card-foreground shadow-sm border-border bg-card hover:border-primary/30 transition-all duration-300 group relative"
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="relative">
                                            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <step.icon className="w-7 h-7 text-white" />
                                            </div>
                                        </div>
                                        <div className="text-6xl font-bold text-muted/10">{step.number}</div>
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                                    <div className="relative h-32 rounded-xl overflow-hidden border border-border">
                                        {/* Placeholder for images */}
                                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground/50">
                                            Image Preview
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
