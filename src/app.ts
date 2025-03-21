import connectDB from "./db/db";
import app from "./index";


const port = process.env.PORT || 3000

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(
        `Server is listening at http://localhost:${port}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
