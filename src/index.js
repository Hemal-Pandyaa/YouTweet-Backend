import connectDB from "./db/index.js";
import app from "./app.js";

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

