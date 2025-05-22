#!/bin/bash
# Script to start the candlz documentation server

echo "Starting candlz documentation server..."

# Check if docsify-cli is installed
if command -v docsify &> /dev/null; then
    echo "Using docsify-cli to serve documentation"
    docsify serve docs
elif command -v npx &> /dev/null; then
    echo "Using npx to serve documentation"
    npx docsify-cli serve docs
elif command -v python3 &> /dev/null; then
    echo "Using Python's built-in HTTP server"
    cd docs && python3 -m http.server 3000
elif command -v python &> /dev/null; then
    echo "Using Python's built-in HTTP server"
    cd docs && python -m http.server 3000
else
    echo "Error: Could not find docsify-cli, npx, or python to serve the documentation"
    echo "Please install one of the following:"
    echo "  - docsify-cli: npm install -g docsify-cli"
    echo "  - Node.js with npm (for npx)"
    echo "  - Python 3"
    exit 1
fi

echo "Documentation server started at http://localhost:3000"
