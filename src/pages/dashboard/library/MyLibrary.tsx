import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Loader2, BookOpen, Search, ArrowRight } from "lucide-react";
import { Button, Input, Card, Badge } from "../../../components/ui/Primitives";
import { motion } from "framer-motion";

export const MyLibrary = () => {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch purchases and join with products
            // Note: Since Supabase join syntax can be tricky without foreign keys explicitly mapped in client types,
            // we might need to do a two-step fetch or use the embedded resource syntax if configured.
            // Trying standard join syntax first.
            const { data, error } = await supabase
                .from('purchases')
                .select(`
                    id,
                    created_at,
                    product:products (
                        id,
                        name,
                        description,
                        image_url,
                        delivery_type
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                // Return gracefully if table doesn't exist yet (for smooth testing before migration)
                if (error.code === '42P01') {
                    console.warn("Tabela purchases não existe. Apenas simulando vazio.");
                    setPurchases([]);
                    return;
                }
                throw error;
            }

            setPurchases(data || []);
        } catch (error) {
            console.error("Error fetching library:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPurchases = purchases.filter((p: any) =>
        p.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Minha Biblioteca</h1>
                    <p className="text-muted-foreground">Seus cursos, e-books e ferramentas adquiridas.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar nas minhas compras..."
                        className="pl-9 bg-background"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {purchases.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 bg-muted/20 border-dashed">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Sua estante está vazia</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                        Você ainda não comprou nenhum produto. Explore o marketplace para encontrar conhecimento transformador.
                    </p>
                    <Link to="/dashboard/marketplace">
                        <Button size="lg" className="gap-2">
                            Explorar Marketplace <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPurchases.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link to={`/dashboard/library/${item.product.id}`}>
                                <Card className="overflow-hidden glass-panel hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all h-full flex flex-col group cursor-pointer border-green-500/10 hover:border-green-500/50">
                                    <div className="aspect-video bg-muted relative overflow-hidden">
                                        {item.product.image_url ? (
                                            <img
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-purple-500/5 text-4xl font-black text-muted-foreground/10">
                                                {item.product.name.charAt(0)}
                                            </div>
                                        )}

                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                                            {/* Dummy Progress Bar */}
                                            <div className="h-full bg-green-500 w-[0%]" />
                                        </div>

                                        <div className="absolute top-2 right-2">
                                            {item.product.delivery_type === 'file' ? (
                                                <Badge variant="secondary" className="bg-black/50 backdrop-blur text-white">Download</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-blue-600/80 backdrop-blur text-white">Curso</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{item.product.name}</h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                                            {item.product.description || "Sem descrição."}
                                        </p>

                                        <Button className="w-full group-hover:bg-primary/90" variant="outline">
                                            Acessar Conteúdo
                                        </Button>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
