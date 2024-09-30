namespace example.tasks

// Define a basic Task shape
structure Task {
    @required
    id: String
    title: String
    description: String
    completed: Boolean
}

// Request and Response shapes for the operations
structure CreateTaskInput {
    @required
    title: String
    description: String
}

structure CreateTaskOutput {
    @required
    task: Task
}

structure ListTasksOutput {
    @required
    tasks: TaskList
}

structure DeleteTaskInput {
    @required
    id: String
}

// A list of tasks
list TaskList {
    member: Task
}

// Define the Task service and its operations
@restJson1
service TaskService {
    version: "2024-09-22"
    operations: [CreateTask, ListTasks, DeleteTask]
}

// Operations for creating, listing, and deleting tasks
@http(method: "POST", uri: "/tasks", code: 201)
operation CreateTask {
    input: CreateTaskInput
    output: CreateTaskOutput
}

@http(method: "GET", uri: "/tasks", code: 200)
operation ListTasks {
    output: ListTasksOutput
}

@http(method: "DELETE", uri: "/tasks/{id}", code: 204)
operation DeleteTask {
    input: DeleteTaskInput
}
