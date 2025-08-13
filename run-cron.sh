#!/bin/bash
set -e

env

# Change to app directory
cd /app

# Load all environment variables from Docker's environment
# This captures all the env vars that Docker loaded from .env
export $(cat /proc/1/environ | tr '\0' '\n' | grep -v '^$')

# Ensure Playwright browser path is set
export PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Execute the command
exec "$@"