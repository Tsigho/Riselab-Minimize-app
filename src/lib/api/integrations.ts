import { supabase } from "../supabase";

export const getIntegration = async (serviceName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_name', serviceName)
        .single();

    if (error && error.code !== 'PGRST116') { // Ignore "not found" error
        console.error(`Error fetching ${serviceName} integration:`, error);
        return null;
    }

    return data;
};

export const saveIntegration = async (serviceName: string, config: { api_token?: string, pixel_id?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Upsert logic
    const { data, error } = await supabase
        .from('user_integrations')
        .upsert({
            user_id: user.id,
            service_name: serviceName,
            api_token: config.api_token,
            updated_at: new Date()
        }, { onConflict: 'user_id, service_name' })
        .select()
        .single();

    if (error) {
        console.error(`Error saving ${serviceName} integration:`, error);
        throw error;
    }

    return data;
};
