import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { ProductUpload } from "../../components/ProductUpload";
import { Button, Input, Card } from "../../components/ui/Primitives";
import { Package, DollarSign, Type, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AddProductPage = () => {
    const navigate = useNavigate();
    // Estados para o formulário
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [fileUrl, setFileUrl] = useState(""); // Guarda o link do PDF vindo do ProductUpload
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fileUrl || fileUrl === "#") {
            alert("Por favor, faça o upload do PDF antes de salvar.");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Tem de estar connectado para submeter!");
                return;
            }

            const { error } = await supabase
                .from('products')
                .insert([
                    {
                        name: name,
                        price: parseFloat(price),
                        image_url: imageUrl,
                        file_url: fileUrl,
                        user_id: user.id,
                        status: 'pending',          // 🚀 TRAVA 1: Fica Pendente e vai para o Admin
                        marketplace_visible: false, // 🚀 TRAVA 2: Fica Invisível na Loja
                        is_active: true
                    }
                ]);

            if (error) throw error;

            alert("Produto enviado para análise! Assim que a nossa equipe aprovar, ele estará disponível para venda no Marketplace.");

            // Redireciona o usuário de volta para o Dashboard
            navigate("/dashboard/products");

            // Limpa o formulário (caso eles tentem novamente sem sair)
            setName("");
            setPrice("");
            setImageUrl("");
            setFileUrl("");

        } catch (error: any) {
            alert("Erro ao salvar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card className="p-8 bg-[#12101b] border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Novo Produto</h1>
                        <p className="text-sm text-slate-400">Preencha os dados e envie para a nossa equipe aprovar.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nome do Produto */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <Type className="w-4 h-4" /> Nome do Produto
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: E-book de Marketing"
                            className="bg-white/5 border-white/10"
                            required
                        />
                    </div>

                    {/* Preço */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Preço (MZN)
                        </label>
                        <Input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Ex: 500"
                            className="bg-white/5 border-white/10"
                            required
                        />
                    </div>

                    {/* Link da Imagem/Capa */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">URL da Imagem de Capa</label>
                        <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-white/5 border-white/10"
                            required
                        />
                    </div>

                    {/* COMPONENTE DE UPLOAD DE PDF */}
                    <div className="space-y-2 pt-4 border-t border-white/5">
                        <label className="text-sm font-medium text-zinc-400">Ficheiro do Produto (Download Automático)</label>
                        <ProductUpload onUploadSuccess={(url) => setFileUrl(url)} />
                        {fileUrl && (
                            <p className="text-[10px] text-green-500 mt-2 font-mono bg-green-500/10 p-2 rounded">
                                ✅ Arquivo pronto: {fileUrl.substring(0, 50)}...
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-lg font-bold shadow-[0_0_15px_rgba(217,119,6,0.4)] transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Enviando para análise...
                            </>
                        ) : (
                            "ENVIAR PARA APROVAÇÃO (ADMIN)"
                        )}
                    </Button>
                </form>
            </Card>
        </div>
    );
};