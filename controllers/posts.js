const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const IndividualClimb = require("../models/Individual")
const ClimbingSession = require("../models/Session")
module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const sessions = await ClimbingSession.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { sessions: sessions });
    } catch (err) {
      console.log(err);
    }
  },
  getNewSession: async (req, res) => {
    try {
      let session = await ClimbingSession.findOne({ user: req.user.id, username: req.user.userName });
      if (!session) {
        session = await ClimbingSession.create({ user: req.user.id, climbs: [], username: req.user.userName});
      }
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
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
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

    const newClimb = await IndividualClimb.create({
      typeOfClimb: req.body.typeOfClimb,
      difficulty: req.body.Difficulty,
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
      // Create a new climbing session
      const newSession = await ClimbingSession.create({
        user: req.user.id,
        username: req.user.userName,
        climbs: [],
      });
      console.log("New session has been created:", newSession);

      // Render the climbing session view with the new session's climbs
      const climbs = newSession.climbs;
      res.render("session.ejs", { climbs });
    } catch (err) {
      console.log(err);
      res.redirect('/');
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
