export function isRemovedUserInfo(userInfo) {
    return Boolean('removed' in userInfo && userInfo.removed);
}
export function isExistedUserInfo(userInfo) {
    return !isRemovedUserInfo(userInfo);
}
