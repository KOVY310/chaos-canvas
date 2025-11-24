// lib/ai.ts - Free AI Co-Pilot (Pure TypeScript + Hugging Face Free API)
// NO Python/C++ dependencies! Pure JS Whisper + HF API

// @ts-ignore - Dynamic import for browser/server compatibility
let transcriber: any = null;

// 1. Voice → Text (Whisper – free self-host, pure JS)
export async function voiceToText(audioBuffer: ArrayBuffer | Blob, language = 'cs'): Promise<string> {
  try {
    console.log('🎤 Loading Whisper model (first time: ~30s)...');
    
    // Dynamic import – PURE JAVASCRIPT, no Python needed
    const { pipeline } = await import('@xenova/transformers');
    
    if (!transcriber) {
      transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-large-v3');
    }
    
    console.log(`🎤 Transcribing audio (${language})...`);
    
    // Convert Blob/Buffer to raw audio data
    const audioData = audioBuffer instanceof Blob 
      ? await audioBuffer.arrayBuffer() 
      : audioBuffer;
    
    const result = await transcriber(audioData, { language });
    console.log(`✅ Transcribed: "${result.text}"`);
    return result.text;
  } catch (error) {
    console.error('❌ Transcription error:', error);
    throw error;
  }
}

// 2. Text → Image (Stable Diffusion via FREE Hugging Face API)
export async function textToImage(prompt: string, style = 'meme'): Promise<string> {
  try {
    const fullPrompt = `${prompt}, ${style} style, viral tiktok, high quality, 4k, hd`;
    
    console.log(`🎨 Generating image: "${fullPrompt}"`);
    
    // FREE Hugging Face Inference API (1000 requests/den bez klíče)
    // Stabilní model: Stable Diffusion 3.5
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        inputs: fullPrompt,
        // Optional: seed for reproducibility
      }),
      timeout: 60000, // 60s timeout (model generation)
    } as any);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HF API ${response.status}: ${error}`);
    }

    // Get image as Blob
    const blob = await response.blob();
    
    // Convert to base64 for canvas
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    console.log('✅ Image generated successfully');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('❌ Image generation error:', error);
    throw error;
  }
}

// 3. Text → Video (Free tier: return image, Pro users can upgrade to Replicate)
export async function textToVideo(prompt: string, duration = 15): Promise<string> {
  try {
    console.log(`🎬 Video generation (free: returning image, Pro: use Replicate API)...`);
    
    // FREE TIER: Vracíme obrázek (lze rozšířit na Replicate free tier 1M/měsíc)
    const image = await textToImage(prompt, 'surreal');
    
    console.log('✅ Video frame generated (upgrade to Pro for full video)');
    return image;
  } catch (error) {
    console.error('❌ Video generation error:', error);
    throw error;
  }
}

// Multimodální flow (voice/text → image/video)
export async function generateChaos(
  inputType: 'text' | 'voice',
  inputData: string | ArrayBuffer | Blob,
  style = 'meme'
): Promise<{ image: string; video: string; text: string }> {
  try {
    let text: string;
    
    if (inputType === 'voice') {
      console.log('🎤 Voice input detected...');
      text = await voiceToText(inputData as ArrayBuffer | Blob);
    } else {
      text = inputData as string;
    }
    
    if (!text.trim()) {
      throw new Error('No text generated from input');
    }
    
    console.log(`✅ Generating chaos: "${text}"`);
    
    const image = await textToImage(text, style);
    const video = await textToVideo(text, 15);
    
    return { image, video, text };
  } catch (error) {
    console.error('❌ generateChaos error:', error);
    throw error;
  }
}
