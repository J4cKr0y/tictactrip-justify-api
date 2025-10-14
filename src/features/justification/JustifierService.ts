// src/features/justification/JustifierService.ts

export class JustifierService {
    private readonly LINE_LENGTH = 80;

    /**
     * Justifie le texte donné pour que chaque ligne (sauf la dernière)
     * ait exactement 80 caractères.
     * @param text Le texte brut à justifier.
     * @returns Le texte justifié avec des sauts de ligne.
     */
    public justify(text: string): string {
        if (!text) {
            return '';
        }

        // 1. Séparer le texte en mots
        const words = text.match(/\S+/g) || [];
        if (words.length === 0) {
            return '';
        }
        
        const justifiedLines: string[] = [];
        let currentLineWords: string[] = [];
        let currentLineLength = 0;

        // 2. Créer des lignes et justifier celles qui ne sont pas la dernière
        for (const word of words) {
            // Longueur de la ligne si on ajoute le mot actuel (+1 pour l'espace, si ce n'est pas le premier mot)
            const potentialLength = currentLineLength === 0 ? word.length : currentLineLength + 1 + word.length;

            if (potentialLength <= this.LINE_LENGTH) {
                // Le mot rentre : ajouter à la ligne actuelle
                currentLineWords.push(word);
                currentLineLength = potentialLength;
            } else {
                // Le mot ne rentre pas : 
                
                // Si la ligne actuelle n'est pas vide, la justifier et la stocker.
                if (currentLineWords.length > 0) {
                    justifiedLines.push(this.formatLine(currentLineWords));
                }
                
                // Commencer la nouvelle ligne avec le mot actuel
                currentLineWords = [word];
                currentLineLength = word.length;
            }

            // Gestion du cas où un mot est > 80 (il sera tout seul sur une ligne et non justifié)
            // On le pousse tel quel, puis on réinitialise pour le mot suivant.
            if (currentLineLength > this.LINE_LENGTH && currentLineWords.length === 1) {
                justifiedLines.push(word);
                currentLineWords = [];
                currentLineLength = 0;
            }
        }

        // Ajouter la dernière ligne (non justifiée)
        if (currentLineWords.length > 0) {
            justifiedLines.push(currentLineWords.join(' '));
        }

        return justifiedLines.join('\n');
    }

    /**
     * Justifie une ligne en distribuant les espaces entre les mots.
     * @param words Les mots de la ligne (doit être > 1 mot).
     * @returns La ligne justifiée de 80 caractères.
     */
    private formatLine(words: string[]): string {
        if (words.length <= 1) {
            // Devrait être géré par la fonction appelante, mais sécurité.
            return words.join('');
        }

        const wordsLength = words.reduce((sum, word) => sum + word.length, 0);
        const totalSpacesNeeded = this.LINE_LENGTH - wordsLength;
        const gaps = words.length - 1; 

        // Calcul de la distribution des espaces
        const baseSpaces = Math.floor(totalSpacesNeeded / gaps);
        let extraSpaces = totalSpacesNeeded % gaps; 

        let justifiedLine = words[0];

        // Distribuer les espaces dans les intervalles
        for (let i = 1; i < words.length; i++) {
            let numSpaces = baseSpaces;
            
            // Les espaces supplémentaires sont distribués sur les premiers intervalles
            if (extraSpaces > 0) {
                numSpaces += 1;
                extraSpaces--;
            }

            justifiedLine += ' '.repeat(numSpaces) + words[i];
        }

        return justifiedLine;
    }
}