import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { addLocaleData, IntlProvider } from "react-intl";
import en from "react-intl/locale-data/en";
import CodeStreamRoot from "./components/CodeStreamRoot";
import copy from "../translations/en.json";

addLocaleData([...en]);

export const CODESTREAM_VIEW_URI = "atom://codestream";

export default class CodestreamView {
	constructor() {
		this.element = document.createElement("div");
		this.element.classList.add("codestream");

		const directories = atom.project.getDirectories();
		const repoPromises = directories.map(repo => atom.project.repositoryForDirectory(repo));
		Promise.all(repoPromises).then(repos => {
			repos = repos.filter(Boolean);
			render(
				<IntlProvider locale="en" messages={copy}>
					<CodeStreamRoot repositories={repos} />
				</IntlProvider>,
				this.element
			);
		});
	}

	getTitle() {
		return "CodeStream";
	}

	getIconName() {
		return "comment-discussion";
	}

	getDefaultLocation() {
		return "right";
	}

	getAllowedLocations() {
		return ["right", "left"];
	}

	isPermanentDockItem() {
		return false;
	}

	getPreferredWidth() {
		return 300;
	}

	getURI() {
		return CODESTREAM_VIEW_URI;
	}

	serialize() {
		return {
			deserializer: "codestream/CodestreamView"
		};
	}

	destroy() {
		unmountComponentAtNode(this.element);
		this.element.remove();
	}
}
