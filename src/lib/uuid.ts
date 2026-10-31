/**
 * UUID helpers.
 *
 * The seeded accounts and categories use readable ids (`'cash'`, `'bca'`,
 * `'makan'`) so the demo data stays legible. The database, however, declares
 * those keys as `uuid`. Writing one of those seed ids to the server fails with
 * `22P02` — a permanent error, so it must never be queued or retried.
 *
 * The rule enforced here: a non-uuid id means "this row only exists locally",
 * which is fine for rendering and impossible for syncing.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for a canonical 8-4-4-4-12 UUID. */
export function isUuid(value: unknown): boolean {
  return typeof value === 'string' && UUID_RE.test(value);
}

/**
 * Passes a uuid through, or `null` for anything else.
 *
 * Used when building a foreign key that references a seeded row: an unrecognised
 * id becomes NULL rather than an invalid string the server would reject.
 */
export function toUuidOrNull(value: unknown): string | null {
  return isUuid(value) ? (value as string) : null;
}
