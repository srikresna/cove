import { LifeCycleWatcher } from '../extension/index.js';
import type { Chain, Command, InitCommandCtx } from './types.js';
/**
 * Command manager to manage all commands
 *
 * Commands are functions that take a context and a next function as arguments
 *
 * ```ts
 * const myCommand: Command<input, output> = (ctx, next) => {
 *  const count = ctx.count || 0;
 *
 *  const success = someOperation();
 *  if (success) {
 *    return next({ count: count + 1 });
 *  }
 *  // if the command is not successful, you can return without calling next
 *  return;
 * ```
 *
 * Command input and output data can be defined in the `Command` type
 *
 * ```ts
 * // input: ctx.firstName, ctx.lastName
 * // output: ctx.fullName
 * const myCommand: Command<{ firstName: string; lastName: string }, { fullName: string }> = (ctx, next) => {
 *   const { firstName, lastName } = ctx;
 *   const fullName = `${firstName} ${lastName}`;
 *   return next({ fullName });
 * }
 *
 * ```
 *
 *
 * ---
 *
 * Commands can be run in two ways:
 *
 * 1. Using `exec` method
 * `exec` is used to run a single command
 * ```ts
 * const [result, data] = commandManager.exec(myCommand, payload);
 * ```
 *
 * 2. Using `chain` method
 * `chain` is used to run a series of commands
 * ```ts
 * const chain = commandManager.chain();
 * const [result, data] = chain
 *   .pipe(myCommand1)
 *   .pipe(myCommand2, payload)
 *   .run();
 * ```
 *
 * ---
 *
 * Command chains will stop running if a command is not successful
 *
 * ```ts
 * const chain = commandManager.chain();
 * const [result, data] = chain
 *   .chain(myCommand1) <-- if this fail
 *   .chain(myCommand2, payload) <- this won't run
 *   .run();
 *
 * result <- result will be `false`
 * ```
 *
 * You can use `try` to run a series of commands and if one of them is successful, it will continue to the next command
 * ```ts
 * const chain = commandManager.chain();
 * const [result, data] = chain
 *   .try(chain => [
 *     chain.pipe(myCommand1), <- if this fail
 *     chain.pipe(myCommand2, payload), <- this will run, if this success
 *     chain.pipe(myCommand3), <- this won't run
 *   ])
 *   .run();
 * ```
 *
 * The `tryAll` method is similar to `try`, but it will run all commands even if one of them is successful
 * ```ts
 * const chain = commandManager.chain();
 * const [result, data] = chain
 *   .try(chain => [
 *     chain.pipe(myCommand1), <- if this success
 *     chain.pipe(myCommand2), <- this will also run
 *     chain.pipe(myCommand3), <- so will this
 *   ])
 *   .run();
 * ```
 *
 */
export declare class CommandManager extends LifeCycleWatcher {
    static readonly key = "commandManager";
    private readonly _createChain;
    private readonly _getCommandCtx;
    /**
     * Create a chain to run a series of commands
     * ```ts
     * const chain = commandManager.chain();
     * const [result, data] = chain
     *   .myCommand1()
     *   .myCommand2(payload)
     *   .run();
     * ```
     * @returns [success, data] - success is a boolean to indicate if the chain is successful,
     *   data is the final context after running the chain
     */
    chain: () => Chain<InitCommandCtx>;
    exec: <Output extends object, Input extends object>(command: Command<Input, Output>, input?: Input) => [false, Partial<InitCommandCtx & Input & Output> & InitCommandCtx] | [true, InitCommandCtx & Input & Output];
}
//# sourceMappingURL=manager.d.ts.map