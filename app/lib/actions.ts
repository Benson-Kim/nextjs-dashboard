"use server";

import { z } from "zod";
import { zfd } from "zod-form-data";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import fs from "node:fs/promises";

const InvoiceFormSchema = z.object({
	id: z.string(),
	customerId: z.string({
		invalid_type_error: "Please select a customer",
	}),
	amount: z.coerce
		.number()
		.gt(0, { message: "Please eneter an amount greater than $0." }),
	status: z.enum(["pending", "paid"], {
		invalid_type_error: "Please select an invoice status",
	}),
	date: z.string(),
});

const CustomerFormSchema = z.object({
	id: z.string(),
	name: z.string().min(1, { message: "Customer name cannot be blank" }),
	email: z
		.string()
		.email({ message: "Please enter a valid email address" })
		.min(1, { message: "Email cannot be blank" }),
	image_url: zfd
		.file()
		.refine((file) => file.size < 5000000, {
			message: "File can't be bigger than 5MB.",
		})
		.refine(
			(file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
			{ message: "File format must be either jpg, jpeg lub png." }
		),
});

export type InvoiceState = {
	errors?: {
		customerId?: string[];
		amount?: string[];
		status?: string[];
	};
	message?: string | null;
};

export type CustomerState = {
	errors?: {
		name?: string[];
		email?: string[];
		image_url?: string[];
	};
	message?: string | null;
};

const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
const CreateCustomer = CustomerFormSchema.omit({ id: true });

export async function createCustomer(
	prevState: CustomerState,
	formData: FormData
) {
	const validatedFields = CreateCustomer.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		image_url: formData.get("image_url"),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Missing fields. failed to create customer",
		};
	}

	const { name, email, image_url } = validatedFields.data;
	try {
		const arrayBuffer = await image_url.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);
		const filePath = `./public/uploads/${Date.now()}_${image_url.name}`;

		await fs.writeFile(filePath, buffer);

		await sql`
			INSERT INTO customers (name, email, image_url)
        VALUES (${name}, ${email}, ${filePath})
		`;
	} catch (error) {
		console.log("Database error", error);
		return { message: "Database error: failed to create customer" };
	}

	revalidatePath("/dashboard/customers");
	redirect("/dashboard/customers");
}

export async function createInvoice(
	prevState: InvoiceState,
	formData: FormData
) {
	const validatedFields = CreateInvoice.safeParse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Missing fields. Failed to create invoice",
		};
	}

	const { customerId, amount, status } = validatedFields.data;
	const amountInCents = amount * 100;
	const date = new Date().toISOString().split("T")[0];

	try {
		await sql`
        INSERT INTO INVOICES (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
	} catch (error) {
		console.log("Database Error;", error);
		return {
			message: "Database Error: Failed to create invoice",
		};
	}

	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

export async function updateInvoice(
	id: string,
	prevState: InvoiceState,
	formData: FormData
) {
	const validatedFields = UpdateInvoice.safeParse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Missing field. failed to update invoice",
		};
	}

	const { customerId, amount, status } = validatedFields.data;
	const amountInCents = amount * 100;

	try {
		await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;
	} catch (error) {
		console.log("Database Error:", error);
		return { message: "Database Error: failed to update invoice" };
	}

	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
	try {
		await sql`
        DELETE FROM invoices
        WHERE id = ${id};
    `;
		revalidatePath("/dashboard/invoices");
		return { message: "Invoice deleted successfully" };
	} catch (error) {
		console.log("Database Error", error);
		return { message: "Database Error: Failed to delete invoice" };
	}
}

export async function deleteCustomer(id: string) {
	try {
		await sql`
        DELETE FROM customers
        WHERE id = ${id};
    `;
		revalidatePath("/dashboard/customers");
		return { message: "Customer deleted successfully" };
	} catch (error) {
		console.log("Database Error", error);
		return { message: "Database Error: Failed to delete invoice" };
	}
}

export async function authenticate(
	prevState: string | undefined,
	formData: FormData
) {
	try {
		await signIn("credentials", formData);
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return "Invalid credentials.";
				default:
					return "Something went wrong.";
			}
		}
		throw error;
	}
}
