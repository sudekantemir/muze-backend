const API_KEY = process.env.GEMINI_API_KEY; // Burası böyle kalacak, anahtarı Render'a ekleyeceğiz
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    async function askGemini() {
        const input = document.getElementById('userQuestion').value;
        const responseDiv = document.getElementById('aiResponse');
        const errorDiv = document.getElementById('errorMessage');
        const btn = document.getElementById('askBtn');

        if (!input) return;

        // Arayüzü hazırla
        btn.disabled = true;
        btn.innerText = "Düşünüyor...";
        errorDiv.style.display = "none";
        responseDiv.innerText = "Yanıt bekleniyor...";

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: input }] }]
                })
            });

            const data = await response.json();

            // Eğer API bir hata döndürdüyse (404, 400, 403 vb.)
            if (!response.ok) {
                throw new Error(data.error ? data.error.message : "Bilinmeyen bir hata oluştu.");
            }

            // Yanıtı yazdır
            const textResponse = data.candidates[0].content.parts[0].text;
            responseDiv.innerText = textResponse;

        } catch (error) {
            console.error("Hata Detayı:", error);
            errorDiv.innerText = "Hata: " + error.message;
            errorDiv.style.display = "block";
            responseDiv.innerText = "İşlem başarısız.";
        } finally {
            btn.disabled = false;
            btn.innerText = "Mesaj Gönder";
        }
    }