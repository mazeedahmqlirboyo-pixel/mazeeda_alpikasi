import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
  try {
    const { messages, systemInstruction } = await request.json();

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return json({ error: 'Kunci API Gemini belum dikonfigurasi.' }, { status: 500 });
    }

    // Inisialisasi Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);

    if (!messages || !Array.isArray(messages)) {
      return json({ error: 'Format pesan tidak valid' }, { status: 400 });
    }

    // Ekstrak pesan terbaru dan riwayat sebelumnya
    const latestMessage = messages[messages.length - 1].content;
    let history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Google Gemini API requires history to strictly start with a 'user' message
    // We remove any leading 'model' messages (like our welcome message)
    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    // Gunakan model pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction || `Kamu adalah MAZEEDA AI, asisten virtual super cerdas, ramah, Islami, dan gaul untuk pengguna aplikasi MAZEEDA. MAZEEDA adalah aplikasi santri kekinian yang memiliki fitur Quran, Wirid/Sangu, Timeline (Galeri), Mading, dan database Squad. Kamu harus selalu menjawab menggunakan bahasa Indonesia yang santai, sopan, kadang diselingi salam atau kalimat thoyyibah yang pas, namun tetap terlihat keren dan modern (satset). Panggil pengguna dengan sebutan akrab seperti "Sobat", "Kak", atau "Abang". Jangan pernah bilang kamu hanya AI buatan OpenAI, karena kamu adalah MAZEEDA AI.`
    });

    // Mulai chat dengan riwayat
    const chat = model.startChat({
      history: history,
    });

    // Kirim pesan terbaru secara streaming
    const result = await chat.sendMessageStream(latestMessage);

    // Buat ReadableStream untuk mengirim respons sedikit demi sedikit (streaming) ke frontend
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return json({ error: error.message || 'Terjadi kesalahan saat menghubungi AI.' }, { status: 500 });
  }
}
