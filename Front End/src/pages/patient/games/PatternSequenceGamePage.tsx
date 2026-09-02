import React from 'react';
import { UniversalGamePlayer } from './UniversalGamePlayer';
import { PatientLayout } from '../../../components/layout/PatientLayout';

export const PatternSequenceGamePage: React.FC = () => {
  return (
    <PatientLayout pageTitle="Rhythm Sequence Builder">
      <UniversalGamePlayer initialGameId="sequence-builder" />
    </PatientLayout>
  );
};
