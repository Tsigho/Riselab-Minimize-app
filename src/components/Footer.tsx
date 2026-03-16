
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-card/80 backdrop-blur-sm border-t border-border/50 relative z-10">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">
                            Rise<span className="gradient-primary bg-clip-text text-transparent">Lab</span>
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            A plataforma líder de vendas online em Moçambique e no mundo.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                                <Facebook className="w-5 h-5 text-primary" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                                <Instagram className="w-5 h-5 text-primary" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                                <Twitter className="w-5 h-5 text-primary" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                                <Mail className="w-5 h-5 text-primary" />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Produto</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Preços</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Integrações</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">API</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Recursos</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Tutoriais</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Webinários</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Casos de Sucesso</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Empresa</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Carreiras</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contato</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Suporte</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-muted-foreground text-sm">© 2025 RiseLab. Todos os direitos reservados.</p>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Termos de Uso</a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Política de Privacidade</a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
