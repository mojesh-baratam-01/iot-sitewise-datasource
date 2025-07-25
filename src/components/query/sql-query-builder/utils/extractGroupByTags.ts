import { SelectableValue } from '@grafana/data';

export function extractGroupByTags(
  options: SelectableValue<string> | Array<SelectableValue<string>> | null | undefined
): string[] {
  if (Array.isArray(options)) {
    return options.map((opt) => opt.value).filter(Boolean) as string[];
  } else if (options?.value) {
    return [options.value];
  }
  return [];
}
