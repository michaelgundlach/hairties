// TODO: reorder into packlist-based code and card-viewer-based code

// List of packs (which are lists of cards), loaded from the backend
PACKS = [];

// The card faces, in order, to show on all cards.  Some virtual packs
// e.g. the pack of all cards with errors may show some virtual faces
// too e.g. the most common error that you make.
const basicFaces = [ "han", "pinyin", "english" ];

const errorTypes = {
  "p": "forgot pronunciation",
  "t": "forgot tone",
  "m": "forgot English meaning",
  "c": "confused with another character"
};

const virtualPacks = [
  {title: "All Cards", name: "__all"},
  {title: "Multiple Packs (TODO)", name: "__multiple"},
  {title: "Cards With Errors", name: "__wrongs"}
];

// These customize the look of the flash card depending on its context.  The
// basicFaces renderer adds han/pinyin/english faces.  Other renderers are more
// funky.  The __all renderer, for example, adds a small hidden "pack name"
// face, as a clue to the han meaning; and the __wrongs renderer adds an
// unhidden "here's what you tend to get wrong" face.
//
// Renderers are decorators on the jQuery element pointing to the <faces>
// element being constructed.
const packRenderers = {
  basicFaces: function(faces, card) {
    // TODO: add han/pinyin/english
    faces.append(newFace("Han", card.han, {hidden:false}));
    faces.append(newFace("Pinyin", card.pinyin, {hidden:true}));
    faces.append(newFace("English", card.english, {hidden:true}));
    return faces;
  },
  __all: function(faces, card) {
    faces.append(newFace("Pack", card.packName, {hidden:true, className:"face-pack"}));
    return faces;
  },
  __multiple: function(faces, card) {
    // Does the same thing as __all
    return packRenderers.__all(faces, card);
  },
  __wrongs: function(faces, card) {
    function mode(arr){
      return arr.concat().sort((a,b) =>
        arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
      ).pop();
    }
    var commonestError = mode(card.errors);
    var hint = errorTypes[commonestError];
    faces.prepend(newFace("Warning", hint, {hidden:false, className:"face-mistake"}));
    return faces;
  },
};

// Returns something like
//   <div class="face face-pack">
//     <div class="face-label">Pack name</div>
//     <div class="face-value obscured">words that I hate</div>
//   </div>
// Options include 'hidden' bool (is face-value div obscured?), and a
// 'className' for the face div.
function newFace(label, value, options) {
  var face = $("<div>").addClass("face");
  if (options && options.className) {
    face.addClass(options.className);
  }
  var label = $("<div>", {
    "class": "face-label",
    text: label
  });
  var value = $("<div>", {
    "class": "face-value",
    text: value
  });
  if (options && options.hidden) {
    value.addClass("obscured");
  }
  return face.append(label).append(value);
}

// Return an <input> you can click to review a pack.
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
    var faces = $(".faces").html("");
    faces = packRenderers.basicFaces(faces, card);
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

  Cards.enable_caching();

  Cards.api.get_all(function(cards) {
    var cardCompare = (c1, c2) => (c1.created_date < c2.created_date);
    var packCompare = (p1, p2) => cardCompare(p1[0], p2[0]);
    PACKS = Cards.groupedByPack(cards, cardCompare, packCompare);
    loadPacksList();
  });
});
