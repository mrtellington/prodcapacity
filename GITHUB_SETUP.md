# 🚀 GitHub Repository Setup Guide

This guide will help you set up the GitHub repository for your Capacity Model Integration project.

## 📋 Prerequisites

- GitHub account: `mrtellington`
- Git configured with your credentials
- All project files committed locally

## 🔧 Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface (Recommended)

1. **Go to GitHub**: Visit https://github.com/new
2. **Repository Settings**:
   - **Repository name**: `capacity-model-integration`
   - **Description**: `Google Sheets integration for Capacity Model with Cursor`
   - **Visibility**: Public (or Private if you prefer)
   - **DO NOT** check "Add a README file"
   - **DO NOT** check "Add .gitignore"
   - **DO NOT** check "Choose a license"
3. **Click "Create repository"**

### Option B: Using GitHub CLI (if available)

```bash
gh repo create capacity-model-integration \
  --public \
  --description "Google Sheets integration for Capacity Model with Cursor" \
  --source=. \
  --remote=origin \
  --push
```

## 📤 Step 2: Push Code to GitHub

Once you've created the repository, run the push script:

```bash
./push_to_github.sh
```

This script will:
- Add the remote origin
- Set the main branch
- Push all your code to GitHub

## ⚙️ Step 3: Configure Repository Settings

### 3.1 Enable Features
1. Go to your repository: https://github.com/mrtellington/capacity-model-integration
2. Click **Settings** tab
3. Scroll down to **Features** section
4. Enable:
   - ✅ **Issues**
   - ✅ **Discussions**
   - ✅ **Wiki**
   - ✅ **Projects**

### 3.2 Set up Branch Protection
1. Go to **Settings** > **Branches**
2. Click **Add rule**
3. **Branch name pattern**: `main`
4. Enable:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
5. Click **Create**

### 3.3 Set up GitHub Pages (Optional)
1. Go to **Settings** > **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main`
4. **Folder**: `/ (root)`
5. Click **Save**

## 🔐 Step 4: Set up Google Cloud Credentials

### 4.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API:
   - Go to **APIs & Services** > **Library**
   - Search for "Google Sheets API"
   - Click **Enable**

### 4.2 Create Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. **Application type**: Desktop application
4. **Name**: `Capacity Model Integration`
5. Click **Create**
6. Download the credentials file
7. Rename to `credentials.json`
8. Place in your project root directory

## 🧪 Step 5: Test the Integration

### 5.1 Install Dependencies
```bash
pip install -r requirements.txt
pip install pytest pytest-cov flake8 black isort
```

### 5.2 Run Tests
```bash
pytest
```

### 5.3 Test Authentication
```bash
python capacity_cli.py auth
```

## 📊 Step 6: Set up Google Apps Script

### 6.1 Add Apps Script to Your Spreadsheet
1. Open your Google Spreadsheet: [Sales data - 7.1.24 - 6.30.25](https://docs.google.com/spreadsheets/d/1fj4rwc3ZMNxBAlXvX-kMLIqcgPvXx79cwpCSH-7SmmU/edit?gid=0#gid=0)
2. Go to **Extensions** > **Apps Script**
3. Replace the default code with the contents of `google_sheets_integration/apps_script/capacity_model.gs`
4. Save the script as "Capacity Model Script"
5. Run the `createCapacityModel()` function

### 6.2 Deploy as Web App (Optional)
1. Click **Deploy** > **New deployment**
2. Choose **Web app**
3. Set access to **Anyone with the link**
4. Copy the Web App URL
5. Update `config.json` with the webhook URL

## 🔄 Step 7: Verify Everything Works

### 7.1 Test CLI Commands
```bash
# Get insights
python capacity_cli.py insights

# Export data
python capacity_cli.py export

# View matrix criteria
python capacity_cli.py matrix
```

### 7.2 Check GitHub Actions
1. Go to your repository
2. Click **Actions** tab
3. Verify that the CI/CD pipeline is running

## 📚 Step 8: Documentation and Links

### Repository Links
- **Main Repository**: https://github.com/mrtellington/capacity-model-integration
- **Issues**: https://github.com/mrtellington/capacity-model-integration/issues
- **Actions**: https://github.com/mrtellington/capacity-model-integration/actions
- **Wiki**: https://github.com/mrtellington/capacity-model-integration/wiki

### Documentation Files
- `README.md` - Project overview and quick start
- `setup_instructions.md` - Detailed setup guide
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history

## 🎯 Next Steps

### Immediate Actions
1. ✅ Create GitHub repository
2. ✅ Push code to GitHub
3. ✅ Set up Google Cloud credentials
4. ✅ Configure repository settings
5. ✅ Test the integration

### Ongoing Development
1. **Set up development workflow**:
   - Create feature branches for new work
   - Use pull requests for code review
   - Follow the contributing guidelines

2. **Monitor and maintain**:
   - Check GitHub Actions for test results
   - Review and respond to issues
   - Update documentation as needed

3. **Scale and improve**:
   - Add new features based on requirements
   - Optimize performance
   - Enhance security

## 🆘 Troubleshooting

### Common Issues

**Authentication Problems**
```bash
# Delete existing token and re-authenticate
rm token.pickle
python capacity_cli.py auth
```

**Git Push Issues**
```bash
# Check remote configuration
git remote -v

# Re-add remote if needed
git remote remove origin
git remote add origin https://github.com/mrtellington/capacity-model-integration.git
```

**Test Failures**
```bash
# Run tests with verbose output
pytest -v

# Check specific test file
pytest tests/test_integration.py -v
```

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the documentation files
3. Create an issue on GitHub
4. Contact: tod.ellington@whitestonebranding.com

---

**🎉 Congratulations! Your Capacity Model Integration is now fully set up on GitHub!**

The repository is ready for development, collaboration, and deployment. All the automation, testing, and documentation are in place for a professional development workflow. 