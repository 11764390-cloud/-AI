export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const response = await fetch('/api/tts', {
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
