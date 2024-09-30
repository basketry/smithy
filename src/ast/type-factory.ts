import { pascal } from 'case';
import { format as formatWithPrettier } from 'prettier';

import { trivia } from './common';

type Rule = {
  name: string;
  lower: string;
  index: number;
  isBkr: boolean;
  opcodes: OpCode[];
};
type OpCode =
  | ALTOpcode
  | CATOpcode
  | REPOpcode
  | RNMOpcode
  | TRGOpcode
  | TBSOpcode
  | TLSOpcode;
type ALTOpcode = {
  type: 1; // ALT (Alternation)
  children: number[]; // Indices of child opcodes
};
type CATOpcode = {
  type: 2; // CAT (Concatenation)
  children: number[]; // Indices of child opcodes
};
type REPOpcode = {
  type: 3; // REP (Repetition)
  min: number;
  max: number;
};
type RNMOpcode = {
  type: 4; // RNM (Rule Name Reference)
  index: number; // Index of the referenced rule
};
type TRGOpcode = {
  type: 5; // TRG (Terminal Range)
  min: number;
  max: number;
};
type TBSOpcode = {
  type: 6; // TBS (terminal binary string, case sensitive)
  string: number[]; // ASCII values of the terminal string
};
type TLSOpcode = {
  type: 7; // TLS (terminal literal string, case insensitive)
  string: number[]; // ASCII values of the terminal string
};

function getNodeName(name: string): string {
  return pascal(`${name}Node`);
}

export function format(code: string) {
  return formatWithPrettier(code, {
    parser: 'typescript',
    singleQuote: true,
    useTabs: false,
    tabWidth: 2,
    trailingComma: 'all',
  });
}

export class TypeFactory {
  constructor(private readonly rules: Rule[]) {
    this.skip = new Set();
    if (trivia) {
      for (const s of trivia) {
        this.skip.add(getNodeName(s));
      }
    }
  }

  private readonly skip: Set<string>;

  *build({ sort }: { sort: boolean }): Iterable<string> {
    const rulesInOrder = sort
      ? [...this.rules].sort((a, b) => a.name.localeCompare(b.name))
      : this.rules;

    for (const rule of rulesInOrder) {
      if (this.skip.has(getNodeName(rule.name))) continue;
      yield* this.buildType(rule);
      yield '';
      yield* this.buildGaurd(rule);
      yield '';
    }
    yield* this.buildUnion();
  }

  *buildSyntaxStubs({ sort }: { sort: boolean }): Iterable<string> {
    const rulesInOrder = sort
      ? [...this.rules].sort((a, b) => a.name.localeCompare(b.name))
      : this.rules;

    for (const rule of rulesInOrder) {
      if (this.skip.has(getNodeName(rule.name))) continue;
      yield* this.buildSyntaxStub(rule);
      yield '';
    }
  }

  *buildSyntaxStub(rule: Rule): Iterable<string> {
    yield* this.buildComment(rule);
    yield `export class ${getNodeName(
      rule.name,
    )} extends SyntaxNode<ast.${getNodeName(rule.name)}> {`;
    yield ' // TODO: implement or remove';
    yield `}`;
  }

  *buildComment(rule: Rule): Iterable<string> {
    const indentByIndex: number[] = [];
    function getIndent(index: number) {
      return indentByIndex[index] ?? 0;
    }
    function indent({ current, target }: { current: number; target: number }) {
      indentByIndex[target] = getIndent(current) + 1;
    }
    function prefix(index: number) {
      const lead = ` * ${index}.${i > 9 ? ' ' : '  '}`;
      const space = '  '.repeat(indentByIndex[index] ?? 0);
      return `${lead}${space}`;
    }

    let i = -1;
    yield '/**';
    yield ` * @example`;
    yield ` * \`\`\`text`;
    for (const opcode of rule.opcodes) {
      i++;
      switch (opcode.type) {
        case 1: {
          opcode.children.forEach((target) => indent({ current: i, target }));
          yield `${prefix(i)}Alternation: ${opcode.children.join(', ')}`;
          break;
        }
        case 2: {
          opcode.children.forEach((target) => indent({ current: i, target }));
          yield `${prefix(i)}Concatenation: ${opcode.children.join(', ')}`;
          break;
        }
        case 3: {
          indent({ current: i, target: i + 1 });
          yield `${prefix(i)}Repetition: ${opcode.min} to ${opcode.max}`;
          break;
        }
        case 4: {
          const name = getNodeName(this.rules[opcode.index].name);
          if (this.skip.has(name)) {
            yield `${prefix(i)}[skipped]`;
            break;
          }

          yield `${prefix(i)}${name}`;
          break;
        }
        case 5: {
          yield `${prefix(i)}Terminal Range`;
          break;
        }
        case 6: {
          yield `${prefix(i)}TBS: \`${String.fromCharCode(...opcode.string)}\``;
          break;
        }
        case 7: {
          yield `${prefix(i)}TLS: \`${String.fromCharCode(...opcode.string)}\``;
          break;
        }
      }
    }
    yield ` * \`\`\``;
    yield ' */';
  }

  *buildType(rule: Rule): Iterable<string> {
    const opcodes = rule.opcodes
      .filter((opcode) => opcode.type === 4)
      .map((opcode) => this.rules[opcode.index]);

    yield* this.buildComment(rule);

    yield `export type ${getNodeName(rule.name)} = {`;
    yield `  kind: '${rule.name}',`;
    yield `  offset: number,`;
    yield `  length: number,`;

    const skipped = Array.from(
      new Set(opcodes.filter((n) => trivia.has(n.name)).map((n) => n.name)),
    ).sort();

    if (skipped.length) {
      yield `  // Ingored trivia: ${skipped.join(', ')}`;
    }

    const names = Array.from(new Set(opcodes.map((n) => getNodeName(n.name))))
      .filter((n) => !this.skip.has(n))
      .sort();
    if (names.length) {
      yield `  children: (${names.join(' | ')})[]`;
    } else {
      yield `  children: never[]`;
    }
    yield `}`;
  }

  *buildGaurd(rule: Rule): Iterable<string> {
    yield `export function is${getNodeName(
      rule.name,
    )}(node: Node): node is ${getNodeName(rule.name)} {`;
    yield `  return node.kind === '${rule.name}';`;
    yield `}`;
  }

  *buildUnion(): Iterable<string> {
    const names = this.rules
      .map((r) => getNodeName(r.name))
      .filter((n) => !this.skip.has(n));

    yield `export type Node = ${names.join(' | ')}`;
  }
}
