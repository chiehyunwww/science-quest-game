(() => {
  const stages = [
    {
      title: "二十以內的加減法",
      description: "熟悉基本加減，看看答案如何帶你開拓相鄰地塊。",
      problems: {
        8: [14, "−", 6],
        9: [17, "−", 8],
        10: [18, "−", 8],
        11: [7, "+", 4],
        12: [18, "−", 6],
        13: [6, "+", 7],
        14: [9, "+", 5],
        15: [8, "+", 7]
      },
      grid: [
        [15, 8, 8, 9, 12, 14],
        [13, 10, 11, 9, 12, 14],
        [13, 10, 11, 8, 8, 15],
        [14, 10, 12, 12, 9, 15],
        [14, 9, 9, 11, 13, 15],
        [14, 14, 10, 11, 13, 15]
      ]
    },
    {
      title: "兩位數加減與進退位",
      description: "用位值拆解兩位數，練習加法進位與減法退位。",
      problems: {
        34: [62, "−", 28],
        36: [83, "−", 47],
        45: [28, "+", 17],
        53: [91, "−", 38],
        65: [39, "+", 26],
        67: [95, "−", 28],
        75: [48, "+", 27],
        83: [56, "+", 27]
      },
      grid: [
        [83, 34, 34, 36, 45, 65],
        [53, 67, 36, 36, 45, 65],
        [53, 67, 75, 34, 34, 83],
        [45, 67, 75, 75, 36, 83],
        [45, 53, 53, 65, 67, 83],
        [45, 45, 53, 65, 67, 75]
      ]
    },
    {
      title: "百位數加減挑戰",
      description: "分解百位、十位與個位，穩定完成較大的加減運算。",
      problems: {
        127: [305, "−", 178],
        204: [128, "+", 76],
        233: [500, "−", 267],
        253: [89, "+", 164],
        313: [702, "−", 389],
        344: [800, "−", 456],
        385: [246, "+", 139],
        512: [317, "+", 195]
      },
      grid: [
        [512, 127, 127, 204, 233, 344],
        [313, 204, 204, 253, 233, 344],
        [313, 385, 253, 127, 127, 512],
        [344, 385, 253, 253, 204, 512],
        [344, 233, 233, 313, 385, 512],
        [344, 344, 233, 313, 385, 385]
      ]
    }
  ];

  const palette = [0xe8f2ff, 0xffefd8, 0xe6f5e9, 0xf5eaff, 0xffe9ed, 0xe1f4f3, 0xf2f0dc, 0xe7e9ff];
  const els = {
    score: document.querySelector("#scoreValue"),
    territory: document.querySelector("#territoryValue"),
    badge: document.querySelector("#stageBadge"),
    title: document.querySelector("#stageTitle"),
    description: document.querySelector("#stageDescription"),
    count: document.querySelector("#questionCount"),
    progress: document.querySelector("#progressFill"),
    progressTrack: document.querySelector(".progress"),
    equation: document.querySelector("#equationText"),
    choices: document.querySelector("#answerChoices"),
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
    owned: new Set(),
    target: null,
    locked: false,
    complete: false,
    board: [],
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

  function neighbors(index) {
    const row = Math.floor(index / 6);
    const col = index % 6;
    return [
      row > 0 ? index - 6 : -1,
      row < 5 ? index + 6 : -1,
      col > 0 ? index - 1 : -1,
      col < 5 ? index + 1 : -1
    ].filter((next) => next >= 0);
  }

  function frontierIndices() {
    const frontier = new Set();
    state.owned.forEach((index) => {
      neighbors(index).forEach((next) => {
        if (!state.owned.has(next)) frontier.add(next);
      });
    });
    return [...frontier];
  }

  function availableAnswers() {
    const stage = stages[state.stageIndex];
    return [...new Set(frontierIndices().map((index) => state.board[index]))];
  }

  function showFeedback(kind, title, message, icon) {
    els.feedback.className = `feedback${kind ? ` ${kind}` : ""}`;
    els.feedbackTitle.textContent = title;
    els.feedbackText.textContent = message;
    els.feedbackIcon.textContent = icon;
  }

  function updateStats() {
    const total = state.owned.size;
    els.score.textContent = String(state.score);
    els.territory.textContent = `${total} / 36`;
    els.count.textContent = String(state.questionCount);
    els.progress.style.width = `${(total / 36) * 100}%`;
    els.progressTrack.setAttribute("aria-valuenow", String(total));
    if (state.scene) state.scene.drawBoard();
  }

  function formatProblem(problem) {
    return `${problem[0]} ${problem[1]} ${problem[2]} = ?`;
  }

  function renderChoices() {
    els.choices.replaceChildren();
    if (state.target === null || state.complete) return;
    const answers = Object.keys(stages[state.stageIndex].problems).map(Number);
    const distractors = shuffle(answers.filter((answer) => answer !== state.target)).slice(0, 3);
    const options = shuffle([state.target, ...distractors]);
    options.forEach((answer) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";
      button.textContent = String(answer);
      button.setAttribute("aria-label", `答案 ${answer}`);
      button.addEventListener("click", () => chooseAnswer(answer));
      els.choices.append(button);
    });
  }

  function setNextQuestion() {
    const candidates = availableAnswers();
    if (candidates.length === 0) {
      finishStage();
      return;
    }
    state.target = candidates[Math.floor(Math.random() * candidates.length)];
    state.locked = false;
    els.equation.textContent = formatProblem(stages[state.stageIndex].problems[state.target]);
    renderChoices();
    if (state.scene) state.scene.drawBoard();
  }

  function captureRegion(value) {
    const queue = frontierIndices().filter((index) => state.board[index] === value);
    const captured = new Set(queue);
    while (queue.length > 0) {
      const current = queue.shift();
      neighbors(current).forEach((next) => {
        if (!state.owned.has(next) && !captured.has(next) && state.board[next] === value) {
          captured.add(next);
          queue.push(next);
        }
      });
    }
    captured.forEach((index) => state.owned.add(index));
    return captured.size;
  }

  function chooseAnswer(answer) {
    if (state.locked || state.complete) return;
    if (answer !== state.target) {
      const problem = stages[state.stageIndex].problems[state.target];
      const operation = problem[1] === "+" ? "相加" : "相減";
      showFeedback("try", "再算一次，這題可以重試", `先完成${operation}，再找出同答案的相鄰地塊。答錯不扣分。`, "↻");
      return;
    }

    state.locked = true;
    const captured = captureRegion(state.target);
    state.score += 10;
    state.stageScore += 10;
    state.questionCount += 1;
    updateStats();
    showFeedback("correct", "答對了，領地向外擴張！", `你開拓了 ${captured} 格，獲得 10 分。繼續觀察新的邊界。`, "✓");
    if (state.owned.size === 36) {
      finishStage();
      return;
    }
    setNextQuestion();
  }

  function finishStage() {
    state.complete = true;
    state.target = null;
    els.equation.textContent = "本關地圖已全數開拓";
    els.choices.replaceChildren();
    els.next.hidden = false;
    els.next.textContent = state.stageIndex === stages.length - 1 ? "完成冒險 ✓" : "下一關 →";
    showFeedback("correct", "關卡完成！", `你已開拓全部 36 格，累積 ${state.score} 分。`, "★");
    updateStats();
  }

  function giveHint() {
    if (state.target === null || state.complete) return;
    const [left, operator, right] = stages[state.stageIndex].problems[state.target];
    const level = state.stageIndex;
    let message;
    if (operator === "+") {
      message = level === 0
        ? `試著先湊成十：從 ${left} 出發，想想 ${right} 可以拆成哪兩部分。`
        : `把 ${right} 拆成十位和個位，先加十位，再加個位，最後檢查答案。`;
    } else {
      message = level === 0
        ? `從 ${left} 出發往回數 ${right}，也可以把減數拆開分段減。`
        : `先從 ${left} 減去 ${Math.floor(right / 10) * 10}，再減去剩下的 ${right % 10}。`;
    }
    showFeedback("warn", "計算小提示", `${message} 對照金色邊界格的數字選答案。`, "✦");
  }

  function beginStage(index, carryScore = true) {
    state.stageIndex = index;
    state.stageScore = 0;
    state.questionCount = 0;
    state.owned = new Set([0]);
    state.board = stages[index].grid.flat();
    state.target = null;
    state.locked = false;
    state.complete = false;
    const stage = stages[index];
    els.badge.innerHTML = `<i class="stage-dot"></i>第 ${index + 1} 關`;
    els.title.textContent = stage.title;
    els.description.textContent = stage.description;
    els.next.hidden = true;
    showFeedback("", "計算答案，擴張領地", "選出正確答案，所有相鄰的同數字地塊就會加入你的領地。", "✦");
    updateStats();
    setNextQuestion();
  }

  function restartStage() {
    state.score -= state.stageScore;
    state.stageScore = 0;
    beginStage(state.stageIndex);
  }

  function advanceStage() {
    if (state.stageIndex >= stages.length - 1) {
      state.score = 0;
      beginStage(0);
      showFeedback("", "新的冒險開始", "重新從二十以內的加減法開始拓荒。", "↻");
      return;
    }
    beginStage(state.stageIndex + 1);
  }

  class TerritoryScene extends Phaser.Scene {
    constructor() {
      super("TerritoryScene");
      this.boardGraphics = null;
      this.labels = [];
    }

    create() {
      state.scene = this;
      this.boardGraphics = this.add.graphics();
      this.labels = Array.from({ length: 36 }, (_, index) => this.add.text(0, 0, "", {
        fontFamily: "DM Sans, Noto Sans TC, sans-serif",
        fontSize: "18px",
        fontStyle: "800",
        color: "#35564d"
      }).setOrigin(0.5));
      this.scale.on("resize", () => this.drawBoard());
      this.drawBoard();
    }

    drawBoard() {
      if (!this.boardGraphics || this.labels.length === 0) return;
      const width = this.scale.width;
      const height = this.scale.height;
      const padX = Math.max(14, width * 0.055);
      const padY = Math.max(11, height * 0.055);
      const gap = Math.max(5, Math.min(10, width * 0.009));
      const boardWidth = width - padX * 2;
      const boardHeight = height - padY * 2;
      const cellSize = Math.min((boardWidth - gap * 5) / 6, (boardHeight - gap * 5) / 6);
      const totalWidth = cellSize * 6 + gap * 5;
      const totalHeight = cellSize * 6 + gap * 5;
      const originX = (width - totalWidth) / 2;
      const originY = (height - totalHeight) / 2;
      const frontier = new Set(frontierIndices());
      this.boardGraphics.clear();

      for (let index = 0; index < 36; index += 1) {
        const row = Math.floor(index / 6);
        const col = index % 6;
        const x = originX + col * (cellSize + gap);
        const y = originY + row * (cellSize + gap);
        const owned = state.owned.has(index);
        const reachable = frontier.has(index);
        const value = state.board[index];
        const fill = owned ? 0x45b988 : palette[value % palette.length];
        this.boardGraphics.fillStyle(fill, 1);
        this.boardGraphics.fillRoundedRect(x, y, cellSize, cellSize, Math.min(13, cellSize * 0.15));
        if (reachable) {
          this.boardGraphics.lineStyle(3, 0xe7ad43, 1);
          this.boardGraphics.strokeRoundedRect(x + 1, y + 1, cellSize - 2, cellSize - 2, Math.min(12, cellSize * 0.14));
        } else {
          this.boardGraphics.lineStyle(1, owned ? 0x279568 : 0xdde9e3, 1);
          this.boardGraphics.strokeRoundedRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, Math.min(13, cellSize * 0.15));
        }
        const label = this.labels[index];
        label.setText(String(value));
        label.setColor(owned ? "#ffffff" : reachable ? "#785a1b" : "#35564d");
        label.setFontSize(Math.max(12, Math.min(21, cellSize * (value >= 100 ? 0.23 : 0.29))));
        label.setPosition(x + cellSize / 2, y + cellSize / 2);
      }
    }
  }

  els.hint.addEventListener("click", giveHint);
  els.restart.addEventListener("click", restartStage);
  els.next.addEventListener("click", advanceStage);

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    width: 900,
    height: 430,
    backgroundColor: "#f5faf7",
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [TerritoryScene],
    render: { antialias: true, pixelArt: false, roundPixels: false }
  });

  beginStage(0);
})();
