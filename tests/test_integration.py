"""
Unit tests for Google Sheets integration
"""

import pytest
import pandas as pd
from unittest.mock import Mock, patch, MagicMock
from google_sheets_integration.cursor_integration import GoogleSheetsIntegration


class TestGoogleSheetsIntegration:
    """Test cases for GoogleSheetsIntegration class"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.spreadsheet_id = "test-spreadsheet-id"
        self.credentials_path = "test-credentials.json"
        self.integration = GoogleSheetsIntegration(self.spreadsheet_id, self.credentials_path)
    
    @patch('google_sheets_integration.cursor_integration.build')
    @patch('google_sheets_integration.cursor_integration.InstalledAppFlow')
    @patch('google_sheets_integration.cursor_integration.pickle.load')
    @patch('builtins.open')
    def test_authenticate_success(self, mock_open, mock_pickle_load, mock_flow, mock_build):
        """Test successful authentication"""
        # Mock existing credentials
        mock_creds = Mock()
        mock_creds.valid = True
        mock_pickle_load.return_value = mock_creds
        
        # Mock service build
        mock_service = Mock()
        mock_build.return_value = mock_service
        
        result = self.integration.authenticate()
        
        assert result is True
        assert self.integration.service == mock_service
    
    @patch('google_sheets_integration.cursor_integration.build')
    @patch('google_sheets_integration.cursor_integration.InstalledAppFlow')
    @patch('builtins.open')
    def test_authenticate_failure(self, mock_open, mock_flow, mock_build):
        """Test authentication failure"""
        mock_build.side_effect = Exception("Authentication failed")
        
        result = self.integration.authenticate()
        
        assert result is False
    
    def test_read_sheet_data_not_authenticated(self):
        """Test reading sheet data without authentication"""
        with pytest.raises(Exception, match="Not authenticated"):
            self.integration.read_sheet_data("Sheet1")
    
    @patch.object(GoogleSheetsIntegration, 'service')
    def test_read_sheet_data_success(self, mock_service):
        """Test successful sheet data reading"""
        # Mock service
        mock_service_instance = Mock()
        mock_service_instance.spreadsheets.return_value.values.return_value.get.return_value.execute.return_value = {
            'values': [['Header1', 'Header2'], ['Value1', 'Value2']]
        }
        self.integration.service = mock_service_instance
        
        result = self.integration.read_sheet_data("Sheet1")
        
        assert result == [['Header1', 'Header2'], ['Value1', 'Value2']]
    
    @patch.object(GoogleSheetsIntegration, 'service')
    def test_read_sheet_data_error(self, mock_service):
        """Test sheet data reading error"""
        # Mock service with error
        mock_service_instance = Mock()
        mock_service_instance.spreadsheets.return_value.values.return_value.get.return_value.execute.side_effect = Exception("API Error")
        self.integration.service = mock_service_instance
        
        result = self.integration.read_sheet_data("Sheet1")
        
        assert result == []
    
    @patch.object(GoogleSheetsIntegration, 'service')
    def test_write_sheet_data_success(self, mock_service):
        """Test successful sheet data writing"""
        # Mock service
        mock_service_instance = Mock()
        mock_service_instance.spreadsheets.return_value.values.return_value.update.return_value.execute.return_value = {
            'updatedCells': 4
        }
        self.integration.service = mock_service_instance
        
        data = [['Header1', 'Header2'], ['Value1', 'Value2']]
        result = self.integration.write_sheet_data("Sheet1", data)
        
        assert result is True
    
    @patch.object(GoogleSheetsIntegration, 'service')
    def test_write_sheet_data_error(self, mock_service):
        """Test sheet data writing error"""
        # Mock service with error
        mock_service_instance = Mock()
        mock_service_instance.spreadsheets.return_value.values.return_value.update.return_value.execute.side_effect = Exception("API Error")
        self.integration.service = mock_service_instance
        
        data = [['Header1', 'Header2'], ['Value1', 'Value2']]
        result = self.integration.write_sheet_data("Sheet1", data)
        
        assert result is False
    
    @patch.object(GoogleSheetsIntegration, 'read_sheet_data')
    def test_get_capacity_model_data(self, mock_read_data):
        """Test getting capacity model data"""
        mock_read_data.return_value = [
            ['Sales Rep First', 'Sales Rep Last', 'Sales ($)', 'Admin Count'],
            ['John', 'Doe', '1000', '2'],
            ['Jane', 'Smith', '2000', '1']
        ]
        
        result = self.integration.get_capacity_model_data()
        
        assert isinstance(result, pd.DataFrame)
        assert len(result) == 2
        assert 'Sales Rep First' in result.columns
    
    @patch.object(GoogleSheetsIntegration, 'read_sheet_data')
    def test_get_matrix_criteria(self, mock_read_data):
        """Test getting matrix criteria"""
        mock_read_data.return_value = [
            ['Role', 'Criteria'],
            ['Admin', 'admin,management'],
            ['Production Specialist', 'production,assembly']
        ]
        
        result = self.integration.get_matrix_criteria()
        
        expected = {
            'Admin': 'admin,management',
            'Production Specialist': 'production,assembly'
        }
        assert result == expected
    
    @patch.object(GoogleSheetsIntegration, 'write_sheet_data')
    def test_update_matrix_criteria(self, mock_write_data):
        """Test updating matrix criteria"""
        mock_write_data.return_value = True
        
        criteria = {
            'Admin': 'admin,management',
            'Production Specialist': 'production,assembly'
        }
        
        result = self.integration.update_matrix_criteria(criteria)
        
        assert result is True
        mock_write_data.assert_called_once()
    
    @patch('requests.post')
    def test_trigger_capacity_model_generation_success(self, mock_post):
        """Test successful webhook triggering"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'status': 'success'}
        mock_post.return_value = mock_response
        
        result = self.integration.trigger_capacity_model_generation("http://test-webhook.com")
        
        assert result is True
    
    @patch('requests.post')
    def test_trigger_capacity_model_generation_failure(self, mock_post):
        """Test webhook triggering failure"""
        mock_response = Mock()
        mock_response.status_code = 500
        mock_post.return_value = mock_response
        
        result = self.integration.trigger_capacity_model_generation("http://test-webhook.com")
        
        assert result is False
    
    @patch.object(GoogleSheetsIntegration, 'get_capacity_model_data')
    def test_get_capacity_insights(self, mock_get_data):
        """Test getting capacity insights"""
        # Mock DataFrame
        mock_df = pd.DataFrame({
            'Sales Rep First': ['John', 'Jane'],
            'Sales Rep Last': ['Doe', 'Smith'],
            'Sales ($)': [1000, 2000],
            'Admin Count': [2, 1],
            'Prod Spec Count': [3, 4],
            'Sr. Prod Count': [1, 2],
            'Team Lead Count': [1, 1],
            'Intl Project Count': [1, 0]
        })
        mock_get_data.return_value = mock_df
        
        result = self.integration.get_capacity_insights()
        
        assert 'total_sales_reps' in result
        assert 'total_sales' in result
        assert 'avg_sales_per_rep' in result
        assert result['total_sales_reps'] == 2
        assert result['total_sales'] == 3000
    
    @patch.object(GoogleSheetsIntegration, 'get_capacity_model_data')
    def test_get_capacity_insights_empty_data(self, mock_get_data):
        """Test getting insights with empty data"""
        mock_get_data.return_value = pd.DataFrame()
        
        result = self.integration.get_capacity_insights()
        
        assert result == {}


