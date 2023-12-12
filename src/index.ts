import Lexer from './lexer'
import Parser from './parser'
import Node from './parser/node'
export type * from './types'

import fs from 'node:fs';
import { inspect } from 'util'

export default (css: string): Node => {
   const lexer = new Lexer(css)
   lexer.tokenize()
   const parser = new Parser(lexer)
   return parser.parse()
}

export {
   Lexer,
   Parser,
   Node
}

(() => {

   const css = `{
      background-color: red;
      color: blue;

      @variants {
         Secondary {
            background-color: black;
            color: white;

            Text {
               color: white;
               font-size: 1rem;
               font-weight: bold;
            }
         }
      }
   }`

   const lexer = new Lexer(css)
   lexer.tokenize()

   const res = new Parser(lexer).parse();
   console.log(inspect(res, false, null, true));
   // fs.writeFileSync('./result.json', JSON.stringify(res, null, 2));

})();