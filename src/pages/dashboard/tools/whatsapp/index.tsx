import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "../../../../components/ui/Primitives";

import { WhatsAppInbox } from "./Inbox";
import { WhatsAppCampaigns } from "./Campaigns";
import { WhatsAppAutomation } from "../WhatsAppAutomation";
import { io } from "socket.io-client";

// Connect to the backend
const socket = io("http://localhost:3001");

export const WhatsAppPage = () => {
    // State: 'disconnected' | 'connecting' | 'connected'
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [qrCode, setQrCode] = useState<string>("");

    useEffect(() => {
        // ... existing listeners ...
        socket.on('connect', () => {
            console.log('Connected to WhatsApp Gateway');
            socket.emit('check_status'); // Check immediately on connect
        });

        socket.on('qr', (qr) => {
            console.log('QR Code Received');
            setQrCode(qr);
            setConnectionStatus('disconnected');
        });

        socket.on('connection_status', (status) => {
            console.log('Status update:', status);
            if (status === 'connected') {
                setConnectionStatus('connected');
            } else {
                setConnectionStatus('disconnected');
            }
        });

        // Polling interval to check status every 3 seconds
        const interval = setInterval(() => {
            if (connectionStatus !== 'connected') {
                socket.emit('check_status');
            }
        }, 3000);

        return () => {
            socket.off('connect');
            socket.off('qr');
            socket.off('connection_status');
            clearInterval(interval);
        };
    }, [connectionStatus]);

    if (connectionStatus === 'connected') {
        return <WhatsAppDashboard />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            {/* ... keep existing JSX ... */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Conectar WhatsApp Real</h1>
                <p className="text-muted-foreground">Escaneie o QR Code para integrar seu número à plataforma.</p>
                <div className="flex items-center justify-center gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded-full inline-flex mx-auto border border-yellow-200">
                    <AlertCircle className="w-3 h-3" />
                    Certifique-se de que o backend está rodando na porta 3001
                </div>
                <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => socket.emit('check_status')}>
                        Já escaneei, verificar agora
                    </Button>
                </div>
            </div>

            <Card className="p-10 flex flex-col items-center justify-center gap-8 border-2 border-dashed">
                {/* ... existing card content ... */}
                {connectionStatus === 'connecting' ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-green-500" />
                        <p className="font-medium animate-pulse">Conectando ao dispositivo...</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            {qrCode ? (
                                <QRCodeSVG value={qrCode} size={256} />
                            ) : (
                                <div className="w-64 h-64 bg-gray-100 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                    <span>Aguardando QR Code do Backend...</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4 text-center max-w-sm">
                            <ol className="text-left text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                                <li>Abra o WhatsApp no seu celular</li>
                                <li>Toque em Menu (⋮) ou Configurações</li>
                                <li>Selecione <strong>Aparelhos Conectados</strong></li>
                                <li>Toque em <strong>Conectar um aparelho</strong></li>
                                <li>Aponte a câmera para esta tela</li>
                            </ol>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

const WhatsAppDashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        WhatsApp Automation <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">Online (Baileys)</Badge>
                    </h1>
                    <p className="text-muted-foreground">Gerencie suas campanhas e atendimentos.</p>
                </div>
            </div>

            <Tabs defaultValue="automations" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
                    <TabsTrigger value="inbox">Inbox</TabsTrigger>
                    <TabsTrigger value="automations">Automações</TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns" className="space-y-4">
                    <WhatsAppCampaigns />
                </TabsContent>

                <TabsContent value="inbox" className="space-y-4">
                    <WhatsAppInbox />
                </TabsContent>

                <TabsContent value="automations" className="space-y-4">
                    <WhatsAppAutomation />
                </TabsContent>
            </Tabs>
        </div>
    );
};
