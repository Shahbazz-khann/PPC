const OwnerModel = require('../../models/Owner/owner.model');
const bcrypt = require('bcryptjs');

class OwnerController {
  static async getDashboardSummary(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const summary = await OwnerModel.getDashboardSummary(ownerId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyProperties(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const filters = {
        search: req.query.search,
        property_type: req.query.property_type,
        property_status: req.query.property_status,
        verification_status: req.query.verification_status,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.query.sort
      };

      const result = await OwnerModel.getMyProperties(ownerId, filters);
      
      res.status(200).json({
        success: true,
        data: result.properties,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getVerificationSummary(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const summary = await OwnerModel.getVerificationSummary(ownerId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInspectionOverview(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const overview = await OwnerModel.getInspectionOverview(ownerId);
      
      res.status(200).json({
        success: true,
        data: overview
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUpcomingVisits(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const data = await OwnerModel.getUpcomingVisits(ownerId, limit, offset);
      
      res.status(200).json({
        success: true,
        data: data.visits,
        pagination: data.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionOverview(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const transactions = await OwnerModel.getTransactionOverview(ownerId);
      
      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFinancialSummary(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const summary = await OwnerModel.getFinancialSummary(ownerId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecentActivity(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const activity = await OwnerModel.getRecentActivity(ownerId);
      
      res.status(200).json({
        success: true,
        data: activity || []
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPropertiesSummary(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const summary = await OwnerModel.getPropertiesSummary(ownerId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPropertyDetails(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const propertyId = req.params.propertyId;
      const property = await OwnerModel.getPropertyDetails(propertyId, ownerId);
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found or unauthorized'
        });
      }

      res.status(200).json({
        success: true,
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProperty(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const {
        title,
        property_type_id,
        description,
        city,
        address,
        area_value,
        area_unit_id,
        bedrooms,
        bathrooms,
        sale_price,
        rent_price
      } = req.body;

      if (!title || !property_type_id || !city || !address || !area_value || !area_unit_id) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      if (isNaN(property_type_id) || isNaN(area_value) || isNaN(area_unit_id)) {
        return res.status(400).json({ success: false, message: 'property_type_id, area_value, and area_unit_id must be numeric' });
      }

      const isValidNumber = (val) => {
        if (val === undefined || val === null || val === '') return true;
        return !isNaN(val);
      };

      if (!isValidNumber(bedrooms) || !isValidNumber(bathrooms) || !isValidNumber(sale_price) || !isValidNumber(rent_price)) {
         return res.status(400).json({ success: false, message: 'bedrooms, bathrooms, sale_price, and rent_price must be numeric if provided' });
      }

      const hasValidSalePrice = sale_price !== undefined && sale_price !== null && sale_price !== '' && !isNaN(sale_price);
      const hasValidRentPrice = rent_price !== undefined && rent_price !== null && rent_price !== '' && !isNaN(rent_price);

      if (!hasValidSalePrice && !hasValidRentPrice) {
        return res.status(400).json({ success: false, message: 'Either valid sale_price or rent_price must be provided' });
      }

      const propertyData = {
        title,
        property_type_id,
        description,
        city,
        address,
        area_value,
        area_unit_id,
        bedrooms: (bedrooms !== undefined && bedrooms !== '') ? bedrooms : null,
        bathrooms: (bathrooms !== undefined && bathrooms !== '') ? bathrooms : null,
        sale_price: hasValidSalePrice ? sale_price : null,
        rent_price: hasValidRentPrice ? rent_price : null
      };

      const newProperty = await OwnerModel.createProperty(ownerId, propertyData);

      res.status(201).json({
        success: true,
        data: newProperty
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadPropertyMedia(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const propertyId = req.params.propertyId;
      
      const property = await OwnerModel.getPropertyDetails(propertyId, ownerId);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found or unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No media file provided' });
      }

      const mediaUrl = `/uploads/properties/${req.file.filename}`;
      const isPrimary = req.body.is_primary === 'true' || req.body.is_primary === true;
      const mediaTypeId = 1;

      const mediaData = {
        media_url: mediaUrl,
        media_type_id: mediaTypeId,
        is_primary: isPrimary
      };

      const newMedia = await OwnerModel.uploadPropertyMedia(ownerId, propertyId, mediaData);

      res.status(201).json({
        success: true,
        data: newMedia,
        message: 'Media uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPropertyVerificationPageSummary(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const summary = await OwnerModel.getPropertyVerificationPageSummary(ownerId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
  static async getPropertyVerificationsList(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const filters = {
        search: req.query.search,
        status: req.query.status,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.query.sort
      };

      const result = await OwnerModel.getPropertyVerificationsList(ownerId, filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  static async getPropertyVerificationDetails(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const propertyId = req.params.propertyId;

      const details = await OwnerModel.getPropertyVerificationDetails(ownerId, propertyId);

      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Verification record not found for this property.'
        });
      }

      res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  }
  static async getInspectionsSummary(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const summary = await OwnerModel.getInspectionsSummary(ownerId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
  static async getInspectionsList(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const filters = {
        search: req.query.search,
        status: req.query.status,
        result: req.query.result,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.query.sort
      };

      const result = await OwnerModel.getInspectionsList(ownerId, filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  static async getInspectionDetails(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const inspectionId = req.params.inspectionId;

      const details = await OwnerModel.getInspectionDetails(ownerId, inspectionId);

      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Inspection not found or unauthorized'
        });
      }

      res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  }
  static async getVisitsSummary(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const summary = await OwnerModel.getVisitsSummary(ownerId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
  static async getVisitsList(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const filters = {
        search: req.query.search,
        status: req.query.status,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.query.sort
      };

      const result = await OwnerModel.getVisitsList(ownerId, filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  static async getVisitDetails(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const visitId = req.params.visitId;

      const details = await OwnerModel.getVisitDetails(ownerId, visitId);

      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Visit not found or unauthorized'
        });
      }

      res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  }
  static async getTransactionSummary(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const summary = await OwnerModel.getTransactionSummary(ownerId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
  static async getTransactionList(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const filters = {
        search: req.query.search,
        status: req.query.status,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.query.sort
      };

      const result = await OwnerModel.getTransactionList(ownerId, filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  static async getTransactionDetails(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const transactionId = req.params.transactionId;

      const details = await OwnerModel.getTransactionDetails(ownerId, transactionId);

      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found or unauthorized'
        });
      }

      res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  }
  static async getInvoicesSummary(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const summary = await OwnerModel.getInvoicesSummary(ownerId);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
  static async getInvoiceList(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const filters = {
        search: req.query.search,
        status: req.query.status,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sort: req.query.sort
      };

      const result = await OwnerModel.getInvoiceList(ownerId, filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  static async getInvoiceDetails(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const invoiceId = req.params.invoiceId;

      const details = await OwnerModel.getInvoiceDetails(ownerId, invoiceId);

      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found or unauthorized'
        });
      }

      res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateOwnerProfile(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const { name, mobile_no, country } = req.body;
      
      const updates = { name, mobile_no, country };
      Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

      const updatedUser = await OwnerModel.updateOwnerProfile(ownerId, updates);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
  static async changePassword(req, res, next) {
    try {
      const ownerId = req.user.user_id;
      const { current_password, new_password, confirm_password } = req.body;

      if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'All password fields are required'
        });
      }

      if (new_password !== confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'New password and confirm password do not match'
        });
      }

      if (current_password === new_password) {
        return res.status(400).json({
          success: false,
          message: 'New password must be different from current password'
        });
      }

      const currentHash = await OwnerModel.getOwnerPassword(ownerId);
      if (!currentHash) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isMatch = await bcrypt.compare(current_password, currentHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect current password'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(new_password, salt);

      await OwnerModel.changePassword(ownerId, newHash);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OwnerController;
