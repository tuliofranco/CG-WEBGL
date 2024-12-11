// Definir os limites do retângulo de recorte
const xmin = 10, ymin = 10, xmax = 100, ymax = 100;

// Função para calcular o código da região
function computeCode(x, y) {
    let code = 0;
    if (x < xmin) code |= 1; // à esquerda do retângulo
    if (x > xmax) code |= 2; // à direita do retângulo
    if (y < ymin) code |= 4; // abaixo do retângulo
    if (y > ymax) code |= 8; // acima do retângulo
    return code;
}

// Algoritmo principal
function cohenSutherlandClip(x1, y1, x2, y2) {
    let code1 = computeCode(x1, y1);
    let code2 = computeCode(x2, y2);
    let accept = false;

    while (true) {
        if ((code1 | code2) === 0) {
            // Ambos os pontos estão dentro do retângulo
            accept = true;
            break;
        } else if ((code1 & code2) !== 0) {
            // Ambos os pontos estão fora do retângulo, em uma mesma região externa
            break;
        } else {
            // Pelo menos um dos pontos está fora do retângulo
            let codeOut = code1 !== 0 ? code1 : code2;

            let x, y;

            // Encontrar o ponto de interseção com as bordas do retângulo
            if (codeOut & 8) { // Acima do retângulo
                x = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1);
                y = ymax;
            } else if (codeOut & 4) { // Abaixo do retângulo
                x = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1);
                y = ymin;
            } else if (codeOut & 2) { // À direita do retângulo
                y = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1);
                x = xmax;
            } else if (codeOut & 1) { // À esquerda do retângulo
                y = y1 + (y2 - y1) * (xmin - x1) / (x2 - x1);
                x = xmin;
            }

            // Substituir o ponto externo pelo ponto de interseção
            if (codeOut === code1) {
                x1 = x;
                y1 = y;
                code1 = computeCode(x1, y1);
            } else {
                x2 = x;
                y2 = y;
                code2 = computeCode(x2, y2);
            }
        }
    }

    if (accept) {
        console.log(`Linha visível entre (${x1}, ${y1}) e (${x2}, ${y2})`);
    } else {
        console.log("Linha está completamente fora do retângulo");
    }
}

// Testando o algoritmo
cohenSutherlandClip(5, 5, 120, 120);  // Exemplo de linha para teste
cohenSutherlandClip(15, 15, 80, 80); // Exemplo de linha dentro do retângulo
