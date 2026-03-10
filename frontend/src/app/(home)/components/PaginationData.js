'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const PaginationData = ({ totalPages, initialPage = 1 }) => {
    
    const [currentPage, setCurrentPage] = useState(initialPage);
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()

    // ✅ Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            const params = new URLSearchParams(window.location.search);
            params.set("page", page); // Setting the "query" parameter with the new value

            const newUrl = `${window.location.pathname}?${params.toString()}#product`;
            router.push(newUrl)
        }
    };
    useEffect(() => {
        const page = parseInt(searchParams.get('page'))
        if (!page) {
            setCurrentPage(initialPage)
        }
        else {
            setCurrentPage(page)
        }
    }, [searchParams])
    const renderPageNumbers = () => {
        const pages = [];

        // Always show the first page
        pages.push(renderPageItem(1));

        if (totalPages <= 4) {
            // Show all pages if there are 4 or fewer pages
            for (let i = 2; i <= totalPages; i++) {
                pages.push(renderPageItem(i));
            }
        } else {
            if (currentPage <= 3) {
                // Current page is near the beginning
                for (let i = 2; i <= 4; i++) {
                    pages.push(renderPageItem(i));
                }
                pages.push(<PaginationEllipsis key="ellipsis-end" />);
            } else if (currentPage >= totalPages - 2) {
                // Current page is near the end
                pages.push(<PaginationEllipsis key="ellipsis-start" />);
                for (let i = totalPages - 3; i <= totalPages - 1; i++) {
                    pages.push(renderPageItem(i));
                }
            } else {
                // Current page is in the middle
                pages.push(<PaginationEllipsis key="ellipsis-start" />);
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(renderPageItem(i));
                }
                pages.push(<PaginationEllipsis key="ellipsis-end" />);
            }

            // Always show the last page
            pages.push(renderPageItem(totalPages));
        }

        return pages;
    };

    // Function to render a single page item
    const renderPageItem = (page) => (
        <PaginationItem key={page}>
            <PaginationLink className={`lg:h-[2.5em] lg:w-[2.5em] w-[2em] h-[2em] border-0 ${currentPage === page ? " !bg-[var(--bg-color)] lg:h-[2.5em] lg:w-[2.5em] w-[2em] h-[2em] text-black hover:bg-[var(--text-color)]" : "!bg-[#E4E7EE] hover:bg-[var(--text-color)] text-[#4E4E4E] hover:text-white"}`}
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                isActive={currentPage === page}
                onClick={() => handlePageChange(page)}
            >
                {page}
            </PaginationLink>
        </PaginationItem>
    );

    return (
        <div className="">
            <Pagination  >
                <PaginationContent className="mb-0 lg:gap-2 gap-1">
                    {/* Previous Button */}
                    <PaginationItem >
                        <PaginationPrevious
                            style={{ textDecoration: 'none', cursor: "pointer" }}
                            onClick={() => {
                                if (currentPage > 1) {
                                    handlePageChange(currentPage - 1)
                                }
                            }}
                            disabled={currentPage === 1}
                            className={`px-2 lg:h-[2.5em] lg:w-[2.5em] w-[2em] h-[2em] ${currentPage === 1 ? "!text-[#BAC3CC]" : "!text-[var(--accent-color)]"}`}
                        />
                    </PaginationItem>

                    {/* Page Numbers */}
                    {renderPageNumbers()}

                    {/* Next Button */}
                    <PaginationItem>
                        <PaginationNext
                            style={{ color: 'var(--accent-color)', textDecoration: 'none', cursor: 'pointer' }}
                            onClick={() => {
                                if (currentPage < totalPages) {
                                    handlePageChange(currentPage + 1)
                                }
                            }}
                            disabled={currentPage === totalPages}
                            className={`px-2 lg:h-[2.5em] lg:w-[2.5em] w-[2em] h-[2em] ${currentPage === totalPages ? "text-[#BAC3CC]" : "text-[var(--accent-color)]"}`}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default PaginationData;
