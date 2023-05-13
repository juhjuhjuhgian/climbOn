const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth } = require("../middleware/auth");

router.get("/editIndividualClimb/:id", ensureAuth, postsController.getEdit);

router.get("/viewSession/:id", ensureAuth, postsController.getOneSession)

router.post("/addClimbToSession/", upload.single("file"), postsController.addClimbToSession);

router.post("/finalizeSession/", postsController.finalizeSession);

router.post("/commentSession/:id", postsController.commentSession);

router.put("/finalizeEditIndividual/:id", upload.single("file"), postsController.finalizeEditIndividual);

router.put("/likePost/:id", postsController.likePost);

router.delete("/deleteIndividualClimb/:id", postsController.deleteIndividualClimb);

router.delete("/deleteSession/:id", postsController.deleteSession);

module.exports = router;