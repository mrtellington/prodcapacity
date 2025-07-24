#!/bin/bash

# GitHub Repository Setup Script for Capacity Model Integration
# This script helps set up the GitHub repository and initial configuration

set -e

echo "🚀 Setting up GitHub repository for Capacity Model Integration"
echo "================================================================"

# Check if git is configured
if ! git config --global user.name > /dev/null 2>&1; then
    echo "❌ Git user.name not configured"
    echo "Please run: git config --global user.name 'Your Name'"
    exit 1
fi

if ! git config --global user.email > /dev/null 2>&1; then
    echo "❌ Git user.email not configured"
    echo "Please run: git config --global user.email 'your.email@example.com'"
    exit 1
fi

echo "✅ Git configuration verified"

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

# Instructions for GitHub repository creation
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: capacity-model-integration"
echo "   - Description: Google Sheets integration for Capacity Model with Cursor"
echo "   - Make it Public or Private (your choice)"
echo "   - DO NOT initialize with README, .gitignore, or license (we already have these)"
echo ""
echo "2. After creating the repository, run these commands:"
echo ""
echo "   # Add the remote origin (replace YOUR_USERNAME with your GitHub username)"
echo "   git remote add origin https://github.com/YOUR_USERNAME/capacity-model-integration.git"
echo ""
echo "   # Push the code to GitHub"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Set up GitHub Pages (optional):"
echo "   - Go to repository Settings > Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main, folder: / (root)"
echo ""
echo "4. Configure repository settings:"
echo "   - Go to Settings > General"
echo "   - Enable Issues"
echo "   - Enable Discussions"
echo "   - Enable Wiki"
echo ""
echo "5. Set up branch protection (recommended):"
echo "   - Go to Settings > Branches"
echo "   - Add rule for main branch"
echo "   - Require pull request reviews"
echo "   - Require status checks to pass"
echo ""
echo "6. Install development dependencies:"
echo "   pip install -r requirements.txt"
echo "   pip install pytest pytest-cov flake8 black isort"
echo ""
echo "7. Run tests to verify everything works:"
echo "   pytest"
echo ""
echo "8. Set up Google Cloud credentials:"
echo "   - Follow instructions in setup_instructions.md"
echo "   - Download credentials.json to project root"
echo ""
echo "🎉 Repository setup complete!"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - setup_instructions.md - Detailed setup guide"
echo "   - CONTRIBUTING.md - Contribution guidelines"
echo ""
echo "🔗 Useful links:"
echo "   - GitHub repository: https://github.com/YOUR_USERNAME/capacity-model-integration"
echo "   - Issues: https://github.com/YOUR_USERNAME/capacity-model-integration/issues"
echo "   - Actions: https://github.com/YOUR_USERNAME/capacity-model-integration/actions"
echo ""

# Check if GitHub CLI is available
if command -v gh > /dev/null 2>&1; then
    echo "🔧 GitHub CLI detected!"
    echo "You can also create the repository using:"
    echo "   gh repo create capacity-model-integration --public --description 'Google Sheets integration for Capacity Model with Cursor' --source=. --remote=origin --push"
    echo ""
fi

echo "✅ Setup script completed successfully!" 