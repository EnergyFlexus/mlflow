import { GenericInputModal } from 'experiment-tracking/components/modals/GenericInputModal';
import { ChangeStateForm } from './ChangeStateForm';
import { HTTPMethods, fetchEndpoint } from 'common/utils/FetchUtils';
import { RunState } from 'experiment-tracking/types';

interface Props {
  isOpen: boolean;
  states: RunState[];
  currState: RunState;
  runId: string;
  onClose: (...args: any[]) => any;
  onSubmit: (stateId: string) => any;
}

export const ChangeStateModal = ({ isOpen, states, currState, runId, onClose, onSubmit }: Props) => {
  return (
    <GenericInputModal
      title={'Change State'}
      okText="Confirm"
      isOpen={isOpen}
      handleSubmit={async (values: any) => {
        const stateId = values['stateId'];
        fetchEndpoint({
          relativeUrl: `ajax-api/2.0/mlflow/states/set`,
          method: HTTPMethods.POST,
          body: JSON.stringify({
            state_id: stateId,
            run_id: runId
          }),
          success: async ({ resolve, response }: any) => {
            onSubmit(stateId)
            resolve();
            onClose();
          },
        });
      }}
      onClose={onClose}
    >
      <ChangeStateForm states={states} currState={currState} />
    </GenericInputModal>
  );
};
