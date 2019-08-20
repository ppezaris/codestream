import { CompositeDisposable, Disposable, Point, Range, TextEditor } from "atom";
import { exists } from "fs-plus";

export class EditorManipulator implements Disposable {
	private highlights = new Map<number, Disposable>();

	dispose() {
		this.highlights.forEach(highlight => highlight.dispose());
	}

	async open(filePath: string, force = false) {
		return new Promise<TextEditor | undefined>(resolve => {
			exists(filePath, async yes => {
				if (yes || force) {
					resolve(atom.workspace.open(filePath) as Promise<TextEditor | undefined>);
				} else resolve();
			});
		});
	}

	scrollIntoView(editor: TextEditor, bufferRow: number, options = { center: true }) {
		editor.scrollToBufferPosition(new Point(bufferRow, 0), options);
	}

	async highlight(enable: boolean, file: string, range: Range): Promise<boolean> {
		const editor = await this.open(file);

		if (!editor) return false;

		if (enable) {
			this.scrollIntoView(editor, range.start.row, { center: false });
			const marker = editor.markBufferRange(range, {
				invalidate: "never",
			});
			editor.decorateMarker(marker, {
				type: "highlight",
				class: "codestream-highlight",
			});

			this.highlights.set(
				(marker as any).id,
				new CompositeDisposable(
					new Disposable(() => {
						marker.destroy();
					}),
					editor.onDidChangeSelectionRange(() => this.removeHighlight((marker as any).id))
				)
			);
		} else {
			const markers = editor.findMarkers({
				startBufferRow: range.start.row,
			});
			markers.forEach(marker => {
				this.removeHighlight((marker as any).id);
			});
		}

		return true;
	}
	private removeHighlight(markerId: number) {
		const disposable = this.highlights.get(markerId);
		disposable && disposable.dispose();
	}

	async select(file: string, range: Range) {
		const editor = await this.open(file);

		if (editor) {
			if (range.isEmpty()) {
				this.scrollIntoView(editor, range.start.row);
			}
			editor.setSelectedBufferRange(range);
		}
	}
}
