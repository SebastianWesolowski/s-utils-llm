import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * Service class for interacting with OpenAI's chat completion API.
 * @class OpenAIService
 * @description Handles chat completions with optional streaming and JSON mode support
 */
export class OpenAIService {
  private openai: OpenAI;

  /**
   * Creates an instance of OpenAIService.
   * @constructor
   * @description Initializes the OpenAI client using environment variables
   */
  constructor() {
    this.openai = new OpenAI();
  }

  /**
   * Generates a chat completion using OpenAI's API.
   * @async
   * @param {ChatCompletionMessageParam[]} messages - Array of chat messages to send to OpenAI
   * @param {string} [model="gpt-4"] - The OpenAI model to use for completion
   * @param {boolean} [stream=false] - Whether to stream the response
   * @param {boolean} [jsonMode=false] - Whether to force JSON output format
   * @returns {Promise<OpenAI.Chat.Completions.ChatCompletion | AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>>}
   * Returns either a complete response or a stream of chunks based on the stream parameter
   * @throws {Error} Throws an error if the API request fails
   * @example
   * // Regular completion
   * const response = await openAIService.completion([
   *   { role: 'user', content: 'Hello!' }
   * ]);
   *
   * // Streaming completion
   * const stream = await openAIService.completion([
   *   { role: 'user', content: 'Hello!' }
   * ], 'gpt-4', true);
   *
   * // JSON mode completion
   * const jsonResponse = await openAIService.completion([
   *   { role: 'user', content: 'Return JSON data' }
   * ], 'gpt-4', false, true);
   */
  async completion(
    messages: ChatCompletionMessageParam[],
    model = 'gpt-4',
    stream = false,
    jsonMode = false
  ): Promise<OpenAI.Chat.Completions.ChatCompletion | AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    try {
      const chatCompletion = await this.openai.chat.completions.create({
        messages,
        model,
        stream,
        response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
      });

      // Log messages and chat completion to prompt.md
      const fs = require('fs');
      const path = require('path');

      const logContent = `Messages:\n${JSON.stringify(
        messages,
        null,
        2
      )}\n\nChat Completion:\n${JSON.stringify(chatCompletion, null, 2)}\n\n`;

      fs.appendFileSync(path.join(__dirname, 'prompt.md'), logContent);

      if (stream) {
        return chatCompletion as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
      } else {
        return chatCompletion as OpenAI.Chat.Completions.ChatCompletion;
      }
    } catch (error) {
      console.error('Error in OpenAI completion:', error);
      throw error;
    }
  }

  /**
   * Transcribes audio file to text using OpenAI's Whisper model
   * @param audio - Audio file to transcribe
   * @param options - Optional configuration for transcription
   * @param options.language - Language code of the audio (default: 'en')
   * @param options.model - Whisper model to use (default: 'whisper-1')
   * @param options.responseFormat - Format of the response (default: 'json')
   * @returns Transcribed text from the audio file
   * @throws Error if transcription fails
   */
  async speechToText(
    audio: File,
    options: {
      language?: string;
      model?: string;
      responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    } = {}
  ): Promise<string> {
    const { language = 'en', model = 'whisper-1', responseFormat = 'json' } = options;

    try {
      const response = await this.openai.audio.transcriptions.create({
        file: audio,
        model,
        language,
        response_format: responseFormat,
      });

      return response.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }
}
