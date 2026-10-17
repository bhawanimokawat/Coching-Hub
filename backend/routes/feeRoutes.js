
const express = require("express");

const { createFee,getFees,recordFeePayment,getFeePayments,getMyFees } = require("../controllers/feeControllers");
const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { requireInstitute } = require("../middleware/instituteMiddleware");



const router = express.Router();

router.use(protect, requireInstitute);

router.post("/", authorizeRoles("admin"), createFee);
router.get("/", authorizeRoles("admin"), getFees);
router.post( "/:feeId/payments", authorizeRoles("admin"), recordFeePayment);
router.get( "/:feeId/payments", authorizeRoles("admin"), getFeePayments);
router.get( "/my-fees", authorizeRoles("student"), getMyFees);

module.exports = router;
