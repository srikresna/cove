/**
 * Re-export the domain error hierarchy for backward compatibility with the many
 * call sites that import from "../errors/AppError". The canonical definitions
 * live in src/domain/errors.ts.
 */
export * from "../domain/errors";
