const cloudinary = require("../middleware/cloudinary");
const IndividualClimb = require("../models/Individual")
const ClimbingSession = require("../models/Session")
const Comment = require("../models/Comment");
module.exports = {
  getProfile: async (req, res) => {
    try {
      const sessions = await ClimbingSession.find().sort({ createdAt: "desc" }).lean();
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
      let sessionId = req.session.sessionId;
      let session;
      if (sessionId) {
        session = await ClimbingSession.findById(sessionId).lean();
      }
      if (!session) {
        session = await ClimbingSession.create({ user: req.user.id, climbs: [], username: req.user.userName, finalized: false });
        sessionId = session._id; 
        req.session.sessionId = sessionId;
      }
      res.render('session.ejs', { climbs: session.climbs });
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
  getOneSession: async (req, res) => {
    try {
      const session = await ClimbingSession.findById(req.params.id);
      res.render("sessionOne.ejs", {session: session, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  addClimbToSession: async (req, res) => {
    try {
      let imageUrl, cloudinaryId;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }
    const difficultyLabel = req.body.Difficulty[1];
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
      if (session) {
        session.climbs.push(newClimb);
        await session.save();
        console.log("Individual climb has been added to the session:", session);
        res.render("session.ejs", { climbs :session.climbs });
      } else { 
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
      const session = await ClimbingSession.findOne(
        {
          user: req.user.id,
          climbs: { $exists: true, $not: {$size: 0} }
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
  
      const individualClimb = await IndividualClimb.findById(individualClimbId);
      if (!individualClimb) {
        throw new Error('IndividualClimb not found');
      }
  
      const difficultyLabel = req.body.Difficulty[1];
      individualClimb.typeOfClimb = req.body.typeOfClimb;
      individualClimb.difficulty = difficultyLabel;
      individualClimb.attempts = req.body.Attempts;
      individualClimb.top = req.body.TopYes ? 'Yes' : 'No';
      individualClimb.tags = req.body.Keywords;
      individualClimb.notes = req.body.Notes;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        individualClimb.image = result.secure_url;
        individualClimb.cloudinaryId = result.public_id;
      }
      await individualClimb.save();
  
      console.log("Individual climb has been updated:", individualClimb);
  
      const climbingSession = await ClimbingSession.findOne({
        "climbs._id": individualClimbId
      });
      if (!climbingSession) {
        throw new Error('ClimbingSession not found');
      }
  
      const climbIndex = climbingSession.climbs.findIndex(climb => climb._id.equals(individualClimb._id));
      if (climbIndex === -1) {
        throw new Error('ClimbingSession does not contain corresponding IndividualClimb');
      }
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

      const individualClimb = await IndividualClimb.findById(individualClimbId);
      if (!individualClimb) {
        throw new Error("IndividualClimb not found");
      }
      const climbingSession = await ClimbingSession.findOne({ "climbs._id": individualClimbId });

      if (!climbingSession) {
        throw new Error("ClimbingSession not found");
      }
      climbingSession.climbs = climbingSession.climbs.filter((climb) => climb._id.toString() !== individualClimbId);
      await climbingSession.save();
      console.log("Individual climb has been deleted from the session:", climbingSession);

      if (climbingSession.climbs.length === 0) {
        climbingSession.finalized = true;
        await climbingSession.save();
        console.log("Session has been finalized:", climbingSession);
      }

      if (individualClimb.image && individualClimb.cloudinaryId) {
        await cloudinary.uploader.destroy(individualClimb.cloudinaryId);
      }

      await individualClimb.remove();

      console.log("Deleted Individual Climb");
      res.redirect("/session");
    } catch (err) {
      console.log(err);
    }
  },
  deleteSession: async (req, res) => {
    try {
      const session = await ClimbingSession.findById(req.params.id);
      if (!session) {
        throw new Error('Session not found');
      }

      await IndividualClimb.deleteMany({ _id: { $in: session.climbs } });

      if (session.cloudinaryId) {
        await cloudinary.uploader.destroy(session.cloudinaryId);
      }

      await ClimbingSession.deleteOne({ _id: session._id });
      console.log("Session has been deleted.");
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  },
}