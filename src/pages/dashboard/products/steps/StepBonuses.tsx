import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import type { ProductFormValues } from '../../../../lib/schemas/productSchema';
import { Card, Input, Label, Button } from '../../../../components/ui/Primitives';
import { Plus, Trash2, File as FileIcon } from 'lucide-react';

export const StepBonuses = ({ form }: { form: UseFormReturn<ProductFormValues> }) => {
    const { register, control } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "bonuses"
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Materiais de Valor (Bônus)</h3>
                    <p className="text-sm text-muted-foreground">Surpreenda seu cliente com extras.</p>
                </div>
                <Button
                    type="button"
                    onClick={() => append({ name: '', description: '' })}
                    className="gap-2"
                    size="sm"
                >
                    <Plus className="w-4 h-4" /> Adicionar Material
                </Button>
            </div>

            <div className="space-y-4">
                {fields.length === 0 ? (
                    <Card className="p-8 border-dashed flex flex-col items-center justify-center text-center opacity-70">
                        <FileIcon className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="font-medium">Nenhum bônus adicionado ainda.</p>
                        <p className="text-sm text-muted-foreground">Bônus aumentam a conversão em até 30%.</p>
                    </Card>
                ) : (
                    fields.map((field, index) => (
                        <Card key={field.id} className="p-4 relative group">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                <div className="space-y-2">
                                    <Label>Nome do Material</Label>
                                    <Input
                                        {...register(`bonuses.${index}.name` as const)}
                                        placeholder="Ex: Checklist Diário"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Upload (PDF/EPUB)</Label>
                                    <Input
                                        type="file"
                                        className="text-sm"
                                    // Simple file input for now, handling upload logic could be complex here without a custom component
                                    // For prototype, we just show the input. 
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <Label>Breve Descrição</Label>
                                    <Input
                                        {...register(`bonuses.${index}.description` as const)}
                                        placeholder="O que o aluno vai ganhar com isso?"
                                    />
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
