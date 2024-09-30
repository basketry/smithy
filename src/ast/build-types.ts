import { format, TypeFactory } from './type-factory';
import * as Grammar from './smithy';

const builder = new TypeFactory(new Grammar().rules);

const raw = Array.from(builder.build({ sort: true })).join('\n');

const formatted = format(raw);

console.log(formatted.trim());
