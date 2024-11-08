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

// Configura os buffers e atributos para uma elipse
function setupEllipseBuffer(gl, program, centerX, centerY, radiusX, radiusY) {
  const numSegments = 100;
  const ellipseVertices = [];

  // Adiciona o centro da elipse
  ellipseVertices.push(centerX, centerY);

  // Gera os vértices da elipse
  for (let i = 0; i <= numSegments; i++) {
      const angle = (i / numSegments) * 2.0 * Math.PI;
      const x = centerX + Math.cos(angle) * radiusX;
      const y = centerY + Math.sin(angle) * radiusY;
      ellipseVertices.push(x, y);
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ellipseVertices), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

// Configura os buffers e atributos para um arco
function setupArcBuffer(gl, program, centerX, centerY, radius, startAngle, endAngle, numSegments = 100) {
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

  // Variáveis de animação
  let startTime = null;
  let isSmiling = false;
  let smileStartTime = null;
  const smileDuration = 2000; // Duração do sorriso em milissegundos

  // Adiciona o evento de teclado
  document.addEventListener('keydown', (event) => {
    if (event.key === 's' || event.key === 'S') {
      isSmiling = true;
      smileStartTime = performance.now();
    }
  });

  function render(time) {
    if (!startTime) startTime = time;
    const elapsedTime = time - startTime;

    // Prepara o canvas
    prepareCanvas(gl, canvas);

    // Cálculo para a animação dos olhos (piscar)
    const blinkSpeed = 2.0;
    const eyeScale = Math.abs(Math.sin(elapsedTime * 0.002 * blinkSpeed));
    const minEyeScale = 0.2;
    const scaledEyeHeight = minEyeScale + eyeScale * (1 - minEyeScale);

    // Cálculo para a animação do sorriso
    let smileAngle = Math.PI; // Ângulo inicial (sorriso padrão)
    if (isSmiling) {
      const smileElapsed = time - smileStartTime;
      const progress = Math.min(smileElapsed / smileDuration, 1);
      // Animação de abrir o sorriso
      smileAngle = Math.PI + progress * (Math.PI / 2); // Abre até 90 graus adicionais

      if (progress >= 1) {
        isSmiling = false; // Reseta a animação após completar
      }
    }

    // Desenho do palhaço (mesmo código anterior, com algumas alterações)
    // Parte de fora da orelha direita
    setupEllipseBuffer(gl, program, 0.43, 0.0, 0.15, 0.15);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Preto
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);
    // Parte de dentro da orelha direita
    setupEllipseBuffer(gl, program, 0.43, 0.0, 0.148, 0.148);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.88, 0.74, 1.0); // Pele
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);
    // Parte de fora da orelha esquerda
    setupEllipseBuffer(gl, program, -0.43, 0.0, 0.15, 0.15);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Preto
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);
    // Parte de dentro da orelha esquerda
    setupEllipseBuffer(gl, program, -0.43, 0.0, 0.148, 0.148);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.88, 0.74, 1.0); // Pele
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Contorno da cabeça
    setupEllipseBuffer(gl, program, 0.0, 0.0, 0.50, 0.50);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Preto
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Cabeça
    setupEllipseBuffer(gl, program, 0.0, 0.0, 0.498, 0.498);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.88, 0.74, 1.0); // Pele
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Cabelo esquerdo
    setupEllipseBuffer(gl, program, -0.5, 0.2, 0.3, 0.3);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.0, 0.0, 1.0); // Vermelho
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Cabelo direito
    setupEllipseBuffer(gl, program, 0.5, 0.2, 0.3, 0.3);
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
    setupEllipseBuffer(gl, program, 0.19, 0.18, 0.099, 0.099 * scaledEyeHeight);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 1.0, 1.0, 1.0); // Branco
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Olho direito (íris)
    setupEllipseBuffer(gl, program, 0.19, 0.18, 0.04, 0.04 * scaledEyeHeight);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.2, 0.9, 0.2, 1.0); // Verde
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Pupila direita
    setupEllipseBuffer(gl, program, 0.19, 0.18, 0.02, 0.02 * scaledEyeHeight);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Preto
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Olho esquerdo (esclera)
    setupEllipseBuffer(gl, program, -0.19, 0.18, 0.099, 0.099 * scaledEyeHeight);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 1.0, 1.0, 1.0); // Branco
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Olho esquerdo (íris)
    setupEllipseBuffer(gl, program, -0.19, 0.18, 0.04, 0.04 * scaledEyeHeight);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.2, 0.9, 0.2, 1.0); // Verde
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Pupila esquerda
    setupEllipseBuffer(gl, program, -0.19, 0.18, 0.02, 0.02 * scaledEyeHeight);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 0.0, 0.0, 0.0, 1.0); // Preto
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Nariz
    setupEllipseBuffer(gl, program, 0.0, 0.0, 0.08, 0.08);
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
    setupArcBuffer(gl, program, 0.0, -0.1, 0.3, smileAngle, 2 * Math.PI - smileAngle + Math.PI, 100);
    gl.uniform4f(gl.getUniformLocation(program, 'color'), 1.0, 0.0, 0.0, 1.0); // Vermelho
    drawScene(gl, program, gl.TRIANGLE_FAN, 102);

    // Solicita o próximo frame
    requestAnimationFrame(render);
  }

  // Inicia a renderização
  requestAnimationFrame(render);
}

// Executa o código
main();