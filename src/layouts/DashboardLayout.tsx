
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    MessageSquare,
    Wrench,
    DollarSign,
    BookOpen,
    ShieldAlert
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Primitives";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Visão Geral", path: "/dashboard" },
    { icon: BookOpen, label: "Minha Biblioteca", path: "/dashboard/library" },
    { icon: Package, label: "Meus Produtos", path: "/dashboard/products" },
    { icon: Users, label: "Gestão de Clientes", path: "/dashboard/clients" },
    { icon: ShoppingCart, label: "Marketplace Global", path: "/dashboard/marketplace" },
    { icon: Users, label: "Painel de Afilhados", path: "/dashboard/affiliates" }, // "Painel de Afilhados"
    { icon: MessageSquare, label: "Mensagens", path: "/dashboard/messages" },
    { icon: Wrench, label: "Ferramentas", path: "/dashboard/tools" },
    { icon: DollarSign, label: "Saque", path: "/dashboard/financial" }, // "Botão de Saque"
    { icon: Settings, label: "Configurações", path: "/dashboard/settings" },
];

const UserHeader = () => {
    const [user, setUser] = useState<any>(null);
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

        // Listen for auth changes to update header automatically
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const userInitials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : "U";

    return (
        <div className="flex items-center gap-4 ml-auto relative">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.user_metadata?.full_name || "Usuário"}</p>
                <p className="text-xs text-muted-foreground">Vendedor</p>
            </div>

            <div
                className="relative cursor-pointer"
                onClick={() => setShowMenu(!showMenu)}
            >
                {user?.user_metadata?.avatar_url ? (
                    <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 hover:border-primary transition-colors"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-transparent hover:border-primary/50 transition-colors">
                        {userInitials}
                    </div>
                )}

                {/* Dropdown Menu */}
                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                        />
                        <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-2 py-1.5 text-sm font-medium border-b border-border/50 mb-1">
                                Minha Conta
                            </div>
                            <button
                                onClick={() => { navigate('/dashboard/settings'); setShowMenu(false); }}
                                className="w-full text-left px-2 py-2 text-sm rounded-lg hover:bg-muted flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Visitar Perfil
                            </button>
                            <div className="h-px bg-border/50 my-1" />
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    navigate("/login");
                                }}
                                className="w-full text-left px-2 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sair
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export const BotaoAdminSecreto = () => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const verificarCoroa = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data?.role === 'admin') {
                setIsAdmin(true);
            }
        };

        verificarCoroa();
    }, []);

    // Se não for Admin, o botão simplesmente não existe na tela
    if (!isAdmin) return null;

    // Se for Admin, o botão dourado aparece!
    return (
        <Link to="/admin" className="block mb-2">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-2 justify-start">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span className="truncate">SALA DE CONTROLE</span>
            </Button>
        </Link>
    );
};

export const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    // Webhook Listener disabled for debugging
    // useEffect(() => {
    //     let socket: any;
    //     try {
    //         socket = io('http://localhost:3001', {
    //             reconnectionAttempts: 3,
    //             timeout: 5000,
    //             autoConnect: true
    //         });

    //         socket.on('connect_error', (err: any) => {
    //             console.warn("Socket connection failed (Backend likely offline):", err.message);
    //         });

    //         socket.on('payment_received', (data: any) => {
    //             console.log("💰 Payment Notification:", data);
    //             if (toast) {
    //                 toast.success(
    //                     <div className="flex flex-col gap-1">
    //                         <span className="font-bold">Pagamento Recebido! 💸</span>
    //                         <span className="text-xs">
    //                             {data.customer} pagou {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(data.amount)}
    //                         </span>
    //                         <span className="text-[10px] text-muted-foreground">Ref: {data.reference}</span>
    //                     </div>,
    //                     { duration: 5000, position: "top-right" }
    //                 );
    //             }
    //         });
    //     } catch (error) {
    //         console.error("Socket initialization error:", error);
    //     }

    //     return () => {
    //          if (socket) socket.disconnect();
    //     };
    // }, []);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Global Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-md border-r border-border transform transition-transform duration-200 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white">R</span>
                        </div>
                        <span>Rise<span className="text-primary">Lab</span></span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="ml-auto lg:hidden text-muted-foreground"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                    ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-border">
                        <BotaoAdminSecreto />
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sair
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-muted-foreground"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <UserHeader />
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
