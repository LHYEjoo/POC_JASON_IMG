import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build-time diagnostics for environment variables (logged in Vercel build output)
console.log('[build] VERCEL_ENV:', process.env.VERCEL_ENV || 'undefined')
console.log('[build] NODE_ENV:', process.env.NODE_ENV || 'undefined')
console.log('[build] VITE_SUPABASE_URL present?', !!(process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL))
console.log('[build] VITE_SUPABASE_ANON_KEY present?', !!(process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
console.log('[build] VITE_OPENAI_API_KEY present?', !!process.env.VITE_OPENAI_API_KEY)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy configuration removed for Vercel deployment
    // In production, Vercel handles API routes directly
    // For local development, you can add proxy back if needed
  },
})
