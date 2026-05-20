import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function LineChart({
  data = [],
  title = 'Evolución del progreso',
  height = 250,
}) {
  const labels = data.map((d) => d.fecha);
  const values = data.map((d) => d.valor);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ítems completados',
        data: values,
        fill: true,
        borderColor: '#1a6b45',
        backgroundColor: 'rgba(26,107,69,0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#1a6b45',
        pointRadius: 4,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} ítems`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#e8f2ed' },
        ticks: { color: '#4a6358', font: { size: 10 }, maxRotation: 45 },
      },
      y: {
        grid: { color: '#e8f2ed' },
        ticks: { color: '#4a6358', font: { size: 10 } },
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      {title && (
        <h3 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--texto)' }}>{title}</h3>
      )}
      <div style={{ height }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
