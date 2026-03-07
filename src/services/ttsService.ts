export async function generateSpeech(text: string): Promise<string | null> {
  try {
    // 替换为您的 Zeabur 域名，例如 https://kids-story.zeabur.app/api/tts
    const response = await fetch('https://ai-diotisionded.zeabur.app/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.audioBase64 || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
