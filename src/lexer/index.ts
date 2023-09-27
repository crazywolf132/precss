// Define constants for character codes to improve code readability and maintainability.
const SINGLE_QUOTE = "'".charCodeAt(0);
const DOUBLE_QUOTE = "\"".charCodeAt(0);
const BACKSLASH = "\\".charCodeAt(0);
const SLASH = "/".charCodeAt(0);
const NEWLINE = "\n".charCodeAt(0);
const SPACE = " ".charCodeAt(0);
const FEED = "\f".charCodeAt(0);
const TAB = "\t".charCodeAt(0);
const CR = "\r".charCodeAt(0);
const OPEN_SQUARE = "[".charCodeAt(0);
const CLOSE_SQUARE = "]".charCodeAt(0);
const OPEN_PARENTHESES = "(".charCodeAt(0);
const CLOSE_PARENTHESES = ")".charCodeAt(0);
const OPEN_CURLY = "{".charCodeAt(0);
const CLOSE_CURLY = "}".charCodeAt(0);
const SEMICOLON = ";".charCodeAt(0);
const ASTERISK = "*".charCodeAt(0);
const COLON = ":".charCodeAt(0);
const AT = "@".charCodeAt(0);
const HASH = "#".charCodeAt(0);
const DOT = ".".charCodeAt(0);

export type Token = [string, string, number?, number?, number?, number?];

// Lexer class responsible for tokenizing CSS input.
export default class Lexer {
  private input: string;
  private length: number;
  private pos: number;
  private line: number;
  public tokens: Token[];
  private offsetCache: any;

  // Initialize the parser with the input string.
  constructor(input: string) {
    this.input = input;
    this.length = input.length;
    this.pos = 0;
    this.line = 1;
    this.tokens = [];

    this.createOffsetCache();
  }

  private createOffsetCache() {
    const lines = this.input.split("\n");
    const lineToIndex = new Array(lines.length);
    let prevIndex = 0;

    for (let i = 0, l = lines.length; i < l; i++) {
      lineToIndex[i] = prevIndex;
      prevIndex += lines[i].length + 1;
    }

    this.offsetCache = lineToIndex
  }

  public fromOffset(offset: number) {
    const lineToIndex = this.offsetCache;
    const lastLine = lineToIndex[lineToIndex.length - 1];

    let min = 0;
    if (offset >= lastLine) {
      min = lineToIndex.length - 1;
    } else {
      let max = lineToIndex.length - 2;
      let mid;
      while (min < max) {
        mid = min + ((max - min) >> 1)
        if (offset < lineToIndex[mid]) {
          max = mid - 1
        } else if (offset >= lineToIndex[mid + 1]) {
          min = mid + 1
        } else {
          min = mid
          break
        }
      }
    }
    return {
      col: offset - lineToIndex[min] + 1,
      line: min + 1
    }
  }

  // Main function to tokenize the input.
  public tokenize() {
    while (this.pos < this.length) {
      const code = this.input.charCodeAt(this.pos);

      if (code === NEWLINE) {
        this.line++;
      }

      const next = this.input.charCodeAt(this.pos + 1);

      if (code === AT) {
        this.parseAtWord();
      } else if (code === OPEN_PARENTHESES || code === OPEN_SQUARE && !this.antiParen(next)) {
        this.parseBrackets();
      } else if (code === SLASH && this.input.charCodeAt(this.pos + 1) === ASTERISK) {
        this.parseComment();
      } else if (code === SINGLE_QUOTE || code === DOUBLE_QUOTE) {
        this.parseString();
      } else if (Lexer.isWordCharacter(code)) {
        this.parseWord();
      } else if (Lexer.isSpace(code)) {
        this.parseSpace();
      } else {
        this.parseSymbol();
      }
    }
  }

  // Parse and store at-words
  private parseAtWord() {
    let start = this.pos;
    this.pos += 1; // Skip the initial "@"
    while (this.pos < this.length) {
      const code = this.input.charCodeAt(this.pos);
      if (!Lexer.isWordCharacter(code)) {
        break;
      }
      this.pos += 1;
    }
    this.addToken("at-word", this.input.slice(start, this.pos), start, this.pos - 1);
  }

