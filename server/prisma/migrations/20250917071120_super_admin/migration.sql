/*
  Warnings:

  - You are about to drop the column `agreementId` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `maintenancerequest` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `maintenancerequest` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.
  - You are about to drop the column `method` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `idDocument` on the `tenant` table. All the data in the column will be lost.
  - The values [Manager] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `agreement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rentId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rentId` to the `MaintenanceRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
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
DROP INDEX `MaintenanceRequest_roomId_fkey` ON `maintenancerequest`;

-- DropIndex
DROP INDEX `Notification_tenantId_fkey` ON `notification`;

-- DropIndex
DROP INDEX `Notification_userId_fkey` ON `notification`;

-- DropIndex
DROP INDEX `Payment_invoiceId_fkey` ON `payment`;

-- DropIndex
DROP INDEX `Room_roomTypeId_fkey` ON `room`;

-- AlterTable
ALTER TABLE `invoice` DROP COLUMN `agreementId`,
    ADD COLUMN `rentId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `maintenancerequest` DROP COLUMN `roomId`,
    ADD COLUMN `rentId` INTEGER NOT NULL,
    MODIFY `status` ENUM('Pending', 'declined', 'approved') NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `method`,
    ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tenant` DROP COLUMN `idDocument`,
    ADD COLUMN `identificationDocument` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('SupperAdmin', 'Admin', 'Tenant') NOT NULL;

-- DropTable
DROP TABLE `agreement`;

-- CreateTable
CREATE TABLE `Rental` (
    `rentId` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `versionNumber` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `rentAmount` DOUBLE NOT NULL,
    `paymentDueDate` INTEGER NOT NULL,
    `paymentInterval` VARCHAR(191) NOT NULL,
    `status` ENUM('Active', 'Expired', 'Terminated') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`rentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgreementDocument` (
    `documentId` INTEGER NOT NULL AUTO_INCREMENT,
    `rentId` INTEGER NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `generatedBy` INTEGER NULL,

    PRIMARY KEY (`documentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `feedbackId` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'New',

    PRIMARY KEY (`feedbackId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType`(`roomTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgreementDocument` ADD CONSTRAINT `AgreementDocument_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Maintenance` ADD CONSTRAINT `Maintenance_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Maintenance` ADD CONSTRAINT `Maintenance_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE SET NULL ON UPDATE CASCADE;
