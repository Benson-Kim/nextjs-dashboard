"use client";

import { createCustomer, CustomerState } from "@/app/lib/actions";
import {
	CloudArrowUpIcon,
	EnvelopeIcon,
	UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/app/ui/button";

export default function Form() {
	const initialState: CustomerState = { message: null, errors: {} };
	const [state, formAction] = useActionState(createCustomer, initialState);

	return (
		<form action={formAction}>
			<div className='rounded-md bg-gray-50 p-4 md:p-6'>
				{/* Customer name */}
				<div className='mb-4'>
					<label
						htmlFor='customer'
						className='mb-2 block text-sm font-medium'
					>
						Enter customer name
					</label>
					<div className='relative mt-2 rounded-md'>
						<div className='relative'>
							<input
								type='text'
								name='name'
								id='name'
								placeholder='Enter customer name'
								aria-describedby='name-error'
								className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
							/>
							<UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2  text-gray-500' />
						</div>
						<div id='name-error' aria-live='polite' aria-atomic='true'>
							{state.errors?.name &&
								state.errors.name.map((error: string) => (
									<p className='mt-2 text-sm text-red-500' key={error}>
										{error}
									</p>
								))}
						</div>
					</div>
				</div>
				{/* Customer email */}
				<div className='mb-4'>
					<label
						htmlFor='customer'
						className='mb-2 block text-sm font-medium'
					>
						Enter Email Address
					</label>
					<div className='relative mt-2 rounded-md'>
						<div className='relative'>
							<input
								type='email'
								name='email'
								id='email'
								placeholder='Enter email address'
								aria-describedby='email-error'
								className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
							/>
							<EnvelopeIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2  text-gray-500' />
						</div>
						<div id='email-error' aria-live='polite' aria-atomic='true'>
							{state.errors?.email &&
								state.errors.email.map((error: string) => (
									<p className='mt-2 text-sm text-red-500' key={error}>
										{error}
									</p>
								))}
						</div>
					</div>
				</div>
				{/* Profile image */}
				<div className='mb-4'>
					<label
						htmlFor='image_url'
						className='mb-2 block text-sm font-medium'
					>
						Upload your profile
					</label>
					<div className='relative mt-2 rounded-md'>
						<div className='relative'>
							<input
								type='file'
								name='image_url'
								id='image_url'
								aria-describedby='image_url-error'
								className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
							/>

							<CloudArrowUpIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2  text-gray-500' />
						</div>
						<div
							id='image_url-error'
							aria-live='polite'
							aria-atomic='true'
						>
							{state.errors?.image_url &&
								state.errors.image_url.map((error: string) => (
									<p className='mt-2 text-sm text-red-500' key={error}>
										{error}
									</p>
								))}
						</div>
					</div>
				</div>
			</div>
			<div className='mt-6 flex justify-end gap-4'>
				<Link
					href='/dashboard/customers'
					className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
				>
					Cancel
				</Link>
				<Button type='submit'>Create Customer</Button>
			</div>
		</form>
	);
}
