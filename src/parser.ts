/**
 * TODO:
 * - [ ] http protocols
 * - [ ] descriptions
 * - [ ] constants
 * - [ ] defaults
 * - [ ] InlineAggregateShapes
 * - [ ] For statements
 * - [ ] mixins
 * - [ ] Apply statements
 * - [ ] array min/max items rule
 * - [ ] object rules
 * - [ ] parse meta/extensions
 */

import {
  decodeRange,
  Enum,
  HttpMethod,
  HttpPath,
  Interface,
  Method,
  Parameter,
  Parser,
  Primitive,
  Property,
  ReturnType,
  Scalar,
  Service,
  Type,
  ValidationRule,
  Violation,
} from 'basketry';

import { parse } from './ast/parser';
import * as syntax from './ast/syntax';

export const smithyParser: Parser = (schema, sourcePath) =>
  new SmithyParser(schema, sourcePath).parse();

type SmithyPrimitive =
  | 'Boolean'
  | 'String'
  | 'Integer'
  | 'Long'
  | 'Float'
  | 'Short'
  | 'Double'
  | 'Byte'
  | 'BigInteger'
  | 'BigDecimal'
  | 'Timestamp'
  | 'Blob'
  | 'Timestamp';
function isSmithyPrimitive(
  value: string | undefined,
): value is SmithyPrimitive {
  return smithyPrimitives.has(value);
}
const smithyPrimitives: Set<string | undefined> = new Set([
  'Boolean',
  'String',
  'Integer',
  'Long',
  'Float',
  'Short',
  'Double',
  'Byte',
  'BigInteger',
  'BigDecimal',
  'Timestamp',
  'Blob',
  'Timestamp',
]);

type MemberKind = (Parameter | Property)['kind'];
type Member = Omit<Parameter | Property, 'kind'>;

function toProperty(member: Member): Property {
  const { isPrimitive, typeName, ...rest } = member;

  if (isPrimitive) {
    return {
      kind: 'Property',
      isPrimitive,
      typeName: typeName as Scalar<Primitive>,
      ...rest,
    };
  } else {
    return {
      kind: 'Property',
      isPrimitive,
      typeName,
      ...rest,
    };
  }
}

function toParameter(member: Member): Parameter {
  const { isPrimitive, typeName, ...rest } = member;

  if (isPrimitive) {
    return {
      kind: 'Parameter',
      isPrimitive,
      typeName: typeName as Scalar<Primitive>,
      ...rest,
    };
  } else {
    return {
      kind: 'Parameter',
      isPrimitive,
      typeName,
      ...rest,
    };
  }
}

class SmithyParser {
  constructor(
    private readonly schema: string,
    private readonly sourcePath: string,
  ) {}

  private readonly root: syntax.IdlNode = new syntax.IdlNode(
    parse(this.schema),
    this.schema,
  );

  public readonly violations: Violation[] = [];

  private readonly index: SmithyIndex = new SmithyIndex(this.root);

  parse(): {
    service: Service;
    violations: Violation[];
  } {
    return {
      service: {
        // Contant values
        kind: 'Service',
        basketry: '1.1-rc',
        sourcePath: this.sourcePath,

        // TODO: parse from schema input
        title: { value: 'TODO' },
        majorVersion: { value: 1 },
        interfaces: Array.from(this.emitInterfaces()),
        types: Array.from(this.emitTypes()),
        enums: Array.from(this.emitEnums()),
        unions: [],
      },
      violations: this.violations,
    };
  }

  private *emitInterfaces(): Iterable<Interface> {
    for (const node of this.index.services) {
      yield this.emitInterface(node);
    }
  }

