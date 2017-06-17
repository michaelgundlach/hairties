// Add a row to the top of the table.
// Row is an object mapping column names to values.
function addRow(table, row) {
  var tr = $("<tr>");
  table.find("tbody").prepend(tr);
  headers($("#mytable")).forEach(function(header) {
    tr.append($("<td>").text(row[header.toLowerCase()]));
  });
}

// The headers for the given table, in order.
function headers(table) {
  return table.find("thead tr td").map((i,node) => $(node).text()).get();
}

function loadTable() {
  Cards.get_all(function(cards) {
    $("#mytable tbody").html("");
    cards.forEach(function(card) {
      addRow($("#mytable"), card);
    });
  });
}

$(function() {
  loadTable();

  $("#add").click(function() {
    var card = {
      han: $("#han").val(),
      pinyin: $("#pinyin").val(),
      english: $("#english").val(),
      pack_name: $("#pack_name").val(),
      errors: []
    };
    Cards.add(card, function(newCard) {
      $("#new input:text").val("");
      $("#pack_name").val(newCard.pack_name);
      addRow($("#mytable"), newCard);
    });
  });
});
