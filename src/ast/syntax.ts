import { encodeRange, Range } from 'basketry';
import * as ast from './types';

export type Child<TNode extends ast.Node> = TNode['children'][0];
export type ChildKind<TNode extends ast.Node> = Child<TNode>['kind'];
export type NodeOfKind<TKind extends ast.Node['kind']> = Extract<
  ast.Node,
  { kind: TKind }
>;

function getRowAndColumn(
  input: string,
  offset: number,
): { row: number; column: number } {
  // Ensure the offset is within bounds
  if (offset < 0 || offset > input.length) {
    throw new Error('Offset is out of bounds.');
  }

  let cumulativeLength = 0;
  const lines = input.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1; // +1 for newline character
    if (offset < cumulativeLength + lineLength) {
      const column = offset - cumulativeLength + 1; // One-based column
      return { row: i + 1, column }; // One-based row
    }
    cumulativeLength += lineLength;
  }

  // Default case (this should never happen due to the initial bounds check)
  return { row: lines.length, column: lines[lines.length - 1].length + 1 };
}

export abstract class SyntaxNode<TNode extends ast.Node> {
  constructor(
    protected readonly node: TNode,
    protected readonly document: string,
  ) {}

  get kind(): TNode['kind'] {
    return this.node.kind;
  }

  get range(): Range {
    const start = getRowAndColumn(this.document, this.node.offset);
    const end = getRowAndColumn(
      this.document,
      this.node.offset + this.node.length,
    );

    return {
      start: {
        line: start.row,
        column: start.column,
        offset: this.node.offset,
      },
      end: {
        line: end.row,
        column: end.column,
        offset: this.node.offset + this.node.length,
      },
    };
  }

  get loc(): string {
    return encodeRange(this.range);
  }

  get children(): TNode['children'] {
    return this.node.children;
  }

  get text(): string {
    return this.document.slice(
      this.node.offset,
      this.node.offset + this.node.length,
    );
  }

  protected oneAst<TKind extends ChildKind<TNode>>(
    kind: TKind,
  ): NodeOfKind<TKind> {
    const astNode = this.zeroOrOneAst(kind);

    if (!astNode) {
      throw new Error(`Child node of kind ${kind} not found`);
    }

    return astNode;
  }

  protected zeroOrOneAst<TKind extends ChildKind<TNode>>(
    kind: TKind,
  ): NodeOfKind<TKind> | undefined {
    return this.node.children.find(
      (child) => (child as any).kind === kind,
    ) as NodeOfKind<TKind>;
  }

  protected one<
    TKind extends ChildKind<TNode>,
    TClass extends new (
      child: Child<TNode>,
      document: string,
    ) => InstanceType<TClass>,
  >(kind: TKind, klass: TClass): InstanceType<TClass> {
    return new klass(this.oneAst(kind), this.document);
  }

  protected zeroOrOne<
    TKind extends ChildKind<TNode>,
    TClass extends new (
      child: Child<TNode>,
      document: string,
    ) => InstanceType<TClass>,
  >(kind: TKind, klass: TClass): InstanceType<TClass> | undefined {
    const astNode = this.zeroOrOneAst(kind);

    return astNode ? new klass(astNode, this.document) : undefined;
  }

  protected manyAst<TKind extends ChildKind<TNode>>(
    kind: TKind,
  ): NodeOfKind<TKind>[] {
    return this.node.children.filter(
      (astNode) => (astNode as any).kind === kind,
    ) as NodeOfKind<TKind>[];
  }

