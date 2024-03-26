import { app } from "./src/app.js";
import dotenv from "dotenv";

import connectDb from "./src/db/index.js";
dotenv.config({
  path: "./.env",
});

// dotenv.config();

let port = process.env.PORT || 8000;
connectDb()
  .then(() => {
    app.on("error", (err) => {
      console.log("error", err);
      throw err;
    });
    app.listen(port, () => {
      console.log(`server is listening on ${port}`);
    });
  })
  .catch((err) => {
    console.log("DB connection failed", err);
  });
