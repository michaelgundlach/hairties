Cards = {

  api: {
    // Call callback(cards) with a list of all cards.
    get_all: function(callback) {
      $.ajax("/api/cards/",
             {type: "GET", success: callback});
    },

    // Add a new card, calling callback(card) with the newly created card.
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

  // Assume Cards will be used with intermittent network connectivity.  Cache
  // writes for when we're online, and cache reads for when we're offline.
  enable_caching: function() {
    Cards.__cachingApi.__wrappedApi = Cards.api;
    Cards.api = Cards.__cachingApi;
    Cards.api.__initialize();
  },

  // See Cards.api for basic descriptions, except that this one caches reads
  // offline, and queues writes for when we're online.
  __cachingApi: {
    get_all: function(callback) {
      console.log("TODO: caching");
      Cards.api.__wrappedApi.get_all(callback);
    },
    add: function(card, callback) {
      alert("Adding new cards in Cards.enable_caching() mode is not supported.");
    },
    update: function(card, callback) {
      console.log("TODO: caching");
      Cards.api.__wrappedApi.update(card, callback);
    },
    del: function(cardid, callback) {
      console.log("TODO: caching");
      Cards.api.__wrappedApi.del(cardid, callback);
    },
    __initialize: function() {
      console.log("TODO: caching");
    }
  },

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
