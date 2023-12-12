import Lexer from './lexer';
import Parser from './parser';
import Node from './parser/node';
export type * from './types';


export default (css: string): Node => {
   const lexer = new Lexer(css)
   lexer.tokenize()
   const parser = new Parser(lexer)
   return parser.parse()
}

export {
   Lexer, Node, Parser
};
