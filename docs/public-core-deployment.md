# Public deployment and independent updates

The public site at https://democracy-now.subcult.tv/ serves 6,582 reviewed programs
through the independently published Arkhiv core 0.4.8. Its scope is
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
