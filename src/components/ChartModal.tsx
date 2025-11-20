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
import { Copy, Check } from 'lucide-react';
import type { ChartData } from '../data/insightsData';
import Modal from './Modal';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: ChartData;
  chartTitle?: string;
  onDownload?: () => void;
}

const ChartModal: React.FC<ChartModalProps> = ({ isOpen, onClose, chartData, chartTitle }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'success'>('idle');

  const COLORS = chartData.colors || ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#8B5CF6'];
  const { type, data, xAxisKey, yAxisKey, dataKey, nameKey, valueKey, bars, lineColor, xAxisLabel, yAxisLabel, referenceLine } = chartData;
  const isTenureChart = data.some((entry: any) => entry.employees && entry.departures);

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

  const renderChart = () => {
    switch (type) {
      case 'bar':
        // Check if we have grouped bars
        if (bars && bars.length > 0) {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey={xAxisKey || 'name'}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 14 }}
                  stroke="#6B7280"
                  label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 14 } } : undefined}
                />
                <YAxis
                  tick={{ fontSize: 14 }}
                  stroke="#6B7280"
                  label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 14 } } : undefined}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
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
          );
        }
        
        // Single bar chart
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey={xAxisKey || 'name'}
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 14 }}
                stroke="#6B7280"
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 14 } } : undefined}
              />
              <YAxis
                tick={{ fontSize: 14 }}
                stroke="#6B7280"
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 14 } } : undefined}
              />
              {referenceLine && (
                <ReferenceLine
                  y={referenceLine.value}
                  stroke={referenceLine.color}
                  strokeDasharray={referenceLine.strokeDasharray || "5 5"}
                  label={{ value: referenceLine.label, position: "right", fill: referenceLine.color, fontSize: 12 }}
                />
              )}
              <Tooltip
                content={isTenureChart ? customTooltip : undefined}
                contentStyle={!isTenureChart ? {
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                } : undefined}
              />
              {!isTenureChart && <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />}
              <Bar
                dataKey={dataKey || yAxisKey || 'value'}
                radius={[8, 8, 0, 0]}
              >
                {data.map((entry, index) => {
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
        );

      case 'horizontalBar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                tick={{ fontSize: 14 }}
                stroke="#6B7280"
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 14 } } : undefined}
              />
              <YAxis
                type="category"
                dataKey={yAxisKey || dataKey || 'name'}
                tick={{ fontSize: 14 }}
                stroke="#6B7280"
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
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
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey={xAxisKey || 'name'}
                tick={{ fontSize: 14 }}
                stroke="#6B7280"
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 14 } } : undefined}
              />
              <YAxis
                tick={{ fontSize: 14 }}
                stroke="#6B7280"
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 14 } } : undefined}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
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
        );

      case 'pie':
      case 'donut':
        const pieData = data.map((item, index) => ({
          name: item[nameKey || 'name'] as string,
          value: item[valueKey || 'value'] as number,
          color: item.color as string || COLORS[index % COLORS.length],
        }));

        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(1) : 0}%`}
                outerRadius={type === 'donut' ? 150 : 180}
                innerRadius={type === 'donut' ? 90 : 0}
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
                  padding: '12px',
                  fontSize: '14px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-gray-500 p-4">Unsupported chart type</div>;
    }
  };

  const handleCopyChart = async () => {
    try {
      setCopyState('copying');
      
      // Find the chart container
      const chartElement = chartRef.current?.querySelector('.recharts-wrapper');
      if (!chartElement) {
        console.error('Chart element not found');
        setCopyState('idle');
        return;
      }

      // Get the SVG element from the chart
      const svgElement = chartElement.querySelector('svg');
      if (!svgElement) {
        console.error('SVG element not found');
        setCopyState('idle');
        return;
      }

      // Clone the SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      
      // Get the actual dimensions from the SVG or use defaults
      const svgWidth = svgElement.getAttribute('width') 
        ? parseInt(svgElement.getAttribute('width') || '800')
        : chartElement.clientWidth || 800;
      const svgHeight = svgElement.getAttribute('height')
        ? parseInt(svgElement.getAttribute('height') || '600')
        : chartElement.clientHeight || 600;

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
        setCopyState('idle');
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
                setCopyState('success');
                setTimeout(() => {
                  setCopyState('idle');
                }, 2000);
              } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                // Fallback: download the image
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `chart-${Date.now()}.png`;
                link.click();
                URL.revokeObjectURL(url);
                setCopyState('idle');
              }
            }
            URL.revokeObjectURL(svgUrl);
          }, 'image/png');
        } catch (err) {
          console.error('Error processing image:', err);
          URL.revokeObjectURL(svgUrl);
          setCopyState('idle');
        }
      };

      img.onerror = () => {
        console.error('Error loading SVG image');
        URL.revokeObjectURL(svgUrl);
        setCopyState('idle');
      };

      // Load the SVG as an image
      img.src = svgUrl;
    } catch (error) {
      console.error('Error copying chart:', error);
      setCopyState('idle');
    }
  };

  const headerActions = (
    <div className="relative group">
      <button
        onClick={handleCopyChart}
        className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
        disabled={copyState === 'copying'}
        aria-label="Copy chart image"
      >
        {copyState === 'idle' && <Copy size={20} />}
        {copyState === 'copying' && (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {copyState === 'success' && <Check size={20} className="text-green-600" />}
        {copyState === 'success' && <span className="text-sm text-green-600">Copied!</span>}
      </button>
      {copyState === 'idle' && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          Copy chart image
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={chartTitle || chartData.title || 'Chart Visualization'}
      headerActions={headerActions}
      maxWidth="90vw"
      maxHeight="80vh"
    >
      <div ref={chartRef} className="w-full" style={{ height: '600px' }}>
        {isTenureChart && (
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 flex-wrap">
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
        <div className="w-full" style={{ height: isTenureChart ? '550px' : '600px' }}>
          {renderChart()}
        </div>
      </div>
    </Modal>
  );
};

export default ChartModal;

