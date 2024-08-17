import XLSX from 'xlsx';

interface ReportDto {
  base64File: string;
  fileType: string;
}

export function generateWeatherReport(data: {
  temperature: number;
  humidity: number;
  dateString: string;
}[]) {
    const headers = ['Date', 'Temperature', 'Humidity'];
    const sheetData = data.map(item => [item.dateString, item.temperature, item.humidity]);
    sheetData.unshift(headers);
    const workbook = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Report');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const base64 = buffer.toString('base64');
    const reportDto: ReportDto = {
      base64File: base64,
      fileType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    return reportDto;
}
