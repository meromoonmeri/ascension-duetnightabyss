// ═══════════════════════════════════════════════════════════════
//  AI Helper — Unified chat completion interface
//
//  Development (Z.ai sandbox): uses z-ai-web-dev-sdk (auto-config)
//  Production (Fly.io):        uses Google Gemini (FREE)
//
//  SETUP FOR PRODUCTION — just ONE step:
//    1. Get a free API key: https://aistudio.google.com/apikey
//    2. Set it on Fly.io:  fly secrets set GEMINI_API_KEY="your-key"
//
//  That's it. No other config needed.
// ═══════════════════════════════════════════════════════════════

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Shared interface ────────────────────────────────────
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResult {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// ─── Provider detection ─────────────────────────────────
// If GEMINI_API_KEY is set → Gemini (production)
// Otherwise → z-ai-web-dev-sdk (dev sandbox)

let geminiModel: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']> | null = null;
let zaiInstance: any = null;
let provider: 'gemini' | 'zai' | null = null;

function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

async function getGeminiModel() {
  if (geminiModel) return geminiModel;
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // gemini-2.0-flash is free and fast
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  return geminiModel;
}

async function getZAI() {
  if (zaiInstance) return zaiInstance;
  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  zaiInstance = await ZAI.create();
  return zaiInstance;
}

// ─── Unified chat completion ────────────────────────────

/**
 * Send messages and get a completion.
 * Works identically whether using Gemini or ZAI.
 */
export async function chatCompletion(messages: ChatMessage[]): Promise<ChatCompletionResult> {
  // Detect provider on first call
  if (!provider) {
    provider = isGeminiAvailable() ? 'gemini' : 'zai';
    console.log(`[AI] Using provider: ${provider}`);
  }

  if (provider === 'gemini') {
    return geminiChat(messages);
  } else {
    return zaiChat(messages);
  }
}

// ─── Gemini implementation ──────────────────────────────

async function geminiChat(messages: ChatMessage[]): Promise<ChatCompletionResult> {
  const model = await getGeminiModel();

  // Gemini doesn't have "system" role in the same way.
  // We merge system messages into the first user message as context.
  let systemPrompt = '';
  const userMessages: string[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt += (systemPrompt ? '\n\n' : '') + msg.content;
    } else {
      userMessages.push(msg.content);
    }
  }

  // Build the full prompt
  let fullPrompt = '';
  if (systemPrompt) {
    fullPrompt += `INSTRUCTIONS:\n${systemPrompt}\n\n`;
  }
  fullPrompt += userMessages.join('\n\n');

  const result = await model.generateContent(fullPrompt);
  const text = result.response.text();

  return {
    choices: [{ message: { content: text } }],
  };
}

// ─── ZAI implementation ─────────────────────────────────

async function zaiChat(messages: ChatMessage[]): Promise<ChatCompletionResult> {
  const zai = await getZAI();

  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  });

  return completion;
}