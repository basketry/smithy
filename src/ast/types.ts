/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2, 3
 * 1.    NamespaceNode
 * 2.    TLS: `#`
 * 3.    IdentifierNode
 * ```
 */
export type AbsoluteRootShapeIdNode = {
  kind: 'AbsoluteRootShapeId';
  offset: number;
  length: number;
  children: (IdentifierNode | NamespaceNode)[];
};

export function isAbsoluteRootShapeIdNode(
  node: Node,
): node is AbsoluteRootShapeIdNode {
  return node.kind === 'AbsoluteRootShapeId';
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
export type AggregateShapeNode = {
  kind: 'AggregateShape';
  offset: number;
  length: number;
  // Ingored trivia: SP, WS
  children: (
    | AggregateTypeNameNode
    | ForResourceNode
    | IdentifierNode
    | MixinsNode
    | ShapeMembersNode
  )[];
};

export function isAggregateShapeNode(node: Node): node is AggregateShapeNode {
  return node.kind === 'AggregateShape';
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
export type AggregateTypeNameNode = {
  kind: 'AggregateTypeName';
  offset: number;
  length: number;
  children: never[];
};

export function isAggregateTypeNameNode(
  node: Node,
): node is AggregateTypeNameNode {
  return node.kind === 'AggregateTypeName';
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    ApplyStatementSingularNode
 * 2.    ApplyStatementBlockNode
 * ```
 */
export type ApplyStatementNode = {
  kind: 'ApplyStatement';
  offset: number;
  length: number;
  children: (ApplyStatementBlockNode | ApplyStatementSingularNode)[];
};

