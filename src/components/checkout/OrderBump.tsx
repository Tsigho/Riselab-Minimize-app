import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useState } from "react";

export const OrderBump = ({ onChange }: { product: any, onChange: (accepted: boolean) => void }) => {
    const [accepted, setAccepted] = useState(false);

    const toggle = () => {
        const newVal = !accepted;
        setAccepted(newVal);
        onChange(newVal);
    };

    // Mock fetching bump details since we don't have the relation loaded easily here
    // In real app, we would fetch the bump product details by ID: product.funnel_config.orderBump.productId
    const bumpPrice = 399;

    return (
        <div
            onClick={toggle}
            className={`
                border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden group
                ${accepted ? 'border-green-500 bg-green-500/5' : 'border-yellow-400 bg-yellow-500/5 hover:bg-yellow-500/10'}
            `}
        >
            {accepted && (
                <div className="absolute -right-6 top-4 bg-green-500 text-white text-xs py-1 px-8 rotate-45 shadow-sm font-bold">
                    ADICIONADO
                </div>
            )}

            <div className="flex items-start gap-4">
                <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${accepted ? 'bg-green-500 border-green-500' : 'border-yellow-500'}`}>
                    {accepted && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <ShoppingBag className="w-4 h-4 text-red-500 animate-pulse" />
                        <h4 className="font-bold text-sm uppercase tracking-wide text-red-600">Oferta Especial Limitada</h4>
                    </div>
                    <p className="font-bold text-foreground">
                        Adicionar "Pack de Templates Premium" por apenas <span className="text-green-600 text-lg">{bumpPrice} MT</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-tight">
                        90% dos alunos levam isso. Acelere seus resultados com modelos prontos de copy e design.
                    </p>
                </div>
            </div>
        </div>
    );
};
