type ErrorCategory =
  | "not_found"
  | "validation"
  | "persistence"
  | "encryption"
  | "concurrency"
  | "business_rule"
  | "unknown";

interface AppErrorOptions {
  cause?: unknown;
  userFacing?: boolean;
  context?: Record<string, unknown>;
}

export abstract class AppError extends Error {
  abstract readonly category: ErrorCategory;
  readonly userFacing: boolean;
  readonly context?: Record<string, unknown>;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = this.constructor.name;
    this.userFacing = options.userFacing ?? true;
    this.context = options.context;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      category: this.category,
      message: this.message,
      context: this.context,
    };
  }
}

export class NotFoundError extends AppError {
  readonly category = "not_found" as const;
  constructor(
    public readonly entity: string,
    public readonly id: string,
    options?: AppErrorOptions,
  ) {
    super(`${entity} not found: ${id}`, options);
  }
}

export class ValidationError extends AppError {
  readonly category = "validation" as const;
}

export class BusinessRuleError extends AppError {
  readonly category = "business_rule" as const;
}

export class PersistenceError extends AppError {
  readonly category = "persistence" as const;
  constructor(
    public readonly operation: string,
    message: string,
    options?: AppErrorOptions,
  ) {
    super(message, options);
  }
}

type EncryptionErrorReason =
  | "key_unavailable"
  | "decrypt_failed"
  | "encrypt_failed"
  | "malformed_payload"
  | "iv_exhausted"
  | "iv_rewind";

export class EncryptionError extends AppError {
  readonly category = "encryption" as const;
  constructor(
    public readonly reason: EncryptionErrorReason,
    message: string,
    options?: AppErrorOptions,
  ) {
    super(message, options);
  }
}

export class ConcurrencyError extends AppError {
  readonly category = "concurrency" as const;
}

export class VaultLockedError extends AppError {
  readonly category = "encryption" as const;
  constructor(message = "Vault is locked; unlock to access notes.", options?: AppErrorOptions) {
    super(message, options);
  }
}
