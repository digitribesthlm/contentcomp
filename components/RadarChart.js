import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RadarChart = ({ data }) => {
  const chartData = {
    labels: [
      'Reciprocity',
      'Scarcity',
      'Authority',
      'Consistency',
      'Liking',
      'Social Proof',
    ],
    datasets: [
      {
        label: 'Persuasion Scores',
        data: [
          data.reciprocity_score,
          data.scarcity_score,
          data.authority_score,
          data.consistency_score,
          data.liking_score,
          data.social_proof_score,
        ],
        backgroundColor: 'rgba(34, 202, 236, 0.2)',
        borderColor: 'rgba(34, 202, 236, 1)',
        borderWidth: 2,
      },
    ],
  };

  return <Radar data={chartData} />;
};

export default RadarChart;
