// Extract chunks from buffer based on sentence boundaries
function extractChunks(buffer: string, max = 200): { chunks: string[]; rest: string } {
  const out: string[] = [];
  let rest = buffer;
  
  // Split on sentence boundaries (preserve punctuation)
  const SENTENCE = /(?<=[.!?…])\s+/g;
  const parts = rest.split(SENTENCE);
  rest = '';
  let acc = '';
  
  for (const p of parts) {
    const candidate = acc ? acc + ' ' + p : p;
    
    // Always emit complete sentences, regardless of length
    // Only split if we have multiple sentences and exceed reasonable limit
    if (candidate.length > max && acc && acc.includes('.')) {
      let cleanText = acc.trim();
      // Remove trailing periods, but keep exclamation marks and question marks
      if (cleanText.endsWith('.')) {
        cleanText = cleanText.slice(0, -1);
      }
      out.push(cleanText);
      acc = p;
    } else {
      acc = candidate;
    }
    
    // Hard break on newline - emit immediately
    if (/\n/.test(acc)) {
      let cleanText = acc.replace(/\n+/g, ' ').trim();
      // Remove trailing periods, but keep exclamation marks and question marks
      if (cleanText.endsWith('.')) {
        cleanText = cleanText.slice(0, -1);
      }
      out.push(cleanText);
      acc = '';
    }
  }
  
  // If we have a complete sentence, emit it (remove trailing periods for cleaner visuals)
  if (acc.trim() && (acc.includes('.') || acc.includes('!') || acc.includes('?'))) {
    let cleanText = acc.trim();
    // Remove trailing periods, but keep exclamation marks and question marks
    if (cleanText.endsWith('.')) {
      cleanText = cleanText.slice(0, -1);
    }
    out.push(cleanText);
    acc = '';
  }
  
  rest = acc; // leftover incomplete chunk stays in buffer
  return { chunks: out.filter(Boolean), rest };
}

export async function streamChat(
  userText: string,
  onChunkReady: (text: string) => void,
  onBufferFlush: () => void
): Promise<{ text: string; audioUrl?: string }> {
  
  // Get threadId from localStorage
  const threadId = localStorage.getItem('threadId');
  
  const requestBody = { 
    mode: 'stream', 
    message: userText,
    threadId: threadId 
  };
  
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Could not read error response');
    console.error('[SSE] Request failed:', res.status, errorText);
    throw new Error(`network-${res.status}: ${errorText}`);
  }
  
  if (!res.body) {
    console.error('[SSE] No response body');
    throw new Error('no-body');
  }
  
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let final: { text: string; audioUrl?: string } | null = null;
  let buffer = '';
  let chunkCount = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    
    chunkCount++;
    const chunk = decoder.decode(value, { stream: true });
    
    for (const raw of chunk.split('\n')) {
      if (!raw.startsWith('data:')) continue;
      try {
        const payload = JSON.parse(raw.slice(5).trim());
        if (payload.type === 'thread_id') {
          localStorage.setItem('threadId', payload.threadId);
        }
        if (payload.type === 'delta') {
          
          // Accumulate in buffer
          buffer += payload.text;
          
          // Try to extract complete chunks
          const result = extractChunks(buffer);
          buffer = result.rest;
          
          // Emit each complete chunk
          for (const completeChunk of result.chunks) {
            onChunkReady(completeChunk);
          }
        }
        if (payload.type === 'final') {
          final = { text: payload.text, audioUrl: payload.audioUrl };
        }
      } catch (e) {
        console.error('[SSE] Parse error for line:', raw, e);
      }
    }
  }
  
  // Emit any remaining buffer as final chunk
  if (buffer.trim()) {
    onChunkReady(buffer.trim());
    buffer = '';
  }
  
  // Notify that buffer is flushed
  onBufferFlush();
  
  if (!final) {
    console.error('[SSE] No final response received');
    throw new Error('no-final');
  }
  
  return final;
}