  private emitInterface(node: syntax.EntityShapeNode): Interface {
    const service = 'service';

    const operationsNode = node.body.properties.find(
      (p) => p.key.text === 'operations',
    )?.value;

    const operations: syntax.OperationShapeNode[] = [];
    if (operationsNode?.kind === 'NodeArray') {
      for (const item of operationsNode.items) {
        if (item.kind !== 'NodeStringValue') continue;

        const operation = this.index.operation(item.text);

        if (operation) {
          operations.push(operation);
        } else {
          this.violations.push({
            code: '@basketry-smithy/operation-not-defined',
            message: `Operation not defined: ${item.text}`,
            range: decodeRange(item.loc),
            severity: 'error',
            sourcePath: this.sourcePath,
          });
        }
      }
    }

    const name = node.name.text.toLowerCase().endsWith(service)
      ? node.name.text.slice(0, -service.length)
      : node.name.text;
    return {
      kind: 'Interface',
      name: {
        value: name,
        loc: node.name.loc,
      },
      protocols: {
        http: this.parseHttpProtocol(operations),
      },
      methods: Array.from(this.emitMethods(operations)),
    };
  }

  private parseHttpProtocol(
    operations: syntax.OperationShapeNode[],
  ): HttpPath[] {
    const paths = new Map<string, HttpPath>();

    for (const operation of operations) {
      const traits = this.index.traits(operation.name.text);
      const httpTrait = traits.find((trait) => trait.id.text === 'http');

      if (!httpTrait) continue;
      if (!Array.isArray(httpTrait.body)) continue;

      const method = httpTrait.body.find((x) => x.key.text === 'method')?.value;
      const uri = httpTrait.body.find((x) => x.key.text === 'uri')?.value;
      const code = httpTrait.body.find((x) => x.key.text === 'code')?.value;

      if (method?.kind !== 'NodeStringValue') continue;
      if (uri?.kind !== 'NodeStringValue') continue;
      if (code !== undefined && code?.kind !== 'Number') continue;

      if (!paths.has(uri.text)) {
        paths.set(uri.text, {
          kind: 'HttpPath',
          path: { value: uri.text, loc: uri.loc },
          methods: [],
          loc: httpTrait.loc,
          // TODO: meta/extensions
        });
      }

      const httpPath = paths.get(uri.text)!; // We just wrote this above
      httpPath.methods.push(this.parseHttpMethod(operation, method, code));
    }

    return [];
  }

  private parseHttpMethod(
    operation: syntax.OperationShapeNode,
    method: syntax.NodeStringValueNode,
    code: syntax.NumberNode | undefined,
  ): HttpMethod {
    return {
      kind: 'HttpMethod',
      name: { value: operation.name.text, loc: operation.name.loc },
      successCode: code ? { value: code.value, loc: code.loc } : { value: 200 },
      parameters: [], // TODO
      requestMediaTypes: [{ value: '*/*' }], // TODO
      responseMediaTypes: [{ value: '*/*' }], // TODO
      verb: this.parseVerb(method),
    };
  }

  private parseVerb(node: syntax.NodeStringValueNode): HttpMethod['verb'] {
    const m = (): HttpMethod['verb']['value'] => {
      switch (node.text) {
        case 'GET':
          return 'get';
        case 'POST':
          return 'post';
        case 'PUT':
          return 'put';
        case 'PATCH':
          return 'patch';
        case 'DELETE':
          return 'delete';
        case 'HEAD':
          return 'head';
        case 'OPTIONS':
          return 'options';
        case 'TRACE':
          return 'trace';
        default:
          this.violations.push({
            code: '@basketry-smithy/unsupported-http-verb',
            message: `Unsupported HTTP verb: ${node.text}`,
            range: decodeRange(node.loc),
            severity: 'error',
            sourcePath: this.sourcePath,
          });
          return 'get';
      }
    };

    return { value: m(), loc: node.loc };
  }

  private *emitMethods(
    nodes: Iterable<syntax.OperationShapeNode>,
  ): Iterable<Method> {
    for (const node of nodes) {
      yield this.emitMethod(node);
    }
  }

