#!/bin/bash

set -e

env=${1:-dev}

echo "Running on: ${env}"

s3FullPath="s3://sprint-ray-chat-service-${env}"
echo "s3FullPath: ${s3FullPath}"

npm ci --legacy-peer-deps
npm run "build:${env}"
aws s3 sync ./dist/chat-service-client/browser "${s3FullPath}" --region us-west-2 --profile sprint-ray-dev

if [ "${env}" = "dev" ]; then
  CF_DISTRIBUTION_ID="E78AN580YI7EZ";
fi

if [ "${env}" = "staging" ]; then
  CF_DISTRIBUTION_ID="E1N2RLDRSBM2EZ";
fi

if [ "${env}" = "prod" ]; then
  CF_DISTRIBUTION_ID="E1SI4QMG72W95H";
fi

echo "CF_DISTRIBUTION_ID: ${CF_DISTRIBUTION_ID}"

aws cloudfront create-invalidation --distribution-id "${CF_DISTRIBUTION_ID}" --paths "/*" --region us-west-2 --profile sprint-ray-dev \
  --no-cli-pager
