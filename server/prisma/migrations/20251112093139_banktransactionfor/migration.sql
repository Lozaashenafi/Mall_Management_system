/*
  Warnings:

  - You are about to drop the column `attachment` on the `banktransaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `AgreementDocument_rentId_fkey` ON `agreementdocument`;

-- DropIndex
DROP INDEX `AuditLog_userId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `BankTransaction_bankAccountId_fkey` ON `banktransaction`;

-- DropIndex
DROP INDEX `BankTransaction_paymentId_fkey` ON `banktransaction`;

-- DropIndex
DROP INDEX `Budget_catagoryId_fkey` ON `budget`;

-- DropIndex
DROP INDEX `Feedback_tenantId_fkey` ON `feedback`;

-- DropIndex
DROP INDEX `Invoice_rentId_fkey` ON `invoice`;

-- DropIndex
DROP INDEX `Maintenance_recordedBy_fkey` ON `maintenance`;

-- DropIndex
DROP INDEX `Maintenance_roomId_fkey` ON `maintenance`;

-- DropIndex
DROP INDEX `MaintenanceRequest_rentId_fkey` ON `maintenancerequest`;

-- DropIndex
DROP INDEX `Notification_tenantId_fkey` ON `notification`;

-- DropIndex
DROP INDEX `Notification_userId_fkey` ON `notification`;

-- DropIndex
DROP INDEX `Payment_invoiceId_fkey` ON `payment`;

-- DropIndex
DROP INDEX `Payment_utilityInvoiceId_fkey` ON `payment`;

-- DropIndex
DROP INDEX `PaymentRequest_invoiceId_fkey` ON `paymentrequest`;

-- DropIndex
DROP INDEX `PaymentRequest_tenantId_fkey` ON `paymentrequest`;

-- DropIndex
DROP INDEX `PaymentRequest_utilityInvoiceId_fkey` ON `paymentrequest`;

-- DropIndex
DROP INDEX `Rental_roomId_fkey` ON `rental`;

-- DropIndex
DROP INDEX `Rental_tenantId_fkey` ON `rental`;

-- DropIndex
DROP INDEX `Room_roomTypeId_fkey` ON `room`;

-- DropIndex
DROP INDEX `RoomFeature_featureTypeId_fkey` ON `roomfeature`;

-- DropIndex
DROP INDEX `Tenant_userId_fkey` ON `tenant`;

-- DropIndex
DROP INDEX `TerminateRequest_rentId_fkey` ON `terminaterequest`;

-- DropIndex
DROP INDEX `UtilityCharge_utilityTypeId_fkey` ON `utilitycharge`;

-- DropIndex
DROP INDEX `UtilityExpense_createdBy_fkey` ON `utilityexpense`;

-- DropIndex
DROP INDEX `UtilityExpense_utilityTypeId_fkey` ON `utilityexpense`;

-- DropIndex
DROP INDEX `UtilityInvoice_rentId_fkey` ON `utilityinvoice`;

-- DropIndex
DROP INDEX `UtilityInvoice_utilityChargeId_fkey` ON `utilityinvoice`;

-- AlterTable
ALTER TABLE `banktransaction` DROP COLUMN `attachment`,
    ADD COLUMN `receiptImage` VARCHAR(191) NULL,
    ADD COLUMN `account` VARCHAR(191) NULL,
    ADD COLUMN `Name` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType`(`roomTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomFeature` ADD CONSTRAINT `RoomFeature_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomFeature` ADD CONSTRAINT `RoomFeature_featureTypeId_fkey` FOREIGN KEY (`featureTypeId`) REFERENCES `RoomFeatureType`(`featureTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tenant` ADD CONSTRAINT `Tenant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_previousRentId_fkey` FOREIGN KEY (`previousRentId`) REFERENCES `Rental`(`rentId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgreementDocument` ADD CONSTRAINT `AgreementDocument_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilityExpense` ADD CONSTRAINT `UtilityExpense_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilityExpense` ADD CONSTRAINT `UtilityExpense_utilityTypeId_fkey` FOREIGN KEY (`utilityTypeId`) REFERENCES `UtilityType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Maintenance` ADD CONSTRAINT `Maintenance_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Maintenance` ADD CONSTRAINT `Maintenance_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilityCharge` ADD CONSTRAINT `UtilityCharge_utilityTypeId_fkey` FOREIGN KEY (`utilityTypeId`) REFERENCES `UtilityType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilityInvoice` ADD CONSTRAINT `UtilityInvoice_utilityChargeId_fkey` FOREIGN KEY (`utilityChargeId`) REFERENCES `UtilityCharge`(`utilityChargeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilityInvoice` ADD CONSTRAINT `UtilityInvoice_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_utilityInvoiceId_fkey` FOREIGN KEY (`utilityInvoiceId`) REFERENCES `UtilityInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TerminateRequest` ADD CONSTRAINT `TerminateRequest_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentRequest` ADD CONSTRAINT `PaymentRequest_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentRequest` ADD CONSTRAINT `PaymentRequest_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentRequest` ADD CONSTRAINT `PaymentRequest_utilityInvoiceId_fkey` FOREIGN KEY (`utilityInvoiceId`) REFERENCES `UtilityInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankTransaction` ADD CONSTRAINT `BankTransaction_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `BankAccount`(`bankAccountId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankTransaction` ADD CONSTRAINT `BankTransaction_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`paymentId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Budget` ADD CONSTRAINT `Budget_catagoryId_fkey` FOREIGN KEY (`catagoryId`) REFERENCES `UtilityType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
