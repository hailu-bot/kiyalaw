import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user-role';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getExpenses } from '@/app/actions/expenseActions';
import ExpenseList from '@/components/expense/ExpenseList';
import QuickExpenseForm from '@/components/expense/QuickExpenseForm';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ matterId?: string; category?: string; dateFrom?: string; dateTo?: string; page?: string }> }) {
  const { matterId, category, dateFrom, dateTo, page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr) : 1;

  const userId = await getCurrentUserId();
  const matters = await prisma.matter.findMany({
    where: { userId },
    orderBy: { title: 'asc' },
  });

  const result = await getExpenses({ matterId, category, dateFrom, dateTo, page });
  const { expenses, totalCount, totalPages } = result;

  const categories = ['Filing Fee', 'Service Fee', 'Travel', 'Copying', 'Expert Witness', 'Court Cost', 'Postage', 'Other'];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-headline-sm font-headline-sm text-on-background">Expenses</h1>
        <div className="flex gap-4">
          <Link href="/api/export/expenses" download className="flex items-center gap-2 px-4 py-2.5 border border-[#c6c6ce] text-[#0A1128] font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
            CSV
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-1">
          <div className="bg-surface border border-outline-variant rounded-none p-6">
            <h2 className="text-[20px] font-headline-sm text-on-background mb-4">Record Expense</h2>
            <QuickExpenseForm matters={matters.map(m => ({ id: m.id, title: m.title }))} categories={categories} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-surface border border-outline-variant rounded-none p-6">
            <h2 className="text-[20px] font-headline-sm text-on-background mb-4">All Expenses</h2>

            <form method="GET" action="/expenses" className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-[#c6c6ce]/30">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c839f]" />
                <input name="search" placeholder="Search expenses..." className="w-full pl-9 pr-3 py-2 border border-[#c6c6ce]/50 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <select name="matterId" defaultValue={matterId ?? ''} className="border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]">
                <option value="">All Matters</option>
                {matters.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              <select name="category" defaultValue={category ?? ''} className="border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input name="dateFrom" type="date" defaultValue={dateFrom ?? ''} className="border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]" />
              <input name="dateTo" type="date" defaultValue={dateTo ?? ''} className="border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]" />
              <button type="submit" className="px-4 py-2 bg-[#0A1128] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors">Filter</button>
              {(matterId || category || dateFrom || dateTo) && (
                <Link href="/expenses" className="flex items-center px-3 py-2 border border-[#c6c6ce]/50 text-[#46464d] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">Clear</Link>
              )}
            </form>

            <ExpenseList expenses={expenses} />

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#c6c6ce]/30">
                <span className="text-[13px] text-[#46464d]">Page {page} of {totalPages} ({totalCount} entries)</span>
                <div className="flex items-center gap-2">
                  {page > 1 && (
                    <a href={`/expenses?page=${page - 1}${matterId ? `&matterId=${matterId}` : ''}${category ? `&category=${category}` : ''}${dateFrom ? `&dateFrom=${dateFrom}` : ''}${dateTo ? `&dateTo=${dateTo}` : ''}`}
                      className="flex items-center gap-1 px-3 py-1.5 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
                      <ChevronLeft size={14} /> Prev
                    </a>
                  )}
                  <span className="text-[13px] text-[#46464d]">{page} / {totalPages}</span>
                  {page < totalPages && (
                    <a href={`/expenses?page=${page + 1}${matterId ? `&matterId=${matterId}` : ''}${category ? `&category=${category}` : ''}${dateFrom ? `&dateFrom=${dateFrom}` : ''}${dateTo ? `&dateTo=${dateTo}` : ''}`}
                      className="flex items-center gap-1 px-3 py-1.5 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
                      Next <ChevronRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
