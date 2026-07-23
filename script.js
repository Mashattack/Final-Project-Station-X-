const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scenes = [
  {
    id: 1,
    image: new Image(),
    src: "Background 1.png",
    loaded: false,
  },
  {
    id: 2,
    image: new Image(),
    src: "Background 2.png",
    loaded: false,
  },
];

const stickMan = new Image();
stickMan.src = "Stick Man.png";
let stickLoaded = false;

const stickManLeft = new Image();
stickManLeft.src = "Stick Man (Left).png";
let stickLeftLoaded = false;
const stickManFront = new Image();
stickManFront.src = "Stick Man (Front).png";
let stickFrontLoaded = false;

const crowbar = new Image();
crowbar.src = "Crowbar.png";
let crowbarLoaded = false;

const crowbarInteract = new Image();
crowbarInteract.src = "Crowbar (Interact).png";
let crowbarInteractLoaded = false;

const monster1 = new Image();
monster1.src = "Monster 1.png";
let monster1Loaded = false;

let scene = 1;

const walkableArea = {
  x: 0,
  y: 300,
  width: canvas.width - 0,
  height: canvas.height - 450,
  borderWidth: 6,
};

const player = {
  x: walkableArea.x + 20,
  y: walkableArea.y + 20,
  width: 30,
  height: 96,
  speed: 3,
  facing: 'right',
};
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

scenes.forEach((sceneDef) => {
  sceneDef.image.src = sceneDef.src;
  sceneDef.image.onload = () => {
    sceneDef.loaded = true;
    startLoop();
  };
  sceneDef.image.onerror = (e) => console.error(`${sceneDef.src} load failed:`, e);
});
stickMan.onload = () => { stickLoaded = true; startLoop(); };
stickMan.onerror = (e) => console.error("Stick Man load failed:", e);
stickManLeft.onload = () => { stickLeftLoaded = true; startLoop(); };
stickManLeft.onerror = (e) => console.error("Stick Man (Left) load failed:", e);
stickManFront.onload = () => { stickFrontLoaded = true; startLoop(); };
stickManFront.onerror = (e) => console.error("Stick Man (Front) load failed:", e);
crowbar.onload = () => { crowbarLoaded = true; startLoop(); };
crowbar.onerror = (e) => console.error("Crowbar load failed:", e);
crowbarInteract.onload = () => { crowbarInteractLoaded = true; startLoop(); };
crowbarInteract.onerror = (e) => console.error("Crowbar (Interact) load failed:", e);
monster1.onload = () => { monster1Loaded = true; startLoop(); };
monster1.onerror = (e) => console.error("Monster 1 load failed:", e);

ctx.imageSmoothingEnabled = false;

function startLoop() {
  const allScenesLoaded = scenes.every((sceneDef) => sceneDef.loaded);
  const monsterReady = monster1Loaded || monster1Defeated;
  if (allScenesLoaded && stickLoaded && stickLeftLoaded && stickFrontLoaded && crowbarLoaded && crowbarInteractLoaded && monsterReady) {
    requestAnimationFrame(gameLoop);
  }
}

window.addEventListener("keydown", (event) => {
  if (event.key === "i" || event.key === "I") {
    const isOpen = !inventoryPanel.classList.contains("hidden");
    toggleInventory(!isOpen);
    event.preventDefault();
    return;
  }

  if (event.key === "e" || event.key === "E") {
    if (scene === 1 && !crowbarPicked && playerOverCrowbar) {
      crowbarPicked = true;
      inventoryItems.push("Crowbar");
      try { localStorage.setItem('hasCrowbar', '1'); } catch (e) { console.warn('Could not persist crowbar flag', e); }
      updateInventoryContents();
      toggleInventory(true);
    }
    event.preventDefault();
    return;
  }

  if (event.key in keys) {
    keys[event.key] = true;
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
    event.preventDefault();
  }
});

const closeInventoryButton = document.getElementById("closeInventoryButton");
const inventoryPanel = document.getElementById("inventoryPanel");
const inventoryContents = document.querySelector(".inventory-contents");
let inventoryItems = [];
let crowbarPicked = false;
let playerOverCrowbar = false;
let battleStarted = false;

try {
  const returning = localStorage && localStorage.getItem && localStorage.getItem('playerReturn');
  if (returning) {
    if (localStorage.getItem('hasCrowbar') === '1') {
      crowbarPicked = true;
      inventoryItems.push('Crowbar');
    }
    try { localStorage.removeItem('hasCrowbar'); } catch (e) {}
  } else {
    
    try { localStorage.removeItem('hasCrowbar'); } catch (e) {}
    crowbarPicked = false;
  }
} catch (e) {
  console.warn('LocalStorage not available for crowbar persistence:', e);
}

let monster1Defeated = false;
try {
  const hasPlayerReturn = localStorage && localStorage.getItem && localStorage.getItem('playerReturn');
  if (hasPlayerReturn) {
    
    const ret = localStorage.getItem('playerReturn');
    try {
      const obj = JSON.parse(ret);
      if (typeof obj.scene === 'number') scene = obj.scene;
      if (typeof obj.x === 'number') player.x = obj.x;
      if (typeof obj.y === 'number') player.y = obj.y;
    } catch (e) {
      console.warn('Failed to parse playerReturn:', e);
    }
    
    if (localStorage.getItem('monster1Defeated') === '1') {
      monster1Defeated = true;
    }
    try { localStorage.removeItem('playerReturn'); localStorage.removeItem('monster1Defeated'); } catch (e) {}
  } else {
    
    try { localStorage.removeItem('monster1Defeated'); } catch (e) {}
  }
} catch (e) {
  console.warn('LocalStorage not available:', e);
}

