import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onUndo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCut: () => void;
  onDuplicate: () => void;
}

export const KeyboardShortcuts = ({
  onUndo,
  onCopy,
  onPaste,
  onCut,
  onDuplicate,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            onUndo();
            break;
          case "c":
            e.preventDefault();
            onCopy();
            break;
          case "v":
            e.preventDefault();
            onPaste();
            break;
          case "x":
            e.preventDefault();
            onCut();
            break;
          case "d":
            e.preventDefault();
            onDuplicate();
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onCopy, onPaste, onCut, onDuplicate]);
  return null;
};
