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

  // Adiciona o centro do círculo
  circleVertices.push(centerX, centerY);

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

// Configura os buffers e atributos para um arco
function setupArcBuffer(gl, program, centerX, centerY, radius, startAngle, endAngle) {
  const numSegments = 100;
  const arcVertices = [];

  // Adiciona o centro do arco
  arcVertices.push(centerX, centerY);

  // Gera os vértices do arco
  for (let i = 0; i <= numSegments; i++) {
      const angle = startAngle + (i / numSegments) * (endAngle - startAngle);
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      arcVertices.push(x, y);
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arcVertices), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

// Configura os buffers e atributos para um triângulo
function setupTriangleBuffer(gl, program, vertices) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

// Prepara o canvas para a renderização
function prepareCanvas(gl, canvas) {
  gl.clearColor(1.0, 1.0, 1.0, 1.0); // Fundo branco
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

// Desenha a cena
function drawScene(gl, program, shapeType, vertexCount) {
  gl.useProgram(program);
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

  // Parte de fora da orelha direita
  setupCircleBuffer(gl, program, 0.43, 0.0, 0.15);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Cor preta
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);
  // Parte de dentro da orelha direita
  setupCircleBuffer(gl, program, 0.43, 0.0, 0.148);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.88, 0.74, 1.0); // Cor de pele
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);
  // Parte de fora da orelha esquerda
  setupCircleBuffer(gl, program, -0.43, 0.0, 0.15);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Cor preta
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);
  // Parte de dentro da orelha esquerda
  setupCircleBuffer(gl, program, -0.43, 0.0, 0.148);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.88, 0.74, 1.0); // Cor de pele
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Contorno da cabeça
  setupCircleBuffer(gl, program, 0.0, 0.0, 0.50);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Cor preta
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Cabeça
  setupCircleBuffer(gl, program, 0.0, 0.0, 0.498);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.88, 0.74, 1.0); // Cor de pele
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Cabelo esquerdo
  setupCircleBuffer(gl, program, -0.5, 0.2, 0.3);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.0, 0.0, 1.0); // Vermelho
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Cabelo direito
  setupCircleBuffer(gl, program, 0.5, 0.2, 0.3);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.0, 0.0, 1.0); // Vermelho
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Chapéu
  const hatVertices = [
    0.0, 0.6,   // Ponta do chapéu
    -0.3, 0.2,  // Canto esquerdo
    0.3, 0.2,   // Canto direito
  ];
  setupTriangleBuffer(gl, program, hatVertices);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 1.0, 1.0); // Azul
  drawScene(gl, program, gl.TRIANGLES, 3);

  // Olho direito (esclera)
  setupCircleBuffer(gl, program, 0.19, 0.18, 0.099);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 1.0, 1.0, 1.0); // Branco
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Olho direito (íris)
  setupCircleBuffer(gl, program, 0.19, 0.18, 0.04);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.2, 0.9, 0.2, 1.0); // Verde
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Pupila direita
  setupCircleBuffer(gl, program, 0.19, 0.18, 0.02);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Preto
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Olho esquerdo (esclera)
  setupCircleBuffer(gl, program, -0.19, 0.18, 0.099);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 1.0, 1.0, 1.0); // Branco
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Olho esquerdo (íris)
  setupCircleBuffer(gl, program, -0.19, 0.18, 0.04);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.2, 0.9, 0.2, 1.0); // Verde
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Pupila esquerda
  setupCircleBuffer(gl, program, -0.19, 0.18, 0.02);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Preto
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Nariz
  setupCircleBuffer(gl, program, 0.0, 0.0, 0.08);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.0, 0.0, 1.0); // Vermelho
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Sobrancelha esquerda
  setupRectangleBuffer(gl, program, -0.28, 0.35, -0.1, 0.3);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Preto
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Sobrancelha direita
  setupRectangleBuffer(gl, program, 0.1, 0.35, 0.28, 0.3);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Preto
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Sorriso
  setupArcBuffer(gl, program, 0.0, -0.1, 0.3, Math.PI, 2 * Math.PI);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.0, 0.0, 1.0); // Vermelho
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);
}

// Executa o código
main();
