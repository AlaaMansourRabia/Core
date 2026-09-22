import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {FormLayout, FormSection, FormRow, FormActions} from "@core/core-ui/form-layout";
import {Input} from "@core/core-ui/input";
import {Label} from "@core/core-ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@core/core-ui/select";
import {Textarea} from "@core/core-ui/textarea";

const meta = {
	title: "Components/Primitives/FormLayout",
	component: FormLayout,
	tags: ["autodocs"],
} satisfies Meta<typeof FormLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<FormLayout size="md" className="wwc:p-4 wwc:border wwc:rounded-lg">
			<div className="wwc:space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input id="name" placeholder="Enter your name" />
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" placeholder="Enter your email" />
			</div>
			<FormActions>
				<Button variant="outline">Cancel</Button>
				<Button type="submit">Submit</Button>
			</FormActions>
		</FormLayout>
	),
};

export const WithSections: Story = {
	render: () => (
		<FormLayout size="lg" className="wwc:p-4 wwc:border wwc:rounded-lg">
			<FormSection title="Personal Information" description="Please provide your basic details.">
				<FormRow columns={2}>
					<div className="wwc:space-y-2">
						<Label htmlFor="firstName">First Name</Label>
						<Input id="firstName" placeholder="John" />
					</div>
					<div className="wwc:space-y-2">
						<Label htmlFor="lastName">Last Name</Label>
						<Input id="lastName" placeholder="Doe" />
					</div>
				</FormRow>
				<div className="wwc:space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" placeholder="john@example.com" />
				</div>
			</FormSection>

			<FormSection title="Address" description="Where should we send your order?">
				<div className="wwc:space-y-2">
					<Label htmlFor="address">Street Address</Label>
					<Input id="address" placeholder="123 Main St" />
				</div>
				<FormRow columns={3}>
					<div className="wwc:space-y-2">
						<Label htmlFor="city">City</Label>
						<Input id="city" placeholder="New York" />
					</div>
					<div className="wwc:space-y-2">
						<Label htmlFor="state">State</Label>
						<Select>
							<SelectTrigger>
								<SelectValue placeholder="Select state" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ny">New York</SelectItem>
								<SelectItem value="ca">California</SelectItem>
								<SelectItem value="tx">Texas</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="wwc:space-y-2">
						<Label htmlFor="zip">ZIP Code</Label>
						<Input id="zip" placeholder="10001" />
					</div>
				</FormRow>
			</FormSection>

			<FormActions align="right">
				<Button variant="outline">Cancel</Button>
				<Button type="submit">Save Changes</Button>
			</FormActions>
		</FormLayout>
	),
};

export const InlineLayout: Story = {
	render: () => (
		<FormLayout layout="inline" className="wwc:p-4 wwc:border wwc:rounded-lg">
			<div className="wwc:space-y-2">
				<Label htmlFor="search">Search</Label>
				<Input id="search" placeholder="Enter search term" />
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="category">Category</Label>
				<Select>
					<SelectTrigger className="wwc:w-[150px]">
						<SelectValue placeholder="Select" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="inactive">Inactive</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<Button type="submit">Search</Button>
		</FormLayout>
	),
};

export const WithTextarea: Story = {
	render: () => (
		<FormLayout size="md" className="wwc:p-4 wwc:border wwc:rounded-lg">
			<div className="wwc:space-y-2">
				<Label htmlFor="subject">Subject</Label>
				<Input id="subject" placeholder="What's this about?" />
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="message">Message</Label>
				<Textarea id="message" placeholder="Type your message here..." rows={5} />
			</div>
			<FormActions align="between">
				<Button variant="ghost">Save Draft</Button>
				<div className="wwc:flex wwc:gap-2">
					<Button variant="outline">Cancel</Button>
					<Button type="submit">Send Message</Button>
				</div>
			</FormActions>
		</FormLayout>
	),
};
