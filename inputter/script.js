// Add a row to the top of the table.
// Row is an object mapping column names to values.
function addRow(table, row) {
  var tr = $("<tr>");
  table.find("tbody").prepend(tr);
  headers($("#cards_table")).forEach(function(header) {
    header = header.toLowerCase().replace(/ /g, '_');
    tr.append($("<td>").addClass("col-" + header).text(row[header]));
  });
  var delBtn = $("<input>", {type:"button", val: "X"});
  var editBtn = $("<input>", {type:"button", val: ":("}).
    click(function() {
      // Fill in textboxes with this row's content
      ["han", "pinyin", "english"].forEach(function(col) {
        $("#" + col).val(tr.find(".col-" + col).text());
      });
      $("#han").focus().select();
      delBtn.click();
    });
  var editTd = $("<td>").addClass("edit").append(editBtn);
  tr.append(editTd);
  delBtn.click(function() {
    Cards.api.del(row['id'], function() {
      tr.hide(function() { tr.remove(); });
    });
  });
  var delTd = $("<td>").addClass("del").append(delBtn);
  tr.append(delTd);
}

// The headers for the given table, in order.
function headers(table) {
  return table.find("thead tr td").map((i,node) => $(node).text()).get();
}


$(function() {
  Cards.api.get_all(function(cards) {
    $("#cards_table tbody").html("");
    cards.forEach(function(card) {
      addRow($("#cards_table"), card);
      $("#pack_name").val(card.pack_name);
    });
  });

  $("#add").click(function() {
    // Make sure we don't already have it
    var dups = $(".col-han:contains('" + $("#han").val() + "')");
    if (dups.length > 0) {
      var val = (col) => dups.eq(0).parent().find(".col-" + col).text();
      var dup_id = val("id");
      var warning = "ERROR: duplicate of " + val("pack_name") + " #" + val("id") + " (" + val("pinyin") + " = " +
        val("english") + ")";
      $("#dup_warning").text(warning);
      return;
    }
    $("#dup_warning").text("");
    var card = {
      han: $("#han").val(),
      pinyin: prettify_pinyin($("#pinyin").val()),
      english: $("#english").val(),
      pack_name: $("#pack_name").val(),
      errors: []
    };
    Cards.api.add(card, function(newCard) {
      $("#new input:text").val("");
      $("#pack_name").val(newCard.pack_name);
      addRow($("#cards_table"), newCard);
    });
  });

  $("#new input:text").keypress(function(e) {
    if (e.keyCode === 13) {
      $("#add").click();
      $("#new input:first-child").focus();
    }
  });

  $("#han").focus();
});
