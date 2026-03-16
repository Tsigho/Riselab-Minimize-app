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
                    download_url: downloadUrl, // 🚀 AQUI VAI O ARQUIVO REAL (PDF, etc)
                    file_url: downloadUrl,     // 🚀 Duplicado por segurança (dependendo de como o DB chama)
                    access_link: accessLink,
                    post_purchase_message: postPurchaseMessage,
                    image_url: imageUrl,
                    pixel_id: pixelId,
                    enable_affiliates: enableAffiliates,
                    affiliate_commission: affiliateCommission,
                    marketplace_visible: false, // 🚀 TRAVA 1: Nasce invisível
                    status: 'pending',          // 🚀 TRAVA 2: Vai para o Admin
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
            if (error.message.includes('marketplace_visible') || error.message.includes('column')) {
                console.warn("Database schema mismatch. Retrying with legacy payload...");

                // Fallback: Também tranca a visibilidade aqui!
                const legacyPayload = {
                    user_id: userId,
                    name,
                    description,
                    price,
                    image_url: imageUrl,
                    file_url: downloadUrl, 
                    marketplace_visible: false, // 🚀 FORCE FALSE AQUI
                    status: 'pending'           // 🚀 FORCE PENDING AQUI
                };

                const { data: legacyData, error: legacyError } = await supabase
                    .from('products')
                    .insert([legacyPayload])
                    .select()
                    .single();

                if (legacyError) throw legacyError;

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
        return null;
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
                file_url: downloadUrl, // Atualiza o arquivo
                access_link: accessLink,
                post_purchase_message: postPurchaseMessage,
                image_url: imageUrl,
                pixel_id: pixelId,
                enable_affiliates: enableAffiliates,
                affiliate_commission: affiliateCommission,
                marketplace_visible: false, // 🚀 Se editar o produto, ele volta para análise!
                status: 'pending',          // 🚀 Volta para análise!
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
                    file_url: downloadUrl,
                    marketplace_visible: false, // 🚀 FORCE PENDING AQUI
                    status: 'pending'           // 🚀 FORCE PENDING AQUI
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