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
  },

  /* TODO: move API functions into Cards.api.* ? */

  // Returns [pack, pack, pack] where each pack is [card, card, card].
  // Sort order unspecified unless cardCompare() and packCompare() functions
  // are given to pass to sort().
  groupedByPack: function(cards, cardCompare, packCompare) {
    if (cardCompare === undefined || packCompare === undefined) {
      cardCompare = (a,b) => 0;
      packCompare = (a,b) => 0;
    }

    // group cards by pack name
    var packs = cards.reduce(function(acc, card) {
      (acc[card.pack_name] = acc[card.pack_name] || []).push(card);
      return acc;
    }, {});
    packs = Object.values(packs);
    packs.forEach(function(pack) {
      pack.sort(cardCompare);
    });
    packs.sort(packCompare);
    return packs;
  }
}
