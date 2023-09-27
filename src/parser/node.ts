type Raws = {
    semicolon?: boolean;
    after?: string;
    before?: string;
    left?: string;
    right?: string;
    between?: string;
    afterName?: string;
    [key: string]: any;
};

type Position = {
    column: number;
    line: number;
    offset: number;
};

const emptyPosition: Position = {
    column: 0,
    line: 0,
    offset: 0
};

type Source = {
    start: Position;
    end?: Position;
};

const emptySource: Source = {
    start: emptyPosition,
    end: emptyPosition
}

export default class Node {

    public type: string = 'node';
    public text?: string = "";
    public name?: string = "";
    public prop?: string = "";
    public value?: string = "";
    public selector?: string = "";
    public raws: Raws = {};
    public source: Source = emptySource;
    public nodes: Node[] = [];
    public params?: string = "";
    public parent?: Node;
    public important?: boolean = false;

    constructor(information: object = {}) {
        Object.assign(this, information);
    }

    push(node: Node): this {
        this.nodes.push(node);
        return this;
    }

    removeAll(): this {
        this.nodes = [];
        return this;
    }

    private walkType(callback: (node: Node) => void, type: string) {
        this.walk((child) => {
            if (child.type === type) {
                callback(child);
            }
        });
    }

    public walkAtRules(callback: (node: Node) => void) {
        this.walkType(callback, 'atrule');
    };
    public walkRules(callback: (node: Node) => void) {
        this.walkType(callback, 'rule');
    };
    public walkDecls(callback: (node: Node) => void) {
        this.walkType(callback, 'decl');
    };
    public walkComments(callback: (node: Node) => void) {
        this.walkType(callback, 'comment');
    };
    public walk(callback: (node: Node) => void) {
        this.nodes.forEach((child) => {
            callback(child);
        })
    };

}