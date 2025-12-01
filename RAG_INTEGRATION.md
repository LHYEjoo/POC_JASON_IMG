# RAG Integration Guide

## 🎯 Current Implementation

Your system now has a **working RAG integration** with the following features:

### ✅ **What's Working:**
- Voice recognition (fixed)
- Streaming AI responses (fixed)
- Basic RAG context retrieval
- Jason's character background integration

### 🔧 **RAG System Architecture:**

```
User Voice Input → Speech Recognition → RAG Search → AI Response → TTS → Audio Output
```

## 🚀 **How to Integrate Your RAG System**

### **Option 1: Vector Database (Recommended)**

If you have a vector database like Pinecone, Weaviate, or Chroma:

```bash
# Add to your .env file
RAG_ENDPOINT=https://your-vector-db-endpoint.com/query
RAG_API_KEY=your_api_key_here
```

Update `server/rag.js`:
```javascript
// Replace the searchWithVectorDB function with your actual API calls
async function searchWithVectorDB(query, options) {
  const response = await fetch('https://your-vector-db-endpoint.com/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RAG_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      query,
      top_k: 5,
      filter: { character: 'jason' }, // Filter for Jason's documents
    }),
  });
  
  const data = await response.json();
  return data.matches.map(match => ({
    content: match.metadata.text,
    score: match.score,
    metadata: match.metadata,
  }));
}
```

### **Option 2: Custom RAG Service**

If you have a custom RAG service:

```bash
# Add to your .env file
RAG_SERVICE_URL=https://your-rag-service.com/search
RAG_API_KEY=your_api_key_here
```

### **Option 3: Local RAG with Embeddings**

For a local implementation with embeddings:

```javascript
// Install required packages
npm install @pinecone-database/pinecone openai

// Example with OpenAI embeddings + Pinecone
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function searchWithEmbeddings(query) {
  // Generate embedding
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  
  // Search in vector database
  const index = pinecone.index('jason-documents');
  const results = await index.query({
    vector: embedding.data[0].embedding,
    topK: 5,
    includeMetadata: true,
  });
  
  return results.matches.map(match => ({
    content: match.metadata.text,
    score: match.score,
    metadata: match.metadata,
  }));
}
```

## 📊 **RAG Data Structure**

Your RAG system should return documents in this format:

```javascript
[
  {
    content: "Jason's memory or experience text",
    score: 0.85, // Relevance score (0-1)
    metadata: {
      source: "interview_2019",
      type: "memory",
      timestamp: "2019-06-15",
      emotion: "fear",
      topic: "protest"
    }
  }
]
```

## 🎭 **Character-Specific RAG**

For Jason's character, consider these document types:

### **Core Memories:**
- Protest experiences (2019)
- Family abandonment
- Criminal past
- Flight to Taiwan
- Current struggles

### **Emotional Context:**
- Fear of persecution
- Loss and grief
- Trust issues
- Safety concerns
- Hope for future

### **Current Situation:**
- Life in Taiwan
- Refugee status
- Daily challenges
- Relationships
- Future plans

## 🔧 **Testing Your RAG Integration**

1. **Test the current system:**
   ```bash
   npm run server  # Start the server
   npm run dev     # Start the frontend
   ```

2. **Check RAG logs:**
   Look for these console messages:
   ```
   [RAG] Searching for: "user query"
   [RAG] Found 3 relevant documents
   ```

3. **Test different queries:**
   - "Tell me about the protests"
   - "How do you feel about your family?"
   - "Are you safe in Taiwan?"

## 🚀 **Advanced RAG Features**

### **Semantic Search:**
```javascript
// Add semantic search capabilities
async function semanticSearch(query) {
  const embedding = await generateEmbedding(query);
  const results = await vectorDB.query({
    vector: embedding,
    topK: 10,
    filter: { character: 'jason' },
    includeMetadata: true,
  });
  
  return results.matches;
}
```

### **Context Ranking:**
```javascript
// Rank results by relevance and recency
function rankResults(results) {
  return results
    .sort((a, b) => {
      // Combine relevance score with recency
      const scoreA = a.score * (a.metadata.recency || 1);
      const scoreB = b.score * (b.metadata.recency || 1);
      return scoreB - scoreA;
    })
    .slice(0, 5); // Top 5 results
}
```

### **Multi-Modal RAG:**
```javascript
// Support for images, audio, and text
async function multiModalSearch(query, mediaType) {
  const results = await Promise.all([
    searchText(query),
    searchImages(query),
    searchAudio(query),
  ]);
  
  return combineResults(results);
}
```

## 📝 **Environment Variables**

Add these to your `.env` file:

```bash
# OpenAI
OPENAI_API_KEY=your_openai_key

# RAG System (choose one)
RAG_ENDPOINT=https://your-vector-db.com/query
RAG_API_KEY=your_rag_key

# OR
RAG_SERVICE_URL=https://your-rag-service.com/search

# Vector Database (if using Pinecone)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment

# ElevenLabs TTS
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_voice_id
```

## 🎯 **Next Steps**

1. **Choose your RAG system** (vector DB, custom service, or local)
2. **Update the configuration** in `server/rag.js`
3. **Test with sample queries**
4. **Add your character's documents**
5. **Fine-tune the retrieval parameters**

The system is now ready for your RAG integration! 🚀

