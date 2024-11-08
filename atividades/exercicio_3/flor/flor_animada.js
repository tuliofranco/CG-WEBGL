// Seleciona o canvas e obtém o contexto WebGL
function initializeWebGL() {
  const canvas = document.querySelector('#c');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL não é suportado');
  }

  // Define o tamanho do canvas
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  return { canvas, gl };
}

// Cria e compila um shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Erro ao compilar o shader: ' + gl.getShaderInfoLog(shader));
  }

  return shader;
}

// Cria o programa shader e o vincula
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Erro ao linkar o programa: ' + gl.getProgramInfoLog(program));
  }

  return program;
}

// Configura os buffers e atributos para um retângulo
function setupRectangleBuffer(gl, program, x1, y1, x2, y2) {
  const vertices = new Float32Array([
    x1, y1,
    x2, y1,
    x2, y2,
    x1, y1,
    x2, y2,
    x1, y2,
  ]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

// Configura os buffers e atributos para um círculo
function setupCircleBuffer(gl, program, centerX, centerY, radius) {
  const numSegments = 100;
  const circleVertices = [];

  // Gera os vértices do círculo
  for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * 2.0 * Math.PI;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    circleVertices.push(x, y);
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

// Prepara o canvas para a renderização
function prepareCanvas(gl, canvas) {
  gl.clearColor(0.5, 0.8, 1.0, 1.0); // Fundo azul claro (céu)
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

// Desenha a cena
function drawScene(gl, program, shapeType, vertexCount) {
  gl.drawArrays(shapeType, 0, vertexCount);
}

// Função principal que executa todas as etapas
function main() {
  const { canvas, gl } = initializeWebGL();

  // Código GLSL dos shaders
  const vertexShaderGLSL = `
    attribute vec2 position;
    uniform float angle;
    uniform vec2 translation;
    void main() {
      vec2 rotatedPosition = vec2(
        position.x * cos(angle) - position.y * sin(angle),
        position.x * sin(angle) + position.y * cos(angle)
      );
      gl_Position = vec4(rotatedPosition + translation, 0.0, 1.0);
    }
  `;

  const fragmentShaderGLSL = `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }
  `;

  // Cria e compila os shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderGLSL);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderGLSL);

  // Cria o programa shader
  const program = createProgram(gl, vertexShader, fragmentShader);

  // Ativa o programa shader
  gl.useProgram(program);

  // Localizações de atributos e uniformes
  const positionLocation = gl.getAttribLocation(program, 'position');
  const colorLocation = gl.getUniformLocation(program, 'color');
  const angleLocation = gl.getUniformLocation(program, 'angle');
  const translationLocation = gl.getUniformLocation(program, 'translation');

  // Variáveis de animação
  let butterflyPositionX = -1.0;
  let lastTime = 0;

  // Variáveis de controle
  let petalRotationAngle = 0;
  let rightPressed = false;
  let leftPressed = false;

  // Event listeners para teclas
  document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
      rightPressed = true;
    } else if (event.key === 'ArrowLeft') {
      leftPressed = true;
    }
  });

  document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowRight') {
      rightPressed = false;
    } else if (event.key === 'ArrowLeft') {
      leftPressed = false;
    }
  });

  function render(time) {
    time *= 0.001; // Converte para segundos
    const deltaTime = time - lastTime;
    lastTime = time;

    // Atualiza a posição da borboleta
    butterflyPositionX += deltaTime * 0.2; // Velocidade de 0.2 unidades por segundo
    if (butterflyPositionX > 1.1) {
      butterflyPositionX = -1.1; // Reinicia a posição
    }

    // Atualiza o ângulo de rotação das pétalas com base nas teclas pressionadas
    const rotationSpeed = 2.0; // Ajuste a velocidade de rotação conforme necessário
    if (rightPressed) {
      petalRotationAngle -= deltaTime * rotationSpeed; // Sentido horário
    }
    if (leftPressed) {
      petalRotationAngle += deltaTime * rotationSpeed; // Sentido anti-horário
    }
    const petalRotation = petalRotationAngle;

    // Atualiza o ângulo dos raios do sol
    const sunRayAngle = time * 0.5; // Velocidade de rotação dos raios

    // Prepara o canvas
    prepareCanvas(gl, canvas);

    // Desenha o chão (grama)
    setupRectangleBuffer(gl, program, -1.0, -1.0, 1.0, -0.6);
    gl.uniform4f(colorLocation, 0.0, 0.6, 0.0, 1.0); // Cor verde para a grama
    gl.uniform1f(angleLocation, 0.0);
    gl.uniform2f(translationLocation, 0.0, 0.0);
    drawScene(gl, program, gl.TRIANGLES, 6);

    // Desenha o caule
    setupRectangleBuffer(gl, program, -0.02, -0.1, 0.02, -0.6);
    gl.uniform4f(colorLocation, 0.0, 0.5, 0.0, 1.0); // Cor verde escuro
    drawScene(gl, program, gl.TRIANGLES, 6);

    // Desenha as folhas
    // Folha esquerda
    const leftLeafVertices = new Float32Array([
      -0.02, -0.3,
      -0.2, -0.4,
      -0.02, -0.4,
    ]);
    const positionBufferLeftLeaf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferLeftLeaf);
    gl.bufferData(gl.ARRAY_BUFFER, leftLeafVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorLocation, 0.0, 0.5, 0.0, 1.0);
    gl.uniform1f(angleLocation, 0.0);
    gl.uniform2f(translationLocation, 0.0, 0.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Folha direita
    const rightLeafVertices = new Float32Array([
      0.02, -0.3,
      0.2, -0.4,
      0.02, -0.4,
    ]);
    const positionBufferRightLeaf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRightLeaf);
    gl.bufferData(gl.ARRAY_BUFFER, rightLeafVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorLocation, 0.0, 0.5, 0.0, 1.0);
    gl.uniform1f(angleLocation, 0.0);
    gl.uniform2f(translationLocation, 0.0, 0.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Desenha o centro da flor
    setupCircleBuffer(gl, program, 0.0, 0.0, 0.1);
    gl.uniform4f(colorLocation, 1.0, 0.9, 0.0, 1.0); // Cor amarelo
    gl.uniform1f(angleLocation, 0.0);
    gl.uniform2f(translationLocation, 0.0, 0.0);
    drawScene(gl, program, gl.TRIANGLE_FAN, 101);

    // Desenha as pétalas
    const numPetals = 16;
    const petalRadius = 0.15;
    const petalDistance = 0.2;

    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * 2 * Math.PI + petalRotation;
      const x = Math.cos(angle) * petalDistance;
      const y = Math.sin(angle) * petalDistance;
      setupCircleBuffer(gl, program, x, y, petalRadius);
      const colorVariation = (i % 2 === 0) ? 1.0 : 0.8;
      gl.uniform4f(colorLocation, 1.0, colorVariation, 0.99, 1.0); // Cor rosa variando
      gl.uniform1f(angleLocation, 0.0);
      gl.uniform2f(translationLocation, 0.0, 0.0);
      drawScene(gl, program, gl.TRIANGLE_FAN, 101);
    }

    // Animação da borboleta
    // Asa esquerda
    const butterflyLeftWing = new Float32Array([
      -0.05, 0.05,
      0.05, 0.15,
      0.05, -0.05,
    ]);
    const butterflyLeftWingBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, butterflyLeftWingBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, butterflyLeftWing, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorLocation, 0.9, 0.6, 0.0, 1.0); // Cor laranja
    gl.uniform1f(angleLocation, Math.sin(time * 10) * 0.2); // Animação de batimento das asas
    gl.uniform2f(translationLocation, butterflyPositionX, 0.4);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Asa direita
    const butterflyRightWing = new Float32Array([
      0.05, 0.05,
      0.15, 0.15,
      0.15, -0.05,
    ]);
    const butterflyRightWingBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, butterflyRightWingBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, butterflyRightWing, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorLocation, 0.9, 0.6, 0.0, 1.0); // Cor laranja
    gl.uniform1f(angleLocation, -Math.sin(time * 10) * 0.2); // Animação de batimento das asas
    gl.uniform2f(translationLocation, butterflyPositionX, 0.4);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Corpo da borboleta
    setupRectangleBuffer(gl, program, 0.045, -0.05, 0.055, 0.15);
    gl.uniform4f(colorLocation, 0.2, 0.2, 0.2, 1.0); // Cor preta
    gl.uniform1f(angleLocation, 0.0);
    gl.uniform2f(translationLocation, butterflyPositionX, 0.4);
    drawScene(gl, program, gl.TRIANGLES, 6);

    // Desenha o sol
    setupCircleBuffer(gl, program, 0.7, 0.7, 0.2);
    gl.uniform4f(colorLocation, 1.0, 1.0, 0.0, 1.0); // Cor amarela
    gl.uniform1f(angleLocation, 0.0);
    gl.uniform2f(translationLocation, 0.0, 0.0);
    drawScene(gl, program, gl.TRIANGLE_FAN, 101);

    // Raios do sol animados
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI + sunRayAngle;
      const x1 = 0.7 + Math.cos(angle) * 0.2;
      const y1 = 0.7 + Math.sin(angle) * 0.2;
      const x2 = 0.7 + Math.cos(angle) * (0.25 + 0.05 * Math.sin(time * 2));
      const y2 = 0.7 + Math.sin(angle) * (0.25 + 0.05 * Math.sin(time * 2));

      const sunRayVertices = new Float32Array([
        x1, y1,
        x2, y2,
      ]);
      const sunRayBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sunRayBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sunRayVertices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform4f(colorLocation, 1.0, 1.0, 0.0, 1.0);
      gl.uniform1f(angleLocation, 0.0);
      gl.uniform2f(translationLocation, 0.0, 0.0);
      gl.drawArrays(gl.LINES, 0, 2);
    }

    // Chama o próximo frame
    requestAnimationFrame(render);
  }

  // Inicia a animação
  requestAnimationFrame(render);
}

// Executa o código
main();
