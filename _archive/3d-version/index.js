/**
 * ==========================================================================
 * MRIDUL NARNAULIA AESTHETIC - THREE.JS 3D COLLECTOR BOX CONTROLLER
 * Deepanshu Lakde Portfolio (Exact Pixel-by-Pixel Reference Replica)
 * ==========================================================================
 */

let scene, camera, renderer, mainBoxGroup, reflectionBoxGroup;
let cartridges = [];
let reflectionCartridges = [];
let hoveredCartridge = null;
let raycaster, mouse;

let activeCartridgeKey = 'about';
let audioCtx = null;
let isAudioPlaying = false;
let ambientOscillators = [];
let ambientGain = null;

// Cartridge configurations (matching the 6 cards in reference)
const cartridgeConfigs = [
  { key: 'about', index: '01', title: 'Profile & Bio', sub: 'About', type: 'terminal', tag: 'About' },
  { key: 'experience', index: '02', title: 'Work History', sub: 'Roles', type: 'briefcase', tag: 'Experience' },
  { key: 'skills', index: '03', title: 'Tech Stack', sub: 'Skills', type: 'chip', tag: 'Skills' },
  { key: 'stats', index: '04', title: 'Key Metrics', sub: 'Impact', type: 'diamond', tag: 'Impact' },
  { key: 'education', index: '05', title: 'Education', sub: 'Studies', type: 'gradcap', tag: 'Education' },
  { key: 'projects', index: '06', title: 'Curated Work', sub: 'Repos', type: 'honeycomb', tag: 'Selected Work' }
];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Three.js 3D Scene
  initThreeScene();

  // 2. Initialize Ambient Audio Widget (Synthesizer via Web Audio API)
  initAmbientAudio();

  // 3. Listen for ESC and Arrow keys
  initKeyboardNav();
});

/**
 * ==========================================================================
 * THREE.JS SCENE SETUP (EXACT REFERENCE CAMERA & PERSPECTIVE)
 * ==========================================================================
 */
function initThreeScene() {
  const container = document.getElementById('webgl-canvas-container');
  if (!container || typeof THREE === 'undefined') {
    console.error('Three.js or container not available');
    return;
  }

  // --- SCENE & FOG ---
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040604, 0.02);

  // --- CAMERA (Fixed Perspective Angle Matching Reference Image) ---
  camera = new THREE.PerspectiveCamera(31, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(5.0, 5.6, 14.6);
  camera.lookAt(0, 0.25, 0);

  // --- RENDERER ---
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // --- LIGHTING ---
  // Subtle ambient fill
  const ambientLight = new THREE.AmbientLight(0x0e170e, 2.2);
  scene.add(ambientLight);

  // Key Studio Spotlight from front-top
  const keySpot = new THREE.SpotLight(0xf2fff0, 3.2);
  keySpot.position.set(5, 14, 11);
  keySpot.angle = Math.PI * 0.38;
  keySpot.penumbra = 0.55;
  keySpot.castShadow = true;
  keySpot.shadow.mapSize.width = 1024;
  keySpot.shadow.mapSize.height = 1024;
  scene.add(keySpot);

  // Neon Lime Accent Light from top-left (illuminates card rims & edges)
  const limeAccent = new THREE.DirectionalLight(0xc8ff00, 2.2);
  limeAccent.position.set(-6, 9, 5);
  scene.add(limeAccent);

  // Backlight rim for the glass lid
  const backRim = new THREE.DirectionalLight(0x558855, 1.2);
  backRim.position.set(0, 10, -8);
  scene.add(backRim);

  // --- MAIN BOX GROUP (100% FIXED PERSPECTIVE - STRICTLY NO MOUSE Y-AXIS ROTATION) ---
  mainBoxGroup = new THREE.Group();
  // Exact 3/4 isometric tilt matching Mridul's reference photo
  mainBoxGroup.rotation.set(0.07, -0.36, 0.03);
  mainBoxGroup.position.set(-0.2, -0.15, 0);
  scene.add(mainBoxGroup);

  // Build the 3D Collector Box & Cartridges
  buildCollectorBox(mainBoxGroup, false);
  buildCartridges(mainBoxGroup, false);

  // Build Mirrored Reflection underneath
  buildMirroredReflection();

  // Floor Shadow & Glossy Reflection Plane
  buildFloor();

  // Raycaster for Mouse Interactivity (Hover elevation only, NO ROTATION)
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-1000, -1000);

  // Event Listeners for Hover and Click
  setupInteractionListeners(container);

  // Animation Loop
  animate();
}

