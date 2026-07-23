import { Empty } from 'antd';

import type { ReactNode } from 'react';

export interface EmptyPlaceholderPropsInterface {
  description: string;
  children?: ReactNode;
}

export const EmptyPlaceholder = ({ description, children }: EmptyPlaceholderPropsInterface) => {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={description}
    >
      {children}
    </Empty>
  );
};
