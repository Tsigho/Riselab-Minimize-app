import * as z from 'zod';

export const productSchema = z.object({
    // Basic Info
    name: z.string().min(1, "Nome do produto é obrigatório"),
    description: z.string().optional(),

    price: z.preprocess(
        (val) => (val === "" ? 0 : Number(val)),
        z.number().min(0, "Preço inválido")
    ).refine((val) => !isNaN(val), "Preço deve ser um número válido"),

    offerPrice: z.preprocess(
        (val) => (val === "" || val === undefined ? undefined : Number(val)),
        z.number().optional()
    ).refine((val) => val === undefined || !isNaN(val), "Preço de oferta deve ser um número válido"),
    isFree: z.boolean().default(false),

    // Delivery
    deliveryType: z.enum(['file', 'link']).default('file'),
    downloadUrl: z.string().optional().or(z.literal("")),
    accessLink: z.string().optional().or(z.literal("")), // Removed .url() validation
    postPurchaseMessage: z.string().optional(),

    // Media
    imageUrl: z.string().optional().or(z.literal("")), // Relaxed from .url()

    // Funnel / Advanced
    enableUpsell: z.boolean().default(false),
    upsellType: z.enum(['internal', 'external']).default('internal'),
    upsellProductId: z.string().optional().or(z.literal("")),

    enableDownsell: z.boolean().default(false),
    downsellType: z.enum(['internal', 'external']).default('internal'),
    downsellProductId: z.string().optional().or(z.literal("")),

    enableOrderBump: z.boolean().default(false),
    orderBumpProductId: z.string().optional().or(z.literal("")),

    // Tracking & Affiliate
    pixelId: z.string().optional().or(z.literal("")),
    enableAffiliates: z.boolean().default(false),
    affiliateCommission: z.preprocess(
        (val) => (val === "" || val === undefined ? undefined : Number(val)),
        z.number().min(0).max(100).optional()
    ).refine((val) => val === undefined || !isNaN(val), "Comissão deve ser um número válido"),
    marketplaceVisible: z.boolean().default(true),
    salesPageUrl: z.string().optional().or(z.literal("")), // Removed .url() validation

    // Checkout Design
    checkoutTheme: z.enum(['classic', 'mpesa', 'dark', 'high-converter']).default('classic'),
    isActive: z.boolean().default(true),

    // Leads
    leadFields: z.array(z.string()).default(['name', 'email', 'phone']),

    // Create Product Wizard specific
    bonuses: z.array(z.object({
        name: z.string().optional(), // Relaxed
        description: z.string().optional(),
        fileUrl: z.string().optional(),
        fileName: z.string().optional()
    })).default([]),

    paymentMethods: z.array(z.enum(['emola', 'mpesa', 'credit_card', 'google_pay', 'apple_pay', 'pix'])).default(['emola', 'mpesa']),

    // Main Product File
    mainProductFileUrl: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
