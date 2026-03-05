const Business = require("../../models/business.model");
const User = require("../../models/user.model");

const handleCreateNewBusiness = async (req, res) => {
  try {

    const userId = req.user?._id; // coming from auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const {
      companyName,
      legalName,
      businessType,
      industry,
      email,
      phone,
      website,
      address,
      logo,
      modules,
      currencySettings,
      taxSettings
    } = req.body;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required"
      });
    }

    // 🔍 Check if business already exists
    const existingBusiness = await Business.findOne({
      companyName: companyName.trim()
    });

    if (existingBusiness) {
      return res.status(409).json({
        success: false,
        message: "Business already exists"
      });
    }

    // ✅ Create business
    const business = await Business.create({
      companyName,
      legalName,
      businessType,
      industry,
      email,
      phone,
      website,
      address,
      logo,
      modules,
      currencySettings,
      taxSettings,
      createdBy: userId
    });

    // (Optional but recommended) link business to user
    await User.findByIdAndUpdate(userId, {
      businessId: business._id
    });

    return res.status(201).json({
      success: true,
      message: "Business created successfully",
      business
    });

  } catch (error) {
    console.error("Create Business Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create business"
    });
  }
}

const handleGetBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }
    res.status(200).json({ success: true, business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleUpdateBusinessProfile = async (req, res) => {
  try {
    const { companyName, legalName, businessType, industry, industryMeta, email, phone, website, address, logo, notificationPreferences, securitySettings } = req.body;

    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      {
        companyName,
        legalName,
        businessType,
        industry,
        industryMeta,
        email,
        phone,
        website,
        address,
        logo,
        notificationPreferences,
        securitySettings
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Business profile updated", business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleUpdateModules = async (req, res) => {
  try {
    const { modules } = req.body;
    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      { modules },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Modules updated", business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleUpdateCurrency = async (req, res) => {
  try {
    const { currencySettings } = req.body;
    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      { currencySettings },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Currency settings updated", business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleUpdateTaxSettings = async (req, res) => {
  try {
    const { taxSettings } = req.body;
    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      { taxSettings },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Tax settings updated", business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handleCreateNewBusiness,
  handleGetBusiness,
  handleUpdateBusinessProfile,
  handleUpdateModules,
  handleUpdateCurrency,
  handleUpdateTaxSettings
};
