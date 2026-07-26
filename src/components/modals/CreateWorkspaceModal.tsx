import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { Plus, Smile } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { COVER_COLORS } from "../../constants/app";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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
    if (!created) return;
    setName("");
    setDescription("");
    setSelectedEmoji("🚀");
    setSelectedColor("#ff6f1e");
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-lg"
              style={{ backgroundColor: `${selectedColor}30` }}
              aria-hidden="true"
            >
              {selectedEmoji}
            </div>
            <DialogTitle>{MESSAGES.CREATE_WORKSPACE_TITLE}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name-input">{MESSAGES.WORKSPACE_NAME_LABEL}</Label>
            <Input
              id="ws-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Side Hustle, Study Notes..."
            />
          </div>

          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {MESSAGES.WORKSPACE_EMOJI_LABEL}
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  aria-label="Choose Emoji Icon"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">
                      {selectedEmoji}
                    </span>
                    <span>Choose Emoji Icon</span>
                  </span>
                  <Smile className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent sideOffset={8} className="overflow-hidden">
                <EmojiPicker
                  emojiStyle={EmojiStyle.NATIVE}
                  onEmojiClick={(emojiData) => setSelectedEmoji(emojiData.emoji)}
                  autoFocusSearch={true}
                  width={340}
                  height={360}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {MESSAGES.WORKSPACE_COLOR_LABEL}
            </span>
            <div className="flex gap-2">
              {COVER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select accent color ${color}`}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "h-7 w-7 rounded-full ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedColor === color && "ring-2 ring-ring ring-offset-2",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-desc-input">{MESSAGES.WORKSPACE_DESC_LABEL}</Label>
            <Input
              id="ws-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this workspace"
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="ghost" aria-label={MESSAGES.CANCEL}>
                {MESSAGES.CANCEL}
              </Button>
            </DialogClose>
            <Button type="submit" aria-label={MESSAGES.CREATE_WORKSPACE_BUTTON}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{MESSAGES.CREATE_WORKSPACE_BUTTON}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
