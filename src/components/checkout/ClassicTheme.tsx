import { Card, Button, Input, Label } from "../ui/Primitives";
import { Lock, ShieldCheck, Star } from "lucide-react";
import { OrderBump } from "./OrderBump";

// Types
// type Product = any; // Ideally strictly typed

export const ClassicTheme = ({ product, orderBumpAccepted, setOrderBumpAccepted, onPay }: any) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background py-10 px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Product & Trust */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <Card className="p-8 border-t-4 border-t-primary shadow-lg">
                        <div className="flex flex-col md:flex-row gap-6">
                            <img
                                src={product.image_url || "https://placehold.co/400x300"}
                                alt={product.name}
                                className="w-full md:w-48 h-32 object-cover rounded-lg shadow-sm"
                            />
                            <div className="flex-1 space-y-2">
                                <h1 className="text-2xl font-bold">{product.name}</h1>
                                <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                                <div className="flex items-center gap-2 text-yellow-500 text-sm font-medium">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>5.0 (124 avaliações)</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Customer Data */}
                    <Card className="p-8 space-y-6 shadow-md">
                        <div className="flex items-center gap-2 pb-4 border-b">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                            <h3 className="font-semibold text-lg">Seus Dados</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input placeholder="Seu nome" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" placeholder="seu@email.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Celular (Whatsapp)</Label>
                                <Input placeholder="+258 84 123 4567" />
                            </div>
                        </div>
                    </Card>

                    {/* Order Bump */}
                    {product.funnel_config?.orderBump?.enabled && (
                        <OrderBump product={product} onChange={setOrderBumpAccepted} />
                    )}
                </div>

                {/* Right: Payment Summary */}
                <div className="space-y-6">
                    <Card className="p-6 sticky top-6 shadow-xl border-primary/10">
                        <div className="flex items-center gap-2 pb-4 border-b mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                            <h3 className="font-semibold text-lg">Pagamento</h3>
                        </div>

                        {/* Payment Methods */}
                        <div className="space-y-3 mb-6">
                            <div className="p-3 border rounded-lg flex items-center gap-3 cursor-pointer bg-primary/5 border-primary">
                                <span className="text-xl">🔴</span>
                                <span className="font-medium">M-Pesa</span>
                                <div className="ml-auto w-4 h-4 rounded-full bg-primary"></div>
                            </div>
                            <div className="p-3 border rounded-lg flex items-center gap-3 cursor-pointer opacity-70 hover:opacity-100">
                                <span className="text-xl">🟠</span>
                                <span className="font-medium">e-Mola</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-3 text-sm border-t pt-4">
                            <div className="flex justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Produto:</span>
                                    <div className="text-right">
                                        {(product.offer_price && product.offer_price < product.price) && (
                                            <span className="block text-xs text-muted-foreground line-through">
                                                {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(product.price)}
                                            </span>
                                        )}
                                        <span className="font-medium">
                                            {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(product.offer_price || product.price)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {orderBumpAccepted && (
                                <div className="flex justify-between text-green-600 animate-in slide-in-from-left-2">
                                    <span>+ Order Bump:</span>
                                    <span className="font-bold">399 MT</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
                                <span>Total:</span>
                                <span className="text-primary">
                                    {(product.offer_price || product.price) + (orderBumpAccepted ? 399 : 0)} MT
                                </span>
                            </div>
                        </div>

                        <Button size="lg" className="w-full mt-6 text-lg font-bold shadow-lg shadow-primary/20" onClick={onPay}>
                            Pagar Agora - {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format((product.offer_price || product.price) + (orderBumpAccepted ? 399 : 0))}
                        </Button>

                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                            <Lock className="w-3 h-3" />
                            <span>Pagamento 100% Seguro</span>
                        </div>

                        <div className="flex justify-center gap-2 mt-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                            {/* Mock Payment Badges */}
                            <div className="h-6 w-10 bg-gray-200 rounded"></div>
                            <div className="h-6 w-10 bg-gray-200 rounded"></div>
                            <div className="h-6 w-10 bg-gray-200 rounded"></div>
                        </div>

                    </Card>

                    {/* Guarantee */}
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-card rounded-lg shadow-sm border border-border/50">
                        <ShieldCheck className="w-10 h-10 text-green-600" />
                        <div>
                            <h4 className="font-bold text-sm">Garantia de 7 Dias</h4>
                            <p className="text-xs text-muted-foreground">Se não gostar, devolvemos seu dinheiro.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
