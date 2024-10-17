let handPose;
let bodyPose;

let video;
let poses = [];
let connections;
let hands = [];
let decisions = [];
let timer = 0;
let timeDuration;
let angleGrid = [];
let fadeTimerGrid = [];
let emotions = ["neutral"];
let ah = 0;
let na = 0;
let sc = 0;

function preload() {
  handPose = ml5.handPose();
  bodyPose = ml5.bodyPose();
}

const cellSize = 10;
let row;
let col;

let evolution = [
  "grass",
  "forest",
  "water",
  "mountain",
  "village",
  "battlefield",
  "church",
  "city",
  "spacestation",
  "harbor",
];

let grid = [];
let previousGrid = [];
let lastChangedCell = { row: -1, col: -1 };

let rotationSpeeds = [
  0.02, 0.03, 0.04, 0.05, 0.01, 0.1, 0.06, 0.07, 0.08, 0.09,
];

function setup() {
  createCanvas(1000, 700);
  textAlign(CENTER, CENTER);
  textSize(12);
  video = createCapture(VIDEO);
  video.hide();
  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
  handPose.detectStart(video, getHandsData);
  row = Math.floor(height / cellSize);
  col = Math.floor(width / cellSize);

  for (let i = 0; i < row; i++) {
    grid[i] = [];
    previousGrid[i] = [];
    angleGrid[i] = [];
    fadeTimerGrid[i] = [];
    for (let j = 0; j < col; j++) {
      let r = random();
      if (r < 0.5) {
        grid[i][j] = 0;
      } else if (r < 0.75) {
        grid[i][j] = 1;
      } else if (r < 0.9) {
        grid[i][j] = 2;
      } else {
        grid[i][j] = 3;
      }
      previousGrid[i][j] = grid[i][j];
      fadeTimerGrid[i][j] = 0;
      angleGrid[i][j] = random(TWO_PI);
    }
    timeDuration = random(200, 300);
  }
}
function countEmotions() {
  let emotionCounts = {};

  for (let i = 0; i < emotions.length; i++) {
    let emotion = emotions[i];
    if (emotionCounts[emotion]) {
      emotionCounts[emotion]++;
    } else {
      emotionCounts[emotion] = 1;
    }
  }

  let neutral = emotionCounts["neutral"] || 0;
  let angry = emotionCounts["angry"] || 0;
  let calm = emotionCounts["calm"] || 0;
  let suprised = emotionCounts["surprised"] || 0;
  let anxiety = emotionCounts["anxiety"] || 0;
  let happy = emotionCounts["happy"] || 0;

  neutral = neutral - random(0,2);
  angry = angry - random(0,2);
  calm = calm - random(0,2);
  suprised = suprised - random(0,2);
  anxiety = anxiety - random(0,2);
  happy = happy - random(0,2);
  if(neutral < 0){
    neutral = 0;
  }

let na = neutral/anxiety;
let ah = angry/happy;
let sc = suprised/calm;
console.log("na",na);
console.log("ah",ah);
console.log("sc",sc);



  
}

function emotionHandling() {
  
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    if (hands.length > 0) {
      for (let h = 0; h < hands.length; h++) {
        let hand = hands[h];

        if (hand.keypoints[4].x < hand.keypoints[0].x && hand.keypoints[8].y < hand.keypoints[0].y) {
          emotions.push("angry");
          console.log(emotions);

        }
        if (hand.keypoints[4].x > hand.keypoints[8].x) {
          emotions.push("calm");
          console.log(emotions);

        }
        if (hand.keypoints[4].y < hand.keypoints[3].y && 
            hand.keypoints[8].y > hand.keypoints[6].y &&  
            hand.keypoints[12].y > hand.keypoints[10].y && 
            hand.keypoints[16].y > hand.keypoints[14].y &&
            hand.keypoints[20].y > hand.keypoints[18].y) {
          emotions.push("happy");
          console.log("happy detected (thumbs up)");
        }
      }
      countEmotions();

    }

    if (pose.keypoints[9].x < pose.keypoints[10].x) {
      emotions.push("angry");
      console.log(emotions);
    }
    if (pose.keypoints[9].y && pose.keypoints[10].y < pose.keypoints[3].y) {
      emotions.push("surprised");
      console.log(emotions);
    }else{
      emotions.push("neutral");
    }
if(poses.length >= 1 && random(0,1) > 0.7)
    emotions.push("anxiety")
  }
  
  
  //console.log(emotions);
}

function draw() {
  background(10, 10, 10, 50);
  timer += deltaTime;
  noStroke();
  emotionHandling();
  neighbors();

  let colors = {
    0: color(34, 139, 34), // grass - green
    1: color(0, 100, 0), // forest - dark green
    2: color(0, 191, 255), // water - blue
    3: color(169, 169, 169), // mountain - gray
    4: color(160, 82, 45), // village - brown
    5: color(255, 0, 0), // battlefield - red
    6: color(255, 255, 255), // church - white
    7: color(0, 0, 0), // city - dark gray
    8: color(192, 192, 192), // spacestation - silver
    9: color(0, 128, 128), // harbor - teal
  };

  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      let state = grid[i][j];
      let prevState = previousGrid[i][j];
      let centerX = j * cellSize + cellSize / 2;
      let centerY = i * cellSize + cellSize / 2;

      angleGrid[i][j] += rotationSpeeds[state];

      let orbitRadius = cellSize / 3;
      let dotX = centerX + cos(angleGrid[i][j]) * orbitRadius;
      let dotY = centerY + sin(angleGrid[i][j]) * orbitRadius;

      // fadeTimerGrid[i][j] = constrain(
      //   fadeTimerGrid[i][j] + deltaTime / 2000,
      //   0,
      //   1
      // );
      // let blendedColor = lerpColor(
      //   colors[prevState],
      //   colors[state],
      //   fadeTimerGrid[i][j]
      // );

      fill(colors[state]);
      rect(j * cellSize, i * cellSize, cellSize, cellSize);
     // ellipse(dotX, dotY, cellSize / 6, cellSize / 6);
    }
  }

  push();
  textSize(24);
  textAlign(LEFT, TOP);
  text(`People detected: ${poses.length}`, 10, 10);
  pop();
  
}

