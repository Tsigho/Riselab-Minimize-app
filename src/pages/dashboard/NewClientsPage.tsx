import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../../components/ui/Table";
import { Input, Button, Badge } from "../../components/ui/Primitives";
import {
    Search, MessageCircle, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { toast } from "sonner";

export function NewClientsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchLeads();
    }, []);

    async function fetchLeads() {
        // Busca os últimos 50 clientes/leads
        const { data, error } = await supabase
            .from('sales_leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) console.error(error);
        if (data) setLeads(data);
        setLoading(false);
    }

    // Filtra pelo nome ou telefone
    const filteredLeads = leads.filter(lead =>
        lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customer_phone?.includes(searchTerm)
    );

    // Função para abrir o WhatsApp Web direto na conversa
    const handleOpenWhatsapp = (phone: string, name: string, status: string) => {
        let message = "";
        if (status === 'pending') {
            message = `Olá ${name}! Vi que você tentou comprar no Minimizing e não concluiu. Ficou alguma dúvida?`;
        } else if (status === 'paid') {
            message = `Olá ${name}! Obrigado pela compra. Já acessou seu produto?`;
        }

        // Formata o telefone (remove espaços e caracteres)
        const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
        if (!cleanPhone) {
            toast.error("Telefone inválido");
            return;
        }
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6">

            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <UsersIcon className="h-8 w-8 text-green-500" />
                        Gestão de Clientes & Leads
                    </h2>
                    <p className="text-muted-foreground">
                        Acompanhe quem comprou e quem abandonou o carrinho. Recupere vendas aqui.
                    </p>
                </div>

                {/* BARRA DE PESQUISA */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar nome ou telefone..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* TABELA DE CLIENTES */}
            <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-white/5 border-white/10">
                            <TableHead className="text-muted-foreground">Cliente</TableHead>
                            <TableHead className="text-muted-foreground">Produto / Valor</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-muted-foreground">Data</TableHead>
                            <TableHead className="text-right text-muted-foreground">Ação Rápida</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    Carregando leads...
                                </TableCell>
                            </TableRow>
                        ) : filteredLeads.map((lead) => (
                            <TableRow key={lead.id} className="border-white/5 hover:bg-white/5 transition-colors">

                                {/* NOME E TELEFONE */}
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{lead.customer_name || "Anônimo"}</span>
                                        <span className="text-xs text-muted-foreground">{lead.customer_phone}</span>
                                    </div>
                                </TableCell>

                                {/* PRODUTO */}
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-gray-300">{lead.product_name}</span>
                                        <span className="text-xs font-mono text-green-400">{new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(lead.amount || 0)}</span>
                                    </div>
                                </TableCell>

                                {/* STATUS (O Segredo Visual) */}
                                <TableCell>
                                    <StatusBadge status={lead.status} />
                                </TableCell>

                                {/* DATA */}
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(lead.created_at).toLocaleDateString('pt-PT')} <br />
                                    {new Date(lead.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                </TableCell>

                                {/* BOTÃO DO WHATSAPP */}
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-500 text-white gap-2 shadow-lg shadow-green-900/20"
                                        onClick={() => handleOpenWhatsapp(lead.customer_phone, lead.customer_name, lead.status)}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Chamar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {filteredLeads.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    Nenhum cliente encontrado recentemenente.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// COMPONENTE VISUAL DE STATUS
function StatusBadge({ status }: { status: string }) {
    if (status === 'paid' || status === 'completed') {
        return (
            <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 gap-1">
                <CheckCircle2 className="h-3 w-3" /> Pago
            </Badge>
        );
    }
    if (status === 'pending') {
        return (
            <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 gap-1">
                <Clock className="h-3 w-3" /> Pendente
            </Badge>
        );
    }
    return (
        <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 gap-1">
            <XCircle className="h-3 w-3" /> Falhou
        </Badge>
    );
}

function UsersIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )
}
