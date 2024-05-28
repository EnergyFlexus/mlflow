import { GenericInputModal } from 'experiment-tracking/components/modals/GenericInputModal';
import { SimpleChangingForm } from './SimpleChangingForm';

interface Props {
  isOpen: boolean;
  onClose: (...args: any[]) => any;
  onSubmit: (newValue: any) => any;
  title: string;
  inputName: string;
  rulesMessage: string;
  inputLabel: string;
  placeholder: string;
}

export const SimpleChangingModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  inputName,
  rulesMessage,
  inputLabel,
  placeholder,
}: Props) => {
  return (
    <GenericInputModal
      title={title}
      okText="Confirm"
      isOpen={isOpen}
      handleSubmit={async (values: any) => {
        onSubmit(values[inputName]);
      }}
      onClose={onClose}
    >
      <SimpleChangingForm
        inputName={inputName}
        rulesMessage={rulesMessage}
        inputLabel={inputLabel}
        placeholder={placeholder}
      />
    </GenericInputModal>
  );
};
