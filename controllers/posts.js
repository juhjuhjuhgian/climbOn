const cloudinary = require("../middleware/cloudinary");
const IndividualClimb = require("../models/Individual")
const ClimbingSession = require("../models/Session")
const Comment = require("../models/Comment");
module.exports = {
    getProfile: async (req, res) => {
      try {
        const sessions = await ClimbingSession.find({ user: req.user.id });
        res.render("profile.ejs", {user: req.user, sessions: sessions });
      } catch (err) {
        console.log(err);
      }
    },
    getFeed: async (req, res) => {
      try {
        const comments = await Comment.find().sort({ createdAt: "desc" }).lean();
        const sessions = await ClimbingSession.find().sort({ createdAt: "desc" }).lean();
        res.render("feed.ejs", { sessions: sessions, user: req.user, comments: comments });
      } catch (err) {
        console.log(err);
      }
    },
  getNewSession: async (req, res) => {
    try {
      // Check if there is an existing session ID in the user's request object
      let sessionId = req.session.sessionId;
      let session;
      // If there is a session ID, find the corresponding ClimbingSession document in the database
      if (sessionId) {
        session = await ClimbingSession.findById(sessionId).lean();
      }
      // If there is no session ID or no corresponding ClimbingSession document was found, create a new ClimbingSession document
      if (!session) {
        session = await ClimbingSession.create({ user: req.user.id, climbs: [], username: req.user.userName, finalized: false });
        sessionId = session._id; // Assign the new session's ID to the user's request object
        req.session.sessionId = sessionId;
      }
      // Render session.ejs with climbs data from the retrieved or newly created ClimbingSession document
      res.render('session.ejs', { climbs: session.climbs });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getEdit: async (req, res) => {
    try {
      const climb = await IndividualClimb.findById(req.params.id);
      res.render("editOne.ejs", { climb: climb });
    } catch (err) {
      console.log(err);
    }
  },
  addClimbToSession: async (req, res) => {
    try {
      let imageUrl, cloudinaryId;

    // Check if a file has been uploaded
    if (req.file) {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }
    const difficultyLabel = req.body.Difficulty[1];
    // Create a new IndividualClimb object with the form data and uploaded image data
    const newClimb = await IndividualClimb.create({
      typeOfClimb: req.body.typeOfClimb,
      difficulty: difficultyLabel,
      attempts: req.body.Attempts,
      top: req.body.TopYes ? 'Yes': 'No',
      image: imageUrl,
      cloudinaryId: cloudinaryId,
      tags: req.body.Keywords,
      notes: req.body.Notes,
      user: req.user.id,
      username: req.user.userName,
    });
      // Find the most recent session for the current user
      const session = await ClimbingSession.findOne(
        {
          user: req.user.id,
        },
        {},
        {
          sort: {
            createdAt: -1,
          },
        }
      );
      // If a session exists, add the new IndividualClimb to it
      if (session) {
        session.climbs.push(newClimb);
        await session.save();
        console.log("Individual climb has been added to the session:", session);
        res.render("session.ejs", { climbs :session.climbs });
      } else { // If no session exists, create a new one and add the new IndividualClimb to it
        const newSession = await ClimbingSession.create({
          user: req.user.id,
          username: req.user.userName,
          climbs: [newClimb],
        });
        console.log("New session has been created with the new individual climb:", newSession);
        res.render("session.ejs", { climbs : newSession.climbs });
      }
    } catch (err) {
      console.log(err);
    }
  },
  finalizeSession: async (req, res) => {
    try {
      // Find the most recent session for the current user
      const session = await ClimbingSession.findOne(
        {
          user: req.user.id,
          climbs: { $exists: true, $not: {$size: 0} }
          //Checks climbs fiels exists and is not an empty array
        },
        {},
        {
          sort: {
            createdAt: -1,
          },
        }
      );

      if (session) {
        session.finalized = true;
        await session.save();
        console.log("Session has been finalized:", session);
        // Clear the sessionId from the user's session
        req.session.sessionId = null;
      }
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
      res.redirect('/');
    }
  },
  commentSession: async (req, res) => {
    try {
      const session = await ClimbingSession.find().sort({ createdAt: "desc" }).lean();
      const comments = await Comment.find().sort({ createdAt: "desc" }).lean();
      console.log(req.user)
      await Comment.create({
        comment: req.body.comment,
        user: req.user.id,
        username: req.user.userName,
        sessionId: req.params.id
      });
      console.log("Comment has been added!");
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
    }
  },
  finalizeEditIndividual: async (req, res) => {
    try {
      const individualClimbId = req.params.id;
  
      // Find the IndividualClimb document by id
      const individualClimb = await IndividualClimb.findById(individualClimbId);
      if (!individualClimb) {
        throw new Error('IndividualClimb not found');
      }
  
      // Update the IndividualClimb document with new data
      const difficultyLabel = req.body.Difficulty[1];
      individualClimb.typeOfClimb = req.body.typeOfClimb;
      individualClimb.difficulty = difficultyLabel;
      individualClimb.attempts = req.body.Attempts;
      individualClimb.top = req.body.TopYes ? 'Yes' : 'No';
      individualClimb.tags = req.body.Keywords;
      individualClimb.notes = req.body.Notes;
      if (req.file) {
        // If a new image has been uploaded, upload to cloudinary and update IndividualClimb document
        const result = await cloudinary.uploader.upload(req.file.path);
        individualClimb.image = result.secure_url;
        individualClimb.cloudinaryId = result.public_id;
      }
      await individualClimb.save();
  
      console.log("Individual climb has been updated:", individualClimb);
  
      // Find the ClimbingSession document that contains the updated IndividualClimb document
      const climbingSession = await ClimbingSession.findOne({
        "climbs._id": individualClimbId
      });
      if (!climbingSession) {
        throw new Error('ClimbingSession not found');
      }
  
      // Update the corresponding climb object in the ClimbingSession document with the updated IndividualClimb document
      const climbIndex = climbingSession.climbs.findIndex(climb => climb._id.equals(individualClimb._id));
      if (climbIndex === -1) {
        throw new Error('ClimbingSession does not contain corresponding IndividualClimb');
      }
      //Updates IndividualClimb in the climbs array of ClimbingSession at the index climbIndex.
      climbingSession.climbs[climbIndex] = individualClimb;
  
      await climbingSession.save();
  
      console.log("Climbing session has been updated:", climbingSession);
      res.redirect("/session");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await ClimbingSession.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect('/feed');
    } catch (err) {
      console.log(err);
    }
  },
  deleteIndividualClimb: async (req, res) => {
    try {
      const individualClimbId = req.params.id;

      // Check if the IndividualClimb exists
      const individualClimb = await IndividualClimb.findById(individualClimbId);
      if (!individualClimb) {
        throw new Error("IndividualClimb not found");
      }
      // Find the ClimbingSession that contains the IndividualClimb
      const climbingSession = await ClimbingSession.findOne({ "climbs._id": individualClimbId });

      if (!climbingSession) {
        throw new Error("ClimbingSession not found");
      }
      // Remove the IndividualClimb from the ClimbingSession
      climbingSession.climbs = climbingSession.climbs.filter((climb) => climb._id.toString() !== individualClimbId);
      await climbingSession.save();
      console.log("Individual climb has been deleted from the session:", climbingSession);

      // Finalize the session if there are no more climbs left
      if (climbingSession.climbs.length === 0) {
        climbingSession.finalized = true;
        await climbingSession.save();
        console.log("Session has been finalized:", climbingSession);
      }

      // Delete image from cloudinary
      if (individualClimb.image && individualClimb.cloudinaryId) {
        await cloudinary.uploader.destroy(individualClimb.cloudinaryId);
      }

      // Delete the IndividualClimb
      await individualClimb.remove();

      console.log("Deleted Individual Climb");
      res.redirect("/session");
    } catch (err) {
      console.log(err);
    }
  },
  deleteSession: async (req, res) => {
    try {
      // Find session by id
      const session = await ClimbingSession.findById(req.params.id);
      if (!session) {
        throw new Error('Session not found');
      }

      // Remove all individual climbs associated with the session
      await IndividualClimb.deleteMany({ _id: { $in: session.climbs } });

      // Delete image from cloudinary
      if (session.cloudinaryId) {
        await cloudinary.uploader.destroy(session.cloudinaryId);
      }

      // Remove the session
      await ClimbingSession.deleteOne({ _id: session._id });
      console.log("Session has been deleted.");
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  },
}