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
    $.ajax("/api/cards/" + card.id, 
           {type: "PUT", data: JSON.stringify(card), success: callback});
  },

  del: function(cardid, callback) {
    $.ajax("/api/cards/" + cardid, 
           {type: "DELETE", success: callback});
  }
}
