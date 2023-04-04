// Title type, required, minLength, maxLength
// Description type, required, minLength
// Lectures title,description,videos { public_id,url }
// Poster public_id, url
// Views type, default
// NumOfVideos type, default
// Category type, required

import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: [100, "Atmost 100 Character allowed"],
    minLength: [10, "Atleast 10 Character required."],
  },
  description: {
    type: String,
    required: true,
    minLength: [30, "Atleast 20 Character required."],
  },
  lectures: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      video: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],
  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  noOfVideos: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "user",
    type: String,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

const CourseModel = mongoose.model("course", courseSchema);

export default CourseModel;
