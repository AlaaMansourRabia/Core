/**
 * Basic markdown prose container for rich text content.
 */
import {Markdown} from "@corensystem/coren-ui/markdown";

export function Default() {
	return (
		<Markdown>
			<h2>Getting Started</h2>
			<p>
				Welcome to the documentation. This guide will help you understand the
				basics and get you up and running quickly.
			</p>
			<ul>
				<li>Installation</li>
				<li>Configuration</li>
				<li>Usage examples</li>
			</ul>
		</Markdown>
	);
}
