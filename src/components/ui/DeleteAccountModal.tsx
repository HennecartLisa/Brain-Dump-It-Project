import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react';
import { HiExclamation } from 'react-icons/hi';
import { VOCAB } from '../../vocal';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteAccountModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false 
}: DeleteAccountModalProps) {
  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <ModalHeader className="border-b border-red-200">
        <div className="flex items-center gap-2">
          <HiExclamation className="h-6 w-6 text-red-600" />
          <span className="text-xl font-semibold text-red-800">
            {VOCAB.DELETE_PROFILE_CONFIRM_TITLE}
          </span>
        </div>
      </ModalHeader>
      
      <ModalBody className="p-6">
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-800 font-medium">
              {VOCAB.DELETE_PROFILE_WARNING}
            </p>
          </div>
          
          <p className="text-gray-700">
            {VOCAB.DELETE_PROFILE_CONFIRM_MESSAGE}
          </p>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">What will be deleted:</h4>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Your profile and personal information</li>
              <li>All your tasks and lists</li>
              <li>Your group memberships and collaborations</li>
              <li>Your preferences and settings</li>
              <li>All associated data and history</li>
            </ul>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter className="border-t border-gray-200">
        <div className="flex gap-3 w-full">
          <Button 
            color="gray" 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {VOCAB.DELETE_PROFILE_CANCEL_BUTTON}
          </Button>
          <Button 
            color="failure" 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Deleting..." : VOCAB.DELETE_PROFILE_CONFIRM_BUTTON}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
