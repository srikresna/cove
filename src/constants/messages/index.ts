import { EditorMessages } from "./editor";
import { LibraryMessages } from "./library";
import { SearchMessages } from "./search";
import { SettingsMessages } from "./settings";
import { ShellMessages } from "./shell";
import { TrashMessages } from "./trash";
import { VaultMessages } from "./vault";
import { WorkspaceMessages } from "./workspace";

export const MESSAGES = {
  ...ShellMessages,
  ...EditorMessages,
  ...LibraryMessages,
  ...TrashMessages,
  ...VaultMessages,
  ...SettingsMessages,
  ...WorkspaceMessages,
  ...SearchMessages,
} as const;
