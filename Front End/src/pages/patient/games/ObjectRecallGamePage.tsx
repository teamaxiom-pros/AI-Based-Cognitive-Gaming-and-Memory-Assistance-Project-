import React from 'react';
import { UniversalGamePlayer } from './UniversalGamePlayer';
import { PatientLayout } from '../../../components/layout/PatientLayout';

export const ObjectRecallGamePage: React.FC = () => {
  return (
    <PatientLayout pageTitle="Objects Tray Recall">
      <UniversalGamePlayer initialGameId="picture-recall" />
    </PatientLayout>
  );
};
