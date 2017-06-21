Reviewer = {
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
      faces.append(Reviewer.newFace("Han", card.han, {hidden:false}));
      faces.append(Reviewer.newFace("Pinyin", card.pinyin, {hidden:true}));
      faces.append(Reviewer.newFace("English", card.english, {hidden:true}));
      return faces;
    },
    __all: function(faces, card) {
      faces = Reviewer.packRenderers.basicFaces(faces, card);
      faces.append(Reviewer.newFace("Pack", card.pack_name, {hidden:true, className:"face-pack"}));
      return faces;
    },
    __multiple: function(faces, card) {
      // Does the same thing as __all
      return Reviewer.packRenderers.__all(faces, card);
    },
    __wrongs: function(faces, card) {
      faces = Reviewer.packRenderers.basicFaces(faces, card);
      function mode(arr){
        return arr.concat().sort((a,b) =>
          arr.filter(v => v===a).length
          - arr.filter(v => v===b).length
        ).pop();
      }
      var commonestError = mode(card.errors);
      var hint = Reviewer.errorTypes[commonestError];
      faces.prepend(Reviewer.newFace("Warning", hint, {hidden:false, className:"face-mistake"}));
      return faces;
    },
  },

  // Returns something like
  //   <div class="face face-pack">
  //     <div class="face-label">Pack name</div>
  //     <div class="face-value obscured">words that I hate</div>
  //   </div>
  // Options include 'hidden' bool (is face-value div obscured?), and a
  // 'className' for the face div.
  newFace: function(label, answer, options) {
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

    Reviewer.REVIEW_CARDS = cards;
    Reviewer.REVIEW_CARDS.sort(() => Math.random() - 0.5); // inefficient shuffle
    Reviewer.CURRENT_CARD = 0;
    Reviewer.RENDERER = Reviewer.packRenderers[rendererName];

    $(".packs").hide();
    $(".reviewer").show();
    Reviewer.reviewACard();
  },

  // Display a card in the reviewer.
  reviewACard: function() {
    var card = Reviewer.REVIEW_CARDS[Reviewer.CURRENT_CARD];
    var faces = $("<div>", {"class": "faces"});
    faces = Reviewer.RENDERER(faces, card);
    $(".faces-container").html(faces);
  },

  reviewNext: function() {
    Reviewer.CURRENT_CARD += 1;
    if (Reviewer.REVIEW_CARDS[Reviewer.CURRENT_CARD] === undefined) {
      Reviewer.CURRENT_CARD = 0;
    }
    Reviewer.reviewACard();
  },

  closeReviewer: function() {
    $(".reviewer").hide();
    $(".packs").show();
  },

  addError: function(errorId) {
    var card = Reviewer.REVIEW_CARDS[Reviewer.CURRENT_CARD];
    card.errors.push(errorId);
    Cards.api.update(card, () => Reviewer.reviewNext());
  },

  clearErrors: function() {
    var card = Reviewer.REVIEW_CARDS[Reviewer.CURRENT_CARD];
    card.errors = [];
    Cards.api.update(card, () => Reviewer.reviewNext());
  },
};
