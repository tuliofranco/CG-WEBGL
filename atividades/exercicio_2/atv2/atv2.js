// Função para inicializar o WebGL e configurar o canvas
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

// Função para compilar um shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('Erro ao compilar o shader: ' + gl.getShaderInfoLog(shader));
  }

  return shader;
}

// Função para criar e vincular um programa shader
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

// Cores associadas às teclas de 0 a 9
const colors = [
  [1.0, 0.0, 0.0, 1.0], // Vermelho
  [0.0, 1.0, 0.0, 1.0], // Verde
  [0.0, 0.0, 1.0, 1.0], // Azul
  [1.0, 1.0, 0.0, 1.0], // Amarelo
  [1.0, 0.0, 1.0, 1.0], // Magenta
  [0.0, 1.0, 1.0, 1.0], // Ciano
  [1.0, 0.5, 0.0, 1.0], // Laranja
  [0.5, 0.0, 1.0, 1.0], // Roxo
  [0.5, 0.5, 0.5, 1.0], // Cinza
  [0.0, 0.0, 0.0, 1.0], // Preto
];
let currentColor = colors[2]; // Azul como cor inicial

// Função para configurar o buffer de vértices
function setupLineBuffer(gl, program, vertices) {
  // Converte as coordenadas para o sistema WebGL (-1 a 1)
  const positions = [];
  vertices.forEach(([x, y]) => {
      positions.push((x / gl.canvas.width) * 2 - 1);
      positions.push((y / gl.canvas.height) * -2 + 1);
  });

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

// Função para o algoritmo de Bresenham
function bresenham(x0, y0, x1, y1) {
  const pixels = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  while (true) {
      pixels.push([x0, y0]);

      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) {
          err -= dy;
          x0 += sx;
      }
      if (e2 < dx) {
          err += dx;
          y0 += sy;
      }
  }
  return pixels;
}

// Função para limpar e preparar o canvas para renderização
function prepareCanvas(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

// Função para desenhar a linha
function drawLine(gl, program, pointCount) {
  gl.uniform4fv(gl.getUniformLocation(program, 'color'), currentColor);
  gl.drawArrays(gl.LINE_STRIP, 0, pointCount);
}

// Função para desenhar o triângulo
function drawTriangle(gl, program, pointCounts) {
  gl.uniform4fv(gl.getUniformLocation(program, 'color'), currentColor);
  let offset = 0;
  pointCounts.forEach(count => {
      gl.drawArrays(gl.LINE_STRIP, offset, count);
      offset += count;
  });
}

// Função principal
function main() {
  const { canvas, gl } = initializeWebGL();

  // Código GLSL para os shaders
  const vertexShaderSource = `
      attribute vec2 position;
      void main() {
          gl_PointSize = 5.0; // Aumenta o tamanho dos pontos
          gl_Position = vec4(position, 0.0, 1.0);
      }
  `;

  const fragmentShaderSource = `
      precision mediump float;
      uniform vec4 color;
      void main() {
          gl_FragColor = color;
      }
  `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  // Variáveis de controle
  let xStart = 0;
  let yStart = 0;
  let xEnd = 0;
  let yEnd = 0;
  let isStartSet = false;

  let trianglePoints = [];
  let currentMode = 'line'; // 'line' ou 'triangle'

  // Variáveis para armazenar a última figura desenhada
  let lastVertices = [];
  let lastPointCounts = [];
  let lastDrawFunction = null; // 'drawLine' ou 'drawTriangle'

  // Desenha a linha inicial de (0,0) a (0,0)
  prepareCanvas(gl);
  let initialVertices = bresenham(0, 0, 0, 0);
  setupLineBuffer(gl, program, initialVertices);
  drawLine(gl, program, initialVertices.length);

  // Armazena a figura inicial
  lastVertices = initialVertices;
  lastPointCounts = [initialVertices.length];
  lastDrawFunction = 'drawLine';

  // Evento de clique do mouse para definir os pontos
  canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (currentMode === 'line') {
          if (!isStartSet) {
              xStart = x;
              yStart = y;
              isStartSet = true;
          } else {
              xEnd = x;
              yEnd = y;
              isStartSet = false;

              const vertices = bresenham(Math.round(xStart), Math.round(yStart), Math.round(xEnd), Math.round(yEnd));
              setupLineBuffer(gl, program, vertices);
              prepareCanvas(gl);
              drawLine(gl, program, vertices.length);

              // Armazena a última figura
              lastVertices = vertices;
              lastPointCounts = [vertices.length];
              lastDrawFunction = 'drawLine';
          }
      } else if (currentMode === 'triangle') {
          trianglePoints.push([x, y]);

          if (trianglePoints.length === 3) {
              // Desenha o triângulo após coletar três pontos
              const line1 = bresenham(Math.round(trianglePoints[0][0]), Math.round(trianglePoints[0][1]), Math.round(trianglePoints[1][0]), Math.round(trianglePoints[1][1]));
              const line2 = bresenham(Math.round(trianglePoints[1][0]), Math.round(trianglePoints[1][1]), Math.round(trianglePoints[2][0]), Math.round(trianglePoints[2][1]));
              const line3 = bresenham(Math.round(trianglePoints[2][0]), Math.round(trianglePoints[2][1]), Math.round(trianglePoints[0][0]), Math.round(trianglePoints[0][1]));

              const allVertices = line1.concat(line2, line3);
              const pointCounts = [line1.length, line2.length, line3.length];

              setupLineBuffer(gl, program, allVertices);
              prepareCanvas(gl);
              drawTriangle(gl, program, pointCounts);

              // Armazena a última figura
              lastVertices = allVertices;
              lastPointCounts = pointCounts;
              lastDrawFunction = 'drawTriangle';

              trianglePoints = [];
          }
      }
  });

  document.addEventListener('keydown', (event) => {
      const key = event.key;
      if (key >= '0' && key <= '9') {
          currentColor = colors[parseInt(key)];
          // Redesenha a figura atual com a nova cor
          if (lastVertices.length > 0) {
              setupLineBuffer(gl, program, lastVertices);
              prepareCanvas(gl);
              if (lastDrawFunction === 'drawLine') {
                  drawLine(gl, program, lastPointCounts[0]);
              } else if (lastDrawFunction === 'drawTriangle') {
                  drawTriangle(gl, program, lastPointCounts);
              }
          }
      } else if (key === 'r' || key === 'R') {
          currentMode = 'line';
          isStartSet = false;
          trianglePoints = [];
      } else if (key === 't' || key === 'T') {
          currentMode = 'triangle';
          trianglePoints = [];
          isStartSet = false;
      }
  });
}


main();
