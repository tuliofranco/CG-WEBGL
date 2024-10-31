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

// Função para configurar o buffer de vértices de uma linha
function setupLineBuffer(gl, program, x0, y0, x1, y1) {
  const vertices = bresenham(x0, y0, x1, y1);

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

// Função para o algoritmo de Bresenham para calcular pontos entre dois pontos dados
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
  gl.drawArrays(gl.LINE_STRIP, 0, pointCount); // Desenha a linha conectando os pontos
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

  // Posições iniciais da linha
  let xStart = 0;
  let yStart = 0;
  let xEnd = 0;
  let yEnd = 0;
  let isStartSet = false;

  // Evento de clique do mouse para definir os pontos da linha
  canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (!isStartSet) {
          xStart = x;
          yStart = y;
          isStartSet = true;
      } else {
          xEnd = x;
          yEnd = y;
          isStartSet = false;

          const vertices = bresenham(xStart, yStart, xEnd, yEnd);
          setupLineBuffer(gl, program, xStart, yStart, xEnd, yEnd);
          prepareCanvas(gl);
          drawLine(gl, program, vertices.length);
      }
  });

  // Evento de teclado para mudar a cor da linha
  document.addEventListener('keydown', (event) => {
      const key = event.key;
      if (key >= '0' && key <= '9') {
          currentColor = colors[parseInt(key)];
          const vertices = bresenham(xStart, yStart, xEnd, yEnd);
          drawLine(gl, program, vertices.length);
      }
  });

  prepareCanvas(gl);
  setupLineBuffer(gl, program, 0, 0, 0, 0); // Linha inicial de (0,0) a (0,0)
  drawLine(gl, program, 1);
}

// Executa o programa principal
main();
