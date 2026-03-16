import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../../../../lib/schemas/productSchema';
import { Card } from '../../../../components/ui/Primitives';
import { Check, Smartphone, CreditCard } from 'lucide-react';

export const StepPayment = ({ form }: { form: UseFormReturn<ProductFormValues> }) => {
    const { watch, setValue } = form;
    const paymentMethods = watch("paymentMethods");

    const toggleMethod = (method: string) => {
        const current = paymentMethods || [];
        if (current.includes(method as any)) {
            setValue("paymentMethods", current.filter(m => m !== method));
        } else {
            setValue("paymentMethods", [...current, method as any]);
        }
    };

    const MethodCard = ({ id, label, color, icon }: { id: string, label: string, color: string, icon: any }) => {
        const selected = paymentMethods?.includes(id as any);
        const Icon = icon;

        return (
            <div
                onClick={() => toggleMethod(id)}
                className={`
                    cursor-pointer p-4 rounded-xl border-2 transition-all relative overflow-hidden group
                    ${selected ? `bg-opacity-5` : 'border-muted hover:border-gray-400'}
                `}
                style={{
                    borderColor: selected ? color : undefined,
                    backgroundColor: selected ? `${color}10` : undefined
                }}
            >
                {selected && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-green-500 text-white animate-in zoom-in">
                        <Check className="w-3 h-3" />
                    </div>
                )}

                <div className={`p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3 transition-colors`}
                    style={{
                        backgroundColor: selected ? `${color}20` : '#f3f4f6',
                        color: selected ? color : '#6b7280'
                    }}>
                    <Icon className="w-6 h-6" />
                </div>

                <h4 className="font-bold">{label}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                    {selected ? "Ativado" : "Desativado"}
                </p>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-semibold">Métodos de Pagamento</h3>
                    <p className="text-muted-foreground text-sm">Selecione quais métodos você quer aceitar no checkout.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <MethodCard id="emola" label="e-Mola" color="#F97316" icon={Smartphone} /> {/* Orange */}
                    <MethodCard id="mpesa" label="M-Pesa" color="#EF4444" icon={Smartphone} /> {/* Red */}
                    <MethodCard id="credit_card" label="Cartão" color="#3B82F6" icon={CreditCard} />

                    {/* Future options disabled */}
                    <div className="opacity-50 pointer-events-none p-4 border rounded-xl flex items-center justify-center flex-col bg-muted/20">
                        <span className="text-xs font-bold text-muted-foreground">Google Pay</span>
                        <span className="text-[10px] uppercase bg-gray-200 px-1 rounded mt-1">Brevemente</span>
                    </div>
                    <div className="opacity-50 pointer-events-none p-4 border rounded-xl flex items-center justify-center flex-col bg-muted/20">
                        <span className="text-xs font-bold text-muted-foreground">Apple Pay</span>
                        <span className="text-[10px] uppercase bg-gray-200 px-1 rounded mt-1">Brevemente</span>
                    </div>
                    <div className="opacity-50 pointer-events-none p-4 border rounded-xl flex items-center justify-center flex-col bg-muted/20">
                        <span className="text-xs font-bold text-muted-foreground">Pix</span>
                        <span className="text-[10px] uppercase bg-gray-200 px-1 rounded mt-1">Brevemente</span>
                    </div>
                </div>
            </Card>

            {/* Checkout Theme Selector */}
            <Card className="p-6">
                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Tema do Checkout</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">Escolha o visual da página de pagamento.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                        {
                            id: 'classic',
                            label: 'Clássico',
                            desc: 'Clean e confiável',
                            preview: (
                                <div className="w-full h-24 bg-gray-50 rounded border border-gray-200 p-2 flex gap-2">
                                    <div className="w-1/3 h-full bg-white rounded border border-gray-100 shadow-sm" />
                                    <div className="w-2/3 h-full flex flex-col gap-1">
                                        <div className="w-full h-8 bg-white rounded border border-gray-100" />
                                        <div className="w-full h-6 bg-primary/20 rounded mt-auto" />
                                    </div>
                                </div>
                            )
                        },
                        {
                            id: 'mpesa',
                            label: 'Foco Mobile',
                            desc: 'Estilo App M-Pesa',
                            preview: (
                                <div className="w-full h-24 bg-red-50/50 rounded border border-red-100 p-2 flex flex-col items-center gap-2 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                                        <Smartphone className="w-6 h-6 text-red-500" />
                                    </div>
                                </div>
                            )
                        },
                        {
                            id: 'dark',
                            label: 'Dark Mode',
                            desc: 'Visual Premium',
                            preview: (
                                <div className="w-full h-24 bg-zinc-900 rounded border border-zinc-800 p-2 flex gap-2">
                                    <div className="w-full h-full flex flex-col gap-1">
                                        <div className="w-1/2 h-3 bg-zinc-800 rounded" />
                                        <div className="w-full h-6 bg-green-900/40 border border-green-900/50 rounded mt-auto flex items-center justify-center">
                                            <div className="w-12 h-2 bg-green-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            id: 'high-converter',
                            label: 'Alta Conversão',
                            desc: 'Sem distrações',
                            preview: (
                                <div className="w-full h-24 bg-white rounded border border-gray-200 p-2 flex flex-col items-center justify-center gap-1">
                                    <div className="w-3/4 h-2 bg-gray-100 rounded mb-1" />
                                    <div className="w-full h-8 bg-yellow-400 rounded shadow-sm border-b-2 border-yellow-500" />
                                </div>
                            )
                        }
                    ].map(theme => (
                        <div
                            key={theme.id}
                            onClick={() => setValue("checkoutTheme", theme.id as any)}
                            className={`
                                cursor-pointer rounded-xl border-2 transition-all relative overflow-hidden group
                                ${watch("checkoutTheme") === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-muted hover:border-gray-400'}
                            `}
                        >
                            <div className="p-3 bg-muted/20 border-b flex justify-between items-center">
                                <span className="font-bold text-sm">{theme.label}</span>
                                {watch("checkoutTheme") === theme.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                            </div>
                            <div className="p-4 flex flex-col items-center">
                                {theme.preview}
                                <p className="text-xs text-muted-foreground mt-3 font-medium">{theme.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
