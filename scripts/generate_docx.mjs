import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, TextRun } from "docx";

async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Student Code: QE190151",
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Full Name: Le Nguyen",
                size: 24,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "GitHub Repository URL: https://github.com/your-username/ExpenseTrail",
                size: 24,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Vercel Production URL: https://expensetrail-qe190151.vercel.app",
                size: 24,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Test account email: grader.qe190151@example.com",
                size: 24,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Test account password: Test1234!",
                size: 24,
              }),
            ],
            spacing: { after: 120 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(process.cwd(), "QE190151.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log("Successfully created real Word file:", outputPath);
}

generateDocx().catch(console.error);
