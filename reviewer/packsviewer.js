PacksViewer = function() {}
PacksViewer.__proto__ = {

  // Make a clickable button for each virtual and actual pack available.
  showPacksFor: function(cards) {
    var cardCompare = (c1, c2) => (c1.created_date < c2.created_date);
    var packCompare = (p1, p2) => cardCompare(p1[0], p2[0]);
    this.packs = Cards.groupedByPack(cards, cardCompare, packCompare);

    this.packs.forEach(pack => { 
      var name = pack[0].pack_name;
      var btn = $("<input>", { value: name, type: "button", "data-pack-name": name}).
        addClass("pack").
        appendTo("#actual");
    });
    $(".packs input.pack").click(e => this.showPack(e.target.dataset.packName));

    $("body").show();
  },

  // List of packs (which are lists of cards), loaded from the backend
  packs: undefined,

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
    CardViewer.reviewCards(Cards.withinPacks(this.packs).filter(which), packName);
  },

  showActualPack: function(packName) {
    var which = (card) => card.pack_name === packName;
    CardViewer.reviewCards(Cards.withinPacks(this.packs).filter(which), "basicFaces");
  }
};
