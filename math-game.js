const stages = [
  {
    name: "二十以內的加減法",
    description: "練習湊十與拆分，翻開一張算式卡和一張答案卡。",
    pairs: [
      { question: "8 + 7", answer: 15, hint: "先讓 8 湊成 10，從 7 裡拿出 2。", explanation: "8 + 7 可以拆成 8 + 2 + 5，先湊成 10，再加上 5。" },
      { question: "14 − 6", answer: 8, hint: "先從 14 減到 10，想想還要再減多少。", explanation: "14 − 6 先減 4 到 10，再減 2，結果是 8。" },
      { question: "9 + 5", answer: 14, hint: "先從 5 裡拿出 1，讓 9 湊成 10。", explanation: "9 + 5 可以拆成 9 + 1 + 4，先湊成 10，再加上 4。" },
      { question: "17 − 8", answer: 9, hint: "先減到 10，再把還沒減掉的部分算完。", explanation: "17 − 8 先減 7 到 10，再減 1，結果是 9。" },
      { question: "6 + 7", answer: 13, hint: "先從 7 裡拿出 4，讓 6 湊成 10。", explanation: "6 + 7 可以拆成 6 + 4 + 3，先湊成 10，再加上 3。" },
      { question: "18 − 6", answer: 12, hint: "可以先減 8 到 10，再把多減的 2 加回來。", explanation: "18 − 6 等於 18 − 8 + 2，也就是 10 + 2，結果是 12。" }
    ]
  },
  {
    name: "兩位數進位與退位",
    description: "把數字拆成十位與個位，觀察進位和退位如何改變答案。",
    pairs: [
      { question: "28 + 17", answer: 45, hint: "先加十位，再加個位，也可以先把 28 補到 30。", explanation: "28 + 17 可以算成 28 + 2 + 15，先湊成 30，再加 15，結果是 45。" },
      { question: "62 − 28", answer: 34, hint: "先減 20，再減 8，個位不夠時可以退一個十。", explanation: "62 − 28 先算 62 − 20 = 42，再算 42 − 8 = 34。" },
      { question: "39 + 26", answer: 65, hint: "先讓 39 湊成 40，再加上剩下的數。", explanation: "39 + 26 可以算成 39 + 1 + 25，先湊成 40，再加 25，結果是 65。" },
      { question: "83 − 47", answer: 36, hint: "把 47 拆成 40 和 7，逐步往下減。", explanation: "83 − 47 先減 40 得 43，再減 7，結果是 36。" },
      { question: "56 + 27", answer: 83, hint: "先加 20，再把個位的 6 和 7 合起來。", explanation: "56 + 27 先算 56 + 20 = 76，再加 7，結果是 83。" },
      { question: "91 − 38", answer: 53, hint: "先減 30 到 61，再減 8。", explanation: "91 − 38 先算 91 − 30 = 61，再算 61 − 8 = 53。" }
    ]
  },
  {
    name: "百位數加減挑戰",
    description: "運用位值分解，挑戰更大的進位與退位運算。",
    pairs: [
      { question: "128 + 76", answer: 204, hint: "把 76 拆成 70 和 6，分兩步加上去。", explanation: "128 + 76 先加 70 得 198，再加 6，結果是 204。" },
      { question: "305 − 178", answer: 127, hint: "可以先減 100，再把 78 拆開繼續減。", explanation: "305 − 178 先減 100 得 205，再減 78，結果是 127。" },
      { question: "246 + 139", answer: 385, hint: "把 139 拆成 100、30 和 9。", explanation: "246 + 139 等於 246 + 100 + 30 + 9，結果是 385。" },
      { question: "500 − 267", answer: 233, hint: "把 267 拆成 200、60 和 7，逐段減去。", explanation: "500 − 267 先減 200 得 300，再減 60 得 240，最後減 7 得 233。" },
      { question: "89 + 164", answer: 253, hint: "先把 89 補到 100，再把多補的數扣回來。", explanation: "89 + 164 可以算成 100 + 164 − 11，結果是 253。" },
      { question: "800 − 456", answer: 344, hint: "把 456 拆成 400、50 和 6。", explanation: "800 − 456 先減 400 得 400，再減 50 得 350，最後減 6 得 344。" }
    ]
  }
]

const state = {
  stageIndex: 0,
  score: 0,
  streak: 0,
  matched: 0,
  deck: [],
  selected: [],
  locked: false,
  complete: false
}

