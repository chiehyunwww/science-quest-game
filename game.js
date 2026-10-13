(() => {
  "use strict";

  const STAGES = [
    {
      title: "物質變變變", topic: "物質與變化", subtitle: "第一站・物質與變化", palette: { sky: 0xd9eee7, floor: 0xf0f5e8, dark: 0x55987d, accent: 0xe9a85f, light: 0xffffff },
      rounds: [
        { question: "水結冰後，通常會有什麼變化？", answers: ["變成固態，體積略增", "變成氣態，體積縮小", "變成液態，質量消失", "變成固態，質量增加"], correct: 0 },
        { question: "下列哪一個不是水的三態之一？", answers: ["冰", "水蒸氣", "液態水", "木頭"], correct: 3 },
        { question: "水蒸發時，主要從哪裡變成水蒸氣？", answers: ["液體表面", "容器底部", "水的中心", "容器外壁"], correct: 0 },
      ],
    },
    {
      title: "力與運動", topic: "生活中的力", subtitle: "第二站・力與運動", palette: { sky: 0xe1edf6, floor: 0xf0f3ef, dark: 0x618fb0, accent: 0xe7a660, light: 0xffffff },
      rounds: [
        { question: "力的國際單位名稱是什麼？", answers: ["焦耳", "牛頓", "瓦特", "公尺"], correct: 1 },
        { question: "要讓行進中的球改變方向，需要什麼？", answers: ["光線照射", "增加顏色", "施加外力", "降低音量"], correct: 2 },
        { question: "球在粗糙地面上滾動，最後慢下來的主因是？", answers: ["摩擦力", "浮力", "磁力", "電力"], correct: 0 },
      ],
    },
    {
      title: "生態能量站", topic: "生物與環境", subtitle: "第三站・生態與能量", palette: { sky: 0xdcefe0, floor: 0xf0f4df, dark: 0x6b9f65, accent: 0xe8a765, light: 0xffffff },
      rounds: [
        { question: "在生態系中，誰能利用陽光製造養分？", answers: ["綠色植物", "草食動物", "肉食動物", "分解者"], correct: 0 },
        { question: "「草 → 兔子」的箭頭代表能量流向，下一個生物是？", answers: ["陽光", "兔子", "草", "土壤"], correct: 1 },
        { question: "植物行光合作用時，會吸收哪一種氣體？", answers: ["氧氣", "氮氣", "二氧化碳", "氫氣"], correct: 2 },
      ],
    },
    {
      title: "地球觀測所", topic: "地球與天氣", subtitle: "第四站・地球與天氣", palette: { sky: 0xe2eef2, floor: 0xf3f2e8, dark: 0x6199a1, accent: 0xe9a766, light: 0xffffff },
      rounds: [
        { question: "液態水變成水蒸氣的過程叫做什麼？", answers: ["凝結", "蒸發", "凝固", "融化"], correct: 1 },
        { question: "地球最外層、我們生活的固體部分是？", answers: ["地殼", "地核", "地函", "外核"], correct: 0 },
        { question: "空氣因為氣壓差異而流動，形成了什麼？", answers: ["露水", "雲層", "風", "彩虹"], correct: 2 },
      ],
    },
    {
      title: "光電研究室", topic: "光、聲音與電", subtitle: "第五站・光、聲音與電", palette: { sky: 0xe5e8f4, floor: 0xf1f0ec, dark: 0x777eae, accent: 0xe7a258, light: 0xffffff },
      rounds: [
        { question: "簡單電路要讓燈泡發亮，電路必須？", answers: ["保持斷開", "形成通路", "沒有電池", "只有一條電線"], correct: 1 },
        { question: "聲音可以在真空中傳播嗎？", answers: ["可以，和光一樣", "可以，但速度變慢", "不可以，需要介質", "只有高音可以"], correct: 2 },
        { question: "夜晚看見的月光，主要是什麼光？", answers: ["月球自行發光", "太陽光的反射", "地球燈光反射", "星星的光聚集"], correct: 1 },
      ],
    },
  ];

  const SCORE_PER_CORRECT = 10;
  const PENALTY_PER_WRONG = 5;
  const DIRS = ["up", "right", "down", "left"];
  const ui = {
    topScore: document.querySelector("#topScore"), sideScore: document.querySelector("#sideScore"),
    levelCount: document.querySelector("#levelCount"), levelList: [...document.querySelectorAll(".level-item")],
    missionTopic: document.querySelector("#missionTopic"), questionText: document.querySelector("#questionText"),
    questionNumber: document.querySelector("#questionNumber"), questionTotal: document.querySelector("#questionTotal"),
    overlay: document.querySelector("#screenOverlay"), overlayTitle: document.querySelector("#overlayTitle"),
    overlayCopy: document.querySelector("#overlayCopy"), overlayButton: document.querySelector("#overlayButton"), toast: document.querySelector("#toast"),
  };

  const gameState = { score: 0, stage: 0, round: 0, started: false, finished: false, scene: null };
  let toastTimer;

  function renderScore() {
    const score = gameState.score;
    ui.topScore.textContent = score;
    ui.sideScore.textContent = score;
    document.querySelector(".score-chip").setAttribute("aria-label", `目前總分 ${score} 分`);
  }

  function renderProgress() {
    ui.levelCount.textContent = `${gameState.stage + 1} / ${STAGES.length}`;
    ui.levelList.forEach((item, index) => {
      item.classList.toggle("is-active", index === gameState.stage);
      item.classList.toggle("is-complete", index < gameState.stage || gameState.finished);
      item.setAttribute("aria-current", index === gameState.stage ? "step" : "false");
    });
  }

  function renderQuestion() {
    const stage = STAGES[gameState.stage];
    const round = stage.rounds[gameState.round];
    ui.missionTopic.textContent = stage.subtitle;
    ui.questionText.textContent = round.question;
    ui.questionNumber.textContent = String(gameState.round + 1).padStart(2, "0");
    ui.questionTotal.textContent = String(stage.rounds.length).padStart(2, "0");
    renderProgress();
  }

  function showToast(message, kind = "correct") {
    window.clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.toggle("is-wrong", kind === "wrong");
    ui.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => ui.toast.classList.remove("is-visible"), 1050);
  }

  function showOverlay({ title, copy, button, action }) {
    ui.overlayTitle.textContent = title;
    ui.overlayCopy.textContent = copy;
    ui.overlayButton.innerHTML = `${button} <span aria-hidden="true">→</span>`;
    ui.overlay.classList.remove("is-hidden");
    ui.overlayButton.onclick = action;
  }

  function startGame() {
    if (!gameState.scene) return;
    gameState.started = true;
    gameState.finished = false;
    ui.overlay.classList.add("is-hidden");
    gameState.scene.begin();
  }

  function finishStage() {
    gameState.started = false;
    const completedStage = STAGES[gameState.stage];
    const isFinal = gameState.stage === STAGES.length - 1;
    if (isFinal) {
      gameState.finished = true;
      renderProgress();
      showOverlay({
        title: "自然探險大成功！",
        copy: `你完成了全部五個科學任務，最後累積 ${gameState.score} 分。帶著新發現，繼續探索生活中的科學吧！`,
        button: "再玩一次",
        action: resetGame,
      });
      return;
    }
    showOverlay({
      title: `${completedStage.title}完成！`,
      copy: `三道題目都完成了，目前累積 ${gameState.score} 分。下一站「${STAGES[gameState.stage + 1].title}」正等著你！`,
      button: "前往下一關",
      action: () => {
        gameState.stage += 1;
        gameState.round = 0;
        renderQuestion();
        gameState.scene.loadQuestion();
        startGame();
      },
    });
  }

  function resetGame() {
    gameState.score = 0;
    gameState.stage = 0;
    gameState.round = 0;
    gameState.finished = false;
    renderScore();
    renderQuestion();
    gameState.scene.loadQuestion();
    startGame();
  }

  class QuestScene extends Phaser.Scene {
    constructor() {
      super("quest");
      this.cards = [];
      this.touch = { up: false, down: false, left: false, right: false };
      this.handlingAnswer = false;
      this.roundToken = 0;
      this.layoutWidth = 0;
      this.layoutHeight = 0;
    }

    create() {
      this.drawTextures();
      this.backdrop = this.add.graphics().setDepth(-5);
      this.playerAura = this.add.circle(0, 0, 25, 0xfff4d6, 0.75).setDepth(2);
      this.player = this.physics.add.image(0, 0, "explorer").setDepth(4);
      this.player.setCollideWorldBounds(true);
      this.player.body.setSize(31, 38).setOffset(7, 10);
      this.player.setDamping(true).setDrag(0.0001);
      this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT");
      this.scale.on("resize", (size) => this.resizeScene(size.width, size.height));
      gameState.scene = this;
      this.rebuildStage();
      renderQuestion();
      this.scale.on("orientationchange", () => this.resizeScene(this.scale.width, this.scale.height));
    }

    drawTextures() {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x326f59, 0.16); g.fillEllipse(24, 48, 30, 9);
      g.fillStyle(0x315e4d, 1); g.fillRoundedRect(9, 16, 30, 32, 10);
      g.fillStyle(0xffca82, 1); g.fillCircle(24, 15, 12);
      g.fillStyle(0x315e4d, 1); g.fillRoundedRect(12, 2, 24, 11, 6);
      g.fillStyle(0xf6fbef, 1); g.fillRoundedRect(14, 4, 20, 7, 4);
      g.fillStyle(0x77b89c, 1); g.fillRoundedRect(15, 18, 18, 18, 6);
      g.fillStyle(0x4b886c, 1); g.fillRoundedRect(17, 39, 7, 10, 3); g.fillRoundedRect(26, 39, 7, 10, 3);
      g.fillStyle(0xeaf5dc, 1); g.fillCircle(21, 22, 2); g.fillCircle(28, 22, 2);
      g.generateTexture("explorer", 48, 52);
      g.destroy();
    }

    resizeScene(width, height) {
      if (!width || !height) return;
      this.layoutWidth = width;
      this.layoutHeight = height;
      this.physics.world.setBounds(12, 12, width - 24, height - 24);
      this.player?.setPosition(width / 2, height - 52);
      this.drawBackdrop();
      this.layoutCards();
    }

    rebuildStage() {
      this.cards.forEach((card) => card.destroy());
      this.cards = [];
      this.drawBackdrop();
      this.makeDecorations();
      this.loadQuestion();
      this.resizeScene(this.scale.width, this.scale.height);
    }

    drawBackdrop() {
      const width = this.layoutWidth || this.scale.width;
      const height = this.layoutHeight || this.scale.height;
      if (!width || !height || !this.backdrop) return;
      const palette = STAGES[gameState.stage].palette;
      const g = this.backdrop;
      g.clear();
      g.fillStyle(palette.sky, 1); g.fillRect(0, 0, width, height);
      g.fillStyle(palette.floor, 1); g.fillRoundedRect(12, 15, width - 24, height - 30, 22);
      g.lineStyle(1, palette.dark, 0.075);
      const spacing = width < 500 ? 34 : 42;
      for (let x = 22; x < width; x += spacing) g.lineBetween(x, 30, x, height - 24);
      for (let y = 34; y < height; y += spacing) g.lineBetween(18, y, width - 18, y);
      g.lineStyle(2, palette.dark, 0.1); g.strokeRoundedRect(19, 22, width - 38, height - 44, 18);
      const seed = (gameState.stage + 1) * 17;
      for (let i = 0; i < 13; i += 1) {
        const x = 33 + ((i * 89 + seed * 13) % Math.max(1, width - 66));
        const y = 31 + ((i * 67 + seed * 7) % Math.max(1, height - 62));
        g.fillStyle(palette.dark, i % 3 === 0 ? 0.11 : 0.055);
        g.fillCircle(x, y, i % 4 === 0 ? 3 : 2);
      }
    }

    makeDecorations() {
      const width = this.scale.width;
      const height = this.scale.height;
      const palette = STAGES[gameState.stage].palette;
      const deco = this.add.graphics().setDepth(-2).setAlpha(0.28);
      const ring = (x, y, radius, color = palette.dark) => { deco.lineStyle(2, color, 0.18); deco.strokeCircle(x, y, radius); };
      const circle = (x, y, radius, color = palette.dark, alpha = 0.11) => { deco.fillStyle(color, alpha); deco.fillCircle(x, y, radius); };
      if (gameState.stage === 0) {
        [0, 1, 2, 3].forEach((n) => { const x = width * (0.18 + n * 0.2); ring(x, height * 0.19, 14 + (n % 2) * 5); circle(x, height * 0.19, 4, palette.accent, 0.28); });
        deco.lineStyle(3, palette.dark, 0.13); deco.lineBetween(width * .09, height * .82, width * .91, height * .82);
      } else if (gameState.stage === 1) {
        for (let n = 0; n < 5; n += 1) { const x = width * (.15 + n * .17); const y = height * .19; ring(x, y, 9 + (n % 3) * 4); ring(x, y, 2); }
        for (let n = 0; n < 6; n += 1) { const x = width * (.08 + n * .17); deco.lineStyle(2, palette.accent, 0.15); deco.lineBetween(x, height * .83, x + 13, height * .83); }
      } else if (gameState.stage === 2) {
        for (let n = 0; n < 5; n += 1) { const x = width * (.11 + n * .2); const y = height * (.17 + (n % 2) * .08); deco.fillStyle(palette.dark, .12); deco.fillEllipse(x, y, 14, 25); deco.lineStyle(1, palette.dark, .22); deco.lineBetween(x, y - 10, x, y + 10); }
        deco.fillStyle(palette.dark, .08); deco.fillEllipse(width * .5, height * .89, width * .82, 33);
      } else if (gameState.stage === 3) {
        for (let n = 0; n < 3; n += 1) { const x = width * (.18 + n * .32); const y = height * .16; circle(x, y, 13, palette.light, .65); circle(x + 12, y + 3, 17, palette.light, .48); circle(x - 12, y + 7, 12, palette.light, .5); }
        deco.lineStyle(2, palette.dark, .16); deco.beginPath(); deco.moveTo(24, height * .88); deco.lineTo(width * .3, height * .82); deco.lineTo(width * .56, height * .87); deco.lineTo(width - 22, height * .81); deco.strokePath();
      } else {
        for (let n = 0; n < 11; n += 1) { const x = width * (.08 + (n * 0.083) % .85); const y = height * (.13 + (n % 3) * .11); circle(x, y, n % 3 === 0 ? 2.4 : 1.5, palette.accent, .48); }
        for (let n = 0; n < 4; n += 1) { const x = width * (.18 + n * .22); const y = height * .81; ring(x, y, 8); ring(x, y, 2, palette.accent); }
      }
      this.decorations?.destroy();
      this.decorations = deco;
    }

    loadQuestion() {
      this.cards.forEach((card) => card.destroy());
      this.cards = [];
      this.handlingAnswer = false;
      this.roundToken += 1;
      const round = STAGES[gameState.stage].rounds[gameState.round];
      if (!round) return;
      const order = [0, 1, 2, 3];
      const shift = (gameState.stage * 3 + gameState.round) % order.length;
      const rearranged = order.slice(shift).concat(order.slice(0, shift));
      if ((gameState.stage + gameState.round) % 2 === 1) rearranged.reverse();
      rearranged.forEach((answerIndex, i) => this.createAnswerCard(i, round.answers[answerIndex], answerIndex === round.correct));
      this.layoutCards();
      this.player?.setPosition(this.scale.width / 2, this.scale.height - 52);
      this.player?.setVelocity(0, 0);
    }

    createAnswerCard(index, answer, isCorrect) {
      const card = this.add.container(0, 0).setDepth(3);
      card.bg = this.add.graphics();
      card.icon = this.add.graphics();
      card.label = this.add.text(0, 0, String.fromCharCode(65 + index), { fontFamily: "DM Sans, sans-serif", fontSize: "14px", color: "#ffffff", fontStyle: "800" }).setOrigin(.5);
      card.answerText = this.add.text(0, 0, answer, { fontFamily: '"Noto Sans TC", sans-serif', fontSize: "16px", color: "#344d42", fontStyle: "700", align: "left", lineSpacing: 2, wordWrap: { width: 112 }, maxLines: 3 }).setOrigin(0, .5);
      card.add([card.bg, card.icon, card.label, card.answerText]);
      card.answer = answer;
      card.isCorrect = isCorrect;
      card.optionIndex = index;
      card.visualWidth = 190;
      card.visualHeight = 76;
      this.physics.add.existing(card);
      card.body.setSize(190, 76).setAllowGravity(false).setImmovable(true);
      this.physics.add.overlap(this.player, card, () => this.collectAnswer(card), undefined, this);
      this.cards.push(card);
      this.styleCard(card, 190, this.scale.width < 450 ? 72 : 76);
    }

    styleCard(card, width, height) {
      if (!card?.active) return;
      const radius = 17;
      card.visualWidth = width;
      card.visualHeight = height;
      card.bg.clear();
      card.bg.fillStyle(0x668577, .12); card.bg.fillRoundedRect(-width / 2 + 1, -height / 2 + 4, width, height, radius);
      card.bg.fillStyle(0xfffefa, 1); card.bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
      card.bg.lineStyle(1.5, 0xffffff, .95); card.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
      card.bg.lineStyle(1, STAGES[gameState.stage].palette.dark, .23); card.bg.strokeRoundedRect(-width / 2 + 1, -height / 2 + 1, width - 2, height - 2, radius - 1);
      card.icon.clear();
      card.icon.fillStyle(STAGES[gameState.stage].palette.dark, .95); card.icon.fillCircle(-width / 2 + 25, 0, 15);
      card.icon.lineStyle(1, 0xffffff, .4); card.icon.strokeCircle(-width / 2 + 25, 0, 15);
      card.label.setPosition(-width / 2 + 25, 0).setFontSize(width < 160 ? 11 : 13);
      card.answerText.setPosition(-width / 2 + 49, 0).setFontSize(width < 160 ? 12 : width < 185 ? 14 : 15);
      card.answerText.setWordWrapWidth(Math.max(56, width - 62), true);
      card.body?.setSize(width, height);
    }

    layoutCards() {
      if (!this.cards.length) return;
      const width = this.layoutWidth || this.scale.width;
      const height = this.layoutHeight || this.scale.height;
      const compact = width < 560;
      const cardWidth = compact ? Math.min(190, width * .43) : Math.min(195, width * .215);
      const cardHeight = compact ? 70 : 76;
      const xs = compact ? [width * .28, width * .72, width * .28, width * .72] : [width * .155, width * .385, width * .615, width * .845];
      const ys = compact ? [height * .34, height * .34, height * .63, height * .63] : [height * .37, height * .63, height * .37, height * .63];
      this.cards.forEach((card, index) => {
        if (!card.active) return;
        card.setPosition(xs[index], ys[index]);
        this.styleCard(card, cardWidth, cardHeight);
      });
    }

    collectAnswer(card) {
      if (!gameState.started || this.handlingAnswer || !card.active) return;
      this.handlingAnswer = true;
      card.body.enable = false;
      if (card.isCorrect) {
        gameState.score += SCORE_PER_CORRECT;
        renderScore();
        showToast(`答對了！ +${SCORE_PER_CORRECT} 分`, "correct");
        this.cards.forEach((item) => {
          if (item !== card && item.active) item.body.enable = false;
          this.tweens.add({ targets: item, alpha: 0, scale: item === card ? 1.13 : .9, duration: 310, ease: "Quad.easeIn", onComplete: () => item.destroy() });
        });
        const token = this.roundToken;
        this.time.delayedCall(760, () => {
          if (token !== this.roundToken || !gameState.started) return;
          if (gameState.round + 1 < STAGES[gameState.stage].rounds.length) {
            gameState.round += 1;
            renderQuestion();
            this.loadQuestion();
          } else {
            finishStage();
          }
        });
      } else {
        gameState.score -= PENALTY_PER_WRONG;
        renderScore();
        showToast(`這個選項不太對，再找找看！ −${PENALTY_PER_WRONG} 分`, "wrong");
        this.tweens.add({ targets: card, alpha: 0, x: card.x + 9, duration: 260, ease: "Quad.easeIn", onComplete: () => card.destroy() });
        this.time.delayedCall(350, () => { this.handlingAnswer = false; });
      }
    }

    begin() {
      this.handlingAnswer = false;
      this.player?.setPosition(this.scale.width / 2, this.scale.height - 52);
      this.player?.setVelocity(0, 0);
      this.cards.forEach((card) => { if (card.active) card.body.enable = true; });
    }

    setTouchDirection(dir, pressed) {
      if (DIRS.includes(dir)) this.touch[dir] = pressed;
    }

    update() {
      if (!this.player?.body || !gameState.started) {
        this.player?.setVelocity(0, 0);
        return;
      }
      const cursors = this.keys;
      const left = cursors.A.isDown || cursors.LEFT.isDown || this.touch.left;
      const right = cursors.D.isDown || cursors.RIGHT.isDown || this.touch.right;
      const up = cursors.W.isDown || cursors.UP.isDown || this.touch.up;
      const down = cursors.S.isDown || cursors.DOWN.isDown || this.touch.down;
      let vx = Number(right) - Number(left);
      let vy = Number(down) - Number(up);
      const length = Math.hypot(vx, vy) || 1;
      const speed = Math.min(this.scale.width, this.scale.height) < 450 ? 215 : 245;
      this.player.setVelocity((vx / length) * speed, (vy / length) * speed);
      this.playerAura.setPosition(this.player.x, this.player.y + 1);
      this.player.setFlipX(vx < 0);
    }
  }

  const config = {
    type: Phaser.AUTO,
    parent: "game-stage",
    backgroundColor: "#e9f1e9",
    transparent: false,
    scale: { mode: Phaser.Scale.RESIZE, width: 900, height: 470, autoCenter: Phaser.Scale.CENTER_BOTH, expandParent: false },
    physics: { default: "arcade", arcade: { debug: false } },
    render: { antialias: true, pixelArt: false, roundPixels: true },
    scene: [QuestScene],
  };

  ui.overlayButton.onclick = startGame;
  const game = new Phaser.Game(config);

  document.querySelectorAll("[data-dir]").forEach((button) => {
    const dir = button.dataset.dir;
    const setPressed = (pressed) => {
      button.classList.toggle("is-pressed", pressed);
      gameState.scene?.setTouchDirection(dir, pressed);
    };
    button.addEventListener("pointerdown", (event) => { event.preventDefault(); button.setPointerCapture?.(event.pointerId); setPressed(true); });
    button.addEventListener("pointerup", () => setPressed(false));
    button.addEventListener("pointercancel", () => setPressed(false));
    button.addEventListener("lostpointercapture", () => setPressed(false));
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  });

  renderScore();
  renderProgress();
})();
