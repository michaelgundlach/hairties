PACKS = [];

const virtualPacks = [
  {title: "All Cards", name: "_all"},
  {title: "Choose Packs", name: "_multiple"},
  {title: "Cards With Errors", name: "_wrongs"}
];

function buttonForPack(title, packName) {
  return $("<input>", {value: title, type: "button"}).
    addClass("pack").
    click(() => showPack(packName));
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
