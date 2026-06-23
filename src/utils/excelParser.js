const XLSX = require('xlsx');

const TEMPLATE_COLUMNS = [
  'Business Name',
  'Business Description',
  'Industry',
  'Country',
  'City',
  'Asking Price',
  'Year Established',
  'Number of Employees',
  'Featured (yes/no)',
  'Status (active/sold/draft)',
];

const generateTemplate = () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    TEMPLATE_COLUMNS,
    ['Example Corp', 'A sample business', 'Technology', 'United States', 'New York', 500000, 2015, 50, 'no', 'draft'],
  ]);

  // Set column widths
  ws['!cols'] = TEMPLATE_COLUMNS.map((col) => ({ wch: Math.max(col.length + 4, 18) }));

  XLSX.utils.book_append_sheet(wb, ws, 'Businesses');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

const parseExcelBuffer = (buffer) => {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('Excel file has no sheets');

  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
  return rows.map((row) => ({
    name: String(row['Business Name'] || '').trim(),
    description: String(row['Business Description'] || '').trim(),
    industryName: String(row['Industry'] || '').trim(),
    countryName: String(row['Country'] || '').trim(),
    city: String(row['City'] || '').trim(),
    askingPrice: parseFloat(row['Asking Price']) || 0,
    yearEstablished: parseInt(row['Year Established'], 10) || null,
    numEmployees: parseInt(row['Number of Employees'], 10) || 0,
    isFeatured: String(row['Featured (yes/no)'] || '').toLowerCase() === 'yes',
    status: ['active', 'sold', 'draft'].includes(String(row['Status (active/sold/draft)'] || '').toLowerCase())
      ? String(row['Status (active/sold/draft)']).toLowerCase()
      : 'draft',
  }));
};

module.exports = { generateTemplate, parseExcelBuffer, TEMPLATE_COLUMNS };