  private emitMethod(node: syntax.OperationShapeNode): Method {
    const input = node.body.input;
    if (input?.kind === 'InlineAggregateShape') {
      this.violations.push({
        code: '@basketry-smithy/unsupported-feature',
        message: `Inline aggregate shapes not yet supported`,
        range: input.range,
        severity: 'info',
        sourcePath: this.sourcePath,
      });
    }
    const inputShape =
      input?.kind === 'ShapeId' ? this.index.structure(input?.text) : undefined;

    const output = node.body.output;
    if (output?.kind === 'InlineAggregateShape') {
      this.violations.push({
        code: '@basketry-smithy/unsupported-feature',
        message: `Inline aggregate shapes not yet supported`,
        range: output.range,
        severity: 'info',
        sourcePath: this.sourcePath,
      });
    }

    const returnType: ReturnType | undefined =
      output?.kind === 'ShapeId' ? this.parseReturnType(output) : undefined;

    return {
      kind: 'Method',
      name: {
        value: node.name.text,
        loc: node.name.loc,
      },
      deprecated: this.emitDeprecated(this.index.traits(node.name.text)),
      parameters: (inputShape?.members ?? [])
        .map((member) => this.parseShapeMemberToMember(member))
        .map(toParameter),
      returnType,
      security: [],
      loc: node.loc,
    };
  }

  private emitDeprecated(traits: syntax.TraitNode[]): Scalar<true> | undefined {
    const deprecatedTrait = traits.find(
      (trait) => trait.id.text === 'deprecated',
    );
    if (deprecatedTrait) {
      return { value: true, loc: deprecatedTrait.loc };
    }
    return undefined;
  }

  private *emitEnums(): Iterable<Enum> {
    for (const node of this.index.enums) {
      yield this.emitEnum(node);
    }
  }

  private emitEnum(node: syntax.EnumShapeNode): Enum {
    return {
      kind: 'Enum',
      name: {
        value: node.name.text,
        loc: node.name.loc,
      },
      deprecated: this.emitDeprecated(this.index.traits(node.name.text)),
      values: node.members.map((member) => ({
        kind: 'EnumValue',
        content: { value: member.name.text, loc: member.name.loc },
        deprecated: this.emitDeprecated(member.traits),
      })),
    };
  }

  private *emitTypes(): Iterable<Type> {
    for (const node of this.index.structures) {
      yield this.emitStructure(node);
    }
  }

  private emitStructure(node: syntax.AggregateShapeNode): Type {
    const name = node.name;

    return {
      kind: 'Type',
      name: {
        value: name.text,
        loc: name.loc,
      },
      properties: node.members
        .map((member) => this.parseShapeMemberToMember(member))
        .map(toProperty),
      deprecated: this.emitDeprecated(this.index.traits(node.name.text)),
      rules: [],
    };
  }

  private parseShapeMemberToMember(node: syntax.ShapeMemberNode): Member {
    const member = node.member;

    const identifier =
      member.kind === 'ElidedShapeMember' ? member.identifier : member.name;

    const { isArray, shapeId, inheritedTraits } = this.parseMemberType(node);

    const rules = Array.from(
      this.parseTraitsToValidationRules([...inheritedTraits, ...node.traits]),
    );

    if (shapeId?.kind === 'SimpleTypeName') {
      return {
        name: {
          value: identifier.text,
          loc: identifier.loc,
        },
        isPrimitive: true,
        isArray,
        typeName: this.toTypeName(shapeId),
        loc: node.loc,
        rules,
      };
    } else if (
      shapeId?.kind === 'ShapeId' &&
      isSmithyPrimitive(shapeId?.text)
    ) {
      return {
        name: {
          value: identifier.text,
          loc: identifier.loc,
        },
        isPrimitive: true,
        isArray,
        typeName: this.toPrimitive(shapeId.text, shapeId.loc),
        loc: node.loc,
        rules,
      };
    } else {
      return {
        name: {
          value: identifier.text,
          loc: identifier.loc,
        },
        isPrimitive: false,
        isArray,
        typeName: {
          value: shapeId?.text ?? 'unknown',
          loc: shapeId?.loc,
        },
        loc: node.loc,
        rules,
      };
    }
  }

