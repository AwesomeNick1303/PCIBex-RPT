// RPT element
/* $AC$ PennController.newRPT(name) Creates a new RPT element $AC$ */
/* $AC$ PennController.getRPT(name) Retrieves an existing RPT element $AC$ */
window.PennController._AddElementType("RPT", function (PennEngine) {
	let that = this;
	this.immediate = function (id, text) {
		console.log(text);
		//default values
		if (text === undefined) {
			text = "lorem ipsum dolor sit amet";
			if (id === undefined || typeof (id) != "string" || id.length == 0)
				id = "RPT";
			this.id = id;
		}

		//text cleanup
		// text = text.toLowerCase();
		// .,?!/():;"
		text = text.replaceAll(/[\.\,\?\!\/\\\(\)\:\;]/ig, "");
		text = text.replaceAll(/\s+/ig, " ");

		this.words = text.split(" ");	//List of word strings
		this.id = id;

		//default values
		this.stressColor = "#FF0000";	//Color of stressed words
		this.boundaryColor = "#0000FF";	//Color of word boundaries
		this.boundaryString = "  ";		//String to be inserted between boundaries
		this.log = false;				//Logging
		this.stressWarningMessage = "Please click on at least one word.";
		this.boundaryWarningMessage = "Please click on at least one boundary.";
	};

	this.uponCreation = function (resolve) {
		this.wordsJQ = [];				//List of HTML elements of words
		this.spacesJQ = [];				//List of HTML elements of word boundaries
		this.stressToggled = [];			//List of booleans
		this.boundaryToggled = [];			//List of booleans
		this.clicks = [];				//List of ["StressClick"|"BoundaryClick",time,word]
		this.toggleStress = (i) => {
			this.stressToggled[i] = !this.stressToggled[i];
			this.clicks.push(["ProminenceClick", i + 1, Date.now(), this.words[i]]);
			this.lastClicked = Date.now();
			if (this.stressToggled[i]) {
				this.wordsJQ[i].css("background-color", this.stressColor);
			} else {
				this.wordsJQ[i].css("background-color", "");
			}
		};
		this.toggleBoundary = (i) => {
			this.boundaryToggled[i] = !this.boundaryToggled[i];
			this.clicks.push(["BoundaryClick", i + 1, Date.now(), this.words[i]]);
			this.lastClicked = Date.now();
			if (this.boundaryToggled[i]) {
				this.spacesJQ[i].css("background-color", this.boundaryColor);
			} else {
				this.spacesJQ[i].css("background-color", "");
			}
		};

		let jq = $("<div></div>");
		for (let i = 0; i < this.words.length; i++) {
			let word = $("<span></span>").text(this.words[i]);
			word[0].onclick = (() => this.toggleStress(i));
			jq.append(word);
			this.wordsJQ.push(word);
			this.stressToggled.push(false);

			if (i < this.words.length - 1) {
				let space = $("<span></span>").text(this.boundaryString);
				space[0].onclick = (() => this.toggleBoundary(i));
				jq.append(space);
				this.spacesJQ.push(space);
				this.boundaryToggled.push(false);
			}
		}
		//allow for multiple spaces in text
		jq.css("white-space", "pre-wrap");
		jq.css("word-break","keep-all");
		//disable highlighting
		jq.css("user-select", "none");
		jq.css("-webkit-user-select", "none");
		jq.css("-khtml-user-select", "none");
		jq.css("-moz-user-select", "none");
		jq.css("-ms-user-select", "none");

		this.jQueryElement = jq;

		this.lastClicked = 0;
		resolve();
	};

	this.end = function () {
		if (this.log) {
			for (let c in this.clicks) {
				PennEngine.controllers.running.save(this.type, this.id, ...this.clicks[c]);
			}
			for (var i = 0; i < this.words.length; i++) {
				PennEngine.controllers.running.save(this.type, this.id, "Prominent", this.stressToggled[i], this.lastClicked, this.words[i]);
			}
			for (var i = 0; i < this.words.length - 1; i++) {
				PennEngine.controllers.running.save(this.type, this.id, "Pre-Boundary", this.boundaryToggled[i], this.lastClicked, this.words[i]);
			}
			PennEngine.controllers.running.save(this.type, this.id, "Pre-Boundary", "false", this.lastClicked, this.words[this.words.length-1]);
		}
	};

	this.actions = {
		toggleStress: function (resolve, index) {
			this.toggleStress(index);
			resolve();
		},
		toggleBoundary: function (resolve, index) {
			this.toggleBoundary(index);
			resolve();
		},
		warn: function(resolve) {
			var word = false;
			var space = false;
			for(var i = 0; i < this.stressToggled.length; i++) {
				if(this.stressToggled[i]) word = true;
			}
			for(var i = 0; i < this.boundaryToggled.length; i++) {
				if(this.boundaryToggled[i]) space = true;
			}
			if(!word) {
				alert(this.stressWarningMessage);
				resolve();
				return;
			}
			if(!space) {
				alert(this.boundaryWarningMessage);
			}
			resolve();
		}
	};

	this.settings = {
		callback: function (resolve, ...elementCommands) {
			let oldToggleStress = this.toggleStress;
			let oldToggleBoundary = this.toggleBoundary;
			this.toggleStress = async function (i) {
				oldToggleStress.apply(this, [i]);
				for (let c in elementCommands)
					await elementCommands[c]._runPromises();
			}
			this.toggleBoundary = async function (i) {
				oldToggleBoundary.apply(this, [i]);
				for (let c in elementCommands)
					await elementCommands[c]._runPromises();
			}
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
			for (let i = 0; i < this.spacesJQ.length; i++) {
				this.spacesJQ[i].text(this.boundaryString);
			}
			resolve();
		},
		log: function (resolve) {
			this.log = true;
			resolve();
		},
		stressWarning: function(resolve, message) {
			this.stressWarningMessage = message;
			resolve();
		},
		boundaryWarning: function(resolve, message) {
			this.boundaryWarningMessage = message;
			resolve();
		}
	};

	this.test = {
		stressClicked: function() {
			for(let b in this.stressToggled) {
				if(b) return true;
			}
			return false;
		},
		boundaryClicked: function() {
			for(let b in this.boundaryToggled) {
				if(b) return true;
			}
			return false;
		},
		bothClicked: function() {
			console.log("bruh2");
			var word = false;
			var space = false;
			for(var i = 0; i < this.stressToggled.length; i++) {
				if(this.stressToggled[i]) word = true;
			}
			for(var i = 0; i < this.spaceToggled.length; i++) {
				if(this.boundaryToggled[i]) space = true;
			}
			return word && space;
		}
	};

});