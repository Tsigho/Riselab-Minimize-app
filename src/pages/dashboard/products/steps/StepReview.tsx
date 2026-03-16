import { motion } from "framer-motion";
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../../../../lib/schemas/productSchema';
import { Card } from '../../../../components/ui/Primitives';
import { CheckCircle2, FileText, Gift, Image as ImageIcon } from 'lucide-react';

export const StepReview = ({ form, mainFile }: { form: UseFormReturn<ProductFormValues>, mainFile: File | null }) => {
    const data = form.getValues();
    const coverImage = form.watch("imageUrl");

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <Card className="p-6 border-t-4 border-t-green-500 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <div>
                        <h3 className="text-xl font-bold">Pronto para Publicar!</h3>
                        <p className="text-muted-foreground">Revise os dados antes de colocar seu produto no ar.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cover Preview */}
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group border">
                        {coverImage ? (
                            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-2">
                                <ImageIcon className="w-8 h-8 opacity-50" />
                                <span className="text-xs">Sem Capa</span>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <h4 className="font-bold text-2xl">{data.name}</h4>
                            <p className="text-muted-foreground line-clamp-2">{data.description || "Sem descrição definida."}</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="p-3 bg-muted/30 rounded-lg border">
                                <span className="text-xs text-muted-foreground block">Preço Final</span>
                                <span className="font-bold text-green-600 text-lg">{data.offerPrice || data.price} MT</span>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg border">
                                <span className="text-xs text-muted-foreground block">Arquivo Principal</span>
                                <div className="flex items-center gap-2 font-medium">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span className="truncate max-w-[150px]">{mainFile?.name || data.mainProductFileUrl || "Pendente"}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg border">
                                <span className="text-xs text-muted-foreground block">Bônus</span>
                                <div className="flex items-center gap-2 font-medium">
                                    <Gift className="w-4 h-4 text-purple-500" />
                                    <span>{data.bonuses?.length || 0} Materiais</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div>
                            <span className="text-xs text-muted-foreground block mb-2">Métodos Aceitos</span>
                            <div className="flex gap-2">
                                {data.paymentMethods.map(m => (
                                    <span key={m} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium border capitalize">
                                        {m.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-center p-4">
                <p className="text-xs text-muted-foreground">Ao publicar, seu produto estará disponível imediatamente na URL de checkout.</p>
            </div>
        </motion.div>
    );
};
