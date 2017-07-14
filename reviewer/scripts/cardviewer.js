CardViewer = function() {}
CardViewer.__proto__ = {
  reviewCards: function(cards, rendererName, showFace) {
    if (cards.length === 0) {
      alert("Oops: nothing to review!");
      return;
    }

    // So that the back button calls popstate() to close the reviewer
    history.pushState({}, "Review", null);

    $(".packsviewer").hide();
    $(".reviewer").show();

    this._current.cards = cards;
    this._current.cards.sort(() => Math.random() - 0.5); // inefficient shuffle
    this._current.rendererName = rendererName;
    this._current.showFace = showFace;
    this._current.i = -1; // so reviewNextCard will set it to 0

    this._reviewNextCard();
  },

  _reviewPreviousCard: function() {
    this._current.i -= 2;
    this._reviewNextCard();
  },

  // Display a card number |i| in the reviewer.
  _reviewNextCard: function() {
    this._current.i += 1;
    if (this._current.card() === undefined) {
      this._current.i = 0;
    }
    var $top = $("<div>", {"class": "card-top-half"});
    var $bot = $("<div>", {"class": "card-bottom-half"});
    var renderer = this._packRenderers[this._current.rendererName];
    // Set 'this' to this._packRenderers inside the renderer
    renderer.call(this._packRenderers, $top, $bot, this._current.card());
    $(".card").html($top).append($bot);
    $("#reveal-all-section").show();
    $(".controls .row-of-buttons:not(#reveal-all-section)").hide();
  },

  _closeReviewer: function() {
    this._current.cards = [];
    $(".reviewer").hide();
    $(".packsviewer").show();
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


  reviewing: function() {
    return this._current.cards.length > 0;
  },

  // quasi-global to hold info about our current study session.
  _current: {
    card: function() { return this.cards[this.i]; },

    cards: [],
    i: 0,
    rendererName: undefined,
    showFace: undefined
  },

  // These render the flash card to HTML, customizing the look of the card
  // depending on its context.  The basicFaces renderer adds han/pinyin/english
  // faces.  Other renderers are more funky.  The __all renderer, for example,
  // adds a small hidden "pack name" face, as a clue to the han meaning; and
  // the __wrongs renderer adds an unhidden "here's what you tend to get wrong"
  // face.
  //
  // Renderers fill in the $top and $bottom halves of the card being constructed.
  _packRenderers: {
    basicFaces: function($top, $bot, card) {
      var faceToShow = CardViewer._current.showFace;
      // Put faceToShow on top, and the rest on bottom obscured
      var attr = faceToShow.toLowerCase();
      var obscured = ["Han", "Pinyin", "English"].filter(n => n !== faceToShow);
      var face = this._newFace(card[attr], "face-" + attr);
      face.addClass("basic");
      $top.append(face);
      obscured.forEach((label) => {
        var attr = label.toLowerCase();
        $bot.append(this._newFace(label, "face-" + attr, card[attr]));
      });
    },
    __all: function($top, $bot, card) {
      this.basicFaces($top, $bot, card);
      $top.append(this._newFace("pack name", "face-pack_name", card.pack_name));
    },
    __multiple: function($top, $bot, card) {
      // Does the same thing as __all
      this.__all($top, $bot, card);
    },
    __wrongs: function($top, $bot, card) {
      this.basicFaces($top, $bot, card);
      function mode(arr){
        return arr.concat().sort((a,b) =>
          arr.filter(v => v===a).length
          - arr.filter(v => v===b).length
        ).pop();
      }
      var commonestError = mode(card.errors);
      var hint = $("input:button.error[data-error-id="+commonestError+"]").data("errorHint");
      $top.prepend(this._newFace(hint, "face-hint"));
    },

    // Returns either
    //      <div class="face" id="face-pinyin">
    //        <span class="face-content">hǎo</span>
    //      </div>
    // or, if |answer| is specified,
    //      <div class="face obscured" id="face-pinyin">
    //        <span class="obscured-clue">pinyin</span>
    //        <span class="face-content">hǎo</span>
    //      </div>
    // "obscured" class becomes "revealed" when the answer is revealed.
    _newFace: function(content, id, answer) {
      var face = $("<div>", {
        "class": "face",
        id: id
      });
      if (!answer) {
        face.
          append($("<span>", { "class": "face-content",  text: content }));
      } else {
        face.
          addClass("obscured").
          append($("<span>", { "class": "obscured-clue", text: content })).
          append($("<span>", { "class": "face-content",  text: answer })).
          click(function() {
            face.removeClass("obscured").addClass("revealed");
            if (id === "face-pinyin") {
              CardViewer._colorizeByTone();
            }
            // If all obscureds have been manually clicked, it's like you
            // clicked "Reveal All".  Go ahead and show right/wrong buttons
            if ($(".obscured").length === 0) {
              $("#reveal-all-section, #right-wrong-section").toggle();
            }
          });
      }
      return face;
    }
  },

  _colorizeByTone: function() {
    var hanFace = $("#face-han .face-content");
    var pinyinFace = $("#face-pinyin .face-content");
    var han_to_ignore = {"，": 1, "__": 1, "／": 1, "!": 1, "＿": 1, "？": 1, "；": 1, "：": 1, "(": 1, ")": 1, "。": 1, "、": 1, "《": 1, "》": 1, "「": 1, "」": 1};
    var han = hanFace.text().split('');
    var pinyin = pinyinFace.text();
    var tones_in_pinyin = tonesInPinyin(pinyin);
    var han_length = han.filter(h=>!(h in han_to_ignore)).length;
    if (tones_in_pinyin.length != han_length) {
      hanFace.addClass("tone-broken");
      pinyinFace.addClass("tone-broken");
      return;
    }
    hanFace.html("");
    pinyinFace.html("");
    var pinyin_count = 0;
    for (var i = 0; i < han.length; i++) {
      if (han[i] in han_to_ignore) {
        $("<span>", { text: han[i] }).appendTo(hanFace);
        continue;
      }
      var tone = tones_in_pinyin[pinyin_count][1];
      $("<span>", { "class": "tone-" + tone, text: han[i] }).appendTo(hanFace);
      $("<span>", { "class": "tone-" + tone, text: tones_in_pinyin[pinyin_count][0]}).appendTo(pinyinFace);
      pinyin_count++;
    }
    // Now that the han face has a bunch of spans in it instead of one string
    // of text, it has forgotten how to wrap.  We could separate the spans, but
    // then they'd always have a space between each one.  Flexbox to the
    // rescue.
    hanFace.css("display", "flex").css("flex-wrap", "wrap");
  }
};

$(function() {
  $(window).on("popstate", () => CardViewer._closeReviewer());

  var hammertime = new Hammer(document.querySelector("body"));
  hammertime.on('swipe', function(ev) {
    if (!CardViewer.reviewing()) {
      return;
    }
    if (ev.direction === 4) {
      CardViewer._reviewPreviousCard();
    } else if (ev.direction === 2) {
      CardViewer._reviewNextCard();
    }
  });
  $(".controls-reveal-all").click(function() {
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
});
