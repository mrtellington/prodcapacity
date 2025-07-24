# 🚀 Google Sheets Integration for Capacity Model

A comprehensive integration system that connects your Google Sheets Capacity Model with Cursor for live data access, automation, and insights generation.

## 📋 Overview

This integration provides:
- **Google Apps Script** for processing sales data and generating capacity models
- **Python API** for programmatic access to Google Sheets data
- **CLI Tool** for easy command-line interaction
- **Cursor Integration** for seamless workflow automation
- **Real-time insights** and data analysis capabilities

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Google Sheets │    │   Google Apps    │    │     Cursor      │
│                 │◄──►│     Script       │◄──►│   Integration   │
│ • Sheet1        │    │                  │    │                 │
│ • Matrix        │    │ • Process Data   │    │ • Python API    │
│ • Capacity Rep  │    │ • Apply Logic    │    │ • CLI Tool      │
│   Projection    │    │                  │    │                 │
│ • Capacity      │    │                  │    │ • Summary       │
│   Summary       │    │                  │    │                 │
└─────────────────┘    │ • Generate Model │    │ • Insights      │
                       └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Create OAuth 2.0 credentials
4. Download as `credentials.json` to project root

### 3. Authenticate

```bash
python capacity_cli.py auth
```

### 4. Generate Capacity Model

```bash
# In Google Sheets: Extensions > Apps Script
# Copy the code from google_sheets_integration/apps_script/capacity_model.gs
# Run the createCapacityModel() function
```

### 5. Get Insights

```bash
python capacity_cli.py insights
```

## 📊 Features

### 🔄 Automated Data Processing
- Reads raw sales data from Sheet1
- Applies configurable matrix criteria with sales bands
- Generates structured capacity model projections
- Tracks international projects
- Calculates role-based project counts

### 📈 Advanced Analytics
- Sales performance analysis with role-based projections
- Capacity utilization insights
- Top performer identification
- Project distribution metrics
- International project tracking
- Comprehensive capacity summary dashboard

### 🔧 Flexible Configuration
- Editable matrix criteria with sales bands
- Custom role definitions and thresholds
- Configurable export formats
- Webhook integration support

### 🛠️ Multiple Access Methods
- **Google Apps Script**: Direct spreadsheet manipulation
- **Python API**: Programmatic data access
- **CLI Tool**: Command-line interface
- **Cursor Integration**: IDE-based workflow

## 📁 Project Structure

```
Production Capacity Tracker/
├── google_sheets_integration/
│   ├── apps_script/
│   │   └── capacity_model.gs          # Google Apps Script code
│   └── cursor_integration.py          # Python API
├── capacity_cli.py                    # Command-line interface
├── config.json                        # Configuration settings
├── requirements.txt                   # Python dependencies
├── setup_instructions.md              # Detailed setup guide
└── README.md                          # This file
```

## 🎯 Use Cases

### Sales Management
- Track sales rep performance
- Monitor project distribution
- Identify capacity bottlenecks
- Generate performance reports

### Resource Planning
- Analyze workload distribution
- Plan team capacity
- Optimize resource allocation
- Forecast staffing needs

### Data Analysis
- Export data for external analysis
- Generate automated insights
- Create custom reports
- Integrate with other systems

## 🔧 Configuration

### Matrix Criteria
Edit the Matrix tab in your Google Sheet to customize role definitions:

| Role | Criteria |
|------|----------|
| Admin | admin,management,supervision |
| Production Specialist | production,assembly,manufacturing |
| Sr. Production Specialist | senior,lead,expert,advanced |
| Team Lead | team lead,supervisor,coordinator |

### Export Settings
Configure export options in `config.json`:

```json
{
  "export": {
    "csv_enabled": true,
    "default_filename": "capacity_model_{date}.csv"
  }
}
```

## 🚀 CLI Commands

### Authentication
```bash
python capacity_cli.py auth
```

### Generate Capacity Model
```bash
python capacity_cli.py generate
```

### Export Data
```bash
python capacity_cli.py export
python capacity_cli.py export --output my_data.csv
```

### Get Insights
```bash
python capacity_cli.py insights
```

### View Matrix Criteria
```bash
python capacity_cli.py matrix
```

