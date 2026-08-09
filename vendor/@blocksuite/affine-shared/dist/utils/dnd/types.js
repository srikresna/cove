/**
 * Returns a flag for the drop target.
 */
export var DropFlags;
(function (DropFlags) {
    DropFlags[DropFlags["Normal"] = 0] = "Normal";
    DropFlags[DropFlags["Database"] = 1] = "Database";
    DropFlags[DropFlags["EmptyDatabase"] = 2] = "EmptyDatabase";
})(DropFlags || (DropFlags = {}));
