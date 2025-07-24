#!/usr/bin/env python3
"""
Google Sheets Integration for Cursor - Capacity Model
Connects to Google Sheets API to read/write capacity model data
"""

import os
import json
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
import pandas as pd
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle

class GoogleSheetsIntegration:
    """Google Sheets integration for Capacity Model"""
    
    def __init__(self, spreadsheet_id: str, credentials_path: str = "credentials.json"):
        """
        Initialize Google Sheets integration
        
        Args:
            spreadsheet_id: The ID of the Google Spreadsheet
            credentials_path: Path to Google API credentials file
        """
        self.spreadsheet_id = spreadsheet_id
        self.credentials_path = credentials_path
        self.service = None
        self.scopes = ['https://www.googleapis.com/auth/spreadsheets']
        
    def authenticate(self) -> bool:
        """Authenticate with Google Sheets API"""
        creds = None
        
        # Load existing credentials
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        
        # If no valid credentials, get new ones
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_path):
                    raise FileNotFoundError(
                        f"Credentials file not found: {self.credentials_path}\n"
                        "Please download credentials.json from Google Cloud Console"
                    )
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, self.scopes)
                creds = flow.run_local_server(port=0)
            
            # Save credentials for next run
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        
        try:
            self.service = build('sheets', 'v4', credentials=creds)
            return True
        except Exception as e:
            print(f"Authentication failed: {e}")
            return False
    
    def read_sheet_data(self, sheet_name: str, range_name: str = None) -> List[List]:
        """
        Read data from a specific sheet
        
        Args:
            sheet_name: Name of the sheet to read
            range_name: Optional range (e.g., 'A1:Z1000')
        
        Returns:
            List of rows from the sheet
        """
        if not self.service:
            raise Exception("Not authenticated. Call authenticate() first.")
        
        range_spec = f"{sheet_name}"
        if range_name:
            range_spec += f"!{range_name}"
        
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=range_spec
            ).execute()
            
            return result.get('values', [])
        except Exception as e:
            print(f"Error reading sheet {sheet_name}: {e}")
            return []
    
    def write_sheet_data(self, sheet_name: str, data: List[List], 
                        range_name: str = None) -> bool:
        """
        Write data to a specific sheet
        
        Args:
            sheet_name: Name of the sheet to write to
            data: Data to write (list of lists)
            range_name: Optional range (e.g., 'A1')
        
        Returns:
            True if successful, False otherwise
        """
        if not self.service:
            raise Exception("Not authenticated. Call authenticate() first.")
        
        range_spec = f"{sheet_name}"
        if range_name:
            range_spec += f"!{range_name}"
        
        try:
            body = {
                'values': data
            }
            
            result = self.service.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range=range_spec,
                valueInputOption='RAW',
                body=body
            ).execute()
            
            print(f"Updated {result.get('updatedCells')} cells")
            return True
        except Exception as e:
            print(f"Error writing to sheet {sheet_name}: {e}")
            return False
    
    def get_capacity_model_data(self) -> pd.DataFrame:
        """
        Get capacity model data as a pandas DataFrame
        
        Returns:
            DataFrame with capacity model data
        """
        data = self.read_sheet_data('Capacity Rep Projection')
        
        if not data:
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame(data[1:], columns=data[0])
        
        # Convert numeric columns
        numeric_columns = ['Sales ($)', 'Admin Count', 'Prod Spec Count', 
                          'Sr. Prod Count', 'Team Lead Count', 'Intl Project Count']
        
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        return df
    
    def get_matrix_criteria(self) -> Dict[str, Dict[str, Any]]:
        """
        Get matrix criteria from Matrix sheet (now includes sales bands)
        
        Returns:
            Dictionary mapping roles to criteria with sales bands
        """
        data = self.read_sheet_data('Matrix')
        
        if not data or len(data) < 2:
            return {}
        
        criteria = {}
        for row in data[1:]:  # Skip header
            if len(row) >= 4 and row[0] and row[1]:
                criteria[row[0]] = {
                    'keywords': row[1],
                    'minSales': float(row[2]) if len(row) > 2 and row[2] else 0,
                    'maxSales': float(row[3]) if len(row) > 3 and row[3] else 999999999
                }
        
        return criteria
    
    def update_matrix_criteria(self, criteria: Dict[str, Dict[str, Any]]) -> bool:
        """
        Update matrix criteria in Matrix sheet (now includes sales bands)
        
        Args:
            criteria: Dictionary mapping roles to criteria with sales bands
        
        Returns:
            True if successful, False otherwise
        """
        data = [['Role', 'Keywords', 'Min Sales ($)', 'Max Sales ($)']]  # Header
        for role, criterion in criteria.items():
            data.append([
                role, 
                criterion.get('keywords', ''),
                criterion.get('minSales', 0),
                criterion.get('maxSales', 999999999)
            ])
        
        return self.write_sheet_data('Matrix', data)
    
    def trigger_capacity_model_generation(self, webhook_url: str) -> bool:
        """
        Trigger capacity model generation via webhook
        
        Args:
            webhook_url: URL of the deployed Apps Script web app
        
        Returns:
            True if successful, False otherwise
        """
        try:
            payload = {
                'action': 'generate_capacity_model',
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(webhook_url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    print("Capacity model generated successfully")
                    return True
                else:
                    print(f"Error: {result.get('message')}")
                    return False
            else:
                print(f"HTTP Error: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Error triggering capacity model generation: {e}")
            return False
    
    def get_sales_data(self) -> pd.DataFrame:
        """
        Get raw sales data from Sheet1
        
        Returns:
            DataFrame with sales data
        """
        data = self.read_sheet_data('Sheet1')
        
        if not data:
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame(data[1:], columns=data[0])
        return df
    
    def export_capacity_model_to_csv(self, filename: str = None) -> str:
        """
        Export capacity model data to CSV
        
        Args:
            filename: Optional filename (default: capacity_model_YYYY-MM-DD.csv)
        
        Returns:
            Path to the exported CSV file
        """
        df = self.get_capacity_model_data()
        
        if df.empty:
            print("No capacity model data to export")
            return ""
        
        if not filename:
            timestamp = datetime.now().strftime("%Y-%m-%d")
            filename = f"capacity_model_{timestamp}.csv"
        
        df.to_csv(filename, index=False)
        print(f"Capacity model exported to {filename}")
        return filename
    
    def get_capacity_insights(self) -> Dict[str, Any]:
        """
        Generate insights from capacity model data
        
        Returns:
            Dictionary with various insights
        """
        df = self.get_capacity_model_data()
        
        if df.empty:
            return {}
        
        insights = {
            'total_sales_reps': len(df),
            'total_sales': df['Sales ($)'].sum(),
            'avg_sales_per_rep': df['Sales ($)'].mean(),
            'top_performer': df.loc[df['Sales ($)'].idxmax()].to_dict() if not df.empty else {},
            'total_projects': {
                'admin': df['Admin Count'].sum(),
                'prod_spec': df['Prod Spec Count'].sum(),
                'sr_prod': df['Sr. Prod Count'].sum(),
                'team_lead': df['Team Lead Count'].sum(),
                'international': df['Intl Project Count'].sum()
            },
            'capacity_distribution': {
                'admin_percentage': (df['Admin Count'].sum() / df[['Admin Count', 'Prod Spec Count', 'Sr. Prod Count', 'Team Lead Count']].sum().sum()) * 100 if df[['Admin Count', 'Prod Spec Count', 'Sr. Prod Count', 'Team Lead Count']].sum().sum() > 0 else 0,
                'prod_spec_percentage': (df['Prod Spec Count'].sum() / df[['Admin Count', 'Prod Spec Count', 'Sr. Prod Count', 'Team Lead Count']].sum().sum()) * 100 if df[['Admin Count', 'Prod Spec Count', 'Sr. Prod Count', 'Team Lead Count']].sum().sum() > 0 else 0,
                'sr_prod_percentage': (df['Sr. Prod Count'].sum() / df[['Admin Count', 'Prod Spec Count', 'Sr. Prod Count', 'Team Lead Count']].sum().sum()) * 100 if df[['Admin Count', 'Prod Spec Count', 'Sr. Prod Count', 'Team Lead Count']].sum().sum() > 0 else 0,
                'team_lead_percentage': (df['Team Lead Count'].sum() / df[['Admin Count', 'Prod Spec Count', 'Sr. Prod Count', 'Team Lead Count']].sum().sum()) * 100 if df[['Admin Count', 'Prod Spec Count', 'Sr. Prod Count', 'Team Lead Count']].sum().sum() > 0 else 0
            }
        }
        
        return insights
    
    def get_capacity_summary_data(self) -> Dict[str, Any]:
        """
        Get capacity summary data from Capacity Summary sheet
        
        Returns:
            Dictionary with summary data
        """
        data = self.read_sheet_data('Capacity Summary')
        
        if not data:
            return {}
        
        summary = {}
        
        # Parse the summary data
        for row in data:
            if len(row) >= 2 and row[0] and row[1]:
                key = row[0].strip()
                value = row[1]
                
                # Convert numeric values
                if key in ['Total Sales Reps', 'Total Projects', 'International Projects']:
                    try:
                        value = int(value)
                    except (ValueError, TypeError):
                        value = 0
                elif key in ['Total Sales', 'Average Sales per Rep', 'Top Performer Sales']:
                    try:
                        value = float(value.replace('$', '').replace(',', ''))
                    except (ValueError, TypeError):
                        value = 0.0
                elif 'Percentage' in key:
                    try:
                        value = float(value.replace('%', ''))
                    except (ValueError, TypeError):
                        value = 0.0
                
                summary[key] = value
        
        return summary

def main():
    """Example usage of the Google Sheets integration"""
    
    # Configuration
    SPREADSHEET_ID = "1fj4rwc3ZMNxBAlXvX-kMLIqcgPvXx79cwpCSH-7SmmU"
    CREDENTIALS_PATH = "credentials.json"
    
    # Initialize integration
    sheets_integration = GoogleSheetsIntegration(SPREADSHEET_ID, CREDENTIALS_PATH)
    
    # Authenticate
    if not sheets_integration.authenticate():
        print("Authentication failed")
        return
    
    print("Successfully authenticated with Google Sheets")
    
    # Get capacity model data
    capacity_df = sheets_integration.get_capacity_model_data()
    if not capacity_df.empty:
        print(f"Retrieved capacity model data for {len(capacity_df)} sales reps")
        print(capacity_df.head())
    
    # Get insights
    insights = sheets_integration.get_capacity_insights()
    if insights:
        print("\nCapacity Model Insights:")
        print(f"Total Sales Reps: {insights['total_sales_reps']}")
        print(f"Total Sales: ${insights['total_sales']:,.2f}")
        print(f"Average Sales per Rep: ${insights['avg_sales_per_rep']:,.2f}")
        print(f"Top Performer: {insights['top_performer'].get('Sales Rep First', '')} {insights['top_performer'].get('Sales Rep Last', '')}")
        
        print("\nProject Distribution:")
        for project_type, count in insights['total_projects'].items():
            print(f"  {project_type.replace('_', ' ').title()}: {count}")
    
    # Export to CSV
    csv_file = sheets_integration.export_capacity_model_to_csv()
    if csv_file:
        print(f"\nExported to: {csv_file}")

if __name__ == "__main__":
    main() 