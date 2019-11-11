$(document).on("click", ".saveButton", function() {
    var thisId = $(this).attr("data-id")

    $.ajax({
        method: "POST",
        url: "/save/" + thisId,
      })
    
        .then(function(data) {
          console.log(data);
        });
})

$(document).on("click", ".saveNoteButton", function() {
  var thisId = $(this).attr("data-id")

  console.log("Saving note for aritcle " + thisId)

  $.ajax({
      method: "POST",
      url: "/saveNote/" + thisId,
      data: {'note': $("#ta-" + thisId).val()}
    })
  
      .then(function(data) {
        console.log(data);
      });
})

$(document).on("click", ".scrapeButton", function() {
  var thisId = $(this).attr("data-id")

  $.ajax({
      method: "GET",
      url: "/scrape"
    })
  
      .then(function(data) {
        console.log(data);
      });
})
$(document).on("click", ".deleteButton", function(){
  $.ajax({
      method: "DELETE",
      url: "/articles/delete" 
      })
  .then(function(data) {
      console.log("deleted")
  })
})
