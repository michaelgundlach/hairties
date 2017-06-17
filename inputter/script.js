$(function() {
  $.get("/api/cards/", function(cards) {
    $("#mytable").dynatable({
      dataset: {
        records: cards
      }
    });
  });
});
