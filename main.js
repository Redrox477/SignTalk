
import {
  KNNImageClassifier
} from 'deeplearn-knn-image-classifier';
import * as dl from 'deeplearn';


const IMAGE_SIZE = 227;

const TOPK = 10;

const confidenceThreshold = 0.98


var words = ["start", "stop"];


class Main {
  constructor() {
    
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
    this.proceedBtn.addEventListener('click', () => {
      this.welcomeContainer.classList.add("slideOutUp");
    })

    
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

  
    this.initializeTranslator();

    this.predictionOutput = new PredictionOutput();
  }
  initializeTranslator() {
    this.startWebcam();
    this.initialTraining();
    this.loadKNN();
  }

  startWebcam() {
    navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user'
        },
        audio: false
      })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.width = IMAGE_SIZE;
        this.video.height = IMAGE_SIZE;
        this.video.addEventListener('playing', () => this.videoPlaying = true);
        this.video.addEventListener('paused', () => this.videoPlaying = false);
      })
  }

  initialTraining() {
    this.nextButton.addEventListener('click', () => {
      const exampleCount = this.knn.getClassExampleCount();
      if (Math.max(...exampleCount) > 0) {
        if (exampleCount[0] == 0) {
          alert('You haven\'t added examples for the Start Gesture');
          return;
        }
        if (exampleCount[1] == 0) {
          alert('You haven\'t added examples for the Stop Gesture.\n\nCapture yourself in idle states e.g hands by your side, empty background etc.');
          return;
        }

        this.nextButton.style.display = "none";
        this.stageInstruction.innerText = "Add Gesture Name and Train or Use pretrained Gestures";

        this.setupTrainingUI();
      }
    });

    this.initialGestures(0, "startButton");
    this.initialGestures(1, "stopButton");
  }

  loadKNN() {
    this.knn = new KNNImageClassifier(words.length, TOPK);

   
    this.knn.load().then(() => this.initializeTraining());
  }

  initialGestures(i, btnType) {
    var trainBtn = document.getElementById(btnType);

    trainBtn.addEventListener('click', () => {
      this.train(i);
    });

    var clearBtn = document.getElementById('clear_' + btnType);
    clearBtn.addEventListener('click', () => {
      this.knn.clearClass(i);
      this.exampleCountDisplay[i].innerText = " 0 examples";
      this.gestureCards[i].removeChild(this.gestureCards[i].childNodes[1]);
      this.checkMarks[i].src = "Images\\loader.gif";
    });

    var exampleCountDisplay = document.getElementById('counter_' + btnType);
    var checkMark = document.getElementById('checkmark_' + btnType);

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

  setupTrainingUI() {
    const exampleCount = this.knn.getClassExampleCount();
   
    if (Math.max(...exampleCount) > 0) {
      if (exampleCount[0] == 0) {
        alert('You haven\'t added examples for the wake word');
        return;
      }
      if (exampleCount[1] == 0) {
        alert('You haven\'t added examples for the Stop Gesture.\n\nCapture yourself in idle states e.g hands by your side, empty background etc.');
        return;
      }

      
      this.initialTrainingHolder.style.display = "none";

  
      this.trainingContainer.style.display = "block";
      this.trainedCardsHolder.style.display = "block";

  
      this.addWordForm.addEventListener('submit', (e) => {
        this.trainingCommands.innerHTML = "";

        e.preventDefault(); 

       
        if (word && !words.includes(word)) {
          words.push(word);


          this.createTrainingBtns(words.indexOf(word));
          this.newWordInput.value = '';

          
          this.knn.numClasses += 1;
          this.knn.classLogitsMatrices.push(null);
          this.knn.classExampleCount.push(0);

          
          this.initializeTraining();
          this.createTranslateBtn();
        } else {
          alert("Duplicate word or no word entered");
        }
        return;
      });
    } else {
      alert('You haven\'t added any examples yet.\n\nAdd a Gesture, then perform the sign in front of the webcam.');
    }
  }

  
 
   
    

    


  initializeTraining() {
    if (this.timer) {
      this.stopTraining();
    }
    var promise = this.video.play();

    if (promise !== undefined) {
      promise.then(_ => {
        console.log("Autoplay started")
      }).catch(error => {
        console.log("Autoplay prevented")
      })
    }
  }

  
  train(gestureIndex) {
    console.log(this.videoPlaying);
    if (this.videoPlaying) {
      console.log("entered training");
      
      const image = dl.fromPixels(this.video);

      
      this.knn.addImage(image, gestureIndex);

      
      const exampleCount = this.knn.getClassExampleCount()[gestureIndex];

      if (exampleCount > 0) {
       
        this.exampleCountDisplay[gestureIndex].innerText = ' ' + exampleCount + ' examples';

       
        if (exampleCount == 1 && this.gestureCards[gestureIndex].childNodes[1] == null) {
          var gestureImg = document.createElement("canvas");
          gestureImg.className = "trained_image";
          gestureImg.getContext('2d').drawImage(video, 0, 0, 400, 180);
          this.gestureCards[gestureIndex].appendChild(gestureImg);
        }

        
        if (exampleCount == 30) {
          this.checkMarks[gestureIndex].src = "Images//checkmark.svg";
          this.checkMarks[gestureIndex].classList.add("animated");
          this.checkMarks[gestureIndex].classList.add("rotateIn");
        }
      }
    }
  }

  

  
 

  
  createVideoCallBtn() {
    
    videoCallBtn.addEventListener('click', () => {
      this.stageTitle.innerText = "Video Call";
      this.stageInstruction.innerText = "Translate Gestures to talk to people on Video Call";

      this.video.style.display = "none";
      this.videoContainer.style.borderStyle = "none";
      this.videoContainer.style.overflow = "hidden";
      this.videoContainer.style.width = "630px";
      this.videoContainer.style.height = "355px";

      this.videoCall.style.display = "block";
      this.videoCallBtn.style.display = "none";
      this.backToTrainButton.style.display = "none";
      this.predButton.innerText = "Local Translation";
      this.predButton.style.display = "block";

      this.setStatusText("Status: Video Call Activated");
    })
  }
  /*This function sets the status text*/
  setStatusText(status, type) { //make default type thing
    this.statusContainer.style.display = "block";
    this.statusText.innerText = status;
    if (type == "copy") {
      console.log("copy");
      this.statusContainer.style.backgroundColor = "blue";
    } else {
      this.statusContainer.style.backgroundColor = "black";
    }
  }
}


