# 📚 Conversation Storage System

## 🎯 **What You Get**

✅ **Per-conversation storage** - Each conversation gets its own ID and title  
✅ **Easy & accessible** - Stored in browser localStorage, viewable in dev tools  
✅ **Completely free** - No database costs  
✅ **Exportable** - Download conversations as JSON files  
✅ **Searchable** - Find specific questions/answers easily  
✅ **Persistent** - Survives browser refreshes  

## 🚀 **How It Works**

### **Automatic Storage**
- Every user question and AI response is automatically saved
- Conversations are organized by date and title
- Each conversation gets a unique ID for easy reference

### **Access Your Data**
1. **Click the 📚 button** (bottom-left corner) to view conversation history
2. **Search conversations** by title or first question
3. **View full conversations** with timestamps
4. **Download as JSON** files for backup/analysis
5. **Load previous conversations** to continue where you left off

### **Data Storage Location**
- **Browser localStorage** - Accessible via browser dev tools
- **Key**: `tts_conversations` - Contains all conversation data
- **Current conversation**: `tts_current_conversation` - Tracks active conversation

## 📁 **File Structure**

```
src/
├── services/
│   └── conversationStorage.ts    # Core storage logic
├── components/
│   └── ConversationHistory.tsx   # History viewer UI
├── hooks/
│   └── useConversationStorage.ts # React integration
└── pages/
    └── DigitalShadow.tsx        # Main app with history button
```

## 🔧 **Features**

### **Conversation Management**
- **Create new conversations** automatically
- **Load previous conversations** 
- **Delete old conversations**
- **Search by content or title**

### **Data Export**
- **Download individual conversations** as JSON
- **View raw data** in browser dev tools
- **Backup conversations** to your computer

### **Search & Filter**
- **Search by question content**
- **Filter by date range**
- **Sort by most recent**

## 💾 **Data Format**

Each conversation is stored as:

```json
{
  "id": "conv_1234567890_abc123",
  "title": "User's first question...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastUpdated": "2024-01-15T10:35:00.000Z",
  "messages": [
    {
      "id": "msg_123",
      "role": "user",
      "text": "What's your story?",
      "status": "final",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "msg_124", 
      "role": "ai",
      "text": "I'm Jason, a Hong Kong refugee...",
      "status": "final",
      "timestamp": "2024-01-15T10:30:05.000Z"
    }
  ]
}
```

## 🎯 **Perfect For Your Needs**

✅ **Per-conversation storage** - Each chat session is separate  
✅ **Easy access** - Click button to view all conversations  
✅ **Free solution** - No database or server costs  
✅ **Export capability** - Download as JSON files  
✅ **Search functionality** - Find specific questions/answers  
✅ **Persistent storage** - Survives browser refreshes  

## 🚀 **Usage**

1. **Start chatting** - Conversations are automatically saved
2. **Click 📚 button** - View your conversation history  
3. **Search & filter** - Find specific conversations
4. **Download JSON** - Export conversations for analysis
5. **Load previous** - Continue old conversations

Your conversation data is now fully under your control! 🎉
