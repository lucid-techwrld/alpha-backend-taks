import * as Tesseract from "tesseract.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OcrService {
  async extractText(file: Express.Multer.File) {
    const result = await Tesseract.recognize(file.buffer, "eng", {
      logger: m => console.log(m),
    });

    return result.data.text;
  }
}