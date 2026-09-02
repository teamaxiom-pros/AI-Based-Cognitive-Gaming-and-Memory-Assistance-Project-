import React from 'react';
import { UniversalGamePlayer } from './UniversalGamePlayer';
import { PatientLayout } from '../../../components/layout/PatientLayout';

export const MemoryMatchGamePage: React.FC = () => {
  return (
    <PatientLayout pageTitle="Assam Heritage Match">
      <UniversalGamePlayer initialGameId="memory-match" />
    </PatientLayout>
  );
};
