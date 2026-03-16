import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../../../../lib/schemas/productSchema';
import { Card } from '../../../../components/ui/Primitives';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export const StepMainProduct = ({ form, onFileSelect, selectedFile }: { form: UseFormReturn<ProductFormValues>, onFileSelect: (file: File) => void, selectedFile: File | null }) => {
    const [dragActive, setDragActive] = useState(false);
    const existingUrl = form.watch("mainProductFileUrl"); // For when editing existing product that has URL

    // We prioritize the newly selected file name for immediate feedback.
    // If no new file, we check if there is an existing URL (for edit mode in future).
    const displayFileName = selectedFile?.name || (existingUrl ? "Arquivo Atual" : null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-8">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold">Produto Principal</h3>
                    <p className="text-muted-foreground">O arquivo que seu cliente receberá após a compra.</p>
                </div>

                <div
                    className={`
                        border-2 border-dashed rounded-xl p-10 transition-all text-center relative cursor-pointer
                        ${dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:bg-muted/30'}
                        ${displayFileName ? 'border-green-500/50 bg-green-500/5' : ''}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".pdf,.epub,.zip"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
                    />

                    <div className="flex flex-col items-center justify-center gap-4">
                        {displayFileName ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg text-green-700 dark:text-green-400">Arquivo Selecionado!</p>
                                    <p className="text-muted-foreground font-medium">{displayFileName}</p>
                                    <p className="text-sm text-muted-foreground mt-1">Clique para alterar</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">Arraste seu PDF aqui</p>
                                    <p className="text-sm text-muted-foreground mt-1">ou clique para buscar (Max 500MB)</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <FileText className="w-6 h-6 text-muted-foreground mt-1" />
                    <div>
                        <h4 className="font-semibold text-sm">Formatos Recomendados</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Para melhor experiência de leitura, utilize <strong>PDF</strong> padrão A4.
                            Para pacotes grandes, utilize <strong>ZIP</strong>.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};
