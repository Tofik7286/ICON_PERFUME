'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Breadcrumb = () => {
    const pathname = usePathname();

    // Get the current pathname and split it into segments
    const pathSegments = pathname
        .split('/')
        .filter((segment) => segment); // Remove empty segments (like the leading slash)

    // Remove the SKU and description from the breadcrumb
    const filteredSegments = pathSegments.filter((segment, index) => {
        // Assuming the SKU is always at index 2 and the description is always at index 3
        return index !== 2 && index !== 3;
    });

    return (
        <nav aria-label="breadcrumb"  className="breadcrumb !m-0">
            <ol className="breadcrumbList">
                {/* Add Home as the first breadcrumb */}
                <li className="breadcrumbItem">
                    <Link style={{color:"var(--text-color) !important"}} href="/">Home</Link>
                </li>
                {filteredSegments.map((segment, index) => {
                    // Build the route for the current breadcrumb
                    const href = '/' + filteredSegments.slice(0, index + 1).join('/');
                    // Make the last breadcrumb non-clickable
                    const isLast = index === filteredSegments.length - 1;

                    return (
                        <li
                            key={index}
                            className={`breadcrumbItem ${isLast ? 'active' : ''}`}
                        >
                            {isLast ? (
                                <span>
                                    {segment.replace(/-/g, ' ').length > 40
                                        ? segment.replace(/-/g, ' ').slice(0, 40) + '...'
                                        : segment.replace(/-/g, ' ')}
                                </span>
                            ) : (
                                <Link href={href}>{segment.replace(/-/g, ' ')}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
