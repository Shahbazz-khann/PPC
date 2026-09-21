const OwnerController = require('../Owner/Owner.controller');
const customerController = require('../Customer/customer.controller');

class UserController {
    // ----------------------------------------------------------------------
    // SETTINGS (Shared)
    // ----------------------------------------------------------------------
    static async updateProfile(req, res, next) {
        return customerController.updateProfile(req, res, next);
    }

    static async changePassword(req, res, next) {
        return customerController.changePassword(req, res, next);
    }

    // ----------------------------------------------------------------------
    // SELLING / OWNER FEATURES
    // ----------------------------------------------------------------------
    static async getMyProperties(req, res, next) { return OwnerController.getMyProperties(req, res, next); }
    static async createProperty(req, res, next) { return OwnerController.createProperty(req, res, next); }
    static async getPropertyDetails(req, res, next) { return OwnerController.getPropertyDetails(req, res, next); }
    static async uploadPropertyMedia(req, res, next) { return OwnerController.uploadPropertyMedia(req, res, next); }
    static async getPropertiesSummary(req, res, next) { return OwnerController.getPropertiesSummary(req, res, next); }
    static async getSellingDashboardSummary(req, res, next) { return OwnerController.getDashboardSummary(req, res, next); }

    // Verifications
    static async getSellingVerificationSummary(req, res, next) { return OwnerController.getVerificationSummary(req, res, next); }
    static async getSellingPropertyVerificationsList(req, res, next) { return OwnerController.getPropertyVerificationsList(req, res, next); }
    static async getSellingPropertyVerificationPageSummary(req, res, next) { return OwnerController.getPropertyVerificationPageSummary(req, res, next); }
    static async getSellingPropertyVerificationDetails(req, res, next) { return OwnerController.getPropertyVerificationDetails(req, res, next); }

    // Inspections
    static async getSellingInspectionsOverview(req, res, next) { return OwnerController.getInspectionOverview(req, res, next); }
    static async getSellingInspectionsSummary(req, res, next) { return OwnerController.getInspectionsSummary(req, res, next); }
    static async getSellingInspections(req, res, next) { return OwnerController.getInspectionsList(req, res, next); }
    static async getSellingInspectionDetails(req, res, next) { return OwnerController.getInspectionDetails(req, res, next); }

    // Visits
    static async getSellingVisitsSummary(req, res, next) { return OwnerController.getVisitsSummary(req, res, next); }
    static async getSellingUpcomingVisits(req, res, next) { return OwnerController.getUpcomingVisits(req, res, next); }
    static async getSellingVisits(req, res, next) { return OwnerController.getVisitsList(req, res, next); }
    static async getSellingVisitDetails(req, res, next) { return OwnerController.getVisitDetails(req, res, next); }

    // Transactions
    static async getSellingTransactionsSummary(req, res, next) { return OwnerController.getTransactionSummary(req, res, next); }
    static async getSellingTransactionsOverview(req, res, next) { return OwnerController.getTransactionOverview(req, res, next); }
    static async getSellingTransactions(req, res, next) { return OwnerController.getTransactionList(req, res, next); }
    static async getSellingTransactionDetails(req, res, next) { return OwnerController.getTransactionDetails(req, res, next); }

    // Invoices / Finance
    static async getSellingInvoicesSummary(req, res, next) { return OwnerController.getInvoicesSummary(req, res, next); }
    static async getSellingInvoices(req, res, next) { return OwnerController.getInvoiceList(req, res, next); }
    static async getSellingInvoiceDetails(req, res, next) { return OwnerController.getInvoiceDetails(req, res, next); }
    static async getSellingFinancialSummary(req, res, next) { return OwnerController.getFinancialSummary(req, res, next); }
    
    // Activity
    static async getSellingActivity(req, res, next) { return OwnerController.getRecentActivity(req, res, next); }

    // ----------------------------------------------------------------------
    // BUYING / CUSTOMER FEATURES
    // ----------------------------------------------------------------------
    // Visits
    static async getBuyingVisits(req, res, next) { return customerController.getVisits(req, res, next); }
    static async getBuyingUpcomingVisits(req, res, next) { return customerController.getUpcomingVisit(req, res, next); }
    
    // Inspections
    static async getBuyingInspectionReportsSummary(req, res, next) { return customerController.getInspectionReportSummary(req, res, next); }
    static async getBuyingInspectionReports(req, res, next) { return customerController.getInspectionReports(req, res, next); }
    static async getBuyingInspectionReportDetails(req, res, next) { return customerController.getInspectionReportById(req, res, next); }

    // Transactions
    static async getBuyingTransactionsSummary(req, res, next) { return customerController.getTransactionSummary(req, res, next); }
    static async getBuyingTransactions(req, res, next) { return customerController.getTransactions(req, res, next); }
    static async getBuyingTransactionDetails(req, res, next) { return customerController.getTransactionById(req, res, next); }

    // Activity
    static async getBuyingActivity(req, res, next) { return customerController.getRecentActivity(req, res, next); }
}

module.exports = UserController;
