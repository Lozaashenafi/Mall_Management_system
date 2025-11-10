// pdfGenerator.utility.js
import ejs from "ejs";
import fs from "fs-extra";
import path from "path";
import puppeteer from "puppeteer";

const TEMPLATE_PATH = path.resolve("templates/utilityInvoice.ejs");
const OUTPUT_DIR = path.resolve("uploads/utilityInvoices");

export async function generateUtilityInvoicePdf(invoice) {
  await fs.ensureDir(OUTPUT_DIR);

  const html = await ejs.renderFile(TEMPLATE_PATH, { invoice });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const fileName = `utility-invoice-${invoice.id}.pdf`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return `/uploads/utilityInvoices/${fileName}`; // relative path for client access
}
