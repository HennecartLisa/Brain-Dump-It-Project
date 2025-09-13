import { Button, Card, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Tooltip } from 'flowbite-react';
import '../../App'
import { useState } from 'react';
import CrudAction from '../Crud/CrudAction';
import { VOCAB } from '../../vocal';
import UiButtonCreate from '../ui/UiButtonCreate';
  
export default function MealPlannerBoardLayout() {
  const [meals, setMeals] = useState([
    { id: 1, name: 'Breakfast - Oatmeal', description: 'Oatmeal with berries and nuts', status: 'pending', assignee: 'John Doe' },
    { id: 2, name: 'Lunch - Salad', description: 'Mixed green salad with chicken', status: 'pending', assignee: 'John Doe' },
    { id: 3, name: 'Dinner - Pasta', description: 'Spaghetti with tomato sauce', status: 'pending', assignee: 'John Doe' },
    { id: 4, name: 'Snack - Apple', description: 'Fresh apple with peanut butter', status: 'pending', assignee: 'John Doe' },
    { id: 5, name: 'Dessert - Yogurt', description: 'Greek yogurt with honey', status: 'pending', assignee: 'John Doe' },
    { id: 6, name: 'Drink - Water', description: '8 glasses of water daily', status: 'pending', assignee: 'John Doe' },
    { id: 7, name: 'Prep - Vegetables', description: 'Wash and cut vegetables', status: 'pending', assignee: 'John Doe' }
  ]);


  return (
  <Card className='w-full'>
    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Meal Planner
      </h5>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="hidden"><span className="sr-only">{VOCAB.CHECK}</span></TableHeadCell>
            <TableHeadCell className="hidden">Meal name</TableHeadCell>
            <TableHeadCell className="hidden"><span className="sr-only">{VOCAB.EDIT}</span></TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {meals.map((meal) => (
            <TableRow key={meal.id} className="!py-0 !h-8">
              <TableCell className="!py-1"><Checkbox id={meal.name}></Checkbox></TableCell>
              <TableCell className="!py-1"><Tooltip content={meal.description}><Label htmlFor={meal.name}>{meal.name}</Label></Tooltip></TableCell>
              <TableCell className="!py-1">
                <CrudAction
                  listTitle="Meal Planner"
                  identificator={String(meal.id)}
                  lable="Meal Name"
                  textValue={meal.name}
                  brainDumpType="NEW_TASK_ROUTINE"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <UiButtonCreate actionType="NEW_TASK" />
  </Card>
);} 