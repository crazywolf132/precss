import Lexer, { Token } from "../lexer";
import Node from "./node";

export default class Parser {

    private index: number = -1;
    private current: Node;
    private root: Node = new Node({ name: 'root', type: 'root' });
    private tokens: Token[];

    constructor(private lexer: Lexer) {
        this.tokens = lexer.tokens.filter((token) => token[0] !== 'space');
        this.current = this.root;
    }

    parse() {
        let token: Token;
        while (!this.atEnd()) {
            token = this.tokens[++this.index]
            // console.log("Token", token)
            switch (token[0]) {
                case 'comment':
                    this.comment();
                    break

                case '{':
                    this.emptyRule();
                    break;

                case 'at-word':
                    this.atRule();
                    break;

                case '}':
                    this.end();
                    break;

                default:
                    this.other();
                    break;
                // case 'at-word':
                //     this.atrule(token);
                //     break;
            }
        }

        return this.cleanup(this.root);
    }

    // Handles ending a block or a rule
    end() {
        if (this.current.parent) {
            this.current = this.current.parent;
        } else {
            throw new Error('Unexpected closing bracket');
        }
    }

    // Handles comment tokens
    comment() {
        const node = new Node({ type: 'comment' });
        this.init(node);
        let text = this.tokens[this.index][1].slice(2, -2);
        if (/^\s*$/.test(text)) {
            node.text = '';
            node.raws.left = text;
            node.raws.right = '';
        } else {
            let match = text.match(/^(\s*)([^]*\S)(\s*)$/)
            node.text = match?.[2] ?? '';
            node.raws.left = match?.[1] ?? '';
            node.raws.right = match?.[3] ?? '';
        }
    }

    // Handles empty rule tokens
    emptyRule() {
        const node = new Node({ type: 'rule', selector: '' });
        // node.raws.between = '';
        // this.current.push(node);
        // this.current = node;

        // We are going to see if the current is an atrule. If it is... this is a body definition for that.
        // So we will just eat the tokens until we find a closing bracket.
        if (this.current.type === 'atrule') {
            return
        } else {
            this.init(node);
            this.current = node;
        }
    }

    // Handles at rule tokens
    atRule() {
        const token = this.tokens[this.index];
        const node = new Node({ type: 'atrule', name: token[1].slice(1) });
        this.init(node);

        const params: Token[] = [];

        while (!this.atEnd() && !this.nextOfType(';', '{')) {
            params.push(this.tokens[++this.index])
        }

        // We can assume we are at the end of the loop, and have encountered a block or a semicolon
        // We will now add the params as a string to the node and exit.
        node.params = params.map((token) => token[1]).join(' ');
        if (this.nextOfType(';')) {
            this.index++; // Just going to consume it... as nothing else will
            node.raws.semicolon = true
        } else {
            this.current = node;
        }

        return;
    }

    other() {
        // This can be any kind of token. This could be a property, a selector, or a value.
        // We will need to determine what it is.

        const node = new Node(); // We cannot assign a type yet, as we do not know what it is.
        this.init(node);

        // We will now consume tokens until we find a `:` or a `{`
        const tokens: Token[] = [];
        do {
            tokens.push(this.tokens[this.index]);
            ++this.index;
        } while (!this.atEnd() && !this.ofType(';', '{'));

        if (tokens.length >= 3 && tokens[1][1] === ':' && !this.ofType('{')) { // technically they could have a `calc` or `rbga` or something weird.
            // This is a declaration
            node.type = 'decl';
            node.prop = tokens[0][1];
            node.value = tokens.slice(2).map((token) => token[1]).join('');
            if (!this.ofType(';')) {
                throw new Error('Expected a semicolon')
            }
        } else if (this.ofType('{')) {
            // This is a new rule definition
            node.type = 'rule';
            node.selector = tokens.map((token) => token[1]).join('');
            this.current = node;
        }
    }

    private atEnd(): boolean {
        return this.index >= this.tokens.length - 1;
    }

    private ofType(...types: string[]): boolean {
        return types.includes(this.tokens[this.index][0]);
    }

    private nextOfType(...types: string[]): boolean {
        return types.includes(this.tokens[this.index + 1][0]);
    }

    private init(node: Node): void {
        node.parent = this.current;
        this.current.push(node);
    }

    private cleanup(node: Node): Node {
        // We are going to remove the `parent` property from the node
        // We will also remove all properties that are empty, null, or ''.

        for (const [key, value] of Object.entries(node)) {
            if (typeof value === "string") continue;
            if (value === null || value === undefined || value.length === 0 || Object.keys(value).length === 0) {
                delete (node as any)[key];
            }
        }

        if (node.nodes && node.nodes.length >= 1) {
            node.nodes = node.nodes.map((child) => this.cleanup(child));
        }

        return node;
    }
}