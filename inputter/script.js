$(function() {
  $.get("/api/cards/", function(cards) {
    $("#mytable").dynatable({
      dataset: {
        records: cards
      }
    });
  });

  $("#add").click(function() {
    var card = {
      han: $("#han").val(),
      pinyin: $("#pinyin").val(),
      english: $("#english").val(),
      pack_name: $("#pack_name").val(),
      errors: []
    };
    $.post("/api/cards/", JSON.stringify(card));
  });
});
