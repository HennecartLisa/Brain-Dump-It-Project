import { useState } from 'react';
import { Card } from 'flowbite-react';
import { 
  WiThunderstorm, 
  WiRain, 
  WiCloudy, 
  WiDayCloudy, 
  WiDaySunny,
  WiSnow,
  WiFog,
  WiTornado
} from 'react-icons/wi';

export default function EmotionalWeatherBoardLayout() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const emotionalWeather = [
    {
      id: 'tornado',
      icon: WiTornado,
      emotion: 'Chaos',
      description: 'Feeling overwhelmed and out of control',
      color: 'text-red-600'
    },
    {
      id: 'thunderstorm',
      icon: WiThunderstorm,
      emotion: 'Angry',
      description: 'Feeling frustrated and upset',
      color: 'text-red-500'
    },
    {
      id: 'rain',
      icon: WiRain,
      emotion: 'Sad',
      description: 'Feeling down and melancholic',
      color: 'text-blue-500'
    },
    {
      id: 'fog',
      icon: WiFog,
      emotion: 'Confused',
      description: 'Feeling unclear and uncertain',
      color: 'text-gray-500'
    },
    {
      id: 'snow',
      icon: WiSnow,
      emotion: 'Numb',
      description: 'Feeling disconnected and cold',
      color: 'text-gray-400'
    },
    {
      id: 'cloudy',
      icon: WiCloudy,
      emotion: 'Neutral',
      description: 'Feeling okay, neither good nor bad',
      color: 'text-gray-600'
    },
    {
      id: 'partly-cloudy',
      icon: WiDayCloudy,
      emotion: 'Hopeful',
      description: 'Feeling optimistic and positive',
      color: 'text-yellow-500'
    },
    {
      id: 'sunny',
      icon: WiDaySunny,
      emotion: 'Happy',
      description: 'Feeling joyful and content',
      color: 'text-yellow-400'
    }
  ];

  const handleEmotionClick = (emotionId: string) => {
    setSelectedEmotion(selectedEmotion === emotionId ? null : emotionId);
  };

  return (
    <Card className='w-full'>
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        Emotional Weather
      </h5>
      
      <div className="grid grid-cols-4 gap-4">
        {emotionalWeather.map((weather) => {
          const IconComponent = weather.icon;
          const isSelected = selectedEmotion === weather.id;
          
          return (
            <div
              key={weather.id}
              className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                isSelected ? 'bg-blue-50 border-2 border-blue-200' : 'border-2 border-transparent'
              }`}
              onClick={() => handleEmotionClick(weather.id)}
            >
              <IconComponent 
                className={`w-12 h-12 transition-all duration-200 ${
                  isSelected ? weather.color : 'text-gray-400'
                }`}
              />
              <span className={`text-sm font-medium mt-2 text-center ${
                isSelected ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {weather.emotion}
              </span>
              <span className={`text-xs text-center mt-1 ${
                isSelected ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {weather.description}
              </span>
            </div>
          );
        })}
      </div>
      
      {selectedEmotion && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            You selected: <span className="font-medium">
              {emotionalWeather.find(w => w.id === selectedEmotion)?.emotion}
            </span>
          </p>
        </div>
      )}
    </Card>
  );
} 