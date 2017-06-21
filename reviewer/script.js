// List of packs (which are lists of cards), loaded from the backend
PACKS = [];

// The card faces, in order, to show on all cards.  Some virtual packs
// e.g. the pack of all cards with errors may show some virtual faces
// too e.g. the most common error that you make.
const basicFaces = [ "han", "pinyin", "english" ];

const virtualPacks = [
  {title: "All Cards", name: "__all"},
  {title: "Multiple Packs (TODO)", name: "__multiple"},
  {title: "Cards With Errors", name: "__wrongs"}
];

function buttonForPack(title, packName) {
  return $("<input>", {value: title, type: "button"}).
    addClass("pack").
    click(() => showPack(packName));
}

function showPack(packName) {
  if (packName.indexOf("__") === 0)
    showVirtualPack(packName);
  else
    showActualPack(packName);
}

function showVirtualPack(packName) {
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
  Reviewer.reviewCards(Cards.withinPacks(PACKS).filter(which));
}

function showActualPack(packName) {
  var which = (card) => card.pack_name === packName;
  Reviewer.reviewCards(Cards.withinPacks(PACKS).filter(which));
}

Reviewer = {
  // List of cards currently being reviewed
  REVIEW_CARDS: undefined,
  // Index into REVIEW_CARDS currently being reviewed
  CURRENT_CARD: undefined,

  reviewCards: function(cards) {
    if (cards.length === 0) {
      alert("Oops: nothing to review!");
      return;
    }

    Reviewer.REVIEW_CARDS = cards;
    Reviewer.REVIEW_CARDS.sort(() => Math.random() - 0.5); // inefficient shuffle
    Reviewer.CURRENT_CARD = 0;

    $(".packs").hide();
    $(".reviewer").show();
    Reviewer.reviewACard();
  },

  // Display a card in the reviewer.
  reviewACard: function() {
    var card = Reviewer.REVIEW_CARDS[Reviewer.CURRENT_CARD];
    $(".faces").html("");
    // TODO: display these properly, and generalize for virtual packs
    // like __wrongs that have other faces to display
    basicFaces.forEach(function(face) {
      var div = $("<div>").text(card[face]);
      div.appendTo(".faces");
    });
  },

  reviewNext: function() {
    Reviewer.CURRENT_CARD += 1;
    if (Reviewer.REVIEW_CARDS[Reviewer.CURRENT_CARD] === undefined) {
      Reviewer.CURRENT_CARD = 0;
    }
    Reviewer.reviewACard();
  },

  closeReviewer: function() {
    $(".reviewer").hide();
    $(".packs").show();
  },

  addError: function(i) {
    var card = Reviewer.REVIEW_CARDS[Reviewer.CURRENT_CARD];
    card.errors.push(i);
    Cards.api.update(card, () => Reviewer.reviewNext());
  },

  clearErrors: function() {
    var card = Reviewer.REVIEW_CARDS[Reviewer.CURRENT_CARD];
    card.errors = [];
    Cards.api.update(card, () => Reviewer.reviewNext());
  },
};

// Assumes PACKS global variable has been loaded.
function loadPacksList() {
  virtualPacks.forEach(function(pack) {
    $("#virtual").append(buttonForPack(pack.title, pack.name));
  });

  PACKS.forEach(function(pack) {
    $("#actual").append(buttonForPack(pack[0].pack_name, pack[0].pack_name));
  });

  $(".packs").show();
}

$(function() {
  $("#review-next").click(() => Reviewer.reviewNext());
  $("#review-close").click(() => Reviewer.closeReviewer());
  $("#review-err1").click(() => Reviewer.addError(1));
  $("#review-err2").click(() => Reviewer.addError(2));
  $("#review-err3").click(() => Reviewer.addError(3));
  $("#review-err4").click(() => Reviewer.addError(4));
  $("#review-clearerrors").click(() => Reviewer.clearErrors());

  $(".reviewer, .packs").hide();

  Cards.api.get_all(function(cards) {
    var cardCompare = (c1, c2) => (c1.created_date < c2.created_date);
    var packCompare = (p1, p2) => cardCompare(p1[0], p2[0]);
    PACKS = Cards.groupedByPack(cards, cardCompare, packCompare);
    loadPacksList();
  });
});
