# Definição das regiões
INSIDE = 0  # 0000
LEFT = 1    # 0001
RIGHT = 2   # 0010
BOTTOM = 4  # 0100
TOP = 8     # 1000

# Função para calcular o código de região
def compute_region_code(x, y, x_min, y_min, x_max, y_max):
    code = INSIDE
    if x < x_min:  # Esquerda
        code |= LEFT
    elif x > x_max:  # Direita
        code |= RIGHT
    if y < y_min:  # Abaixo
        code |= BOTTOM
    elif y > y_max:  # Acima
        code |= TOP
    return code

# Algoritmo de Cohen-Sutherland
def cohen_sutherland_clip(x1, y1, x2, y2, x_min, y_min, x_max, y_max):
    code1 = compute_region_code(x1, y1, x_min, y_min, x_max, y_max)
    code2 = compute_region_code(x2, y2, x_min, y_min, x_max, y_max)
    accept = False

    while True:
        # Caso trivial de aceitação
        if code1 == 0 and code2 == 0:
            accept = True
            break
        # Caso trivial de rejeição
        elif code1 & code2 != 0:
            break
        # Caso intermediário (recorte)
        else:
            # Seleciona um dos pontos fora da janela
            code_out = code1 if code1 != 0 else code2
            x, y = 0, 0

            # Calcula o ponto de interseção com a borda
            if code_out & TOP:  # Acima
                x = x1 + (x2 - x1) * (y_max - y1) / (y2 - y1)
                y = y_max
            elif code_out & BOTTOM:  # Abaixo
                x = x1 + (x2 - x1) * (y_min - y1) / (y2 - y1)
                y = y_min
            elif code_out & RIGHT:  # Direita
                y = y1 + (y2 - y1) * (x_max - x1) / (x2 - x1)
                x = x_max
            elif code_out & LEFT:  # Esquerda
                y = y1 + (y2 - y1) * (x_min - x1) / (x2 - x1)
                x = x_min

            # Substitui o ponto fora da janela pelo ponto de interseção
            if code_out == code1:
                x1, y1 = x, y
                code1 = compute_region_code(x1, y1, x_min, y_min, x_max, y_max)
            else:
                x2, y2 = x, y
                code2 = compute_region_code(x2, y2, x_min, y_min, x_max, y_max)

    if accept:
        print(f"Linha recortada: ({x1}, {y1}) até ({x2}, {y2})")
    else:
        print("Linha completamente fora da janela.")

# Exemplo de uso
x_min, y_min, x_max, y_max = 1, 1, 10, 10  # Janela de recorte
x1, y1, x2, y2 = 5, 5, 15, 15  # Linha
cohen_sutherland_clip(x1, y1, x2, y2, x_min, y_min, x_max, y_max)
