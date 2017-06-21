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
    var faces = $("<div>", {"class": "faces"});
    var renderer = this._packRenderers[this._current.rendererName];
    // Set 'this' to this._packRenderers inside the renderer
    renderer.call(this._packRenderers, faces, this._current.card()).replaceAll(".faces");
    $("#controls-error-types").hide();
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
    Cards.api.update(card, () => this._reviewNextCard());
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
  // Renderers are decorators on the jQuery element pointing to the <faces>
  // element being constructed.
  _packRenderers: {
    basicFaces: function(faces, card) {
      faces.append(this._newFace("Han", card.han, {hidden:false}));
      faces.append(this._newFace("Pinyin", card.pinyin, {hidden:true}));
      faces.append(this._newFace("English", card.english, {hidden:true}));
      return faces;
    },
    __all: function(faces, card) {
      faces = this.basicFaces(faces, card);
      faces.append(this._newFace("Pack", card.pack_name, {hidden:true, className:"face-pack"}));
      return faces;
    },
    __multiple: function(faces, card) {
      // Does the same thing as __all
      return this.__all(faces, card);
    },
    __wrongs: function(faces, card) {
      faces = this.basicFaces(faces, card);
      function mode(arr){
        return arr.concat().sort((a,b) =>
          arr.filter(v => v===a).length
          - arr.filter(v => v===b).length
        ).pop();
      }
      var commonestError = mode(card.errors);
      var hint = $("input:button.error[data-error-id="+commonestError+"]").data("errorHint");
      faces.prepend(this._newFace("Warning", hint, {hidden:false, className:"face-mistake"}));
      return faces;
    },

    // Helper function for renderers, returning something like
    //   <div class="face face-pack">  (or face-<whatever special classname I gave it>)
    //     <div class="face-label">Pack name</div>
    //     <div class="face-value">words that I hate</div>
    //   </div>
    // Options include 'hidden' bool (is the answer obscured?), and a
    // 'className' for the face div.
    _newFace: function(label, answer, options) {
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
        text: answer
      });
      if (options && options.hidden) {
        value.text("<???>");
        value.click(function() {
          value.text(answer);
        });
      }
      return face.append(label).append(value);
    }

  }

};

$(function() {
  $("#controls-next").click(e => CardViewer._reviewNextCard());
  $("#controls-close").click(e => CardViewer._closeReviewer());
  $("#controls-clearerrors").click(e => CardViewer._clearErrors());
  $("#controls-error").click(e => $("#controls-error-types").show());
  $("input:button.error").click(e => CardViewer._addError(e.target.dataset.errorId));
});
