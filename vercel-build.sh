#!/bin/bash

echo "⚙️ Running custom legacy-peer-deps install"
npm install --legacy-peer-deps

echo "🚀 Building project"
npm run build