  private toTypeName(node: syntax.SimpleTypeNameNode): Scalar<Primitive> {
    switch (node.value) {
      case 'string':
        return { value: 'string', loc: node.loc };
      case 'boolean':
        return { value: 'boolean', loc: node.loc };
      case 'integer':
        return { value: 'integer', loc: node.loc };
      case 'long':
        return { value: 'long', loc: node.loc };
      case 'float':
      case 'short':
        return { value: 'float', loc: node.loc };
      case 'double':
        return { value: 'double', loc: node.loc };
      case 'blob':
        return { value: 'binary', loc: node.loc };
      case 'byte':
      case 'bigDecimal':
        return { value: 'number', loc: node.loc };
      case 'bigInteger':
        return { value: 'long', loc: node.loc };
      case 'timestamp':
        return { value: 'date-time', loc: node.loc };

      case 'document':
      default:
        this.violations.push({
          message: `Unsupported simple type: ${node.value}`,
          code: '@basketry-smithy/unsupported-simple-type',
          range: node.range,
          severity: 'error',
          sourcePath: this.sourcePath,
        });

        return { value: 'string', loc: node.loc };
    }
  }

  private parseReturnType(shapeId: syntax.ShapeIdNode): ReturnType | undefined {
    const outputTraits = this.index.traits(shapeId.text);

    const structure = this.index.structure(shapeId.text);
    if (structure) {
      const structureTraits = this.index.traits(structure.name.text);
      return {
        kind: 'ReturnType',
        isPrimitive: false,
        isArray: false,
        typeName: {
          value: shapeId.text,
          loc: shapeId.loc,
        },
        rules: Array.from(
          this.parseTraitsToValidationRules([
            ...structureTraits,
            ...outputTraits,
          ]),
        ),
      };
    } else {
      this.violations.push({
        message: `Unknown return type: ${shapeId.text}`,
        code: '@basketry-smithy/unknown-return-type',
        range: shapeId.range,
        severity: 'error',
        sourcePath: this.sourcePath,
      });
    }

    return undefined;
  }

  private parseMemberType(node: syntax.ShapeMemberNode): {
    isArray: boolean;
    inheritedTraits: syntax.TraitNode[];
    shapeId: syntax.ShapeIdNode | syntax.SimpleTypeNameNode | undefined;
  } {
    const member = node.member;

    const shapeId =
      member.kind === 'ExplicitShapeMember' ? member.shapeId : undefined;

    if (!shapeId) {
      this.violations.push({
        message: 'Unexpected elision',
        code: '@basketry-smithy/unexpected-elision',
        range: member.range,
        severity: 'error',
        sourcePath: this.sourcePath,
      });

      return {
        isArray: false,
        inheritedTraits: [],
        shapeId: undefined,
      };
    }

    const list = this.index.list(shapeId?.text);
    const simpleShape = this.index.simpleShape(shapeId?.text);

    if (list) {
      const listMember: syntax.ShapeMemberNode | undefined = list.members[0];

      const memberShapeId =
        listMember.member.kind === 'ExplicitShapeMember'
          ? listMember.member.shapeId
          : undefined;

      if (memberShapeId) {
        return {
          isArray: true,
          inheritedTraits: [
            ...this.index.traits(list.name.text),
            ...listMember.traits,
          ],
          shapeId: memberShapeId,
        };
      } else {
        this.violations.push({
          message: 'Missing list member',
          code: '@basketry-smithy/missing-list-member',
          range: list.range,
          severity: 'error',
          sourcePath: this.sourcePath,
        });

        return {
          isArray: true,
          inheritedTraits: this.index.traits(list.name.text),
          shapeId: undefined,
        };
      }
    } else if (simpleShape) {
      return {
        isArray: false,
        inheritedTraits: this.index.traits(simpleShape.name.text),
        shapeId: simpleShape.typeName,
      };
    } else {
      return {
        isArray: false,
        inheritedTraits: [],
        shapeId: shapeId,
      };
    }
  }

