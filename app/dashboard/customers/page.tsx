import { CreateItem } from "@/app/ui/buttons";
import { lusitana } from "@/app/ui/fonts";
import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import { Metadata } from "next";
import { Suspense } from "react";
import Table from "@/app/ui/customers/table";
import { fetchCustomersPages } from "@/app/lib/data";
import { CustomersTableSkeleton } from "@/app/ui/skeletons";

export const metadata: Metadata = {
	title: "Customers",
};

export default async function Page(props: {
	searchParams?: Promise<{
		query?: string;
		page?: string;
	}>;
}) {
	const searchParams = await props.searchParams;
	const query = searchParams?.query || "";
	const currentPage = Number(searchParams?.page) || 1;

	const totalPages = await fetchCustomersPages(query);

	return (
		<div className='w-full'>
			<div className='flex w-full items-center justify-between'>
				<h1 className={`${lusitana.className} text-2xl"`}>Customers</h1>
			</div>
			<div className='mt-4 flex justify-between items-center gap-2 md:mt-8'>
				<Search placeholder='Search customers...' />
				<CreateItem
					url='/dashboard/customers/create'
					name='Create Customer'
				/>
			</div>
			<Suspense
				key={query + currentPage}
				fallback={<CustomersTableSkeleton />}
			>
				<Table query={query} currentPage={currentPage} />
			</Suspense>
			<div className='mt-5 flex w-full justify-center'>
				<Pagination totalPages={totalPages} />
			</div>
		</div>
	);
}