const scoreValue = document.getElementById("scoreValue")
const streakValue = document.getElementById("streakValue")
const stageTitle = document.getElementById("stageTitle")
const stageDescription = document.getElementById("stageDescription")
const stageBadge = document.getElementById("stageBadge")
const pairCount = document.getElementById("pairCount")
const progressFill = document.getElementById("progressFill")
const progressBar = document.querySelector(".progress[role='progressbar']")
const feedbackBox = document.getElementById("feedbackBox")
const feedbackIcon = document.getElementById("feedbackIcon")
const feedbackTitle = document.getElementById("feedbackTitle")
const feedbackText = document.getElementById("feedbackText")
const hintButton = document.getElementById("hintButton")
const restartButton = document.getElementById("restartButton")
const nextStageButton = document.getElementById("nextStageButton")

let activeScene = null

function showFeedback(title, message, mood = "") {
  feedbackBox.className = `feedback${mood ? ` ${mood}` : ""}`
  feedbackTitle.textContent = title
  feedbackText.textContent = message
  feedbackIcon.textContent = mood === "correct" ? "✓" : mood === "try" ? "↻" : mood === "warn" ? "!" : "✦"
}

function updateStats() {
  const stage = stages[state.stageIndex]
  scoreValue.textContent = String(state.score)
  streakValue.textContent = String(state.streak)
  stageTitle.textContent = stage.name
  stageDescription.textContent = stage.description
  stageBadge.innerHTML = `<i class="stage-dot"></i>第 ${state.stageIndex + 1} 關`
  pairCount.textContent = `${state.matched} / ${stage.pairs.length}`
  const percent = Math.round((state.matched / stage.pairs.length) * 100)
  progressFill.style.width = `${percent}%`
  progressBar.setAttribute("aria-valuenow", String(state.matched))
  progressBar.setAttribute("aria-valuemax", String(stage.pairs.length))
}

function buildDeck(stage) {
  const cards = []
  stage.pairs.forEach((pair, pairId) => {
    cards.push({ pairId, kind: "equation", value: pair.question, pair, revealed: false, matched: false, error: false, warning: false })
    cards.push({ pairId, kind: "answer", value: String(pair.answer), pair, revealed: false, matched: false, error: false, warning: false })
  })
  return Phaser.Utils.Array.Shuffle(cards)
}

function beginStage(index) {
  state.stageIndex = index
  state.matched = 0
  state.selected = []
  state.locked = false
  state.complete = false
  state.deck = buildDeck(stages[index])
  nextStageButton.hidden = true
  nextStageButton.textContent = index === stages.length - 1 ? "再玩一次 →" : "下一關 →"
  updateStats()
  showFeedback("先翻一張卡", "找出一張算式卡與相符的答案卡。答對配對可得 10 星分。")
  if (activeScene) activeScene.drawCards()
}

function restartGame() {
  state.score = 0
  state.streak = 0
  beginStage(0)
}

function moveToNextStage() {
  if (!state.complete) return
  if (state.stageIndex === stages.length - 1) {
    restartGame()
    return
  }
  beginStage(state.stageIndex + 1)
}

class MathMemoryScene extends Phaser.Scene {
  constructor() {
    super("MathMemory")
  }

  create() {
    activeScene = this
    this.cameras.main.setBackgroundColor("#f5f7ff")
    this.scale.on("resize", (size) => this.drawCards(size.width, size.height))
    beginStage(0)
    this.game.canvas.setAttribute("aria-label", "加減法記憶配對卡片，點選兩張卡片進行配對")
  }

