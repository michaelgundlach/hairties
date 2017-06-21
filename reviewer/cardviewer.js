CardViewer = function() {}
CardViewer.__proto__ = {
  errorTypes: {
    1: "forgot pronunciation",
    2: "forgot tone",
    3: "forgot English meaning",
    4: "confused with another character"
  },

  // These customize the look of the flash card depending on its context.  The
  // basicFaces renderer adds han/pinyin/english faces.  Other renderers are more
  // funky.  The __all renderer, for example, adds a small hidden "pack name"
  // face, as a clue to the han meaning; and the __wrongs renderer adds an
  // unhidden "here's what you tend to get wrong" face.
  //
  // Renderers are decorators on the jQuery element pointing to the <faces>
  // element being constructed.
  packRenderers: {
    basicFaces: function(faces, card) {
      // TODO: add han/pinyin/english
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
      var hint = CardViewer.errorTypes[commonestError];
      faces.prepend(this._newFace("Warning", hint, {hidden:false, className:"face-mistake"}));
      return faces;
    },

    // Helper function for renderers, returning something like
    //   <div class="face face-pack">
    //     <div class="face-label">Pack name</div>
    //     <div class="face-value obscured">words that I hate</div>
    //   </div>
    // Options include 'hidden' bool (is face-value div obscured?), and a
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

  },

  // List of cards currently being reviewed
  REVIEW_CARDS: undefined,
  // Index into REVIEW_CARDS currently being reviewed
  CURRENT_CARD: undefined,
  // Renders card to HTML
  // TODO: you can do it prettier than with a global
  RENDERER: function(faces, card) {},

  reviewCards: function(cards, rendererName) {
    if (cards.length === 0) {
      alert("Oops: nothing to review!");
      return;
    }

    this.REVIEW_CARDS = cards;
    this.REVIEW_CARDS.sort(() => Math.random() - 0.5); // inefficient shuffle
    this.CURRENT_CARD = 0;
    // Have to wrap in a new-style function so that within a packRenderer,
    // 'this' refers to packRenderers and not CardViewer or worse
    this.RENDERER = (faces, card) => this.packRenderers[rendererName](faces, card);

    $(".packs").hide();
    $(".reviewer").show();
    this.reviewACard();
  },

  // Display a card in the reviewer.
  reviewACard: function() {
    var card = this.REVIEW_CARDS[this.CURRENT_CARD];
    var faces = $("<div>", {"class": "faces"});
    faces = this.RENDERER(faces, card);
    $(".faces-container").html(faces);
  },

  reviewNext: function() {
    this.CURRENT_CARD += 1;
    if (this.REVIEW_CARDS[this.CURRENT_CARD] === undefined) {
      this.CURRENT_CARD = 0;
    }
    this.reviewACard();
  },

  closeReviewer: function() {
    $(".reviewer").hide();
    $(".packs").show();
  },

  addError: function(errorId) {
    var card = this.REVIEW_CARDS[this.CURRENT_CARD];
    card.errors.push(errorId);
    Cards.api.update(card, () => this.reviewNext());
  },

  clearErrors: function() {
    var card = this.REVIEW_CARDS[this.CURRENT_CARD];
    card.errors = [];
    Cards.api.update(card, () => this.reviewNext());
  },
};