  protected many<
    TKind extends ChildKind<TNode>,
    TClass extends new (
      child: Child<TNode>,
      document: string,
    ) => InstanceType<TClass>,
  >(kind: TKind, klass: TClass): InstanceType<TClass>[] {
    return this.manyAst(kind).map(
      (astNode) => new klass(astNode, this.document),
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3
 * 1.    NamespaceNode
 * 2.    TLS: `#`
 * 3.    IdentifierNode
 * ```
 */
export class AbsoluteRootShapeIdNode extends SyntaxNode<ast.AbsoluteRootShapeIdNode> {
  get namespace() {
    return NamespaceNode.from(this.oneAst('Namespace'), this.document);
  }
  get identifier() {
    return this.one('Identifier', IdentifierNode);
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4, 6, 8, 10
 * 1.    AggregateTypeNameNode
 * 2.    [skipped]
 * 3.    IdentifierNode
 * 4.    Repetition: 0 to 1
 * 5.      ForResourceNode
 * 6.    Repetition: 0 to 1
 * 7.      MixinsNode
 * 8.    Repetition: 0 to 1
 * 9.      [skipped]
 * 10.   ShapeMembersNode
 * ```
 */
export class AggregateShapeNode extends SyntaxNode<ast.AggregateShapeNode> {
  get typeName() {
    return this.one('AggregateTypeName', AggregateTypeNameNode);
  }
  get name() {
    return this.one('Identifier', IdentifierNode);
  }
  get forResource() {
    return ForResourceNode.from(
      this.zeroOrOneAst('ForResource'),
      this.document,
    );
  }
  get mixins() {
    return MixinsNode.from(this.zeroOrOneAst('Mixins'), this.document);
  }
  get members() {
    return ShapeMembersNode.from(this.oneAst('ShapeMembers'), this.document);
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2, 3, 4
 * 1.    TBS: `list`
 * 2.    TBS: `map`
 * 3.    TBS: `union`
 * 4.    TBS: `structure`
 * ```
 */
export class AggregateTypeNameNode extends SyntaxNode<ast.AggregateTypeNameNode> {
  get value() {
    switch (this.text) {
      case 'list':
      case 'map':
      case 'union':
      case 'structure':
        return this.text;
      default:
        throw new Error(`Invalid AggregateTypeNameNode value ${this.text}`);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    ApplyStatementSingularNode
 * 2.    ApplyStatementBlockNode
 * ```
 */
class ApplyStatementNode {
  static from(node: ast.ApplyStatementNode, document: string) {
    const child = node.children[0];

    if (!child) {
      throw new Error('ApplyStatementNode has no children');
    }

    switch (child.kind) {
      case 'ApplyStatementSingular':
        return new ApplyStatementSingularNode(child, document);
      case 'ApplyStatementBlock':
        return new ApplyStatementBlockNode(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4, 5, 6, 8, 9
 * 1.    TBS: `apply`
 * 2.    [skipped]
 * 3.    ShapeIdNode
 * 4.    [skipped]
 * 5.    TLS: `{`
 * 6.    Repetition: 0 to 1
 * 7.      [skipped]
 * 8.    TraitStatementsNode
 * 9.    TLS: `}`
 * ```
 */
export class ApplyStatementBlockNode extends SyntaxNode<ast.ApplyStatementBlockNode> {
  get shapeId() {
    return this.one('ShapeId', ShapeIdNode);
  }
  get traits() {
    return TraitStatementsNode.from(
      this.oneAst('TraitStatements'),
      this.document,
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4, 5
 * 1.    TBS: `apply`
 * 2.    [skipped]
 * 3.    ShapeIdNode
 * 4.    [skipped]
 * 5.    TraitNode
 * ```
 */
export class ApplyStatementSingularNode extends SyntaxNode<ast.ApplyStatementSingularNode> {
  get shapeId() {
    return this.one('ShapeId', ShapeIdNode);
  }
  get trait() {
    return this.one('Trait', TraitNode);
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    DocumentationCommentNode
 * 2.    LineCommentNode
 * ```
 */
class CommentNode {
  static from(node: ast.CommentNode, document: string) {
    const child = node.children[0];

    if (!child) {
      throw new Error('CommentNode has no children');
    }

    switch (child.kind) {
      case 'DocumentationComment':
        return new DocumentationCommentNode(child, document);
      case 'LineComment':
        return new LineCommentNode(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Repetition: 0 to Infinity
 * 1.    ControlStatementNode
 * ```
 */
class ControlSectionNode {
  static from(node: ast.ControlSectionNode, document: string) {
    return node.children.map(
      (child) => new ControlStatementNode(child, document),
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 5, 6, 8, 9
 * 1.    TLS: `$`
 * 2.    NodeObjectKeyNode
 * 3.    Repetition: 0 to 1
 * 4.      [skipped]
 * 5.    TLS: `:`
 * 6.    Repetition: 0 to 1
 * 7.      [skipped]
 * 8.    NodeValueNode
 * 9.    [skipped]
 * ```
 */
export class ControlStatementNode extends SyntaxNode<ast.ControlStatementNode> {
  get key() {
    return NodeObjectKeyNode.from(this.oneAst('NodeObjectKey'), this.document);
  }
  get value() {
    return NodeValueNode.from(this.oneAst('NodeValue'), this.document);
  }
}

/**
 * @example
 * ```text
 * 0.  TBS: `.`
 * ```
 */
export class DecimalPointNode extends SyntaxNode<ast.DecimalPointNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4
 * 1.    TLS: `///`
 * 2.    Repetition: 0 to Infinity
 * 3.      [skipped]
 * 4.    [skipped]
 * ```
 */
export class DocumentationCommentNode extends SyntaxNode<ast.DocumentationCommentNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    TBS: `e`
 * 2.    TBS: `E`
 * ```
 */
export class ENode extends SyntaxNode<ast.ENode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    TLS: `$`
 * 2.    IdentifierNode
 * ```
 */
export class ElidedShapeMemberNode extends SyntaxNode<ast.ElidedShapeMemberNode> {
  get identifier() {
    return this.one('Identifier', IdentifierNode);
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4, 6, 8
 * 1.    EntityTypeNameNode
 * 2.    [skipped]
 * 3.    IdentifierNode
 * 4.    Repetition: 0 to 1
 * 5.      MixinsNode
 * 6.    Repetition: 0 to 1
 * 7.      [skipped]
 * 8.    NodeObjectNode
 * ```
 */
export class EntityShapeNode extends SyntaxNode<ast.EntityShapeNode> {
  get typeName() {
    return this.one('EntityTypeName', EntityTypeNameNode);
  }
  get name() {
    return this.one('Identifier', IdentifierNode);
  }
  get mixins() {
    return MixinsNode.from(this.zeroOrOneAst('Mixins'), this.document);
  }
  get body() {
    return this.one('NodeObject', NodeObjectNode);
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    TBS: `service`
 * 2.    TBS: `resource`
 * ```
 */
export class EntityTypeNameNode extends SyntaxNode<ast.EntityTypeNameNode> {
  get value() {
    switch (this.text) {
      case 'service':
      case 'resource':
        return this.text;
      default:
        throw new Error(`Invalid EntityTypeNameNode value ${this.text}`);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4, 6, 8
 * 1.    EnumTypeNameNode
 * 2.    [skipped]
 * 3.    IdentifierNode
 * 4.    Repetition: 0 to 1
 * 5.      MixinsNode
 * 6.    Repetition: 0 to 1
 * 7.      [skipped]
 * 8.    EnumShapeMembersNode
 * ```
 */
export class EnumShapeNode extends SyntaxNode<ast.EnumShapeNode> {
  get typeName() {
    return this.one('EnumTypeName', EnumTypeNameNode);
  }
  get name() {
    return this.one('Identifier', IdentifierNode);
  }
  get mixins() {
    return MixinsNode.from(this.zeroOrOneAst('Mixins'), this.document);
  }
  get members() {
    return EnumShapeMembersNode.from(
      this.oneAst('EnumShapeMembers'),
      this.document,
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3
 * 1.    TraitStatementsNode
 * 2.    IdentifierNode
 * 3.    Repetition: 0 to 1
 * 4.      ValueAssignmentNode
 * ```
 */
export class EnumShapeMemberNode extends SyntaxNode<ast.EnumShapeMemberNode> {
  get traits() {
    return TraitStatementsNode.from(
      this.oneAst('TraitStatements'),
      this.document,
    );
  }
  get name() {
    return this.one('Identifier', IdentifierNode);
  }
  get value() {
    return ValueAssignmentNode.from(
      this.zeroOrOneAst('ValueAssignment'),
      this.document,
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 9
 * 1.    TLS: `{`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    Repetition: 1 to Infinity
 * 5.      Concatenation: 6, 7
 * 6.        EnumShapeMemberNode
 * 7.        Repetition: 0 to 1
 * 8.          [skipped]
 * 9.    TLS: `}`
 * ```
 */
class EnumShapeMembersNode {
  static from(node: ast.EnumShapeMembersNode, document: string) {
    return node.children.map(
      (child) => new EnumShapeMemberNode(child, document),
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    TBS: `enum`
 * 2.    TBS: `intEnum`
 * ```
 */
export class EnumTypeNameNode extends SyntaxNode<ast.EnumTypeNameNode> {
  get value() {
    switch (this.text) {
      case 'enum':
      case 'intEnum':
        return this.text;
      default:
        throw new Error(`Invalid EnumTypeNameNode value ${this.text}`);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  TBS: `\`
 * ```
 */
export class EscapeNode extends SyntaxNode<ast.EscapeNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    EscapeNode
 * 2.    Alternation: 3, 4, 5, 6, 7, 8, 9, 10, 11
 * 3.      EscapeNode
 * 4.      [skipped]
 * 5.      TBS: `b`
 * 6.      TBS: `f`
 * 7.      TBS: `n`
 * 8.      TBS: `r`
 * 9.      TBS: `t`
 * 10.     TLS: `/`
 * 11.     UnicodeEscapeNode
 * ```
 */
export class EscapedCharNode extends SyntaxNode<ast.EscapedCharNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 6
 * 1.    ENode
 * 2.    Repetition: 0 to 1
 * 3.      Alternation: 4, 5
 * 4.        MinusNode
 * 5.        PlusNode
 * 6.    Repetition: 1 to Infinity
 * 7.      [skipped]
 * ```
 */
export class ExpNode extends SyntaxNode<ast.ExpNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 5, 7
 * 1.    IdentifierNode
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    TLS: `:`
 * 5.    Repetition: 0 to 1
 * 6.      [skipped]
 * 7.    ShapeIdNode
 * ```
 */
export class ExplicitShapeMemberNode extends SyntaxNode<ast.ExplicitShapeMemberNode> {
  get name() {
    return this.one('Identifier', IdentifierNode);
  }
  get shapeId() {
    return this.one('ShapeId', ShapeIdNode);
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4
 * 1.    [skipped]
 * 2.    TBS: `for`
 * 3.    [skipped]
 * 4.    ShapeIdNode
 * ```
 */
class ForResourceNode {
  static from(node: ast.ForResourceNode | undefined, document: string) {
    return node ? new ShapeIdNode(node.children[0], document) : undefined;
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    DecimalPointNode
 * 2.    Repetition: 1 to Infinity
 * 3.      [skipped]
 * ```
 */
export class FracNode extends SyntaxNode<ast.FracNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2, 3
 * 1.    [skipped]
 * 2.    Terminal Range
 * 3.    Terminal Range
 * ```
 */
export class HexNode extends SyntaxNode<ast.HexNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    [skipped]
 * 2.    Repetition: 0 to Infinity
 * 3.      [skipped]
 * ```
 */
export class IdentifierNode extends SyntaxNode<ast.IdentifierNode> {
  // Leaf node
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 3, 4, 5
 * 1.    Repetition: 0 to 1
 * 2.      [skipped]
 * 3.    ControlSectionNode
 * 4.    MetadataSectionNode
 * 5.    ShapeSectionNode
 * ```
 */
export class IdlNode extends SyntaxNode<ast.IdlNode> {
  get controlStatements() {
    return ControlSectionNode.from(
      this.oneAst('ControlSection'),
      this.document,
    );
  }
  get metadataStatements() {
    return this.oneAst('MetadataSection').children.map(
      (x) => new MetadataStatementNode(x, this.document),
    );
  }
  get shapeSection() {
    return this.one('ShapeSection', ShapeSectionNode);
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 5, 7, 9, 11
 * 1.    TLS: `:=`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    TraitStatementsNode
 * 5.    Repetition: 0 to 1
 * 6.      ForResourceNode
 * 7.    Repetition: 0 to 1
 * 8.      MixinsNode
 * 9.    Repetition: 0 to 1
 * 10.     [skipped]
 * 11.   ShapeMembersNode
 * ```
 */
export class InlineAggregateShapeNode extends SyntaxNode<ast.InlineAggregateShapeNode> {
  get traits() {
    return TraitStatementsNode.from(
      this.oneAst('TraitStatements'),
      this.document,
    );
  }
  get forResource() {
    return ForResourceNode.from(
      this.zeroOrOneAst('ForResource'),
      this.document,
    );
  }
  get mixins() {
    return MixinsNode.from(this.zeroOrOneAst('Mixins'), this.document);
  }
  get members() {
    return ShapeMembersNode.from(this.oneAst('ShapeMembers'), this.document);
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    [skipped]
 * 2.    Concatenation: 3, 4
 * 3.      [skipped]
 * 4.      Repetition: 0 to Infinity
 * 5.        [skipped]
 * ```
 */
export class IntNode extends SyntaxNode<ast.IntNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 10
 * 1.    TLS: `//`
 * 2.    Repetition: 0 to 1
 * 3.      Concatenation: 4, 8
 * 4.        Alternation: 5, 6, 7
 * 5.          TBS: `	`
 * 6.          Terminal Range
 * 7.          Terminal Range
 * 8.        Repetition: 0 to Infinity
 * 9.          [skipped]
 * 10.   [skipped]
 * ```
 */
export class LineCommentNode extends SyntaxNode<ast.LineCommentNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Repetition: 0 to Infinity
 * 1.    MetadataStatementNode
 * ```
 */
class MetadataSectionNode {
  static from(node: ast.MetadataSectionNode, document: string) {
    return node.children.map(
      (child) => new MetadataStatementNode(child, document),
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4, 6, 7, 9, 10
 * 1.    TBS: `metadata`
 * 2.    [skipped]
 * 3.    NodeObjectKeyNode
 * 4.    Repetition: 0 to 1
 * 5.      [skipped]
 * 6.    TLS: `=`
 * 7.    Repetition: 0 to 1
 * 8.      [skipped]
 * 9.    NodeValueNode
 * 10.   [skipped]
 * ```
 */
export class MetadataStatementNode extends SyntaxNode<ast.MetadataStatementNode> {
  get key() {
    return NodeObjectKeyNode.from(this.oneAst('NodeObjectKey'), this.document);
  }
  get value() {
    return NodeValueNode.from(this.oneAst('NodeValue'), this.document);
  }
}

/**
 * @example
 * ```text
 * 0.  TBS: `-`
 * ```
 */
export class MinusNode extends SyntaxNode<ast.MinusNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 3, 4, 6, 7, 9, 14
 * 1.    Repetition: 0 to 1
 * 2.      [skipped]
 * 3.    TBS: `with`
 * 4.    Repetition: 0 to 1
 * 5.      [skipped]
 * 6.    TLS: `[`
 * 7.    Repetition: 0 to 1
 * 8.      [skipped]
 * 9.    Repetition: 1 to Infinity
 * 10.     Concatenation: 11, 12
 * 11.       ShapeIdNode
 * 12.       Repetition: 0 to 1
 * 13.         [skipped]
 * 14.   TLS: `]`
 * ```
 */
class MixinsNode {
  static from(node: ast.MixinsNode | undefined, document: string) {
    return node
      ? node.children.map((child) => new ShapeIdNode(child, document))
      : [];
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    IdentifierNode
 * 2.    Repetition: 0 to Infinity
 * 3.      Concatenation: 4, 5
 * 4.        TLS: `.`
 * 5.        IdentifierNode
 * ```
 */
class NamespaceNode {
  static from(node: ast.NamespaceNode, document: string) {
    return node.children.map((child) => new IdentifierNode(child, document));
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4
 * 1.    TBS: `namespace`
 * 2.    [skipped]
 * 3.    NamespaceNode
 * 4.    [skipped]
 * ```
 */
class NamespaceStatementNode {
  static from(node: ast.NamespaceStatementNode, document: string) {
    return NamespaceNode.from(node.children[0], document);
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 9
 * 1.    TLS: `[`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    Repetition: 0 to Infinity
 * 5.      Concatenation: 6, 7
 * 6.        NodeValueNode
 * 7.        Repetition: 0 to 1
 * 8.          [skipped]
 * 9.    TLS: `]`
 * ```
 */
export class NodeArrayNode extends SyntaxNode<ast.NodeArrayNode> {
  get items() {
    return this.manyAst('NodeValue').map((child) =>
      NodeValueNode.from(child, this.document),
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2, 3
 * 1.    TBS: `true`
 * 2.    TBS: `false`
 * 3.    TBS: `null`
 * ```
 */
export class NodeKeywordNode extends SyntaxNode<ast.NodeKeywordNode> {
  get value() {
    switch (this.text) {
      case 'true':
      case 'false':
      case 'null':
        return this.text;
      default:
        throw new Error(`Invalid NodeKeywordNode value ${this.text}`);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 11, 13
 * 1.    TLS: `{`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    Repetition: 0 to 1
 * 5.      Concatenation: 6, 7
 * 6.        NodeObjectKvpNode
 * 7.        Repetition: 0 to Infinity
 * 8.          Concatenation: 9, 10
 * 9.            [skipped]
 * 10.           NodeObjectKvpNode
 * 11.   Repetition: 0 to 1
 * 12.     [skipped]
 * 13.   TLS: `}`
 * ```
 */
export class NodeObjectNode extends SyntaxNode<ast.NodeObjectNode> {
  get properties() {
    return this.many('NodeObjectKvp', NodeObjectKvpNode);
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    QuotedTextNode
 * 2.    IdentifierNode
 * ```
 */
class NodeObjectKeyNode {
  static from(node: ast.NodeObjectKeyNode, document: string) {
    const child = node.children[0];

    if (!child) {
      throw new Error('NodeObjectKeyNode has no children');
    }

    switch (child.kind) {
      case 'QuotedText':
        return new QuotedTextNode(child, document);
      case 'Identifier':
        return new IdentifierNode(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 5, 7
 * 1.    NodeObjectKeyNode
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    TLS: `:`
 * 5.    Repetition: 0 to 1
 * 6.      [skipped]
 * 7.    NodeValueNode
 * ```
 */
export class NodeObjectKvpNode extends SyntaxNode<ast.NodeObjectKvpNode> {
  get key() {
    return NodeObjectKeyNode.from(this.oneAst('NodeObjectKey'), this.document);
  }
  get value() {
    return NodeValueNode.from(this.oneAst('NodeValue'), this.document);
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2, 3
 * 1.    ShapeIdNode
 * 2.    TextBlockNode
 * 3.    QuotedTextNode
 * ```
 */
export class NodeStringValueNode extends SyntaxNode<ast.NodeStringValueNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2, 3, 4, 5
 * 1.    NodeArrayNode
 * 2.    NodeObjectNode
 * 3.    NumberNode
 * 4.    NodeKeywordNode
 * 5.    NodeStringValueNode
 * ```
 */
class NodeValueNode {
  static from(
    node: ast.NodeValueNode,
    document: string,
  ):
    | NodeArrayNode
    | NodeObjectNode
    | NumberNode
    | NodeKeywordNode
    | NodeStringValueNode {
    const child = node.children[0];

    if (!child) {
      throw new Error('NodeValueNode has no children');
    }

    switch (child.kind) {
      case 'NodeArray':
        return new NodeArrayNode(child, document);
      case 'NodeObject':
        return new NodeObjectNode(child, document);
      case 'Number':
        return new NumberNode(child, document);
      case 'NodeKeyword':
        return new NodeKeywordNode(child, document);
      case 'NodeStringValue':
        return new NodeStringValueNode(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 3, 4, 6
 * 1.    Repetition: 0 to 1
 * 2.      MinusNode
 * 3.    IntNode
 * 4.    Repetition: 0 to 1
 * 5.      FracNode
 * 6.    Repetition: 0 to 1
 * 7.      ExpNode
 * ```
 */
export class NumberNode extends SyntaxNode<ast.NumberNode> {
  get value() {
    return parseFloat(this.text); // TODO: verify this is correct
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 9
 * 1.    TLS: `{`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    Repetition: 0 to Infinity
 * 5.      Concatenation: 6, 7
 * 6.        OperationPropertyNode
 * 7.        Repetition: 0 to 1
 * 8.          [skipped]
 * 9.    TLS: `}`
 * ```
 */
class OperationBodyNode extends SyntaxNode<ast.OperationBodyNode> {
  get input() {
    const input = this.children
      .flatMap((x) => x.children)
      .find((x) => x.kind === 'OperationInput');

    return input ? OperationInputNode.from(input, this.document) : undefined;
  }

  get output() {
    const output = this.children
      .flatMap((x) => x.children)
      .find((x) => x.kind === 'OperationOutput');

    return output ? OperationOutputNode.from(output, this.document) : undefined;
  }

  get errors() {
    return this.children
      .flatMap((property) => property.children)
      .filter((node) => node.kind === 'OperationErrors')
      .flatMap((error) => OperationErrorsNode.from(error, this.document));
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 5, 7, 8, 10, 15
 * 1.    TBS: `errors`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    TLS: `:`
 * 5.    Repetition: 0 to 1
 * 6.      [skipped]
 * 7.    TLS: `[`
 * 8.    Repetition: 0 to 1
 * 9.      [skipped]
 * 10.   Repetition: 0 to Infinity
 * 11.     Concatenation: 12, 13
 * 12.       ShapeIdNode
 * 13.       Repetition: 0 to 1
 * 14.         [skipped]
 * 15.   TLS: `]`
 * ```
 */
class OperationErrorsNode {
  static from(node: ast.OperationErrorsNode, document: string) {
    return node.children.map((child) => new ShapeIdNode(child, document));
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4
 * 1.    TBS: `input`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    Alternation: 5, 6
 * 5.      InlineAggregateShapeNode
 * 6.      Concatenation: 7, 8, 10
 * 7.        TLS: `:`
 * 8.        Repetition: 0 to 1
 * 9.          [skipped]
 * 10.       ShapeIdNode
 * ```
 */
class OperationInputNode {
  static from(node: ast.OperationInputNode, document: string) {
    const child = node.children[0];

    if (!child) {
      throw new Error('OperationInputNode has no children');
    }

    switch (child.kind) {
      case 'InlineAggregateShape':
        return new InlineAggregateShapeNode(child, document);
      case 'ShapeId':
        return new ShapeIdNode(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4
 * 1.    TBS: `output`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    Alternation: 5, 6
 * 5.      InlineAggregateShapeNode
 * 6.      Concatenation: 7, 8, 10
 * 7.        TLS: `:`
 * 8.        Repetition: 0 to 1
 * 9.          [skipped]
 * 10.       ShapeIdNode
 * ```
 */
class OperationOutputNode {
  static from(node: ast.OperationOutputNode, document: string) {
    const child = node.children[0];

    if (!child) {
      throw new Error('OperationOutputNode has no children');
    }

    switch (child.kind) {
      case 'InlineAggregateShape':
        return new InlineAggregateShapeNode(child, document);
      case 'ShapeId':
        return new ShapeIdNode(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2, 3
 * 1.    OperationInputNode
 * 2.    OperationOutputNode
 * 3.    OperationErrorsNode
 * ```
 */
export class OperationPropertyNode extends SyntaxNode<ast.OperationPropertyNode> {
  static from(node: ast.OperationPropertyNode, document: string) {
    const child = node.children[0];

    if (!child) {
      throw new Error('OperationPropertyNode has no children');
    }

    switch (child.kind) {
      case 'OperationInput':
        return OperationInputNode.from(child, document);
      case 'OperationOutput':
        return OperationOutputNode.from(child, document);
      case 'OperationErrors':
        return OperationErrorsNode.from(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4, 6, 8
 * 1.    TBS: `operation`
 * 2.    [skipped]
 * 3.    IdentifierNode
 * 4.    Repetition: 0 to 1
 * 5.      MixinsNode
 * 6.    Repetition: 0 to 1
 * 7.      [skipped]
 * 8.    OperationBodyNode
 * ```
 */
export class OperationShapeNode extends SyntaxNode<ast.OperationShapeNode> {
  get name() {
    return this.one('Identifier', IdentifierNode);
  }
  get mixins() {
    return MixinsNode.from(this.zeroOrOneAst('Mixins'), this.document);
  }
  get body() {
    return new OperationBodyNode(this.oneAst('OperationBody'), this.document);
  }
}

/**
 * @example
 * ```text
 * 0.  TBS: `+`
 * ```
 */
export class PlusNode extends SyntaxNode<ast.PlusNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4
 * 1.    [skipped]
 * 2.    Repetition: 0 to Infinity
 * 3.      [skipped]
 * 4.    [skipped]
 * ```
 */
export class QuotedTextNode extends SyntaxNode<ast.QuotedTextNode> {
  // Leaf node
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    AbsoluteRootShapeIdNode
 * 2.    IdentifierNode
 * ```
 */
class RootShapeIdNode {
  static from(node: ast.RootShapeIdNode, document: string) {
    const child = node.children[0];

    if (!child) {
      throw new Error('RootShapeIdNode has no children');
    }

    switch (child.kind) {
      case 'AbsoluteRootShapeId':
        return new AbsoluteRootShapeIdNode(child, document);
      case 'Identifier':
        return new IdentifierNode(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2, 3, 4, 5
 * 1.    SimpleShapeNode
 * 2.    EnumShapeNode
 * 3.    AggregateShapeNode
 * 4.    EntityShapeNode
 * 5.    OperationShapeNode
 * ```
 */
class ShapeNode {
  static from(node: ast.ShapeNode, document: string) {
    const child = node.children[0];

    if (!child) {
      throw new Error('ShapeNode has no children');
    }

    switch (child.kind) {
      case 'SimpleShape':
        return new SimpleShapeNode(child, document);
      case 'EnumShape':
        return new EnumShapeNode(child, document);
      case 'AggregateShape':
        return new AggregateShapeNode(child, document);
      case 'EntityShape':
        return new EntityShapeNode(child, document);
      case 'OperationShape':
        return new OperationShapeNode(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    RootShapeIdNode
 * 2.    Repetition: 0 to 1
 * 3.      ShapeIdMemberNode
 * ```
 */
export class ShapeIdNode extends SyntaxNode<ast.ShapeIdNode> {
  get root() {
    return RootShapeIdNode.from(this.oneAst('RootShapeId'), this.document);
  }
  get member() {
    return ShapeIdMemberNode.from(
      this.zeroOrOneAst('ShapeIdMember'),
      this.document,
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    TLS: `$`
 * 2.    IdentifierNode
 * ```
 */
class ShapeIdMemberNode {
  static from(node: ast.ShapeIdMemberNode | undefined, document: string) {
    return node ? new IdentifierNode(node.children[0], document) : undefined;
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 5
 * 1.    TraitStatementsNode
 * 2.    Alternation: 3, 4
 * 3.      ExplicitShapeMemberNode
 * 4.      ElidedShapeMemberNode
 * 5.    Repetition: 0 to 1
 * 6.      ValueAssignmentNode
 * ```
 */
export class ShapeMemberNode extends SyntaxNode<ast.ShapeMemberNode> {
  get traits() {
    return TraitStatementsNode.from(
      this.oneAst('TraitStatements'),
      this.document,
    );
  }
  get member() {
    const explicitShapeMember = this.zeroOrOneAst('ExplicitShapeMember');
    if (explicitShapeMember) {
      return new ExplicitShapeMemberNode(explicitShapeMember, this.document);
    }
    const elidedShapeMember = this.zeroOrOneAst('ElidedShapeMember');
    if (elidedShapeMember) {
      return new ElidedShapeMemberNode(elidedShapeMember, this.document);
    }

    throw new Error('ShapeMemberNode has no children');
  }
  get value() {
    return ValueAssignmentNode.from(
      this.zeroOrOneAst('ValueAssignment'),
      this.document,
    );
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 9
 * 1.    TLS: `{`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    Repetition: 0 to Infinity
 * 5.      Concatenation: 6, 7
 * 6.        ShapeMemberNode
 * 7.        Repetition: 0 to 1
 * 8.          [skipped]
 * 9.    TLS: `}`
 * ```
 */
class ShapeMembersNode {
  static from(node: ast.ShapeMembersNode, document: string) {
    return node.children.map((child) => new ShapeMemberNode(child, document));
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    ShapeStatementNode
 * 2.    ApplyStatementNode
 * ```
 */
class ShapeOrApplyStatementNode {
  static from(node: ast.ShapeOrApplyStatementNode, document: string) {
    const child = node.children[0];

    if (!child) {
      throw new Error('ShapeOrApplyStatementNode has no children');
    }

    switch (child.kind) {
      case 'ShapeStatement':
        return new ShapeStatementNode(child, document);
      case 'ApplyStatement':
        return ApplyStatementNode.from(child, document);
      default:
        throw new Error(
          `Invalid ShapeOrApplyStatementNode kind ${(child as any).kind}`,
        );
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Repetition: 0 to 1
 * 1.    Concatenation: 2, 3, 4
 * 2.      NamespaceStatementNode
 * 3.      UseSectionNode
 * 4.      Repetition: 0 to 1
 * 5.        ShapeStatementsNode
 * ```
 */
export class ShapeSectionNode extends SyntaxNode<ast.ShapeSectionNode> {
  get namespace() {
    const child = this.zeroOrOneAst('NamespaceStatement');
    return child
      ? NamespaceStatementNode.from(child, this.document)
      : undefined;
  }
  get use() {
    const child = this.zeroOrOneAst('UseSection');
    return child ? UseSectionNode.from(child, this.document) : undefined;
  }

  get shapes() {
    return this.zeroOrOneAst('ShapeStatements')
      ? ShapeStatementsNode.from(this.oneAst('ShapeStatements'), this.document)
      : [];
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    TraitStatementsNode
 * 2.    ShapeNode
 * ```
 */
export class ShapeStatementNode extends SyntaxNode<ast.ShapeStatementNode> {
  get traits() {
    return TraitStatementsNode.from(
      this.oneAst('TraitStatements'),
      this.document,
    );
  }
  get shape() {
    return ShapeNode.from(this.oneAst('Shape'), this.document);
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    ShapeOrApplyStatementNode
 * 2.    Repetition: 0 to Infinity
 * 3.      Concatenation: 4, 5
 * 4.        [skipped]
 * 5.        ShapeOrApplyStatementNode
 * ```
 */
class ShapeStatementsNode {
  static from(node: ast.ShapeStatementsNode, document: string) {
    // TODO: figure out how Comment kinds are showing up here
    return node.children
      .filter((child) => child.kind === 'ShapeOrApplyStatement')
      .map((child) => ShapeOrApplyStatementNode.from(child, document));
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4
 * 1.    SimpleTypeNameNode
 * 2.    [skipped]
 * 3.    IdentifierNode
 * 4.    Repetition: 0 to 1
 * 5.      MixinsNode
 * ```
 */
export class SimpleShapeNode extends SyntaxNode<ast.SimpleShapeNode> {
  get typeName() {
    return new SimpleTypeNameNode(this.oneAst('SimpleTypeName'), this.document);
  }
  get name() {
    return this.one('Identifier', IdentifierNode);
  }
  get mixins() {
    return MixinsNode.from(this.zeroOrOneAst('Mixins'), this.document);
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
 * 1.    TBS: `blob`
 * 2.    TBS: `boolean`
 * 3.    TBS: `document`
 * 4.    TBS: `string`
 * 5.    TBS: `byte`
 * 6.    TBS: `short`
 * 7.    TBS: `integer`
 * 8.    TBS: `long`
 * 9.    TBS: `float`
 * 10.   TBS: `double`
 * 11.   TBS: `bigInteger`
 * 12.   TBS: `bigDecimal`
 * 13.   TBS: `timestamp`
 * ```
 */
export class SimpleTypeNameNode extends SyntaxNode<ast.SimpleTypeNameNode> {
  get value() {
    switch (this.text) {
      case 'blob':
      case 'boolean':
      case 'document':
      case 'string':
      case 'byte':
      case 'short':
      case 'integer':
      case 'long':
      case 'float':
      case 'double':
      case 'bigInteger':
      case 'bigDecimal':
      case 'timestamp':
        return this.text;
      default:
        throw new Error(`Invalid SimpleTypeNameNode value ${this.text}`);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 5, 7
 * 1.    ThreeDquotesNode
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    [skipped]
 * 5.    Repetition: 0 to Infinity
 * 6.      TextBlockContentNode
 * 7.    ThreeDquotesNode
 * ```
 */
export class TextBlockNode extends SyntaxNode<ast.TextBlockNode> {
  get content() {
    return this.many('TextBlockContent', TextBlockContentNode);
  }
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    [skipped]
 * 2.    Concatenation: 3, 5
 * 3.      Repetition: 1 to 2
 * 4.        [skipped]
 * 5.      Repetition: 1 to Infinity
 * 6.        [skipped]
 * ```
 */
export class TextBlockContentNode extends SyntaxNode<ast.TextBlockContentNode> {
  // Leaf node
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3
 * 1.    [skipped]
 * 2.    [skipped]
 * 3.    [skipped]
 * ```
 */
export class ThreeDquotesNode extends SyntaxNode<ast.ThreeDquotesNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3
 * 1.    TLS: `@`
 * 2.    ShapeIdNode
 * 3.    Repetition: 0 to 1
 * 4.      TraitBodyNode
 * ```
 */
export class TraitNode extends SyntaxNode<ast.TraitNode> {
  get id() {
    return new ShapeIdNode(this.oneAst('ShapeId'), this.document);
  }
  get body() {
    const child = this.zeroOrOneAst('TraitBody');

    return child ? TraitBodyNode.from(child, this.document) : undefined;
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 4, 8
 * 1.    TLS: `(`
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * 4.    Repetition: 0 to 1
 * 5.      Alternation: 6, 7
 * 6.        TraitStructureNode
 * 7.        TraitNodeNode
 * 8.    TLS: `)`
 * ```
 */
class TraitBodyNode {
  static from(
    node: ast.TraitBodyNode,
    document: string,
  ):
    | NodeObjectKvpNode[]
    | NodeArrayNode
    | NodeObjectNode
    | NumberNode
    | NodeKeywordNode
    | NodeStringValueNode {
    const child = node.children[0];

    if (!child) {
      throw new Error('TraitBodyNode has no children');
    }

    switch (child.kind) {
      case 'TraitStructure':
        return TraitStructureNode.from(child, document);
      case 'TraitNode':
        return TraitNodeNode.from(child, document);
    }
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    NodeValueNode
 * 2.    Repetition: 0 to 1
 * 3.      [skipped]
 * ```
 */
class TraitNodeNode {
  static from(node: ast.TraitNodeNode, document: string) {
    return NodeValueNode.from(node.children[0], document);
  }
}

/**
 * @example
 * ```text
 * 0.  Repetition: 0 to Infinity
 * 1.    Concatenation: 2, 3
 * 2.      TraitNode
 * 3.      Repetition: 0 to 1
 * 4.        [skipped]
 * ```
 */
class TraitStatementsNode {
  static from(node: ast.TraitStatementsNode, document: string) {
    return node.children.map((child) => new TraitNode(child, document));
  }
}

/**
 * @example
 * ```text
 * 0.  Repetition: 1 to Infinity
 * 1.    Concatenation: 2, 3
 * 2.      NodeObjectKvpNode
 * 3.      Repetition: 0 to 1
 * 4.        [skipped]
 * ```
 */
class TraitStructureNode {
  static from(node: ast.TraitStructureNode, document: string) {
    return node.children.map((child) => new NodeObjectKvpNode(child, document));
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4, 5
 * 1.    TBS: `u`
 * 2.    HexNode
 * 3.    HexNode
 * 4.    HexNode
 * 5.    HexNode
 * ```
 */
export class UnicodeEscapeNode extends SyntaxNode<ast.UnicodeEscapeNode> {
  // TODO: implement or remove
}

/**
 * @example
 * ```text
 * 0.  Repetition: 0 to Infinity
 * 1.    UseStatementNode
 * ```
 */
class UseSectionNode {
  static from(node: ast.UseSectionNode, document: string) {
    return node.children.map((child) => UseStatementNode.from(child, document));
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3, 4
 * 1.    TBS: `use`
 * 2.    [skipped]
 * 3.    AbsoluteRootShapeIdNode
 * 4.    [skipped]
 * ```
 */
class UseStatementNode {
  static from(node: ast.UseStatementNode, document: string) {
    return new AbsoluteRootShapeIdNode(node.children[0], document);
  }
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 3, 4, 6, 7, 9, 11
 * 1.    Repetition: 0 to 1
 * 2.      [skipped]
 * 3.    TLS: `=`
 * 4.    Repetition: 0 to 1
 * 5.      [skipped]
 * 6.    NodeValueNode
 * 7.    Repetition: 0 to 1
 * 8.      [skipped]
 * 9.    Repetition: 0 to 1
 * 10.     [skipped]
 * 11.   [skipped]
 * ```
 */
class ValueAssignmentNode {
  static from(node: ast.ValueAssignmentNode | undefined, document: string) {
    return node ? NodeValueNode.from(node.children[0], document) : undefined;
  }
}
