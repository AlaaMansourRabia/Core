---
name: core-ui-forms
description: >
  Building validated forms with @wakecap/core-ui/form, react-hook-form, zod,
  and @hookform/resolvers/zod. Form/FormField/FormItem/FormLabel/FormControl/
  FormDescription/FormMessage composition. useForm with zodResolver wiring.
  Field registration via render prop. Inline error display. Load when building
  any form that requires validation with react-hook-form.
metadata:
  type: core
  library: wakecore
  library_version: "0.0.1"
sources:
  - "wakecap/Wakecore:packages/components/src/form.tsx"
  - "wakecap/Wakecore:packages/components/package.json"
---

# @wakecap/core-ui — Forms & Validation

## Install

`react-hook-form` is an optional **peer** of `@wakecap/core-ui`, not a dependency —
`Form` and `FormField` read your form state through React context, so they have to bind
to _your_ copy of the library. `@hookform/resolvers` is yours too; core-ui never imports it.

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

core-ui accepts `react-hook-form@>=7.46`. Pick a `@hookform/resolvers` line whose own peer
range covers the version you install — current `5.x` wants `react-hook-form@^7.55`, so on
`7.46 … 7.54` use `@hookform/resolvers@^3` (or upgrade `react-hook-form`). If the two
disagree, your package manager says so at install time.

## Setup

```tsx
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage} from "@wakecap/core-ui/form";
import {Input} from "@wakecap/core-ui/input";
import {Button} from "@wakecap/core-ui/button";

const schema = z.object({
	email: z.string().email("Invalid email address"),
	name: z.string().min(2, "Name must be at least 2 characters"),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm() {
	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {email: "", name: ""},
	});

	function onSubmit(values: FormValues) {
		console.log(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="wwc:space-y-6">
				<FormField
					control={form.control}
					name="email"
					render={({field}) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="you@example.com" {...field} />
							</FormControl>
							<FormDescription>Your work email address.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="name"
					render={({field}) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Full name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" loading={form.formState.isSubmitting}>
					Save
				</Button>
			</form>
		</Form>
	);
}
```

## Core Patterns

### Select field with FormControl

```tsx
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@wakecap/core-ui/select";

<FormField
	control={form.control}
	name="role"
	render={({field}) => (
		<FormItem>
			<FormLabel>Role</FormLabel>
			<Select onValueChange={field.onChange} defaultValue={field.value}>
				<FormControl>
					<SelectTrigger>
						<SelectValue placeholder="Select a role" />
					</SelectTrigger>
				</FormControl>
				<SelectContent>
					<SelectItem value="admin">Admin</SelectItem>
					<SelectItem value="viewer">Viewer</SelectItem>
				</SelectContent>
			</Select>
			<FormMessage />
		</FormItem>
	)}
/>;
```

### Checkbox field

```tsx
import {Checkbox} from "@wakecap/core-ui/checkbox";

<FormField
	control={form.control}
	name="acceptTerms"
	render={({field}) => (
		<FormItem className="wwc:flex wwc:items-start wwc:space-x-3 wwc:space-y-0">
			<FormControl>
				<Checkbox checked={field.value} onCheckedChange={field.onChange} />
			</FormControl>
			<FormLabel>Accept terms and conditions</FormLabel>
			<FormMessage />
		</FormItem>
	)}
/>;
```

### Accessing field state for conditional UI

```tsx
import {useFormField} from "@wakecap/core-ui/form";

// Inside a custom field component rendered within FormItem
function CustomInput() {
	const {error, formItemId} = useFormField();
	return <input id={formItemId} className={error ? "wwc:border-destructive" : "wwc:border-input"} />;
}
```

## Common Mistakes

### CRITICAL Missing Form (FormProvider) wrapper

Wrong:

```tsx
// No <Form> wrapper — react-hook-form context missing
<form onSubmit={form.handleSubmit(onSubmit)}>
  <FormField control={form.control} name="email" render={...} />
</form>
```

Correct:

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="email" render={...} />
  </form>
</Form>
```

`Form` is `FormProvider` from react-hook-form. `useFormContext()` inside
`FormField` throws if `FormProvider` is not an ancestor. The error is a runtime
throw, not a TypeScript error.

Source: `packages/components/src/form.tsx:17`

---

### HIGH FormControl outside FormItem loses id and aria wiring

Wrong:

```tsx
<FormField
	control={form.control}
	name="email"
	render={({field}) => (
		// FormItem is missing
		<FormControl>
			<Input {...field} />
		</FormControl>
	)}
/>
```

Correct:

```tsx
<FormField
	control={form.control}
	name="email"
	render={({field}) => (
		<FormItem>
			<FormLabel>Email</FormLabel>
			<FormControl>
				<Input {...field} />
			</FormControl>
			<FormMessage />
		</FormItem>
	)}
/>
```

`FormControl` reads `FormItemContext` (set by `FormItem`) for the `id` used to
wire `htmlFor`, `aria-describedby`, and `aria-invalid`. Without `FormItem`,
all three become undefined strings — the form still works but accessibility
and error styling break silently.

Source: `packages/components/src/form.tsx:43`

---

### HIGH Importing Form components from react-hook-form directly

Wrong:

```tsx
import {FormProvider, Controller} from "react-hook-form";
```

Correct:

```tsx
import {Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage} from "@wakecap/core-ui/form";
```

`@wakecap/core-ui/form` wraps react-hook-form with styled components and
context plumbing. Using the raw react-hook-form primitives bypasses label
styling, error class injection (`text-destructive`), and `aria-invalid` wiring.

Source: `packages/components/src/form.tsx:137`

---

### MEDIUM Spreading field onto a controlled component that uses onValueChange

Wrong:

```tsx
// Select expects onValueChange, not onChange
<Select {...field}>
```

Correct:

```tsx
<Select onValueChange={field.onChange} defaultValue={field.value}>
	<FormControl>
		<SelectTrigger>
			<SelectValue />
		</SelectTrigger>
	</FormControl>
</Select>
```

Radix UI `Select`, `Switch`, `Checkbox` and `RadioGroup` use `onValueChange`
or `onCheckedChange` rather than the native `onChange`. Spreading `field`
directly passes `onChange` which these components ignore.

Source: `packages/components/src/form.tsx`

---

See also: `@wakecap/core-ui/field` — a simpler `Field` component for cases that do not need full react-hook-form validation
