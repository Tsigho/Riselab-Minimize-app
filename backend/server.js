const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const Groq = require("groq-sdk");
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios'); // IMPORTANTE: Adicionado axios para a chamada à PaySuite
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(cors({
    origin: '*', // Se preferir, pode colocar 'https://riselab-frontend.vercel.app' aqui depois para mais segurança
    methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(bodyParser.json());

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🚀 CONFIGURAÇÃO DO GROQ (BLINDADA CONTRA O GITHUB)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

let sock;

async function connectToWhatsApp(socket = null) {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Usando versão do WA v${version.join('.')}, é a mais recente? ${isLatest}`);

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: require('pino')({ level: 'silent' }),
        browser: ["Minimizing App", "Chrome", "1.0.0"],
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (msg.key.fromMe) continue;

            const text = msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption || "";

            if (!text) continue;
            console.log('📩 Cliente:', text);

            try {
                // 1. TENTA REGRA MANUAL (Prioridade Máxima)
                const respondeuManual = await handleAutomation(sock, msg, text);

                // 2. SE NÃO ACHOU, CHAMA A IA (Groq)
                if (!respondeuManual) {
                    await handleAIResponse(sock, msg, text);
                }
            } catch (error) {
                console.error('❌ ERRO AO PROCESSAR MENSAGEM:', error);
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('\n⚡ ESCANEIE O QR CODE ABAIXO ⚡\n');
            qrcode.generate(qr, { small: true });
            io.emit('qr', qr);
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão caiu. Reconectando...');
            if (shouldReconnect) setTimeout(connectToWhatsApp, 2000);
        } else if (connection === 'open') {
            console.log('✅ BOT ONLINE E PRONTO PARA RESPONDER!');
            io.emit('connection_status', 'connected');
            if (sock.user) {
                io.emit('user_info', { id: sock.user.id || 'unknown', name: sock.user.name || 'Usuário' });
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    if (socket && sock?.user) {
        socket.emit('connection_status', 'connected');
    }
}

// 🧠 NOVA FUNÇÃO DE IA (GROQ)
async function handleAIResponse(sock, msg, userText) {
    const remoteJid = msg.key.remoteJid;

    // 1. BUSCAR TUDO
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(10);

    if (error) {
        console.error('❌ Erro Supabase:', error.message);
    }

    if (products && products.length > 0) {
        console.log('📦 Exemplo de produto encontrado:', products[0]);
    }

    // 3. FORMATAÇÃO INTELIGENTE
    let catalogoTexto = "";
    if (products && products.length > 0) {
        catalogoTexto = products.map(p => {
            const nome = p.title || p.name || p.nome || p.product_name || "Produto Sem Nome";
            const preco = p.price || p.preco || p.valor || "0";
            const desc = p.description || p.descricao || "";

            return `- 🏷️ ${nome} | 💰 ${preco} MT | 📝 ${desc}`;
        }).join('\n');
    } else {
        catalogoTexto = "Estoque vazio no momento.";
    }

    console.log('🤖 Consultando Groq (Llama 3.3)...');
    await sock.sendPresenceUpdate('composing', remoteJid);

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `
                    Você é o Vendedor Inteligente do Marketplace Minimizing.
                    Sua missão é vender! Seja persuasivo, educado e breve.
                    Moeda: Metical (MT).

                    --- ESTOQUE ATUALIZADO (USE ISSO PARA RESPONDER) ---
                    ${catalogoTexto}
                    ----------------------------------------------------

                    REGRAS:
                    1. Se o cliente perguntar o que tem, ofereça os produtos da lista acima.
                    2. Se o cliente perguntar preço, consulte a lista e responda o valor exato.
                    3. Se a lista estiver vazia, peça desculpas e peça para voltar mais tarde.
                    4. Use emojis. Máximo 3 parágrafos curtos.
                    `
                },
                { role: "user", content: userText }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        const resposta = completion.choices[0]?.message?.content || "Desculpe, tive um lapso de memória.";

        await sock.sendMessage(remoteJid, { text: resposta }, { quoted: msg });

    } catch (error) {
        console.error("Erro no Groq:", error);
        await sock.sendMessage(remoteJid, { text: "Estou com muita demanda agora, tente novamente em 1 minuto! 🤯" });
    }
}

// FUNÇÃO MANUAL
async function handleAutomation(sock, msg, userText) {
    const remoteJid = msg.key.remoteJid;
    const { data: automations, error } = await supabase
        .from('whatsapp_automations')
        .select('*')
        .eq('is_active', true);

    if (error || !automations) return false;

    const trigger = automations.find(rule => {
        const input = userText.toLowerCase();
        const keyword = rule.keyword.toLowerCase();
        if (rule.match_type === 'exact') return input === keyword;
        return input.includes(keyword);
    });

    if (trigger) {
        console.log(`🤖 Ops, regra manual encontrada: ${trigger.keyword}`);
        await sock.sendPresenceUpdate('composing', remoteJid);
        await new Promise(r => setTimeout(r, 1000));
        await sock.sendMessage(remoteJid, { text: trigger.response_text }, { quoted: msg });
        return true;
    }
    return false;
}

connectToWhatsApp();

io.on('connection', (socket) => {
    console.log('Frontend connected:', socket.id);
    if (sock?.user) {
        socket.emit('connection_status', 'connected');
    } else {
        socket.emit('connection_status', 'disconnected');
    }
    socket.on('check_status', async () => {
        const { state } = await useMultiFileAuthState('auth_info_baileys');
        const isConnected = !!sock?.user || !!state?.creds?.me;
        socket.emit('connection_status', isConnected ? 'connected' : 'disconnected');
    });

    socket.on('disconnect', () => {
        console.log('Frontend disconnected:', socket.id);
    });
});

const { sendSaleToRastroMoz } = require('./lib/notify-rastromoz');

// 🚀 A ROTA DA PAYSUITE CORRIGIDA (AGORA ELA FORÇA A URL DE RETORNO)
app.post('/api/pagar-paysuite', async (req, res) => {
    console.log('Recebido pedido de pagamento:', req.body);

    // Puxa os dados que o frontend enviou
    const { customer_name, customer_email, phone, amount, channel, reference, return_url } = req.body;

    // 🛡️ A MÁGICA: Se o frontend esquecer, nós injetamos o return_url à força
    const safeReturnUrl = return_url || "https://riselab-frontend.vercel.app/checkout-success";

    try {
        const payloadParaPaySuite = {
            customer_name: customer_name,
            customer_email: customer_email || "cliente@minimizing.com",
            phone: phone,
            amount: amount,
            channel: channel,
            reference: reference,
            return_url: safeReturnUrl // O campo obrigatório que faltava
        };

        // Faz a chamada real para a API da PaySuite
        // NOTA: Certifique-se que no painel do Render tem a variável PAYSUITE_API_KEY
        const response = await axios.post("https://pay.paysuite.co.mz/api/v1/payments", payloadParaPaySuite, {
            headers: {
                "Authorization": `Bearer ${process.env.PAYSUITE_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        console.log("PaySuite Sucesso:", response.data);
        return res.json({ success: true, data: response.data });

    } catch (error) {
        console.error("Erro na PaySuite:", error.response?.data || error.message);
        return res.status(422).json({
            success: false,
            message: "Erro ao gerar link na PaySuite",
            details: error.response?.data || error.message
        });
    }
});


// WEBHOOK
app.post('/webhook/payment', async (req, res) => {
    const { reference, status, amount, customer_name } = req.body;
    console.log('🔹 Webhook Received:', req.body);

    if (!reference || !status) {
        return res.status(400).json({ error: "Missing reference or status" });
    }

    try {
        const { data, error } = await supabase
            .from('purchases')
            .update({ status: status === 'completed' ? 'paid' : status })
            .eq('transaction_ref', reference)
            .select();

        if (error) console.error('Error updating DB:', error);
        else console.log('✅ DB Updated:', data);

        // --- RASTROMOZ INTEGRATION ---
        if (data && data.length > 0 && (status === 'completed' || status === 'paid')) {
            const purchase = data[0];

            sendSaleToRastroMoz({
                amount: amount,
                currency: "MZN",
                transactionId: reference,
                clickId: purchase.click_id,
                productName: "Produto RiseLab",
                customerEmail: "cliente@email.com"
            });

            io.emit('payment_received', {
                reference,
                amount,
                customer: customer_name || "Cliente",
                timestamp: new Date().toISOString()
            });

            if (purchase.customer_phone) {
                const { error: leadError } = await supabase
                    .from('sales_leads')
                    .update({ status: 'paid' })
                    .eq('customer_phone', purchase.customer_phone)
                    .eq('amount', amount)
                    .eq('status', 'pending');

                if (leadError) console.error('❌ Erro ao atualizar Lead:', leadError);
                else console.log('✅ Lead atualizado para PAID');
            }
        }

    } catch (err) {
        console.error('Supabase Exception:', err);
    }

    return res.status(200).json({ received: true });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Gateway running on ${PORT}`));