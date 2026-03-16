
import { supabase } from "../supabase";
import { format, subDays, startOfDay, startOfMonth, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface DashboardMetrics {
    totalBalance: number;
    todaySales: number;
    monthSales: number;
    chartData: { name: string; vendas: number }[];
    recentActivity: any[];
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
    const today = new Date();
    const startOfToday = startOfDay(today).toISOString();
    const startOfCurrentMonth = startOfMonth(today).toISOString();
    const sevenDaysAgo = subDays(today, 6).toISOString(); // 7 days including today

    // 1. Fetch all paid purchases for calculations
    // In a real large-scale app, we would use RPC or dedicated metrics table.
    // For now, client-side aggregation is fine for "Clone" scale.
    const { data: allPurchases, error } = await supabase
        .from('purchases')
        .select('*')
        .or('status.eq.paid,status.eq.completed')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching metrics:", error);
        return {
            totalBalance: 0,
            todaySales: 0,
            monthSales: 0,
            chartData: [],
            recentActivity: []
        };
    }

    // 2. Calculate Totals
    const totalBalance = allPurchases.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const todaySales = allPurchases
        .filter(p => p.created_at >= startOfToday)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const monthSales = allPurchases
        .filter(p => p.created_at >= startOfCurrentMonth)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // 3. Prepare Chart Data (Last 7 Days)
    const initialChartData = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(today, 6 - i);
        return {
            date: d,
            name: format(d, 'EEE', { locale: ptBR }), // Seg, Ter, etc.
            vendas: 0
        };
    });

    allPurchases.forEach(p => {
        const pDate = parseISO(p.created_at);
        if (pDate >= parseISO(sevenDaysAgo)) {
            const chartItem = initialChartData.find(d => isSameDay(d.date, pDate));
            if (chartItem) {
                chartItem.vendas += (Number(p.amount) || 0);
            }
        }
    });

    // 4. Recent Activity (Take top 5)
    // We fetch separate recent activity including failed/pending to show full picture
    const { data: recentRaw } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    const recentActivity = (recentRaw || []).map(p => ({
        id: p.id,
        customer: p.customer_name || p.customer_email || "Cliente",
        product: p.product_name || "Produto", // Assumes product_name was saved or joined. For now use raw.
        amount: p.amount,
        status: p.status,
        time: format(parseISO(p.created_at), "HH:mm")
    }));

    return {
        totalBalance,
        todaySales,
        monthSales,
        chartData: initialChartData.map(({ name, vendas }) => ({ name, vendas })),
        recentActivity
    };
};
