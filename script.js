const DEBUG_MODE = false;
const gatheredLocations = [];

const characters = {
  aikaneMakoto: {
    name: "アイカネ マコト",
    line: "今日は何があるかな"
  }
};
let currentCharacterId = "aikaneMakoto";
const characterName = document.getElementById("character-name");
const characterLine = document.getElementById("character-line");
function updateCharacterDisplay() {
  const character = characters[currentCharacterId];
  characterName.textContent = character.name;
  characterLine.textContent = `「${character.line}」`;
}
updateCharacterDisplay();


const locations = ["広場", "森", "川辺", "自宅"];
let currentLocation = "自宅";
const locationOptions = document.getElementById("location-options");
const residentList = document.getElementById("resident-list");
const moveButton = document.getElementById("move-button");
const movePopup = document.getElementById("move-popup");
moveButton.addEventListener("click", function() {
  locationOptions.textContent = "";
  locations.forEach(function(location) {
    if (location === currentLocation) {
    return;
  }
  const button = document.createElement("button");
  button.textContent = location;
  button.addEventListener("click", function() {
    currentLocation = button.textContent;
    updateGatherButton();
    document.getElementById("current-location").textContent = currentLocation;
    movePopup.hidden = true;
    const notification = document.getElementById("notification");
    notification.textContent = currentLocation + "へ移動しました";
    notification.hidden = false;
    setTimeout(function() {
      notification.hidden = true;
    }, 3000);
});
    locationOptions.appendChild(button);
});
  movePopup.hidden = false;
});
const closeButton = document.getElementById("close-move-popup");
closeButton.addEventListener("click", function() {
  movePopup.hidden = true;
});

let gameMinute = 0;
let gameHour = 6;
let gameDay = 1;
let gameSeason = 0; //0が春
let gameYear = 1;
let weekdayIndex = 0;
const weekdays = ["月", "火", "水", "木", "金", "土", "日"];
const gameTimeDisplay = document.getElementById("game-time");
const gameScreen = document.querySelector(".game");
const timerInterval = DEBUG_MODE ? 10 : 1000;
function advanceGameTime() {
  // ここに処理を書く
  gameMinute++;
  if (gameMinute >= 60) {
    gameMinute = 0;
    gameHour++;
    updateBackground();
  }
  if (gameHour >= 24) {
    gameHour = 0;
  }
if (gameHour === 6 && gameMinute === 0) {
  gameDay++;
  gatheredLocations.length = 0;
  updateGatherButton();

  if (gameDay > 30) {
    gameDay = 1;
    gameSeason++;
  }
  if (gameSeason > 3) {
    gameSeason = 0;
    gameYear++;
  }

  const totalDays =
    (gameYear - 1) * 120 +
    gameSeason * 30 +
    gameDay;

  weekdayIndex = getWeekdayIndex(totalDays);
}
  updateResidentList();
  updateGameTimeDisplay();
  saveGame();
}
function getWeekdayIndex(totalDays) {
  const weekdayIndex = (totalDays - 1) % 7;
  return weekdayIndex;
}
function getTimePeriod(gameHour) {
  if (gameHour >= 6 && gameHour < 11) {
    return "morning";
  } else if (gameHour >= 11 && gameHour < 15) {
    return "noon";
  } else if (gameHour >= 15 && gameHour < 19) {
    return "evening";
  } else {
    return "night";
  }
}
function getTimeEmoji(gameHour) {
  const period = getTimePeriod(gameHour);

  if (period === "morning") {
    return "🌅";
  } else if (period === "noon") {
    return "☀️";
  } else if (period === "evening") {
    return "🌆";
  } else {
    return "🌙";
  }
}
function updateBackground() {
  const period = getTimePeriod(gameHour);

  if (period === "morning") {
    gameScreen.style.background = "linear-gradient(white, lightblue)";
  } else if (period === "noon") {
    gameScreen.style.background = "linear-gradient(white, lightyellow)";
  } else if (period === "evening") {
    gameScreen.style.background = "linear-gradient(white, lightsalmon)";
  } else {
    gameScreen.style.background = "linear-gradient(white, lavender)";
  }
}
function updateGameTimeDisplay() {
  const seasons = ["春", "夏", "秋", "冬"];
  const emoji = getTimeEmoji(gameHour);

  gameTimeDisplay.textContent =
    `${gameYear}年目 ${seasons[gameSeason]}${gameDay}日（${weekdays[weekdayIndex]}） ${gameHour}:${String(gameMinute).padStart(2, "0")} ${emoji}`;
}

