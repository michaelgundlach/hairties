PACKS = [];

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
  reviewCards(Cards.withinPacks(PACKS).filter(which));
}

function showActualPack(packName) {
  var which = (card) => card.pack_name === packName;
  reviewCards(Cards.withinPacks(PACKS).filter(which));
}

function reviewCards(cards) {
  alert("TODO: Review " + cards.map((c) => c.han).join(" "));
}

// Assumes PACKS global variable has been loaded.
function loadPacksList() {
  virtualPacks.forEach(function(pack) {
    $("#virtual").append(buttonForPack(pack.title, pack.name));
  });

  PACKS.forEach(function(pack) {
    $("#actual").append(buttonForPack(pack[0].pack_name, pack[0].pack_name));
  });
}

$(function() {
  Cards.get_all(function(cards) {
    var cardCompare = (c1, c2) => (c1.created_date < c2.created_date);
    var packCompare = (p1, p2) => cardCompare(p1[0], p2[0]);
    PACKS = Cards.groupedByPack(cards, cardCompare, packCompare);
    loadPacksList();
  });
});
