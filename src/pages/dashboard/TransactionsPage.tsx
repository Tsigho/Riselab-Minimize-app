
import { Search, Download, Filter } from "lucide-react";

const transactions = [
    { ref: "RISETSIGHO001", date: "12/01/2026", role: "Vendedor", gross: 5000, fee: 250, net: 4750, status: "Concluído", utm_source: "facebook", utm_campaign: "lancamento_jan" },
    { ref: "RISETSIGHO002", date: "12/01/2026", role: "Afilhado", gross: 1200, fee: 60, net: 1140, status: "Pendente", utm_source: "instagram" },
    { ref: "RISETSIGHO003", date: "11/01/2026", role: "Vendedor", gross: 850, fee: 42.5, net: 807.5, status: "Falhou", utm_source: "google" },
    { ref: "RISETSIGHO004", date: "10/01/2026", role: "Vendedor", gross: 15000, fee: 750, net: 14250, status: "Concluído" },
    { ref: "RISETSIGHO005", date: "09/01/2026", role: "Afilhado", gross: 300, fee: 15, net: 285, status: "Concluído", utm_source: "email_list" },
];

export const TransactionsPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Minhas Transações</h1>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrar
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-md">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            <div className="rounded-xl glass-panel shadow-sm overflow-hidden border-green-500/10">
                <div className="p-4 border-b border-white/5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por referência..."
                            className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-4">Referência</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Origem</th>
                                <th className="px-6 py-4">Função</th>
                                <th className="px-6 py-4 text-right">Valor Bruto</th>
                                <th className="px-6 py-4 text-right">Taxa (App)</th>
                                <th className="px-6 py-4 text-right">A Receber</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.map((tx: any) => (
                                <tr key={tx.ref} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{tx.ref}</td>
                                    <td className="px-6 py-4">{tx.date}</td>
                                    <td className="px-6 py-4">
                                        {tx.utm_source ? (
                                            <div className="flex items-center gap-2" title={`Campanha: ${tx.utm_campaign || 'N/A'}`}>
                                                {tx.utm_source === 'facebook' && <span className="text-blue-600 bg-blue-100 p-1 rounded-sm text-xs font-bold">FB</span>}
                                                {tx.utm_source === 'instagram' && <span className="text-pink-600 bg-pink-100 p-1 rounded-sm text-xs font-bold">IG</span>}
                                                {tx.utm_source === 'google' && <span className="text-red-500 bg-red-100 p-1 rounded-sm text-xs font-bold">G</span>}
                                                <span className="text-xs text-muted-foreground capitalize">{tx.utm_source}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.role === "Vendedor" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                            }`}>
                                            {tx.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">MT {tx.gross.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-destructive text-xs">
                                        - MT {tx.fee.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                                        MT {tx.net.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === "Concluído" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                                            tx.status === "Pendente" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
