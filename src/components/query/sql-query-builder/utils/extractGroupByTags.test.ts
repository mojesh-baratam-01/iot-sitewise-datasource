import { extractGroupByTags } from './extractGroupByTags';

describe('extractGroupByTags', () => {
  it('returns array of values when passed an array of options', () => {
    const result = extractGroupByTags([
      { label: 'Device ID', value: 'deviceId' },
      { label: 'Asset Name', value: 'assetName' },
      { label: 'Empty', value: '' }, // falsy
    ]);
    expect(result).toEqual(['deviceId', 'assetName']);
  });

  it('returns single value in array when passed single option', () => {
    const result = extractGroupByTags({ label: 'Device ID', value: 'deviceId' });
    expect(result).toEqual(['deviceId']);
  });

  it('returns empty array for invalid input', () => {
    expect(extractGroupByTags(null)).toEqual([]);
    expect(extractGroupByTags(undefined)).toEqual([]);
    expect(extractGroupByTags({} as any)).toEqual([]);
  });
});
