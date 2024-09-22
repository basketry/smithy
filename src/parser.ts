import { Parser, Service, Violation } from 'basketry';

export const smithyParser: Parser = (schema, sourcePath) =>
  new SmithyParser(schema, sourcePath).parse();

class SmithyParser {
  constructor(schema: string, private readonly sourcePath: string) {}

  public readonly violations: Violation[] = [];

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
        interfaces: [],
        types: [],
        enums: [],
        unions: [],
      },
      violations: this.violations,
    };
  }
}
