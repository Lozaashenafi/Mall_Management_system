/*
  Warnings:

  - You are about to drop the column `maintenanceDate` on the `maintenance` table. All the data in the column will be lost.
  - Added the required column `maintenanceStartDate` to the `Maintenance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Agreement_roomId_fkey` ON `agreement`;

-- DropIndex
DROP INDEX `Agreement_tenantId_fkey` ON `agreement`;

-- DropIndex
DROP INDEX `AuditLog_userId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `Expense_recordedBy_fkey` ON `expense`;

-- DropIndex
DROP INDEX `Invoice_agreementId_fkey` ON `invoice`;

-- DropIndex
DROP INDEX `Maintenance_recordedBy_fkey` ON `maintenance`;

-- DropIndex
DROP INDEX `Maintenance_roomId_fkey` ON `maintenance`;

-- DropIndex
DROP INDEX `Notification_tenantId_fkey` ON `notification`;

-- DropIndex
DROP INDEX `Notification_userId_fkey` ON `notification`;

-- DropIndex
DROP INDEX `Payment_invoiceId_fkey` ON `payment`;

-- DropIndex
DROP INDEX `Room_roomTypeId_fkey` ON `room`;

-- AlterTable
ALTER TABLE `maintenance` DROP COLUMN `maintenanceDate`,
    ADD COLUMN `maintenanceEndDate` DATETIME(3) NULL,
    ADD COLUMN `maintenanceStartDate` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `MaintenanceRequest` (
    `requestId` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `requestDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completionDate` DATETIME(3) NULL,

    PRIMARY KEY (`requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType`(`roomTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agreement` ADD CONSTRAINT `Agreement_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agreement` ADD CONSTRAINT `Agreement_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_agreementId_fkey` FOREIGN KEY (`agreementId`) REFERENCES `Agreement`(`agreementId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Maintenance` ADD CONSTRAINT `Maintenance_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Maintenance` ADD CONSTRAINT `Maintenance_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE SET NULL ON UPDATE CASCADE;
