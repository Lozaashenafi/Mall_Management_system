/*
  Warnings:

  - The primary key for the `payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amountPaid` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `lateFee` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the `generation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `generationinvoice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `AgreementDocument_rentId_fkey` ON `agreementdocument`;

-- DropIndex
DROP INDEX `AuditLog_userId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `Expense_recordedBy_fkey` ON `expense`;

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
DROP INDEX `Rental_roomId_fkey` ON `rental`;

-- DropIndex
DROP INDEX `Rental_tenantId_fkey` ON `rental`;

-- DropIndex
DROP INDEX `Room_roomTypeId_fkey` ON `room`;

-- DropIndex
DROP INDEX `RoomFeature_featureTypeId_fkey` ON `roomfeature`;

-- AlterTable
ALTER TABLE `payment` DROP PRIMARY KEY,
    DROP COLUMN `amountPaid`,
    DROP COLUMN `lateFee`,
    DROP COLUMN `paymentId`,
    DROP COLUMN `paymentMethod`,
    ADD COLUMN `amount` DOUBLE NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `method` VARCHAR(191) NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `utilityInvoiceId` INTEGER NULL,
    MODIFY `invoiceId` INTEGER NULL,
    MODIFY `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `status` ENUM('Confirmed', 'Pending', 'Failed') NOT NULL DEFAULT 'Pending',
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `generation`;

-- DropTable
DROP TABLE `generationinvoice`;

-- CreateTable
CREATE TABLE `UtilityCharge` (
    `utilityChargeId` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('Generator', 'Water', 'Electricity', 'Other') NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `totalCost` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`utilityChargeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UtilityInvoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilityChargeId` INTEGER NOT NULL,
    `rentId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'UNPAID',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType`(`roomTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomFeature` ADD CONSTRAINT `RoomFeature_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomFeature` ADD CONSTRAINT `RoomFeature_featureTypeId_fkey` FOREIGN KEY (`featureTypeId`) REFERENCES `RoomFeatureType`(`featureTypeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `UtilityInvoice` ADD CONSTRAINT `UtilityInvoice_utilityChargeId_fkey` FOREIGN KEY (`utilityChargeId`) REFERENCES `UtilityCharge`(`utilityChargeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilityInvoice` ADD CONSTRAINT `UtilityInvoice_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_utilityInvoiceId_fkey` FOREIGN KEY (`utilityInvoiceId`) REFERENCES `UtilityInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
