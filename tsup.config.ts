import { defineConfig } from 'tsup';

export default defineConfig({
    name: 'precss',
    entry: ['./src/index.ts'],
    target: 'es2015',
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
})