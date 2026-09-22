import type {Meta, StoryObj} from "storybook/internal/types";

import {LoginPage} from "@corensystem/core-ui/pages/core-login-page";

import manifest from "../../../../manifests/login-page.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Sign-in page template. Real-component preview: component-only (Button/Input/Label), empty form
// state, no network/animation. The brand image is a local placeholder served from public/images.
const meta = {
	title: "Templates/Login Page",
	component: LoginPage,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage manifest={manifest} family={<>The only Login archetype — no variants or instances.</>} />
			),
			description: {component: "The authentication entry page (canonical: `core-login-page`)."},
		},
	},
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
	render: () => <LoginPage />,
};
