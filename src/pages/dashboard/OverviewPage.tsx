import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Wallet, Users, ArrowUpRight, ArrowDownRight, Activity, DollarSign, CreditCard
} from 'lucide-react';

// DADOS FALSOS PARA O GRÁFICO (Depois ligamos no Supabase)
const data = [
    { name: 'Seg', valor: 4000 },
    { name: 'Ter', valor: 3000 },
    { name: 'Qua', valor: 2000 },
    { name: 'Qui', valor: 2780 },
    { name: 'Sex', valor: 1890 },
    { name: 'Sáb', valor: 2390 },
    { name: 'Dom', valor: 3490 },
];

export const OverviewPage = () => {
    return (
        <div className="space-y-8 relative overflow-hidden">

            {/* LUZ DE FUNDO (Aquele brilho verde no topo) */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-green-600/10 blur-[120px] pointer-events-none rounded-full" />

            {/* CABEÇALHO */}
            <div className="flex justify-between items-center relative z-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
                    <p className="text-muted-foreground">Bem-vindo de volta.</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-green-900/20 transition-all">
                    + Novo Saque
                </button>
            </div>

            {/* CARDS DE ESTATÍSTICAS (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <StatsCard
                    title="Saldo Total"
                    value="124.500 MT"
                    icon={Wallet}
                    trend="+12%"
                    color="green"
                />
                <StatsCard
                    title="Vendas Hoje"
                    value="4.200 MT"
                    icon={Activity}
                    trend="+5%"
                    color="blue"
                />
                <StatsCard
                    title="Novos Clientes"
                    value="34"
                    icon={Users}
                    trend="+18%"
                    color="purple"
                />
                <StatsCard
                    title="Gastos (Ads)"
                    value="1.200 MT"
                    icon={CreditCard}
                    trend="-2%"
                    color="red"
                />
            </div>

            {/* ÁREA PRINCIPAL: GRÁFICO + ÚLTIMAS VENDAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

                {/* GRÁFICO GRANDE (O destaque visual) */}
                <div className="lg:col-span-2 bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Receita Semanal</h3>
                        <span className="text-xs bg-slate-800 text-green-400 px-2 py-1 rounded-full border border-green-900">
                            +22.5% vs semana passada
                        </span>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    {/* O SEGREDO DO VISUAL: DEGRADÊ VERDE */}
                                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}MT`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#22c55e' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="valor"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValor)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* LISTA LATERAL (Últimas Transações) */}
                <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Últimas Transações</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-green-900/30 transition-colors">
                                        <DollarSign className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Venda Curso React</p>
                                        <p className="text-xs text-muted-foreground">Há 2 min • M-Pesa</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-green-400">+500 MT</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-sm text-muted-foreground hover:text-green-400 transition-colors">
                        Ver tudo
                    </button>
                </div>

            </div>
        </div>
    );
}

// COMPONENTE DO CARD PEQUENO (Reutilizável)
function StatsCard({ title, value, icon: Icon, trend, color }: any) {
    const isPositive = trend.startsWith('+');
    return (
        <div className="bg-card/50 border border-border p-6 rounded-2xl backdrop-blur-sm hover:border-slate-700 transition-all hover:-translate-y-1 shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-500/10`}>
                    <Icon className={`h-6 w-6 text-${color}-500`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full 
          ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trend}
                </div>
            </div>
            <div>
                <h4 className="text-muted-foreground text-sm font-medium">{title}</h4>
                <h2 className="text-2xl font-bold text-foreground mt-1">{value}</h2>
            </div>
        </div>
    );
}
