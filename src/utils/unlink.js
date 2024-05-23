import fs from "fs";

export const unlink = function unlink(path) {
    try {
        fs.unlinkSync(path);
        return true;
    } catch (error) {
        console.log(error);
        return null;
    }
};