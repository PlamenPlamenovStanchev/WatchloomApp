# Watchloom Backups

Watchloom uses a scheduled GitHub Actions workflow to back up the production Neon PostgreSQL database and the Cloudflare R2 media bucket into a private Cloudflare R2 backup bucket.

## GitHub Secrets

Configure these secrets in the GitHub repository before running the workflow:

- `DATABASE_URL`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `R2_REGION`
- `R2_MEDIA_BUCKET_NAME`
- `R2_BACKUP_BUCKET_NAME`

Use `DATABASE_URL` for the real backup target. Do not use `TEST_DATABASE_URL`.

## Cloudflare R2 Setup

Create a dedicated private R2 bucket for backups. Do not reuse the public media bucket.

Recommended setup:

- Media source bucket: stores posters and app media.
- Backup destination bucket: private bucket used only for backup archives.
- R2 API token: grants read access to the media source bucket and object read/write/delete access to the backup bucket.

The workflow fails if `R2_BACKUP_BUCKET_NAME` equals `R2_MEDIA_BUCKET_NAME`.

If the workflow fails with `AccessDenied` during `PutObject`, the backup script is correct but the R2 token cannot write to `R2_BACKUP_BUCKET_NAME`. In Cloudflare, update the token so it can write objects to the private backup bucket, or replace `R2_BACKUP_BUCKET_NAME` with the correct writable bucket name.

If the workflow fails during retention cleanup, the token also needs object delete access on the backup bucket.

## Schedule

The workflow is named `Database and Storage Backup`.

It runs:

- Daily at `03:00 UTC`
- Manually through `workflow_dispatch`

GitHub Actions cron schedules always run in UTC.

## Backup Structure

Daily database backups:

```text
database/daily/watchloom-db-daily-YYYY-MM-DD.sql.gz
```

Daily R2 media backups:

```text
storage/daily/watchloom-r2-media-daily-YYYY-MM-DD.zip
```

On Sundays, the same archives are also copied to:

```text
database/weekly/watchloom-db-weekly-YYYY-WW.sql.gz
storage/weekly/watchloom-r2-media-weekly-YYYY-WW.zip
```

On the first day of each month, the same archives are also copied to:

```text
database/monthly/watchloom-db-monthly-YYYY-MM.sql.gz
storage/monthly/watchloom-r2-media-monthly-YYYY-MM.zip
```

## Retention Policy

After successful upload, the workflow keeps:

- Latest 7 files under `database/daily`
- Latest 5 files under `database/weekly`
- Latest 12 files under `database/monthly`
- Latest 7 files under `storage/daily`
- Latest 5 files under `storage/weekly`
- Latest 12 files under `storage/monthly`

Retention cleanup only deletes objects under these backup prefixes in the backup bucket. It never deletes objects from the media source bucket.

## Manual Run

To run a backup manually:

1. Open GitHub.
2. Go to `Actions`.
3. Select `Database and Storage Backup`.
4. Select `Run workflow`.

## Verify Backups

In Cloudflare R2, open the private backup bucket and verify that recent archives exist under:

- `database/daily/`
- `storage/daily/`

For command-line verification with AWS CLI:

```bash
aws s3 ls "s3://$R2_BACKUP_BUCKET_NAME/database/daily/" --endpoint-url "$R2_ENDPOINT"
aws s3 ls "s3://$R2_BACKUP_BUCKET_NAME/storage/daily/" --endpoint-url "$R2_ENDPOINT"
```

## Restore Database Backup Locally

Download the `.sql.gz` archive from the backup bucket, then restore it into the target database:

```bash
gunzip -c watchloom-db-daily-YYYY-MM-DD.sql.gz | psql "$DATABASE_URL"
```

Be careful when restoring to production. Confirm the target `DATABASE_URL` before running the command.

## Local Test

If the required tools and environment variables are available locally, the backup script can be tested with:

```bash
bash .github/scripts/run-backup.sh
```

Required local tools:

- `pg_dump`
- `gzip`
- `zip`
- `aws`

The script validates required environment variables and avoids printing secret values.
