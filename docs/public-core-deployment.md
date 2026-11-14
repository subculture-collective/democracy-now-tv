# Public deployment and independent updates

The public site at https://democracy-now.subcult.tv/ serves 6,582 reviewed programs
through the independently published Arkhiv core 0.4.9. Its scope is
`democracy_now_vid`. The existing distinct frontend belongs to this repository.

`deploy/archive-core.env` and `deploy/core-release.json` record the immutable
API image and compatibility contract. Future core releases update these two
files through the API-only reviewed PR lane. The API pin check requires no
frontend package install, lockfile change or interface rebuild. Frontend component
updates remain a separate optional reviewed lane; the historical combined-engine
pin is retained for the legacy/private deployment.

Almaz's public runtime is owned by the separate
`arkhiv-platform-public-20261004` Compose project. Its public API uses a SELECT-only
database role, public audience and this collection scope. The immutable frontend
wrapper image is `sha256:7b322d81bc79dcb979d7bc7a5b443258f726f1e1c6abab4b60222c16d2da8b74`. The wrapper's complete static file manifest
matches this repository's qualified frontend artifact. Public rollout replaced
the core containers while preserving the frontend images and verified that each
proxy still reached the correct collection after Docker reused addresses.

Updating a source pin creates a reviewable change; deployment is a separate
operation. The operator must verify the registry digest and contract, retain the
previous image and fresh independent checkpoint, update only the API service,
and check public catalog, playback, schedule and access boundaries through the
unchanged frontend. A private historical engine is not automatically a safe
public rollback. Operational ownership and live image receipts remain in
Machinum and the deployment's private qualification directory.

Democracy Now! streams directly from Archive.org. Its local media mount is
empty and its local relay returns 404; no video acquisition worker runs.

## Core 0.4.8 and episode thumbnails, 2026-11-14

The public API moved from core 0.1.1 to 0.4.8 (source `0b270c3`, digest
`sha256:869a7309d0d7…`). Core 0.3.0 through 0.4.7 could not serve this catalog:
their listing query took about 2 seconds of the 3-second request deadline, and
every listing returned 503 in a rehearsal on a copy of this database. Core 0.4.8
reads only this collection and reuses listing summaries for 30 seconds; public
listings now take about 0.2 seconds through Cloudflare.

The rollout took a fresh database checkpoint, ran migrations 0010–0022 as the
operator, granted the SELECT-only public role read access to all tables (it has
no default privileges, so the new tables needed this), and recreated only this
API service. On Almaz the two video cores now read `VIDEO_CORE_IMAGE` from the
Compose `.env` instead of the shared `ARCHIVE_ENGINE_IMAGE`; the previous
`compose.json`, `.env` and container state are kept with the checkpoint in the
operator's private state directory. To roll back, set `VIDEO_CORE_IMAGE` to the
0.1.1 digest `sha256:cb44da0d015a…` and recreate only this service; the
migrations are additive and 0.1.1 ignores the new tables and artwork reviews.

6,581 of the 6,582 programs now have a reviewed artwork decision pointing at
their Internet Archive item tile (`__ia_thumb.jpg`), a frame from the broadcast;
the remaining program has no tile in its source inventory and keeps the text
card. The library cards and player poster show these images.

Core 0.4.9 (2026-11-14, same migrations as 0.4.8) adds `community` to
`/api/version`; this instance reports accounts and chat off. Viewer 0.4.8 reads
that and no longer requests the account session or polls the chat room, which
had logged a 404 in the browser console on every page.

## Automatic core deploys

The Democracy Now! API is the `democracy-core` service in Almaz's shared
`arkhiv-platform-public-20261004` Compose project, with its own `democracy_now`
database. This repository owns its pin. The `core` job in
`.github/workflows/deploy.yml` runs before the web job when the version in
`deploy/core-release.json` differs from the `core_version` that
`https://democracy-now.subcult.tv/api/version` reports, when
`deploy/core.Dockerfile` changed since the last successful core deploy, or
when a manual run sets `deploy_core`. It stays off
until the repository variable `CORE_DEPLOY_ENABLED` is `true`. The job:

1. pulls the pinned digest from `git.subcult.tv` (anonymous) and refuses an
   image whose digest differs from the pin, or whose version and revision labels
   differ from `deploy/core-release.json`;
2. builds `deploy/core.Dockerfile` from that digest with an empty build context.
   The wrapper adds only labels: source, revision (this repository's commit),
   `org.opencontainers.image.version` (the core version) and
   `org.subcult.archive-core.revision` (the core's own commit). CI refuses it if
   its layers differ from the pin's, and `scripts/check_core_pin.py` refuses a
   Dockerfile with anything other than `ARG`, `FROM ${CORE_IMAGE}` and `LABEL`;
3. sends the image through the `democracy-now-tv-core` receiver profile with its own
   key (`HOMELAB_CORE_DEPLOY_KEY` in the `production` environment), unless the
   receiver already holds it, then runs `deploy REVISION`. On Almaz the receiver
   backs up `democracy_now`, runs `operator migrate` with the new image, swaps
   `democracy-core`, runs the checks and restores the previous image if they fail;
4. fails with an annotation when the receiver refuses or rolls back, and
   otherwise checks that `/api/version` reports the pinned `core_version`.
5. records the deployed commit as a GitHub deployment with task `deploy:core`
   in the `production` environment. The next runs compare
   `deploy/core.Dockerfile` with that commit. A core run that was refused,
   cancelled or skipped while `CORE_DEPLOY_ENABLED` was off records nothing,
   so its wrapper change carries forward. Before the first record exists,
   the core deploys once to create it.

The core has its own profile because `deploy REVISION` replaces every service in
a profile: if `democracy-core` joined the web profile, every web commit would replace
the core and run the migration again.

Host registration (operator work, tracked on arkhiv#61):

- Profile `democracy-now-tv-core` names service `democracy-core` and a service-only
  `compose_file` derived with `--no-env-resolution`: `democracy-core` with its live
  settings (the root-owned `runtime/democracy-core.env` holds no secrets, so its
  values are inlined), an `operator` service for `migrate` using the existing
  `democracy_now` owner connection file and `ARKHIV_READER_ROLE=arkhiv_reader`, and
  the existing external `archive` network. No other service of the shared
  project is in that file. A `runtime_guards` digest refuses drift.
- `pre_deploy_command` dumps only `democracy_now` (about 55 seconds; the receiver
  allows 120), checks the dump with `pg_restore -l` and keeps the five newest.
- Checks: `/api/ready`, an episode listing on `democracy-now.subcult.tv`, and
  `/api/version` with `json_labels: {"core_version":
  "org.opencontainers.image.version"}`. Register the last check only after the
  core reports `core_version` (0.4.11 or later): rollback verification runs it
  against the previous image too.

The shared project's `.env` keeps `VIDEO_CORE_IMAGE` at the bootstrap pin for
both video cores. Running `up -d` for the whole project by hand would put
`democracy-core` back on that pin; update it first, or recreate only other services.

To deploy the core by hand: back up `democracy_now`, run `operator migrate` with the
new image, then recreate only `democracy-core`.
