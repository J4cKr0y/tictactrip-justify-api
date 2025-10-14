// src/features/justification/controllers/JustifyController.test.ts
import { Request, Response, NextFunction } from 'express';
import { JustifyController } from './JustifyController';
import { JustifierService } from '../JustifierService';
import { RateLimitService } from '../../ratelimit/services/RateLimitService';

// Mocks basiques
const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn();
    return res;
};

describe('JustifyController Unit Tests', () => {
    let justifyController: JustifyController;
    let mockJustifierService: JustifierService;
    let mockRateLimitService: RateLimitService;
    let res: Response;
    const TEST_TOKEN = 'test-token-123';
    const MOCK_WORD_COUNT = 100;
    const MOCK_BODY = 'Some sample text';

    beforeEach(() => {
        mockJustifierService = { justify: jest.fn() } as unknown as JustifierService;
        mockRateLimitService = { 
            incrementWordCount: jest.fn(),
            getWordsConsumed: jest.fn()
        } as unknown as RateLimitService;
        
        justifyController = new JustifyController(mockJustifierService, mockRateLimitService);
        res = mockResponse() as Response;

        jest.clearAllMocks();
    });

    // Cas standard 
    it('should justify text and return 200 after successful word count increment', () => {
        // Arrange
        const mockJustified = 'Justified text here...';
        (mockJustifierService.justify as jest.Mock).mockReturnValue(mockJustified);
        (mockRateLimitService.incrementWordCount as jest.Mock).mockReturnValue(true);
        
        const req = {
            header: jest.fn(() => 'text/plain'),
            clientToken: TEST_TOKEN,
            textBody: MOCK_BODY,
            wordCount: MOCK_WORD_COUNT
        } as unknown as Request;

        // Act
        justifyController.justifyText(req, res);

        // Assert
        expect(mockJustifierService.justify).toHaveBeenCalledWith(MOCK_BODY);
        expect(mockRateLimitService.incrementWordCount).toHaveBeenCalledWith(TEST_TOKEN, MOCK_WORD_COUNT);
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(mockJustified);
    });

    //  Si sécurité textBody manquant
    it('should return 400 if textBody is missing from the request', () => {
        // Arrange
        const req = {
            header: jest.fn(() => 'text/plain'),
            clientToken: TEST_TOKEN,
            // textBody est manquant (undefined)
        } as unknown as Request;

        // Act
        justifyController.justifyText(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Request body must contain text/plain content.');
        expect(mockJustifierService.justify).not.toHaveBeenCalled();
    });
    
    // Si sécurité incrementation échoue
    it('should return 402 if word count increment fails (security check)', () => {
        // Arrange
        (mockRateLimitService.incrementWordCount as jest.Mock).mockReturnValue(false); // Le cas critique
        
        const req = {
            header: jest.fn(() => 'text/plain'),
            clientToken: TEST_TOKEN,
            textBody: MOCK_BODY,
            wordCount: MOCK_WORD_COUNT
        } as unknown as Request;

        // Act
        justifyController.justifyText(req, res);

        // Assert
        expect(mockJustifierService.justify).toHaveBeenCalled(); // La justification a lieu avant l'incrémentation
        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Payment Required'));
    });
    
    // Validation Content-Type 
    it('should return 415 if Content-Type is not text/plain', () => {
        // Arrange
        const req = {
            header: jest.fn(() => 'application/json'), // Content-Type incorrect
            clientToken: TEST_TOKEN,
            textBody: MOCK_BODY,
            wordCount: MOCK_WORD_COUNT
        } as unknown as Request;

        // Act
        justifyController.justifyText(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(415);
        expect(res.send).toHaveBeenCalledWith('Unsupported Media Type. Expected Content-Type: text/plain');
        expect(mockJustifierService.justify).not.toHaveBeenCalled();
    });
});