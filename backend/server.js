const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const Groq = require("groq-sdk");
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(bodyParser.json());

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CONFIGURAÇÃO DO GROQ
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

let sock;

async function connectToWhatsApp(socket = null) {
    const { version, isLatest } = await fetchLatestBaileysVersion();
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
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
            if (!text) continue;

            try {
                const respondeuManual = await handleAutomation(sock, msg, text);
                if (!respondeuManual) {
                    await handleAIResponse(sock, msg, text);
                }
            } catch (error) {
                console.error('❌ ERRO AO PROCESSAR MENSAGEM:', error);
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log('\n⚡ ESCANEIE O QR CODE ABAIXO ⚡\n');
            qrcode.generate(qr, { small: true });
            io.emit('qr', qr);
        }
        if (connection === 'close') {
            setTimeout(connectToWhatsApp, 2000);
        } else if (connection === 'open') {
            console.log('✅ BOT ONLINE!');
            io.emit('connection_status', 'connected');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// IA E AUTOMAÇÃO (Mantidos conforme seu original)
async function handleAIResponse(sock, msg, userText) {
    const remoteJid = msg.key.remoteJid;
    const { data: products } = await supabase.from('products').select('*').eq('is_active', true).limit(10);

    let catalogoTexto = products?.map(p => `- 🏷️ ${p.title} | 💰 ${p.price} MT`).join('\n') || "Estoque vazio.";

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `Você é o Vendedor do Minimizing. Use este estoque: ${catalogoTexto}` },
                { role: "user", content: userText }
            ],
            model: "llama-3.3-70b-versatile",
        });
        await sock.sendMessage(remoteJid, { text: completion.choices[0]?.message?.content }, { quoted: msg });
    } catch (e) { console.error(e); }
}

async function handleAutomation(sock, msg, userText) {
    const { data: automations } = await supabase.from('whatsapp_automations').select('*').eq('is_active', true);
    if (!automations) return false;
    const trigger = automations.find(rule => userText.toLowerCase().includes(rule.keyword.toLowerCase()));
    if (trigger) {
        await sock.sendMessage(msg.key.remoteJid, { text: trigger.response_text }, { quoted: msg });
        return true;
    }
    return false;
}

connectToWhatsApp();

// 🚀 A ROTA DA PAYSUITE PARA GERAR LINK DE CHECKOUT (CORRIGIDA)
app.post('/api/pagar-paysuite', async (req, res) => {
    console.log('Recebido pedido de link de checkout:', req.body);
    const { customer_name, customer_email, phone, amount, reference, return_url } = req.body;

    try {
        const payloadParaPaySuite = {
            customer_name,
            customer_email: customer_email || "cliente@minimizing.com",
            phone,
            amount: Number(amount),
            reference,
            currency: "MZN",
            return_url: return_url || "https://riselab-minimize-app.vercel.app/checkout-success.html",
            cancel_url: "https://riselab-minimize-app.vercel.app/checkout.html"
        };

        // 🎯 Endpoint de CHECKOUT para gerar a página da PaySuite
        const response = await axios.post("https://api.paysuite.co.mz/v1/checkout", payloadParaPaySuite, {
            headers: {
                "Authorization": `Bearer ${process.env.PAYSUITE_API_KEY}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        console.log("Link gerado com sucesso!");
        // A API de checkout geralmente retorna a URL em data.payment_url ou data.url
        const paymentUrl = response.data.payment_url || response.data.url || response.data.data?.url;

        return res.json({ success: true, url: paymentUrl });

    } catch (error) {
        const erroDetalhado = error.response?.data || error.message;
        console.error("Erro na PaySuite Checkout:", erroDetalhado);
        return res.status(422).json({ success: false, details: erroDetalhado });
    }
});

// WEBHOOK E PORTA (Mantidos conforme seu original)
app.post('/webhook/payment', async (req, res) => {
    const { reference, status } = req.body;
    if (status === 'completed' || status === 'paid') {
        await supabase.from('purchases').update({ status: 'paid' }).eq('transaction_ref', reference);
    }
    return res.status(200).json({ received: true });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Gateway running on ${PORT}`));