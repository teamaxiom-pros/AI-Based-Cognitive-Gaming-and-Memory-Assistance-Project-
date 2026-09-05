import React from 'react';
import { UniversalGamePlayer } from './UniversalGamePlayer';
import { PatientLayout } from '../../../components/layout/PatientLayout';

export const AttentionSearchGamePage: React.FC = () => {
  return (
    <PatientLayout pageTitle="Garden Target Search">
      <UniversalGamePlayer initialGameId="attention-finder" />
    </PatientLayout>
  );
};
