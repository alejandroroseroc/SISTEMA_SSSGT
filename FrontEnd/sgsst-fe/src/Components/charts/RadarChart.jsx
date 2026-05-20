import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarChart({
  data = [],
  title = 'Nivel de cumplimiento por área',
  height = 350,
}) {
  const labels = data.map((d) => {
    const words = d.estandar.split(' ');
    return words.slice(0, 2).join(' ');
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Cumplimiento %',
        data: data.map((d) => d.porcentaje),
        backgroundColor: 'rgba(26,107,69,0.2)',
        borderColor: '#1a6b45',
        borderWidth: 2,
        pointBackgroundColor: '#1a6b45',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw}%`,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#4a6358',
          font: { size: 10 },
          backdropColor: 'transparent',
        },
        grid: { color: '#d0e5d9' },
        angleLines: { color: '#d0e5d9' },
        pointLabels: { color: '#1c2b22', font: { size: 11, weight: '600' } },
      },
    },
  };

  return (
    <div>
      {title && (
        <h3 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--texto)' }}>{title}</h3>
      )}
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
}
