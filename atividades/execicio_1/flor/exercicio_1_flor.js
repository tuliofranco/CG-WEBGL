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
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
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

  // Prepara o canvas
  prepareCanvas(gl, canvas);

  // Ativa o programa shader
  gl.useProgram(program);

  // Desenha o chão (grama)
  setupRectangleBuffer(gl, program, -1.0, -1.0, 1.0, -0.6);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.6, 0.0, 1.0); // Cor verde para a grama
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Desenha o caule
  setupRectangleBuffer(gl, program, -0.02, -0.1, 0.02, -0.6);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.5, 0.0, 1.0); // Cor verde escuro
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Desenha as folhas com formas de triângulo
  // Folha esquerda
  const leftLeafVertices = new Float32Array([
    -0.02, -0.3,
    -0.2, -0.4,
    -0.02, -0.4,
  ]);
  const positionBufferLeftLeaf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferLeftLeaf);
  gl.bufferData(gl.ARRAY_BUFFER, leftLeafVertices, gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.5, 0.0, 1.0);
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
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.5, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Desenha o centro da flor
  setupCircleBuffer(gl, program, 0.0, 0.0, 0.1);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.9, 0.0, 1.0); // Cor amarelo
  drawScene(gl, program, gl.TRIANGLE_FAN, 101);

  // Desenha as pétalas com gradiente de cor
  const numPetals = 16;
  const petalRadius = 0.15;
  const petalDistance = 0.2;

  for (let i = 0; i < numPetals; i++) {
    const angle = (i / numPetals) * 2 * Math.PI;
    const x = Math.cos(angle) * petalDistance;
    const y = Math.sin(angle) * petalDistance;
    setupCircleBuffer(gl, program, x, y, petalRadius);
    const colorVariation = (i % 2 === 0) ? 1.0 : 0.8;
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, colorVariation, 0.99, 1.0); // Cor rosa variando
    drawScene(gl, program, gl.TRIANGLE_FAN, 101);
  }

  // Adiciona uma borboleta
  // Asa esquerda
  const butterflyLeftWing = new Float32Array([
    -0.4, 0.4,
    -0.3, 0.5,
    -0.3, 0.3,
  ]);
  const butterflyLeftWingBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, butterflyLeftWingBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, butterflyLeftWing, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.9, 0.6, 0.0, 1.0); // Cor laranja
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Asa direita
  const butterflyRightWing = new Float32Array([
    -0.2, 0.4,
    -0.3, 0.5,
    -0.3, 0.3,
  ]);
  const butterflyRightWingBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, butterflyRightWingBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, butterflyRightWing, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.9, 0.6, 0.0, 1.0); // Cor laranja
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Corpo da borboleta
  setupRectangleBuffer(gl, program, -0.305, 0.3, -0.295, 0.5);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.2, 0.2, 0.2, 1.0); // Cor preta
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Desenha o sol
  setupCircleBuffer(gl, program, 0.7, 0.7, 0.2);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 1.0, 0.0, 1.0); // Cor amarela
  drawScene(gl, program, gl.TRIANGLE_FAN, 101);

  // Raios do sol
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 2 * Math.PI;
    const x1 = 0.7 + Math.cos(angle) * 0.2;
    const y1 = 0.7 + Math.sin(angle) * 0.2;
    const x2 = 0.7 + Math.cos(angle) * 0.3;
    const y2 = 0.7 + Math.sin(angle) * 0.3;

    const sunRayVertices = new Float32Array([
      x1, y1,
      x2, y2,
    ]);
    const sunRayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sunRayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sunRayVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 1.0, 0.0, 1.0);
    gl.drawArrays(gl.LINES, 0, 2);
  }
}

// Executa o código
main();
