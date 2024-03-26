import mongoose, { Schema } from "mongoose";

const studyMaterialSchema = Schema({
  note: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
  pdf: {
    type: String,
    default: "",
  },
  pdfPublicId: {
    type: String,
  },
  referenceLink: [
    {
      title: { type: String, default: "", trim: true },
      link: { type: String, default: "", trim: true },
    },
  ],
});

export const StudyMaterial = mongoose.model(
  "StudyMaterial",
  studyMaterialSchema
);
