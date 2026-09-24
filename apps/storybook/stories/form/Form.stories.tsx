import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@corensystem/coren-ui/form";
import {Input} from "@corensystem/coren-ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";
import {Textarea} from "@corensystem/coren-ui/textarea";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {expect, userEvent, within} from "storybook/test";
import {z} from "zod";

const meta = {
	title: "Components/Forms/Form",
	component: Form,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"React Hook Form integration with Zod validation. Compound component with FormField, FormItem, FormLabel, FormControl, FormDescription, and FormMessage for accessible, validated forms.",
			},
		},
	},
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z.string().min(8, "Password must be at least 8 characters."),
});

export const Login: Story = {
	render: () => {
		const form = useForm<z.infer<typeof loginSchema>>({
			resolver: zodResolver(loginSchema),
			defaultValues: {email: "", password: ""},
		});

		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(() => {})} className="wwc:w-[320px] wwc:space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({field}) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="name@example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({field}) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="Enter password" {...field} />
								</FormControl>
								<FormDescription>Must be at least 8 characters.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="wwc:w-full">
						Sign In
					</Button>
				</form>
			</Form>
		);
	},
};

const profileSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters.")
		.max(20, "Username must be at most 20 characters."),
	bio: z.string().max(160, "Bio must be at most 160 characters.").optional(),
	role: z.string({message: "Please select a role."}).min(1, "Please select a role."),
});

export const WithSelect: Story = {
	render: () => {
		const form = useForm<z.infer<typeof profileSchema>>({
			resolver: zodResolver(profileSchema),
			defaultValues: {username: "", bio: "", role: ""},
		});

		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(() => {})} className="wwc:w-[320px] wwc:space-y-4">
					<FormField
						control={form.control}
						name="username"
						render={({field}) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input placeholder="core-user" {...field} />
								</FormControl>
								<FormDescription>Your public display name.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="bio"
						render={({field}) => (
							<FormItem>
								<FormLabel>Bio</FormLabel>
								<FormControl>
									<Textarea placeholder="Tell us about yourself..." {...field} />
								</FormControl>
								<FormDescription>Max 160 characters.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
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
										<SelectItem value="editor">Editor</SelectItem>
										<SelectItem value="viewer">Viewer</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Save Profile</Button>
				</form>
			</Form>
		);
	},
};

const termsSchema = z.object({
	terms: z.boolean().refine((val) => val === true, "You must accept the terms."),
});

export const WithCheckbox: Story = {
	render: () => {
		const form = useForm<z.infer<typeof termsSchema>>({
			resolver: zodResolver(termsSchema),
			defaultValues: {terms: false},
		});

		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(() => {})} className="wwc:w-[320px] wwc:space-y-4">
					<FormField
						control={form.control}
						name="terms"
						render={({field}) => (
							<FormItem className="wwc:flex wwc:flex-row wwc:items-start wwc:space-x-3 wwc:space-y-0 wwc:rounded-md wwc:border wwc:p-4">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="wwc:space-y-1 wwc:leading-none">
									<FormLabel>Accept terms and conditions</FormLabel>
									<FormDescription>You agree to our Terms of Service and Privacy Policy.</FormDescription>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Continue</Button>
				</form>
			</Form>
		);
	},
};

export const ValidationInteraction: Story = {
	render: () => {
		const form = useForm<z.infer<typeof loginSchema>>({
			resolver: zodResolver(loginSchema),
			defaultValues: {email: "", password: ""},
		});

		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(() => {})} className="wwc:w-[320px] wwc:space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({field}) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="name@example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({field}) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="Enter password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Sign In</Button>
				</form>
			</Form>
		);
	},
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const submitButton = canvas.getByRole("button", {name: /sign in/i});

		await userEvent.click(submitButton);

		const emailError = await canvas.findByText("Please enter a valid email address.");
		await expect(emailError).toBeVisible();

		const passwordError = await canvas.findByText("Password must be at least 8 characters.");
		await expect(passwordError).toBeVisible();
	},
};
