import { type Signal } from "@preact/signals-core";
import * as Y from "yjs";
import type { BaseTextAttributes } from "./attributes";
import type { DeltaInsert, DeltaOperation, OnTextChange } from "./types";
/**
 * Text is an abstraction of Y.Text.
 * It provides useful methods to manipulate the text content.
 *
 * @example
 * ```ts
 * const text = new Text('Hello, world!');
 * text.insert(' blocksuite', 7);
 * text.delete(7, 1);
 * text.format(7, 1, { bold: true });
 * text.join(new Text(' blocksuite'));
 * text.split(7, 1);
 * ```
 *
 * Text {@link https://docs.yjs.dev/api/delta-format delta} is a format from Y.js.
 *
 * @category Reactive
 */
export declare class Text<TextAttributes extends BaseTextAttributes = BaseTextAttributes> {
  private readonly _deltas$;
  private readonly _length$;
  private _onChange?;
  private readonly _yText;
  /**
   * Get the text delta as a signal.
   */
  get deltas$(): Signal<DeltaOperation[]>;
  get length(): number;
  get yText(): Y.Text;
  /**
   * @param input - The input can be a string, a Y.Text instance, or an array of DeltaInsert.
   */
  constructor(input?: Y.Text | string | DeltaInsert<TextAttributes>[]);
  private _transact;
  /**
   * Apply a delta to the text.
   *
   * @param delta - The delta to apply.
   *
   * @example
   * ```ts
   * const text = new Text('Hello, world!');
   * text.applyDelta([{insert: ' blocksuite', attributes: { bold: true }}]);
   * ```
   */
  applyDelta(delta: DeltaOperation[]): void;
  /**
   * @internal
   */
  bind(onChange?: OnTextChange): void;
  /**
   * Clear the text content.
   */
  clear(): void;
  /**
   * Clone the text to a new Text instance.
   *
   * @returns A new Text instance.
   */
  clone(): Text<{
    bold?: true | null | undefined;
    link?: string | null | undefined;
    strike?: true | null | undefined;
    italic?: true | null | undefined;
    underline?: true | null | undefined;
    code?: true | null | undefined;
  }>;
  /**
   * Delete the text content.
   *
   * @param index - The index to delete.
   * @param length - The length to delete.
   */
  delete(index: number, length: number): void;
  /**
   * Format the text content.
   *
   * @param index - The index to format.
   * @param length - The length to format.
   * @param format - The format to apply.
   *
   * @example
   * ```ts
   * const text = new Text('Hello, world!');
   * text.format(7, 1, { bold: true });
   * ```
   */
  format(index: number, length: number, format: Record<string, unknown>): void;
  /**
   * Insert content at the specified index.
   *
   * @param content - The content to insert.
   * @param index - The index to insert.
   *
   * @example
   * ```ts
   * const text = new Text('Hello, world!');
   * text.insert(' blocksuite', 7);
   * ```
   */
  insert(content: string, index: number, attributes?: Record<string, unknown>): void;
  /**
   * Join current text with another text.
   *
   * @param other - The other text to join.
   *
   * @example
   * ```ts
   * const text = new Text('Hello, world!');
   * const other = new Text(' blocksuite');
   * text.join(other);
   * ```
   */
  join(other: Text): void;
  /**
   * Replace the text content with a new content.
   *
   * @param index - The index to replace.
   * @param length - The length to replace.
   * @param content - The content to replace.
   * @param attributes - The attributes to replace.
   *
   * @example
   * ```ts
   * const text = new Text('Hello, world!');
   * text.replace(7, 1, ' blocksuite');
   * ```
   */
  replace(
    index: number,
    length: number,
    content: string,
    attributes?: Record<string, unknown>,
  ): void;
  /**
   * Slice the text to a delta.
   *
   * @param begin - The begin index.
   * @param end - The end index.
   *
   * @returns The delta of the sliced text.
   */
  sliceToDelta(begin: number, end?: number): DeltaOperation[];
  /**
   * Split the text into another Text.
   *
   * @param index - The index to split.
   * @param length - The length to split.
   *
   * @returns The right part of the text.
   *
   * @example
   * ```ts
   * const text = new Text('Hello, world!');
   * text.split(7, 1);
   * ```
   *
   * NOTE: The string included in [index, index + length) will be deleted.
   *
   * Here are three cases for point position(index + length):
   *
   * ```
   * [{insert: 'abc', ...}, {insert: 'def', ...}, {insert: 'ghi', ...}]
   * 1. abc|de|fghi
   *    left: [{insert: 'abc', ...}]
   *    right: [{insert: 'f', ...}, {insert: 'ghi', ...}]
   * 2. abc|def|ghi
   *    left: [{insert: 'abc', ...}]
   *    right: [{insert: 'ghi', ...}]
   * 3. abc|defg|hi
   *    left: [{insert: 'abc', ...}]
   *    right: [{insert: 'hi', ...}]
   * ```
   */
  split(index: number, length?: number): Text;
  /**
   * Get the text delta.
   *
   * @returns The delta of the text.
   */
  toDelta(): DeltaOperation[];
  /**
   * Get the text content as a string.
   * In most cases, you should not use this method. It will lose the delta attributes information.
   *
   * @returns The text content.
   */
  toString(): string;
}
//# sourceMappingURL=text.d.ts.map
