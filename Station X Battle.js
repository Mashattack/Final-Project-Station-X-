let playerHealth = 100;
let monsterHealth = 100;
let playerAttackPower = 20;
let battleEnded = false;

try {
  if (localStorage && localStorage.getItem && localStorage.getItem('hasCrowbar') === '1') {
    playerAttackPower += 15;
  }
} catch (e) {
  console.warn('Could not read hasCrowbar from localStorage:', e);
}

let monsterWiggleStart = 0;
const monsterWiggleDuration = 1000; 
const monsterWiggleAmp = 8; 
const monsterWigglePeriod = 300; 


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const battleBackground = new Image();
battleBackground.src = "Battle Background.png";
battleBackground.onload = () => {
  if (battleBackground.naturalWidth && battleBackground.naturalHeight) {
    canvas.width = battleBackground.naturalWidth;
    canvas.height = battleBackground.naturalHeight;
    const displayScale = 5;
    canvas.style.width = `${canvas.width * displayScale}px`;
    canvas.style.height = `${canvas.height * displayScale}px`;
    canvas.style.imageRendering = "pixelated";
  }
  requestAnimationFrame(drawBattle);
};
battleBackground.onerror = (error) => {
  console.error("Battle Background load failed:", error);
  drawBattle();
};

const monster1 = new Image();
monster1.src = "Monster 1 (Battle Sprite).png";
let monster1Loaded = false;
monster1.onload = () => { monster1Loaded = true; };
monster1.onerror = (e) => console.error("Monster 1 load failed:", e);

const attackButtonImg = document.getElementById("attackButtonImg");
if (attackButtonImg) {
  attackButtonImg.addEventListener("mouseenter", () => {
    attackButtonImg.src = "Attack Button (Interact).png";
  });
  attackButtonImg.addEventListener("mouseleave", () => {
    attackButtonImg.src = "Attack Button.png";
  });
  attackButtonImg.addEventListener("click", () => {
    if (monsterHealth > 0) {
      monsterHealth = Math.max(0, monsterHealth - playerAttackPower);
      
      try { monsterWiggleStart = performance.now(); } catch (e) { monsterWiggleStart = Date.now(); }
      attackButtonImg.src = "Attack Button.png";
      if (monsterHealth === 0 && !battleEnded) {
        battleEnded = true;

        try {
          localStorage.setItem('monster1Defeated', '1');
        } catch (e) {
          console.warn('Could not access localStorage to persist defeat flag', e);
        }
    
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2500);
      }
    }
  });
}

function drawBattle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (battleBackground.complete && battleBackground.naturalWidth) {
    ctx.drawImage(battleBackground, 0, 0, canvas.width, canvas.height);
    
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const isWiggling = monsterWiggleStart && (now - monsterWiggleStart < monsterWiggleDuration);
    if (monster1Loaded && (monsterHealth > 0 || isWiggling)) {
      const mScale = 1; 
      const baseW = monster1.naturalWidth || monster1.width || 80;
      const baseH = monster1.naturalHeight || monster1.height || 80;
      const mW = Math.round(baseW * mScale);
      const mH = Math.round(baseH * mScale);
      const mX = Math.round(40); 
      const mY = Math.round(canvas.height - mH - 10);
      let drawX = mX;
      if (isWiggling) {
        const t = now - monsterWiggleStart;
        const cycles = t / monsterWigglePeriod;
        const fade = 1 - (t / monsterWiggleDuration);
        const offset = Math.sin(cycles * Math.PI * 2) * monsterWiggleAmp * fade;
        drawX = Math.round(mX + offset);
      }
      ctx.drawImage(monster1, drawX, mY, mW, mH);
    }

  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Loading battle background...", canvas.width / 2, canvas.height / 2);
  }

  requestAnimationFrame(drawBattle);
}
