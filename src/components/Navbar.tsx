import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark");
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ease-out ${isScrolled
                ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-lg"
                : "bg-background/20 backdrop-blur-xl border-border/20 shadow-sm"
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">
                            Rise<span className="text-primary">Lab</span>
                        </span>
                    </a>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/marketplace" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                            Marketplace
                        </Link>
                        <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                            Preços
                        </a>
                        <a href="#docs" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                            Documentação
                        </a>
                        <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                            Contacto
                        </a>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 relative"
                        >
                            <Sun className={`h-5 w-5 rotate-0 scale-100 transition-all ${isDark ? "dark:-rotate-90 dark:scale-0" : ""}`} />
                            <Moon className={`absolute h-5 w-5 rotate-90 scale-0 transition-all ${isDark ? "dark:rotate-0 dark:scale-100" : ""}`} />
                            <span className="sr-only">Alternar tema</span>
                        </button>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 font-medium"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg h-10 px-4 py-2 gradient-primary shadow-md hover:shadow-glow transition-all"
                        >
                            Criar Conta
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t bg-background/95 backdrop-blur-xl p-4 space-y-4 animate-accordion-down">
                    <div className="flex flex-col gap-4">
                        <a href="/marketplace" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                            Marketplace
                        </a>
                        <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                            Preços
                        </a>
                        <a href="#docs" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                            Documentação
                        </a>
                        <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
                            Contacto
                        </a>
                        <div className="flex items-center gap-4 pt-4 border-t">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 text-foreground/80 hover:text-foreground"
                            >
                                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                <span>{isDark ? "Modo Escuro" : "Modo Claro"}</span>
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 pt-2">
                            <Link to="/login" className="w-full text-center py-2 rounded-md hover:bg-accent transition-colors">Login</Link>
                            <Link to="/register" className="w-full text-center py-2 rounded-md gradient-primary text-primary-foreground shadow-md">Criar Conta</Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