  private antiParen(char: number): boolean {
    return [
      // SINGLE_QUOTE,
      // DOUBLE_QUOTE,
      SPACE,
      NEWLINE,
      TAB,
      FEED,
      CR
    ].includes(char)
  }

  private parseBrackets() {
    let start = this.pos;
    this.pos += 1; // skip the initial bracket
    let nesting = 1; // Intialize nesting level to 1 for the starting bracket

    while (this.pos < this.length) {
      const code = this.input.charCodeAt(this.pos);
      if (code === OPEN_PARENTHESES || code === OPEN_SQUARE) {
        nesting += 1 // Increment nesting level for each open bracket
      } else if (code === CLOSE_PARENTHESES || code === CLOSE_SQUARE) {
        nesting -= 1; // Decrement nesting level for each closing bracket
        if (nesting === 0) {
          this.pos += 1; // Skip the closing bracket
          break;
        }
      }
      this.pos += 1;
    }
    this.addToken("brackets", this.input.slice(start, this.pos), start, this.pos);

  }

  // Parse and store strings
  private parseString() {
    const quote = this.input.charAt(this.pos);
    let start = this.pos;
    this.pos += 1;
    while (this.pos < this.length) {
      const code = this.input.charCodeAt(this.pos);
      if (code === quote.charCodeAt(0)) {
        break;
      }
      this.pos += 1;
    }
    this.pos += 1;
    this.addToken("string", this.input.slice(start, this.pos), start, this.pos - 1);
  }

  // Parse and store comment tokens.
  private parseComment() {
    let start = this.pos;
    this.pos += 2; // Skip `/*`.
    while (this.pos < this.length) {
      if (this.input.charAt(this.pos) === '*' && this.input.charAt(this.pos + 1) === '/') {
        this.pos += 2;
        break;
      }
      this.pos += 1;
    }
    this.addToken("comment", this.input.slice(start, this.pos), start, this.pos);
  }

  // Parse and store word tokens, including `.` or `#` at the start.
  private parseWord() {
    let start = this.pos;
    if (this.input.charAt(this.pos) === '.' || this.input.charAt(this.pos) === '#') {
      this.pos += 1;
    }
    while (this.pos < this.length) {
      const code = this.input.charCodeAt(this.pos);
      if (Lexer.isWordCharacter(code)) {
        this.pos += 1;
      } else {
        break;
      }
    }
    this.addToken("word", this.input.slice(start, this.pos), start, this.pos);
  }

  // Check if a character code represents a word character.
  private static isWordCharacter(code: number): boolean {
    return (code >= 'a'.charCodeAt(0) && code <= 'z'.charCodeAt(0)) ||
      (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) ||
      (code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0)) ||
      code === '-'.charCodeAt(0) || code === '_'.charCodeAt(0) ||
      code === DOT || code === HASH;
  }

  // Parse and store space tokens.
  private parseSpace() {
    const start = this.pos;
    while (this.pos < this.length) {
      const code = this.input.charCodeAt(this.pos);
      if (Lexer.isSpace(code)) {
        this.pos += 1;
      } else {
        break;
      }
    }
    const content = this.input.slice(start, this.pos);
    if (content !== "") {
      this.tokens.push(["space", content]);
    }
  }

  // Check if a character code represents a space character.
  private static isSpace(code: number): boolean {
    return code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED;
  }

  // Parse and store symbol tokens.
  private parseSymbol() {
    const code = this.input.charCodeAt(this.pos);
    // @ts-ignore
    this.addToken(String.fromCharCode(code), String.fromCharCode(code), this.pos, this.pos + 1)
    this.pos += 1;
  }

  private addToken(type: string, value: string, start: number, end: number) {
    const startPosition = this.fromOffset(start);
    const endPosition = this.fromOffset(end);
    this.tokens.push([type, value, startPosition.line, startPosition.col, endPosition.line, endPosition.col]);
  }

  public get position(): number {
    return this.pos;
  }
}
