function main() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

    if (!gl) {
        throw new Error('WebGL not supported');
    }

    var vertexShaderSource = document.querySelector("#vertex-shader").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader").text;

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);

    const positionBuffer = gl.createBuffer();

    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();

    const colorLocation = gl.getAttribLocation(program, `color`);
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    const matrixUniformLocation = gl.getUniformLocation(program, `matrix`);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    let vertexData = setCubeVertices();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    let colorData = setCubeColors();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    let theta = 0;

    function drawCube() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Primeira ViewPort: Câmera rotacionando ao redor do cubo
        gl.viewport(0, canvas.height / 2, canvas.width / 2, canvas.height / 2);
        theta += 1; // Incrementa o ângulo de rotação

        // Calcula a posição da câmera (P0) em função de theta
        let P0 = [
            3.0 * Math.cos(degToRad(theta)), // X
            1.5,                            // Y (altura constante)
            3.0 * Math.sin(degToRad(theta)) // Z
        ];
        let P_ref = [0.0, 0.0, 0.0]; // Centro do cubo
        let V = [0.0, 1.0, 0.0];     // Vetor "up"

        let viewingMatrix = set3dViewingMatrix(P0, P_ref, V);

        let xw_min = -2.0;
        let xw_max = 2.0;
        let yw_min = -2.0;
        let yw_max = 2.0;
        let z_near = 0.1;
        let z_far = 10.0;

        let ortographicMatrix = ortographicProjection(xw_min, xw_max, yw_min, yw_max, z_near, z_far);

        let matrix = m4.identity();
        matrix = m4.multiply(matrix, ortographicMatrix);
        matrix = m4.multiply(matrix, viewingMatrix);

        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

        // Segunda ViewPort
        gl.viewport(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2);
        P0 = [1.0, 1.0, 1.0];
        viewingMatrix = set3dViewingMatrix(P0, P_ref, V);
        matrix = m4.multiply(m4.identity(), ortographicMatrix);
        matrix = m4.multiply(matrix, viewingMatrix);

        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

        // Terceira ViewPort
        gl.viewport(0, 0, canvas.width / 2, canvas.height / 2);
        P0 = [1.0, 1.0, 1.0];
        viewingMatrix = set3dViewingMatrix(P0, P_ref, V);
        matrix = m4.multiply(m4.identity(), ortographicMatrix);
        matrix = m4.multiply(matrix, viewingMatrix);

        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

        // Quarta ViewPort
        gl.viewport(canvas.width / 2, 0, canvas.width / 2, canvas.height / 2);
        P0 = [1.0, 1.0, 1.0];
        viewingMatrix = set3dViewingMatrix(P0, P_ref, V);
        matrix = m4.multiply(m4.identity(), ortographicMatrix);
        matrix = m4.multiply(matrix, viewingMatrix);

        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

        // Solicita a próxima renderização
        requestAnimationFrame(drawCube);
    }

    // Inicializa o loop de renderização
    drawCube();
}
