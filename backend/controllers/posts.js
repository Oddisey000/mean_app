const Post = require("../models/post");

exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: "Post added successfully",
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Creating a post failde!'
    });
  });
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
    if (result.n > 0) {
      res.status(200).json({ message: "Update successful!" });
    } else {
      res.status(401).json({ message: 'Not authorize' });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Could not update post!'
    });
  });
}

exports.getPosts = (req, res, next) => {
  // Get query parameter under ? mark
  const pageSize = +req.query.pageSize; // convert to number
  const currentPage = +req.query.page; // convert to number
  const postQuery = Post.find();
  // Use variable to save resolved data for future conditions
  let fetchPosts;
  
  // Check if there need to be retrive a slice of posts
  if (pageSize && currentPage) {
    postQuery
      // skip all items shown in current page and load next portion of items
      .skip(pageSize * (currentPage - 1))
      // Return amount of items defined in front end
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      // Fetch data and count number of posts
      fetchPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        // Send back posts information and count of posts
        message: 'Posts fetching successfuly',
        posts: fetchPosts,
        maxPosts: count
      })
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      });
    });
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Fetching post failed!'
    });
  });
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
    console.log(result);
    if (result.n > 0) {
      res.status(200).json({ message: "Post deleted!" });
    } else {
      res.status(401).json({ message: "Not authorize" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Deleting post failed!'
    });
  });
}