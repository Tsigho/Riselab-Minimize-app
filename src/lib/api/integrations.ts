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

    // Merge with local storage metadata if available (Schema Fallback)
    const localMetadata = localStorage.getItem(`integration_metadata_${serviceName}`);
    let mergedData = { ...data };

    if (localMetadata) {
        try {
            const parsed = JSON.parse(localMetadata);
            mergedData.metadata = { ...data.metadata, ...parsed };
        } catch (e) {
            console.error("Error parsing local metadata:", e);
        }
    }

    return mergedData;
};

export const saveIntegration = async (serviceName: string, config: { api_token?: string, pixel_id?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Upsert logic with metadata (Try First)
    try {
        const { data, error } = await supabase
            .from('user_integrations')
            .upsert({
                user_id: user.id,
                service_name: serviceName,
                api_token: config.api_token,
                metadata: config, // Store full config as JSONB
                updated_at: new Date()
            }, { onConflict: 'user_id, service_name' })
            .select()
            .single();

        if (error) throw error;
        return data;

    } catch (metadataError) {
        console.warn(`Database metadata save failed, trying fallback (${serviceName}):`, metadataError);

        // Fallback: Save only API Token (Legacy schema support)
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
            console.error(`Error saving ${serviceName} integration (Final):`, error);
            throw error;
        }

        // Persist metadata locally since DB doesn't support it yet
        try {
            localStorage.setItem(`integration_metadata_${serviceName}`, JSON.stringify(config));
        } catch (e) {
            console.error("Local storage save failed:", e);
        }

        return { ...data, metadata: config }; // Return combined data so UI works
    }
};