/**
 * --- BUILD 3D JET-BLACK OBSIDIAN COLLECTOR BOX ---
 * Solid obsidian walls, white inscription on front wall, open tinted lid on back wall
 */
function buildCollectorBox(parentGroup, isReflection) {
  const boxWidth = 11.2;  // Long front & back wall
  const boxDepth = 5.2;   // Short left & right wall
  const boxHeight = 2.05; // Wall height seating cards deeply inside
  const wallThickness = 0.18;

  // Obsidian black satin material (SOLID OPAQUE, NOT TRANSLUCENT)
  const boxMat = new THREE.MeshStandardMaterial({
    color: isReflection ? 0x020302 : 0x080b08,
    roughness: isReflection ? 0.35 : 0.25,
    metalness: 0.28,
    transparent: isReflection,
    opacity: isReflection ? 0.45 : 1.0
  });

  // Base floor inside box
  const baseGeom = new THREE.BoxGeometry(boxWidth, wallThickness, boxDepth);
  const baseMesh = new THREE.Mesh(baseGeom, boxMat);
  baseMesh.position.y = -boxHeight / 2 + wallThickness / 2;
  baseMesh.receiveShadow = !isReflection;
  parentGroup.add(baseMesh);

  // Left wall (short side)
  const sideWallGeom = new THREE.BoxGeometry(wallThickness, boxHeight, boxDepth);
  const leftWall = new THREE.Mesh(sideWallGeom, boxMat);
  leftWall.position.set(-boxWidth / 2 + wallThickness / 2, 0, 0);
  leftWall.castShadow = !isReflection;
  leftWall.receiveShadow = !isReflection;
  parentGroup.add(leftWall);

  // Right wall (short side)
  const rightWall = new THREE.Mesh(sideWallGeom, boxMat);
  rightWall.position.set(boxWidth / 2 - wallThickness / 2, 0, 0);
  rightWall.castShadow = !isReflection;
  rightWall.receiveShadow = !isReflection;
  parentGroup.add(rightWall);

  // Back wall (long side)
  const backWallGeom = new THREE.BoxGeometry(boxWidth, boxHeight, wallThickness);
  const backWall = new THREE.Mesh(backWallGeom, boxMat);
  backWall.position.set(0, 0, -boxDepth / 2 + wallThickness / 2);
  backWall.castShadow = !isReflection;
  backWall.receiveShadow = !isReflection;
  parentGroup.add(backWall);

  // Front wall (long side) with crisp white inscription
  const frontCanvas = createFrontLabelCanvas(boxWidth * 160, boxHeight * 160, isReflection);
  const frontTex = new THREE.CanvasTexture(frontCanvas);
  frontTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const frontFaceMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    roughness: 0.22,
    metalness: 0.25,
    transparent: isReflection,
    opacity: isReflection ? 0.5 : 1.0
  });

  const frontMaterials = [
    boxMat, // right (+X)
    boxMat, // left (-X)
    boxMat, // top (+Y)
    boxMat, // bottom (-Y)
    frontFaceMat, // front (+Z - facing camera)
    boxMat  // back (-Z - inside)
  ];

  const frontWallGeom = new THREE.BoxGeometry(boxWidth, boxHeight, wallThickness);
  const frontWall = new THREE.Mesh(frontWallGeom, frontMaterials);
  frontWall.position.set(0, 0, boxDepth / 2 - wallThickness / 2);
  frontWall.castShadow = !isReflection;
  frontWall.receiveShadow = !isReflection;
  parentGroup.add(frontWall);

  // --- OPEN TINTED GLASS/ACRYLIC LID ---
  // Attached to the back long wall, standing upright tilted back ~14 degrees
  const lidWidth = boxWidth;
  const lidHeight = boxDepth * 1.28;
  const lidThickness = 0.08;

  const lidMat = new THREE.MeshPhysicalMaterial({
    color: 0x060c06,
    transmission: isReflection ? 0.35 : 0.85,
    opacity: isReflection ? 0.3 : 0.94,
    transparent: true,
    roughness: 0.08,
    metalness: 0.15,
    ior: 1.5,
    reflectivity: 0.88
  });

  const lidGeom = new THREE.BoxGeometry(lidWidth, lidHeight, lidThickness);
  const lidMesh = new THREE.Mesh(lidGeom, lidMat);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, boxHeight / 2, -boxDepth / 2 + wallThickness);
  // Standing upright and tilted backward ~14 degrees (-0.24 radians)
  lidPivot.rotation.x = -0.24; 
  lidMesh.position.set(0, lidHeight / 2, 0);
  lidPivot.add(lidMesh);

  // Polished glass bevel frame along lid rim
  const lidEdgeGeom = new THREE.EdgesGeometry(lidGeom);
  const lidEdgeMat = new THREE.LineBasicMaterial({
    color: 0xa8dca8,
    transparent: true,
    opacity: isReflection ? 0.2 : 0.65
  });
  const lidWireframe = new THREE.LineSegments(lidEdgeGeom, lidEdgeMat);
  lidMesh.add(lidWireframe);

  parentGroup.add(lidPivot);
}

