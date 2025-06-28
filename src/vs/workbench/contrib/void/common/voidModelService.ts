import { Disposable, IReference } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { IResolvedTextEditorModel, ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IModelService } from '../../../../editor/common/services/model.js';

type VoidModelType = {
	model: ITextModel | null;
	editorModel: IResolvedTextEditorModel | null;
};

export interface IVoidModelService {
	readonly _serviceBrand: undefined;
	initializeModel(uri: URI): Promise<void>;
	getModel(uri: URI): VoidModelType;
	getModelFromFsPath(fsPath: string): VoidModelType;
	getModelSafe(uri: URI): Promise<VoidModelType>;
	saveModel(uri: URI): Promise<void>;

}

export const IVoidModelService = createDecorator<IVoidModelService>('voidVoidModelService');

class VoidModelService extends Disposable implements IVoidModelService {
	_serviceBrand: undefined;
	static readonly ID = 'voidVoidModelService';
	private readonly _modelRefOfURI: Record<string, IReference<IResolvedTextEditorModel>> = {};

	constructor(
		@ITextModelService private readonly _textModelService: ITextModelService,
		@ITextFileService private readonly _textFileService: ITextFileService,
		@IModelService private readonly _modelService: IModelService,
	) {
		super();

		// Listen for model removal to clean up references
		this._register(this._modelService.onModelRemoved((model: ITextModel) => {
			this.cleanupModel(model.uri);
		}));
	}

	saveModel = async (uri: URI) => {
		await this._textFileService.save(uri, { // we want [our change] -> [save] so it's all treated as one change.
			skipSaveParticipants: true // avoid triggering extensions etc (if they reformat the page, it will add another item to the undo stack)
		})
	}

	initializeModel = async (uri: URI) => {
		try {
			if (uri.fsPath in this._modelRefOfURI) return;

			// Check if it's a valid file URI that can be resolved
			if (uri.scheme !== 'file' && uri.scheme !== 'untitled' && uri.scheme !== 'vscode-userdata') {
				console.warn('InitializeModel: Unsupported URI scheme', uri.toString());
				return;
			}

			const editorModelRef = await this._textModelService.createModelReference(uri);
			// Keep a strong reference to prevent disposal
			this._modelRefOfURI[uri.fsPath] = editorModelRef;
		}
		catch (e) {
			console.log('InitializeModel error:', e)
		}
	};

	getModelFromFsPath = (fsPath: string): VoidModelType => {
		const editorModelRef = this._modelRefOfURI[fsPath];
		if (!editorModelRef) {
			return { model: null, editorModel: null };
		}

		const model = editorModelRef.object.textEditorModel;

		if (!model) {
			return { model: null, editorModel: editorModelRef.object };
		}

		return { model, editorModel: editorModelRef.object };
	};

	getModel = (uri: URI) => {
		return this.getModelFromFsPath(uri.fsPath)
	}


	getModelSafe = async (uri: URI): Promise<VoidModelType> => {
		if (!(uri.fsPath in this._modelRefOfURI)) await this.initializeModel(uri);
		return this.getModel(uri);

	};

	// Add a method to clean up specific model references
	cleanupModel = (uri: URI) => {
		const ref = this._modelRefOfURI[uri.fsPath];
		if (ref) {
			try {
				ref.dispose();
				delete this._modelRefOfURI[uri.fsPath];
			} catch (e) {
				console.warn('Error disposing model reference for', uri.fsPath, e);
			}
		}
	};

	// Add a method to clean up all model references
	cleanupAllModels = () => {
		for (const [fsPath, ref] of Object.entries(this._modelRefOfURI)) {
			try {
				ref.dispose();
			} catch (e) {
				console.warn('Error disposing model reference for', fsPath, e);
			}
		}
		// Clear the reference map
		Object.keys(this._modelRefOfURI).forEach(key => delete this._modelRefOfURI[key]);
	};

	override dispose() {
		super.dispose();
		// Use the cleanup method for proper resource management
		this.cleanupAllModels();
	}
}

registerSingleton(IVoidModelService, VoidModelService, InstantiationType.Eager);
