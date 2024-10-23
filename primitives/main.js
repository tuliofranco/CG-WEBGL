function main(){
  const canvas = document.querySelector("#c");
  const gl = canvas.getContext('webgl');

  if (!gl) {
      throw new Error('WebGL not supported');
  }

  var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();

  const positionLocation = gl.getAttribLocation(program, `position`);
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const colorLocation = gl.getAttribLocation(program, `color`);
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  canvas.addEventListener("mousedown",mouseDown,false);

  function mouseDown(event){
      console.log(event.screenX);
      console.log(event.screenY);
  }

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Desenhando apenas pontos
  drawPoints(gl,-0.75,-0.75,0.5,0.5,positionBuffer,colorBuffer);
  
  //Desenhando linhas a cada dois pontos
  drawLines(gl,0.25,0.25,0.5,0.5,positionBuffer,colorBuffer);

  //Desenhando um loop de linhas
  drawLineLoop(gl,0.25,-0.75,0.5,0.5,positionBuffer,colorBuffer);

  //Desenhando dois triângulos para formar o quadrado
  draw2Triangles(gl,-0.75,0.25,0.5,0.5,positionBuffer,colorBuffer);
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
      return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function drawPoints(gl,x1,y1,width,height,positionBuffer,colorBuffer){
  let x2 = x1 + width;
  let y2 = y1 + height;
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x2, y2,
      x1, y2,
      ]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  let colorData = [];
  let color = [Math.random(),Math.random(),Math.random()];
  for (let i = 0; i < 4; i++) {
      colorData.push(...color);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, 4);
}

function drawLines(gl,x1,y1,width,height,positionBuffer,colorBuffer){
  let x2 = x1 + width;
  let y2 = y1 + height;
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      y2, y1,
      x2, y1,
      x2, y2,
      x2, y2,
      x1, y2,
      x1, y2,
      x1, y1,
      ]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  let colorData = [];
  let color = [Math.random(),Math.random(),Math.random()];
  for (let i = 0; i < 8; i++) {
      colorData.push(...color);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
  gl.drawArrays(gl.LINES, 0, 8);
}

function drawLineLoop(gl,x1,y1,width,height,positionBuffer,colorBuffer){
  let x2 = x1 + width;
  let y2 = y1 + height;
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x2, y2,
      x1, y2,
      ]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  let colorData = [];
  let color = [Math.random(),Math.random(),Math.random()];
  for (let i = 0; i < 4; i++) {
      colorData.push(...color);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
  gl.drawArrays(gl.LINE_LOOP, 0, 4);
}

function draw2Triangles(gl,x1,y1,width,height,positionBuffer,colorBuffer){
  let x2 = x1 + width;
  let y2 = y1 + height;
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
   ]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  let colorData = [];
  let color = [Math.random(),Math.random(),Math.random()];
  for (let i = 0; i < 8; i++) {
      colorData.push(...color);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

main();