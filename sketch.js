let chips = [];

if (new URLSearchParams(window.location.search).get("chips")) {
  try {
    chips = JSON.parse(
      atob(new URLSearchParams(window.location.search).get("chips"))
    );
  } catch {}
}

let nodes = [];
let pins = [];
let menu = undefined;
let nodeReady = false;
let nodeClick = false;
let pinID = 1;
let nodeID = 1;
let board = [];
let startDraw = undefined;

function newBoard() {
  nodes = [];
  pins = [];
  menu = undefined;
  nodeReady = false;
  nodeClick = false;
  pinID = 1;
  nodeID = 1;
  board = [];
  startDraw = undefined;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(53);
  noStroke();
  fill(49);
  rect(0, 75, 50, windowHeight - 150);
  rect(windowWidth - 50, 75, 50, windowHeight - 150);
  fill(41);
  rect(0, 0, windowWidth, 40);
  rect(0, windowHeight - 40, windowWidth, 40);
  fill(50);
  stroke(70);
  rect(75, 75, windowWidth - 75 * 2, windowHeight - 150);

  textSize(30);

  if (
    mouseX > 5 &&
    mouseX < textWidth("CREATE") + 14 &&
    mouseY < 35 &&
    mouseY > 5
  ) {
    fill(135, 188, 36);
  } else {
    fill(74, 102, 140);
  }

  rect(5, 5, textWidth("CREATE") + 9, 30);
  fill(255);
  text("CREATE", 9, 32);

  if (startDraw) {
    stroke(0);
    line(startDraw.x, startDraw.y, mouseX, mouseY);
  }

  if (
    (mouseX < 50 || mouseX > windowWidth - 50) &&
    mouseY > 75 &&
    mouseY < windowHeight - 75 &&
    !nodes.find(
      (n) =>
        (n.x == 15 ? mouseX < 50 : mouseX > windowWidth - 50) &&
        mouseY > n.y &&
        mouseY < n.y + 50
    )
  ) {
    noStroke();
    fill(126);
    rect(
      mouseX < 100 ? 15 : windowWidth - 35,
      Math.min(Math.max(75, mouseY - 25), windowHeight - 125),
      20,
      50
    );
    fill(63);
    ellipse(
      mouseX < 100 ? 75 : windowWidth - 75,
      Math.min(Math.max(75, mouseY - 25), windowHeight - 125) + 25,
      50,
      50
    );
    rect(
      mouseX < 100 ? 75 : windowWidth - 120,
      Math.min(Math.max(75, mouseY - 25), windowHeight - 125) + 22,
      45,
      6
    );
    ellipse(
      mouseX < 100 ? 120 : windowWidth - 120,
      Math.min(Math.max(75, mouseY - 25), windowHeight - 125) + 25,
      20,
      20
    );

    if (
      mouseIsPressed &&
      !nodes.find(
        (n) =>
          (n.x == 15 ? mouseX < 50 : mouseX > windowWidth - 50) &&
          mouseY > n.y &&
          mouseY < n.y + 50
      )
    ) {
      nodeClick = false;

      nodes.push({
        x: mouseX < 100 ? 15 : windowWidth - 35,
        y: Math.min(Math.max(75, mouseY - 25), windowHeight - 125),
        mx: mouseX,
        my: mouseY,
        id: nodeID,
        output: false,
      });

      pins.push({
        x: mouseX < 100 ? 120 : windowWidth - 120,
        y: Math.min(Math.max(75, mouseY - 25), windowHeight - 125) + 25,
        input: mouseX < 100 ? "never" : undefined,
        output: false,
        node: nodeID,
        id: pinID,
      });

      pinID++;
      nodeID++;
    }
  }

  nodes.forEach((n) => {
    if (
      (n.x == 15 ? mouseX < 50 : mouseX > windowWidth - 50) &&
      mouseY > n.y &&
      mouseY < n.y + 50 &&
      !startDraw
    ) {
      nodeReady = true;

      noStroke();
      fill(126);
      rect(n.x, n.y, 20, 50);
    } else {
      noStroke();
      fill(58);
      rect(
        n.mx < 100 ? 15 : windowWidth - 35,
        Math.min(Math.max(75, n.my - 25), windowHeight - 125),
        20,
        50
      );
    }

    fill(0);
    rect(
      n.mx < 100 ? 75 : windowWidth - 120,
      Math.min(Math.max(75, n.my - 25), windowHeight - 125) + 22,
      45,
      6
    );

    if (n.x != 15) {
      n.output =
        pins.find((m) => m.id == pins.find((k) => k.node == n.id).input) &&
        pins.find((m) => m.id == pins.find((k) => k.node == n.id).input).output;
    }

    if (n.output) {
      fill(236, 34, 56);
    } else {
      fill(32, 36, 46);
    }

    ellipse(
      n.mx < 100 ? 75 : windowWidth - 75,
      Math.min(Math.max(75, n.my - 25), windowHeight - 125) + 25,
      50,
      50
    );
  });

  pins.forEach((n) => {
    n.output = nodes.find((k) => k.id == n.node).output;

    if (n.input && n.input !== "never") {
      if (pins.find((k) => k.id == n.input).output) {
        stroke(236, 34, 56);
      } else {
        stroke(0);
      }

      line(
        pins.find((k) => k.id == n.input).x,
        pins.find((k) => k.id == n.input).y,
        n.x,
        n.y
      );
    }

    noStroke();

    if (
      mouseX > n.x - 10 &&
      mouseX < n.x + 10 &&
      mouseY > n.y - 10 &&
      mouseY < n.y + 10
    ) {
      fill(178);
      ellipse(n.x, n.y, 20, 20);
    } else {
      fill(0);
      ellipse(n.x, n.y, 20, 20);
    }
  });

  if (menu) {
    stroke(65);
    fill(51);
    rect(menu.x, menu.y, 200, 30);
    fill(39);
    rect(menu.x, menu.y + 30, 200, 30);
    textSize(30);
    fill(255);
    text("DELETE", menu.x + (200 - textWidth("DELETE")) / 2, menu.y + 56);
  }

  noStroke();

  let totalX = 0;

  for (var i = -2; i < chips.length; i++) {
    if (i == -2) {
      if (
        mouseX > totalX + 5 &&
        mouseX < totalX + 5 + textWidth("AND") + 9 &&
        mouseY > windowHeight - 35 &&
        mouseY < windowHeight - 35 + 30
      ) {
        fill(202);
        rect(totalX + 5, windowHeight - 35, textWidth("AND") + 9, 30);
        fill(0);
        textSize(30);
        text("AND", totalX + 9, windowHeight - 9);
      } else {
        fill(48);
        rect(totalX + 5, windowHeight - 35, textWidth("AND") + 9, 30);
        fill(223);
        textSize(30);
        text("AND", totalX + 9, windowHeight - 9);
      }

      totalX += textWidth("AND") + 14;
    } else if (i == -1) {
      if (
        mouseX > totalX + 5 &&
        mouseX < totalX + 5 + textWidth("AND") + 9 &&
        mouseY > windowHeight - 35 &&
        mouseY < windowHeight - 35 + 30
      ) {
        fill(202);
        rect(totalX + 5, windowHeight - 35, textWidth("NOT") + 9, 30);
        fill(0);
        textSize(30);
        text("NOT", totalX + 9, windowHeight - 9);
      } else {
        fill(48);
        rect(totalX + 5, windowHeight - 35, textWidth("NOT") + 9, 30);
        fill(223);
        textSize(30);
        text("NOT", totalX + 9, windowHeight - 9);
      }

      totalX += textWidth("NOT") + 14;
    } else {
      if (
        mouseX > totalX + 5 &&
        mouseX < totalX + 5 + textWidth(chips[i].name) + 9 &&
        mouseY > windowHeight - 35 &&
        mouseY < windowHeight - 35 + 30
      ) {
        fill(202);
        rect(totalX + 5, windowHeight - 35, textWidth(chips[i].name) + 9, 30);
        fill(0);
        textSize(30);
        text(chips[i].name, totalX + 9, windowHeight - 9);
      } else {
        fill(48);
        rect(totalX + 5, windowHeight - 35, textWidth(chips[i].name) + 9, 30);
        fill(223);
        textSize(30);
        text(chips[i].name, totalX + 9, windowHeight - 9);
      }

      totalX += textWidth(chips[i].name) + 14;
    }
  }
}

