"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** How many page numbers to show on each side of the current page */
  siblingCount?: number;
  className?: string;
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | "ellipsis-start" | "ellipsis-end")[] {
  const totalSlots = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipsis

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const items: (number | "ellipsis-start" | "ellipsis-end")[] = [];

  items.push(1);

  if (showLeftEllipsis) {
    items.push("ellipsis-start");
  } else {
    for (let i = 2; i < leftSibling; i++) items.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) items.push(i);
  }

  if (showRightEllipsis) {
    items.push("ellipsis-end");
  } else {
    for (let i = rightSibling + 1; i < totalPages; i++) items.push(i);
  }

  if (totalPages > 1) items.push(totalPages);

  return items;
}

export default function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationControlProps) {
  if (totalPages <= 1) return null;

  const pages = generatePageNumbers(currentPage, totalPages, siblingCount);

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={cn(
              "cursor-pointer select-none",
              currentPage <= 1 && "pointer-events-none opacity-50"
            )}
            aria-disabled={currentPage <= 1}
          />
        </PaginationItem>

        {pages.map((page) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                className="cursor-pointer select-none"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={cn(
              "cursor-pointer select-none",
              currentPage >= totalPages && "pointer-events-none opacity-50"
            )}
            aria-disabled={currentPage >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
