
const express = require("express");

const {
  createInstitute,
  getInstitutes,
  updateInstitute,
  deactivateInstitute
} = require("../controllers/instituteController.js");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, authorizeRoles("superAdmin"));

router.route("/")
  .post(createInstitute)
  .get(getInstitutes);
router.route("/:id").patch(updateInstitute).delete(deactivateInstitute);

module.exports = router;
