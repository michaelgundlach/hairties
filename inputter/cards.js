Cards = {

  api: {
    // Call callback(cards) with a list of all cards.
    get_all: function(callback) {
      $.ajax("/api/cards/",
             {type: "GET", success: callback});
    },

    // Add a new card, calling callback(card) with the newly created card.
    // TODO how to handle caching adds?!?
    add: function(card, callback) {
      var data = JSON.stringify(card);
      $.ajax("/api/cards/",
             {type: "POST", data: data, success: callback});
    },

    // Update |card|, calling callback() upon success.
    update: function(card, callback) {
      var data = JSON.stringify(card);
      $.ajax("/api/cards/" + card.id,
             {type: "PUT", data: data, success: callback});
    },

    // Delete the given card id, calling callback() upon success.
    del: function(cardid, callback) {
      $.ajax("/api/cards/" + cardid,
             {type: "DELETE", success: callback});
    }
  },

  // Helper functions

  // Returns [pack, pack, pack] where each pack is [card, card, card].
  // All cards in a pack have the same .pack_name.
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
  },

  // Flatten the list of packs of cards into a list of cards.
  withinPacks: function(packs) {
    // This is just a one-level flatten.
    return Array.prototype.concat.apply([], packs);
  }
}
