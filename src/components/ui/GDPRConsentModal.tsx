import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react';
import { HiShieldCheck, HiDocumentText, HiClock, HiUser, HiCog } from 'react-icons/hi';
import { VOCAB } from '../../vocal';

interface GDPRConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GDPRConsentModal({ isOpen, onClose }: GDPRConsentModalProps) {
  return (
    <Modal show={isOpen} onClose={onClose} size="4xl">
      <ModalHeader className="border-b border-gray-200">
        <div className="flex items-center gap-2">
          <HiShieldCheck className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold">{VOCAB.PRIVACY_POLICY_TITLE}</span>
        </div>
      </ModalHeader>
      
      <ModalBody className="space-y-6 p-6 max-h-96 overflow-y-auto">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <HiDocumentText className="h-5 w-5" />
            {VOCAB.PRIVACY_INTRO_TITLE}
          </h3>
          <p className="text-blue-800">
            {VOCAB.PRIVACY_INTRO_TEXT}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <HiUser className="h-5 w-5 text-gray-600" />
            {VOCAB.PRIVACY_CONTROLLER_TITLE}
          </h3>
          <p className="text-gray-700 mb-2">
            {VOCAB.PRIVACY_CONTROLLER_TEXT}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <HiCog className="h-5 w-5 text-gray-600" />
            {VOCAB.PRIVACY_DATA_WE_COLLECT_TITLE}
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-800">{VOCAB.PRIVACY_ACCOUNT_INFO}</h4>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                {VOCAB.PRIVACY_ACCOUNT_INFO_POINTS.map((t, i) => (
                  <li key={`acc-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{VOCAB.PRIVACY_USAGE_DATA}</h4>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                {VOCAB.PRIVACY_USAGE_DATA_POINTS.map((t, i) => (
                  <li key={`use-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{VOCAB.PRIVACY_TECHNICAL_DATA}</h4>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                {VOCAB.PRIVACY_TECHNICAL_DATA_POINTS.map((t, i) => (
                  <li key={`tech-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">{VOCAB.PRIVACY_LEGAL_BASIS_TITLE}</h3>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-800">{VOCAB.PRIVACY_LEGAL_CONTRACT}</h4>
              <p className="text-gray-700 text-sm">{VOCAB.PRIVACY_LEGAL_CONTRACT_TEXT}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-800">{VOCAB.PRIVACY_LEGAL_LEGIT_INTEREST}</h4>
              <p className="text-gray-700 text-sm">{VOCAB.PRIVACY_LEGAL_LEGIT_INTEREST_TEXT}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-800">{VOCAB.PRIVACY_LEGAL_CONSENT}</h4>
              <p className="text-gray-700 text-sm">{VOCAB.PRIVACY_LEGAL_CONSENT_TEXT}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">{VOCAB.PRIVACY_USE_OF_DATA_TITLE}</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {VOCAB.PRIVACY_USE_OF_DATA_POINTS.map((t, i) => (
              <li key={`useof-${i}`}>{t}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">{VOCAB.PRIVACY_SHARING_TITLE}</h3>
          <p className="text-gray-700 mb-2">{VOCAB.PRIVACY_SHARING_INTRO}</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {VOCAB.PRIVACY_SHARING_POINTS.map((t, i) => (
              <li key={`share-${i}`}>{t}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <HiClock className="h-5 w-5 text-gray-600" />
            {VOCAB.PRIVACY_RETENTION_TITLE}
          </h3>
          <p className="text-gray-700 mb-2">{VOCAB.PRIVACY_RETENTION_INTRO}</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {VOCAB.PRIVACY_RETENTION_POINTS.map((t, i) => (
              <li key={`ret-${i}`}>{t}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">{VOCAB.PRIVACY_RIGHTS_TITLE}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VOCAB.PRIVACY_RIGHTS_LIST.map((t, i) => (
              <div key={`right-${i}`} className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800">{t}</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">{VOCAB.PRIVACY_CONTACT_TITLE}</h3>
          <p className="text-gray-700 mb-2">
            {VOCAB.PRIVACY_CONTACT_TEXT}
          </p>
          <ul className="text-gray-700 space-y-1">
            <li>Email: {VOCAB.PRIVACY_CONTACT_EMAIL}</li>
            <li>Data Protection Officer: {VOCAB.PRIVACY_CONTACT_DPO}</li>
          </ul>
          <p className="text-gray-600 text-sm mt-2">
            {VOCAB.PRIVACY_ICO_TEXT}
          </p>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>Last updated: {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </ModalBody>
      
      <ModalFooter className="border-t border-gray-200">
        <Button onClick={onClose} color="blue">{VOCAB.PRIVACY_UNDERSTAND_BUTTON}</Button>
      </ModalFooter>
    </Modal>
  );
}
