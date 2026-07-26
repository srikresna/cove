import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import EmojiPicker from "emoji-picker-react";
import { Plus, Smile, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { COVER_COLORS } from "../../constants/app";
import { MESSAGES } from "../../constants/messages";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export const CreateWorkspaceModal: React.FC = () => {
  const { isCreateModalOpen, setCreateModalOpen, createWorkspace } = useWorkspaceStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🚀");
  const [selectedColor, setSelectedColor] = useState("#ff6f1e");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const created = await createWorkspace(
      name.trim(),
      selectedEmoji,
      selectedColor,
      description.trim(),
    );
    // On failure the store keeps the modal open and shows a toast — keep the
    // user's input so they can retry.
    if (!created) return;
    setName("");
    setDescription("");
    setSelectedEmoji("🚀");
    setSelectedColor("#ff6f1e");
  };

  return (
    <Dialog.Root open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-cream-paper rounded-[16px] border-[1.5px] border-charcoal shadow-card-subtle p-6 space-y-5 outline-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-[8px] border border-charcoal flex items-center justify-center text-lg shadow-sm"
                style={{ backgroundColor: `${selectedColor}30` }}
                aria-hidden="true"
              >
                {selectedEmoji}
              </div>
              <Dialog.Title className="text-lg font-extrabold text-cocoa-ink">
                {MESSAGES.CREATE_WORKSPACE_TITLE}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close modal"
                className="p-1.5 rounded-[12px] text-charcoal hover:bg-dew-drop outline-none"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="ws-name-input"
                className="block text-[10px] font-bold uppercase tracking-wider text-marker-orange mb-1.5"
              >
                {MESSAGES.WORKSPACE_NAME_LABEL}
              </label>
              <input
                id="ws-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Side Hustle, Study Notes..."
                className="w-full px-4 py-2.5 rounded-[12px] bg-dew-drop border-[1.5px] border-charcoal focus:border-marker-orange outline-none text-xs font-semibold text-cocoa-ink transition-colors"
              />
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-marker-orange mb-1.5">
                {MESSAGES.WORKSPACE_EMOJI_LABEL}
              </span>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    aria-label="Choose Emoji Icon"
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-[12px] bg-dew-drop border-[1.5px] border-charcoal text-xs font-bold text-cocoa-ink outline-none hover:bg-cream-paper transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">
                        {selectedEmoji}
                      </span>
                      <span>Choose Emoji Icon</span>
                    </div>
                    <Smile className="w-4 h-4 text-marker-orange" aria-hidden="true" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    sideOffset={8}
                    className="z-50 shadow-card-subtle rounded-[16px] overflow-hidden border-[1.5px] border-charcoal bg-cream-paper outline-none"
                  >
                    <EmojiPicker
                      onEmojiClick={(emojiData) => setSelectedEmoji(emojiData.emoji)}
                      autoFocusSearch={true}
                      width={340}
                      height={360}
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-marker-orange mb-1.5">
                {MESSAGES.WORKSPACE_COLOR_LABEL}
              </span>
              <div className="flex gap-2">
                {COVER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select accent color ${color}`}
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      selectedColor === color
                        ? "scale-125 ring-2 ring-charcoal ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="ws-desc-input"
                className="block text-[10px] font-bold uppercase tracking-wider text-marker-orange mb-1.5"
              >
                {MESSAGES.WORKSPACE_DESC_LABEL}
              </label>
              <input
                id="ws-desc-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of this workspace"
                className="w-full px-4 py-2.5 rounded-[12px] bg-dew-drop border-[1.5px] border-charcoal focus:border-marker-orange outline-none text-xs font-semibold text-cocoa-ink transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label={MESSAGES.CANCEL}
                  className="px-4 py-2 rounded-[20px] text-xs font-bold text-charcoal hover:bg-dew-drop"
                >
                  {MESSAGES.CANCEL}
                </button>
              </Dialog.Close>
              <button
                type="submit"
                aria-label={MESSAGES.CREATE_WORKSPACE_BUTTON}
                className="flex items-center gap-2 px-5 py-2 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-charcoal text-xs font-bold shadow-paper-lift hover:scale-105 transition-transform"
              >
                <Plus className="w-3.5 h-3.5 text-marker-orange" aria-hidden="true" />
                <span>{MESSAGES.CREATE_WORKSPACE_BUTTON}</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
