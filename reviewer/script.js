$(function() {
  $("#controls-next").click(e => CardViewer.reviewNextCard());
  $("#controls-close").click(e => CardViewer.closeReviewer());
  $("#controls-clearerrors").click(e => CardViewer.clearErrors());
  $("#controls-error").click(e => $("#controls-error-types").show());
  $("input:button.error").click(e => CardViewer.addError(e.target.dataset.errorId));

  Cards.enable_caching();

  Cards.api.get_all(function(cards) {
    var cardCompare = (c1, c2) => (c1.created_date < c2.created_date);
    var packCompare = (p1, p2) => cardCompare(p1[0], p2[0]);
    var packs = Cards.groupedByPack(cards, cardCompare, packCompare);
    PacksViewer.showPacks(packs);
  });
});
