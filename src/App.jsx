import { useState, useEffect, useRef } from "react";

import KeyboardEventHandler from "react-keyboard-event-handler";

import pacmanImg from "./assets/animations.gif";
import ghostImg from "./assets/ghost.png";

import PacmanWakaWakaMp3 from "./assets/PacmanWaka.mp3";
import PacmanGameOverMp3 from "./assets/PacmanDeath.wav";
import PacmanStartMp3 from "./assets/PacmanStart.mp3";

import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [canvasContext, setCanvasContext] = useState(null);
  const pacmanImgRef = useRef(null);
  const [pacmanAnim, setPacmanAnim] = useState(null);
  const ghostsImgRef = useRef(null);
  const [ghostsAnim, setGhostsAnim] = useState(null);
  const [isStart, setIsStart] = useState(true);

  const PacmanGameOver = new Audio(PacmanGameOverMp3);
  const PacmanStart = new Audio(PacmanStartMp3);
  PacmanStart.volume = 0.1;
  PacmanGameOver.volume = 0.1;

  let gameInterval;

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(canvasRef.current);
    }

    if (pacmanImgRef) {
      setPacmanAnim(pacmanImgRef.current);
    }

    if (ghostsImgRef) {
      setGhostsAnim(ghostsImgRef.current);
    }
  }, []);

  useEffect(() => {
    if (canvas) {
      setCanvasContext(canvas.getContext("2d"));
    }
  }, [canvas]);

  const createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
  };

  let pacman;
  let ghosts = [];
  const ghostCount = 4;
  const fps = 30;
  const oneBlockSize = 20;
  const wallColor = "#342DCA";
  const wallSpaceWidth = oneBlockSize / 1.5;
  const wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
  const wallInnerColor = "black";
  const foodColor = "#FEB897";
  let lives = 3;
  let foodCounts = 0;

  let score = 0;
  const DIRECTION_RIGHT = 4;
  const DIRECTION_UP = 3;
  const DIRECTION_LEFT = 2;
  const DIRECTION_BOTTOM = 1;

  let ghostLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
  ];

  const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
    [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[0].length; j++) {
      if (map[i][j] == 2) {
        foodCounts++;
      }
    }
  }

  let randomTargetsForGhosts = [
    { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
    { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize },
    { x: (map[0].length - 2) * oneBlockSize, y: oneBlockSize },
    { x: (map[0].length - 2) * oneBlockSize, y: (map.length - 2) * oneBlockSize },
  ];

  const update = () => {
    pacman.moveProcess();
    pacman.eat();
  };

  const drawFoods = () => {
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[0].length; j++) {
        if (map[i][j] == 2) {
          createRect(
            j * oneBlockSize + oneBlockSize / 2.5,
            i * oneBlockSize + oneBlockSize / 2.5,
            oneBlockSize / 4,
            oneBlockSize / 4,
            foodColor
          );
        }
      }
    }
  };

  const drawScore = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Score: " + score, 0, oneBlockSize * (map.length + 1) + 10);
  };

  const drawGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
      ghosts[i].draw();
    }
  };

  const draw = () => {
    createRect(0, 0, canvas.width, canvas.height, "black");
    drawWalls();
    drawFoods();
    pacman.draw();
    drawGhosts();
    drawScore();
    drawLives();
  };

  const gameLoop = () => {
    update();
    draw();

    for (let i = 0; i < ghosts.length; i++) {
      ghosts[i].moveProcess();
    }

    if (pacman.checkGhostCollision()) {
      restartGame();
    }

    if (score >= foodCounts) {
      drawWin();
      clearInterval(gameInterval);
      setTimeout(() => {
        location.reload();
      }, 2500);
    }
  };

  const restartGame = () => {
    createNewPacman();
    createGhosts();
    lives--;

    if (lives == 0) {
      gameOver();
    }
  };

  const gameOver = () => {
    drawGameOver();
    PacmanGameOver.play();
    clearInterval(gameInterval);
    setTimeout(() => {
      location.reload();
    }, 2500);
  };

  const drawGameOver = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "red";
    canvasContext.fillText("Game Over!", 115, 200);
  };

  const drawWin = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "yellow";
    canvasContext.fillText("Winner!", 150, 200);
  };

  const drawStart = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "yellow";
    canvasContext.fillText("START GAME", 115, 200);
  };

  const drawLives = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Lives: ", 220, oneBlockSize * (map.length + 1) + 10);
    for (let i = 0; i < lives; i++) {
      canvasContext.drawImage(
        pacmanAnim,
        2 * oneBlockSize,
        0,
        oneBlockSize,
        oneBlockSize,
        350 + i * oneBlockSize,
        oneBlockSize * map.length + 10,
        oneBlockSize,
        oneBlockSize
      );
    }
  };

  const drawWalls = () => {
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[0].length; j++) {
        if (map[i][j] == 1) {
          createRect(j * oneBlockSize, i * oneBlockSize, oneBlockSize, oneBlockSize, wallColor);
        }
        if (j > 0 && map[i][j - 1] == 1) {
          createRect(
            j * oneBlockSize,
            i * oneBlockSize + wallOffset,
            wallSpaceWidth + wallOffset,
            wallSpaceWidth,
            wallInnerColor
          );
        }
        if (j < map[0].length - 1 && map[i][j + 1] == 1) {
          createRect(
            j * oneBlockSize + wallOffset,
            i * oneBlockSize + wallOffset,
            wallSpaceWidth + wallOffset,
            wallSpaceWidth,
            wallInnerColor
          );
        }
        if (i > 0 && map[i - 1][j] == 1) {
          createRect(
            j * oneBlockSize + wallOffset,
            i * oneBlockSize,
            wallSpaceWidth,
            wallSpaceWidth + wallOffset,
            wallInnerColor
          );
        }
        if (i < map.length - 1 && map[i + 1][j] == 1) {
          createRect(
            j * oneBlockSize + wallOffset,
            i * oneBlockSize + wallOffset,
            wallSpaceWidth,
            wallSpaceWidth + wallOffset,
            wallInnerColor
          );
        }
      }
    }
  };

  class Pacman {
    constructor(x, y, width, height, speed) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.direction = DIRECTION_RIGHT;
      this.nextDirection = this.direction;
      this.currentFrame = 1;
      this.frameCount = 7;

      setInterval(() => {
        this.changeAnimation();
      }, 100);
    }

    moveProcess() {
      this.changeDirectionIfPossible();
      this.moveForwards();
      if (this.checkCollision()) {
        this.moveBackwards();
      }
    }

    eat() {
      for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
          if (map[i][j] == 2 && this.getMapX() == j && this.getMapY() == i) {
            map[i][j] = 3;
            score++;
            const PacmanWakaWaka = new Audio(PacmanWakaWakaMp3);
            PacmanWakaWaka.volume = 0.1;
            PacmanWakaWaka.play();
          }
        }
      }
    }

    moveBackwards() {
      switch (this.direction) {
        case DIRECTION_RIGHT:
          this.x -= this.speed;
          break;

        case DIRECTION_UP:
          this.y += this.speed;
          break;

        case DIRECTION_LEFT:
          this.x += this.speed;
          break;

        case DIRECTION_BOTTOM:
          this.y -= this.speed;
          break;
      }
    }

    moveForwards() {
      switch (this.direction) {
        case DIRECTION_RIGHT:
          this.x += this.speed;
          break;

        case DIRECTION_UP:
          this.y -= this.speed;
          break;

        case DIRECTION_LEFT:
          this.x -= this.speed;
          break;

        case DIRECTION_BOTTOM:
          this.y += this.speed;
          break;
      }
    }

    checkCollision() {
      let isCollided = false;
      if (
        map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize)] == 1 ||
        map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize)] == 1 ||
        map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize + 0.9999)] == 1 ||
        map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize + 0.9999)] == 1
      ) {
        isCollided = true;
      }
      return isCollided;
    }

    checkGhostCollision() {
      for (let i = 0; i < ghosts.length; i++) {
        let ghost = ghosts[i];
        if (ghost.getMapX() == this.getMapX() && ghost.getMapY() == this.getMapY()) {
          return true;
        }
      }
      return false;
    }

    changeDirectionIfPossible() {
      if (this.direction == this.nextDirection) return;

      let tempDirection = this.direction;
      this.direction = this.nextDirection;
      this.moveForwards();
      if (this.checkCollision()) {
        this.moveBackwards();
        this.direction = tempDirection;
      } else {
        this.moveBackwards();
      }
    }

    changeAnimation() {
      this.currentFrame = this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
      canvasContext.save();
      canvasContext.translate(this.x + oneBlockSize / 2, this.y + oneBlockSize / 2);
      canvasContext.rotate((this.direction * 90 * Math.PI) / 180);
      canvasContext.translate(-this.x - oneBlockSize / 2, -this.y - oneBlockSize / 2);
      canvasContext.drawImage(
        pacmanAnim,
        (this.currentFrame - 1) * oneBlockSize,
        0,
        oneBlockSize,
        oneBlockSize,
        this.x,
        this.y,
        this.width,
        this.height
      );
      canvasContext.restore();
    }

    getMapX() {
      return parseInt(this.x / oneBlockSize);
    }

    getMapY() {
      return parseInt(this.y / oneBlockSize);
    }

    getMapXRightSide() {
      return parseInt((this.x + 0.9999) / oneBlockSize);
    }

    getMapYRightSide() {
      return parseInt((this.y + 0.9999) / oneBlockSize);
    }
  }

  class Ghost {
    constructor(x, y, width, height, speed, imageX, imageY, imageWidth, imageHeight, range) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.direction = DIRECTION_RIGHT;
      this.imageX = imageX;
      this.imageY = imageY;
      this.imageWidth = imageWidth;
      this.imageHeight = imageHeight;
      this.range = range;
      this.randomTargetsForGhostsIndex = parseInt(Math.random() * randomTargetsForGhosts.length);
      setInterval(() => {
        this.changeRandomDirection();
      }, 10000);
    }

    changeRandomDirection() {
      this.randomTargetIndex += 1;
      this.randomTargetIndex = this.randomTargetIndex % 4;
    }

    moveProcess() {
      if (this.isInRangeOfPacman()) {
        this.target = pacman;
      } else {
        this.target = randomTargetsForGhosts[this.randomTargetsForGhostsIndex];
      }
      this.changeDirectionIfPossible();
      this.moveForwards();
      if (this.checkCollision()) {
        this.moveBackwards();
      }
    }

    moveBackwards() {
      switch (this.direction) {
        case DIRECTION_RIGHT:
          this.x -= this.speed;
          break;

        case DIRECTION_UP:
          this.y += this.speed;
          break;

        case DIRECTION_LEFT:
          this.x += this.speed;
          break;

        case DIRECTION_BOTTOM:
          this.y -= this.speed;
          break;
      }
    }

    moveForwards() {
      switch (this.direction) {
        case DIRECTION_RIGHT:
          this.x += this.speed;
          break;

        case DIRECTION_UP:
          this.y -= this.speed;
          break;

        case DIRECTION_LEFT:
          this.x -= this.speed;
          break;

        case DIRECTION_BOTTOM:
          this.y += this.speed;
          break;
      }
    }

    checkCollision() {
      let isCollided = false;
      if (
        map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize)] == 1 ||
        map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize)] == 1 ||
        map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize + 0.9999)] == 1 ||
        map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize + 0.9999)] == 1
      ) {
        isCollided = true;
      }
      return isCollided;
    }

    isInRangeOfPacman() {
      let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
      let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
      if (Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range) {
        return true;
      }
      return false;
    }

    changeDirectionIfPossible() {
      let tempDirection = this.direction;

      this.direction = this.calculateNewDirection(
        map,
        parseInt(this.target.x / oneBlockSize),
        parseInt(this.target.y / oneBlockSize)
      );

      if (typeof this.direction == "undefined") {
        this.direction = tempDirection;
        return;
      }

      this.moveForwards();
      if (this.checkCollision()) {
        this.moveBackwards();
        this.direction = tempDirection;
      } else {
        this.moveBackwards();
      }
    }

    calculateNewDirection(map, destX, destY) {
      let mp = [];
      for (let i = 0; i < map.length; i++) {
        mp[i] = map[i].slice();
      }

      let queue = [
        {
          x: this.getMapX(),
          y: this.getMapY(),
          moves: [],
        },
      ];

      while (queue.length > 0) {
        let poped = queue.shift();
        if (poped.x == destX && poped.y == destY) {
          return poped.moves[0];
        } else {
          mp[poped.y][poped.x] = 1;
          let neighborList = this.addNeighbors(poped, mp);
          for (let i = 0; i < neighborList.length; i++) {
            queue.push(neighborList[i]);
          }
        }
      }

      return 1;
    }

    addNeighbors(poped, mp) {
      let queue = [];
      let numOfRows = mp.length;
      let numOfColumns = mp[0].length;

      if (poped.x - 1 >= 0 && poped.x - 1 < numOfRows && mp[poped.y][poped.x - 1] != 1) {
        let tempMoves = poped.moves.slice();
        tempMoves.push(DIRECTION_LEFT);
        queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves });
      }
      if (poped.x + 1 >= 0 && poped.x + 1 < numOfRows && mp[poped.y][poped.x + 1] != 1) {
        let tempMoves = poped.moves.slice();
        tempMoves.push(DIRECTION_RIGHT);
        queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves });
      }
      if (poped.y - 1 >= 0 && poped.y - 1 < numOfColumns && mp[poped.y - 1][poped.x] != 1) {
        let tempMoves = poped.moves.slice();
        tempMoves.push(DIRECTION_UP);
        queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves });
      }
      if (poped.y + 1 >= 0 && poped.y + 1 < numOfColumns && mp[poped.y + 1][poped.x] != 1) {
        let tempMoves = poped.moves.slice();
        tempMoves.push(DIRECTION_BOTTOM);
        queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves });
      }
      return queue;
    }

    changeAnimation() {
      this.currentFrame = this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
      canvasContext.save();
      canvasContext.drawImage(
        ghostsAnim,
        this.imageX,
        this.imageY,
        this.imageWidth,
        this.imageHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
      canvasContext.restore();
    }

    getMapX() {
      return parseInt(this.x / oneBlockSize);
    }

    getMapY() {
      return parseInt(this.y / oneBlockSize);
    }

    getMapXRightSide() {
      return parseInt((this.x + 0.9999) / oneBlockSize);
    }

    getMapYRightSide() {
      return parseInt((this.y + 0.9999) / oneBlockSize);
    }
  }

  let createNewPacman = () => {
    pacman = new Pacman(oneBlockSize, oneBlockSize, oneBlockSize, oneBlockSize, oneBlockSize / 5);
  };

  let createGhosts = () => {
    ghosts = [];
    for (let i = 0; i < ghostCount; i++) {
      let newGhost = new Ghost(
        9 * oneBlockSize + (i % 2 === 0 ? 0 : 1) * oneBlockSize,
        10 * oneBlockSize + (i % 2 === 0 ? 0 : 1) * oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        pacman.speed / 2,
        ghostLocations[i % 4].x,
        ghostLocations[i % 4].y,
        124,
        116,
        6 + i
      );
      ghosts.push(newGhost);
    }
  };

  // let gameInterval = setInterval(gameLoop, 1000 / fps);

  useEffect(() => {
    gameInterval = setInterval(gameLoop, 1000 / fps);
    return () => {
      clearInterval(gameInterval);
    };
  }, [gameLoop]);

  createNewPacman();
  createGhosts();
  // gameLoop();

  const handleKeyEvent = (key) => {
    setTimeout(() => {
      if (key === "left" || key === "a") {
        pacman.nextDirection = DIRECTION_LEFT;
      } else if (key === "up" || key === "w") {
        pacman.nextDirection = DIRECTION_UP;
      } else if (key === "right" || key === "d") {
        pacman.nextDirection = DIRECTION_RIGHT;
      } else if (key === "down" || key === "s") {
        pacman.nextDirection = DIRECTION_BOTTOM;
      }
    }, 1);
  };

  return (
    <>
      <canvas ref={canvasRef} id="canvas" width="500" height="500"></canvas>
      <KeyboardEventHandler
        handleKeys={["up", "down", "left", "right", "a", "w", "s", "d"]}
        onKeyEvent={(e) => handleKeyEvent(e)}
      />
      <div style={{ display: "none" }}>
        <img ref={pacmanImgRef} id="animations" src={pacmanImg} alt="" />
        <img ref={ghostsImgRef} id="ghosts" src={ghostImg} alt="" />
      </div>
    </>
  );
}

export default App;
