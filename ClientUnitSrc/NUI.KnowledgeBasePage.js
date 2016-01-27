define('KnowledgeBasePage', ['ext-base', 'terrasoft', 'sandbox', 'KnowledgeBase', 'KnowledgeBasePageStructure',
	'KnowledgeBasePageResources', 'GeneralDetails', 'ConfigurationEnums', 'KnowledgeBaseTag',
	'KnowledgeBaseTagDecoupling', 'CommentsWithFilesModulesHelper', 'css!KnowledgeBaseSectionCssModule',
	'css!FileHelper', 'css!CommentsWithFilesModulesHelper'],
	function(Ext, Terrasoft, sandbox, KnowledgeBase, structure, resources, GeneralDetails, ConfigurationEnums,
		KnowledgeBaseTag, KnowledgeBaseTagDecoupling, CommentsWithFilesModulesHelper) {

		structure.userCode = function() {
			this.entitySchema = KnowledgeBase;
			this.contextHelpId = '1006';
			this.name = 'KnowledgeBaseCardViewModel';
			this.schema.values = {};
			this.methods.getHeader = function() {
				var header = resources.localizableStrings.ArticleCaption;
				var code = this.get('Code');
				if (!Ext.isEmpty(code)) {
					header += resources.localizableStrings.CodeSymbol + code;
				}
				return header;
			};
			this.methods.init = function() {
				if (!this.isInstance) {
					return;
				}
				var initArray = [
					getFavorites, //setCommentsCount,
					getLikeItCount
					//getFilesCount,
					//getViewsCount
				];
				var recordId = this.get('Id');
				var scope = this;

				this.subscribe('FileDeleted', function() {
					var fileCount = scope.get('FilesCount');
					if (fileCount) {
						scope.set('FilesCount', --fileCount);
					}
					if (!fileCount) {
						var recordId = scope.getId();
						var externalScope = scope.getItemScope();
						var filesVisible = externalScope.get('FileVisible' + recordId);
						var innerFileContainer = Ext.get('FileListContainer' + recordId);
						if (filesVisible && filesVisible.visible && filesVisible.id === recordId &&
							innerFileContainer) {
							scope.hideFiles(recordId, externalScope);
						}
					}
					scope.setFilesCount();
				}, [recordId]);
				var batch = Ext.create("Terrasoft.BatchQuery");
				batch.add(this.getCommentSelect(recordId));
				batch.add(this.getFilesSelect(recordId));
				batch.add(this.getLikeItSelect(recordId));
				if (batch.queries.length > 0) {
					batch.execute(this.initialize, this);
				}
				this.runQueriesInBatch(initArray);
				sandbox.subscribe('GetDetailItems', function(args) {
					scope.setCommentsCount(true, args.recordId);
				}, [recordId]);
				var tagContainerName = (this.action !== 'view') ? 'addTagContainer' : 'addReadOnlyTagContainer';
				var addTagContainer = Ext.get(tagContainerName);
				this.addTagModuleId = sandbox.id + '_AddTagModule';

				sandbox.subscribe('GetRecordInfo', function() {
					return {
						recordId: recordId,
						readOnlyMode: scope.action === 'view',
						entitiesConfig: {
							entitySchema: KnowledgeBase,
							tagSchema: KnowledgeBaseTag,
							decouplingSchema: KnowledgeBaseTagDecoupling
						}
					};
				}, [this.addTagModuleId]);
				this.onCommentViewChanged();
				this.onCustomHtmlControlAfterRender();
				sandbox.loadModule('AddTagModule', {
					renderTo: addTagContainer,
					id: this.addTagModuleId
				});
			};
			this.methods.defineKnowledgeBaseCss = function(enabled) {
				this.defineCss('CommentsWithFilesModulesHelper', enabled);
				this.defineCss('KnowledgeBaseSectionCssModule', enabled);
			};
			this.methods.defineCss = function(name, enabled) {
				var node = Ext.DomQuery.selectNode('[href$="' + name + '.css"]');
				if (node) {
					node.disabled = !enabled;
				}
			};
			this.methods.getLikeItSelect = function(KnowledgeBaseId) {
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: 'Like'
				});
				select.addColumn('Contact');
				select.addColumn('KnowledgeBase');
				select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					'Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
				select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					'KnowledgeBase', KnowledgeBaseId));
				return select;
			};
			this.methods.getLikeItValue = function(response) {
				if (!this.isInstance) {
					return;
				}
				if ((response.success && response.collection && response.collection.collection.items.length > 0 ||
					response.rowsAffected > 0)) {
					this.set('likeSet', true);
					this.set('LikeItIconConfig', resources.localizableImages.LikeItIcon);
				} else {
					this.set('likeSet', false);
					this.set('LikeItIconConfig', resources.localizableImages.NoLikeItIcon);
				}
			};

			this.methods.onModuleDestroy = function() {
				require.undef('KnowledgeBaseSectionCssModule');
				this.defineKnowledgeBaseCss(false);
			};

			var parentOnSaved = this.methods.onSaved;
			this.methods.onSaved = function() {
				if (!sandbox.publish('SaveDetails', null, [this.addTagModuleId])) {
					return;
				}
				var scope = this;
				sandbox.subscribe('DetailSaved', function() {
					if (parentOnSaved) {
						parentOnSaved.apply(scope, arguments);
					}
					if (scope.nextPrcElReady) {
						return;
					}
					Terrasoft.Router.back();
				}, [scope.addTagModuleId]);

			};
			this.methods.initialize = function(response) {
				if (response.success) {
					this.setCommentsCountValue.call(this, response.queryResults[0]);
					this.setFilesCountValue.call(this, response.queryResults[1]);
					this.getLikeItValue.call(this, response.queryResults[2]);
					//setLikeItCountValue.call(this, response.queryResults[2]);
					//getLikeItValue.call(this, response.queryResults[3]);
					//getTagsValue.call(this, response.queryResults[4]);
				}
			};
			this.methods.runQueriesInBatch = function(queriesArray) {
				var initBq = Ext.create('Terrasoft.BatchQuery');
				Terrasoft.each(queriesArray, function(item) {
					var result = item.call(this);
					if (Ext.isEmpty(result)) {
						return;
					}
					initBq.add(result.query, function() {
						if (!this.isInstance) {
							return;
						}
						result.callback.apply(this, arguments);
					}, this);
				}, this);
				if (initBq.queries.length) {
					initBq.execute(function() {}, this);
				}
			};
			this.methods.modificateBeforeRerender = function() {
				this.defineKnowledgeBaseCss(true);
			};
			this.methods.modificateBeforeBind = function() {
				if (!this.get('knowBaseImagesCollection')) {
					this.set('knowBaseImagesCollection', new Terrasoft.BaseViewModelCollection());
					this.set('knowBaseImagesCollection', new Terrasoft.BaseViewModelCollection());
				}
				this.set('FavoriteImageConfig', resources.localizableImages.FavoriteNoIcon);
				this.set('FolderVisible', true);
				this.set('FileVisible', true);
				//this.set('FileVisible', false);
				//this.set('FilesCount', '');
				this.set('plainTextMode', false);
				this.set('defaultHTMLFontFamily', 'Segoe UI');
				this.set('ViewsCountCaption', '');
				this.defineKnowledgeBaseCss(true);
			};
			var insertImages = function(files, scope) {
				Terrasoft.each(files, function(file) {
					var freader = new FileReader();
					freader.file = file;
					freader.onload = function(result) {
						var target = result.target;
						var file = target.file;
						var image = Ext.create("Terrasoft.BaseViewModel", {
							values: {
								fileName: file.name,
								url: target.result
							}
						});
						var imagesCollection = scope.get('knowBaseImagesCollection');
						if (imagesCollection) {
							imagesCollection.add(imagesCollection.getUniqueKey(), image);
						}
					};
					freader.readAsDataURL(freader.file);
				}, scope);
			};
			this.methods.insertImagesToKnowBase = function(files) {
				insertImages(files, this);
			};

			this.methods.getEditMethod = function() {
				if (this.action === 'view') {
					this.edit.call(this);
				} else {
					this.save.call(this);
				}
			};
			this.methods.removeHtmlTags = function(value) {
				if (Ext.isEmpty(value)) {
					return '';
				}
				value = value.replace(/\t/gi, '');
				value = value.replace(/>\s+</gi, '><');
				if (Ext.isWebKit) {
					value = value.replace(/<div>(<div>)+/gi, '<div>');
					value = value.replace(/<\/div>(<\/div>)+/gi, '<\/div>');
				}
				value = value.replace(/<div>\n <\/div>/gi, '\n');
				value = value.replace(/<p>\n/gi, '');
				value = value.replace(/<div>\n/gi, '');
				value = value.replace(/<div><br[\s\/]*>/gi, '');
				value = value.replace(/<br[\s\/]*>\n?|<\/p>|<\/div>/gi, '\n');
				value = value.replace(/<[^>]+>|<\/\w+>/gi, '');
				value = value.replace(/ /gi, " ");
				value = value.replace(/&nbsp;/gi, " ");
				value = value.replace(/&raquo;/gi, "\"");
				value = value.replace(/&laquo;/gi, "\"");
				value = value.replace(/&middot;/gi, " * ");
				value = value.replace(/ /gi, " ");
				value = value.replace(/&/gi, "&");
				value = value.replace(/•/gi, " * ");
				value = value.replace(/–/gi, "-");
				value = value.replace(/"/gi, "\"");
				value = value.replace(/«/gi, "\"");
				value = value.replace(/»/gi, "\"");
				value = value.replace(/‹/gi, "<");
				value = value.replace(/›/gi, ">");
				value = value.replace(/™/gi, "(tm)");
				//value = value.replace(/?/gi, "/");
				value = value.replace(/</gi, "<");
				value = value.replace(/>/gi, ">");
				value = value.replace(/©/gi, "(c)");
				value = value.replace(/®/gi, "(r)");
				value = value.replace(/&quot;/gi, "\"");
				value = value.replace(/&gt;/gi, ">");
				value = value.replace(/&lt;/gi, "<");
				value = value.replace(/&#39;/gi, "'");

				value = value.replace(/\n*$/, '');
				value = value.replace(/(\n)( )+/, '\n');
				value = value.replace(/(\n){1,}$/, '');
				return value;
			};
			this.methods.save = function() {
				var htmlValue = this.get('Notes');
				var notHtmlBody = this.removeHtmlTags(htmlValue);
				this.set('NotHtmlNote', notHtmlBody);
				return true;
			};
			this.methods.setFavorites = function() {
				var setFavorite = this.get('SetFavorite');
				if (!setFavorite) {
					var insert = Ext.create('Terrasoft.InsertQuery', {
						rootSchemaName: 'Favorites'
					});
					insert.setParameterValue('KnowledgeBase', this.get('Id'), Terrasoft.DataValueType.GUID);
					insert.setParameterValue('Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
						Terrasoft.DataValueType.GUID);
					insert.execute(function() {
						if (!this.isInstance) {
							return;
						}
						this.set('FavoriteImageConfig', resources.localizableImages.FavoriteIcon);
						this.set('SetFavorite', true);
					}, this);
				} else {
					var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
						rootSchemaName: 'Favorites'
					});
					deleteQuery.filters.addItem(deleteQuery.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, 'Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
					deleteQuery.filters.addItem(deleteQuery.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, 'KnowledgeBase', this.get('Id')));
					deleteQuery.execute(function() {
						if (!this.isInstance) {
							return;
						}
						this.set('FavoriteImageConfig', resources.localizableImages.FavoriteNoIcon);
						this.set('SetFavorite', false);
					}, this);
				}
			};
			this.methods.getContactCaption = function() {
				var contactName = this.get('CreatedBy');
				var createdDate = this.get('CreatedOn');
				if (contactName && createdDate) {
					return contactName.displayValue + ', ' + (createdDate.getDate() < 10 ? '0' : '') +
						createdDate.getDate() + '.' + ((createdDate.getMonth() + 1) < 10 ? '0' : '') +
						(createdDate.getMonth() + 1) + '.' + createdDate.getFullYear() +
						resources.localizableStrings.InfoDataSeparator + (createdDate.getHours() < 10 ? '0' : '') +
						createdDate.getHours() + ':' + (createdDate.getMinutes() < 10 ? '0' : '') +
						createdDate.getMinutes();
				}
				return;
			};
			this.methods.getNameCaption = function() {
				var name = this.get('Name');
				if (name) {
					return  name;
				}
				return;
			};
			this.methods.getLikeItCount = function() {
				this.runQueriesInBatch([getLikeItCount]);
			};
			/*this.methods.getFilesCount = function() {
				this.runQueriesInBatch([getFilesCount]);
			};
			this.methods.getViewsCount = function() {
				this.runQueriesInBatch([getViewsCount]);
			};*/
			this.methods.setLikeIt = function() {
				var likeSet = this.get('likeSet');
				if (!likeSet) {
					this.set('likeSet', true);
					var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
						rootSchemaName: 'Like'
					});
					deleteQuery.filters.add('IdFilter', deleteQuery.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, 'KnowledgeBase', this.get('Id')));
					deleteQuery.filters.add('userFilter', deleteQuery.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, 'Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
					deleteQuery.execute(function() {
						var insert = Ext.create('Terrasoft.InsertQuery', {
							rootSchemaName: 'Like'
						});
						insert.setParameterValue('KnowledgeBase', this.get('Id'), Terrasoft.DataValueType.GUID);
						insert.setParameterValue('Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
							Terrasoft.DataValueType.GUID);
						insert.setParameterValue('LikeIt', 1, Terrasoft.DataValueType.INTEGER);
						insert.execute(this.getLikeItCount, this);
					}, this);

				} else {
					this.set('likeSet', false);
					var deleteLikeQuery = Ext.create('Terrasoft.DeleteQuery', {
						rootSchemaName: 'Like'
					});
					deleteLikeQuery.filters.add('IdFilter', deleteLikeQuery.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, 'KnowledgeBase', this.get('Id')));
					deleteLikeQuery.filters.add('userFilter', deleteLikeQuery.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, 'Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
					deleteLikeQuery.execute(this.getLikeItCount, this);
				}
			};
			this.methods.setLikeImageConfig = function() {
				var likeSet = this.get('likeSet');
				if (!likeSet || Ext.isEmpty(likeSet) || likeSet === 0) {
					return resources.localizableImages.NoLikeItIcon;
				} else {
					return resources.localizableImages.LikeItIcon;
				}
			};

			this.methods.getEditIconConfig = function() {
				if (this.action === 'view') {
					return resources.localizableImages.EditIcon;
				} else {
					return resources.localizableImages.SaveIcon;
				}
			};
			this.methods.getCommentsAndFilesContainerName = function(id) {
				return getCommentsAndFilesContainerName(id);
			};
			this.methods.getItemScope = function() {
				return this;
			};
			this.methods.getId = function() {
				return this.get('Id');
			};
			this.methods.getEntity = function() {
				return this;
			};
			this.methods.getSandBoxId = function() {
				return this.getSandbox().id;
			};
			this.methods.publishMessage = function(message, args, tags) {
				return this.getSandbox().publish(message, args, tags);
			};
			this.methods.subscribe = function(eventName, eventHandler, tags) {
				this.getSandbox().subscribe(eventName, eventHandler, tags);
			};
			this.methods.loadModule = function(name, args) {
				return this.getSandbox().loadModule(name, args);
			};
			var commentsWithFilesViewModel = CommentsWithFilesModulesHelper.getViewModelConfig();
			Ext.apply(this.methods, commentsWithFilesViewModel.methods);
			Ext.apply(this.values, commentsWithFilesViewModel.values);
			Ext.apply(this.columns, commentsWithFilesViewModel.columns);

			this.schema.utilsConfig = {
				useLeftUtils: this.action === 'view',
				useRightUtils: this.action === 'view',
				leftUtilsClass: this.action === 'view' ? 'left-utils-knowledgebase' : null
			};
			this.schema.customLeftUtils = [
				{
					className: 'Terrasoft.Container',
					id: 'knowledgeBaseHeader',
					selectors: {
						wrapEl: '#knowledgeBaseHeader'
					},
					items: [
						{
							className: 'Terrasoft.Button',
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
							id: 'favorite-button-knowbase',
							selectors: {
								wrapEl: '#favorite-button-knowbase'
							},
							imageConfig: {
								bindTo: 'FavoriteImageConfig'
							},
							click: {
								bindTo: 'setFavorites'
							}
						},
						{
							className: 'Terrasoft.Label',
							caption: {
								bindTo: 'getNameCaption'
							}
						}
					]
				},
				{
					className: 'Terrasoft.Container',
					id: 'buttonTopContainer-knowledgebase',
					selectors: {
						wrapEl: '#buttonTopContainer-knowledgebase'
					},
					items: [
						{
							className: 'Terrasoft.Label',
							caption: {
								bindTo: 'getContactCaption'
							}
						}
					]
				},
				{
					className: 'Terrasoft.Container',
					items: [],
					id: 'addReadOnlyTagContainer',
					selectors: {
						wrapEl: '#addReadOnlyTagContainer'
					}
				}
			];
			this.schema.customRightUtils = [
				{
					className: 'Terrasoft.Button',
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
					id: 'edit-button-knowbase',
					selectors: {
						wrapEl: '#edit-button-knowbase'
					},
					imageConfig: {
						bindTo: 'getEditIconConfig'
					},
					click: {
						bindTo: 'getEditMethod'
					}
				}
			];
			var utilsButtons = [];
			Array.prototype.push.apply(utilsButtons, CommentsWithFilesModulesHelper.getViewConfig());
			utilsButtons.push({
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
				iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
				imageConfig: {
					bindTo: 'setLikeImageConfig'
				},
				id: 'like-it-button-knowbase',
				selectors: {
					wrapEl: '#like-it-button-knowbase'
				},
				tag: 1,
				caption: {
					bindTo: 'LikeItSUM'
				},
				click: {
					bindTo: 'setLikeIt'
				},
				visible: this.action === 'view'
			});
			this.schema.bottomUtilsConfig = [
				{
					className: 'Terrasoft.Container',
					items: [],
					id: 'addTagContainer',
					selectors: {
						wrapEl: '#addTagContainer'
					}
				},
				{
					className: 'Terrasoft.Container',
					id: 'buttonContainer',
					selectors: {
						wrapEl: '#buttonContainer'
					},
					items: utilsButtons
				}
			];
			this.schema.leftPanelWrapClass = 'KnowledgeBaseLeftPanelWrapClass';

			this.methods.onCustomHtmlControlAfterRender = function() {
				if (this.action !== 'view') {
					return;
				}
				var control = Ext.getCmp('email-body-html-knowbase-' + this.action);
				var el = control.getWrapEl();
				var value = this.get('Notes');
				el.dom.innerHTML = value;
			};
			this.schema.customPanel = [
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Id',
					columnPath: 'Id',
					visible: false,
					viewVisible: false
				},
				{
					type: ConfigurationEnums.CustomViewModelSchemaItem.ITEMS_GROUP,
					name: 'knowledgebase-name-code-container',
					id: 'knowledgebase-name-code-container',
					wrapContainerClass: 'items-container-class',
					visible: true,
					showLabel: true,
					items: [
						{
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Name',
							columnPath: 'Name',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							viewVisible: false,
							labelCustomConfig: {
								classes: ['knowledgebase-label-name-class']
							},
							labelCustomConfigModes: ['edit', 'add', 'copy'],
							wrapClass: ['controlBaseedit', 'knowledgebase-input-name-class']
						},
						{
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Type',
							columnPath: 'Type',
							dataValueType: Terrasoft.DataValueType.ENUM,
							visible: true,
							viewVisible: false,
							labelCustomConfigModes: ['edit', 'add', 'copy'],
							labelCustomConfig: {
								classes: ['knowledgebase-label-type-class']
							},
							wrapClass: ['controlBaseedit', 'knowledgebase-input-type-class']

						}
					]
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Notes',
					columnPath: 'Notes',
					captionVisible: false,
					dataValueType: Terrasoft.DataValueType.TEXT,
					visible: true,
					viewVisible: true,
					customItem: (this.action === 'view'),
					customConfig: {
						id: 'email-body-html-knowbase-' + this.action,
						selectors: {
							el: '#email-body-html-knowbase-' + this.action,
							wrapEl: '#email-body-html-knowbase-' + this.action
						},
						className: 'Terrasoft.controls.HtmlEdit',
						margin: '24px 0px 0px',
						imageLoaded: { bindTo: 'insertImagesToKnowBase' },
						images: { bindTo: 'knowBaseImagesCollection' },
						plainTextMode: {
							bindTo: 'plainTextMode'
						},
						defaultFontFamily: 'Segoe UI'
					}
				}
			];
			this.schema.leftPanel = [];
			this.schema.rightPanelWrapClass = 'KnowledgeBaseRightPanelWrapClass';
			this.schema.rightPanel = [
				//GeneralDetails.File('KnowledgeBase', 'FileVisible'),
				{
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					name: 'plainTextMode',
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					visible: false,
					viewVisible: false
				}
			];
			this.schema.customBottomPanelWrapClass = 'KnowledgeBaseCustomBottomPanelWrapClass';
			this.schema.customBottomPanel = [];

		};

		function getFavorites() {
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'Favorites'
			});
			select.addColumn('Contact');
			select.addColumn('KnowledgeBase');
			select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, 'Contact',
				Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
			select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'KnowledgeBase', this.get('Id')));

			var callback = function(response) {
				if (response.success && response.collection.getCount() > 0) {
					this.set('FavoriteImageConfig', resources.localizableImages.FavoriteIcon);
					this.set('SetFavorite', true);
				} else {
					this.set('FavoriteImageConfig', resources.localizableImages.FavoriteNoIcon);
					this.set('SetFavorite', false);
				}
			};
			return {
				query: select,
				callback: callback
			};
		}

		var getCommentsAndFilesContainerName = function() {
			return 'autoGeneratedCustomBottomContainer';
		};

		function getLikeItCount() {
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'Like'
			});
			select.addAggregationSchemaColumn('LikeIt', Terrasoft.AggregationType.SUM, 'LikeItSUM');
			select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'KnowledgeBase', this.get('Id')));
			var callback = function(response) {
				if (response.success && response.collection.getCount() > 0) {
					this.set('LikeItSUM', response.collection.getByIndex(0).get('LikeItSUM'));
				} else {
					this.set('LikeItSUM', '');
				}
			};
			return {
				query: select,
				callback: callback
			};
		}
		return structure;
	});