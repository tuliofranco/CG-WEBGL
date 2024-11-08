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

  const vertices = new Float32Array(circleVertices);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  return vertices.length / 2;
}

// Prepara o canvas para a renderização
function prepareCanvas(gl, canvas) {
  gl.clearColor(0.9, 0.9, 1.0, 1.0); // Cor de fundo (céu claro)
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

// Desenha a cena
function drawScene(gl, program, shapeType, vertexCount) {
  gl.drawArrays(shapeType, 0, vertexCount);
}

// Função para desenhar rodas com rotação
function drawWheel(gl, program, centerX, centerY, outerRadius, innerRadius, wheelColor, rimColor, rotationAngle) {
  // Salva a matriz atual
  const savedMatrix = mat3.clone(modelMatrix);

  // Aplica a transformação para a roda
  mat3.translate(modelMatrix, modelMatrix, [centerX, centerY]);
  mat3.rotate(modelMatrix, modelMatrix, rotationAngle);
  mat3.translate(modelMatrix, modelMatrix, [-centerX, -centerY]);
  gl.uniformMatrix3fv(matrixLocation, false, modelMatrix);

  // Desenha a roda externa
  const vertexCountOuter = setupCircleBuffer(gl, program, centerX, centerY, outerRadius);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), ...wheelColor); // Cor da roda
  drawScene(gl, program, gl.TRIANGLE_FAN, vertexCountOuter);

  // Desenha a calota (rim)
  const vertexCountInner = setupCircleBuffer(gl, program, centerX, centerY, innerRadius);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), ...rimColor); // Cor da calota
  drawScene(gl, program, gl.TRIANGLE_FAN, vertexCountInner);

  // Restaura a matriz original
  mat3.copy(modelMatrix, savedMatrix);
  gl.uniformMatrix3fv(matrixLocation, false, modelMatrix);
}

// Função para desenhar faróis e lanternas
function drawLight(gl, program, x1, y1, x2, y2, color) {
  setupRectangleBuffer(gl, program, x1, y1, x2, y2);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), ...color);
  drawScene(gl, program, gl.TRIANGLES, 6);
}

// Função para desenhar janelas divididas
function drawWindow(gl, program, x1, y1, x2, y2, dividerColor) {
  // Desenha a janela principal
  setupRectangleBuffer(gl, program, x1, y1, x2, y2);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.7, 0.8, 1.0, 1.0); // Cor azul claro para a janela
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Desenha a linha divisória central da janela
  const dividerVertices = new Float32Array([
    (x1 + x2) / 2, y1,
    (x1 + x2) / 2, y2,
  ]);
  const dividerBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dividerBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, dividerVertices, gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), ...dividerColor); // Cor da linha divisória
  gl.drawArrays(gl.LINES, 0, 2);
}

// Função para desenhar o carro
function drawCar(gl, program) {
  // Desenha o corpo do carro (retângulo maior)
  setupRectangleBuffer(gl, program, -0.5, -0.1, 0.5, 0.2);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 1.0, 1.0); // Cor azul
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Desenha o teto do carro (retângulo menor)
  setupRectangleBuffer(gl, program, -0.3, 0.2, 0.3, 0.4);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 1.0, 1.0); // Cor azul
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Adiciona as janelas com divisórias
  drawWindow(gl, program, -0.26, 0.3, -0.04, 0.382, [0.0, 0.0, 0.0, 1.0]); // Janela traseira
  drawWindow(gl, program, 0.04, 0.3, 0.26, 0.382, [0.0, 0.0, 0.0, 1.0]); // Janela dianteira

  // Torna o carro uma caminhonete adicionando uma cabine
  setupRectangleBuffer(gl, program, -0.3, 0.4, 0.3, 0.5);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 1.0, 1.0); // Cor azul
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Desenha as rodas com rotação
  drawWheel(gl, program, -0.3, -0.05, 0.09, 0.04, [0, 0, 0, 1], [0.8, 0.8, 0.8, 1], wheelRotation);
  drawWheel(gl, program, 0.3, -0.05, 0.09, 0.04, [0, 0, 0, 1], [0.8, 0.8, 0.8, 1], wheelRotation);

  // Adiciona faróis na frente
  drawLight(gl, program, -0.40, 0.02, -0.45, 0.07, [1.0, 1.0, 0.0, 1.0]);
  drawLight(gl, program, 0.40, 0.02, 0.45, 0.07, [1.0, 1.0, 0.0, 1.0]);

  // Adiciona lanternas na traseira
  drawLight(gl, program, -0.40, 0.14, -0.45, 0.09, [1.0, 0.0, 0.0, 1.0]);
  drawLight(gl, program, 0.40, 0.14, 0.45, 0.09, [1.0, 0.0, 0.0, 1.0]);

  // Adiciona portas com linhas de divisão
  const doorVertices = new Float32Array([
    -0.2, -0.1,
    -0.2, 0.2,
    0.2, 0.2,
    -0.2, -0.1,
    0.2, 0.2,
    0.2, -0.1,
  ]);
  const doorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, doorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, doorVertices, gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.9, 1.0); // Mesma cor do corpo
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Adiciona linhas de divisão nas portas
  const dividerVertices = new Float32Array([
    0.0, -0.1,
    0.0, 0.2,
  ]);
  const dividerBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dividerBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, dividerVertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 1.0, 1.0, 1.0); // Cor branca para a linha
  gl.drawArrays(gl.LINES, 0, 2);
}

