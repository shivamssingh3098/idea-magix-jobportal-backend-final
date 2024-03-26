import express from "express";

import {
  changeCurrentPassword,
  changeJobsStatus,
  createCompany,
  createJob,
  currentEmployer,
  editJob,
  getAllJobRequest,
  getCompany,
  loginEmployer,
  logoutEmployer,
  registerEmployer,
  rejectJobsStatus,
} from "../../controllers/admin/employer.controller.js";
import { verifyAdminOrStaffJWT } from "../../middlewares/admin.auth.middleware.js";

const router = express.Router();
router.route("/register").post(registerEmployer);
router.route("/login").post(loginEmployer);
router.route("/logout").post(verifyAdminOrStaffJWT, logoutEmployer);
router
  .route("/update-password")
  .post(verifyAdminOrStaffJWT, changeCurrentPassword);
router.route("/").get(verifyAdminOrStaffJWT, currentEmployer);

router.route("/create-company").post(verifyAdminOrStaffJWT, createCompany);
router.route("/create-job").post(verifyAdminOrStaffJWT, createJob);
router.route("/job-request/:id").get(verifyAdminOrStaffJWT, getAllJobRequest);

router
  .route("/accept-job-request/:id")
  .patch(verifyAdminOrStaffJWT, changeJobsStatus);
router
  .route("/rejected-job-request")
  .patch(verifyAdminOrStaffJWT, rejectJobsStatus);

router.route("/edit-job-application/:id").patch(verifyAdminOrStaffJWT, editJob);
router.route("/all-company").get(verifyAdminOrStaffJWT, getCompany);
export default router;
