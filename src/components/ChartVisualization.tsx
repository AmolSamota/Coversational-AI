import React, { useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Maximize2 } from 'lucide-react';
import type { ChartData } from '../data/insightsData';
import ChartModal from './ChartModal';

interface ChartVisualizationProps {
  chartData: ChartData;
  onDownload?: () => void;
}

const ChartVisualization: React.FC<ChartVisualizationProps> = ({ chartData, onDownload }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const COLORS = chartData.colors || ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#8B5CF6'];

  const handleDownloadCSV = () => {
    const { data } = chartData;
    
    // Create CSV content
    const headers = Object.keys(data[0] || {});
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      ),
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `chart-data-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyChart = async () => {
    try {
      // Find the chart container
      const chartElement = chartRef.current?.querySelector('.recharts-wrapper');
      if (!chartElement) {
        console.error('Chart element not found');
        return;
      }

      // Get the SVG element from the chart
      const svgElement = chartElement.querySelector('svg');
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }

      // Clone the SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      
      // Get the actual dimensions from the SVG or use defaults
      const svgWidth = svgElement.getAttribute('width') 
        ? parseInt(svgElement.getAttribute('width') || '800')
        : chartElement.clientWidth || 800;
      const svgHeight = svgElement.getAttribute('height')
        ? parseInt(svgElement.getAttribute('height') || '400')
        : chartElement.clientHeight || 400;

      // Set explicit dimensions on the clone
      svgClone.setAttribute('width', svgWidth.toString());
      svgClone.setAttribute('height', svgHeight.toString());
      svgClone.setAttribute('style', 'background-color: white;');
      
      // Create a data URL from the SVG
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create an image element to convert SVG to PNG
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Canvas context not available');
        URL.revokeObjectURL(svgUrl);
        return;
      }

      img.onload = async () => {
        try {
          // Set canvas dimensions to match image
          canvas.width = img.naturalWidth || svgWidth;
          canvas.height = img.naturalHeight || svgHeight;
          
          // Draw white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image
          ctx.drawImage(img, 0, 0);

          // Convert canvas to blob and copy to clipboard
          canvas.toBlob(async (blob) => {
            if (blob) {
              try {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                
                // Show success feedback
                const button = chartRef.current?.querySelector('[data-copy-button]') as HTMLElement;
                if (button) {
                  const originalHTML = button.innerHTML;
                  button.innerHTML = `
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  `;
                  button.classList.remove('text-blue-600', 'hover:text-blue-700');
                  button.classList.add('text-green-600');
                  setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.classList.remove('text-green-600');
                    button.classList.add('text-blue-600', 'hover:text-blue-700');
                  }, 2000);
                }
              } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                // Fallback: download the image
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `chart-${Date.now()}.png`;
                link.click();
                URL.revokeObjectURL(url);
              }
            }
            URL.revokeObjectURL(svgUrl);
          }, 'image/png');
        } catch (err) {
          console.error('Error processing image:', err);
          URL.revokeObjectURL(svgUrl);
        }
      };

      img.onerror = () => {
        console.error('Error loading SVG image');
        URL.revokeObjectURL(svgUrl);
      };

      // Load the SVG as an image
      img.src = svgUrl;
    } catch (error) {
      console.error('Error copying chart:', error);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      handleDownloadCSV();
    }
  };

  const renderChart = () => {
    const { type, data, xAxisKey, yAxisKey, dataKey, nameKey, valueKey, bars, lineColor, xAxisLabel, yAxisLabel, referenceLine } = chartData;
    
    // Custom tooltip formatter for tenure chart
    const customTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <p className="font-semibold text-gray-900 mb-2">{label}</p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Attrition Rate: </span>
              <span className="font-bold text-blue-600">{payload[0].value}%</span>
            </p>
            {dataPoint.employees && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Employees: </span>
                <span className="font-semibold">{dataPoint.employees.toLocaleString()}</span>
              </p>
            )}
            {dataPoint.departures && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Departures: </span>
                <span className="font-semibold text-red-600">{dataPoint.departures.toLocaleString()}</span>
              </p>
            )}
          </div>
        );
      }
      return null;
    };

    switch (type) {
      case 'bar':
        // Check if we have grouped bars
        if (bars && bars.length > 0) {
          return (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey={xAxisKey || 'name'}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280' } } : undefined}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280' } } : undefined}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                {bars.map((bar) => (
                  <Bar
                    key={bar.key}
                    dataKey={bar.key}
                    name={bar.name}
                    fill={bar.color}
                    radius={[8, 8, 0, 0]}
                  />
                ))}
              </BarChart>
              </ResponsiveContainer>
            </div>
          );
        }
        
        // Single bar chart with individual colors
        // Check if this is the tenure chart (has employees and departures)
        const isTenureChart = data.some((entry: any) => entry.employees && entry.departures);
        
        return (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey={xAxisKey || 'name'}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280' } } : undefined}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280' } } : undefined}
              />
              {referenceLine && (
                <ReferenceLine
                  y={referenceLine.value}
                  stroke={referenceLine.color}
                  strokeDasharray={referenceLine.strokeDasharray || "5 5"}
                  label={{ value: referenceLine.label, position: "right", fill: referenceLine.color, fontSize: 11 }}
                />
              )}
              <Tooltip
                content={isTenureChart ? customTooltip : undefined}
                contentStyle={!isTenureChart ? {
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px',
                } : undefined}
              />
              {!isTenureChart && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
              <Bar
                dataKey={dataKey || yAxisKey || 'value'}
                radius={[8, 8, 0, 0]}
              >
                {data.map((entry, index) => {
                  // Special handling for 0-1 years bar to make it stand out
                  const isFirstYear = entry[xAxisKey || 'name']?.toString().includes('0-1');
                  const barColor = entry.color as string || COLORS[index % COLORS.length];
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={barColor}
                      stroke={isFirstYear ? '#DC2626' : 'none'}
                      strokeWidth={isFirstYear ? 3 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        );

      case 'horizontalBar':
        return (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280' } } : undefined}
              />
              <YAxis
                type="category"
                dataKey={yAxisKey || dataKey || 'name'}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey={xAxisKey || 'value'}
                radius={[0, 8, 8, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color as string || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        );

      case 'line':
        return (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey={xAxisKey || 'name'}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280' } } : undefined}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280' } } : undefined}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey={dataKey || yAxisKey || 'value'}
                stroke={lineColor || COLORS[0]}
                strokeWidth={3}
                dot={{ fill: lineColor || COLORS[0], r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        );

      case 'pie':
      case 'donut': {
        const pieData = data.map((item, index) => ({
          name: item[nameKey || 'name'] as string,
          value: item[valueKey || 'value'] as number,
          color: COLORS[index % COLORS.length],
        }));

        return (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(1) : 0}%`}
                outerRadius={type === 'donut' ? 100 : 120}
                innerRadius={type === 'donut' ? 60 : 0}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
        );
      }

      default:
        return <div className="text-gray-500 p-4">Unsupported chart type</div>;
    }
  };

  // Check if this is the tenure chart to show color legend
  const isTenureChart = chartData.data.some((entry: any) => entry.employees && entry.departures);
  
  return (
    <>
    <div ref={chartRef} className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full max-w-full overflow-x-auto chart-container">
      <div className="flex items-center justify-between mb-3 min-w-0">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">{chartData.title || 'Data Visualization'}</h4>
          {isTenureChart && (
            <div className="flex items-center space-x-4 text-xs text-gray-600 flex-wrap">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-red-600"></div>
                <span>High (&gt;15%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span>Moderate (10-15%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Low (&lt;10%)</span>
              </div>
              {chartData.referenceLine && (
                <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-gray-300">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={chartData.referenceLine.color}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" strokeDasharray="5,5" />
                  </svg>
                  <span className="text-gray-500">{chartData.referenceLine.label}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            data-copy-button
            onClick={handleCopyChart}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
            title="Copy chart as image"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>Copy Chart</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
            title="Download chart data as CSV"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Download CSV</span>
          </button>
          <button
            onClick={openModal}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
            title="View larger"
          >
            <Maximize2 size={16} />
            <span>View Larger</span>
          </button>
        </div>
      </div>
      {renderChart()}
    </div>
    <ChartModal
      isOpen={isModalOpen}
      onClose={closeModal}
      chartData={chartData}
      chartTitle={chartData.title}
      onDownload={handleDownload}
    />
    </>
  );
};

export default ChartVisualization;

