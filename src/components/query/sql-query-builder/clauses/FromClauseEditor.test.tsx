import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FromClauseEditor } from './FromClauseEditor';

describe('FromClauseEditor', () => {
  const mockAssetModels = [
    { id: '1', name: 'Model A' },
    { id: '2', name: 'Model B' },
  ];

  it('renders the "FROM" label', () => {
    const mockUpdateQuery = jest.fn();

    render(<FromClauseEditor assetModels={mockAssetModels} selectedModelId="1" updateQuery={mockUpdateQuery} />);

    expect(screen.getByTestId('inline-label')).toHaveTextContent('FROM');
  });

  it('updates selected model when selection changes', () => {
    const mockUpdateQuery = jest.fn();

    render(<FromClauseEditor assetModels={mockAssetModels} selectedModelId="1" updateQuery={mockUpdateQuery} />);

    const select = screen.getByTestId('select');
    fireEvent.change(select, { target: { value: '2' } });

    expect(mockUpdateQuery).toHaveBeenCalledWith({
      selectedAssetModel: '2',
      selectFields: [{ column: '', aggregation: '', alias: '' }],
      whereConditions: [{ column: '', operator: '', value: '', logicalOperator: 'AND' }],
    });
  });

  it('handles case where selectedModelId is not found', () => {
    const mockUpdateQuery = jest.fn();

    const { container } = render(
      <FromClauseEditor
        assetModels={mockAssetModels}
        selectedModelId="999" // Invalid ID
        updateQuery={mockUpdateQuery}
      />
    );

    // Verify fallback to placeholder: Select...
    const selectContainer = container.querySelector('[data-testid="select"]');
    expect(selectContainer?.textContent).toContain('Select...');
  });

  it('handles clearing the model selection', () => {
    const mockUpdateQuery = jest.fn();

    render(<FromClauseEditor assetModels={mockAssetModels} selectedModelId="1" updateQuery={mockUpdateQuery} />);

    const select = screen.getByTestId('select');

    // Clear the selection
    fireEvent.change(select, { target: { value: '' } });

    expect(mockUpdateQuery).toHaveBeenCalledWith({
      selectedAssetModel: '',
      selectFields: [{ column: '', aggregation: '', alias: '' }],
      whereConditions: [{ column: '', operator: '', value: '', logicalOperator: 'AND' }],
    });
  });
});
