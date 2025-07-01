const Review = require("../models/ReviewModel");
exports.createReview = async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    return res.status(201).send(review);
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ _id: -1 });
    return res.status(201).send(reviews);
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};
exports.getAllReviewsById = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const reviews = await Review.find({ restaurant_id: restaurantId });
    return res.json(reviews);
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};
exports.deleteReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    return res.json(review);
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};
