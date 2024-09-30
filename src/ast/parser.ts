import { trivia } from './common';
import { IdlNode } from './types';

const apgJs = require('apg-js');
const apgLib = apgJs.apgLib;

const parser = new apgLib.parser();
parser.ast = new apgLib.ast();

const ids = apgLib.ids;

const grammar = require('./smithy.js');

// const input2 = `namespace example.tasks.kdsafhjlafsdklhj

// // Define a basic Task shape
// structure Task {
//     @required
//     id: String
//     title: String
//     description: String
//     completed: Boolean
// }

// // Request and Response shapes for the operations
// structure CreateTaskInput {
//     @required
//     title: String
//     description: String
// }

// structure CreateTaskOutput {
//     @required
//     task: Task
// }

// structure ListTasksOutput {
//     @required
//     tasks: TaskList
// }

// structure DeleteTaskInput {
//     @required
//     id: String
// }

// // A list of tasks
// list TaskList {
//     member: Task
// }

// // Define the Task service and its operations
// @restJson1
// service TaskService {
//     version: "2024-09-22"
//     operations: [CreateTask, ListTasks, DeleteTask]
// }

// // Operations for creating, listing, and deleting tasks
// @http(method: "POST", uri: "/tasks", code: 201)
// operation CreateTask {
//     input: CreateTaskInput
//     output: CreateTaskOutput
// }

// @http(method: "GET", uri: "/tasks", code: 200)
// operation ListTasks {
//     output: ListTasksOutput
// }

// @http(method: "DELETE", uri: "/tasks/{id}", code: 204)
// operation DeleteTask {
//     input: DeleteTaskInput
// }`;

// console.log(JSON.stringify(parse(input2, { text: true }), null, 2));

export function parse(doc: string, options?: { text?: boolean }): IdlNode {
  const gg = new grammar();

  const stack: any[] = [];
  const roots: any[] = [];

  for (const rule of gg.rules) {
    parser.ast.callbacks[rule.name] = trivia.has(rule.name)
      ? false
      : (id, chars, offset, length) => {
          const node = { kind: rule.name, offset, length };

          if (options?.text) {
            node['text'] = doc.substring(offset, offset + length);
          }

          node['children'] = [];

          if (id === ids.SEM_PRE) {
            const parent = stack[stack.length - 1];
            if (parent) {
              if (!parent.children) {
                parent.children = [];
              }
              parent.children.push(node);
            } else {
              roots.push(node);
            }
            stack.push(node);
          } else if (id === ids.SEM_POST) {
            stack.pop();
          }
        };
  }

  parser.parse(gg, 0, doc);

  parser.ast.translate();

  return roots[0];
}
