import { describe, test, expect } from '@jest/globals'
import Node from '../src/parser/node'; // Ensure to adjust the import based on your project structure.

describe('Node Class Tests', () => {

    // Testing the constructor and default values
    test('Constructor and default values', () => {
        const node = new Node();
        expect(node.type).toEqual('node');
        expect(node.text).toEqual("");
        expect(node.name).toEqual("");
        expect(node.prop).toEqual("");
        expect(node.value).toEqual("");
        expect(node.selector).toEqual("");
        expect(node.raws).toEqual({});
        expect(node.source.start).toEqual({ column: 0, line: 0, offset: 0 });
        expect(node.source.end).toEqual({ column: 0, line: 0, offset: 0 });
        expect(node.nodes).toEqual([]);
        expect(node.params).toEqual("");
        expect(node.important).toEqual(false);
    });

    // Testing the constructor with an information object
    test('Constructor with information', () => {
        const info = {
            type: 'newType',
            text: 'newText'
        };
        const node = new Node(info);
        expect(node.type).toEqual('newType');
        expect(node.text).toEqual('newText');
    });

    // Testing push() method
    test('push() method', () => {
        const node = new Node();
        const childNode = new Node({ type: 'child' });
        node.push(childNode);
        expect(node.nodes[0].type).toEqual('child');
    });

    // Testing removeAll() method
    test('removeAll() method', () => {
        const node = new Node();
        const childNode = new Node({ type: 'child' });
        node.push(childNode);
        node.removeAll();
        expect(node.nodes.length).toEqual(0);
    });

    // Testing walk() method
    test('walk() method', () => {
        const node = new Node();
        const childNode = new Node({ type: 'child' });
        node.push(childNode);
        let counter = 0;
        node.walk(() => { counter++; });
        expect(counter).toEqual(1);
    });

    // Testing walkAtRules() method
    test('walkAtRules() method', () => {
        const node = new Node();
        const atruleNode = new Node({ type: 'atrule' });
        node.push(atruleNode);
        let counter = 0;
        node.walkAtRules(() => { counter++; });
        expect(counter).toEqual(1);
    });

    // Testing walkRules() method
    test('walkRules() method', () => {
        const node = new Node();
        const ruleNode = new Node({ type: 'rule' });
        node.push(ruleNode);
        let counter = 0;
        node.walkRules(() => { counter++; });
        expect(counter).toEqual(1);
    });

    // Testing walkDecls() method
    test('walkDecls() method', () => {
        const node = new Node();
        const declNode = new Node({ type: 'decl' });
        node.push(declNode);
        let counter = 0;
        node.walkDecls(() => { counter++; });
        expect(counter).toEqual(1);
    });

    // Testing walkComments() method
    test('walkComments() method', () => {
        const node = new Node();
        const commentNode = new Node({ type: 'comment' });
        node.push(commentNode);
        let counter = 0;
        node.walkComments(() => { counter++; });
        expect(counter).toEqual(1);
    });
});
