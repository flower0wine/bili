/**
 * 智能格式化大数字（中文风格：万 / 亿）
 * 示例：
 *   1234       → 1234
 *   12345      → 1.23万
 *   1234567    → 123.46万
 *   12345678   → 1234.57万
 *   123456789  → 1.23亿
 *   123456789012 → 45.68亿
 *
 * @param {number|string|null|undefined} num 数字
 * @param {object} [options] 配置项
 * @param {number} [options.fixed] 最多保留几位小数（默认 2，自动去尾部0）
 * @param {string} [options.zeroText] 0 或无效值时显示内容
 * @param {boolean} [options.forceUnit] 强制显示单位（即使 <1万 也显示“万”）
 * @returns {string} 格式化后的字符串
 */
export function formatNumber(
  num: number | string | null | undefined,
  options: {
    fixed?: number;
    zeroText?: string;
    forceUnit?: boolean; // 强制显示单位（如 5000 → 0.50万）
  } = {}
): string {
  const { fixed = 2, zeroText = "-", forceUnit = false } = options;

  if (num == null || num === "" || isNaN(Number(num))) {
    return zeroText;
  }

  const value = Number(num);
  if (value === 0)
    return zeroText;

  const absValue = Math.abs(value);

  // 小于1万：直接显示（除非强制单位）
  if (absValue < 10000 && !forceUnit) {
    // 整数直接返回，带小数的按 fixed 保留
    if (Number.isInteger(value))
      return value.toString();
    return value.toFixed(fixed).replace(/\.?0+$/, "");
  }

  // ≥1亿 → 用亿
  if (absValue >= 1e8) {
    const result = value / 1e8;
    return formatWithUnit(result, "亿", fixed);
  }

  // ≥1万 用万
  const result = value / 1e4;
  return formatWithUnit(result, "万", fixed);
}

// 内部工具：格式化数字 + 单位，并智能去除无意义小数
function formatWithUnit(num: number, unit: string, fixed: number): string {
  // 如果是整数，直接返回
  if (Number.isInteger(num)) {
    return `${num}${unit}`;
  }

  // 否则保留指定小数位，去掉末尾0和.
  const formatted = num.toFixed(fixed);
  const cleaned = formatted.replace(/\.?0+$/, "");
  return `${cleaned}${unit}`;
}