import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, Label, TextInput, Radio } from 'flowbite-react';
import { useState } from 'react';
import { HiEye, HiColorSwatch, HiDocumentText } from 'react-icons/hi';

interface ComfortModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ComfortModeSettings) => void;
}

export interface ComfortModeSettings {
  colorScheme: 'default' | 'high-contrast';
  textSize: number;
  typography: 'default' | 'dyslexic' | 'sans-serif';
}

const DEFAULT_SETTINGS: ComfortModeSettings = {
  colorScheme: 'default',
  textSize: 100,
  typography: 'default'
};

const COLOR_SCHEMES = {
  default: {
    name: 'Default Colors',
    colors: ['#F0F0FA', '#646cff', '#61dafb', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6'],
    description: 'Full color palette'
  },
  'high-contrast': {
    name: 'High Contrast',
    colors: ['#000000', '#ffffff', '#666666', '#333333', '#999999', '#cccccc', '#444444'],
    description: 'Black, white, and shades of gray'
  }
};

const TYPOGRAPHY_OPTIONS = {
  default: {
    name: 'Default',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    description: 'Standard system font'
  },
  dyslexic: {
    name: 'OpenDyslexic',
    fontFamily: 'OpenDyslexic, monospace',
    description: 'Designed for dyslexic readers'
  },
  'sans-serif': {
    name: 'Clear Sans',
    fontFamily: 'Arial, Helvetica, sans-serif',
    description: 'Clean, highly legible sans-serif'
  }
};

export default function ComfortModeModal({ isOpen, onClose, onSave }: ComfortModeModalProps) {
  const [settings, setSettings] = useState<ComfortModeSettings>(DEFAULT_SETTINGS);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleCancel = () => {
    setSettings(DEFAULT_SETTINGS);
    onClose();
  };

  const getSampleTextStyle = () => {
    const typography = TYPOGRAPHY_OPTIONS[settings.typography];
    return {
      fontSize: `${settings.textSize}%`,
      fontFamily: typography.fontFamily,
      color: settings.colorScheme === 'high-contrast' ? '#000000' : '#000000',
      backgroundColor: settings.colorScheme === 'high-contrast' ? '#ffffff' : '#F0F0FA'
    };
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl">
      <ModalHeader className="border-b border-gray-200">
        <div className="flex items-center gap-2">
          <HiEye className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold">Comfort Mode Settings</span>
        </div>
      </ModalHeader>
      
      <ModalBody className="space-y-6 p-6">
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <HiDocumentText className="h-5 w-5" />
              Live Preview
            </h3>
            <div 
              className="p-4 rounded-lg border-2 border-dashed border-gray-300"
              style={getSampleTextStyle()}
            >
              <h4 className="text-lg font-semibold mb-2">Sample Heading</h4>
              <p className="mb-2">
                This is a sample paragraph to demonstrate how your text will appear with the selected settings. 
                You can see the font family, size, and color scheme in action.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Sample list item one</li>
                <li>Sample list item two</li>
                <li>Sample list item three</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <HiColorSwatch className="h-5 w-5" />
              Color Scheme
            </h3>
            <div className="space-y-4">
              {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Radio
                        id={`color-${key}`}
                        name="colorScheme"
                        value={key}
                        checked={settings.colorScheme === key}
                        onChange={(e) => setSettings(prev => ({ ...prev, colorScheme: e.target.value as 'default' | 'high-contrast' }))}
                      />
                      <Label htmlFor={`color-${key}`} className="text-sm font-medium">
                        {scheme.name}
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500">{scheme.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {scheme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-md border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Text Size</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="textSize" className="text-sm font-medium min-w-0">
                  Size: {settings.textSize}%
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    color="gray"
                    onClick={() => setSettings(prev => ({ ...prev, textSize: Math.max(50, prev.textSize - 10) }))}
                    disabled={settings.textSize <= 50}
                  >
                    -
                  </Button>
                  <TextInput
                    id="textSize"
                    type="number"
                    value={settings.textSize.toString()}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 100;
                      setSettings(prev => ({ ...prev, textSize: Math.min(200, Math.max(50, value)) }));
                    }}
                    min={50}
                    max={200}
                    className="w-20"
                    sizing="sm"
                  />
                  <Button
                    size="xs"
                    color="gray"
                    onClick={() => setSettings(prev => ({ ...prev, textSize: Math.min(200, prev.textSize + 10) }))}
                    disabled={settings.textSize >= 200}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Range: 50% - 200% (50% = very small, 100% = normal, 200% = very large)
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Typography</h3>
            <div className="space-y-3">
              {Object.entries(TYPOGRAPHY_OPTIONS).map(([key, option]) => (
                <div key={key} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Radio
                        id={`typography-${key}`}
                        name="typography"
                        value={key}
                        checked={settings.typography === key}
                        onChange={(e) => setSettings(prev => ({ ...prev, typography: e.target.value as 'default' | 'dyslexic' | 'sans-serif' }))}
                      />
                      <div>
                        <Label htmlFor={`typography-${key}`} className="text-sm font-medium">
                          {option.name}
                        </Label>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </div>
                    <div 
                      className="text-sm px-3 py-1 bg-gray-100 rounded"
                      style={{ fontFamily: option.fontFamily }}
                    >
                      Sample Abc123
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </ModalBody>

      <ModalFooter className="border-t border-gray-200">
        <div className="flex justify-end gap-3 w-full">
          <Button color="gray" onClick={handleCancel}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
