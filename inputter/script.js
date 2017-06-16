$(function() {
  $.get("/api/cards/", function(data) {
    document.write(data);
  });
});
