// /backend/case_report.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/***
*	Mongo Messafe Model
*	@param {Number} id - id of the Case Report
*	@param {String} title - title of the Case Report
*	@param {String} description - description of the Case Report
*	@param {{ type: Date, default: Date.now }} date - date of the Case Report
*/
const CaseReportSchema = new Schema(
  {
    pmID: 0,
    messages: [],
    source_files: [],
    modifications: [],
    normalizations: [],
    // ctime 			: 1351154734.5055847,
    text: String,
    entities: [],
    attributes: [],
    // date : { type: Date, default: Date.now }
    relations: [],
    triggers: [],
    events: [],
    equivs: [],
    comments: [],
    // sentence_offsets 	: [],
    // token_offsets 	: [],
    action: String,
    title: String,
    abstract: String,
    authors: [],
    keywords: [],
    introduction: String,
    discussion: String,
    references: []
  },
  { timestamps: true }
);



// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("CaseReport", CaseReportSchema);