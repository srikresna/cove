import { BlockSuiteError, ErrorCode } from "@blocksuite/global/exceptions";
export class BaseSelection {
  static {
    this.recoverable = false;
  }
  get group() {
    return this.constructor.group;
  }
  get type() {
    return this.constructor.type;
  }
  constructor({ blockId }) {
    this.blockId = blockId;
  }
  static fromJSON(_) {
    throw new BlockSuiteError(ErrorCode.SelectionError, "You must override this method");
  }
  is(type) {
    return this.type === type.type;
  }
}
