import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Config } from "jest";
import * as path from 'path';
import * as xlsx from 'xlsx';


@Injectable()
export class ReadDataOfStoreBase {
  constructor(private configService: ConfigService) { }

  async execute() {
    const filePath = path.join(this.configService.get<string>('ROOT_PATH') as string,
      this.configService.get<string>('STORE_BASE_NAME') as string);

    // Read XLSX file and transform data to JSON
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    return {
      sheetData
    }
  }

}