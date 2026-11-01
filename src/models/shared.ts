import { Schema } from "mongoose";

export const LocalizedSchema = new Schema(
  {
    en: { type: String, default: "" },
    az: { type: String, default: "" },
  },
  { _id: false },
);
