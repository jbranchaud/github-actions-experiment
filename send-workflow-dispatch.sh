#!/bin/bash

# Load environment variables from .env.local file
export $(egrep -v '^#' .env.local | xargs)

# Now you can use the environment variable in your CURL command
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_ACCESS_TOKEN"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/jbranchaud/github-actions-experiment/actions/workflows/playwright.yml/dispatches \
  -d '{inputs":{"name":"Mona the Octocat","home":"San Francisco, CA"}}'

echo 'end of workflow_dispatch script'
