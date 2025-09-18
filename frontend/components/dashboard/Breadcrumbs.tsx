'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Breadcrumbs = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  // Don't show breadcrumbs on the dashboard index
  if (pathSegments.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        </li>
        {pathSegments.map((segment, index) => {
          const href = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          // Capitalize the first letter of the segment
          const title = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <li key={href} className="flex items-center">
              <span className="mx-2">/</span>
              <Link href={href} className={`${isLast ? 'font-semibold text-gray-800' : 'hover:text-gray-700'}`}>
                {title}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
