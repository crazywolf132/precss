import { describe, expect, it } from "@jest/globals";

import Lexer from "../src/lexer";
import Parser from "../src/parser";
describe('Parser', () => {

    let parser: Parser;

    const parseCSS = (css: string) => {
        const lexer = new Lexer(css);
        lexer.tokenize();
        parser = new Parser(lexer);
        return parser.parse();
    };

    describe('parse()', () => {
        it('should handle comments', () => {
            const result = parseCSS('/* test */');
            expect(result.nodes[0].type).toBe('comment');
        });

        it('should handle empty rules', () => {
            const result = parseCSS('{}');
            expect(result.nodes[0].type).toBe('rule');
        });

        it('should handle at-words', () => {
            const result = parseCSS('@media;');
            expect(result.nodes[0].type).toBe('atrule');
        });

        it('should throw an error for unexpected closing brackets', () => {
            expect(() => parseCSS('}')).toThrow('Unexpected closing bracket');
        });

        it('should handle other types', () => {
            const result = parseCSS('body {}');
            expect(result.nodes[0].type).toBe('rule');
        });
    });

    describe('comment()', () => {
        // Test case for comments with only whitespace
        it('should handle comments with only whitespace', () => {
            const result = parseCSS('/*    */');
            expect(result.nodes[0].text).toBe('');
            expect(result.nodes[0].raws.left).toBe('    ');
            expect(result.nodes[0].raws.right).toBe('');
        });

        // Test case for comments with text and no leading or trailing whitespace
        it('should handle comments with text and no leading or trailing whitespace', () => {
            const result = parseCSS('/*test*/');
            expect(result.nodes[0].text).toBe('test');
            expect(result.nodes[0].raws.left).toBe('');
            expect(result.nodes[0].raws.right).toBe('');
        });

        // Test case for comments with text and leading whitespace
        it('should handle comments with text and leading whitespace', () => {
            const result = parseCSS('/* test*/');
            expect(result.nodes[0].text).toBe('test');
            expect(result.nodes[0].raws.left).toBe(' ');
            expect(result.nodes[0].raws.right).toBe('');
        });

        // Test case for comments with text and trailing whitespace
        it('should handle comments with text and trailing whitespace', () => {
            const result = parseCSS('/*test */');
            expect(result.nodes[0].text).toBe('test');
            expect(result.nodes[0].raws.left).toBe('');
            expect(result.nodes[0].raws.right).toBe(' ');
        });

        // Test case for comments with text and both leading and trailing whitespace
        it('should handle comments with text and both leading and trailing whitespace', () => {
            const result = parseCSS('/* test */');
            expect(result.nodes[0].text).toBe('test');
            expect(result.nodes[0].raws.left).toBe(' ');
            expect(result.nodes[0].raws.right).toBe(' ');
        });
    });

    describe('end()', () => {
        it('should move to the parent node', () => {
            const result = parseCSS('body {}');
            expect(result.nodes[0].nodes).toBeUndefined();
        });

        it('should throw an error for unexpected closing brackets', () => {
            expect(() => parseCSS('body { } }')).toThrow('Unexpected closing bracket');
        });
    });

    describe('comment()', () => {
        it('should handle empty comments', () => {
            const result = parseCSS('/*  */');
            expect(result.nodes[0].text).toBe('');
        });

        it('should handle comments with text', () => {
            const result = parseCSS('/* test */');
            expect(result.nodes[0].text).toBe('test');
        });
    });

    describe('emptyRule()', () => {
        // it('should handle empty rules within atrules', () => {
        //     const result = parseCSS('@media { { } }');
        //     expect(result.nodes[0].nodes[0].type).toBe('rule');
        // });

        it('should handle empty rules outside atrules', () => {
            const result = parseCSS('{}');
            expect(result.nodes[0].type).toBe('rule');
            expect(result.nodes[0].selector).toBe('');
        });

        it('should be able to handle declarations', () => {
            const result = parseCSS(`{ color: red; background: #000; }`);
            expect(result.nodes[0].type).toBe('rule');
            expect(result.nodes[0].nodes[0].type).toBe('decl');
        })

        it("should parse an empty rule", () => {
            const result = parseCSS("div {}");
            expect(result.nodes.length).toBe(1);
            expect(result.nodes[0].type).toBe("rule");
            expect(result.nodes[0].selector).toBe("div");
        });

        it("should parse a rule with a declaration", () => {
            const result = parseCSS("div { color: red; }");
            expect(result.nodes.length).toBe(1);
            expect(result.nodes[0].type).toBe("rule");
            expect(result.nodes[0].selector).toBe("div");
            expect(result.nodes[0].nodes.length).toBe(1);
            expect(result.nodes[0].nodes[0].type).toBe("decl");
            expect(result.nodes[0].nodes[0].prop).toBe("color");
            expect(result.nodes[0].nodes[0].value).toBe("red");
        });

        it("should parse an at-rule", () => {
            const result = parseCSS("@media screen { div { color: red; } }");
            expect(result.nodes.length).toBe(1);
            expect(result.nodes[0].type).toBe("atrule");
            expect(result.nodes[0].name).toBe("media");
            expect(result.nodes[0].params).toBe("screen");
            expect(result.nodes[0].nodes.length).toBe(1);
            expect(result.nodes[0].nodes[0].type).toBe("rule");
            expect(result.nodes[0].nodes[0].selector).toBe("div");
            expect(result.nodes[0].nodes[0].nodes.length).toBe(1);
            expect(result.nodes[0].nodes[0].nodes[0].type).toBe("decl");
            expect(result.nodes[0].nodes[0].nodes[0].prop).toBe("color");
            expect(result.nodes[0].nodes[0].nodes[0].value).toBe("red");
        });
    });

    describe('atRule()', () => {
        it('should handle atrules with semicolons', () => {
            const result = parseCSS('@media;');
            expect(result.nodes[0].raws.semicolon).toBe(true);
        });

        it('should handle atrules without semicolons', () => {
            const result = parseCSS('@media { }');
            expect(result.nodes[0].raws?.semicolon).toBeUndefined();
        });
    });

    describe('other()', () => {
        it('should handle declarations', () => {
            const result = parseCSS('body { color: red; }');
            expect(result.nodes[0].nodes[0].type).toBe('decl');
        });

        it('should handle rules', () => {
            const result = parseCSS('body {}');
            expect(result.nodes[0].type).toBe('rule');
        });

        it('should throw an error for missing semicolon in declarations', () => {
            expect(() => parseCSS('body { color: red }')).toThrow('Expected a semicolon');
        });

        it('should handle animation definitions', () => {
            const result = parseCSS('animation: fade-in 1s ease-in;');
            expect(result.nodes[0].type).toBe('decl');
            expect(result.nodes[0].value).toBe('fade-in 1s ease-in')
        })
    });
});
