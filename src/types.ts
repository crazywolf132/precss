export type NodeRaws = {
  before?: string;
  after?: string;
  semicolon?: boolean;
  afterName?: string;
  left?: string;
  right?: string;
  important?: boolean;
  [key: string]: any;
}