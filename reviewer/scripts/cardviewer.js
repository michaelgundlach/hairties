CardViewer = function() {}
CardViewer.__proto__ = {
  reviewCards: function(cards, rendererName) {
    if (cards.length === 0) {
      alert("Oops: nothing to review!");
      return;
    }

    $(".packs").hide();
    $(".reviewer").show();

    this._current.cards = cards;
    this._current.cards.sort(() => Math.random() - 0.5); // inefficient shuffle
    this._current.rendererName = rendererName;
    this._current.i = -1; // so reviewNextCard will set it to 0

    this._reviewNextCard();
  },

  // Display a card number |i| in the reviewer.
  _reviewNextCard: function() {
    this._current.i += 1;
    if (this._current.card() === undefined) {
      this._current.i = 0;
    }
    var $el = $("<div>", {"class": "card"}).
      append($("<div>", {"class": "card-top-half"})).
      append($("<div>", {"class": "card-bottom-half"}));
    var renderer = this._packRenderers[this._current.rendererName];
    // Set 'this' to this._packRenderers inside the renderer
    renderer.call(this._packRenderers, $el, this._current.card()).replaceAll(".card");
    $("#reveal-all-section").show();
    $(".controls-section:not(#reveal-all-section)").hide();
  },

  _closeReviewer: function() {
    $(".reviewer").hide();
    $(".packs").show();
  },

  _addError: function(errorId) {
    var card = this._current.card();
    card.errors.push(errorId);
    Cards.api.update(card, () => this._reviewNextCard());
  },

  _clearErrors: function() {
    var card = this._current.card();
    card.errors = [];
    Cards.api.update(card, () => {
      this._current.cards = this._current.cards.filter(c => c !== card);
      if (this._current.cards.length === 0) {
        this._closeReviewer();
      } else {
        this._current.i -= 1;
        this._reviewNextCard();
      }
    })
  },

  // "Right" button should move to the next card, unless in
  // __wrongs mode where it asks to clear errors.
  _handleCorrectAnswer: function() {
    $("#right-wrong-section").hide();
    if (this._current.rendererName === "__wrongs") {
      $("#next-clear-errors-section").show();
    } else {
      this._reviewNextCard();
    }
  },


  // quasi-global to hold info about our current study session.
  _current: {
    card: function() { return this.cards[this.i]; },

    cards: [],
    i: 0,
    rendererName: undefined
  },

  // These render the flash card to HTML, customizing the look of the card
  // depending on its context.  The basicFaces renderer adds han/pinyin/english
  // faces.  Other renderers are more funky.  The __all renderer, for example,
  // adds a small hidden "pack name" face, as a clue to the han meaning; and
  // the __wrongs renderer adds an unhidden "here's what you tend to get wrong"
  // face.
  //
  // Renderers are decorators on the jQuery element pointing to the <card> element
  // element being constructed.
  _packRenderers: {
    basicFaces: function($el, card) {
      $el.append(this._newFace(card.han, "face-han"));
      $el.append(this._newFace("Pinyin", "face-pinyin", card.pinyin));
      $el.append(this._newFace("English", "face-english", card.english));
      return $el;
    },
    // TODO: Fish requests view showing English and hiding pinyin & han 
    __all: function($el, card) {
      $el = this.basicFaces($el, card);
      $el.append(this._newFace("pack name", "face-pack_name", card.pack_name));
      return $el;
    },
    __multiple: function($el, card) {
      // Does the same thing as __all
      return this.__all($el, card);
    },
    __wrongs: function($el, card) {
      $el = this.basicFaces($el, card);
      function mode(arr){
        return arr.concat().sort((a,b) =>
          arr.filter(v => v===a).length
          - arr.filter(v => v===b).length
        ).pop();
      }
      var commonestError = mode(card.errors);
      var hint = $("input:button.error[data-error-id="+commonestError+"]").data("errorHint");
      $el.prepend(this._newFace("Warning: " + hint, "face-hint"));
      return $el;
    },

    // If answer is not undefined, returns a .obscured face with the data-answer element
    // containing the answer.
    // <div class="face obscured" id="face-pinyin" data-answer="hao">pinyin</div>
    _newFace: function(text, id, answer) {
      var face = $("<div>", {
        "class": "face",
        text: text,
        id: id
      });
      if (answer !== undefined) {
        face.
          addClass("obscured").
          attr("data-answer", answer).
          click(e => face.removeClass("obscured").text(answer));
      }
      return face;
    }
  }

};

$(function() {
  $(".controls-reveal-all").click(function() {
    $("#reveal-all-section, #right-wrong-section").toggle();
    $(".obscured").click();
  });
  $(".controls-wrong").click(function() {
    $("#right-wrong-section, #error-types-section").toggle();
  });
  $(".controls-right").click(function() {
    CardViewer._handleCorrectAnswer();
  });
  $(".controls-next").click(e => CardViewer._reviewNextCard());
  $(".controls-clear-errors").click(e => CardViewer._clearErrors());
  $("input:button.error").click(e => CardViewer._addError(e.target.dataset.errorId));
  // TODO Close with back button
  $("#todo-temp-closer").click(e => CardViewer._closeReviewer());
});
