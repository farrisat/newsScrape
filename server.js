var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');
var axios = require("axios");
var cheerio = require("cheerio");
var request = require ("request")


var db = require("./models");
var PORT = 3030;

var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
app.engine('handlebars', exphbs({ defaultLayout: 'main',helpers:{buildFtLink:buildFtLink, buildTaId:buildTaId} }));
app.set('view engine', 'handlebars');


// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
function buildFtLink (article) {
  if (article.startsWith("https://www.ft.com")) {
    return article 
  }

  else {
    return "https://www.ft.com" + article
  }
}

function buildTaId(id) {
  return "ta-" + id
}

// mongoose.connect(MONGODB_URI);
app.get("/", (req, res)=>{
  console.log("lookup articles")
  db.Article.find({})
    .then(function(dbArticle) {
      console.log("render index")
      res.render("index", {articles: dbArticle})
    })
    .catch(function(err) {
     
      res.json(err);
    });
})

// A GET route for scraping the Financial Timeswebsite
app.get("/scrape", function(req, res) {
  console.log("scraping ft")
  axios.get("https://www.ft.com")
  .then(response=> {
    console.log("Loading cheerio")
    var $ = cheerio.load(response.data);
    $(".o-teaser--small").each((i, elem) =>{
      var test_article = {
        // title: "article",
        img: $(".o-teaser__image-placeholder > a>img", $(elem).html()).attr("src"),
        title: $(" .o-teaser__heading",$(elem).html()).text(),
        summary:$("p > a",$(elem).html()).text(),
        link: "https://www.ft.com" + $('p >a',$(elem).html()).attr("href"),
      }

      console.log("entering db")
      console.log(test_article)
      db.Article.create(test_article)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);


        })
        console.log("db done")
        // data.push (test_article);
      });
    
    });

    // Send a message to the client
    console.log("Scrape complete");
    res.send("Scrape Complete");
  });
// });

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
     
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/save/:id", function(req, res){
  db.Article.findOneAndUpdate({ _id: req.params.id }, { issaved: true}, { new: true })
    .then(function(dbArticle){
      res.json({foo:req.params.id})
    })

}
)

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.delete("/articles/delete", function(req, res){
  db.Article.deleteMany()

  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
    res.json({});
    
})


app.get("/savedArticles", function(req,res) {
  db.Article.find({issaved:true})
  .then(function(dbArticle) {
      res.render("savedArticles", {articles: dbArticle})    
  })
  .catch(function(err) {
   
    res.json(err);
  });
})

// app.get("/savedNotes/:id", function(req,res) {
//   db.Note.find({articleId:req.params.id})
//   .then(function(dbNote) {
//     res.json(dbNote);
//   })
//   .catch(function(err) {
//     res.json(err);
//   });
// })

app.post("/saveNote/:id", function(req,res) {
  console.log(req.body)
  console.log(req.params.id)
  db.Article.update({_id:req.params.id}, {note: req.body.note}, {new: false})
  .then(function(dbNote) {
    res.json({})
  })
  .catch(function(err) {
    res.json(err);
  });
})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
 
});
