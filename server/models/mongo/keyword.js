// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
*	Mongo Keyword Model
*	@param {Number} keyword - keyword
*	@param {List} pmIDs - documents contain the keyword
*/
const KeywordSchema = new Schema(
    {
        keyword: {
            type: String,
            unique: true,
            required: true
        },
        pmIDs: []
    },
    { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Keyword", KeywordSchema);