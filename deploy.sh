#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "🌾 Building MuBell Farm..."
node build.js

echo ""
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name mubell-farm

echo ""
echo "✅ Deploy complete! Check https://mubell-farm.pages.dev"
