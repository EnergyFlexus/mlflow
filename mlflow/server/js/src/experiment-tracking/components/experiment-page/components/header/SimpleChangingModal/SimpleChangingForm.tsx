import { Form, Input } from '@databricks/design-system';

interface Props {
  innerRef?: any;
  inputName: string;
  rulesMessage: string;
  inputLabel: string;
  placeholder: string;
}

export const SimpleChangingForm = ({ innerRef, inputName, rulesMessage, inputLabel, placeholder }: Props) => {
  return (
    // @ts-expect-error TS(2322)
    <Form ref={innerRef} layout="vertical">
      <Form.Item name={inputName} rules={[{ required: true, message: rulesMessage }]} label={inputLabel}>
        <Input placeholder={placeholder} data-testid={'change' + inputName} />
      </Form.Item>
    </Form>
  );
};