// Função para desenhar objetos de fundo (cenário)
function drawBackground(gl, program) {
  backgroundObjects.forEach(obj => {
    // Salva a matriz atual
    const savedMatrix = mat3.clone(modelMatrix);

    // Matriz de transformação para o objeto
    mat3.translate(modelMatrix, modelMatrix, [obj.x, obj.y]);
    gl.uniformMatrix3fv(matrixLocation, false, modelMatrix);

    // Desenha o objeto (retângulo)
    setupRectangleBuffer(gl, program, -obj.width / 2, 0, obj.width / 2, obj.height);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), ...obj.color);
    drawScene(gl, program, gl.TRIANGLES, 6);

    // Restaura a matriz original
    mat3.copy(modelMatrix, savedMatrix);
    gl.uniformMatrix3fv(matrixLocation, false, modelMatrix);
  });
}

// Variáveis globais para animação
let carPosition = 0; // Posição inicial do carro
let wheelRotation = 0;
let oscillationAngle = 0;
let backgroundObjects = [
  { x: 1.5, y: -0.1, width: 0.2, height: 0.5, speed: 0.005, color: [0.6, 0.4, 0.2, 1.0] },
  { x: 2.0, y: -0.1, width: 0.15, height: 0.4, speed: 0.007, color: [0.5, 0.3, 0.1, 1.0] },
  // Adicione mais objetos conforme necessário
];

// Matrizes de transformação
let modelMatrix = mat3.create();
let matrixLocation;

// Variáveis para controle do teclado
let keysPressed = {};

// Função principal que executa todas as etapas
function main() {
  const { canvas, gl } = initializeWebGL();

  // Código GLSL dos shaders
  const vertexShaderGLSL = `
    attribute vec2 position;
    uniform mat3 u_matrix;
    void main() {
      vec3 pos = vec3(position, 1.0);
      gl_Position = vec4(u_matrix * pos, 1.0);
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

  // Obter a localização do uniform u_matrix
  matrixLocation = gl.getUniformLocation(program, 'u_matrix');

  // Adicionar event listeners para o teclado
  window.addEventListener('keydown', function(event) {
    keysPressed[event.key] = true;
  });

  window.addEventListener('keyup', function(event) {
    keysPressed[event.key] = false;
  });

  // Iniciar a animação
  function animate() {
    // Atualiza a posição do carro com base nas teclas pressionadas
    if (keysPressed['ArrowLeft'] || keysPressed['a']) {
      carPosition -= 0.02; // Move para a esquerda
    }
    if (keysPressed['ArrowRight'] || keysPressed['d']) {
      carPosition += 0.02; // Move para a direita
    }

    // Limita a posição do carro dentro dos limites da tela
    if (carPosition < -1.5) {
      carPosition = -1.5;
    }
    if (carPosition > 1.5) {
      carPosition = 1.5;
    }

    // Atualiza o ângulo de rotação das rodas
    if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['ArrowRight'] || keysPressed['d']) {
      wheelRotation -= 0.1; // Roda gira se o carro estiver se movendo
    }

    // Atualiza o ângulo de oscilação
    oscillationAngle += 0.05;

    // Calcula a posição Y usando uma função seno
    const oscillationY = Math.sin(oscillationAngle) * 0.02; // Amplitude menor para a oscilação

    // Atualiza as posições dos objetos de fundo
    backgroundObjects.forEach(obj => {
      obj.x -= obj.speed;
      if (obj.x < -1.5) {
        obj.x = 1.5; // Reinicia a posição do objeto
      }
    });

    // Prepara o canvas
    prepareCanvas(gl, canvas);

    // Usa o programa shader
    gl.useProgram(program);

    // Desenha o cenário
    modelMatrix = mat3.create(); // Reseta a matriz
    drawBackground(gl, program);

    // Matriz de translação para o carro com oscilação
    modelMatrix = mat3.create();
    mat3.translate(modelMatrix, modelMatrix, [carPosition, oscillationY]);
    gl.uniformMatrix3fv(matrixLocation, false, modelMatrix);

    // Desenha o carro
    drawCar(gl, program);

    // Chama o próximo frame
    requestAnimationFrame(animate);
  }

  // Inicia o loop de animação
  requestAnimationFrame(animate);
}

// Executa o código
main();