PacksViewer = function() {}
PacksViewer.__proto__ = {
  virtualPacks: [
    {title: "All Cards", name: "__all"},
    {title: "Multiple Packs (TODO)", name: "__multiple"},
    {title: "Cards With Errors", name: "__wrongs"}
  ],

  loadPacksList: function(packs) {
    this.packs = packs;
    this.virtualPacks.forEach(pack => {
      $("#virtual").append(this.buttonForPack(pack.title, pack.name));
    });

    this.packs.forEach(pack => { 
      $("#actual").append(this.buttonForPack(pack[0].pack_name, pack[0].pack_name));
    });

    $(".packs").show();
  },

  // List of packs (which are lists of cards), loaded from the backend
  packs: undefined,

  // Return an <input> you can click to review a pack.
  buttonForPack: function(title, packName) {
    return $("<input>", {value: title, type: "button"}).
      addClass("pack").
      click(() => this.showPack(packName));
  },

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

$(function() {
  $("#controls-next").click(e => CardViewer.reviewNextCard());
  $("#controls-close").click(e => CardViewer.closeReviewer());
  $("#controls-clearerrors").click(e => CardViewer.clearErrors());
  $("#controls-error").click(e => $("#controls-error-types").show());
  $("input:button.error").click(e => CardViewer.addError(e.target.dataset.errorId));

  $(".reviewer, .packs").hide();

  Cards.enable_caching();

  Cards.api.get_all(function(cards) {
    var cardCompare = (c1, c2) => (c1.created_date < c2.created_date);
    var packCompare = (p1, p2) => cardCompare(p1[0], p2[0]);
    var packs = Cards.groupedByPack(cards, cardCompare, packCompare);
    PacksViewer.loadPacksList(packs);
  });
});
