import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { OpenAIService } from '../OpenAIService';

// Mock OpenAI and fs modules
jest.mock('openai');
jest.mock('fs');
jest.mock('path');

describe('OpenAIService', () => {
  let openAIService: OpenAIService;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup mock for OpenAI chat completions create method
    mockCreate = jest.fn();
    (OpenAI as jest.MockedClass<typeof OpenAI>).prototype.chat = {
      completions: {
        create: mockCreate,
      },
    } as any;

    openAIService = new OpenAIService();
  });

  describe('completion', () => {
    const mockMessages = [{ role: 'user' as const, content: 'Hello!' }];

    it('should handle regular completion successfully', async () => {
      // Arrange
      const expectedResponse = {
        id: 'test-id',
        choices: [{ message: { content: 'Hello there!' } }],
      };
      mockCreate.mockResolvedValueOnce(expectedResponse);

      // Act
      const result = await openAIService.completion(mockMessages);

      // Assert
      expect(result).toBe(expectedResponse);
      expect(mockCreate).toHaveBeenCalledWith({
        messages: mockMessages,
        model: 'gpt-4',
        stream: false,
        response_format: { type: 'text' },
      });
    });

    it('should handle streaming completion', async () => {
      // Arrange
      const mockStream = {
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.resolve({ done: true, value: undefined }),
        }),
      };
      mockCreate.mockResolvedValueOnce(mockStream);

      // Act
      const result = await openAIService.completion(mockMessages, 'gpt-4', true);

      // Assert
      expect(result).toBe(mockStream);
      expect(mockCreate).toHaveBeenCalledWith({
        messages: mockMessages,
        model: 'gpt-4',
        stream: true,
        response_format: { type: 'text' },
      });
    });

    it('should handle JSON mode completion', async () => {
      // Arrange
      const expectedResponse = {
        id: 'test-id',
        choices: [{ message: { content: '{"key": "value"}' } }],
      };
      mockCreate.mockResolvedValueOnce(expectedResponse);

      // Act
      const result = await openAIService.completion(mockMessages, 'gpt-4', false, true);

      // Assert
      expect(result).toBe(expectedResponse);
      expect(mockCreate).toHaveBeenCalledWith({
        messages: mockMessages,
        model: 'gpt-4',
        stream: false,
        response_format: { type: 'json_object' },
      });
    });

    it('should log messages and completion to prompt.md', async () => {
      // Arrange
      const expectedResponse = {
        id: 'test-id',
        choices: [{ message: { content: 'Hello there!' } }],
      };
      mockCreate.mockResolvedValueOnce(expectedResponse);
      const mockAppendFileSync = fs.appendFileSync as jest.Mock;
      const mockJoin = path.join as jest.Mock;
      mockJoin.mockReturnValue('/mock/path/prompt.md');

      // Act
      await openAIService.completion(mockMessages);

      // Assert
      expect(mockAppendFileSync).toHaveBeenCalledWith('/mock/path/prompt.md', expect.stringContaining('Messages:'));
    });

    it('should handle API errors properly', async () => {
      // Arrange
      const expectedError = new Error('API Error');
      mockCreate.mockRejectedValueOnce(expectedError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(openAIService.completion(mockMessages)).rejects.toThrow('API Error');
      expect(consoleSpy).toHaveBeenCalledWith('Error in OpenAI completion:', expectedError);
    });
  });
});
