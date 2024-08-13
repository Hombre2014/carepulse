import clsx from 'clsx';
import Image from 'next/image';

import { StatusIcon } from '@/constants';

export const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <div
      className={clsx('status-badge', {
        'bg-green-600': status === 'scheduled',
        'bg-red-600': status === 'cancelled',
        'bg-blue-600': status === 'pending',
      })}
    >
      <Image
        src={StatusIcon[status]}
        className="h-fit w-3"
        alt={status}
        height={24}
        width={24}
      />
      <p
        className={clsx('text-12-semibold capitalize', {
          'text-green-500': status === 'scheduled',
          'text-blue-500': status === 'pending',
          'text-red-500': status === 'cancelled',
        })}
      >
        {status}
      </p>
    </div>
  );
};
