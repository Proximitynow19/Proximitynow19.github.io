console.warn("%cDLS.JS", "font-size: 100px;");
console.log(
  "%cVersion: 1.0.0",
  "font-weight: bold; font-size: large; color: green;"
);

let chips = [];

if (new URLSearchParams(window.location.search).get("c")) {
  chips = JSON.parse(
    window.pako.inflate(new URLSearchParams(window.location.search).get("c"), {
      to: "string",
    })
  );

  if (typeof chips !== "object") {
    chips = [];

    window.history.pushState(null, null, `/logic.html`);
  }
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
let holdingChip = undefined;

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
  strokeWeight(6);
  rect(75, 75, windowWidth - 75 * 2, windowHeight - 150);
  noStroke();

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

  if (
    (mouseX < 50 || mouseX > windowWidth - 50) &&
    mouseY > 75 &&
    mouseY < windowHeight - 75 &&
    !nodes.find(
      (n) =>
        (n.x == 15 ? mouseX < 50 : mouseX > windowWidth - 50) &&
        mouseY > n.y &&
        mouseY < n.y + 50
    ) &&
    !startDraw
  ) {
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
    stroke(63);
    strokeWeight(6);
    line(
      mouseX < 100 ? 75 : windowWidth - 120,
      Math.min(Math.max(75, mouseY - 25), windowHeight - 125) + 25,
      mouseX < 100 ? 75 + 45 : windowWidth - 120 + 45,
      Math.min(Math.max(75, mouseY - 25), windowHeight - 125) + 25
    );
    noStroke();
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
        pin: 0,
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

    stroke(0);
    strokeWeight(6);
    line(
      n.mx < 100 ? 75 : windowWidth - 120,
      Math.min(Math.max(75, n.my - 25), windowHeight - 125) + 25,
      n.mx < 100 ? 75 + 45 : windowWidth - 120 + 45,
      Math.min(Math.max(75, n.my - 25), windowHeight - 125) + 25
    );
    noStroke();

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

  board.forEach((n) => {
    noStroke();
    fill(n.data.colour);
    textSize(30);
    rect(
      n.x - (textWidth(n.data.name) + 40) / 2,
      n.y -
        Math.max(
          n.data.nodes.filter((n) => n.x != 15).length * 25 + 5,
          n.data.nodes.filter((n) => n.x == 15).length * 25 + 5
        ) /
          2,
      textWidth(n.data.name) + 40,
      Math.max(
        n.data.nodes.filter((n) => n.x != 15).length * 25 + 5,
        n.data.nodes.filter((n) => n.x == 15).length * 25 + 5
      )
    );
    fill(255);
    text(n.data.name, n.x - (textWidth(n.data.name) + 40) / 2 + 20, n.y + 11);
  });

  if (startDraw) {
    stroke(0);
    strokeWeight(6);
    line(startDraw.x, startDraw.y, mouseX, mouseY);
    noStroke();
  }

  pins.forEach((n) => {
    if (n.input && n.input !== "never") {
      if (pins.find((k) => k.id == n.input).output) {
        stroke(236, 34, 56);
      } else {
        stroke(0);
      }

      strokeWeight(6);

      line(
        pins.find((k) => k.id == n.input).x,
        pins.find((k) => k.id == n.input).y,
        n.x,
        n.y
      );

      noStroke();

      if (pins.find((k) => k.id == n.input).output) {
        if (
          mouseX > pins.find((k) => k.id == n.input).x - 10 &&
          mouseX < pins.find((k) => k.id == n.input).x + 10 &&
          mouseY > pins.find((k) => k.id == n.input).y - 10 &&
          mouseY < pins.find((k) => k.id == n.input).y + 10
        ) {
          fill(178);
          ellipse(
            pins.find((k) => k.id == n.input).x,
            pins.find((k) => k.id == n.input).y,
            20,
            20
          );
        } else {
          fill(0);
          ellipse(
            pins.find((k) => k.id == n.input).x,
            pins.find((k) => k.id == n.input).y,
            20,
            20
          );
        }
      }
    }

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

  if (holdingChip) {
    noStroke();
    fill(holdingChip.colour);
    textSize(30);
    rect(
      mouseX - (textWidth(holdingChip.name) + 40) / 2,
      mouseY -
        Math.max(
          holdingChip.nodes.filter((n) => n.x != 15).length * 25 + 5,
          holdingChip.nodes.filter((n) => n.x == 15).length * 25 + 5
        ) /
          2,
      textWidth(holdingChip.name) + 40,
      Math.max(
        holdingChip.nodes.filter((n) => n.x != 15).length * 25 + 5,
        holdingChip.nodes.filter((n) => n.x == 15).length * 25 + 5
      )
    );
    fill(255);
    text(
      holdingChip.name,
      mouseX - (textWidth(holdingChip.name) + 40) / 2 + 20,
      mouseY + 11
    );
  }

  let data = Execute(board, pins, nodes);

  board = data.board;
  pins = data.pins;
  nodes = data.nodes;
}

function Execute(d__board, d__pins, d__nodes) {
  let d_board = d__board;
  let d_pins = d__pins;
  let d_nodes = d__nodes;

  d_nodes
    .filter((n) => n.x == 15)
    .forEach((n) => {
      d_pins.find((m) => m.node == n.id).output = n.output;
    });

  d_pins
    .filter((n) => n.input !== "never")
    .forEach((n) => {
      n.output = n.input && d_pins.find((k) => k.id == n.input).output;
    });

  d_board.forEach((n) => {
    switch (n.data.type) {
      case "and":
        d_pins.filter((k) => k.node == n.id)[2].output =
          d_pins.find(
            (x) => x.id == d_pins.filter((k) => k.node == n.id)[0].input
          ) &&
          d_pins.find(
            (x) => x.id == d_pins.filter((k) => k.node == n.id)[0].input
          ).output &&
          d_pins.find(
            (x) => x.id == d_pins.filter((k) => k.node == n.id)[1].input
          ) &&
          d_pins.find(
            (x) => x.id == d_pins.filter((k) => k.node == n.id)[1].input
          ).output;
        break;
      case "not":
        d_pins.filter((k) => k.node == n.id)[1].output = !(
          d_pins.find(
            (x) => x.id == d_pins.filter((k) => k.node == n.id)[0].input
          ) &&
          d_pins.find(
            (x) => x.id == d_pins.filter((k) => k.node == n.id)[0].input
          ).output
        );
        break;
      case "custom":
        let bdata = n.data.nodes;

        bdata
          .filter((s) => s.x == 15)
          .forEach((s) => {
            s.output =
              d_pins.find((v) => v.node == n.id && v.pin == s.id).input &&
              d_pins.find(
                (q) =>
                  q.id ==
                  d_pins.find((v) => v.node == n.id && v.pin == s.id).input
              ).output;
          });

        let data = Execute(n.data.data.board, n.data.data.pins, bdata);

        d_pins
          .filter((k) => k.node == n.id && k.input == "never")
          .forEach((p) => {
            p.output =
              data.nodes.find((l) => l.x != 15 && l.id == p.pin) &&
              data.nodes.find((l) => l.x != 15 && l.id == p.pin).output;
          });

        break;
    }
  });

  d_nodes
    .filter((n) => n.x != 15)
    .forEach((n) => {
      n.output = d_pins.find((k) => k.node == n.id).output;
    });

  return { board: d_board, pins: d_pins, nodes: d_nodes };
}

function mouseClicked() {
  if (
    mouseX > 5 &&
    mouseX < textWidth("CREATE") + 14 &&
    mouseY < 35 &&
    mouseY > 5
  ) {
    newChip(prompt("name"));
  }

  let totalX = 0;
  let beforeChip = holdingChip;

  holdingChip = undefined;

  for (var i = -2; i < chips.length; i++) {
    if (i == -2) {
      if (
        mouseX > totalX + 5 &&
        mouseX < totalX + 5 + textWidth("AND") + 9 &&
        mouseY > windowHeight - 35 &&
        mouseY < windowHeight - 35 + 30
      ) {
        holdingChip = {
          name: "AND",
          colour: "#397a98",
          type: "and",
          nodes: [
            { x: 15, id: 1, output: false },
            { x: 15, id: 2, output: false },
            { x: windowWidth - 35, id: 3, output: false },
          ],
        };
      }

      totalX += textWidth("AND") + 14;
    } else if (i == -1) {
      if (
        mouseX > totalX + 5 &&
        mouseX < totalX + 5 + textWidth("AND") + 9 &&
        mouseY > windowHeight - 35 &&
        mouseY < windowHeight - 35 + 30
      ) {
        holdingChip = {
          name: "NOT",
          colour: "#8c2b24",
          type: "not",
          nodes: [
            { x: 15, id: 1, output: false },
            { x: windowWidth - 35, id: 2, output: false },
          ],
        };
      }

      totalX += textWidth("NOT") + 14;
    } else {
      if (
        mouseX > totalX + 5 &&
        mouseX < totalX + 5 + textWidth(chips[i].name) + 9 &&
        mouseY > windowHeight - 35 &&
        mouseY < windowHeight - 35 + 30
      ) {
        holdingChip = chips[i];
        holdingChip.type = "custom";
      }

      totalX += textWidth(chips[i].name) + 14;
    }
  }

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
    beforeChip &&
    !holdingChip &&
    mouseX > 75 + textWidth(beforeChip.name) + 40 / 2 + 15 &&
    mouseX < windowWidth - 75 - textWidth(beforeChip.name) + 40 / 2 - 15 &&
    mouseY >
      75 +
        Math.max(
          beforeChip.nodes.filter((n) => n.x != 15).length * 25 + 5,
          beforeChip.nodes.filter((n) => n.x == 15).length * 25 + 5
        ) /
          2 +
        5 &&
    mouseY <
      windowHeight -
        75 -
        Math.max(
          beforeChip.nodes.filter((n) => n.x != 15).length * 25 + 5,
          beforeChip.nodes.filter((n) => n.x == 15).length * 25 + 5
        ) /
          2 -
        5
  ) {
    let d_pins = [];

    for (var i = 0; i < beforeChip.nodes.length; i++) {
      d_pins.push(pinID);

      pins.push({
        x:
          beforeChip.nodes[i].x == 15
            ? mouseX - (textWidth(beforeChip.name) + 40) / 2
            : mouseX + (textWidth(beforeChip.name) + 40) / 2,
        y:
          mouseY -
          Math.max(
            beforeChip.nodes.filter((n) => n.x != 15).length * 25 + 5,
            beforeChip.nodes.filter((n) => n.x == 15).length * 25 + 5
          ) /
            2 +
          (Math.max(
            beforeChip.nodes.filter((n) => n.x != 15).length * 25 + 5,
            beforeChip.nodes.filter((n) => n.x == 15).length * 25 + 5
          ) /
            beforeChip.nodes.filter((n) => n.x == beforeChip.nodes[i].x)
              .length) *
            (beforeChip.nodes
              .filter((n) => n.x == beforeChip.nodes[i].x)
              .indexOf(beforeChip.nodes[i]) +
              1) -
          Math.max(
            beforeChip.nodes.filter((n) => n.x != 15).length * 25 + 5,
            beforeChip.nodes.filter((n) => n.x == 15).length * 25 + 5
          ) /
            beforeChip.nodes.filter((n) => n.x == beforeChip.nodes[i].x)
              .length /
            2,
        input: beforeChip.nodes[i].x == 15 ? undefined : "never",
        output: false,
        node: nodeID,
        pin: beforeChip.nodes[i].id,
        id: pinID,
      });

      pinID++;
    }

    board.push({
      data: beforeChip,
      x: mouseX,
      y: mouseY,
      pins: d_pins,
      id: nodeID,
    });

    nodeID++;
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

function newChip(name) {
  chips.push({
    name,
    colour: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    type: "custom",
    data: { board, pins },
    nodes,
  });
  window.history.pushState(
    null,
    null,
    `?c=${encodeURIComponent(
      window.pako.deflate(JSON.stringify(chips), { to: "string" })
    )}`
  );
  newBoard();
}
