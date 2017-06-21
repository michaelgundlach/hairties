$(function() {
  Cards.enable_caching();
  Cards.api.get_all(cards => PacksViewer.showPacksFor(cards));
});
