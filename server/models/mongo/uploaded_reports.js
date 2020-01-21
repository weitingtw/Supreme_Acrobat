// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
*	Mongo Uploaded Report Model
*	@param {Number} id - id of the message
*	@param {String} message - content of the message
*/
const UploadedReportSchema = new Schema(
    {
        text: {
            type: String,
            unique: true,
            required: true
        }
    },
    { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("UploadedReport", UploadedReportSchema);