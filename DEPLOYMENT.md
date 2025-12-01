# Vercel Deployment Guide

## Prerequisites

This project requires the following environment variables to be set in your Vercel project:

### Required Environment Variables

1. **OpenAI Configuration:**
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `OPENAI_ASSISTANT_ID` - Your OpenAI Assistant ID

2. **ElevenLabs Configuration:**
   - `ELEVENLABS_API_KEY` - Your ElevenLabs API key
   - `ELEVENLABS_VOICE_ID` - Your ElevenLabs Voice ID (optional, defaults to 'UgBBYS2sOqTuMpoF3BR0')

## Deployment Steps

1. **Connect your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Vite configuration

2. **Set Environment Variables:**
   - In your Vercel project dashboard, go to Settings > Environment Variables
   - Add all the required environment variables listed above

3. **Deploy:**
   - Vercel will automatically build and deploy your project
   - The build process will:
     - Run `npm run build` to create the production build
     - Copy static assets from `public/` directory
     - Deploy API routes from `api/` directory

## Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── chat.js            # Chat API endpoint
│   ├── tts.js             # Text-to-speech API endpoint
│   ├── healthz.js         # Health check endpoint
│   └── local-rag.js        # Local RAG functionality
├── public/                 # Static assets (served at root)
│   ├── img/               # Images
│   └── icons/             # Icons
├── src/                    # React source code
├── dist/                   # Build output (generated)
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies and scripts
```

## API Endpoints

- `POST /api/chat` - Chat with AI assistant
- `POST /api/tts` - Convert text to speech
- `GET /api/healthz` - Health check

## Static Assets

All static assets (images, icons) are now properly placed in the `public/` directory and will be included in the Vercel deployment.

## Troubleshooting

- **Images not loading:** Ensure all images are in the `public/` directory
- **API errors:** Check that all environment variables are set correctly
- **Build failures:** Ensure all dependencies are in `package.json`
