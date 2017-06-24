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
    update: function(card, callback, failure) {
      failure = failure || function() {};
      var data = JSON.stringify(card);
      $.ajax(this._root + card.id,
             {type: "PUT", data: data, success: callback, error: failure});
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
      if (!this._get('get_all')) {
        // Very first time, just do a duplicate GET, rather than trying to
        // be notified of the end of __initialize's call
        this.__wrappedApi.get_all(callback);
      } else {
        callback(this._get('get_all'));
      }
    },
    update: function(card, callback) {
      var updates = this._get('update');
      updates.push(card);
      this._set('update', updates);
      this.__clearUpdateQueue();
      callback(card);
    },
    add: function(card, callback) {
      alert("Adding new cards in Cards.enable_caching() mode is not supported.");
    },
    del: function(cardid, callback) {
      alert("Deleting cards in Cards.enable_caching() mode is not yet supported.");
    },
    __initialize: function() {
      if (!this._get('get_all'))
        this._set('get_all', []);
      this.__wrappedApi.get_all(cards => this._set('get_all', cards));

      if (!this._get('update'))
        this._set('update', []);
      this.__clearUpdateQueue(); // in case any are left from last time
    },
    __clearUpdateQueue: function() {
      var updates = this._get('update');
      if (updates.length > 0) {
        var card = updates.shift();
        this._set('update', updates);
        this.__wrappedApi.update(card, () => {
          this.__clearUpdateQueue();
        }, () => {
          // Failure -- put it back on the front of the list
          var updates = this._get('update');
          updates.unshift(card);
          this._set('update', updates);
          // Check for network in a bit unless someone else already is
          if (!this.__clearUpdateIsSleeping) {
            this.__clearUpdateIsSleeping = true;
            setTimeout(() => {
              this.__clearUpdateIsSleeping = false;
              this.__clearUpdateQueue();
            }, 10000);
          }
        });
      }
    },

    _get: function(key) {
      var json = localStorage.getItem(key);
      if (!json)
        return undefined;
      return JSON.parse(json);
    },
    _set: function(key, val) {
      var json = JSON.stringify(val);
      localStorage.setItem(key, json);
    },

    __wrappedApi: undefined
  }
}

