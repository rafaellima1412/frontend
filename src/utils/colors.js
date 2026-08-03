const HUE_STEP = 137.508; // ângulo áureo — distribui os tons de forma bem espaçada, qualquer quantidade de itens

/**
 * Gera `count` cores em HSL, uma pra cada item de uma lista (ex: planos de um gráfico).
 * Não depende de paleta fixa: sempre dá uma cor visualmente distinta pro próximo item,
 * mesmo que a lista cresça (6º, 7º, 10º plano etc.).
 */
export function generateChartColors(count) {
  return Array.from({ length: count }, (_, i) => `hsl(${(i * HUE_STEP) % 360}, 65%, 55%)`);
}
