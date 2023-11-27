let lastPosition = {
  x: window.screenX,
  y: window.screenY,
  width: window.innerWidth,
  height: window.innerHeight,
};
let socket;
let otherWindowPosition = {}; // Hold the last known position of the other window

const emitPosition = () => {
  const currentPosition = {
    x: window.screenX,
    y: window.screenY,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  if (
    currentPosition.x !== lastPosition.x ||
    currentPosition.y !== lastPosition.y ||
    currentPosition.width !== lastPosition.width ||
    currentPosition.height !== lastPosition.height
  ) {
    // Emit the new position to the other windows
    socket.emit("move", currentPosition);
    lastPosition = { ...currentPosition };
  }
};

const updateParticlesDirection = () => {
  if (Object.keys(otherWindowPosition).length !== 0) {
    adjustParticles(lastPosition, otherWindowPosition);
  }
};

// Function to adjust particles, now expects both positions
const adjustParticles = (ownPosition, otherWindowPosition) => {
  const ownCenterX = ownPosition.x + ownPosition.width / 2;
  const ownCenterY = ownPosition.y + ownPosition.height / 2;
  const otherCenterX = otherWindowPosition.x + otherWindowPosition.width / 2;
  const otherCenterY = otherWindowPosition.y + otherWindowPosition.height / 2;

  const deltaX = otherCenterX - ownCenterX;
  const deltaY = otherCenterY - ownCenterY;

  // Calculate angle in radians
  let angle = Math.atan2(deltaY, deltaX);

  // Convert radians to degrees and normalize
  angle = (angle * (180 / Math.PI) + 360) % 360;

  // Convert the angle into a vector
  const directionX = Math.cos(angle * (Math.PI / 180));
  const directionY = Math.sin(angle * (Math.PI / 180));

  if (window.pJSDom && window.pJSDom.length > 0) {
    const pJS = window.pJSDom[0].pJS;
    pJS.particles.move.straight = true;

    pJS.particles.array.forEach((particle) => {
      particle.vx = directionX * pJS.particles.move.speed;
      particle.vy = directionY * pJS.particles.move.speed;
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  socket = io("http://localhost:3000");
  const statusDiv = document.getElementById("status");

  setInterval(() => {
    emitPosition();
    updateParticlesDirection(); // Also update particles on interval
  }, 100);

  socket.on("move", (position) => {
    // Update the stored position of the other window
    otherWindowPosition = position;
    // Update the status div with the position of the other window
    statusDiv.innerText = `Other Window Position: x: ${position.x}, y: ${position.y}`;
    // Adjust particles based on the other window's new position
    updateParticlesDirection();
  });

  // Initialize particles.js
  particlesJS("particles-js", {
    particles: {
      number: { value: 80 },
      line_linked: { enable: true },
      move: {
        direction: "none",
        speed: 2,
        straight: false, // Set to false initially
        out_mode: "out",
      },
    },
  });
});
