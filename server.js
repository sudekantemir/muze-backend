// Gerekli kütüphaneleri çağır
require('dotenv').config(); // .env dosyasındaki değişkenleri oku
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// JSON verilerini okuyabilmek için gerekli middleware
app.use(express.json());

// public klasörünü statik dosyalar (3D modeller, resimler, css vb.) için tanımla
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa isteği geldiğinde index.html dosyasını gönder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================
// AI İŞLEME ROTASI (GÜVENLİ)
// =============================
app.post('/ask', async (req, res) => {
    try {
        const { question, modelName } = req.body;
        
        // API anahtarını güvenli bir şekilde .env dosyasından çekiyoruz
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Sen bir sanat tarihçisisin. '${modelName}' eseri hakkında şu soruyu yanıtla: ${question}`;
        const result = await model.generateContent(prompt);
        
        res.json({ answer: result.response.text() });
    } catch (error) {
        console.error("AI Hatası:", error);
        res.status(500).json({ error: "Yapay zeka yanıt veremedi." });
    }
});

// Sunucuyu başlat
app.listen(PORT, '0.0.0.0', () => {
console.log(`Sunucu http://0.0.0.0:${PORT} adresinde başarıyla çalışıyor`);
console.log('Tüm ağ bağlantılarına açık.');
});
app.post('/ask', express.json(), async (req, res) => {
    try {
        const { question, modelName } = req.body;
        // .env dosyasındaki anahtarı burada kullanıyoruz
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Sen bir sanat tarihçisisin. '${modelName}' eseri hakkında şu soruyu yanıtla: ${question}`;
        const result = await model.generateContent(prompt);
        
        res.json({ answer: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: "Yapay zeka yanıt veremedi." });
    }
});