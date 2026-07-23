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
}

function drawBattle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (battleBackground.complete && battleBackground.naturalWidth) {
    ctx.drawImage(battleBackground, 0, 0, canvas.width, canvas.height);
    
    if (monster1Loaded) {
      const mScale = 1; 
      const baseW = monster1.naturalWidth || monster1.width || 80;
      const baseH = monster1.naturalHeight || monster1.height || 80;
      const mW = Math.round(baseW * mScale);
      const mH = Math.round(baseH * mScale);
      const mX = Math.round(40); 
      const mY = Math.round(canvas.height - mH - 10);
      ctx.drawImage(monster1, mX, mY, mW, mH);
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
