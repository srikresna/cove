export type RemovedUserInfo = {
    id: string;
    removed: true;
};
export type ExistedUserInfo = {
    id: string;
    name?: string | null;
    avatar?: string | null;
    removed?: false;
};
export type AffineUserInfo = RemovedUserInfo | ExistedUserInfo;
export declare function isRemovedUserInfo(userInfo: AffineUserInfo): userInfo is RemovedUserInfo;
export declare function isExistedUserInfo(userInfo: AffineUserInfo): userInfo is ExistedUserInfo;
//# sourceMappingURL=types.d.ts.map