import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { productSchema, type ProductFormValues } from '../../../lib/schemas/productSchema';
import { Button } from '../../../components/ui/Primitives';
import { ArrowRight, Save, LayoutGrid } from 'lucide-react';
import { StepInfo } from './steps/StepInfo';
import { StepMainProduct } from './steps/StepMainProduct';
import { StepBonuses } from './steps/StepBonuses';
import { StepPayment } from './steps/StepPayment';
import { StepReview } from './steps/StepReview';
import { createProduct, uploadProductImage, updateProduct, getProductById } from '../../../lib/api/products';
import { supabase } from '../../../lib/supabase';

export const CreateProductWizard = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [mainFile, setMainFile] = useState<File | null>(null);
    const navigate = useNavigate();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            isActive: true,
            isFree: false,
            bonuses: [],
            paymentMethods: ['emola', 'mpesa'],
            leadFields: ['name', 'email'],
            marketplaceVisible: false, // 🚀 TRAVA 1: Já nasce invisível
            deliveryType: 'file'
        },
        mode: "onChange"
    });

    const { trigger, handleSubmit, reset } = form;

    // Load Data for Edit Mode
    useEffect(() => {
        if (isEditMode && id) {
            loadProduct(id);
        }
    }, [id]);

    const loadProduct = async (productId: string) => {
        setIsLoading(true);
        try {
            const product = await getProductById(productId);
            if (product) {
                // Map DB fields to Form Schema
                reset({
                    name: product.name,
                    description: product.description || "",
                    price: Number(product.price) || 0,
                    offerPrice: product.offer_price ? Number(product.offer_price) : undefined,
                    isFree: product.is_free,
                    deliveryType: product.delivery_type || 'file',
                    downloadUrl: product.download_url || "",
                    accessLink: product.access_link || "",
                    postPurchaseMessage: product.post_purchase_message || "",
                    imageUrl: product.image_url || "",
                    enableUpsell: product.funnel_config?.upsell?.enabled || false,
                    upsellType: product.funnel_config?.upsell?.type || 'internal',
                    upsellProductId: product.funnel_config?.upsell?.value || "",
                    enableDownsell: product.funnel_config?.downsell?.enabled || false,
                    downsellType: product.funnel_config?.downsell?.type || 'internal',
                    downsellProductId: product.funnel_config?.downsell?.value || "",
                    enableOrderBump: product.funnel_config?.orderBump?.enabled || false,
                    orderBumpProductId: product.funnel_config?.orderBump?.productId || "",
                    pixelId: product.pixel_id || "",
                    enableAffiliates: product.enable_affiliates || false,
                    affiliateCommission: product.affiliate_commission || undefined,
                    marketplaceVisible: false, // 🚀 Mantém invisível até na edição
                    salesPageUrl: product.sales_page_url || "",
                    checkoutTheme: product.checkout_theme || 'classic',
                    isActive: product.is_active,
                    leadFields: product.lead_fields || ['name', 'email'],
                    bonuses: product.bonuses || [],
                    paymentMethods: product.payment_methods || ['emola', 'mpesa'],
                    mainProductFileUrl: product.download_url || "" 
                });
            }
        } catch (error) {
            console.error("Error loading product:", error);
            alert("Erro ao carregar produto para edição.");
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        let valid = false;

        if (step === 1) {
            valid = await trigger(["name", "price", "offerPrice", "description", "imageUrl"]);
        } else if (step === 2) {
            const deliveryType = form.getValues("deliveryType");
            if (deliveryType === 'link') {
                valid = true;
            } else {
                const hasExistingFile = !!form.getValues("downloadUrl") || !!form.getValues("mainProductFileUrl");
                valid = !!mainFile || hasExistingFile;
                if (!valid) alert("Por favor, selecione o arquivo do produto.");
            }
        } else {
            valid = true;
        }

        if (valid) {
            setStep(s => s + 1);
        }
    };

    const prevStep = () => setStep(s => s - 1);

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setIsLoading(true);
            const user = await supabase.auth.getUser();
            const userId = user.data.user?.id;

            if (!userId) {
                alert("Usuário não autenticado");
                return;
            }

            let newDownloadUrl = undefined;
            if (mainFile) {
                newDownloadUrl = await uploadProductImage(mainFile);
            }

            // 🚀 A MÁGICA DE ARQUITETO: Forçamos o status 'pending' e invisível
            const finalData = {
                ...data,
                ...(newDownloadUrl ? { downloadUrl: newDownloadUrl } : {}),
                status: 'pending',           // 🟡 Obriga a ir para a fila de aprovação
                marketplaceVisible: false,   // 🟡 Esconde da loja principal
                marketplace_visible: false   // 🟡 Garantia dupla para o banco de dados
            };

            if (isEditMode && id) {
                await updateProduct(id, finalData);
                alert("Produto atualizado e enviado para reanálise da administração!");
            } else {
                await createProduct(finalData, userId);
                alert("Produto enviado para análise! Assim que a nossa equipe aprovar, ele estará disponível para venda no Marketplace.");
            }

            navigate('/dashboard/products');

        } catch (error: any) {
            console.error("Error saving product:", error);
            alert("Erro ao salvar produto: " + (error.message || "Tente novamente."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-primary" />
                        {isEditMode ? 'Editar Produto' : 'Criar Novo Produto'}
                    </h1>
                    <span className="text-sm font-medium text-muted-foreground">Etapa {step} de 5</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit as any)}>
                <div className="min-h-[400px]">
                    {step === 1 && <StepInfo key="step1" form={form} />}
                    {step === 2 && <StepMainProduct key="step2" form={form} onFileSelect={setMainFile} selectedFile={mainFile} />}
                    {step === 3 && <StepBonuses key="step3" form={form} />}
                    {step === 4 && <StepPayment key="step4" form={form} />}
                    {step === 5 && <StepReview key="step5" form={form} mainFile={mainFile} />}
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={step === 1 ? () => navigate('/dashboard/products') : prevStep}
                        disabled={isLoading}
                    >
                        {step === 1 ? "Cancelar" : "Voltar"}
                    </Button>

                    {step < 5 ? (
                        <Button type="button" onClick={nextStep} className="gap-2">
                            Próximo <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button type="submit" className="gap-2 bg-amber-600 hover:bg-amber-700 shadow-[0_0_15px_rgba(217,119,6,0.3)] text-white font-bold" disabled={isLoading}>
                            {isLoading ? "Enviando para análise..." : "ENVIAR PARA APROVAÇÃO"} <Save className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};