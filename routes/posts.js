const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, postsController.getPost);

router.get("/editIndividualClimb/:id", ensureAuth, postsController.getEdit);

router.post("/addClimbToSession/", upload.single("file"), postsController.addClimbToSession);

router.post("/finalizeSession/", postsController.finalizeSession);

router.put("/finalizeEditIndividual/:id", upload.single("file"), postsController.finalizeEditIndividual);

router.put("/likePost/:id", postsController.likePost);

router.delete("/deleteIndividualClimb/:id", postsController.deleteIndividualClimb);

router.delete("/deleteSession/:id", postsController.deleteSession);

module.exports = router;