class PredictionOutput {
  constructor() {
    
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.pitch = 1.0;
    this.rate = 0.9;

    this.statusContainer = document.getElementById("status");
    this.statusText = document.getElementById("status-text");

    this.translationHolder = document.getElementById("translationHolder");
    this.translationText = document.getElementById("translationText");
    this.translatedCard = document.getElementById("translatedCard");
    this.trainedCardsHolder = document.getElementById("trainedCardsHolder");

    this.selectedVoice = 48; // this is Google-US en. Can set voice and language of choice

    this.currentPredictedWords = [];
    this.waitTimeForQuery = 10000;

    this.synth.onvoiceschanged = () => {
      this.populateVoiceList()
    };

    //Set up copy translation event listener
    this.copyTranslation();
  }

  // Checks if speech synthesis is possible and if selected voice is available
  populateVoiceList() {
    if (typeof speechSynthesis === 'undefined') {
      console.log("no synth");
      return;
    }
    this.voices = this.synth.getVoices();

    if (this.voices.indexOf(this.selectedVoice) > 0) {
      console.log(this.voices[this.selectedVoice].name + ':' + this.voices[this.selectedVoice].lang);
    }
  }

  /*This function outputs the word using text and gesture cards*/
  textOutput(word, gestureCard, gestureAccuracy) {
    // If the word is start, clear translated text content
    if (word == 'start') {
      this.clearPara();

      setTimeout(() => {
        // if no query detected after start is signed, clear para
        if (this.currentPredictedWords.length == 1) {
          this.clearPara();
        }
      }, this.waitTimeForQuery);
    }

    // If first word is not start, return
    if (word != 'start' && this.currentPredictedWords.length == 0) {
      return;
    }

    // If word was already said in this query, return
    if (this.currentPredictedWords.includes(word)) {
      return;
    }

    // Add word to predicted words in this query
    this.currentPredictedWords.push(word);

    // Depending on the word, display the text output
    if (word == "start") {
      this.translationText.innerText += ' ';
    } else if (word == "stop") {
      this.translationText.innerText += '.';
    } else {
      this.translationText.innerText += ' ' + word;
    }

    //Clone Gesture Card
    this.translatedCard.innerHTML = " ";
    var clonedCard = document.createElement("div");
    clonedCard.className = "trained-gestures";

    var gestName = gestureCard.childNodes[0].innerText;
    var gestureName = document.createElement("h5");
    gestureName.innerText = gestName;
    clonedCard.appendChild(gestureName);

    var gestureImg = document.createElement("canvas");
    gestureImg.className = "trained_image";
    gestureImg.getContext('2d').drawImage(gestureCard.childNodes[1], 0, 0, 400, 180);
    clonedCard.appendChild(gestureImg);

    var gestAccuracy = document.createElement("h7");
    gestAccuracy.innerText = "Confidence: " + gestureAccuracy + "%";
    clonedCard.appendChild(gestAccuracy);

    this.translatedCard.appendChild(clonedCard);

    
    if (word != "start" && word != "stop") {
      this.speak(word);
    }
  }

  

 
  speak(word) {
    var utterThis = new SpeechSynthesisUtterance(word);

    utterThis.onerror = function (evt) {
      console.log("Error speaking");
    };

    utterThis.voice = this.voices[this.selectedVoice];
    utterThis.pitch = this.pitch;
    utterThis.rate = this.rate;

    this.synth.speak(utterThis);
  }
}

var main = null;

window.addEventListener('load', () => {
  main = new Main()
});