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
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getNewSession: async (req, res) => {
    try {
      const climbs = await ClimbingSession.find().sort({ createdAt: "desc" }).lean();
      res.render("session.ejs", { climbs: climbs, user: req.user });
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
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    const newClimb = await IndividualClimb.create({
      typeOfClimb: req.body.typeOfClimb,
      difficulty: req.body.Difficulty,
      attempts: req.body.Attempts,
      top: req.body.Top,
      image: result.secure_url,
      cloudinaryId: result.public_id,
      tags: req.body.Keywords,
      notes: req.body.Notes,
      user: req.user.id
    });
    // Save the new IndividualClimb document
    const savedClimb = await newClimb.save();

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
    }
    // If no session exists, create a new one and add the new IndividualClimb to it
    else {
      const newSession = await ClimbingSession.create({
        user: req.user.id,
        climbs: [newClimb],
      });
      console.log("New session has been created with the new individual climb:", newSession);
    }
    // res.redirect("/profile");
  } catch (err) {
    console.log(err);
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
