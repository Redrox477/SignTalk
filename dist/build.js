
(function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" == typeof require && require;
                    if (!f && c) return c(i, !0);
                    if (u) return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var p = n[i] = {
                    exports: {}
                };
                e[i][0].call(p.exports, function (r) {
                    var n = e[i][1][r];
                    return o(n || r)
                }, p, p.exports, r, e, n, t)
            }
            return n[i].exports
        }
        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
        return o
    }
    return r
})()({
        1: [function (require, module, exports) {
            'use strict';

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }
                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            var _deeplearnKnnImageClassifier = require('deeplearn-knn-image-classifier');

            var _deeplearn = require('deeplearn');

            var dl = _interopRequireWildcard(_deeplearn);

            function _interopRequireWildcard(obj) {
                if (obj && obj.__esModule) {
                    return obj;
                } else {
                    var newObj = {};
                    if (obj != null) {
                        for (var key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                        }
                    }
                    newObj.default = obj;
                    return newObj;
                }
            }

            function _toConsumableArray(arr) {
                if (Array.isArray(arr)) {
                    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                        arr2[i] = arr[i];
                    }
                    return arr2;
                } else {
                    return Array.from(arr);
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            
            const IMAGE_SIZE = 227;
            
            const TOPK = 10;
           
            const confidenceThreshold = 0.98

            
            var words = ["start", "stop"];

            
            var Main = function () {
                function Main() {
                    _classCallCheck(this, Main);

                    
                    this.exampleCountDisplay = [];
                    this.checkMarks = [];
                    this.gestureCards = [];
                    this.training = -1; 
                    this.videoPlaying = false;
                    this.previousPrediction = -1;
                    this.currentPredictedWords = [];

                   
                    this.now;
                    this.then = Date.now();
                    this.startTime = this.then;
                    this.fps = 5; 
                    this.fpsInterval = 1000 / this.fps;
                    this.elapsed = 0;

                    
                    this.knn = null;
                    
                    this.previousKnn = this.knn;

                    
                    this.welcomeContainer = document.getElementById("welcomeContainer");
                    this.proceedBtn = document.getElementById("proceedButton");
                    this.proceedBtn.style.display = "block";
                    this.proceedBtn.classList.add("animated");
                    this.proceedBtn.classList.add("flash");
                    var _this1 = this;
                    this.proceedBtn.addEventListener('click', function () {
                        _this1.welcomeContainer.classList.add("slideOutUp");
                    })

                    this.stageTitle = document.getElementById("stage");
                    this.stageInstruction = document.getElementById("steps");
                    this.predButton = document.getElementById("predictButton");
                    this.backToTrainButton = document.getElementById("backButton");
                    this.nextButton = document.getElementById('nextButton');

                    this.statusContainer = document.getElementById("status");
                    this.statusText = document.getElementById("status-text");

                    this.translationHolder = document.getElementById("translationHolder");
                    this.translationText = document.getElementById("translationText");
                    this.translatedCard = document.getElementById("translatedCard");

                    this.initialTrainingHolder = document.getElementById('initialTrainingHolder');

                    this.videoContainer = document.getElementById("videoHolder");
                    this.video = document.getElementById("video");

                    this.trainingContainer = document.getElementById("trainingHolder");
                    this.addGestureTitle = document.getElementById("add-gesture");
                    this.plusImage = document.getElementById("plus_sign");
                    this.addWordForm = document.getElementById("add-word");
                    this.newWordInput = document.getElementById("new-word");
                    this.doneRetrain = document.getElementById("doneRetrain");
                    this.trainingCommands = document.getElementById("trainingCommands");

                    this.videoCallBtn = document.getElementById("videoCallBtn");
                    this.videoCall = document.getElementById("videoCall");

                    this.trainedCardsHolder = document.getElementById("trainedCardsHolder");

                    // Start Translator function is called
                    this.initializeTranslator();

                    // Instantiate Prediction Output
                    this.predictionOutput = new PredictionOutput();
                }

                _createClass(Main, [{
                    key: 'initializeTranslator',
                    value: function initializeTranslator() {
                        /*This function starts the webcam and initial training process. It also loads the kNN
                                                classifier*/
                        var _this2 = this;
                        _this2.startWebcam();
                        _this2.initialTraining();
                        _this2.loadKNN();
                    }
                }, {
                    key: 'startWebcam',
                    value: function startWebcam() {
                        var _this3 = this;
                        navigator.mediaDevices.getUserMedia({
                            video: {
                                facingMode: 'user'
                            },
                            audio: false
                        }).then(function (stream) {
                            _this3.video.srcObject = stream;
                            _this3.video.width = IMAGE_SIZE;
                            _this3.video.height = IMAGE_SIZE;
                            _this3.video.addEventListener('playing', function () {
                                return _this3.videoPlaying = true;
                            });
                            _this3.video.addEventListener('paused', function () {
                                return _this3.videoPlaying = false;
                            });
                        });
                    }
                }, {

                   
                    //This function loads the kNN classifier
                    key: 'loadKNN',
                    value: function loadKNN() {
                        var _this5 = this;
                        this.knn = new _deeplearnKnnImageClassifier.KNNImageClassifier(words.length, TOPK);

                        // Load knn model
                        _this5.knn.load().then(function () {
                            return _this5.initializeTraining();
                        });
                    }
                }, {
                    key: 'initialGestures',
                    value: function initialGestures(i, btnType) {
                        /*This creates the training and clear buttons for the initial Start and Stop gesture. 
                        It also creates the Gesture Card.*/

                        var _this3 = this;
                        // Get specified training button
                        var trainBtn = document.getElementById(btnType);

                        // Call training function for this gesture on click
                        trainBtn.addEventListener('click', function () {
                            _this3.train(i);
                        });

                        // Clear button to remove training examples on click
                        var clearBtn = document.getElementById('clear_' + btnType);
                        clearBtn.addEventListener('click', function () {
                            _this3.knn.clearClass(i);
                            _this3.exampleCountDisplay[i].innerText = " 0 examples";
                            _this3.gestureCards[i].removeChild(_this6.gestureCards[i].childNodes[1]);
                            _this3.checkMarks[i].src = "Images\\loader.gif";
                        });

                        // Variables for training information for the user
                        var exampleCountDisplay = document.getElementById('counter_' + btnType);
                        var checkMark = document.getElementById('checkmark_' + btnType);

                        // Create Gesture Card
                        var gestureCard = document.createElement("div");
                        gestureCard.className = "trained-gestures";

                        var gestName = "";
                        if (i == 0) {
                            gestName = "Start";
                        } else {
                            gestName = "Stop";
                        }
                        var gestureName = document.createElement("h5");
                        gestureName.innerText = gestName;
                        gestureCard.appendChild(gestureName);
                        this.trainedCardsHolder.appendChild(gestureCard);

                        exampleCountDisplay.innerText = " 0 examples";
                        checkMark.src = 'Images\\loader.gif';
                        this.exampleCountDisplay.push(exampleCountDisplay);
                        this.checkMarks.push(checkMark);
                        this.gestureCards.push(gestureCard);
                    }
                }, {
                    key: 'setupTrainingUI',
                    value: function setupTrainingUI() {
                        /*This function sets up the custom gesture training UI.*/
                        var _this3=this;
                        var exampleCount = _this3.knn.getClassExampleCount();
                        // check if training is complete
                        if (Math.max(...exampleCount) > 0) {
                            // if start gesture has not been trained
                            if (exampleCount[0] == 0) {
                                alert('You haven\'t added examples for the wake word');
                                return;
                            }

                            // if stop gesture has not been trained
                            if (exampleCount[1] == 0) {
                                alert('You haven\'t added examples for the Stop Gesture.\n\nCapture yourself in idle states e.g hands by your side, empty background etc.');
                                return;
                            }

                            // Remove Initial Training Screen
                            this.initialTrainingHolder.style.display = "none";

                            // Add the Custom Gesture Training UI
                            this.trainingContainer.style.display = "block";
                            this.trainedCardsHolder.style.display = "block";

                            // Add Gesture on Submission of new gesture form
                            this.addWordForm.addEventListener('submit', function (e) {
                                e.preventDefault();// preventing default submission action
                                _this3.trainingCommands.innerHTML = "";

                                var word = _this3.newWordInput.value.trim(); // returns new word without whitespace

                                // if a new word is entered, add it to the gesture classes and start training
                                if (word && !words.includes(word)) {
                                    //Add word to words array
                                    words.push(word);

                                    // Create train and clear buttons for new gesture and set reset form
                                    _this3.createTrainingBtns(words.indexOf(word));
                                    _this3.newWordInput.value = '';

                                    // Increase the amount of classes and array length in the kNN model
                                    _this3.knn.numClasses += 1;
                                    _this3.knn.classLogitsMatrices.push(null);
                                    _this3.knn.classExampleCount.push(0);

                                    // Start training the word and create the translate button
                                    _this3.initializeTraining();
                                    _this3.createTranslateBtn();
                                } else {
                                    alert("Duplicate word or no word entered");
                                }
                                return;
                            });
                        } else {
                            alert('You haven\'t added any examples yet.\n\nAdd a Gesture, then perform the sign in front of the webcam.');
                        }
                    }
                }, {
                    key: 'createTrainingBtns',
                    value: function createTrainingBtns(i) {
                        /*This creates the training and clear buttons for the new gesture. It also creates the 
                          Gesture Card.*/
                        //i is the index of the new word
                        // Create Train and Clear Buttons
                        var trainBtn = document.createElement('button');
                        trainBtn.className = "trainBtn";
                        trainBtn.innerText = "Train";
                        this.trainingCommands.appendChild(trainBtn);

                        var clearBtn = document.createElement('button');
                        clearBtn.className = "clearButton";
                        clearBtn.innerText = "Clear";
                        this.trainingCommands.appendChild(clearBtn);

                        var _this3=this;

                        // Change training class from none to specified class if training button is pressed
                        trainBtn.addEventListener('click', function () {
                            _this3.train(i);
                        });

                        // Create clear button to remove training examples on click
                        clearBtn.addEventListener('click', function () {
                            _this3.knn.clearClass(i);
                            _this3.exampleCountDisplay[i].innerText = " 0 examples";
                            _this3.gestureCards[i].removeChild(_this3.gestureCards[i].childNodes[1]);
                            _this3.checkMarks[i].src = 'Images\\loader.gif';
                        });

                        // Create elements to display training information for the user
                        var exampleCountDisplay = document.createElement('h3');
                        exampleCountDisplay.style.color = "black";
                        this.trainingCommands.appendChild(exampleCountDisplay);

                        var checkMark = document.createElement('img');
                        checkMark.className = "checkMark";
                        this.trainingCommands.appendChild(checkMark);

                        //Create Gesture Card
                        var gestureCard = document.createElement("div");
                        gestureCard.className = "trained-gestures";

                        var gestName = words[i];
                        var gestureName = document.createElement("h5");
                        gestureName.innerText = gestName;
                        gestureCard.appendChild(gestureName);
                        this.trainedCardsHolder.appendChild(gestureCard);

                        exampleCountDisplay.innerText = " 0 examples";
                        checkMark.src = 'Images\\loader.gif';
                        this.exampleCountDisplay.push(exampleCountDisplay);
                        this.checkMarks.push(checkMark);
                        this.gestureCards.push(gestureCard);

                        // Retrain/Continue Training gesture on click of the gesture card
                        gestureCard.addEventListener('click', function () { //create btn
                            /* If gesture card was not already pressed display the specific gesture card's
                            training buttons to train it*/
                            if (gestureCard.style.marginTop == "17px" || gestureCard.style.marginTop == "") {
                                _this3.addWordForm.style.display = "none";
                                _this3.addGestureTitle.innerText = gestName;
                                _this3.plusImage.src = "Images/retrain.svg";
                                _this3.plusImage.classList.add("rotateIn");

                                // Display done retraining button and the training buttons for the specific gesture
                                _this3.doneRetrain.style.display = "block";
                                _this3.trainingCommands.innerHTML = "";
                                _this3.trainingCommands.appendChild(trainBtn);
                                _this3.trainingCommands.appendChild(clearBtn);
                                _this3.trainingCommands.appendChild(exampleCountDisplay);
                                _this3.trainingCommands.appendChild(checkMark);
                                gestureCard.style.marginTop = "-10px";
                            }
                            // if gesture card is pressed again, change the add gesture card back to add gesture mode instead of retrain mode
                            else {
                                _this3.addGestureTitle.innerText = "Add Gesture";
                                _this3.addWordForm.style.display = "block";
                                gestureCard.style.marginTop = "17px";

                                _this3.trainingCommands.innerHTML = "";
                                _this3.addWordForm.style.display = "block";
                                _this3.doneRetrain.style.display = "none";
                                _this3.plusImage.src = "Images/plus_sign.svg";
                                _this3.plusImage.classList.add("rotateInLeft");
                            }
                        });

                        // if done retrain button is pressed again, change the add gesture card back to add gesture mode instead of retrain mode
                        this.doneRetrain.addEventListener('click', function () {
                            _this3.addGestureTitle.innerText = "Add Gesture";
                            _this3.addWordForm.style.display = "block";
                            gestureCard.style.marginTop = "17px";

                            _this3.trainingCommands.innerHTML = "";
                            _this3.addWordForm.style.display = "block";
                            _this3.plusImage.src = "Images/plus_sign.svg";
                            _this3.plusImage.classList.add("rotateInLeft");
                            _this3.doneRetrain.style.display = "none";
                        });
                    }
                }, {
                    key: 'initializeTraining',
                    value: function initializeTraining() {
                        // This function starts the training process.

                        if (this.timer) {
                            this.stopTraining();
                        }
                        var promise = this.video.play();

                        if (promise !== undefined) {
                            promise.then(function (_) {
                                console.log("Autoplay started");
                            }).catch(function (error) {
                                console.log("Autoplay prevented");
                            });
                        }

                    }
                }, {
                    key: 'train',
                    value: function train(gestureIndex) {
                        // This function adds examples for the gesture to the kNN model

                        console.log(this.videoPlaying);
                        if (this.videoPlaying) {
                            console.log("entered training");
                            // Get image data from video element
                            const image = dl.fromPixels(this.video);

                            // Add current image to classifier
                            this.knn.addImage(image, gestureIndex);

                            // Get example count
                            const exampleCount = this.knn.getClassExampleCount()[gestureIndex];

                            if (exampleCount > 0) {
                                //if example count for this particular gesture is more than 0, update it
                                this.exampleCountDisplay[gestureIndex].innerText = ' ' + exampleCount + ' examples';

                                //if example count for this particular gesture is 1, add a capture of the gesture to gesture cards
                                if (exampleCount == 1 && this.gestureCards[gestureIndex].childNodes[1] == null) {
                                    var gestureImg = document.createElement("canvas");
                                    gestureImg.className = "trained_image";
                                    gestureImg.getContext('2d').drawImage(video, 0, 0, 400, 180);
                                    this.gestureCards[gestureIndex].appendChild(gestureImg);
                                }

                                // if 30 examples are trained, show check mark to the user 
                                if (exampleCount == 30) {
                                    this.checkMarks[gestureIndex].src = "Images//checkmark.svg";
                                    this.checkMarks[gestureIndex].classList.add("animated");
                                    this.checkMarks[gestureIndex].classList.add("rotateIn");
                                }
                            }
                        }
                    }
                }, {
                   

            /*
            The PredictionOutput class is responsible for turning the translated gesture into text, gesture card, and speech output.
            */
            
                    /*This functions clears translation text and cards. Sets the previous predicted words to null*/
                    key: 'clearPara',
                    value: function clearPara() {
                        this.translationText.innerText = '';
                        main.previousPrediction = -1;
                        this.currentPredictedWords = []; // empty words in this query
                        this.translatedCard.innerHTML = " ";
                    }
                }, {
                    key: 'copyTranslation',
                    value: function copyTranslation() {
                        /*The function below is adapted from https://stackoverflow.com/questions/45071353/javascript-copy-text-string-on-click/53977796#53977796
                        It copies the translated text to the user's clipboard*/
                        var _this7=this;

                        this.translationHolder.addEventListener('mousedown', function () {
                            main.setStatusText("Text Copied!", "copy");
                            const el = document.createElement('textarea'); // Create a <textarea> element
                            el.value = _this7.translationText.innerText; // Set its value to the string that you want copied
                            el.setAttribute('readonly', ''); // Make it readonly to be tamper-proof
                            el.style.position = 'absolute';
                            el.style.left = '-9999px'; // Move outside the screen to make it invisible
                            document.body.appendChild(el); // Append the <textarea> element to the HTML document
                            const selected =
                                document.getSelection().rangeCount > 0 // Check if there is any content selected previously
                                ?
                                document.getSelection().getRangeAt(0) // Store selection if found
                                :
                                false; // Mark as false to know no selection existed before
                            el.select(); // Select the <textarea> content
                            document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
                            document.body.removeChild(el); // Remove the <textarea> element
                            if (selected) { // If a selection existed before copying
                                document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
                                document.getSelection().addRange(selected); // Restore the original selection
                            }
                        });
                    }
                }, {
                    key: 'speak',
                    value: function speak(word) {
                        /*This function speaks out the user's gestures. In video call mode, it speaks out the other
                        user's words.*/
                        var utterThis = new SpeechSynthesisUtterance(word);

                        utterThis.onerror = function (evt) {
                            console.log("Error speaking");
                        };

                        utterThis.voice = this.voices[this.selectedVoice];
                        utterThis.pitch = this.pitch;
                        utterThis.rate = this.rate;

                        this.synth.speak(utterThis);
                    }
                }]);
                return PredictionOutput;
            }();

            var main = null;

            window.addEventListener('load', function () {
                main = new Main();
            });

        }, {
            "deeplearn": 67,
            "deeplearn-knn-image-classifier": 3
        }],
        2: [function (require, module, exports) {

        }, {}],
        3: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var knn_image_classifier_1 = require("./knn_image_classifier");
            exports.KNNImageClassifier = knn_image_classifier_1.KNNImageClassifier;

        }, {
            "./knn_image_classifier": 4
        }],
        4: [function (require, module, exports) {
            "use strict";
            var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
                return new(P || (P = Promise))(function (resolve, reject) {
                    function fulfilled(value) {
                        try {
                            step(generator.next(value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function rejected(value) {
                        try {
                            step(generator["throw"](value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function step(result) {
                        result.done ? resolve(result.value) : new P(function (resolve) {
                            resolve(result.value);
                        }).then(fulfilled, rejected);
                    }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
            };
            var __generator = (this && this.__generator) || function (thisArg, body) {
                var _ = {
                        label: 0,
                        sent: function () {
                            if (t[0] & 1) throw t[1];
                            return t[1];
                        },
                        trys: [],
                        ops: []
                    },
                    f, y, t, g;
                return g = {
                    next: verb(0),
                    "throw": verb(1),
                    "return": verb(2)
                }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
                    return this;
                }), g;

                function verb(n) {
                    return function (v) {
                        return step([n, v]);
                    };
                }

                function step(op) {
                    if (f) throw new TypeError("Generator is already executing.");
                    while (_) try {
                        if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                        if (y = 0, t) op = [0, t.value];
                        switch (op[0]) {
                            case 0:
                            case 1:
                                t = op;
                                break;
                            case 4:
                                _.label++;
                                return {
                                    value: op[1],
                                    done: false
                                };
                            case 5:
                                _.label++;
                                y = op[1];
                                op = [0];
                                continue;
                            case 7:
                                op = _.ops.pop();
                                _.trys.pop();
                                continue;
                            default:
                                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                    _ = 0;
                                    continue;
                                }
                                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                    _.label = op[1];
                                    break;
                                }
                                if (op[0] === 6 && _.label < t[1]) {
                                    _.label = t[1];
                                    t = op;
                                    break;
                                }
                                if (t && _.label < t[2]) {
                                    _.label = t[2];
                                    _.ops.push(op);
                                    break;
                                }
                                if (t[2]) _.ops.pop();
                                _.trys.pop();
                                continue;
                        }
                        op = body.call(thisArg, _);
                    } catch (e) {
                        op = [6, e];
                        y = 0;
                    } finally {
                        f = t = 0;
                    }
                    if (op[0] & 5) throw op[1];
                    return {
                        value: op[0] ? op[1] : void 0,
                        done: true
                    };
                }
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var dl = require("deeplearn");
            var deeplearn_squeezenet_1 = require("deeplearn-squeezenet");
            var model_util = require("../util");
            var KNNImageClassifier = (function () {
                function KNNImageClassifier(numClasses, k) {
                    this.numClasses = numClasses;
                    this.k = k;
                    this.classLogitsMatrices = [];
                    this.classExampleCount = [];
                    this.varsLoaded = false;
                    this.squashLogitsDenominator = dl.scalar(300);
                    for (var i = 0; i < this.numClasses; i++) {
                        this.classLogitsMatrices.push(null);
                        this.classExampleCount.push(0);
                    }
                    this.squeezeNet = new deeplearn_squeezenet_1.SqueezeNet();
                }
                KNNImageClassifier.prototype.load = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [4, this.squeezeNet.load()];
                                case 1:
                                    _a.sent();
                                    this.varsLoaded = true;
                                    return [2];
                            }
                        });
                    });
                };
                KNNImageClassifier.prototype.clearClass = function (classIndex) {
                    if (classIndex >= this.numClasses) {
                        console.log('Cannot clear invalid class ${classIndex}');
                        return;
                    }
                    this.classLogitsMatrices[classIndex] = null;
                    this.classExampleCount[classIndex] = 0;
                    this.clearTrainLogitsMatrix();
                };
                KNNImageClassifier.prototype.addImage = function (image, classIndex) {
                    var _this = this;
                    if (!this.varsLoaded) {
                        console.warn('Cannot add images until vars have been loaded.');
                        return;
                    }
                    if (classIndex >= this.numClasses) {
                        console.warn('Cannot add to invalid class ${classIndex}');
                    }
                    this.clearTrainLogitsMatrix();
                    dl.tidy(function () {
                        var logits = _this.squeezeNet.predict(image);
                        var imageLogits = _this.normalizeVector(logits);
                        var logitsSize = imageLogits.shape[0];
                        if (_this.classLogitsMatrices[classIndex] == null) {
                            _this.classLogitsMatrices[classIndex] = imageLogits.as2D(1, logitsSize);
                        } else {
                            var newTrainLogitsMatrix = _this.classLogitsMatrices[classIndex]
                                .as2D(_this.classExampleCount[classIndex], logitsSize)
                                .concat(imageLogits.as2D(1, logitsSize), 0);
                            _this.classLogitsMatrices[classIndex].dispose();
                            _this.classLogitsMatrices[classIndex] = newTrainLogitsMatrix;
                        }
                        dl.keep(_this.classLogitsMatrices[classIndex]);
                        _this.classExampleCount[classIndex]++;
                    });
                };
                KNNImageClassifier.prototype.predict = function (image) {
                    var _this = this;
                    if (!this.varsLoaded) {
                        throw new Error('Cannot predict until vars have been loaded.');
                    }
                    return dl.tidy(function () {
                        var logits = _this.squeezeNet.predict(image);
                        var imageLogits = _this.normalizeVector(logits);
                        var logitsSize = imageLogits.shape[0];
                        if (_this.trainLogitsMatrix == null) {
                            var newTrainLogitsMatrix = null;
                            for (var i = 0; i < _this.numClasses; i++) {
                                newTrainLogitsMatrix = _this.concatWithNulls(newTrainLogitsMatrix, _this.classLogitsMatrices[i]);
                            }
                            _this.trainLogitsMatrix = newTrainLogitsMatrix;
                        }
                        if (_this.trainLogitsMatrix == null) {
                            console.warn('Cannot predict without providing training images.');
                            return null;
                        }
                        dl.keep(_this.trainLogitsMatrix);
                        var numExamples = _this.getNumExamples();
                        return _this.trainLogitsMatrix.as2D(numExamples, logitsSize)
                            .matMul(imageLogits.as2D(logitsSize, 1))
                            .as1D();
                    });
                };
                KNNImageClassifier.prototype.predictClass = function (image) {
                    return __awaiter(this, void 0, void 0, function () {
                        var imageClass, confidences, knn, numExamples, kVal, topK, _a, _b, topKIndices, indicesForClasses, topKCountsForClasses, i, num, i, classForEntry, topConfidence, i, probability;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    imageClass = -1;
                                    confidences = new Array(this.numClasses);
                                    if (!this.varsLoaded) {
                                        throw new Error('Cannot predict until vars have been loaded.');
                                    }
                                    knn = this.predict(image).asType('float32');
                                    numExamples = this.getNumExamples();
                                    kVal = Math.min(this.k, numExamples);
                                    _b = (_a = model_util).topK;
                                    return [4, knn.data()];
                                case 1:
                                    topK = _b.apply(_a, [_c.sent(), kVal]);
                                    knn.dispose();
                                    topKIndices = topK.indices;
                                    if (topKIndices == null) {
                                        return [2, {
                                            classIndex: imageClass,
                                            confidences: confidences
                                        }];
                                    }
                                    indicesForClasses = [];
                                    topKCountsForClasses = [];
                                    for (i = 0; i < this.numClasses; i++) {
                                        topKCountsForClasses.push(0);
                                        num = this.classExampleCount[i];
                                        if (i > 0) {
                                            num += indicesForClasses[i - 1];
                                        }
                                        indicesForClasses.push(num);
                                    }
                                    for (i = 0; i < topKIndices.length; i++) {
                                        for (classForEntry = 0; classForEntry < indicesForClasses.length; classForEntry++) {
                                            if (topKIndices[i] < indicesForClasses[classForEntry]) {
                                                topKCountsForClasses[classForEntry]++;
                                                break;
                                            }
                                        }
                                    }
                                    topConfidence = 0;
                                    for (i = 0; i < this.numClasses; i++) {
                                        probability = topKCountsForClasses[i] / kVal;
                                        if (probability > topConfidence) {
                                            topConfidence = probability;
                                            imageClass = i;
                                        }
                                        confidences[i] = probability;
                                    }
                                    return [2, {
                                        classIndex: imageClass,
                                        confidences: confidences
                                    }];
                            }
                        });
                    });
                };
                KNNImageClassifier.prototype.getClassExampleCount = function () {
                    return this.classExampleCount;
                };
                KNNImageClassifier.prototype.clearTrainLogitsMatrix = function () {
                    if (this.trainLogitsMatrix != null) {
                        this.trainLogitsMatrix.dispose();
                        this.trainLogitsMatrix = null;
                    }
                };
                KNNImageClassifier.prototype.concatWithNulls = function (ndarray1, ndarray2) {
                    if (ndarray1 == null && ndarray2 == null) {
                        return null;
                    }
                    if (ndarray1 == null) {
                        return ndarray2.clone();
                    } else if (ndarray2 === null) {
                        return ndarray1.clone();
                    }
                    return ndarray1.concat(ndarray2, 0);
                };
                KNNImageClassifier.prototype.normalizeVector = function (vec) {
                    var squashedVec = dl.div(vec, this.squashLogitsDenominator);
                    var sqrtSum = squashedVec.square().sum().sqrt();
                    return dl.div(squashedVec, sqrtSum);
                };
                KNNImageClassifier.prototype.getNumExamples = function () {
                    var total = 0;
                    for (var i = 0; i < this.classExampleCount.length; i++) {
                        total += this.classExampleCount[i];
                    }
                    return total;
                };
                KNNImageClassifier.prototype.dispose = function () {
                    this.squeezeNet.dispose();
                    this.clearTrainLogitsMatrix();
                    this.classLogitsMatrices.forEach(function (classLogitsMatrix) {
                        return classLogitsMatrix.dispose();
                    });
                    this.squashLogitsDenominator.dispose();
                };
                return KNNImageClassifier;
            }());
            exports.KNNImageClassifier = KNNImageClassifier;

        }, {
            "../util": 5,
            "deeplearn": 67,
            "deeplearn-squeezenet": 7
        }],
        5: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            function topK(values, k) {
                var valuesAndIndices = [];
                for (var i = 0; i < values.length; i++) {
                    valuesAndIndices.push({
                        value: values[i],
                        index: i
                    });
                }
                valuesAndIndices.sort(function (a, b) {
                    return b.value - a.value;
                });
                var topkValues = new Float32Array(k);
                var topkIndices = new Int32Array(k);
                for (var i = 0; i < k; i++) {
                    topkValues[i] = valuesAndIndices[i].value;
                    topkIndices[i] = valuesAndIndices[i].index;
                }
                return {
                    values: topkValues,
                    indices: topkIndices
                };
            }
            exports.topK = topK;

        }, {}],
       

        },:
        
                    this.refCounter = new WeakMap();
                    this.nextTapeNodeId = 0;
                    this.numBytes = 0;
                    this.numTensors = 0;
                    this.numDataBuffers = 0;
                    this.gradientScopeCount = 0;
                    this.customGradientDepth = 0;
                    this.activeScope = {
                        keep: [],
                        track: []
                    };
                    this.scopeStack = [this.activeScope];
                    this.profiler = new profiler_1.Profiler(backend);
                }
                Engine.prototype.runKernel = function (forwardFunc, inputs, backwardsFunc) {
                    var _this = this;
                    var result;
                    var saved = [];
                    var saveFunc = function (x) {
                        saved.push(x);
                        return x;
                    };
                    var scopeName = this.activeScope.name;
                    if (!environment_1.ENV.get('DEBUG')) {
                        result = forwardFunc(this.backend, saveFunc);
                    } else {
                        result = this.profiler.profileKernel(scopeName, function () {
                            return forwardFunc(_this.backend, saveFunc);
                        });
                    }
                    var recordKernel = this.activeTape != null && this.customGradientDepth === 0;
                    if (recordKernel) {
                        var tapeNode = {
                            id: this.nextTapeNodeId++,
                            name: scopeName,
                            inputs: inputs,
                            output: result,
                        };
                        if (backwardsFunc != null) {
                            tapeNode.gradient = function (dy) {
                                return backwardsFunc(dy, saved);
                            };
                        }
                        this.activeTape.push(tapeNode);
                    }
                    return result;
                };
                Engine.prototype.registerTensor = function (a) {
                    var refCount = this.refCounter.has(a.dataId) ? this.refCounter.get(a.dataId) : 0;
                    this.numTensors++;
                    if (refCount === 0) {
                        this.numDataBuffers++;
                        this.numBytes +=
                            util.sizeFromShape(a.shape) * util.bytesPerElement(a.dtype);
                        this.backend.register(a.dataId, a.shape, a.dtype);
                    }
                    this.refCounter.set(a.dataId, refCount + 1);
                    if (!(a instanceof tensor_1.Variable)) {
                        this.track(a);
                    }
                };
                Engine.prototype.registerVariable = function (v) {
                    if (this.registeredVariables[v.name] != null) {
                        throw new Error("Variable with name " + v.name + " was already registered");
                    }
                    this.registeredVariables[v.name] = v;
                };
                Engine.prototype.disposeTensor = function (a) {
                    if (!this.refCounter.has(a.dataId)) {
                        return;
                    }
                    this.numTensors--;
                    var refCount = this.refCounter.get(a.dataId);
                    if (refCount <= 1) {
                        this.refCounter.delete(a.dataId);
                        this.backend.disposeData(a.dataId);
                        this.numDataBuffers--;
                        this.numBytes -=
                            util.sizeFromShape(a.shape) * util.bytesPerElement(a.dtype);
                    } else {
                        this.refCounter.set(a.dataId, refCount - 1);
                    }
                };
                Engine.prototype.memory = function () {
                    var info = this.backend.memory();
                    info.numTensors = this.numTensors;
                    info.numDataBuffers = this.numDataBuffers;
                    info.numBytes = this.numBytes;
                    return info;
                };
                Engine.prototype.shouldRecord = function () {
                    return this.activeTape != null && this.customGradientDepth === 0;
                };
                Engine.prototype.addTapeNode = function (inputs, result, gradientsFunc) {
                    var inputsMap = {};
                    inputs.forEach(function (input, idx) {
                        inputsMap[idx] = input;
                    });
                    var gradient = function (dy) {
                        var res = gradientsFunc(dy);
                        var resMap = {};
                        res.forEach(function (r, idx) {
                            resMap[idx] = function () {
                                return r;
                            };
                        });
                        return resMap;
                    };
                    var tapeNode = {
                        id: this.nextTapeNodeId++,
                        name: this.activeScope.name,
                        inputs: inputsMap,
                        output: result,
                        gradient: gradient
                    };
                    this.activeTape.push(tapeNode);
                };
                Engine.prototype.keep = function (result) {
                    if (this.scopeStack.length === 1 && environment_1.ENV.engine.safeMode) {
                        throw new Error('Safe mode is ON. Enclose all tensor operations inside dl.tidy(): ' +
                            'dl.tidy(() => {...}) to avoid memory leaks.');
                    }
                    this.activeScope.keep.push(result);
                    return result;
                };
                Engine.prototype.startScope = function (name, gradientsMode) {
                    if (gradientsMode === void 0) {
                        gradientsMode = false;
                    }
                    if (gradientsMode && this.gradientScopeCount === 0) {
                        this.activeTape = [];
                    }
                    if (gradientsMode) {
                        this.gradientScopeCount++;
                    }
                    var scopeInfo = {
                        keep: [],
                        track: []
                    };
                    if (name) {
                        scopeInfo.name = name;
                    }
                    this.scopeStack.push(scopeInfo);
                    this.activeScope = scopeInfo;
                };
                Engine.prototype.endScope = function (result, gradientsMode) {
                    var _this = this;
                    if (gradientsMode === void 0) {
                        gradientsMode = false;
                    }
                    if (gradientsMode) {
                        this.gradientScopeCount--;
                        if (this.gradientScopeCount === 0) {
                            this.activeTape = null;
                        }
                    }
                    var tensorsToKeep = this.activeScope.keep;
                    var tensorsToTrackInParent = util.extractTensorsFromContainer(result);
                    tensorsToKeep = tensorsToKeep.concat(tensorsToTrackInParent);
                    for (var i = 0; i < this.activeScope.track.length; i++) {
                        var tensor = this.activeScope.track[i];
                        if (util.isTensorInList(tensor, tensorsToKeep)) {
                            continue;
                        }
                        if (this.activeTape != null) {
                            tensorsToTrackInParent.push(tensor);
                        } else {
                            tensor.dispose();
                        }
                    }
                    this.scopeStack.pop();
                    this.activeScope = this.scopeStack.length === 0 ? {
                            keep: [],
                            track: []
                        } :
                        this.scopeStack[this.scopeStack.length - 1];
                    tensorsToTrackInParent.forEach(function (tensor) {
                        if (!util.isTensorInList(tensor, _this.activeScope.keep)) {
                            _this.track(tensor);
                        }
                    });
                };
                Engine.prototype.dispose = function () {
                    if (this.customBackend) {
                        this.backend.dispose();
                    }
                };
                Engine.prototype.gradients = function (f, xs, dy, allowNoGradients) {
                    var _this = this;
                    if (allowNoGradients === void 0) {
                        allowNoGradients = false;
                    }
                    util.assert(xs.length > 0, 'gradients() received an empty list of xs.');
                    return globals_1.tidy('gradients', function () {
                        var y = f();
                        util.assert(y instanceof tensor_1.Tensor, 'The result y returned by f() must be a tensor.');
                        var filteredTape = tape_1.getFilteredNodesXToY(_this.activeTape, xs, y);
                        if (!allowNoGradients && filteredTape.length === 0 && xs.length > 0) {
                            throw new Error('Cannot compute gradient of y=f(x) with respect to x. Make sure ' +
                                'that the f you passed encloses all operations that lead from x ' +
                                'to y.');
                        }
                        var accumulatedGradientMap = {};
                        accumulatedGradientMap[y.id] = (dy == null) ? ops.ones(y.shape) : dy;
                        tape_1.backpropagateGradients(accumulatedGradientMap, filteredTape);
                        var grads = xs.map(function (x) {
                            return accumulatedGradientMap[x.id];
                        });
                        return {
                            value: y,
                            grads: grads
                        };
                    }, true);
                };
                Engine.prototype.customGrad = function (f) {
                    var _this = this;
                    util.assert(util.isFunction(f), 'The f passed in customGrad(f) must be a function.');
                    return function () {
                        var inputs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            inputs[_i] = arguments[_i];
                        }
                        util.assert(inputs.every(function (t) {
                            return t instanceof tensor_1.Tensor;
                        }), 'The args passed in customGrad(f)(x1, x2,...) must all be tensors');
                        _this.customGradientDepth++;
                        var gradientsFunc;
                        var gradientsMode = true;
                        var result = globals_1.tidy(f.name, function () {
                            var _a = f.apply(void 0, inputs),
                                value = _a.value,
                                gradFunc = _a.gradFunc;
                            util.assert(value instanceof tensor_1.Tensor, 'The function f passed in customGrad(f) must return an object ' +
                                'where `obj.value` is a tensor');
                            util.assert(util.isFunction(gradFunc), 'The function f passed in customGrad(f) must return an object ' +
                                'where `obj.gradFunc` is a function.');
                            gradientsFunc = gradFunc;
                            return value;
                        }, gradientsMode);
                        _this.customGradientDepth--;
                        if (_this.shouldRecord()) {
                            var gradFunc = function (dy) {
                                var res = gradientsFunc(dy);
                                var grads = Array.isArray(res) ? res : [res];
                                util.assert(grads.length === inputs.length, 'The function f passed in customGrad(f) must return an object ' +
                                    'where `obj.gradFunc` is a function that returns the same ' +
                                    'number of tensors as inputs passed to f(...).');
                                util.assert(grads.every(function (t) {
                                        return t instanceof tensor_1.Tensor;
                                    }), 'The function f passed in customGrad(f) must return an object ' +
                                    'where `obj.gradFunc` is a function that returns a list of ' +
                                    'only tensors.');
                                return grads;
                            };
                            _this.addTapeNode(inputs, result, gradFunc);
                        }
                        return result;
                    };
                };
                Engine.prototype.write = function (dataId, values) {
                    this.backend.write(dataId, values);
                };
                Engine.prototype.readSync = function (dataId) {
                    return this.backend.readSync(dataId);
                };
                Engine.prototype.read = function (dataId) {
                    return this.backend.read(dataId);
                };
                Engine.prototype.fromPixels = function (pixels, numChannels) {
                    return this.backend.fromPixels(pixels, numChannels);
                };
                Engine.prototype.time = function (query) {
                    return __awaiter(this, void 0, void 0, function () {
                        var start, timingInfo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    start = performance.now();
                                    return [4, this.backend.time(query)];
                                case 1:
                                    timingInfo = _a.sent();
                                    timingInfo.wallMs = performance.now() - start;
                                    return [2, timingInfo];
                            }
                        });
                    });
                };
                Engine.prototype.track = function (result) {
                    if (this.scopeStack.length === 1 && this.safeMode) {
                        throw new Error('Safe mode is ON. Enclose all tensor operations inside dl.tidy(): ' +
                            'dl.tidy(() => {op();...}); to avoid memory leaks.');
                    }
                    this.activeScope.track.push(result);
                    return result;
                };
                return Engine;
            }());
            exports.Engine = Engine;

        }, {
            "./environment": 34,
            "./globals": 35,
            "./ops/ops": 121,
            "./profiler": 142,
            "./tape": 143,
            "./tensor": 144,
            "./util": 150
        }],
        34: [function (require, module, exports) {
            (function (global) {
                "use strict";
                var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                    var c = arguments.length,
                        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                        d;
                    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                    else
                        for (var i = decorators.length - 1; i >= 0; i--)
                            if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                    return c > 3 && r && Object.defineProperty(target, key, r), r;
                };
                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                var device_util = require("./device_util");
                var doc_1 = require("./doc");
                var engine_1 = require("./engine");
                var math_1 = require("./math");
                var util = require("./util");
                var Type;
                (function (Type) {
                    Type[Type["NUMBER"] = 0] = "NUMBER";
                    Type[Type["BOOLEAN"] = 1] = "BOOLEAN";
                    Type[Type["STRING"] = 2] = "STRING";
                })(Type = exports.Type || (exports.Type = {}));
                exports.URL_PROPERTIES = [{
                        name: 'DEBUG',
                        type: Type.BOOLEAN
                    },
                    {
                        name: 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION',
                        type: Type.NUMBER
                    },
                    {
                        name: 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE',
                        type: Type.BOOLEAN
                    },
                    {
                        name: 'WEBGL_VERSION',
                        type: Type.NUMBER
                    },
                    {
                        name: 'WEBGL_FLOAT_TEXTURE_ENABLED',
                        type: Type.BOOLEAN
                    }, {
                        name: 'WEBGL_GET_BUFFER_SUB_DATA_ASYNC_EXTENSION_ENABLED',
                        type: Type.BOOLEAN
                    },
                    {
                        name: 'BACKEND',
                        type: Type.STRING
                    }
                ];

                function hasExtension(gl, extensionName) {
                    var ext = gl.getExtension(extensionName);
                    return ext != null;
                }

                function getWebGLRenderingContext(webGLVersion) {
                    if (webGLVersion === 0) {
                        throw new Error('Cannot get WebGL rendering context, WebGL is disabled.');
                    }
                    var tempCanvas = document.createElement('canvas');
                    if (webGLVersion === 1) {
                        return (tempCanvas.getContext('webgl') ||
                            tempCanvas.getContext('experimental-webgl'));
                    }
                    return tempCanvas.getContext('webgl2');
                }

                function loseContext(gl) {
                    if (gl != null) {
                        var loseContextExtension = gl.getExtension('WEBGL_lose_context');
                        if (loseContextExtension == null) {
                            throw new Error('Extension WEBGL_lose_context not supported on this browser.');
                        }
                        loseContextExtension.loseContext();
                    }
                }

                function isWebGLVersionEnabled(webGLVersion) {
                    var gl = getWebGLRenderingContext(webGLVersion);
                    if (gl != null) {
                        loseContext(gl);
                        return true;
                    }
                    return false;
                }

                function getWebGLDisjointQueryTimerVersion(webGLVersion) {
                    if (webGLVersion === 0) {
                        return 0;
                    }
                    var queryTimerVersion;
                    var gl = getWebGLRenderingContext(webGLVersion);
                    if (hasExtension(gl, 'EXT_disjoint_timer_query_webgl2') &&
                        webGLVersion === 2) {
                        queryTimerVersion = 2;
                    } else if (hasExtension(gl, 'EXT_disjoint_timer_query')) {
                        queryTimerVersion = 1;
                    } else {
                        queryTimerVersion = 0;
                    }
                    if (gl != null) {
                        loseContext(gl);
                    }
                    return queryTimerVersion;
                }

                function isFloatTextureReadPixelsEnabled(webGLVersion) {
                    if (webGLVersion === 0) {
                        return false;
                    }
                    var gl = getWebGLRenderingContext(webGLVersion);
                    if (webGLVersion === 1) {
                        if (!hasExtension(gl, 'OES_texture_float')) {
                            return false;
                        }
                    } else {
                        if (!hasExtension(gl, 'EXT_color_buffer_float')) {
                            return false;
                        }
                    }
                    var frameBuffer = gl.createFramebuffer();
                    var texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    var internalFormat = webGLVersion === 2 ? gl.RGBA32F : gl.RGBA;
                    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 1, 1, 0, gl.RGBA, gl.FLOAT, null);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                    var frameBufferComplete = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE);
                    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, new Float32Array(4));
                    var readPixelsNoError = gl.getError() === gl.NO_ERROR;
                    loseContext(gl);
                    return frameBufferComplete && readPixelsNoError;
                }

                function isWebGLGetBufferSubDataAsyncExtensionEnabled(webGLVersion) {
                    if (webGLVersion !== 2) {
                        return false;
                    }
                    var gl = getWebGLRenderingContext(webGLVersion);
                    var isEnabled = hasExtension(gl, 'WEBGL_get_buffer_sub_data_async');
                    loseContext(gl);
                    return isEnabled;
                }
                var SUPPORTED_BACKENDS = ['webgl', 'cpu'];
                var Environment = (function () {
                    function Environment(features) {
                        this.features = {};
                        this.BACKEND_REGISTRY = {};
                        this.backends = this.BACKEND_REGISTRY;
                        if (features != null) {
                            this.features = features;
                        }
                        if (this.get('DEBUG')) {
                            console.warn('Debugging mode is ON. The output of every math call will ' +
                                'be downloaded to CPU and checked for NaNs. ' +
                                'This significantly impacts performance.');
                        }
                    }
                    Environment.setBackend = function (backendType, safeMode) {
                        if (safeMode === void 0) {
                            safeMode = false;
                        }
                        if (!(backendType in exports.ENV.backends)) {
                            throw new Error("Backend type '" + backendType + "' not found in registry");
                        }
                        exports.ENV.globalMath = new math_1.NDArrayMath(backendType, safeMode);
                    };
                    Environment.getBackend = function () {
                        exports.ENV.initEngine();
                        return exports.ENV.currentBackendType;
                    };
                    Environment.memory = function () {
                        return exports.ENV.engine.memory();
                    };
                    Environment.prototype.get = function (feature) {
                        if (feature in this.features) {
                            return this.features[feature];
                        }
                        this.features[feature] = this.evaluateFeature(feature);
                        return this.features[feature];
                    };
                    Environment.prototype.set = function (feature, value) {
                        this.features[feature] = value;
                    };
                    Environment.prototype.getBestBackendType = function () {
                        for (var i = 0; i < SUPPORTED_BACKENDS.length; ++i) {
                            var backendId = SUPPORTED_BACKENDS[i];
                            if (backendId in this.backends) {
                                return backendId;
                            }
                        }
                        throw new Error('No backend found in registry.');
                    };
                MathBackendCPU.prototype.conv2dDerInput = function (dy, filter, convInfo) {
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var topPad = filterHeight - 1 - convInfo.padInfo.top;
                    var leftPad = filterWidth - 1 - convInfo.padInfo.left;
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var dx = ops.buffer(convInfo.inShape, 'float32');
                    for (var b = 0; b < convInfo.batchSize; ++b) {
                        for (var d1 = 0; d1 < convInfo.inChannels; ++d1) {
                            for (var xR = 0; xR < convInfo.inHeight; ++xR) {
                                var xRCorner = xR - leftPad;
                                var xRMin = Math.max(0, Math.ceil(xRCorner / strideHeight));
                                var yRMax = Math.min(convInfo.outHeight, (filterHeight + xRCorner) / strideHeight);
                                for (var xC = 0; xC < convInfo.inWidth; ++xC) {
                                    var xCCorner = xC - topPad;
                                    var xCMin = Math.max(0, Math.ceil(xCCorner / strideWidth));
                                    var yCMax = Math.min(convInfo.outWidth, (filterWidth + xCCorner) / strideWidth);
                                    var dotProd = 0;
                                    for (var yR = xRMin; yR < yRMax; ++yR) {
                                        var wR = yR * strideHeight - xRCorner;
                                        for (var yC = xCMin; yC < yCMax; ++yC) {
                                            var wC = yC * strideWidth - xCCorner;
                                            for (var d2 = 0; d2 < convInfo.outChannels; ++d2) {
                                                var pixel = dy.get(b, yR, yC, d2);
                                                var weight = filter.get(filterHeight - 1 - wR, filterWidth - 1 - wC, d1, d2);
                                                dotProd += pixel * weight;
                                            }
                                        }
                                    }
                                    dx.set(dotProd, b, xR, xC, d1);
                                }
                            }
                        }
                    }
                    return dx.toTensor();
                };
                MathBackendCPU.prototype.conv2dDerFilter = function (x, dy, convInfo) {
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var dW = ops.buffer(convInfo.filterShape, 'float32');
                    var leftPad = convInfo.padInfo.left;
                    var topPad = convInfo.padInfo.top;
                    for (var wR = 0; wR < filterHeight; ++wR) {
                        var yRMin = Math.max(0, Math.ceil((topPad - wR) / strideHeight));
                        var yRMax = Math.min(convInfo.outHeight, (convInfo.inHeight + topPad - wR) / strideHeight);
                        for (var wC = 0; wC < filterWidth; ++wC) {
                            var yCMin = Math.max(0, Math.ceil((leftPad - wC) / strideWidth));
                            var yCMax = Math.min(convInfo.outWidth, (convInfo.inWidth + leftPad - wC) / strideWidth);
                            for (var d1 = 0; d1 < convInfo.inChannels; ++d1) {
                                for (var d2 = 0; d2 < convInfo.outChannels; ++d2) {
                                    var dotProd = 0;
                                    for (var b = 0; b < convInfo.batchSize; ++b) {
                                        for (var yR = yRMin; yR < yRMax; ++yR) {
                                            var xR = wR + yR * strideHeight - topPad;
                                            for (var yC = yCMin; yC < yCMax; ++yC) {
                                                var xC = wC + yC * strideWidth - leftPad;
                                                dotProd += x.get(b, xR, xC, d1) * dy.get(b, yR, yC, d2);
                                            }
                                        }
                                    }
                                    dW.set(dotProd, wR, wC, d1, d2);
                                }
                            }
                        }
                    }
                    return dW.toTensor();
                };
                MathBackendCPU.prototype.depthwiseConv2D = function (x, filter, convInfo) {
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var padLeft = convInfo.padInfo.left;
                    var padTop = convInfo.padInfo.top;
                    var chMul = convInfo.outChannels / convInfo.inChannels;
                    var y = ops.buffer(convInfo.outShape, x.dtype);
                    for (var b = 0; b < convInfo.batchSize; ++b) {
                        for (var d1 = 0; d1 < convInfo.inChannels; ++d1) {
                            for (var yR = 0; yR < convInfo.outHeight; ++yR) {
                                var xRCorner = yR * convInfo.strideHeight - padLeft;
                                var xRMin = Math.max(0, xRCorner);
                                var xRMax = Math.min(convInfo.inHeight, filterHeight + xRCorner);
                                for (var yC = 0; yC < convInfo.outWidth; ++yC) {
                                    var xCCorner = yC * convInfo.strideWidth - padTop;
                                    var xCMin = Math.max(0, xCCorner);
                                    var xCMax = Math.min(convInfo.inWidth, filterWidth + xCCorner);
                                    for (var q = 0; q < chMul; ++q) {
                                        var dotProd = 0;
                                        for (var xR = xRMin; xR < xRMax; ++xR) {
                                            var wR = xR - xRCorner;
                                            for (var xC = xCMin; xC < xCMax; ++xC) {
                                                var wC = xC - xCCorner;
                                                var pixel = x.get(b, xR, xC, d1);
                                                var weight = filter.get(wR, wC, d1, q);
                                                dotProd += pixel * weight;
                                            }
                                        }
                                        y.set(dotProd, b, yR, yC, d1 * chMul + q);
                                    }
                                }
                            }
                        }
                    }
                    return y.toTensor();
                };
                MathBackendCPU.prototype.tile = function (x, reps) {
                    var newShape = new Array(x.rank);
                    for (var i = 0; i < newShape.length; i++) {
                        newShape[i] = x.shape[i] * reps[i];
                    }
                    var result = ops.buffer(newShape, x.dtype);
                    var values = x.dataSync();
                    for (var i = 0; i < result.values.length; ++i) {
                        var newLoc = result.indexToLoc(i);
                        var originalLoc = new Array(x.rank);
                        for (var i_1 = 0; i_1 < originalLoc.length; i_1++) {
                            originalLoc[i_1] = newLoc[i_1] % x.shape[i_1];
                        }
                        var originalIndex = x.locToIndex(originalLoc);
                        result.values[i] = values[originalIndex];
                    }
                    return result.toTensor();
                };
                MathBackendCPU.prototype.pad = function (x, paddings, constantValue) {
                    var outShape = paddings.map(function (p, i) {
                        return p[0] + x.shape[i] + p[1];
                    });
                    var start = paddings.map(function (p) {
                        return p[0];
                    });
                    var xBuffer = x.buffer();
                    var buffer = ops.buffer(outShape, x.dtype);
                    if (constantValue !== 0) {
                        buffer.values.fill(constantValue);
                    }
                    for (var i = 0; i < x.size; i++) {
                        var coords = xBuffer.indexToLoc(i);
                        var outCoords = coords.map(function (c, i) {
                            return c + start[i];
                        });
                        buffer.set.apply(buffer, [x.get.apply(x, coords)].concat(outCoords));
                    }
                    return buffer.toTensor();
                };
                MathBackendCPU.prototype.transpose = function (x, perm) {
                    var newShape = new Array(x.rank);
                    for (var i = 0; i < newShape.length; i++) {
                        newShape[i] = x.shape[perm[i]];
                    }
                    var resultValues = new Float32Array(x.size);
                    var values = x.dataSync();
                    var result = tensor_1.Tensor.make(newShape, {
                        values: resultValues
                    });
                    for (var i = 0; i < x.size; ++i) {
                        var loc = x.indexToLoc(i);
                        var newLoc = new Array(loc.length);
                        for (var i_2 = 0; i_2 < newLoc.length; i_2++) {
                            newLoc[i_2] = loc[perm[i_2]];
                        }
                        var newIndex = result.locToIndex(newLoc);
                        resultValues[newIndex] = values[i];
                    }
                    return result;
                };
                MathBackendCPU.prototype.gather = function (x, indices, axis) {
                    var newShape = x.shape.slice();
                    var indicesValues = indices.dataSync();
                    newShape[axis] = indicesValues.length;
                    var result = ops.zeros(newShape, x.dtype);
                    var values = x.dataSync();
                    var resultValues = result.dataSync();
                    for (var i = 0; i < result.size; ++i) {
                        var newLoc = result.indexToLoc(i);
                        var originalLoc = newLoc.slice();
                        originalLoc[axis] = indicesValues[newLoc[axis]];
                        var originalIndex = x.locToIndex(originalLoc);
                        resultValues[i] = values[originalIndex];
                    }
                    return result;
                };
                MathBackendCPU.prototype.pool = function (x, convInfo, poolType) {
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var y = ops.buffer(convInfo.outShape, 'float32');
                    var padTop = convInfo.padInfo.top;
                    var padLeft = convInfo.padInfo.left;
                    for (var b = 0; b < convInfo.batchSize; ++b) {
                        for (var d = 0; d < convInfo.inChannels; ++d) {
                            for (var yR = 0; yR < convInfo.outHeight; ++yR) {
                                var xRCorner = yR * strideHeight - padTop;
                                var xRMin = Math.max(0, xRCorner);
                                var xRMax = Math.min(convInfo.inHeight, filterHeight + xRCorner);
                                for (var yC = 0; yC < convInfo.outWidth; ++yC) {
                                    var xCCorner = yC * strideWidth - padLeft;
                                    var xCMin = Math.max(0, xCCorner);
                                    var xCMax = Math.min(convInfo.inWidth, filterWidth + xCCorner);
                                    var minMaxValue = (poolType === 'max' ? Number.NEGATIVE_INFINITY :
                                        Number.POSITIVE_INFINITY);
                                    var avgValue = 0;
                                    for (var xR = xRMin; xR < xRMax; ++xR) {
                                        for (var xC = xCMin; xC < xCMax; ++xC) {
                                            var pixel = x.get(b, xR, xC, d);
                                            if (isNaN(pixel)) {
                                                minMaxValue = NaN;
                                                avgValue = NaN;
                                                break;
                                            }
                                            if ((poolType === 'max' && pixel > minMaxValue) ||
                                                (poolType === 'min' && pixel < minMaxValue)) {
                                                minMaxValue = pixel;
                                            } else if (poolType === 'avg') {
                                                avgValue += pixel / (filterHeight * filterWidth);
                                            }
                                        }
                                        if (isNaN(minMaxValue)) {
                                            break;
                                        }
                                    }
                                    y.set(poolType === 'avg' ? avgValue : minMaxValue, b, yR, yC, d);
                                }
                            }
                        }
                    }
                    return y.toTensor();
                };
                MathBackendCPU.prototype.maxPool = function (x, convInfo) {
                    return this.pool(x, convInfo, 'max');
                };
                MathBackendCPU.prototype.maxPoolPositions = function (x, convInfo) {
                    var maxPositions = ops.buffer(convInfo.outShape, 'int32');
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var padTop = convInfo.padInfo.top;
                    var padLeft = convInfo.padInfo.left;
                    for (var b = 0; b < convInfo.batchSize; ++b) {
                        for (var d = 0; d < convInfo.inChannels; ++d) {
                            for (var yR = 0; yR < convInfo.outHeight; ++yR) {
                                var xRCorner = yR * strideHeight - padTop;
                                var xRMin = Math.max(0, xRCorner);
                                var xRMax = Math.min(convInfo.inHeight, filterHeight + xRCorner);
                                for (var yC = 0; yC < convInfo.outWidth; ++yC) {
                                    var xCCorner = yC * strideWidth - padLeft;
                                    var xCMin = Math.max(0, xCCorner);
                                    var xCMax = Math.min(convInfo.inWidth, filterWidth + xCCorner);
                                    var maxValue = Number.NEGATIVE_INFINITY;
                                    var maxPosition = -1;
                                    for (var xR = xRMin; xR < xRMax; ++xR) {
                                        var wR = xR - xRCorner;
                                        for (var xC = xCMin; xC < xCMax; ++xC) {
                                            var wC = xC - xCCorner;
                                            var pixel = x.get(b, xR, xC, d);
                                            if (pixel > maxValue) {
                                                maxValue = pixel;
                                                maxPosition = wR * filterWidth + wC;
                                            }
                                        }
                                    }
                                    maxPositions.set(maxPosition, b, yR, yC, d);
                                }
                            }
                        }
                    }
                    return maxPositions.toTensor();
                };
                MathBackendCPU.prototype.maxPoolBackprop = function (dy, x, convInfo) {
                    var maxPositions = this.maxPoolPositions(x, convInfo);
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var padLeft = filterWidth - 1 - convInfo.padInfo.left;
                    var padTop = filterHeight - 1 - convInfo.padInfo.top;
                    var dx = ops.buffer(x.shape, 'float32');
                    for (var b = 0; b < convInfo.batchSize; ++b) {
                        for (var d = 0; d < convInfo.inChannels; ++d) {
                            for (var dxR = 0; dxR < convInfo.inHeight; ++dxR) {
                                for (var dxC = 0; dxC < convInfo.inWidth; ++dxC) {
                                    var dyRCorner = dxR - padTop;
                                    var dyCCorner = dxC - padLeft;
                                    var dotProd = 0;
                                    for (var wR = 0; wR < filterHeight; ++wR) {
                                        var dyR = (dyRCorner + wR) / strideHeight;
                                        if (dyR < 0 || dyR >= convInfo.outHeight ||
                                            Math.floor(dyR) !== dyR) {
                                            continue;
                                        }
                                        for (var wC = 0; wC < filterWidth; ++wC) {
                                            var dyC = (dyCCorner + wC) / strideWidth;
                                            if (dyC < 0 || dyC >= convInfo.outWidth ||
                                                Math.floor(dyC) !== dyC) {
                                                continue;
                                            }
                                            var maxPos = filterHeight * filterWidth - 1 -
                                                maxPositions.get(b, dyR, dyC, d);
                                            var curPos = wR * filterWidth + wC;
                                            var mask = maxPos === curPos ? 1 : 0;
                                            if (mask === 0) {
                                                continue;
                                            }
                                            var pixel = dy.get(b, dyR, dyC, d);
                                            dotProd += pixel * mask;
                                        }
                                    }
                                    dx.set(dotProd, b, dxR, dxC, d);
                                }
                            }
                        }
                    }
                    return dx.toTensor();
                };
                MathBackendCPU.prototype.avgPoolBackprop = function (dy, x, convInfo) {
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var padLeft = filterWidth - 1 - convInfo.padInfo.left;
                    var padTop = filterHeight - 1 - convInfo.padInfo.top;
                    var dx = ops.buffer(x.shape, 'float32');
                    var avgMultiplier = 1 / (filterHeight * filterWidth);
                    for (var b = 0; b < convInfo.batchSize; ++b) {
                        for (var d = 0; d < convInfo.inChannels; ++d) {
                            for (var dxR = 0; dxR < convInfo.inHeight; ++dxR) {
                                for (var dxC = 0; dxC < convInfo.inWidth; ++dxC) {
                                    var dyRCorner = dxR - padTop;
                                    var dyCCorner = dxC - padLeft;
                                    var dotProd = 0;
                                    for (var wR = 0; wR < filterHeight; ++wR) {
                                        var dyR = (dyRCorner + wR) / strideHeight;
                                        if (dyR < 0 || dyR >= convInfo.outHeight ||
                                            Math.floor(dyR) !== dyR) {
                                            continue;
                                        }
                                        for (var wC = 0; wC < filterWidth; ++wC) {
                                            var dyC = (dyCCorner + wC) / strideWidth;
                                            if (dyC < 0 || dyC >= convInfo.outWidth ||
                                                Math.floor(dyC) !== dyC) {
                                                continue;
                                            }
                                            var pixel = dy.get(b, dyR, dyC, d);
                                            dotProd += pixel;
                                        }
                                    }
                                    dx.set(dotProd * avgMultiplier, b, dxR, dxC, d);
                                }
                            }
                        }
                    }
                    return dx.toTensor();
                };
                MathBackendCPU.prototype.minPool = function (x, convInfo) {
                    return this.pool(x, convInfo, 'min');
                };
                MathBackendCPU.prototype.avgPool = function (x, convInfo) {
                    return this.pool(x, convInfo, 'avg').toFloat();
                };
                MathBackendCPU.prototype.resizeBilinear = function (x, newHeight, newWidth, alignCorners) {
                    var _a = x.shape,
                        batch = _a[0],
                        oldHeight = _a[1],
                        oldWidth = _a[2],
                        numChannels = _a[3];
                    var output = ops.buffer([batch, newHeight, newWidth, numChannels], x.dtype);
                    var effectiveInputSize = alignCorners ? [oldHeight - 1, oldWidth - 1] : [oldHeight, oldWidth];
                    var effectiveOutputSize = alignCorners ? [newHeight - 1, newWidth - 1] : [newHeight, newWidth];
                    for (var b = 0; b < batch; b++) {
                        for (var r = 0; r < newHeight; r++) {
                            for (var c = 0; c < newWidth; c++) {
                                for (var d = 0; d < numChannels; d++) {
                                    var sourceFracRow = (effectiveInputSize[0]) * r / (effectiveOutputSize[0]);
                                    var sourceFracCol = (effectiveInputSize[1]) * c / (effectiveOutputSize[1]);
                                    var sourceRowFloor = Math.floor(sourceFracRow);
                                    var sourceRowCeil = Math.min(oldHeight - 1, Math.ceil(sourceFracRow));
                                    var sourceColFloor = Math.floor(sourceFracCol);
                                    var sourceColCeil = Math.min(oldWidth - 1, Math.ceil(sourceFracCol));
                                    var topLeft = x.get(b, sourceRowFloor, sourceColFloor, d);
                                    var bottomLeft = x.get(b, sourceRowCeil, sourceColFloor, d);
                                    var topRight = x.get(b, sourceRowFloor, sourceColCeil, d);
                                    var bottomRight = x.get(b, sourceRowCeil, sourceColCeil, d);
                                    var rowFrac = sourceFracRow - sourceRowFloor;
                                    var colFrac = sourceFracCol - sourceColFloor;
                                    var top_1 = topLeft + (topRight - topLeft) * colFrac;
                                    var bottom = bottomLeft + (bottomRight - bottomLeft) * colFrac;
                                    var newValue = top_1 + (bottom - top_1) * rowFrac;
                                    output.set(newValue, b, r, c, d);
                                }
                            }
                        }
                    }
                    return output.toTensor();
                };
                MathBackendCPU.prototype.batchNormalization4D = function (x, mean, variance, varianceEpsilon, scale, offset) {
                    var xValues = x.dataSync();
                    var meanValues = mean.dataSync();
                    var varianceValues = variance.dataSync();
                    var scaleValues = scale ? scale.dataSync() : new Float32Array([1]);
                    var offsetValues = offset ? offset.dataSync() : new Float32Array([0]);
                    var outValues = new Float32Array(xValues.length);
                    for (var i = 0; i < xValues.length; i++) {
                        outValues[i] = offsetValues[i % offsetValues.length] +
                            (xValues[i] - meanValues[i % meanValues.length]) *
                            scaleValues[i % scaleValues.length] /
                            Math.sqrt(varianceValues[i % varianceValues.length] + varianceEpsilon);
                    }
                    return ops_1.tensor4d(outValues, x.shape);
                };
                MathBackendCPU.prototype.localResponseNormalization4D = function (x, radius, bias, alpha, beta, normRegion) {
                    var output = ops.buffer(x.shape, 'float32');
                    var rad = radius;
                    var maxW = output.shape[1] - 1;
                    var maxH = output.shape[2] - 1;
                    var maxD = output.shape[3] - 1;
                    var sumAcrossChannels = function (b, r, c, d) {
                        var sum = 0.0;
                        for (var j = Math.max(0, d - rad); j <= Math.min(d + rad, maxD); j++) {
                            var z = x.get(b, r, c, j);
                            sum += z * z;
                        }
                        return sum;
                    };
                    var sumWithinChannel = function (b, r, c, d) {
                        var sum = 0.0;
                        for (var u = Math.max(0, r - rad); u <= Math.min(r + rad, maxW); u++) {
                            for (var v = Math.max(0, c - rad); v <= Math.min(c + rad, maxH); v++) {
                                sum += Math.pow(x.get(b, u, v, d), 2);
                            }
                        }
                        return sum;
                    };
                    for (var b = 0; b < output.shape[0]; b++) {
                        for (var r = 0; r <= output.shape[1]; r++) {
                            for (var c = 0; c < output.shape[2]; c++) {
                                for (var d = 0; d < output.shape[3]; d++) {
                                    var sum = normRegion === 'withinChannel' ?
                                        sumWithinChannel(b, r, c, d) :
                                        sumAcrossChannels(b, r, c, d);
                                    var val = x.get(b, r, c, d) * Math.pow(bias + alpha * sum, -beta);
                                    output.set(val, b, r, c, d);
                                }
                            }
                        }
                    }
                    return output.toTensor();
                };
                MathBackendCPU.prototype.multinomial = function (probabilities, numSamples, seed) {
                    var batchSize = probabilities.shape[0];
                    var numEvents = probabilities.shape[1];
                    var res = ops.zeros([batchSize, numSamples], 'int32');
                    var resVals = res.dataSync();
                    var probVals = probabilities.dataSync();
                    for (var b = 0; b < batchSize; ++b) {
                        var offset = b * numEvents;
                        var cdf = new Float32Array(numEvents - 1);
                        cdf[0] = probVals[offset];
                        for (var event_1 = 1; event_1 < cdf.length; ++event_1) {
                            cdf[event_1] = cdf[event_1 - 1] + probVals[offset + event_1];
                        }
                        var random = seedrandom.alea(seed.toString());
                        var outOffset = b * numSamples;
                        for (var sampleId = 0; sampleId < numSamples; ++sampleId) {
                            var r = random();
                            resVals[outOffset + sampleId] = cdf.length;
                            for (var event_2 = 0; event_2 < cdf.length; event_2++) {
                                if (r < cdf[event_2]) {
                                    resVals[outOffset + sampleId] = event_2;
                                    break;
                                }
                            }
                        }
                    }
                    return res;
                };
                MathBackendCPU.prototype.oneHot = function (indices, depth, onValue, offValue) {
                    var res = new Float32Array(indices.size * depth);
                    res.fill(offValue);
                    for (var event_3 = 0; event_3 < indices.size; ++event_3) {
                        res[event_3 * depth + indices.get(event_3)] = onValue;
                    }
                    return ops.tensor2d(res, [indices.size, depth]);
                };
                MathBackendCPU.prototype.broadcastedBinaryOp = function (a, b, dtype, op) {
                    var newShape = broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    var result = ops.buffer(newShape, dtype);
                    var aValues = a.dataSync();
                    var bValues = b.dataSync();
                    var aBroadcastDims = broadcast_util.getBroadcastDims(a.shape, newShape);
                    var bBroadcastDims = broadcast_util.getBroadcastDims(b.shape, newShape);
                    var _loop_2 = function (i) {
                        var loc = result.indexToLoc(i);
                        var aLoc = loc.slice(-a.rank);
                        aBroadcastDims.forEach(function (d) {
                            return aLoc[d] = 0;
                        });
                        var aIndex = a.locToIndex(aLoc);
                        var bLoc = loc.slice(-b.rank);
                        bBroadcastDims.forEach(function (d) {
                            return bLoc[d] = 0;
                        });
                        var bIndex = b.locToIndex(bLoc);
                        result.values[i] = op(aValues[aIndex], bValues[bIndex]);
                    };
                    for (var i = 0; i < result.values.length; ++i) {
                        _loop_2(i);
                    }
                    return result.toTensor();
                };
                MathBackendCPU.prototype.dispose = function () {};
                return MathBackendCPU;
            }());
            exports.MathBackendCPU = MathBackendCPU;
            environment_1.ENV.registerBackend('cpu', function () {
                return new MathBackendCPU();
            });
            var NDArrayMathCPU = (function (_super) {
                __extends(NDArrayMathCPU, _super);

                function NDArrayMathCPU(safeMode) {
                    if (safeMode === void 0) {
                        safeMode = false;
                    }
                    var _this = this;
                    console.warn('new NDArrayMathCPU() is deprecated. Please use ' +
                        'dl.setBackend(\'cpu\').');
                    _this = _super.call(this, 'cpu', safeMode) || this;
                    return _this;
                }
                return NDArrayMathCPU;
            }(math_1.NDArrayMath));
            exports.NDArrayMathCPU = NDArrayMathCPU;

        }, {
            "../environment": 34,
            "../math": 103,
            "../ops/axis_util": 105,
            "../ops/broadcast_util": 108,
            "../ops/concat_util": 111,
            "../ops/ops": 121,
            "../ops/selu_util": 127,
            "../tensor": 144,
            "../types": 149,
            "../util": 150,
            "seedrandom": 153
        }],
        69: [function (require, module, exports) {
            "use strict";
            var __extends = (this && this.__extends) || (function () {
                var extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function (d, b) {
                            d.__proto__ = b;
                        }) ||
                    function (d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return function (d, b) {
                    extendStatics(d, b);

                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            })();
            var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
                return new(P || (P = Promise))(function (resolve, reject) {
                    function fulfilled(value) {
                        try {
                            step(generator.next(value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function rejected(value) {
                        try {
                            step(generator["throw"](value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function step(result) {
                        result.done ? resolve(result.value) : new P(function (resolve) {
                            resolve(result.value);
                        }).then(fulfilled, rejected);
                    }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
            };
            var __generator = (this && this.__generator) || function (thisArg, body) {
                var _ = {
                        label: 0,
                        sent: function () {
                            if (t[0] & 1) throw t[1];
                            return t[1];
                        },
                        trys: [],
                        ops: []
                    },
                    f, y, t, g;
                return g = {
                    next: verb(0),
                    "throw": verb(1),
                    "return": verb(2)
                }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
                    return this;
                }), g;

                function verb(n) {
                    return function (v) {
                        return step([n, v]);
                    };
                }

                function step(op) {
                    if (f) throw new TypeError("Generator is already executing.");
                    while (_) try {
                        if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                        if (y = 0, t) op = [0, t.value];
                        switch (op[0]) {
                            case 0:
                            case 1:
                                t = op;
                                break;
                            case 4:
                                _.label++;
                                return {
                                    value: op[1],
                                    done: false
                                };
                            case 5:
                                _.label++;
                                y = op[1];
                                op = [0];
                                continue;
                            case 7:
                                op = _.ops.pop();
                                _.trys.pop();
                                continue;
                            default:
                                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                    _ = 0;
                                    continue;
                                }
                                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                    _.label = op[1];
                                    break;
                                }
                                if (op[0] === 6 && _.label < t[1]) {
                                    _.label = t[1];
                                    t = op;
                                    break;
                                }
                                if (t && _.label < t[2]) {
                                    _.label = t[2];
                                    _.ops.push(op);
                                    break;
                                }
                                if (t[2]) _.ops.pop();
                                _.trys.pop();
                                continue;
                        }
                        op = body.call(thisArg, _);
                    } catch (e) {
                        op = [6, e];
                        y = 0;
                    } finally {
                        f = t = 0;
                    }
                    if (op[0] & 5) throw op[1];
                    return {
                        value: op[0] ? op[1] : void 0,
                        done: true
                    };
                }
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../environment");
            var math_1 = require("../math");
            var axis_util = require("../ops/axis_util");
            var reduce_util = require("../ops/reduce_util");
            var tensor_1 = require("../tensor");
            var types = require("../types");
            var util = require("../util");
            var argminmax_gpu_1 = require("./webgl/argminmax_gpu");
            var avg_pool_backprop_gpu_1 = require("./webgl/avg_pool_backprop_gpu");
            var batchnorm_gpu_1 = require("./webgl/batchnorm_gpu");
            var binaryop_gpu = require("./webgl/binaryop_gpu");
            var binaryop_gpu_1 = require("./webgl/binaryop_gpu");
            var clip_gpu_1 = require("./webgl/clip_gpu");
            var concat_gpu_1 = require("./webgl/concat_gpu");
            var conv_backprop_gpu_1 = require("./webgl/conv_backprop_gpu");
            var conv_gpu_1 = require("./webgl/conv_gpu");
            var conv_gpu_depthwise_1 = require("./webgl/conv_gpu_depthwise");
            var from_pixels_gpu_1 = require("./webgl/from_pixels_gpu");
            var gather_gpu_1 = require("./webgl/gather_gpu");
            var gpgpu_context_1 = require("./webgl/gpgpu_context");
            var gpgpu_math = require("./webgl/gpgpu_math");
            var logical_gpu_1 = require("./webgl/logical_gpu");
            var lrn_gpu_1 = require("./webgl/lrn_gpu");
            var max_pool_backprop_gpu_1 = require("./webgl/max_pool_backprop_gpu");
            var mulmat_gpu_1 = require("./webgl/mulmat_gpu");
            var multinomial_gpu_1 = require("./webgl/multinomial_gpu");
            var onehot_gpu_1 = require("./webgl/onehot_gpu");
            var pad_gpu_1 = require("./webgl/pad_gpu");
            var pool_gpu_1 = require("./webgl/pool_gpu");
            var reduce_gpu_1 = require("./webgl/reduce_gpu");
            var resize_bilinear_gpu_1 = require("./webgl/resize_bilinear_gpu");
            var reverse_gpu_1 = require("./webgl/reverse_gpu");
            var slice_gpu_1 = require("./webgl/slice_gpu");
            var tex_util_1 = require("./webgl/tex_util");
            var texture_manager_1 = require("./webgl/texture_manager");
            var tile_gpu_1 = require("./webgl/tile_gpu");
            var transpose_gpu_1 = require("./webgl/transpose_gpu");
            var unary_op = require("./webgl/unaryop_gpu");
            var unaryop_gpu_1 = require("./webgl/unaryop_gpu");
            var webgl_util = require("./webgl/webgl_util");
            var MathBackendWebGL = (function () {
                function MathBackendWebGL(gpgpu, delayedStorage) {
                    if (delayedStorage === void 0) {
                        delayedStorage = true;
                    }
                    this.gpgpu = gpgpu;
                    this.delayedStorage = delayedStorage;
                    this.texData = new WeakMap();
                    this.uploadWaitMs = 0;
                    this.downloadWaitMs = 0;
                    this.binaryCache = {};
                    this.disposed = false;
                    if (environment_1.ENV.get('WEBGL_VERSION') < 1) {
                        throw new Error('WebGL is not supported on this device');
                    }
                    if (gpgpu == null) {
                        this.gpgpu = new gpgpu_context_1.GPGPUContext();
                        this.gpgpuCreatedLocally = true;
                    } else {
                        this.gpgpuCreatedLocally = false;
                    }
                    if (typeof document !== 'undefined') {
                        this.canvas = document.createElement('canvas');
                    }
                    this.textureManager = new texture_manager_1.TextureManager(this.gpgpu);
                }
                MathBackendWebGL.prototype.register = function (dataId, shape, dtype) {
                    if (this.texData.has(dataId)) {
                        throw new Error('Data buffer is already registered');
                    }
                    this.texData.set(dataId, {
                        shape: shape,
                        dtype: dtype,
                        values: null,
                        texture: null,
                        texShape: null,
                        texType: tex_util_1.TextureType.FLOAT
                    });
                };
                MathBackendWebGL.prototype.fromPixels = function (pixels, numChannels) {
                    if (pixels == null) {
                        throw new Error('MathBackendWebGL.writePixels(): pixels can not be null');
                    }
                    var texShape = [pixels.height, pixels.width];
                    var outShape = [pixels.height, pixels.width, numChannels];
                    if (pixels instanceof HTMLVideoElement) {
                        if (this.canvas == null) {
                            throw new Error('Can\'t read pixels from HTMLImageElement outside ' +
                                'the browser.');
                        }
                        this.canvas.width = pixels.width;
                        this.canvas.height = pixels.height;
                        this.canvas.getContext('2d').drawImage(pixels, 0, 0, pixels.width, pixels.height);
                        pixels = this.canvas;
                    }
                    var tempPixelArray = tensor_1.Tensor.make(texShape, {}, 'int32');
                    this.texData.get(tempPixelArray.dataId).texType = tex_util_1.TextureType.UNSIGNED_BYTE;
                    this.gpgpu.uploadPixelDataToTexture(this.getTexture(tempPixelArray.dataId), pixels);
                    var program = new from_pixels_gpu_1.FromPixelsProgram(outShape);
                    var res = this.compileAndRun(program, [tempPixelArray]);
                    tempPixelArray.dispose();
                    return res;
                };
                MathBackendWebGL.prototype.write = function (dataId, values) {
                    if (values == null) {
                        throw new Error('MathBackendWebGL.write(): values can not be null');
                    }
                    this.throwIfNoData(dataId);
                    var texData = this.texData.get(dataId);
                    var texture = texData.texture,
                        texShape = texData.texShape,
                        texType = texData.texType;
                    if (texture != null) {
                        this.textureManager.releaseTexture(texture, texShape, texType);
                        texData.texture = null;
                        texData.texShape = null;
                    }
                    texData.values = values;
                    if (!this.delayedStorage) {
                        this.uploadToGPU(dataId);
                    }
                };
                MathBackendWebGL.prototype.readSync = function (dataId) {
                    this.throwIfNoData(dataId);
                    var texData = this.texData.get(dataId);
                    var texture = texData.texture,
                        values = texData.values,
                        texShape = texData.texShape;
                    if (values != null) {
                        this.cacheOnCPU(dataId);
                        return values;
                    }
                    var shouldTimeProgram = this.activeTimers != null;
                    var start;
                    if (shouldTimeProgram) {
                        start = performance.now();
                    }
                    var float32Values = this.gpgpu.downloadMatrixFromTexture(texture, texShape[0], texShape[1]);
                    if (shouldTimeProgram) {
                        this.downloadWaitMs += performance.now() - start;
                    }
                    this.cacheOnCPU(dataId, float32Values);
                    return texData.values;
                };
                MathBackendWebGL.prototype.read = function (dataId) {
                    return __awaiter(this, void 0, void 0, function () {
                        var texData, texture, values, texShape, float32Values;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.throwIfNoData(dataId);
                                    texData = this.texData.get(dataId);
                                    texture = texData.texture, values = texData.values, texShape = texData.texShape;
                                    if (values != null) {
                                        this.cacheOnCPU(dataId);
                                        return [2, values];
                                    }
                                    if (!environment_1.ENV.get('WEBGL_GET_BUFFER_SUB_DATA_ASYNC_EXTENSION_ENABLED')) return [3, 2];
                                    return [4, this.gpgpu.downloadMatrixFromTextureAsync(texture, texShape[0], texShape[1])];
                                case 1:
                                    float32Values = _a.sent();
                                    this.cacheOnCPU(dataId, float32Values);
                                    return [2, texData.values];
                                case 2:
                                    if (environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION') === 0) {
                                        return [2, this.readSync(dataId)];
                                    }
                                    return [4, this.gpgpu.runQuery(function () {})];
                                case 3:
                                    _a.sent();
                                    return [2, this.readSync(dataId)];
                            }
                        });
                    });
                };
                MathBackendWebGL.prototype.time = function (f) {
                    return __awaiter(this, void 0, void 0, function () {
                        var oldActiveTimers, newActiveTimers, outerMostTime, flattenedActiveTimers, kernelMs, res;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    oldActiveTimers = this.activeTimers;
                                    newActiveTimers = [];
                                    outerMostTime = false;
                                    if (this.programTimersStack == null) {
                                        this.programTimersStack = newActiveTimers;
                                        outerMostTime = true;
                                    } else {
                                        this.activeTimers.push(newActiveTimers);
                                    }
                                    this.activeTimers = newActiveTimers;
                                    f();
                                    flattenedActiveTimers = util.flatten(this.activeTimers);
                                    this.activeTimers = oldActiveTimers;
                                    if (outerMostTime) {
                                        this.programTimersStack = null;
                                    }
                                    return [4, Promise.all(flattenedActiveTimers).then(function (results) {
                                        var sum = 0;
                                        results.forEach(function (result) {
                                            return sum += result;
                                        });
                                        return sum;
                                    })];
                                case 1:
                                    kernelMs = _a.sent();
                                    res = {
                                        uploadWaitMs: this.uploadWaitMs,
                                        downloadWaitMs: this.downloadWaitMs,
                                        kernelMs: kernelMs,
                                        wallMs: null
                                    };
                                    this.uploadWaitMs = 0;
                                    this.downloadWaitMs = 0;
                                    return [2, res];
                            }
                        });
                    });
                };
                MathBackendWebGL.prototype.memory = function () {
                    return {
                        unreliable: false
                    };
                };
                MathBackendWebGL.prototype.startTimer = function () {
                    if (environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION') > 0) {
                        return this.gpgpu.beginQuery();
                    }
                    return {
                        startMs: performance.now(),
                        endMs: null
                    };
                };
                MathBackendWebGL.prototype.endTimer = function (query) {
                    if (environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION') > 0) {
                        this.gpgpu.endQuery();
                        return query;
                    }
                    query.endMs = performance.now();
                    return query;
                };
                MathBackendWebGL.prototype.getQueryTime = function (query) {
                    return __awaiter(this, void 0, void 0, function () {
                        var timerQuery;
                        return __generator(this, function (_a) {
                            if (environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION') > 0) {
                                return [2, this.gpgpu.pollQueryTime(query)];
                            }
                            timerQuery = query;
                            return [2, timerQuery.endMs - timerQuery.startMs];
                        });
                    });
                };
                MathBackendWebGL.prototype.disposeData = function (dataId) {
                    if (this.texData.has(dataId)) {
                        var _a = this.texData.get(dataId),
                            texture = _a.texture,
                            texShape = _a.texShape,
                            texType = _a.texType;
                        if (texture != null) {
                            this.textureManager.releaseTexture(texture, texShape, texType);
                        }
                        this.texData.delete(dataId);
                    }
                };
                MathBackendWebGL.prototype.getTexture = function (dataId) {
                    this.uploadToGPU(dataId);
                    return this.texData.get(dataId).texture;
                };
                MathBackendWebGL.prototype.getTextureData = function (dataId) {
                    this.uploadToGPU(dataId);
                    return this.texData.get(dataId);
                };
                MathBackendWebGL.prototype.getGPGPUContext = function () {
                    return this.gpgpu;
                };
                MathBackendWebGL.prototype.slice = function (x, begin, size) {
                    var program = new slice_gpu_1.SliceProgram(size);
                    var customSetup = program.getCustomSetupFunc(begin);
                    return this.compileAndRun(program, [x], null, customSetup);
                };
                MathBackendWebGL.prototype.reverse = function (x, axis) {
                    var program = new reverse_gpu_1.ReverseProgram(x.shape, axis);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.concat = function (a, b) {
                    var program = new concat_gpu_1.ConcatProgram(a.shape, b.shape);
                    return this.compileAndRun(program, [a, b]);
                };
                MathBackendWebGL.prototype.neg = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.NEG);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.matMul = function (a, b, transposeA, transposeB) {
                    var program = new mulmat_gpu_1.MatMulProgram(a.shape, b.shape, transposeA, transposeB);
                    return this.compileAndRun(program, [a, b]);
                };
                MathBackendWebGL.prototype.multiply = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.MUL, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, types.upcastType(a.dtype, b.dtype));
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.batchNormalization4D = function (x, mean, variance, varianceEpsilon, scale, offset) {
                    var inputs = [x, mean, variance];
                    var offsetShape = null;
                    if (offset != null) {
                        offsetShape = offset.shape;
                        inputs.push(offset);
                    }
                    var scaleShape = null;
                    if (scale != null) {
                        scaleShape = scale.shape;
                        inputs.push(scale);
                    }
                    var program = new batchnorm_gpu_1.BatchNormProgram(x.shape, mean.shape, variance.shape, offsetShape, scaleShape, varianceEpsilon);
                    return this.compileAndRun(program, inputs);
                };
                MathBackendWebGL.prototype.localResponseNormalization4D = function (x, radius, bias, alpha, beta, normRegion) {
                    var program = new lrn_gpu_1.LRNProgram(x.shape, radius, bias, alpha, beta, normRegion);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.tile = function (x, reps) {
                    var program = new tile_gpu_1.TileProgram(x.shape, reps);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.pad = function (x, paddings, constantValue) {
                    var program = new pad_gpu_1.PadProgram(x.shape, paddings, constantValue);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.transpose = function (x, perm) {
                    var program = new transpose_gpu_1.TransposeProgram(x.shape, perm);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.gather = function (x, indices, axis) {
                    var program = new gather_gpu_1.GatherProgram(x.shape, indices.size, axis);
                    return this.compileAndRun(program, [x, indices]);
                };
                MathBackendWebGL.prototype.reduce = function (x, reduceType, dtype) {
                    var batchSize = x.shape[0];
                    var inSize = x.shape[1];
                    var windowSize = reduce_util.computeOptimalWindowSize(inSize);
                    var reduceInfo = {
                        windowSize: windowSize,
                        inSize: inSize,
                        batchSize: batchSize
                    };
                    var program = new reduce_gpu_1.ReduceProgram(reduceInfo, reduceType);
                    var _a = program.outputShape,
                        rows = _a[0],
                        cols = _a[1];
                    var output = this.makeOutputArray([rows, cols], dtype);
                    this.compileAndRun(program, [x], output);
                    if (output.shape[1] === 1) {
                        return output;
                    }
                    return this.reduce(output, reduceType, dtype);
                };
                MathBackendWebGL.prototype.argReduce = function (x, reduceType, bestIndicesA) {
                    if (bestIndicesA === void 0) {
                        bestIndicesA = null;
                    }
                    var batchSize = x.shape[0];
                    var inSize = x.shape[1];
                    if (bestIndicesA != null) {
                        batchSize = bestIndicesA.shape[0];
                        inSize = bestIndicesA.shape[1];
                    }
                    var windowSize = reduce_util.computeOptimalWindowSize(inSize);
                    var reduceInfo = {
                        windowSize: windowSize,
                        inSize: inSize,
                        batchSize: batchSize
                    };
                    var program = new argminmax_gpu_1.ArgMinMaxProgram(reduceInfo, reduceType, bestIndicesA == null);
                    var _a = program.outputShape,
                        rows = _a[0],
                        cols = _a[1];
                    var output = this.makeOutputArray([rows, cols], 'int32');
                    var inputs = [x];
                    if (bestIndicesA != null) {
                        inputs.push(bestIndicesA);
                    }
                    this.compileAndRun(program, inputs, output);
                    if (output.shape[1] === 1) {
                        return output;
                    }
                    return this.argReduce(x, reduceType, output);
                };
                MathBackendWebGL.prototype.sum = function (x, axes) {
                    axis_util.assertAxesAreInnerMostDims('sum', axes, x.rank);
                    var _a = axis_util.computeOutAndReduceShapes(x.shape, axes),
                        outShape = _a[0],
                        reduceShape = _a[1];
                    var inSize = util.sizeFromShape(reduceShape);
                    var a2D = x.as2D(-1, inSize);
                    var outputDType = types.sumOutType(x.dtype);
                    return this.reduce(a2D, 'sum', outputDType).reshape(outShape);
                };
                MathBackendWebGL.prototype.argMin = function (x, axes) {
                    axis_util.assertAxesAreInnerMostDims('argMin', axes, x.rank);
                    var _a = axis_util.computeOutAndReduceShapes(x.shape, axes),
                        outShape = _a[0],
                        reduceShape = _a[1];
                    var inSize = util.sizeFromShape(reduceShape);
                    var a2D = x.as2D(-1, inSize);
                    return this.argReduce(a2D, 'min').reshape(outShape);
                };
                MathBackendWebGL.prototype.argMax = function (x, axes) {
                    axis_util.assertAxesAreInnerMostDims('argMax', axes, x.rank);
                    var _a = axis_util.computeOutAndReduceShapes(x.shape, axes),
                        outShape = _a[0],
                        reduceShape = _a[1];
                    var inSize = util.sizeFromShape(reduceShape);
                    var a2D = x.as2D(-1, inSize);
                    return this.argReduce(a2D, 'max').reshape(outShape);
                };
                MathBackendWebGL.prototype.equal = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.EQUAL, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'bool');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.notEqual = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.NOT_EQUAL, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'bool');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.less = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.LESS, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'bool');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.lessEqual = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.LESS_EQUAL, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'bool');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.greater = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.GREATER, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'bool');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.greaterEqual = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.GREATER_EQUAL, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'bool');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.logicalNot = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.LOGICAL_NOT);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.logicalAnd = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.LOGICAL_AND, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'bool');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.logicalOr = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.LOGICAL_OR, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'bool');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.logicalXor = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.LOGICAL_XOR, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'bool');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.where = function (condition, a, b, dtype) {
                    var program = new logical_gpu_1.WhereProgram(condition.rank, a.shape, a.rank);
                    var output = this.makeOutputArray(program.outputShape, dtype);
                    return this.compileAndRun(program, [condition, a, b], output);
                };
                MathBackendWebGL.prototype.topKValues = function (x, k) {
                    throw new Error('topKValues GPU not yet implemented!');
                };
                MathBackendWebGL.prototype.topKIndices = function (x, k) {
                    throw new Error('topKIndices GPU not yet implemented!');
                };
                MathBackendWebGL.prototype.min = function (x, axes) {
                    axis_util.assertAxesAreInnerMostDims('min', axes, x.rank);
                    var _a = axis_util.computeOutAndReduceShapes(x.shape, axes),
                        outShape = _a[0],
                        reduceShape = _a[1];
                    var inSize = util.sizeFromShape(reduceShape);
                    var a2D = x.as2D(-1, inSize);
                    return this.reduce(a2D, 'min', a2D.dtype).reshape(outShape);
                };
                MathBackendWebGL.prototype.minimum = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.MIN, a.shape, b.shape);
                    return this.compileAndRun(program, [a, b]);
                };
                MathBackendWebGL.prototype.max = function (x, axes) {
                    axis_util.assertAxesAreInnerMostDims('max', axes, x.rank);
                    var _a = axis_util.computeOutAndReduceShapes(x.shape, axes),
                        outShape = _a[0],
                        reduceShape = _a[1];
                    var inSize = util.sizeFromShape(reduceShape);
                    var a2D = x.as2D(-1, inSize);
                    return this.reduce(a2D, 'max', a2D.dtype).reshape(outShape);
                };
                MathBackendWebGL.prototype.maximum = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.MAX, a.shape, b.shape);
                    return this.compileAndRun(program, [a, b]);
                };
                MathBackendWebGL.prototype.divide = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.DIV, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, 'float32');
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.add = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.ADD, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, types.upcastType(a.dtype, b.dtype));
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.subtract = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.SUB, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, types.upcastType(a.dtype, b.dtype));
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.pow = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.POW, a.shape, b.shape);
                    var output = this.makeOutputArray(program.outputShape, types.upcastType(a.dtype, b.dtype));
                    return this.compileAndRun(program, [a, b], output);
                };
                MathBackendWebGL.prototype.ceil = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.CEIL);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.floor = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.FLOOR);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.exp = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.EXP);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.log = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.LOG);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.sqrt = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.SQRT);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.square = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.SQUARE);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.relu = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.RELU);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.elu = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.ELU);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.eluDer = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.ELU_DER);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.selu = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.SELU);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.leakyRelu = function (x, alpha) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.LEAKY_RELU(alpha));
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.prelu = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.PRELU, a.shape, b.shape);
                    return this.compileAndRun(program, [a, b]);
                };
                MathBackendWebGL.prototype.preluDer = function (a, b) {
                    var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.PRELU_DER, a.shape, b.shape);
                    return this.compileAndRun(program, [a, b]);
                };
                MathBackendWebGL.prototype.int = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.TO_INT);
                    var output = this.makeOutputArray(program.outputShape, 'int32');
                    return this.compileAndRun(program, [x], output);
                };
                MathBackendWebGL.prototype.clip = function (x, min, max) {
                    var program = new clip_gpu_1.ClipProgram(x.shape, min, max);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.abs = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.ABS);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.sigmoid = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.SIGMOID);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.sin = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.SIN);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.cos = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.COS);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.tan = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.TAN);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.asin = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.ASIN);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.acos = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.ACOS);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.atan = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.ATAN);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.sinh = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.SINH);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.cosh = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.COSH);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.tanh = function (x) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.TANH);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.step = function (x, alpha) {
                    var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.STEP(alpha));
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.conv2d = function (x, filter, convInfo) {
                    var program = new conv_gpu_1.Conv2DProgram(convInfo);
                    return this.compileAndRun(program, [x, filter]);
                };
                MathBackendWebGL.prototype.conv2dDerInput = function (dy, filter, convInfo) {
                    var program = new conv_backprop_gpu_1.Conv2DDerInputProgram(convInfo);
                    return this.compileAndRun(program, [dy, filter]);
                };
                MathBackendWebGL.prototype.conv2dDerFilter = function (x, dy, convInfo) {
                    var program = new conv_backprop_gpu_1.Conv2DDerFilterProgram(convInfo);
                    return this.compileAndRun(program, [x, dy]);
                };
                MathBackendWebGL.prototype.depthwiseConv2D = function (x, filter, convInfo) {
                    var program = new conv_gpu_depthwise_1.DepthwiseConv2DProgram(convInfo);
                    return this.compileAndRun(program, [x, filter]);
                };
                MathBackendWebGL.prototype.maxPool = function (x, convInfo) {
                    var program = new pool_gpu_1.Pool2DProgram(convInfo, 'max', false);
                    var output = this.makeOutputArray(program.outputShape, x.dtype);
                    return this.compileAndRun(program, [x], output);
                };
                MathBackendWebGL.prototype.minPool = function (x, convInfo) {
                    var program = new pool_gpu_1.Pool2DProgram(convInfo, 'min', false);
                    var output = this.makeOutputArray(program.outputShape, x.dtype);
                    return this.compileAndRun(program, [x], output);
                };
                MathBackendWebGL.prototype.avgPool = function (x, convInfo) {
                    var program = new pool_gpu_1.Pool2DProgram(convInfo, 'avg', false);
                    var output = this.makeOutputArray(program.outputShape, 'float32');
                    return this.compileAndRun(program, [x], output);
                };
                MathBackendWebGL.prototype.maxPoolBackprop = function (dy, x, convInfo) {
                    var getPositions = true;
                    var maxPoolPositionsProgram = new pool_gpu_1.Pool2DProgram(convInfo, 'max', getPositions);
                    var maxPoolPositions = this.compileAndRun(maxPoolPositionsProgram, [x]);
                    var maxPoolBackPropProgram = new max_pool_backprop_gpu_1.MaxPool2DBackpropProgram(convInfo);
                    var output = this.makeOutputArray(maxPoolBackPropProgram.outputShape, x.dtype);
                    var result = this.compileAndRun(maxPoolBackPropProgram, [dy, maxPoolPositions], output);
                    maxPoolPositions.dispose();
                    return result;
                };
                MathBackendWebGL.prototype.avgPoolBackprop = function (dy, x, convInfo) {
                    var avgPoolBackpropProgram = new avg_pool_backprop_gpu_1.AvgPool2DBackpropProgram(convInfo);
                    var output = this.makeOutputArray(avgPoolBackpropProgram.outputShape, x.dtype);
                    return this.compileAndRun(avgPoolBackpropProgram, [dy], output);
                };
                MathBackendWebGL.prototype.resizeBilinear = function (x, newHeight, newWidth, alignCorners) {
                    var program = new resize_bilinear_gpu_1.ResizeBilinearProgram(x.shape, newHeight, newWidth, alignCorners);
                    return this.compileAndRun(program, [x]);
                };
                MathBackendWebGL.prototype.multinomial = function (probs, numSamples, seed) {
                    var batchSize = probs.shape[0];
                    var numOutcomes = probs.shape[1];
                    var program = new multinomial_gpu_1.MultinomialProgram(batchSize, numOutcomes, numSamples);
                    var output = this.makeOutputArray(program.outputShape, 'int32');
                    var customSetup = program.getCustomSetupFunc(seed);
                    return this.compileAndRun(program, [probs], output, customSetup);
                };
                MathBackendWebGL.prototype.oneHot = function (indices, depth, onValue, offValue) {
                    var program = new onehot_gpu_1.OneHotProgram(indices.size, depth, onValue, offValue);
                    return this.compileAndRun(program, [indices]);
                };
                MathBackendWebGL.prototype.makeOutputArray = function (shape, dtype) {
                    return tensor_1.Tensor.make(shape, {}, dtype);
                };
                MathBackendWebGL.prototype.compileAndRun = function (program, inputs, output, customSetup) {
                    var _this = this;
                    if (output == null) {
                        output = this.makeOutputArray(program.outputShape, inputs[0].dtype);
                    }
                    var inputsData = inputs.map(function (input) {
                        _this.uploadToGPU(input.dataId);
                        return {
                            tensor: input,
                            texData: _this.texData.get(input.dataId)
                        };
                    });
                    this.uploadToGPU(output.dataId);
                    var outputData = {
                        tensor: output,
                        texData: this.texData.get(output.dataId)
                    };
                    var key = gpgpu_math.makeShaderKey(program, inputsData, outputData);
                    var binary = this.getAndSaveBinary(key, function () {
                        return gpgpu_math.compileProgram(_this.gpgpu, program, inputsData, outputData);
                    });
                    var shouldTimeProgram = this.activeTimers != null;
                    var query;
                    if (shouldTimeProgram) {
                        query = this.startTimer();
                    }
                    gpgpu_math.runProgram(binary, inputsData, outputData, customSetup);
                    if (shouldTimeProgram) {
                        query = this.endTimer(query);
                        this.activeTimers.push(this.getQueryTime(query));
                    }
                    return output;
                };
                MathBackendWebGL.prototype.getAndSaveBinary = function (key, getBinary) {
                    if (!(key in this.binaryCache)) {
                        this.binaryCache[key] = getBinary();
                    }
                    return this.binaryCache[key];
                };
                MathBackendWebGL.prototype.getTextureManager = function () {
                    return this.textureManager;
                };
                MathBackendWebGL.prototype.dispose = function () {
                    if (this.disposed) {
                        return;
                    }
                    for (var key in this.binaryCache) {
                        this.gpgpu.deleteProgram(this.binaryCache[key].webGLProgram);
                    }
                    this.textureManager.dispose();
                    this.canvas.remove();
                    if (this.gpgpuCreatedLocally) {
                        this.gpgpu.dispose();
                    }
                    this.disposed = true;
                };
                MathBackendWebGL.prototype.throwIfNoData = function (dataId) {
                    if (!this.texData.has(dataId)) {
                        throw new Error("WebGL backend: No data found for this tensor. " +
                            "Did you change your backend in the middle of the program? " +
                            "New backends can't use Tensors created with previous backends");
                    }
                };
                MathBackendWebGL.prototype.uploadToGPU = function (dataId) {
                    this.throwIfNoData(dataId);
                    var texData = this.texData.get(dataId);
                    var shape = texData.shape,
                        values = texData.values,
                        texture = texData.texture,
                        dtype = texData.dtype,
                        texType = texData.texType;
                    if (texture != null) {
                        return;
                    }
                    var shouldTimeProgram = this.activeTimers != null;
                    var start;
                    if (shouldTimeProgram) {
                        start = performance.now();
                    }
                    var texShape = webgl_util.getTextureShapeFromLogicalShape(this.gpgpu.gl, shape);
                    texData.texShape = texShape;
                    var newTexture = this.textureManager.acquireTexture(texShape, texType);
                    texData.texture = newTexture;
                    if (values != null) {
                        this.gpgpu.uploadMatrixToTexture(newTexture, texShape[0], texShape[1], typedArrayToFloat32(values, dtype));
                        texData.values = null;
                        if (shouldTimeProgram) {
                            this.uploadWaitMs += performance.now() - start;
                        }
                    }
                };
                MathBackendWebGL.prototype.cacheOnCPU = function (dataId, float32Values) {
                    var dontKeepCopyOnGPU = this.delayedStorage;
                    var texData = this.texData.get(dataId);
                    var texture = texData.texture,
                        texShape = texData.texShape,
                        dtype = texData.dtype,
                        texType = texData.texType;
                    if (dontKeepCopyOnGPU && texture != null) {
                        this.textureManager.releaseTexture(texture, texShape, texType);
                        texData.texture = null;
                        texData.texShape = null;
                    }
                    if (float32Values != null) {
                        texData.values = float32ToTypedArray(float32Values, dtype);
                    }
                };
                return MathBackendWebGL;
            }());
            exports.MathBackendWebGL = MathBackendWebGL;
            environment_1.ENV.registerBackend('webgl', function () {
                return new MathBackendWebGL();
            });
            var NDArrayMathGPU = (function (_super) {
                __extends(NDArrayMathGPU, _super);

                function NDArrayMathGPU(gpgpu, safeMode) {
                    if (safeMode === void 0) {
                        safeMode = false;
                    }
                    var _this = this;
                    console.warn('new NDArrayMathGPU() is deprecated. Please use ' +
                        'dl.setBackend(\'webgl\').');
                    _this = _super.call(this, new MathBackendWebGL(gpgpu), safeMode) || this;
                    return _this;
                }
                return NDArrayMathGPU;
            }(math_1.NDArrayMath));
            exports.NDArrayMathGPU = NDArrayMathGPU;

            function float32ToTypedArray(a, dtype) {
                if (dtype === 'float32') {
                    return a;
                } else if (dtype === 'int32' || dtype === 'bool') {
                    var result = (dtype === 'int32') ? new Int32Array(a.length) :
                        new Uint8Array(a.length);
                    for (var i = 0; i < result.length; ++i) {
                        var val = a[i];
                        val = isNaN(val) ? util.getNaN(dtype) : Math.round(val);
                        result[i] = val;
                    }
                    return result;
                } else {
                    throw new Error("Unknown dtype " + dtype);
                }
            }

            function typedArrayToFloat32(a, dtype) {
                if (a instanceof Float32Array) {
                    return a;
                } else {
                    var res = new Float32Array(a.length);
                    for (var i = 0; i < res.length; i++) {
                        var val = a[i];
                        res[i] = util.isValNaN(val, dtype) ? NaN : val;
                    }
                    return res;
                }
            }

        }, {
            "../environment": 34,
            "../math": 103,
            "../ops/axis_util": 105,
            "../ops/reduce_util": 124,
            "../tensor": 144,
            "../types": 149,
            "../util": 150,
            "./webgl/argminmax_gpu": 70,
            "./webgl/avg_pool_backprop_gpu": 71,
            "./webgl/batchnorm_gpu": 72,
            "./webgl/binaryop_gpu": 73,
            "./webgl/clip_gpu": 74,
            "./webgl/concat_gpu": 75,
            "./webgl/conv_backprop_gpu": 76,
            "./webgl/conv_gpu": 77,
            "./webgl/conv_gpu_depthwise": 78,
            "./webgl/from_pixels_gpu": 79,
            "./webgl/gather_gpu": 80,
            "./webgl/gpgpu_context": 81,
            "./webgl/gpgpu_math": 82,
            "./webgl/logical_gpu": 84,
            "./webgl/lrn_gpu": 85,
            "./webgl/max_pool_backprop_gpu": 86,
            "./webgl/mulmat_gpu": 87,
            "./webgl/multinomial_gpu": 88,
            "./webgl/onehot_gpu": 89,
            "./webgl/pad_gpu": 90,
            "./webgl/pool_gpu": 91,
            "./webgl/reduce_gpu": 92,
            "./webgl/resize_bilinear_gpu": 93,
            "./webgl/reverse_gpu": 94,
            "./webgl/slice_gpu": 96,
            "./webgl/tex_util": 97,
            "./webgl/texture_manager": 98,
            "./webgl/tile_gpu": 99,
            "./webgl/transpose_gpu": 100,
            "./webgl/unaryop_gpu": 101,
            "./webgl/webgl_util": 102
        }],
        70: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var ArgMinMaxProgram = (function () {
                function ArgMinMaxProgram(reduceInfo, op, firstPass) {
                    this.variableNames = ['A'];
                    var windowSize = reduceInfo.windowSize;
                    var batchSize = reduceInfo.batchSize;
                    var inSize = reduceInfo.inSize;
                    var outSize = Math.ceil(inSize / windowSize);
                    if (!firstPass) {
                        this.variableNames.push('bestIndicesA');
                    }
                    this.outputShape = [batchSize, outSize];
                    var compOp = (op === 'max') ? '>' : '<';
                    var indexSnippet = firstPass ?
                        'inOffset + i;' :
                        'round(getBestIndicesA(batch, inOffset + i));';
                    this.userCode = "\n      void main() {\n        ivec2 coords = getOutputCoords();\n        int batch = coords[0];\n        int outIdx = coords[1];\n        int inOffset = outIdx * " + windowSize + ";\n\n        int bestIndex = 0;\n        float bestValue = getA(batch, inOffset);\n\n        for (int i = 0; i < " + windowSize + "; i++) {\n          int inIdx = " + indexSnippet + ";\n          float candidate = getA(batch, inIdx);\n          if (isNaN(candidate)) {\n            setOutput(candidate);\n            return;\n          }\n          if (candidate " + compOp + " bestValue) {\n            bestValue = candidate;\n            bestIndex = inIdx;\n          }\n        }\n        setOutput(float(bestIndex));\n      }\n    ";
                }
                return ArgMinMaxProgram;
            }());
            exports.ArgMinMaxProgram = ArgMinMaxProgram;

        }, {}],
        71: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var AvgPool2DBackpropProgram = (function () {
                function AvgPool2DBackpropProgram(convInfo) {
                    this.variableNames = ['dy'];
                    this.outputShape = convInfo.inShape;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var padTop = filterHeight - 1 - convInfo.padInfo.top;
                    var padLeft = filterWidth - 1 - convInfo.padInfo.left;
                    var avgMultiplier = 1 / (filterHeight * filterWidth);
                    this.userCode = "\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n      const float avgMultiplier = float(" + avgMultiplier + ");\n\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int b = coords[0];\n        int d = coords[3];\n\n        ivec2 dyRCCorner = coords.yz - pads;\n        int dyRCorner = dyRCCorner.x;\n        int dyCCorner = dyRCCorner.y;\n\n        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          float dyR = float(dyRCorner + wR) / " + strideHeight + ".0;\n\n          if (dyR < 0.0 || dyR >= " + convInfo.outHeight + ".0 || fract(dyR) > 0.0) {\n            continue;\n          }\n          int idyR = int(dyR);\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            float dyC = float(dyCCorner + wC) / " + strideWidth + ".0;\n\n            if (dyC < 0.0 || dyC >= " + convInfo.outWidth + ".0 ||\n                fract(dyC) > 0.0) {\n              continue;\n            }\n            int idyC = int(dyC);\n\n            float dyValue = getDy(b, idyR, idyC, d);\n\n            dotProd += dyValue * avgMultiplier;\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
                }
                return AvgPool2DBackpropProgram;
            }());
            exports.AvgPool2DBackpropProgram = AvgPool2DBackpropProgram;

        }, {}],
        72: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var broadcast_util = require("../../ops/broadcast_util");
            var BatchNormProgram = (function () {
                function BatchNormProgram(xShape, meanShape, varianceShape, offsetShape, scaleShape, varianceEpsilon) {
                    this.outputShape = [];
                    this.supportsBroadcasting = true;
                    this.variableNames = ['x', 'mean', 'variance'];
                    broadcast_util.assertAndGetBroadcastShape(xShape, meanShape);
                    broadcast_util.assertAndGetBroadcastShape(xShape, varianceShape);
                    var offsetSnippet = '0.0';
                    if (offsetShape != null) {
                        broadcast_util.assertAndGetBroadcastShape(xShape, offsetShape);
                        this.variableNames.push('offset');
                        offsetSnippet = 'getOffsetAtOutCoords()';
                    }
                    var scaleSnippet = '1.0';
                    if (scaleShape != null) {
                        broadcast_util.assertAndGetBroadcastShape(xShape, scaleShape);
                        this.variableNames.push('scale');
                        scaleSnippet = 'getScaleAtOutCoords()';
                    }
                    this.outputShape = xShape;
                    this.userCode = "\n      void main() {\n        float x = getXAtOutCoords();\n        float mean = getMeanAtOutCoords();\n        float variance = getVarianceAtOutCoords();\n        float offset = " + offsetSnippet + ";\n        float scale = " + scaleSnippet + ";\n        float inv = scale / sqrt(variance + float(" + varianceEpsilon + "));\n        setOutput((x - mean) * inv + offset);\n      }\n    ";
                }
                return BatchNormProgram;
            }());
            exports.BatchNormProgram = BatchNormProgram;

        }, {
            "../../ops/broadcast_util": 108
        }],
        73: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var broadcast_util = require("../../ops/broadcast_util");
            var CHECK_NAN_SNIPPET = "\n  if (isNaN(a)) return a;\n  if (isNaN(b)) return b;\n";
            exports.ADD = 'return a + b;';
            exports.SUB = 'return a - b;';
            exports.MUL = 'return a * b;';
            exports.DIV = 'return a / b;';
            exports.POW = "\n  return (round(mod(b, 2.0)) == 0 || round(mod(b, 2.0)) == 2) ?\n      pow(abs(a), b) : sign(a) * pow(abs(a), b);\n";
            exports.EQUAL = CHECK_NAN_SNIPPET + "\n  return float(a == b);\n";
            exports.NOT_EQUAL = CHECK_NAN_SNIPPET + "\n  return float(a != b);\n";
            exports.LESS = CHECK_NAN_SNIPPET + "\n  return float(a < b);\n";
            exports.LESS_EQUAL = CHECK_NAN_SNIPPET + "\n  return float(a <= b);\n";
            exports.GREATER = CHECK_NAN_SNIPPET + "\n  return float(a > b);\n";
            exports.GREATER_EQUAL = CHECK_NAN_SNIPPET + "\n  return float(a >= b);\n";
            exports.LOGICAL_AND = CHECK_NAN_SNIPPET + "\n  return float(a >= 1.0 && b >= 1.0);\n";
            exports.LOGICAL_OR = CHECK_NAN_SNIPPET + "\n  return float(a >= 1.0 || b >= 1.0);\n";
            exports.LOGICAL_XOR = CHECK_NAN_SNIPPET + "\n  return float(a >= 1.0 ^^ b >= 1.0);\n";
            exports.PRELU = "\n  return (a >= 0.0) ? a : b * a;\n";
            exports.PRELU_DER = "\n  return (a > 0.0) ? 1.0 : ((a < 0.0) ? b : a);\n";
            exports.MAX = CHECK_NAN_SNIPPET + "\n  return max(a, b);\n";
            exports.MIN = CHECK_NAN_SNIPPET + "\n  return min(a, b);\n";
            var BinaryOpProgram = (function () {
                function BinaryOpProgram(op, aShape, bShape) {
                    this.variableNames = ['A', 'B'];
                    this.supportsBroadcasting = true;
                    this.outputShape =
                        broadcast_util.assertAndGetBroadcastShape(aShape, bShape);
                    this.userCode = "\n      float binaryOperation(float a, float b) {\n        " + op + "\n      }\n\n      void main() {\n        float a = getAAtOutCoords();\n        float b = getBAtOutCoords();\n        setOutput(binaryOperation(a, b));\n      }\n    ";
                }
                return BinaryOpProgram;
            }());
            exports.BinaryOpProgram = BinaryOpProgram;

        }, {
            "../../ops/broadcast_util": 108
        }],
        74: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var ClipProgram = (function () {
                function ClipProgram(aShape, min, max) {
                    this.variableNames = ['A'];
                    this.outputShape = aShape;
                    var minFixed = min.toFixed(20);
                    var maxFixed = max.toFixed(20);
                    this.userCode = "\n      void main() {\n        float value = getAAtOutCoords();\n        if (isNaN(value)) {\n          setOutput(value);\n          return;\n        }\n\n        setOutput(clamp(value, " + minFixed + ", " + maxFixed + "));\n      }\n    ";
                }
                return ClipProgram;
            }());
            exports.ClipProgram = ClipProgram;

        }, {}],
        75: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var concat_util = require("../../ops/concat_util");
            var ConcatProgram = (function () {
                function ConcatProgram(aShape, bShape) {
                    this.variableNames = ['A', 'B'];
                    this.outputShape = [];
                    this.outputShape =
                        concat_util.computeOutShape(aShape, bShape, 1);
                    this.userCode = "\n      void main() {\n        ivec2 coords = getOutputCoords();\n        int yR = coords.x;\n        int yC = coords.y;\n\n        float value = 0.0;\n        if (yC < " + aShape[1] + ") {\n          value = getA(yR, yC);\n        } else {\n          yC -= " + aShape[1] + ";\n          value = getB(yR, yC);\n        }\n\n        setOutput(value);\n      }\n    ";
                }
                return ConcatProgram;
            }());
            exports.ConcatProgram = ConcatProgram;

        }, {
            "../../ops/concat_util": 111
        }],
        76: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Conv2DDerFilterProgram = (function () {
                function Conv2DDerFilterProgram(convInfo) {
                    this.variableNames = ['x', 'dy'];
                    this.outputShape = convInfo.filterShape;
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var padTop = convInfo.padInfo.top;
                    var padLeft = convInfo.padInfo.left;
                    this.userCode = "\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int wR = coords.x;\n        int wC = coords.y;\n        int d1 = coords.z;\n        int d2 = coords.w;\n\n        // Convolve x(?, ?, d1) with dy(:, :, d2) to get dw(wR, wC, d1, d2).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n\n        for (int b = 0; b < " + convInfo.batchSize + "; b++) {\n          for (int yR = 0; yR < " + convInfo.outHeight + "; yR++) {\n            int xR = wR + yR * " + strideHeight + " - " + padTop + ";\n\n            if (xR < 0 || xR >= " + convInfo.inHeight + ") {\n              continue;\n            }\n\n            for (int yC = 0; yC < " + convInfo.outWidth + "; yC++) {\n              int xC = wC + yC * " + strideWidth + " - " + padLeft + ";\n\n              if (xC < 0 || xC >= " + convInfo.inWidth + ") {\n                continue;\n              }\n\n              float dyValue = getDy(b, yR, yC, d2);\n              float xValue = getX(b, xR, xC, d1);\n              dotProd += (xValue * dyValue);\n            }\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
                }
                return Conv2DDerFilterProgram;
            }());
            exports.Conv2DDerFilterProgram = Conv2DDerFilterProgram;
            var Conv2DDerInputProgram = (function () {
                function Conv2DDerInputProgram(convInfo) {
                    this.variableNames = ['dy', 'W'];
                    this.outputShape = convInfo.inShape;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var padTop = filterHeight - 1 - convInfo.padInfo.top;
                    var padLeft = filterWidth - 1 - convInfo.padInfo.left;
                    this.userCode = "\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int batch = coords[0];\n        int d1 = coords[3];\n\n        ivec2 dyCorner = coords.yz - pads;\n        int dyRCorner = dyCorner.x;\n        int dyCCorner = dyCorner.y;\n\n        // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          float dyR = float(dyRCorner + wR) / " + strideHeight + ".0;\n\n          if (dyR < 0.0 || dyR >= " + convInfo.outHeight + ".0 || fract(dyR) > 0.0) {\n            continue;\n          }\n          int idyR = int(dyR);\n\n          int wRPerm = " + filterHeight + " - 1 - wR;\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            float dyC = float(dyCCorner + wC) / " + strideWidth + ".0;\n\n            if (dyC < 0.0 || dyC >= " + convInfo.outWidth + ".0 ||\n                fract(dyC) > 0.0) {\n              continue;\n            }\n            int idyC = int(dyC);\n\n            int wCPerm = " + filterWidth + " - 1 - wC;\n\n            for (int d2 = 0; d2 < " + convInfo.outChannels + "; d2++) {\n              float xValue = getDy(batch, idyR, idyC, d2);\n              float wValue = getW(wRPerm, wCPerm, d1, d2);\n              dotProd += xValue * wValue;\n            }\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
                }
                return Conv2DDerInputProgram;
            }());
            exports.Conv2DDerInputProgram = Conv2DDerInputProgram;

        }, {}],
        77: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Conv2DProgram = (function () {
                function Conv2DProgram(convInfo) {
                    this.variableNames = ['x', 'W'];
                    this.outputShape = convInfo.outShape;
                    var padTop = convInfo.padInfo.top;
                    var padLeft = convInfo.padInfo.left;
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var inputDepthNearestVec4 = Math.floor(convInfo.inChannels / 4) * 4;
                    var inputDepthVec4Remainder = convInfo.inChannels % 4;
                    this.userCode = "\n      const ivec2 strides = ivec2(" + strideHeight + ", " + strideWidth + ");\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int batch = coords[0];\n        int d2 = coords[3];\n\n        ivec2 xRCCorner = coords.yz * strides - pads;\n        int xRCorner = xRCCorner.x;\n        int xCCorner = xRCCorner.y;\n\n        // Convolve x(?, ?, d1) with w(:, :, d1, d2) to get y(yR, yC, d2).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          int xR = xRCorner + wR;\n\n          if (xR < 0 || xR >= " + convInfo.inHeight + ") {\n            continue;\n          }\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            int xC = xCCorner + wC;\n\n            if (xC < 0 || xC >= " + convInfo.inWidth + ") {\n              continue;\n            }\n\n            for (int d1 = 0; d1 < " + inputDepthNearestVec4 + "; d1 += 4) {\n              vec4 xValues = vec4(\n                getX(batch, xR, xC, d1),\n                getX(batch, xR, xC, d1 + 1),\n                getX(batch, xR, xC, d1 + 2),\n                getX(batch, xR, xC, d1 + 3)\n              );\n              vec4 wValues = vec4(\n                getW(wR, wC, d1, d2),\n                getW(wR, wC, d1 + 1, d2),\n                getW(wR, wC, d1 + 2, d2),\n                getW(wR, wC, d1 + 3, d2)\n              );\n\n              dotProd += dot(xValues, wValues);\n            }\n\n            if (" + (inputDepthVec4Remainder === 1) + ") {\n              dotProd +=\n                getX(batch, xR, xC, " + inputDepthNearestVec4 + ") *\n                getW(wR, wC, " + inputDepthNearestVec4 + ", d2);\n            } else if (" + (inputDepthVec4Remainder === 2) + ") {\n              vec2 xValues = vec2(\n                getX(batch, xR, xC, " + inputDepthNearestVec4 + "),\n                getX(batch, xR, xC, " + inputDepthNearestVec4 + " + 1)\n              );\n              vec2 wValues = vec2(\n                getW(wR, wC, " + inputDepthNearestVec4 + ", d2),\n                getW(wR, wC, " + inputDepthNearestVec4 + " + 1, d2)\n              );\n              dotProd += dot(xValues, wValues);\n            } else if (" + (inputDepthVec4Remainder === 3) + ") {\n              vec3 xValues = vec3(\n                getX(batch, xR, xC, " + inputDepthNearestVec4 + "),\n                getX(batch, xR, xC, " + inputDepthNearestVec4 + " + 1),\n                getX(batch, xR, xC, " + inputDepthNearestVec4 + " + 2)\n              );\n              vec3 wValues = vec3(\n                getW(wR, wC, " + inputDepthNearestVec4 + ", d2),\n                getW(wR, wC, " + inputDepthNearestVec4 + " + 1, d2),\n                getW(wR, wC, " + inputDepthNearestVec4 + " + 2, d2)\n              );\n              dotProd += dot(xValues, wValues);\n            }\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
                }
                return Conv2DProgram;
            }());
            exports.Conv2DProgram = Conv2DProgram;

        }, {}],
        78: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var DepthwiseConv2DProgram = (function () {
                function DepthwiseConv2DProgram(convInfo) {
                    this.variableNames = ['x', 'W'];
                    this.outputShape = convInfo.outShape;
                    var xNumRows = convInfo.inHeight;
                    var xNumCols = convInfo.inWidth;
                    var padTop = convInfo.padInfo.top;
                    var padLeft = convInfo.padInfo.left;
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var channelMul = convInfo.outChannels / convInfo.inChannels;
                    this.userCode = "\n      const ivec2 strides = ivec2(" + strideHeight + ", " + strideWidth + ");\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int batch = coords.x;\n        ivec2 xRCCorner = coords.yz * strides - pads;\n        int d2 = coords.w;\n        int d1 = d2 / " + channelMul + ";\n        int q = d2 - d1 * " + channelMul + ";\n\n        int xRCorner = xRCCorner.x;\n        int xCCorner = xRCCorner.y;\n\n        // Convolve x(?, ?, d1) with w(:, :, d1, q) to get y(yR, yC, d2).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        // TODO(dsmilkov): Flatten the two for loops and vec4 the operations.\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          int xR = xRCorner + wR;\n\n          if (xR < 0 || xR >= " + xNumRows + ") {\n            continue;\n          }\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            int xC = xCCorner + wC;\n\n            if (xC < 0 || xC >= " + xNumCols + ") {\n              continue;\n            }\n\n            float xVal = getX(batch, xR, xC, d1);\n            float wVal = getW(wR, wC, d1, q);\n            dotProd += xVal * wVal;\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
                }
                return DepthwiseConv2DProgram;
            }());
            exports.DepthwiseConv2DProgram = DepthwiseConv2DProgram;

        }, {}],
        79: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var FromPixelsProgram = (function () {
                function FromPixelsProgram(outputShape) {
                    this.variableNames = ['A'];
                    var height = outputShape[0],
                        width = outputShape[1];
                    this.outputShape = outputShape;
                    this.userCode = "\n      void main() {\n        ivec3 coords = getOutputCoords();\n        int texR = coords[0];\n        int texC = coords[1];\n        int depth = coords[2];\n        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(" + width + ".0, " + height + ".0);\n\n        vec4 values = texture2D(A, uv);\n        float value;\n        if (depth == 0) {\n          value = values.r;\n        } else if (depth == 1) {\n          value = values.g;\n        } else if (depth == 2) {\n          value = values.b;\n        } else if (depth == 3) {\n          value = values.a;\n        }\n\n        setOutput(floor(value * 255.0 + 0.5));\n      }\n    ";
                }
                return FromPixelsProgram;
            }());
            exports.FromPixelsProgram = FromPixelsProgram;

        }, {}],
        80: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var shader_compiler_1 = require("./shader_compiler");
            var GatherProgram = (function () {
                function GatherProgram(aShape, indicesLength, axis) {
                    this.variableNames = ['A', 'indices'];
                    var outputShape = aShape.slice();
                    outputShape[axis] = indicesLength;
                    this.outputShape = outputShape;
                    this.rank = outputShape.length;
                    var dtype = shader_compiler_1.getCoordsDataType(this.rank);
                    var sourceCoords = getSourceCoords(aShape, axis);
                    this.userCode = "\n      void main() {\n        " + dtype + " resRC = getOutputCoords();\n        setOutput(getA(" + sourceCoords + "));\n      }\n    ";
                }
                return GatherProgram;
            }());
            exports.GatherProgram = GatherProgram;

            function getSourceCoords(aShape, axis) {
                var rank = aShape.length;
                if (rank > 4) {
                    throw Error("Gather for rank " + rank + " is not yet supported");
                }
                if (rank === 1) {
                    return "int(getIndices(resRC))";
                }
                var currentCoords = ['resRC.x', 'resRC.y', 'resRC.z', 'resRC.w'];
                var sourceCoords = [];
                for (var i = 0; i < aShape.length; i++) {
                    if (i === axis) {
                        sourceCoords.push("int(getIndices(" + currentCoords[i] + "))");
                    } else {
                        sourceCoords.push("" + currentCoords[i]);
                    }
                }
                return sourceCoords.join();
            }

        }, {
            "./shader_compiler": 95
        }],
        81: [function (require, module, exports) {
            "use strict";
            var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
                return new(P || (P = Promise))(function (resolve, reject) {
                    function fulfilled(value) {
                        try {
                            step(generator.next(value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function rejected(value) {
                        try {
                            step(generator["throw"](value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function step(result) {
                        result.done ? resolve(result.value) : new P(function (resolve) {
                            resolve(result.value);
                        }).then(fulfilled, rejected);
                    }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
            };
            var __generator = (this && this.__generator) || function (thisArg, body) {
                var _ = {
                        label: 0,
                        sent: function () {
                            if (t[0] & 1) throw t[1];
                            return t[1];
                        },
                        trys: [],
                        ops: []
                    },
                    f, y, t, g;
                return g = {
                    next: verb(0),
                    "throw": verb(1),
                    "return": verb(2)
                }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
                    return this;
                }), g;

                function verb(n) {
                    return function (v) {
                        return step([n, v]);
                    };
                }

                function step(op) {
                    if (f) throw new TypeError("Generator is already executing.");
                    while (_) try {
                        if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                        if (y = 0, t) op = [0, t.value];
                        switch (op[0]) {
                            case 0:
                            case 1:
                                t = op;
                                break;
                            case 4:
                                _.label++;
                                return {
                                    value: op[1],
                                    done: false
                                };
                            case 5:
                                _.label++;
                                y = op[1];
                                op = [0];
                                continue;
                            case 7:
                                op = _.ops.pop();
                                _.trys.pop();
                                continue;
                            default:
                                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                    _ = 0;
                                    continue;
                                }
                                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                    _.label = op[1];
                                    break;
                                }
                                if (op[0] === 6 && _.label < t[1]) {
                                    _.label = t[1];
                                    t = op;
                                    break;
                                }
                                if (t && _.label < t[2]) {
                                    _.label = t[2];
                                    _.ops.push(op);
                                    break;
                                }
                                if (t[2]) _.ops.pop();
                                _.trys.pop();
                                continue;
                        }
                        op = body.call(thisArg, _);
                    } catch (e) {
                        op = [6, e];
                        y = 0;
                    } finally {
                        f = t = 0;
                    }
                    if (op[0] & 5) throw op[1];
                    return {
                        value: op[0] ? op[1] : void 0,
                        done: true
                    };
                }
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../../environment");
            var util = require("../../util");
            var gpgpu_util = require("./gpgpu_util");
            var tex_util = require("./tex_util");
            var webgl_util = require("./webgl_util");
            var GPGPUContext = (function () {
                function GPGPUContext(gl) {
                    this.outputTexture = null;
                    this.program = null;
                    this.disposed = false;
                    this.autoDebugValidate = false;
                    this.firstProgram = true;
                    if (gl != null) {
                        this.gl = gl;
                    } else {
                        this.gl = gpgpu_util.createWebGLContext();
                    }
                    if (environment_1.ENV.get('WEBGL_VERSION') === 1) {
                        this.textureFloatExtension =
                            webgl_util.getExtensionOrThrow(this.gl, 'OES_texture_float');
                        this.colorBufferFloatExtension =
                            this.gl.getExtension('WEBGL_color_buffer_float');
                    } else {
                        this.colorBufferFloatExtension =
                            webgl_util.getExtensionOrThrow(this.gl, 'EXT_color_buffer_float');
                    }
                    this.loseContextExtension =
                        webgl_util.getExtensionOrThrow(this.gl, 'WEBGL_lose_context');
                    if (environment_1.ENV.get('WEBGL_GET_BUFFER_SUB_DATA_ASYNC_EXTENSION_ENABLED')) {
                        this.getBufferSubDataAsyncExtension =
                            this.gl.getExtension('WEBGL_get_buffer_sub_data_async');
                    }
                    this.vertexBuffer = gpgpu_util.createVertexBuffer(this.gl);
                    this.indexBuffer = gpgpu_util.createIndexBuffer(this.gl);
                    this.framebuffer = webgl_util.createFramebuffer(this.gl);
                }
                GPGPUContext.prototype.dispose = function () {
                    var _this = this;
                    if (this.disposed) {
                        return;
                    }
                    if (this.program != null) {
                        console.warn('Disposing a GPGPUContext that still has a bound WebGLProgram.' +
                            ' This is probably a resource leak, delete the program with ' +
                            'GPGPUContext.deleteProgram before disposing.');
                    }
                    if (this.outputTexture != null) {
                        console.warn('Disposing a GPGPUContext that still has a bound output matrix ' +
                            'texture.  This is probably a resource leak, delete the output ' +
                            'matrix texture with GPGPUContext.deleteMatrixTexture before ' +
                            'disposing.');
                    }
                    var gl = this.gl;
                    webgl_util.callAndCheck(gl, function () {
                        return gl.finish();
                    });
                    webgl_util.callAndCheck(gl, function () {
                        return gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    });
                    webgl_util.callAndCheck(gl, function () {
                        return gl.deleteFramebuffer(_this.framebuffer);
                    });
                    webgl_util.callAndCheck(gl, function () {
                        return gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    });
                    webgl_util.callAndCheck(gl, function () {
                        return gl.deleteBuffer(_this.vertexBuffer);
                    });
                    webgl_util.callAndCheck(gl, function () {
                        return gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
                    });
                    webgl_util.callAndCheck(gl, function () {
                        return gl.deleteBuffer(_this.indexBuffer);
                    });
                    this.loseContextExtension.loseContext();
                    this.disposed = true;
                };
                GPGPUContext.prototype.enableAutomaticDebugValidation = function (enabled) {
                    this.autoDebugValidate = enabled;
                    webgl_util.enableDebugWebGLErrorChecking(enabled);
                };
                GPGPUContext.prototype.createMatrixTexture = function (rows, columns) {
                    this.throwIfDisposed();
                    return gpgpu_util.createMatrixTexture(this.gl, rows, columns);
                };
                GPGPUContext.prototype.uploadPixelDataToTexture = function (texture, pixels) {
                    this.throwIfDisposed();
                    gpgpu_util.uploadPixelDataToTexture(this.gl, texture, pixels);
                };
                GPGPUContext.prototype.createPackedMatrixTexture = function (rows, columns) {
                    this.throwIfDisposed();
                    return gpgpu_util.createPackedMatrixTexture(this.gl, rows, columns);
                };
                GPGPUContext.prototype.deleteMatrixTexture = function (texture) {
                    var _this = this;
                    this.throwIfDisposed();
                    if (this.outputTexture === texture) {
                        webgl_util.unbindColorTextureFromFramebuffer(this.gl, this.framebuffer);
                        this.outputTexture = null;
                    }
                    webgl_util.callAndCheck(this.gl, function () {
                        return _this.gl.deleteTexture(texture);
                    });
                };
                GPGPUContext.prototype.uploadMatrixToTexture = function (texture, rows, columns, matrix) {
                    this.throwIfDisposed();
                    var numChannels = 1;
                    return gpgpu_util.uploadMatrixToTexture(this.gl, texture, rows, columns, matrix, numChannels);
                };
                GPGPUContext.prototype.uploadMatrixToPackedTexture = function (texture, rows, columns, matrix) {
                    this.throwIfDisposed();
                    return gpgpu_util.uploadMatrixToPackedTexture(this.gl, texture, rows, columns, matrix);
                };
                GPGPUContext.prototype.downloadMatrixFromTexture = function (texture, rows, columns) {
                    var _this = this;
                    return this.downloadMatrixDriver(texture, function () {
                        return gpgpu_util.downloadMatrixFromOutputTexture(_this.gl, rows, columns);
                    });
                };
                GPGPUContext.prototype.downloadMatrixFromTextureAsync = function (texture, rows, columns) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            if (this.getBufferSubDataAsyncExtension == null) {
                                throw new Error("Cannot download matrix from output texture asynchronously, " +
                                    "WEBGL_get_buffer_sub_data_async is not enabled.");
                            }
                            return [2, this.downloadMatrixDriverAsync(texture, function () {
                                return gpgpu_util.downloadMatrixFromOutputTextureAsync(_this.gl, _this.getBufferSubDataAsyncExtension, rows, columns);
                            })];
                        });
                    });
                };
                GPGPUContext.prototype.downloadMatrixFromRGBAColorTexture = function (texture, rows, columns, channels) {
                    var _this = this;
                    return this.downloadMatrixDriver(texture, function () {
                        return gpgpu_util.downloadMatrixFromRGBAColorTexture(_this.gl, rows, columns, channels);
                    });
                };
                GPGPUContext.prototype.downloadMatrixFromPackedTexture = function (texture, rows, columns) {
                    var _this = this;
                    return this.downloadMatrixDriver(texture, function () {
                        return gpgpu_util.downloadMatrixFromPackedOutputTexture(_this.gl, rows, columns);
                    });
                };
                GPGPUContext.prototype.createProgram = function (fragmentShaderSource) {
                    this.throwIfDisposed();
                    var gl = this.gl;
                    var fragmentShader = webgl_util.createFragmentShader(gl, fragmentShaderSource);
                    var vertexShader = gpgpu_util.createVertexShader(gl);
                    var program = webgl_util.createProgram(gl);
                    webgl_util.callAndCheck(gl, function () {
                        return gl.attachShader(program, vertexShader);
                    });
                    webgl_util.callAndCheck(gl, function () {
                        return gl.attachShader(program, fragmentShader);
                    });
                    webgl_util.linkProgram(gl, program);
                    if (this.autoDebugValidate) {
                        webgl_util.validateProgram(gl, program);
                    }
                    if (this.firstProgram) {
                        this.firstProgram = false;
                        this.setProgram(program);
                        gpgpu_util.bindVertexProgramAttributeStreams(gl, this.program, this.vertexBuffer);
                    }
                    return program;
                };
                GPGPUContext.prototype.deleteProgram = function (program) {
                    var _this = this;
                    this.throwIfDisposed();
                    if (program === this.program) {
                        this.program = null;
                    }
                    if (program != null) {
                        webgl_util.callAndCheck(this.gl, function () {
                            return _this.gl.deleteProgram(program);
                        });
                    }
                };
                GPGPUContext.prototype.setProgram = function (program) {
                    var _this = this;
                    this.throwIfDisposed();
                    this.program = program;
                    if ((this.program != null) && this.autoDebugValidate) {
                        webgl_util.validateProgram(this.gl, this.program);
                    }
                    webgl_util.callAndCheck(this.gl, function () {
                        return _this.gl.useProgram(program);
                    });
                };
                GPGPUContext.prototype.getUniformLocation = function (program, uniformName, shouldThrow) {
                    if (shouldThrow === void 0) {
                        shouldThrow = true;
                    }
                    this.throwIfDisposed();
                    if (shouldThrow) {
                        return webgl_util.getProgramUniformLocationOrThrow(this.gl, program, uniformName);
                    } else {
                        return webgl_util.getProgramUniformLocation(this.gl, program, uniformName);
                    }
                };
                GPGPUContext.prototype.getAttributeLocation = function (program, attribute) {
                    var _this = this;
                    this.throwIfDisposed();
                    return webgl_util.callAndCheck(this.gl, function () {
                        return _this.gl.getAttribLocation(program, attribute);
                    });
                };
                GPGPUContext.prototype.getUniformLocationNoThrow = function (program, uniformName) {
                    this.throwIfDisposed();
                    return this.gl.getUniformLocation(program, uniformName);
                };
                GPGPUContext.prototype.setInputMatrixTexture = function (inputMatrixTexture, uniformLocation, textureUnit) {
                    this.throwIfDisposed();
                    this.throwIfNoProgram();
                    webgl_util.bindTextureToProgramUniformSampler(this.gl, this.program, inputMatrixTexture, uniformLocation, textureUnit);
                };
                GPGPUContext.prototype.setOutputMatrixTexture = function (outputMatrixTexture, rows, columns) {
                    this.setOutputMatrixTextureDriver(outputMatrixTexture, columns, rows);
                };
                GPGPUContext.prototype.setOutputPackedMatrixTexture = function (outputPackedMatrixTexture, rows, columns) {
                    this.throwIfDisposed();
                    var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns),
                        width = _a[0],
                        height = _a[1];
                    this.setOutputMatrixTextureDriver(outputPackedMatrixTexture, width, height);
                };
                GPGPUContext.prototype.setOutputMatrixWriteRegion = function (startRow, numRows, startColumn, numColumns) {
                    this.setOutputMatrixWriteRegionDriver(startColumn, startRow, numColumns, numRows);
                };
                GPGPUContext.prototype.setOutputPackedMatrixWriteRegion = function (startRow, numRows, startColumn, numColumns) {
                    throw new Error('setOutputPackedMatrixWriteRegion not implemented.');
                };
                GPGPUContext.prototype.debugValidate = function () {
                    if (this.program != null) {
                        webgl_util.validateProgram(this.gl, this.program);
                    }
                    webgl_util.validateFramebuffer(this.gl);
                };
                GPGPUContext.prototype.executeProgram = function () {
                    this.throwIfDisposed();
                    this.throwIfNoProgram();
                    var gl = this.gl;
                    if (this.autoDebugValidate) {
                        this.debugValidate();
                    }
                    webgl_util.callAndCheck(gl, function () {
                        return gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                    });
                };
                GPGPUContext.prototype.blockUntilAllProgramsCompleted = function () {
                    var _this = this;
                    this.throwIfDisposed();
                    webgl_util.callAndCheck(this.gl, function () {
                        return _this.gl.finish();
                    });
                };
                GPGPUContext.prototype.getQueryTimerExtension = function () {
                    if (this.disjointQueryTimerExtension == null) {
                        this.disjointQueryTimerExtension =
                            webgl_util.getExtensionOrThrow(this.gl, environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION') === 2 ?
                                'EXT_disjoint_timer_query_webgl2' :
                                'EXT_disjoint_timer_query');
                    }
                    return this.disjointQueryTimerExtension;
                };
                GPGPUContext.prototype.getQueryTimerExtensionWebGL2 = function () {
                    return this.getQueryTimerExtension();
                };
                GPGPUContext.prototype.getQueryTimerExtensionWebGL1 = function () {
                    return this.getQueryTimerExtension();
                };
                GPGPUContext.prototype.runQuery = function (queryFn) {
                    var query = this.beginQuery();
                    queryFn();
                    this.endQuery();
                    return this.pollQueryTime(query);
                };
                GPGPUContext.prototype.beginQuery = function () {
                    if (environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION') === 2) {
                        var gl2 = this.gl;
                        var ext_1 = this.getQueryTimerExtensionWebGL2();
                        var query_1 = gl2.createQuery();
                        gl2.beginQuery(ext_1.TIME_ELAPSED_EXT, query_1);
                        return query_1;
                    }
                    var ext = this.getQueryTimerExtensionWebGL1();
                    var query = ext.createQueryEXT();
                    ext.beginQueryEXT(ext.TIME_ELAPSED_EXT, query);
                    return query;
                };
                GPGPUContext.prototype.endQuery = function () {
                    if (environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION') === 2) {
                        var gl2 = this.gl;
                        var ext_2 = this.getQueryTimerExtensionWebGL2();
                        gl2.endQuery(ext_2.TIME_ELAPSED_EXT);
                        return;
                    }
                    var ext = this.getQueryTimerExtensionWebGL1();
                    ext.endQueryEXT(ext.TIME_ELAPSED_EXT);
                };
                GPGPUContext.prototype.isQueryAvailable = function (query, queryTimerVersion) {
                    if (queryTimerVersion === 0) {
                        return true;
                    }
                    if (queryTimerVersion === 2) {
                        var gl2 = this.gl;
                        var ext = this.getQueryTimerExtensionWebGL2();
                        var available = gl2.getQueryParameter(query, gl2.QUERY_RESULT_AVAILABLE);
                        var disjoint = this.gl.getParameter(ext.GPU_DISJOINT_EXT);
                        return available && !disjoint;
                    } else {
                        var ext = this.getQueryTimerExtensionWebGL1();
                        var available = ext.getQueryObjectEXT(query, ext.QUERY_RESULT_AVAILABLE_EXT);
                        var disjoint = this.gl.getParameter(ext.GPU_DISJOINT_EXT);
                        return available && !disjoint;
                    }
                };
                GPGPUContext.prototype.pollQueryTime = function (query) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        var resolveWithWarning = function () {
                            console.warn('Disjoint query timer never available.');
                            resolve(-1);
                        };
                        var queryTimerVersion = environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION');
                        util.repeatedTry(function () {
                                return _this.isQueryAvailable(query, queryTimerVersion);
                            })
                            .then(function () {
                                return resolve(_this.getQueryTime(query, queryTimerVersion));
                            })
                            .catch(resolveWithWarning);
                    });
                };
                GPGPUContext.prototype.getQueryTime = function (query, queryTimerVersion) {
                    if (queryTimerVersion === 0) {
                        return null;
                    }
                    if (queryTimerVersion === 2) {
                        var gl2 = this.gl;
                        var timeElapsedNanos = gl2.getQueryParameter(query, gl2.QUERY_RESULT);
                        return timeElapsedNanos / 1000000;
                    } else {
                        var ext = this.getQueryTimerExtensionWebGL1();
                        var timeElapsedNanos = ext.getQueryObjectEXT(query, ext.QUERY_RESULT_EXT);
                        return timeElapsedNanos / 1000000;
                    }
                };
                GPGPUContext.prototype.downloadMatrixDriverSetup = function (texture) {
                    this.throwIfDisposed();
                    webgl_util.bindColorTextureToFramebuffer(this.gl, texture, this.framebuffer);
                    if (this.autoDebugValidate) {
                        webgl_util.validateFramebuffer(this.gl);
                    }
                };
                GPGPUContext.prototype.downloadMatrixDriverTeardown = function () {
                    if (this.outputTexture != null) {
                        webgl_util.bindColorTextureToFramebuffer(this.gl, this.outputTexture, this.framebuffer);
                        if (this.autoDebugValidate) {
                            webgl_util.validateFramebuffer(this.gl);
                        }
                    } else {
                        webgl_util.unbindColorTextureFromFramebuffer(this.gl, this.framebuffer);
                    }
                };
                GPGPUContext.prototype.downloadMatrixDriver = function (texture, downloadAndDecode) {
                    this.downloadMatrixDriverSetup(texture);
                    var result = downloadAndDecode();
                    this.downloadMatrixDriverTeardown();
                    return result;
                };
                GPGPUContext.prototype.downloadMatrixDriverAsync = function (texture, downloadAndDecode) {
                    return __awaiter(this, void 0, void 0, function () {
                        var result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.downloadMatrixDriverSetup(texture);
                                    return [4, downloadAndDecode()];
                                case 1:
                                    result = _a.sent();
                                    this.downloadMatrixDriverTeardown();
                                    return [2, result];
                            }
                        });
                    });
                };
                GPGPUContext.prototype.setOutputMatrixTextureDriver = function (outputMatrixTextureMaybePacked, width, height) {
                    this.throwIfDisposed();
                    var gl = this.gl;
                    webgl_util.bindColorTextureToFramebuffer(gl, outputMatrixTextureMaybePacked, this.framebuffer);
                    if (this.autoDebugValidate) {
                        webgl_util.validateFramebuffer(gl);
                    }
                    this.outputTexture = outputMatrixTextureMaybePacked;
                    webgl_util.callAndCheck(gl, function () {
                        return gl.viewport(0, 0, width, height);
                    });
                    webgl_util.callAndCheck(gl, function () {
                        return gl.scissor(0, 0, width, height);
                    });
                };
                GPGPUContext.prototype.setOutputMatrixWriteRegionDriver = function (x, y, width, height) {
                    var _this = this;
                    this.throwIfDisposed();
                    webgl_util.callAndCheck(this.gl, function () {
                        return _this.gl.scissor(x, y, width, height);
                    });
                };
                GPGPUContext.prototype.throwIfDisposed = function () {
                    if (this.disposed) {
                        throw new Error('Attempted to use disposed GPGPUContext.');
                    }
                };
                GPGPUContext.prototype.throwIfNoProgram = function () {
                    if (this.program == null) {
                        throw new Error('No GPU program is currently set.');
                    }
                };
                return GPGPUContext;
            }());
            exports.GPGPUContext = GPGPUContext;

        }, {
            "../../environment": 34,
            "../../util": 150,
            "./gpgpu_util": 83,
            "./tex_util": 97,
            "./webgl_util": 102
        }],
        82: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../../environment");
            var util = require("../../util");
            var shader_compiler = require("./shader_compiler");
            var NAN_UNIFORM_NAME = 'NaN';

            function shouldUploadNaNUniform() {
                return !environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED');
            }

            function compileProgram(gpgpu, program, inputs, output) {
                var userCode = program.userCode;
                var inputInfos = inputs.map(function (input, i) {
                    var shapeInfo = {
                        logicalShape: input.tensor.shape,
                        texShape: input.texData.texShape
                    };
                    return {
                        name: program.variableNames[i],
                        shapeInfo: shapeInfo
                    };
                });
                var inShapeInfos = inputInfos.map(function (x) {
                    return x.shapeInfo;
                });
                var outShapeInfo = {
                    logicalShape: output.tensor.shape,
                    texShape: output.texData.texShape
                };
                var source = shader_compiler.makeShader(inputInfos, outShapeInfo, userCode, program.supportsBroadcasting === true);
                var webGLProgram = gpgpu.createProgram(source);
                var uniformLocations = {};
                for (var i = 0; i < program.variableNames.length; i++) {
                    var uniformName = program.variableNames[i];
                    uniformLocations[uniformName] =
                        gpgpu.getUniformLocation(webGLProgram, uniformName);
                }
                if (shouldUploadNaNUniform()) {
                    var throwIfNaNUniformIsNotUsed = false;
                    uniformLocations[NAN_UNIFORM_NAME] = gpgpu.getUniformLocation(webGLProgram, NAN_UNIFORM_NAME, throwIfNaNUniformIsNotUsed);
                }
                return {
                    program: program,
                    source: source,
                    webGLProgram: webGLProgram,
                    uniformLocations: uniformLocations,
                    gpgpu: gpgpu,
                    inShapeInfos: inShapeInfos,
                    outShapeInfo: outShapeInfo
                };
            }
            exports.compileProgram = compileProgram;

            function validateBinaryAndProgram(shapeInfos, inputs) {
                if (shapeInfos.length !== inputs.length) {
                    throw Error("Binary was compiled with " + shapeInfos.length + " inputs, but " +
                        ("was executed with " + inputs.length + " inputs"));
                }
                shapeInfos.forEach(function (s, i) {
                    var shapeA = s.logicalShape;
                    var texShapeA = s.texShape;
                    var shapeB = inputs[i].tensor.shape;
                    var texShapeB = inputs[i].texData.texShape;
                    if (!util.arraysEqual(shapeA, shapeB)) {
                        throw Error("Binary was compiled with different shapes than " +
                            ("the current args. Shapes " + shapeA + " and " + shapeB + " must match"));
                    }
                    if (!util.arraysEqual(texShapeA, texShapeB)) {
                        throw Error("Binary was compiled with different texture shapes than the" +
                            (" current args. Shape " + texShapeA + " and " + texShapeB + " must match"));
                    }
                });
            }

            function runProgram(binary, inputs, output, customSetup) {
                validateBinaryAndProgram(binary.inShapeInfos, inputs);
                validateBinaryAndProgram([binary.outShapeInfo], [output]);
                var outTex = output.texData.texture;
                var outTexShape = output.texData.texShape;
                var gpgpu = binary.gpgpu;
                gpgpu.setOutputMatrixTexture(outTex, outTexShape[0], outTexShape[1]);
                gpgpu.setProgram(binary.webGLProgram);
                inputs.forEach(function (input, i) {
                    var tex = input.texData.texture;
                    var variableName = binary.program.variableNames[i];
                    var variableUniformLocation = binary.uniformLocations[variableName];
                    gpgpu.setInputMatrixTexture(tex, variableUniformLocation, i);
                });
                if (shouldUploadNaNUniform()) {
                    gpgpu.gl.uniform1f(binary.uniformLocations[NAN_UNIFORM_NAME], NaN);
                }
                if (customSetup != null) {
                    customSetup(gpgpu, binary.webGLProgram);
                }
                gpgpu.executeProgram();
            }
            exports.runProgram = runProgram;

            function makeShaderKey(program, inputs, output) {
                var keyInputs = '';
                inputs.concat(output).forEach(function (x) {
                    keyInputs += x.tensor.shape + "_" + x.texData.texShape;
                });
                var keyUserCode = program.userCode;
                var keyBroadcast = (program.supportsBroadcasting === true).toString();
                var key = program.constructor.name;
                key += '_' + keyBroadcast + '_' + keyInputs + '_' + keyUserCode;
                return key;
            }
            exports.makeShaderKey = makeShaderKey;

        }, {
            "../../environment": 34,
            "../../util": 150,
            "./shader_compiler": 95
        }],
        83: [function (require, module, exports) {
            "use strict";
            var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
                return new(P || (P = Promise))(function (resolve, reject) {
                    function fulfilled(value) {
                        try {
                            step(generator.next(value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function rejected(value) {
                        try {
                            step(generator["throw"](value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function step(result) {
                        result.done ? resolve(result.value) : new P(function (resolve) {
                            resolve(result.value);
                        }).then(fulfilled, rejected);
                    }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
            };
            var __generator = (this && this.__generator) || function (thisArg, body) {
                var _ = {
                        label: 0,
                        sent: function () {
                            if (t[0] & 1) throw t[1];
                            return t[1];
                        },
                        trys: [],
                        ops: []
                    },
                    f, y, t, g;
                return g = {
                    next: verb(0),
                    "throw": verb(1),
                    "return": verb(2)
                }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
                    return this;
                }), g;

                function verb(n) {
                    return function (v) {
                        return step([n, v]);
                    };
                }

                function step(op) {
                    if (f) throw new TypeError("Generator is already executing.");
                    while (_) try {
                        if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                        if (y = 0, t) op = [0, t.value];
                        switch (op[0]) {
                            case 0:
                            case 1:
                                t = op;
                                break;
                            case 4:
                                _.label++;
                                return {
                                    value: op[1],
                                    done: false
                                };
                            case 5:
                                _.label++;
                                y = op[1];
                                op = [0];
                                continue;
                            case 7:
                                op = _.ops.pop();
                                _.trys.pop();
                                continue;
                            default:
                                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                    _ = 0;
                                    continue;
                                }
                                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                    _.label = op[1];
                                    break;
                                }
                                if (op[0] === 6 && _.label < t[1]) {
                                    _.label = t[1];
                                    t = op;
                                    break;
                                }
                                if (t && _.label < t[2]) {
                                    _.label = t[2];
                                    _.ops.push(op);
                                    break;
                                }
                                if (t[2]) _.ops.pop();
                                _.trys.pop();
                                continue;
                        }
                        op = body.call(thisArg, _);
                    } catch (e) {
                        op = [6, e];
                        y = 0;
                    } finally {
                        f = t = 0;
                    }
                    if (op[0] & 5) throw op[1];
                    return {
                        value: op[0] ? op[1] : void 0,
                        done: true
                    };
                }
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../../environment");
            var tex_util = require("./tex_util");
            var webgl_util = require("./webgl_util");

            function getWebGLContextAttributes() {
                return {
                    alpha: false,
                    antialias: false,
                    premultipliedAlpha: false,
                    preserveDrawingBuffer: false,
                    depth: false,
                    stencil: false,
                    failIfMajorPerformanceCaveat: true
                };
            }
            exports.getWebGLContextAttributes = getWebGLContextAttributes;

            function createWebGLContext(canvas) {
                var attributes = getWebGLContextAttributes();
                var gl;
                if (canvas != null) {
                    gl = webgl_util.createWebGLRenderingContextFromCanvas(canvas, attributes);
                } else {
                    gl = webgl_util.createWebGLRenderingContext(attributes);
                }
                webgl_util.callAndCheck(gl, function () {
                    return gl.disable(gl.DEPTH_TEST);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.disable(gl.STENCIL_TEST);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.disable(gl.BLEND);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.disable(gl.DITHER);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.disable(gl.POLYGON_OFFSET_FILL);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.disable(gl.SAMPLE_COVERAGE);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.enable(gl.SCISSOR_TEST);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.enable(gl.CULL_FACE);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.cullFace(gl.BACK);
                });
                return gl;
            }
            exports.createWebGLContext = createWebGLContext;

            function createVertexShader(gl) {
                var vertexShaderSource = "\n    precision highp float;\n    attribute vec3 clipSpacePos;\n    attribute vec2 uv;\n    varying vec2 resultUV;\n\n    void main() {\n      gl_Position = vec4(clipSpacePos, 1);\n      resultUV = uv;\n    }";
                return webgl_util.createVertexShader(gl, vertexShaderSource);
            }
            exports.createVertexShader = createVertexShader;

            function createVertexBuffer(gl) {
                var vertexArray = new Float32Array([-1, 1, 0, 0, 1, -1, -1, 0, 0, 0, 1, 1, 0, 1, 1, 1, -1, 0, 1, 0]);
                return webgl_util.createStaticVertexBuffer(gl, vertexArray);
            }
            exports.createVertexBuffer = createVertexBuffer;

            function createIndexBuffer(gl) {
                var triangleVertexIndices = new Uint16Array([0, 1, 2, 2, 1, 3]);
                return webgl_util.createStaticIndexBuffer(gl, triangleVertexIndices);
            }
            exports.createIndexBuffer = createIndexBuffer;

            function getTextureInternalFormat(gl, numChannels) {
                if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
                    return gl.RGBA;
                }
                if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
                    if (numChannels === 4) {
                        return gl.RGBA32F;
                    }
                    return gl.R32F;
                }
                return gl.RGBA;
            }

            function getTextureFormat(gl, numChannels) {
                if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
                    return gl.RGBA;
                }
                if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
                    if (numChannels === 4) {
                        return gl.RGBA;
                    }
                    return gl.RED;
                }
                return gl.RGBA;
            }

            function getTextureType(gl) {
                if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
                    return gl.UNSIGNED_BYTE;
                }
                return gl.FLOAT;
            }

            function createAndConfigureTexture(gl, width, height, numChannels) {
                webgl_util.validateTextureSize(gl, width, height);
                var texture = webgl_util.createTexture(gl);
                var tex2d = gl.TEXTURE_2D;
                var internalFormat = getTextureInternalFormat(gl, numChannels);
                var format = getTextureFormat(gl, numChannels);
                webgl_util.callAndCheck(gl, function () {
                    return gl.bindTexture(tex2d, texture);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.texParameteri(tex2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.texParameteri(tex2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.texParameteri(tex2d, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.texParameteri(tex2d, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.texImage2D(tex2d, 0, internalFormat, width, height, 0, format, getTextureType(gl), null);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.bindTexture(gl.TEXTURE_2D, null);
                });
                return texture;
            }

            function createMatrixTexture(gl, rows, columns) {
                var _a = tex_util.getUnpackedMatrixTextureShapeWidthHeight(rows, columns),
                    width = _a[0],
                    height = _a[1];
                var numChannels = 1;
                return createAndConfigureTexture(gl, width, height, numChannels);
            }
            exports.createMatrixTexture = createMatrixTexture;

            function createColorMatrixTexture(gl, rows, columns) {
                var _a = tex_util.getColorMatrixTextureShapeWidthHeight(rows, columns),
                    width = _a[0],
                    height = _a[1];
                var numChannels = 4;
                return createAndConfigureTexture(gl, width, height, numChannels);
            }
            exports.createColorMatrixTexture = createColorMatrixTexture;

            function createPackedMatrixTexture(gl, rows, columns) {
                var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns),
                    width = _a[0],
                    height = _a[1];
                var numChannels = 4;
                return createAndConfigureTexture(gl, width, height, numChannels);
            }
            exports.createPackedMatrixTexture = createPackedMatrixTexture;

            function bindVertexProgramAttributeStreams(gl, program, vertexBuffer) {
                var posOffset = 0;
                var uvOffset = 3 * 4;
                var stride = (3 * 4) + (2 * 4);
                webgl_util.callAndCheck(gl, function () {
                    return gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                });
                webgl_util.bindVertexBufferToProgramAttribute(gl, program, 'clipSpacePos', vertexBuffer, 3, stride, posOffset);
                webgl_util.bindVertexBufferToProgramAttribute(gl, program, 'uv', vertexBuffer, 2, stride, uvOffset);
            }
            exports.bindVertexProgramAttributeStreams = bindVertexProgramAttributeStreams;

            function uploadPixelDataToTexture(gl, texture, pixels) {
                webgl_util.callAndCheck(gl, function () {
                    return gl.bindTexture(gl.TEXTURE_2D, texture);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.bindTexture(gl.TEXTURE_2D, null);
                });
            }
            exports.uploadPixelDataToTexture = uploadPixelDataToTexture;

            function uploadDataToTexture(gl, texture, width, height, data, numChannels) {
                var textureFormat = getTextureFormat(gl, numChannels);
                webgl_util.validateTextureSize(gl, width, height);
                webgl_util.callAndCheck(gl, function () {
                    return gl.bindTexture(gl.TEXTURE_2D, texture);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, textureFormat, getTextureType(gl), data);
                });
                webgl_util.callAndCheck(gl, function () {
                    return gl.bindTexture(gl.TEXTURE_2D, null);
                });
            }

            function uploadMatrixToTexture(gl, texture, rows, columns, matrix, numChannels) {
                var _a = tex_util.getUnpackedMatrixTextureShapeWidthHeight(rows, columns),
                    w = _a[0],
                    h = _a[1];
                var unpackedArray;
                if (environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
                    var channelsPerTexture = numChannels === 1 ? webgl_util.getChannelsPerTexture() : numChannels;
                    if (channelsPerTexture === 1) {
                        unpackedArray = matrix;
                    } else {
                        unpackedArray =
                            new Float32Array(tex_util.getUnpackedArraySizeFromMatrixSize(matrix.length, channelsPerTexture));
                        tex_util.encodeMatrixToUnpackedArray(matrix, unpackedArray, channelsPerTexture);
                    }
                } else {
                    unpackedArray = tex_util.encodeFloatArray(matrix);
                }
                uploadDataToTexture(gl, texture, w, h, unpackedArray, numChannels);
            }
            exports.uploadMatrixToTexture = uploadMatrixToTexture;

            function uploadMatrixToPackedTexture(gl, texture, rows, columns, matrix) {
                var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns),
                    w = _a[0],
                    h = _a[1];
                var packedRGBA = new Float32Array(tex_util.getPackedRGBAArraySizeFromMatrixShape(rows, columns));
                tex_util.encodeMatrixToPackedRGBA(matrix, rows, columns, packedRGBA);
                var numChannels = 4;
                uploadDataToTexture(gl, texture, w, h, packedRGBA, numChannels);
            }
            exports.uploadMatrixToPackedTexture = uploadMatrixToPackedTexture;

            function getDownloadTargetArrayBuffer(rows, columns, channelsPerTexture) {
                var isFloatTexture = environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED');
                var downloadTarget;
                if (isFloatTexture) {
                    downloadTarget =
                        new Float32Array(tex_util.getUnpackedArraySizeFromMatrixSize(rows * columns, channelsPerTexture));
                } else {
                    downloadTarget = new Uint8Array(rows * columns * channelsPerTexture);
                }
                return downloadTarget;
            }

            function decodeDownloadTargetArrayBuffer(downloadTarget, rows, columns, channelsPerPixel) {
                var isFloatTexture = environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED');
                if (isFloatTexture) {
                    var matrix = new Float32Array(rows * columns);
                    tex_util.decodeMatrixFromUnpackedArray(downloadTarget, matrix, channelsPerPixel);
                    return matrix;
                } else {
                    return tex_util.decodeToFloatArray(downloadTarget);
                }
            }

            function downloadMatrixFromOutputTextureAsync(gl, getBufferSubDataAsyncExtension, rows, columns) {
                return __awaiter(this, void 0, void 0, function () {
                    var gl2, channelsPerPixel, downloadTarget, bufferSizeBytes, buffer;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                gl2 = gl;
                                channelsPerPixel = 4;
                                downloadTarget = getDownloadTargetArrayBuffer(rows, columns, channelsPerPixel);
                                bufferSizeBytes = downloadTarget instanceof Float32Array ?
                                    downloadTarget.length * 4 :
                                    downloadTarget;
                                buffer = gl.createBuffer();
                                webgl_util.callAndCheck(gl, function () {
                                    return gl.bindBuffer(gl2.PIXEL_PACK_BUFFER, buffer);
                                });
                                webgl_util.callAndCheck(gl, function () {
                                    return gl.bufferData(gl2.PIXEL_PACK_BUFFER, bufferSizeBytes, gl.STATIC_DRAW);
                                });
                                webgl_util.callAndCheck(gl, function () {
                                    return gl2.readPixels(0, 0, columns, rows, gl.RGBA, getTextureType(gl), 0);
                                });
                                return [4, getBufferSubDataAsyncExtension.getBufferSubDataAsync(gl2.PIXEL_PACK_BUFFER, 0, downloadTarget)];
                            case 1:
                                _a.sent();
                                return [2, decodeDownloadTargetArrayBuffer(downloadTarget, rows, columns, channelsPerPixel)];
                        }
                    });
                });
            }
            exports.downloadMatrixFromOutputTextureAsync = downloadMatrixFromOutputTextureAsync;

            function downloadMatrixFromOutputTexture(gl, rows, columns) {
                var _a = tex_util.getUnpackedMatrixTextureShapeWidthHeight(rows, columns),
                    w = _a[0],
                    h = _a[1];
                var channelsPerPixel = 4;
                var downloadTarget = getDownloadTargetArrayBuffer(rows, columns, channelsPerPixel);
                webgl_util.callAndCheck(gl, function () {
                    return gl.readPixels(0, 0, w, h, gl.RGBA, getTextureType(gl), downloadTarget);
                });
                return decodeDownloadTargetArrayBuffer(downloadTarget, rows, columns, channelsPerPixel);
            }
            exports.downloadMatrixFromOutputTexture = downloadMatrixFromOutputTexture;

            function downloadMatrixFromRGBAColorTexture(gl, rows, columns, channels) {
                var size = rows * columns * 4;
                var downloadTarget = new Uint8Array(size);
                webgl_util.callAndCheck(gl, function () {
                    return gl.readPixels(0, 0, columns, rows, gl.RGBA, gl.UNSIGNED_BYTE, downloadTarget);
                });
                var packedRGBA = new Float32Array(size);
                for (var i = 0; i < downloadTarget.length; i++) {
                    packedRGBA[i] = downloadTarget[i];
                }
                var matrix = new Float32Array(rows * columns * channels);
                tex_util.decodeMatrixFromUnpackedColorRGBAArray(packedRGBA, matrix, channels);
                return matrix;
            }
            exports.downloadMatrixFromRGBAColorTexture = downloadMatrixFromRGBAColorTexture;

            function downloadMatrixFromPackedOutputTexture(gl, rows, columns) {
                var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns),
                    w = _a[0],
                    h = _a[1];
                var packedRGBA = new Float32Array(tex_util.getPackedRGBAArraySizeFromMatrixShape(rows, columns));
                webgl_util.callAndCheck(gl, function () {
                    return gl.readPixels(0, 0, w, h, gl.RGBA, getTextureType(gl), packedRGBA);
                });
                var matrix = new Float32Array(rows * columns);
                return tex_util.decodeMatrixFromPackedRGBA(packedRGBA, rows, columns, matrix);
            }
            exports.downloadMatrixFromPackedOutputTexture = downloadMatrixFromPackedOutputTexture;

        }, {
            "../../environment": 34,
            "./tex_util": 97,
            "./webgl_util": 102
        }],
        84: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var shader_compiler_1 = require("./shader_compiler");
            var WhereProgram = (function () {
                function WhereProgram(cRank, shape, rank) {
                    this.variableNames = ['c', 'a', 'b'];
                    this.outputShape = shape;
                    var cCoords;
                    var abCoords;
                    if (rank > 4) {
                        throw Error("Where for rank " + rank + " is not yet supported");
                    }
                    if (rank === 1) {
                        abCoords = "resRC";
                        cCoords = "resRC";
                    } else {
                        var currentCoords = ['resRC.x', 'resRC.y', 'resRC.z', 'resRC.w'];
                        var cCoordVars = [];
                        var abCoordVars = [];
                        for (var i = 0; i < shape.length; i++) {
                            abCoordVars.push("" + currentCoords[i]);
                            if (i < cRank) {
                                cCoordVars.push("" + currentCoords[i]);
                            }
                        }
                        cCoords = cCoordVars.join();
                        abCoords = abCoordVars.join();
                    }
                    var dtype = shader_compiler_1.getCoordsDataType(rank);
                    this.userCode = "\n      void main() {\n        " + dtype + " resRC = getOutputCoords();\n        float cVal = getC(" + cCoords + ");\n        if (cVal >= 1.0) {\n          setOutput(getA(" + abCoords + "));\n        } else {\n          setOutput(getB(" + abCoords + "));\n        }\n      }\n    ";
                }
                return WhereProgram;
            }());
            exports.WhereProgram = WhereProgram;

        }, {
            "./shader_compiler": 95
        }],
        85: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var LRNProgram = (function () {
                function LRNProgram(xShape, radius, bias, alpha, beta, normRegion) {
                    this.variableNames = ['x'];
                    this.outputShape = [];
                    var rad = radius;
                    var maxW = xShape[1] - 1;
                    var maxH = xShape[2] - 1;
                    var maxD = xShape[3] - 1;
                    this.outputShape = xShape;
                    var powOperator;
                    var basis = "float(" + bias + ") + float(" + alpha + ") * sum";
                    if (beta === 0.5) {
                        powOperator = "inversesqrt(" + basis + ")";
                    } else if (beta === 1.0) {
                        powOperator = "1.0/(" + basis + ")";
                    } else {
                        powOperator = "exp(log(" + basis + ") * float(-" + beta + "));";
                    }
                    if (normRegion === 'withinChannel') {
                        this.userCode = "\n        void main() {\n          ivec4 coords = getOutputCoords();\n          int b = coords[0];\n          int r = coords[1];\n          int c = coords[2];\n          int d = coords[3];\n          float x = getX(b, r, c, d);\n          float sum = 0.0;\n          for (int u = -" + rad + "; u <= " + rad + "; u++) {\n            for (int v = -" + rad + "; v <= " + rad + "; v++) {\n              int idx = r + u;\n              int idy = c + v;\n              if (idx >= 0 && idx <= " + maxW + " && idy >= 0 && idy <= " + maxH + ") {\n                float z = getX(b, idx, idy, d);\n                sum += z * z;\n              }\n            }\n          }\n          float val = x * " + powOperator + ";\n          setOutput(val);\n        }\n      ";
                    } else {
                        this.userCode = "\n        void main() {\n          ivec4 coords = getOutputCoords();\n          int b = coords[0];\n          int r = coords[1];\n          int c = coords[2];\n          int d = coords[3];\n          float x = getX(b, r, c, d);\n          float sum = 0.0;\n          for (int j = -" + rad + "; j <= " + rad + "; j++) {\n            int idx = d + j;\n            if (idx >= 0 && idx <=  " + maxD + ") {\n              float z = getX(b, r, c, idx);\n              sum += z * z;\n            }\n          }\n          float val = x * " + powOperator + ";\n          setOutput(val);\n        }\n      ";
                    }
                }
                return LRNProgram;
            }());
            exports.LRNProgram = LRNProgram;

        }, {}],
        86: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var MaxPool2DBackpropProgram = (function () {
                function MaxPool2DBackpropProgram(convInfo) {
                    this.variableNames = ['dy', 'maxPos'];
                    this.outputShape = convInfo.inShape;
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var padTop = filterHeight - 1 - convInfo.padInfo.top;
                    var padLeft = filterWidth - 1 - convInfo.padInfo.left;
                    var lastIndex = filterHeight * filterWidth - 1;
                    this.userCode = "\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int b = coords[0];\n        int d = coords[3];\n\n        ivec2 dyRCCorner = coords.yz - pads;\n        int dyRCorner = dyRCCorner.x;\n        int dyCCorner = dyRCCorner.y;\n\n        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          float dyR = float(dyRCorner + wR) / " + strideHeight + ".0;\n\n          if (dyR < 0.0 || dyR >= " + convInfo.outHeight + ".0 || fract(dyR) > 0.0) {\n            continue;\n          }\n          int idyR = int(dyR);\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            float dyC = float(dyCCorner + wC) / " + strideWidth + ".0;\n\n            if (dyC < 0.0 || dyC >= " + convInfo.outWidth + ".0 ||\n                fract(dyC) > 0.0) {\n              continue;\n            }\n            int idyC = int(dyC);\n\n            float dyValue = getDy(b, idyR, idyC, d);\n            int maxPosValue = " + lastIndex + " - int(getMaxPos(b, idyR, idyC, d));\n\n            // Get the current value, check it against the value from the\n            // position matrix.\n            int curPosValue = wR * " + filterWidth + " + wC;\n            float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);\n\n            dotProd += dyValue * mask;\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
                }
                return MaxPool2DBackpropProgram;
            }());
            exports.MaxPool2DBackpropProgram = MaxPool2DBackpropProgram;

        }, {}],
        87: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var MatMulProgram = (function () {
                function MatMulProgram(aShape, bShape, transposeA, transposeB) {
                    if (transposeA === void 0) {
                        transposeA = false;
                    }
                    if (transposeB === void 0) {
                        transposeB = false;
                    }
                    this.variableNames = ['matrixA', 'matrixB'];
                    var outerShapeA = transposeA ? aShape[1] : aShape[0];
                    var outerShapeB = transposeB ? bShape[0] : bShape[1];
                    var sharedDim = transposeA ? aShape[0] : aShape[1];
                    this.outputShape = [outerShapeA, outerShapeB];
                    var aSnippetFromOffset = function (vec4Offset, indexVar) {
                        return transposeA ? indexVar + " + " + vec4Offset + ", aRow" :
                            "aRow, " + indexVar + " + " + vec4Offset;
                    };
                    var bSnippetFromOffset = function (vec4Offset, indexVar) {
                        return transposeB ? "bCol, " + indexVar + " + " + vec4Offset :
                            indexVar + " + " + vec4Offset + ", bCol";
                    };
                    var sharedDimNearestVec4 = Math.floor(sharedDim / 4) * 4;
                    var sharedDimVec4Remainder = sharedDim % 4;
                    this.userCode = " float dotARowBCol(int aRow, int bCol) {\n      float result = 0.0;\n      for (int i = 0; i < " + sharedDimNearestVec4 + "; i += 4) {\n        vec4 a = vec4(\n          getMatrixA(" + aSnippetFromOffset(0, 'i') + "),\n          getMatrixA(" + aSnippetFromOffset(1, 'i') + "),\n          getMatrixA(" + aSnippetFromOffset(2, 'i') + "),\n          getMatrixA(" + aSnippetFromOffset(3, 'i') + ")\n        );\n        vec4 b = vec4(\n          getMatrixB(" + bSnippetFromOffset(0, 'i') + "),\n          getMatrixB(" + bSnippetFromOffset(1, 'i') + "),\n          getMatrixB(" + bSnippetFromOffset(2, 'i') + "),\n          getMatrixB(" + bSnippetFromOffset(3, 'i') + ")\n        );\n\n        result += dot(a, b);\n      }\n\n      if (" + (sharedDimVec4Remainder === 1) + ") {\n        result += getMatrixA(" + aSnippetFromOffset(0, sharedDimNearestVec4) + ") *\n          getMatrixB(" + bSnippetFromOffset(0, sharedDimNearestVec4) + ");\n      } else if (" + (sharedDimVec4Remainder === 2) + ") {\n        vec2 a = vec2(\n          getMatrixA(" + aSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixA(" + aSnippetFromOffset(1, sharedDimNearestVec4) + ")\n        );\n        vec2 b = vec2(\n          getMatrixB(" + bSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixB(" + bSnippetFromOffset(1, sharedDimNearestVec4) + ")\n        );\n        result += dot(a, b);\n      } else if (" + (sharedDimVec4Remainder === 3) + ") {\n        vec3 a = vec3(\n          getMatrixA(" + aSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixA(" + aSnippetFromOffset(1, sharedDimNearestVec4) + "),\n          getMatrixA(" + aSnippetFromOffset(2, sharedDimNearestVec4) + ")\n        );\n        vec3 b = vec3(\n          getMatrixB(" + bSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixB(" + bSnippetFromOffset(1, sharedDimNearestVec4) + "),\n          getMatrixB(" + bSnippetFromOffset(2, sharedDimNearestVec4) + ")\n        );\n        result += dot(a, b);\n      }\n\n      return result;\n    }\n\n    void main() {\n      ivec2 resRC = getOutputCoords();\n      setOutput(dotARowBCol(resRC.x, resRC.y));\n    }\n    ";
                }
                return MatMulProgram;
            }());
            exports.MatMulProgram = MatMulProgram;

        }, {}],
        88: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var MultinomialProgram = (function () {
                function MultinomialProgram(batchSize, numOutcomes, numSamples) {
                    this.variableNames = ['probs'];
                    this.outputShape = [batchSize, numSamples];
                    this.userCode = "\n      uniform float seed;\n\n      void main() {\n        ivec2 coords = getOutputCoords();\n        int batch = coords[0];\n\n        float r = random(seed);\n        float cdf = 0.0;\n\n        for (int i = 0; i < " + (numOutcomes - 1) + "; i++) {\n          cdf += getProbs(batch, i);\n\n          if (r < cdf) {\n            setOutput(float(i));\n            return;\n          }\n        }\n\n        // If no other event happened, last event happened.\n        setOutput(float(" + (numOutcomes - 1) + "));\n      }\n    ";
                }
                MultinomialProgram.prototype.getCustomSetupFunc = function (seed) {
                    var _this = this;
                    return function (gpgpu, webGLProgram) {
                        if (_this.seedLoc == null) {
                            _this.seedLoc = gpgpu.getUniformLocation(webGLProgram, 'seed');
                        }
                        gpgpu.gl.uniform1f(_this.seedLoc, seed);
                    };
                };
                return MultinomialProgram;
            }());
            exports.MultinomialProgram = MultinomialProgram;

        }, {}],
        89: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var OneHotProgram = (function () {
                function OneHotProgram(numIndices, depth, onValue, offValue) {
                    this.variableNames = ['indices'];
                    this.outputShape = [numIndices, depth];
                    this.userCode = "\n      void main() {\n        ivec2 coords = getOutputCoords();\n        int index = round(getIndices(coords.x));\n        setOutput(mix(float(" + offValue + "), float(" + onValue + "),\n                      float(index == coords.y)));\n      }\n    ";
                }
                return OneHotProgram;
            }());
            exports.OneHotProgram = OneHotProgram;

        }, {}],
        90: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var shader_compiler_1 = require("./shader_compiler");
            var PadProgram = (function () {
                function PadProgram(xShape, paddings, constantValue) {
                    this.variableNames = ['x'];
                    this.outputShape = paddings.map(function (p, i) {
                        return p[0] + xShape[i] + p[1];
                    });
                    var rank = xShape.length;
                    var type = shader_compiler_1.getCoordsDataType(rank);
                    var start = paddings.map(function (p) {
                        return p[0];
                    }).join(',');
                    var end = paddings.map(function (p, i) {
                        return p[0] + xShape[i];
                    }).join(',');
                    var unpackedCoords = ['coords[0]', 'coords[1]', 'coords[2]', 'coords[3]'].slice(0, rank);
                    if (rank === 1) {
                        this.userCode = "\n        int start = " + start + ";\n        int end = " + end + ";\n\n        void main() {\n          int outC = getOutputCoords();\n          if (outC < start || outC >= end) {\n            setOutput(float(" + constantValue + "));\n          } else {\n            setOutput(getX(outC - start));\n          }\n        }\n      ";
                        return;
                    }
                    this.userCode = "\n      " + type + " start = " + type + "(" + start + ");\n      " + type + " end = " + type + "(" + end + ");\n\n      void main() {\n        " + type + " outC = getOutputCoords();\n        if (any(lessThan(outC, start)) || any(greaterThanEqual(outC, end))) {\n          setOutput(float(" + constantValue + "));\n        } else {\n          " + type + " coords = outC - start;\n          setOutput(getX(" + unpackedCoords + "));\n        }\n      }\n    ";
                }
                return PadProgram;
            }());
            exports.PadProgram = PadProgram;

        }, {
            "./shader_compiler": 95
        }],
        91: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var Pool2DProgram = (function () {
                function Pool2DProgram(convInfo, poolType, computePositions) {
                    this.variableNames = ['x'];
                    if (poolType === 'avg' && computePositions) {
                        throw new Error('Cannot compute positions for average pool.');
                    }
                    var filterHeight = convInfo.filterHeight;
                    var filterWidth = convInfo.filterWidth;
                    var strideHeight = convInfo.strideHeight;
                    var strideWidth = convInfo.strideWidth;
                    var padTop = convInfo.padInfo.top;
                    var padLeft = convInfo.padInfo.left;
                    this.outputShape = convInfo.outShape;
                    var isAvgPool = poolType === 'avg';
                    var initializationValue = '0.0';
                    if (!isAvgPool) {
                        if (poolType === 'min') {
                            initializationValue = '1.0 / 0.0';
                        } else {
                            initializationValue = '-1.0 / 0.0';
                        }
                    }
                    if (computePositions) {
                        var compareOp_1 = poolType === 'min' ? '<=' : '>=';
                        this.userCode = "\n        const ivec2 strides = ivec2(" + strideHeight + ", " + strideWidth + ");\n        const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n        void main() {\n          ivec4 coords = getOutputCoords();\n          int batch = coords[0];\n          int d = coords[3];\n\n          ivec2 xRCCorner = coords.yz * strides - pads;\n          int xRCorner = xRCCorner.x;\n          int xCCorner = xRCCorner.y;\n\n          // max/min x(?, ?, d) to get y(yR, yC, d).\n          // ? = to be determined\n          float minMaxValue = 0.0;\n          float minMaxValueFound = 0.0;\n          int minMaxPosition = 0;\n          float avgValue = 0.0;\n\n          for (int wR = 0; wR < " + filterHeight + "; wR++) {\n            int xR = xRCorner + wR;\n\n            if (xR < 0 || xR >= " + convInfo.inHeight + ") {\n              continue;\n            }\n\n            for (int wC = 0; wC < " + filterWidth + "; wC++) {\n              int xC = xCCorner + wC;\n\n              if (xC < 0 || xC >= " + convInfo.inWidth + ") {\n                continue;\n              }\n\n              float value = getX(batch, xR, xC, d);\n\n              if (isNaN(value)) {\n                setOutput(value);\n                return;\n              }\n\n              // If a min / max value has already been found, use it. If not,\n              // use the current value.\n              float currMinMaxValue = mix(\n                  value, minMaxValue, minMaxValueFound);\n              if (value " + compareOp_1 + " currMinMaxValue) {\n                minMaxValue = value;\n                minMaxValueFound = 1.0;\n                minMaxPosition = wR * " + filterWidth + " + wC;\n              }\n            }\n          }\n          setOutput(float(minMaxPosition));\n        }\n      ";
                        return;
                    }
                    var compareOp = poolType === 'min' ? 'min' : 'max';
                    var returnValue = poolType + "(" + poolType + "(" + poolType + "(" +
                        'minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])';
                    if (poolType === 'avg') {
                        returnValue = "avgValue / " + filterHeight * filterWidth + ".0";
                    }
                    var filterWidthNearestVec4 = Math.floor(filterWidth / 4) * 4;
                    var filterWidthVec4Remainder = filterWidth % 4;
                    var updateSnippet = "\n      if (hasNaN(values)) {\n        setOutput(getNaN(values));\n        return;\n      }\n      if (" + isAvgPool + ") {\n        avgValue += dot(values, ones);\n      } else {\n        minMaxValue = " + compareOp + "(values, minMaxValue);\n      }\n    ";
                    this.userCode = "\n      const ivec2 strides = ivec2(" + strideHeight + ", " + strideWidth + ");\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n      const float initializationValue = " + initializationValue + ";\n      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);\n\n      float getValue(int batch, int xR, int xC, int d) {\n        if (xC < 0 || xC >= " + convInfo.inWidth + ") {\n          return initializationValue;\n        }\n        return getX(batch, xR, xC, d);\n      }\n\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int batch = coords[0];\n        int d = coords[3];\n\n        ivec2 xRCCorner = coords.yz * strides - pads;\n        int xRCorner = xRCCorner.x;\n        int xCCorner = xRCCorner.y;\n\n        // max/min x(?, ?, d) to get y(yR, yC, d).\n        // ? = to be determined\n        vec4 minMaxValue = vec4(" + initializationValue + ");\n        float avgValue = 0.0;\n\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          int xR = xRCorner + wR;\n\n          if (xR < 0 || xR >= " + convInfo.inHeight + ") {\n            continue;\n          }\n\n          for (int wC = 0; wC < " + filterWidthNearestVec4 + "; wC += 4) {\n            int xC = xCCorner + wC;\n\n            vec4 values = vec4(\n              getValue(batch, xR, xC, d),\n              getValue(batch, xR, xC + 1, d),\n              getValue(batch, xR, xC + 2, d),\n              getValue(batch, xR, xC + 3, d)\n            );\n\n            " + updateSnippet + "\n          }\n\n          int xC = xCCorner + " + filterWidthNearestVec4 + ";\n          if (" + (filterWidthVec4Remainder === 1) + ") {\n            vec4 values = vec4(\n              getValue(batch, xR, xC, d),\n              initializationValue,\n              initializationValue,\n              initializationValue\n            );\n            " + updateSnippet + "\n          } else if (" + (filterWidthVec4Remainder === 2) + ") {\n            vec4 values = vec4(\n              getValue(batch, xR, xC, d),\n              getValue(batch, xR, xC + 1, d),\n              initializationValue,\n              initializationValue\n            );\n\n            " + updateSnippet + "\n          } else if (" + (filterWidthVec4Remainder === 3) + ") {\n            vec4 values = vec4(\n              getValue(batch, xR, xC, d),\n              getValue(batch, xR, xC + 1, d),\n              getValue(batch, xR, xC + 2, d),\n              initializationValue\n            );\n\n            " + updateSnippet + "\n          }\n        }\n        setOutput(" + returnValue + ");\n      }\n    ";
                }
                return Pool2DProgram;
            }());
            exports.Pool2DProgram = Pool2DProgram;

        }, {}],
        92: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var ReduceProgram = (function () {
                function ReduceProgram(reduceInfo, reduceType) {
                    this.variableNames = ['x'];
                    var windowSize = reduceInfo.windowSize;
                    var batchSize = reduceInfo.batchSize;
                    var inSize = reduceInfo.inSize;
                    var outSize = Math.ceil(inSize / windowSize);
                    this.outputShape = [batchSize, outSize];
                    var isReduceSum = reduceType === 'sum';
                    var initializationValue = '0.0';
                    if (!isReduceSum) {
                        if (reduceType === 'min') {
                            initializationValue = '1.0 / 0.0';
                        } else {
                            initializationValue = '-1.0 / 0.0';
                        }
                    }
                    var compareOp = reduceType === 'min' ? 'min' : 'max';
                    var returnValue = reduceType + "(" + reduceType + "(" + reduceType + "(" +
                        'minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])';
                    if (reduceType === 'sum') {
                        returnValue = "sumValue";
                    }
                    var windowSizeNearestVec4 = Math.floor(windowSize / 4) * 4;
                    var windowSizeVec4Remainder = windowSize % 4;
                    var updateSnippet = "\n      if (" + isReduceSum + ") {\n        sumValue += dot(values, ones);\n      } else {\n        if (hasNaN(values)) {\n          setOutput(getNaN(values));\n          return;\n        }\n        minMaxValue = " + compareOp + "(values, minMaxValue);\n      }\n    ";
                    var checkOutOfBounds = '';
                    if (inSize % windowSize > 0) {
                        checkOutOfBounds = "\n        if (inIdx < 0 || inIdx >= " + inSize + ") {\n          return initializationValue;\n        }\n      ";
                    }
                    this.userCode = "\n      const float initializationValue = " + initializationValue + ";\n      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);\n\n      float getValue(int batch, int inIdx) {\n        " + checkOutOfBounds + "\n        return getX(batch, inIdx);\n      }\n\n      void main() {\n        ivec2 coords = getOutputCoords();\n        int batch = coords[0];\n        int outIdx = coords[1];\n        int inOffset = outIdx * " + windowSize + ";\n\n        vec4 minMaxValue = vec4(" + initializationValue + ");\n        float sumValue = 0.0;\n\n        for (int i = 0; i < " + windowSizeNearestVec4 + "; i += 4) {\n          int inIdx = inOffset + i;\n          vec4 values = vec4(\n            getValue(batch, inIdx),\n            getValue(batch, inIdx + 1),\n            getValue(batch, inIdx + 2),\n            getValue(batch, inIdx + 3)\n          );\n\n          " + updateSnippet + "\n        }\n\n        int inIdx = inOffset + " + windowSizeNearestVec4 + ";\n        if (" + (windowSizeVec4Remainder === 1) + ") {\n          vec4 values = vec4(\n            getValue(batch, inIdx),\n            initializationValue,\n            initializationValue,\n            initializationValue\n          );\n          " + updateSnippet + "\n        } else if (" + (windowSizeVec4Remainder === 2) + ") {\n          vec4 values = vec4(\n            getValue(batch, inIdx),\n            getValue(batch, inIdx + 1),\n            initializationValue,\n            initializationValue\n          );\n          " + updateSnippet + "\n        } else if (" + (windowSizeVec4Remainder === 3) + ") {\n          vec4 values = vec4(\n            getValue(batch, inIdx),\n            getValue(batch, inIdx + 1),\n            getValue(batch, inIdx + 2),\n            initializationValue\n          );\n          " + updateSnippet + "\n        }\n        setOutput(" + returnValue + ");\n      }\n    ";
                }
                return ReduceProgram;
            }());
            exports.ReduceProgram = ReduceProgram;

        }, {}],
        93: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var ResizeBilinearProgram = (function () {
                function ResizeBilinearProgram(inputShape, newHeight, newWidth, alignCorners) {
                    this.variableNames = ['A'];
                    this.outputShape = [];
                    var batch = inputShape[0],
                        oldHeight = inputShape[1],
                        oldWidth = inputShape[2],
                        depth = inputShape[3];
                    this.outputShape = [batch, newHeight, newWidth, depth];
                    var effectiveInSize = alignCorners ? [oldHeight - 1, oldWidth - 1] : [oldHeight, oldWidth];
                    var effectiveOutSize = alignCorners ? [newHeight - 1, newWidth - 1] : [newHeight, newWidth];
                    this.userCode = "\n      const vec2 effectiveInputOverOutputRatioRC = vec2(\n          " + effectiveInSize[0] / effectiveOutSize[0] + ",\n          " + effectiveInSize[1] / effectiveOutSize[1] + ");\n      const vec2 inputShapeRC = vec2(" + oldHeight + ".0, " + oldWidth + ".0);\n\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int b = coords[0];\n        int d = coords[3];\n        ivec2 yRC = coords.yz;\n\n        // Fractional source index.\n        vec2 sourceFracIndexRC = vec2(yRC) * effectiveInputOverOutputRatioRC;\n\n        // Compute the four integer indices.\n        ivec2 sourceFloorRC = ivec2(sourceFracIndexRC);\n        ivec2 sourceCeilRC = ivec2(\n          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));\n\n        float topLeft = getA(b, sourceFloorRC.x, sourceFloorRC.y, d);\n        float bottomLeft = getA(b, sourceCeilRC.x, sourceFloorRC.y, d);\n        float topRight = getA(b, sourceFloorRC.x, sourceCeilRC.y, d);\n        float bottomRight = getA(b, sourceCeilRC.x, sourceCeilRC.y, d);\n\n        vec2 fracRC = sourceFracIndexRC - vec2(sourceFloorRC);\n\n        float top = topLeft + (topRight - topLeft) * fracRC.y;\n        float bottom = bottomLeft + (bottomRight - bottomLeft) * fracRC.y;\n        float newValue = top + (bottom - top) * fracRC.x;\n\n        setOutput(newValue);\n      }\n    ";
                }
                return ResizeBilinearProgram;
            }());
            exports.ResizeBilinearProgram = ResizeBilinearProgram;

        }, {}],
        94: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var shader_compiler_1 = require("./shader_compiler");
            var ReverseProgram = (function () {
                function ReverseProgram(xShape, axis) {
                    this.variableNames = ['x'];
                    var rank = xShape.length;
                    if (rank > 4) {
                        throw new Error("WebGL backend: Reverse of rank-" + rank + " tensor is not yet supported");
                    }
                    this.outputShape = xShape;
                    if (rank === 1) {
                        this.userCode = "\n        void main() {\n          int coord = getOutputCoords();\n          setOutput(getX(" + xShape[0] + " - coord - 1));\n        }\n      ";
                        return;
                    }
                    var getInCoord = function (i) {
                        if (axis.indexOf(i) !== -1 && xShape[i] !== 1) {
                            return xShape[i] + " - coords[" + i + "] - 1";
                        }
                        return "coords[" + i + "]";
                    };
                    var inCoords = xShape.map(function (_, i) {
                        return getInCoord(i);
                    }).join(',');
                    var type = shader_compiler_1.getCoordsDataType(rank);
                    this.userCode = "\n      void main() {\n        " + type + " coords = getOutputCoords();\n        setOutput(getX(" + inCoords + "));\n      }\n    ";
                }
                return ReverseProgram;
            }());
            exports.ReverseProgram = ReverseProgram;

        }, {
            "./shader_compiler": 95
        }],
        95: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../../environment");
            var util = require("../../util");
            var broadcast_util = require("../../ops/broadcast_util");
            var tex_util = require("./tex_util");

            function makeShader(inputsInfo, outputShape, userCode, broadcast) {
                var sampleSnippet = getSampleSnippet();
                var setOutputSnippet = getSetOutputSnippet();
                var inputPrefixSnippet = inputsInfo.map(function (x) {
                    return "uniform sampler2D " + x.name + ";";
                }).join('\n');
                var inputSamplingSnippet = inputsInfo.map(function (x) {
                        return getInputSamplingSnippet(x, outputShape, broadcast);
                    })
                    .join('\n');
                var outTexShape = outputShape.texShape;
                var outputSamplingSnippet = getOutputSamplingSnippet(outputShape.logicalShape, outTexShape);
                var source = [
                    SHADER_PREFIX, sampleSnippet, setOutputSnippet, inputPrefixSnippet,
                    outputSamplingSnippet, inputSamplingSnippet, userCode
                ].join('\n');
                return source;
            }
            exports.makeShader = makeShader;

            function getSampleSnippet() {
                return environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED') ?
                    FLOAT_TEXTURE_SAMPLE_SNIPPET :
                    UNSIGNED_BYTE_TEXTURE_SAMPLE_SNIPPET;
            }

            function getSetOutputSnippet() {
                return environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED') ?
                    FLOAT_TEXTURE_SETOUTPUT_SNIPPET :
                    UNSIGNED_BYTE_TEXTURE_SETOUTPUT_SNIPPET;
            }

            function getSamplerFromInInfo(inInfo) {
                var shape = inInfo.shapeInfo.logicalShape;
                switch (shape.length) {
                    case 0:
                        return getSamplerScalar(inInfo);
                    case 1:
                        return getSampler1D(inInfo);
                    case 2:
                        return getSampler2D(inInfo);
                    case 3:
                        return getSampler3D(inInfo);
                    case 4:
                        return getSampler4D(inInfo);
                    default:
                        throw new Error(shape.length + "-D input sampling" +
                            " is not yet supported");
                }
            }

            function getInputSamplingSnippet(inInfo, outShapeInfo, broadcast) {
                var res = getSamplerFlat(inInfo);
                res += getSamplerFromInInfo(inInfo);
                if (broadcast ||
                    util.arraysEqual(inInfo.shapeInfo.logicalShape, outShapeInfo.logicalShape)) {
                    res += getSamplerAtOutputCoords(inInfo, outShapeInfo, broadcast);
                }
                return res;
            }

            function getOutputSamplingSnippet(outShape, outTexShape) {
                switch (outShape.length) {
                    case 0:
                        return getOutputScalarCoords();
                    case 1:
                        return getOutput1DCoords(outShape, outTexShape);
                    case 2:
                        return getOutput2DCoords(outShape, outTexShape);
                    case 3:
                        return getOutput3DCoords(outShape, outTexShape);
                    case 4:
                        return getOutput4DCoords(outShape, outTexShape);
                    default:
                        throw new Error(outShape.length + "-D output sampling is not yet supported");
                }
            }
            var SAMPLE_1D_SNIPPET = "\nvec2 UVfrom1D(int texNumR, int texNumC, int index) {\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
            var SAMPLE_2D_SNIPPET = "\nvec2 UVfrom2D(int texNumR, int texNumC, int numC, int row, int col) {\n  int index = row * numC + col;\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
            var SAMPLE_3D_SNIPPET = "\nvec2 UVfrom3D(int texNumR, int texNumC, int stride0,\n    int stride1, int row, int col, int depth) {\n  // Explicitly use integer operations as dot() only works on floats.\n  int index = row * stride0 + col * stride1 + depth;\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
            var SAMPLE_4D_SNIPPET = "\nvec2 UVfrom4D(int texNumR, int texNumC, int stride0,\n    int stride1, int stride2, int row, int col, int depth,\n    int depth2) {\n  // Explicitly use integer operations as dot() only works on floats.\n  int index = row * stride0 + col * stride1 + depth * stride2 + depth2;\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
            var UNSIGNED_BYTE_TEXTURE_SAMPLE_SNIPPET = "\n  uniform float NaN;\n\n  const vec4 floatDeltas = vec4(\n      1.0,\n      1.0 / 255.0,\n      1.0 / (255.0 * 255.0),\n      1.0 / (255.0 * 255.0 * 255.0)\n  );\n  const float minValue = " + tex_util.FLOAT_MIN + ".0;\n  const float maxValue = " + tex_util.FLOAT_MAX + ".0;\n  const float range = (maxValue - minValue) / 255.0;\n  const vec2 dotRange = vec2(1.0, range);\n\n  float sample(sampler2D texture, vec2 uv) {\n    vec4 sampleValue = texture2D(texture, uv);\n    if (all(equal(sampleValue, vec4(" + tex_util.BYTE_NAN_VALUE + ")))) {\n      return NaN;\n    }\n\n    vec4 encValue = floor(sampleValue * 255.0 + 0.5);\n    float decodedValue = dot(encValue, floatDeltas);\n    return dot(vec2(minValue, decodedValue), dotRange);\n  }\n";
            var UNSIGNED_BYTE_TEXTURE_SETOUTPUT_SNIPPET = "\n  const vec4 floatPowers = vec4(\n    1.0,\n    255.0,\n    255.0 * 255.0,\n    255.0 * 255.0 * 255.0\n  );\n  const vec2 recipRange = vec2(1.0/range);\n  const vec2 recipRange255 = vec2(1.0/(maxValue - minValue));\n\n  void setOutput(float decodedValue) {\n    if (isNaN(decodedValue)) {\n      gl_FragColor = vec4(" + tex_util.BYTE_NAN_VALUE + ");\n      return;\n    }\n\n    float a = dot(vec2(decodedValue, -minValue), recipRange);\n    float b = fract(a) * 255.0;\n    float c = fract(b) * 255.0;\n    float d = fract(c) * 255.0;\n    gl_FragColor = floor(vec4(a, b, c, d)) / 255.0;\n\n    // TODO(dsmilkov): Version above gets better accuracy but probably slower\n    // than the version below. Benchmark to determine if the accuracy is worth\n    // the cost.\n\n    // float normValue = dot(vec2(decodedValue, -minValue), recipRange255);\n    // vec4 f = normValue * floatPowers;\n    // gl_FragColor = floor(fract(f) * 255.0) / 255.0;\n  }\n";
            var FLOAT_TEXTURE_SAMPLE_SNIPPET = "\n  float sample(sampler2D texture, vec2 uv) {\n    return texture2D(texture, uv).r;\n  }\n";
            var FLOAT_TEXTURE_SETOUTPUT_SNIPPET = "\n  void setOutput(float val) {\n    gl_FragColor = vec4(val, 0, 0, 0);\n  }\n";
            var SHADER_PREFIX = "\n  precision highp float;\n  precision highp int;\n  varying vec2 resultUV;\n  const vec2 halfCR = vec2(0.5, 0.5);\n\n  bool isNaN(float val) {\n    float v1 = val * val;\n    float v2 = val * val;\n    return v1 == v2 ? false : true;\n  }\n\n  bool hasNaN(vec4 values) {\n    vec4 v1 = values * values;\n    vec4 v2 = values * values;\n    return any(notEqual(v1, v2));\n  }\n\n  float getNaN(vec4 values) {\n    return dot(vec4(1), values);\n  }\n\n  int round(float value) {\n    return int(floor(value + 0.5));\n  }\n\n  int imod(int x, int y) {\n    return x - y * (x / y);\n  }\n\n  const vec2 randomConst = vec2(\n    23.14069263277926, // e^pi (Gelfond's constant)\n     2.665144142690225 // 2^sqrt(2) (Gelfond\u2013Schneider constant)\n  );\n\n  float random(float seed) {\n      return fract(cos(dot(resultUV * seed, randomConst)) * 12345.6789);\n  }\n\n  " + SAMPLE_1D_SNIPPET + "\n  " + SAMPLE_2D_SNIPPET + "\n  " + SAMPLE_3D_SNIPPET + "\n  " + SAMPLE_4D_SNIPPET + "\n";

            function getOutputScalarCoords() {
                return "\n    int getOutputCoords() {\n      return 0;\n    }\n  ";
            }

            function getOutput1DCoords(shape, texShape) {
                if (texShape[0] === 1) {
                    return "\n      int getOutputCoords() {\n        return int(resultUV.x * " + texShape[1] + ".0);\n      }\n    ";
                }
                if (texShape[1] === 1) {
                    return "\n      int getOutputCoords() {\n        return int(resultUV.y * " + texShape[0] + ".0);\n      }\n    ";
                }
                return "\n    int getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + texShape[0] + ", " + texShape[1] + "));\n      return resTexRC.x * " + texShape[1] + " + resTexRC.y;\n    }\n  ";
            }

            function getOutput3DCoords(shape, texShape) {
                var stride0 = shape[1] * shape[2];
                var stride1 = shape[2];
                return "\n    ivec3 getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n      int r = index / " + stride0 + ";\n      index -= r * " + stride0 + ";\n      int c = index / " + stride1 + ";\n      int d = index - c * " + stride1 + ";\n      return ivec3(r, c, d);\n    }\n  ";
            }

            function getOutput4DCoords(shape, texShape) {
                var stride2 = shape[3];
                var stride1 = shape[2] * stride2;
                var stride0 = shape[1] * stride1;
                return "\n    ivec4 getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n        vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n\n      int r = index / " + stride0 + ";\n      index -= r * " + stride0 + ";\n\n      int c = index / " + stride1 + ";\n      index -= c * " + stride1 + ";\n\n      int d = index / " + stride2 + ";\n      int d2 = index - d * " + stride2 + ";\n\n      return ivec4(r, c, d, d2);\n    }\n  ";
            }

            function getOutput2DCoords(shape, texShape) {
                if (util.arraysEqual(shape, texShape)) {
                    return "\n      ivec2 getOutputCoords() {\n        return ivec2(resultUV.yx * vec2(" + texShape[0] + ", " + texShape[1] + "));\n      }\n    ";
                }
                if (shape[1] === 1) {
                    return "\n      ivec2 getOutputCoords() {\n        ivec2 resTexRC = ivec2(resultUV.yx *\n                               vec2(" + texShape[0] + ", " + texShape[1] + "));\n        int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n        return ivec2(index, 0);\n      }\n    ";
                }
                if (shape[0] === 1) {
                    return "\n      ivec2 getOutputCoords() {\n        ivec2 resTexRC = ivec2(resultUV.yx *\n                               vec2(" + texShape[0] + ", " + texShape[1] + "));\n        int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n        return ivec2(0, index);\n      }\n    ";
                }
                return "\n    ivec2 getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n      int r = index / " + shape[1] + ";\n      int c = index - r * " + shape[1] + ";\n      return ivec2(r, c);\n    }\n  ";
            }

            function getSamplerScalar(inputInfo) {
                var texName = inputInfo.name;
                var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
                return "\n    float " + funcName + "() {\n      return sample(" + texName + ", halfCR);\n    }\n  ";
            }

            function getSampler1D(inputInfo) {
                var texName = inputInfo.name;
                var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
                return "\n    float " + funcName + "(int index) {\n      return " + funcName + "Flat(index);\n    }\n  ";
            }

            function getSampler2D(inputInfo) {
                var shape = inputInfo.shapeInfo.logicalShape;
                var texShape = inputInfo.shapeInfo.texShape;
                var texName = inputInfo.name;
                var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
                var texNumR = texShape[0];
                var texNumC = texShape[1];
                if (util.arraysEqual(shape, texShape)) {
                    return "\n    float " + funcName + "(int row, int col) {\n      vec2 uv = (vec2(col, row) + halfCR) / vec2(" + texNumC + ".0, " + texNumR + ".0);\n      return sample(" + texName + ", uv);\n    }\n  ";
                }
                var _a = util.squeezeShape(shape),
                    newShape = _a.newShape,
                    keptDims = _a.keptDims;
                var squeezedShape = newShape;
                if (squeezedShape.length < shape.length) {
                    var newInputInfo = squeezeInputInfo(inputInfo, squeezedShape);
                    var params = ['row', 'col'];
                    return "\n      " + getSamplerFromInInfo(newInputInfo) + "\n      float " + funcName + "(int row, int col) {\n        return " + funcName + "(" + getSqueezedParams(params, keptDims) + ");\n      }\n    ";
                }
                if (texNumC === 1) {
                    return "\n    float " + funcName + "(int row, int col) {\n      int index = row * " + shape[1] + " + col;\n      vec2 uv = vec2(0.5, (float(index) + 0.5) / " + texNumR + ".0);\n      return sample(" + texName + ", uv);\n    }\n  ";
                }
                if (texNumR === 1) {
                    return "\n    float " + funcName + "(int row, int col) {\n      int index = row * " + shape[1] + " + col;\n      vec2 uv = vec2((float(index) + 0.5) / " + texNumC + ".0, 0.5);\n      return sample(" + texName + ", uv);\n    }\n  ";
                }
                return "\n  float " + funcName + "(int row, int col) {\n    vec2 uv = UVfrom2D(" + texNumR + ", " + texNumC + ", " + shape[1] + ", row, col);\n    return sample(" + texName + ", uv);\n  }\n";
            }

            function getSampler3D(inputInfo) {
                var texShape = inputInfo.shapeInfo.texShape;
                var shape = inputInfo.shapeInfo.logicalShape;
                var texName = inputInfo.name;
                var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
                var texNumR = texShape[0];
                var texNumC = texShape[1];
                var stride0 = shape[1] * shape[2];
                var stride1 = shape[2];
                var _a = util.squeezeShape(shape),
                    newShape = _a.newShape,
                    keptDims = _a.keptDims;
                var squeezedShape = newShape;
                if (squeezedShape.length < shape.length) {
                    var newInputInfo = squeezeInputInfo(inputInfo, squeezedShape);
                    var params = ['row', 'col', 'depth'];
                    return "\n        " + getSamplerFromInInfo(newInputInfo) + "\n        float " + funcName + "(int row, int col, int depth) {\n          return " + funcName + "(" + getSqueezedParams(params, keptDims) + ");\n        }\n      ";
                }
                if (texNumC === stride0) {
                    return "\n        float " + funcName + "(int row, int col, int depth) {\n          int texR = row;\n          int texC = col * " + stride1 + " + depth;\n          vec2 uv = (vec2(texC, texR) + halfCR) /\n                     vec2(" + texNumC + ".0, " + texNumR + ".0);\n          return sample(" + texName + ", uv);\n        }\n      ";
                }
                if (texNumC === stride1) {
                    return "\n    float " + funcName + "(int row, int col, int depth) {\n      int texR = row * " + shape[1] + " + col;\n      int texC = depth;\n      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(" + texNumC + ".0, " + texNumR + ".0);\n      return sample(" + texName + ", uv);\n    }\n  ";
                }
                return "\n      float " + funcName + "(int row, int col, int depth) {\n        vec2 uv = UVfrom3D(\n            " + texNumR + ", " + texNumC + ", " + stride0 + ", " + stride1 + ", row, col, depth);\n        return sample(" + texName + ", uv);\n      }\n  ";
            }

            function getSampler4D(inputInfo) {
                var shape = inputInfo.shapeInfo.logicalShape;
                var texShape = inputInfo.shapeInfo.texShape;
                var texName = inputInfo.name;
                var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
                var texNumR = texShape[0];
                var texNumC = texShape[1];
                var stride2 = shape[3];
                var stride1 = shape[2] * stride2;
                var stride0 = shape[1] * stride1;
                var _a = util.squeezeShape(shape),
                    newShape = _a.newShape,
                    keptDims = _a.keptDims;
                if (newShape.length < shape.length) {
                    var newInputInfo = squeezeInputInfo(inputInfo, newShape);
                    var params = ['row', 'col', 'depth', 'depth2'];
                    return "\n      " + getSamplerFromInInfo(newInputInfo) + "\n      float " + funcName + "(int row, int col, int depth, int depth2) {\n        return " + funcName + "(" + getSqueezedParams(params, keptDims) + ");\n      }\n    ";
                }
                if (texNumC === stride0) {
                    return "\n      float " + funcName + "(int row, int col, int depth, int depth2) {\n        int texR = row;\n        int texC = col * " + stride1 + " + depth * " + stride2 + " + depth2;\n        vec2 uv = (vec2(texC, texR) + halfCR) /\n                   vec2(" + texNumC + ".0, " + texNumR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
                }
                if (texNumC === stride2) {
                    return "\n      float " + funcName + "(int row, int col, int depth, int depth2) {\n        int texR = row * " + shape[1] * shape[2] + " + col * " + shape[2] + " + depth;\n        int texC = depth2;\n        vec2 uv = (vec2(texC, texR) + halfCR) /\n                  vec2(" + texNumC + ".0, " + texNumR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
                }
                return "\n    float " + funcName + "(int row, int col, int depth, int depth2) {\n      vec2 uv = UVfrom4D(" + texNumR + ", " + texNumC + ", " + stride0 + ", " + stride1 + ",\n          " + stride2 + ", row, col, depth, depth2);\n      return sample(" + texName + ", uv);\n    }\n  ";
            }

            function getSamplerFlat(inputInfo) {
                var texName = inputInfo.name;
                var texShape = inputInfo.shapeInfo.texShape;
                var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1) + 'Flat';
                var tNumR = texShape[0];
                var tNumC = texShape[1];
                if (tNumC === 1 && tNumR === 1) {
                    return "\n      float " + funcName + "(int index) {\n        return sample(" + texName + ", halfCR);\n      }\n    ";
                }
                if (tNumC === 1) {
                    return "\n      float " + funcName + "(int index) {\n        vec2 uv = vec2(0.5, (float(index) + 0.5) / " + tNumR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
                }
                if (tNumR === 1) {
                    return "\n      float " + funcName + "(int index) {\n        vec2 uv = vec2((float(index) + 0.5) / " + tNumC + ".0, 0.5);\n        return sample(" + texName + ", uv);\n      }\n    ";
                }
                return "\n    float " + funcName + "(int index) {\n      vec2 uv = UVfrom1D(" + tNumR + ", " + tNumC + ", index);\n      return sample(" + texName + ", uv);\n    }\n  ";
            }

            function getBroadcastOutputCoordsSampler(inputInfo, outShapeInfo, texFuncSnippet, funcName) {
                var inRank = inputInfo.shapeInfo.logicalShape.length;
                var outRank = outShapeInfo.logicalShape.length;
                var type = 'int';
                if (outRank === 2) {
                    type = 'ivec2';
                } else if (outRank === 3) {
                    type = 'ivec3';
                } else if (outRank === 4) {
                    type = 'ivec4';
                }
                var broadcastDims = broadcast_util.getBroadcastDims(inputInfo.shapeInfo.logicalShape, outShapeInfo.logicalShape);
                var rankDiff = outRank - inRank;
                var coordsSnippet;
                if (inRank === 0) {
                    coordsSnippet = '';
                } else if (outRank < 2 && broadcastDims.length >= 1) {
                    coordsSnippet = 'coords = 0;';
                } else {
                    coordsSnippet =
                        broadcastDims.map(function (d) {
                            return "coords[" + (d + rankDiff) + "] = 0;";
                        }).join('\n');
                }
                var unpackedCoordsSnippet = '';
                if (outRank < 2 && inRank > 0) {
                    unpackedCoordsSnippet = 'coords';
                } else {
                    unpackedCoordsSnippet = inputInfo.shapeInfo.logicalShape
                        .map(function (s, i) {
                            return "coords[" + (i + rankDiff) + "]";
                        })
                        .join(', ');
                }
                return "\n    float " + funcName + "() {\n      " + type + " coords = getOutputCoords();\n      " + coordsSnippet + "\n      return get" + texFuncSnippet + "(" + unpackedCoordsSnippet + ");\n    }\n  ";
            }

            function getSamplerAtOutputCoords(inputInfo, outShapeInfo, supportsBroadcasting) {
                var inTexShape = inputInfo.shapeInfo.texShape;
                var texName = inputInfo.name;
                var texFuncSnippet = texName.charAt(0).toUpperCase() + texName.slice(1);
                var funcName = 'get' + texFuncSnippet + 'AtOutCoords';
                var broadcastDims = broadcast_util.getBroadcastDims(inputInfo.shapeInfo.logicalShape, outShapeInfo.logicalShape);
                var inRank = inputInfo.shapeInfo.logicalShape.length;
                var outRank = outShapeInfo.logicalShape.length;
                var doBroadcast = supportsBroadcasting && ((outRank > inRank) || broadcastDims.length > 0);
                var broadcastOverOuter = broadcast_util.broadcastDimsAreOuter(broadcastDims);
                if (doBroadcast && !broadcastOverOuter) {
                    return getBroadcastOutputCoordsSampler(inputInfo, outShapeInfo, texFuncSnippet, funcName);
                }
                var outTexShape = outShapeInfo.texShape;
                if (util.arraysEqual(inTexShape, outTexShape)) {
                    return "\n      float " + funcName + "() {\n        return sample(" + texName + ", resultUV);\n      }\n    ";
                }
                var inSize = util.sizeFromShape(inTexShape);
                var broadcastSnippet = '';
                if (doBroadcast && broadcastOverOuter) {
                    broadcastSnippet = "\n        int mainPart = index / " + inSize + ";\n        index -= mainPart * " + inSize + ";\n      ";
                }
                return "\n    float " + funcName + "() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + outTexShape[0] + ", " + outTexShape[1] + "));\n      int index = resTexRC.x * " + outTexShape[1] + " + resTexRC.y;\n      " + broadcastSnippet + "\n      int texR = index / " + inTexShape[1] + ";\n      int texC = index - texR * " + inTexShape[1] + ";\n      vec2 uv = (vec2(texC, texR) + halfCR) /\n                 vec2(" + inTexShape[1] + ".0, " + inTexShape[0] + ".0);\n\n      return sample(" + texName + ", uv);\n    }\n  ";
            }

            function getCoordsDataType(rank) {
                if (rank <= 1) {
                    return 'int';
                } else if (rank === 2) {
                    return 'ivec2';
                } else if (rank === 3) {
                    return 'ivec3';
                } else if (rank === 4) {
                    return 'ivec4';
                } else {
                    throw Error("GPU for rank " + rank + " is not yet supported");
                }
            }
            exports.getCoordsDataType = getCoordsDataType;

            function squeezeInputInfo(inInfo, squeezedShape) {
                var newInputInfo = JSON.parse(JSON.stringify(inInfo));
                newInputInfo.shapeInfo.logicalShape = squeezedShape;
                return newInputInfo;
            }

            function getSqueezedParams(params, keptDims) {
                return keptDims.map(function (d) {
                    return params[d];
                }).join(', ');
            }

        }, {
            "../../environment": 34,
            "../../ops/broadcast_util": 108,
            "../../util": 150,
            "./tex_util": 97
        }],
        96: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var shader_compiler_1 = require("./shader_compiler");
            var SliceProgram = (function () {
                function SliceProgram(destSize) {
                    this.variableNames = ['source'];
                    this.outputShape = destSize;
                    this.rank = destSize.length;
                    var dtype = shader_compiler_1.getCoordsDataType(this.rank);
                    var sourceCoords = getCoords(this.rank);
                    this.userCode = "\n      uniform " + dtype + " start;\n\n      void main() {\n        " + dtype + " sourceLoc = start + getOutputCoords();\n        setOutput(getSource(" + sourceCoords + "));\n      }\n    ";
                }
                SliceProgram.prototype.getCustomSetupFunc = function (start) {
                    var _this = this;
                    if (start.length !== this.rank) {
                        throw Error("The rank (" + this.rank + ") of the program must match the " +
                            ("length of start (" + start.length + ")"));
                    }
                    return function (gpgpu, webGLProgram) {
                        if (_this.startLoc == null) {
                            _this.startLoc = gpgpu.getUniformLocationNoThrow(webGLProgram, 'start');
                            if (_this.startLoc == null) {
                                return;
                            }
                        }
                        if (_this.rank === 1) {
                            gpgpu.gl.uniform1i(_this.startLoc, start[0]);
                        } else if (_this.rank === 2) {
                            gpgpu.gl.uniform2i(_this.startLoc, start[0], start[1]);
                        } else if (_this.rank === 3) {
                            gpgpu.gl.uniform3i(_this.startLoc, start[0], start[1], start[2]);
                        } else if (_this.rank === 4) {
                            gpgpu.gl.uniform4i(_this.startLoc, start[0], start[1], start[2], start[3]);
                        } else {
                            throw Error("Slicing for rank " + _this.rank + " is not yet supported");
                        }
                    };
                };
                return SliceProgram;
            }());
            exports.SliceProgram = SliceProgram;

            function getCoords(rank) {
                if (rank === 1) {
                    return 'sourceLoc';
                } else if (rank === 2) {
                    return 'sourceLoc.x, sourceLoc.y';
                } else if (rank === 3) {
                    return 'sourceLoc.x, sourceLoc.y, sourceLoc.z';
                } else if (rank === 4) {
                    return 'sourceLoc.x, sourceLoc.y, sourceLoc.z, sourceLoc.w';
                } else {
                    throw Error("Slicing for rank " + rank + " is not yet supported");
                }
            }

        }, {
            "./shader_compiler": 95
        }],
        97: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var TextureType;
            (function (TextureType) {
                TextureType[TextureType["FLOAT"] = 0] = "FLOAT";
                TextureType[TextureType["UNSIGNED_BYTE"] = 1] = "UNSIGNED_BYTE";
            })(TextureType = exports.TextureType || (exports.TextureType = {}));

            function getUnpackedMatrixTextureShapeWidthHeight(rows, columns) {
                return [columns, rows];
            }
            exports.getUnpackedMatrixTextureShapeWidthHeight = getUnpackedMatrixTextureShapeWidthHeight;

            function getUnpackedArraySizeFromMatrixSize(matrixSize, channelsPerTexture) {
                return matrixSize * channelsPerTexture;
            }
            exports.getUnpackedArraySizeFromMatrixSize = getUnpackedArraySizeFromMatrixSize;

            function getColorMatrixTextureShapeWidthHeight(rows, columns) {
                return [columns * 4, rows];
            }
            exports.getColorMatrixTextureShapeWidthHeight = getColorMatrixTextureShapeWidthHeight;

            function getMatrixSizeFromUnpackedArraySize(unpackedSize, channelsPerTexture) {
                if (unpackedSize % channelsPerTexture !== 0) {
                    throw new Error("unpackedSize (" + unpackedSize + ") must be a multiple of " +
                        ("" + channelsPerTexture));
                }
                return unpackedSize / channelsPerTexture;
            }
            exports.getMatrixSizeFromUnpackedArraySize = getMatrixSizeFromUnpackedArraySize;

            function encodeMatrixToUnpackedArray(matrix, unpackedArray, channelsPerTexture) {
                var requiredSize = getUnpackedArraySizeFromMatrixSize(matrix.length, channelsPerTexture);
                if (unpackedArray.length < requiredSize) {
                    throw new Error("unpackedArray length (" + unpackedArray.length + ") must be >= " +
                        ("" + requiredSize));
                }
                var dst = 0;
                for (var src = 0; src < matrix.length; ++src) {
                    unpackedArray[dst] = matrix[src];
                    dst += channelsPerTexture;
                }
            }
            exports.encodeMatrixToUnpackedArray = encodeMatrixToUnpackedArray;
            exports.FLOAT_MAX = 20000;
            exports.FLOAT_MIN = -exports.FLOAT_MAX;
            var FLOAT_RANGE = (exports.FLOAT_MAX - exports.FLOAT_MIN) / 255;
            var FLOAT_DELTAS = [1, 1 / 255, 1 / (255 * 255), 1 / (255 * 255 * 255)];
            var FLOAT_POWERS = [1, 255, 255 * 255];
            exports.BYTE_NAN_VALUE = 0;

            function encodeFloatArray(floatArray) {
                var uintArray = new Uint8Array(floatArray.length * 4);
                var _loop_1 = function (i) {
                    var value = floatArray[i / 4];
                    if (isNaN(value)) {
                        uintArray[i] = exports.BYTE_NAN_VALUE;
                        uintArray[i + 1] = exports.BYTE_NAN_VALUE;
                        uintArray[i + 2] = exports.BYTE_NAN_VALUE;
                        uintArray[i + 3] = exports.BYTE_NAN_VALUE;
                        return "continue";
                    }
                    var normalizedValue = (value - exports.FLOAT_MIN) / FLOAT_RANGE;
                    var enc = FLOAT_POWERS.map(function (pow) {
                        return pow * normalizedValue;
                    });
                    var buckets = enc.map(function (value) {
                        return Math.floor((value % 1) * 255);
                    });
                    uintArray[i] = Math.floor(normalizedValue);
                    uintArray[i + 1] = buckets[0];
                    uintArray[i + 2] = buckets[1];
                    uintArray[i + 3] = buckets[2];
                };
                for (var i = 0; i < uintArray.length; i += 4) {
                    _loop_1(i);
                }
                return uintArray;
            }
            exports.encodeFloatArray = encodeFloatArray;

            function decodeToFloatArray(uintArray) {
                var floatArray = new Float32Array(uintArray.length / 4);
                var _loop_2 = function (i) {
                    if (uintArray[i] === exports.BYTE_NAN_VALUE &&
                        uintArray[i + 1] === exports.BYTE_NAN_VALUE &&
                        uintArray[i + 2] === exports.BYTE_NAN_VALUE &&
                        uintArray[i + 3] === exports.BYTE_NAN_VALUE) {
                        floatArray[i / 4] = NaN;
                        return "continue";
                    }
                    var dot = 0;
                    FLOAT_DELTAS.forEach(function (delta, j) {
                        dot += delta * uintArray[i + j];
                    });
                    var value = dot * FLOAT_RANGE + exports.FLOAT_MIN;
                    floatArray[i / 4] = value;
                };
                for (var i = 0; i < uintArray.length; i += 4) {
                    _loop_2(i);
                }
                return floatArray;
            }
            exports.decodeToFloatArray = decodeToFloatArray;

            function decodeMatrixFromUnpackedArray(unpackedArray, matrix, channelsPerTexture) {
                var requiredSize = getMatrixSizeFromUnpackedArraySize(unpackedArray.length, channelsPerTexture);
                if (matrix.length < requiredSize) {
                    throw new Error("matrix length (" + matrix.length + ") must be >= " + requiredSize);
                }
                var dst = 0;
                for (var src = 0; src < unpackedArray.length; src += channelsPerTexture) {
                    matrix[dst++] = unpackedArray[src];
                }
            }
            exports.decodeMatrixFromUnpackedArray = decodeMatrixFromUnpackedArray;

            function decodeMatrixFromUnpackedColorRGBAArray(unpackedArray, matrix, channels) {
                var requiredSize = unpackedArray.length * channels / 4;
                if (matrix.length < requiredSize) {
                    throw new Error("matrix length (" + matrix.length + ") must be >= " + requiredSize);
                }
                var dst = 0;
                for (var src = 0; src < unpackedArray.length; src += 4) {
                    for (var c = 0; c < channels; c++) {
                        matrix[dst++] = unpackedArray[src + c];
                    }
                }
            }
            exports.decodeMatrixFromUnpackedColorRGBAArray = decodeMatrixFromUnpackedColorRGBAArray;

            function getPackedMatrixTextureShapeWidthHeight(rows, columns) {
                return [Math.ceil(columns / 2), Math.ceil(rows / 2)];
            }
            exports.getPackedMatrixTextureShapeWidthHeight = getPackedMatrixTextureShapeWidthHeight;

            function getPackedRGBAArraySizeFromMatrixShape(rows, columns) {
                var _a = getPackedMatrixTextureShapeWidthHeight(rows, columns),
                    w = _a[0],
                    h = _a[1];
                return w * h * 4;
            }
            exports.getPackedRGBAArraySizeFromMatrixShape = getPackedRGBAArraySizeFromMatrixShape;

            function encodeMatrixToPackedRGBA(matrix, rows, columns, packedRGBA) {
                var requiredSize = getPackedRGBAArraySizeFromMatrixShape(rows, columns);
                if (packedRGBA.length < requiredSize) {
                    throw new Error("packedRGBA length (" + packedRGBA.length + ") must be >= " + requiredSize);
                }
                var _a = getPackedMatrixTextureShapeWidthHeight(rows, columns),
                    textureWidth = _a[0],
                    textureHeight = _a[1];
                var oddWidth = (columns % 2) === 1;
                var oddHeight = (rows % 2) === 1;
                var widthInFullBlocks = Math.floor(columns / 2);
                var heightInFullBlocks = Math.floor(rows / 2); {
                    var dstStride = (oddWidth ? 4 : 0);
                    var oneRow = columns;
                    var dst = 0;
                    for (var blockY = 0; blockY < heightInFullBlocks; ++blockY) {
                        var matrixSrcRow = (blockY * 2 * columns);
                        for (var blockX = 0; blockX < widthInFullBlocks; ++blockX) {
                            var matrixSrcCol = blockX * 2;
                            var src = matrixSrcRow + matrixSrcCol;
                            packedRGBA[dst] = matrix[src];
                            packedRGBA[dst + 1] = matrix[src + 1];
                            packedRGBA[dst + 2] = matrix[src + oneRow];
                            packedRGBA[dst + 3] = matrix[src + oneRow + 1];
                            dst += 4;
                        }
                        dst += dstStride;
                    }
                }
                if (oddWidth) {
                    var src = columns - 1;
                    var dst = (textureWidth - 1) * 4;
                    var srcStride = 2 * columns;
                    var dstStride = textureWidth * 4;
                    for (var blockY = 0; blockY < heightInFullBlocks; ++blockY) {
                        packedRGBA[dst] = matrix[src];
                        packedRGBA[dst + 2] = matrix[src + columns];
                        src += srcStride;
                        dst += dstStride;
                    }
                }
                if (oddHeight) {
                    var src = (rows - 1) * columns;
                    var dst = (textureHeight - 1) * textureWidth * 4;
                    for (var blockX = 0; blockX < widthInFullBlocks; ++blockX) {
                        packedRGBA[dst++] = matrix[src++];
                        packedRGBA[dst++] = matrix[src++];
                        dst += 2;
                    }
                }
                if (oddWidth && oddHeight) {
                    packedRGBA[packedRGBA.length - 4] = matrix[matrix.length - 1];
                }
                return packedRGBA;
            }
            exports.encodeMatrixToPackedRGBA = encodeMatrixToPackedRGBA;

            function decodeMatrixFromPackedRGBA(packedRGBA, rows, columns, matrix) {
                var requiredSize = rows * columns;
                if (requiredSize < matrix.length) {
                    throw new Error("matrix length (" + matrix.length + ") must be >= " + requiredSize);
                }
                var oddWidth = (columns % 2) === 1;
                var oddHeight = (rows % 2) === 1;
                var widthInFullBlocks = Math.floor(columns / 2);
                var heightInFullBlocks = Math.floor(rows / 2);
                var _a = getPackedMatrixTextureShapeWidthHeight(rows, columns),
                    textureWidth = _a[0],
                    textureHeight = _a[1]; {
                    var srcStride = oddWidth ? 4 : 0;
                    var dstStride = columns + (oddWidth ? 1 : 0);
                    var src = 0;
                    var dstRow1 = 0;
                    var dstRow2 = columns;
                    for (var blockY = 0; blockY < heightInFullBlocks; ++blockY) {
                        for (var blockX = 0; blockX < widthInFullBlocks; ++blockX) {
                            matrix[dstRow1++] = packedRGBA[src++];
                            matrix[dstRow1++] = packedRGBA[src++];
                            matrix[dstRow2++] = packedRGBA[src++];
                            matrix[dstRow2++] = packedRGBA[src++];
                        }
                        src += srcStride;
                        dstRow1 += dstStride;
                        dstRow2 += dstStride;
                    }
                }
                if (oddWidth) {
                    var src = (textureWidth - 1) * 4;
                    var dst = columns - 1;
                    var srcStride = textureWidth * 4;
                    var dstStride = 2 * columns;
                    for (var blockY = 0; blockY < heightInFullBlocks; ++blockY) {
                        matrix[dst] = packedRGBA[src];
                        matrix[dst + columns] = packedRGBA[src + 2];
                        src += srcStride;
                        dst += dstStride;
                    }
                }
                if (oddHeight) {
                    var src = (textureHeight - 1) * textureWidth * 4;
                    var dst = (rows - 1) * columns;
                    for (var blockX = 0; blockX < widthInFullBlocks; ++blockX) {
                        matrix[dst++] = packedRGBA[src++];
                        matrix[dst++] = packedRGBA[src++];
                        src += 2;
                    }
                }
                if (oddWidth && oddHeight) {
                    matrix[matrix.length - 1] = packedRGBA[packedRGBA.length - 4];
                }
                return matrix;
            }
            exports.decodeMatrixFromPackedRGBA = decodeMatrixFromPackedRGBA;

        }, {}],
        98: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var tex_util_1 = require("./tex_util");
            var TextureManager = (function () {
                function TextureManager(gpgpu) {
                    this.gpgpu = gpgpu;
                    this.numUsedTextures = 0;
                    this.numFreeTextures = 0;
                    this.freeTextures = {};
                    this.logEnabled = false;
                    this.allocatedTextures = [];
                    this.usedTextureCount = {};
                }
                TextureManager.prototype.acquireTexture = function (shapeRC, texType) {
                    if (texType === void 0) {
                        texType = tex_util_1.TextureType.FLOAT;
                    }
                    var shapeKey = getKeyFromTextureShape(shapeRC, texType);
                    if (!(shapeKey in this.freeTextures)) {
                        this.freeTextures[shapeKey] = [];
                    }
                    if (!(shapeKey in this.usedTextureCount)) {
                        this.usedTextureCount[shapeKey] = 0;
                    }
                    this.usedTextureCount[shapeKey]++;
                    if (this.freeTextures[shapeKey].length > 0) {
                        this.numFreeTextures--;
                        this.numUsedTextures++;
                        this.log();
                        return this.freeTextures[shapeKey].shift();
                    }
                    this.numUsedTextures++;
                    this.log();
                    var newTexture = this.gpgpu.createMatrixTexture(shapeRC[0], shapeRC[1]);
                    this.allocatedTextures.push(newTexture);
                    return newTexture;
                };
                TextureManager.prototype.releaseTexture = function (texture, shape, texType) {
                    if (texType === void 0) {
                        texType = tex_util_1.TextureType.FLOAT;
                    }
                    var shapeKey = getKeyFromTextureShape(shape, texType);
                    if (!(shapeKey in this.freeTextures)) {
                        this.freeTextures[shapeKey] = [];
                    }
                    this.freeTextures[shapeKey].push(texture);
                    this.numFreeTextures++;
                    this.numUsedTextures--;
                    this.usedTextureCount[shapeKey]--;
                    this.log();
                };
                TextureManager.prototype.log = function () {
                    if (!this.logEnabled) {
                        return;
                    }
                    var total = this.numFreeTextures + this.numUsedTextures;
                    console.log('Free/Used', this.numFreeTextures + " / " + this.numUsedTextures, "(" + total + ")");
                };
                TextureManager.prototype.getNumUsedTextures = function () {
                    return this.numUsedTextures;
                };
                TextureManager.prototype.getNumFreeTextures = function () {
                    return this.numFreeTextures;
                };
                TextureManager.prototype.dispose = function () {
                    var _this = this;
                    if (this.allocatedTextures == null) {
                        return;
                    }
                    this.allocatedTextures.forEach(function (texture) {
                        _this.gpgpu.deleteMatrixTexture(texture);
                    });
                    this.freeTextures = null;
                    this.allocatedTextures = null;
                    this.usedTextureCount = null;
                    this.numUsedTextures = 0;
                    this.numFreeTextures = 0;
                };
                return TextureManager;
            }());
            exports.TextureManager = TextureManager;

            function getKeyFromTextureShape(shapeRowsCol, texType) {
                return shapeRowsCol[0] + "_" + shapeRowsCol[1] + "_" + texType;
            }

        }, {
            "./tex_util": 97
        }],
        99: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var shader_compiler_1 = require("./shader_compiler");
            var TileProgram = (function () {
                function TileProgram(aShape, reps) {
                    this.variableNames = ['A'];
                    var outputShape = new Array(aShape.length);
                    for (var i = 0; i < outputShape.length; i++) {
                        outputShape[i] = aShape[i] * reps[i];
                    }
                    this.outputShape = outputShape;
                    this.rank = outputShape.length;
                    var dtype = shader_compiler_1.getCoordsDataType(this.rank);
                    var sourceCoords = getSourceCoords(aShape);
                    this.userCode = "\n      void main() {\n        " + dtype + " resRC = getOutputCoords();\n        setOutput(getA(" + sourceCoords + "));\n      }\n    ";
                }
                return TileProgram;
            }());
            exports.TileProgram = TileProgram;

            function getSourceCoords(aShape) {
                var rank = aShape.length;
                if (rank > 4) {
                    throw Error("Tile for rank " + rank + " is not yet supported");
                }
                if (rank === 1) {
                    return "imod(resRC, " + aShape[0] + ")";
                }
                var currentCoords = ['resRC.x', 'resRC.y', 'resRC.z', 'resRC.w'];
                var sourceCoords = [];
                for (var i = 0; i < aShape.length; i++) {
                    sourceCoords.push("imod(" + currentCoords[i] + ", " + aShape[i] + ")");
                }
                return sourceCoords.join();
            }

        }, {
            "./shader_compiler": 95
        }],
        100: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var shader_compiler_1 = require("./shader_compiler");
            var TransposeProgram = (function () {
                function TransposeProgram(aShape, newDim) {
                    this.variableNames = ['A'];
                    var outputShape = new Array(aShape.length);
                    for (var i = 0; i < outputShape.length; i++) {
                        outputShape[i] = aShape[newDim[i]];
                    }
                    this.outputShape = outputShape;
                    this.rank = outputShape.length;
                    var dtype = shader_compiler_1.getCoordsDataType(this.rank);
                    var switched = getSwitchedCoords(newDim);
                    this.userCode = "\n    void main() {\n      " + dtype + " resRC = getOutputCoords();\n      setOutput(getA(" + switched + "));\n    }\n    ";
                }
                return TransposeProgram;
            }());
            exports.TransposeProgram = TransposeProgram;

            function getSwitchedCoords(newDim) {
                var rank = newDim.length;
                if (rank > 4) {
                    throw Error("Transpose for rank " + rank + " is not yet supported");
                }
                var originalOrder = ['resRC.x', 'resRC.y', 'resRC.z', 'resRC.w'];
                var switchedCoords = new Array(rank);
                for (var i = 0; i < newDim.length; i++) {
                    switchedCoords[newDim[i]] = originalOrder[i];
                }
                return switchedCoords.join();
            }

        }, {
            "./shader_compiler": 95
        }],
        101: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var selu_util = require("../../ops/selu_util");
            var UnaryOpProgram = (function () {
                function UnaryOpProgram(aShape, opSnippet) {
                    this.variableNames = ['A'];
                    this.outputShape = aShape;
                    this.userCode = "\n      float unaryOperation(float x) {\n        " + opSnippet + "\n      }\n\n      void main() {\n        float x = getAAtOutCoords();\n        float y = unaryOperation(x);\n\n        setOutput(y);\n      }\n    ";
                }
                return UnaryOpProgram;
            }());
            exports.UnaryOpProgram = UnaryOpProgram;
            var CHECK_NAN_SNIPPET = "\n  if (isNaN(x)) return x;\n";
            exports.ABS = "\n  return abs(x);\n";
            exports.RELU = CHECK_NAN_SNIPPET + "\n  return (x < 0.0) ? 0.0 : x;\n";
            exports.ELU = "\n  return (x >= 0.0) ? x : (exp(x) - 1.0);\n";
            exports.ELU_DER = "\n  return (x >= 0.0) ? 1.0 : exp(x);\n";
            exports.SELU = "\n  // Stable and Attracting Fixed Point (0, 1) for Normalized Weights.\n  // see: https://arxiv.org/abs/1706.02515\n  float scaleAlpha = " + selu_util.SELU_SCALEALPHA + ";\n  float scale = " + selu_util.SELU_SCALE + ";\n  return (x >= 0.0) ? scale * x : scaleAlpha * (exp(x) - 1.0);\n";

            function LEAKY_RELU(alpha) {
                return "\n    return (x >= 0.0) ? x : " + alpha + " * x;\n  ";
            }
            exports.LEAKY_RELU = LEAKY_RELU;

            function STEP(alpha) {
                if (alpha === void 0) {
                    alpha = 0.0;
                }
                return CHECK_NAN_SNIPPET + ("\n    return x > 0.0 ? 1.0 : float(" + alpha + ");\n  ");
            }
            exports.STEP = STEP;
            exports.NEG = "\n  return -x;\n";
            exports.CEIL = "\n  return ceil(x);\n";
            exports.FLOOR = "\n  return floor(x);\n";
            exports.EXP = "\n  return exp(x);\n";
            exports.LOG = "\n  return log(x);\n";
            exports.SQRT = CHECK_NAN_SNIPPET + "\n  return sqrt(x);\n";
            exports.SIGMOID = "\n  return 1.0 / (1.0 + exp(-1.0 * x));\n";
            exports.SIN = CHECK_NAN_SNIPPET + "\n  return sin(x);\n";
            exports.COS = CHECK_NAN_SNIPPET + "\n  return cos(x);\n";
            exports.TAN = "\n  return tan(x);\n";
            exports.ASIN = CHECK_NAN_SNIPPET + "\n  return asin(x);\n";
            exports.ACOS = CHECK_NAN_SNIPPET + "\n  return acos(x);\n";
            exports.ATAN = CHECK_NAN_SNIPPET + "\n  return atan(x);\n";
            exports.SINH = "\n  float e2x = exp(x);\n  return (e2x - 1.0 / e2x) / 2.0;\n";
            exports.COSH = "\n  float e2x = exp(-x);\n  return (e2x + 1.0 / e2x) / 2.0;\n";
            exports.TANH = "\n  float e2x = exp(-2.0 * abs(x));\n  return sign(x) * (1.0 - e2x) / (1.0 + e2x);\n";
            exports.SQUARE = "\n  return x * x;\n";
            exports.LOGICAL_NOT = CHECK_NAN_SNIPPET + "\n  return float(!(x >= 1.0));\n";
            exports.TO_INT = "\n  return float(int(x));\n";

        }, {
            "../../ops/selu_util": 127
        }],
        102: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var MAX_TEXTURE_SIZE = null;
            var util = require("../../util");
            var environment_1 = require("../../environment");

            function createWebGLRenderingContext(attributes) {
                var canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                return createWebGLRenderingContextFromCanvas(canvas, attributes);
            }
            exports.createWebGLRenderingContext = createWebGLRenderingContext;

            function createWebGLRenderingContextFromCanvas(canvas, attributes) {
                var gl;
                var webglVersion = environment_1.ENV.get('WEBGL_VERSION');
                if (webglVersion === 2) {
                    gl = canvas.getContext('webgl2', attributes);
                } else if (webglVersion === 1) {
                    gl = (canvas.getContext('webgl', attributes) ||
                        canvas.getContext('experimental-webgl', attributes));
                }
                if (webglVersion === 0 || gl == null) {
                    throw new Error('This browser does not support WebGL.');
                }
                return gl;
            }
            exports.createWebGLRenderingContextFromCanvas = createWebGLRenderingContextFromCanvas;

            function callAndCheck(gl, func) {
                var returnValue = func();
                checkWebGLError(gl);
                return returnValue;
            }
            exports.callAndCheck = callAndCheck;
            var webGLDebugErrorCheckingEnabled = false;

            function enableDebugWebGLErrorChecking(enabled) {
                webGLDebugErrorCheckingEnabled = enabled;
            }
            exports.enableDebugWebGLErrorChecking = enableDebugWebGLErrorChecking;

            function checkWebGLError(gl) {
                if (webGLDebugErrorCheckingEnabled) {
                    var error = gl.getError();
                    if (error !== gl.NO_ERROR) {
                        throw new Error('WebGL Error: ' + getWebGLErrorMessage(gl, error));
                    }
                }
            }
            exports.checkWebGLError = checkWebGLError;

            function getWebGLErrorMessage(gl, status) {
                switch (status) {
                    case gl.NO_ERROR:
                        return 'NO_ERROR';
                    case gl.INVALID_ENUM:
                        return 'INVALID_ENUM';
                    case gl.INVALID_VALUE:
                        return 'INVALID_VALUE';
                    case gl.INVALID_OPERATION:
                        return 'INVALID_OPERATION';
                    case gl.INVALID_FRAMEBUFFER_OPERATION:
                        return 'INVALID_FRAMEBUFFER_OPERATION';
                    case gl.OUT_OF_MEMORY:
                        return 'OUT_OF_MEMORY';
                    case gl.CONTEXT_LOST_WEBGL:
                        return 'CONTEXT_LOST_WEBGL';
                    default:
                        return "Unknown error code " + status;
                }
            }
            exports.getWebGLErrorMessage = getWebGLErrorMessage;

            function getExtensionOrThrow(gl, extensionName) {
                return throwIfNull(gl, function () {
                    return gl.getExtension(extensionName);
                }, 'Extension "' + extensionName + '" not supported on this browser.');
            }
            exports.getExtensionOrThrow = getExtensionOrThrow;

            function createVertexShader(gl, vertexShaderSource) {
                var vertexShader = throwIfNull(gl, function () {
                    return gl.createShader(gl.VERTEX_SHADER);
                }, 'Unable to create vertex WebGLShader.');
                callAndCheck(gl, function () {
                    return gl.shaderSource(vertexShader, vertexShaderSource);
                });
                callAndCheck(gl, function () {
                    return gl.compileShader(vertexShader);
                });
                if (gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) === false) {
                    console.log(gl.getShaderInfoLog(vertexShader));
                    throw new Error('Failed to compile vertex shader.');
                }
                return vertexShader;
            }
            exports.createVertexShader = createVertexShader;

            function createFragmentShader(gl, fragmentShaderSource) {
                var fragmentShader = throwIfNull(gl, function () {
                    return gl.createShader(gl.FRAGMENT_SHADER);
                }, 'Unable to create fragment WebGLShader.');
                callAndCheck(gl, function () {
                    return gl.shaderSource(fragmentShader, fragmentShaderSource);
                });
                callAndCheck(gl, function () {
                    return gl.compileShader(fragmentShader);
                });
                if (gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS) === false) {
                    logShaderSourceAndInfoLog(fragmentShaderSource, gl.getShaderInfoLog(fragmentShader));
                    throw new Error('Failed to compile fragment shader.');
                }
                return fragmentShader;
            }
            exports.createFragmentShader = createFragmentShader;
            var lineNumberRegex = /ERROR: [0-9]+:([0-9]+):/g;

            function logShaderSourceAndInfoLog(shaderSource, shaderInfoLog) {
                var lineNumberRegexResult = lineNumberRegex.exec(shaderInfoLog);
                if (lineNumberRegexResult == null) {
                    console.log("Couldn't parse line number in error: " + shaderInfoLog);
                    console.log(shaderSource);
                    return;
                }
                var lineNumber = +lineNumberRegexResult[1];
                var shaderLines = shaderSource.split('\n');
                var pad = shaderLines.length.toString().length + 2;
                var linesWithLineNumbers = shaderLines.map(function (line, lineNumber) {
                    return util.rightPad((lineNumber + 1).toString(), pad) + line;
                });
                var maxLineLength = 0;
                for (var i = 0; i < linesWithLineNumbers.length; i++) {
                    maxLineLength = Math.max(linesWithLineNumbers[i].length, maxLineLength);
                }
                var beforeErrorLines = linesWithLineNumbers.slice(0, lineNumber - 1);
                var errorLine = linesWithLineNumbers.slice(lineNumber - 1, lineNumber);
                var afterErrorLines = linesWithLineNumbers.slice(lineNumber);
                console.log(beforeErrorLines.join('\n'));
                console.log(shaderInfoLog.split('\n')[0]);
                console.log("%c " + util.rightPad(errorLine[0], maxLineLength), 'border:1px solid red; background-color:#e3d2d2; color:#a61717');
                console.log(afterErrorLines.join('\n'));
            }

            function createProgram(gl) {
                return throwIfNull(gl, function () {
                    return gl.createProgram();
                }, 'Unable to create WebGLProgram.');
            }
            exports.createProgram = createProgram;

            function linkProgram(gl, program) {
                callAndCheck(gl, function () {
                    return gl.linkProgram(program);
                });
                if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
                    console.log(gl.getProgramInfoLog(program));
                    throw new Error('Failed to link vertex and fragment shaders.');
                }
            }
            exports.linkProgram = linkProgram;

            function validateProgram(gl, program) {
                callAndCheck(gl, function () {
                    return gl.validateProgram(program);
                });
                if (gl.getProgramParameter(program, gl.VALIDATE_STATUS) === false) {
                    console.log(gl.getProgramInfoLog(program));
                    throw new Error('Shader program validation failed.');
                }
            }
            exports.validateProgram = validateProgram;

            function createStaticVertexBuffer(gl, data) {
                var buffer = throwIfNull(gl, function () {
                    return gl.createBuffer();
                }, 'Unable to create WebGLBuffer');
                callAndCheck(gl, function () {
                    return gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                });
                callAndCheck(gl, function () {
                    return gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
                });
                return buffer;
            }
            exports.createStaticVertexBuffer = createStaticVertexBuffer;

            function createStaticIndexBuffer(gl, data) {
                var buffer = throwIfNull(gl, function () {
                    return gl.createBuffer();
                }, 'Unable to create WebGLBuffer');
                callAndCheck(gl, function () {
                    return gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                });
                callAndCheck(gl, function () {
                    return gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
                });
                return buffer;
            }
            exports.createStaticIndexBuffer = createStaticIndexBuffer;

            function queryMaxTextureSize(gl) {
                if (MAX_TEXTURE_SIZE != null) {
                    return MAX_TEXTURE_SIZE;
                }
                MAX_TEXTURE_SIZE =
                    callAndCheck(gl, function () {
                        return gl.getParameter(gl.MAX_TEXTURE_SIZE);
                    });
                return MAX_TEXTURE_SIZE;
            }
            exports.queryMaxTextureSize = queryMaxTextureSize;

            function getChannelsPerTexture() {
                if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
                    return 4;
                }
                if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
                    return 1;
                }
                return 4;
            }
            exports.getChannelsPerTexture = getChannelsPerTexture;

            function createTexture(gl) {
                return throwIfNull(gl, function () {
                    return gl.createTexture();
                }, 'Unable to create WebGLTexture.');
            }
            exports.createTexture = createTexture;

            function validateTextureSize(gl, width, height) {
                var maxTextureSize = queryMaxTextureSize(gl);
                if ((width <= 0) || (height <= 0)) {
                    var requested = "[" + width + "x" + height + "]";
                    throw new Error('Requested texture size ' + requested + ' is invalid.');
                }
                if ((width > maxTextureSize) || (height > maxTextureSize)) {
                    var requested = "[" + width + "x" + height + "]";
                    var max = "[" + maxTextureSize + "x" + maxTextureSize + "]";
                    throw new Error('Requested texture size ' + requested +
                        ' greater than WebGL maximum on this browser / GPU ' + max + '.');
                }
            }
            exports.validateTextureSize = validateTextureSize;

            function createFramebuffer(gl) {
                return throwIfNull(gl, function () {
                    return gl.createFramebuffer();
                }, 'Unable to create WebGLFramebuffer.');
            }
            exports.createFramebuffer = createFramebuffer;

            function bindVertexBufferToProgramAttribute(gl, program, attribute, buffer, arrayEntriesPerItem, itemStrideInBytes, itemOffsetInBytes) {
                var loc = gl.getAttribLocation(program, attribute);
                if (loc === -1) {
                    return;
                }
                callAndCheck(gl, function () {
                    return gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                });
                callAndCheck(gl, function () {
                    return gl.vertexAttribPointer(loc, arrayEntriesPerItem, gl.FLOAT, false, itemStrideInBytes, itemOffsetInBytes);
                });
                callAndCheck(gl, function () {
                    return gl.enableVertexAttribArray(loc);
                });
            }
            exports.bindVertexBufferToProgramAttribute = bindVertexBufferToProgramAttribute;

            function bindTextureUnit(gl, texture, textureUnit) {
                validateTextureUnit(gl, textureUnit);
                callAndCheck(gl, function () {
                    return gl.activeTexture(gl.TEXTURE0 + textureUnit);
                });
                callAndCheck(gl, function () {
                    return gl.bindTexture(gl.TEXTURE_2D, texture);
                });
            }
            exports.bindTextureUnit = bindTextureUnit;

            function unbindTextureUnit(gl, textureUnit) {
                validateTextureUnit(gl, textureUnit);
                callAndCheck(gl, function () {
                    return gl.activeTexture(gl.TEXTURE0 + textureUnit);
                });
                callAndCheck(gl, function () {
                    return gl.bindTexture(gl.TEXTURE_2D, null);
                });
            }
            exports.unbindTextureUnit = unbindTextureUnit;

            function getProgramUniformLocationOrThrow(gl, program, uniformName) {
                return throwIfNull(gl, function () {
                    return gl.getUniformLocation(program, uniformName);
                }, 'uniform "' + uniformName + '" not present in program.');
            }
            exports.getProgramUniformLocationOrThrow = getProgramUniformLocationOrThrow;

            function getProgramUniformLocation(gl, program, uniformName) {
                return gl.getUniformLocation(program, uniformName);
            }
            exports.getProgramUniformLocation = getProgramUniformLocation;

            function bindTextureToProgramUniformSampler(gl, program, texture, uniformSamplerLocation, textureUnit) {
                callAndCheck(gl, function () {
                    return bindTextureUnit(gl, texture, textureUnit);
                });
                callAndCheck(gl, function () {
                    return gl.uniform1i(uniformSamplerLocation, textureUnit);
                });
            }
            exports.bindTextureToProgramUniformSampler = bindTextureToProgramUniformSampler;

            function bindCanvasToFramebuffer(gl) {
                callAndCheck(gl, function () {
                    return gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                });
                callAndCheck(gl, function () {
                    return gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                });
                callAndCheck(gl, function () {
                    return gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
                });
            }
            exports.bindCanvasToFramebuffer = bindCanvasToFramebuffer;

            function bindColorTextureToFramebuffer(gl, texture, framebuffer) {
                callAndCheck(gl, function () {
                    return gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                });
                callAndCheck(gl, function () {
                    return gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                });
            }
            exports.bindColorTextureToFramebuffer = bindColorTextureToFramebuffer;

            function unbindColorTextureFromFramebuffer(gl, framebuffer) {
                callAndCheck(gl, function () {
                    return gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                });
                callAndCheck(gl, function () {
                    return gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
                });
            }
            exports.unbindColorTextureFromFramebuffer = unbindColorTextureFromFramebuffer;

            function validateFramebuffer(gl) {
                var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                if (status !== gl.FRAMEBUFFER_COMPLETE) {
                    throw new Error('Error binding framebuffer: ' + getFramebufferErrorMessage(gl, status));
                }
            }
            exports.validateFramebuffer = validateFramebuffer;

            function getFramebufferErrorMessage(gl, status) {
                switch (status) {
                    case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                        return 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
                    case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                        return 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
                    case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                        return 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
                    case gl.FRAMEBUFFER_UNSUPPORTED:
                        return 'FRAMEBUFFER_UNSUPPORTED';
                    default:
                        return "unknown error " + status;
                }
            }
            exports.getFramebufferErrorMessage = getFramebufferErrorMessage;

            function throwIfNull(gl, returnTOrNull, failureMessage) {
                var tOrNull = callAndCheck(gl, function () {
                    return returnTOrNull();
                });
                if (tOrNull == null) {
                    throw new Error(failureMessage);
                }
                return tOrNull;
            }

            function validateTextureUnit(gl, textureUnit) {
                var maxTextureUnit = gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS - 1;
                var glTextureUnit = textureUnit + gl.TEXTURE0;
                if (glTextureUnit < gl.TEXTURE0 || glTextureUnit > maxTextureUnit) {
                    var textureUnitRange = "[gl.TEXTURE0, gl.TEXTURE" + maxTextureUnit + "]";
                    throw new Error("textureUnit must be in " + textureUnitRange + ".");
                }
            }

            function getTextureShapeFromLogicalShape(gl, logShape) {
                if (logShape.length !== 2) {
                    var squeezeResult = util.squeezeShape(logShape);
                    logShape = squeezeResult.newShape;
                }
                var maxTexSize = queryMaxTextureSize(gl);
                var size = util.sizeFromShape(logShape);
                if (logShape.length <= 1 && size <= maxTexSize) {
                    return [size, 1];
                } else if (logShape.length === 2 && logShape[0] <= maxTexSize &&
                    logShape[1] <= maxTexSize) {
                    return logShape;
                } else if (logShape.length === 3 && logShape[0] <= maxTexSize &&
                    logShape[1] * logShape[2] <= maxTexSize) {
                    return [logShape[0], logShape[1] * logShape[2]];
                } else if (logShape.length === 4 && logShape[0] <= maxTexSize &&
                    logShape[1] * logShape[2] * logShape[3] <= maxTexSize) {
                    return [logShape[0], logShape[1] * logShape[2] * logShape[3]];
                } else {
                    return util.sizeToSquarishShape(size);
                }
            }
            exports.getTextureShapeFromLogicalShape = getTextureShapeFromLogicalShape;

        }, {
            "../../environment": 34,
            "../../util": 150
        }],
        103: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("./environment");
            var array_ops_1 = require("./ops/array_ops");
            var batchnorm_1 = require("./ops/batchnorm");
            var binary_ops_1 = require("./ops/binary_ops");
            var compare_1 = require("./ops/compare");
            var conv_1 = require("./ops/conv");
            var image_ops_1 = require("./ops/image_ops");
            var logical_ops_1 = require("./ops/logical_ops");
            var lrn_1 = require("./ops/lrn");
            var lstm_1 = require("./ops/lstm");
            var matmul_1 = require("./ops/matmul");
            var norm_1 = require("./ops/norm");
            var ops = require("./ops/ops");
            var pool_1 = require("./ops/pool");
            var reduction_ops_1 = require("./ops/reduction_ops");
            var reverse_1 = require("./ops/reverse");
            var slice_1 = require("./ops/slice");
            var softmax_1 = require("./ops/softmax");
            var transpose_1 = require("./ops/transpose");
            var unary_ops_1 = require("./ops/unary_ops");
            var tracking_1 = require("./tracking");
            var util = require("./util");
            var tidy = tracking_1.Tracking.tidy;
            var keep = tracking_1.Tracking.keep;
            var NDArrayMath = (function () {
                function NDArrayMath(backend, safeMode) {
                    this.matMul = matmul_1.MatmulOps.matMul;
                    this.vectorTimesMatrix = matmul_1.MatmulOps.vectorTimesMatrix;
                    this.outerProduct = matmul_1.MatmulOps.outerProduct;
                    this.matrixTimesVector = matmul_1.MatmulOps.matrixTimesVector;
                    this.dotProduct = matmul_1.MatmulOps.dotProduct;
                    this.slice = slice_1.SliceOps.slice;
                    this.slice1D = slice_1.SliceOps.slice1d;
                    this.slice2D = slice_1.SliceOps.slice2d;
                    this.slice3D = slice_1.SliceOps.slice3d;
                    this.slice4D = slice_1.SliceOps.slice4d;
                    this.reverse = reverse_1.ReverseOps.reverse;
                    this.reverse1D = reverse_1.ReverseOps.reverse1d;
                    this.reverse2D = reverse_1.ReverseOps.reverse2d;
                    this.reverse3D = reverse_1.ReverseOps.reverse3d;
                    this.reverse4D = reverse_1.ReverseOps.reverse4d;
                    this.batchNormalization = batchnorm_1.BatchNormOps.batchNormalization;
                    this.batchNormalization2D = batchnorm_1.BatchNormOps.batchNormalization2d;
                    this.batchNormalization3D = batchnorm_1.BatchNormOps.batchNormalization3d;
                    this.batchNormalization4D = batchnorm_1.BatchNormOps.batchNormalization4d;
                    this.avgPool = pool_1.PoolOps.avgPool;
                    this.maxPool = pool_1.PoolOps.maxPool;
                    this.minPool = pool_1.PoolOps.minPool;
                    this.maxPoolBackprop = pool_1.PoolOps.maxPoolBackprop;
                    this.conv2dTranspose = conv_1.ConvOps.conv2dTranspose;
                    this.depthwiseConv2D = conv_1.ConvOps.depthwiseConv2d;
                    this.conv2dDerFilter = conv_1.ConvOps.conv2dDerFilter;
                    this.conv2dDerInput = conv_1.ConvOps.conv2dDerInput;
                    this.argMax = reduction_ops_1.ReductionOps.argMax;
                    this.argMin = reduction_ops_1.ReductionOps.argMin;
                    this.logSumExp = reduction_ops_1.ReductionOps.logSumExp;
                    this.max = reduction_ops_1.ReductionOps.max;
                    this.mean = reduction_ops_1.ReductionOps.mean;
                    this.min = reduction_ops_1.ReductionOps.min;
                    this.moments = reduction_ops_1.ReductionOps.moments;
                    this.sum = reduction_ops_1.ReductionOps.sum;
                    this.add = binary_ops_1.BinaryOps.add;
                    this.addStrict = binary_ops_1.BinaryOps.addStrict;
                    this.div = binary_ops_1.BinaryOps.div;
                    this.divide = this.div;
                    this.divStrict = binary_ops_1.BinaryOps.divStrict;
                    this.divideStrict = this.divStrict;
                    this.maximum = binary_ops_1.BinaryOps.maximum;
                    this.maximumStrict = binary_ops_1.BinaryOps.maximumStrict;
                    this.minimum = binary_ops_1.BinaryOps.minimum;
                    this.minimumStrict = binary_ops_1.BinaryOps.minimumStrict;
                    this.mul = binary_ops_1.BinaryOps.mul;
                    this.multiply = this.mul;
                    this.mulStrict = binary_ops_1.BinaryOps.mulStrict;
                    this.multiplyStrict = this.mulStrict;
                    this.pow = binary_ops_1.BinaryOps.pow;
                    this.powStrict = binary_ops_1.BinaryOps.powStrict;
                    this.sub = binary_ops_1.BinaryOps.sub;
                    this.subtract = this.sub;
                    this.subStrict = binary_ops_1.BinaryOps.subStrict;
                    this.logicalNot = logical_ops_1.LogicalOps.logicalNot;
                    this.logicalAnd = logical_ops_1.LogicalOps.logicalAnd;
                    this.logicalOr = logical_ops_1.LogicalOps.logicalOr;
                    this.logicalXor = logical_ops_1.LogicalOps.logicalXor;
                    this.where = logical_ops_1.LogicalOps.where;
                    this.transpose = transpose_1.TransposeOps.transpose;
                    this.equal = compare_1.CompareOps.equal;
                    this.equalStrict = compare_1.CompareOps.equalStrict;
                    this.greater = compare_1.CompareOps.greater;
                    this.greaterStrict = compare_1.CompareOps.greaterStrict;
                    this.greaterEqual = compare_1.CompareOps.greaterEqual;
                    this.greaterEqualStrict = compare_1.CompareOps.greaterEqualStrict;
                    this.less = compare_1.CompareOps.less;
                    this.lessStrict = compare_1.CompareOps.lessStrict;
                    this.lessEqual = compare_1.CompareOps.lessEqual;
                    this.lessEqualStrict = compare_1.CompareOps.lessEqualStrict;
                    this.notEqual = compare_1.CompareOps.notEqual;
                    this.notEqualStrict = compare_1.CompareOps.notEqualStrict;
                    this.abs = unary_ops_1.UnaryOps.abs;
                    this.acos = unary_ops_1.UnaryOps.acos;
                    this.asin = unary_ops_1.UnaryOps.asin;
                    this.atan = unary_ops_1.UnaryOps.atan;
                    this.ceil = unary_ops_1.UnaryOps.ceil;
                    this.clip = unary_ops_1.UnaryOps.clipByValue;
                    this.cos = unary_ops_1.UnaryOps.cos;
                    this.cosh = unary_ops_1.UnaryOps.cosh;
                    this.elu = unary_ops_1.UnaryOps.elu;
                    this.exp = unary_ops_1.UnaryOps.exp;
                    this.floor = unary_ops_1.UnaryOps.floor;
                    this.leakyRelu = unary_ops_1.UnaryOps.leakyRelu;
                    this.log = unary_ops_1.UnaryOps.log;
                    this.neg = unary_ops_1.UnaryOps.neg;
                    this.prelu = unary_ops_1.UnaryOps.prelu;
                    this.relu = unary_ops_1.UnaryOps.relu;
                    this.selu = unary_ops_1.UnaryOps.selu;
                    this.sigmoid = unary_ops_1.UnaryOps.sigmoid;
                    this.sin = unary_ops_1.UnaryOps.sin;
                    this.sinh = unary_ops_1.UnaryOps.sinh;
                    this.sqrt = unary_ops_1.UnaryOps.sqrt;
                    this.square = unary_ops_1.UnaryOps.square;
                    this.step = unary_ops_1.UnaryOps.step;
                    this.tan = unary_ops_1.UnaryOps.tan;
                    this.tanh = unary_ops_1.UnaryOps.tanh;
                    this.norm = norm_1.NormOps.norm;
                    this.basicLSTMCell = lstm_1.LSTMOps.basicLSTMCell;
                    this.multiRNNCell = lstm_1.LSTMOps.multiRNNCell;
                    this.softmax = softmax_1.SoftmaxOps.softmax;
                    this.softmaxCrossEntropy = softmax_1.SoftmaxOps.softmaxCrossEntropy;
                    this.cast = array_ops_1.ArrayOps.cast;
                    this.clone = array_ops_1.ArrayOps.clone;
                    this.gather = array_ops_1.ArrayOps.gather;
                    this.reshape = array_ops_1.ArrayOps.reshape;
                    this.tile = array_ops_1.ArrayOps.tile;
                    this.oneHot = array_ops_1.ArrayOps.oneHot;
                    this.multinomial = array_ops_1.ArrayOps.multinomial;
                    this.pad1D = array_ops_1.ArrayOps.pad1d;
                    this.pad2D = array_ops_1.ArrayOps.pad2d;
                    this.resizeBilinear3D = image_ops_1.ImageOps.resizeBilinear;
                    this.localResponseNormalization3D = lrn_1.LRNOps.localResponseNormalization;
                    this.localResponseNormalization4D = lrn_1.LRNOps.localResponseNormalization;
                    this.keep = tracking_1.Tracking.keep;
                    environment_1.ENV.setMath(this, backend, safeMode);
                    this.engine = environment_1.ENV.engine;
                    this.dispose = environment_1.ENV.engine.dispose.bind(environment_1.ENV.engine);
                    this.registeredVariables = environment_1.ENV.engine.registeredVariables;
                    this.startScope = environment_1.ENV.engine.startScope.bind(environment_1.ENV.engine);
                    this.endScope = environment_1.ENV.engine.endScope.bind(environment_1.ENV.engine);
                }
                NDArrayMath.prototype.scope = function (scopeFn) {
                    var keepFn = function (tensor) {
                        return keep(tensor);
                    };
                    var trackFn = function (tensor) {
                        return tensor;
                    };
                    return tidy(function () {
                        return scopeFn(keepFn, trackFn);
                    });
                };
                NDArrayMath.prototype.track = function (result) {
                    return result;
                };
                NDArrayMath.prototype.topK = function (x, k) {
                    util.assert(k <= x.size, "Error in topK: k value (" + k + ") must be less than size of input " +
                        ("tensor, got shape " + x.shape + "."));
                    var values;
                    var indices;
                    tidy('topK', function () {
                        values = environment_1.ENV.engine.runKernel(function (backend) {
                            return backend.topKValues(x, k);
                        }, {
                            x: x
                        });
                        indices = environment_1.ENV.engine.runKernel(function (backend) {
                            return backend.topKIndices(x, k);
                        }, {
                            x: x
                        });
                        return values;
                    });
                    var result = {
                        values: values,
                        indices: indices
                    };
                    return result;
                };
                NDArrayMath.prototype.elementWiseMul = function (a, b) {
                    return a.mulStrict(b);
                };
                NDArrayMath.prototype.scalarDividedByArray = function (c, a) {
                    util.assert(c.size === 1, "Error in scalarDividedByArray: first argument must be rank 0, but " +
                        ("got Tensor of rank " + c.rank + "."));
                    return c.div(a);
                };
                NDArrayMath.prototype.arrayDividedByScalar = function (a, c) {
                    util.assert(c.size === 1, "Error in arrayDividedByScalar: second argument must be rank 0, " +
                        ("but got Tensor of rank " + c.rank + "."));
                    return a.div(c);
                };
                NDArrayMath.prototype.switchDim = function (x, perm) {
                    return ops.transpose(x, perm);
                };
                NDArrayMath.prototype.scalarPlusArray = function (c, a) {
                    util.assert(c.size === 1, "Error in scalarPlusArray: first argument must be rank 0, but got " +
                        ("rank " + c.rank + "."));
                    return this.add(c, a);
                };
                NDArrayMath.prototype.scalarMinusArray = function (c, a) {
                    util.assert(c.size === 1, "Error in scalarMinusArray: first argument must be rank 0, but got " +
                        ("rank " + c.rank + "."));
                    return this.subtract(c, a);
                };
                NDArrayMath.prototype.arrayMinusScalar = function (a, c) {
                    util.assert(c.size === 1, "Error in arrayMinusScalar: second argument must be rank 0, but " +
                        ("got rank " + c.rank + "."));
                    return this.subtract(a, c);
                };
                NDArrayMath.prototype.scaledArrayAdd = function (c1, a, c2, b) {
                    var _this = this;
                    util.assert(c1.size === 1, "Error in scaledArrayAdd: first argument must rank 0, but got " +
                        (" rank " + c1.rank + "."));
                    util.assert(c2.size === 1, "Error in scaledArrayAdd: third argument must be rank 0, but got " +
                        ("Tensor of rank " + c2.rank + "."));
                    util.assertShapesMatch(a.shape, b.shape, 'Error in scaledArrayAdd: ');
                    return tidy('scaledArrayAdd', function () {
                        return _this.add(_this.multiply(c1, a), _this.multiply(c2, b));
                    });
                };
                NDArrayMath.prototype.scalarTimesArray = function (c, a) {
                    util.assert(c.size === 1, "Error in arrayDividedByScalar: first argument must be rank 0, but " +
                        ("got rank " + c.rank + "."));
                    return this.multiply(c, a);
                };
                NDArrayMath.prototype.concat = function (a, b, axis) {
                    return ops.concat([a, b], axis);
                };
                NDArrayMath.prototype.concat1D = function (a, b) {
                    return ops.concat1d([a, b]);
                };
                NDArrayMath.prototype.concat2D = function (a, b, axis) {
                    return ops.concat2d([a, b], axis);
                };
                NDArrayMath.prototype.concat3D = function (a, b, axis) {
                    return ops.concat3d([a, b], axis);
                };
                NDArrayMath.prototype.concat4D = function (a, b, axis) {
                    return ops.concat4d([a, b], axis);
                };
                NDArrayMath.prototype.conv1d = function (input, filter, bias, stride, pad, dimRoundingMode) {
                    if (bias != null) {
                        util.assert(bias.rank === 1, "Error in conv1d: bias must be rank 1, but got rank " +
                            (bias.rank + "."));
                    }
                    var res = ops.conv1d(input, filter, stride, pad, dimRoundingMode);
                    return res.add(bias);
                };
                NDArrayMath.prototype.conv2d = function (x, filter, bias, strides, pad, dimRoundingMode) {
                    if (bias != null) {
                        util.assert(bias.rank === 1, "Error in conv2d: bias must be rank 1, but got rank " +
                            (bias.rank + "."));
                    }
                    var res = ops.conv2d(x, filter, strides, pad, dimRoundingMode);
                    return res.add(bias);
                };
                NDArrayMath.prototype.argMaxEquals = function (x1, x2) {
                    util.assertShapesMatch(x1.shape, x2.shape, 'Error in argMaxEquals: ');
                    return x1.argMax().equal(x2.argMax());
                };
                return NDArrayMath;
            }());
            exports.NDArrayMath = NDArrayMath;

        }, {
            "./environment": 34,
            "./ops/array_ops": 104,
            "./ops/batchnorm": 106,
            "./ops/binary_ops": 107,
            "./ops/compare": 109,
            "./ops/conv": 112,
            "./ops/image_ops": 114,
            "./ops/logical_ops": 115,
            "./ops/lrn": 116,
            "./ops/lstm": 117,
            "./ops/matmul": 118,
            "./ops/norm": 119,
            "./ops/ops": 121,
            "./ops/pool": 122,
            "./ops/reduction_ops": 125,
            "./ops/reverse": 126,
            "./ops/slice": 128,
            "./ops/softmax": 130,
            "./ops/transpose": 131,
            "./ops/unary_ops": 132,
            "./tracking": 147,
            "./util": 150
        }],
        104: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var tensor_1 = require("../tensor");
            var tensor_util = require("../tensor_util");
            var util = require("../util");
            var axis_util_1 = require("./axis_util");
            var concat_1 = require("./concat");
            var operation_1 = require("./operation");
            var rand_1 = require("./rand");
            var ArrayOps = (function () {
                function ArrayOps() {}
                ArrayOps.tensor = function (values, shape, dtype) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    var inferredShape = util.inferShape(values);
                    if (shape != null && inferredShape.length !== 1) {
                        util.assertShapesMatch(shape, inferredShape, "Error creating a new Tensor. " +
                            ("Inferred shape (" + inferredShape + ") does not match the ") +
                            ("provided shape (" + shape + "). "));
                    }
                    if (!util.isTypedArray(values) && !Array.isArray(values)) {
                        values = [values];
                    }
                    shape = shape || inferredShape;
                    return tensor_1.Tensor.make(shape, {
                        values: toTypedArray(values, dtype)
                    }, dtype);
                };
                ArrayOps.scalar = function (value, dtype) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    if (util.isTypedArray(value) || Array.isArray(value)) {
                        throw new Error('Error creating a new Scalar: value must be a primitive ' +
                            '(number|boolean)');
                    }
                    return ArrayOps.tensor(value, [], dtype);
                };
                ArrayOps.tensor1d = function (values, dtype) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    var inferredShape = util.inferShape(values);
                    if (inferredShape.length !== 1) {
                        throw new Error('Error creating a new Tensor1D: values must be a flat/TypedArray');
                    }
                    return ArrayOps.tensor(values, inferredShape, dtype);
                };
                ArrayOps.tensor2d = function (values, shape, dtype) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    var inferredShape = util.inferShape(values);
                    if (inferredShape.length !== 2 && inferredShape.length !== 1) {
                        throw new Error('Error creating a new Tensor2D: values must be number[][] ' +
                            'or flat/TypedArray');
                    }
                    shape = shape || inferredShape;
                    return ArrayOps.tensor(values, shape, dtype);
                };
                ArrayOps.tensor3d = function (values, shape, dtype) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    var inferredShape = util.inferShape(values);
                    if (inferredShape.length !== 3 && inferredShape.length !== 1) {
                        throw new Error('Error creating a new Tensor3D: values must be number[][][]' +
                            'or flat/TypedArray');
                    }
                    shape = shape || inferredShape;
                    return ArrayOps.tensor(values, shape, dtype);
                };
                ArrayOps.tensor4d = function (values, shape, dtype) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    var inferredShape = util.inferShape(values);
                    if (inferredShape.length !== 4 && inferredShape.length !== 1) {
                        throw new Error('Error creating a new Tensor4D: values must be number[][][][]' +
                            'or flat/TypedArray');
                    }
                    shape = shape || inferredShape;
                    return ArrayOps.tensor(values, shape, dtype);
                };
                ArrayOps.ones = function (shape, dtype) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    var values = makeOnesTypedArray(util.sizeFromShape(shape), dtype);
                    return tensor_1.Tensor.make(shape, {
                        values: values
                    }, dtype);
                };
                ArrayOps.zeros = function (shape, dtype) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    var values = makeZerosTypedArray(util.sizeFromShape(shape), dtype);
                    return tensor_1.Tensor.make(shape, {
                        values: values
                    }, dtype);
                };
                ArrayOps.fill = function (shape, value, dtype) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    var values = util.getTypedArrayFromDType(dtype, util.sizeFromShape(shape));
                    values.fill(value);
                    return tensor_1.Tensor.make(shape, {
                        values: values
                    }, dtype);
                };
                ArrayOps.onesLike = function (x) {
                    return ArrayOps.ones(x.shape, x.dtype);
                };
                ArrayOps.zerosLike = function (x) {
                    return ArrayOps.zeros(x.shape, x.dtype);
                };
                ArrayOps.clone = function (x) {
                    return tensor_1.Tensor.make(x.shape, {
                        dataId: x.dataId
                    }, x.dtype);
                };
                ArrayOps.randomNormal = function (shape, mean, stdDev, dtype, seed) {
                    if (mean === void 0) {
                        mean = 0;
                    }
                    if (stdDev === void 0) {
                        stdDev = 1;
                    }
                    if (dtype != null && dtype === 'bool') {
                        throw new Error("Unsupported data type " + dtype);
                    }
                    var randGauss = new rand_1.MPRandGauss(mean, stdDev, dtype, false, seed);
                    return tensor_1.Tensor.rand(shape, function () {
                        return randGauss.nextValue();
                    }, dtype);
                };
                ArrayOps.truncatedNormal = function (shape, mean, stdDev, dtype, seed) {
                    if (mean === void 0) {
                        mean = 0;
                    }
                    if (stdDev === void 0) {
                        stdDev = 1;
                    }
                    if (dtype != null && dtype === 'bool') {
                        throw new Error("Unsupported data type " + dtype);
                    }
                    var randGauss = new rand_1.MPRandGauss(mean, stdDev, dtype, true, seed);
                    return tensor_1.Tensor.rand(shape, function () {
                        return randGauss.nextValue();
                    }, dtype);
                };
                ArrayOps.randomUniform = function (shape, minval, maxval, dtype) {
                    if (minval === void 0) {
                        minval = 0;
                    }
                    if (maxval === void 0) {
                        maxval = 1;
                    }
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    return tensor_1.Tensor.rand(shape, function () {
                        return util.randUniform(minval, maxval);
                    }, dtype);
                };
                ArrayOps.rand = function (shape, randFunction, dtype) {
                    var size = util.sizeFromShape(shape);
                    var values = null;
                    if (dtype == null || dtype === 'float32') {
                        values = new Float32Array(size);
                    } else if (dtype === 'int32') {
                        values = new Int32Array(size);
                    } else if (dtype === 'bool') {
                        values = new Uint8Array(size);
                    } else {
                        throw new Error("Unknown data type " + dtype);
                    }
                    for (var i = 0; i < size; i++) {
                        values[i] = randFunction();
                    }
                    return tensor_1.Tensor.make(shape, {
                        values: values
                    }, dtype);
                };
                ArrayOps.multinomial = function (probabilities, numSamples, seed) {
                    var numOutcomes = probabilities.size;
                    var origRank = probabilities.rank;
                    if (numOutcomes < 2) {
                        throw new Error("Error in multinomial: you need at least 2 outcomes, but got " +
                            (numOutcomes + "."));
                    }
                    if (origRank > 2) {
                        throw new Error("Rank of probabilities must be 1 or 2, but is " + origRank);
                    }
                    seed = seed || Math.random();
                    var prob2D = origRank === 1 ? probabilities.as2D(1, -1) : probabilities;
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.multinomial(prob2D, numSamples, seed);
                    }, {
                        prob2D: prob2D
                    });
                    return origRank === 1 ? res.as1D() : res;
                };
                ArrayOps.oneHot = function (indices, depth, onValue, offValue) {
                    if (onValue === void 0) {
                        onValue = 1;
                    }
                    if (offValue === void 0) {
                        offValue = 0;
                    }
                    if (depth < 2) {
                        throw new Error("Error in oneHot: depth must be >=2, but it is " + depth);
                    }
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.oneHot(indices, depth, onValue, offValue);
                    }, {
                        indices: indices
                    });
                };
                ArrayOps.fromPixels = function (pixels, numChannels) {
                    if (numChannels === void 0) {
                        numChannels = 3;
                    }
                    if (numChannels > 4) {
                        throw new Error('Cannot construct Tensor with more than 4 channels from pixels.');
                    }
                    return environment_1.ENV.engine.fromPixels(pixels, numChannels);
                };
                ArrayOps.reshape = function (x, shape) {
                    shape = util.inferFromImplicitShape(shape, x.size);
                    util.assert(x.size === util.sizeFromShape(shape), 'new shape and old shape must have the same number of elements.');
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.reshape(x.shape);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return tensor_1.Tensor.make(shape, {
                            dataId: x.dataId
                        }, x.dtype);
                    }, {
                        x: x
                    }, grad);
                };
                ArrayOps.squeeze = function (x, axis) {
                    return ArrayOps.reshape(x, util.squeezeShape(x.shape, axis).newShape);
                };
                ArrayOps.cast = function (x, dtype) {
                    var forw = function (backend) {
                        if (!util.hasEncodingLoss(x.dtype, dtype)) {
                            return tensor_1.Tensor.make(x.shape, {
                                dataId: x.dataId
                            }, dtype);
                        }
                        if (dtype === 'int32') {
                            return backend.int(x);
                        } else if (dtype === 'bool') {
                            return backend.notEqual(x, ArrayOps.scalar(0, x.dtype));
                        } else {
                            throw new Error("Error in Cast: unknown dtype argument (" + dtype + ")");
                        }
                    };
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.clone();
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(forw, {
                        x: x
                    }, grad);
                };
                ArrayOps.tile = function (x, reps) {
                    util.assert(x.rank === reps.length, "Error in transpose: rank of input " + x.rank + " " +
                        ("must match length of reps " + reps + "."));
                    var grad = function (dy) {
                        var derX = function () {
                            var xGrad = ArrayOps.zerosLike(x);
                            if (x.rank === 1) {
                                for (var i = 0; i < reps[0]; ++i) {
                                    xGrad = xGrad.add(dy.slice([i * x.shape[0]], [x.shape[0]]));
                                }
                            } else if (x.rank === 2) {
                                for (var i = 0; i < reps[0]; ++i) {
                                    for (var j = 0; j < reps[1]; ++j) {
                                        xGrad = xGrad.add(dy.slice([i * x.shape[0], j * x.shape[1]], [x.shape[0], x.shape[1]]));
                                    }
                                }
                            } else if (x.rank === 3) {
                                for (var i = 0; i < reps[0]; ++i) {
                                    for (var j = 0; j < reps[1]; ++j) {
                                        for (var k = 0; k < reps[2]; ++k) {
                                            xGrad = xGrad.add(dy.slice([i * x.shape[0], j * x.shape[1], k * x.shape[2]], [x.shape[0], x.shape[1], x.shape[2]]));
                                        }
                                    }
                                }
                            } else if (x.rank === 4) {
                                for (var i = 0; i < reps[0]; ++i) {
                                    for (var j = 0; j < reps[1]; ++j) {
                                        for (var k = 0; k < reps[2]; ++k) {
                                            for (var l = 0; l < reps[3]; ++l) {
                                                xGrad = xGrad.add(dy.slice([i * x.shape[0], j * x.shape[1], k * x.shape[2],
                                                    l * x.shape[3]
                                                ], [x.shape[0], x.shape[1], x.shape[2], x.shape[3]]));
                                            }
                                        }
                                    }
                                }
                            } else {
                                throw new Error("Gradient for tile operation is not implemented for rank-" +
                                    (x.rank + " tensors yet."));
                            }
                            return xGrad;
                        };
                        return {
                            x: derX
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.tile(x, reps);
                    }, {
                        x: x
                    }, grad);
                };
                ArrayOps.gather = function (x, indices, axis) {
                    if (axis === void 0) {
                        axis = 0;
                    }
                    var axes = axis_util_1.parseAxisParam(axis, x.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.gather(x, indices, axes[0]);
                    }, {
                        x: x,
                        indices: indices
                    });
                };
                ArrayOps.pad1d = function (x, paddings, constantValue) {
                    if (constantValue === void 0) {
                        constantValue = 0;
                    }
                    util.assert(paddings.length === 2, 'Invalid number of paddings. Must be length of 2.');
                    return ArrayOps.pad(x, [paddings], constantValue);
                };
                ArrayOps.pad2d = function (x, paddings, constantValue) {
                    if (constantValue === void 0) {
                        constantValue = 0;
                    }
                    util.assert(paddings.length === 2 && paddings[0].length === 2 &&
                        paddings[1].length === 2, 'Invalid number of paddings. Must be length of 2 each.');
                    return ArrayOps.pad(x, paddings, constantValue);
                };
                ArrayOps.pad3d = function (x, paddings, constantValue) {
                    if (constantValue === void 0) {
                        constantValue = 0;
                    }
                    util.assert(paddings.length === 3 && paddings[0].length === 2 &&
                        paddings[1].length === 2 && paddings[2].length === 2, 'Invalid number of paddings. Must be length of 2 each.');
                    return ArrayOps.pad(x, paddings, constantValue);
                };
                ArrayOps.pad4d = function (x, paddings, constantValue) {
                    if (constantValue === void 0) {
                        constantValue = 0;
                    }
                    util.assert(paddings.length === 4 && paddings[0].length === 2 &&
                        paddings[1].length === 2 && paddings[2].length === 2 &&
                        paddings[3].length === 2, 'Invalid number of paddings. Must be length of 2 each.');
                    return ArrayOps.pad(x, paddings, constantValue);
                };
                ArrayOps.pad = function (x, paddings, constantValue) {
                    if (constantValue === void 0) {
                        constantValue = 0;
                    }
                    if (x.rank === 0) {
                        throw new Error('pad(scalar) is not defined. Pass non-scalar to pad');
                    }
                    var begin = paddings.map(function (p) {
                        return p[0];
                    });
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.slice(begin, x.shape);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.pad(x, paddings, constantValue);
                    }, {
                        x: x
                    }, grad);
                };
                ArrayOps.stack = function (tensors, axis) {
                    if (axis === void 0) {
                        axis = 0;
                    }
                    util.assert(tensors.length >= 2, 'Pass at least two tensors to dl.stack');
                    var rank = tensors[0].rank;
                    var shape = tensors[0].shape;
                    var dtype = tensors[0].dtype;
                    util.assert(axis <= rank, 'Axis must be <= rank of the tensor');
                    tensors.forEach(function (t) {
                        util.assertShapesMatch(shape, t.shape, 'All tensors passed to stack must have matching shapes');
                    });
                    tensors.forEach(function (t) {
                        util.assert(dtype === t.dtype, 'All tensors passed to stack must have matching dtypes');
                    });
                    var expandedTensors = tensors.map(function (t) {
                        return t.expandDims(axis);
                    });
                    return concat_1.ConcatOps.concat(expandedTensors, axis);
                };
                ArrayOps.expandDims = function (x, axis) {
                    if (axis === void 0) {
                        axis = 0;
                    }
                    util.assert(axis <= x.rank, 'Axis must be <= rank of the tensor');
                    var newShape = x.shape.slice();
                    newShape.splice(axis, 0, 1);
                    return ArrayOps.reshape(x, newShape);
                };
                ArrayOps.linspace = function (start, stop, num) {
                    if (num === 0) {
                        throw new Error('Cannot request zero samples');
                    }
                    var step = (stop - start) / (num - 1);
                    var values = makeZerosTypedArray(num, 'float32');
                    values[0] = start;
                    for (var i = 1; i < values.length; i++) {
                        values[i] = values[i - 1] + step;
                    }
                    return tensor_1.Tensor1D.new(values, 'float32');
                };
                ArrayOps.range = function (start, stop, step, dtype) {
                    if (step === void 0) {
                        step = 1;
                    }
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    if (step === 0) {
                        throw new Error('Cannot have a step of zero');
                    }
                    var sameStartStop = start === stop;
                    var increasingRangeNegativeStep = start < stop && step < 0;
                    var decreasingRangePositiveStep = stop < start && step > 1;
                    if (sameStartStop || increasingRangeNegativeStep ||
                        decreasingRangePositiveStep) {
                        return ArrayOps.zeros([0], dtype);
                    }
                    var numElements = Math.abs(Math.ceil((stop - start) / step));
                    var values = makeZerosTypedArray(numElements, dtype);
                    if (stop < start && step === 1) {
                        step = -1;
                    }
                    values[0] = start;
                    for (var i = 1; i < values.length; i++) {
                        values[i] = values[i - 1] + step;
                    }
                    return ArrayOps.tensor1d(values, dtype);
                };
                ArrayOps.buffer = function (shape, dtype, values) {
                    if (dtype === void 0) {
                        dtype = 'float32';
                    }
                    return new tensor_1.TensorBuffer(shape, dtype, values);
                };
                ArrayOps.print = function (x, verbose) {
                    if (verbose === void 0) {
                        verbose = false;
                    }
                    console.log(tensor_util.tensorToString(x, verbose));
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "tensor", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "scalar", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "tensor1d", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "tensor2d", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "tensor3d", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "tensor4d", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "ones", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "zeros", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "fill", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "onesLike", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "zerosLike", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "clone", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "randomNormal", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "truncatedNormal", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "randomUniform", null);
                __decorate([
                    operation_1.operation
                ], ArrayOps, "rand", null);
                __decorate([
                    operation_1.operation
                ], ArrayOps, "multinomial", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "oneHot", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    }),
                    operation_1.operation
                ], ArrayOps, "fromPixels", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Transformations'
                    }),
                    operation_1.operation
                ], ArrayOps, "reshape", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Transformations'
                    })
                ], ArrayOps, "squeeze", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Transformations'
                    }),
                    operation_1.operation
                ], ArrayOps, "cast", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Slicing and Joining'
                    }),
                    operation_1.operation
                ], ArrayOps, "tile", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Slicing and Joining'
                    }),
                    operation_1.operation
                ], ArrayOps, "gather", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Transformations'
                    }),
                    operation_1.operation
                ], ArrayOps, "pad", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Slicing and Joining'
                    }),
                    operation_1.operation
                ], ArrayOps, "stack", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Transformations'
                    }),
                    operation_1.operation
                ], ArrayOps, "expandDims", null);
                __decorate([
                    operation_1.operation,
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "linspace", null);
                __decorate([
                    operation_1.operation,
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "range", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "buffer", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], ArrayOps, "print", null);
                return ArrayOps;
            }());
            exports.ArrayOps = ArrayOps;

            function makeZerosTypedArray(size, dtype) {
                if (dtype == null || dtype === 'float32') {
                    return new Float32Array(size);
                } else if (dtype === 'int32') {
                    return new Int32Array(size);
                } else if (dtype === 'bool') {
                    return new Uint8Array(size);
                } else {
                    throw new Error("Unknown data type $ {dtype}");
                }
            }

            function makeOnesTypedArray(size, dtype) {
                var array = makeZerosTypedArray(size, dtype);
                for (var i = 0; i < array.length; i++) {
                    array[i] = 1;
                }
                return array;
            }

            function toTypedArray(a, dtype) {
                if (noConversionNeeded(a, dtype)) {
                    return a;
                }
                if (Array.isArray(a)) {
                    a = util.flatten(a);
                }
                return util.copyTypedArray(a, dtype);
            }

            function noConversionNeeded(a, dtype) {
                return (a instanceof Float32Array && dtype === 'float32') ||
                    (a instanceof Int32Array && dtype === 'int32') ||
                    (a instanceof Uint8Array && dtype === 'bool');
            }

        }, {
            "../doc": 32,
            "../environment": 34,
            "../tensor": 144,
            "../tensor_util": 145,
            "../util": 150,
            "./axis_util": 105,
            "./concat": 110,
            "./operation": 120,
            "./rand": 123
        }],
        105: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var util = require("../util");

            function axesAreInnerMostDims(axes, rank) {
                for (var i = 0; i < axes.length; ++i) {
                    if (axes[axes.length - i - 1] !== rank - 1 - i) {
                        return false;
                    }
                }
                return true;
            }
            exports.axesAreInnerMostDims = axesAreInnerMostDims;

            function combineLocations(outputLoc, reduceLoc, axes) {
                var rank = outputLoc.length + reduceLoc.length;
                var loc = [];
                var outIdx = 0;
                var reduceIdx = 0;
                for (var dim = 0; dim < rank; dim++) {
                    if (axes.indexOf(dim) === -1) {
                        loc.push(outputLoc[outIdx++]);
                    } else {
                        loc.push(reduceLoc[reduceIdx++]);
                    }
                }
                return loc;
            }
            exports.combineLocations = combineLocations;

            function computeOutAndReduceShapes(aShape, axes) {
                var outShape = [];
                var rank = aShape.length;
                for (var dim = 0; dim < rank; dim++) {
                    if (axes.indexOf(dim) === -1) {
                        outShape.push(aShape[dim]);
                    }
                }
                var reduceShape = axes.map(function (dim) {
                    return aShape[dim];
                });
                return [outShape, reduceShape];
            }
            exports.computeOutAndReduceShapes = computeOutAndReduceShapes;

            function expandShapeToKeepDim(shape, axes) {
                var reduceSubShape = axes.map(function (x) {
                    return 1;
                });
                return combineLocations(shape, reduceSubShape, axes);
            }
            exports.expandShapeToKeepDim = expandShapeToKeepDim;

            function parseAxisParam(axis, shape) {
                var rank = shape.length;
                axis = axis == null ? shape.map(function (s, i) {
                    return i;
                }) : [].concat(axis);
                util.assert(axis.every(function (ax) {
                        return ax >= -rank && ax < rank;
                    }), "All values in axis param must be in range [-" + rank + ", " + rank + ") but " +
                    ("got axis " + axis));
                util.assert(axis.every(function (ax) {
                        return util.isInt(ax);
                    }), "All values in axis param must be integers but " +
                    ("got axis " + axis));
                return axis.map(function (a) {
                    return a < 0 ? rank + a : a;
                });
            }
            exports.parseAxisParam = parseAxisParam;

            function assertAxesAreInnerMostDims(msg, axes, rank) {
                util.assert(axesAreInnerMostDims(axes, rank), msg + " supports only inner-most axes for now. " +
                    ("Got axes " + axes + " and rank-" + rank + " input."));
            }
            exports.assertAxesAreInnerMostDims = assertAxesAreInnerMostDims;

            function getAxesPermutation(axes, rank) {
                if (axesAreInnerMostDims(axes, rank)) {
                    return null;
                }
                var result = [];
                for (var i = 0; i < rank; ++i) {
                    if (axes.indexOf(i) === -1) {
                        result.push(i);
                    }
                }
                axes.forEach(function (axis) {
                    return result.push(axis);
                });
                return result;
            }
            exports.getAxesPermutation = getAxesPermutation;

            function getUndoAxesPermutation(axes) {
                return axes.map(function (axis, i) {
                        return [i, axis];
                    })
                    .sort(function (a, b) {
                        return a[1] - b[1];
                    })
                    .map(function (x) {
                        return x[0];
                    });
            }
            exports.getUndoAxesPermutation = getUndoAxesPermutation;

            function getInnerMostAxes(numAxes, rank) {
                var res = [];
                for (var i = rank - numAxes; i < rank; ++i) {
                    res.push(i);
                }
                return res;
            }
            exports.getInnerMostAxes = getInnerMostAxes;

        }, {
            "../util": 150
        }],
        106: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var operation_1 = require("./operation");
            var BatchNormOps = (function () {
                function BatchNormOps() {}
                BatchNormOps.batchNormalization2d = function (x, mean, variance, varianceEpsilon, scale, offset) {
                    if (varianceEpsilon === void 0) {
                        varianceEpsilon = .001;
                    }
                    util.assert(x.rank === 2, "Error in batchNormalization3D: x must be rank 3 but got rank " +
                        (x.rank + "."));
                    util.assert(mean.rank === 2 || mean.rank === 1, "Error in batchNormalization2D: mean must be rank 2 or rank 1 but " +
                        ("got rank " + mean.rank + "."));
                    util.assert(variance.rank === 2 || variance.rank === 1, "Error in batchNormalization2D: variance must be rank 2 or rank 1 " +
                        ("but got rank " + variance.rank + "."));
                    if (scale != null) {
                        util.assert(scale.rank === 2 || scale.rank === 1, "Error in batchNormalization2D: scale must be rank 2 or rank 1 " +
                            ("but got rank " + scale.rank + "."));
                    }
                    if (offset != null) {
                        util.assert(offset.rank === 2 || offset.rank === 1, "Error in batchNormalization2D: offset must be rank 2 or rank 1 " +
                            ("but got rank " + offset.rank + "."));
                    }
                    return BatchNormOps.batchNormalization(x, mean, variance, varianceEpsilon, scale, offset);
                };
                BatchNormOps.batchNormalization3d = function (x, mean, variance, varianceEpsilon, scale, offset) {
                    if (varianceEpsilon === void 0) {
                        varianceEpsilon = .001;
                    }
                    util.assert(x.rank === 3, "Error in batchNormalization3D: x must be rank 3 but got rank " +
                        (x.rank + "."));
                    util.assert(mean.rank === 3 || mean.rank === 1, "Error in batchNormalization3D: mean must be rank 3 or rank 1 but " +
                        ("got rank " + mean.rank + "."));
                    util.assert(variance.rank === 3 || variance.rank === 1, "Error in batchNormalization3D: variance must be rank 3 or rank 1 " +
                        ("but got rank " + variance.rank + "."));
                    if (scale != null) {
                        util.assert(scale.rank === 3 || scale.rank === 1, "Error in batchNormalization3D: scale must be rank 3 or rank 1 " +
                            ("but got rank " + scale.rank + "."));
                    }
                    if (offset != null) {
                        util.assert(offset.rank === 3 || offset.rank === 1, "Error in batchNormalization3D: offset must be rank 3 or rank 1 " +
                            ("but got rank " + offset.rank + "."));
                    }
                    return BatchNormOps.batchNormalization(x, mean, variance, varianceEpsilon, scale, offset);
                };
                BatchNormOps.batchNormalization4d = function (x, mean, variance, varianceEpsilon, scale, offset) {
                    if (varianceEpsilon === void 0) {
                        varianceEpsilon = .001;
                    }
                    util.assert(x.rank === 4, "Error in batchNormalization4D: x must be rank 4 but got rank " +
                        (x.rank + "."));
                    util.assert(mean.rank === 4 || mean.rank === 1, "Error in batchNormalization4D: mean must be rank 4 or rank 1 but " +
                        ("got rank " + mean.rank + "."));
                    util.assert(variance.rank === 4 || variance.rank === 1, "Error in batchNormalization4D: variance must be rank 4 or rank 1 " +
                        ("but got rank " + variance.rank + "."));
                    if (scale != null) {
                        util.assert(scale.rank === 4 || scale.rank === 1, "Error in batchNormalization4D: scale must be rank 4 or rank 1 " +
                            ("but got rank " + scale.rank + "."));
                    }
                    if (offset != null) {
                        util.assert(offset.rank === 4 || offset.rank === 1, "Error in batchNormalization4D: offset must be rank 4 or rank 1 " +
                            ("but got rank " + offset.rank + "."));
                    }
                    return BatchNormOps.batchNormalization(x, mean, variance, varianceEpsilon, scale, offset);
                };
                BatchNormOps.batchNormalization = function (x, mean, variance, varianceEpsilon, scale, offset) {
                    if (varianceEpsilon === void 0) {
                        varianceEpsilon = .001;
                    }
                    var x4D;
                    if (x.rank === 0 || x.rank === 1) {
                        x4D = x.as4D(1, 1, 1, x.size);
                    } else if (x.rank === 2) {
                        x4D = x.as4D(1, 1, x.shape[0], x.shape[1]);
                    } else if (x.rank === 3) {
                        x4D = x.as4D(1, x.shape[0], x.shape[1], x.shape[2]);
                    } else {
                        x4D = x;
                    }
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.batchNormalization4D(x4D, batchnormReshape4D(mean), batchnormReshape4D(variance), varianceEpsilon, batchnormReshape4D(scale), batchnormReshape4D(offset));
                    }, {
                        x: x,
                        mean: mean,
                        variance: variance
                    });
                    return res.reshape(x.shape);
                };
                __decorate([
                    operation_1.operation
                ], BatchNormOps, "batchNormalization2d", null);
                __decorate([
                    operation_1.operation
                ], BatchNormOps, "batchNormalization3d", null);
                __decorate([
                    operation_1.operation
                ], BatchNormOps, "batchNormalization4d", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Normalization'
                    })
                ], BatchNormOps, "batchNormalization", null);
                return BatchNormOps;
            }());
            exports.BatchNormOps = BatchNormOps;

            function batchnormReshape4D(x) {
                if (x == null) {
                    return null;
                }
                if (x.rank === 0) {
                    return x.as1D();
                } else if (x.rank === 1) {
                    return x;
                } else if (x.rank === 2) {
                    return x.as4D(1, 1, x.shape[0], x.shape[1]);
                } else if (x.rank === 3) {
                    return x.as4D(1, x.shape[0], x.shape[1], x.shape[2]);
                }
                return x;
            }

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./operation": 120
        }],
        107: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var broadcast_util = require("./broadcast_util");
            var operation_1 = require("./operation");
            var ops_1 = require("./ops");
            var BinaryOps = (function () {
                function BinaryOps() {}
                BinaryOps.add = function (a, b) {
                    util.assertTypesMatch(a, b);
                    var outShape = broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    var der = function (dy) {
                        var derA = function () {
                            var res = dy;
                            var reduceAxes = broadcast_util.getReductionAxes(a.shape, outShape);
                            if (reduceAxes.length > 0) {
                                res = res.sum(reduceAxes);
                            }
                            return res.reshape(a.shape);
                        };
                        var derB = function () {
                            var res = dy;
                            var reduceAxes = broadcast_util.getReductionAxes(b.shape, outShape);
                            if (reduceAxes.length > 0) {
                                res = res.sum(reduceAxes);
                            }
                            return res.reshape(b.shape);
                        };
                        return {
                            a: derA,
                            b: derB
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.add(a, b);
                    }, {
                        a: a,
                        b: b
                    }, der);
                };
                BinaryOps.addStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in addStrict: ');
                    return a.add(b);
                };
                BinaryOps.sub = function (a, b) {
                    util.assertTypesMatch(a, b);
                    var outShape = broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    var der = function (dy) {
                        var derA = function () {
                            var res = dy;
                            var reduceAxes = broadcast_util.getReductionAxes(a.shape, outShape);
                            if (reduceAxes.length > 0) {
                                res = res.sum(reduceAxes);
                            }
                            return res.reshape(a.shape);
                        };
                        var derB = function () {
                            var res = dy;
                            var reduceAxes = broadcast_util.getReductionAxes(b.shape, outShape);
                            if (reduceAxes.length > 0) {
                                res = res.sum(reduceAxes);
                            }
                            return res.neg().reshape(b.shape);
                        };
                        return {
                            a: derA,
                            b: derB
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.subtract(a, b);
                    }, {
                        a: a,
                        b: b
                    }, der);
                };
                BinaryOps.subStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in subStrict: ');
                    return a.sub(b);
                };
                BinaryOps.pow = function (base, exp) {
                    broadcast_util.assertAndGetBroadcastShape(base.shape, exp.shape);
                    var grad = function (dy) {
                        if (!util.arraysEqual(base.shape, exp.shape) &&
                            !util.isScalarShape(exp.shape)) {
                            throw new Error("Gradient of pow not yet supported for broadcasted shapes.");
                        }
                        var derBase = function () {
                            var expFloat = exp.toFloat();
                            var dx = expFloat.mul(base.toFloat().pow(expFloat.sub(ops_1.scalar(1))));
                            return dy.mulStrict(dx);
                        };
                        return {
                            base: derBase
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.pow(base, exp);
                    }, {
                        base: base
                    }, grad);
                };
                BinaryOps.powStrict = function (base, exp) {
                    util.assertShapesMatch(base.shape, exp.shape, 'Error in powStrict: ');
                    return base.pow(exp);
                };
                BinaryOps.mul = function (a, b) {
                    util.assertTypesMatch(a, b);
                    var outShape = broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    var der = function (dy) {
                        var derA = function () {
                            var res = dy.mul(b.toFloat());
                            var reduceAxes = broadcast_util.getReductionAxes(a.shape, outShape);
                            if (reduceAxes.length > 0) {
                                return res.sum(reduceAxes).reshape(a.shape);
                            }
                            return res;
                        };
                        var derB = function () {
                            var res = dy.mul(a.toFloat());
                            var reduceAxes = broadcast_util.getReductionAxes(b.shape, outShape);
                            if (reduceAxes.length > 0) {
                                return res.sum(reduceAxes).reshape(b.shape);
                            }
                            return res;
                        };
                        return {
                            a: derA,
                            b: derB
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.multiply(a, b);
                    }, {
                        a: a,
                        b: b
                    }, der);
                };
                BinaryOps.mulStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in multiplyStrict: ');
                    return a.mul(b);
                };
                BinaryOps.div = function (a, b) {
                    var outShape = broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    var der = function (dy) {
                        var derA = function () {
                            var res = dy.div(b.toFloat());
                            var reduceAxes = broadcast_util.getReductionAxes(a.shape, outShape);
                            if (reduceAxes.length > 0) {
                                return res.sum(reduceAxes).reshape(a.shape);
                            }
                            return res;
                        };
                        var derB = function () {
                            var res = dy.mul(a.toFloat());
                            var reduceAxes = broadcast_util.getReductionAxes(b.shape, outShape);
                            if (reduceAxes.length > 0) {
                                res = res.sum(reduceAxes).reshape(b.shape);
                            }
                            var tmp = b.square();
                            return res.div(tmp.toFloat()).neg();
                        };
                        return {
                            a: derA,
                            b: derB
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.divide(a, b);
                    }, {
                        a: a,
                        b: b
                    }, der);
                };
                BinaryOps.divStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in divideStrict: ');
                    return a.div(b);
                };
                BinaryOps.minimum = function (a, b) {
                    util.assertTypesMatch(a, b);
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    var der = function (dy) {
                        var derA = function () {
                            return dy.mul(a.lessEqual(b).toFloat());
                        };
                        var derB = function () {
                            return dy.mul(a.greater(b).toFloat());
                        };
                        return {
                            a: derA,
                            b: derB
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.minimum(a, b);
                    }, {
                        a: a,
                        b: b
                    }, der);
                };
                BinaryOps.minimumStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in minimumStrict: ');
                    return a.minimum(b);
                };
                BinaryOps.maximum = function (a, b) {
                    util.assertTypesMatch(a, b);
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    var der = function (dy) {
                        var derA = function () {
                            return dy.mul(a.greaterEqual(b).toFloat());
                        };
                        var derB = function () {
                            return dy.mul(a.less(b).toFloat());
                        };
                        return {
                            a: derA,
                            b: derB
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.maximum(a, b);
                    }, {
                        a: a,
                        b: b
                    }, der);
                };
                BinaryOps.maximumStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in minimumStrict: ');
                    return a.maximum(b);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Arithmetic'
                    }),
                    operation_1.operation
                ], BinaryOps, "add", null);
                __decorate([
                    operation_1.operation
                ], BinaryOps, "addStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Arithmetic'
                    }),
                    operation_1.operation
                ], BinaryOps, "sub", null);
                __decorate([
                    operation_1.operation
                ], BinaryOps, "subStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Arithmetic'
                    }),
                    operation_1.operation
                ], BinaryOps, "pow", null);
                __decorate([
                    operation_1.operation
                ], BinaryOps, "powStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Arithmetic'
                    }),
                    operation_1.operation
                ], BinaryOps, "mul", null);
                __decorate([
                    operation_1.operation
                ], BinaryOps, "mulStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Arithmetic'
                    }),
                    operation_1.operation
                ], BinaryOps, "div", null);
                __decorate([
                    operation_1.operation
                ], BinaryOps, "divStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Arithmetic'
                    }),
                    operation_1.operation
                ], BinaryOps, "minimum", null);
                __decorate([
                    operation_1.operation
                ], BinaryOps, "minimumStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Arithmetic'
                    }),
                    operation_1.operation
                ], BinaryOps, "maximum", null);
                __decorate([
                    operation_1.operation
                ], BinaryOps, "maximumStrict", null);
                return BinaryOps;
            }());
            exports.BinaryOps = BinaryOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./broadcast_util": 108,
            "./operation": 120,
            "./ops": 121
        }],
        108: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            function getBroadcastDims(inShape, outShape) {
                var inRank = inShape.length;
                var dims = [];
                for (var i = 0; i < inRank; i++) {
                    var dim = inRank - 1 - i;
                    var a = inShape[dim] || 1;
                    var b = outShape[outShape.length - 1 - i] || 1;
                    if (b > 1 && a === 1) {
                        dims.unshift(dim);
                    }
                }
                return dims;
            }
            exports.getBroadcastDims = getBroadcastDims;

            function getReductionAxes(inShape, outShape) {
                var result = [];
                for (var i = 0; i < outShape.length; i++) {
                    var inDim = inShape[inShape.length - i - 1];
                    var outAxis = outShape.length - i - 1;
                    var outDim = outShape[outAxis];
                    if (inDim == null || (inDim === 1 && outDim > 1)) {
                        result.unshift(outAxis);
                    }
                }
                return result;
            }
            exports.getReductionAxes = getReductionAxes;

            function broadcastDimsAreOuter(dims) {
                for (var i = 0; i < dims.length; i++) {
                    if (dims[i] !== i) {
                        return false;
                    }
                }
                return true;
            }
            exports.broadcastDimsAreOuter = broadcastDimsAreOuter;

            function assertAndGetBroadcastShape(shapeA, shapeB) {
                var result = [];
                var errMsg = "Operands could not be broadcast together with shapes " +
                    (shapeA + " and " + shapeB + ".");
                var l = Math.max(shapeA.length, shapeB.length);
                for (var i = 0; i < l; i++) {
                    var a = shapeA[shapeA.length - i - 1] || 1;
                    var b = shapeB[shapeB.length - i - 1] || 1;
                    if (a > 1 && b > 1 && a !== b) {
                        throw Error(errMsg);
                    }
                    result.unshift(Math.max(a, b));
                }
                return result;
            }
            exports.assertAndGetBroadcastShape = assertAndGetBroadcastShape;

        }, {}],
        109: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var broadcast_util = require("./broadcast_util");
            var operation_1 = require("./operation");
            var CompareOps = (function () {
                function CompareOps() {}
                CompareOps.notEqual = function (a, b) {
                    util.assertTypesMatch(a, b);
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.notEqual(a, b);
                    }, {
                        a: a,
                        b: b
                    });
                };
                CompareOps.notEqualStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in notEqualStrict: ');
                    return a.notEqual(b);
                };
                CompareOps.less = function (a, b) {
                    util.assertTypesMatch(a, b);
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.less(a, b);
                    }, {
                        a: a,
                        b: b
                    });
                };
                CompareOps.lessStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in lessStrict: ');
                    return a.less(b);
                };
                CompareOps.equal = function (a, b) {
                    util.assertTypesMatch(a, b);
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.equal(a, b);
                    }, {
                        a: a,
                        b: b
                    });
                };
                CompareOps.equalStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in equalStrict: ');
                    return a.equal(b);
                };
                CompareOps.lessEqual = function (a, b) {
                    util.assertTypesMatch(a, b);
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.lessEqual(a, b);
                    }, {
                        a: a,
                        b: b
                    });
                };
                CompareOps.lessEqualStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in lessEqualStrict: ');
                    return a.lessEqual(b);
                };
                CompareOps.greater = function (a, b) {
                    util.assertTypesMatch(a, b);
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.greater(a, b);
                    }, {
                        a: a,
                        b: b
                    });
                };
                CompareOps.greaterStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in greaterStrict: ');
                    return a.greater(b);
                };
                CompareOps.greaterEqual = function (a, b) {
                    util.assertTypesMatch(a, b);
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.greaterEqual(a, b);
                    }, {
                        a: a,
                        b: b
                    });
                };
                CompareOps.greaterEqualStrict = function (a, b) {
                    util.assertShapesMatch(a.shape, b.shape, 'Error in greaterEqualStrict: ');
                    return a.greaterEqual(b);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], CompareOps, "notEqual", null);
                __decorate([
                    operation_1.operation
                ], CompareOps, "notEqualStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], CompareOps, "less", null);
                __decorate([
                    operation_1.operation
                ], CompareOps, "lessStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], CompareOps, "equal", null);
                __decorate([
                    operation_1.operation
                ], CompareOps, "equalStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], CompareOps, "lessEqual", null);
                __decorate([
                    operation_1.operation
                ], CompareOps, "lessEqualStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], CompareOps, "greater", null);
                __decorate([
                    operation_1.operation
                ], CompareOps, "greaterStrict", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], CompareOps, "greaterEqual", null);
                __decorate([
                    operation_1.operation
                ], CompareOps, "greaterEqualStrict", null);
                return CompareOps;
            }());
            exports.CompareOps = CompareOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./broadcast_util": 108,
            "./operation": 120
        }],
        110: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var axis_util_1 = require("./axis_util");
            var concat_util = require("./concat_util");
            var operation_1 = require("./operation");
            var ConcatOps = (function () {
                function ConcatOps() {}
                ConcatOps.concat1d = function (tensors) {
                    return ConcatOps.concat(tensors, 0);
                };
                ConcatOps.concat2d = function (tensors, axis) {
                    return ConcatOps.concat(tensors, axis);
                };
                ConcatOps.concat3d = function (tensors, axis) {
                    return ConcatOps.concat(tensors, axis);
                };
                ConcatOps.concat4d = function (tensors, axis) {
                    return ConcatOps.concat(tensors, axis);
                };
                ConcatOps.concat = function (tensors, axis) {
                    if (axis === void 0) {
                        axis = 0;
                    }
                    util.assert(tensors.length >= 2, 'Pass at least two tensors to concat');
                    var result = tensors[0];
                    var axes = axis_util_1.parseAxisParam(axis, result.shape);
                    for (var i = 1; i < tensors.length; ++i) {
                        result = concat2Tensors(result, tensors[i], axes[0]);
                    }
                    return result;
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Slicing and Joining'
                    }),
                    operation_1.operation
                ], ConcatOps, "concat", null);
                return ConcatOps;
            }());
            exports.ConcatOps = ConcatOps;

            function concat2Tensors(a, b, axis) {
                concat_util.assertParams(a.shape, b.shape, axis);
                var outShape = concat_util.computeOutShape(a.shape, b.shape, axis);
                var a2D = a.as2D(-1, util.sizeFromShape(a.shape.slice(axis)));
                var b2D = b.as2D(-1, util.sizeFromShape(b.shape.slice(axis)));
                var _a = concat_util.computeGradientSliceShapes(a2D.shape, b2D.shape),
                    aBegin = _a.aBegin,
                    aSize = _a.aSize,
                    bBegin = _a.bBegin,
                    bSize = _a.bSize;
                var der = function (dy) {
                    return {
                        a: function () {
                            return dy.slice(aBegin, aSize);
                        },
                        b: function () {
                            return dy.slice(bBegin, bSize);
                        }
                    };
                };
                var res = environment_1.ENV.engine.runKernel(function (backend) {
                    return backend.concat(a2D, b2D);
                }, {
                    a: a2D,
                    b: b2D
                }, der);
                return res.reshape(outShape);
            }

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./axis_util": 105,
            "./concat_util": 111,
            "./operation": 120
        }],
        111: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var util = require("../util");

            function assertParams(aShape, bShape, axis) {
                var aRank = aShape.length;
                var bRank = bShape.length;
                util.assert(aShape.length === bShape.length, "Error in concat" + aRank + "D: rank of x1 (" + aRank + ") and x2 (" + bRank + ") " +
                    "must be the same.");
                util.assert(axis >= 0 && axis < aRank, "Error in concat" + aRank + "D: axis must be " +
                    ("between 0 and " + (aRank - 1) + "."));
                for (var i = 0; i < aRank; i++) {
                    util.assert((i === axis) || (aShape[i] === bShape[i]), "Error in concat" + aRank + "D: Shape (" + aShape + ") does not match " +
                        ("(" + bShape + ") along the non-concatenated axis " + i + "."));
                }
            }
            exports.assertParams = assertParams;

            function computeOutShape1D(x1Shape, x2Shape) {
                util.assert(x1Shape.length === 1 && x2Shape.length === 1, 'x1 and x2 should be 1d array.');
                var outputShape = x1Shape.slice();
                outputShape[0] += x2Shape[0];
                return outputShape;
            }
            exports.computeOutShape1D = computeOutShape1D;

            function computeOutShape(x1Shape, x2Shape, axis) {
                util.assert(x1Shape.length === x2Shape.length, 'x1 and x2 should have the same rank.');
                var outputShape = x1Shape.slice();
                outputShape[axis] += x2Shape[axis];
                return outputShape;
            }
            exports.computeOutShape = computeOutShape;

            function computeGradientSliceShapes(aShape, bShape) {
                return {
                    aBegin: [0, 0],
                    aSize: aShape,
                    bBegin: [0, aShape[1]],
                    bSize: bShape
                };
            }
            exports.computeGradientSliceShapes = computeGradientSliceShapes;

        }, {
            "../util": 150
        }],
        112: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var conv_util = require("./conv_util");
            var operation_1 = require("./operation");
            var ConvOps = (function () {
                function ConvOps() {}
                ConvOps.conv1d = function (input, filter, stride, pad, dimRoundingMode) {
                    var input3D = input;
                    var reshapedTo3D = false;
                    if (input.rank === 2) {
                        reshapedTo3D = true;
                        input3D = input.as3D(1, input.shape[0], input.shape[1]);
                    }
                    util.assert(input3D.rank === 3, "Error in conv1d: input must be rank 3, but got rank " + input3D.rank + ".");
                    util.assert(filter.rank === 3, "Error in conv1d: filter must be rank 3, but got rank " +
                        (filter.rank + "."));
                    if (dimRoundingMode != null) {
                        util.assert(util.isInt(pad), "Error in conv1d: pad must be an integer when using, " +
                            ("dimRoundingMode " + dimRoundingMode + " but got pad " + pad + "."));
                    }
                    util.assert(input3D.shape[2] === filter.shape[1], "Error in conv1d: depth of input (" + input3D.shape[2] + ") must match  " +
                        ("input depth for filter " + filter.shape[1] + "."));
                    var filter4D = filter.as4D(1, filter.shape[0], filter.shape[1], filter.shape[2]);
                    var input4D = input3D.as4D(input3D.shape[0], 1, input3D.shape[1], input3D.shape[2]);
                    var strides = [1, stride];
                    var res = ConvOps.conv2d(input4D, filter4D, strides, pad, dimRoundingMode);
                    if (reshapedTo3D) {
                        return res.as2D(res.shape[2], res.shape[3]);
                    }
                    return res.as3D(res.shape[0], res.shape[2], res.shape[3]);
                };
                ConvOps.conv2d = function (x, filter, strides, pad, dimRoundingMode) {
                    var x4D = x;
                    var reshapedTo4D = false;
                    if (x.rank === 3) {
                        reshapedTo4D = true;
                        x4D = x.as4D(1, x.shape[0], x.shape[1], x.shape[2]);
                    }
                    util.assert(x4D.rank === 4, "Error in conv2d: input must be rank 4, but got rank " + x4D.rank + ".");
                    util.assert(filter.rank === 4, "Error in conv2d: filter must be rank 4, but got rank " +
                        (filter.rank + "."));
                    if (dimRoundingMode != null) {
                        util.assert(util.isInt(pad), "Error in conv2d: pad must be an integer when using, " +
                            ("dimRoundingMode " + dimRoundingMode + " but got pad " + pad + "."));
                    }
                    util.assert(x4D.shape[3] === filter.shape[2], "Error in conv2d: depth of input (" + x4D.shape[3] + ") must match  " +
                        ("input depth for filter " + filter.shape[2] + "."));
                    var dilations = 1;
                    var convInfo = conv_util.computeConv2DInfo(x4D.shape, filter.shape, strides, dilations, pad, dimRoundingMode);
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return ConvOps.conv2dDerInput(x4D.shape, dy, filter, strides, pad);
                            },
                            filter: function () {
                                return ConvOps.conv2dDerFilter(x4D, dy, filter.shape, strides, pad);
                            }
                        };
                    };
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.conv2d(x4D, filter, convInfo);
                    }, {
                        x: x4D,
                        filter: filter
                    }, grad);
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    }
                    return res;
                };
                ConvOps.conv2dDerInput = function (xShape, dy, filter, strides, pad, dimRoundingMode) {
                    util.assert(xShape.length === dy.rank, "Length of inShape " +
                        ("(" + xShape.length + ") and rank of dy (" + dy.rank + ") must match"));
                    var xShape4D = xShape;
                    var dy4D = dy;
                    var reshapedTo4D = false;
                    if (dy.rank === 3) {
                        reshapedTo4D = true;
                        dy4D = dy.as4D(1, dy.shape[0], dy.shape[1], dy.shape[2]);
                        xShape4D = [1, xShape[0], xShape[1], xShape[2]];
                    }
                    var inDepth = xShape4D[3];
                    var outDepth = dy4D.shape[3];
                    util.assert(xShape4D.length === 4, "Error in conv2dDerInput: inShape must be length 4, but got length " +
                        (xShape4D.length + "."));
                    util.assert(dy4D.rank === 4, "Error in conv2dDerInput: dy must be rank 4, but got " +
                        ("rank " + dy4D.rank));
                    util.assert(filter.rank === 4, "Error in conv2dDerInput: filter must be rank 4, but got " +
                        ("rank " + filter.rank));
                    util.assert(inDepth === filter.shape[2], "Error in conv2dDerInput: depth of input (" + inDepth + ") must " +
                        ("match input depth for filter " + filter.shape[2] + "."));
                    util.assert(outDepth === filter.shape[3], "Error in conv2dDerInput: depth of output (" + outDepth + ") must" +
                        ("match output depth for filter " + filter.shape[3] + "."));
                    if (dimRoundingMode != null) {
                        util.assert(util.isInt(pad), "Error in conv2dDerInput: pad must be an integer when using, " +
                            ("dimRoundingMode " + dimRoundingMode + " but got pad " + pad + "."));
                    }
                    var dilations = 1;
                    var convInfo = conv_util.computeConv2DInfo(xShape4D, filter.shape, strides, dilations, pad, dimRoundingMode);
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.conv2dDerInput(dy4D, filter, convInfo);
                    }, {
                        dy4D: dy4D
                    });
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    }
                    return res;
                };
                ConvOps.conv2dDerFilter = function (x, dy, filterShape, strides, pad, dimRoundingMode) {
                    var x4D = x;
                    if (x.rank === 3) {
                        x4D = x.as4D(1, x.shape[0], x.shape[1], x.shape[2]);
                    }
                    var dy4D = dy;
                    if (dy4D.rank === 3) {
                        dy4D = dy.as4D(1, dy.shape[0], dy.shape[1], dy.shape[2]);
                    }
                    util.assert(x4D.rank === 4, "Error in conv2dDerFilter: input must be rank 4, but got shape " +
                        (x4D.shape + "."));
                    util.assert(dy4D.rank === 4, "Error in conv2dDerFilter: dy must be rank 4, but got shape " +
                        (dy4D.shape + "."));
                    util.assert(filterShape.length === 4, "Error in conv2dDerFilter: filterShape must be length 4, but got " +
                        (filterShape + "."));
                    util.assert(x4D.shape[3] === filterShape[2], "Error in conv2dDerFilter: depth of input " + x4D.shape[3] + ") must " +
                        ("match input depth in filter (" + filterShape[2] + "."));
                    util.assert(dy4D.shape[3] === filterShape[3], "Error in conv2dDerFilter: depth of dy (" + dy4D.shape[3] + ") must " +
                        ("match output depth for filter (" + filterShape[3] + ")."));
                    if (dimRoundingMode != null) {
                        util.assert(util.isInt(pad), "Error in conv2dDerFilter: pad must be an integer when using, " +
                            ("dimRoundingMode " + dimRoundingMode + " but got pad " + pad + "."));
                    }
                    var dilations = 1;
                    var convInfo = conv_util.computeConv2DInfo(x4D.shape, filterShape, strides, dilations, pad, dimRoundingMode);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.conv2dDerFilter(x4D, dy4D, convInfo);
                    }, {
                        x4D: x4D,
                        dy4D: dy4D
                    });
                };
                ConvOps.conv2dTranspose = function (x, filter, outputShape, strides, pad, dimRoundingMode) {
                    return ConvOps.conv2dDerInput(outputShape, x, filter, strides, pad, dimRoundingMode);
                };
                ConvOps.depthwiseConv2d = function (input, filter, strides, pad, dilations, dimRoundingMode) {
                    if (dilations === void 0) {
                        dilations = [1, 1];
                    }
                    var input4D = input;
                    var reshapedTo4D = false;
                    if (input.rank === 3) {
                        reshapedTo4D = true;
                        input4D = input.as4D(1, input.shape[0], input.shape[1], input.shape[2]);
                    }
                    util.assert(input4D.rank === 4, "Error in depthwiseConv2D: input must be rank 4, but got " +
                        ("rank " + input4D.rank + "."));
                    util.assert(filter.rank === 4, "Error in depthwiseConv2D: filter must be rank 4, but got rank " +
                        (filter.rank + "."));
                    util.assert(input4D.shape[3] === filter.shape[2], "Error in depthwiseConv2D: number of input channels " +
                        ("(" + input4D.shape[3] + ") must match the inChannels dimension in ") +
                        ("filter " + filter.shape[2] + "."));
                    if (dilations == null) {
                        dilations = [1, 1];
                    }
                    var _a = parseTupleParam(dilations),
                        dilationHeight = _a[0],
                        dilationWidth = _a[1];
                    util.assert(dilationHeight === 1 && dilationWidth === 1, 'Error in depthwiseConv2D: dilation rates greater than 1 are not yet ' +
                        ("supported. Got dilations '" + dilations + "'"));
                    if (dimRoundingMode != null) {
                        util.assert(util.isInt(pad), "Error in depthwiseConv2D: pad must be an integer when using, " +
                            ("dimRoundingMode " + dimRoundingMode + " but got pad " + pad + "."));
                    }
                    var convInfo = conv_util.computeConv2DInfo(input4D.shape, filter.shape, strides, dilations, pad, dimRoundingMode, true);
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.depthwiseConv2D(input4D, filter, convInfo);
                    }, {
                        input4D: input4D,
                        filter: filter
                    });
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    }
                    return res;
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Convolution'
                    }),
                    operation_1.operation
                ], ConvOps, "conv1d", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Convolution'
                    }),
                    operation_1.operation
                ], ConvOps, "conv2d", null);
                __decorate([
                    operation_1.operation
                ], ConvOps, "conv2dDerInput", null);
                __decorate([
                    operation_1.operation
                ], ConvOps, "conv2dDerFilter", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Convolution'
                    }),
                    operation_1.operation
                ], ConvOps, "conv2dTranspose", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Convolution'
                    }),
                    operation_1.operation
                ], ConvOps, "depthwiseConv2d", null);
                return ConvOps;
            }());
            exports.ConvOps = ConvOps;

            function parseTupleParam(param) {
                return typeof param === 'number' ? [param, param] : param;
            }

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./conv_util": 113,
            "./operation": 120
        }],
        113: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var util = require("../util");

            function computePool2DInfo(inShape, filterSize, strides, pad, roundingMode, dataFormat) {
                if (dataFormat === void 0) {
                    dataFormat = 'channelsLast';
                }
                var _a = parseTupleParam(filterSize),
                    filterHeight = _a[0],
                    filterWidth = _a[1];
                var filterShape;
                if (dataFormat === 'channelsLast') {
                    filterShape = [filterHeight, filterWidth, inShape[3], inShape[3]];
                } else if (dataFormat === 'channelsFirst') {
                    filterShape = [filterHeight, filterWidth, inShape[1], inShape[1]];
                } else {
                    throw new Error("Unknown dataFormat " + dataFormat);
                }
                var dilations = 1;
                return computeConv2DInfo(inShape, filterShape, strides, dilations, pad, roundingMode, false, dataFormat);
            }
            exports.computePool2DInfo = computePool2DInfo;

            function computeConv2DInfo(inShape, filterShape, strides, dilations, pad, roundingMode, depthwise, dataFormat) {
                if (depthwise === void 0) {
                    depthwise = false;
                }
                if (dataFormat === void 0) {
                    dataFormat = 'channelsLast';
                }
                var _a = [-1, -1, -1, -1],
                    batchSize = _a[0],
                    inHeight = _a[1],
                    inWidth = _a[2],
                    inChannels = _a[3];
                if (dataFormat === 'channelsLast') {
                    batchSize = inShape[0], inHeight = inShape[1], inWidth = inShape[2], inChannels = inShape[3];
                } else if (dataFormat === 'channelsFirst') {
                    batchSize = inShape[0], inChannels = inShape[1], inHeight = inShape[2], inWidth = inShape[3];
                } else {
                    throw new Error("Unknown dataFormat " + dataFormat);
                }
                var filterHeight = filterShape[0],
                    filterWidth = filterShape[1],
                    filterChannels = filterShape[3];
                var _b = parseTupleParam(strides),
                    strideHeight = _b[0],
                    strideWidth = _b[1];
                var _c = parseTupleParam(dilations),
                    dilationHeight = _c[0],
                    dilationWidth = _c[1];
                var effectiveFilterHeight = getEffectiveFilterSize(filterHeight, dilationHeight);
                var effectiveFilterWidth = getEffectiveFilterSize(filterWidth, dilationWidth);
                var _d = getPadAndOutInfo(pad, inHeight, inWidth, strideHeight, strideWidth, effectiveFilterHeight, effectiveFilterWidth, roundingMode),
                    padInfo = _d.padInfo,
                    outHeight = _d.outHeight,
                    outWidth = _d.outWidth;
                var outChannels = depthwise ? filterChannels * inChannels : filterChannels;
                var outShape;
                if (dataFormat === 'channelsFirst') {
                    outShape = [batchSize, outChannels, outHeight, outWidth];
                } else if (dataFormat === 'channelsLast') {
                    outShape = [batchSize, outHeight, outWidth, outChannels];
                }
                return {
                    batchSize: batchSize,
                    dataFormat: dataFormat,
                    inHeight: inHeight,
                    inWidth: inWidth,
                    inChannels: inChannels,
                    outHeight: outHeight,
                    outWidth: outWidth,
                    outChannels: outChannels,
                    padInfo: padInfo,
                    strideHeight: strideHeight,
                    strideWidth: strideWidth,
                    filterHeight: filterHeight,
                    filterWidth: filterWidth,
                    inShape: inShape,
                    outShape: outShape,
                    filterShape: filterShape
                };
            }
            exports.computeConv2DInfo = computeConv2DInfo;

            function computeOutputShape3D(inShape, fieldSize, outDepth, stride, zeroPad, roundingMode) {
                if (zeroPad == null) {
                    zeroPad = computeDefaultPad(inShape, fieldSize, stride);
                }
                var inputRows = inShape[0];
                var inputCols = inShape[1];
                var outputRows = conditionalRound((inputRows - fieldSize + 2 * zeroPad) / stride + 1, roundingMode);
                util.assert(util.isInt(outputRows), "The output # of rows (" + outputRows + ") must be an integer. Change the " +
                    "stride and/or zero pad parameters");
                var outputCols = conditionalRound((inputCols - fieldSize + 2 * zeroPad) / stride + 1, roundingMode);
                util.assert(util.isInt(outputCols), "The output # of columns (" + outputCols + ") must be an integer. Change " +
                    "the stride and/or zero pad parameters");
                return [outputRows, outputCols, outDepth];
            }
            exports.computeOutputShape3D = computeOutputShape3D;

            function computeDefaultPad(inputShape, fieldSize, stride) {
                return Math.floor((inputShape[0] * (stride - 1) - stride + fieldSize) / 2);
            }
            exports.computeDefaultPad = computeDefaultPad;

            function computeWeightsShape4D(inputDepth, outputDepth, filterHeight, filterWidth) {
                return [filterHeight, filterWidth, inputDepth, outputDepth];
            }
            exports.computeWeightsShape4D = computeWeightsShape4D;

            function computeDilatedRC(rc, origStride) {
                var rowsDilated = (rc[0] - 1) * origStride + 1;
                var colsDilated = (rc[1] - 1) * origStride + 1;
                return [rowsDilated, colsDilated];
            }
            exports.computeDilatedRC = computeDilatedRC;

            function parseTupleParam(param) {
                return typeof param === 'number' ? [param, param] : param;
            }

            function getEffectiveFilterSize(filterSize, dilation) {
                if (dilation <= 1) {
                    return filterSize;
                }
                return filterSize + (filterSize - 1) * (dilation - 1);
            }

            function getPadAndOutInfo(pad, inHeight, inWidth, strideHeight, strideWidth, filterHeight, filterWidth, roundingMode) {
                var padInfo;
                var outHeight;
                var outWidth;
                if (typeof pad === 'number') {
                    padInfo = {
                        top: pad,
                        bottom: pad,
                        left: pad,
                        right: pad
                    };
                    var outShape = computeOutputShape3D([inHeight, inWidth, 1], filterHeight, 1, strideHeight, pad, roundingMode);
                    outHeight = outShape[0];
                    outWidth = outShape[1];
                } else if (pad === 'same') {
                    outHeight = Math.ceil(inHeight / strideHeight);
                    outWidth = Math.ceil(inWidth / strideWidth);
                    var padAlongHeight = (outHeight - 1) * strideHeight + filterHeight - inHeight;
                    var padAlongWidth = (outWidth - 1) * strideWidth + filterWidth - inWidth;
                    var top_1 = Math.floor(padAlongHeight / 2);
                    var bottom = padAlongHeight - top_1;
                    var left = Math.floor(padAlongWidth / 2);
                    var right = padAlongWidth - left;
                    padInfo = {
                        top: top_1,
                        bottom: bottom,
                        left: left,
                        right: right
                    };
                } else if (pad === 'valid') {
                    padInfo = {
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    };
                    outHeight = Math.ceil((inHeight - filterHeight + 1) / strideHeight);
                    outWidth = Math.ceil((inWidth - filterWidth + 1) / strideWidth);
                } else {
                    throw Error("Unknown padding parameter: " + pad);
                }
                return {
                    padInfo: padInfo,
                    outHeight: outHeight,
                    outWidth: outWidth
                };
            }

            function conditionalRound(value, roundingMode) {
                if (!roundingMode) {
                    return value;
                }
                switch (roundingMode) {
                    case 'round':
                        return Math.round(value);
                    case 'ceil':
                        return Math.ceil(value);
                    case 'floor':
                        return Math.floor(value);
                    default:
                        throw new Error("Unknown roundingMode " + roundingMode);
                }
            }

        }, {
            "../util": 150
        }],
        114: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var operation_1 = require("./operation");
            var ImageOps = (function () {
                function ImageOps() {}
                ImageOps.resizeBilinear = function (images, size, alignCorners) {
                    if (alignCorners === void 0) {
                        alignCorners = false;
                    }
                    util.assert(images.rank === 3 || images.rank === 4, "Error in resizeBilinear: x must be rank 3 or 4, but got " +
                        ("rank " + images.rank + "."));
                    util.assert(size.length === 2, "Error in resizeBilinear: new shape must 2D, but got shape " +
                        (size + "."));
                    var batchImages = images;
                    var reshapedTo4D = false;
                    if (images.rank === 3) {
                        reshapedTo4D = true;
                        batchImages =
                            images.as4D(1, images.shape[0], images.shape[1], images.shape[2]);
                    }
                    var newHeight = size[0],
                        newWidth = size[1];
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.resizeBilinear(batchImages, newHeight, newWidth, alignCorners);
                    }, {
                        batchImages: batchImages
                    });
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    }
                    return res;
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Images',
                        namespace: 'image'
                    }),
                    operation_1.operation
                ], ImageOps, "resizeBilinear", null);
                return ImageOps;
            }());
            exports.ImageOps = ImageOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./operation": 120
        }],
        115: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var types = require("../types");
            var util = require("../util");
            var broadcast_util = require("./broadcast_util");
            var operation_1 = require("./operation");
            var LogicalOps = (function () {
                function LogicalOps() {}
                LogicalOps.logicalNot = function (x) {
                    util.assert(x.dtype === 'bool', 'Error Array must be of type bool.');
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.logicalNot(x);
                    }, {
                        x: x
                    });
                };
                LogicalOps.logicalAnd = function (a, b) {
                    util.assert(a.dtype === 'bool' && b.dtype === 'bool', 'Error Array must be of type bool.');
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.logicalAnd(a, b);
                    }, {
                        a: a,
                        b: b
                    });
                };
                LogicalOps.logicalOr = function (a, b) {
                    util.assert(a.dtype === 'bool' && b.dtype === 'bool', 'Error Array must be of type bool.');
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.logicalOr(a, b);
                    }, {
                        a: a,
                        b: b
                    });
                };
                LogicalOps.logicalXor = function (a, b) {
                    util.assert(a.dtype === 'bool' && b.dtype === 'bool', 'Error Array must be of type bool.');
                    broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.logicalXor(a, b);
                    }, {
                        a: a,
                        b: b
                    });
                };
                LogicalOps.where = function (condition, a, b) {
                    util.assert(condition.dtype === 'bool' || a.dtype === 'bool' || b.dtype === 'bool', 'Error Array must be of type bool.');
                    util.assertShapesMatch(a.shape, b.shape, 'Error in where: ');
                    if (condition.rank === 1) {
                        util.assert(condition.shape[0] === a.shape[0], 'The first dimension of `a` must match the size of `condition`.');
                    } else {
                        util.assertShapesMatch(condition.shape, b.shape, 'Error in where: ');
                    }
                    var dtype = types.upcastType(a.dtype, b.dtype);
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.where(condition, a, b, dtype);
                    }, {
                        condition: condition,
                        a: a,
                        b: b
                    });
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], LogicalOps, "logicalNot", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], LogicalOps, "logicalAnd", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], LogicalOps, "logicalOr", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], LogicalOps, "logicalXor", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Logical'
                    }),
                    operation_1.operation
                ], LogicalOps, "where", null);
                return LogicalOps;
            }());
            exports.LogicalOps = LogicalOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../types": 149,
            "../util": 150,
            "./broadcast_util": 108,
            "./operation": 120
        }],
        116: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var operation_1 = require("./operation");
            var LRNOps = (function () {
                function LRNOps() {}
                LRNOps.localResponseNormalization = function (x, radius, bias, alpha, beta, normRegion) {
                    if (radius === void 0) {
                        radius = 5;
                    }
                    if (bias === void 0) {
                        bias = 1;
                    }
                    if (alpha === void 0) {
                        alpha = 1;
                    }
                    if (beta === void 0) {
                        beta = 0.5;
                    }
                    if (normRegion === void 0) {
                        normRegion = 'acrossChannels';
                    }
                    util.assert(x.rank === 4 || x.rank === 3, "Error in localResponseNormalization: x must be rank 3 or 4 but got\n               rank " + x.rank + ".");
                    util.assert(util.isInt(radius), "Error in localResponseNormalization3D: radius must be an integer\n                     but got radius " + radius + ".");
                    var x4D = x;
                    var reshapedTo4D = false;
                    if (x.rank === 3) {
                        reshapedTo4D = true;
                        x4D = x.as4D(1, x.shape[0], x.shape[1], x.shape[2]);
                    }
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.localResponseNormalization4D(x4D, radius, bias, alpha, beta, normRegion);
                    }, {
                        x4D: x4D
                    });
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    } else {
                        return res;
                    }
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Normalization'
                    }),
                    operation_1.operation
                ], LRNOps, "localResponseNormalization", null);
                return LRNOps;
            }());
            exports.LRNOps = LRNOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./operation": 120
        }],
        117: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var operation_1 = require("./operation");
            var LSTMOps = (function () {
                function LSTMOps() {}
                LSTMOps.multiRNNCell = function (lstmCells, data, c, h) {
                    var input = data;
                    var newStates = [];
                    for (var i = 0; i < lstmCells.length; i++) {
                        var output = lstmCells[i](input, c[i], h[i]);
                        newStates.push(output[0]);
                        newStates.push(output[1]);
                        input = output[1];
                    }
                    var newC = [];
                    var newH = [];
                    for (var i = 0; i < newStates.length; i += 2) {
                        newC.push(newStates[i]);
                        newH.push(newStates[i + 1]);
                    }
                    return [newC, newH];
                };
                LSTMOps.basicLSTMCell = function (forgetBias, lstmKernel, lstmBias, data, c, h) {
                    var combined = data.concat(h, 1);
                    var weighted = combined.matMul(lstmKernel);
                    var res = weighted.add(lstmBias);
                    var batchSize = res.shape[0];
                    var sliceCols = res.shape[1] / 4;
                    var sliceSize = [batchSize, sliceCols];
                    var i = res.slice([0, 0], sliceSize);
                    var j = res.slice([0, sliceCols], sliceSize);
                    var f = res.slice([0, sliceCols * 2], sliceSize);
                    var o = res.slice([0, sliceCols * 3], sliceSize);
                    var newC = i.sigmoid().mulStrict(j.tanh()).addStrict(c.mulStrict(forgetBias.add(f).sigmoid()));
                    var newH = newC.tanh().mulStrict(o.sigmoid());
                    return [newC, newH];
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'RNN'
                    }),
                    operation_1.operation
                ], LSTMOps, "multiRNNCell", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'RNN'
                    }),
                    operation_1.operation
                ], LSTMOps, "basicLSTMCell", null);
                return LSTMOps;
            }());
            exports.LSTMOps = LSTMOps;

        }, {
            "../doc": 32,
            "./operation": 120
        }],
        118: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var operation_1 = require("./operation");
            var MatrixOrientation;
            (function (MatrixOrientation) {
                MatrixOrientation[MatrixOrientation["REGULAR"] = 0] = "REGULAR";
                MatrixOrientation[MatrixOrientation["TRANSPOSED"] = 1] = "TRANSPOSED";
            })(MatrixOrientation = exports.MatrixOrientation || (exports.MatrixOrientation = {}));
            var MatmulOps = (function () {
                function MatmulOps() {}
                MatmulOps.matMul = function (a, b, transposeA, transposeB) {
                    if (transposeA === void 0) {
                        transposeA = false;
                    }
                    if (transposeB === void 0) {
                        transposeB = false;
                    }
                    _a = [enumToBool(transposeA), enumToBool(transposeB)], transposeA = _a[0], transposeB = _a[1];
                    var innerShapeA = transposeA ? a.shape[0] : a.shape[1];
                    var innerShapeB = transposeB ? b.shape[1] : b.shape[0];
                    util.assert(a.rank === 2 && b.rank === 2, "Error in matMul: inputs must be rank 2, got ranks " + a.rank +
                        (" and " + b.rank + "."));
                    util.assert(innerShapeA === innerShapeB, "Error in matMul: inner shapes (" + innerShapeA + ") and (" +
                        (innerShapeB + ") of Tensors with shapes " + a.shape + " and ") +
                        (b.shape + " and transposeA=" + transposeA) +
                        (" and transposeB=" + transposeB + " must match."));
                    var grad = function (dy) {
                        if (transposeA || transposeB) {
                            throw new Error("Backprop for transposed MatMul not yet implemented.");
                        }
                        return {
                            a: function () {
                                return dy.matMul(b.toFloat(), false, true);
                            },
                            b: function () {
                                return a.toFloat().matMul(dy, true, false);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.matMul(a, b, transposeA, transposeB);
                    }, {
                        a: a,
                        b: b
                    }, grad);
                    var _a;
                };
                MatmulOps.vectorTimesMatrix = function (v, matrix) {
                    util.assert(v.rank === 1, "Error in vectorTimesMatrix: first input must be rank 1, but got " +
                        ("rank " + v.rank + "."));
                    util.assert(matrix.rank === 2, "Error in vectorTimesMatrix: second input must be rank 2, but got " +
                        ("rank " + matrix.rank + "."));
                    util.assert(v.size === matrix.shape[0], "Error in vectorTimesMatrix: size of vector (" + v.size + ") " +
                        ("must match first dimension of matrix (" + matrix.shape[0] + ")"));
                    return v.as2D(1, -1).matMul(matrix).as1D();
                };
                MatmulOps.matrixTimesVector = function (matrix, v) {
                    util.assert(v.rank === 1, "Error in matrixTimesVector: second input must rank 1, but got " +
                        ("rank " + v.rank + "."));
                    util.assert(matrix.rank === 2, "Error in matrixTimesVector: first input must be a rank 2, but got " +
                        ("rank " + matrix.rank + "."));
                    util.assert(v.size === matrix.shape[1], "Error in matrixTimesVector: size of first rank 1 input " + v.size + " " +
                        "must match inner dimension of second rank 2 input, but got " +
                        ("shape " + matrix.shape + "."));
                    return matrix.matMul(v.as2D(-1, 1)).as1D();
                };
                MatmulOps.dotProduct = function (v1, v2) {
                    util.assert(v1.rank === 1 && v2.rank === 1, "Error in dotProduct: inputs must be rank 1, but got ranks " +
                        (v1.rank + " and " + v2.rank + "."));
                    util.assert(v1.size === v2.size, "Error in dotProduct: size of inputs (" + v1.size + ") and (" +
                        (v2.size + ") must match."));
                    return v1.as2D(1, -1).matMul(v2.as2D(-1, 1)).asScalar();
                };
                MatmulOps.outerProduct = function (v1, v2) {
                    util.assert(v1.rank === 1 && v2.rank === 1, "Error in outerProduct: inputs must be rank 1, but got ranks " +
                        (v1.rank + " and " + v2.rank + "."));
                    return v1.as2D(-1, 1).matMul(v2.as2D(1, -1));
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Matrices'
                    }),
                    operation_1.operation
                ], MatmulOps, "matMul", null);
                __decorate([
                    operation_1.operation
                ], MatmulOps, "vectorTimesMatrix", null);
                __decorate([
                    operation_1.operation
                ], MatmulOps, "matrixTimesVector", null);
                __decorate([
                    operation_1.operation
                ], MatmulOps, "dotProduct", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Matrices'
                    }),
                    operation_1.operation
                ], MatmulOps, "outerProduct", null);
                return MatmulOps;
            }());
            exports.MatmulOps = MatmulOps;

            function enumToBool(transpose) {
                if (transpose === MatrixOrientation.REGULAR) {
                    return false;
                }
                if (transpose === MatrixOrientation.TRANSPOSED) {
                    return true;
                }
                return transpose;
            }

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./operation": 120
        }],
        119: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var axis_util = require("./axis_util");
            var operation_1 = require("./operation");
            var ops = require("./ops");
            var NormOps = (function () {
                function NormOps() {}
                NormOps.norm = function (x, ord, axis, keepDims) {
                    if (ord === void 0) {
                        ord = 'euclidean';
                    }
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    var norm = normImpl(x, ord, axis);
                    var keepDimsShape = norm.shape;
                    if (keepDims) {
                        var axes = axis_util.parseAxisParam(axis, x.shape);
                        keepDimsShape = axis_util.expandShapeToKeepDim(norm.shape, axes);
                    }
                    return norm.reshape(keepDimsShape);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Matrices'
                    }),
                    operation_1.operation
                ], NormOps, "norm", null);
                return NormOps;
            }());
            exports.NormOps = NormOps;

            function normImpl(x, p, axis) {
                if (axis === void 0) {
                    axis = null;
                }
                if (x.rank === 0) {
                    return x.abs();
                }
                if (x.rank !== 1 && axis === null) {
                    return normImpl(x.reshape([-1]), p, axis);
                }
                if (x.rank === 1 || typeof axis === 'number' ||
                    axis instanceof Array && axis.length === 1) {
                    if (p === 1) {
                        return x.abs().sum(axis);
                    }
                    if (p === Infinity) {
                        return x.abs().max(axis);
                    }
                    if (p === -Infinity) {
                        return x.abs().min(axis);
                    }
                    if (p === 'euclidean' || p === 2) {
                        return x.abs().pow(ops.scalar(2, 'int32')).sum(axis).sqrt();
                    }
                    throw new Error("Error in norm: invalid ord value: " + p);
                }
                if (axis instanceof Array && axis.length === 2) {
                    if (p === 1) {
                        return x.abs().sum(axis[0]).max(axis[1] - 1);
                    }
                    if (p === Infinity) {
                        return x.abs().sum(axis[1]).max(axis[0]);
                    }
                    if (p === -Infinity) {
                        return x.abs().sum(axis[1]).min(axis[0]);
                    }
                    if (p === 'fro' || p === 'euclidean') {
                        return x.square().sum(axis).sqrt();
                    }
                    throw new Error("Error in norm: invalid ord value: " + p);
                }
                throw new Error("Error in norm: invalid axis: " + axis);
            }

        }, {
            "../doc": 32,
            "./axis_util": 105,
            "./operation": 120,
            "./ops": 121
        }],
        120: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var globals_1 = require("../globals");

            function operation(target, name, descriptor) {
                var fn = descriptor.value;
                descriptor.value = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return globals_1.tidy(name, function () {
                        return fn.apply(void 0, args);
                    });
                };
                return descriptor;
            }
            exports.operation = operation;

        }, {
            "../globals": 35
        }],
        121: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var array_ops_1 = require("./array_ops");
            var batchnorm_1 = require("./batchnorm");
            var binary_ops_1 = require("./binary_ops");
            var compare_1 = require("./compare");
            var concat_1 = require("./concat");
            var conv_1 = require("./conv");
            var image_ops_1 = require("./image_ops");
            var logical_ops_1 = require("./logical_ops");
            var lrn_1 = require("./lrn");
            var lstm_1 = require("./lstm");
            var matmul_1 = require("./matmul");
            var norm_1 = require("./norm");
            var pool_1 = require("./pool");
            var reduction_ops_1 = require("./reduction_ops");
            var reverse_1 = require("./reverse");
            var slice_1 = require("./slice");
            var softmax_1 = require("./softmax");
            var transpose_1 = require("./transpose");
            var unary_ops_1 = require("./unary_ops");
            exports.batchNormalization = batchnorm_1.BatchNormOps.batchNormalization;
            exports.batchNormalization2d = batchnorm_1.BatchNormOps.batchNormalization2d;
            exports.batchNormalization3d = batchnorm_1.BatchNormOps.batchNormalization3d;
            exports.batchNormalization4d = batchnorm_1.BatchNormOps.batchNormalization4d;
            exports.concat = concat_1.ConcatOps.concat;
            exports.concat1d = concat_1.ConcatOps.concat1d;
            exports.concat2d = concat_1.ConcatOps.concat2d;
            exports.concat3d = concat_1.ConcatOps.concat3d;
            exports.concat4d = concat_1.ConcatOps.concat4d;
            exports.conv1d = conv_1.ConvOps.conv1d;
            exports.conv2d = conv_1.ConvOps.conv2d;
            exports.conv2dTranspose = conv_1.ConvOps.conv2dTranspose;
            exports.depthwiseConv2d = conv_1.ConvOps.depthwiseConv2d;
            exports.matMul = matmul_1.MatmulOps.matMul;
            exports.matrixTimesVector = matmul_1.MatmulOps.matrixTimesVector;
            exports.outerProduct = matmul_1.MatmulOps.outerProduct;
            exports.vectorTimesMatrix = matmul_1.MatmulOps.vectorTimesMatrix;
            exports.avgPool = pool_1.PoolOps.avgPool;
            exports.maxPool = pool_1.PoolOps.maxPool;
            exports.minPool = pool_1.PoolOps.minPool;
            exports.transpose = transpose_1.TransposeOps.transpose;
            exports.reverse = reverse_1.ReverseOps.reverse;
            exports.reverse1d = reverse_1.ReverseOps.reverse1d;
            exports.reverse2d = reverse_1.ReverseOps.reverse2d;
            exports.reverse3d = reverse_1.ReverseOps.reverse3d;
            exports.reverse4d = reverse_1.ReverseOps.reverse4d;
            exports.slice = slice_1.SliceOps.slice;
            exports.slice1d = slice_1.SliceOps.slice1d;
            exports.slice2d = slice_1.SliceOps.slice2d;
            exports.slice3d = slice_1.SliceOps.slice3d;
            exports.slice4d = slice_1.SliceOps.slice4d;
            exports.argMax = reduction_ops_1.ReductionOps.argMax;
            exports.argMin = reduction_ops_1.ReductionOps.argMin;
            exports.logSumExp = reduction_ops_1.ReductionOps.logSumExp;
            exports.max = reduction_ops_1.ReductionOps.max;
            exports.mean = reduction_ops_1.ReductionOps.mean;
            exports.min = reduction_ops_1.ReductionOps.min;
            exports.moments = reduction_ops_1.ReductionOps.moments;
            exports.sum = reduction_ops_1.ReductionOps.sum;
            exports.equal = compare_1.CompareOps.equal;
            exports.equalStrict = compare_1.CompareOps.equalStrict;
            exports.greater = compare_1.CompareOps.greater;
            exports.greaterStrict = compare_1.CompareOps.greaterStrict;
            exports.greaterEqual = compare_1.CompareOps.greaterEqual;
            exports.greaterEqualStrict = compare_1.CompareOps.greaterEqualStrict;
            exports.less = compare_1.CompareOps.less;
            exports.lessStrict = compare_1.CompareOps.lessStrict;
            exports.lessEqual = compare_1.CompareOps.lessEqual;
            exports.lessEqualStrict = compare_1.CompareOps.lessEqualStrict;
            exports.notEqual = compare_1.CompareOps.notEqual;
            exports.notEqualStrict = compare_1.CompareOps.notEqualStrict;
            exports.logicalNot = logical_ops_1.LogicalOps.logicalNot;
            exports.logicalAnd = logical_ops_1.LogicalOps.logicalAnd;
            exports.logicalOr = logical_ops_1.LogicalOps.logicalOr;
            exports.logicalXor = logical_ops_1.LogicalOps.logicalXor;
            exports.where = logical_ops_1.LogicalOps.where;
            exports.abs = unary_ops_1.UnaryOps.abs;
            exports.acos = unary_ops_1.UnaryOps.acos;
            exports.asin = unary_ops_1.UnaryOps.asin;
            exports.atan = unary_ops_1.UnaryOps.atan;
            exports.ceil = unary_ops_1.UnaryOps.ceil;
            exports.clipByValue = unary_ops_1.UnaryOps.clipByValue;
            exports.cos = unary_ops_1.UnaryOps.cos;
            exports.cosh = unary_ops_1.UnaryOps.cosh;
            exports.elu = unary_ops_1.UnaryOps.elu;
            exports.exp = unary_ops_1.UnaryOps.exp;
            exports.floor = unary_ops_1.UnaryOps.floor;
            exports.leakyRelu = unary_ops_1.UnaryOps.leakyRelu;
            exports.log = unary_ops_1.UnaryOps.log;
            exports.neg = unary_ops_1.UnaryOps.neg;
            exports.prelu = unary_ops_1.UnaryOps.prelu;
            exports.relu = unary_ops_1.UnaryOps.relu;
            exports.selu = unary_ops_1.UnaryOps.selu;
            exports.sigmoid = unary_ops_1.UnaryOps.sigmoid;
            exports.sin = unary_ops_1.UnaryOps.sin;
            exports.sinh = unary_ops_1.UnaryOps.sinh;
            exports.sqrt = unary_ops_1.UnaryOps.sqrt;
            exports.square = unary_ops_1.UnaryOps.square;
            exports.step = unary_ops_1.UnaryOps.step;
            exports.tan = unary_ops_1.UnaryOps.tan;
            exports.tanh = unary_ops_1.UnaryOps.tanh;
            exports.add = binary_ops_1.BinaryOps.add;
            exports.addStrict = binary_ops_1.BinaryOps.addStrict;
            exports.div = binary_ops_1.BinaryOps.div;
            exports.divStrict = binary_ops_1.BinaryOps.divStrict;
            exports.maximum = binary_ops_1.BinaryOps.maximum;
            exports.maximumStrict = binary_ops_1.BinaryOps.maximumStrict;
            exports.minimum = binary_ops_1.BinaryOps.minimum;
            exports.minimumStrict = binary_ops_1.BinaryOps.minimumStrict;
            exports.mul = binary_ops_1.BinaryOps.mul;
            exports.mulStrict = binary_ops_1.BinaryOps.mulStrict;
            exports.pow = binary_ops_1.BinaryOps.pow;
            exports.powStrict = binary_ops_1.BinaryOps.powStrict;
            exports.sub = binary_ops_1.BinaryOps.sub;
            exports.subStrict = binary_ops_1.BinaryOps.subStrict;
            exports.norm = norm_1.NormOps.norm;
            exports.cast = array_ops_1.ArrayOps.cast;
            exports.clone = array_ops_1.ArrayOps.clone;
            exports.fromPixels = array_ops_1.ArrayOps.fromPixels;
            exports.ones = array_ops_1.ArrayOps.ones;
            exports.onesLike = array_ops_1.ArrayOps.onesLike;
            exports.zeros = array_ops_1.ArrayOps.zeros;
            exports.zerosLike = array_ops_1.ArrayOps.zerosLike;
            exports.rand = array_ops_1.ArrayOps.rand;
            exports.randomNormal = array_ops_1.ArrayOps.randomNormal;
            exports.truncatedNormal = array_ops_1.ArrayOps.truncatedNormal;
            exports.randomUniform = array_ops_1.ArrayOps.randomUniform;
            exports.reshape = array_ops_1.ArrayOps.reshape;
            exports.squeeze = array_ops_1.ArrayOps.squeeze;
            exports.tile = array_ops_1.ArrayOps.tile;
            exports.gather = array_ops_1.ArrayOps.gather;
            exports.oneHot = array_ops_1.ArrayOps.oneHot;
            exports.linspace = array_ops_1.ArrayOps.linspace;
            exports.range = array_ops_1.ArrayOps.range;
            exports.buffer = array_ops_1.ArrayOps.buffer;
            exports.fill = array_ops_1.ArrayOps.fill;
            exports.tensor = array_ops_1.ArrayOps.tensor;
            exports.scalar = array_ops_1.ArrayOps.scalar;
            exports.tensor1d = array_ops_1.ArrayOps.tensor1d;
            exports.tensor2d = array_ops_1.ArrayOps.tensor2d;
            exports.tensor3d = array_ops_1.ArrayOps.tensor3d;
            exports.tensor4d = array_ops_1.ArrayOps.tensor4d;
            exports.print = array_ops_1.ArrayOps.print;
            exports.expandDims = array_ops_1.ArrayOps.expandDims;
            exports.stack = array_ops_1.ArrayOps.stack;
            exports.pad = array_ops_1.ArrayOps.pad;
            exports.pad1d = array_ops_1.ArrayOps.pad1d;
            exports.pad2d = array_ops_1.ArrayOps.pad2d;
            exports.pad3d = array_ops_1.ArrayOps.pad3d;
            exports.pad4d = array_ops_1.ArrayOps.pad4d;
            exports.basicLSTMCell = lstm_1.LSTMOps.basicLSTMCell;
            exports.multiRNNCell = lstm_1.LSTMOps.multiRNNCell;
            exports.softmax = softmax_1.SoftmaxOps.softmax;
            exports.localResponseNormalization = lrn_1.LRNOps.localResponseNormalization;
            var tensor_1 = require("../tensor");
            var types_1 = require("../types");
            [tensor_1.Tensor, types_1.Rank, tensor_1.Tensor3D, tensor_1.Tensor4D];
            exports.losses = {
                softmaxCrossEntropy: softmax_1.SoftmaxOps.softmaxCrossEntropy
            };
            exports.image = {
                resizeBilinear: image_ops_1.ImageOps.resizeBilinear
            };

        }, {
            "../tensor": 144,
            "../types": 149,
            "./array_ops": 104,
            "./batchnorm": 106,
            "./binary_ops": 107,
            "./compare": 109,
            "./concat": 110,
            "./conv": 112,
            "./image_ops": 114,
            "./logical_ops": 115,
            "./lrn": 116,
            "./lstm": 117,
            "./matmul": 118,
            "./norm": 119,
            "./pool": 122,
            "./reduction_ops": 125,
            "./reverse": 126,
            "./slice": 128,
            "./softmax": 130,
            "./transpose": 131,
            "./unary_ops": 132
        }],
        122: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var conv_util = require("./conv_util");
            var operation_1 = require("./operation");
            var PoolOps = (function () {
                function PoolOps() {}
                PoolOps.maxPool = function (x, filterSize, strides, pad, dimRoundingMode) {
                    var x4D = x;
                    var reshapedTo4D = false;
                    if (x.rank === 3) {
                        reshapedTo4D = true;
                        x4D = x.as4D(1, x.shape[0], x.shape[1], x.shape[2]);
                    }
                    util.assert(x4D.rank === 4, "Error in maxPool: input must be rank 4 but got rank " + x4D.rank + ".");
                    if (dimRoundingMode != null) {
                        util.assert(util.isInt(pad), "Error in maxPool: pad must be an integer when using, " +
                            ("dimRoundingMode " + dimRoundingMode + " but got pad " + pad + "."));
                    }
                    var convInfo = conv_util.computePool2DInfo(x4D.shape, filterSize, strides, pad, dimRoundingMode);
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return PoolOps.maxPoolBackprop(dy, x4D, filterSize, strides, pad);
                            }
                        };
                    };
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.maxPool(x4D, convInfo);
                    }, {
                        x: x4D
                    }, grad);
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    }
                    return res;
                };
                PoolOps.maxPoolBackprop = function (dy, input, filterSize, strides, pad, dimRoundingMode) {
                    util.assert(input.rank === dy.rank, "Rank of input (" + input.rank + ") does not match rank of dy (" + dy.rank + ")");
                    var input4D = input;
                    var dy4D = dy;
                    var reshapedTo4D = false;
                    if (input.rank === 3) {
                        reshapedTo4D = true;
                        input4D = input.as4D(1, input.shape[0], input.shape[1], input.shape[2]);
                        dy4D = dy.as4D(1, dy.shape[0], dy.shape[1], dy.shape[2]);
                    }
                    util.assert(dy4D.rank === 4, "Error in maxPoolBackprop: dy must be rank 4 but got rank " +
                        (dy4D.rank + "."));
                    util.assert(input4D.rank === 4, "Error in maxPoolBackprop: input must be rank 4 but got rank " +
                        (input4D.rank + "."));
                    if (dimRoundingMode != null) {
                        util.assert(util.isInt(pad), "Error in maxPoolBackprop: pad must be an integer when using, " +
                            ("dimRoundingMode " + dimRoundingMode + " but got pad " + pad + "."));
                    }
                    var convInfo = conv_util.computePool2DInfo(input4D.shape, filterSize, strides, pad, dimRoundingMode);
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.maxPoolBackprop(dy4D, input4D, convInfo);
                    }, {
                        dy4D: dy4D,
                        input4D: input4D
                    });
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    }
                    return res;
                };
                PoolOps.minPool = function (input, filterSize, strides, pad, dimRoundingMode) {
                    var input4D = input;
                    var reshapedTo4D = false;
                    if (input.rank === 3) {
                        reshapedTo4D = true;
                        input4D = input.as4D(1, input.shape[0], input.shape[1], input.shape[2]);
                    }
                    util.assert(input4D.rank === 4, "Error in minPool: x must be rank 4 but got rank " + input4D.rank + ".");
                    if (dimRoundingMode != null) {
                        util.assert(util.isInt(pad), "Error in minPool: pad must be an integer when using, " +
                            ("dimRoundingMode " + dimRoundingMode + " but got pad " + pad + "."));
                    }
                    var convInfo = conv_util.computePool2DInfo(input4D.shape, filterSize, strides, pad, dimRoundingMode);
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.minPool(input4D, convInfo);
                    }, {
                        input4D: input4D
                    });
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    }
                    return res;
                };
                PoolOps.avgPool = function (x, filterSize, strides, pad, dimRoundingMode) {
                    var x4D = x;
                    var reshapedTo4D = false;
                    if (x.rank === 3) {
                        reshapedTo4D = true;
                        x4D = x.as4D(1, x.shape[0], x.shape[1], x.shape[2]);
                    }
                    util.assert(x4D.rank === 4, "Error in avgPool: x must be rank 4 but got rank " + x4D.rank + ".");
                    if (dimRoundingMode != null) {
                        util.assert(util.isInt(pad), "Error in avgPool: pad must be an integer when using, " +
                            ("dimRoundingMode " + dimRoundingMode + " but got pad " + pad + "."));
                    }
                    var convInfo = conv_util.computePool2DInfo(x4D.shape, filterSize, strides, pad);
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return PoolOps.avgPoolBackprop(dy, x4D, filterSize, strides, pad);
                            }
                        };
                    };
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.avgPool(x4D, convInfo);
                    }, {
                        x: x4D
                    }, grad);
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    }
                    return res;
                };
                PoolOps.avgPoolBackprop = function (dy, input, filterSize, strides, pad) {
                    util.assert(input.rank === dy.rank, "Rank of input (" + input.rank + ") does not match rank of dy (" + dy.rank + ")");
                    var input4D = input;
                    var dy4D = dy;
                    var reshapedTo4D = false;
                    if (input.rank === 3) {
                        reshapedTo4D = true;
                        input4D = input.as4D(1, input.shape[0], input.shape[1], input.shape[2]);
                        dy4D = dy.as4D(1, dy.shape[0], dy.shape[1], dy.shape[2]);
                    }
                    util.assert(dy4D.rank === 4, "Error in avgPoolBackprop: dy must be rank 4 but got rank " +
                        (dy4D.rank + "."));
                    util.assert(input4D.rank === 4, "Error in avgPoolBackprop: input must be rank 4 but got rank " +
                        (input4D.rank + "."));
                    var convInfo = conv_util.computePool2DInfo(input4D.shape, filterSize, strides, pad);
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.avgPoolBackprop(dy4D, input4D, convInfo);
                    }, {
                        dy4D: dy4D,
                        input4D: input4D
                    });
                    if (reshapedTo4D) {
                        return res.as3D(res.shape[1], res.shape[2], res.shape[3]);
                    }
                    return res;
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Convolution'
                    }),
                    operation_1.operation
                ], PoolOps, "maxPool", null);
                __decorate([
                    operation_1.operation
                ], PoolOps, "maxPoolBackprop", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Convolution'
                    }),
                    operation_1.operation
                ], PoolOps, "minPool", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Convolution'
                    }),
                    operation_1.operation
                ], PoolOps, "avgPool", null);
                __decorate([
                    operation_1.operation
                ], PoolOps, "avgPoolBackprop", null);
                return PoolOps;
            }());
            exports.PoolOps = PoolOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./conv_util": 113,
            "./operation": 120
        }],
        123: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var seedrandom = require("seedrandom");
            var MPRandGauss = (function () {
                function MPRandGauss(mean, stdDeviation, dtype, truncated, seed) {
                    this.mean = mean;
                    this.stdDev = stdDeviation;
                    this.dtype = dtype;
                    this.nextVal = NaN;
                    this.truncated = truncated;
                    if (this.truncated) {
                        this.upper = this.mean + this.stdDev * 2;
                        this.lower = this.mean - this.stdDev * 2;
                    }
                    var seedValue = seed ? seed : Math.random();
                    this.random = seedrandom.alea(seedValue.toString());
                }
                MPRandGauss.prototype.nextValue = function () {
                    if (!isNaN(this.nextVal)) {
                        var value = this.nextVal;
                        this.nextVal = NaN;
                        return value;
                    }
                    var resultX, resultY;
                    var isValid = false;
                    while (!isValid) {
                        var v1 = void 0,
                            v2 = void 0,
                            s = void 0;
                        do {
                            v1 = 2 * this.random() - 1;
                            v2 = 2 * this.random() - 1;
                            s = v1 * v1 + v2 * v2;
                        } while (s >= 1 || s === 0);
                        var mul = Math.sqrt(-2.0 * Math.log(s) / s);
                        resultX = this.mean + this.stdDev * v1 * mul;
                        resultY = this.mean + this.stdDev * v2 * mul;
                        if (!this.truncated || this.isValidTruncated(resultX)) {
                            isValid = true;
                        }
                    }
                    if (!this.truncated || this.isValidTruncated(resultY)) {
                        this.nextVal = this.convertValue(resultY);
                    }
                    return this.convertValue(resultX);
                };
                MPRandGauss.prototype.convertValue = function (value) {
                    if (this.dtype == null || this.dtype === 'float32') {
                        return value;
                    }
                    return Math.round(value);
                };
                MPRandGauss.prototype.isValidTruncated = function (value) {
                    return value <= this.upper && value >= this.lower;
                };
                return MPRandGauss;
            }());
            exports.MPRandGauss = MPRandGauss;

        }, {
            "seedrandom": 153
        }],
        124: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.PARALLELIZE_THRESHOLD = 30;

            function computeOptimalWindowSize(inSize) {
                if (inSize <= exports.PARALLELIZE_THRESHOLD) {
                    return inSize;
                }
                return nearestDivisor(inSize, Math.floor(Math.sqrt(inSize)));
            }
            exports.computeOptimalWindowSize = computeOptimalWindowSize;

            function nearestDivisor(size, start) {
                for (var i = start; i < size; ++i) {
                    if (size % i === 0) {
                        return i;
                    }
                }
                return size;
            }

        }, {}],
        125: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var globals_1 = require("../globals");
            var tensor_1 = require("../tensor");
            var util = require("../util");
            var axis_util = require("./axis_util");
            var operation_1 = require("./operation");
            var ops = require("./ops");
            var ReductionOps = (function () {
                function ReductionOps() {}
                ReductionOps.logSumExp = function (input, axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    var axes = axis_util.parseAxisParam(axis, input.shape);
                    var xMax = input.max(axes, true);
                    var a = input.sub(xMax);
                    var b = a.exp();
                    var c = b.sum(axes);
                    var d = c.log();
                    var res = xMax.reshape(d.shape).add(d);
                    if (keepDims) {
                        var newShape = axis_util.expandShapeToKeepDim(res.shape, axes);
                        return res.reshape(newShape);
                    }
                    return res;
                };
                ReductionOps.sum = function (x, axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    var axes = axis_util.parseAxisParam(axis, x.shape);
                    var customOp = globals_1.customGrad(function (x) {
                        var permutation = axis_util.getAxesPermutation(axes, x.rank);
                        var reductionAxes = axes;
                        var permutedX = x;
                        if (permutation != null) {
                            permutedX = x.transpose(permutation);
                            reductionAxes =
                                axis_util.getInnerMostAxes(reductionAxes.length, x.rank);
                        }
                        var value = environment_1.ENV.engine.runKernel(function (backend) {
                            return backend.sum(permutedX, reductionAxes);
                        }, {
                            permutedX: permutedX
                        });
                        if (keepDims) {
                            var newShape = axis_util.expandShapeToKeepDim(value.shape, axes);
                            value = value.reshape(newShape);
                        }
                        var gradFunc = function (dy) {
                            var expandedDyShape = x.shape.slice();
                            axes.forEach(function (axis) {
                                expandedDyShape[axis] = 1;
                            });
                            var expandedDy = dy.reshape(expandedDyShape);
                            var derX = expandedDy.mul(tensor_1.Tensor.ones(x.shape, 'float32'));
                            return derX;
                        };
                        return {
                            value: value,
                            gradFunc: gradFunc
                        };
                    });
                    return customOp(x);
                };
                ReductionOps.mean = function (x, axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    var axes = axis_util.parseAxisParam(axis, x.shape);
                    var shapes = axis_util.computeOutAndReduceShapes(x.shape, axes);
                    var reduceShape = shapes[1];
                    var reduceSize = util.sizeFromShape(reduceShape);
                    var customOp = globals_1.customGrad(function (x) {
                        var reduceSizeScalar = ops.scalar(reduceSize);
                        var res = x.div(reduceSizeScalar);
                        var value = res.sum(axis, keepDims);
                        var gradFunc = function (dy) {
                            var expandedDyShape = x.shape.slice();
                            axes.forEach(function (axis) {
                                expandedDyShape[axis] = 1;
                            });
                            var expandedDy = dy.reshape(expandedDyShape);
                            var derX = expandedDy.mul(tensor_1.Tensor.ones(x.shape, 'float32'))
                                .div(reduceSizeScalar);
                            return derX;
                        };
                        return {
                            value: value,
                            gradFunc: gradFunc
                        };
                    });
                    return customOp(x);
                };
                ReductionOps.min = function (x, axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    var origAxes = axis_util.parseAxisParam(axis, x.shape);
                    var axes = origAxes;
                    var permutedAxes = axis_util.getAxesPermutation(axes, x.rank);
                    if (permutedAxes != null) {
                        x = x.transpose(permutedAxes);
                        axes = axis_util.getInnerMostAxes(axes.length, x.rank);
                    }
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.min(x, axes);
                    }, {
                        x: x
                    });
                    if (keepDims) {
                        var newShape = axis_util.expandShapeToKeepDim(res.shape, origAxes);
                        return res.reshape(newShape);
                    }
                    return res;
                };
                ReductionOps.max = function (x, axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    var origAxes = axis_util.parseAxisParam(axis, x.shape);
                    var axes = origAxes;
                    var permutedAxes = axis_util.getAxesPermutation(axes, x.rank);
                    if (permutedAxes != null) {
                        x = x.transpose(permutedAxes);
                        axes = axis_util.getInnerMostAxes(axes.length, x.rank);
                    }
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.max(x, axes);
                    }, {
                        x: x
                    });
                    if (keepDims) {
                        var newShape = axis_util.expandShapeToKeepDim(res.shape, origAxes);
                        return res.reshape(newShape);
                    }
                    return res;
                };
                ReductionOps.argMin = function (x, axis) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    var axes = axis_util.parseAxisParam(axis, x.shape);
                    var permutedAxes = axis_util.getAxesPermutation(axes, x.rank);
                    if (permutedAxes != null) {
                        x = x.transpose(permutedAxes);
                        axes = axis_util.getInnerMostAxes(axes.length, x.rank);
                    }
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.argMin(x, axes);
                    }, {
                        x: x
                    });
                };
                ReductionOps.argMax = function (x, axis) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    var axes = axis_util.parseAxisParam(axis, x.shape);
                    var permutedAxes = axis_util.getAxesPermutation(axes, x.rank);
                    if (permutedAxes != null) {
                        x = x.transpose(permutedAxes);
                        axes = axis_util.getInnerMostAxes(axes.length, x.rank);
                    }
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.argMax(x, axes);
                    }, {
                        x: x
                    });
                };
                ReductionOps.moments = function (x, axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    var axes = axis_util.parseAxisParam(axis, x.shape);
                    var mean = x.mean(axes, keepDims);
                    var keepDimsShape = mean.shape;
                    if (!keepDims) {
                        keepDimsShape = axis_util.expandShapeToKeepDim(mean.shape, axes);
                    }
                    var devSquared = x.toFloat().sub(mean.reshape(keepDimsShape)).square();
                    var variance = devSquared.mean(axes, keepDims);
                    return {
                        mean: mean,
                        variance: variance
                    };
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Reduction'
                    }),
                    operation_1.operation
                ], ReductionOps, "logSumExp", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Reduction'
                    }),
                    operation_1.operation
                ], ReductionOps, "sum", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Reduction'
                    }),
                    operation_1.operation
                ], ReductionOps, "mean", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Reduction'
                    }),
                    operation_1.operation
                ], ReductionOps, "min", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Reduction'
                    }),
                    operation_1.operation
                ], ReductionOps, "max", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Reduction'
                    }),
                    operation_1.operation
                ], ReductionOps, "argMin", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Reduction'
                    }),
                    operation_1.operation
                ], ReductionOps, "argMax", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Normalization'
                    }),
                    operation_1.operation
                ], ReductionOps, "moments", null);
                return ReductionOps;
            }());
            exports.ReductionOps = ReductionOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../globals": 35,
            "../tensor": 144,
            "../util": 150,
            "./axis_util": 105,
            "./operation": 120,
            "./ops": 121
        }],
        126: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var axis_util_1 = require("./axis_util");
            var operation_1 = require("./operation");
            var ReverseOps = (function () {
                function ReverseOps() {}
                ReverseOps.reverse1d = function (x) {
                    util.assert(x.rank === 1, "Error in reverse1D: x must be rank 1 but got\n             rank " + x.rank + ".");
                    return ReverseOps.reverse(x, 0);
                };
                ReverseOps.reverse2d = function (x, axis) {
                    util.assert(x.rank === 2, "Error in reverse2D: x must be rank 2 but got\n             rank " + x.rank + ".");
                    return ReverseOps.reverse(x, axis);
                };
                ReverseOps.reverse3d = function (x, axis) {
                    util.assert(x.rank === 3, "Error in reverse3D: x must be rank 3 but got\n             rank " + x.rank + ".");
                    return ReverseOps.reverse(x, axis);
                };
                ReverseOps.reverse4d = function (x, axis) {
                    util.assert(x.rank === 4, "Error in reverse4D: x must be rank 4 but got\n             rank " + x.rank + ".");
                    return ReverseOps.reverse(x, axis);
                };
                ReverseOps.reverse = function (x, axis) {
                    if (x.rank === 0) {
                        return x.clone();
                    }
                    var axes = axis_util_1.parseAxisParam(axis, x.shape);
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.reverse(axes);
                            }
                        };
                    };
                    var res = environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.reverse(x, axes);
                    }, {
                        x: x
                    }, grad);
                    return res.reshapeAs(x);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Slicing and Joining'
                    }),
                    operation_1.operation
                ], ReverseOps, "reverse", null);
                return ReverseOps;
            }());
            exports.ReverseOps = ReverseOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./axis_util": 105,
            "./operation": 120
        }],
        127: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.SELU_SCALEALPHA = 1.7580993408473768599402175208123;
            exports.SELU_SCALE = 1.0507009873554804934193349852946;

        }, {}],
        128: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var operation_1 = require("./operation");
            var slice_util = require("./slice_util");
            var SliceOps = (function () {
                function SliceOps() {}
                SliceOps.slice1d = function (x, begin, size) {
                    util.assert(x.rank === 1, "slice1d expects a rank-1 tensor, but got a rank-" + x.rank + " tensor");
                    return SliceOps.slice(x, [begin], [size]);
                };
                SliceOps.slice2d = function (x, begin, size) {
                    util.assert(x.rank === 2, "slice1d expects a rank-2 tensor, but got a rank-" + x.rank + " tensor");
                    return SliceOps.slice(x, begin, size);
                };
                SliceOps.slice3d = function (x, begin, size) {
                    util.assert(x.rank === 3, "slice1d expects a rank-3 tensor, but got a rank-" + x.rank + " tensor");
                    return SliceOps.slice(x, begin, size);
                };
                SliceOps.slice4d = function (x, begin, size) {
                    util.assert(x.rank === 4, "slice1d expects a rank-4 tensor, but got a rank-" + x.rank + " tensor");
                    return SliceOps.slice(x, begin, size);
                };
                SliceOps.slice = function (x, begin, size) {
                    slice_util.assertParamsValid(x, begin, size);
                    if (x.rank === 0) {
                        throw new Error('Slicing scalar is not possible');
                    }
                    var inputShape = x.shape;
                    var grad = function (dy) {
                        var paddings = [];
                        for (var i = 0; i < dy.rank; i++) {
                            paddings.push([begin[i], inputShape[i] - begin[i] - size[i]]);
                        }
                        return {
                            x: function () {
                                return dy.pad(paddings);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.slice(x, begin, size);
                    }, {
                        x: x
                    }, grad);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Slicing and Joining'
                    }),
                    operation_1.operation
                ], SliceOps, "slice", null);
                return SliceOps;
            }());
            exports.SliceOps = SliceOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./operation": 120,
            "./slice_util": 129
        }],
        129: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var util = require("../util");

            function assertParamsValid(input, begin, size) {
                util.assert(input.rank === begin.length, "Error in slice" + input.rank + "D: Length of begin " + begin + " must " +
                    ("match the rank of the array (" + input.rank + ")."));
                util.assert(input.rank === size.length, "Error in slice" + input.rank + "D: Length of size " + size + " must " +
                    ("match the rank of the array (" + input.rank + ")."));
                for (var i = 0; i < input.rank; ++i) {
                    util.assert(begin[i] + size[i] <= input.shape[i], "Error in slice" + input.rank + "D: begin[" + i + "] + size[" + i + "] " +
                        ("(" + (begin[i] + size[i]) + ") would overflow input.shape[" + i + "] (" + input.shape[i] + ")"));
                }
            }
            exports.assertParamsValid = assertParamsValid;

        }, {
            "../util": 150
        }],
        130: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var globals_1 = require("../globals");
            var util = require("../util");
            var axis_util = require("./axis_util");
            var operation_1 = require("./operation");
            var ops = require("./ops");
            var SoftmaxOps = (function () {
                function SoftmaxOps() {}
                SoftmaxOps.softmax = function (logits, dim) {
                    if (dim === void 0) {
                        dim = -1;
                    }
                    if (dim === -1) {
                        dim = logits.rank - 1;
                    }
                    if (dim !== logits.rank - 1) {
                        throw Error('Softmax along a non-last dimension is not yet supported. ' +
                            ("Logits was rank " + logits.rank + " and dim was " + dim));
                    }
                    var customOp = globals_1.customGrad(function (logits) {
                        var keepDims = true;
                        var lse = logits.logSumExp([dim], keepDims);
                        var logResult = logits.toFloat().sub(lse);
                        var y = logResult.exp();
                        var gradFunc = function (dy) {
                            var dyTimesY = dy.mul(y);
                            var keepDims = true;
                            return dyTimesY.sub(dyTimesY.sum([dim], keepDims).mul(y));
                        };
                        return {
                            value: y,
                            gradFunc: gradFunc
                        };
                    });
                    return customOp(logits);
                };
                SoftmaxOps.softmaxCrossEntropy = function (labels, logits, dim) {
                    if (dim === void 0) {
                        dim = -1;
                    }
                    util.assertShapesMatch(labels.shape, logits.shape, 'Error in softmaxCrossEntropy: ');
                    if (dim === -1) {
                        dim = logits.rank - 1;
                    }
                    if (dim !== logits.rank - 1) {
                        throw Error("Softmax cross entropy along a non-last dimension is not yet " +
                            ("supported. Labels / logits was rank " + logits.rank + " ") +
                            ("and dim was " + dim));
                    }
                    var customOp = globals_1.customGrad(function (labels, logits) {
                        var predictedProbs = logits.softmax(dim);
                        var costVector = ops.scalar(1e-5).add(predictedProbs).log().mul(labels).neg();
                        var value = costVector.sum([dim]);
                        var gradFunc = function (dy) {
                            var dyShape = axis_util.expandShapeToKeepDim(dy.shape, [dim]);
                            return [
                                dy.reshape(dyShape).mul(labels.toFloat().sub(predictedProbs)),
                                dy.reshape(dyShape).mul(predictedProbs.sub(labels.toFloat())),
                            ];
                        };
                        return {
                            value: value,
                            gradFunc: gradFunc
                        };
                    });
                    return customOp(labels, logits);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Normalization'
                    }),
                    operation_1.operation
                ], SoftmaxOps, "softmax", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Losses',
                        namespace: 'losses'
                    }),
                    operation_1.operation
                ], SoftmaxOps, "softmaxCrossEntropy", null);
                return SoftmaxOps;
            }());
            exports.SoftmaxOps = SoftmaxOps;

        }, {
            "../doc": 32,
            "../globals": 35,
            "../util": 150,
            "./axis_util": 105,
            "./operation": 120,
            "./ops": 121
        }],
        131: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var axis_util = require("./axis_util");
            var operation_1 = require("./operation");
            var TransposeOps = (function () {
                function TransposeOps() {}
                TransposeOps.transpose = function (x, perm) {
                    if (perm == null) {
                        perm = x.shape.map(function (s, i) {
                            return i;
                        }).reverse();
                    }
                    var der = function (dy) {
                        var undoPerm = axis_util.getUndoAxesPermutation(perm);
                        return {
                            x: function () {
                                return dy.transpose(undoPerm);
                            }
                        };
                    };
                    util.assert(x.rank === perm.length, "Error in transpose: rank of input " + x.rank + " " +
                        ("must match length of perm " + perm + "."));
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.transpose(x, perm);
                    }, {
                        x: x
                    }, der);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Matrices'
                    }),
                    operation_1.operation
                ], TransposeOps, "transpose", null);
                return TransposeOps;
            }());
            exports.TransposeOps = TransposeOps;

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./axis_util": 105,
            "./operation": 120
        }],
        132: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var environment_1 = require("../environment");
            var util = require("../util");
            var operation_1 = require("./operation");
            var ops = require("./ops");
            var ops_1 = require("./ops");
            var selu_util = require("./selu_util");
            var UnaryOps = (function () {
                function UnaryOps() {}
                UnaryOps.neg = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.neg();
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.neg(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.ceil = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return ops.zerosLike(dy);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.ceil(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.floor = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return ops.zerosLike(dy);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.floor(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.exp = function (x) {
                    var bck = function (dy, saved) {
                        var y = saved[0];
                        return {
                            x: function () {
                                return dy.mulStrict(y);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend, save) {
                        return save(backend.exp(x));
                    }, {
                        x: x
                    }, bck);
                };
                UnaryOps.log = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.divStrict(x.toFloat());
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.log(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.sqrt = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.divStrict(x.toFloat().sqrt().mul(ops.scalar(2)));
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.sqrt(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.square = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.mulStrict(x.toFloat().mul(ops.scalar(2)));
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.square(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.abs = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.mulStrict(x.toFloat().step(-1));
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.abs(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.clipByValue = function (x, clipValueMin, clipValueMax) {
                    util.assert((clipValueMin <= clipValueMax), "Error in clip: min (" + clipValueMin + ") must be" +
                        ("less than or equal to max (" + clipValueMax + ")."));
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.where(x.greater(ops.scalar(clipValueMin))
                                    .logicalAnd(x.less(ops.scalar(clipValueMax))), ops_1.zerosLike(dy));
                            },
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.clip(x, clipValueMin, clipValueMax);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.relu = function (x) {
                    var grad = function (dy) {
                        var stepRes = x.step();
                        return {
                            x: function () {
                                return dy.mulStrict(stepRes.toFloat());
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.relu(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.elu = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.mulStrict(eluDer(x));
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.elu(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.selu = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                var mask = x.greater(ops.scalar(0));
                                var scaleAlpha = ops.scalar(selu_util.SELU_SCALEALPHA);
                                var scale = ops.scalar(selu_util.SELU_SCALE);
                                var greaterThanZeroDer = dy.mul(scale);
                                var lessEqualZeroDer = dy.mul(scaleAlpha).mul(x.toFloat().exp());
                                return ops.where(mask, greaterThanZeroDer, lessEqualZeroDer);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.selu(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.leakyRelu = function (x, alpha) {
                    if (alpha === void 0) {
                        alpha = 0.2;
                    }
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.mulStrict(x.step(alpha));
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.leakyRelu(x, alpha);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.prelu = function (x, alpha) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.mulStrict(preluDer(x, alpha));
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.prelu(x, alpha);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.sigmoid = function (x) {
                    var grad = function (dy, saved) {
                        var y = saved[0];
                        return {
                            x: function () {
                                return dy.mulStrict(y.mul(ops.scalar(1).sub(y)));
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend, save) {
                        return save(backend.sigmoid(x));
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.sin = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return x.toFloat().cos().mulStrict(dy);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.sin(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.cos = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return x.toFloat().sin().neg().mulStrict(dy);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.cos(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.tan = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.divStrict(x.cos().square());
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.tan(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.asin = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.divStrict(UnaryOps.sqrt(ops.scalar(1).sub(x.toFloat().square())));
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.asin(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.acos = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.divStrict(UnaryOps.sqrt(ops.scalar(1).sub(x.toFloat().square())))
                                    .neg();
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.acos(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.atan = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return dy.divStrict(ops.scalar(1).add(x.toFloat().square()));
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.atan(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.sinh = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return x.toFloat().cosh().mulStrict(dy);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.sinh(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.cosh = function (x) {
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return x.toFloat().sinh().mulStrict(dy);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.cosh(x);
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.tanh = function (x) {
                    var grad = function (dy, saved) {
                        var y = saved[0];
                        return {
                            x: function () {
                                return ops.scalar(1).sub(y.square()).mulStrict(dy);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend, save) {
                        return save(backend.tanh(x));
                    }, {
                        x: x
                    }, grad);
                };
                UnaryOps.step = function (x, alpha) {
                    if (alpha === void 0) {
                        alpha = 0.0;
                    }
                    var grad = function (dy) {
                        return {
                            x: function () {
                                return ops.zerosLike(dy);
                            }
                        };
                    };
                    return environment_1.ENV.engine.runKernel(function (backend) {
                        return backend.step(x, alpha);
                    }, {
                        x: x
                    }, grad);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "neg", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "ceil", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "floor", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "exp", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "log", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "sqrt", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "square", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "abs", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "clipByValue", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "relu", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "elu", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "selu", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "leakyRelu", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "prelu", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "sigmoid", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "sin", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "cos", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "tan", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "asin", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "acos", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "atan", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "sinh", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "cosh", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "tanh", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Operations',
                        subheading: 'Basic math'
                    }),
                    operation_1.operation
                ], UnaryOps, "step", null);
                return UnaryOps;
            }());
            exports.UnaryOps = UnaryOps;

            function preluDer(x, alpha) {
                return environment_1.ENV.engine.runKernel(function (backend) {
                    return backend.preluDer(x, alpha);
                }, {
                    x: x,
                    alpha: alpha
                });
            }

            function eluDer(x) {
                return environment_1.ENV.engine.runKernel(function (backend) {
                    return backend.eluDer(x);
                }, {
                    x: x
                });
            }

        }, {
            "../doc": 32,
            "../environment": 34,
            "../util": 150,
            "./operation": 120,
            "./ops": 121,
            "./selu_util": 127
        }],
        133: [function (require, module, exports) {
            "use strict";
            var __extends = (this && this.__extends) || (function () {
                var extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function (d, b) {
                            d.__proto__ = b;
                        }) ||
                    function (d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return function (d, b) {
                    extendStatics(d, b);

                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            })();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../environment");
            var globals_1 = require("../globals");
            var tensor_array_map_1 = require("../graph/tensor_array_map");
            var ops_1 = require("../ops/ops");
            var tensor_1 = require("../tensor");
            var optimizer_1 = require("./optimizer");
            var AdadeltaOptimizer = (function (_super) {
                __extends(AdadeltaOptimizer, _super);

                function AdadeltaOptimizer(learningRate, rho, specifiedVariableList, epsilon) {
                    if (epsilon === void 0) {
                        epsilon = 1e-8;
                    }
                    var _this = _super.call(this, learningRate, specifiedVariableList) || this;
                    _this.accumulatedGrads = {};
                    _this.accumulatedUpdates = {};
                    _this.accumulatedSquaredGradientsGraph = new tensor_array_map_1.TensorArrayMap();
                    _this.accumulatedUpdatesGraph = new tensor_array_map_1.TensorArrayMap();
                    _this.c = globals_1.keep(ops_1.scalar(-learningRate));
                    _this.epsilon = globals_1.keep(ops_1.scalar(epsilon));
                    _this.rho = globals_1.keep(ops_1.scalar(rho));
                    _this.oneMinusRho = globals_1.keep(ops_1.scalar(1 - rho));
                    return _this;
                }
                AdadeltaOptimizer.prototype.applyGradients = function (variableGradients) {
                    var _this = this;
                    var _loop_1 = function (variableName) {
                        var value = environment_1.ENV.engine.registeredVariables[variableName];
                        if (this_1.accumulatedGrads[variableName] == null) {
                            var trainable_1 = false;
                            globals_1.tidy(function () {
                                _this.accumulatedGrads[variableName] =
                                    ops_1.zerosLike(value).variable(trainable_1);
                            });
                        }
                        if (this_1.accumulatedUpdates[variableName] == null) {
                            var trainable_2 = false;
                            globals_1.tidy(function () {
                                _this.accumulatedUpdates[variableName] =
                                    ops_1.zerosLike(value).variable(trainable_2);
                            });
                        }
                        var gradient = variableGradients[variableName];
                        var accumulatedGrad = this_1.accumulatedGrads[variableName];
                        var accumulatedUpdate = this_1.accumulatedUpdates[variableName];
                        globals_1.tidy(function () {
                            var newAccumulatedGrad = _this.rho.mul(accumulatedGrad)
                                .add(_this.oneMinusRho.mul(gradient.square()));
                            var updates = accumulatedUpdate.add(_this.epsilon)
                                .sqrt()
                                .div(accumulatedGrad.add(_this.epsilon).sqrt())
                                .mul(gradient);
                            var newAccumulatedUpdate = _this.rho.mul(accumulatedUpdate)
                                .add(_this.oneMinusRho.mul(updates.square()));
                            _this.accumulatedGrads[variableName].assign(newAccumulatedGrad);
                            _this.accumulatedUpdates[variableName].assign(newAccumulatedUpdate);
                            var newValue = _this.c.mul(updates).add(value);
                            value.assign(newValue);
                        });
                    };
                    var this_1 = this;
                    for (var variableName in variableGradients) {
                        _loop_1(variableName);
                    }
                };
                AdadeltaOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
                    if (this.accumulatedSquaredGradientsGraph.size() === 0) {
                        this.variableNodes.forEach(function (node) {
                            _this.accumulatedSquaredGradientsGraph.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                            _this.accumulatedUpdatesGraph.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                        });
                    }
                };
                AdadeltaOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    if (this.one == null) {
                        this.one = globals_1.keep(ops_1.scalar(1));
                    }
                    globals_1.tidy(function () {
                        _this.variableNodes.forEach(function (node) {
                            var oldVariable = activationArrayMap.get(node.output);
                            var gradient = _this.variableGradients.get(node.output);
                            var oldCache = _this.accumulatedSquaredGradientsGraph.get(node.output);
                            var oldUpdates = _this.accumulatedUpdatesGraph.get(node.output);
                            var gradientSquare = math.multiply(gradient, gradient);
                            var cache = math.scaledArrayAdd(_this.rho, oldCache, math.subtract(_this.one, _this.rho), gradientSquare);
                            var updates = math.multiply(math.divide(math.sqrt(math.add(oldUpdates, _this.epsilon)), math.sqrt(math.add(oldCache, _this.epsilon))), gradient);
                            var variable = math.scaledArrayAdd(_this.cGraph, updates, _this.one, oldVariable);
                            var updateSquare = math.multiply(updates, updates);
                            var newUpdates = math.scaledArrayAdd(_this.rho, oldUpdates, math.subtract(_this.one, _this.rho), updateSquare);
                            _this.accumulatedSquaredGradientsGraph.set(node.output, globals_1.keep(cache));
                            _this.accumulatedUpdatesGraph.set(node.output, globals_1.keep(newUpdates));
                            activationArrayMap.set(node.output, globals_1.keep(variable));
                            node.data = variable;
                            oldVariable.dispose();
                            oldCache.dispose();
                            oldUpdates.dispose();
                        });
                    });
                    this.variableGradients.dispose();
                    this.variableGradients = new tensor_array_map_1.TensorArrayMap();
                };
                AdadeltaOptimizer.prototype.dispose = function () {
                    var _this = this;
                    _super.prototype.dispose.call(this);
                    this.c.dispose();
                    this.epsilon.dispose();
                    this.rho.dispose();
                    this.oneMinusRho.dispose();
                    if (this.one != null) {
                        this.one.dispose();
                    }
                    if (this.accumulatedSquaredGradientsGraph != null) {
                        this.accumulatedSquaredGradientsGraph.dispose();
                    }
                    if (this.accumulatedUpdatesGraph != null) {
                        this.accumulatedUpdatesGraph.dispose();
                    }
                    if (this.accumulatedUpdates != null) {
                        Object.keys(this.accumulatedUpdates)
                            .forEach(function (name) {
                                return _this.accumulatedUpdates[name].dispose();
                            });
                        Object.keys(this.accumulatedGrads)
                            .forEach(function (name) {
                                return _this.accumulatedGrads[name].dispose();
                            });
                    }
                };
                return AdadeltaOptimizer;
            }(optimizer_1.Optimizer));
            exports.AdadeltaOptimizer = AdadeltaOptimizer;

        }, {
            "../environment": 34,
            "../globals": 35,
            "../graph/tensor_array_map": 66,
            "../ops/ops": 121,
            "../tensor": 144,
            "./optimizer": 138
        }],
        134: [function (require, module, exports) {
            "use strict";
            var __extends = (this && this.__extends) || (function () {
                var extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function (d, b) {
                            d.__proto__ = b;
                        }) ||
                    function (d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return function (d, b) {
                    extendStatics(d, b);

                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            })();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../environment");
            var globals_1 = require("../globals");
            var tensor_array_map_1 = require("../graph/tensor_array_map");
            var ops_1 = require("../ops/ops");
            var tensor_1 = require("../tensor");
            var optimizer_1 = require("./optimizer");
            var AdagradOptimizer = (function (_super) {
                __extends(AdagradOptimizer, _super);

                function AdagradOptimizer(learningRate, specifiedVariableList, initialAccumulatorValue) {
                    if (initialAccumulatorValue === void 0) {
                        initialAccumulatorValue = 0.1;
                    }
                    var _this = _super.call(this, learningRate, specifiedVariableList) || this;
                    _this.learningRate = learningRate;
                    _this.initialAccumulatorValue = initialAccumulatorValue;
                    _this.accumulatedGrads = {};
                    _this.accumulatedSquaredGradients = new tensor_array_map_1.TensorArrayMap();
                    _this.c = globals_1.keep(ops_1.scalar(-learningRate));
                    _this.epsilon = globals_1.keep(ops_1.scalar(1e-8));
                    return _this;
                }
                AdagradOptimizer.prototype.applyGradients = function (variableGradients) {
                    var _this = this;
                    var _loop_1 = function (variableName) {
                        var value = environment_1.ENV.engine.registeredVariables[variableName];
                        if (this_1.accumulatedGrads[variableName] == null) {
                            var trainable_1 = false;
                            globals_1.tidy(function () {
                                _this.accumulatedGrads[variableName] =
                                    ops_1.fill(value.shape, _this.initialAccumulatorValue)
                                    .variable(trainable_1);
                            });
                        }
                        var gradient = variableGradients[variableName];
                        var accumulatedGrad = this_1.accumulatedGrads[variableName];
                        globals_1.tidy(function () {
                            var newAccumulatedGrad = accumulatedGrad.add(gradient.square());
                            _this.accumulatedGrads[variableName].assign(newAccumulatedGrad);
                            var newValue = _this.c
                                .mul(gradient.div(newAccumulatedGrad.add(_this.epsilon).sqrt()))
                                .add(value);
                            value.assign(newValue);
                        });
                    };
                    var this_1 = this;
                    for (var variableName in variableGradients) {
                        _loop_1(variableName);
                    }
                };
                AdagradOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
                    if (this.accumulatedSquaredGradients.size() === 0) {
                        this.variableNodes.forEach(function (node) {
                            _this.accumulatedSquaredGradients.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                        });
                    }
                };
                AdagradOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    if (this.one == null) {
                        this.one = globals_1.keep(ops_1.scalar(1));
                    }
                    globals_1.tidy(function () {
                        _this.variableNodes.forEach(function (node) {
                            var oldVariable = activationArrayMap.get(node.output);
                            var gradient = _this.variableGradients.get(node.output);
                            var oldCache = _this.accumulatedSquaredGradients.get(node.output);
                            var gradientSquare = math.multiply(gradient, gradient);
                            var cache = math.add(oldCache, gradientSquare);
                            var variable = math.scaledArrayAdd(_this.cGraph, math.divide(gradient, math.add(math.sqrt(cache), _this.epsilon)), _this.one, oldVariable);
                            _this.accumulatedSquaredGradients.set(node.output, globals_1.keep(cache));
                            activationArrayMap.set(node.output, globals_1.keep(variable));
                            node.data = variable;
                            oldVariable.dispose();
                            oldCache.dispose();
                        });
                    });
                    this.variableGradients.dispose();
                    this.variableGradients = new tensor_array_map_1.TensorArrayMap();
                };
                AdagradOptimizer.prototype.dispose = function () {
                    var _this = this;
                    _super.prototype.dispose.call(this);
                    this.epsilon.dispose();
                    this.c.dispose();
                    if (this.one != null) {
                        this.one.dispose();
                    }
                    if (this.accumulatedSquaredGradients != null) {
                        this.accumulatedSquaredGradients.dispose();
                    }
                    if (this.accumulatedGrads != null) {
                        Object.keys(this.accumulatedGrads)
                            .forEach(function (name) {
                                return _this.accumulatedGrads[name].dispose();
                            });
                    }
                };
                return AdagradOptimizer;
            }(optimizer_1.Optimizer));
            exports.AdagradOptimizer = AdagradOptimizer;

        }, {
            "../environment": 34,
            "../globals": 35,
            "../graph/tensor_array_map": 66,
            "../ops/ops": 121,
            "../tensor": 144,
            "./optimizer": 138
        }],
        135: [function (require, module, exports) {
            "use strict";
            var __extends = (this && this.__extends) || (function () {
                var extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function (d, b) {
                            d.__proto__ = b;
                        }) ||
                    function (d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return function (d, b) {
                    extendStatics(d, b);

                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            })();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../environment");
            var globals_1 = require("../globals");
            var tensor_array_map_1 = require("../graph/tensor_array_map");
            var ops_1 = require("../ops/ops");
            var tensor_1 = require("../tensor");
            var optimizer_1 = require("./optimizer");
            var AdamOptimizer = (function (_super) {
                __extends(AdamOptimizer, _super);

                function AdamOptimizer(learningRate, beta1, beta2, epsilon, specifiedVariableList) {
                    if (epsilon === void 0) {
                        epsilon = 1e-8;
                    }
                    var _this = _super.call(this, learningRate, specifiedVariableList) || this;
                    _this.learningRate = learningRate;
                    _this.accumulatedFirstMoment = {};
                    _this.accumulatedSecondMoment = {};
                    _this.firstMomentGraph = new tensor_array_map_1.TensorArrayMap();
                    _this.secondMomentGraph = new tensor_array_map_1.TensorArrayMap();
                    _this.c = globals_1.keep(ops_1.scalar(-learningRate));
                    _this.eps = globals_1.keep(ops_1.scalar(epsilon));
                    _this.beta1 = globals_1.keep(ops_1.scalar(beta1));
                    _this.beta2 = globals_1.keep(ops_1.scalar(beta2));
                    globals_1.tidy(function () {
                        _this.accBeta1 = ops_1.scalar(beta1).variable();
                        _this.accBeta2 = ops_1.scalar(beta2).variable();
                    });
                    _this.oneMinusBeta1 = globals_1.keep(ops_1.scalar(1 - beta1));
                    _this.oneMinusBeta2 = globals_1.keep(ops_1.scalar(1 - beta2));
                    _this.one = globals_1.keep(ops_1.scalar(1));
                    return _this;
                }
                AdamOptimizer.prototype.applyGradients = function (variableGradients) {
                    var _this = this;
                    globals_1.tidy(function () {
                        var oneMinusAccBeta1 = _this.one.sub(_this.accBeta1);
                        var oneMinusAccBeta2 = _this.one.sub(_this.accBeta2);
                        for (var variableName in variableGradients) {
                            var value = environment_1.ENV.engine.registeredVariables[variableName];
                            if (_this.accumulatedFirstMoment[variableName] == null) {
                                var trainable = false;
                                _this.accumulatedFirstMoment[variableName] =
                                    ops_1.zerosLike(value).variable(trainable);
                            }
                            if (_this.accumulatedSecondMoment[variableName] == null) {
                                var trainable = false;
                                _this.accumulatedSecondMoment[variableName] =
                                    ops_1.zerosLike(value).variable(trainable);
                            }
                            var gradient = variableGradients[variableName];
                            var firstMoment = _this.accumulatedFirstMoment[variableName];
                            var secondMoment = _this.accumulatedSecondMoment[variableName];
                            var newFirstMoment = _this.beta1.mul(firstMoment).add(_this.oneMinusBeta1.mul(gradient));
                            var newSecondMoment = _this.beta2.mul(secondMoment)
                                .add(_this.oneMinusBeta2.mul(gradient.square()));
                            var biasCorrectedFirstMoment = newFirstMoment.div(oneMinusAccBeta1);
                            var biasCorrectedSecondMoment = newSecondMoment.div(oneMinusAccBeta2);
                            _this.accumulatedFirstMoment[variableName].assign(newFirstMoment);
                            _this.accumulatedSecondMoment[variableName].assign(newSecondMoment);
                            var newValue = _this.c
                                .mul(biasCorrectedFirstMoment.div(_this.eps.add(biasCorrectedSecondMoment.sqrt())))
                                .add(value);
                            value.assign(newValue);
                        }
                        _this.accBeta1.assign(_this.accBeta1.mul(_this.beta1));
                        _this.accBeta2.assign(_this.accBeta2.mul(_this.beta2));
                    });
                };
                AdamOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
                    if (this.firstMomentGraph.size() === 0) {
                        this.variableNodes.forEach(function (node) {
                            _this.firstMomentGraph.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                        });
                    }
                    if (this.secondMomentGraph.size() === 0) {
                        this.variableNodes.forEach(function (node) {
                            _this.secondMomentGraph.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                        });
                    }
                };
                AdamOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    globals_1.tidy(function () {
                        var oneMinusAccBeta1 = _this.one.sub(_this.accBeta1);
                        var oneMinusAccBeta2 = _this.one.sub(_this.accBeta2);
                        _this.variableNodes.forEach(function (node) {
                            var oldVariable = activationArrayMap.get(node.output);
                            var gradient = _this.variableGradients.get(node.output);
                            var oldFirstMoment = _this.firstMomentGraph.get(node.output);
                            var oldSecondMoment = _this.secondMomentGraph.get(node.output);
                            var newFirstMoment = math.scaledArrayAdd(_this.beta1, oldFirstMoment, _this.oneMinusBeta1, gradient);
                            var newSecondMoment = math.scaledArrayAdd(_this.beta2, oldSecondMoment, _this.oneMinusBeta2, gradient.square());
                            var biasCorrectedFirstMoment = newFirstMoment.div(oneMinusAccBeta1);
                            var biasCorrectedSecondMoment = newSecondMoment.div(oneMinusAccBeta2);
                            var variable = math.scaledArrayAdd(_this.cGraph, biasCorrectedFirstMoment.div(_this.eps.add(biasCorrectedSecondMoment.sqrt())), _this.one, oldVariable);
                            activationArrayMap.set(node.output, globals_1.keep(variable));
                            node.data = variable;
                            _this.firstMomentGraph.set(node.output, globals_1.keep(newFirstMoment));
                            _this.secondMomentGraph.set(node.output, globals_1.keep(newSecondMoment));
                            oldVariable.dispose();
                            gradient.dispose();
                            oldFirstMoment.dispose();
                            oldSecondMoment.dispose();
                        });
                        _this.accBeta1.assign(_this.accBeta1.mul(_this.beta1));
                        _this.accBeta2.assign(_this.accBeta2.mul(_this.beta2));
                    });
                    this.variableGradients.dispose();
                    this.variableGradients = new tensor_array_map_1.TensorArrayMap();
                };
                AdamOptimizer.prototype.dispose = function () {
                    var _this = this;
                    _super.prototype.dispose.call(this);
                    this.c.dispose();
                    this.eps.dispose();
                    this.beta1.dispose();
                    this.beta2.dispose();
                    this.accBeta1.dispose();
                    this.accBeta2.dispose();
                    this.oneMinusBeta1.dispose();
                    this.oneMinusBeta2.dispose();
                    this.one.dispose();
                    if (this.firstMomentGraph != null) {
                        this.firstMomentGraph.dispose();
                    }
                    if (this.secondMomentGraph != null) {
                        this.secondMomentGraph.dispose();
                    }
                    if (this.accumulatedFirstMoment != null) {
                        Object.keys(this.accumulatedFirstMoment)
                            .forEach(function (name) {
                                return _this.accumulatedFirstMoment[name].dispose();
                            });
                    }
                    if (this.accumulatedSecondMoment != null) {
                        Object.keys(this.accumulatedSecondMoment)
                            .forEach(function (name) {
                                return _this.accumulatedSecondMoment[name].dispose();
                            });
                    }
                };
                return AdamOptimizer;
            }(optimizer_1.Optimizer));
            exports.AdamOptimizer = AdamOptimizer;

        }, {
            "../environment": 34,
            "../globals": 35,
            "../graph/tensor_array_map": 66,
            "../ops/ops": 121,
            "../tensor": 144,
            "./optimizer": 138
        }],
        136: [function (require, module, exports) {
            "use strict";
            var __extends = (this && this.__extends) || (function () {
                var extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function (d, b) {
                            d.__proto__ = b;
                        }) ||
                    function (d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return function (d, b) {
                    extendStatics(d, b);

                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            })();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../environment");
            var globals_1 = require("../globals");
            var tensor_array_map_1 = require("../graph/tensor_array_map");
            var ops_1 = require("../ops/ops");
            var tensor_1 = require("../tensor");
            var optimizer_1 = require("./optimizer");
            var AdamaxOptimizer = (function (_super) {
                __extends(AdamaxOptimizer, _super);

                function AdamaxOptimizer(learningRate, beta1, beta2, epsilon, decay, specifiedVariableList) {
                    if (epsilon === void 0) {
                        epsilon = 1e-8;
                    }
                    if (decay === void 0) {
                        decay = 0.0;
                    }
                    var _this = _super.call(this, learningRate, specifiedVariableList) || this;
                    _this.learningRate = learningRate;
                    _this.accumulatedFirstMoment = {};
                    _this.accumulatedWeightedInfNorm = {};
                    _this.firstMomentGraph = new tensor_array_map_1.TensorArrayMap();
                    _this.weightedInfNormGraph = new tensor_array_map_1.TensorArrayMap();
                    _this.c = globals_1.keep(ops_1.scalar(-learningRate));
                    _this.eps = globals_1.keep(ops_1.scalar(epsilon));
                    _this.beta1 = globals_1.keep(ops_1.scalar(beta1));
                    _this.beta2 = globals_1.keep(ops_1.scalar(beta2));
                    _this.decay = globals_1.keep(ops_1.scalar(decay));
                    globals_1.tidy(function () {
                        _this.iteration = ops_1.scalar(0).variable();
                        _this.accBeta1 = ops_1.scalar(beta1).variable();
                    });
                    _this.oneMinusBeta1 = globals_1.keep(ops_1.scalar(1 - beta1));
                    _this.one = globals_1.keep(ops_1.scalar(1));
                    return _this;
                }
                AdamaxOptimizer.prototype.applyGradients = function (variableGradients) {
                    var _this = this;
                    globals_1.tidy(function () {
                        var oneMinusAccBeta1 = _this.one.sub(_this.accBeta1);
                        var lr = _this.c.div(_this.one.add(_this.decay.mul(_this.iteration)));
                        for (var variableName in variableGradients) {
                            var value = environment_1.ENV.engine.registeredVariables[variableName];
                            if (_this.accumulatedFirstMoment[variableName] == null) {
                                var trainable = false;
                                _this.accumulatedFirstMoment[variableName] =
                                    ops_1.zerosLike(value).variable(trainable);
                            }
                            if (_this.accumulatedWeightedInfNorm[variableName] == null) {
                                var trainable = false;
                                _this.accumulatedWeightedInfNorm[variableName] =
                                    ops_1.zerosLike(value).variable(trainable);
                            }
                            var gradient = variableGradients[variableName];
                            var firstMoment = _this.accumulatedFirstMoment[variableName];
                            var weightedInfNorm = _this.accumulatedWeightedInfNorm[variableName];
                            var newFirstMoment = _this.beta1.mul(firstMoment).add(_this.oneMinusBeta1.mul(gradient));
                            var ut0 = _this.beta2.mul(weightedInfNorm);
                            var ut1 = gradient.abs();
                            var newWeightedInfNorm = ut0.maximum(ut1);
                            _this.accumulatedFirstMoment[variableName].assign(newFirstMoment);
                            _this.accumulatedWeightedInfNorm[variableName].assign(newWeightedInfNorm);
                            var newValue = lr.div(oneMinusAccBeta1)
                                .mul(newFirstMoment.div(_this.eps.add(newWeightedInfNorm)))
                                .add(value);
                            value.assign(newValue);
                        }
                        _this.iteration.assign(_this.iteration.add(_this.one));
                        _this.accBeta1.assign(_this.accBeta1.mul(_this.beta1));
                    });
                };
                AdamaxOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
                    if (this.firstMomentGraph.size() === 0) {
                        this.variableNodes.forEach(function (node) {
                            _this.firstMomentGraph.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                        });
                    }
                    if (this.weightedInfNormGraph.size() === 0) {
                        this.variableNodes.forEach(function (node) {
                            _this.weightedInfNormGraph.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                        });
                    }
                };
                AdamaxOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    globals_1.tidy(function () {
                        var lr = _this.cGraph.div(_this.one.add(_this.decay.mul(_this.iteration)));
                        _this.variableNodes.forEach(function (node) {
                            var oldVariable = activationArrayMap.get(node.output);
                            var gradient = _this.variableGradients.get(node.output);
                            var oldFirstMoment = _this.firstMomentGraph.get(node.output);
                            var oldWeightedInfNorm = _this.weightedInfNormGraph.get(node.output);
                            var newFirstMoment = math.scaledArrayAdd(_this.beta1, oldFirstMoment, _this.oneMinusBeta1, gradient);
                            var ut0 = _this.beta2.mul(oldWeightedInfNorm);
                            var ut1 = gradient.abs();
                            var newWeightedInfNorm = ut0.maximum(ut1);
                            var variable = math.scaledArrayAdd(_this.one, oldVariable, lr.div(_this.one.sub(_this.accBeta1)), newFirstMoment.div(_this.eps.add(newWeightedInfNorm)));
                            activationArrayMap.set(node.output, globals_1.keep(variable));
                            node.data = variable;
                            _this.firstMomentGraph.set(node.output, globals_1.keep(newFirstMoment));
                            _this.weightedInfNormGraph.set(node.output, globals_1.keep(newWeightedInfNorm));
                            oldVariable.dispose();
                            gradient.dispose();
                            oldFirstMoment.dispose();
                            oldWeightedInfNorm.dispose();
                        });
                        _this.iteration.assign(_this.iteration.add(_this.one));
                        _this.accBeta1.assign(_this.accBeta1.mul(_this.beta1));
                    });
                    this.variableGradients.dispose();
                    this.variableGradients = new tensor_array_map_1.TensorArrayMap();
                };
                AdamaxOptimizer.prototype.dispose = function () {
                    var _this = this;
                    _super.prototype.dispose.call(this);
                    this.c.dispose();
                    this.eps.dispose();
                    this.accBeta1.dispose();
                    this.beta1.dispose();
                    this.beta2.dispose();
                    this.oneMinusBeta1.dispose();
                    this.decay.dispose();
                    this.iteration.dispose();
                    this.one.dispose();
                    if (this.firstMomentGraph != null) {
                        this.firstMomentGraph.dispose();
                    }
                    if (this.weightedInfNormGraph != null) {
                        this.weightedInfNormGraph.dispose();
                    }
                    if (this.accumulatedFirstMoment != null) {
                        Object.keys(this.accumulatedFirstMoment)
                            .forEach(function (name) {
                                return _this.accumulatedFirstMoment[name].dispose();
                            });
                    }
                    if (this.accumulatedWeightedInfNorm != null) {
                        Object.keys(this.accumulatedWeightedInfNorm)
                            .forEach(function (name) {
                                return _this.accumulatedWeightedInfNorm[name].dispose();
                            });
                    }
                };
                return AdamaxOptimizer;
            }(optimizer_1.Optimizer));
            exports.AdamaxOptimizer = AdamaxOptimizer;

        }, {
            "../environment": 34,
            "../globals": 35,
            "../graph/tensor_array_map": 66,
            "../ops/ops": 121,
            "../tensor": 144,
            "./optimizer": 138
        }],
        137: [function (require, module, exports) {
            "use strict";
            var __extends = (this && this.__extends) || (function () {
                var extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function (d, b) {
                            d.__proto__ = b;
                        }) ||
                    function (d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return function (d, b) {
                    extendStatics(d, b);

                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            })();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../environment");
            var globals_1 = require("../globals");
            var tensor_array_map_1 = require("../graph/tensor_array_map");
            var ops_1 = require("../ops/ops");
            var tensor_1 = require("../tensor");
            var sgd_optimizer_1 = require("./sgd_optimizer");
            var MomentumOptimizer = (function (_super) {
                __extends(MomentumOptimizer, _super);

                function MomentumOptimizer(learningRate, momentum, specifiedVariableList, useNesterov) {
                    if (useNesterov === void 0) {
                        useNesterov = false;
                    }
                    var _this = _super.call(this, learningRate, specifiedVariableList) || this;
                    _this.learningRate = learningRate;
                    _this.momentum = momentum;
                    _this.useNesterov = useNesterov;
                    _this.m = ops_1.scalar(_this.momentum);
                    _this.accumulations = {};
                    return _this;
                }
                MomentumOptimizer.prototype.applyGradients = function (variableGradients) {
                    var _this = this;
                    var _loop_1 = function (variableName) {
                        var value = environment_1.ENV.engine.registeredVariables[variableName];
                        if (this_1.accumulations[variableName] == null) {
                            var trainable_1 = false;
                            globals_1.tidy(function () {
                                _this.accumulations[variableName] =
                                    ops_1.zerosLike(value).variable(trainable_1);
                            });
                        }
                        var accumulation = this_1.accumulations[variableName];
                        var gradient = variableGradients[variableName];
                        globals_1.tidy(function () {
                            var newValue;
                            var newAccumulation = _this.m.mul(accumulation).add(gradient);
                            if (_this.useNesterov) {
                                newValue =
                                    _this.c.mul(gradient.add(newAccumulation.mul(_this.m))).add(value);
                            } else {
                                newValue = _this.c.mul(newAccumulation).add(value);
                            }
                            _this.accumulations[variableName].assign(newAccumulation);
                            value.assign(newValue);
                        });
                    };
                    var this_1 = this;
                    for (var variableName in variableGradients) {
                        _loop_1(variableName);
                    }
                };
                MomentumOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    if (this.variableVelocitiesGraph == null) {
                        this.variableVelocitiesGraph = new tensor_array_map_1.TensorArrayMap();
                    }
                    _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
                    if (this.variableVelocitiesGraph.size() === 0) {
                        this.variableNodes.forEach(function (node) {
                            _this.variableVelocitiesGraph.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                        });
                    }
                };
                MomentumOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    globals_1.tidy(function () {
                        _this.variableNodes.forEach(function (node) {
                            var oldVariable = activationArrayMap.get(node.output);
                            var gradient = _this.variableGradients.get(node.output);
                            var oldVelocity = _this.variableVelocitiesGraph.get(node.output);
                            var variable;
                            var velocity = _this.m.mul(oldVelocity).add(gradient);
                            if (_this.useNesterov) {
                                variable = _this.cGraph.mul(gradient.add(velocity.mul(_this.m)))
                                    .add(oldVariable);
                            } else {
                                variable = _this.cGraph.mul(velocity).add(oldVariable);
                            }
                            _this.variableVelocitiesGraph.set(node.output, globals_1.keep(velocity));
                            activationArrayMap.set(node.output, globals_1.keep(variable));
                            node.data = variable;
                            oldVariable.dispose();
                            oldVelocity.dispose();
                        });
                    });
                    this.variableGradients.dispose();
                    this.variableGradients = new tensor_array_map_1.TensorArrayMap();
                };
                MomentumOptimizer.prototype.dispose = function () {
                    _super.prototype.dispose.call(this);
                    this.m.dispose();
                    if (this.variableVelocitiesGraph != null) {
                        this.variableVelocitiesGraph.dispose();
                    }
                    if (this.accumulations != null) {
                        for (var variableName in this.accumulations) {
                            this.accumulations[variableName].dispose();
                        }
                    }
                };
                MomentumOptimizer.prototype.setMomentum = function (momentum) {
                    this.momentum = momentum;
                };
                return MomentumOptimizer;
            }(sgd_optimizer_1.SGDOptimizer));
            exports.MomentumOptimizer = MomentumOptimizer;

        }, {
            "../environment": 34,
            "../globals": 35,
            "../graph/tensor_array_map": 66,
            "../ops/ops": 121,
            "../tensor": 144,
            "./sgd_optimizer": 141
        }],
        138: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var globals_1 = require("../globals");
            var session_util = require("../graph/session_util");
            var tensor_array_map_1 = require("../graph/tensor_array_map");
            var ops = require("../ops/ops");
            var tensor_1 = require("../tensor");
            var Optimizer = (function () {
                function Optimizer(learningRate, specifiedVariableList) {
                    this.learningRate = learningRate;
                    this.variableGradients = new tensor_array_map_1.TensorArrayMap();
                    if (specifiedVariableList != null) {
                        this.specifiedVariableNodes = specifiedVariableList;
                    }
                }
                Optimizer.prototype.minimize = function (f, returnCost, varList) {
                    if (returnCost === void 0) {
                        returnCost = false;
                    }
                    var _a = this.computeGradients(f, varList),
                        value = _a.value,
                        grads = _a.grads;
                    this.applyGradients(grads);
                    var varNames = Object.keys(grads);
                    varNames.forEach(function (varName) {
                        return grads[varName].dispose();
                    });
                    if (returnCost) {
                        return value;
                    } else {
                        value.dispose();
                        return null;
                    }
                };
                Optimizer.prototype.computeGradients = function (f, varList) {
                    return globals_1.variableGrads(f, varList);
                };
                Optimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    this.variableNodes = this.specifiedVariableNodes == null ?
                        session_util.getVariableNodesFromEvaluationSet(runtime.nodes) :
                        this.specifiedVariableNodes;
                    if (batchSize !== this.prevBatchSize) {
                        if (this.cGraph != null) {
                            this.cGraph.dispose();
                        }
                        this.prevBatchSize = batchSize;
                        this.cGraph = math.keep(ops.scalar(-this.learningRate / batchSize));
                    }
                    this.variableNodes.forEach(function (node) {
                        return _this.variableGradients.set(node.output, math.keep(tensor_1.Tensor.zeros(node.output.shape)));
                    });
                };
                Optimizer.prototype.afterExample = function (math, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    globals_1.tidy(function () {
                        _this.variableNodes.forEach(function (node) {
                            var gradient = gradientArrayMap.get(node.output);
                            var accumulatedGradient = _this.variableGradients.get(node.output);
                            _this.variableGradients.set(node.output, globals_1.keep(math.add(gradient, accumulatedGradient)));
                            accumulatedGradient.dispose();
                        });
                    });
                };
                Optimizer.prototype.dispose = function () {
                    if (this.cGraph != null) {
                        this.cGraph.dispose();
                    }
                    if (this.variableNodes != null) {
                        this.variableNodes.forEach(function (node) {
                            node.data.dispose();
                        });
                    }
                    if (this.specifiedVariableNodes != null) {
                        this.specifiedVariableNodes.forEach(function (node) {
                            node.data.dispose();
                        });
                    }
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Optimizers'
                    })
                ], Optimizer.prototype, "minimize", null);
                Optimizer = __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Classes',
                        namespace: 'train'
                    })
                ], Optimizer);
                return Optimizer;
            }());
            exports.Optimizer = Optimizer;

        }, {
            "../doc": 32,
            "../globals": 35,
            "../graph/session_util": 65,
            "../graph/tensor_array_map": 66,
            "../ops/ops": 121,
            "../tensor": 144
        }],
        139: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("../doc");
            var adadelta_optimizer_1 = require("./adadelta_optimizer");
            var adagrad_optimizer_1 = require("./adagrad_optimizer");
            var adam_optimizer_1 = require("./adam_optimizer");
            var adamax_optimizer_1 = require("./adamax_optimizer");
            var momentum_optimizer_1 = require("./momentum_optimizer");
            var rmsprop_optimizer_1 = require("./rmsprop_optimizer");
            var sgd_optimizer_1 = require("./sgd_optimizer");
            var OptimizerConstructors = (function () {
                function OptimizerConstructors() {}
                OptimizerConstructors.sgd = function (learningRate) {
                    return new sgd_optimizer_1.SGDOptimizer(learningRate);
                };
                OptimizerConstructors.momentum = function (learningRate, momentum, useNesterov) {
                    if (useNesterov === void 0) {
                        useNesterov = false;
                    }
                    return new momentum_optimizer_1.MomentumOptimizer(learningRate, momentum, undefined, useNesterov);
                };
                OptimizerConstructors.rmsprop = function (learningRate, decay, momentum, epsilon) {
                    if (decay === void 0) {
                        decay = .9;
                    }
                    if (momentum === void 0) {
                        momentum = 0.0;
                    }
                    if (epsilon === void 0) {
                        epsilon = 1e-8;
                    }
                    return new rmsprop_optimizer_1.RMSPropOptimizer(learningRate, decay, momentum, undefined, epsilon);
                };
                OptimizerConstructors.adam = function (learningRate, beta1, beta2, epsilon) {
                    if (learningRate === void 0) {
                        learningRate = 0.001;
                    }
                    if (beta1 === void 0) {
                        beta1 = 0.9;
                    }
                    if (beta2 === void 0) {
                        beta2 = 0.999;
                    }
                    if (epsilon === void 0) {
                        epsilon = 1e-8;
                    }
                    return new adam_optimizer_1.AdamOptimizer(learningRate, beta1, beta2, epsilon, undefined);
                };
                OptimizerConstructors.adadelta = function (learningRate, rho, epsilon) {
                    if (learningRate === void 0) {
                        learningRate = .001;
                    }
                    if (rho === void 0) {
                        rho = .95;
                    }
                    if (epsilon === void 0) {
                        epsilon = 1e-8;
                    }
                    return new adadelta_optimizer_1.AdadeltaOptimizer(learningRate, rho, undefined, epsilon);
                };
                OptimizerConstructors.adamax = function (learningRate, beta1, beta2, epsilon, decay) {
                    if (learningRate === void 0) {
                        learningRate = 0.002;
                    }
                    if (beta1 === void 0) {
                        beta1 = 0.9;
                    }
                    if (beta2 === void 0) {
                        beta2 = 0.999;
                    }
                    if (epsilon === void 0) {
                        epsilon = 1e-8;
                    }
                    if (decay === void 0) {
                        decay = 0.0;
                    }
                    return new adamax_optimizer_1.AdamaxOptimizer(learningRate, beta1, beta2, epsilon, decay, undefined);
                };
                OptimizerConstructors.adagrad = function (learningRate, initialAccumulatorValue) {
                    if (initialAccumulatorValue === void 0) {
                        initialAccumulatorValue = 0.1;
                    }
                    return new adagrad_optimizer_1.AdagradOptimizer(learningRate, undefined, initialAccumulatorValue);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Optimizers',
                        namespace: 'train'
                    })
                ], OptimizerConstructors, "sgd", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Optimizers',
                        namespace: 'train'
                    })
                ], OptimizerConstructors, "momentum", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Optimizers',
                        namespace: 'train'
                    })
                ], OptimizerConstructors, "rmsprop", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Optimizers',
                        namespace: 'train'
                    })
                ], OptimizerConstructors, "adam", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Optimizers',
                        namespace: 'train'
                    })
                ], OptimizerConstructors, "adadelta", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Optimizers',
                        namespace: 'train'
                    })
                ], OptimizerConstructors, "adamax", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Training',
                        subheading: 'Optimizers',
                        namespace: 'train'
                    })
                ], OptimizerConstructors, "adagrad", null);
                return OptimizerConstructors;
            }());
            exports.OptimizerConstructors = OptimizerConstructors;

        }, {
            "../doc": 32,
            "./adadelta_optimizer": 133,
            "./adagrad_optimizer": 134,
            "./adam_optimizer": 135,
            "./adamax_optimizer": 136,
            "./momentum_optimizer": 137,
            "./rmsprop_optimizer": 140,
            "./sgd_optimizer": 141
        }],
        140: [function (require, module, exports) {
            "use strict";
            var __extends = (this && this.__extends) || (function () {
                var extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function (d, b) {
                            d.__proto__ = b;
                        }) ||
                    function (d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return function (d, b) {
                    extendStatics(d, b);

                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            })();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../environment");
            var globals_1 = require("../globals");
            var session_util = require("../graph/session_util");
            var tensor_array_map_1 = require("../graph/tensor_array_map");
            var ops_1 = require("../ops/ops");
            var tensor_1 = require("../tensor");
            var optimizer_1 = require("./optimizer");
            var RMSPropOptimizer = (function (_super) {
                __extends(RMSPropOptimizer, _super);

                function RMSPropOptimizer(learningRate, decay, momentum, specifiedVariableList, epsilon) {
                    if (decay === void 0) {
                        decay = 0.9;
                    }
                    if (momentum === void 0) {
                        momentum = 0.0;
                    }
                    if (epsilon === void 0) {
                        epsilon = 1e-8;
                    }
                    var _this = _super.call(this, learningRate, specifiedVariableList) || this;
                    _this.learningRate = learningRate;
                    _this.accumulatedMeanSquares = {};
                    _this.accumulatedMoments = {};
                    _this.accumulatedMeanSquaredGraph = new tensor_array_map_1.TensorArrayMap();
                    _this.accumulatedMomentGraph = new tensor_array_map_1.TensorArrayMap();
                    _this.c = globals_1.keep(ops_1.scalar(learningRate));
                    _this.epsilon = globals_1.keep(ops_1.scalar(epsilon));
                    _this.decay = globals_1.keep(ops_1.scalar(decay));
                    _this.momentum = globals_1.keep(ops_1.scalar(momentum));
                    _this.oneMinusDecay = globals_1.keep(ops_1.scalar(1 - decay));
                    return _this;
                }
                RMSPropOptimizer.prototype.applyGradients = function (variableGradients) {
                    var _this = this;
                    var _loop_1 = function (variableName) {
                        var value = environment_1.ENV.engine.registeredVariables[variableName];
                        if (this_1.accumulatedMeanSquares[variableName] == null) {
                            var trainable_1 = false;
                            globals_1.tidy(function () {
                                _this.accumulatedMeanSquares[variableName] =
                                    ops_1.zerosLike(value).variable(trainable_1);
                            });
                        }
                        if (this_1.accumulatedMoments[variableName] == null) {
                            var trainable_2 = false;
                            globals_1.tidy(function () {
                                _this.accumulatedMoments[variableName] =
                                    ops_1.zerosLike(value).variable(trainable_2);
                            });
                        }
                        var accumulatedMeanSquare = this_1.accumulatedMeanSquares[variableName];
                        var accumulatedMoments = this_1.accumulatedMoments[variableName];
                        var gradient = variableGradients[variableName];
                        globals_1.tidy(function () {
                            var newAccumulatedMeanSquare = _this.decay.mul(accumulatedMeanSquare)
                                .add(_this.oneMinusDecay.mul(gradient.square()));
                            var newAccumulatedMoments = _this.momentum.mul(accumulatedMoments)
                                .add(_this.c.mul(gradient).div(newAccumulatedMeanSquare.add(_this.epsilon).sqrt()));
                            _this.accumulatedMeanSquares[variableName].assign(newAccumulatedMeanSquare);
                            _this.accumulatedMoments[variableName].assign(newAccumulatedMoments);
                            var newValue = value.sub(newAccumulatedMoments);
                            value.assign(newValue);
                        });
                    };
                    var this_1 = this;
                    for (var variableName in variableGradients) {
                        _loop_1(variableName);
                    }
                };
                RMSPropOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    this.variableNodes = this.specifiedVariableNodes == null ?
                        session_util.getVariableNodesFromEvaluationSet(runtime.nodes) :
                        this.specifiedVariableNodes;
                    if (batchSize !== this.prevBatchSize) {
                        if (this.cGraph != null) {
                            this.cGraph.dispose();
                        }
                        this.prevBatchSize = batchSize;
                        this.cGraph = math.keep(ops_1.scalar(this.learningRate / batchSize));
                    }
                    this.variableNodes.forEach(function (node) {
                        return _this.variableGradients.set(node.output, math.keep(tensor_1.Tensor.zeros(node.output.shape)));
                    });
                    if (this.accumulatedMeanSquaredGraph.size() === 0) {
                        this.variableNodes.forEach(function (node) {
                            _this.accumulatedMeanSquaredGraph.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                            _this.accumulatedMomentGraph.set(node.output, tensor_1.Tensor.zeros(node.output.shape));
                        });
                    }
                };
                RMSPropOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    globals_1.tidy(function () {
                        _this.variableNodes.forEach(function (node) {
                            var oldVariable = activationArrayMap.get(node.output);
                            var gradient = _this.variableGradients.get(node.output);
                            var oldMeanSquare = _this.accumulatedMeanSquaredGraph.get(node.output);
                            var oldMoment = _this.accumulatedMomentGraph.get(node.output);
                            var meanSquare = math.scaledArrayAdd(_this.decay, oldMeanSquare, _this.oneMinusDecay, gradient.square());
                            var moment = math.scaledArrayAdd(_this.momentum, oldMoment, _this.cGraph, gradient.div(meanSquare.add(_this.epsilon).sqrt()));
                            var variable = oldVariable.sub(moment);
                            _this.accumulatedMeanSquaredGraph.set(node.output, globals_1.keep(meanSquare));
                            _this.accumulatedMomentGraph.set(node.output, globals_1.keep(moment));
                            activationArrayMap.set(node.output, globals_1.keep(variable));
                            node.data = variable;
                            oldVariable.dispose();
                            oldMeanSquare.dispose();
                            oldMoment.dispose();
                        });
                    });
                    this.variableGradients.dispose();
                    this.variableGradients = new tensor_array_map_1.TensorArrayMap();
                };
                RMSPropOptimizer.prototype.dispose = function () {
                    var _this = this;
                    _super.prototype.dispose.call(this);
                    this.c.dispose();
                    this.epsilon.dispose();
                    this.decay.dispose();
                    this.momentum.dispose();
                    this.oneMinusDecay.dispose();
                    if (this.accumulatedMeanSquaredGraph != null) {
                        this.accumulatedMeanSquaredGraph.dispose();
                    }
                    if (this.accumulatedMomentGraph != null) {
                        this.accumulatedMomentGraph.dispose();
                    }
                    if (this.accumulatedMeanSquares != null) {
                        Object.keys(this.accumulatedMeanSquares)
                            .forEach(function (name) {
                                return _this.accumulatedMeanSquares[name].dispose();
                            });
                    }
                    if (this.accumulatedMoments != null) {
                        Object.keys(this.accumulatedMoments)
                            .forEach(function (name) {
                                return _this.accumulatedMoments[name].dispose();
                            });
                    }
                };
                return RMSPropOptimizer;
            }(optimizer_1.Optimizer));
            exports.RMSPropOptimizer = RMSPropOptimizer;

        }, {
            "../environment": 34,
            "../globals": 35,
            "../graph/session_util": 65,
            "../graph/tensor_array_map": 66,
            "../ops/ops": 121,
            "../tensor": 144,
            "./optimizer": 138
        }],
        141: [function (require, module, exports) {
            "use strict";
            var __extends = (this && this.__extends) || (function () {
                var extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function (d, b) {
                            d.__proto__ = b;
                        }) ||
                    function (d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return function (d, b) {
                    extendStatics(d, b);

                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            })();
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("../environment");
            var globals_1 = require("../globals");
            var tensor_array_map_1 = require("../graph/tensor_array_map");
            var ops_1 = require("../ops/ops");
            var optimizer_1 = require("./optimizer");
            var SGDOptimizer = (function (_super) {
                __extends(SGDOptimizer, _super);

                function SGDOptimizer(learningRate, specifiedVariableList) {
                    var _this = _super.call(this, learningRate, specifiedVariableList) || this;
                    _this.learningRate = learningRate;
                    _this.setLearningRate(learningRate);
                    return _this;
                }
                SGDOptimizer.prototype.applyGradients = function (variableGradients) {
                    var _this = this;
                    var varNames = Object.keys(variableGradients);
                    varNames.forEach(function (varName) {
                        var gradient = variableGradients[varName];
                        var value = environment_1.ENV.engine.registeredVariables[varName];
                        globals_1.tidy(function () {
                            var newValue = _this.c.mul(gradient).add(value);
                            value.assign(newValue);
                        });
                    });
                };
                SGDOptimizer.prototype.setLearningRate = function (learningRate) {
                    this.learningRate = learningRate;
                    if (this.c != null) {
                        this.c.dispose();
                    }
                    this.c = environment_1.ENV.math.keep(ops_1.scalar(-learningRate));
                };
                SGDOptimizer.prototype.dispose = function () {
                    this.c.dispose();
                    if (this.one != null) {
                        this.one.dispose();
                    }
                    _super.prototype.dispose.call(this);
                };
                SGDOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
                    var _this = this;
                    if (this.one == null) {
                        this.one = globals_1.keep(ops_1.scalar(1));
                    }
                    globals_1.tidy(function () {
                        _this.variableNodes.forEach(function (node) {
                            var oldVariable = activationArrayMap.get(node.output);
                            var gradient = _this.variableGradients.get(node.output);
                            var variable = math.scaledArrayAdd(_this.cGraph, gradient, _this.one, oldVariable);
                            activationArrayMap.set(node.output, globals_1.keep(variable));
                            node.data = variable;
                            oldVariable.dispose();
                        });
                    });
                    this.variableGradients.dispose();
                    this.variableGradients = new tensor_array_map_1.TensorArrayMap();
                };
                return SGDOptimizer;
            }(optimizer_1.Optimizer));
            exports.SGDOptimizer = SGDOptimizer;

        }, {
            "../environment": 34,
            "../globals": 35,
            "../graph/tensor_array_map": 66,
            "../ops/ops": 121,
            "./optimizer": 138
        }],
        142: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var util = require("./util");
            var Profiler = (function () {
                function Profiler(backendTimer, logger) {
                    this.backendTimer = backendTimer;
                    this.logger = logger;
                    if (logger == null) {
                        this.logger = new Logger();
                    }
                }
                Profiler.prototype.profileKernel = function (name, f) {
                    var _this = this;
                    var result;
                    var holdResultWrapperFn = function () {
                        result = f();
                    };
                    var timer = this.backendTimer.time(holdResultWrapperFn);
                    var vals = result.dataSync();
                    util.checkForNaN(vals, result.dtype, name);
                    timer.then(function (timing) {
                        _this.logger.logKernelProfile(name, result, vals, timing.kernelMs);
                    });
                    return result;
                };
                return Profiler;
            }());
            exports.Profiler = Profiler;
            var Logger = (function () {
                function Logger() {}
                Logger.prototype.logKernelProfile = function (name, result, vals, timeMs) {
                    var time = util.rightPad(timeMs + "ms", 9);
                    var paddedName = util.rightPad(name, 25);
                    var rank = result.rank;
                    var size = result.size;
                    var shape = util.rightPad(result.shape.toString(), 14);
                    console.log("%c" + paddedName + "\t%c" + time + "\t%c" + rank + "D " + shape + "\t%c" + size, 'font-weight:bold', 'color:red', 'color:blue', 'color: orange');
                };
                return Logger;
            }());
            exports.Logger = Logger;

        }, {
            "./util": 150
        }],
        143: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var util = require("./util");

            function getFilteredNodesXToY(tape, xs, y) {
                var tensorsFromX = {};
                var nodesFromX = {};
                for (var i = 0; i < xs.length; i++) {
                    tensorsFromX[xs[i].id] = true;
                }
                for (var i = 0; i < tape.length; i++) {
                    var node = tape[i];
                    var nodeInputs = node.inputs;
                    for (var inputName in nodeInputs) {
                        var input = nodeInputs[inputName];
                        var anyInputFromX = false;
                        for (var j = 0; j < xs.length; j++) {
                            if (tensorsFromX[input.id]) {
                                tensorsFromX[node.output.id] = true;
                                anyInputFromX = true;
                                nodesFromX[node.id] = true;
                                break;
                            }
                        }
                        if (anyInputFromX) {
                            break;
                        }
                    }
                }
                var tensorsLeadToY = {};
                tensorsLeadToY[y.id] = true;
                var nodesToY = {};
                for (var i = tape.length - 1; i >= 0; i--) {
                    var node = tape[i];
                    var nodeInputs = node.inputs;
                    var outputs = [];
                    outputs.push(node.output);
                    for (var j = 0; j < outputs.length; j++) {
                        if (tensorsLeadToY[outputs[j].id]) {
                            for (var inputName in nodeInputs) {
                                tensorsLeadToY[nodeInputs[inputName].id] = true;
                                nodesToY[node.id] = true;
                            }
                            break;
                        }
                    }
                }
                var filteredTape = [];
                for (var i = 0; i < tape.length; i++) {
                    var node = tape[i];
                    if (nodesFromX[node.id] && nodesToY[node.id]) {
                        var prunedInputs = {};
                        for (var inputName in node.inputs) {
                            var nodeInput = node.inputs[inputName];
                            if (tensorsFromX[nodeInput.id]) {
                                prunedInputs[inputName] = nodeInput;
                            }
                        }
                        var prunedNode = Object.assign({}, node);
                        prunedNode.inputs = prunedInputs;
                        prunedNode.output = node.output;
                        filteredTape.push(prunedNode);
                    }
                }
                return filteredTape;
            }
            exports.getFilteredNodesXToY = getFilteredNodesXToY;

            function backpropagateGradients(tensorAccumulatedGradientMap, filteredTape) {
                for (var i = filteredTape.length - 1; i >= 0; i--) {
                    var node = filteredTape[i];
                    var dy = tensorAccumulatedGradientMap[node.output.id];
                    if (node.gradient == null) {
                        throw new Error("Cannot compute gradient: gradient function not found " +
                            ("for " + node.name + "."));
                    }
                    var inputGradients = node.gradient(dy);
                    for (var inputName in node.inputs) {
                        if (!(inputName in inputGradients)) {
                            throw new Error("Cannot backprop through input " + inputName + ". " +
                                ("Available gradients found: " + Object.keys(inputGradients) + "."));
                        }
                        var dx = inputGradients[inputName]();
                        var x = node.inputs[inputName];
                        if (!util.arraysEqual(dx.shape, x.shape)) {
                            throw new Error("Error in gradient for op " + node.name + ". The gradient of input " +
                                ("'" + inputName + "' has shape '" + dx.shape + "', which does not match ") +
                                ("the shape of the input '" + x.shape + "'"));
                        }
                        if (tensorAccumulatedGradientMap[x.id] == null) {
                            tensorAccumulatedGradientMap[x.id] = dx;
                        } else {
                            var curGradient = tensorAccumulatedGradientMap[x.id];
                            tensorAccumulatedGradientMap[x.id] = curGradient.add(dx);
                            curGradient.dispose();
                        }
                    }
                }
            }
            exports.backpropagateGradients = backpropagateGradients;

        }, {
            "./util": 150
        }],
        144: [function (require, module, exports) {
            "use strict";
            var __extends = (this && this.__extends) || (function () {
                var extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function (d, b) {
                            d.__proto__ = b;
                        }) ||
                    function (d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return function (d, b) {
                    extendStatics(d, b);

                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            })();
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
                return new(P || (P = Promise))(function (resolve, reject) {
                    function fulfilled(value) {
                        try {
                            step(generator.next(value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function rejected(value) {
                        try {
                            step(generator["throw"](value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function step(result) {
                        result.done ? resolve(result.value) : new P(function (resolve) {
                            resolve(result.value);
                        }).then(fulfilled, rejected);
                    }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
            };
            var __generator = (this && this.__generator) || function (thisArg, body) {
                var _ = {
                        label: 0,
                        sent: function () {
                            if (t[0] & 1) throw t[1];
                            return t[1];
                        },
                        trys: [],
                        ops: []
                    },
                    f, y, t, g;
                return g = {
                    next: verb(0),
                    "throw": verb(1),
                    "return": verb(2)
                }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
                    return this;
                }), g;

                function verb(n) {
                    return function (v) {
                        return step([n, v]);
                    };
                }

                function step(op) {
                    if (f) throw new TypeError("Generator is already executing.");
                    while (_) try {
                        if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                        if (y = 0, t) op = [0, t.value];
                        switch (op[0]) {
                            case 0:
                            case 1:
                                t = op;
                                break;
                            case 4:
                                _.label++;
                                return {
                                    value: op[1],
                                    done: false
                                };
                            case 5:
                                _.label++;
                                y = op[1];
                                op = [0];
                                continue;
                            case 7:
                                op = _.ops.pop();
                                _.trys.pop();
                                continue;
                            default:
                                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                    _ = 0;
                                    continue;
                                }
                                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                    _.label = op[1];
                                    break;
                                }
                                if (op[0] === 6 && _.label < t[1]) {
                                    _.label = t[1];
                                    t = op;
                                    break;
                                }
                                if (t && _.label < t[2]) {
                                    _.label = t[2];
                                    _.ops.push(op);
                                    break;
                                }
                                if (t[2]) _.ops.pop();
                                _.trys.pop();
                                continue;
                        }
                        op = body.call(thisArg, _);
                    } catch (e) {
                        op = [6, e];
                        y = 0;
                    } finally {
                        f = t = 0;
                    }
                    if (op[0] & 5) throw op[1];
                    return {
                        value: op[0] ? op[1] : void 0,
                        done: true
                    };
                }
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("./doc");
            var environment_1 = require("./environment");
            var ops = require("./ops/ops");
            var tensor_util = require("./tensor_util");
            var util = require("./util");
            var TensorBuffer = (function () {
                function TensorBuffer(shape, dtype, values) {
                    this.shape = shape;
                    this.dtype = dtype;
                    this.values = values;
                    if (values != null) {
                        var n = values.length;
                        var size = util.sizeFromShape(shape);
                        util.assert(n === size, "Length of values '" + n + "' does not match the size " +
                            ("inferred by the shape '" + size + "'"));
                    }
                    this.values =
                        values || util.getTypedArrayFromDType(dtype, util.sizeFromShape(shape));
                    this.strides = computeStrides(shape);
                    this.size = util.sizeFromShape(shape);
                }
                TensorBuffer.prototype.set = function (value) {
                    var locs = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        locs[_i - 1] = arguments[_i];
                    }
                    if (locs.length === 0) {
                        locs = [0];
                    }
                    util.assert(locs.length === this.rank, "The number of provided coordinates (" + locs.length + ") must " +
                        ("match the rank (" + this.rank + ")"));
                    var index = this.locToIndex(locs);
                    this.values[index] = value;
                };
                TensorBuffer.prototype.get = function () {
                    var locs = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        locs[_i] = arguments[_i];
                    }
                    if (locs.length === 0) {
                        locs = [0];
                    }
                    var index = locs[locs.length - 1];
                    for (var i = 0; i < locs.length - 1; ++i) {
                        index += this.strides[i] * locs[i];
                    }
                    return this.values[index];
                };
                TensorBuffer.prototype.locToIndex = function (locs) {
                    if (this.rank === 0) {
                        return 0;
                    } else if (this.rank === 1) {
                        return locs[0];
                    }
                    var index = locs[locs.length - 1];
                    for (var i = 0; i < locs.length - 1; ++i) {
                        index += this.strides[i] * locs[i];
                    }
                    return index;
                };
                TensorBuffer.prototype.indexToLoc = function (index) {
                    if (this.rank === 0) {
                        return [];
                    } else if (this.rank === 1) {
                        return [index];
                    }
                    var locs = new Array(this.shape.length);
                    for (var i = 0; i < locs.length - 1; ++i) {
                        locs[i] = Math.floor(index / this.strides[i]);
                        index -= locs[i] * this.strides[i];
                    }
                    locs[locs.length - 1] = index;
                    return locs;
                };
                Object.defineProperty(TensorBuffer.prototype, "rank", {
                    get: function () {
                        return this.shape.length;
                    },
                    enumerable: true,
                    configurable: true
                });
                TensorBuffer.prototype.toTensor = function () {
                    return Tensor.make(this.shape, {
                        values: this.values
                    }, this.dtype);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], TensorBuffer.prototype, "set", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], TensorBuffer.prototype, "get", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], TensorBuffer.prototype, "toTensor", null);
                TensorBuffer = __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], TensorBuffer);
                return TensorBuffer;
            }());
            exports.TensorBuffer = TensorBuffer;
            var Tensor = (function () {
                function Tensor(shape, dtype, values, dataId) {
                    this.isDisposed = false;
                    this.size = util.sizeFromShape(shape);
                    if (values != null) {
                        util.assert(this.size === values.length, "Constructing tensor of shape (" + this.size + ") should match the " +
                            ("length of values (" + values.length + ")"));
                    }
                    this.shape = shape;
                    this.dtype = dtype || 'float32';
                    this.strides = computeStrides(shape);
                    this.dataId = dataId != null ? dataId : {};
                    this.id = Tensor_1.nextId++;
                    this.rankType = (this.rank < 5 ? this.rank.toString() : 'higher');
                    environment_1.ENV.engine.registerTensor(this);
                    if (values != null) {
                        environment_1.ENV.engine.write(this.dataId, values);
                    }
                }
                Tensor_1 = Tensor;
                Tensor.ones = function (shape, dtype) {
                    return ops.ones(shape, dtype);
                };
                Tensor.zeros = function (shape, dtype) {
                    return ops.zeros(shape, dtype);
                };
                Tensor.onesLike = function (x) {
                    return ops.onesLike(x);
                };
                Tensor.zerosLike = function (x) {
                    return ops.zerosLike(x);
                };
                Tensor.like = function (x) {
                    return ops.clone(x);
                };
                Tensor.make = function (shape, data, dtype) {
                    return new Tensor_1(shape, dtype, data.values, data.dataId);
                };
                Tensor.fromPixels = function (pixels, numChannels) {
                    if (numChannels === void 0) {
                        numChannels = 3;
                    }
                    return ops.fromPixels(pixels, numChannels);
                };
                Tensor.rand = function (shape, randFunction, dtype) {
                    return ops.rand(shape, randFunction, dtype);
                };
                Tensor.randNormal = function (shape, mean, stdDev, dtype, seed) {
                    if (mean === void 0) {
                        mean = 0;
                    }
                    if (stdDev === void 0) {
                        stdDev = 1;
                    }
                    return ops.randomNormal(shape, mean, stdDev, dtype, seed);
                };
                Tensor.randTruncatedNormal = function (shape, mean, stdDev, dtype, seed) {
                    if (mean === void 0) {
                        mean = 0;
                    }
                    if (stdDev === void 0) {
                        stdDev = 1;
                    }
                    return ops.truncatedNormal(shape, mean, stdDev, dtype, seed);
                };
                Tensor.randUniform = function (shape, a, b, dtype) {
                    return ops.randomUniform(shape, a, b, dtype);
                };
                Tensor.prototype.flatten = function () {
                    this.throwIfDisposed();
                    return this.as1D();
                };
                Tensor.prototype.asScalar = function () {
                    this.throwIfDisposed();
                    util.assert(this.size === 1, 'The array must have only 1 element.');
                    return this.reshape([]);
                };
                Tensor.prototype.as1D = function () {
                    this.throwIfDisposed();
                    return this.reshape([this.size]);
                };
                Tensor.prototype.as2D = function (rows, columns) {
                    this.throwIfDisposed();
                    return this.reshape([rows, columns]);
                };
                Tensor.prototype.as3D = function (rows, columns, depth) {
                    this.throwIfDisposed();
                    return this.reshape([rows, columns, depth]);
                };
                Tensor.prototype.as4D = function (rows, columns, depth, depth2) {
                    this.throwIfDisposed();
                    return this.reshape([rows, columns, depth, depth2]);
                };
                Tensor.prototype.asType = function (dtype) {
                    this.throwIfDisposed();
                    return ops.cast(this, dtype);
                };
                Object.defineProperty(Tensor.prototype, "rank", {
                    get: function () {
                        return this.shape.length;
                    },
                    enumerable: true,
                    configurable: true
                });
                Tensor.prototype.get = function () {
                    var locs = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        locs[_i] = arguments[_i];
                    }
                    this.throwIfDisposed();
                    if (locs.length === 0) {
                        locs = [0];
                    }
                    var index = locs[locs.length - 1];
                    for (var i = 0; i < locs.length - 1; ++i) {
                        index += this.strides[i] * locs[i];
                    }
                    return this.dataSync()[index];
                };
                Tensor.prototype.val = function () {
                    var locs = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        locs[_i] = arguments[_i];
                    }
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (locs.length === 0) {
                                        locs = [0];
                                    }
                                    this.throwIfDisposed();
                                    return [4, this.data()];
                                case 1:
                                    _a.sent();
                                    return [2, this.get.apply(this, locs)];
                            }
                        });
                    });
                };
                Tensor.prototype.locToIndex = function (locs) {
                    this.throwIfDisposed();
                    if (this.rank === 0) {
                        return 0;
                    } else if (this.rank === 1) {
                        return locs[0];
                    }
                    var index = locs[locs.length - 1];
                    for (var i = 0; i < locs.length - 1; ++i) {
                        index += this.strides[i] * locs[i];
                    }
                    return index;
                };
                Tensor.prototype.indexToLoc = function (index) {
                    this.throwIfDisposed();
                    if (this.rank === 0) {
                        return [];
                    } else if (this.rank === 1) {
                        return [index];
                    }
                    var locs = new Array(this.shape.length);
                    for (var i = 0; i < locs.length - 1; ++i) {
                        locs[i] = Math.floor(index / this.strides[i]);
                        index -= locs[i] * this.strides[i];
                    }
                    locs[locs.length - 1] = index;
                    return locs;
                };
                Tensor.prototype.getValues = function () {
                    return this.dataSync();
                };
                Tensor.prototype.getValuesAsync = function () {
                    return this.data();
                };
                Tensor.prototype.buffer = function () {
                    return ops.buffer(this.shape, this.dtype, this.dataSync());
                };
                Tensor.prototype.data = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.throwIfDisposed();
                            return [2, environment_1.ENV.engine.read(this.dataId)];
                        });
                    });
                };
                Tensor.prototype.dataSync = function () {
                    this.throwIfDisposed();
                    return environment_1.ENV.engine.readSync(this.dataId);
                };
                Tensor.prototype.dispose = function () {
                    if (this.isDisposed) {
                        return;
                    }
                    this.isDisposed = true;
                    environment_1.ENV.engine.disposeTensor(this);
                };
                Tensor.prototype.throwIfDisposed = function () {
                    if (this.isDisposed) {
                        throw new Error("Tensor is disposed.");
                    }
                };
                Tensor.prototype.toFloat = function () {
                    return this.asType('float32');
                };
                Tensor.prototype.toInt = function () {
                    return this.asType('int32');
                };
                Tensor.prototype.toBool = function () {
                    return this.asType('bool');
                };
                Tensor.prototype.print = function (verbose) {
                    if (verbose === void 0) {
                        verbose = false;
                    }
                    return ops.print(this, verbose);
                };
                Tensor.prototype.reshape = function (newShape) {
                    this.throwIfDisposed();
                    return ops.reshape(this, newShape);
                };
                Tensor.prototype.reshapeAs = function (x) {
                    this.throwIfDisposed();
                    return this.reshape(x.shape);
                };
                Tensor.prototype.expandDims = function (axis) {
                    if (axis === void 0) {
                        axis = 0;
                    }
                    return ops.expandDims(this, axis);
                };
                Tensor.prototype.squeeze = function (axis) {
                    this.throwIfDisposed();
                    return ops.squeeze(this, axis);
                };
                Tensor.prototype.clone = function () {
                    this.throwIfDisposed();
                    return ops.clone(this);
                };
                Tensor.prototype.toString = function () {
                    return tensor_util.tensorToString(this, true);
                };
                Tensor.prototype.tile = function (reps) {
                    this.throwIfDisposed();
                    return ops.tile(this, reps);
                };
                Tensor.prototype.gather = function (indices, axis) {
                    if (axis === void 0) {
                        axis = 0;
                    }
                    this.throwIfDisposed();
                    return ops.gather(this, indices);
                };
                Tensor.prototype.matMul = function (b, transposeA, transposeB) {
                    if (transposeA === void 0) {
                        transposeA = false;
                    }
                    if (transposeB === void 0) {
                        transposeB = false;
                    }
                    this.throwIfDisposed();
                    return ops.matMul(this, b, transposeA, transposeB);
                };
                Tensor.prototype.norm = function (ord, axis, keepDims) {
                    if (ord === void 0) {
                        ord = 'euclidean';
                    }
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    this.throwIfDisposed();
                    return ops.norm(this, ord, axis, keepDims);
                };
                Tensor.prototype.slice = function (begin, size) {
                    this.throwIfDisposed();
                    return ops.slice(this, begin, size);
                };
                Tensor.prototype.reverse = function (axis) {
                    this.throwIfDisposed();
                    return ops.reverse(this, axis);
                };
                Tensor.prototype.concat = function (x, axis) {
                    if (axis === void 0) {
                        axis = 0;
                    }
                    this.throwIfDisposed();
                    return ops.concat([this, x], axis);
                };
                Tensor.prototype.stack = function (x, axis) {
                    if (axis === void 0) {
                        axis = 0;
                    }
                    return ops.stack([this, x], axis);
                };
                Tensor.prototype.pad = function (paddings, constantValue) {
                    if (constantValue === void 0) {
                        constantValue = 0;
                    }
                    return ops.pad(this, paddings, constantValue);
                };
                Tensor.prototype.batchNormalization = function (mean, variance, varianceEpsilon, scale, offset) {
                    if (varianceEpsilon === void 0) {
                        varianceEpsilon = .001;
                    }
                    this.throwIfDisposed();
                    return ops.batchNormalization(this, mean, variance, varianceEpsilon, scale, offset);
                };
                Tensor.prototype.logSumExp = function (axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    this.throwIfDisposed();
                    return ops.logSumExp(this, axis, keepDims);
                };
                Tensor.prototype.sum = function (axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    this.throwIfDisposed();
                    return ops.sum(this, axis, keepDims);
                };
                Tensor.prototype.mean = function (axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    this.throwIfDisposed();
                    return ops.mean(this, axis, keepDims);
                };
                Tensor.prototype.min = function (axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    this.throwIfDisposed();
                    return ops.min(this, axis, keepDims);
                };
                Tensor.prototype.max = function (axis, keepDims) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    if (keepDims === void 0) {
                        keepDims = false;
                    }
                    this.throwIfDisposed();
                    return ops.max(this, axis, keepDims);
                };
                Tensor.prototype.argMin = function (axis) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    this.throwIfDisposed();
                    return ops.argMin(this, axis);
                };
                Tensor.prototype.argMax = function (axis) {
                    if (axis === void 0) {
                        axis = null;
                    }
                    this.throwIfDisposed();
                    return ops.argMax(this, axis);
                };
                Tensor.prototype.add = function (x) {
                    this.throwIfDisposed();
                    return ops.add(this, x);
                };
                Tensor.prototype.addStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.addStrict(this, x);
                };
                Tensor.prototype.sub = function (x) {
                    this.throwIfDisposed();
                    return ops.sub(this, x);
                };
                Tensor.prototype.subStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.subStrict(this, x);
                };
                Tensor.prototype.pow = function (exp) {
                    this.throwIfDisposed();
                    return ops.pow(this, exp);
                };
                Tensor.prototype.powStrict = function (exp) {
                    this.throwIfDisposed();
                    return ops.powStrict(this, exp);
                };
                Tensor.prototype.mul = function (x) {
                    this.throwIfDisposed();
                    return ops.mul(this, x);
                };
                Tensor.prototype.mulStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.mulStrict(this, x);
                };
                Tensor.prototype.div = function (x) {
                    this.throwIfDisposed();
                    return ops.div(this, x);
                };
                Tensor.prototype.divStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.divStrict(this, x);
                };
                Tensor.prototype.minimum = function (x) {
                    this.throwIfDisposed();
                    return ops.minimum(this, x);
                };
                Tensor.prototype.minimumStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.minimumStrict(this, x);
                };
                Tensor.prototype.maximum = function (x) {
                    this.throwIfDisposed();
                    return ops.maximum(this, x);
                };
                Tensor.prototype.maximumStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.maximumStrict(this, x);
                };
                Tensor.prototype.transpose = function (perm) {
                    this.throwIfDisposed();
                    return ops.transpose(this, perm);
                };
                Tensor.prototype.notEqual = function (x) {
                    this.throwIfDisposed();
                    return ops.notEqual(this, x);
                };
                Tensor.prototype.notEqualStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.notEqualStrict(this, x);
                };
                Tensor.prototype.less = function (x) {
                    this.throwIfDisposed();
                    return ops.less(this, x);
                };
                Tensor.prototype.lessStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.lessStrict(this, x);
                };
                Tensor.prototype.equal = function (x) {
                    this.throwIfDisposed();
                    return ops.equal(this, x);
                };
                Tensor.prototype.equalStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.equalStrict(this, x);
                };
                Tensor.prototype.lessEqual = function (x) {
                    this.throwIfDisposed();
                    return ops.lessEqual(this, x);
                };
                Tensor.prototype.lessEqualStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.lessEqualStrict(this, x);
                };
                Tensor.prototype.greater = function (x) {
                    this.throwIfDisposed();
                    return ops.greater(this, x);
                };
                Tensor.prototype.greaterStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.greaterStrict(this, x);
                };
                Tensor.prototype.greaterEqual = function (x) {
                    this.throwIfDisposed();
                    return ops.greaterEqual(this, x);
                };
                Tensor.prototype.greaterEqualStrict = function (x) {
                    this.throwIfDisposed();
                    return ops.greaterEqualStrict(this, x);
                };
                Tensor.prototype.logicalAnd = function (x) {
                    this.throwIfDisposed();
                    return ops.logicalAnd(this, x);
                };
                Tensor.prototype.logicalOr = function (x) {
                    this.throwIfDisposed();
                    return ops.logicalOr(this, x);
                };
                Tensor.prototype.logicalXor = function (x) {
                    this.throwIfDisposed();
                    return ops.logicalXor(this, x);
                };
                Tensor.prototype.where = function (condition, x) {
                    this.throwIfDisposed();
                    return ops.where(condition, this, x);
                };
                Tensor.prototype.neg = function () {
                    this.throwIfDisposed();
                    return ops.neg(this);
                };
                Tensor.prototype.ceil = function () {
                    this.throwIfDisposed();
                    return ops.ceil(this);
                };
                Tensor.prototype.floor = function () {
                    this.throwIfDisposed();
                    return ops.floor(this);
                };
                Tensor.prototype.exp = function () {
                    this.throwIfDisposed();
                    return ops.exp(this);
                };
                Tensor.prototype.log = function () {
                    this.throwIfDisposed();
                    return ops.log(this);
                };
                Tensor.prototype.sqrt = function () {
                    this.throwIfDisposed();
                    return ops.sqrt(this);
                };
                Tensor.prototype.square = function () {
                    this.throwIfDisposed();
                    return ops.square(this);
                };
                Tensor.prototype.abs = function () {
                    this.throwIfDisposed();
                    return ops.abs(this);
                };
                Tensor.prototype.clipByValue = function (min, max) {
                    this.throwIfDisposed();
                    return ops.clipByValue(this, min, max);
                };
                Tensor.prototype.relu = function () {
                    this.throwIfDisposed();
                    return ops.relu(this);
                };
                Tensor.prototype.elu = function () {
                    this.throwIfDisposed();
                    return ops.elu(this);
                };
                Tensor.prototype.selu = function () {
                    this.throwIfDisposed();
                    return ops.selu(this);
                };
                Tensor.prototype.leakyRelu = function (alpha) {
                    if (alpha === void 0) {
                        alpha = 0.2;
                    }
                    this.throwIfDisposed();
                    return ops.leakyRelu(this, alpha);
                };
                Tensor.prototype.prelu = function (alpha) {
                    this.throwIfDisposed();
                    return ops.prelu(this, alpha);
                };
                Tensor.prototype.sigmoid = function () {
                    this.throwIfDisposed();
                    return ops.sigmoid(this);
                };
                Tensor.prototype.sin = function () {
                    this.throwIfDisposed();
                    return ops.sin(this);
                };
                Tensor.prototype.cos = function () {
                    this.throwIfDisposed();
                    return ops.cos(this);
                };
                Tensor.prototype.tan = function () {
                    this.throwIfDisposed();
                    return ops.tan(this);
                };
                Tensor.prototype.asin = function () {
                    this.throwIfDisposed();
                    return ops.asin(this);
                };
                Tensor.prototype.acos = function () {
                    this.throwIfDisposed();
                    return ops.acos(this);
                };
                Tensor.prototype.atan = function () {
                    this.throwIfDisposed();
                    return ops.atan(this);
                };
                Tensor.prototype.sinh = function () {
                    this.throwIfDisposed();
                    return ops.sinh(this);
                };
                Tensor.prototype.cosh = function () {
                    this.throwIfDisposed();
                    return ops.cosh(this);
                };
                Tensor.prototype.tanh = function () {
                    this.throwIfDisposed();
                    return ops.tanh(this);
                };
                Tensor.prototype.step = function (alpha) {
                    if (alpha === void 0) {
                        alpha = 0.0;
                    }
                    this.throwIfDisposed();
                    return ops.step(this, alpha);
                };
                Tensor.prototype.softmax = function (dim) {
                    if (dim === void 0) {
                        dim = -1;
                    }
                    this.throwIfDisposed();
                    return ops.softmax(this, dim);
                };
                Tensor.prototype.resizeBilinear = function (newShape2D, alignCorners) {
                    if (alignCorners === void 0) {
                        alignCorners = false;
                    }
                    this.throwIfDisposed();
                    return ops.image.resizeBilinear(this, newShape2D, alignCorners);
                };
                Tensor.prototype.conv1d = function (filter, stride, pad, dimRoundingMode) {
                    this.throwIfDisposed();
                    return ops.conv1d(this, filter, stride, pad, dimRoundingMode);
                };
                Tensor.prototype.conv2d = function (filter, strides, pad, dimRoundingMode) {
                    this.throwIfDisposed();
                    return ops.conv2d(this, filter, strides, pad, dimRoundingMode);
                };
                Tensor.prototype.conv2dTranspose = function (filter, outputShape, strides, pad, dimRoundingMode) {
                    this.throwIfDisposed();
                    return ops.conv2dTranspose(this, filter, outputShape, strides, pad, dimRoundingMode);
                };
                Tensor.prototype.depthwiseConv2D = function (filter, strides, pad, dilations, dimRoundingMode) {
                    if (dilations === void 0) {
                        dilations = [1, 1];
                    }
                    this.throwIfDisposed();
                    return ops.depthwiseConv2d(this, filter, strides, pad, dilations, dimRoundingMode);
                };
                Tensor.prototype.avgPool = function (filterSize, strides, pad, dimRoundingMode) {
                    this.throwIfDisposed();
                    return ops.avgPool(this, filterSize, strides, pad, dimRoundingMode);
                };
                Tensor.prototype.maxPool = function (filterSize, strides, pad, dimRoundingMode) {
                    this.throwIfDisposed();
                    return ops.maxPool(this, filterSize, strides, pad, dimRoundingMode);
                };
                Tensor.prototype.minPool = function (filterSize, strides, pad, dimRoundingMode) {
                    this.throwIfDisposed();
                    return ops.minPool(this, filterSize, strides, pad, dimRoundingMode);
                };
                Tensor.prototype.localResponseNormalization = function (radius, bias, alpha, beta, normRegion) {
                    if (radius === void 0) {
                        radius = 5;
                    }
                    if (bias === void 0) {
                        bias = 1;
                    }
                    if (alpha === void 0) {
                        alpha = 1;
                    }
                    if (beta === void 0) {
                        beta = 0.5;
                    }
                    if (normRegion === void 0) {
                        normRegion = 'acrossChannels';
                    }
                    return ops.localResponseNormalization(this, radius, bias, alpha, beta, normRegion);
                };
                Tensor.prototype.variable = function (trainable, name, dtype) {
                    if (trainable === void 0) {
                        trainable = true;
                    }
                    this.throwIfDisposed();
                    return Variable.variable(this, trainable, name, dtype);
                };
                Tensor.nextId = 0;
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "flatten", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "asScalar", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "as1D", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "as2D", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "as3D", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "as4D", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "asType", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "buffer", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "data", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "dataSync", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "dispose", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "toFloat", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "toInt", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "toBool", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "print", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "reshape", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "reshapeAs", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "expandDims", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "squeeze", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "clone", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor.prototype, "toString", null);
                Tensor = Tensor_1 = __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Tensor);
                return Tensor;
                var Tensor_1;
            }());
            exports.Tensor = Tensor;
            exports.NDArray = Tensor;
            var Scalar = (function (_super) {
                __extends(Scalar, _super);

                function Scalar() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Scalar.new = function (value, dtype) {
                    return ops.scalar(value, dtype);
                };
                return Scalar;
            }(Tensor));
            exports.Scalar = Scalar;
            var Tensor1D = (function (_super) {
                __extends(Tensor1D, _super);

                function Tensor1D() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Tensor1D.new = function (values, dtype) {
                    return ops.tensor1d(values, dtype);
                };
                return Tensor1D;
            }(Tensor));
            exports.Tensor1D = Tensor1D;
            exports.Array1D = Tensor1D;
            var Tensor2D = (function (_super) {
                __extends(Tensor2D, _super);

                function Tensor2D() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Tensor2D.new = function (shape, values, dtype) {
                    return ops.tensor2d(values, shape, dtype);
                };
                return Tensor2D;
            }(Tensor));
            exports.Tensor2D = Tensor2D;
            exports.Array2D = Tensor2D;
            var Tensor3D = (function (_super) {
                __extends(Tensor3D, _super);

                function Tensor3D() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Tensor3D.new = function (shape, values, dtype) {
                    return ops.tensor3d(values, shape, dtype);
                };
                return Tensor3D;
            }(Tensor));
            exports.Tensor3D = Tensor3D;
            exports.Array3D = Tensor3D;
            var Tensor4D = (function (_super) {
                __extends(Tensor4D, _super);

                function Tensor4D() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Tensor4D.new = function (shape, values, dtype) {
                    return ops.tensor4d(values, shape, dtype);
                };
                return Tensor4D;
            }(Tensor));
            exports.Tensor4D = Tensor4D;
            exports.Array4D = Tensor4D;
            var Variable = (function (_super) {
                __extends(Variable, _super);

                function Variable(initialValue, trainable, name) {
                    if (trainable === void 0) {
                        trainable = true;
                    }
                    var _this = _super.call(this, initialValue.shape, initialValue.dtype, null, initialValue.dataId) || this;
                    _this.trainable = trainable;
                    _this.name = name;
                    if (_this.name == null) {
                        _this.name = Variable_1.nextVarId.toString();
                        Variable_1.nextVarId++;
                    }
                    environment_1.ENV.engine.registerVariable(_this);
                    return _this;
                }
                Variable_1 = Variable;
                Variable.variable = function (initialValue, trainable, name, dtype) {
                    if (trainable === void 0) {
                        trainable = true;
                    }
                    if (dtype != null && dtype !== initialValue.dtype) {
                        initialValue = initialValue.asType(dtype);
                    }
                    return new Variable_1(initialValue, trainable, name);
                };
                Variable.prototype.assign = function (newValue) {
                    if (newValue.dtype !== this.dtype) {
                        throw new Error("dtype of the new value (" + newValue.dtype + ") and " +
                            ("previous value (" + this.dtype + ") must match"));
                    }
                    if (!util.arraysEqual(newValue.shape, this.shape)) {
                        throw new Error("shape of the new value (" + newValue.shape + ") and " +
                            ("previous value (" + this.shape + ") must match"));
                    }
                    environment_1.ENV.engine.disposeTensor(this);
                    this.dataId = newValue.dataId;
                    environment_1.ENV.engine.registerTensor(this);
                };
                Variable.nextVarId = 0;
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Variable.prototype, "assign", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Creation'
                    })
                ], Variable, "variable", null);
                Variable = Variable_1 = __decorate([
                    doc_1.doc({
                        heading: 'Tensors',
                        subheading: 'Classes'
                    })
                ], Variable);
                return Variable;
                var Variable_1;
            }(Tensor));
            exports.Variable = Variable;
            var variable = Variable.variable;
            exports.variable = variable;

            function computeStrides(shape) {
                var rank = shape.length;
                if (rank < 2) {
                    return [];
                }
                var strides = new Array(rank - 1);
                strides[rank - 2] = shape[rank - 1];
                for (var i = rank - 3; i >= 0; --i) {
                    strides[i] = strides[i + 1] * shape[i + 1];
                }
                return strides;
            }

        }, {
            "./doc": 32,
            "./environment": 34,
            "./ops/ops": 121,
            "./tensor_util": 145,
            "./util": 150
        }],
        145: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var util = require("./util");
            var FORMAT_LIMIT_NUM_VALS = 20;
            var FORMAT_NUM_FIRST_LAST_VALS = 3;
            var FORMAT_NUM_SIG_DIGITS = 7;

            function tensorToString(t, verbose) {
                var vals = t.dataSync();
                var padPerCol = computeMaxSizePerColumn(t);
                var valsLines = subTensorToString(vals, t.shape, t.strides, padPerCol);
                var lines = ['Tensor'];
                if (verbose) {
                    lines.push("  dtype: " + t.dtype);
                    lines.push("  rank: " + t.rank);
                    lines.push("  shape: [" + t.shape + "]");
                    lines.push("  values:");
                }
                lines.push(valsLines.map(function (l) {
                    return '    ' + l;
                }).join('\n'));
                return lines.join('\n');
            }
            exports.tensorToString = tensorToString;

            function computeMaxSizePerColumn(t) {
                var vals = t.dataSync();
                var n = t.size;
                var numCols = t.strides[t.strides.length - 1];
                var padPerCol = new Array(numCols).fill(0);
                if (t.rank > 1) {
                    for (var row = 0; row < n / numCols; row++) {
                        var offset = row * numCols;
                        for (var j = 0; j < numCols; j++) {
                            padPerCol[j] =
                                Math.max(padPerCol[j], valToString(vals[offset + j], 0).length);
                        }
                    }
                }
                return padPerCol;
            }

            function valToString(val, pad) {
                return util.rightPad(parseFloat(val.toFixed(FORMAT_NUM_SIG_DIGITS)).toString(), pad);
            }

            function subTensorToString(vals, shape, strides, padPerCol, isLast) {
                if (isLast === void 0) {
                    isLast = true;
                }
                var size = shape[0];
                var rank = shape.length;
                if (rank === 0) {
                    return [vals[0].toString()];
                }
                if (rank === 1) {
                    if (size > FORMAT_LIMIT_NUM_VALS) {
                        var firstVals = Array.from(vals.subarray(0, FORMAT_NUM_FIRST_LAST_VALS));
                        var lastVals = Array.from(vals.subarray(size - FORMAT_NUM_FIRST_LAST_VALS, size));
                        return [
                            '[' + firstVals.map(function (x, i) {
                                return valToString(x, padPerCol[i]);
                            }).join(', ') +
                            ', ..., ' +
                            lastVals
                            .map(function (x, i) {
                                return valToString(x, padPerCol[size - FORMAT_NUM_FIRST_LAST_VALS + i]);
                            })
                            .join(', ') +
                            ']'
                        ];
                    }
                    return [
                        '[' +
                        Array.from(vals).map(function (x, i) {
                            return valToString(x, padPerCol[i]);
                        }).join(', ') +
                        ']'
                    ];
                }
                var subshape = shape.slice(1);
                var substrides = strides.slice(1);
                var stride = strides[0];
                var lines = [];
                if (size > FORMAT_LIMIT_NUM_VALS) {
                    for (var i = 0; i < FORMAT_NUM_FIRST_LAST_VALS; i++) {
                        var start = i * stride;
                        var end = start + stride;
                        lines.push.apply(lines, subTensorToString(vals.subarray(start, end), subshape, substrides, padPerCol, false));
                    }
                    lines.push('...');
                    for (var i = size - FORMAT_NUM_FIRST_LAST_VALS; i < size; i++) {
                        var start = i * stride;
                        var end = start + stride;
                        lines.push.apply(lines, subTensorToString(vals.subarray(start, end), subshape, substrides, padPerCol, i === size - 1));
                    }
                } else {
                    for (var i = 0; i < size; i++) {
                        var start = i * stride;
                        var end = start + stride;
                        lines.push.apply(lines, subTensorToString(vals.subarray(start, end), subshape, substrides, padPerCol, i === size - 1));
                    }
                }
                var sep = rank === 2 ? ',' : '';
                lines[0] = '[' + lines[0] + sep;
                for (var i = 1; i < lines.length - 1; i++) {
                    lines[i] = ' ' + lines[i] + sep;
                }
                var newLineSep = ',\n';
                for (var i = 2; i < rank; i++) {
                    newLineSep += '\n';
                }
                lines[lines.length - 1] =
                    ' ' + lines[lines.length - 1] + ']' + (isLast ? '' : newLineSep);
                return lines;
            }

        }, {
            "./util": 150
        }],
        146: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var environment_1 = require("./environment");
            var backend_cpu_1 = require("./kernels/backend_cpu");
            var backend_webgl_1 = require("./kernels/backend_webgl");
            var tensor_1 = require("./tensor");
            var util = require("./util");
            exports.WEBGL_ENVS = [{
                    'BACKEND': 'webgl',
                    'WEBGL_FLOAT_TEXTURE_ENABLED': true,
                    'WEBGL_VERSION': 1
                },
                {
                    'BACKEND': 'webgl',
                    'WEBGL_FLOAT_TEXTURE_ENABLED': true,
                    'WEBGL_VERSION': 2
                },
            ];
            exports.CPU_ENVS = [{
                'BACKEND': 'cpu'
            }];
            exports.ALL_ENVS = exports.WEBGL_ENVS.concat(exports.CPU_ENVS);
            exports.TEST_EPSILON = 1e-3;

            function expectArraysClose(actual, expected, epsilon) {
                if (epsilon === void 0) {
                    epsilon = exports.TEST_EPSILON;
                }
                if (!(actual instanceof tensor_1.Tensor) && !(expected instanceof tensor_1.Tensor)) {
                    var aType = actual.constructor.name;
                    var bType = expected.constructor.name;
                    if (aType !== bType) {
                        throw new Error("Arrays are of different type actual: " + aType + " " +
                            ("vs expected: " + bType));
                    }
                } else if (actual instanceof tensor_1.Tensor && expected instanceof tensor_1.Tensor) {
                    if (actual.dtype !== expected.dtype) {
                        throw new Error("Arrays are of different type actual: " + actual.dtype + " " +
                            ("vs expected: " + expected.dtype + "."));
                    }
                    if (!util.arraysEqual(actual.shape, expected.shape)) {
                        throw new Error("Arrays are of different shape actual: " + actual.shape + " " +
                            ("vs expected: " + expected.shape + "."));
                    }
                }
                var actualValues;
                var expectedValues;
                if (actual instanceof tensor_1.Tensor) {
                    actualValues = actual.dataSync();
                } else {
                    actualValues = actual;
                }
                if (expected instanceof tensor_1.Tensor) {
                    expectedValues = expected.dataSync();
                } else {
                    expectedValues = expected;
                }
                if (actualValues.length !== expectedValues.length) {
                    throw new Error("Arrays have different lengths actual: " + actualValues.length + " vs " +
                        ("expected: " + expectedValues.length + ".\n") +
                        ("Actual:   " + actualValues + ".\n") +
                        ("Expected: " + expectedValues + "."));
                }
                for (var i = 0; i < expectedValues.length; ++i) {
                    var a = actualValues[i];
                    var e = expectedValues[i];
                    if (!areClose(a, Number(e), epsilon)) {
                        throw new Error("Arrays differ: actual[" + i + "] = " + a + ", expected[" + i + "] = " + e + ".\n" +
                            ("Actual:   " + actualValues + ".\n") +
                            ("Expected: " + expectedValues + "."));
                    }
                }
            }
            exports.expectArraysClose = expectArraysClose;

            function expectArraysEqual(actual, expected) {
                return expectArraysClose(actual, expected, 0);
            }
            exports.expectArraysEqual = expectArraysEqual;

            function expectNumbersClose(a, e, epsilon) {
                if (epsilon === void 0) {
                    epsilon = exports.TEST_EPSILON;
                }
                if (!areClose(a, e, epsilon)) {
                    throw new Error("Numbers differ: actual === " + a + ", expected === " + e);
                }
            }
            exports.expectNumbersClose = expectNumbersClose;

            function areClose(a, e, epsilon) {
                if (isNaN(a) && isNaN(e)) {
                    return true;
                }
                if (isNaN(a) || isNaN(e) || Math.abs(a - e) > epsilon) {
                    return false;
                }
                return true;
            }

            function expectValuesInRange(actual, low, high) {
                var actualVals;
                if (actual instanceof tensor_1.Tensor) {
                    actualVals = actual.dataSync();
                } else {
                    actualVals = actual;
                }
                for (var i = 0; i < actualVals.length; i++) {
                    if (actualVals[i] < low || actualVals[i] > high) {
                        throw new Error("Value out of range:" + actualVals[i] + " low: " + low + ", high: " + high);
                    }
                }
            }
            exports.expectValuesInRange = expectValuesInRange;

            function describeWithFlags(name, featuresList, tests) {
                featuresList.forEach(function (features) {
                    var testName = name + ' ' + JSON.stringify(features);
                    executeTests(testName, tests, features);
                });
            }
            exports.describeWithFlags = describeWithFlags;

            function executeTests(testName, tests, features) {
                describe(testName, function () {
                    beforeEach(function () {
                        environment_1.ENV.setFeatures(features || {});
                        environment_1.ENV.addCustomBackend('webgl', function () {
                            return new backend_webgl_1.MathBackendWebGL();
                        });
                        environment_1.ENV.addCustomBackend('cpu', function () {
                            return new backend_cpu_1.MathBackendCPU();
                        });
                        if (features && features.BACKEND != null) {
                            environment_1.Environment.setBackend(features.BACKEND);
                        }
                        environment_1.ENV.engine.startScope();
                    });
                    afterEach(function () {
                        environment_1.ENV.engine.endScope(null);
                        environment_1.ENV.reset();
                    });
                    tests();
                });
            }

            function assertIsNan(val, dtype) {
                if (!util.isValNaN(val, dtype)) {
                    throw new Error("Value " + val + " does not represent NaN for dtype " + dtype);
                }
            }
            exports.assertIsNan = assertIsNan;

        }, {
            "./environment": 34,
            "./kernels/backend_cpu": 68,
            "./kernels/backend_webgl": 69,
            "./tensor": 144,
            "./util": 150
        }],
        147: [function (require, module, exports) {
            "use strict";
            var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
                var c = arguments.length,
                    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
                    d;
                if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
                else
                    for (var i = decorators.length - 1; i >= 0; i--)
                        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                return c > 3 && r && Object.defineProperty(target, key, r), r;
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var doc_1 = require("./doc");
            var environment_1 = require("./environment");
            var util_1 = require("./util");
            var Tracking = (function () {
                function Tracking() {}
                Tracking.tidy = function (nameOrFn, fn, gradMode) {
                    if (gradMode === void 0) {
                        gradMode = false;
                    }
                    var name = null;
                    if (fn == null) {
                        if (typeof nameOrFn !== 'function') {
                            throw new Error('Please provide a function to dl.tidy()');
                        }
                        fn = nameOrFn;
                    } else {
                        if (typeof nameOrFn !== 'string' && !(nameOrFn instanceof String)) {
                            throw new Error('When calling with two arguments, the first argument ' +
                                'to dl.tidy() must be a string');
                        }
                        if (typeof fn !== 'function') {
                            throw new Error('When calling with two arguments, the 2nd argument ' +
                                'to dl.tidy() must be a function');
                        }
                        name = nameOrFn;
                    }
                    environment_1.ENV.engine.startScope(name, gradMode);
                    var result = fn();
                    if (result instanceof Promise) {
                        console.warn('Returning a promise inside of tidy is dangerous. ' +
                            'This will be a run-time error in 0.6.0');
                    }
                    environment_1.ENV.engine.endScope(result, gradMode);
                    return result;
                };
                Tracking.dispose = function (container) {
                    var tensors = util_1.extractTensorsFromAny(container);
                    tensors.forEach(function (tensor) {
                        return tensor.dispose();
                    });
                };
                Tracking.keep = function (result) {
                    return environment_1.ENV.engine.keep(result);
                };
                Tracking.time = function (f) {
                    return environment_1.ENV.engine.time(f);
                };
                __decorate([
                    doc_1.doc({
                        heading: 'Performance',
                        subheading: 'Memory'
                    })
                ], Tracking, "tidy", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Performance',
                        subheading: 'Memory'
                    })
                ], Tracking, "keep", null);
                __decorate([
                    doc_1.doc({
                        heading: 'Performance',
                        subheading: 'Timing'
                    })
                ], Tracking, "time", null);
                return Tracking;
            }());
            exports.Tracking = Tracking;

        }, {
            "./doc": 32,
            "./environment": 34,
            "./util": 150
        }],
        148: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var adadelta_optimizer_1 = require("./optimizers/adadelta_optimizer");
            var adagrad_optimizer_1 = require("./optimizers/adagrad_optimizer");
            var adam_optimizer_1 = require("./optimizers/adam_optimizer");
            var adamax_optimizer_1 = require("./optimizers/adamax_optimizer");
            var momentum_optimizer_1 = require("./optimizers/momentum_optimizer");
            var optimizer_constructors_1 = require("./optimizers/optimizer_constructors");
            var rmsprop_optimizer_1 = require("./optimizers/rmsprop_optimizer");
            var sgd_optimizer_1 = require("./optimizers/sgd_optimizer");
            [momentum_optimizer_1.MomentumOptimizer, sgd_optimizer_1.SGDOptimizer, adadelta_optimizer_1.AdadeltaOptimizer, adagrad_optimizer_1.AdagradOptimizer,
                rmsprop_optimizer_1.RMSPropOptimizer, adamax_optimizer_1.AdamaxOptimizer, adam_optimizer_1.AdamOptimizer
            ];
            exports.train = {
                sgd: optimizer_constructors_1.OptimizerConstructors.sgd,
                momentum: optimizer_constructors_1.OptimizerConstructors.momentum,
                adadelta: optimizer_constructors_1.OptimizerConstructors.adadelta,
                adagrad: optimizer_constructors_1.OptimizerConstructors.adagrad,
                rmsprop: optimizer_constructors_1.OptimizerConstructors.rmsprop,
                adamax: optimizer_constructors_1.OptimizerConstructors.adamax,
                adam: optimizer_constructors_1.OptimizerConstructors.adam
            };

        }, {
            "./optimizers/adadelta_optimizer": 133,
            "./optimizers/adagrad_optimizer": 134,
            "./optimizers/adam_optimizer": 135,
            "./optimizers/adamax_optimizer": 136,
            "./optimizers/momentum_optimizer": 137,
            "./optimizers/optimizer_constructors": 139,
            "./optimizers/rmsprop_optimizer": 140,
            "./optimizers/sgd_optimizer": 141
        }],
        149: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var DType;
            (function (DType) {
                DType["float32"] = "float32";
                DType["int32"] = "int32";
                DType["bool"] = "bool";
            })(DType = exports.DType || (exports.DType = {}));
            var Rank;
            (function (Rank) {
                Rank["R0"] = "R0";
                Rank["R1"] = "R1";
                Rank["R2"] = "R2";
                Rank["R3"] = "R3";
                Rank["R4"] = "R4";
            })(Rank = exports.Rank || (exports.Rank = {}));
            var UpcastInt32AndMap;
            (function (UpcastInt32AndMap) {
                UpcastInt32AndMap["float32"] = "float32";
                UpcastInt32AndMap["int32"] = "int32";
                UpcastInt32AndMap["bool"] = "int32";
            })(UpcastInt32AndMap || (UpcastInt32AndMap = {}));
            var UpcastBoolAndMap;
            (function (UpcastBoolAndMap) {
                UpcastBoolAndMap["float32"] = "float32";
                UpcastBoolAndMap["int32"] = "int32";
                UpcastBoolAndMap["bool"] = "bool";
            })(UpcastBoolAndMap || (UpcastBoolAndMap = {}));
            var UpcastFloat32AndMap;
            (function (UpcastFloat32AndMap) {
                UpcastFloat32AndMap["float32"] = "float32";
                UpcastFloat32AndMap["int32"] = "float32";
                UpcastFloat32AndMap["bool"] = "float32";
            })(UpcastFloat32AndMap || (UpcastFloat32AndMap = {}));
            var upcastTypeMap = {
                float32: UpcastFloat32AndMap,
                int32: UpcastInt32AndMap,
                bool: UpcastBoolAndMap
            };

            function upcastType(typeA, typeB) {
                return upcastTypeMap[typeA][typeB];
            }
            exports.upcastType = upcastType;

            function sumOutType(type) {
                return upcastType(type, 'int32');
            }
            exports.sumOutType = sumOutType;

        }, {}],
        150: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var tensor_1 = require("./tensor");

            function shuffle(array) {
                var counter = array.length;
                var temp = 0;
                var index = 0;
                while (counter > 0) {
                    index = (Math.random() * counter) | 0;
                    counter--;
                    temp = array[counter];
                    array[counter] = array[index];
                    array[index] = temp;
                }
            }
            exports.shuffle = shuffle;

            function clamp(min, x, max) {
                return Math.max(min, Math.min(x, max));
            }
            exports.clamp = clamp;

            function randUniform(a, b) {
                return Math.random() * (b - a) + a;
            }
            exports.randUniform = randUniform;

            function distSquared(a, b) {
                var result = 0;
                for (var i = 0; i < a.length; i++) {
                    var diff = Number(a[i]) - Number(b[i]);
                    result += diff * diff;
                }
                return result;
            }
            exports.distSquared = distSquared;

            function assert(expr, msg) {
                if (!expr) {
                    throw new Error(msg);
                }
            }
            exports.assert = assert;

            function assertShapesMatch(shapeA, shapeB, errorMessagePrefix) {
                if (errorMessagePrefix === void 0) {
                    errorMessagePrefix = '';
                }
                assert(arraysEqual(shapeA, shapeB), errorMessagePrefix + ("Shapes " + shapeA + " and " + shapeB + " must match"));
            }
            exports.assertShapesMatch = assertShapesMatch;

            function assertTypesMatch(a, b) {
                assert(a.dtype === b.dtype, "The dtypes of the first (" + a.dtype + ") and " +
                    ("second (" + b.dtype + ") input must match"));
            }
            exports.assertTypesMatch = assertTypesMatch;

            function flatten(arr, ret) {
                if (ret === void 0) {
                    ret = [];
                }
                if (Array.isArray(arr)) {
                    for (var i = 0; i < arr.length; ++i) {
                        flatten(arr[i], ret);
                    }
                } else {
                    ret.push(arr);
                }
                return ret;
            }
            exports.flatten = flatten;

            function inferShape(val) {
                if (isTypedArray(val)) {
                    return [val.length];
                }
                if (!Array.isArray(val)) {
                    return [];
                }
                var shape = [];
                while (val instanceof Array) {
                    shape.push(val.length);
                    val = val[0];
                }
                return shape;
            }
            exports.inferShape = inferShape;

            function sizeFromShape(shape) {
                if (shape.length === 0) {
                    return 1;
                }
                var size = shape[0];
                for (var i = 1; i < shape.length; i++) {
                    size *= shape[i];
                }
                return size;
            }
            exports.sizeFromShape = sizeFromShape;

            function isScalarShape(shape) {
                return shape.length === 0;
            }
            exports.isScalarShape = isScalarShape;

            function arraysEqual(n1, n2) {
                if (n1.length !== n2.length) {
                    return false;
                }
                for (var i = 0; i < n1.length; i++) {
                    if (n1[i] !== n2[i]) {
                        return false;
                    }
                }
                return true;
            }
            exports.arraysEqual = arraysEqual;

            function isInt(a) {
                return a % 1 === 0;
            }
            exports.isInt = isInt;

            function tanh(x) {
                if (Math.tanh != null) {
                    return Math.tanh(x);
                }
                if (x === Infinity) {
                    return 1;
                } else if (x === -Infinity) {
                    return -1;
                } else {
                    var e2x = Math.exp(2 * x);
                    return (e2x - 1) / (e2x + 1);
                }
            }
            exports.tanh = tanh;

            function sizeToSquarishShape(size) {
                for (var a = Math.floor(Math.sqrt(size)); a > 1; --a) {
                    if (size % a === 0) {
                        return [a, size / a];
                    }
                }
                return [1, size];
            }
            exports.sizeToSquarishShape = sizeToSquarishShape;

            function createShuffledIndices(n) {
                var shuffledIndices = new Uint32Array(n);
                for (var i = 0; i < n; ++i) {
                    shuffledIndices[i] = i;
                }
                shuffle(shuffledIndices);
                return shuffledIndices;
            }
            exports.createShuffledIndices = createShuffledIndices;

            function rightPad(a, size) {
                if (size <= a.length) {
                    return a;
                }
                return a + ' '.repeat(size - a.length);
            }
            exports.rightPad = rightPad;

            function repeatedTry(checkFn, delayFn, maxCounter) {
                if (delayFn === void 0) {
                    delayFn = function (counter) {
                        return 0;
                    };
                }
                return new Promise(function (resolve, reject) {
                    var tryCount = 0;
                    var tryFn = function () {
                        if (checkFn()) {
                            resolve();
                            return;
                        }
                        tryCount++;
                        var nextBackoff = delayFn(tryCount);
                        if (maxCounter != null && tryCount >= maxCounter) {
                            reject();
                            return;
                        }
                        setTimeout(tryFn, nextBackoff);
                    };
                    setTimeout(tryFn, 0);
                });
            }
            exports.repeatedTry = repeatedTry;

            function getQueryParams(queryString) {
                var params = {};
                queryString.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g, function (s) {
                    var t = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        t[_i - 1] = arguments[_i];
                    }
                    decodeParam(params, t[0], t[1]);
                    return t.join('=');
                });
                return params;
            }
            exports.getQueryParams = getQueryParams;

            function decodeParam(params, name, value) {
                params[decodeURIComponent(name)] = decodeURIComponent(value || '');
            }

            function inferFromImplicitShape(shape, size) {
                var shapeProd = 1;
                var implicitIdx = -1;
                for (var i = 0; i < shape.length; ++i) {
                    if (shape[i] > 0) {
                        shapeProd *= shape[i];
                    } else if (shape[i] === -1) {
                        if (implicitIdx !== -1) {
                            throw Error("Shapes can only have 1 implicit size. " +
                                ("Found -1 at dim " + implicitIdx + " and dim " + i));
                        }
                        implicitIdx = i;
                    } else if (shape[i] <= 0) {
                        throw Error("Shapes can not be <= 0. Found " + shape[i] + " at dim " + i);
                    }
                }
                if (implicitIdx === -1) {
                    if (size > 0 && size !== shapeProd) {
                        throw Error("Size (" + size + ") must match the product of shape " + shape);
                    }
                    return shape;
                }
                if (size % shapeProd !== 0) {
                    throw Error("The implicit shape can't be a fractional number. " +
                        ("Got " + size + " / " + shapeProd));
                }
                var newShape = shape.slice();
                newShape[implicitIdx] = size / shapeProd;
                return newShape;
            }
            exports.inferFromImplicitShape = inferFromImplicitShape;
            exports.NAN_INT32 = 1 << 31;
            exports.NAN_BOOL = 255;
            exports.NAN_FLOAT32 = NaN;

            function getNaN(dtype) {
                if (dtype === 'float32') {
                    return exports.NAN_FLOAT32;
                } else if (dtype === 'int32') {
                    return exports.NAN_INT32;
                } else if (dtype === 'bool') {
                    return exports.NAN_BOOL;
                } else {
                    throw new Error("Unknown dtype " + dtype);
                }
            }
            exports.getNaN = getNaN;

            function isValNaN(val, dtype) {
                if (isNaN(val)) {
                    return true;
                }
                if (dtype === 'float32') {
                    return false;
                } else if (dtype === 'int32') {
                    return val === exports.NAN_INT32;
                } else if (dtype === 'bool') {
                    return val === exports.NAN_BOOL;
                } else {
                    throw new Error("Unknown dtype " + dtype);
                }
            }
            exports.isValNaN = isValNaN;

            function squeezeShape(shape, axis) {
                var newShape = [];
                var keptDims = [];
                var j = 0;
                for (var i = 0; i < shape.length; ++i) {
                    if (axis != null) {
                        if (axis[j] === i && shape[i] > 1) {
                            throw new Error("Can't squeeze axis " + i + " since its dim '" + shape[i] + "' is not 1");
                        }
                        if ((axis[j] == null || axis[j] > i) && shape[i] === 1) {
                            newShape.push(shape[i]);
                            keptDims.push(i);
                        }
                        if (axis[j] <= i) {
                            j++;
                        }
                    }
                    if (shape[i] > 1) {
                        newShape.push(shape[i]);
                        keptDims.push(i);
                    }
                }
                return {
                    newShape: newShape,
                    keptDims: keptDims
                };
            }
            exports.squeezeShape = squeezeShape;

            function getTypedArrayFromDType(dtype, size) {
                var values = null;
                if (dtype == null || dtype === 'float32') {
                    values = new Float32Array(size);
                } else if (dtype === 'int32') {
                    values = new Int32Array(size);
                } else if (dtype === 'bool') {
                    values = new Uint8Array(size);
                } else {
                    throw new Error("Unknown data type " + dtype);
                }
                return values;
            }
            exports.getTypedArrayFromDType = getTypedArrayFromDType;

            function isTensorInList(tensor, tensorList) {
                for (var i = 0; i < tensorList.length; i++) {
                    if (tensorList[i].id === tensor.id) {
                        return true;
                    }
                }
                return false;
            }
            exports.isTensorInList = isTensorInList;

            function checkForNaN(vals, dtype, name) {
                for (var i = 0; i < vals.length; i++) {
                    if (isValNaN(vals[i], dtype)) {
                        throw Error("The result of the '" + name + "' has NaNs.");
                    }
                }
            }
            exports.checkForNaN = checkForNaN;

            function flattenNameArrayMap(nameArrayMap, keys) {
                var xs = [];
                if (nameArrayMap instanceof tensor_1.Tensor) {
                    xs.push(nameArrayMap);
                } else {
                    var xMap = nameArrayMap;
                    for (var i = 0; i < keys.length; i++) {
                        xs.push(xMap[keys[i]]);
                    }
                }
                return xs;
            }
            exports.flattenNameArrayMap = flattenNameArrayMap;

            function unflattenToNameArrayMap(keys, flatArrays) {
                if (keys.length !== flatArrays.length) {
                    throw new Error("Cannot unflatten Tensor[], keys and arrays are not of same length.");
                }
                var result = {};
                for (var i = 0; i < keys.length; i++) {
                    result[keys[i]] = flatArrays[i];
                }
                return result;
            }
            exports.unflattenToNameArrayMap = unflattenToNameArrayMap;

            function hasEncodingLoss(oldType, newType) {
                if (newType === 'float32') {
                    return false;
                }
                if (newType === 'int32' && oldType !== 'float32') {
                    return false;
                }
                if (newType === 'bool' && oldType === 'bool') {
                    return false;
                }
                return true;
            }
            exports.hasEncodingLoss = hasEncodingLoss;

            function copyTypedArray(array, dtype) {
                if (dtype == null || dtype === 'float32') {
                    return new Float32Array(array);
                } else if (dtype === 'int32') {
                    var vals = new Int32Array(array.length);
                    for (var i = 0; i < vals.length; ++i) {
                        var val = array[i];
                        if (isValNaN(val, 'int32')) {
                            vals[i] = getNaN('int32');
                        } else {
                            vals[i] = val;
                        }
                    }
                    return vals;
                } else if (dtype === 'bool') {
                    var bool = new Uint8Array(array.length);
                    for (var i = 0; i < bool.length; ++i) {
                        var val = array[i];
                        if (isValNaN(val, 'bool')) {
                            bool[i] = getNaN('bool');
                        } else if (Math.round(val) !== 0) {
                            bool[i] = 1;
                        }
                    }
                    return bool;
                } else {
                    throw new Error("Unknown data type " + dtype);
                }
            }
            exports.copyTypedArray = copyTypedArray;

            function isTypedArray(a) {
                return a instanceof Float32Array || a instanceof Int32Array ||
                    a instanceof Uint8Array;
            }
            exports.isTypedArray = isTypedArray;

            function bytesPerElement(dtype) {
                if (dtype === 'float32' || dtype === 'int32') {
                    return 4;
                } else if (dtype === 'bool') {
                    return 1;
                } else {
                    throw new Error("Unknown dtype " + dtype);
                }
            }
            exports.bytesPerElement = bytesPerElement;

            function isFunction(f) {
                return !!(f && f.constructor && f.call && f.apply);
            }
            exports.isFunction = isFunction;

            function extractTensorsFromContainer(result) {
                return extractTensorsFromAny(result);
            }
            exports.extractTensorsFromContainer = extractTensorsFromContainer;

            function extractTensorsFromAny(result) {
                if (result == null) {
                    return [];
                }
                if (result instanceof tensor_1.Tensor) {
                    return [result];
                }
                var list = [];
                var resultObj = result;
                if (!isIterable(resultObj)) {
                    return [];
                }
                for (var k in resultObj) {
                    var sublist = flatten(resultObj[k]).filter(function (x) {
                        return x instanceof tensor_1.Tensor;
                    });
                    list.push.apply(list, sublist);
                }
                return list;
            }
            exports.extractTensorsFromAny = extractTensorsFromAny;

            function isIterable(obj) {
                return Array.isArray(obj) || typeof obj === 'object';
            }

        }, {
            "./tensor": 144
        }],
        151: [function (require, module, exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var version = '0.5.1';
            exports.version = version;

        }, {}],
        152: [function (require, module, exports) {
            "use strict";
            var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
                return new(P || (P = Promise))(function (resolve, reject) {
                    function fulfilled(value) {
                        try {
                            step(generator.next(value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function rejected(value) {
                        try {
                            step(generator["throw"](value));
                        } catch (e) {
                            reject(e);
                        }
                    }

                    function step(result) {
                        result.done ? resolve(result.value) : new P(function (resolve) {
                            resolve(result.value);
                        }).then(fulfilled, rejected);
                    }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
            };
            var __generator = (this && this.__generator) || function (thisArg, body) {
                var _ = {
                        label: 0,
                        sent: function () {
                            if (t[0] & 1) throw t[1];
                            return t[1];
                        },
                        trys: [],
                        ops: []
                    },
                    f, y, t, g;
                return g = {
                    next: verb(0),
                    "throw": verb(1),
                    "return": verb(2)
                }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
                    return this;
                }), g;

                function verb(n) {
                    return function (v) {
                        return step([n, v]);
                    };
                }

                function step(op) {
                    if (f) throw new TypeError("Generator is already executing.");
                    while (_) try {
                        if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                        if (y = 0, t) op = [0, t.value];
                        switch (op[0]) {
                            case 0:
                            case 1:
                                t = op;
                                break;
                            case 4:
                                _.label++;
                                return {
                                    value: op[1],
                                    done: false
                                };
                            case 5:
                                _.label++;
                                y = op[1];
                                op = [0];
                                continue;
                            case 7:
                                op = _.ops.pop();
                                _.trys.pop();
                                continue;
                            default:
                                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                    _ = 0;
                                    continue;
                                }
                                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                    _.label = op[1];
                                    break;
                                }
                                if (op[0] === 6 && _.label < t[1]) {
                                    _.label = t[1];
                                    t = op;
                                    break;
                                }
                                if (t && _.label < t[2]) {
                                    _.label = t[2];
                                    _.ops.push(op);
                                    break;
                                }
                                if (t[2]) _.ops.pop();
                                _.trys.pop();
                                continue;
                        }
                        op = body.call(thisArg, _);
                    } catch (e) {
                        op = [6, e];
                        y = 0;
                    } finally {
                        f = t = 0;
                    }
                    if (op[0] & 5) throw op[1];
                    return {
                        value: op[0] ? op[1] : void 0,
                        done: true
                    };
                }
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var ops_1 = require("./ops/ops");
            var util = require("./util");
            var DTYPE_VALUE_SIZE_MAP = {
                'float32': 4,
                'int32': 4
            };

            function loadWeights(manifest, filePathPrefix, weightNames) {
                if (filePathPrefix === void 0) {
                    filePathPrefix = '';
                }
                return __awaiter(this, void 0, void 0, function () {
                    var groupIndicesToFetchMap, groupWeightsToFetch, weightsFound, allManifestWeightNames, weightsNotFound, groupIndicesToFetch, requests, responses, buffers, weightsTensorMap, bufferIndexOffset;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                groupIndicesToFetchMap = manifest.map(function () {
                                    return false;
                                });
                                groupWeightsToFetch = {};
                                weightsFound = weightNames != null ? weightNames.map(function () {
                                    return false;
                                }) : [];
                                allManifestWeightNames = [];
                                manifest.forEach(function (manifestGroupConfig, groupIndex) {
                                    var groupOffset = 0;
                                    manifestGroupConfig.weights.forEach(function (weightsEntry) {
                                        var weightsBytes = DTYPE_VALUE_SIZE_MAP[weightsEntry.dtype] *
                                            util.sizeFromShape(weightsEntry.shape);
                                        var enqueueWeightsForFetchingFn = function () {
                                            groupIndicesToFetchMap[groupIndex] = true;
                                            if (groupWeightsToFetch[groupIndex] == null) {
                                                groupWeightsToFetch[groupIndex] = [];
                                            }
                                            groupWeightsToFetch[groupIndex].push({
                                                manifestEntry: weightsEntry,
                                                groupOffset: groupOffset,
                                                sizeBytes: weightsBytes
                                            });
                                        };
                                        if (weightNames != null) {
                                            weightNames.forEach(function (weightName, weightIndex) {
                                                if (weightName === weightsEntry.name) {
                                                    enqueueWeightsForFetchingFn();
                                                    weightsFound[weightIndex] = true;
                                                }
                                            });
                                        } else {
                                            enqueueWeightsForFetchingFn();
                                        }
                                        allManifestWeightNames.push(weightsEntry.name);
                                        groupOffset += weightsBytes;
                                    });
                                });
                                if (!weightsFound.every(function (found) {
                                        return found;
                                    })) {
                                    weightsNotFound = weightNames.filter(function (weight, i) {
                                        return !weightsFound[i];
                                    });
                                    throw new Error("Could not find weights in manifest with names: " +
                                        (weightsNotFound.join(', ') + ". \n") +
                                        "Manifest JSON has weights with names: " +
                                        (allManifestWeightNames.join(', ') + "."));
                                }
                                groupIndicesToFetch = groupIndicesToFetchMap.reduce(function (accumulator, shouldFetch, i) {
                                    if (shouldFetch) {
                                        accumulator.push(i);
                                    }
                                    return accumulator;
                                }, []);
                                requests = [];
                                groupIndicesToFetch.forEach(function (i) {
                                    manifest[i].paths.forEach(function (filepath) {
                                        var fetchUrl = filePathPrefix +
                                            (!filePathPrefix.endsWith('/') ? '/' : '') + filepath;
                                        requests.push(fetch(fetchUrl));
                                    });
                                });
                                return [4, Promise.all(requests)];
                            case 1:
                                responses = _a.sent();
                                return [4, Promise.all(responses.map(function (response) {
                                    return response.arrayBuffer();
                                }))];
                            case 2:
                                buffers = _a.sent();
                                weightsTensorMap = {};
                                bufferIndexOffset = 0;
                                groupIndicesToFetch.forEach(function (i) {
                                    var numBuffers = manifest[i].paths.length;
                                    var groupBytes = 0;
                                    for (var i_1 = 0; i_1 < numBuffers; i_1++) {
                                        groupBytes += buffers[bufferIndexOffset + i_1].byteLength;
                                    }
                                    var groupBuffer = new ArrayBuffer(groupBytes);
                                    var groupByteBuffer = new Uint8Array(groupBuffer);
                                    var groupBufferOffset = 0;
                                    for (var i_2 = 0; i_2 < numBuffers; i_2++) {
                                        var buffer = new Uint8Array(buffers[bufferIndexOffset + i_2]);
                                        groupByteBuffer.set(buffer, groupBufferOffset);
                                        groupBufferOffset += buffer.byteLength;
                                    }
                                    var weightsEntries = groupWeightsToFetch[i];
                                    weightsEntries.forEach(function (weightsEntry) {
                                        var byteBuffer = groupBuffer.slice(weightsEntry.groupOffset, weightsEntry.groupOffset + weightsEntry.sizeBytes);
                                        var typedArray;
                                        if (weightsEntry.manifestEntry.dtype === 'float32') {
                                            typedArray = new Float32Array(byteBuffer);
                                        } else if (weightsEntry.manifestEntry.dtype === 'int32') {
                                            typedArray = new Int32Array(byteBuffer);
                                        } else {
                                            throw new Error("Weight " + weightsEntry.manifestEntry.name + " has unknown dtype " +
                                                (weightsEntry.manifestEntry.dtype + "."));
                                        }
                                        var weightName = weightsEntry.manifestEntry.name;
                                        if (weightsTensorMap[weightName] != null) {
                                            throw new Error("Duplicate weight with name " + weightName + ". " +
                                                "Please make sure weights names are unique in the manifest JSON.");
                                        }
                                        weightsTensorMap[weightName] = ops_1.tensor(typedArray, weightsEntry.manifestEntry.shape, weightsEntry.manifestEntry.dtype);
                                    });
                                    bufferIndexOffset += numBuffers;
                                });
                                return [2, weightsTensorMap];
                        }
                    });
                });
            }
            exports.loadWeights = loadWeights;

        }, {
            "./ops/ops": 121,
            "./util": 150
        }],
        153: [function (require, module, exports) {
            // A library of seedable RNGs implemented in Javascript.
            //
            // Usage:
            //
            // var seedrandom = require('seedrandom');
            // var random = seedrandom(1); // or any seed.
            // var x = random();       // 0 <= x < 1.  Every bit is random.
            // var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

            // alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
            // Period: ~2^116
            // Reported to pass all BigCrush tests.
            var alea = require('./lib/alea');

            // xor128, a pure xor-shift generator by George Marsaglia.
            // Period: 2^128-1.
            // Reported to fail: MatrixRank and LinearComp.
            var xor128 = require('./lib/xor128');

            // xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
            // Period: 2^192-2^32
            // Reported to fail: CollisionOver, SimpPoker, and LinearComp.
            var xorwow = require('./lib/xorwow');

            // xorshift7, by François Panneton and Pierre L'ecuyer, takes
            // a different approach: it adds robustness by allowing more shifts
            // than Marsaglia's original three.  It is a 7-shift generator
            // with 256 bits, that passes BigCrush with no systmatic failures.
            // Period 2^256-1.
            // No systematic BigCrush failures reported.
            var xorshift7 = require('./lib/xorshift7');

            // xor4096, by Richard Brent, is a 4096-bit xor-shift with a
            // very long period that also adds a Weyl generator. It also passes
            // BigCrush with no systematic failures.  Its long period may
            // be useful if you have many generators and need to avoid
            // collisions.
            // Period: 2^4128-2^32.
            // No systematic BigCrush failures reported.
            var xor4096 = require('./lib/xor4096');

            // Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
            // number generator derived from ChaCha, a modern stream cipher.
            // https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
            // Period: ~2^127
            // No systematic BigCrush failures reported.
            var tychei = require('./lib/tychei');

            // The original ARC4-based prng included in this library.
            // Period: ~2^1600
            var sr = require('./seedrandom');

            sr.alea = alea;
            sr.xor128 = xor128;
            sr.xorwow = xorwow;
            sr.xorshift7 = xorshift7;
            sr.xor4096 = xor4096;
            sr.tychei = tychei;

            module.exports = sr;

        }, {
            "./lib/alea": 154,
            "./lib/tychei": 155,
            "./lib/xor128": 156,
            "./lib/xor4096": 157,
            "./lib/xorshift7": 158,
            "./lib/xorwow": 159,
            "./seedrandom": 160
        }],
        154: [function (require, module, exports) {
            // A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
            // http://baagoe.com/en/RandomMusings/javascript/
            // https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
            // Original work is under MIT license -

            // Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
            //
            // Permission is hereby granted, free of charge, to any person obtaining a copy
            // of this software and associated documentation files (the "Software"), to deal
            // in the Software without restriction, including without limitation the rights
            // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            // copies of the Software, and to permit persons to whom the Software is
            // furnished to do so, subject to the following conditions:
            // 
            // The above copyright notice and this permission notice shall be included in
            // all copies or substantial portions of the Software.
            // 
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
            // THE SOFTWARE.

            (function (global, module, define) {

                function Alea(seed) {
                    var me = this,
                        mash = Mash();

                    me.next = function () {
                        var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
                        me.s0 = me.s1;
                        me.s1 = me.s2;
                        return me.s2 = t - (me.c = t | 0);
                    };

                    // Apply the seeding algorithm from Baagoe.
                    me.c = 1;
                    me.s0 = mash(' ');
                    me.s1 = mash(' ');
                    me.s2 = mash(' ');
                    me.s0 -= mash(seed);
                    if (me.s0 < 0) {
                        me.s0 += 1;
                    }
                    me.s1 -= mash(seed);
                    if (me.s1 < 0) {
                        me.s1 += 1;
                    }
                    me.s2 -= mash(seed);
                    if (me.s2 < 0) {
                        me.s2 += 1;
                    }
                    mash = null;
                }

                function copy(f, t) {
                    t.c = f.c;
                    t.s0 = f.s0;
                    t.s1 = f.s1;
                    t.s2 = f.s2;
                    return t;
                }

                function impl(seed, opts) {
                    var xg = new Alea(seed),
                        state = opts && opts.state,
                        prng = xg.next;
                    prng.int32 = function () {
                        return (xg.next() * 0x100000000) | 0;
                    }
                    prng.double = function () {
                        return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
                    };
                    prng.quick = prng;
                    if (state) {
                        if (typeof (state) == 'object') copy(state, xg);
                        prng.state = function () {
                            return copy(xg, {});
                        }
                    }
                    return prng;
                }

                function Mash() {
                    var n = 0xefc8249d;

                    var mash = function (data) {
                        data = data.toString();
                        for (var i = 0; i < data.length; i++) {
                            n += data.charCodeAt(i);
                            var h = 0.02519603282416938 * n;
                            n = h >>> 0;
                            h -= n;
                            h *= n;
                            n = h >>> 0;
                            h -= n;
                            n += h * 0x100000000; // 2^32
                        }
                        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
                    };

                    return mash;
                }


                if (module && module.exports) {
                    module.exports = impl;
                } else if (define && define.amd) {
                    define(function () {
                        return impl;
                    });
                } else {
                    this.alea = impl;
                }

            })(
                this,
                (typeof module) == 'object' && module, // present in node.js
                (typeof define) == 'function' && define // present with an AMD loader
            );



        }, {}],
        155: [function (require, module, exports) {
            // A Javascript implementaion of the "Tyche-i" prng algorithm by
            // Samuel Neves and Filipe Araujo.
            // See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

            (function (global, module, define) {

                function XorGen(seed) {
                    var me = this,
                        strseed = '';

                    // Set up generator function.
                    me.next = function () {
                        var b = me.b,
                            c = me.c,
                            d = me.d,
                            a = me.a;
                        b = (b << 25) ^ (b >>> 7) ^ c;
                        c = (c - d) | 0;
                        d = (d << 24) ^ (d >>> 8) ^ a;
                        a = (a - b) | 0;
                        me.b = b = (b << 20) ^ (b >>> 12) ^ c;
                        me.c = c = (c - d) | 0;
                        me.d = (d << 16) ^ (c >>> 16) ^ a;
                        return me.a = (a - b) | 0;
                    };

                    /* The following is non-inverted tyche, which has better internal
                     * bit diffusion, but which is about 25% slower than tyche-i in JS.
                    me.next = function() {
                      var a = me.a, b = me.b, c = me.c, d = me.d;
                      a = (me.a + me.b | 0) >>> 0;
                      d = me.d ^ a; d = d << 16 ^ d >>> 16;
                      c = me.c + d | 0;
                      b = me.b ^ c; b = b << 12 ^ d >>> 20;
                      me.a = a = a + b | 0;
                      d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
                      me.c = c = c + d | 0;
                      b = b ^ c;
                      return me.b = (b << 7 ^ b >>> 25);
                    }
                    */

                    me.a = 0;
                    me.b = 0;
                    me.c = 2654435769 | 0;
                    me.d = 1367130551;

                    if (seed === Math.floor(seed)) {
                        // Integer seed.
                        me.a = (seed / 0x100000000) | 0;
                        me.b = seed | 0;
                    } else {
                        // String seed.
                        strseed += seed;
                    }

                    // Mix in string seed, then discard an initial batch of 64 values.
                    for (var k = 0; k < strseed.length + 20; k++) {
                        me.b ^= strseed.charCodeAt(k) | 0;
                        me.next();
                    }
                }

                function copy(f, t) {
                    t.a = f.a;
                    t.b = f.b;
                    t.c = f.c;
                    t.d = f.d;
                    return t;
                };

                function impl(seed, opts) {
                    var xg = new XorGen(seed),
                        state = opts && opts.state,
                        prng = function () {
                            return (xg.next() >>> 0) / 0x100000000;
                        };
                    prng.double = function () {
                        do {
                            var top = xg.next() >>> 11,
                                bot = (xg.next() >>> 0) / 0x100000000,
                                result = (top + bot) / (1 << 21);
                        } while (result === 0);
                        return result;
                    };
                    prng.int32 = xg.next;
                    prng.quick = prng;
                    if (state) {
                        if (typeof (state) == 'object') copy(state, xg);
                        prng.state = function () {
                            return copy(xg, {});
                        }
                    }
                    return prng;
                }

                if (module && module.exports) {
                    module.exports = impl;
                } else if (define && define.amd) {
                    define(function () {
                        return impl;
                    });
                } else {
                    this.tychei = impl;
                }

            })(
                this,
                (typeof module) == 'object' && module, // present in node.js
                (typeof define) == 'function' && define // present with an AMD loader
            );



        }, {}],
        156: [function (require, module, exports) {
            // A Javascript implementaion of the "xor128" prng algorithm by
            // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

            (function (global, module, define) {

                function XorGen(seed) {
                    var me = this,
                        strseed = '';

                    me.x = 0;
                    me.y = 0;
                    me.z = 0;
                    me.w = 0;

                    // Set up generator function.
                    me.next = function () {
                        var t = me.x ^ (me.x << 11);
                        me.x = me.y;
                        me.y = me.z;
                        me.z = me.w;
                        return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
                    };

                    if (seed === (seed | 0)) {
                        // Integer seed.
                        me.x = seed;
                    } else {
                        // String seed.
                        strseed += seed;
                    }

                    // Mix in string seed, then discard an initial batch of 64 values.
                    for (var k = 0; k < strseed.length + 64; k++) {
                        me.x ^= strseed.charCodeAt(k) | 0;
                        me.next();
                    }
                }

                function copy(f, t) {
                    t.x = f.x;
                    t.y = f.y;
                    t.z = f.z;
                    t.w = f.w;
                    return t;
                }

                function impl(seed, opts) {
                    var xg = new XorGen(seed),
                        state = opts && opts.state,
                        prng = function () {
                            return (xg.next() >>> 0) / 0x100000000;
                        };
                    prng.double = function () {
                        do {
                            var top = xg.next() >>> 11,
                                bot = (xg.next() >>> 0) / 0x100000000,
                                result = (top + bot) / (1 << 21);
                        } while (result === 0);
                        return result;
                    };
                    prng.int32 = xg.next;
                    prng.quick = prng;
                    if (state) {
                        if (typeof (state) == 'object') copy(state, xg);
                        prng.state = function () {
                            return copy(xg, {});
                        }
                    }
                    return prng;
                }

                if (module && module.exports) {
                    module.exports = impl;
                } else if (define && define.amd) {
                    define(function () {
                        return impl;
                    });
                } else {
                    this.xor128 = impl;
                }

            })(
                this,
                (typeof module) == 'object' && module, // present in node.js
                (typeof define) == 'function' && define // present with an AMD loader
            );



        }, {}],
        157: [function (require, module, exports) {
            // A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
            //
            // This fast non-cryptographic random number generator is designed for
            // use in Monte-Carlo algorithms. It combines a long-period xorshift
            // generator with a Weyl generator, and it passes all common batteries
            // of stasticial tests for randomness while consuming only a few nanoseconds
            // for each prng generated.  For background on the generator, see Brent's
            // paper: "Some long-period random number generators using shifts and xors."
            // http://arxiv.org/pdf/1004.3115v1.pdf
            //
            // Usage:
            //
            // var xor4096 = require('xor4096');
            // random = xor4096(1);                        // Seed with int32 or string.
            // assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
            // assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
            //
            // For nonzero numeric keys, this impelementation provides a sequence
            // identical to that by Brent's xorgens 3 implementaion in C.  This
            // implementation also provides for initalizing the generator with
            // string seeds, or for saving and restoring the state of the generator.
            //
            // On Chrome, this prng benchmarks about 2.1 times slower than
            // Javascript's built-in Math.random().

            (function (global, module, define) {

                function XorGen(seed) {
                    var me = this;

                    // Set up generator function.
                    me.next = function () {
                        var w = me.w,
                            X = me.X,
                            i = me.i,
                            t, v;
                        // Update Weyl generator.
                        me.w = w = (w + 0x61c88647) | 0;
                        // Update xor generator.
                        v = X[(i + 34) & 127];
                        t = X[i = ((i + 1) & 127)];
                        v ^= v << 13;
                        t ^= t << 17;
                        v ^= v >>> 15;
                        t ^= t >>> 12;
                        // Update Xor generator array state.
                        v = X[i] = v ^ t;
                        me.i = i;
                        // Result is the combination.
                        return (v + (w ^ (w >>> 16))) | 0;
                    };

                    function init(me, seed) {
                        var t, v, i, j, w, X = [],
                            limit = 128;
                        if (seed === (seed | 0)) {
                            // Numeric seeds initialize v, which is used to generates X.
                            v = seed;
                            seed = null;
                        } else {
                            // String seeds are mixed into v and X one character at a time.
                            seed = seed + '\0';
                            v = 0;
                            limit = Math.max(limit, seed.length);
                        }
                        // Initialize circular array and weyl value.
                        for (i = 0, j = -32; j < limit; ++j) {
                            // Put the unicode characters into the array, and shuffle them.
                            if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
                            // After 32 shuffles, take v as the starting w value.
                            if (j === 0) w = v;
                            v ^= v << 10;
                            v ^= v >>> 15;
                            v ^= v << 4;
                            v ^= v >>> 13;
                            if (j >= 0) {
                                w = (w + 0x61c88647) | 0; // Weyl.
                                t = (X[j & 127] ^= (v + w)); // Combine xor and weyl to init array.
                                i = (0 == t) ? i + 1 : 0; // Count zeroes.
                            }
                        }
                        // We have detected all zeroes; make the key nonzero.
                        if (i >= 128) {
                            X[(seed && seed.length || 0) & 127] = -1;
                        }
                        // Run the generator 512 times to further mix the state before using it.
                        // Factoring this as a function slows the main generator, so it is just
                        // unrolled here.  The weyl generator is not advanced while warming up.
                        i = 127;
                        for (j = 4 * 128; j > 0; --j) {
                            v = X[(i + 34) & 127];
                            t = X[i = ((i + 1) & 127)];
                            v ^= v << 13;
                            t ^= t << 17;
                            v ^= v >>> 15;
                            t ^= t >>> 12;
                            X[i] = v ^ t;
                        }
                        // Storing state as object members is faster than using closure variables.
                        me.w = w;
                        me.X = X;
                        me.i = i;
                    }

                    init(me, seed);
                }

                function copy(f, t) {
                    t.i = f.i;
                    t.w = f.w;
                    t.X = f.X.slice();
                    return t;
                };

                function impl(seed, opts) {
                    if (seed == null) seed = +(new Date);
                    var xg = new XorGen(seed),
                        state = opts && opts.state,
                        prng = function () {
                            return (xg.next() >>> 0) / 0x100000000;
                        };
                    prng.double = function () {
                        do {
                            var top = xg.next() >>> 11,
                                bot = (xg.next() >>> 0) / 0x100000000,
                                result = (top + bot) / (1 << 21);
                        } while (result === 0);
                        return result;
                    };
                    prng.int32 = xg.next;
                    prng.quick = prng;
                    if (state) {
                        if (state.X) copy(state, xg);
                        prng.state = function () {
                            return copy(xg, {});
                        }
                    }
                    return prng;
                }

                if (module && module.exports) {
                    module.exports = impl;
                } else if (define && define.amd) {
                    define(function () {
                        return impl;
                    });
                } else {
                    this.xor4096 = impl;
                }

            })(
                this, // window object or global
                (typeof module) == 'object' && module, // present in node.js
                (typeof define) == 'function' && define // present with an AMD loader
            );

        }, {}],
        158: [function (require, module, exports) {
           

            (function (global, module, define) {

                function XorGen(seed) {
                    var me = this;

                    // Set up generator function.
                    me.next = function () {
                        // Update xor generator.
                        var X = me.x,
                            i = me.i,
                            t, v, w;
                        t = X[i];
                        t ^= (t >>> 7);
                        v = t ^ (t << 24);
                        t = X[(i + 1) & 7];
                        v ^= t ^ (t >>> 10);
                        t = X[(i + 3) & 7];
                        v ^= t ^ (t >>> 3);
                        t = X[(i + 4) & 7];
                        v ^= t ^ (t << 7);
                        t = X[(i + 7) & 7];
                        t = t ^ (t << 13);
                        v ^= t ^ (t << 9);
                        X[i] = v;
                        me.i = (i + 1) & 7;
                        return v;
                    };

                    function init(me, seed) {
                        var j, w, X = [];

                        if (seed === (seed | 0)) {
                            
                            w = X[0] = seed;
                        } else {
                            
                            seed = '' + seed;
                            for (j = 0; j < seed.length; ++j) {
                                X[j & 7] = (X[j & 7] << 15) ^
                                    (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
                            }
                        }
                        
                        while (X.length < 8) X.push(0);
                        for (j = 0; j < 8 && X[j] === 0; ++j);
                        if (j == 8) w = X[7] = -1;
                        else w = X[j];

                        me.x = X;
                        me.i = 0;

                        
                        for (j = 256; j > 0; --j) {
                            me.next();
                        }
                    }

                    init(me, seed);
                }

                function copy(f, t) {
                    t.x = f.x.slice();
                    t.i = f.i;
                    return t;
                }

                function impl(seed, opts) {
                    if (seed == null) seed = +(new Date);
                    var xg = new XorGen(seed),
                        state = opts && opts.state,
                        prng = function () {
                            return (xg.next() >>> 0) / 0x100000000;
                        };
                    prng.double = function () {
                        do {
                            var top = xg.next() >>> 11,
                                bot = (xg.next() >>> 0) / 0x100000000,
                                result = (top + bot) / (1 << 21);
                        } while (result === 0);
                        return result;
                    };
                    prng.int32 = xg.next;
                    prng.quick = prng;
                    if (state) {
                        if (state.x) copy(state, xg);
                        prng.state = function () {
                            return copy(xg, {});
                        }
                    }
                    return prng;
                }

                if (module && module.exports) {
                    module.exports = impl;
                } else if (define && define.amd) {
                    define(function () {
                        return impl;
                    });
                } else {
                    this.xorshift7 = impl;
                }

            })(
                this,
                (typeof module) == 'object' && module, 
            );


        }, {}],
        159: [function (require, module, exports) {
            

            (function (global, module, define) {

                function XorGen(seed) {
                    var me = this,
                        strseed = '';

                    // Set up generator function.
                    me.next = function () {
                        var t = (me.x ^ (me.x >>> 2));
                        me.x = me.y;
                        me.y = me.z;
                        me.z = me.w;
                        me.w = me.v;
                        return (me.d = (me.d + 362437 | 0)) +
                            (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
                    };

                    me.x = 0;
                    me.y = 0;
                    me.z = 0;
                    me.w = 0;
                    me.v = 0;

                    if (seed === (seed | 0)) {
                        // Integer seed.
                        me.x = seed;
                    } else {
                        // String seed.
                        strseed += seed;
                    }

                    // Mix in string seed, then discard an initial batch of 64 values.
                    for (var k = 0; k < strseed.length + 64; k++) {
                        me.x ^= strseed.charCodeAt(k) | 0;
                        if (k == strseed.length) {
                            me.d = me.x << 10 ^ me.x >>> 4;
                        }
                        me.next();
                    }
                }

                function copy(f, t) {
                    t.x = f.x;
                    t.y = f.y;
                    t.z = f.z;
                    t.w = f.w;
                    t.v = f.v;
                    t.d = f.d;
                    return t;
                }

                function impl(seed, opts) {
                    var xg = new XorGen(seed),
                        state = opts && opts.state,
                        prng = function () {
                            return (xg.next() >>> 0) / 0x100000000;
                        };
                    prng.double = function () {
                        do {
                            var top = xg.next() >>> 11,
                                bot = (xg.next() >>> 0) / 0x100000000,
                                result = (top + bot) / (1 << 21);
                        } while (result === 0);
                        return result;
                    };
                    prng.int32 = xg.next;
                    prng.quick = prng;
                    if (state) {
                        if (typeof (state) == 'object') copy(state, xg);
                        prng.state = function () {
                            return copy(xg, {});
                        }
                    }
                    return prng;
                }

                if (module && module.exports) {
                    module.exports = impl;
                } else if (define && define.amd) {
                    define(function () {
                        return impl;
                    });
                } else {
                    this.xorwow = impl;
                }

            })(
                this,
                (typeof module) == 'object' && module, // present in node.js
                (typeof define) == 'function' && define // present with an AMD loader
            );



        }, {}],
        160: [function (require, module, exports) {
          

            (function (pool, math) {
                
                var global = this,
                    width = 256, // each RC4 output is 0 <= x < 256
                    chunks = 6, // at least six RC4 outputs for each double
                    digits = 52, // there are 52 significant digits in a double
                    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
                    startdenom = math.pow(width, chunks),
                    significance = math.pow(2, digits),
                    overflow = significance * 2,
                    mask = width - 1,
                    nodecrypto; // node.js crypto module, initialized at the bottom.

               

                    prng.int32 = function () {
                        return arc4.g(4) | 0;
                    }
                    prng.quick = function () {
                        return arc4.g(4) / 0x100000000;
                    }
                    prng.double = prng;

                        })(
                        prng,
                        shortseed,
                        'global' in options ? options.global : (this == math),
                        options.state);
                }
                math['seed' + rngname] = seedrandom;


                    // Some AMD build optimizers, like r.js, check for specific condition patterns
                    // like the following:
                    if (
                        typeof define == 'function' &&
                        typeof define.amd == 'object' &&
                        define.amd
                    ) {
                        define(function () {
                            return utf8;
                        });
                    } else if (freeExports && !freeExports.nodeType) {
                        if (freeModule) { // in Node.js or RingoJS v0.8.0+
                            freeModule.exports = utf8;
                        } else { // in Narwhal or RingoJS v0.7.0-
                            var object = {};
                            var hasOwnProperty = object.hasOwnProperty;
                            for (var key in utf8) {
                                hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
                            }
                        }
                    } else { // in Rhino or a web browser
                        root.utf8 = utf8;
                    }

                }(this));

            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {}]
    }, {},
    [1]);