  drawCards(width = this.scale.width, height = this.scale.height) {
    this.children.removeAll(true)
    const columns = width < 600 ? 3 : 4
    const rows = Math.ceil(state.deck.length / columns)
    const marginX = width < 600 ? 12 : 24
    const gapX = width < 600 ? 9 : 14
    const gapY = width < 600 ? 9 : 13
    const cardWidth = (width - marginX * 2 - gapX * (columns - 1)) / columns
    const maxHeight = height < 470 ? 106 : 120
    const cardHeight = Math.min(maxHeight, (height - 24 - gapY * (rows - 1)) / rows)
    const totalHeight = rows * cardHeight + (rows - 1) * gapY
    const startY = Math.max(12, (height - totalHeight) / 2)

    state.deck.forEach((card, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      const x = marginX + column * (cardWidth + gapX) + cardWidth / 2
      const y = startY + row * (cardHeight + gapY) + cardHeight / 2
      const shown = card.revealed || card.matched
      const fill = card.matched ? 0xdff5e9 : card.error ? 0xffe5e8 : card.warning ? 0xfff2d8 : shown ? 0xffffff : 0x5966c9
      const stroke = card.matched ? 0x7dcea1 : card.error ? 0xee8290 : card.warning ? 0xe8bd68 : shown ? 0xdfe4ef : 0x5966c9
      const background = this.add.rectangle(x, y, cardWidth, cardHeight, fill, 1).setStrokeStyle(2, stroke)
      background.setInteractive({ useHandCursor: !card.matched })
      background.on("pointerdown", () => this.selectCard(card))
      if (!shown) {
        this.add.text(x, y - 2, "✦", { fontFamily: "Arial, sans-serif", fontSize: "38px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5)
        this.add.text(x, y + cardHeight * 0.25, "翻開卡片", { fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#e5e8ff" }).setOrigin(0.5)
      } else {
        const label = card.kind === "equation" ? "算式" : "答案"
        this.add.text(x, y - cardHeight * 0.27, label, { fontFamily: "Noto Sans TC, sans-serif", fontSize: "13px", color: card.matched ? "#37835c" : "#6e7891", fontStyle: "bold" }).setOrigin(0.5)
        const fontSize = Math.min(32, Math.max(18, Math.floor(cardWidth * (card.kind === "equation" ? 0.16 : 0.24))))
        const textColor = card.matched ? "#226c49" : card.error ? "#b53849" : "#25304c"
        this.add.text(x, y + 5, card.value, { fontFamily: "DM Sans, Noto Sans TC, sans-serif", fontSize: `${fontSize}px`, color: textColor, fontStyle: "bold", align: "center", wordWrap: { width: cardWidth - 12 } }).setOrigin(0.5)
      }
      if (card.matched) this.add.text(x + cardWidth * 0.37, y - cardHeight * 0.34, "✓", { fontFamily: "Arial, sans-serif", fontSize: "17px", color: "#278452", fontStyle: "bold" }).setOrigin(0.5)
    })
  }

  selectCard(card) {
    if (state.locked || state.complete || card.matched || card.revealed) return
    card.revealed = true
    state.selected.push(card)
    this.drawCards()
    if (state.selected.length === 1) {
      showFeedback("看到一張卡了", "再找一張不同類型的卡片，看看能不能配成一對。")
      return
    }
    this.resolvePair()
  }

  resolvePair() {
    const [first, second] = state.selected
    state.locked = true
    if (first.kind === second.kind) {
      first.warning = true
      second.warning = true
      showFeedback("試試不同類型的卡", "一組配對要有一張算式卡和一張答案卡。", "warn")
      this.drawCards()
      this.time.delayedCall(850, () => this.hideSelected())
      return
    }

    if (first.pairId === second.pairId) {
      first.matched = true
      second.matched = true
      state.matched += 1
      state.score += 10
      state.streak += 1
      state.selected = []
      state.locked = false
      updateStats()
      showFeedback("配對成功，加 10 星分", `${first.pair.question} = ${first.pair.answer}。${first.pair.explanation}`, "correct")
      this.drawCards()
      if (state.matched === stages[state.stageIndex].pairs.length) this.finishStage()
      return
    }

    state.streak = 0
    first.error = true
    second.error = true
    const equation = first.kind === "equation" ? first : second
    showFeedback("這次沒配上，看看計算方法", `${equation.pair.question} = ${equation.pair.answer}。${equation.pair.explanation}`, "try")
    updateStats()
    this.drawCards()
    this.time.delayedCall(2100, () => this.hideSelected())
  }

  hideSelected() {
    state.selected.forEach((card) => {
      card.revealed = false
      card.error = false
      card.warning = false
    })
    state.selected = []
    state.locked = false
    this.drawCards()
  }

  showHint() {
    if (state.locked || state.complete) return
    const selectedEquation = state.selected.find((card) => card.kind === "equation")
    const equation = selectedEquation || state.deck.find((card) => card.kind === "equation" && !card.matched)
    if (!equation) return
    showFeedback(`算式提示：${equation.pair.question}`, equation.pair.hint, "warn")
  }

  finishStage() {
    state.complete = true
    const isLastStage = state.stageIndex === stages.length - 1
    nextStageButton.hidden = false
    showFeedback(isLastStage ? "太棒了，三關全數完成" : "本關完成，準備進階挑戰", isLastStage ? `你總共獲得 ${state.score} 星分。重新開始可以再挑戰一次。` : "整理一下剛才的湊十、拆分或位值策略，再進入下一關。", "correct")
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#f5f7ff",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: 1000,
    height: 500
  },
  scene: [MathMemoryScene],
  render: {
    antialias: true,
    roundPixels: true
  }
})

hintButton.addEventListener("click", () => activeScene && activeScene.showHint())
restartButton.addEventListener("click", restartGame)
nextStageButton.addEventListener("click", moveToNextStage)
