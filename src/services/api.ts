export async function postTTS(text: string) {
  
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "audio/mpeg, audio/mp4;q=0.9" // Force MP3 or AAC for iOS
    },
    body: JSON.stringify({ 
      text,
      // Add volume normalization hint
      normalize_volume: true
    }),
  });
  
  
  if (!res.ok) {
    console.error('[TTS] TTS request failed:', res.status, res.statusText);
    throw new Error("tts-failed");
  }
  
  // The new API returns audio directly, so we need to create a blob URL
  const audioBlob = await res.blob();
  
  // Log audio type for debugging
  
  const audioUrl = URL.createObjectURL(audioBlob);
  
  return { audioUrl };
}
