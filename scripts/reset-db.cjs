
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetDatabase() {
    console.log('🗑️  Starting Database Cleanup...');

    try {
        // 1. Delete Sales Leads
        const { error: leadsError } = await supabase.from('sales_leads').delete().neq('id', 0); // Hack to delete all
        if (leadsError) console.error('⚠️ Error clearing sales_leads:', leadsError.message);
        else console.log('✅ sales_leads cleared');

        // 2. Delete Purchases
        const { error: purchasesError } = await supabase.from('purchases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (purchasesError) console.error('⚠️ Error clearing purchases:', purchasesError.message);
        else console.log('✅ purchases cleared');

        // 3. Delete Auth Users (Requires Service Role)
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('❌ Error listing users:', listError.message);
        } else {
            console.log(`Found ${users.length} users to delete.`);
            for (const user of users) {
                const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
                if (deleteError) {
                    console.error(`❌ Failed to delete user ${user.email}:`, deleteError.message);
                } else {
                    console.log(`✅ Deleted user: ${user.email}`);
                }
            }
        }

        console.log('✨ Cleanup Complete. Environment Reset.');

    } catch (error) {
        console.error('❌ Unexpected Error:', error);
    }
}

resetDatabase();
