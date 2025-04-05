import connectDB from "../src/db/index.js";
import app from "../src/app.js";

connectDB()
    .then(() => {
        const port = process.env.PORT || 3000;
        app.on("error", (error) => {
            console.log(error);
            process.exit(1);
        });

        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error(err);
    });

