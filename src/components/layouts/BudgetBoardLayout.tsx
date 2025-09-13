import { Button, Card, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Tooltip, Avatar, AvatarGroup } from 'flowbite-react';
import '../../App'
import { useState } from 'react';
import CrudAction from '../Crud/CrudAction';
import { VOCAB } from '../../vocal';
import UiButtonCreate from '../ui/UiButtonCreate';
import { HiOutlinePlus, HiOutlineClock } from 'react-icons/hi';

export default function BudgetBoardLayout() {
  const [budgetData, setBudgetData] = useState([
    { 
      id: 1, 
      category: 'Food & Dining', 
      spent: 450, 
      budget: 600, 
      color: '#3B82F6',
      percentage: 75
    },
    { 
      id: 2, 
      category: 'Transportation', 
      spent: 120, 
      budget: 200, 
      color: '#10B981',
      percentage: 60
    },
    { 
      id: 3, 
      category: 'Entertainment', 
      spent: 80, 
      budget: 150, 
      color: '#F59E0B',
      percentage: 53
    },
    { 
      id: 4, 
      category: 'Shopping', 
      spent: 200, 
      budget: 300, 
      color: '#EF4444',
      percentage: 67
    },
    { 
      id: 5, 
      category: 'Utilities', 
      spent: 150, 
      budget: 200, 
      color: '#8B5CF6',
      percentage: 75
    }
  ]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Food & Dining', amount: 25.50, description: 'Lunch at restaurant', date: '2024-01-15' },
    { id: 2, category: 'Transportation', amount: 15.00, description: 'Gas station', date: '2024-01-14' },
    { id: 3, category: 'Entertainment', amount: 12.99, description: 'Movie ticket', date: '2024-01-13' },
    { id: 4, category: 'Shopping', amount: 45.00, description: 'New clothes', date: '2024-01-12' },
    { id: 5, category: 'Utilities', amount: 75.00, description: 'Electricity bill', date: '2024-01-11' }
  ]);

  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0);
  const totalBudget = budgetData.reduce((sum, item) => sum + item.budget, 0);
  const remainingBudget = totalBudget - totalSpent;

  const renderPieChart = () => {
    let cumulativePercentage = 0;
    
    return (
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {budgetData.map((item, index) => {
            const percentage = (item.spent / totalBudget) * 100;
            const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            
            const x1 = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin(endAngle * Math.PI / 180);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            cumulativePercentage += percentage;
            
            return (
              <path
                key={item.id}
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold">${totalSpent}</div>
            <div className="text-xs text-gray-500">spent</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className='w-full'>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          Budget Overview
        </h5>
        
        {renderPieChart()}
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Total Budget:</span>
            <span className="text-sm font-bold">${totalBudget}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Total Spent:</span>
            <span className="text-sm font-bold text-red-600">${totalSpent}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Remaining:</span>
            <span className={`text-sm font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${remainingBudget}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {budgetData.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs">{item.category}</span>
              </div>
              <div className="text-xs">
                <span className="text-red-600">${item.spent}</span>
                <span className="text-gray-500"> / ${item.budget}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <UiButtonCreate actionType="NEW_TASK" />
          <Button 
            size="sm" 
            color="light"
            className="flex items-center gap-2"
            onClick={() => setShowHistoryModal(true)}
          >
            <HiOutlineClock className="w-4 h-4" />
            History
          </Button>
        </div>
      </Card>

      <Modal show={showHistoryModal} onClose={() => setShowHistoryModal(false)} size="lg">
        <ModalHeader>Expense History</ModalHeader>
        <ModalBody>
          <Table>
            <TableHead>
              <TableHeadCell>Date</TableHeadCell>
              <TableHeadCell>Category</TableHeadCell>
              <TableHeadCell>Description</TableHeadCell>
              <TableHeadCell>Amount</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-sm">{expense.date}</TableCell>
                  <TableCell className="text-sm">{expense.category}</TableCell>
                  <TableCell className="text-sm">{expense.description}</TableCell>
                  <TableCell className="text-sm font-medium">${expense.amount}</TableCell>
                  <TableCell>
                    <CrudAction
                      listTitle="Edit Expense"
                      identificator={String(expense.id)}
                      lable="Expense Description"
                      textValue={expense.description}
                      brainDumpType="NEW_TASK_ROUTINE"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowHistoryModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </>
  );
} 