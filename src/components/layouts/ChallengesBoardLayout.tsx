import { Button, Card, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Tooltip } from 'flowbite-react';
import '../../App'
import { useState } from 'react';
import CrudAction from '../Crud/CrudAction';
import { VOCAB } from '../../vocal';
import UiButtonCreate from '../ui/UiButtonCreate';

export default function ChallengesBoardLayout() {

  // TODO: Fetch the challenges data from supabase

  return (
  <Card className='w-full'>
    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Daily Challenges
      </h5>
      <UiButtonCreate actionType="NEW_TASK" />
  </Card>
);} 