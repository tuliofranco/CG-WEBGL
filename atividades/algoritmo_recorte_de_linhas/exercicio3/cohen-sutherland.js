// Inicializa o WebGL
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

// Função para transformar coordenadas do mundo para a viewport
function transformToViewport(xw, yw, xwmin, ywmin, xwmax, ywmax, xvmin, yvmin, xvmax, yvmax) {
    const xv = xvmin + ((xw - xwmin) * (xvmax - xvmin)) / (xwmax - xwmin);
    const yv = yvmin + ((yw - ywmin) * (yvmax - yvmin)) / (ywmax - ywmin);
    return { xv, yv };
}

// Desenha um triângulo no WebGL
function drawTriangle(gl, vertices, color) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const vertexShaderCode = `
        attribute vec2 coordinates;
        void main(void) {
            gl_Position = vec4(coordinates, 0.0, 1.0);
        }
    `;

    const fragmentShaderCode = `
        precision mediump float;
        uniform vec4 uColor;
        void main(void) {
            gl_FragColor = uColor;
        }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderCode);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    const coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    const colorLocation = gl.getUniformLocation(shaderProgram, "uColor");
    gl.uniform4fv(colorLocation, color);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
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

// Execução principal
const { canvas, gl } = initializeWebGL();

// Limites da janela do mundo e viewport
const xwmin = 0, ywmin = 0, xwmax = 1000, ywmax = 60;
const xvmin = -1, yvmin = -1, xvmax = 1, yvmax = 1;

// Pontos do triângulo no mundo
const worldPoints = [
    { x: 10, y: 10 },
    { x: 20, y: 50 },
    { x: 30, y: 10 }
];

// Transforma para a viewport
const viewportPoints = worldPoints.map(point =>
    transformToViewport(point.x, point.y, xwmin, ywmin, xwmax, ywmax, xvmin, yvmin, xvmax, yvmax)
);

// Extrai as coordenadas transformadas
const vertices = [
    viewportPoints[0].xv, viewportPoints[0].yv,
    viewportPoints[1].xv, viewportPoints[1].yv,
    viewportPoints[2].xv, viewportPoints[2].yv
];

// Desenha o triângulo na viewport
drawTriangle(gl, vertices, [0.0, 0.0, 1.0, 1.0]);
