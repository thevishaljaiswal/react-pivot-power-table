
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PivotData {
  rows: Array<{
    data: Record<string, any>;
    values: Record<string, Record<string, number>>;
    totals: Record<string, number>;
  }>;
  columnHeaders: string[];
  grandTotals: Record<string, Record<string, number>>;
  overallTotals: Record<string, number>;
}

interface PivotChartProps {
  data: PivotData;
  type: 'bar' | 'pie';
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
  '#ff00ff', '#00ffff', '#ff6666', '#66ff66', '#6666ff'
];

export const PivotChart: React.FC<PivotChartProps> = ({ data, type }) => {
  // Prepare data for charts
  const chartData = React.useMemo(() => {
    if (!data.rows.length) return [];

    // For bar chart: use row data with totals
    if (type === 'bar') {
      return data.rows.map(row => {
        const item: Record<string, any> = {};
        
        // Add row identifiers
        Object.keys(row.data).forEach(key => {
          item[key] = row.data[key];
        });
        
        // Add totals for each value field
        Object.keys(row.totals).forEach(valueField => {
          item[valueField] = row.totals[valueField];
        });
        
        return item;
      });
    } else {
      // For pie chart: use overall totals
      return Object.keys(data.overallTotals).map(valueField => ({
        name: valueField,
        value: data.overallTotals[valueField]
      }));
    }
  }, [data, type]);

  if (type === 'bar') {
    const valueFields = Object.keys(data.overallTotals);
    const rowFields = data.rows.length > 0 ? Object.keys(data.rows[0].data) : [];
    
    return (
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={rowFields[0]} 
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            {valueFields.map((field, index) => (
              <Bar 
                key={field}
                dataKey={field} 
                fill={COLORS[index % COLORS.length]}
                name={field}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
