PacksViewer = function() {}
PacksViewer.__proto__ = {

  // Make a clickable button for each virtual and actual pack available.
  showPacksFor: function(cards) {
    this.cards = cards;

    // Add a button for each pack name, in most-recently-added-a-card order
    var dup = {}; // duplicates, for unique-ing in filter() below
    cards.
      sort((card1,card2) => card1.created_date > card2.created_date ? -1 : 1).
      map(card => card.pack_name).
      filter(name => { if (name in dup) return false; dup[name] = 1; return true; }).
      forEach(name => { 
        var btn = $("<input>", { value: name, type: "button", "data-pack-name": name}).
          addClass("pack").
          appendTo("#actual");
      });
    $(".packs input.pack").click(e => this.showPack(e.target.dataset.packName));

    $("body").show();
  },

  // All cards, loaded from the backend
  cards: undefined,

  showPack: function(packName) {
    if (packName.indexOf("__") === 0)
      this.showVirtualPack(packName);
    else
      this.showActualPack(packName);
  },

  showVirtualPack: function(packName) {
    // Predicate to select cards with.  By default, no cards (in case we don't
    // implement the virtual pack for some reason.)
    var which = (card) => false;

    if (packName === "__all") {
      which = (card) => true;
    } else if (packName === "__wrongs") {
      which = (card) => card.errors.length > 0;
    } else if (packName === "__multiple") {
      // TODO: select multiple
      which = (card) => true;
    }
    CardViewer.reviewCards(this.cards.filter(which), packName);
  },

  showActualPack: function(packName) {
    var which = (card) => card.pack_name === packName;
    CardViewer.reviewCards(this.cards.filter(which), "basicFaces");
  }
};
