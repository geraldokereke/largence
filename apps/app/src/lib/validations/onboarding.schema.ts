import { z } from "zod";

// International phone number regex - supports formats like:
// +1234567890, +1 (555) 123-4567, +44 20 7946 0958, etc.
const internationalPhoneRegex = /^\+?[1-9]\d{1,14}$|^(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

export const billingContactSchema = z.object({
  billingEmail: z.string().min(1, "Billing email is required").email("Enter a valid email"),
  phone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true; // Allow empty
      return internationalPhoneRegex.test(phone);
    }, {
      message: "Enter a valid international phone number (e.g., +1 (555) 123-4567)",
    }),
});

export type BillingContactValues = z.infer<typeof billingContactSchema>;
