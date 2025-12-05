-- CreateTable
CREATE TABLE `User` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `profilePicture` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('SuperAdmin', 'Admin', 'Tenant', 'SecurityOfficer') NOT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `logId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `tableName` VARCHAR(191) NOT NULL,
    `recordId` INTEGER NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`logId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomType` (
    `roomTypeId` INTEGER NOT NULL AUTO_INCREMENT,
    `typeName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`roomTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `roomId` INTEGER NOT NULL AUTO_INCREMENT,
    `unitNumber` VARCHAR(191) NOT NULL,
    `floor` INTEGER NOT NULL,
    `size` DOUBLE NOT NULL,
    `roomTypeId` INTEGER NOT NULL,
    `roomPrice` INTEGER NOT NULL,
    `status` ENUM('Occupied', 'Vacant', 'Maintenance', 'Inactive') NOT NULL DEFAULT 'Vacant',
    `hasParking` BOOLEAN NOT NULL DEFAULT false,
    `parkingType` VARCHAR(191) NULL,
    `parkingSpaces` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`roomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceofCare` (
    `PriceId` INTEGER NOT NULL AUTO_INCREMENT,
    `floor` INTEGER NOT NULL,
    `basePrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`PriceId`)
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

-- CreateTable
CREATE TABLE `Tenant` (
    `tenantId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `contactPerson` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `identificationDocument` VARCHAR(191) NULL,
    `tinNumber` VARCHAR(191) NULL,
    `vatNumber` VARCHAR(191) NULL,
    `businessLicense` VARCHAR(191) NULL,
    `hasOverdueRent` BOOLEAN NOT NULL DEFAULT false,
    `totalOverdueAmount` DOUBLE NOT NULL DEFAULT 0,
    `overdueCount` INTEGER NOT NULL DEFAULT 0,
    `lastOverdueDate` DATETIME(3) NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`tenantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `selfManagedElectricity` BOOLEAN NOT NULL DEFAULT false,
    `utilityShare` DOUBLE NULL,
    `includeWater` BOOLEAN NOT NULL DEFAULT true,
    `includeElectricity` BOOLEAN NOT NULL DEFAULT true,
    `includeGenerator` BOOLEAN NOT NULL DEFAULT true,
    `includeService` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `includeTax` BOOLEAN NOT NULL DEFAULT true,
    `previousRentId` INTEGER NULL,

    UNIQUE INDEX `Rental_previousRentId_key`(`previousRentId`),
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
CREATE TABLE `Invoice` (
    `invoiceId` INTEGER NOT NULL AUTO_INCREMENT,
    `rentId` INTEGER NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `paperInvoiceNumber` VARCHAR(191) NULL,
    `baseRent` DOUBLE NULL,
    `taxPercentage` DOUBLE NULL,
    `taxAmount` DOUBLE NULL,
    `totalAmount` DOUBLE NOT NULL,
    `status` ENUM('Paid', 'Unpaid', 'Overdue', 'Pending') NOT NULL,
    `isOverdue` BOOLEAN NULL DEFAULT false,
    `overdueDays` INTEGER NULL DEFAULT 0,
    `overdueSince` DATETIME(3) NULL,
    `warningSent` BOOLEAN NULL DEFAULT false,
    `lastCheckedAt` DATETIME(3) NULL,
    `withholdingRate` DOUBLE NULL,
    `withholdingAmount` DOUBLE NULL,
    `pdfUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`invoiceId`)
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

-- CreateTable
CREATE TABLE `UtilityType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UtilityType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UtilityExpense` (
    `expenseId` INTEGER NOT NULL AUTO_INCREMENT,
    `utilityTypeId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `invoice` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NOT NULL,

    PRIMARY KEY (`expenseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Maintenance` (
    `maintenanceId` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NULL,
    `description` VARCHAR(191) NOT NULL,
    `cost` DOUBLE NULL,
    `maintenanceStartDate` DATETIME(3) NOT NULL,
    `maintenanceEndDate` DATETIME(3) NULL,
    `status` ENUM('Pending', 'InProgress', 'Completed') NOT NULL DEFAULT 'InProgress',
    `recordedBy` INTEGER NULL,

    PRIMARY KEY (`maintenanceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaintenanceRequest` (
    `requestId` INTEGER NOT NULL AUTO_INCREMENT,
    `rentId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('Pending', 'Declined', 'Approved') NOT NULL DEFAULT 'Pending',
    `requestDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `notificationId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `tenantId` INTEGER NULL,
    `type` ENUM('Invoice', 'Maintenance', 'PaymentReminder', 'RenewalReminder', 'OverduePayment', 'PaymentConfirmation', 'PaymentDeclined', 'PaymentRequest', 'UtilityAlert', 'SystemAlert', 'ExitRequestSubmitted', 'ExitRequestApproved', 'ExitRequestRejected', 'ExitRequestVerified', 'ExitRequestBlocked') NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `sentVia` ENUM('Email', 'SMS', 'System') NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`notificationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UtilityCharge` (
    `utilityChargeId` INTEGER NOT NULL AUTO_INCREMENT,
    `utilityTypeId` INTEGER NOT NULL,
    `monthName` VARCHAR(191) NULL,
    `totalCost` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isGenerated` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`utilityChargeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UtilityInvoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilityChargeId` INTEGER NOT NULL,
    `paymentId` INTEGER NULL,
    `paymentRequestId` INTEGER NULL,
    `rentId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paperInvoiceNumber` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'UNPAID',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `paymentId` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `method` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NULL,
    `receiptFilePath` VARCHAR(191) NULL,
    `endDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('Confirmed', 'Pending', 'Failed') NOT NULL DEFAULT 'Confirmed',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TerminateRequest` (
    `terminateRequestId` INTEGER NOT NULL AUTO_INCREMENT,
    `rentId` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `requestDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `effectiveDate` DATETIME(3) NULL,
    `adminNote` VARCHAR(191) NULL,

    PRIMARY KEY (`terminateRequestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentRequest` (
    `requestId` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `invoiceId` INTEGER NULL,
    `bankAccountId` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `method` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NULL,
    `proofFilePath` VARCHAR(191) NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `adminNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `account` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgreementTemplate` (
    `templateId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`templateId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankAccount` (
    `bankAccountId` INTEGER NOT NULL AUTO_INCREMENT,
    `accountName` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'ETB',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BankAccount_accountNumber_key`(`accountNumber`),
    PRIMARY KEY (`bankAccountId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankTransaction` (
    `transactionId` INTEGER NOT NULL AUTO_INCREMENT,
    `bankAccountId` INTEGER NULL,
    `paymentId` INTEGER NULL,
    `type` ENUM('Deposit', 'Withdrawal', 'Transfer') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `receiptImage` VARCHAR(191) NULL,
    `accountId` INTEGER NULL,
    `account` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`transactionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaintenanceSchedule` (
    `scheduleId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `duedate` DATETIME(3) NULL,
    `category` VARCHAR(191) NULL,
    `frequency` VARCHAR(191) NULL,
    `priority` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`scheduleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaintenanceScheduleOccurrence` (
    `occurrenceId` INTEGER NOT NULL AUTO_INCREMENT,
    `scheduleId` INTEGER NOT NULL,
    `occurrenceDate` DATETIME(3) NOT NULL,
    `startDateTime` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Upcoming',
    `notified` BOOLEAN NOT NULL DEFAULT false,
    `notifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `adminNote` VARCHAR(191) NULL,

    INDEX `MaintenanceScheduleOccurrence_occurrenceDate_idx`(`occurrenceDate`),
    UNIQUE INDEX `MaintenanceScheduleOccurrence_scheduleId_occurrenceDate_key`(`scheduleId`, `occurrenceDate`),
    PRIMARY KEY (`occurrenceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Budget` (
    `budgetId` INTEGER NOT NULL AUTO_INCREMENT,
    `catagoryId` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `monthName` INTEGER NOT NULL,
    `plannedAmount` DOUBLE NOT NULL,
    `actualAmount` DOUBLE NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`budgetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryItem` (
    `itemId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `unitPrice` DOUBLE NULL,
    `location` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Available',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`itemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExitRequest` (
    `requestId` INTEGER NOT NULL AUTO_INCREMENT,
    `trackingNumber` VARCHAR(191) NOT NULL,
    `tenantId` INTEGER NOT NULL,
    `rentId` INTEGER NOT NULL,
    `requestDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `exitDate` DATETIME(3) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `type` ENUM('Temporary', 'Permanent') NOT NULL DEFAULT 'Temporary',
    `status` ENUM('Pending', 'Approved', 'Rejected', 'Verified', 'Blocked') NOT NULL DEFAULT 'Pending',
    `adminNote` VARCHAR(191) NULL,
    `securityNote` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `verifiedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ExitRequest_trackingNumber_key`(`trackingNumber`),
    PRIMARY KEY (`requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExitRequestItem` (
    `itemId` INTEGER NOT NULL AUTO_INCREMENT,
    `exitRequestId` INTEGER NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `serialNumber` VARCHAR(191) NULL,
    `estimatedValue` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`itemId`)
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
ALTER TABLE `Maintenance` ADD CONSTRAINT `Maintenance_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`roomId`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `UtilityInvoice` ADD CONSTRAINT `UtilityInvoice_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`paymentId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UtilityInvoice` ADD CONSTRAINT `UtilityInvoice_paymentRequestId_fkey` FOREIGN KEY (`paymentRequestId`) REFERENCES `PaymentRequest`(`requestId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TerminateRequest` ADD CONSTRAINT `TerminateRequest_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentRequest` ADD CONSTRAINT `PaymentRequest_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `BankAccount`(`bankAccountId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentRequest` ADD CONSTRAINT `PaymentRequest_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentRequest` ADD CONSTRAINT `PaymentRequest_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankTransaction` ADD CONSTRAINT `BankTransaction_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `BankAccount`(`bankAccountId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankTransaction` ADD CONSTRAINT `BankTransaction_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`paymentId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceScheduleOccurrence` ADD CONSTRAINT `MaintenanceScheduleOccurrence_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `MaintenanceSchedule`(`scheduleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Budget` ADD CONSTRAINT `Budget_catagoryId_fkey` FOREIGN KEY (`catagoryId`) REFERENCES `UtilityType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExitRequest` ADD CONSTRAINT `ExitRequest_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`tenantId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExitRequest` ADD CONSTRAINT `ExitRequest_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rental`(`rentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExitRequest` ADD CONSTRAINT `ExitRequest_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExitRequestItem` ADD CONSTRAINT `ExitRequestItem_exitRequestId_fkey` FOREIGN KEY (`exitRequestId`) REFERENCES `ExitRequest`(`requestId`) ON DELETE CASCADE ON UPDATE CASCADE;
