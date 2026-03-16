import { useState } from "react";
import { Plus, Calendar, Users, BarChart2, MoreHorizontal, Send, Clock, AlertCircle } from "lucide-react";
import { Card, Button, Input, Label, Badge } from "../../../../components/ui/Primitives";
import { campaigns } from "./data";

export const WhatsAppCampaigns = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold">Campanhas</h2>
                    <p className="text-sm text-muted-foreground">Gerencie seus disparos em massa.</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Campanha
                </Button>
            </div>

            {/* Campaign List */}
            <div className="grid gap-4">
                {campaigns.map(camp => (
                    <Card key={camp.id} className="p-5 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${camp.status === 'completed' ? 'bg-green-100 text-green-600' :
                                    camp.status === 'active' ? 'bg-blue-100 text-blue-600' :
                                        'bg-orange-100 text-orange-600'
                                }`}>
                                {camp.status === 'completed' ? <Send className="w-5 h-5" /> :
                                    camp.status === 'active' ? <BarChart2 className="w-5 h-5" /> :
                                        <Clock className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">{camp.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {camp.date}</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {camp.sent} contatos</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-center">
                                <span className="block text-2xl font-bold">{camp.opened}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Aberturas</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl font-bold">{(camp.opened / (camp.sent || 1) * 100).toFixed(0)}%</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Conv.</span>
                            </div>

                            <Badge variant="secondary" className={`capitalize px-3 py-1 ${camp.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                    camp.status === 'active' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                        'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}>
                                {camp.status === 'completed' ? 'Enviado' :
                                    camp.status === 'active' ? 'Enviando' : 'Agendado'}
                            </Badge>

                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Mock Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-2xl p-6 space-y-6 animate-in zoom-in-95 bg-background shadow-2xl">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h2 className="text-xl font-bold">Nova Campanha</h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>✕</Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome da Campanha</Label>
                                <Input placeholder="Ex: Oferta Relâmpago" />
                            </div>
                            <div className="space-y-2">
                                <Label>Público Alvo</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option>Todos os Clientes</option>
                                    <option>Compraram nos últimos 30 dias</option>
                                    <option>Abandonaram Carrinho</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Mensagem</Label>
                            <textarea className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Olá {nome}, aproveite nossa oferta..." />
                            <p className="text-xs text-muted-foreground">Variáveis disponíveis: {'{nome}'}, {'{email}'}, {'{produto}'}</p>
                        </div>

                        <div className="flex items-center gap-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Envios em massa podem causar banimento se não respeitarem as políticas do WhatsApp. Use com moderação.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                            <Button onClick={() => { alert('Campanha Criada!'); setShowModal(false); }}>
                                <Send className="w-4 h-4 mr-2" />
                                Agendar Disparo
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
