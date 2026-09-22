import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {
	ErrorPage,
	ErrorPageAction,
	ErrorPageCode,
	ErrorPageDescription,
	ErrorPageTitle,
} from "@core/core-ui/error-page";
import {Controls, Description, Primary, Stories, Subtitle, Title} from "@storybook/addon-docs/blocks";

import errorPageManifest from "../../../../manifests/error-page.template.json";
import {ComponentKnowledge} from "../_docs/ComponentKnowledge";
import {TemplateManifestPanel} from "../_docs/TemplateManifestPanel";

// Custom autodocs page for the first TEMPLATE: standard blocks + the Catalog knowledge panel (decision
// knowledge from library-index.json) + the Template contract panel (build knowledge from the manifest).
// Overrides the global docs page (which has no manifest panel) for this page only.
function ErrorPageDocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<TemplateManifestPanel manifest={errorPageManifest} />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}

const meta = {
	// First promoted TEMPLATE (see docs/ARTIFACT-CLASSIFICATION.md + manifests/error-page.template.json).
	// File and export are unchanged (@core/core-ui/error-page); only the story title moved to Templates/.
	title: "Templates/Error Page",
	component: ErrorPage,
	tags: ["autodocs"],
	parameters: {
		docs: {
			page: ErrorPageDocsPage,
			description: {
				component:
					"Full-page error display with predefined configs for common HTTP errors (404, 401, 403, 500, 503) and a generic fallback. Supports custom content via props or compound components.",
			},
		},
	},
	argTypes: {
		type: {
			control: "select",
			options: ["404", "401", "403", "500", "503", "generic"],
		},
		showCode: {control: "boolean"},
	},
	args: {
		type: "generic",
		showCode: true,
	},
} satisfies Meta<typeof ErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotFound: Story = {
	args: {
		type: "404",
		action: <Button>Go Home</Button>,
	},
};

export const Unauthorized: Story = {
	args: {
		type: "401",
		action: <Button>Sign In</Button>,
	},
};

export const Forbidden: Story = {
	args: {
		type: "403",
		action: <Button variant="outline">Request Access</Button>,
	},
};

export const ServerError: Story = {
	args: {
		type: "500",
		action: <Button>Try Again</Button>,
	},
};

export const ServiceUnavailable: Story = {
	args: {
		type: "503",
		action: <Button variant="outline">Check Status</Button>,
	},
};

export const CustomContent: Story = {
	args: {
		type: "generic",
		code: "Oops",
		title: "We hit a snag",
		description: "Our team has been notified and is working on a fix.",
		action: (
			<div className="wwc:flex wwc:gap-2">
				<Button variant="outline">Go Back</Button>
				<Button>Contact Support</Button>
			</div>
		),
	},
};

export const HiddenCode: Story = {
	args: {
		type: "404",
		showCode: false,
		action: <Button>Go Home</Button>,
	},
};

export const CompoundComponents: Story = {
	render: () => (
		<div className="wwc:flex wwc:min-h-[400px] wwc:flex-col wwc:items-center wwc:justify-center wwc:p-8 wwc:text-center">
			<ErrorPageCode>🔒</ErrorPageCode>
			<ErrorPageTitle>Access Restricted</ErrorPageTitle>
			<ErrorPageDescription>This project is locked. Contact your admin to request access.</ErrorPageDescription>
			<ErrorPageAction>
				<Button variant="outline">Go Back</Button>
				<Button>Contact Admin</Button>
			</ErrorPageAction>
		</div>
	),
};

export const AllTypes: Story = {
	render: () => (
		<div className="wwc:grid wwc:grid-cols-2 wwc:gap-8">
			<ErrorPage type="404" />
			<ErrorPage type="401" />
			<ErrorPage type="403" />
			<ErrorPage type="500" />
			<ErrorPage type="503" />
			<ErrorPage type="generic" />
		</div>
	),
};
