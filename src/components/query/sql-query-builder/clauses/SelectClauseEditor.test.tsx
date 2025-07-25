/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectClauseEditor } from './SelectClauseEditor';

jest.mock('@grafana/ui', () => ({
  Select: ({ value, onChange, options, placeholder, 'data-testid': dataTestId }: any) => (
    <select
      data-testid={dataTestId || 'mock-select'}
      value={value?.value || ''}
      onChange={(e) => {
        const selected = options.find((o: any) => o.value === e.target.value);
        onChange(selected || null);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
  Input: ({ value, onChange, placeholder, 'data-testid': dataTestId }: any) => (
    <input data-testid={dataTestId || 'mock-input'} value={value} placeholder={placeholder} onChange={onChange} />
  ),
  IconButton: ({ name, onClick, 'aria-label': ariaLabel }: any) => {
    if (name === 'minus') {
      return (
        <button data-testid="icon-minus" aria-label={ariaLabel} onClick={onClick}>
          minus
        </button>
      );
    }
    return (
      <button data-testid={`icon-${name}`} aria-label={ariaLabel} onClick={onClick}>
        {name}
      </button>
    );
  },
  Tooltip: ({ children }: any) => <>{children}</>,
}));

jest.mock('@grafana/plugin-ui', () => ({
  EditorField: ({ children }: any) => <div>{children}</div>,
  EditorFieldGroup: ({ children }: any) => <div>{children}</div>,
  EditorRow: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@grafana/runtime');
jest.mock('../StyledLabel', () => ({
  StyledLabel: ({ text }: any) => <label>{text}</label>,
}));

jest.mock('../types', () => ({
  allFunctions: [
    { group: 'Aggregate', label: 'AVG', value: 'AVG' },
    { group: 'Transform', label: 'CAST', value: 'CAST' },
    { group: 'Date', label: 'DATE_TRUNC', value: 'DATE_TRUNC' },
    { group: 'None', label: 'Raw Values', value: 'RAW' },
  ],
  isCastFunction: (agg: string) => agg === 'CAST',
  isDateFunction: (agg: string) => agg === 'DATE_TRUNC',
}));

const mockProperties = [
  { id: 'device', name: 'device' },
  { id: 'status', name: 'status' },
];

describe('SelectClauseEditor', () => {
  const mockUpdateQuery = jest.fn();

  const baseProps = {
    selectFields: [{ column: 'temperature', aggregation: 'AVG', alias: '' }],
    availableProperties: [
      { id: 'temperature', name: 'Temperature' },
      { id: 'pressure', name: 'Pressure' },
    ],
    updateQuery: mockUpdateQuery,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders select, input, and buttons', () => {
    render(<SelectClauseEditor {...baseProps} />);
    expect(screen.getAllByTestId('mock-select')).toHaveLength(2);
    expect(screen.getByTestId('mock-input')).toBeInTheDocument();
    expect(screen.getByTestId('icon-plus')).toBeInTheDocument();
  });

  it('triggers updateQuery on column change including null fallback', () => {
    render(<SelectClauseEditor {...baseProps} />);
    const columnSelect = screen.getAllByTestId('mock-select')[0];

    // Trigger null fallback: select empty option
    fireEvent.change(columnSelect, { target: { value: '' } });
    expect(mockUpdateQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        selectFields: [{ column: '', aggregation: 'AVG', alias: '' }],
      })
    );

    // Trigger with actual value
    fireEvent.change(columnSelect, { target: { value: 'pressure' } });
    expect(mockUpdateQuery).toHaveBeenCalled();
  });

  it('triggers updateQuery on aggregation change including fallback', () => {
    render(<SelectClauseEditor {...baseProps} />);
    const aggSelect = screen.getAllByTestId('mock-select')[1];

    // Trigger null fallback
    fireEvent.change(aggSelect, { target: { value: '' } });
    expect(mockUpdateQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        selectFields: [{ column: 'temperature', aggregation: '', alias: '' }],
      })
    );

    fireEvent.change(aggSelect, { target: { value: 'AVG' } });
    expect(mockUpdateQuery).toHaveBeenCalled();
  });

  it('updates alias input', () => {
    render(<SelectClauseEditor {...baseProps} />);
    fireEvent.change(screen.getByTestId('mock-input'), {
      target: { value: 'alias_temp' },
    });
    expect(mockUpdateQuery).toHaveBeenCalled();
  });

  it('adds a new select field', () => {
    render(<SelectClauseEditor {...baseProps} />);
    fireEvent.click(screen.getByTestId('icon-plus'));
    expect(mockUpdateQuery).toHaveBeenCalledWith({
      selectFields: expect.arrayContaining([
        { column: 'temperature', aggregation: 'AVG', alias: '' },
        { column: '', aggregation: '', alias: '' },
      ]),
    });
  });

  it('removes a select field when multiple fields exist', () => {
    const props = {
      ...baseProps,
      selectFields: [
        { column: 'temperature', aggregation: 'AVG', alias: '' },
        { column: 'pressure', aggregation: 'SUM', alias: 'sum_p' },
      ],
    };
    render(<SelectClauseEditor {...props} />);
    fireEvent.click(screen.getAllByTestId('icon-minus')[1]);
    expect(mockUpdateQuery).toHaveBeenCalledWith({
      selectFields: [{ column: 'temperature', aggregation: 'AVG', alias: '' }],
    });
  });

  it('renders CAST function arg options', () => {
    const props = {
      ...baseProps,
      selectFields: [{ column: 'pressure', aggregation: 'CAST', alias: '' }],
    };
    render(<SelectClauseEditor {...props} />);
    expect(screen.getAllByTestId('mock-select').length).toBeGreaterThanOrEqual(3);
  });

  it('renders DATE_TRUNC functionArg + functionArgValue and covers value fallback', () => {
    const props = {
      ...baseProps,
      selectFields: [
        {
          column: 'temperature',
          aggregation: 'DATE_TRUNC',
          alias: '',
          functionArg: '',
          functionArgValue: '',
        },
      ],
    };
    render(<SelectClauseEditor {...props} />);
    const selects = screen.getAllByTestId('mock-select');
    expect(selects.length).toBeGreaterThan(2);

    // cover functionArg value fallback
    fireEvent.change(selects[2], { target: { value: '' } });
    expect(mockUpdateQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        selectFields: [expect.objectContaining({ functionArg: '' })],
      })
    );

    // functionArgValue input
    const input = screen.getByPlaceholderText('Enter interval value');
    fireEvent.change(input, { target: { value: '10' } });
    expect(mockUpdateQuery).toHaveBeenCalled();
  });

  it('does not show remove button when only one select field exists', () => {
    render(<SelectClauseEditor {...baseProps} />);
    expect(screen.queryAllByTestId('icon-minus').length).toBe(0);
  });

  it('ensures onRemove early returns when only one field exists', () => {
    render(<SelectClauseEditor {...baseProps} />);
    expect(screen.queryByTestId('icon-minus')).toBeNull();
  });

  it('covers null value fallback for column and functionArg selects', () => {
    render(<SelectClauseEditor {...baseProps} />);
    const selects = screen.getAllByTestId('mock-select');

    // Force null selection on column select (index 0)
    fireEvent.change(selects[0], { target: { value: '' } });

    // Force null selection on functionArg select (index 2 or 3 depending on aggregation)
    const propsWithFunctionArg = {
      ...baseProps,
      selectFields: [
        {
          column: 'temperature',
          aggregation: 'DATE_TRUNC',
          alias: '',
          functionArg: 'day',
          functionArgValue: '',
        },
      ],
    };
    render(<SelectClauseEditor {...propsWithFunctionArg} />);
    const newSelects = screen.getAllByTestId('mock-select');
    const functionArgSelect = newSelects[2]; // DATE_TRUNC makes this show

    fireEvent.change(functionArgSelect, { target: { value: '' } });

    expect(mockUpdateQuery).toHaveBeenCalled();
  });

  it('covers null and empty value fallbacks in column and functionArg selects', () => {
    const props = {
      ...baseProps,
      selectFields: [
        {
          column: '', // triggers null for line 54
          aggregation: 'DATE_TRUNC',
          alias: '',
          functionArg: 'MONTH',
          functionArgValue: '',
        },
      ],
    };

    render(<SelectClauseEditor {...props} />);
    const selects = screen.getAllByTestId('mock-select');

    // column select with empty string -> triggers line 54 null case
    const columnSelect = selects[0] as HTMLSelectElement;
    expect(columnSelect.value).toBe('');

    // functionArg select with empty string -> triggers line 75 fallback
    fireEvent.change(selects[2], { target: { value: '' } });

    expect(mockUpdateQuery).toHaveBeenCalled();
  });

  it('covers fallback for functionArg select', () => {
    const props = {
      ...baseProps,
      selectFields: [
        {
          column: 'prop1',
          aggregation: 'CAST',
          alias: '',
          functionArg: 'INT',
        },
      ],
    };

    render(<SelectClauseEditor {...props} />);

    const selects = screen.getAllByTestId('mock-select');

    // selects[2] is the functionArg <Select /> when aggregation is 'CAST'
    fireEvent.change(selects[2], { target: { value: '' } });

    expect(mockUpdateQuery).toHaveBeenCalledWith({
      selectFields: [
        {
          column: 'prop1',
          aggregation: 'CAST',
          alias: '',
          functionArg: '',
        },
      ],
    });
  });

  it('explicitly covers functionArg onChange fallback (line 75)', () => {
    const props = {
      ...baseProps,
      selectFields: [
        {
          column: 'temp',
          aggregation: 'CAST',
          alias: '',
          functionArg: 'INT', // initially set
        },
      ],
    };

    render(<SelectClauseEditor {...props} />);
    const selects = screen.getAllByTestId('mock-select');

    // This should be the functionArg <select>
    const functionArgSelect = selects[2];

    // Trigger change to value not in options, so option becomes null → fallback to ''
    fireEvent.change(functionArgSelect, { target: { value: 'invalid' } });

    expect(mockUpdateQuery).toHaveBeenCalledWith({
      selectFields: [
        expect.objectContaining({
          functionArg: '',
        }),
      ],
    });
  });

  it('updates functionArg when functionArg select is changed', () => {
    render(
      <SelectClauseEditor
        selectFields={[{ column: 'device', aggregation: 'CAST', alias: '', functionArg: '' }]}
        updateQuery={mockUpdateQuery}
        availableProperties={mockProperties}
      />
    );

    // Target the select field for functionArg
    const selects = screen.getAllByTestId('mock-select');

    // The third Select rendered is usually for functionArg when CAST is selected
    fireEvent.change(selects[2], { target: { value: 'BOOLEAN' } });

    expect(mockUpdateQuery).toHaveBeenCalledWith({
      selectFields: [
        expect.objectContaining({
          functionArg: 'BOOLEAN',
        }),
      ],
    });
  });
});
