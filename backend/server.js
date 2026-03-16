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
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(bodyParser.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

let sock;

async function connectToWhatsApp(socket = null) {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    sock = makeWASocket({ version, auth: state, printQRInTerminal: false, browser: ["Minimizing App", "Chrome", "1.0.0"] });
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
            if (msg.key.fromMe) continue;
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
            if (!text) continue;
            try {
                const respondeuManual = await handleAutomation(sock, msg, text);
                if (!respondeuManual) { await handleAIResponse(sock, msg, text); }
            } catch (error) { console.error('❌ ERRO WA:', error); }
        }
    });
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) { qrcode.generate(qr, { small: true }); io.emit('qr', qr); }
        if (connection === 'close') setTimeout(connectToWhatsApp, 2000);
        else if (connection === 'open') io.emit('connection_status', 'connected');
    });
    sock.ev.on('creds.update', saveCreds);
}

// IA E AUTOMAÇÃO
async function handleAIResponse(sock, msg, userText) {
    const remoteJid = msg.key.remoteJid;
    const { data: products } = await supabase.from('products').select('*').eq('is_active', true).limit(10);
    let catalogoTexto = products?.map(p => `- 🏷️ ${p.title} | 💰 ${p.price} MT`).join('\n') || "Estoque vazio.";
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: `Vendedor Minimizing. Estoque: ${catalogoTexto}` }, { role: "user", content: userText }],
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

// 🚀 ROTA PAYSUITE BLINDADA COM LINK .TECH
app.post('/api/pagar-paysuite', async (req, res) => {
    console.log('--- NOVO PEDIDO DE PAGAMENTO (TECH) ---');
    const { customer_name, customer_email, phone, amount, reference, return_url } = req.body;

    let cleanPhone = phone ? phone.replace(/\D/g, '') : "";
    if (cleanPhone.length === 9) cleanPhone = '258' + cleanPhone;

    try {
        const payloadParaPaySuite = {
            customer_name: customer_name || "Cliente RiseLab",
            customer_email: customer_email || "cliente@minimizing.com",
            phone: cleanPhone,
            amount: Number(amount),
            reference: reference || "RISE" + Date.now(),
            currency: "MZN",
            return_url: return_url || "https://riselab-minimize-app.vercel.app/checkout-success.html",
            cancel_url: "https://riselab-minimize-app.vercel.app/"
        };

        // 🎯 O LINK CORRECTO INDICADO POR VOCÊ
        const response = await axios.post("https://paysuite.tech/api/v1/payments", payloadParaPaySuite, {
            headers: {
                "Authorization": `Bearer ${process.env.PAYSUITE_API_KEY}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        console.log("Resposta Bruta PaySuite:", JSON.stringify(response.data));

        // Captura o link de redirecionamento (Pode estar em vários campos)
        const paymentUrl = response.data.url || 
                           response.data.payment_url || 
                           (response.data.data && (response.data.data.url || response.data.data.payment_url));

        if (paymentUrl) {
            console.log("✅ Sucesso! Link gerado.");
            return res.json({ success: true, url: paymentUrl });
        } else {
            return res.status(422).json({ 
                success: false, 
                details: "Link não encontrado na resposta", 
                full_response: response.data 
            });
        }

    } catch (error) {
        const erroDetalhado = error.response?.data || error.message;
        console.error("❌ Erro na PaySuite:", JSON.stringify(erroDetalhado));
        return res.status(422).json({ success: false, details: erroDetalhado });
    }
});

app.post('/webhook/payment', async (req, res) => {
    const { reference, status } = req.body;
    if (status === 'completed' || status === 'paid') {
        await supabase.from('purchases').update({ status: 'paid' }).eq('transaction_ref', reference);
    }
    return res.status(200).json({ received: true });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Gateway running on ${PORT}`));