function neighbors() {
  
  if (timer > timeDuration) {
    let newGrid = [];
    let changeOccurred = false;

    let battlefieldModifier = constrain(ah, 0.1, 2); // Affects battlefield chance, scaled by ah
    let villageModifier = constrain(na, 0.1, 2); // Affects village chance, scaled by na
    let churchModifier = constrain(sc, 0.1, 2); // Affects church chance, scaled by sc
console.log("neighbors",battlefieldModifier );
    for (let i = 0; i < row; i++) {
      newGrid[i] = [];
      for (let j = 0; j < col; j++) {
        let me = grid[i][j];
        let left = grid[i][(j - 1 + col) % col];
        let right = grid[i][(j + 1) % col];
        let above = grid[(i - 1 + row) % row][j];
        let under = grid[(i + 1) % row][j];
        let left2 = grid[i][(j - 2 + col) % col];
        let right2 = grid[i][(j + 2) % col];
        let above2 = grid[(i - 2 + row) % row][j];
        let under2 = grid[(i + 2) % row][j];

        let natrualVillagesh =
          left === 0 &&
          me === 0 &&
          right === 0 &&
          (left2 === 1 || right2 === 0);
        let natrualVillagesv =
          above === 0 &&
          me === 0 &&
          under === 0 &&
          (above2 === 1 || under2 === 1);

        let battlefieldh = (me === 0 || me === 1) && left === 4 && right === 4;
        let battlefieldv = (me === 0 || me === 1) && above === 4 && under === 4;

        let battlefieldChance = random() < 0.01 * battlefieldModifier;
        let churchChance = random() < 0.01 * churchModifier;

        if (
          (natrualVillagesh || natrualVillagesv) &&
          !changeOccurred &&
          !(lastChangedCell.row === i && lastChangedCell.col === j)
        ) {
          if (random() < 0.05 * villageModifier) { // Increase chance of village based on na
            if (left === 0 && left2 === 1) {
              grid[i][(j - 1 + col) % col] = 4;
              grid[i][(j - 2 + col) % col] = 0;
            } else if (right === 0 && right2 === 1) {
              grid[i][(j + 1) % col] = 4;
              grid[i][(j + 2) % col] = 0;
            } else if (above === 1 && above2 === 1) {
              grid[(i - 1 + row) % row][j] = 4;
              grid[(i - 2 + row) % row][j] = 0;
            } else {
              grid[(i + 1) % row][j] = 4;
              grid[(i + 2) % row][j] = 0;
            }
            newGrid[i][j] = 4;
            lastChangedCell = { row: i, col: j };
            changeOccurred = true;
          }
        } else {
          newGrid[i][j] = me;
        }

        if ((battlefieldh || battlefieldv) && battlefieldChance) {
          newGrid[i][j] = 5;
          lastChangedCell = { row: i, col: j };
          changeOccurred = true;
        }

        if (grid[i][j] === 5 && battlefieldChance) {
          grid[i][(j - 1 + col) % col] = 0;
          grid[i][(j + 1) % col] = newGrid[i][j] = 4;
        }

        if (
          left === 4 &&
          left2 === 4 &&
          right === 4 &&
          right2 === 4 &&
          above === 4 &&
          above2 === 4 &&
          under === 4 &&
          under2 === 4 &&
          churchChance
        ) {
          newGrid[i][j] = 6;
        }

        if (left === 6 || right === 6) {
          newGrid[i][j] = 4;
        }
        if (
          me === 4 &&
          left === 4 &&
          right === 4 &&
          above === 4 &&
          under === 4 &&
          (under2 === 6 || above2 === 6 || right2 === 6 || left2 === 6)
        ) {
          grid[i][j] = 7;
          grid[i][(j - 1 + col) % col] = 7;
          grid[i][(j + 1) % col] = 7;
          grid[(i - 1 + row) % row][j] = 7;
          grid[(i + 1) % row][j] = 7;
        }

        if (
          me === 3 &&
          (above === 7 || under === 7 || right === 7 || left === 7)
        ) {
          newGrid[i][j] = 8;
        }

        // Harbor upgrade logic
        if (
          me === 2 &&
          (above === 7 || under === 7 || right === 7 || left === 7)
        ) {
          newGrid[i][j] = 9;
        }
      }
    }

    if (changeOccurred) {
      grid = newGrid;
      timer = 0;
      timeDuration = random(5, 10);
    }
  }
}


function getHandsData(results) {
  hands = results;
}

function gotPoses(results) {
  poses = results;
}
function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("myArtwork", "png");
  }
}
