import Excel from "exceljs";

interface ReportDto {
  base64File: string;
  fileType: string;
}
interface DataItem {
  [key: string]: string | number | Date;
}

interface ReportJson {
  data: DataItem[];
  heading: string;
  headers: { key: string; value: string }[];
}

export async function reportGenerator(json: ReportJson) {
  try {
    const dataArray = json.data;
    const heading = json.heading;
    const subHeaders = json.headers;

    const allData = dataArray.map((data) => {
      const singleData = subHeaders.map(({ key }) =>
        data[key] ? data[key] : "",
      );
      return singleData;
    });
    const headersRow = subHeaders.map(({ key, value }) => value);
    const workBook = new Excel.Workbook();
    const workSheet = workBook.addWorksheet(heading);
    workSheet.properties.defaultColWidth = 20;
    workSheet.addRow(Array(allData[0].length).fill(heading));
    workSheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "656598" },
      };
      cell.font = {
        name: "Calibri",
        family: 4,
        size: 14,
        bold: true,
        color: { argb: "FFFFFF" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    workSheet.mergeCells(1, 1, 1, allData[0].length);
    workSheet.addRow([]);
    workSheet.mergeCells(2, 1, 2, allData[0].length);
    workSheet.addRow(headersRow);
    workSheet.getRow(3).font = {
      name: "Calibri",
      family: 4,
      size: 12,
      bold: true,
    };
    workSheet.addRows(allData);
    workSheet.addRow([]);

    const base64File = Buffer.from(await workBook.xlsx.writeBuffer()).toString(
      "base64",
    );
    const reportDto: ReportDto = {
      base64File,
      fileType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    return reportDto;
  } catch (err) {
    return err;
  }
}
