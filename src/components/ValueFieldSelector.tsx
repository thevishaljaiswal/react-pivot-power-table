import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { ValueField } from '../utils/enhancedPivotUtils';
import { ConversionConfig, detectFieldType, formatValueWithUnit } from '../utils/conversionUtils';
import { AggregationFunction } from './PivotTable';

interface ValueFieldSelectorProps {
  availableFields: string[];
  valueFields: ValueField[];
  conversions: ConversionConfig[];
  onValueFieldsChange: (valueFields: ValueField[]) => void;
  onConversionsChange: (conversions: ConversionConfig[]) => void;
}

export const ValueFieldSelector: React.FC<ValueFieldSelectorProps> = ({
  availableFields,
  valueFields,
  conversions,
  onValueFieldsChange,
  onConversionsChange
}) => {
  const addValueField = (field: string) => {
    if (!valueFields.find(vf => vf.field === field)) {
      const newValueField: ValueField = {
        field,
        aggregation: 'sum',
        label: field
      };
      onValueFieldsChange([...valueFields, newValueField]);
    }
  };

  const removeValueField = (field: string) => {
    onValueFieldsChange(valueFields.filter(vf => vf.field !== field));
    // Also remove any related conversions
    onConversionsChange(conversions.filter(c => c.field !== field));
  };

  const updateAggregation = (field: string, aggregation: AggregationFunction) => {
    onValueFieldsChange(
      valueFields.map(vf => 
        vf.field === field ? { ...vf, aggregation } : vf
      )
    );
  };

  const updateConversion = (field: string, enabled: boolean, targetUnit?: ConversionConfig['targetUnit']) => {
    const fieldType = detectFieldType(field);
    if (!fieldType) return;

    const existingConversion = conversions.find(c => c.field === field);
    
    if (enabled && targetUnit) {
      const newConversion: ConversionConfig = {
        field,
        type: fieldType,
        targetUnit
      };
      
      if (existingConversion) {
        onConversionsChange(
          conversions.map(c => c.field === field ? newConversion : c)
        );
      } else {
        onConversionsChange([...conversions, newConversion]);
      }
    } else if (!enabled) {
      onConversionsChange(conversions.filter(c => c.field !== field));
    }
  };

  const getConversionOptions = (fieldType: ConversionConfig['type']) => {
    switch (fieldType) {
      case 'area':
        return [
          { value: 'm2', label: 'Square Meters (m²)' },
          { value: 'ft2', label: 'Square Feet (ft²)' }
        ];
      case 'amount':
        return [
          { value: 'original', label: 'Original Amount' },
          { value: 'crores', label: 'Crores (₹ cr)' }
        ];
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Value Fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Value Field */}
        <div className="flex gap-2">
          <Select onValueChange={addValueField}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Add value field..." />
            </SelectTrigger>
            <SelectContent>
              {availableFields
                .filter(field => !valueFields.find(vf => vf.field === field))
                .map(field => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        {/* Value Fields List */}
        <div className="space-y-3">
          {valueFields.map((valueField) => {
            const fieldType = detectFieldType(valueField.field);
            const conversion = conversions.find(c => c.field === valueField.field);
            const conversionOptions = fieldType ? getConversionOptions(fieldType) : [];

            return (
              <div key={valueField.field} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{valueField.field}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeValueField(valueField.field)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Aggregation Selection */}
                <div className="space-y-2">
                  <Label className="text-xs">Aggregation Function</Label>
                  <Select
                    value={valueField.aggregation}
                    onValueChange={(value: AggregationFunction) => 
                      updateAggregation(valueField.field, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sum">Sum</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="avg">Average</SelectItem>
                      <SelectItem value="min">Minimum</SelectItem>
                      <SelectItem value="max">Maximum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conversion Options */}
                {fieldType && conversionOptions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`conversion-${valueField.field}`}
                        checked={!!conversion}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const defaultUnit = fieldType === 'area' ? 'ft2' : 'crores';
                            updateConversion(valueField.field, true, defaultUnit);
                          } else {
                            updateConversion(valueField.field, false);
                          }
                        }}
                      />
                      <Label htmlFor={`conversion-${valueField.field}`} className="text-xs">
                        Convert {fieldType}
                      </Label>
                    </div>

                    {conversion && (
                      <Select
                        value={conversion.targetUnit}
                        onValueChange={(value: ConversionConfig['targetUnit']) =>
                          updateConversion(valueField.field, true, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conversionOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {valueFields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No value fields selected. Add fields to create pivot table.
          </p>
        )}
      </CardContent>
    </Card>
  );
};