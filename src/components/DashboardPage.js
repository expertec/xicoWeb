import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import ProspectModal from './ProspectModal';
import { db } from '../firebase'; // Asegúrate de tener la configuración correcta de Firebase en este archivo
import { collection, onSnapshot } from 'firebase/firestore';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prospectData, setProspectData] = useState([]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'prospects'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      const aggregatedData = data.reduce((acc, curr) => {
        const state = curr.state;
        if (!acc[state]) {
          acc[state] = 0;
        }
        acc[state]++;
        return acc;
      }, {});

      const formattedData = Object.keys(aggregatedData).map(key => ({
        state: key,
        count: aggregatedData[key]
      }));

      setProspectData(formattedData);
    });

    return () => unsubscribe(); // Cleanup the subscription on unmount
  }, []);

  const COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#FF8042', '#00C49F'];

  const totalProspects = prospectData.reduce((acc, curr) => acc + curr.count, 0);

  const dataWithPercentage = prospectData.map(item => ({
    ...item,
    percentage: ((item.count / totalProspects) * 100).toFixed(2),
  }));

  return (
    <div>
     


      <PieChart width={400} height={400}>
        <Pie
          data={dataWithPercentage}
          dataKey="count"
          nameKey="state"
          cx="50%"
          cy="50%"
          innerRadius={70} // Establece el innerRadius para crear el efecto donut
          outerRadius={150}
          fill="#8884d8"
          label={({ state, percentage }) => `${state}: ${percentage}%`}
        >
          {dataWithPercentage.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default DashboardPage;