/**
 * Crisp front face inscription:
 * "D E E P A N S H U   L A K D E       /       S E L E C T E D   W O R K"
 * In elegant clean silver/white matching reference image
 */
function createFrontLabelCanvas(w, h, isReflection) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w);
  canvas.height = Math.round(h);
  const ctx = canvas.getContext('2d');

  // Solid obsidian black background
  ctx.fillStyle = '#080c08';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top lip highlight line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(canvas.width, 2);
  ctx.stroke();

  // Crisp silver/white inscription
  ctx.fillStyle = isReflection ? 'rgba(230, 240, 230, 0.5)' : '#edf2ed';
  ctx.font = 'bold 30px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = 'D E E P A N S H U   L A K D E       /       S E L E C T E D   W O R K';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas;
}

/**
 * --- BUILD 6 STEPPED HORIZONTAL CARTRIDGES ---
 * Parallel to the front wall, staggered diagonally from back-left (01) to front-right (06)
 * Wide horizontal tab exposure spanning the entire width of the box!
 */
function buildCartridges(parentGroup, isReflection) {
  const cardWidth = 3.1;   // Proportional landscape card
  const cardHeight = 2.05; // Height of card
  const cardThickness = 0.08;
  const count = cartridgeConfigs.length;

  cartridgeConfigs.forEach((cfg, i) => {
    const cardGroup = new THREE.Group();
    // Base Y is deep inside box so only top portion peeks out, matching reference
    cardGroup.userData = { ...cfg, basePosY: 0.12, index: i, isReflection };

    const faceTex = createCartridgeCanvasTexture(cfg, isReflection);

    // Dark olive-black satin card body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x142212,
      roughness: 0.22,
      metalness: 0.25,
      transparent: isReflection,
      opacity: isReflection ? 0.35 : 1.0
    });

    const frontFaceMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.18,
      metalness: 0.15,
      transparent: isReflection,
      opacity: isReflection ? 0.45 : 1.0
    });

    const materials = [
      bodyMat,      // +X
      bodyMat,      // -X
      bodyMat,      // +Y
      bodyMat,      // -Y
      frontFaceMat, // +Z (Front face facing viewer)
      bodyMat       // -Z (Back face)
    ];

    const cardGeom = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);
    const cardMesh = new THREE.Mesh(cardGeom, materials);
    cardMesh.castShadow = !isReflection;
    cardMesh.receiveShadow = !isReflection;
    cardGroup.add(cardMesh);

    // Subtle neon lime rim outline along card edge
    const edgesGeom = new THREE.EdgesGeometry(cardGeom);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xbdf518,
      transparent: true,
      opacity: isReflection ? 0.2 : 0.7
    });
    const edgeLine = new THREE.LineSegments(edgesGeom, edgeMat);
    cardMesh.add(edgeLine);

    // Diagonal stepping spanning from back-left (Card 1) to front-right (Card 6):
    const t = i / (count - 1); // 0 to 1
    const posX = -3.8 + t * 7.6; // Spans from -3.8 to +3.8 across the box
    const posZ = -1.45 + t * 2.9; // Spans from back wall to front wall

    // All cards are PARALLEL to the front wall (rotation.y = 0)
    cardGroup.position.set(posX, cardGroup.userData.basePosY, posZ);
    cardGroup.rotation.set(0, 0, 0);

    parentGroup.add(cardGroup);

    if (isReflection) {
      reflectionCartridges.push(cardGroup);
    } else {
      cartridges.push(cardGroup);
    }
  });
}

