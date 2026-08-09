import { type LinkedListNode } from './linked-list';
type Task = () => false | void;
export declare class TaskNode {
    private readonly manager;
    private _priority?;
    private _linkedListNode?;
    constructor(manager: BatchTaskManager);
    get priority(): number | undefined;
    cancel(): void;
    updateTask(priority: number, task: Task, toFront?: boolean): void;
}
export declare class BatchTaskManager {
    private readonly batchSizes;
    private readonly totalBatchSize;
    private readonly queues;
    constructor(batchSizes: number[], totalBatchSize: number);
    private isRunning;
    newTask(): TaskNode;
    addTask(priority: number, task: Task, toFront?: boolean): LinkedListNode<Task>;
    private run;
    clean(): void;
}
export {};
//# sourceMappingURL=batch-task-manager.d.ts.map