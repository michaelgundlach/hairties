Cards = {
  get_all: function(callback) {
    $.get("/api/cards/", callback);
  },

  add: function(card, callback) {
    $.post("/api/cards/", JSON.stringify(card), function(newCard) {
      callback(newCard);
    }, "json");
  },

  update: function(card, callback) {
    $.put("/api/cards/" + card.id, JSON.stringify(card), callback);
  }
}
