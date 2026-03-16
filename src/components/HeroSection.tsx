import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Primitives";
import { ArrowRight, CheckCircle2 } from "lucide-react";

// LISTA DE SERVIÇOS (A chuva de palavras)
const services = [
    "Pagamento M-Pesa 🇲🇿",
    "Pagamento E-Mola 📱",
    "Saque 24h 🏧",
    "Integração Webhooks 🔗",
    "Integração WhatsApp 💬",
    "Integração SMS 📩",
    "Integração Email 📧",
    "Integração UMTIFY 🚀",
    "Venda de Cursos 📹",
    "Produtos Online 🌐",
    "Comunidade VIP 👥"
];

export function HeroSection() {
    const [index, setIndex] = useState(0);

    // Lógica para girar as palavras automaticamente
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % services.length);
        }, 2000); // Troca a cada 2 segundos
        return () => clearInterval(timer);
    }, []);

    // Pega 3 itens para exibir (O atual + os próximos 2)
    const visibleServices = [
        services[index % services.length],
        services[(index + 1) % services.length],
        services[(index + 2) % services.length],
    ];

    return (
        <section className="relative w-full min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden px-6 py-12">

            {/* Luzes de fundo (Efeito visual) */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

            <div className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">

                {/* ================================================== */}
                {/* ⬅️ LADO ESQUERDO: TEXTO + ANIMAÇÃO CAINDO */}
                {/* ================================================== */}
                <div className="flex flex-col space-y-8">

                    {/* Título Principal */}
                    <div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
                            O seu negócio <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                                no piloto automático.
                            </span>
                        </h1>
                        <p className="mt-4 text-lg text-slate-400 max-w-lg">
                            A única plataforma em Moçambique que une pagamentos móveis, automação de WhatsApp e entrega de cursos em um só lugar.
                        </p>
                    </div>

                    {/* 🔥 A ANIMAÇÃO DA CASCATA (Aqui está o que você pediu) 🔥 */}
                    <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden h-[240px] flex flex-col justify-center">

                        {/* Degradê para esconder o topo e o fundo suavemente */}
                        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none" />

                        <div className="flex flex-col gap-3">
                            <AnimatePresence mode="popLayout">
                                {visibleServices.map((item, i) => (
                                    <motion.div
                                        key={`${item}-${index}`} // Chave única para recriar o elemento
                                        layout // Isso faz o efeito de "empurrar"
                                        initial={{ opacity: 0, y: -40, scale: 0.9 }} // Nasce em cima
                                        animate={{ opacity: 1, y: 0, scale: 1 }} // Vai pro lugar
                                        exit={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(2px)" }} // Cai e some
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className={`
                      flex items-center gap-3 p-3 rounded-xl border w-full
                      ${i === 0
                                                ? "bg-green-500/10 border-green-500/50 text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                                                : "bg-slate-800/40 border-slate-700/50 text-slate-500"
                                            }
                    `}
                                    >
                                        <CheckCircle2 className={`h-5 w-5 ${i === 0 ? "text-green-400" : "text-slate-600"}`} />
                                        <span className="font-semibold text-lg tracking-wide uppercase font-mono">
                                            {item}
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                    {/* Fim da Animação */}

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Button size="lg" className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700 text-white font-bold rounded-full shadow-lg shadow-green-900/20">
                            Criar Conta Grátis
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full">
                            Ver Como Funciona <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* ================================================== */}
                {/* ➡️ LADO DIREITO: IMAGEM DO DASHBOARD */}
                {/* ================================================== */}
                <div className="relative hidden lg:block perspective-1000">
                    {/* Efeito Glow atrás da imagem */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-500 to-blue-600 rounded-3xl blur-[60px] opacity-20 animate-pulse" />

                    <motion.div
                        initial={{ opacity: 0, x: 50, rotateY: -15 }}
                        animate={{ opacity: 1, x: 0, rotateY: -5 }}
                        transition={{ duration: 1.2, type: "spring" }}
                        className="relative rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden transform hover:rotate-y-0 hover:scale-[1.02] transition-all duration-500"
                    >
                        {/* SUA IMAGEM AQUI */}
                        <img
                            src="/dashboard-print.png" // Certifique-se que essa imagem existe na pasta public
                            alt="Minimizing Dashboard Preview"
                            className="w-full h-auto object-cover"
                        />

                        {/* Reflexo de vidro */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