### Get Capacity Summary
```bash
python capacity_cli.py summary
```

### Update Matrix Criteria
```bash
python capacity_cli.py update-matrix --criteria new_criteria.json
```

### Trigger Webhook
```bash
python capacity_cli.py trigger --webhook-url YOUR_WEBHOOK_URL
```

## 🎯 New Features: Sales Bands & Enhanced Analytics

### Sales Bands in Matrix
The Matrix tab now includes sales bands for each role, allowing you to define:
- **Keywords**: Text-based criteria for role assignment
- **Min Sales ($)**: Minimum sales amount for the role
- **Max Sales ($)**: Maximum sales amount for the role

**Example Matrix Structure:**
| Role | Keywords | Min Sales ($) | Max Sales ($) |
|------|----------|---------------|---------------|
| Admin | admin,management,supervision | 0 | 1,000 |
| Production Specialist | production,assembly,manufacturing | 0 | 5,000 |
| Sr. Production Specialist | senior,lead,expert,advanced | 5,000 | 25,000 |
| Team Lead | team lead,supervisor,coordinator | 25,000 | 999,999,999 |

### Enhanced Tabs
- **Capacity Rep Projection**: Renamed from "Capacity Model" for clarity
- **Capacity Summary**: New comprehensive dashboard with aggregated metrics

## 📊 Data Format

### Capacity Rep Projection Output
| Column | Description |
|--------|-------------|
| Sales Rep First | First name of sales representative |
| Sales Rep Last | Last name of sales representative |
| Sales ($) | Total sales amount |
| Admin Count | Number of admin projects |
| Prod Spec Count | Number of production specialist projects |
| Sr. Prod Count | Number of senior production projects |
| Team Lead Count | Number of team lead projects |
| Intl Project Count | Number of international projects |

### Sample Insights Output
```
📊 Capacity Model Insights:
Total Sales Reps: 15
Total Sales: $2,450,000.00
Average Sales per Rep: $163,333.33
Top Performer: John Smith

Project Distribution:
  Admin: 45
  Prod Spec: 120
  Sr Prod: 30
  Team Lead: 25
  International: 15

Capacity Distribution:
  Admin: 20.5%
  Prod Spec: 54.5%
  Sr Prod: 13.6%
  Team Lead: 11.4%
```

## 🔗 Integration with Cursor

### 1. Add Data Source
1. Open Cursor Settings
2. Go to Integrations
3. Add Google Sheets data source
4. Select your spreadsheet

### 2. Use in Workflows
```python
# Example Cursor workflow
from google_sheets_integration.cursor_integration import GoogleSheetsIntegration

sheets = GoogleSheetsIntegration("YOUR_SPREADSHEET_ID")
sheets.authenticate()

# Get real-time data
capacity_data = sheets.get_capacity_model_data()

# Generate insights
insights = sheets.get_capacity_insights()

# Export for reporting
sheets.export_capacity_model_to_csv()
```

## 🚨 Troubleshooting

### Common Issues

**Authentication Error**
```bash
# Delete existing token and re-authenticate
rm token.pickle
python capacity_cli.py auth
```

**Permission Denied**
- Ensure Google account has edit access to spreadsheet
- Check API credentials are correct
- Verify Google Sheets API is enabled

**Sheet Not Found**
- Verify sheet names match exactly (case-sensitive)
- Check spreadsheet ID is correct
- Ensure sheets exist in the spreadsheet

### Debug Mode
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📞 Support

For issues or questions:
1. Check Google Apps Script logs
2. Verify API credentials and permissions
3. Test with small dataset first
4. Review setup instructions in `setup_instructions.md`

## 🔄 Ongoing Workflow

- **Matrix updates** automatically impact Capacity Model logic
- **Cursor queries** Capacity Model tab directly
- **Automated insights** and triggers supported
- **Real-time synchronization** between Google Sheets and Cursor

## 📈 Future Enhancements

- [ ] Slack integration for notifications
- [ ] Email reporting automation
- [ ] Advanced analytics dashboard
- [ ] Machine learning insights
- [ ] Multi-spreadsheet support
- [ ] Real-time webhook triggers

---

**Ready to get started?** Follow the [setup instructions](setup_instructions.md) for detailed step-by-step guidance. 