export function isApplyStatementNode(node: Node): node is ApplyStatementNode {
  return node.kind === 'ApplyStatement';
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
export type ApplyStatementBlockNode = {
  kind: 'ApplyStatementBlock';
  offset: number;
  length: number;
  // Ingored trivia: SP, WS
  children: (ShapeIdNode | TraitStatementsNode)[];
};

export function isApplyStatementBlockNode(
  node: Node,
): node is ApplyStatementBlockNode {
  return node.kind === 'ApplyStatementBlock';
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
export type ApplyStatementSingularNode = {
  kind: 'ApplyStatementSingular';
  offset: number;
  length: number;
  // Ingored trivia: SP, WS
  children: (ShapeIdNode | TraitNode)[];
};

export function isApplyStatementSingularNode(
  node: Node,
): node is ApplyStatementSingularNode {
  return node.kind === 'ApplyStatementSingular';
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    DocumentationCommentNode
 * 2.    LineCommentNode
 * ```
 */
export type CommentNode = {
  kind: 'Comment';
  offset: number;
  length: number;
  children: (DocumentationCommentNode | LineCommentNode)[];
};

export function isCommentNode(node: Node): node is CommentNode {
  return node.kind === 'Comment';
}

/**
 * @example
 * ```text
 * 0.  Repetition: 0 to Infinity
 * 1.    ControlStatementNode
 * ```
 */
export type ControlSectionNode = {
  kind: 'ControlSection';
  offset: number;
  length: number;
  children: ControlStatementNode[];
};

export function isControlSectionNode(node: Node): node is ControlSectionNode {
  return node.kind === 'ControlSection';
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
export type ControlStatementNode = {
  kind: 'ControlStatement';
  offset: number;
  length: number;
  // Ingored trivia: BR, SP
  children: (NodeObjectKeyNode | NodeValueNode)[];
};

export function isControlStatementNode(
  node: Node,
): node is ControlStatementNode {
  return node.kind === 'ControlStatement';
}

/**
 * @example
 * ```text
 * 0.  TBS: `.`
 * ```
 */
export type DecimalPointNode = {
  kind: 'DecimalPoint';
  offset: number;
  length: number;
  children: never[];
};

export function isDecimalPointNode(node: Node): node is DecimalPointNode {
  return node.kind === 'DecimalPoint';
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
export type DocumentationCommentNode = {
  kind: 'DocumentationComment';
  offset: number;
  length: number;
  // Ingored trivia: NL, NotNL
  children: never[];
};

export function isDocumentationCommentNode(
  node: Node,
): node is DocumentationCommentNode {
  return node.kind === 'DocumentationComment';
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    TBS: `e`
 * 2.    TBS: `E`
 * ```
 */
export type ENode = {
  kind: 'E';
  offset: number;
  length: number;
  children: never[];
};

export function isENode(node: Node): node is ENode {
  return node.kind === 'E';
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    TLS: `$`
 * 2.    IdentifierNode
 * ```
 */
export type ElidedShapeMemberNode = {
  kind: 'ElidedShapeMember';
  offset: number;
  length: number;
  children: IdentifierNode[];
};

export function isElidedShapeMemberNode(
  node: Node,
): node is ElidedShapeMemberNode {
  return node.kind === 'ElidedShapeMember';
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
export type EntityShapeNode = {
  kind: 'EntityShape';
  offset: number;
  length: number;
  // Ingored trivia: SP, WS
  children: (
    | EntityTypeNameNode
    | IdentifierNode
    | MixinsNode
    | NodeObjectNode
  )[];
};

export function isEntityShapeNode(node: Node): node is EntityShapeNode {
  return node.kind === 'EntityShape';
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    TBS: `service`
 * 2.    TBS: `resource`
 * ```
 */
export type EntityTypeNameNode = {
  kind: 'EntityTypeName';
  offset: number;
  length: number;
  children: never[];
};

export function isEntityTypeNameNode(node: Node): node is EntityTypeNameNode {
  return node.kind === 'EntityTypeName';
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
export type EnumShapeNode = {
  kind: 'EnumShape';
  offset: number;
  length: number;
  // Ingored trivia: SP, WS
  children: (
    | EnumShapeMembersNode
    | EnumTypeNameNode
    | IdentifierNode
    | MixinsNode
  )[];
};

export function isEnumShapeNode(node: Node): node is EnumShapeNode {
  return node.kind === 'EnumShape';
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
export type EnumShapeMemberNode = {
  kind: 'EnumShapeMember';
  offset: number;
  length: number;
  children: (IdentifierNode | TraitStatementsNode | ValueAssignmentNode)[];
};

export function isEnumShapeMemberNode(node: Node): node is EnumShapeMemberNode {
  return node.kind === 'EnumShapeMember';
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
export type EnumShapeMembersNode = {
  kind: 'EnumShapeMembers';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: EnumShapeMemberNode[];
};

export function isEnumShapeMembersNode(
  node: Node,
): node is EnumShapeMembersNode {
  return node.kind === 'EnumShapeMembers';
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    TBS: `enum`
 * 2.    TBS: `intEnum`
 * ```
 */
export type EnumTypeNameNode = {
  kind: 'EnumTypeName';
  offset: number;
  length: number;
  children: never[];
};

export function isEnumTypeNameNode(node: Node): node is EnumTypeNameNode {
  return node.kind === 'EnumTypeName';
}

/**
 * @example
 * ```text
 * 0.  TBS: `\`
 * ```
 */
export type EscapeNode = {
  kind: 'Escape';
  offset: number;
  length: number;
  children: never[];
};

export function isEscapeNode(node: Node): node is EscapeNode {
  return node.kind === 'Escape';
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
export type EscapedCharNode = {
  kind: 'EscapedChar';
  offset: number;
  length: number;
  // Ingored trivia: DQUOTE
  children: (EscapeNode | UnicodeEscapeNode)[];
};

export function isEscapedCharNode(node: Node): node is EscapedCharNode {
  return node.kind === 'EscapedChar';
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
export type ExpNode = {
  kind: 'Exp';
  offset: number;
  length: number;
  // Ingored trivia: DIGIT
  children: (ENode | MinusNode | PlusNode)[];
};

export function isExpNode(node: Node): node is ExpNode {
  return node.kind === 'Exp';
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
export type ExplicitShapeMemberNode = {
  kind: 'ExplicitShapeMember';
  offset: number;
  length: number;
  // Ingored trivia: SP
  children: (IdentifierNode | ShapeIdNode)[];
};

export function isExplicitShapeMemberNode(
  node: Node,
): node is ExplicitShapeMemberNode {
  return node.kind === 'ExplicitShapeMember';
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
export type ForResourceNode = {
  kind: 'ForResource';
  offset: number;
  length: number;
  // Ingored trivia: SP
  children: ShapeIdNode[];
};

export function isForResourceNode(node: Node): node is ForResourceNode {
  return node.kind === 'ForResource';
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
export type FracNode = {
  kind: 'Frac';
  offset: number;
  length: number;
  // Ingored trivia: DIGIT
  children: DecimalPointNode[];
};

export function isFracNode(node: Node): node is FracNode {
  return node.kind === 'Frac';
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
export type HexNode = {
  kind: 'Hex';
  offset: number;
  length: number;
  // Ingored trivia: DIGIT
  children: never[];
};

export function isHexNode(node: Node): node is HexNode {
  return node.kind === 'Hex';
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
export type IdentifierNode = {
  kind: 'Identifier';
  offset: number;
  length: number;
  // Ingored trivia: IdentifierChars, IdentifierStart
  children: never[];
};

export function isIdentifierNode(node: Node): node is IdentifierNode {
  return node.kind === 'Identifier';
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
export type IdlNode = {
  kind: 'idl';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: (ControlSectionNode | MetadataSectionNode | ShapeSectionNode)[];
};

export function isIdlNode(node: Node): node is IdlNode {
  return node.kind === 'idl';
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
export type InlineAggregateShapeNode = {
  kind: 'InlineAggregateShape';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: (
    | ForResourceNode
    | MixinsNode
    | ShapeMembersNode
    | TraitStatementsNode
  )[];
};

export function isInlineAggregateShapeNode(
  node: Node,
): node is InlineAggregateShapeNode {
  return node.kind === 'InlineAggregateShape';
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
export type IntNode = {
  kind: 'Int';
  offset: number;
  length: number;
  // Ingored trivia: DIGIT, DigitOneToNine, Zero
  children: never[];
};

export function isIntNode(node: Node): node is IntNode {
  return node.kind === 'Int';
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
export type LineCommentNode = {
  kind: 'LineComment';
  offset: number;
  length: number;
  // Ingored trivia: NL, NotNL
  children: never[];
};

export function isLineCommentNode(node: Node): node is LineCommentNode {
  return node.kind === 'LineComment';
}

/**
 * @example
 * ```text
 * 0.  Repetition: 0 to Infinity
 * 1.    MetadataStatementNode
 * ```
 */
export type MetadataSectionNode = {
  kind: 'MetadataSection';
  offset: number;
  length: number;
  children: MetadataStatementNode[];
};

export function isMetadataSectionNode(node: Node): node is MetadataSectionNode {
  return node.kind === 'MetadataSection';
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
export type MetadataStatementNode = {
  kind: 'MetadataStatement';
  offset: number;
  length: number;
  // Ingored trivia: BR, SP
  children: (NodeObjectKeyNode | NodeValueNode)[];
};

export function isMetadataStatementNode(
  node: Node,
): node is MetadataStatementNode {
  return node.kind === 'MetadataStatement';
}

/**
 * @example
 * ```text
 * 0.  TBS: `-`
 * ```
 */
export type MinusNode = {
  kind: 'Minus';
  offset: number;
  length: number;
  children: never[];
};

export function isMinusNode(node: Node): node is MinusNode {
  return node.kind === 'Minus';
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
export type MixinsNode = {
  kind: 'Mixins';
  offset: number;
  length: number;
  // Ingored trivia: SP, WS
  children: ShapeIdNode[];
};

export function isMixinsNode(node: Node): node is MixinsNode {
  return node.kind === 'Mixins';
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
export type NamespaceNode = {
  kind: 'Namespace';
  offset: number;
  length: number;
  children: IdentifierNode[];
};

export function isNamespaceNode(node: Node): node is NamespaceNode {
  return node.kind === 'Namespace';
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
export type NamespaceStatementNode = {
  kind: 'NamespaceStatement';
  offset: number;
  length: number;
  // Ingored trivia: BR, SP
  children: NamespaceNode[];
};

export function isNamespaceStatementNode(
  node: Node,
): node is NamespaceStatementNode {
  return node.kind === 'NamespaceStatement';
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
export type NodeArrayNode = {
  kind: 'NodeArray';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: NodeValueNode[];
};

export function isNodeArrayNode(node: Node): node is NodeArrayNode {
  return node.kind === 'NodeArray';
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
export type NodeKeywordNode = {
  kind: 'NodeKeyword';
  offset: number;
  length: number;
  children: never[];
};

export function isNodeKeywordNode(node: Node): node is NodeKeywordNode {
  return node.kind === 'NodeKeyword';
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
export type NodeObjectNode = {
  kind: 'NodeObject';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: NodeObjectKvpNode[];
};

export function isNodeObjectNode(node: Node): node is NodeObjectNode {
  return node.kind === 'NodeObject';
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    QuotedTextNode
 * 2.    IdentifierNode
 * ```
 */
export type NodeObjectKeyNode = {
  kind: 'NodeObjectKey';
  offset: number;
  length: number;
  children: (IdentifierNode | QuotedTextNode)[];
};

export function isNodeObjectKeyNode(node: Node): node is NodeObjectKeyNode {
  return node.kind === 'NodeObjectKey';
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
export type NodeObjectKvpNode = {
  kind: 'NodeObjectKvp';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: (NodeObjectKeyNode | NodeValueNode)[];
};

export function isNodeObjectKvpNode(node: Node): node is NodeObjectKvpNode {
  return node.kind === 'NodeObjectKvp';
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
export type NodeStringValueNode = {
  kind: 'NodeStringValue';
  offset: number;
  length: number;
  children: (QuotedTextNode | ShapeIdNode | TextBlockNode)[];
};

export function isNodeStringValueNode(node: Node): node is NodeStringValueNode {
  return node.kind === 'NodeStringValue';
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
export type NodeValueNode = {
  kind: 'NodeValue';
  offset: number;
  length: number;
  children: (
    | NodeArrayNode
    | NodeKeywordNode
    | NodeObjectNode
    | NodeStringValueNode
    | NumberNode
  )[];
};

export function isNodeValueNode(node: Node): node is NodeValueNode {
  return node.kind === 'NodeValue';
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
export type NumberNode = {
  kind: 'Number';
  offset: number;
  length: number;
  children: (ExpNode | FracNode | IntNode | MinusNode)[];
};

export function isNumberNode(node: Node): node is NumberNode {
  return node.kind === 'Number';
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
export type OperationBodyNode = {
  kind: 'OperationBody';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: OperationPropertyNode[];
};

export function isOperationBodyNode(node: Node): node is OperationBodyNode {
  return node.kind === 'OperationBody';
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
export type OperationErrorsNode = {
  kind: 'OperationErrors';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: ShapeIdNode[];
};

export function isOperationErrorsNode(node: Node): node is OperationErrorsNode {
  return node.kind === 'OperationErrors';
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
export type OperationInputNode = {
  kind: 'OperationInput';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: (InlineAggregateShapeNode | ShapeIdNode)[];
};

export function isOperationInputNode(node: Node): node is OperationInputNode {
  return node.kind === 'OperationInput';
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
export type OperationOutputNode = {
  kind: 'OperationOutput';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: (InlineAggregateShapeNode | ShapeIdNode)[];
};

export function isOperationOutputNode(node: Node): node is OperationOutputNode {
  return node.kind === 'OperationOutput';
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
export type OperationPropertyNode = {
  kind: 'OperationProperty';
  offset: number;
  length: number;
  children: (OperationErrorsNode | OperationInputNode | OperationOutputNode)[];
};

export function isOperationPropertyNode(
  node: Node,
): node is OperationPropertyNode {
  return node.kind === 'OperationProperty';
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
export type OperationShapeNode = {
  kind: 'OperationShape';
  offset: number;
  length: number;
  // Ingored trivia: SP, WS
  children: (IdentifierNode | MixinsNode | OperationBodyNode)[];
};

export function isOperationShapeNode(node: Node): node is OperationShapeNode {
  return node.kind === 'OperationShape';
}

/**
 * @example
 * ```text
 * 0.  TBS: `+`
 * ```
 */
export type PlusNode = {
  kind: 'Plus';
  offset: number;
  length: number;
  children: never[];
};

export function isPlusNode(node: Node): node is PlusNode {
  return node.kind === 'Plus';
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
export type QuotedTextNode = {
  kind: 'QuotedText';
  offset: number;
  length: number;
  // Ingored trivia: DQUOTE, QuotedChar
  children: never[];
};

export function isQuotedTextNode(node: Node): node is QuotedTextNode {
  return node.kind === 'QuotedText';
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    AbsoluteRootShapeIdNode
 * 2.    IdentifierNode
 * ```
 */
export type RootShapeIdNode = {
  kind: 'RootShapeId';
  offset: number;
  length: number;
  children: (AbsoluteRootShapeIdNode | IdentifierNode)[];
};

export function isRootShapeIdNode(node: Node): node is RootShapeIdNode {
  return node.kind === 'RootShapeId';
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
export type ShapeNode = {
  kind: 'Shape';
  offset: number;
  length: number;
  children: (
    | AggregateShapeNode
    | EntityShapeNode
    | EnumShapeNode
    | OperationShapeNode
    | SimpleShapeNode
  )[];
};

export function isShapeNode(node: Node): node is ShapeNode {
  return node.kind === 'Shape';
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
export type ShapeIdNode = {
  kind: 'ShapeId';
  offset: number;
  length: number;
  children: (RootShapeIdNode | ShapeIdMemberNode)[];
};

export function isShapeIdNode(node: Node): node is ShapeIdNode {
  return node.kind === 'ShapeId';
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    TLS: `$`
 * 2.    IdentifierNode
 * ```
 */
export type ShapeIdMemberNode = {
  kind: 'ShapeIdMember';
  offset: number;
  length: number;
  children: IdentifierNode[];
};

export function isShapeIdMemberNode(node: Node): node is ShapeIdMemberNode {
  return node.kind === 'ShapeIdMember';
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
export type ShapeMemberNode = {
  kind: 'ShapeMember';
  offset: number;
  length: number;
  children: (
    | ElidedShapeMemberNode
    | ExplicitShapeMemberNode
    | TraitStatementsNode
    | ValueAssignmentNode
  )[];
};

export function isShapeMemberNode(node: Node): node is ShapeMemberNode {
  return node.kind === 'ShapeMember';
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
export type ShapeMembersNode = {
  kind: 'ShapeMembers';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: ShapeMemberNode[];
};

export function isShapeMembersNode(node: Node): node is ShapeMembersNode {
  return node.kind === 'ShapeMembers';
}

/**
 * @example
 * ```text
 * 0.  Alternation: 1, 2
 * 1.    ShapeStatementNode
 * 2.    ApplyStatementNode
 * ```
 */
export type ShapeOrApplyStatementNode = {
  kind: 'ShapeOrApplyStatement';
  offset: number;
  length: number;
  children: (ApplyStatementNode | ShapeStatementNode)[];
};

export function isShapeOrApplyStatementNode(
  node: Node,
): node is ShapeOrApplyStatementNode {
  return node.kind === 'ShapeOrApplyStatement';
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
export type ShapeSectionNode = {
  kind: 'ShapeSection';
  offset: number;
  length: number;
  children: (NamespaceStatementNode | ShapeStatementsNode | UseSectionNode)[];
};

export function isShapeSectionNode(node: Node): node is ShapeSectionNode {
  return node.kind === 'ShapeSection';
}

/**
 * @example
 * ```text
 * 0.  Concatenation: 1, 2
 * 1.    TraitStatementsNode
 * 2.    ShapeNode
 * ```
 */
export type ShapeStatementNode = {
  kind: 'ShapeStatement';
  offset: number;
  length: number;
  children: (ShapeNode | TraitStatementsNode)[];
};

export function isShapeStatementNode(node: Node): node is ShapeStatementNode {
  return node.kind === 'ShapeStatement';
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
export type ShapeStatementsNode = {
  kind: 'ShapeStatements';
  offset: number;
  length: number;
  // Ingored trivia: BR
  children: ShapeOrApplyStatementNode[];
};

export function isShapeStatementsNode(node: Node): node is ShapeStatementsNode {
  return node.kind === 'ShapeStatements';
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
export type SimpleShapeNode = {
  kind: 'SimpleShape';
  offset: number;
  length: number;
  // Ingored trivia: SP
  children: (IdentifierNode | MixinsNode | SimpleTypeNameNode)[];
};

export function isSimpleShapeNode(node: Node): node is SimpleShapeNode {
  return node.kind === 'SimpleShape';
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
export type SimpleTypeNameNode = {
  kind: 'SimpleTypeName';
  offset: number;
  length: number;
  children: never[];
};

export function isSimpleTypeNameNode(node: Node): node is SimpleTypeNameNode {
  return node.kind === 'SimpleTypeName';
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
export type TextBlockNode = {
  kind: 'TextBlock';
  offset: number;
  length: number;
  // Ingored trivia: NL, SP
  children: (TextBlockContentNode | ThreeDquotesNode)[];
};

export function isTextBlockNode(node: Node): node is TextBlockNode {
  return node.kind === 'TextBlock';
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
export type TextBlockContentNode = {
  kind: 'TextBlockContent';
  offset: number;
  length: number;
  // Ingored trivia: DQUOTE, QuotedChar
  children: never[];
};

export function isTextBlockContentNode(
  node: Node,
): node is TextBlockContentNode {
  return node.kind === 'TextBlockContent';
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
export type ThreeDquotesNode = {
  kind: 'ThreeDquotes';
  offset: number;
  length: number;
  // Ingored trivia: DQUOTE
  children: never[];
};

export function isThreeDquotesNode(node: Node): node is ThreeDquotesNode {
  return node.kind === 'ThreeDquotes';
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
export type TraitNode = {
  kind: 'Trait';
  offset: number;
  length: number;
  children: (ShapeIdNode | TraitBodyNode)[];
};

export function isTraitNode(node: Node): node is TraitNode {
  return node.kind === 'Trait';
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
export type TraitBodyNode = {
  kind: 'TraitBody';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: (TraitNodeNode | TraitStructureNode)[];
};

export function isTraitBodyNode(node: Node): node is TraitBodyNode {
  return node.kind === 'TraitBody';
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
export type TraitNodeNode = {
  kind: 'TraitNode';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: NodeValueNode[];
};

export function isTraitNodeNode(node: Node): node is TraitNodeNode {
  return node.kind === 'TraitNode';
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
export type TraitStatementsNode = {
  kind: 'TraitStatements';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: TraitNode[];
};

export function isTraitStatementsNode(node: Node): node is TraitStatementsNode {
  return node.kind === 'TraitStatements';
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
export type TraitStructureNode = {
  kind: 'TraitStructure';
  offset: number;
  length: number;
  // Ingored trivia: WS
  children: NodeObjectKvpNode[];
};

export function isTraitStructureNode(node: Node): node is TraitStructureNode {
  return node.kind === 'TraitStructure';
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
export type UnicodeEscapeNode = {
  kind: 'UnicodeEscape';
  offset: number;
  length: number;
  children: HexNode[];
};

export function isUnicodeEscapeNode(node: Node): node is UnicodeEscapeNode {
  return node.kind === 'UnicodeEscape';
}

/**
 * @example
 * ```text
 * 0.  Repetition: 0 to Infinity
 * 1.    UseStatementNode
 * ```
 */
export type UseSectionNode = {
  kind: 'UseSection';
  offset: number;
  length: number;
  children: UseStatementNode[];
};

export function isUseSectionNode(node: Node): node is UseSectionNode {
  return node.kind === 'UseSection';
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
export type UseStatementNode = {
  kind: 'UseStatement';
  offset: number;
  length: number;
  // Ingored trivia: BR, SP
  children: AbsoluteRootShapeIdNode[];
};

export function isUseStatementNode(node: Node): node is UseStatementNode {
  return node.kind === 'UseStatement';
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
export type ValueAssignmentNode = {
  kind: 'ValueAssignment';
  offset: number;
  length: number;
  // Ingored trivia: BR, Comma, SP
  children: NodeValueNode[];
};

export function isValueAssignmentNode(node: Node): node is ValueAssignmentNode {
  return node.kind === 'ValueAssignment';
}

export type Node =
  | IdlNode
  | CommentNode
  | DocumentationCommentNode
  | LineCommentNode
  | ControlSectionNode
  | ControlStatementNode
  | MetadataSectionNode
  | MetadataStatementNode
  | NodeValueNode
  | NodeArrayNode
  | NodeObjectNode
  | NodeObjectKvpNode
  | NodeObjectKeyNode
  | NumberNode
  | DecimalPointNode
  | ENode
  | ExpNode
  | FracNode
  | IntNode
  | MinusNode
  | PlusNode
  | NodeKeywordNode
  | NodeStringValueNode
  | QuotedTextNode
  | EscapedCharNode
  | UnicodeEscapeNode
  | HexNode
  | EscapeNode
  | TextBlockNode
  | TextBlockContentNode
  | ThreeDquotesNode
  | ShapeSectionNode
  | NamespaceStatementNode
  | UseSectionNode
  | UseStatementNode
  | ShapeStatementsNode
  | ShapeOrApplyStatementNode
  | ShapeStatementNode
  | ShapeNode
  | SimpleShapeNode
  | SimpleTypeNameNode
  | MixinsNode
  | EnumShapeNode
  | EnumTypeNameNode
  | EnumShapeMembersNode
  | EnumShapeMemberNode
  | ValueAssignmentNode
  | AggregateShapeNode
  | AggregateTypeNameNode
  | ForResourceNode
  | ShapeMembersNode
  | ShapeMemberNode
  | ExplicitShapeMemberNode
  | ElidedShapeMemberNode
  | EntityShapeNode
  | EntityTypeNameNode
  | OperationShapeNode
  | OperationBodyNode
  | OperationPropertyNode
  | OperationInputNode
  | OperationOutputNode
  | OperationErrorsNode
  | InlineAggregateShapeNode
  | TraitStatementsNode
  | TraitNode
  | TraitBodyNode
  | TraitStructureNode
  | TraitNodeNode
  | ApplyStatementNode
  | ApplyStatementSingularNode
  | ApplyStatementBlockNode
  | ShapeIdNode
  | RootShapeIdNode
  | AbsoluteRootShapeIdNode
  | NamespaceNode
  | IdentifierNode
  | ShapeIdMemberNode;
