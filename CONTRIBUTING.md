# Contributing to Capacity Model Integration

Thank you for your interest in contributing to the Capacity Model Integration project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Python 3.7 or higher
- Git
- Google Cloud Console access (for testing)

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/capacity-model-integration.git
   cd capacity-model-integration
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # For development dependencies
   ```

4. **Set up pre-commit hooks**
   ```bash
   pre-commit install
   ```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=google_sheets_integration --cov-report=html

# Run specific test file
pytest tests/test_integration.py

# Run with verbose output
pytest -v
```

### Test Structure
- `tests/test_integration.py` - Main integration tests
- `tests/test_apps_script.py` - Google Apps Script tests
- `tests/test_cli.py` - CLI tool tests

## 📝 Code Style

### Python Code Style
We use:
- **Black** for code formatting
- **isort** for import sorting
- **flake8** for linting

### Running Code Quality Checks
```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8 .

# Run all checks
pre-commit run --all-files
```

### Code Style Guidelines
- Follow PEP 8 style guide
- Use type hints where appropriate
- Write docstrings for all functions and classes
- Keep functions small and focused
- Use meaningful variable and function names

## 🔧 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write your code
- Add tests for new functionality
- Update documentation if needed

### 3. Test Your Changes
```bash
# Run tests
pytest

# Run linting
flake8 .

# Run formatting
black .
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No sensitive data is committed

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No sensitive data included
```

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Search for similar problems
3. Try to reproduce the issue

### Bug Report Template
Use the GitHub issue template for bug reports, including:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment information
- Error logs

## 💡 Feature Requests

### Before Requesting
1. Check if the feature already exists
2. Consider if it fits the project scope
3. Think about implementation complexity

### Feature Request Template
Use the GitHub issue template for feature requests, including:
- Problem description
- Proposed solution
- Use cases
- Implementation considerations

## 🔐 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security issues to: security@productioncapacity.com
- Include detailed information about the vulnerability

### Security Guidelines
- Never commit credentials or sensitive data
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security guidelines

## 📚 Documentation

### Documentation Standards
- Keep documentation up to date
- Use clear, concise language
- Include code examples
- Update README.md for major changes

### Documentation Structure
- `README.md` - Project overview and quick start
- `setup_instructions.md` - Detailed setup guide
- `CONTRIBUTING.md` - This file
- `docs/` - Additional documentation

## 🏷️ Versioning

### Semantic Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Process
1. Update version in `pyproject.toml`
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to PyPI (if applicable)

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow project guidelines

### Communication
- Use GitHub issues for discussions
- Be clear and specific
- Provide context for questions
- Respond to feedback promptly

## 📞 Getting Help

### Resources
- [GitHub Issues](https://github.com/yourusername/capacity-model-integration/issues)
- [Documentation](https://github.com/yourusername/capacity-model-integration#readme)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)

### Questions
- Check existing issues first
- Use GitHub Discussions for questions
- Provide minimal reproducible examples
- Include relevant error messages

## 🎉 Recognition

### Contributors
- All contributors will be listed in the README
- Significant contributions will be highlighted
- Contributors will be added to the project team

### Acknowledgment
Thank you for contributing to the Capacity Model Integration project! Your contributions help make this tool better for everyone.

---

**Happy coding! 🚀** 