#!/usr/bin/env bash
# McKee Story Workflow — one-command install for Claude Code
# Usage: bash install.sh [--dry-run] [--project-dir /path/to/story-project]

set -euo pipefail

DRY_RUN=false
PROJECT_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --project-dir) PROJECT_DIR="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; }

# Resolve repo root (where this script lives)
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo " McKee Story Workflow — Installer"
echo " Repo: $REPO_ROOT"
echo "============================================"
echo ""

# --- Step 1: Install skills globally ---
SKILLS_SRC="$REPO_ROOT/skills"
SKILLS_DEST="$HOME/.claude/skills"

if [[ ! -d "$SKILLS_SRC" ]]; then
  err "Skills directory not found: $SKILLS_SRC"
  exit 1
fi

log "Installing skills to $SKILLS_DEST"

if $DRY_RUN; then
  for skill_dir in "$SKILLS_SRC"/*/; do
    skill_name="$(basename "$skill_dir")"
    echo "  [dry-run] would install: $skill_name"
  done
else
  mkdir -p "$SKILLS_DEST"
  for skill_dir in "$SKILLS_SRC"/*/; do
    skill_name="$(basename "$skill_dir")"
    if [[ -d "$SKILLS_DEST/$skill_name" ]]; then
      warn "Overwriting existing skill: $skill_name"
    fi
    cp -r "$skill_dir" "$SKILLS_DEST/"
    log "  Installed: $skill_name"
  done
fi

echo ""

# --- Step 2: Install agents into story project (if --project-dir given) ---
AGENTS_SRC="$REPO_ROOT/agents"

if [[ -n "$PROJECT_DIR" ]]; then
  AGENTS_DEST="$PROJECT_DIR/.claude/agents"

  if [[ ! -d "$AGENTS_SRC" ]]; then
    err "Agents directory not found: $AGENTS_SRC"
    exit 1
  fi

  log "Installing agents to $AGENTS_DEST"

  if $DRY_RUN; then
    for agent_file in "$AGENTS_SRC"/*.md; do
      agent_name="$(basename "$agent_file")"
      echo "  [dry-run] would install: $agent_name"
    done
  else
    mkdir -p "$AGENTS_DEST"
    cp "$AGENTS_SRC"/*.md "$AGENTS_DEST/"
    log "  Installed $(ls "$AGENTS_SRC"/*.md | wc -l | tr -d ' ') agents"
  fi

  echo ""

  # --- Step 3: Scaffold project templates (if --project-dir given) ---
  if [[ -f "$PROJECT_DIR/lifecycle.json" ]]; then
    warn "Project already initialized (lifecycle.json exists) — skipping scaffolding"
  else
    log "Scaffolding new project at $PROJECT_DIR"

    if $DRY_RUN; then
      echo "  [dry-run] would create: drafts/<slug>/{characters,scenes,prose,audit/beat-gate,audit/rolling}"
      echo "  [dry-run] would copy: lifecycle.json, state.json, beat-gate-policy.json"
    else
      # Ask for slug
      read -r -p "  Project slug (kebab-case, e.g. 'clockmaker'): " SLUG
      if [[ -z "$SLUG" ]]; then
        err "Slug is required"
        exit 1
      fi

      DRAFTS_DIR="$PROJECT_DIR/drafts/$SLUG"
      mkdir -p "$DRAFTS_DIR"/{characters,scenes,prose,audit/beat-gate,audit/rolling}

      # Copy and populate templates
      sed "s/{{slug}}/$SLUG/g; s/{{title}}/$SLUG/g; s/{{YYYY-MM-DD}}/$(date +%Y-%m-%d)/g" \
        "$REPO_ROOT/templates/lifecycle.json" > "$DRAFTS_DIR/lifecycle.json"

      sed "s/{{slug}}/$SLUG/g" \
        "$REPO_ROOT/templates/state.json" > "$DRAFTS_DIR/state.json"

      cp "$REPO_ROOT/templates/beat-gate-policy.json" "$DRAFTS_DIR/beat-gate-policy.json"

      log "  Created: $DRAFTS_DIR/"
      log "  Run /story-new '$SLUG' in Claude Code to continue."
    fi
  fi
else
  warn "No --project-dir given — agents not installed."
  echo "  To install agents into a story project:"
  echo "    bash install.sh --project-dir /path/to/your-story-project"
  echo "  Or manually: cp -r $AGENTS_SRC/* your-project/.claude/agents/"
fi

echo ""
log "Installation complete."
echo ""
echo "  Next: cd into your story project and run /story-new \"your seed\""
echo "  Verify: /story-status"
