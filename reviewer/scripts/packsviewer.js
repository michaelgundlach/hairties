PacksViewer = function() {}
PacksViewer.__proto__ = {

  // Make a clickable button for each virtual and actual pack available.
  showPacksFor: function(cards) {

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
    $(".packs input.pack").click(e => this._reviewPack(cards, e.target.dataset.packName));

    $("body").show();
  },

  // Open the reviewer.
  _reviewPack: function(cards, packName) {
    if (packName.indexOf("__") === 0)
      this._reviewVirtualPack(cards, packName);
    else
      this._reviewActualPack(cards, packName);
  },

  // Review cards from the |cards| list, selected based on |virtualPackName|.
  _reviewVirtualPack: function(cards, virtualPackName) {
    // Predicate to select cards with.  By default, no cards (in case we don't
    // implement the virtual pack for some reason.)
    var which = (card) => false;

    if (virtualPackName === "__all") {
      which = (card) => true;
    } else if (virtualPackName === "__wrongs") {
      which = (card) => card.errors.length > 0;
    } else if (virtualPackName === "__multiple") {
      // TODO: select multiple
      which = (card) => true;
    }
    CardViewer.reviewCards(cards.filter(which), virtualPackName, this._selectedFace());
  },

  // Review the cards from the |cards| list with the given |packName|.
  _reviewActualPack: function(cards, packName) {
    var which = (card) => card.pack_name === packName;
    CardViewer.reviewCards(cards.filter(which), "basicFaces", this._selectedFace());
  },

  _selectedFace: () => $(".settings input[checked]").val()
};

$(function() {
  $(".packsviewer .settings input").click(function() {
    $(this).siblings().attr("checked", null);
    $(this).attr("checked", true);
  });
});
