import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../../../../lib/schemas/productSchema';
import { Card, Input, Label, Switch, Textarea, Button, Select } from '../../../../components/ui/Primitives';
import { Monitor, Upload, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { uploadProductImage } from '../../../../lib/api/products';
import { supabase } from '../../../../lib/supabase';

export const StepInfo = ({ form }: { form: UseFormReturn<ProductFormValues> }) => {
    const { register, watch, setValue, formState: { errors } } = form;
    const enableUpsell = watch("enableUpsell");
    const enableDownsell = watch("enableDownsell");
    const enableOrderBump = watch("enableOrderBump");
    const enableAffiliates = watch("enableAffiliates");
    const coverImage = watch("imageUrl");

    const [uploading, setUploading] = useState(false);
    const [userProducts, setUserProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchUserProducts = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('products')
                .select('id, name, price, offer_price')
                .eq('user_id', user.id);

            if (data) {
                console.log("Fethed User Products:", data.length);
                setUserProducts(data);
            } else {
                console.log("No products found for user.");
            }
        };
        fetchUserProducts();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Imagem muito grande (Max 10MB)");
            return;
        }

        try {
            setUploading(true);
            const url = await uploadProductImage(file);
            setValue("imageUrl", url, { shouldValidate: true });
        } catch (err) {
            console.error(err);
            alert("Erro ao fazer upload da imagem");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Informações Básicas</h3>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                    <Label>Imagem de Capa (Max 10MB)</Label>
                    <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors relative overflow-hidden bg-muted/10">
                        {coverImage ? (
                            <>
                                <img src={coverImage} alt="Cover" className="h-40 object-cover rounded-md" />
                                <Button size="sm" variant="outline" className="mt-2" onClick={() => document.getElementById('cover-upload')?.click()}>
                                    Trocar Imagem
                                </Button>
                            </>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="text-sm font-medium">Arraste ou clique para enviar</p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG (1200x600 recomendado)</p>
                                </div>
                                <Button disabled={uploading} type="button" size="sm" variant="outline" onClick={() => document.getElementById('cover-upload')?.click()}>
                                    {uploading ? "Enviando..." : "Selecionar Arquivo"}
                                </Button>
                            </>
                        )}
                        <input
                            id="cover-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </div>
                    {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label>Nome do Produto *</Label>
                    <Input {...register("name")} placeholder="Ex: Curso de Marketing Digital" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Preço Normal (MT) <span className="text-muted-foreground text-xs">(Riscado)</span></Label>
                        <Input
                            type="number"
                            placeholder="2000"
                            className="line-through text-muted-foreground"
                            {...register("price")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-green-600 font-bold">Preço de Venda (MT) <span className="text-xs">(Oferta)</span></Label>
                        <Input
                            type="number"
                            placeholder="1499"
                            className="border-green-500 focus-visible:ring-green-500 font-bold text-lg"
                            {...register("offerPrice")}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label>Descrição do Anúncio (SEO)</Label>
                    <Textarea
                        {...register("description")}
                        placeholder="Descreva seu produto para aumentar a conversão..."
                        className="min-h-[100px]"
                        maxLength={500}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Página de Vendas Externa (Opcional)</Label>
                            <Input placeholder="https://..." {...register("salesPageUrl")} />
                            <p className="text-xs text-muted-foreground">Se preenchido, o botão "Comprar" redirecionará para cá.</p>
                        </div>
                    </div>
                </div>

                {/* Marketplace & Toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <Label className="font-semibold">Permitir Afiliação</Label>
                                <p className="text-xs text-muted-foreground">Outros podem vender</p>
                            </div>
                        </div>
                        <Switch
                            checked={enableAffiliates}
                            onCheckedChange={(c) => setValue("enableAffiliates", c)}
                        />
                    </div>

                </div>

                {enableAffiliates && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <Label>Comissão do Afiliado (%)</Label>
                        <Input
                            type="number"
                            placeholder="50"
                            max={100}
                            {...register("affiliateCommission")}
                        />
                    </div>
                )}
            </Card>

            <Card className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold">Motor de Funil</h3>
                </div>

                {/* Upsell */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between">
                        <Label className="font-semibold text-purple-600">Ativar Upsell (Pós-Venda)</Label>
                        <Switch
                            checked={enableUpsell}
                            onCheckedChange={(c) => setValue("enableUpsell", c)}
                        />
                    </div>
                    {enableUpsell && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="radio" value="internal" {...register("upsellType")} /> Produto Interno
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="radio" value="external" {...register("upsellType")} /> Link Externo
                                </label>
                            </div>

                            {watch("upsellType") === 'internal' ? (
                                <ProductSelector
                                    userProducts={userProducts}
                                    value={watch("upsellProductId")}
                                    onChange={(val) => setValue("upsellProductId", val)}
                                    placeholder="Selecione ou Cole o ID do produto de Upsell..."
                                />
                            ) : (
                                <Input
                                    placeholder="https://pagina-externa.com/oferta"
                                    {...register("upsellProductId")}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Downsell */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between">
                        <Label className="font-semibold text-orange-600">Ativar Downsell (Recuperação)</Label>
                        <Switch
                            checked={enableDownsell}
                            onCheckedChange={(c) => setValue("enableDownsell", c)}
                        />
                    </div>
                    {enableDownsell && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="radio" value="internal" {...register("downsellType")} /> Produto Interno
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="radio" value="external" {...register("downsellType")} /> Link Externo
                                </label>
                            </div>

                            {watch("downsellType") === 'internal' ? (
                                <ProductSelector
                                    userProducts={userProducts}
                                    value={watch("downsellProductId")}
                                    onChange={(val) => setValue("downsellProductId", val)}
                                    placeholder="Selecione ou Cole o ID do produto de Downsell..."
                                />
                            ) : (
                                <Input
                                    placeholder="https://pagina-externa.com/downsell"
                                    {...register("downsellProductId")}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Order Bump */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between">
                        <Label className="font-semibold text-green-600">Order Bump (No Checkout)</Label>
                        <Switch
                            checked={enableOrderBump}
                            onCheckedChange={(c) => setValue("enableOrderBump", c)}
                        />
                    </div>
                    {enableOrderBump && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <ProductSelector
                                userProducts={userProducts}
                                value={watch("orderBumpProductId")}
                                onChange={(val) => setValue("orderBumpProductId", val)}
                                placeholder="Selecione ou Cole o ID do produto de Bump..."
                            />
                        </div>
                    )}
                </div>
            </Card>

            <FormNavigation />
        </div>
    );
};

export const FormNavigation = () => null;

// Helper Component for Product Selection
const ProductSelector = ({ userProducts, value, onChange, placeholder }: { userProducts: any[], value?: string, onChange: (val: string) => void, placeholder: string }) => {
    const [mode, setMode] = useState<'select' | 'manual'>('select');

    return (
        <div className="space-y-2">
            <div className="flex gap-2 mb-2">
                <Button
                    type="button"
                    size="sm"
                    variant={mode === 'select' ? 'primary' : 'outline'}
                    onClick={() => setMode('select')}
                    className="text-xs h-7"
                >
                    Selecionar da Lista
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={mode === 'manual' ? 'primary' : 'outline'}
                    onClick={() => setMode('manual')}
                    className="text-xs h-7"
                >
                    ID Manual
                </Button>
            </div>

            {mode === 'select' ? (
                <Select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="bg-background"
                >
                    <option value="" disabled>Selecione um produto...</option>
                    {userProducts.length === 0 && <option disabled>Nenhum produto encontrado</option>}
                    {userProducts.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} {p.offer_price ? `(${p.offer_price} MT)` : `(${p.price} MT)`}
                        </option>
                    ))}
                </Select>
            ) : (
                <Input
                    placeholder={placeholder}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
        </div>
    );
};