function mouseClicked() {
  if (
    nodes.find(
      (n) =>
        n.mx < 100 &&
        mouseX > 50 &&
        mouseX < 100 &&
        mouseY > Math.min(Math.max(75, n.my - 25), windowHeight - 125) &&
        mouseY < Math.min(Math.max(75, n.my - 25), windowHeight - 125) + 50
    )
  ) {
    nodes.find(
      (n) =>
        n.mx < 100 &&
        mouseX > 50 &&
        mouseX < 100 &&
        mouseY > Math.min(Math.max(75, n.my - 25), windowHeight - 125) &&
        mouseY < Math.min(Math.max(75, n.my - 25), windowHeight - 125) + 50
    ).output = !nodes.find(
      (n) =>
        n.mx < 100 &&
        mouseX > 50 &&
        mouseX < 100 &&
        mouseY > Math.min(Math.max(75, n.my - 25), windowHeight - 125) &&
        mouseY < Math.min(Math.max(75, n.my - 25), windowHeight - 125) + 50
    ).output;
  }

  if (
    startDraw &&
    pins.find(
      (n) =>
        mouseX > n.x - 10 &&
        mouseX < n.x + 10 &&
        mouseY > n.y - 10 &&
        mouseY < n.y + 10
    ) &&
    pins.find(
      (n) =>
        mouseX > n.x - 10 &&
        mouseX < n.x + 10 &&
        mouseY > n.y - 10 &&
        mouseY < n.y + 10
    ).input !== "never"
  ) {
    pins.find(
      (n) =>
        mouseX > n.x - 10 &&
        mouseX < n.x + 10 &&
        mouseY > n.y - 10 &&
        mouseY < n.y + 10
    ).input = pins.find((n) => n.x == startDraw.x && n.y == startDraw.y).id;

    startDraw = undefined;
  } else if (startDraw) {
    startDraw = undefined;
  } else {
    if (
      pins.find(
        (n) =>
          mouseX > n.x - 10 &&
          mouseX < n.x + 10 &&
          mouseY > n.y - 10 &&
          mouseY < n.y + 10
      ) &&
      pins.find(
        (n) =>
          mouseX > n.x - 10 &&
          mouseX < n.x + 10 &&
          mouseY > n.y - 10 &&
          mouseY < n.y + 10
      ).input === "never"
    ) {
      startDraw = {
        x: pins.find(
          (n) =>
            mouseX > n.x - 10 &&
            mouseX < n.x + 10 &&
            mouseY > n.y - 10 &&
            mouseY < n.y + 10
        ).x,
        y: pins.find(
          (n) =>
            mouseX > n.x - 10 &&
            mouseX < n.x + 10 &&
            mouseY > n.y - 10 &&
            mouseY < n.y + 10
        ).y,
      };
    } else {
      startDraw = undefined;
    }
  }

  if (
    nodes.find(
      (n) =>
        (n.x == 15 ? mouseX < 50 : mouseX > windowWidth - 50) &&
        mouseY > n.y &&
        mouseY < n.y + 50
    )
  ) {
    if (
      menu &&
      menu.id ==
        nodes.find(
          (n) =>
            (n.x == 15 ? mouseX < 50 : mouseX > windowWidth - 50) &&
            mouseY > n.y &&
            mouseY < n.y + 50
        ).id
    ) {
      menu = undefined;
    } else {
      menu = {
        x:
          nodes.find(
            (n) =>
              (n.x == 15 ? mouseX < 50 : mouseX > windowWidth - 50) &&
              mouseY > n.y &&
              mouseY < n.y + 50
          ).x == 15
            ? 175
            : windowWidth - 385,
        y:
          nodes.find(
            (n) =>
              (n.x == 15 ? mouseX < 50 : mouseX > windowWidth - 50) &&
              mouseY > n.y &&
              mouseY < n.y + 50
          ).y - 15,
        id: nodes.find(
          (n) =>
            (n.x == 15 ? mouseX < 50 : mouseX > windowWidth - 50) &&
            mouseY > n.y &&
            mouseY < n.y + 50
        ).id,
      };
    }
  } else {
    menu = undefined;
  }
}

function newChip(data) {
  chips.push(data);
  window.history.pushState(
    null,
    null,
    `?chips=${encodeURIComponent(btoa(JSON.stringify(chips)))}`
  );
  newBoard();
}
