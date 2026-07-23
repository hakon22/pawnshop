import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export interface PageHeaderPropsInterface {
  title: string;
  description: string;
}

export const PageHeader = ({ title, description }: PageHeaderPropsInterface) => {
  return (
    <div>
      <Title level={2} className="!mb-1 !text-[var(--color-primary)]">
        {title}
      </Title>
      <Paragraph type="secondary" className="!mb-0">
        {description}
      </Paragraph>
    </div>
  );
};
