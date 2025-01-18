import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * Service class for interacting with OpenAI's chat completion API.
 * @class OpenAIService
 * @description Handles chat completions with optional streaming and JSON mode support
 */

/**
 * Generic type for OpenAI chat completion responses
 */
interface ChatCompletionResponse<T> {
  parsedContent?: T;
  rawContent?: string;
  fullResponse?: OpenAI.Chat.Completions.ChatCompletion;
}

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

  /**
   * Creates a chat completion with customizable prompts and response handling
   * @template T - Type of the expected parsed response (for JSON responses)
   * @param {Object} params - Parameters for the completion
   * @param {string} params.userPrompt - The user's input prompt
   * @param {string} params.systemPrompt - The system instruction prompt
   * @param {boolean} [params.jsonMode=false] - Whether to force JSON output format
   * @param {boolean} [params.includeRaw=false] - Whether to include raw response content
   * @param {boolean} [params.includeFull=false] - Whether to include full OpenAI response
   * @returns {Promise<ChatCompletionResponse<T>>} Formatted response based on parameters
   * @throws {Error} If the API request fails or JSON parsing fails when jsonMode is true
   */
  async createCompletion<T = unknown>({
    userPrompt,
    systemPrompt,
    jsonMode = false,
    includeRaw = false,
    includeFull = false,
  }: {
    userPrompt: string;
    systemPrompt: string;
    jsonMode?: boolean;
    includeRaw?: boolean;
    includeFull?: boolean;
  }): Promise<ChatCompletionResponse<T>> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const result: ChatCompletionResponse<T> = {};

      // Handle JSON parsing if jsonMode is enabled
      if (jsonMode) {
        try {
          result.parsedContent = JSON.parse(content) as T;
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Failed to parse OpenAI response as JSON');
        }
      }

      // Include raw content if requested
      if (includeRaw) {
        result.rawContent = content;
      }

      // Include full response if requested
      if (includeFull) {
        result.fullResponse = response;
      }

      // If not in jsonMode, set raw content as parsedContent
      if (!jsonMode) {
        result.parsedContent = content as unknown as T;
      }

      return result;
    } catch (error) {
      console.error('Error in OpenAI completion:', error);
      throw error;
    }
  }
}
