# Democracy Now! broadcast archive

![Democracy Now! archive identity](docs/brand/democracy-now-tv/readme-lockup.png)

A standalone episode library and shared scheduled replay channel, built on the
shared Arkhiv engine. This repository owns its frontend, design system, assets,
and deployment configuration. The published viewer package and immutable engine digest are pinned together in
`deploy/platform-release.json` and `deploy/archive-engine.env`. Historical
deployment helpers retain their original hash-verified provenance.

Both on-demand playback and Tune in/Rejoin use the same reviewed content and
source attribution. Viewer controls never change the shared schedule. Original
dates remain visible and archived programming is labeled as replay.

The design uses the supplied Democracy Now! vector logo and Amy Goodman photograph, with a dated news archive, readable reporting, and red/black/white styling. Video streams directly from Internet Archive. The app never acquires, proxies, persistently caches, or transcodes Democracy Now! video. Complete source metadata and history stay in its independent engine database.

## Verify and build

Run `make verify` for package/engine pins, tool/asset hashes, frozen dependencies,
typecheck, lint, model tests, and production frontend build. Browser playback,
audible fidelity, shared-channel drift, restore, and deployment remain distinct
checks. Read `AGENTS.md` before changing generated code.

Set `NPM_CONFIG_USERCONFIG` to a private npm configuration outside this checkout.
It must select the Gitea registry for `@subcult` and supply a package-read token.
CI uses the repository secret `ARCHIVE_PACKAGE_READ_TOKEN`. Build this frontend
over the released engine, then prepare a separately reviewed deployment:

```sh
python3 scripts/build_image.py --npmrc /absolute/private/npmrc --tag democracy-now-tv:APP_SOURCE_SHA
python3 scripts/deploy.py prepare \
  --root ~/.local/state/video-archive/democracy-now-tv --project democracy-now-tv \
  --image democracy-now-tv:APP_SOURCE_SHA --collection democracy_now_vid --port 48072
python3 scripts/deploy.py start \
  --root ~/.local/state/video-archive/democracy-now-tv --project democracy-now-tv \
  --snapshot /absolute/reviewed/democracy-now-tv.dump
```

The helper creates separate private credentials and database state, binds to loopback, and restores snapshots only into an empty owned database. Public ingress remains a separate owner decision. Never reuse another product's secrets or reset an existing database.

See [engine deployment operations](docs/engine-deployment.md) for source refresh, explicit private-library review, seven-day replay planning/renewal, preservation, and rollback. No host timers are installed automatically.

## Assets and software license

This is an independent archive viewer, not an assertion of official affiliation. [Asset provenance](docs/asset-provenance.json) records supplied filenames and hashes. Software follows the engine's GPL-3.0 license; third-party logos, photography, and inspiration retain their separate provenance and are not assigned that software license. Public-release clearance remains separate. Runtime media, metadata snapshots, secrets, and generated evidence stay outside Git.

## Public core deployment

The public site is live at https://democracy-now.subcult.tv/. The frontend remains
owned here; the independently released headless core has its own reviewed update
pin. See [public deployment and updates](docs/public-core-deployment.md).

The independent engine release and upgrade procedure is documented in
[Shared engine release](docs/shared-core-release.md).

## Brand assets

The product identity and selected public exports are recorded in [the brand handoff](docs/brand/democracy-now-tv/GUIDE.md) and [source hashes](docs/brand/democracy-now-tv/export.json). Regenerate from SUBCULT Studio with `python3 studio/scripts/export_remaining_brand.py democracy-now-tv /path/to/this/repository`; use `--check` to verify the export without writing.
