'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { WorldMap } from 'react-svg-worldmap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import ProtectedPage from "../components/ProtectedPage";
import YourDashboardComponent from "../components/YourDashboardComponent";

export default function Home() {
  return (
    <ProtectedPage>
      <YourDashboardComponent />
    </ProtectedPage>
  );
}