/**
 * Canvas texture for horizontal landscape cartridge:
 * - Rounded rect border in neon lime
 * - 4 corner rivet circles
 * - Top-left: "01 Profile & Bio"
 * - Icon: Positioned in the left exposed area (cx = 100) so it's 100% visible on all cards!
 */
function createCartridgeCanvasTexture(cfg, isReflection) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Rich forest-olive background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1d2f19');
  grad.addColorStop(0.5, '#132111');
  grad.addColorStop(1, '#0a1409');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Rounded rectangle border outline
  ctx.strokeStyle = '#c8ff00';
  ctx.lineWidth = 5;
  drawRoundedRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, 22);
  ctx.stroke();

  // Four corner rivet circles
  ctx.fillStyle = '#c8ff00';
  const rivetOffset = 24;
  const rivetRadius = 4;
  [
    [rivetOffset, rivetOffset],
    [canvas.width - rivetOffset, rivetOffset],
    [rivetOffset, canvas.height - rivetOffset],
    [canvas.width - rivetOffset, canvas.height - rivetOffset]
  ].forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, rivetRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Top-left text: small index + title
  ctx.fillStyle = '#c8ff00';
  ctx.font = 'bold 21px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`${cfg.index}  ${cfg.title}`, 32, 32);

  // Vector outline icon positioned in the exposed left portion (cx = 110, cy = 215)
  drawCartridgeVectorIcon(ctx, cfg.type, 110, 215);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

/**
 * Helper to draw rounded rectangle
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Vector iconography matching Mridul's reference style (clean outline line-art in neon lime)
 */
function drawCartridgeVectorIcon(ctx, type, cx, cy) {
  ctx.strokeStyle = '#c8ff00';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#c8ff00';
  ctx.shadowBlur = 10;

  switch (type) {
    case 'terminal': // >_ prompt
      ctx.beginPath();
      ctx.moveTo(cx - 38, cy - 26);
      ctx.lineTo(cx - 10, cy);
      ctx.lineTo(cx - 38, cy + 26);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 4, cy + 26);
      ctx.lineTo(cx + 38, cy + 26);
      ctx.stroke();
      break;

    case 'briefcase': // T-shirt / Work briefcase outline
      ctx.beginPath();
      drawRoundedRect(ctx, cx - 35, cy - 20, 70, 48, 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 20);
      ctx.lineTo(cx - 15, cy - 34);
      ctx.lineTo(cx + 15, cy - 34);
      ctx.lineTo(cx + 15, cy - 20);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy + 4, 4, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 'chip': // Gamepad / CPU Chip
      drawRoundedRect(ctx, cx - 42, cy - 20, 84, 42, 14);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 10);
      ctx.lineTo(cx - 22, cy + 10);
      ctx.moveTo(cx - 32, cy);
      ctx.lineTo(cx - 12, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 22, cy - 5, 4, 0, Math.PI * 2);
      ctx.arc(cx + 14, cy + 5, 4, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 'diamond': // Diamond outline (Lakme fashion week equivalent)
      ctx.beginPath();
      ctx.moveTo(cx, cy - 35);
      ctx.lineTo(cx + 34, cy - 12);
      ctx.lineTo(cx, cy + 35);
      ctx.lineTo(cx - 34, cy - 12);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 34, cy - 12);
      ctx.lineTo(cx + 34, cy - 12);
      ctx.moveTo(cx, cy - 35);
      ctx.lineTo(cx, cy + 35);
      ctx.stroke();
      break;

    case 'gradcap': // Megaphone / Education
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy - 12);
      ctx.lineTo(cx + 20, cy - 32);
      ctx.lineTo(cx + 20, cy + 32);
      ctx.lineTo(cx - 26, cy + 12);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 32, cy, 14, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
      break;

    case 'honeycomb': // Honeycomb cluster (Hive equivalent)
      drawHexagon(ctx, cx, cy - 18, 17);
      drawHexagon(ctx, cx - 17, cy + 12, 17);
      drawHexagon(ctx, cx + 17, cy + 12, 17);
      break;
  }

  ctx.shadowBlur = 0;
}

