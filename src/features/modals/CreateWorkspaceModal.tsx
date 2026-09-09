import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { ImageUp, Plus, Smile, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { COVER_COLORS } from "../../constants/app";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useUIStore } from "../../store/useUIStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { processWorkspaceIcon } from "../../utils/workspaceIcon";

export const CreateWorkspaceModal: React.FC = () => {
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace);
  const uploadWorkspaceIcon = useWorkspaceStore((s) => s.uploadWorkspaceIcon);
  const isCreateModalOpen = useUIStore((s) => s.isCreateModalOpen);
  const setCreateModalOpen = useUIStore((s) => s.setCreateModalOpen);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🚀");
  const [selectedColor, setSelectedColor] = useState("#ff6f1e");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const clearCustomIcon = () => {
    setIconFile(null);
    setIconPreview(null);
    if (iconInputRef.current) iconInputRef.current.value = "";
  };

  const handleIconFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const preview = await processWorkspaceIcon(file);
      setIconFile(file);
      setIconPreview(preview);
    } catch (err) {
      clearCustomIcon();
      notifyError(err);
    }
  };

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
    if (iconFile) await uploadWorkspaceIcon(created.id, iconFile);
    setName("");
    setDescription("");
    setSelectedEmoji("🚀");
    setSelectedColor("#ff6f1e");
    clearCustomIcon();
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border text-lg"
              style={{ backgroundColor: `${selectedColor}30` }}
              aria-hidden="true"
            >
              {iconPreview ? (
                <img src={iconPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                selectedEmoji
              )}
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
              {MESSAGES.WORKSPACE_ICON_LABEL}
            </span>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("flex-1 justify-between", iconPreview && "opacity-60")}
                    aria-label="Choose Emoji Icon"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">
                        {selectedEmoji}
                      </span>
                      <span>Emoji</span>
                    </span>
                    <Smile className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent sideOffset={8} className="overflow-hidden">
                  <EmojiPicker
                    emojiStyle={EmojiStyle.NATIVE}
                    onEmojiClick={(emojiData) => {
                      clearCustomIcon();
                      setSelectedEmoji(emojiData.emoji);
                    }}
                    autoFocusSearch={true}
                    width={340}
                    height={360}
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                className="flex-1 justify-between"
                aria-label={
                  iconPreview ? MESSAGES.WORKSPACE_CUSTOM_ICON : MESSAGES.WORKSPACE_UPLOAD_ICON
                }
                onClick={() => iconInputRef.current?.click()}
                type="button"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {iconPreview ? (
                    <img
                      src={iconPreview}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <ImageUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">
                    {iconPreview ? MESSAGES.WORKSPACE_CUSTOM_ICON : MESSAGES.WORKSPACE_UPLOAD_ICON}
                  </span>
                </span>
              </Button>
              {iconPreview && (
                <Button
                  variant="ghost"
                  size="iconSm"
                  aria-label="Clear custom icon"
                  className="shrink-0 text-muted-foreground"
                  onClick={clearCustomIcon}
                  type="button"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                hidden
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  void handleIconFile(file);
                }}
              />
            </div>
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
            <Button
              type="submit"
              disabled={!name.trim()}
              aria-label={MESSAGES.CREATE_WORKSPACE_BUTTON}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{MESSAGES.CREATE_WORKSPACE_BUTTON}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
