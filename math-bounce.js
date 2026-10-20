(() => {
  const questionsByStage = [
    {
      title: "二十以內的加減法",
      description: "先熟悉基本運算，再觀察答案磚上的碰撞方向。",
      questions: [[8, "+", 7], [15, "−", 6], [9, "+", 4], [18, "−", 9], [12, "+", 5], [16, "−", 7], [7, "+", 6]]
    },
    {
      title: "兩位數加減與進退位",
      description: "拆解十位與個位，練習進位和退位。",
      questions: [[28, "+", 17], [62, "−", 28], [39, "+", 26], [83, "−", 47], [56, "+", 27], [91, "−", 38], [95, "−", 28]]
    },
    {
      title: "百位數加減挑戰",
      description: "分解百位、十位和個位，完成更大的加減計算。",
      questions: [[128, "+", 76], [305, "−", 178], [246, "+", 139], [500, "−", 267], [89, "+", 164], [800, "−", 456], [317, "+", 195]]
    }
  ];

  const brickColors = [0xe6f2ff, 0xf0eaff, 0xe5f6ec, 0xfff0dc];
  const els = {
    score: document.querySelector("#scoreValue"),
    round: document.querySelector("#roundValue"),
    badge: document.querySelector("#stageBadge"),
    title: document.querySelector("#stageTitle"),
    description: document.querySelector("#stageDescription"),
    count: document.querySelector("#questionCount"),
    progress: document.querySelector("#progressFill"),
    progressTrack: document.querySelector(".progress"),
    equation: document.querySelector("#equationText"),
    choices: document.querySelector("#answerChoices"),
    impact: document.querySelector("#impactSlider"),
    impactLabel: document.querySelector("#impactValueLabel"),
    launch: document.querySelector("#launchButton"),
    feedback: document.querySelector("#feedbackBox"),
    feedbackIcon: document.querySelector("#feedbackIcon"),
    feedbackTitle: document.querySelector("#feedbackTitle"),
    feedbackText: document.querySelector("#feedbackText"),
    hint: document.querySelector("#hintButton"),
    restart: document.querySelector("#restartButton"),
    next: document.querySelector("#nextStageButton")
  };

  const state = {
    stageIndex: 0,
    score: 0,
    stageScore: 0,
    questionCount: 0,
    questionDeck: [],
    problem: null,
    answers: [],
    targetAnswer: null,
    selectedTarget: null,
    impact: 0,
    mode: "ready",
    ballX: null,
    ballY: null,
    velocityX: 0,
    velocityY: 0,
    scene: null
  };

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function resultOf(problem) {
    return problem[1] === "+" ? problem[0] + problem[2] : problem[0] - problem[2];
  }

  function formatProblem(problem) {
    return `${problem[0]} ${problem[1]} ${problem[2]} = ?`;
  }

  function showFeedback(kind, title, message, icon) {
    els.feedback.className = `feedback${kind ? ` ${kind}` : ""}`;
    els.feedbackTitle.textContent = title;
    els.feedbackText.textContent = message;
    els.feedbackIcon.textContent = icon;
  }

  function updateStats() {
    els.score.textContent = String(state.score);
    els.round.textContent = `${state.questionCount} / 5`;
    els.count.textContent = `${state.questionCount} / 5`;
    els.progress.style.width = `${(state.questionCount / 5) * 100}%`;
    els.progressTrack.setAttribute("aria-valuenow", String(state.questionCount));
    if (state.scene) state.scene.drawBoard();
  }

  function setImpact(value) {
    state.impact = Number(value) / 100;
    const amount = Math.abs(Number(value));
    els.impactLabel.textContent = amount < 15 ? "中央" : `${Number(value) < 0 ? "偏左" : "偏右"} ${amount}%`;
    if (state.scene) state.scene.drawBoard();
  }

  function renderChoices() {
    els.choices.replaceChildren();
    state.answers.forEach((answer) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `answer-option${state.selectedTarget === answer ? " selected" : ""}`;
      button.textContent = String(answer);
      button.setAttribute("aria-label", `答案 ${answer}`);
      button.disabled = state.mode !== "ready" || state.selectedTarget !== null;
      button.addEventListener("click", () => chooseAnswer(answer));
      els.choices.append(button);
    });
  }

  function nextQuestion() {
    state.problem = state.questionDeck[state.questionCount];
    state.targetAnswer = resultOf(state.problem);
    state.selectedTarget = null;
    state.mode = "ready";
    state.ballX = null;
    state.ballY = null;
    const stageAnswers = [...new Set(questionsByStage[state.stageIndex].questions.map(resultOf))];
    const distractors = shuffle(stageAnswers.filter((answer) => answer !== state.targetAnswer)).slice(0, 3);
    state.answers = shuffle([state.targetAnswer, ...distractors]);
    els.equation.textContent = formatProblem(state.problem);
    els.launch.textContent = "先選出答案";
    els.launch.disabled = true;
    els.impact.disabled = false;
    els.impact.disabled = false;
    renderChoices();
    updateStats();
    showFeedback("", "解出算式，調整撞擊點", "選中正確答案磚後，移動撞擊位置並發射彈球。答錯可以看提示重試。", "✦");
  }

  function chooseAnswer(answer) {
    if (state.mode !== "ready" || state.selectedTarget !== null) return;
    if (answer !== state.targetAnswer) {
      showFeedback("try", "再算一次，這題可以重試", "答案磚還沒有亮起。看看算式中的位值或運算方向，再試一次。答錯不扣分。", "↻");
      return;
    }
    state.selectedTarget = answer;
    els.launch.textContent = "發射彈球";
    els.launch.disabled = false;
    renderChoices();
    if (state.scene) state.scene.drawBoard();
    showFeedback("correct", "算對了，答案磚亮起！", "調整撞擊位置，再發射彈球。觀察碰撞點如何改變反彈方向。", "✓");
  }

  function hintMessage() {
    const [left, operator, right] = state.problem;
    if (operator === "+" && state.stageIndex === 0) {
      return `試著湊成十：從 ${left} 出發，想想 ${right} 可以拆成哪兩部分。`;
    }
    if (operator === "+") {
      return `把 ${right} 拆成十位和個位，先加整十，再加個位，最後檢查答案。`;
    }
    if (state.stageIndex === 0) {
      return `從 ${left} 往回數 ${right}，或先湊整十再分段扣除。`;
    }
    return `先減去整十，再處理個位。如果個位不夠，可以向十位借一個十。`;
  }

  function giveHint() {
    if (!state.problem || state.mode === "complete") return;
    showFeedback("warn", "計算小提示", `${hintMessage()} 想好後再選答案磚。`, "✦");
  }

  function beginStage(index) {
    state.stageIndex = index;
    state.stageScore = 0;
    state.questionCount = 0;
    state.questionDeck = shuffle(questionsByStage[index].questions).slice(0, 5);
    state.mode = "ready";
    state.problem = null;
    state.selectedTarget = null;
    state.impact = 0;
    els.impact.value = "0";
    els.next.hidden = true;
    els.badge.innerHTML = `<i class="stage-dot"></i>第 ${index + 1} 關`;
    els.title.textContent = questionsByStage[index].title;
    els.description.textContent = questionsByStage[index].description;
    setImpact(0);
    nextQuestion();
  }

  function restartStage() {
    state.score -= state.stageScore;
    state.stageScore = 0;
    beginStage(state.stageIndex);
  }

  function finishStage() {
    state.mode = "complete";
    state.selectedTarget = null;
    els.equation.textContent = "本關碰撞實驗完成";
    els.choices.replaceChildren();
    els.impact.disabled = true;
    els.launch.disabled = true;
    els.next.hidden = false;
    els.next.textContent = state.stageIndex === questionsByStage.length - 1 ? "完成冒險 ✓" : "下一關 →";
    updateStats();
    showFeedback("correct", "關卡完成！", `你完成了 5 次加減法碰撞實驗，累積 ${state.score} 分。`, "★");
  }

  function advanceStage() {
    if (state.stageIndex < questionsByStage.length - 1) {
      beginStage(state.stageIndex + 1);
      return;
    }
    state.score = 0;
    beginStage(0);
    showFeedback("", "新的冒險開始", "重新從二十以內的加減法開始，觀察不同的反彈方向。", "↻");
  }

  class BounceScene extends Phaser.Scene {
    constructor() {
      super("BounceScene");
      this.graphics = null;
      this.ball = null;
      this.ballGlow = null;
      this.labels = [];
      this.geometry = null;
    }

    create() {
      state.scene = this;
      this.graphics = this.add.graphics();
      this.ballGlow = this.add.circle(0, 0, 17, 0xf5a345, 0.16).setVisible(false);
      this.ball = this.add.circle(0, 0, 9, 0xf4a13f).setVisible(false);
      this.labels = Array.from({ length: 4 }, () => this.add.text(0, 0, "", {
        fontFamily: "DM Sans, Noto Sans TC, sans-serif",
        fontSize: "18px",
        fontStyle: "800",
        color: "#365774"
      }).setOrigin(0.5));
      this.scale.on("resize", () => this.drawBoard());
      this.drawBoard();
    }

    getGeometry() {
      const width = this.scale.width;
      const height = this.scale.height;
      const sidePad = Math.max(18, width * 0.045);
      const gap = Math.max(8, Math.min(16, width * 0.016));
      const brickWidth = (width - sidePad * 2 - gap * 3) / 4;
      const brickHeight = Math.min(62, Math.max(48, height * 0.145));
      const brickY = Math.max(72, height * 0.2);
      const startY = height - Math.max(44, height * 0.12);
      return { width, height, sidePad, gap, brickWidth, brickHeight, brickY, startX: width / 2, startY };
    }

    blockCenter(index) {
      const geo = this.geometry;
      return geo.sidePad + index * (geo.brickWidth + geo.gap) + geo.brickWidth / 2;
    }

    impactPoint() {
      if (state.selectedTarget === null || !this.geometry) return null;
      const answerIndex = state.answers.indexOf(state.selectedTarget);
      const centerX = this.blockCenter(answerIndex);
      const x = centerX + state.impact * this.geometry.brickWidth * 0.34;
      const y = this.geometry.brickY + this.geometry.brickHeight / 2 + 10;
      return { x, y };
    }

    drawBoard() {
      if (!this.graphics || this.labels.length === 0) return;
      this.geometry = this.getGeometry();
      const geo = this.geometry;
      this.graphics.clear();
      this.graphics.lineStyle(1, 0xd9e6f2, 0.9);
      this.graphics.strokeRoundedRect(12, 12, geo.width - 24, geo.height - 24, 16);
      this.graphics.lineStyle(3, 0xb8cfe6, 0.85);
      this.graphics.lineBetween(18, geo.height - 18, geo.width - 18, geo.height - 18);

      this.labels.forEach((label, index) => {
        const answer = state.answers[index];
        const x = geo.sidePad + index * (geo.brickWidth + geo.gap);
        const y = geo.brickY;
        const selected = answer === state.selectedTarget;
        const fill = selected ? 0xdaf5e4 : brickColors[index];
        this.graphics.fillStyle(fill, 1);
        this.graphics.fillRoundedRect(x, y, geo.brickWidth, geo.brickHeight, 12);
        this.graphics.lineStyle(selected ? 3 : 1.5, selected ? 0x42a978 : 0xd7e4ef, 1);
        this.graphics.strokeRoundedRect(x + 1, y + 1, geo.brickWidth - 2, geo.brickHeight - 2, 12);
        label.setText(answer === undefined ? "" : String(answer));
        label.setFontSize(Math.max(13, Math.min(21, geo.brickWidth * (answer >= 100 ? 0.22 : 0.28))));
        label.setColor(selected ? "#26734f" : "#365774");
        label.setPosition(x + geo.brickWidth / 2, y + geo.brickHeight / 2);
      });

      const point = this.impactPoint();
      if (point && state.mode === "ready") {
        this.drawAimLine(geo.startX, geo.startY, point.x, point.y);
        this.graphics.fillStyle(0xf4a13f, 1);
        this.graphics.fillCircle(point.x, point.y, 5.5);
      }

      if (state.ballX !== null && state.ballY !== null) {
        this.ballGlow.setPosition(state.ballX, state.ballY).setVisible(true);
        this.ball.setPosition(state.ballX, state.ballY).setVisible(true);
      } else {
        this.ball.setPosition(geo.startX, geo.startY).setVisible(true);
        this.ballGlow.setPosition(geo.startX, geo.startY).setVisible(true);
      }
    }

    drawAimLine(fromX, fromY, toX, toY) {
      const dx = toX - fromX;
      const dy = toY - fromY;
      const distance = Math.hypot(dx, dy);
      const segments = Math.max(5, Math.floor(distance / 21));
      this.graphics.fillStyle(0x6596cc, 0.7);
      for (let index = 0; index < segments; index += 2) {
        const start = index / segments;
        const end = Math.min((index + 1) / segments, 1);
        this.graphics.fillCircle(fromX + dx * (start + end) / 2, fromY + dy * (start + end) / 2, 2.2);
      }
    }

    launchBall() {
      if (state.mode !== "ready" || state.selectedTarget === null) return;
      const point = this.impactPoint();
      const geo = this.geometry;
      const dx = point.x - geo.startX;
      const dy = point.y - geo.startY;
      const length = Math.hypot(dx, dy) || 1;
      const speed = 430;
      state.ballX = geo.startX;
      state.ballY = geo.startY;
      state.velocityX = dx / length * speed;
      state.velocityY = dy / length * speed;
      state.mode = "shot";
      els.launch.disabled = true;
      els.launch.textContent = "彈球碰撞中…";
      els.impact.disabled = true;
      renderChoices();
      this.drawBoard();
    }

    hitAnswerBlock() {
      if (state.mode !== "shot") return;
      state.mode = "bounce";
      state.score += 10;
      state.stageScore += 10;
      state.questionCount += 1;
      const direction = state.impact < -0.16 ? "向左下" : state.impact > 0.16 ? "向右下" : "垂直向下";
      const impactSide = state.impact < -0.16 ? "左側" : state.impact > 0.16 ? "右側" : "中央";
      const speed = 385;
      state.velocityX = state.impact * speed * 0.72;
      state.velocityY = Math.sqrt(speed * speed - state.velocityX * state.velocityX);
      updateStats();
      showFeedback("correct", "碰撞成功，獲得 10 分！", `球撞在答案磚${impactSide}，沿著${direction}反彈。移動撞擊點可以改變反彈路徑。`, "✓");
    }

    completeShot() {
      if (state.mode !== "bounce") return;
      state.mode = "transition";
      this.time.delayedCall(450, () => {
        if (state.questionCount >= 5) finishStage();
        else nextQuestion();
      });
    }

    update(time, delta) {
      if (state.mode !== "shot" && state.mode !== "bounce") return;
      const geo = this.geometry;
      const step = Math.min(delta, 35) / 1000;
      state.ballX += state.velocityX * step;
      state.ballY += state.velocityY * step;
      const radius = 9;
      if (state.ballX < radius + 16) {
        state.ballX = radius + 16;
        state.velocityX = Math.abs(state.velocityX);
      } else if (state.ballX > geo.width - radius - 16) {
        state.ballX = geo.width - radius - 16;
        state.velocityX = -Math.abs(state.velocityX);
      }
      if (state.ballY < radius + 18) {
        state.ballY = radius + 18;
        state.velocityY = Math.abs(state.velocityY);
      }

      if (state.mode === "shot") {
        const answerIndex = state.answers.indexOf(state.targetAnswer);
        const targetX = this.blockCenter(answerIndex);
        const brickBottom = geo.brickY + geo.brickHeight;
        const inTarget = state.ballX + radius >= targetX - geo.brickWidth / 2 && state.ballX - radius <= targetX + geo.brickWidth / 2;
        const crossedBrickFace = state.velocityY < 0 && state.ballY - radius <= brickBottom + 2;
        if (inTarget && crossedBrickFace) {
          state.ballY = brickBottom + radius;
          this.hitAnswerBlock();
        }
      } else if (state.mode === "bounce" && state.ballY > geo.height - 15) {
        this.completeShot();
      }

      this.ballGlow.setPosition(state.ballX, state.ballY);
      this.ball.setPosition(state.ballX, state.ballY);
    }
  }

  els.impact.addEventListener("input", (event) => setImpact(event.target.value));
  els.launch.addEventListener("click", () => {
    if (state.scene) state.scene.launchBall();
  });
  els.hint.addEventListener("click", giveHint);
  els.restart.addEventListener("click", restartStage);
  els.next.addEventListener("click", advanceStage);

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    width: 900,
    height: 410,
    backgroundColor: "#f5faff",
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BounceScene],
    render: { antialias: true, pixelArt: false, roundPixels: false }
  });

  beginStage(0);
})();
