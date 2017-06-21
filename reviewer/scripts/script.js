$(function() {
  $("#controls-next").click(e => CardViewer.reviewNextCard());
  $("#controls-close").click(e => CardViewer.closeReviewer());
  $("#controls-clearerrors").click(e => CardViewer.clearErrors());
  $("#controls-error").click(e => $("#controls-error-types").show());
  $("input:button.error").click(e => CardViewer.addError(e.target.dataset.errorId));

  Cards.enable_caching();

  Cards.api.get_all(cards => PacksViewer.showPacksFor(cards));
});
