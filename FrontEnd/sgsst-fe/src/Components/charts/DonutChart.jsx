import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#1a6b45', '#2a9060', '#3aad78', '#c89a2e', '#e0b84a',
  '#4a6358', '#8ab4a0',
];

export default function DonutChart({
  data = [],
  title = 'Cumplimiento por estándar',
  height = 300,
}) {
  const chartData = {
    labels: data.map((d) => `${d.numero}. ${d.titulo}`),
    datasets: [
      {
        data: data.map((d) => d.porcentaje),
        backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 11 },
          color: '#1c2b22',
          boxWidth: 12,
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`,
        },
      },
    },
  };

  return (
    <div>
      {title && (
        <h3 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--texto)' }}>{title}</h3>
      )}
      <div style={{ height }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
