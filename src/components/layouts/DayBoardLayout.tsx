import { Button, Card, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Tooltip, Timeline } from 'flowbite-react';
import '../../App'
import { useState } from 'react';
import CrudAction from '../Crud/CrudAction';
import { VOCAB } from '../../vocal';
import UiButtonCreate from '../ui/UiButtonCreate';
import { HiOutlineClock, HiOutlineCalendar, HiOutlineUser } from 'react-icons/hi';

export default function DayBoardLayout() {
  const [todayEvents, setTodayEvents] = useState([
    { 
      id: 1, 
      title: 'Wake up kids', 
      time: '07:00', 
      description: 'Start the day with morning routine', 
      status: 'completed',
      type: 'routine'
    },
    { 
      id: 2, 
      title: 'Go grocery shopping', 
      time: '10:00', 
      description: 'Check the list', 
      status: 'pending',
      type: 'meeting'
    },
    { 
      id: 3, 
      title: 'Lunch with Emma', 
      time: '12:30', 
      description: 'Bring her jacket back', 
      status: 'pending',
      type: 'break'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <HiOutlineUser className="w-4 h-4" />;
      case 'routine':
        return <HiOutlineCalendar className="w-4 h-4" />;
      case 'work':
        return <HiOutlineClock className="w-4 h-4" />;
      default:
        return <HiOutlineClock className="w-4 h-4" />;
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card className='w-full'>
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        Today's Timeline
      </h5>
      
      <div className="text-sm text-gray-600 mb-4">
        {today}
      </div>

      <div className="space-y-4">
        {todayEvents.map((event, index) => (
          <div key={event.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {getTypeIcon(event.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${getStatusColor(event.status)}`}>
                {event.time}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {event.title}
              </div>
              <div className="text-xs text-gray-500">
                {event.description}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Checkbox 
                  id={`event-${event.id}`} 
                  checked={event.status === 'completed'}
                  onChange={() => {
                  }}
                />
                <Label htmlFor={`event-${event.id}`} className="text-xs">
                  {event.status === 'completed' ? 'Completed' : 'Mark as done'}
                </Label>
                <CrudAction
                  listTitle="Today's Event"
                  identificator={String(event.id)}
                  lable="Event Name"
                  textValue={event.title}
                  brainDumpType="NEW_TASK_ROUTINE"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <UiButtonCreate actionType="NEW_TASK" />
      </div>
    </Card>
  );
} 