  private toPrimitive(value: SmithyPrimitive, loc: string): Scalar<Primitive> {
    switch (value) {
      case 'Boolean':
        return { value: 'boolean', loc };
      case 'String':
        return { value: 'string', loc };
      case 'Integer':
        return { value: 'number', loc };
      case 'Long':
        return { value: 'long', loc };
      case 'Float':
        return { value: 'float', loc };
      case 'Short':
        return { value: 'float', loc };
      case 'Double':
        return { value: 'double', loc };
      case 'Byte':
        return { value: 'integer', loc };
      case 'BigInteger':
        return { value: 'long', loc };
      case 'BigDecimal':
        return { value: 'double', loc };
      case 'Timestamp':
        return { value: 'date-time', loc };
      case 'Blob':
        return { value: 'binary', loc };
      default:
        this.violations.push({
          code: '@basketry-smithy/unknown-primitive',
          message: `Unknown primitive: ${value}`,
          range: decodeRange(loc),
          severity: 'error',
          sourcePath: this.sourcePath,
        });
        return { value, loc };
    }
  }

  private *parseTraitsToValidationRules(
    traits: Iterable<syntax.TraitNode>,
  ): Iterable<ValidationRule> {
    for (const trait of traits) {
      yield* this.parseTraitToValidationRule(trait);
    }
  }

  private *parseTraitToValidationRule(
    node: syntax.TraitNode,
  ): Iterable<ValidationRule> {
    switch (node.id.text) {
      case 'required':
        yield {
          kind: 'ValidationRule',
          id: 'required',
        };
        break;
      case 'length': {
        if (Array.isArray(node.body)) {
          const min = node.body.find((x) => x.key.text === 'min');

          if (min) {
            yield {
              kind: 'ValidationRule',
              id: 'string-min-length',
              length: { value: parseInt(min.value.text, 10), loc: min.loc },
            };
          }

          const max = node.body.find((x) => x.key.text === 'max');
          if (max) {
            yield {
              kind: 'ValidationRule',
              id: 'string-max-length',
              length: { value: parseInt(max.value.text, 10), loc: max.loc },
            };
          }
        }
        break;
      }
      case 'pattern': {
        if (
          !Array.isArray(node.body) &&
          node.body?.kind === 'NodeStringValue'
        ) {
          if (node.body.text) {
            const pattern = node.body.text.slice(1, -1);
            yield {
              kind: 'ValidationRule',
              id: 'string-pattern',
              pattern: { value: pattern, loc: node.body.loc },
            };
          }
        }
        break;
      }
      case 'range': {
        if (Array.isArray(node.body)) {
          const min = node.body.find((x) => x.key.text === 'min');

          if (min) {
            yield {
              kind: 'ValidationRule',
              id: 'number-gte',
              value: { value: parseInt(min.value.text, 10), loc: min.loc },
            };
          }

          const max = node.body.find((x) => x.key.text === 'max');
          if (max) {
            yield {
              kind: 'ValidationRule',
              id: 'number-lte',
              value: { value: parseInt(max.value.text, 10), loc: max.loc },
            };
          }
        }
        break;
      }
      case 'uniqueItems': {
        yield {
          kind: 'ValidationRule',
          id: 'array-unique-items',
          required: true,
          loc: node.loc,
        };
        break;
      }
      default:
        this.violations.push({
          code: '@basketry-smithy/unknown-trait',
          message: `Unknown trait: ${node.id.text}`,
          range: decodeRange(node.loc),
          severity: 'info',
          sourcePath: this.sourcePath,
        });
    }
  }
}

class SmithyIndex {
  constructor(root: syntax.IdlNode) {
    this.indexShapeSection(root.shapeSection);
  }

  private indexShapeSection(node: syntax.ShapeSectionNode) {
    for (const shape of node.shapes) {
      switch (shape.kind) {
        case 'ShapeStatement':
          this.indexShapeStatement(shape);
          break;
        case 'ApplyStatementBlock':
          break;
        case 'ApplyStatementSingular':
          break;
      }
    }
  }

