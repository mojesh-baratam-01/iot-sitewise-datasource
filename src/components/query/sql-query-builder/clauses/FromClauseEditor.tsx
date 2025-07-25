import React from 'react';
import { Select } from '@grafana/ui';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { StyledLabel } from '../StyledLabel';

interface FromClauseEditorProps {
  assetModels: Array<{ id: string; name: string }>;
  selectedModelId: string;
  updateQuery: (
    updatedFields: Partial<{
      selectedAssetModel: string;
      selectFields: Array<{ column: string; aggregation: string; alias: string }>;
      whereConditions: Array<{ column: string; operator: string; value: string; logicalOperator: 'AND' | 'OR' }>;
    }>
  ) => void;
}

export const FromClauseEditor: React.FC<FromClauseEditorProps> = ({ assetModels, selectedModelId, updateQuery }) => {
  let selectedValue = null;
  const matchedModel = assetModels.find((m) => m.id === selectedModelId);

  if (selectedModelId) {
    selectedValue = matchedModel
      ? { label: matchedModel.name, value: selectedModelId }
      : { label: '', value: selectedModelId }; // ensures the case is tracked
  }

  return (
    <EditorRow>
      <EditorFieldGroup>
        <StyledLabel text="FROM" width={15} tooltip />
        <EditorField label="" width={30}>
          <Select
            options={assetModels.map((model) => ({
              label: model.name,
              value: model.id,
            }))}
            value={selectedValue}
            onChange={(option) =>
              updateQuery({
                selectedAssetModel: option?.value || '',
                selectFields: [{ column: '', aggregation: '', alias: '' }],
                whereConditions: [{ column: '', operator: '', value: '', logicalOperator: 'AND' }],
              })
            }
            placeholder="Select model..."
          />
        </EditorField>
      </EditorFieldGroup>
    </EditorRow>
  );
};
