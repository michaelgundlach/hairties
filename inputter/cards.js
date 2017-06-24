Cards = {

  api: {
    _root: "http://hairties.sorryrobot.com/api/cards/",

    // Call callback(cards) with a list of all cards.
    get_all: function(callback) {
      $.ajax(this._root,
             {type: "GET", success: callback});
    },

    // Add a new card, calling callback(card) with the newly created card.
    add: function(card, callback) {
      var data = JSON.stringify(card);
      $.ajax(this._root,
             {type: "POST", data: data, success: callback});
    },

    // Update |card|, calling callback() upon success.
    update: function(card, callback) {
      var data = JSON.stringify(card);
      $.ajax(this._root + card.id,
             {type: "PUT", data: data, success: callback});
    },

    // Delete the given card id, calling callback() upon success.
    del: function(cardid, callback) {
      $.ajax(this._root + cardid,
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
  }
}
