#!/usr/bin/env python3
"""
Secure GitHub Repository Creation Script
Creates the capacity-model-integration repository using GitHub API
"""

import requests
import json
import getpass
import sys
import subprocess

def create_github_repo():
    """Create GitHub repository using API"""
    
    print("🚀 Creating GitHub Repository for Capacity Model Integration")
    print("=" * 60)
    
    # Get GitHub credentials securely
    username = "mrtellington"
    print(f"Username: {username}")
    
    # Use provided password
    password = "hBo5xc4Xd??H8&H@"
    
    # Repository configuration
    repo_config = {
        "name": "capacity-model-integration",
        "description": "Google Sheets integration for Capacity Model with Cursor",
        "private": False,
        "auto_init": False,
        "has_issues": True,
        "has_wiki": True,
        "has_downloads": True
    }
    
    # GitHub API endpoint
    url = "https://api.github.com/user/repos"
    
    try:
        print("📡 Creating repository...")
        response = requests.post(
            url,
            auth=(username, password),
            headers={"Accept": "application/vnd.github.v3+json"},
            data=json.dumps(repo_config)
        )
        
        if response.status_code == 201:
            repo_data = response.json()
            print("✅ Repository created successfully!")
            print(f"📋 Repository URL: {repo_data['html_url']}")
            print(f"🔗 Clone URL: {repo_data['clone_url']}")
            
            # Add remote and push
            print("\n📤 Setting up remote and pushing code...")
            
            # Add remote origin
            subprocess.run([
                "git", "remote", "add", "origin", 
                f"https://github.com/{username}/capacity-model-integration.git"
            ], check=True)
            
            # Set main branch
            subprocess.run(["git", "branch", "-M", "main"], check=True)
            
            # Push to GitHub
            subprocess.run([
                "git", "push", "-u", "origin", "main"
            ], check=True)
            
            print("✅ Code pushed to GitHub successfully!")
            print(f"\n🎉 Repository is live at: {repo_data['html_url']}")
            
            return True
            
        else:
            print(f"❌ Failed to create repository. Status: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Git command error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main function"""
    print("GitHub Repository Creation Tool")
    print("=" * 40)
    
    # Check if we're in a git repository
    try:
        subprocess.run(["git", "rev-parse", "--git-dir"], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("❌ Not in a git repository. Please run this from your project directory.")
        sys.exit(1)
    
    # Check if we have commits
    try:
        result = subprocess.run(["git", "log", "--oneline", "-1"], 
                              check=True, capture_output=True, text=True)
        if not result.stdout.strip():
            print("❌ No commits found. Please commit your changes first.")
            sys.exit(1)
    except subprocess.CalledProcessError:
        print("❌ No commits found. Please commit your changes first.")
        sys.exit(1)
    
    print("✅ Git repository and commits verified")
    
    # Create repository
    if create_github_repo():
        print("\n🎉 Setup complete! Your repository is ready.")
        print("\n📚 Next steps:")
        print("1. Visit your repository on GitHub")
        print("2. Set up branch protection rules")
        print("3. Configure repository settings")
        print("4. Set up Google Cloud credentials")
        print("5. Test the integration")
    else:
        print("\n❌ Setup failed. Please try the manual process.")
        print("See GITHUB_SETUP.md for manual instructions.")

if __name__ == "__main__":
    main() 