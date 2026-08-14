import { BlockSuiteError, ErrorCode } from "@blocksuite/global/exceptions";
export class SchemaValidateError extends BlockSuiteError {
  constructor(flavour, message) {
    super(ErrorCode.SchemaValidateError, `Invalid schema for ${flavour}: ${message}`);
  }
}
