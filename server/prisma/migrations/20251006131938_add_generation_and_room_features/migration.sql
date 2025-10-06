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

-- AlterTable
ALTER TABLE `room` ADD COLUMN `hasParking` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `parkingSpaces` INTEGER NULL,
    ADD COLUMN `parkingType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tenant` ADD COLUMN `businessLicense` VARCHAR(191) NULL,
    ADD COLUMN `tinNumber` VARCHAR(191) NULL,
    ADD COLUMN `vatNumber` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Generation` (
    `generationId` INTEGER NOT NULL AUTO_INCREMENT,
    `month` VARCHAR(191) NOT NULL,
    `totalCost` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `generatedBy` INTEGER NULL,

    PRIMARY KEY (`generationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GenerationInvoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `generationId` INTEGER NOT NULL,
    `tenantId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `invoiceId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomFeatureType` (
    `featureTypeId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoomFeatureType_name_key`(`name`),
    PRIMARY KEY (`featureTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomFeature` (
    `roomFeatureId` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `featureTypeId` INTEGER NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoomFeature_roomId_featureTypeId_key`(`roomId`, `featureTypeId`),
    PRIMARY KEY (`roomFeatureId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Generation` ADD CONSTRAINT `Generation_generatedBy_fkey` FOREIGN KEY (`generatedBy`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GenerationInvoice` ADD CONSTRAINT `GenerationInvoice_generationId_fkey` FOREIGN KEY (`generationId`) REFERENCES `Generation`(`generationId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GenerationInvoice` ADD CONSTRAINT `GenerationInvoice_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GenerationInvoice` ADD CONSTRAINT `GenerationInvoice_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