class TestMatrixAnalysis:
    """Test cases for matrix analysis functionality"""
    
    def test_analyze_project_matrix_admin(self):
        """Test matrix analysis for admin projects"""
        from google_sheets_integration.apps_script.capacity_model import analyzeProjectMatrix
        
        project_info = "This is an admin management project"
        matrix_criteria = {
            'Admin': 'admin,management',
            'Production Specialist': 'production,assembly'
        }
        
        result = analyzeProjectMatrix(project_info, matrix_criteria)
        
        assert result == 'Admin'
    
    def test_analyze_project_matrix_production(self):
        """Test matrix analysis for production projects"""
        from google_sheets_integration.apps_script.capacity_model import analyzeProjectMatrix
        
        project_info = "This is a production assembly project"
        matrix_criteria = {
            'Admin': 'admin,management',
            'Production Specialist': 'production,assembly'
        }
        
        result = analyzeProjectMatrix(project_info, matrix_criteria)
        
        assert result == 'Production Specialist'
    
    def test_analyze_project_matrix_default(self):
        """Test matrix analysis default fallback"""
        from google_sheets_integration.apps_script.capacity_model import analyzeProjectMatrix
        
        project_info = "This is an unknown project type"
        matrix_criteria = {
            'Admin': 'admin,management',
            'Production Specialist': 'production,assembly'
        }
        
        result = analyzeProjectMatrix(project_info, matrix_criteria)
        
        assert result == 'Production Specialist'  # Default fallback


if __name__ == "__main__":
    pytest.main([__file__]) 