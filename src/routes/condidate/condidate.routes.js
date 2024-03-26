import express from "express";
import {
  applyForJobs,
  candidateJobStatus,
  changeCurrentPassword,
  currentCandidate,
  currentCandidateProfile,
  forgotPassword,
  getAllJobs,
  loginCandidate,
  logoutCandidate,
  registerCandidate,
} from "../../controllers/candidate/candidate.controller.js";
import { candidateVerifyJWT } from "../../middlewares/candidate.auth.middleware.js";

const router = express.Router();
router.route("/register").post(registerCandidate);
router.route("/login").post(loginCandidate);

router.route("/forgot-password").post(forgotPassword);

router.route("/logout").post(candidateVerifyJWT, logoutCandidate);
router
  .route("/update-password")
  .post(candidateVerifyJWT, changeCurrentPassword);
router.route("/").get(candidateVerifyJWT, currentCandidate);
router.route("/all-jobs").get(candidateVerifyJWT, getAllJobs);
router.route("/apply-for-job/:id").get(candidateVerifyJWT, applyForJobs);
router
  .route("/candidate-profile")
  .get(candidateVerifyJWT, currentCandidateProfile);
router.route("/job-status/:id").get(candidateVerifyJWT, candidateJobStatus);

export default router;
