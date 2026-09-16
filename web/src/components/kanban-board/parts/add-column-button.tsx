"use client";;
import { useTranslation } from "react-i18next";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newColumnId } from "../lib/ids";
import type { KanbanColumn } from "../types";

export function AddColumnButton({
  onCreate,
}: {
  onCreate: (column: KanbanColumn) => void;
}) {
  const {
    t
  } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");

  function handleSave() {
    if (!title.trim()) return;
    onCreate({ id: newColumnId(), title: title.trim(), items: [] });
    setTitle("");
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="flex h-fit w-80 shrink-0 flex-col gap-2 rounded-md border border-border bg-card p-2.5"
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Column title"
          autoFocus
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setTitle("");
              setEditing(false);
            }
          }}
        />
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setTitle("");
              setEditing(false);
            }}
          >{t("cancel", "Cancel")}</Button>
          <Button type="submit" size="sm" disabled={!title.trim()}>{t("add", "Add")}</Button>
        </div>
      </form>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-fit w-80 shrink-0 justify-start py-2.5 text-muted-foreground hover:text-foreground"
      onClick={() => setEditing(true)}
    >
      <Plus className="size-4" />{t("add_column", "Add column")}</Button>
  );
}
