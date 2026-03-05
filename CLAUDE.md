# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Freehold is a self-hosted, open-source knowledge base (wiki) built around a non-negotiable **restore guarantee**: a Freehold export bundle must always be restorable to an exact replica of the original workspace. This guarantee is the architectural foundation — every decision flows from it.

## Tech Stack

- **Backend**: FastAPI (Python 3.11+), located in `api/`
- **Database**: PostgreSQL 15+, migrations via Alembic
- **Search**: PostgreSQL full-text search (v0.1), Meilisearch/OpenSearch later
- **Frontend**: Next.js (React), located in `web/`
- **Storage**: Pluggable adapter interface (local filesystem first, S3-compatible next)

## Development Setup

```bash
# Backend
cd api
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # configure DB connection and storage settings
alembic upgrade head          # run migrations
uvicorn main:app --reload     # starts on http://localhost:8000

# Frontend
cd web
npm install
npm run dev                   # starts on http://localhost:3000
```

## Common Commands

Once the project is set up, expected commands will include:

```bash
# Backend tests
cd api && pytest
cd api && pytest tests/path/to/test_file.py::test_function  # single test

# Backend linting/formatting
cd api && ruff check .
cd api && ruff format .

# Database migrations
cd api && alembic revision --autogenerate -m "description"
cd api && alembic upgrade head
cd api && alembic downgrade -1

# Frontend
cd web && npm run dev
cd web && npm run build
cd web && npm run lint
cd web && npm test
```

## Architecture

### Data Model

```
workspaces → spaces → collections → pages → blocks
                                          → attachments
                                 → revisions  (append-only, every save)
                       audit_events
                       tasks / task_integrations  (future)
```

The `revisions` table is append-only. Current page state points to the latest revision; history is never deleted.

### Export Bundle Format

```
freehold-export-{workspace-slug}-{timestamp}.zip
├── manifest.json        # workspace metadata, export timestamp, schema version
├── pages/
│   └── {page-id}.md
├── assets/
│   └── {asset-id}.{ext}
├── revisions/
│   └── {page-id}/
│       └── {revision-id}.md
└── links.json           # internal links, broken links, orphans
```

On restore, asset hashes are verified — mismatch causes a loud failure (never silent corruption).

### Storage Adapter

Storage is an interface, not a hard dependency. Local filesystem is the first adapter; S3-compatible and Azure Blob follow. New storage backends implement the adapter interface without touching core logic.

## Core Constraints

These constraints are non-negotiable and must be respected in all contributions:

1. **Restore guarantee**: `freehold restore --bundle <file>` must reproduce a workspace exactly from any valid export bundle. A failing restore test is a critical bug.
2. **Append-only revisions**: saves always create new revisions; existing revisions are never modified or deleted.
3. **Transparent export format**: export bundles must remain human-readable without tooling (Markdown + JSON, no proprietary blobs).
4. **Pluggable storage**: business logic must not bypass the storage adapter interface.
