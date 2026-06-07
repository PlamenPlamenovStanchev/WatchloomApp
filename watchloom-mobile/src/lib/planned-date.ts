const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DEFAULT_REMINDER_HOUR = 9;

export function parsePlannedWatchDate(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(trimmed);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const plannedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      DEFAULT_REMINDER_HOUR,
      0,
      0,
      0,
    );

    if (isSameLocalDate(plannedDate, new Date()) && plannedDate.getTime() <= Date.now()) {
      return new Date(Date.now() + 60_000);
    }

    return plannedDate;
  }

  return new Date(trimmed);
}

export function normalizePlannedWatchInput(value: string) {
  const plannedDate = parsePlannedWatchDate(value);

  return plannedDate ? plannedDate.toISOString() : null;
}

function isSameLocalDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
