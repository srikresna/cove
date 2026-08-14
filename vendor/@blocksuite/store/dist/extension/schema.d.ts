import type { BlockSchemaType } from "../model/block/zod";
import type { ExtensionType } from "./extension";
export declare const BlockSchemaIdentifier: import("@blocksuite/global/di").ServiceIdentifier<{
  version: number;
  model: {
    flavour: string;
    role: string;
    children?: string[] | undefined;
    props?:
      | ((args_0: import("..").InternalPrimitives, ...args: unknown[]) => Record<string, any>)
      | undefined;
    parent?: string[] | undefined;
    isFlatData?: boolean | undefined;
    toModel?: ((...args: unknown[]) => import("..").BlockModel<object>) | undefined;
  };
  transformer?:
    | ((
        args_0: Map<string, unknown>,
        ...args: unknown[]
      ) => import("..").BaseBlockTransformer<object>)
    | undefined;
}> &
  (<
    U extends {
      version: number;
      model: {
        flavour: string;
        role: string;
        children?: string[] | undefined;
        props?:
          | ((args_0: import("..").InternalPrimitives, ...args: unknown[]) => Record<string, any>)
          | undefined;
        parent?: string[] | undefined;
        isFlatData?: boolean | undefined;
        toModel?: ((...args: unknown[]) => import("..").BlockModel<object>) | undefined;
      };
      transformer?:
        | ((
            args_0: Map<string, unknown>,
            ...args: unknown[]
          ) => import("..").BaseBlockTransformer<object>)
        | undefined;
    } = {
      version: number;
      model: {
        flavour: string;
        role: string;
        children?: string[] | undefined;
        props?:
          | ((args_0: import("..").InternalPrimitives, ...args: unknown[]) => Record<string, any>)
          | undefined;
        parent?: string[] | undefined;
        isFlatData?: boolean | undefined;
        toModel?: ((...args: unknown[]) => import("..").BlockModel<object>) | undefined;
      };
      transformer?:
        | ((
            args_0: Map<string, unknown>,
            ...args: unknown[]
          ) => import("..").BaseBlockTransformer<object>)
        | undefined;
    },
  >(
    variant: import("@blocksuite/global/di").ServiceVariant,
  ) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function BlockSchemaExtension(blockSchema: BlockSchemaType): ExtensionType;
//# sourceMappingURL=schema.d.ts.map
