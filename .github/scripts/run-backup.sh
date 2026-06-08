#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="${BACKUP_ROOT:-backups}"
BACKUP_OUT_DIR="$BACKUP_ROOT/out"
R2_MEDIA_TMP_DIR="$BACKUP_ROOT/tmp/r2-media"
PG_DUMP_BIN="${PG_DUMP_BIN:-pg_dump}"

if [[ -x "/usr/lib/postgresql/17/bin/pg_dump" ]]; then
  PG_DUMP_BIN="/usr/lib/postgresql/17/bin/pg_dump"
fi

require_env() {
  local name="$1"

  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: $name" >&2
    exit 1
  fi
}

validate_env() {
  require_env "DATABASE_URL"
  require_env "R2_ACCOUNT_ID"
  require_env "R2_ACCESS_KEY_ID"
  require_env "R2_SECRET_ACCESS_KEY"
  require_env "R2_ENDPOINT"
  require_env "R2_REGION"
  require_env "R2_MEDIA_BUCKET_NAME"
  require_env "R2_BACKUP_BUCKET_NAME"

  if [[ "$R2_MEDIA_BUCKET_NAME" == "$R2_BACKUP_BUCKET_NAME" ]]; then
    echo "R2_BACKUP_BUCKET_NAME must not equal R2_MEDIA_BUCKET_NAME." >&2
    exit 1
  fi
}

aws_r2() {
  AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
    AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
    AWS_DEFAULT_REGION="$R2_REGION" \
    aws "$@" --endpoint-url "$R2_ENDPOINT"
}

upload_to_backup_bucket() {
  local source_file="$1"
  local destination_key="$2"

  echo "Uploading $destination_key"
  aws_r2 s3api put-object \
    --bucket "$R2_BACKUP_BUCKET_NAME" \
    --key "$destination_key" \
    --body "$source_file" > /dev/null
}

apply_retention() {
  local prefix="$1"
  local keep_count="$2"

  echo "Applying retention for $prefix; keeping latest $keep_count object(s)."

  local keys_file
  keys_file="$(mktemp)"

  aws_r2 s3api list-objects-v2 \
    --bucket "$R2_BACKUP_BUCKET_NAME" \
    --prefix "$prefix/" \
    --query 'sort_by(Contents || `[]`, &LastModified)[].Key' \
    --output text > "$keys_file"

  mapfile -t keys < <(tr '\t' '\n' < "$keys_file" | sed '/^$/d')
  rm -f "$keys_file"

  local total="${#keys[@]}"

  if (( total <= keep_count )); then
    echo "No retention cleanup needed for $prefix."
    return 0
  fi

  local delete_count=$((total - keep_count))

  for ((i = 0; i < delete_count; i++)); do
    echo "Deleting old backup: ${keys[$i]}"
    aws_r2 s3 rm "s3://$R2_BACKUP_BUCKET_NAME/${keys[$i]}" --only-show-errors
  done
}

main() {
  validate_env

  local day_stamp
  local week_stamp
  local month_stamp
  local weekday_utc
  local month_day_utc

  day_stamp="$(date -u +%F)"
  week_stamp="$(date -u +%G-%V)"
  month_stamp="$(date -u +%Y-%m)"
  weekday_utc="$(date -u +%u)"
  month_day_utc="$(date -u +%d)"

  local db_backup_file="$BACKUP_OUT_DIR/watchloom-db-daily-$day_stamp.sql.gz"
  local r2_backup_file="$BACKUP_OUT_DIR/watchloom-r2-media-daily-$day_stamp.zip"

  rm -rf "$BACKUP_ROOT"
  mkdir -p "$BACKUP_OUT_DIR" "$R2_MEDIA_TMP_DIR"

  echo "Creating PostgreSQL backup archive."
  "$PG_DUMP_BIN" "$DATABASE_URL" --no-owner --no-acl --clean --if-exists | gzip -c > "$db_backup_file"

  echo "Copying R2 media bucket to local backup folder."
  aws_r2 s3 sync "s3://$R2_MEDIA_BUCKET_NAME" "$R2_MEDIA_TMP_DIR" --only-show-errors

  echo "Creating R2 media zip archive."
  zip -qr "$r2_backup_file" "$R2_MEDIA_TMP_DIR"

  upload_to_backup_bucket "$db_backup_file" "database/daily/$(basename "$db_backup_file")"
  upload_to_backup_bucket "$r2_backup_file" "storage/daily/$(basename "$r2_backup_file")"

  if [[ "$weekday_utc" == "7" ]]; then
    upload_to_backup_bucket "$db_backup_file" "database/weekly/watchloom-db-weekly-$week_stamp.sql.gz"
    upload_to_backup_bucket "$r2_backup_file" "storage/weekly/watchloom-r2-media-weekly-$week_stamp.zip"
  fi

  if [[ "$month_day_utc" == "01" ]]; then
    upload_to_backup_bucket "$db_backup_file" "database/monthly/watchloom-db-monthly-$month_stamp.sql.gz"
    upload_to_backup_bucket "$r2_backup_file" "storage/monthly/watchloom-r2-media-monthly-$month_stamp.zip"
  fi

  apply_retention "database/daily" 7
  apply_retention "database/weekly" 5
  apply_retention "database/monthly" 12
  apply_retention "storage/daily" 7
  apply_retention "storage/weekly" 5
  apply_retention "storage/monthly" 12

  echo "Backup completed successfully."
}

main "$@"
