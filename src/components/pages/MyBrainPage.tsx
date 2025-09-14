import RoutineBoardLayout from '../layouts/RoutineBoardLayout';
import BrainDumpLayout from '../layouts/BrainDumpLayout';
import ChallengesBoardLayout from '../layouts/ChallengesBoardLayout';
import MealPlannerBoardLayout from '../layouts/MealPlannerBoardLayout';
import CalendarBoardLayout from '../layouts/CalendarBoardLayout';
import DayBoardLayout from '../layouts/DayBoardLayout';
import TaskBoardLayout from '../layouts/TaskBoardLayout';
import EmotionalWeatherBoardLayout from '../layouts/EmotionalWeatherBoardLayout';

export default function MyBrainPage() {
  return (
    <>
      <div className="col-span-4">
        <div className="row-span-2">
          <ChallengesBoardLayout></ChallengesBoardLayout>
        </div>
        <div className="row-span-2">
          <RoutineBoardLayout></RoutineBoardLayout>
        </div>
        <div className="row-span-2">
          <MealPlannerBoardLayout></MealPlannerBoardLayout>
        </div>
      </div>
      <div className="col-span-4">
        <div className="row-span-2">
          <CalendarBoardLayout></CalendarBoardLayout>
        </div>
        <div className="row-span-2">
          <DayBoardLayout></DayBoardLayout>
        </div>
      </div>
      <div className="col-span-4">
        <div className="row-span-2">
          <BrainDumpLayout></BrainDumpLayout>
        </div>
        <div className="row-span-2">
          <TaskBoardLayout></TaskBoardLayout>
        </div>
        <div className="row-span-2">
          <EmotionalWeatherBoardLayout></EmotionalWeatherBoardLayout>
        </div>
      </div>
    </>
  );
}