function updateInventoryContents() {
  if (!inventoryContents) return;
  if (inventoryItems.length === 0) {
    inventoryContents.innerHTML = "<p>No items yet.</p>";
  } else {
    inventoryContents.innerHTML = inventoryItems
      .map((item) => `<div class="inventory-item">${item}</div>`)
      .join("");
  }
}

function toggleInventory(show) {
  inventoryPanel.classList.toggle("hidden", !show);
  if (show) updateInventoryContents();
}

if (closeInventoryButton) {
  closeInventoryButton.addEventListener("click", () => toggleInventory(false));
}

function updatePlayer() {

  if (keys.ArrowLeft || keys.a) {
    player.x -= player.speed;
    player.facing = 'left';
  } else if (keys.ArrowRight || keys.d) {
    player.x += player.speed;
    player.facing = 'right';
  }

  if (keys.ArrowUp || keys.w) {
    player.y -= player.speed;
    if (!(keys.ArrowLeft || keys.a) && !(keys.ArrowRight || keys.d)) player.facing = 'front';
  }
  if (keys.ArrowDown || keys.s) {
    player.y += player.speed;
    if (!(keys.ArrowLeft || keys.a) && !(keys.ArrowRight || keys.d)) player.facing = 'front';
  }

  if (scene === 1 && player.x + player.width >= canvas.width) {
    
    scene = 2;
    player.x = 0;
  } else if (scene === 2 && player.x <= 0) {
    
    scene = 1;
    player.x = canvas.width - player.width;
  }

  player.x = Math.max(walkableArea.x, Math.min(walkableArea.x + walkableArea.width - player.width, player.x));
  player.y = Math.max(walkableArea.y, Math.min(walkableArea.y + walkableArea.height - player.height, player.y));
}

function drawPlayer() {
  if (player.facing === 'left' && stickLeftLoaded) {
    ctx.drawImage(stickManLeft, player.x, player.y, player.width, player.height);
  } else if (player.facing === 'front' && stickFrontLoaded) {
    ctx.drawImage(stickManFront, player.x, player.y, player.width, player.height);
  } else if (stickLoaded) {
    ctx.drawImage(stickMan, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const currentScene = scenes.find((sceneDef) => sceneDef.id === scene);
  if (currentScene && currentScene.loaded) {
    ctx.drawImage(currentScene.image, 0, 0, canvas.width, canvas.height);
  }

  if (scene === 1 && !crowbarPicked && crowbarLoaded && crowbarInteractLoaded) {
    const scale = 3;
    const baseWidth = crowbar.naturalWidth || crowbar.width || 80;
    const baseHeight = crowbar.naturalHeight || crowbar.height || 80;
    const crowbarWidth = Math.round(baseWidth * scale);
    const crowbarHeight = Math.round(baseHeight * scale);
    const crowbarX = Math.round((canvas.width - crowbarWidth) / 2);
    const crowbarY = Math.round((canvas.height - crowbarHeight) * 0.72);
    playerOverCrowbar =
      player.x < crowbarX + crowbarWidth &&
      player.x + player.width > crowbarX &&
      player.y < crowbarY + crowbarHeight &&
      player.y + player.height > crowbarY;
    const currentCrowbarImage = playerOverCrowbar ? crowbarInteract : crowbar;
    ctx.drawImage(currentCrowbarImage, crowbarX, crowbarY, crowbarWidth, crowbarHeight);
  } else {
    playerOverCrowbar = false;
  }

  if (scene === 2 && monster1Loaded) {
    if (!monster1Defeated) {
      const scale = 5;
      const baseWidth = monster1.naturalWidth || monster1.width || 80;
      const baseHeight = monster1.naturalHeight || monster1.height || 80;
      const monsterWidth = Math.round(baseWidth * scale);
      const monsterHeight = Math.round(baseHeight * scale);
      const monsterX = Math.round(canvas.width - monsterWidth - 40);
      const monsterY = Math.round((canvas.height - monsterHeight) * 0.55);
      ctx.drawImage(monster1, monsterX, monsterY, monsterWidth, monsterHeight);

      if (!battleStarted) {
        const collidesWithPlayer =
          player.x < monsterX + monsterWidth &&
          player.x + player.width > monsterX &&
          player.y < monsterY + monsterHeight &&
          player.y + player.height > monsterY;
        if (collidesWithPlayer) {
          battleStarted = true;
          
          try {
            localStorage.setItem('playerReturn', JSON.stringify({ scene, x: player.x, y: player.y }));
          } catch (e) {
            console.warn('Could not save playerReturn to localStorage', e);
          }
          window.location.href = "Station X Battle.html";
          return;
        }
      }
    }
  }

  updatePlayer();
  drawPlayer();

  ctx.fillStyle = "#ffffff";
  ctx.font = "18px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Use arrow keys or WASD to move", canvas.width / 2, canvas.height - 16);

  requestAnimationFrame(gameLoop);
}
