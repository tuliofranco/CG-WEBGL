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

// Prepara o canvas para a renderização
function prepareCanvas(gl, canvas) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

// Desenha a cena
function drawScene(gl, program, shapeType, vertexCount) {
  gl.drawArrays(shapeType, 0, vertexCount);
}

// Função para desenhar rodas com detalhes
function drawWheel(gl, program, centerX, centerY, outerRadius, innerRadius, wheelColor, rimColor) {
  // Desenha a roda externa
  setupCircleBuffer(gl, program, centerX, centerY, outerRadius);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), ...wheelColor); // Cor da roda
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);

  // Desenha a calota (rim)
  setupCircleBuffer(gl, program, centerX, centerY, innerRadius);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), ...rimColor); // Cor da calota
  drawScene(gl, program, gl.TRIANGLE_FAN, 102);
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

  // Desenha o corpo do carro (retângulo maior)
  setupRectangleBuffer(gl, program, -0.5, -0.1, 0.5, 0.2);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 1.0, 1.0); // Cor azul
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Desenha o teto do carro (retângulo menor)
  setupRectangleBuffer(gl, program, -0.3, 0.2, 0.3, 0.4);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 1.0, 1.0); // Cor azul
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Adiciona as janelas com divisórias
  drawWindow(gl, program, -0.26, 0.3, -0.04, 0.382, [0.0, 0.0, 0.0, 1.0]); // Janela traseira com divisória preta
  drawWindow(gl, program, 0.04, 0.3, 0.26, 0.382, [0.0, 0.0, 0.0, 1.0]); // Janela dianteira com divisória preta

  // Torna o carro uma caminhonete adicionando uma cabine
  setupRectangleBuffer(gl, program, -0.3, 0.4, 0.3, 0.5);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 1.0, 1.0); // Cor azul para a cabine
  drawScene(gl, program, gl.TRIANGLES, 6);

  // Desenha as rodas da frente e traseiras com calotas detalhadas
  // Roda da frente
  drawWheel(gl, program, -0.3, -0.05, 0.09, 0.04, [0.0, 0.0, 0.0, 1.0], [0.8, 0.8, 0.8, 1.0]); // Preta e cinza
  // Roda traseira
  drawWheel(gl, program, 0.3, -0.05, 0.09, 0.04, [0.0, 0.0, 0.0, 1.0], [0.8, 0.8, 0.8, 1.0]); // Preta e cinza

  // Adiciona faróis na frente
  drawLight(gl, program, -0.40, 0.02, -0.45, 0.07, [1.0, 1.0, 0.0, 1.0]); // Farol esquerdo amarelo
  drawLight(gl, program, 0.40, 0.02, 0.45, 0.07, [1.0, 1.0, 0.0, 1.0]); // Farol direito amarelo

  // Adiciona lanternas na traseira
  drawLight(gl, program, -0.40, 0.14, -0.45, 0.09, [1.0, 0.0, 0.0, 1.0]); // Lanterna esquerda vermelha
  drawLight(gl, program, 0.40, 0.14, 0.45, 0.09, [1.0, 0.0, 0.0, 1.0]); // Lanterna direita vermelha

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
  gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 1.0, 1.0, 1.0); // Cor cinza para a linha
  gl.drawArrays(gl.LINES, 0, 2);
}

// Executa o código
main();
