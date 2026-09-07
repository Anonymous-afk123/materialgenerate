export const SOFTWARE_CATEGORY_OPTIONS = [
  "应用软件",
  "嵌入式软件",
  "中间件",
  "操作系统",
] as const;

export type SoftwareCategory = typeof SOFTWARE_CATEGORY_OPTIONS[number];

export function isOfficialSoftwareCategory(value: string): value is SoftwareCategory {
  return SOFTWARE_CATEGORY_OPTIONS.includes(value.trim() as SoftwareCategory);
}

export const TECHNICAL_FEATURE_OPTIONS = [
  "APP",
  "游戏软件",
  "教育软件",
  "金融软件",
  "医疗软件",
  "地理信息软件",
  "云计算软件",
  "信息安全软件",
  "大数据软件",
  "人工智能软件",
  "VR软件",
  "5G软件",
  "小程序",
  "物联网软件",
  "智慧城市软件",
] as const;

export const PROGRAMMING_LANGUAGE_OPTIONS = [
  "Python",
  "JavaScript / TypeScript",
  "Java",
  "C / C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Swift / Kotlin",
  "HTML / CSS",
] as const;

export interface ChoiceSelection {
  selected: string[];
  custom: string;
}

/**
 * Older records store these fields as one string. Split known options from
 * the remaining user-entered text so the multi-select UI can edit both
 * representations without a database migration.
 */
export function parseChoiceSelection(value: string, options: readonly string[]): ChoiceSelection {
  const parts = value
    .split(/[、,，;；]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const selected = options.filter((option) => parts.includes(option));
  const custom = parts.filter((part) => !options.includes(part)).join("、");
  return { selected, custom };
}

export function serializeChoiceSelection(selected: readonly string[], custom: string): string {
  return Array.from(new Set([
    ...selected,
    ...custom.split(/[、,，;；]/).map((part) => part.trim()).filter(Boolean),
  ])).join("、");
}
