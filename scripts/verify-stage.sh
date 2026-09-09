#!/usr/bin/env bash
#
# Verify a staged @l8c/ui release before approving it on npm.
#
# Downloads the staged tarball, rebuilds the same version from the git tag in a
# clean worktree and compares the two. Identical shasum means the staged
# tarball is byte-for-byte what this repository's source produces, so nothing
# in CI could have altered it.
#
# Usage:
#   scripts/verify-stage.sh <stage-id>
#
# Requires: git, node/npm (logged in to npm for `npm stage download`), tar, diff.
# Works in Git Bash on Windows as well as on Linux/macOS.

set -euo pipefail

PACKAGE="@l8c/ui"
STAGE_ID="${1:-}"

if [ -z "$STAGE_ID" ]; then
  echo "usage: $0 <stage-id>" >&2
  echo "       find the id with: npm stage list $PACKAGE" >&2
  exit 2
fi

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
WORK="$(mktemp -d)"
WORKTREE="$WORK/src"

cleanup() {
  git -C "$REPO_ROOT" worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

green() { printf '\033[32m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }
step()  { printf '\n==> %s\n' "$*"; }

# ---------------------------------------------------------------------------
step "Downloading staged tarball $STAGE_ID"
mkdir -p "$WORK/staged"
(cd "$WORK/staged" && npm stage download "$STAGE_ID")
STAGED_TGZ="$(find "$WORK/staged" -maxdepth 1 -name '*.tgz' | head -n 1)"
if [ -z "$STAGED_TGZ" ]; then
  red "npm stage download did not produce a .tgz in $WORK/staged"
  exit 1
fi
mkdir -p "$WORK/staged/unpacked"
tar -xzf "$STAGED_TGZ" -C "$WORK/staged/unpacked"

STAGED_NAME="$(node -p "require('$WORK/staged/unpacked/package/package.json').name")"
VERSION="$(node -p "require('$WORK/staged/unpacked/package/package.json').version")"
if [ "$STAGED_NAME" != "$PACKAGE" ]; then
  red "Staged tarball is $STAGED_NAME, expected $PACKAGE"
  exit 1
fi
echo "staged: $STAGED_NAME@$VERSION"

# ---------------------------------------------------------------------------
step "Rebuilding v$VERSION from git tag in a clean worktree"
git -C "$REPO_ROOT" fetch --tags --quiet origin
if ! git -C "$REPO_ROOT" rev-parse -q --verify "refs/tags/v$VERSION" >/dev/null; then
  red "Tag v$VERSION does not exist. The publish workflow creates it when staging; check the run."
  exit 1
fi
git -C "$REPO_ROOT" worktree add --quiet --detach "$WORKTREE" "v$VERSION"
echo "commit: $(git -C "$WORKTREE" rev-parse --short HEAD)  $(git -C "$WORKTREE" log -1 --format=%s)"

LOCAL_VERSION="$(node -p "require('$WORKTREE/shared-components/projects/l8c-ui/package.json').version")"
if [ "$LOCAL_VERSION" != "$VERSION" ]; then
  red "Tag v$VERSION points at a commit whose package.json says $LOCAL_VERSION"
  exit 1
fi

(
  cd "$WORKTREE/shared-components"
  npm ci --no-audit --no-fund --loglevel=error
  npm run build --silent
  cd dist/l8c-ui
  npm pack --silent >/dev/null
)
LOCAL_TGZ="$(find "$WORKTREE/shared-components/dist/l8c-ui" -maxdepth 1 -name '*.tgz' | head -n 1)"
mkdir -p "$WORK/local/unpacked"
tar -xzf "$LOCAL_TGZ" -C "$WORK/local/unpacked"

# ---------------------------------------------------------------------------
step "Comparing"
sha1() { node -e "const c=require('crypto'),f=require('fs');console.log(c.createHash('sha1').update(f.readFileSync(process.argv[1])).digest('hex'))" "$1"; }
STAGED_SHA="$(sha1 "$STAGED_TGZ")"
LOCAL_SHA="$(sha1 "$LOCAL_TGZ")"
echo "staged shasum: $STAGED_SHA"
echo "local  shasum: $LOCAL_SHA"

if [ "$STAGED_SHA" = "$LOCAL_SHA" ]; then
  green "OK: staged tarball is byte-identical to a clean build of v$VERSION."
  echo "Approve with: npm stage approve $STAGE_ID"
  exit 0
fi

echo
echo "Tarballs differ, comparing unpacked contents (packaging metadata can differ harmlessly)..."
if diff -r "$WORK/staged/unpacked/package" "$WORK/local/unpacked/package"; then
  green "OK: file contents are identical; only tarball metadata differs (e.g. gzip header, npm version)."
  echo "Approve with: npm stage approve $STAGE_ID"
  exit 0
fi

red "MISMATCH: staged package content differs from a clean build of v$VERSION."
echo "Do not approve. Inspect the diff above, then reject with: npm stage reject $STAGE_ID"
exit 1
