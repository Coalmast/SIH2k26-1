import type {
  CalendarEditAction,
  TaskItem,
  TaskPermissionRule,
  TaskPermissions,
} from "../../../types";

/** Calendar actions piggy-back on the most natural existing rule key. */
const ACTION_TO_RULE: Record<CalendarEditAction, keyof TaskPermissionRule> = {
  move: "drag",
  resize: "drag",
  delete: "remove",
  create: "addChildren",
  editDetails: "edit",
};

/**
 * Effective allow/deny for one action on `item` at `level` (1 = root). Hard lock
 * (`item.locked`) denies everything. Lookup order byItem → byLevel → default,
 * then a `true` fallback; `inherit !== false` ascends on undefined keys.
 */
export function evalCalendarPermission(
  permissions: TaskPermissions | undefined,
  action: CalendarEditAction,
  item: TaskItem,
  level: number,
): boolean {
  if (item.locked) return false;
  if (!permissions) return true;

  const key = ACTION_TO_RULE[action];
  const inherit = permissions.inherit !== false;

  const byItem = permissions.byItem?.[item.id]?.[key];
  if (byItem !== undefined) return byItem;
  if (!inherit && permissions.byItem?.[item.id]) return true;

  const byLevel = permissions.byLevel?.[level]?.[key];
  if (byLevel !== undefined) return byLevel;
  if (!inherit && permissions.byLevel?.[level]) return true;

  const def = permissions.default?.[key];
  if (def !== undefined) return def;

  return true;
}
