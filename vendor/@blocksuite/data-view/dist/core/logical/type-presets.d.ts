import type { UserListService, UserService } from '@blocksuite/affine-shared/services';
import * as zod from 'zod';
import Zod from 'zod';
import type { TypeConvertConfig, TypeInstance } from './type.js';
export type SelectTag = Zod.TypeOf<typeof SelectTagSchema>;
export declare const SelectTagSchema: zod.ZodObject<{
    id: zod.ZodString;
    color: zod.ZodString;
    value: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    id: string;
    value: string;
    color: string;
}, {
    id: string;
    value: string;
    color: string;
}>;
export declare const UserInfoSchema: zod.ZodObject<{
    userService: zod.ZodType<UserService, zod.ZodTypeDef, UserService>;
    userListService: zod.ZodType<UserListService, zod.ZodTypeDef, UserListService>;
}, "strip", zod.ZodTypeAny, {
    userService: UserService;
    userListService: UserListService;
}, {
    userService: UserService;
    userListService: UserListService;
}>;
export type UserInfo = Zod.TypeOf<typeof UserInfoSchema>;
export declare const unknown: import("./data-type.js").DataType<"Unknown", zod.ZodNever, zod.ZodUnknown>;
export declare const dt: {
    number: import("./data-type.js").DataType<"Number", zod.ZodNumber, zod.ZodNumber>;
    string: import("./data-type.js").DataType<"String", zod.ZodString, zod.ZodString>;
    boolean: import("./data-type.js").DataType<"Boolean", zod.ZodBoolean, zod.ZodBoolean>;
    richText: import("./data-type.js").DataType<"RichText", zod.ZodString, zod.ZodString>;
    date: import("./data-type.js").DataType<"Date", zod.ZodNumber, zod.ZodNumber>;
    url: import("./data-type.js").DataType<"URL", zod.ZodString, zod.ZodString>;
    image: import("./data-type.js").DataType<"Image", zod.ZodString, zod.ZodString>;
    tag: import("./data-type.js").DataType<"Tag", zod.ZodArray<zod.ZodObject<{
        id: zod.ZodString;
        color: zod.ZodString;
        value: zod.ZodString;
    }, "strip", zod.ZodTypeAny, {
        id: string;
        value: string;
        color: string;
    }, {
        id: string;
        value: string;
        color: string;
    }>, "many">, zod.ZodString>;
    user: import("./data-type.js").DataType<"User", zod.ZodObject<{
        userService: zod.ZodType<UserService, zod.ZodTypeDef, UserService>;
        userListService: zod.ZodType<UserListService, zod.ZodTypeDef, UserListService>;
    }, "strip", zod.ZodTypeAny, {
        userService: UserService;
        userListService: UserListService;
    }, {
        userService: UserService;
        userListService: UserListService;
    }>, zod.ZodString>;
};
export declare const t: {
    fn: {
        is: (type: import("./type.js").AnyTypeInstance) => type is import("./composite-type.js").FnTypeInstance;
        instance: <Args extends readonly TypeInstance[], Return extends TypeInstance>(args: Args, rt: Return, vars?: import("./type-variable.js").TypeVarDefinitionInstance[]) => import("./composite-type.js").FnTypeInstance<Args, Return>;
    };
    array: {
        is: (type: import("./type.js").AnyTypeInstance) => type is import("./composite-type.js").ArrayTypeInstance;
        instance: <Element extends TypeInstance>(element: Element) => import("./composite-type.js").ArrayTypeInstance<Element>;
    };
    typeVarDefine: {
        create: <Name extends string = string, Type extends TypeInstance = TypeInstance>(name: Name, typeConstraint?: Type) => import("./type-variable.js").TypeVarDefinitionInstance<Name, Type>;
    };
    typeVarReference: {
        create: <Name extends string>(name: Name) => import("./type-variable.js").TypeVarReferenceInstance<Name>;
        is: (type: TypeInstance) => type is import("./type-variable.js").TypeVarReferenceInstance;
    };
    number: import("./data-type.js").DataType<"Number", zod.ZodNumber, zod.ZodNumber>;
    string: import("./data-type.js").DataType<"String", zod.ZodString, zod.ZodString>;
    boolean: import("./data-type.js").DataType<"Boolean", zod.ZodBoolean, zod.ZodBoolean>;
    richText: import("./data-type.js").DataType<"RichText", zod.ZodString, zod.ZodString>;
    date: import("./data-type.js").DataType<"Date", zod.ZodNumber, zod.ZodNumber>;
    url: import("./data-type.js").DataType<"URL", zod.ZodString, zod.ZodString>;
    image: import("./data-type.js").DataType<"Image", zod.ZodString, zod.ZodString>;
    tag: import("./data-type.js").DataType<"Tag", zod.ZodArray<zod.ZodObject<{
        id: zod.ZodString;
        color: zod.ZodString;
        value: zod.ZodString;
    }, "strip", zod.ZodTypeAny, {
        id: string;
        value: string;
        color: string;
    }, {
        id: string;
        value: string;
        color: string;
    }>, "many">, zod.ZodString>;
    user: import("./data-type.js").DataType<"User", zod.ZodObject<{
        userService: zod.ZodType<UserService, zod.ZodTypeDef, UserService>;
        userListService: zod.ZodType<UserListService, zod.ZodTypeDef, UserListService>;
    }, "strip", zod.ZodTypeAny, {
        userService: UserService;
        userListService: UserListService;
    }, {
        userService: UserService;
        userListService: UserListService;
    }>, zod.ZodString>;
    unknown: import("./data-type.js").DataType<"Unknown", zod.ZodNever, zod.ZodUnknown>;
};
export declare const converts: TypeConvertConfig[];
//# sourceMappingURL=type-presets.d.ts.map