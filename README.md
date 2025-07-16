# Omaha Drain Service Technicians KPI Dashboard

A React TypeScript web application that processes Excel files to generate weekly KPI reports for service technicians at Omaha Drain. The dashboard integrates fragmented data across multiple files and calculates 8 specific KPIs for each technician.

## Features

- **Excel File Processing**: Handles 4 different Excel file types with automatic parsing
- **Data Integration**: Joins data across files using Job ID relationships
- **KPI Calculations**: Computes 8 key performance indicators per technician
- **Week-based Filtering**: Filter data by selected week ranges
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Automatic recalculation when week selection changes
- **Error Handling**: Comprehensive validation and error reporting

## KPI Metrics Calculated

1. **Average Ticket Value** - Total revenue ÷ Number of completed jobs
2. **Job Close Rate** - (Jobs Won ÷ Total Opportunities) × 100
3. **Weekly Revenue** - Sum of all revenue for technician
4. **Job Efficiency** - Average of individual job efficiency percentages
5. **Membership Win Rate** - (Memberships Sold ÷ Membership Opportunities) × 100
6. **Hydro Jetting Jobs Sold** - Count of hydro jetting services
7. **Descaling Jobs Sold** - Count of descaling services
8. **Water Heater Jobs Sold** - Count of water heater services

## Required Excel Files

### 1. OpportunitiesReport.xlsx
- **Sheet**: "Opportunities"
- **Purpose**: Sales opportunities and outcomes
- **Key Fields**: Date, Job, Customer, Status, Opportunity Owner, Revenue, Membership data

### 2. LineItemsSoldReport.xlsx
- **Sheet**: "Sold Line Items"
- **Purpose**: Detailed service/product breakdowns
- **Key Fields**: Invoice Date, Job, Opp. Owner, Line Item, Category, Price

### 3. JobTimesReport.xlsx
- **Sheet**: "Job Times"
- **Purpose**: Time efficiency and job completion metrics
- **Key Fields**: First Appointment, Job, Job Status, Opportunity Owner, Job Efficiency

### 4. AppointmentsReport.xlsx
- **Sheet**: "Appointments"
- **Purpose**: Appointment scheduling and completion tracking
- **Key Fields**: Scheduled For, Job, Technician, Appt Status, Revenue

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Excel Processing**: SheetJS (xlsx library)
- **Icons**: Lucide React
- **State Management**: React Context + useReducer
- **File Handling**: HTML5 File API

## Installation

### Prerequisites

- Node.js 18+ and npm

### Setup

1. **Clone or download the project**
   ```bash
   cd KPI_scorecard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - The application will automatically open in your default browser

## Usage

### 1. Upload Excel Files
- Upload all four required Excel files using the drag-and-drop interface
- Each file has a specific upload zone with validation
- Files must be in Excel format (.xlsx or .xls) and under 10MB

### 2. Select Week Range
- Use the week selector to choose the date range for analysis
- Default is current week (Monday to Sunday)
- Navigate between weeks using arrow buttons or date picker

### 3. Process Data
- Click "Process Files" button to analyze the uploaded data
- The system will validate data integrity and calculate KPIs
- Processing time depends on file size and data complexity

### 4. View Results
- **Summary Dashboard**: Overview of all technicians and key metrics
- **Individual Technician Cards**: Expandable cards showing all 8 KPIs
- **Color-coded Performance**: Green (good), Yellow (average), Red (needs improvement)

## Data Processing Pipeline

1. **File Validation**: Check file format, size, and required sheets
2. **Excel Parsing**: Extract data from specified sheets using SheetJS
3. **Data Cleaning**: Normalize dates, parse currency/percentages, clean strings
4. **Data Integration**: Join datasets using Job ID relationships
5. **Week Filtering**: Filter data to selected week range
6. **Technician Grouping**: Group data by technician name
7. **KPI Calculation**: Compute all 8 metrics per technician
8. **Results Display**: Present data in interactive dashboard format

## Error Handling

The application provides comprehensive error handling for:

- **File Upload Errors**: Invalid format, size limits, missing sheets
- **Data Validation Errors**: Missing required fields, invalid data types
- **Processing Errors**: Parsing failures, calculation errors
- **User Feedback**: Clear error messages with suggestions for resolution

## Performance Optimization

- **Chunked Processing**: Large files processed in manageable chunks
- **Caching**: Parsed data cached to avoid re-processing
- **Lazy Loading**: Detailed views loaded on demand
- **Responsive Design**: Optimized for various screen sizes

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The application is ready for deployment to:
- **Vercel**: Connect GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Configure for static site hosting
- **AWS S3**: Upload build files to S3 bucket

### Environment Variables
No environment variables required - the application runs entirely client-side.

## File Structure

```
src/
├── components/
│   ├── FileUploader.tsx      # File upload interface
│   ├── WeekSelector.tsx      # Date range selection
│   ├── TechnicianCard.tsx    # Individual technician display
│   └── KPIMetric.tsx         # Individual KPI display
├── services/
│   ├── fileParser.ts         # Excel file parsing
│   ├── dataIntegrator.ts     # Data joining and filtering
│   └── kpiCalculator.ts      # KPI calculations
├── types/
│   └── index.ts              # TypeScript type definitions
├── utils/
│   ├── dateHelpers.ts        # Date manipulation utilities
│   └── formatters.ts         # Data formatting utilities
├── hooks/
│   └── useAppState.ts        # React context and state management
└── App.tsx                   # Main application component
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

1. **Files not uploading**
   - Ensure files are in Excel format (.xlsx or .xls)
   - Check file size is under 10MB
   - Verify browser supports File API

2. **Processing errors**
   - Check Excel files have required sheet names
   - Ensure required columns are present
   - Verify data format matches expected structure

3. **Performance issues**
   - Large files may take longer to process
   - Consider splitting very large datasets
   - Check browser memory usage

### Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

## License

This project is proprietary software developed for Omaha Drain. All rights reserved.
