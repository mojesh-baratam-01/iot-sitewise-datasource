import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GroupByClauseEditor } from './GroupByClauseEditor';

const availablePropertiesForGrouping = [
  { id: 'deviceId', name: 'Device ID' },
  { id: 'assetName', name: 'Asset Name' },
  { id: 'timeInterval', name: 'Time Interval' },
];

const mockAvailableProperties = [
  { id: 'deviceId', name: 'Device ID' },
  { id: 'assetName', name: 'Asset Name' },
  { id: 'timeInterval', name: 'Time Interval' },
];

jest.mock('../types', () => ({
  timeIntervals: [
    { label: '1 minute', value: '1m' },
    { label: '5 minutes', value: '5m' },
  ],
}));

jest.mock('../StyledLabel', () => ({
  StyledLabel: ({ text }: { text: string }) => <label>{text}</label>,
}));

describe('GroupByClauseEditor', () => {
  const updateQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with no selected tags', () => {
    render(
      <GroupByClauseEditor
        availablePropertiesForGrouping={availablePropertiesForGrouping}
        groupByTags={[]}
        groupByTime=""
        updateQuery={updateQuery}
      />
    );

    expect(screen.getByText('GROUP BY')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // FIXED
  });

  it('handles selecting groupByTags', async () => {
    render(
      <GroupByClauseEditor
        availablePropertiesForGrouping={availablePropertiesForGrouping}
        groupByTags={[]}
        groupByTime=""
        updateQuery={updateQuery}
      />
    );

    const select = screen.getByRole('combobox');

    // Select "Device ID"
    fireEvent.change(select, { target: { value: 'deviceId' } });

    expect(updateQuery).toHaveBeenCalledWith({
      groupByTags: ['deviceId'],
      groupByTime: '',
    });
  });

  it('renders unknown tag if not in options', () => {
    render(
      <GroupByClauseEditor
        availablePropertiesForGrouping={availablePropertiesForGrouping}
        groupByTags={['unknownTag']}
        groupByTime=""
        updateQuery={updateQuery}
      />
    );

    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('renders timeInterval dropdown when tag included', () => {
    render(
      <GroupByClauseEditor
        availablePropertiesForGrouping={availablePropertiesForGrouping}
        groupByTags={['timeInterval']}
        groupByTime=""
        updateQuery={updateQuery}
      />
    );

    const selects = screen.getAllByTestId('select');
    expect(selects).toHaveLength(2); // one for tags, one for time interval

    // Assert that second select contains time interval options
    expect(selects[1]).toHaveTextContent('1 minute');
    expect(selects[1]).toHaveTextContent('5 minutes');
  });

  it('selects timeInterval and updates groupByTime', () => {
    const updateQuery = jest.fn();

    render(
      <GroupByClauseEditor
        availablePropertiesForGrouping={mockAvailableProperties}
        groupByTags={['timeInterval']}
        groupByTime=""
        updateQuery={updateQuery}
      />
    );

    const selects = screen.getAllByTestId('select');
    const intervalSelect = selects[1]; // second select is for groupByTime

    fireEvent.change(intervalSelect, { target: { value: '1m' } });
    expect(updateQuery).toHaveBeenCalledWith({ groupByTime: '1m' });
  });

  it('clears groupByTime when timeInterval is removed', async () => {
    render(
      <GroupByClauseEditor
        availablePropertiesForGrouping={availablePropertiesForGrouping}
        groupByTags={['timeInterval']}
        groupByTime="1m"
        updateQuery={updateQuery}
      />
    );

    const selects = screen.getAllByTestId('select');
    const tagSelect = selects[0]; // groupByTags select

    // Simulate user changing selection from 'timeInterval' to 'deviceId'
    await userEvent.selectOptions(tagSelect, 'deviceId');

    await waitFor(() => {
      expect(updateQuery).toHaveBeenCalledWith({
        groupByTags: ['deviceId'],
        groupByTime: '', // should be cleared because 'timeInterval' was removed
      });
    });
  });

  it('clears groupByTime when "No grouping" is selected', () => {
    render(
      <GroupByClauseEditor
        availablePropertiesForGrouping={availablePropertiesForGrouping}
        groupByTags={['timeInterval']}
        groupByTime="1m"
        updateQuery={updateQuery}
      />
    );

    const selects = screen.getAllByTestId('select');
    const timeSelect = selects[1]; // second select is time interval

    fireEvent.change(timeSelect, { target: { value: '' } }); // 'No grouping' value

    expect(updateQuery).toHaveBeenCalledWith({ groupByTime: '' });
  });

  it('handles multi-select array input for coverage', async () => {
    const updateQuery = jest.fn();
    const user = userEvent.setup();

    render(
      <GroupByClauseEditor
        availablePropertiesForGrouping={[
          { id: 'deviceId', name: 'Device ID' },
          { id: 'assetName', name: 'Asset Name' },
          { id: 'timeInterval', name: 'Time Interval' },
        ]}
        groupByTags={[]}
        groupByTime=""
        updateQuery={updateQuery}
      />
    );

    // Open the multi-select dropdown
    const select = screen.getByRole('combobox');
    await user.click(select);

    // Select multiple options
    await user.click(screen.getByText('Device ID'));
    await user.click(screen.getByText('Asset Name'));

    // The last click will trigger the onChange and call updateQuery
    expect(updateQuery).toHaveBeenCalledWith({
      groupByTags: ['deviceId', 'assetName'],
    });
  });
});
