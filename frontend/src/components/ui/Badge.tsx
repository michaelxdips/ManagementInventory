import { PropsWithChildren } from 'react';
import clsx from 'clsx';

type Variant = 'pending' | 'approved' | 'rejected' | 'neutral';

const variantClass: Record<Variant, string> = {
  pending: 'badge badge-pending',
  approved: 'badge badge-approved',
  rejected: 'badge badge-rejected',
  neutral: 'badge badge-neutral',
};

type Props = PropsWithChildren<{ variant?: Variant; className?: string }>;

const Badge = ({ variant = 'neutral', className, children }: Props) => {
  return <span className={clsx(variantClass[variant], className)}>{children}</span>;
};

export default Badge;
