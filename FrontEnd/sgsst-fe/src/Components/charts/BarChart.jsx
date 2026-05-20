import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BarChart({
  data = [],
  title = 'Cumplimiento por estándar',
  height = 300,
  horizontal = false,
}) {
  const labels = data.map((d) => `${d.numero}. ${d.titulo ? d.titulo.split(' ').slice(0, 3).join(' ') : d.numero}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Cumplimiento %',
        data: data.map((d) => d.porcentaje),
        backgroundColor: data.map((d) =>
          d.porcentaje >= 80 ? 'rgba(26,107,69,0.8)' : d.porcentaje >= 40 ? 'rgba(200,154,46,0.8)' : 'rgba(192,57,43,0.8)'
        ),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#e8f2ed' },
        ticks: { color: '#4a6358', font: { size: 11 } },
        max: horizontal ? 100 : undefined,
      },
      y: {
        grid: { color: '#e8f2ed' },
        ticks: { color: '#4a6358', font: { size: 11 } },
        max: horizontal ? undefined : 100,
      },
    },
  };

  return (
    <div>
      {title && (
        <h3 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--texto)' }}>{title}</h3>
      )}
      <div style={{ height }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