function drawHexagon(ctx, x, y, r) {
  ctx.beginPath();
  for (let a = 0; a < 6; a++) {
    const angle = (Math.PI / 3) * a + Math.PI / 6;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * --- BUILD CRISP MIRRORED REFLECTION UNDERNEATH ---
 * Exact inverted mirror clone below floor plane
 */
function buildMirroredReflection() {
  reflectionBoxGroup = new THREE.Group();
  reflectionBoxGroup.rotation.copy(mainBoxGroup.rotation);
  // Position directly beneath floor plane (Y = -1.18) and invert Y scale
  reflectionBoxGroup.position.set(-0.2, -2.15, 0);
  reflectionBoxGroup.scale.set(1, -1, 1);
  scene.add(reflectionBoxGroup);

  buildCollectorBox(reflectionBoxGroup, true);
  buildCartridges(reflectionBoxGroup, true);
}

/**
 * Floor Plane & Glossy Mirror Receiver
 */
function buildFloor() {
  const planeGeom = new THREE.PlaneGeometry(45, 45);
  // Semi-transparent dark glossy floor so mirrored reflection shines through crisp and clear
  const planeMat = new THREE.MeshStandardMaterial({
    color: 0x030503,
    roughness: 0.18,
    metalness: 0.82,
    transparent: true,
    opacity: 0.74,
    depthWrite: false
  });

  const plane = new THREE.Mesh(planeGeom, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1.17;
  plane.receiveShadow = true;
  scene.add(plane);

  // Soft subtle green floor glow directly beneath the box
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const ctx = glowCanvas.getContext('2d');
  const radGrad = ctx.createRadialGradient(128, 128, 0, 128, 128, 120);
  radGrad.addColorStop(0, 'rgba(200, 255, 0, 0.15)');
  radGrad.addColorStop(0.5, 'rgba(200, 255, 0, 0.04)');
  radGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 256, 256);

  const glowTex = new THREE.CanvasTexture(glowCanvas);
  const glowGeom = new THREE.PlaneGeometry(18, 18);
  const glowMat = new THREE.MeshBasicMaterial({
    map: glowTex,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
  });
  const glowMesh = new THREE.Mesh(glowGeom, glowMat);
  glowMesh.rotation.x = -Math.PI / 2;
  glowMesh.position.y = -1.16;
  scene.add(glowMesh);
}

/**
 * ==========================================================================
 * INTERACTION: HOVER LIFT & CLICK INSPECTION (NO ROTATION)
 * ==========================================================================
 */
function setupInteractionListeners(container) {
  // Track mouse coordinates for cartridge raycasting only (NO BOX ROTATION)
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Click on Cartridge to open drawer
  container.addEventListener('click', (e) => {
    if (hoveredCartridge) {
      const key = hoveredCartridge.userData.key;
      openCartridge(key);
      playClickSound();
    }
  });

  // Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/**
 * Main Render & Raycasting Loop (Box is completely static, only cartridges lift)
 */
function animate() {
  requestAnimationFrame(animate);

  const modal = document.getElementById('cartridge-modal-backdrop');
  const isModalOpen = modal && modal.classList.contains('open');

  if (!isModalOpen) {
    raycaster.setFromCamera(mouse, camera);

    // Get all meshes from top cartridges
    const cardMeshes = [];
    cartridges.forEach(cg => {
      cg.traverse(child => {
        if (child.isMesh) {
          child.userData.parentGroup = cg;
          cardMeshes.push(child);
        }
      });
    });

    const intersects = raycaster.intersectObjects(cardMeshes);

    if (intersects.length > 0) {
      const hitGroup = intersects[0].object.userData.parentGroup;
      if (hitGroup && hitGroup !== hoveredCartridge) {
        // Unhover previous
        if (hoveredCartridge) {
          liftCartridge(hoveredCartridge, false);
        }
        hoveredCartridge = hitGroup;
        liftCartridge(hoveredCartridge, true);
        document.body.style.cursor = 'pointer';
      }
    } else {
      if (hoveredCartridge) {
        liftCartridge(hoveredCartridge, false);
        hoveredCartridge = null;
        document.body.style.cursor = 'default';
      }
    }
  }

  renderer.render(scene, camera);
}

/**
 * GSAP Lift Cartridge Animation
 */
function liftCartridge(group, isHovered) {
  if (typeof gsap === 'undefined') return;

  const targetY = isHovered
    ? group.userData.basePosY + 1.25
    : group.userData.basePosY;

  gsap.to(group.position, {
    y: targetY,
    duration: 0.32,
    ease: isHovered ? 'power2.out' : 'power2.inOut'
  });

  // Also elevate corresponding reflection card symmetrically
  const idx = group.userData.index;
  if (reflectionCartridges[idx]) {
    gsap.to(reflectionCartridges[idx].position, {
      y: targetY,
      duration: 0.32,
      ease: isHovered ? 'power2.out' : 'power2.inOut'
    });
  }
}

/**
 * ==========================================================================
 * CARTRIDGE DRAWER & CONTENT CONTROLLER
 * ==========================================================================
 */
function openCartridge(key) {
  activeCartridgeKey = key;
  const backdrop = document.getElementById('cartridge-modal-backdrop');
  if (!backdrop) return;

  backdrop.classList.add('open');
  backdrop.setAttribute('aria-hidden', 'false');
  renderDrawerContent(key);

  const drawer = backdrop.querySelector('.cartridge-drawer-modal');
  if (drawer && typeof gsap !== 'undefined') {
    gsap.fromTo(drawer, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
  }
}

function closeCartridgeModal() {
  const backdrop = document.getElementById('cartridge-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
}

const closeCartridge = closeCartridgeModal;

function handleBackdropClick(e) {
  if (e.target.id === 'cartridge-modal-backdrop') closeCartridgeModal();
}

function switchDrawerTab(key) {
  activeCartridgeKey = key;
  renderDrawerContent(key);
}

function copyEmail() {
  const toast = document.getElementById('neon-toast');
  navigator.clipboard?.writeText(resumeData.personal.email);
  if (!toast) return;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function renderDrawerContent(key) {
  const p = resumeData.personal;
  const titles = {
    about: `About ${p.name}`, experience: 'Work History', skills: 'Tech Stack',
    stats: 'Key Impact', education: 'Education', projects: 'Selected Work', contact: 'Get in Touch'
  };
  const tabs = ['about', 'experience', 'skills', 'stats', 'education', 'projects', 'contact'];
  const idx = String(tabs.indexOf(key) + 1).padStart(2, '0');

  document.getElementById('modal-badge').textContent = `${idx} // ${key.toUpperCase()}`;
  document.getElementById('modal-title').textContent = titles[key] || '';
  document.querySelectorAll('.drawer-tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === key));

  const bodyEl = document.getElementById('modal-body-container');
  const tags = list => `<div class="skills-tags-cluster">${list.map(t => `<span class="skill-tag-neon">${t}</span>`).join('')}</div>`;

  const views = {
    about: () => `
      <p class="detail-text-paragraph">${p.bio}</p>
      <div class="detail-stats-grid">
        <div class="detail-stat-box"><div class="detail-stat-title">${p.role}</div><div class="detail-stat-sub">${p.statusBadge}</div></div>
        <div class="detail-stat-box"><div class="detail-stat-title">Location</div><div class="detail-stat-sub">${p.location}</div></div>
      </div>`,
    experience: () => resumeData.experience.map(e => `
      <div class="drawer-exp-item">
        <div class="exp-title-row">
          <div><div class="exp-role-name">${e.role}</div><div class="exp-company-name">${e.company}</div></div>
          <div class="exp-meta-info">${e.period}</div>
        </div>
        <div class="exp-meta-info">${e.location}</div>
        <ul class="exp-bullets-list">${e.highlights.map(h => `<li class="exp-bullet">${h}</li>`).join('')}</ul>
        ${tags(e.skillsUsed)}
      </div>`).join(''),
    skills: () => `
      ${tags(resumeData.skillsCategories.map(c => c.name))}
      <div class="skills-drawer-grid">
        ${resumeData.skills.map(s => `
          <div class="skill-drawer-cell">
            <div class="skill-cell-header">
              <span class="skill-cell-name"><i class="${s.icon}"></i>${s.name}</span>
              <span class="skill-cell-level">${s.level}%</span>
            </div>
            <div class="skill-bar-track"><div class="skill-bar-fill-neon" style="width:${s.level}%"></div></div>
            <div class="detail-stat-sub">${s.highlight}</div>
          </div>`).join('')}
      </div>`,
    stats: () => `
      <div class="detail-stats-grid">
        ${resumeData.stats.map(s => `
          <div class="detail-stat-box">
            <div class="detail-stat-val">${s.value}</div>
            <div class="detail-stat-title">${s.label}</div>
            <div class="detail-stat-sub">${s.subtext}</div>
          </div>`).join('')}
      </div>`,
    education: () => resumeData.education.map(e => `
      <div class="drawer-exp-item">
        <div class="exp-title-row">
          <div><div class="exp-role-name">${e.degree}</div><div class="exp-company-name">${e.institution}</div></div>
          <div class="exp-meta-info">${e.period}</div>
        </div>
        <p class="detail-text-paragraph">${e.details}</p>
      </div>`).join(''),
    projects: () => {
      const pp = resumeData.projectsPlaceholder;
      return `
        <div class="drawer-exp-item">
          <div class="exp-role-name">${pp.title}</div>
          <div class="exp-company-name">${pp.status}</div>
          <p class="detail-text-paragraph">${pp.message}</p>
          ${tags(pp.tags)}
          <p class="detail-text-paragraph"><a class="exp-company-name" href="${pp.githubLink}" target="_blank" rel="noopener">View GitHub ↗</a></p>
        </div>`;
    },
    contact: () => `
      <div class="detail-stats-grid">
        <a class="detail-stat-box" href="mailto:${p.email}" onclick="copyEmail()"><div class="detail-stat-title">Email</div><div class="detail-stat-sub">${p.email}</div></a>
        <a class="detail-stat-box" href="${p.github}" target="_blank" rel="noopener"><div class="detail-stat-title">GitHub</div><div class="detail-stat-sub">deepanshu1345</div></a>
        <a class="detail-stat-box" href="${p.linkedin}" target="_blank" rel="noopener"><div class="detail-stat-title">LinkedIn</div><div class="detail-stat-sub">deepanshu-lakde</div></a>
        <a class="detail-stat-box" href="${p.resumePdf}" download><div class="detail-stat-title">Resume</div><div class="detail-stat-sub">Download PDF</div></a>
      </div>`
  };

  bodyEl.innerHTML = (views[key] || views.about)();
}

/**
 * ==========================================================================
 * AMBIENT AUDIO WIDGET (SYNTHESIZER VIA WEB AUDIO API)
 * Matches the Juno Love / SoundCloud widget from Mridul's site
 * ==========================================================================
 */
function initAmbientAudio() {
  const toggleBtn = document.getElementById('ambient-audio-toggle');
  const animBars = document.getElementById('audio-play-icon');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      setupWebAudio();
    }

    if (isAudioPlaying) {
      stopAmbientMusic();
      toggleBtn.innerHTML = '<span class="play-icon">▷</span>';
      if (animBars) animBars.classList.remove('playing');
      isAudioPlaying = false;
    } else {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      startAmbientMusic();
      toggleBtn.innerHTML = '<span class="pause-icon">❚❚</span>';
      if (animBars) animBars.classList.add('playing');
      isAudioPlaying = true;
    }
  });
}

function setupWebAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
}

function startAmbientMusic() {
  if (!audioCtx) return;

  ambientGain = audioCtx.createGain();
  ambientGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
  ambientGain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 3);
  ambientGain.connect(audioCtx.destination);

  // Atmospheric drone frequencies
  const freqs = [130.81, 164.81, 196.00, 261.63];

  freqs.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Subtle detune for lush chorus
    osc.detune.setValueAtTime((idx - 1.5) * 6, audioCtx.currentTime);

    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.25, audioCtx.currentTime);

    // Gentle LFO filter modulation
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.15 + idx * 0.05, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(oscGain.gain);
    lfo.start();

    osc.connect(oscGain);
    oscGain.connect(ambientGain);
    osc.start();

    ambientOscillators.push(osc);
    ambientOscillators.push(lfo);
  });
}

function stopAmbientMusic() {
  if (ambientGain && audioCtx) {
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, audioCtx.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
    setTimeout(() => {
      ambientOscillators.forEach(osc => {
        try { osc.stop(); } catch(e){}
      });
      ambientOscillators = [];
    }, 1300);
  }
}

function playClickSound() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
}

/**
 * Keyboard Navigation (ESC to close, 1-6 to open cartridges)
 */
function initKeyboardNav() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartridge();
    }
    const num = parseInt(e.key, 10);
    if (!isNaN(num) && num >= 1 && num <= 6) {
      const cfg = cartridgeConfigs[num - 1];
      if (cfg) {
        openCartridge(cfg.key);
      }
    }
  });

  const closeBtn = document.getElementById('drawer-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCartridge);
  }

  const backdrop = document.getElementById('cartridge-modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeCartridge();
      }
    });
  }
}
