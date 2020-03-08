const express = require("express");
const PostController = require('../controllers/posts');

const checkAuth = require('../middleware/check-auth');
const mameTypes = require('../middleware/mame');

const router = express.Router();

router.post("", checkAuth, mameTypes, PostController.createPost);

router.put("/:id", checkAuth, mameTypes, PostController.updatePost);

router.get("", PostController.getPosts);
router.get("/:id", PostController.getPost);

router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;