  private indexShapeStatement(node: syntax.ShapeStatementNode) {
    this.traitsIndex.set(node.shape.name.text, node.traits);
    switch (node.shape.kind) {
      case 'AggregateShape':
        this.indexAggregateShape(node.shape);
        break;
      case 'SimpleShape':
        this.simpleShapesIndex.set(node.shape.name.text, node.shape);
        break;
      case 'EnumShape':
        this.enumsIndex.set(node.shape.name.text, node.shape);
        break;
      case 'EntityShape':
        this.indexEntityShape(node.shape);
        break;
      case 'OperationShape':
        this.operationsIndex.set(node.shape.name.text, node.shape);
        break;
    }
  }

  private indexAggregateShape(node: syntax.AggregateShapeNode) {
    switch (node.typeName.value) {
      case 'structure':
        this.structuresIndex.set(node.name.text, node);
        break;
      case 'list':
        this.listsIndex.set(node.name.text, node);
        break;
      case 'union':
        this.unionsIndex.set(node.name.text, node);
        break;
      case 'map':
        this.mapsIndex.set(node.name.text, node);
        break;
    }
  }

  private indexEntityShape(node: syntax.EntityShapeNode) {
    switch (node.typeName.value) {
      case 'service':
        this.servicesIndex.set(node.name.text, node);
        break;
      case 'resource':
        this.resourcesIndex.set(node.name.text, node);
        break;
    }
  }

  private readonly traitsIndex = new Map<string, syntax.TraitNode[]>();
  traits(name: string): syntax.TraitNode[] {
    return this.traitsIndex.get(name) ?? [];
  }

  private readonly operationsIndex = new Map<
    string,
    syntax.OperationShapeNode
  >();
  operation(name: string) {
    return this.operationsIndex.get(name);
  }
  get operations(): Iterable<syntax.OperationShapeNode> {
    return this.operationsIndex.values();
  }

  private readonly servicesIndex = new Map<string, syntax.EntityShapeNode>();
  service(name: string) {
    return this.servicesIndex.get(name);
  }
  get services(): Iterable<syntax.EntityShapeNode> {
    return this.servicesIndex.values();
  }

  private readonly resourcesIndex = new Map<string, syntax.EntityShapeNode>();
  resource(name: string) {
    return this.resourcesIndex.get(name);
  }
  get resources(): Iterable<syntax.EntityShapeNode> {
    return this.resourcesIndex.values();
  }

  private readonly simpleShapesIndex = new Map<
    string,
    syntax.SimpleShapeNode
  >();
  simpleShape(name: string) {
    return this.simpleShapesIndex.get(name);
  }
  get simpleShapes(): Iterable<syntax.SimpleShapeNode> {
    return this.simpleShapesIndex.values();
  }

  private readonly structuresIndex = new Map<
    string,
    syntax.AggregateShapeNode
  >();
  structure(name: string) {
    return this.structuresIndex.get(name);
  }
  get structures(): Iterable<syntax.AggregateShapeNode> {
    return this.structuresIndex.values();
  }

  private readonly listsIndex = new Map<string, syntax.AggregateShapeNode>();
  list(name: string) {
    return this.listsIndex.get(name);
  }
  get lists(): Iterable<syntax.AggregateShapeNode> {
    return this.listsIndex.values();
  }

  private readonly unionsIndex = new Map<string, syntax.AggregateShapeNode>();
  union(name: string) {
    return this.unionsIndex.get(name);
  }
  get unions(): Iterable<syntax.AggregateShapeNode> {
    return this.unionsIndex.values();
  }

  private readonly mapsIndex = new Map<string, syntax.AggregateShapeNode>();
  map(name: string) {
    return this.mapsIndex.get(name);
  }
  get maps(): Iterable<syntax.AggregateShapeNode> {
    return this.mapsIndex.values();
  }

  private readonly enumsIndex = new Map<string, syntax.EnumShapeNode>();
  enum(name: string) {
    return this.enumsIndex.get(name);
  }
  get enums(): Iterable<syntax.EnumShapeNode> {
    return this.enumsIndex.values();
  }
}
