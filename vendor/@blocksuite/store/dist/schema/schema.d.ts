import { type BlockSchemaType } from "../model/block/zod.js";
/**
 * Represents a schema manager for block flavours and their relationships.
 * Provides methods to register, validate, and query block schemas.
 */
export declare class Schema {
  /**
   * A map storing block flavour names to their corresponding schema definitions.
   */
  readonly flavourSchemaMap: Map<
    string,
    {
      version: number;
      model: {
        flavour: string;
        role: string;
        children?: string[] | undefined;
        props?:
          | ((
              args_0: import("../index.js").InternalPrimitives,
              ...args: unknown[]
            ) => Record<string, any>)
          | undefined;
        parent?: string[] | undefined;
        isFlatData?: boolean | undefined;
        toModel?: ((...args: unknown[]) => import("../index.js").BlockModel<object>) | undefined;
      };
      transformer?:
        | ((
            args_0: Map<string, unknown>,
            ...args: unknown[]
          ) => import("../index.js").BaseBlockTransformer<object>)
        | undefined;
    }
  >;
  /**
   * Safely validates the schema relationship for a given flavour, parent, and children.
   * Returns true if valid, false otherwise (does not throw).
   *
   * @param flavour - The block flavour to validate.
   * @param parentFlavour - The parent block flavour (optional).
   * @param childFlavours - The child block flavours (optional).
   * @returns True if the schema relationship is valid, false otherwise.
   */
  safeValidate: (flavour: string, parentFlavour?: string, childFlavours?: string[]) => boolean;
  /**
   * Retrieves the schema for a given block flavour.
   *
   * @param flavour - The block flavour name.
   * @returns The corresponding BlockSchemaType or undefined if not found.
   */
  get(flavour: string):
    | {
        version: number;
        model: {
          flavour: string;
          role: string;
          children?: string[] | undefined;
          props?:
            | ((
                args_0: import("../index.js").InternalPrimitives,
                ...args: unknown[]
              ) => Record<string, any>)
            | undefined;
          parent?: string[] | undefined;
          isFlatData?: boolean | undefined;
          toModel?: ((...args: unknown[]) => import("../index.js").BlockModel<object>) | undefined;
        };
        transformer?:
          | ((
              args_0: Map<string, unknown>,
              ...args: unknown[]
            ) => import("../index.js").BaseBlockTransformer<object>)
          | undefined;
      }
    | undefined;
  /**
   * Validates the schema relationship for a given flavour, parent, and children.
   * Throws SchemaValidateError if invalid.
   *
   * @param flavour - The block flavour to validate.
   * @param parentFlavour - The parent block flavour (optional).
   * @param childFlavours - The child block flavours (optional).
   * @throws {SchemaValidateError} If the schema relationship is invalid.
   */
  validate: (flavour: string, parentFlavour?: string, childFlavours?: string[]) => void;
  /**
   * Returns an object mapping each registered flavour to its version number.
   */
  get versions(): {
    [k: string]: number;
  };
  /**
   * Checks if two flavours match, using minimatch for wildcard support.
   *
   * @param childFlavour - The child block flavour.
   * @param parentFlavour - The parent block flavour.
   * @returns True if the flavours match, false otherwise.
   */
  private _matchFlavour;
  /**
   * Checks if two values match as either flavours or roles, supporting role syntax (e.g., '@role').
   *
   * @param childValue - The child value (flavour or role).
   * @param parentValue - The parent value (flavour or role).
   * @param childRole - The actual role of the child.
   * @param parentRole - The actual role of the parent.
   * @returns True if the values match as flavours or roles, false otherwise.
   */
  private _matchFlavourOrRole;
  /**
   * Validates if the parent schema is a valid parent for the child schema.
   *
   * @param child - The child block schema.
   * @param parent - The parent block schema.
   * @returns True if the parent is valid for the child, false otherwise.
   */
  private _validateParent;
  /**
   * Validates the role relationship between child and parent schemas.
   * Throws if the child is a root block but has a parent.
   *
   * @param child - The child block schema.
   * @param parent - The parent block schema.
   * @throws {SchemaValidateError} If the child is a root block with a parent.
   */
  private _validateRole;
  /**
   * Checks if the child flavour is valid under the parent flavour.
   *
   * @param child - The child block flavour name.
   * @param parent - The parent block flavour name.
   * @returns True if the relationship is valid, false otherwise.
   */
  isValid(child: string, parent: string): boolean;
  /**
   * Registers an array of block schemas into the schema manager.
   *
   * @param blockSchema - An array of block schema definitions to register.
   * @returns The Schema instance (for chaining).
   */
  register(blockSchema: BlockSchemaType[]): this;
  /**
   * Serializes the schema map to a plain object for JSON output.
   *
   * @returns An object mapping each flavour to its role, parent, and children.
   */
  toJSON(): {
    [k: string]: Record<string, unknown>;
  };
  /**
   * Validates the relationship between a child and parent schema.
   * Throws if the relationship is invalid.
   *
   * @param child - The child block schema.
   * @param parent - The parent block schema.
   * @throws {SchemaValidateError} If the relationship is invalid.
   */
  validateSchema(child: BlockSchemaType, parent: BlockSchemaType): void;
}
//# sourceMappingURL=schema.d.ts.map
