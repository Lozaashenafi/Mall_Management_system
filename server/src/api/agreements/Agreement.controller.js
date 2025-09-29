import { PrismaClient } from "@prisma/client";
import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";
import { createAuditLog } from "../../utils/audit.js";
const prisma = new PrismaClient();

export const generateAgreement = async (req, res) => {
  try {
    const { rentId } = req.params;

    const rental = await prisma.rental.findUnique({
      where: { rentId: Number(rentId) },
      include: {
        tenant: true,
        room: { include: { roomType: true } },
      },
    });

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const { tenant, room } = rental;

    // Create a realistic agreement doc
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "MALL RENTAL AGREEMENT",
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: "center",
            }),
            new Paragraph(
              "\nThis Rental Agreement (“Agreement”) is entered into on this ___ day of __________, 20__, between:"
            ),
            new Paragraph(
              `Lessor (Mall Management): ____________________________`
            ),
            new Paragraph(
              `Lessee (Tenant): ${tenant.companyName}, represented by ${tenant.contactPerson}`
            ),
            new Paragraph(
              `Premises: Unit ${room.unitNumber}, Floor ${room.floor}, ${room.size} sqm`
            ),
            new Paragraph("\n\n"),
            new Paragraph({ text: "1. Term", bold: true }),
            new Paragraph(
              `The lease shall commence on ${rental.startDate.toDateString()} and expire on ${rental.endDate.toDateString()} unless renewed or terminated earlier according to this Agreement.`
            ),
            new Paragraph({ text: "2. Rent & Payment", bold: true }),
            new Paragraph(
              `The Tenant agrees to pay the Lessor a rent of $${rental.rentAmount.toFixed(
                2
              )} per ${
                rental.paymentInterval
              }. Rent is payable in advance on or before the ${
                rental.paymentDueDate
              } day of each period.`
            ),
            new Paragraph(
              `A security deposit equivalent to one month’s rent shall be paid upon signing.`
            ),
            new Paragraph({ text: "3. Use of Premises", bold: true }),
            new Paragraph(
              `The Tenant shall use the premises solely for operating a retail/commercial business.`
            ),
            new Paragraph({
              text: "4. Common Area Charges & Utilities",
              bold: true,
            }),
            new Paragraph(
              `The Tenant shall contribute to the cost of maintenance, cleaning, lighting, and security of common areas.`
            ),
            new Paragraph({ text: "5. Maintenance & Repairs", bold: true }),
            new Paragraph(
              `The Lessor maintains structure & common areas. Tenant maintains the interior.`
            ),
            new Paragraph({
              text: "6. Alterations & Improvements",
              bold: true,
            }),
            new Paragraph(
              `Tenant shall not alter without written consent. Improvements remain with Lessor.`
            ),
            new Paragraph({ text: "7. Insurance & Liability", bold: true }),
            new Paragraph(
              `Tenant must maintain liability insurance. Lessor not liable for loss unless due to negligence.`
            ),
            new Paragraph({ text: "8. Default & Termination", bold: true }),
            new Paragraph(
              `Failure to pay rent or comply with this Agreement constitutes default. Lessor may terminate with 30 days’ notice.`
            ),
            new Paragraph({ text: "9. Renewal & Expiry", bold: true }),
            new Paragraph(
              `Tenant may request renewal, subject to approval and new rent rates.`
            ),
            new Paragraph({ text: "10. Governing Law", bold: true }),
            new Paragraph(
              `This Agreement shall be governed by the laws of ____________________.`
            ),
            new Paragraph("\n\n"),
            new Paragraph(
              "IN WITNESS WHEREOF, the parties hereto have executed this Agreement:"
            ),
            new Paragraph("\n\n"),
            new Paragraph(
              "Lessor/Management: ____________________________    Date: __________"
            ),
            new Paragraph(
              "Lessee/Tenant: _______________________________    Date: __________"
            ),
            new Paragraph(
              "Witness: ____________________________    Date: __________"
            ),
          ],
        },
      ],
    });

    // Save temp file
    const buffer = await Packer.toBuffer(doc);
    const fileName = `Rental_Agreement_${rental.rentId}.docx`;
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "agreements",
      fileName
    );

    // Ensure directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);

    // Save record in DB
    const agreementRecord = await prisma.agreementDocument.create({
      data: {
        rentId: rental.rentId,
        filePath,
        generatedBy: req.user?.userId || null,
      },
    });

    // ✅ Create audit log for agreement generation
    await createAuditLog({
      userId: req.user?.userId || null,
      action: "Created",
      tableName: "AgreementDocument",
      recordId: agreementRecord.documentId,
      newValue: agreementRecord,
    });
    // Send file for download
    res.download(filePath, fileName);
  } catch (err) {
    console.error("Agreement generation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
