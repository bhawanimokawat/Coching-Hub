
const express = require("express");
const { createBatch, getBatches ,enrollStudent,getMyBatches,updateBatch } = require("../controllers/batchController");
const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { requireInstitute } = require("../middleware/instituteMiddleware");

const router = express.Router();

router.use(protect, requireInstitute);

router
  .route("/")
  .post(authorizeRoles("admin"), createBatch)
  .get(authorizeRoles("admin", "teacher"), getBatches);
  router.post( "/:batchId/enroll", protect, authorizeRoles("admin"), requireInstitute, enrollStudent);
  router.get("/my-batches",authorizeRoles("student"),getMyBatches);
  router.patch("/:batchId", authorizeRoles("admin"), updateBatch);

module.exports = router;
