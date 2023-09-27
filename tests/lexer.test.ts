import { describe, it, expect } from '@jest/globals'

// Importing the Lexer class from the lexer file
import Lexer, { Token } from '../src/lexer';

describe('Lexer Class', () => {
    describe('Initialization', () => {
        it('should initialize with the given input string', () => {
            const lexer = new Lexer('test');
            expect(lexer).toBeDefined();
        });

        it('should initialize tokens as an empty array', () => {
            const lexer = new Lexer('');
            expect(lexer.tokens).toEqual([]);
        });
    });

    it('should get position from lexer', () => {
        const lexer = new Lexer('{ color: red; }')
        lexer.tokenize()
        expect(lexer.position).toBe(15);
    })

    it("should increment line when encountering a newline character", () => {
        const lexer = new Lexer(`
        /* hello */`)
        const before = lexer["line"];
        lexer.tokenize();
        const after = lexer["line"];
        expect(before).toBe(1);
        expect(after).toBe(2);
    })

    describe('Tokenizing At-Words', () => {
        it('should tokenize a single at-word', () => {
            const lexer = new Lexer('@media');
            lexer.tokenize();
            const expectedToken: Token = ['at-word', '@media', 1, 1, 1, 6];
            expect(lexer.tokens).toEqual([expectedToken]);
        });

        it('should tokenize multiple at-words', () => {
            const lexer = new Lexer('@media @import');
            lexer.tokenize();
            const expectedTokens: Token[] = [
                ['at-word', '@media', 1, 1, 1, 6],
                ['space', ' '],
                ['at-word', '@import', 1, 8, 1, 14]
            ];
            expect(lexer.tokens).toEqual(expectedTokens);
        });
    });

    describe('Tokenizing Brackets', () => {
        it('should tokenize brackets', () => {
            const lexer = new Lexer('[attr=value]');
            lexer.tokenize();
            const expectedToken: Token = ['brackets', '[attr=value]', 1, 1, 1, 13];
            expect(lexer.tokens).toEqual([expectedToken]);
        });

        it('should tokenize nested brackets', () => {
            const lexer = new Lexer('[attr=[value]]');
            lexer.tokenize();
            const expectedToken: Token = ['brackets', '[attr=[value]]', 1, 1, 1, 15];
            expect(lexer.tokens).toEqual([expectedToken]);
        });
    });

    describe('Tokenizing Comments', () => {
        it('should tokenize a single-line comment', () => {
            const lexer = new Lexer('/* comment */');
            lexer.tokenize();
            const expectedToken: Token = ['comment', '/* comment */', 1, 1, 1, 14];
            expect(lexer.tokens).toEqual([expectedToken]);
        });

        it('should tokenize multi-line comments', () => {
            const lexer = new Lexer('/*\\n comment \\n*/');
            lexer.tokenize();
            const expectedToken: Token = ['comment', '/*\\n comment \\n*/', 1, 1, 1, 18];
            expect(lexer.tokens).toEqual([expectedToken]);
        });
    });

    describe('Tokenizing Strings', () => {
        it('should tokenize a single-quoted string', () => {
            const lexer = new Lexer("'string'");
            lexer.tokenize();
            const expectedToken: Token = ['string', "'string'", 1, 1, 1, 8];
            expect(lexer.tokens).toEqual([expectedToken]);
        });

        it('should tokenize a double-quoted string', () => {
            const lexer = new Lexer('"string"');
            lexer.tokenize();
            const expectedToken: Token = ['string', '"string"', 1, 1, 1, 8];
            expect(lexer.tokens).toEqual([expectedToken]);
        });
    });

    describe('Tokenizing Words', () => {
        it('should tokenize a single word', () => {
            const lexer = new Lexer('word');
            lexer.tokenize();
            const expectedToken: Token = ['word', 'word', 1, 1, 1, 5];
            expect(lexer.tokens).toEqual([expectedToken]);
        });

        it('should tokenize multiple words', () => {
            const lexer = new Lexer('word another');
            lexer.tokenize();
            const expectedTokens: Token[] = [
                ['word', 'word', 1, 1, 1, 5],
                ['space', ' '],
                ['word', 'another', 1, 6, 1, 13]
            ];
            expect(lexer.tokens).toEqual(expectedTokens);
        });
    });

    describe('Tokenizing Spaces', () => {
        it('should tokenize a single space', () => {
            const lexer = new Lexer(' ');
            lexer.tokenize();
            const expectedToken: Token = ['space', ' '];
            expect(lexer.tokens).toEqual([expectedToken]);
        });

        it('should tokenize multiple spaces', () => {
            const lexer = new Lexer('  ');
            lexer.tokenize();
            const expectedToken: Token = ['space', '  '];
            expect(lexer.tokens).toEqual([expectedToken]);
        });
    });

    describe('Tokenizing Symbols', () => {
        it('should tokenize a single symbol', () => {
            const lexer = new Lexer(';');
            lexer.tokenize();
            const expectedToken: Token = [';', ';', 1, 1, 1, 2];
            expect(lexer.tokens).toEqual([expectedToken]);
        });

        it('should tokenize multiple symbols', () => {
            const lexer = new Lexer(';;');
            lexer.tokenize();
            const expectedTokens: Token[] = [
                [';', ';', 1, 1, 1, 2],
                [';', ';', 1, 2, 1, 3]
            ];
            expect(lexer.tokens).toEqual(expectedTokens);
        });
    });

    describe('createOffsetCache and fromOffset Functions', () => {
        it('should correctly initialize offsetCache via createOffsetCache', () => {
            const lexer = new Lexer(`line1
            line2
            line3`);
            expect(lexer["offsetCache"]).toEqual([0, 6, 24]);
        });

        it('should correctly return position for the first line using fromOffset', () => {
            const lexer = new Lexer(`line1
            line2
            line3`);
            const offsetResult = lexer.fromOffset(4);
            expect(offsetResult).toEqual({ col: 5, line: 1 });
        });

        it('should correctly return position for the middle line using fromOffset', () => {
            const lexer = new Lexer(`line1
            line2
            line3`);
            const offsetResult = lexer.fromOffset(8);
            expect(offsetResult).toEqual({ col: 3, line: 2 });
        });

        it('should correctly return position for the last line using fromOffset', () => {
            const lexer = new Lexer(`line1
            line2
            line3`);
            const offsetResult = lexer.fromOffset(14);
            expect(offsetResult).toEqual({ col: 9, line: 2 });
        });

        it('should adjust max in fromOffset during binary search', () => {
            const lexer = new Lexer(`line1
            line2
            line3`);
            // Given an offset of 10, the binary search should adjust max
            const offsetResult = lexer.fromOffset(10);
            expect(offsetResult).toEqual({ col: 5, line: 2 });
        });

        it('should handle negative offset', () => {
            const lexer = new Lexer(`hello`);
            const offsetResult = lexer.fromOffset(-10);
            expect(offsetResult).toEqual({ col: -9, line: 1 })
        })
    });

    describe('Edge Cases', () => {
        it('should handle empty input', () => {
            const lexer = new Lexer('');
            lexer.tokenize();
            expect(lexer.tokens).toEqual([]);
        });

        it('should handle input with only spaces', () => {
            const lexer = new Lexer('   ');
            lexer.tokenize();
            const expectedToken: Token = ['space', '   '];
            expect(lexer.tokens).toEqual([expectedToken]);
        });

        it('should handle unrecognized characters', () => {
            const lexer = new Lexer('$');
            lexer.tokenize();
            const expectedToken: Token = ['$', '$', 1, 1, 1, 2];
            expect(lexer.tokens).toEqual([expectedToken]);
        });

        it('should tokenize complex combinations', () => {
            const lexer = new Lexer('@media "string" /* comment */');
            lexer.tokenize();
            const expectedTokens: Token[] = [
                ['at-word', '@media', 1, 1, 1, 6],
                ['space', ' '],
                ['string', '"string"', 1, 8, 1, 15],
                ['space', ' '],
                ['comment', '/* comment */', 1, 17, 1, 30]
            ];
            expect(lexer.tokens).toEqual(expectedTokens);
        });

        it('should test fromOffset method', () => {
            const lexer = new Lexer('line1\\nline2');
            const offsetResult1 = lexer.fromOffset(0);
            const offsetResult2 = lexer.fromOffset(6);
            expect(offsetResult1).toEqual({ col: 1, line: 1 });
            expect(offsetResult2).toEqual({ col: 7, line: 1 });
        });

        it('should handle 2 back-to-back at-words', () => {
            const lexer = new Lexer('@media@import');
            lexer.tokenize();
            const expectedTokens: Token[] = [
                ['at-word', '@media', 1, 1, 1, 6],
                ['at-word', '@import', 1, 7, 1, 13]
            ];
            expect(lexer.tokens).toEqual(expectedTokens);
        });

        it('should handle .#word', () => {
            const lexer = new Lexer('.#word');
            lexer.tokenize();
            const expectedTokens: Token[] = [
                ['word', '.#word', 1, 1, 1, 7]
            ];
            expect(lexer.tokens).toEqual(expectedTokens);
        });

        it('should cover lines 67-77 in fromOffset with multi-line input', () => {
            const lexer = new Lexer(`line1
            line2
            line3`);
            const offsetResult = lexer.fromOffset(12);
            expect(offsetResult).toEqual({ col: 7, line: 2 });
        });

        it('should cover line 240 in parseWord with specific characters', () => {
            const lexer = new Lexer('.#');
            lexer.tokenize();
            const expectedTokens: Token[] = [
                ['word', '.#', 1, 1, 1, 3]
            ];
            expect(lexer.tokens).toEqual(expectedTokens);
        });
    });

});
