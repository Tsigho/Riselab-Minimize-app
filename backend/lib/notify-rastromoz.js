const crypto = require('crypto');

/**
 * Envia dados da venda para o RastroMoz via Webhook
 * @param {Object} data
 * @param {number} data.amount
 * @param {string} data.currency
 * @param {string} data.transactionId
 * @param {string|null} data.clickId
 * @param {string} data.productName
 * @param {string} data.customerEmail
 */
async function sendSaleToRastroMoz(data) {
    if (!data.clickId) {
        console.log('[Riselab] Venda sem rastreio (Orgânica). Ignorando Webhook.');
        return;
    }

    const endpoint = 'https://rastromoz.app/api/webhooks/riselab';
    const secret = process.env.WEBHOOK_SECRET || "default_secret_change_me";

    // 1. Montar o Payload Padrão
    const payload = {
        event_type: "purchase.approved",
        click_id: data.clickId,
        amount: data.amount,
        currency: data.currency,
        transaction_id: data.transactionId,
        product_name: data.productName,
        customer_email: data.customerEmail
    };

    const payloadString = JSON.stringify(payload);

    // 2. Gerar Assinatura HMAC-SHA256
    const signature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

    try {
        console.log(`[Riselab] Enviando webhook para RastroMoz... Ref: ${data.transactionId}`);

        // 3. Disparar o Webhook (S2S)
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-riselab-signature': signature
            },
            body: payloadString
        });

        if (response.ok) {
            const text = await response.text();
            console.log(`[Riselab] ✅ Sucesso! RastroMoz respondeu: ${text}`);
        } else {
            console.error(`[Riselab] ❌ Erro ao notificar RastroMoz: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('[Riselab] ❌ Falha na conexão com RastroMoz:', error.message);
    }
}

module.exports = { sendSaleToRastroMoz };
