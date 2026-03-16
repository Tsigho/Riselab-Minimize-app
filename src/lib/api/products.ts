import { supabase } from "../supabase";
import type { ProductFormValues } from "../schemas/productSchema";

export const uploadProductImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

    if (uploadError) {
        throw new Error(`Error uploading image: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

    return publicUrl;
};

export const createProduct = async (productData: ProductFormValues, userId: string) => {
    const {
        name, description, price, offerPrice, isFree, deliveryType,
        downloadUrl, accessLink, postPurchaseMessage, imageUrl,
        enableUpsell, upsellProductId, upsellType,
        enableDownsell, downsellProductId, downsellType,
        enableOrderBump, orderBumpProductId,
        pixelId, enableAffiliates, affiliateCommission, salesPageUrl,
        checkoutTheme, isActive, leadFields
    } = productData;

    // Construct funnel config with types
    const funnelConfig = {
        upsell: { enabled: enableUpsell, type: upsellType, value: upsellProductId },
        downsell: { enabled: enableDownsell, type: downsellType, value: downsellProductId },
        orderBump: { enabled: enableOrderBump, productId: orderBumpProductId }
    };

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    user_id: userId,
                    name,
                    description,
                    price,
                    offer_price: offerPrice,
                    is_free: isFree,
                    delivery_type: deliveryType,
                    download_url: downloadUrl,
                    access_link: accessLink,
                    post_purchase_message: postPurchaseMessage,
                    image_url: imageUrl,
                    pixel_id: pixelId,
                    enable_affiliates: enableAffiliates,
                    affiliate_commission: affiliateCommission,
                    marketplace_visible: true, // Enforced by rule: All products must be in Global Marketplace
                    sales_page_url: salesPageUrl,
                    checkout_theme: checkoutTheme,
                    is_active: isActive,
                    lead_fields: leadFields,
                    funnel_config: funnelConfig,
                    bonuses: productData.bonuses,
                    payment_methods: productData.paymentMethods
                }
            ])
            .select()
            .single();

        if (error) {
            // Check for missing column error (code 42703 usually, or message check)
            if (error.message.includes('marketplace_visible') || error.message.includes('column')) {
                console.warn("Database schema mismatch. Retrying with legacy payload...");

                // Fallback: Insert only core fields that definitely exist
                // REMOVED: offer_price, is_free, is_active, access_link, download_url to avoid schema errors
                const legacyPayload = {
                    user_id: userId,
                    name,
                    description,
                    price,
                    image_url: imageUrl,
                };

                const { data: legacyData, error: legacyError } = await supabase
                    .from('products')
                    .insert([legacyPayload])
                    .select()
                    .single();

                if (legacyError) throw legacyError;

                alert("Produto publicado com sucesso! \n\n⚠️ AVISO: Algumas configurações (Marketplace, Funil) não foram salvas pois o Banco de Dados precisa de atualização. Contacte o administrador.");
                return legacyData;
            }
            throw error;
        }

        return data;
    } catch (error: any) {
        console.error("Supabase Create Error:", error);
        throw new Error(error.message);
    }
};

export const getProductById = async (productId: string) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

    if (error) {
        console.error("Error fetching product:", error);
        return null; // Or throw error depending on needs
    }

    return data;
};

export const deleteProduct = async (productId: string) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) throw error;
};

export const updateProduct = async (productId: string, productData: Partial<ProductFormValues>) => {
    // Similar to createProduct but for updates, with fallback protection
    const {
        name, description, price, offerPrice, isFree, deliveryType,
        downloadUrl, accessLink, postPurchaseMessage, imageUrl,
        enableUpsell, upsellProductId, upsellType,
        enableDownsell, downsellProductId, downsellType,
        enableOrderBump, orderBumpProductId,
        pixelId, enableAffiliates, affiliateCommission, salesPageUrl,
        checkoutTheme, isActive, leadFields
    } = productData;

    const funnelConfig = {
        upsell: { enabled: enableUpsell, type: upsellType, value: upsellProductId },
        downsell: { enabled: enableDownsell, type: downsellType, value: downsellProductId },
        orderBump: { enabled: enableOrderBump, productId: orderBumpProductId }
    };

    try {
        const { data, error } = await supabase
            .from('products')
            .update({
                name,
                description,
                price,
                offer_price: offerPrice,
                is_free: isFree,
                delivery_type: deliveryType,
                download_url: downloadUrl,
                access_link: accessLink,
                post_purchase_message: postPurchaseMessage,
                image_url: imageUrl,
                pixel_id: pixelId,
                enable_affiliates: enableAffiliates,
                affiliate_commission: affiliateCommission,
                marketplace_visible: true, // Enforced by rule
                sales_page_url: salesPageUrl,
                checkout_theme: checkoutTheme,
                is_active: isActive,
                lead_fields: leadFields,
                funnel_config: funnelConfig,
                bonuses: productData.bonuses,
                payment_methods: productData.paymentMethods
            })
            .eq('id', productId)
            .select()
            .single();

        if (error) {
            if (error.message.includes('marketplace_visible') || error.message.includes('column')) {
                console.warn("Update schema mismatch. Retrying with legacy payload...");
                const legacyPayload = {
                    name,
                    description,
                    price,
                    image_url: imageUrl,
                    // Minimal update to not break legacy DB
                };

                const { data: legacyData, error: legacyError } = await supabase
                    .from('products')
                    .update(legacyPayload)
                    .eq('id', productId)
                    .select()
                    .single();

                if (legacyError) throw legacyError;
                return legacyData;
            }
            throw error;
        }

        return data;
    } catch (error: any) {
        console.error("Supabase Update Error:", error);
        throw new Error(error.message);
    }
};
