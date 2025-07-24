#!/bin/bash

# Push to GitHub script for Capacity Model Integration
# Run this after creating the repository on GitHub

set -e

echo "🚀 Pushing Capacity Model Integration to GitHub"
echo "================================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

echo "✅ Git repository found"

# Check if we have commits
if ! git log --oneline -1 > /dev/null 2>&1; then
    echo "❌ No commits found. Please commit your changes first."
    exit 1
fi

echo "✅ Git commits found"

# Add remote origin
echo "📡 Adding remote origin..."
git remote add origin https://github.com/mrtellington/capacity-model-integration.git

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "🎉 Successfully pushed to GitHub!"
echo ""
echo "🔗 Repository URL: https://github.com/mrtellington/capacity-model-integration"
echo "📋 Issues: https://github.com/mrtellington/capacity-model-integration/issues"
echo "⚡ Actions: https://github.com/mrtellington/capacity-model-integration/actions"
echo ""
echo "📚 Next steps:"
echo "1. Visit the repository URL to verify everything is uploaded"
echo "2. Set up branch protection rules"
echo "3. Configure repository settings"
echo "4. Set up Google Cloud credentials (see setup_instructions.md)"
echo "5. Test the integration"
echo ""
echo "✅ Push completed successfully!" 