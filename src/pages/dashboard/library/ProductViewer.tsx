import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Loader2, ArrowLeft, ArrowRight, FileText, Video as VideoIcon, Download, Trophy, Lock, PlayCircle, MessageCircle } from "lucide-react";
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Primitives";
import { motion } from "framer-motion";

export const ProductViewer = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState("main"); // 'main', 'bonus-0', 'bonus-1', ...

    useEffect(() => {
        if (productId) fetchProductContent();
    }, [productId]);

    const fetchProductContent = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product content:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
    if (!product) return <div className="p-10 text-center">Produto não encontrado.</div>;

    const bonuses = product.bonuses || [];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:flex-row overflow-hidden bg-background">
            {/* Sidebar (Modules) */}
            <aside className="w-full lg:w-80 border-r bg-muted/10 overflow-y-auto flex-shrink-0">
                <div className="p-4 border-b">
                    <Link to="/dashboard/library" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar à Biblioteca
                    </Link>
                    <h2 className="font-bold text-lg leading-tight">{product.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[10%]" />
                        </div>
                        <span className="text-xs text-muted-foreground">10% Concluído</span>
                    </div>
                </div>

                <div className="p-4 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Conteúdo do Curso</div>

                    <button
                        onClick={() => setActiveModule('main')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeModule === 'main' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            {product.delivery_type === 'file' ? <FileText className="w-4 h-4 text-blue-600" /> : <PlayCircle className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1 text-sm">
                            Conteúdo Principal
                            {product.delivery_type === 'file' && <div className="text-xs opacity-70 mt-0.5">Download / Acesso</div>}
                            {product.delivery_type === 'link' && <div className="text-xs opacity-70 mt-0.5">Acesso à Plataforma</div>}
                        </div>
                    </button>

                    {bonuses.length > 0 && (
                        <>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">Bônus & Extras</div>
                            {bonuses.map((bonus: any, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveModule(`bonus-${index}`)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeModule === `bonus-${index}` ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                        <Lock className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1 text-sm line-clamp-2">
                                        {bonus.name || `Bônus #${index + 1}`}
                                    </div>
                                </button>
                            ))}
                        </>
                    )}

                    <div className="mt-8 pt-4 border-t">
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-muted text-muted-foreground opacity-50 cursor-not-allowed" title="Disponível após 100% de conclusão">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                                <Trophy className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div className="flex-1 text-sm">
                                Emitir Certificado
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
                <motion.div
                    key={activeModule}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-3xl mx-auto space-y-8"
                >
                    {activeModule === 'main' ? (
                        <>
                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative mb-8 flex items-center justify-center group">
                                {product.image_url ? (
                                    <img src={product.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                                )}

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40 backdrop-blur-sm">
                                    <h1 className="text-2xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">{product.name}</h1>

                                    {product.delivery_type === 'file' ? (
                                        <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-md max-w-sm w-full">
                                            <FileText className="w-12 h-12 text-white mx-auto mb-4" />
                                            <p className="text-white/80 mb-4 text-sm">Este produto é um arquivo digital.</p>
                                            <Button size="lg" className="w-full bg-white text-black hover:bg-white/90 font-bold" onClick={() => window.open(product.download_url || product.mainProductFileUrl || '#', '_blank')}>
                                                <Download className="w-4 h-4 mr-2" /> Baixar Arquivo
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-md max-w-sm w-full">
                                            <VideoIcon className="w-12 h-12 text-white mx-auto mb-4" />
                                            <p className="text-white/80 mb-4 text-sm">Este é um curso com acesso externo.</p>
                                            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold" onClick={() => window.open(product.access_link || product.sales_page_url || '#', '_blank')}>
                                                Acessar Plataforma <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Tabs defaultValue="description" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                                        <TabsTrigger value="description">Descrição</TabsTrigger>
                                        <TabsTrigger value="files">Arquivos</TabsTrigger>
                                        <TabsTrigger value="support">Suporte</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="description" className="mt-6">
                                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                            <h3 className="text-xl font-bold mb-4">Sobre este conteúdo</h3>
                                            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                                                <p className="whitespace-pre-wrap leading-relaxed">{product.description || "Nenhuma descrição fornecida."}</p>
                                                {product.post_purchase_message && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border-l-4 border-blue-500 mt-6">
                                                        <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">Mensagem do Autor:</h4>
                                                        <p>{product.post_purchase_message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="files" className="mt-6">
                                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                            <h3 className="text-xl font-bold mb-4">Arquivos Complementares</h3>
                                            {bonuses.length > 0 ? (
                                                <div className="space-y-3">
                                                    {bonuses.map((bonus: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="w-5 h-5 text-blue-500" />
                                                                <div>
                                                                    <p className="font-medium">{bonus.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{bonus.fileName || "Material Extra"}</p>
                                                                </div>
                                                            </div>
                                                            {bonus.fileUrl && (
                                                                <Button size="sm" variant="ghost" onClick={() => window.open(bonus.fileUrl, '_blank')}>
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <p>Nenhum arquivo complementar listado nesta seção.</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="support" className="mt-6">
                                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
                                            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4 bg-primary/10 p-2 rounded-full" />
                                            <h3 className="text-xl font-bold mb-2">Precisa de Ajuda?</h3>
                                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                                Se você tiver dúvidas sobre o conteúdo ou problemas técnicos, entre em contato com o suporte do autor.
                                            </p>
                                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                                <Button className="gap-2">
                                                    <MessageCircle className="w-4 h-4" /> Falar com Suporte
                                                </Button>
                                                <Button variant="outline" className="gap-2" onClick={() => window.open(product.sales_page_url, '_blank')} disabled={!product.sales_page_url}>
                                                    Página de Vendas
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </>
                    ) : (
                        // Render Bonus Content
                        (() => {
                            const bonusIndex = parseInt(activeModule.split('-')[1]);
                            const bonus = bonuses[bonusIndex];
                            if (!bonus) return <div>Bônus não encontrado</div>;

                            return (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-8 rounded-2xl border border-purple-500/20">
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none mb-4">Bônus Exclusivo</Badge>
                                        <h2 className="text-3xl font-bold mb-4">{bonus.name}</h2>
                                        <p className="text-muted-foreground text-lg mb-8">{bonus.description || "Aproveite este material complementar para acelerar seus resultados."}</p>

                                        {bonus.fileUrl && (
                                            <Button size="lg" className="bg-purple-600 hover:bg-purple-700" onClick={() => window.open(bonus.fileUrl, '_blank')}>
                                                <Download className="w-4 h-4 mr-2" /> Baixar Material ({bonus.fileName || 'Arquivo'})
                                            </Button>
                                        )}

                                        {!bonus.fileUrl && !bonus.link && (
                                            <div className="text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg text-sm">
                                                Este bônus não possui arquivo anexado.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()
                    )}
                </motion.div>
            </main>
        </div>
    );
};
