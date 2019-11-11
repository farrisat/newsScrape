var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },
  summary: {
		type: String,
		default: "Summary unavailable."
	},
	img: {
    type: String,
		// default: "/assets/images/unavailable.jpg"
	},
	issaved: {
		type: Boolean,
		default: false
	},

  note: {
    type: String,
    ref: "Note"
  }
});

ArticleSchema.index({title: "text"});
var Article = mongoose.model("Article", ArticleSchema);


module.exports = Article;

