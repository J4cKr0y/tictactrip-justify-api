// src/features/justification/JustifierService.test.ts

import { JustifierService } from './JustifierService';

describe('JustifierService', () => {
    const service = new JustifierService();
    const LINE_LENGTH = 80;

    // Test 1: Vérifie le cas de base (la contrainte la plus importante)
    it('should ensure all lines are exactly 80 characters long, except possibly the last one', () => {
        const text = "Ceci est un test de justification de texte. Il faut que ce texte soit suffisamment long pour dépasser la ligne des 80 caractères et forcer l'algorithme à insérer des espaces supplémentaires pour aligner le texte correctement, tout en respectant la limite. Tictactrip est une super entreprise.";
        
        const justifiedText = service.justify(text);
        const lines = justifiedText.split('\n');

        // Vérifier toutes les lignes sauf la dernière
        lines.slice(0, -1).forEach((line, index) => {
            expect(line.length).toBe(LINE_LENGTH);
        });

        // La dernière ligne peut être plus courte
        if (lines.length > 0) {
            expect(lines[lines.length - 1].length).toBeLessThanOrEqual(LINE_LENGTH);
        }
    });

    // Test 2: Gérer un texte vide
    it('should return an empty string for empty input', () => {
        expect(service.justify('')).toBe('');
    });

    // Test 3: Gérer un texte plus court qu'une ligne
    it('should return the text unchanged if it is shorter than the line length', () => {
        const shortText = "Petit texte.";
        expect(service.justify(shortText)).toBe(shortText);
    });

    // Test 4: Gérer un mot plus long que la limite (doit passer maintenant)
    it('should not throw an error and handle a single word longer than 80 chars by placing it on its own line', () => {
        // Un mot très long de 100 caractères (80 + 20)
        const longWord = 'a'.repeat(100); 
        
        const justified = service.justify(longWord);
        const lines = justified.split('\n');
        
        // La première ligne (et seule) doit être le mot non-splitté
        expect(lines[0].length).toBe(100); 
        expect(lines.length).toBe(1); 
    });

    // Test 5: Vérifier la justification des espaces (doit passer maintenant)
    it('should correctly justify a paragraph to fill the line with spaces', () => {
        const input = "Ceci est un court paragraphe pour tester l'alignement juste. Il doit y avoir assez de mots pour forcer une deuxième ligne.";
        
        // Nouvelle expectedLine1, incluant 'avoir', ajustée à 80 caractères.
        // Distribution: 4 premiers gaps ont 2 espaces, les 8 suivants ont 1 espace.
        const expectedLine1 = "Ceci  est  un  court  paragraphe pour tester l'alignement juste. Il doit y avoir"; // Length: 80
        const expectedLine2 = "assez de mots pour forcer une deuxième ligne."; // Length: 45
        
        const justifiedText = service.justify(input);
        const lines = justifiedText.split('\n');
        
        expect(lines[0].length).toBe(LINE_LENGTH);
        expect(lines[0]).toBe(expectedLine1);
        expect(lines[1]).toBe(expectedLine2);
    });
});