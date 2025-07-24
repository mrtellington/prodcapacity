#!/usr/bin/env python3
"""
Capacity Model CLI Tool
Command-line interface for Google Sheets Capacity Model integration
"""

import argparse
import json
import sys
from datetime import datetime
from google_sheets_integration.cursor_integration import GoogleSheetsIntegration

def load_config():
    """Load configuration from config.json"""
    try:
        with open('config.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: config.json not found. Please ensure it exists in the project root.")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Capacity Model CLI Tool')
    parser.add_argument('command', choices=[
        'auth', 'generate', 'export', 'insights', 'matrix', 'update-matrix', 'trigger'
    ], help='Command to execute')
    parser.add_argument('--output', '-o', help='Output file for export')
    parser.add_argument('--webhook-url', help='Webhook URL for triggering updates')
    parser.add_argument('--criteria', help='Matrix criteria file (JSON)')
    
    args = parser.parse_args()
    config = load_config()
    
    # Initialize integration
    sheets = GoogleSheetsIntegration(
        config['spreadsheet_id'],
        'credentials.json'
    )
    
    try:
        if args.command == 'auth':
            print("Authenticating with Google Sheets...")
            if sheets.authenticate():
                print("✅ Authentication successful!")
            else:
                print("❌ Authentication failed!")
                sys.exit(1)
        
        elif args.command == 'generate':
            print("Generating capacity model...")
            # Ensure authentication
            if not sheets.service:
                print("Authenticating...")
                if not sheets.authenticate():
                    print("❌ Authentication failed!")
                    sys.exit(1)
            
            # This would trigger the Apps Script to generate the model
            # For now, we'll just read the existing data
            capacity_data = sheets.get_capacity_model_data()
            if not capacity_data.empty:
                print(f"✅ Capacity model data retrieved: {len(capacity_data)} sales reps")
                print(capacity_data.head())
            else:
                print("⚠️  No capacity model data found. Run the Apps Script in Google Sheets first.")
        
        elif args.command == 'export':
            print("Exporting capacity model...")
            # Ensure authentication
            if not sheets.service:
                print("Authenticating...")
                if not sheets.authenticate():
                    print("❌ Authentication failed!")
                    sys.exit(1)
            
            filename = args.output or f"capacity_model_{datetime.now().strftime('%Y-%m-%d_%H-%M')}.csv"
            csv_file = sheets.export_capacity_model_to_csv(filename)
            if csv_file:
                print(f"✅ Exported to: {csv_file}")
            else:
                print("❌ Export failed!")
        
        elif args.command == 'insights':
            print("Generating insights...")
            # Ensure authentication
            if not sheets.service:
                print("Authenticating...")
                if not sheets.authenticate():
                    print("❌ Authentication failed!")
                    sys.exit(1)
            
            insights = sheets.get_capacity_insights()
            if insights:
                print("\n📊 Capacity Model Insights:")
                print(f"Total Sales Reps: {insights['total_sales_reps']}")
                print(f"Total Sales: ${insights['total_sales']:,.2f}")
                print(f"Average Sales per Rep: ${insights['avg_sales_per_rep']:,.2f}")
                
                if insights['top_performer']:
                    top = insights['top_performer']
                    print(f"Top Performer: {top.get('Sales Rep First', '')} {top.get('Sales Rep Last', '')}")
                
                print("\nProject Distribution:")
                for project_type, count in insights['total_projects'].items():
                    print(f"  {project_type.replace('_', ' ').title()}: {count}")
                
                print("\nCapacity Distribution:")
                for role, percentage in insights['capacity_distribution'].items():
                    print(f"  {role.replace('_', ' ').title()}: {percentage:.1f}%")
            else:
                print("❌ No insights available. Generate capacity model first.")
        
        elif args.command == 'matrix':
            print("Retrieving matrix criteria...")
            # Ensure authentication
            if not sheets.service:
                print("Authenticating...")
                if not sheets.authenticate():
                    print("❌ Authentication failed!")
                    sys.exit(1)
            
            criteria = sheets.get_matrix_criteria()
            if criteria:
                print("\n📋 Matrix Criteria:")
                for role, criterion in criteria.items():
                    print(f"  {role}: {criterion}")
            else:
                print("❌ No matrix criteria found.")
        
        elif args.command == 'update-matrix':
            print("Updating matrix criteria...")
            # Ensure authentication
            if not sheets.service:
                print("Authenticating...")
                if not sheets.authenticate():
                    print("❌ Authentication failed!")
                    sys.exit(1)
            
            if args.criteria:
                try:
                    with open(args.criteria, 'r') as f:
                        new_criteria = json.load(f)
                    
                    if sheets.update_matrix_criteria(new_criteria):
                        print("✅ Matrix criteria updated successfully!")
                    else:
                        print("❌ Failed to update matrix criteria!")
                except FileNotFoundError:
                    print(f"❌ Criteria file not found: {args.criteria}")
                except json.JSONDecodeError:
                    print("❌ Invalid JSON in criteria file")
            else:
                print("❌ Please provide a criteria file with --criteria")
        
        elif args.command == 'trigger':
            if not args.webhook_url:
                print("❌ Please provide webhook URL with --webhook-url")
                sys.exit(1)
            
            print("Triggering capacity model generation...")
            if sheets.trigger_capacity_model_generation(args.webhook_url):
                print("✅ Capacity model generation triggered successfully!")
            else:
                print("❌ Failed to trigger capacity model generation!")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 