const dialogue = document.getElementById("dialogue");
console.log("セリフ表示先:", dialogue);
let previousResidentUI = "";

function updateResidentList() {
  // 各NPCの現在地を、現在時刻に対応する予定に合わせて更新する
  npcs.forEach(function(npc) {
    let latestSchedule = null;

    // 現在時刻までに開始する予定のうち、最後の予定を探す
    npc.schedule.forEach(function(schedule) {
      if (schedule.hour <= gameHour) {
        latestSchedule = schedule;
      }
    });

    // 予定が見つかった場合、NPCの現在地を更新する
    if (latestSchedule !== null) {
      npc.currentLocation = latestSchedule.location;
    }
  });

  // 現在地にいるNPCの名前を集め、カンマ区切りの文字列にする
  const currentResidentUI = npcs
  .filter(function(npc) {
    // 現在地がプレイヤーのいる場所と一致するNPCだけを残す
    return npc.currentLocation === currentLocation;
  })
  .map(function(npc) {
    // NPCの名前だけを取り出す
    return npc.name;
  })
  .join(",");

  // 前回の一覧と変わっていなければ、画面を更新せずに終了する
  if (currentResidentUI === previousResidentUI) {
    return;
  }

  // 今回の一覧を前回の一覧として保存する
  previousResidentUI = currentResidentUI;

  // NPC一覧の表示をいったん空にする
  residentList.textContent = "";

  // NPCを1人ずつ確認し、現在地にいるNPCのボタンを作成する
  npcs.forEach(function(npc) {
    if (npc.currentLocation === currentLocation) {
      const button = document.createElement("button");

      // デバッグ用：ボタンを作成したNPCの名前を記録する
      console.log("NPCボタンを作成:", npc.name);

      // ボタンにNPCの名前を表示する
      button.textContent = npc.name;

      // ボタンがクリックされたときの処理を登録する
      button.addEventListener("click", function() {
        // デバッグ用：ボタンがクリックされたことを記録する
        console.log("NPCボタンがクリックされました");

        // NPCと現在時刻をもとに、表示するセリフを選ぶ
        const selectedLine = selectNpcDialogue(npc, gameHour);

        // 選んだセリフを画面に表示する
        dialogue.textContent = selectedLine;

        // 今回表示したセリフをNPCのデータに保存する
        npc.previousLine = selectedLine;

        // デバッグ用：実際に表示されたセリフを記録する
        console.log("セリフを書き込みました:", dialogue.textContent);
      });

      // 作成したボタンをNPC一覧に追加する
      residentList.appendChild(button);
    }
  });

  // NPC一覧にボタンが1つもなければ、誰もいないことを表示する
  if (residentList.children.length === 0) {
    residentList.textContent = "今は誰もいません";
  }
}
function selectDialogue(lines, previousLine) {
  const candidates = lines.filter(function(line) {
    return line !== previousLine;
  });

  if (candidates.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}
function selectNpcDialogue(npc, gameHour) {
  const period = getTimePeriod(gameHour);
  const locationLines = npc.dialogue.location[npc.currentLocation] || [];
  const basicLines = npc.dialogue.basic[period] || [];

  let selectedLine = null;

  if (locationLines.length > 0) {
    // 80%で場所別、20%で基本セリフ
    const useLocation = Math.random() < 0.8;

    const firstLines = useLocation ? locationLines : basicLines;
    const secondLines = useLocation ? basicLines : locationLines;

    selectedLine = selectDialogue(firstLines, npc.previousLine);

    // 選べなければ、もう一方の種類を試す
    if (selectedLine === null) {
      selectedLine = selectDialogue(secondLines, npc.previousLine);
    }
  } else {
    // 場所別セリフがない場合は基本セリフのみ
    selectedLine = selectDialogue(basicLines, npc.previousLine);
  }

  // 両方に別のセリフがなければ、繰り返しを許可する
  if (selectedLine === null) {
    if (locationLines.length > 0) {
      selectedLine = locationLines[0];
    } else if (basicLines.length > 0) {
      selectedLine = basicLines[0];
    } else {
      return "";
    }
  }

  return selectedLine;
}

const inventory = {
  "花": 0,
  "木の実": 0,
  "小魚": 0
};
const inventoryList = document.getElementById("inventory-list");
const inventoryButton = document.getElementById("inventory-button");
const inventoryScreen = document.getElementById("inventory");
const inventoryBackButton = document.getElementById("inventory-back-button");
function updateInventory() {
  inventoryList.textContent = "";

  for (const [itemName, count] of Object.entries(inventory)) {
    const p = document.createElement("p");
    p.textContent = `${itemName}：${count}個`;
    inventoryList.appendChild(p);
  }
}
inventoryButton.addEventListener("click", function() {
  inventoryScreen.hidden = false;
  updateInventory()
});
inventoryBackButton.addEventListener("click", function() {
  inventoryScreen.hidden = true;
});

const gatherButton = document.getElementById("gather-button");
gatherButton.addEventListener("click", function() {
  if (currentLocation === "自宅") {
    return;
  }

  if (gatheredLocations.includes(currentLocation)) {
    return;
  }

  let itemName;

  if (currentLocation === "広場") {
    itemName = "花";
  } else if (currentLocation === "森") {
    itemName = "木の実";
  } else if (currentLocation === "川辺") {
    itemName = "小魚";
  }

  inventory[itemName]++;
  gatheredLocations.push(currentLocation);

  const notification = document.getElementById("notification");
  notification.textContent = itemName + "を1個採集しました";
  notification.hidden = false;

  setTimeout(function() {
    notification.hidden = true;
  }, 3000);

  updateGatherButton();
  updateInventory();
});
function updateGatherButton() {
  if (currentLocation === "自宅") {
    gatherButton.disabled = true;
    gatherButton.textContent = "採集できません";
  } else if (gatheredLocations.includes(currentLocation)) {
    gatherButton.disabled = true;
    gatherButton.textContent = "今日は採集済み";
  } else {
    gatherButton.disabled = false;
    gatherButton.textContent = "採集する";
  }
}
updateGatherButton();

const debugTimeInput = document.getElementById("debug-time");
const debugAdvanceButton = document.getElementById("debug-advance-button");
const timeDebug = document.getElementById("time-debug");
const openTimeDebugButton = document.getElementById("open-time-debug");
const closeTimeDebugButton = document.getElementById("close-time-debug");
openTimeDebugButton.addEventListener("click", () => {
  timeDebug.hidden = false;
});
closeTimeDebugButton.addEventListener("click", () => {
  timeDebug.hidden = true;
});
debugAdvanceButton.addEventListener("click", () => {
  if (!debugTimeInput.value) {
  alert("時刻を入力してください");
  return;
}
  
  const timeParts = debugTimeInput.value.split(":");
  const targetHour = Number(timeParts[0]);
  const targetMinute = Number(timeParts[1]);
  const currentTotalMinutes = gameHour * 60 + gameMinute;
const targetTotalMinutes = targetHour * 60 + targetMinute;

if (targetTotalMinutes < currentTotalMinutes) {
  alert("現在時刻より後の時刻を指定してください");
  return;
}

  while (gameHour !== targetHour || gameMinute !== targetMinute) {
  advanceGameTime();
}
});

function saveGame() {
  const saveData = {
    version: 1,
    gameYear,
    gameSeason,
    gameDay,
    gameHour,
    gameMinute,
    currentLocation,
    currentCharacterId,
    gatheredLocations,
    inventory
  };

  const saveDataJSON = JSON.stringify(saveData);
  localStorage.setItem("jitanGameSave", saveDataJSON);
}
function loadGame() {
  const saveDataJSON = localStorage.getItem("jitanGameSave");

  if (saveDataJSON === null) {
    return;
  }

  console.log("loadGame開始。読み込みデータ:", saveDataJSON);

  try {
    const saveData = JSON.parse(saveDataJSON);

    gameYear = saveData.gameYear;
    gameSeason = saveData.gameSeason;
    gameDay = saveData.gameDay;
    gameHour = saveData.gameHour;
    gameMinute = saveData.gameMinute;
    currentLocation = saveData.currentLocation;
    currentCharacterId = saveData.currentCharacterId;

    Object.assign(inventory, saveData.inventory);

    gatheredLocations.length = 0;
    saveData.gatheredLocations.forEach(location => {
      gatheredLocations.push(location);
    });

    const totalDays =
      (gameYear - 1) * 120 +
      gameSeason * 30 +
      gameDay;

    weekdayIndex = getWeekdayIndex(totalDays);

    updateGameTimeDisplay();
    updateResidentList();

} catch (error) {
    console.error("読み込みに失敗したセーブデータ:", saveDataJSON);
    console.error("セーブデータの読み込みエラー:", error);

    alert("セーブデータを読み込めませんでした。新しくゲームを始めるか確認してください。");
  }
}
// ゲーム開始時の処理
loadGame();
updateCharacterDisplay();
document.getElementById("current-location").textContent = currentLocation;
updateGatherButton();
updateGameTimeDisplay();
updateResidentList();
updateBackground();

// ゲーム内時間の進行開始
setInterval(advanceGameTime, timerInterval);
