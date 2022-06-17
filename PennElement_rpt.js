// SELECTOR element
/* $AC$ PennController.newSelector(name) Creates a new Selector element $AC$ */
/* $AC$ PennController.getSelector(name) Retrieves an existing Selector element $AC$ */
window.PennController._AddElementType("RPT", function (PennEngine) {
	let that = this;
	this.immediate = function (id, text) {
		if (text === undefined) {
			text = "lorem ipsum dolor sit amet";
			if (id === undefined || typeof (id) != "string" || id.length == 0)
				id = "RPT";
			this.id = id;
		}
		text = text.toLowerCase();
		// .,?!/():;"
		text = text.replaceAll(/[\.\,\?\!\/\\\(\)\:\;]/ig, "");
		text = text.replaceAll(/\s+/ig, " ");
		this.words = text.split(" ");
		this.id = id;
		this.stressColor = "#FF0000";
		this.boundaryColor = "#0000FF";
		this.boundaryString = " | ";
	};

	this.uponCreation = function (resolve) {
		this.wordsJQ = [];
		this.spacesJQ = [];
		this.wordToggled = [];
		this.spaceToggled = [];
		this.clicks = [];
		this.toggleWord = (i) => {
			this.wordToggled[i] = !this.wordToggled[i];
			this.clicks.push(["Click", i+1, Date.now(), this.words[i]]);
			this.lastClicked = Date.now();
			if (this.wordToggled[i]) {
				this.wordsJQ[i].css("background-color", this.stressColor);
			} else {
				this.wordsJQ[i].css("background-color", "");
			}
		};
		this.toggleSpace = (i) => {
			this.spaceToggled[i] = !this.spaceToggled[i];
			this.lastClicked = Date.now();
			if (this.spaceToggled[i]) {
				this.spacesJQ[i].css("background-color", this.boundaryColor);
			} else {
				this.spacesJQ[i].css("background-color", "");
			}
		};

		let jq = $("<div></div>");
		for (let i = 0; i < this.words.length; i++) {
			let word = $("<span></span>").text(this.words[i]);
			word[0].onclick = (() => this.toggleWord(i));
			jq.append(word);
			this.wordsJQ.push(word);
			this.wordToggled.push(false);

			if (i < this.words.length - 1) {
				let space = $("<span></span>").text(this.boundaryString);
				space[0].onclick = (() => this.toggleSpace(i));
				jq.append(space);
				this.spacesJQ.push(space);
				this.spaceToggled.push(false);
			}
		}
		jq.css("white-space","pre-wrap");
		this.jQueryElement = jq;

		this.log = false;

		this.lastClicked = 0;
		resolve();
	};

	this.end = function () {
		if (this.log) {
			for (let c in this.clicks)
                PennEngine.controllers.running.save(this.type, this.id, ...this.clicks[c]);
			PennEngine.controllers.running.save(this.type, this.id, "Submit", "[" + this.wordToggled.join(";") + "];[" + this.spaceToggled.join(";") + "]", this.lastClicked);
		}
	};

	this.actions = {
		toggleWord: function (resolve, index) {
			this.toggleWord(index);
			resolve();
		},
		toggleSpace: function (resolve, index) {
			this.toggleSpace(index);
			resolve();
		},
		wait: function (_resolve, _test) {

			// resolve();
		}
	};

	this.settings = {
		callback: function (resolve, ..._elementCommands) {

			resolve();
		},
		stressColor: function (resolve, color) {
			this.stressColor = color;
			resolve();
		},
		boundaryColor: function (resolve, color) {
			this.boundaryColor = color;
			resolve();
		},
		boundaryString: function (resolve, string) {
			this.boundaryString = string;
			for(let i = 0; i<this.spacesJQ.length;i++) {
				this.spacesJQ[i].text(this.boundaryString);
			}
			resolve();
		},
		log: function (resolve) {
			this.log = true;
			resolve();
		},
		once: function (resolve) {

			resolve();
		}
	};

	this.test = {
		//TODO
	};

});