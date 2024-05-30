import { Form, Input } from '@databricks/design-system';
import { Select } from 'antd';
import { RunState } from 'experiment-tracking/types';

interface Props {
  innerRef?: any;
  states: RunState[];
  currState: RunState;
}

export const ChangeStateForm = ({ innerRef, states, currState }: Props) => {
  return (
    // @ts-expect-error TS(2322)
    <Form ref={innerRef} layout="vertical">
      <Form.Item
        name="stateId"
        rules={[{ required: true, message: '' }]}
        label="state"
        initialValue={currState.state_id}
      >
        <Select placeholder="select state" data-testid="change state">
          {states.map((state) => {
            return <Select.Option value={state.state_id}>{state.name}</Select.Option>;
          })}
        </Select>
      </Form.Item>
    </Form>
  );
};
