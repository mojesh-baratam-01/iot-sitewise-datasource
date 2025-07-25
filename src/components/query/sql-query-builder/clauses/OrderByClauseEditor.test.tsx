/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderByClauseEditor } from './OrderByClauseEditor';

// Mock Grafana components
jest.mock('@grafana/ui', () => ({
  Select: ({ options, value, onChange, placeholder }: any) => (
    <select
      data-testid={placeholder}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
        // mimic the grafana/ui Select onChange payload
        const selected = options.find((o: any) => o.value === e.target.value) || null;
        onChange(selected);
      }}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  IconButton: ({ onClick, 'aria-label': ariaLabel }: any) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {ariaLabel}
    </button>
  ),
  Tooltip: ({ children }: any) => <>{children}</>,
}));

jest.mock('@grafana/plugin-ui', () => ({
  EditorField: ({ children }: any) => <div>{children}</div>,
  EditorFieldGroup: ({ children }: any) => <div>{children}</div>,
  EditorRow: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('../StyledLabel', () => ({
  StyledLabel: ({ text }: { text: string }) => <label>{text}</label>,
}));

// utility to render with defaults
const availableProperties = [
  { id: 'timestamp', name: 'Timestamp' },
  { id: 'assetId', name: 'Asset ID' },
];

function setup(orderByFields = [{ column: '', direction: 'ASC' as const }], updateQuery = jest.fn()) {
  render(
    <OrderByClauseEditor
      orderByFields={orderByFields}
      updateQuery={updateQuery}
      availableProperties={availableProperties}
    />
  );
  return { updateQuery };
}

describe('OrderByClauseEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a single ORDER BY row initially', () => {
    setup();
    // The label from StyledLabel
    expect(screen.getByText('ORDER BY')).toBeInTheDocument();
    // The two selects are keyed by their placeholder
    expect(screen.getByTestId('Select column...')).toBeInTheDocument();
    expect(screen.getByTestId('Direction')).toBeInTheDocument();
    // Only add button appears
    expect(screen.getByLabelText('Add order by field')).toBeInTheDocument();
    // Remove button should not appear
    expect(screen.queryByLabelText('Remove order by field')).toBeNull();
  });

  it('adds a new ORDER BY field', () => {
    const updateQuery = jest.fn();
    setup([{ column: 'timestamp', direction: 'ASC' }], updateQuery);

    fireEvent.click(screen.getByLabelText('Add order by field'));

    expect(updateQuery).toHaveBeenCalledWith({
      orderByFields: [
        { column: 'timestamp', direction: 'ASC' },
        { column: '', direction: 'ASC' },
      ],
    });
  });

  it('removes an ORDER BY field when multiple exist', () => {
    const updateQuery = jest.fn();
    setup(
      [
        { column: 'timestamp', direction: 'ASC' },
        { column: 'assetId', direction: 'ASC' },
      ],
      updateQuery
    );

    // both add and remove buttons present
    expect(screen.getAllByLabelText('Remove order by field')).toHaveLength(2);
    fireEvent.click(screen.getAllByLabelText('Remove order by field')[1]);

    expect(updateQuery).toHaveBeenCalledWith({
      orderByFields: [{ column: 'timestamp', direction: 'ASC' }],
    });
  });

  it('updates column on select change (covers option?.value || "")', () => {
    const updateQuery = jest.fn();
    setup([{ column: '', direction: 'ASC' }], updateQuery);

    const colSelect = screen.getByTestId('Select column...') as HTMLSelectElement;
    // empty selection → '' branch
    fireEvent.change(colSelect, { target: { value: '' } });
    expect(updateQuery).toHaveBeenCalledWith({
      orderByFields: [{ column: '', direction: 'ASC' }],
    });

    // choose real value
    fireEvent.change(colSelect, { target: { value: 'assetId' } });
    expect(updateQuery).toHaveBeenCalledWith({
      orderByFields: [{ column: 'assetId', direction: 'ASC' }],
    });
  });

  it('updates direction on select change (covers cast to "ASC"|"DESC")', () => {
    const updateQuery = jest.fn();
    setup([{ column: 'timestamp', direction: 'ASC' }], updateQuery);

    const dirSelect = screen.getByTestId('Direction') as HTMLSelectElement;
    // empty selection → fallback to 'ASC'
    fireEvent.change(dirSelect, { target: { value: '' } });
    expect(updateQuery).toHaveBeenCalledWith({
      orderByFields: [{ column: 'timestamp', direction: 'ASC' }],
    });

    // change to DESC
    fireEvent.change(dirSelect, { target: { value: 'DESC' } });
    expect(updateQuery).toHaveBeenCalledWith({
      orderByFields: [{ column: 'timestamp', direction: 'DESC' }],
    });
  });

  it('conditionally hides remove button when only one field', () => {
    setup([{ column: 'timestamp', direction: 'ASC' }]);
    expect(screen.queryByLabelText('Remove order by field')).toBeNull();
  });
});
