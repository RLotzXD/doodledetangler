import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { TWEETS_SYSTEM_PROMPT, buildTweetsUserPrompt } from '@/lib/prompts';
import { Part } from '@google/generative-ai';
import mammoth from 'mammoth';

export const maxDuration = 120;

const GEMINI_SUPPORTED_MIME_PREFIXES = ['image/', 'audio/', 'video/'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function isGeminiNativeType(mimeType: string): boolean {
  return GEMINI_SUPPORTED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))
    || mimeType === 'application/pdf';
}

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
    return buffer.toString('utf-8');
  }

  return buffer.toString('utf-8');
}

async function fileToParts(file: File): Promise<Part[]> {
  if (isGeminiNativeType(file.type)) {
    const buffer = await file.arrayBuffer();

    if (file.type.startsWith('audio/') && file.size > MAX_FILE_SIZE) {
      const totalSize = buffer.byteLength;
      const chunkSize = MAX_FILE_SIZE - 1024;
      const chunks: Part[] = [];

      for (let offset = 0; offset < totalSize; offset += chunkSize) {
        const chunk = buffer.slice(offset, Math.min(offset + chunkSize, totalSize));
        const base64 = Buffer.from(chunk).toString('base64');
        chunks.push({
          inlineData: { mimeType: file.type, data: base64 },
        } as Part);
      }
      return chunks;
    }

    const base64 = Buffer.from(buffer).toString('base64');
    return [{
      inlineData: { mimeType: file.type, data: base64 },
    } as Part];
  }

  const text = await extractTextFromFile(file);
  return [{ text: `FILE "${file.name}":\n${text}` } as Part];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const briefText = (formData.get('briefText') as string) || '';
    const notesText = (formData.get('notesText') as string) || '';

    const parts: Part[] = [];

    parts.push({ text: TWEETS_SYSTEM_PROMPT } as Part);
    parts.push({ text: buildTweetsUserPrompt(briefText) } as Part);

    if (notesText.trim()) {
      parts.push({ text: `MEETING NOTES:\n${notesText}` } as Part);
    }

    const fileEntries = formData.getAll('files');
    for (const entry of fileEntries) {
      if (entry instanceof File) {
        if (!entry.type.startsWith('audio/') && entry.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File "${entry.name}" exceeds 20MB limit` },
            { status: 400 }
          );
        }
        const fileParts = await fileToParts(entry);
        parts.push(...fileParts);
      }
    }

    const briefFileEntry = formData.get('briefFile');
    if (briefFileEntry instanceof File) {
      if (briefFileEntry.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'Brief file exceeds 20MB limit' },
          { status: 400 }
        );
      }

      if (isGeminiNativeType(briefFileEntry.type)) {
        const buffer = await briefFileEntry.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        parts.push({
          inlineData: { mimeType: briefFileEntry.type, data: base64 },
        } as Part);
      } else {
        const text = await extractTextFromFile(briefFileEntry);
        parts.push({ text: `CLIENT BRIEF DOCUMENT:\n${text}` } as Part);
      }
    }

    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text();

    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(jsonStr);

    if (!parsed.tweets || !Array.isArray(parsed.tweets)) {
      return NextResponse.json(
        { error: 'AI returned unexpected format' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Tweets error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Tweets generation failed' },
      { status: 500 }
    );
  }
}
