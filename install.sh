#!/usr/bin/env bash
# McKee Story Workflow — one-command install for Claude Code
# Usage: bash install.sh [--dry-run] [--project-dir /path/to/story-project]

set -euo pipefail
shopt -s nullglob

DRY_RUN=false
PROJECT_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --project-dir)
      if [[ $# -lt 2 ]]; then
        echo "--project-dir requires a path" >&2
        exit 2
      fi
      PROJECT_DIR="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 2
      ;;
  esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*" >&2; }

cleanup_staging() {
  if [[ -n "${skills_stage:-}" && -d "$skills_stage" ]]; then
    rm -rf "$skills_stage"
  fi
  if [[ -n "${agents_stage:-}" && -d "$agents_stage" ]]; then
    rm -rf "$agents_stage"
  fi
}
trap cleanup_staging EXIT

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

skill_sources=("$SKILLS_SRC"/*/)
log "Installing skills to $SKILLS_DEST"

if $DRY_RUN; then
  for skill_dir in "${skill_sources[@]}"; do
    skill_name="$(basename "$skill_dir")"
    echo "  [dry-run] would replace: $skill_name"
  done
else
  mkdir -p "$SKILLS_DEST"
  install_stamp="$(date +%Y%m%d%H%M%S)-$$-${RANDOM}"
  skills_stage="$SKILLS_DEST/.mckee-story-workflow-stage.$install_stamp"
  skills_backup="$SKILLS_DEST/.mckee-story-workflow-backups"
  skills_manifest="$SKILLS_DEST/.mckee-story-workflow-skills-manifest"

  # Stage every skill before moving any existing destination. A failed copy
  # therefore leaves the active installation untouched.
  mkdir "$skills_stage"
  for skill_dir in "${skill_sources[@]}"; do
    skill_name="$(basename "$skill_dir")"
    cp -R "$skill_dir" "$skills_stage/$skill_name"
  done

  mkdir -p "$skills_backup"
  is_current_skill() {
    local candidate="$1"
    local source_dir
    for source_dir in "${skill_sources[@]}"; do
      [[ "$(basename "$source_dir")" == "$candidate" ]] && return 0
    done
    return 1
  }

  if [[ -f "$skills_manifest" ]]; then
    while IFS= read -r old_skill || [[ -n "$old_skill" ]]; do
      [[ -z "$old_skill" ]] && continue
      if [[ "$old_skill" == */* || "$old_skill" == *..* || "$old_skill" == .* ]]; then
        warn "Ignoring unsafe entry in managed skill manifest: $old_skill"
        continue
      fi
      if ! is_current_skill "$old_skill" && [[ -e "$SKILLS_DEST/$old_skill" ]]; then
        backup_path="$skills_backup/$old_skill.$install_stamp"
        mv "$SKILLS_DEST/$old_skill" "$backup_path"
        warn "Removed stale managed skill: $old_skill (backup: $backup_path)"
      fi
    done < "$skills_manifest"
  fi

  for skill_dir in "${skill_sources[@]}"; do
    skill_name="$(basename "$skill_dir")"
    destination="$SKILLS_DEST/$skill_name"
    if [[ -e "$destination" || -L "$destination" ]]; then
      backup_path="$skills_backup/$skill_name.$install_stamp"
      warn "Replacing existing skill: $skill_name (backup: $backup_path)"
      mv "$destination" "$backup_path"
    fi
    mv "$skills_stage/$skill_name" "$destination"
    log "  Installed: $skill_name"
  done
  skills_manifest_tmp="$skills_manifest.tmp.$install_stamp"
  : > "$skills_manifest_tmp"
  for skill_dir in "${skill_sources[@]}"; do
    basename "$skill_dir" >> "$skills_manifest_tmp"
  done
  mv "$skills_manifest_tmp" "$skills_manifest"
  rmdir "$skills_stage"
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

  agent_sources=("$AGENTS_SRC"/*.md)
  agent_manifest="$AGENTS_DEST/.mckee-story-workflow-manifest"
  log "Installing agents to $AGENTS_DEST"

  if $DRY_RUN; then
    for agent_file in "${agent_sources[@]}"; do
      agent_name="$(basename "$agent_file")"
      echo "  [dry-run] would install: $agent_name"
    done
  else
    mkdir -p "$AGENTS_DEST"
    install_stamp="${install_stamp:-$(date +%Y%m%d%H%M%S)-$$-${RANDOM}}"
    agents_stage="$AGENTS_DEST/.mckee-story-workflow-stage.$install_stamp"
    mkdir "$agents_stage"

    # Copy all new files first. Existing project files are changed only after
    # this complete staging pass succeeds.
    for agent_file in "${agent_sources[@]}"; do
      cp "$agent_file" "$agents_stage/$(basename "$agent_file")"
    done

    is_current_agent() {
      local candidate="$1"
      local source_file
      for source_file in "${agent_sources[@]}"; do
        [[ "$(basename "$source_file")" == "$candidate" ]] && return 0
      done
      return 1
    }

    if [[ -f "$agent_manifest" ]]; then
      while IFS= read -r old_agent || [[ -n "$old_agent" ]]; do
        [[ -z "$old_agent" ]] && continue
        if [[ "$old_agent" == */* || "$old_agent" == *..* || "$old_agent" != *.md ]]; then
          warn "Ignoring unsafe entry in managed agent manifest: $old_agent"
          continue
        fi
        if ! is_current_agent "$old_agent"; then
          if [[ -f "$AGENTS_DEST/$old_agent" ]]; then
            rm "$AGENTS_DEST/$old_agent"
            warn "Removed stale managed agent: $old_agent"
          fi
        fi
      done < "$agent_manifest"
    else
      # Before the first manifest, every pre-existing non-repository agent is
      # treated as user-owned and left in place.
      for existing_agent in "$AGENTS_DEST"/*.md; do
        existing_name="$(basename "$existing_agent")"
        if ! is_current_agent "$existing_name"; then
          warn "Preserving unmanaged legacy agent: $existing_name"
        fi
      done
    fi

    for staged_agent in "$agents_stage"/*.md; do
      mv "$staged_agent" "$AGENTS_DEST/$(basename "$staged_agent")"
    done

    manifest_tmp="$agent_manifest.tmp.$install_stamp"
    : > "$manifest_tmp"
    for agent_file in "${agent_sources[@]}"; do
      basename "$agent_file" >> "$manifest_tmp"
    done
    mv "$manifest_tmp" "$agent_manifest"
    rmdir "$agents_stage"
    log "  Installed ${#agent_sources[@]} agents"
  fi

  echo ""

  # --- Step 3: Scaffold project templates (if --project-dir given) ---
  existing_draft=false
  if [[ -f "$PROJECT_DIR/lifecycle.json" ]]; then
    existing_draft=true
  fi
  for lifecycle_file in "$PROJECT_DIR"/drafts/*/lifecycle.json; do
    if [[ -f "$lifecycle_file" ]]; then
      existing_draft=true
      break
    fi
  done

  if $existing_draft; then
    warn "Existing draft lifecycle detected — preserving project scaffolding"
  else
    log "Scaffolding new project at $PROJECT_DIR"

    if $DRY_RUN; then
      echo "  [dry-run] would create: drafts/<slug>/{characters,scenes,prose,audit/beat-gate,audit/rolling}"
      echo "  [dry-run] would copy: lifecycle.json, state.json, beat-gate-policy.json"
    else
      read -r -p "  Project slug (kebab-case, e.g. 'clockmaker'): " SLUG
      if [[ -z "$SLUG" ]]; then
        err "Slug is required"
        exit 1
      fi
      if [[ ! "$SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
        err "Slug must use kebab-case lowercase letters, numbers, and single hyphens"
        exit 1
      fi

      DRAFTS_DIR="$PROJECT_DIR/drafts/$SLUG"
      if [[ -e "$DRAFTS_DIR/lifecycle.json" || -e "$DRAFTS_DIR/state.json" || -e "$DRAFTS_DIR/beat-gate-policy.json" ]]; then
        err "Draft already contains lifecycle state: $DRAFTS_DIR"
        exit 1
      fi
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
