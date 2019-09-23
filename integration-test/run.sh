#!/usr/bin/env bash
#
# Run integration tests on the module in an isolated environment.
#
# Usage:
#   run.sh [<package-path>]
#
# Arguments:
#   <package-path>  The path to a .tgz or directory containing the module to
#                   test. If not specified, a new .tgz is packed.
#
# Info:
#   The package is installed in an empty directory, and the *.bats files are
#   executed with NODE_PATH and PATH pointing to the newly-installed package
#   location.
#
#   See: https://github.com/sstephenson/bats

set -euo pipefail
PROJ_DIR="$(dirname "$(dirname "$(readlink -f "$BASH_SOURCE[0]")")")"
cd "$PROJ_DIR"

# Integration test dependencies are stored in subsection of the main
# package.json rather than their own package.json as we don't want to lock
# versions when running integration tests - we throw away each test environment
IFS='' read -r -d '' GET_DEPENDENCIES_JS <<"EOF" || true
const meta = JSON.parse(require('fs').readFileSync('package.json'));
const name = meta.name;
const itDeps = meta[name].integrationTestDependencies;
console.log(Object.entries(itDeps).map(([name, version]) => `${name}@${version}`).join(' '))
EOF
IFS=' ' read -r -a DEPENDENCIES <<< "$(node -e "$GET_DEPENDENCIES_JS")"

if [[ ${1:-} ]]; then
    PACKAGE="$(readlink -f "$1")"
else
    NAME="$(node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')).name)")"
    VERSION="$(node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')).version)")"
    if (echo "$VERSION" | grep -q '\+' ); then
        BUILD_ID_SEPARATOR='.'
    else
        BUILD_ID_SEPARATOR='+'
    fi
    TIMESTAMP="$(date --utc '+%Y%m%dT%H%M%SZ')"
    BUILD_ID="${BUILD_ID_SEPARATOR}date.$TIMESTAMP"
    PACKAGE="$(readlink -f "${PROJ_DIR}/${NAME}-v${VERSION}${BUILD_ID}.tgz")"
    echo "No package specified, the current state will be packed as: $PACKAGE"
    echo
    yarn pack -f "$PACKAGE"
    echo
fi

CACHE_DIR="$(mktemp -d)"
INSTALL_DIR="$(mktemp -d)"

printf "
Package under test: %s
Install dir: %s/node_modules
Additional dependencies: %s
" "$PACKAGE" "$INSTALL_DIR" "${DEPENDENCIES[*]}"

echo
# Note that it's necessary to use an empty cache and install dir to ensure the
# CURRENT version of the specified $PACKAGE is installed. Otherwise yarn will
# use a cached version from a previous test run, or may fail with an integrity
# check error due to the package checksum changing.
yarn --cwd "$INSTALL_DIR" --cache-folder "$CACHE_DIR" add "file:$PACKAGE" "${DEPENDENCIES[@]}"
echo

cd integration-test && \
    NODE_PATH="${INSTALL_DIR}/node_modules" \
    PATH="$PATH:${INSTALL_DIR}/node_modules/.bin" \
    "${PROJ_DIR}/node_modules/.bin/bats" *.bats
