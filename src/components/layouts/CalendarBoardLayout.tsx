import { Button, Card, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Tooltip } from 'flowbite-react';
import '../../App'
import { useState } from 'react';
import CrudAction from '../Crud/CrudAction';
import { VOCAB } from '../../vocal';
import UiButtonCreate from '../ui/UiButtonCreate';

export default function CalendarBoardLayout() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 11, title: 'Team Meeting', date: '2024-01-15', time: '10:00', description: 'Weekly team sync', status: 'pending' },
    { id: 12, title: 'Doctor Appointment', date: '2024-01-16', time: '14:30', description: 'Annual checkup', status: 'pending' },
    { id: 13, title: 'Grocery Shopping', date: '2024-01-17', time: '18:00', description: 'Buy groceries for the week', status: 'pending' },
    { id: 14, title: 'Movie Night', date: '2024-01-18', time: '20:00', description: 'Watch new movie', status: 'pending' },
    { id: 15, title: 'Gym Session', date: '2024-01-19', time: '07:00', description: 'Morning workout', status: 'pending' },
    { id: 16, title: 'Dinner with Friends', date: '2024-01-20', time: '19:00', description: 'Restaurant dinner', status: 'pending' },
    { id: 17, title: 'Laundry Day', date: '2024-01-21', time: '10:00', description: 'Do laundry', status: 'pending' }
  ]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card className='w-full'>
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        Weekly Calendar
      </h5>
      
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 p-1">
            {day}
          </div>
        ))}
        
        {weekDates.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentDay = isToday(date);
          
          return (
            <div 
              key={index} 
              className={`min-h-[60px] p-1 border border-gray-200 rounded text-xs ${
                isCurrentDay ? 'bg-blue-100 border-blue-300' : ''
              }`}
            >
              <div className={`text-right mb-1 ${
                isCurrentDay ? 'font-bold text-blue-600' : 'text-gray-600'
              }`}>
                {date.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div 
                    key={event.id} 
                    className="bg-gray-100 rounded px-1 py-0.5 text-xs truncate cursor-pointer hover:bg-gray-200"
                    title={`${event.title} - ${event.time}`}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-gray-500 text-xs">{event.time}</div>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-gray-500 text-xs text-center">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4">
        <UiButtonCreate actionType="NEW_TASK" />
      </div>
    </Card>
  );
} 