import mongoose, { Schema } from "mongoose";

const topicSchema = new Schema({
  topics: [
    {
      topic: { type: String, required: true },
      isCovered: { type: Boolean, default: false },
    },
  ],
  course: { type: Schema.Types.ObjectId, required: true },
});

export const Topic = mongoose.model("Topic", topicSchema);
