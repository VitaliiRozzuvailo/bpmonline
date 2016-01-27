define('KnowledgeBaseSection', ['KnowledgeBase', 'KnowledgeBaseSectionStructure', 'KnowledgeBaseSectionResources',
    'KnowledgeBaseTag', 'KnowledgeBaseTagDecoupling', 'FileHelper', 'CommentsWithFilesModulesHelper',
	'css!KnowledgeBaseSectionCssModule', 'css!FileHelper', 'css!CommentsWithFilesModulesHelper'],
	function(KnowledgeBase, structure, resources, KnowledgeBaseTag, KnowledgeBaseTagDecoupling, FileHelper,
	CommentsWithFilesModulesHelper) {
		structure.userCode = function() {
			this.entitySchema = KnowledgeBase;
			this.contextHelpId = '1006';
			this.name = 'KnowledgeBaseSectionViewModel';
			this.columnsConfig = [
				[
					{
						cols: 3,
						key: [
							{
								name: {
									bindTo: 'Code'
								}
							}
						]
					},
					{
						cols: 9,
						key: [
							{
								name: {
									bindTo: 'Name'
								}
							}
						]
					},
					{
						cols: 4,
						key: [
							{
								name: {
									bindTo: 'Type'
								}
							}
						]
					},
					{
						cols: 8,
						key: [
							{
								name: {
									bindTo: 'Keywords'
								}
							}
						]
					}
				]
			];
			this.loadedColumns = [
				{
					columnPath: 'Name'
				},
				{
					columnPath: 'Code'
				},
				{
					columnPath: 'Keywords'
				},
				{
					columnPath: 'Type'
				},
				{
					columnPath: 'ViewsCount'
				}
			];
			this.methods.gridSettingsPageConfig = {
				isSingleTypeMode: true
			};
			this.methods.onAfterGridRowRender = function(id, renderTo) {
				if (id && renderTo) {
					var row = this.collection.get(id);
					var scope = row.scope;
					var model = scope.getExternalViewRowAction(id);
					model.init(id, renderTo, this);
				}
			};
			this.methods.modifySelectQuery = function(select) {
				var tabName = this.get('currentTabName');
				if (tabName === 'favorites') {
					select.filters.add('FavoritesFilter',
						select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							'[Favorites:KnowledgeBase].Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
				}
			};
			this.methods.viewChanging = function() {
				this.defineKnowledgeBaseCss(true);
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
			this.methods.onModuleDestroy = function() {
				require.undef('KnowledgeBaseSectionCssModule');
				this.defineKnowledgeBaseCss(false);
			};
			this.methods.modifyGridConfig = function(gridConfig) {
				//gridConfig.activeRowActions = false;
				Terrasoft.each(gridConfig.activeRowActions, function(action) {
					action.visible = false;
				});

			};
			this.methods.loadGridCollectionItems = function(items) {
				var base = arguments[arguments.length - 1];
				var tempCollection = new Terrasoft.Collection();
				var collection = this.get('gridData');
				tempCollection.loadAll(collection);
				tempCollection.loadAll(items);
				collection.clear();
				base.call(this, tempCollection);
			};
			this.methods.getViews = function(baseGetViews) {
				var views = baseGetViews.call(this);
				views.splice(1, 0, {
					name: 'favorites',
					likeMain: true,
					caption: resources.localizableStrings.FavoritesViewHeader
				});
				return views;
			};
			this.methods.getExternalViewRowAction = function(id) {
				var collectionModels = this.get('collectionModels');
				var model;
				Terrasoft.each(collectionModels, function(item) {
					if (item.id === id) {
						model = item.model;
					}
				}, this);
				if (!model) {
					model = getViewModel();
					collectionModels.push({
						id: id,
						model: model
					});
				}
				return model;
			};
			this.methods.esqConfig = {
				sort: {
					columns: [
						{
							name: 'Name',
							orderPosition: 0,
							orderDirection: Terrasoft.OrderDirection.ASC
						}
					]
				}
			};/*
			this.tagFilterConfig = {
				tagSchema: KnowledgeBaseTag,
				decouplingSchema: KnowledgeBaseTagDecoupling
			};*/
			this.methods.modifyItems = function(responseItems) {
				var collectionModels = this.get('collectionModels');
				if (!collectionModels) {
					collectionModels = [];
					this.set('collectionModels', collectionModels);
				}
				Terrasoft.each(responseItems.collection.items, function(item) {
					item.scope = this;
				}, this);
			};
		};
		function getLikeItCountSelect(KnowledgeBaseId) {
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'Like'
			});
			select.addAggregationSchemaColumn('LikeIt', Terrasoft.AggregationType.SUM, 'LikeItSUM');
			select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'KnowledgeBase', KnowledgeBaseId));
			return select;
		}
		function getLikeItSelect(KnowledgeBaseId) {
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'Like'
			});
			select.addColumn('Contact');
			select.addColumn('KnowledgeBase');
			select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, 'Contact',
				Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
			select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'KnowledgeBase', KnowledgeBaseId));
			return select;
		}
		function getTagSelect(KnowledgeBaseId) {
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'KnowledgeBaseTagDecoupling'
			});
			select.addColumn('Tag.Name', 'TagName');
			select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'KnowledgeBase', KnowledgeBaseId));
			return select;
		}
		function setLikeItCountValue(response) {
			if (!this.isInstance) { return; }
			var count = '';
			if ((response.success && response.collection && response.collection.collection.items.length > 0)) {
				count = response.collection.collection.items[0].get('LikeItSUM');
			} else if (response.rowsAffected > 0) {
				count = response.rows[0].LikeItSUM;
			}
			this.set('LikeItSUM', count);
		}
		function getLikeItValue(response) {
			if (!this.isInstance) { return; }
			if ((response.success && response.collection && response.collection.collection.items.length > 0 ||
				response.rowsAffected > 0)) {
				this.set('likeSet', true);
				this.set('LikeItIconConfig', resources.localizableImages.LikeItIcon);
			} else {
				this.set('likeSet', false);
				this.set('LikeItIconConfig', resources.localizableImages.NoLikeItIcon);
			}
		}
		function getTagsValue(response) {
			if (!this.isInstance) { return; }
			if (response.rowsAffected > 0) {
				var tags = [];
				Terrasoft.each(response.rows, function(item) {
					tags.push(item.TagName);
				});
				this.set('Keywords', tags.join(', '));

			} else {
				this.set('Keywords', '');
			}
		}


		function generateView(id) {

			var elementView = {
				id: 'external-actions-view-' + id,
				selectors: {
					wrapEl: '#external-actions-view-' + id
				},
				items: []
			};
			elementView.items.push({
				className: 'Terrasoft.Container',
				id: 'likeItContainer' + id,
				selectors: {
					wrapEl: '#likeItContainer' + id
				},
				classes: {
					wrapClassName: ['like-it-container']
				},
				items: [{
					className: 'Terrasoft.Button',
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
					imageConfig: {
						bindTo: 'LikeItIconConfig'
					},
					id:
						'like-it-' + id,
					tag: {
						id:
							id,
						value: 1
					},
					caption: {
						bindTo: 'LikeItSUM'
					},
					click: {
						bindTo: 'setLikeIt'
					}
				}]
			});
			Array.prototype.push.apply(elementView.items, CommentsWithFilesModulesHelper.getViewConfig(id));
			elementView.items.push({
				className: 'Terrasoft.Container',
				id: 'TagButtonContainer' + id,
				selectors: {
					wrapEl: '#TagButtonContainer' + id
				},
				classes: {
					wrapClassName: ['tags-button-container']
				},
				items: [{
					id: 'tags-button-' + id,
					selectors: {
						wrapEl: '#tags-button-' + id
					},
					className: 'Terrasoft.Button',
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
					imageConfig: {
						bindTo: 'getTagsIconConfig'
					},
					tag: id,
					caption: {
						bindTo: 'Keywords'
					},
					enabled: false
				}]
			});
			elementView.items.push({
				className: 'Terrasoft.Container',
				id: getCommentsAndFilesContainerName(id),
				selectors: {
					wrapEl: '#' + getCommentsAndFilesContainerName(id)
				},
				items: []
			});
			return Ext.create('Terrasoft.Container', elementView);
		}
		var getCommentsAndFilesContainerName = function(id) {
			return 'KnowledgeBaseCustomSectionContainer' + id;
		};
		var getViewModel = function() {
			var viewModelConfig = {
				columns: {},
				values: {},
				methods: {
					setLikeItCount: function(a) {
						if (!this.isInstance) { return; }
						var likeItSum = this.get('LikeItSUM');
						if (!likeItSum || a) {
							var select = getLikeItCountSelect.call(this, this.get('recordId'));
							select.getEntityCollection(setLikeItCountValue, this);
						}
					},
					getViewsCount: function() {
						var scope = this.get('scope');
						var recordId = this.get('recordId');
						var collection = scope.collection;
						var row = collection.get(recordId);
						var count = row.get('ViewsCount');
						return count;
					},
					getTagsIconConfig: function() {
						return resources.localizableImages.TagsIcon;
					},
					getCommentsAndFilesContainerName: function(id) {
						return getCommentsAndFilesContainerName(id);
					},
					setLikeIt: function() {
						var likeSet = this.get('likeSet');
						var recordId = this.get('recordId');
						if (!likeSet) {
							this.set('likeSet', true);
							this.set('LikeItIconConfig', resources.localizableImages.LikeItIcon);
							var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
								rootSchemaName: 'Like'
							});
							deleteQuery.filters.add('IdFilter',
								deleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									'KnowledgeBase', recordId));
							deleteQuery.filters.add('userFilter',
								deleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									'Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
							deleteQuery.execute(function() {
								var insert = Ext.create('Terrasoft.InsertQuery', {
									rootSchemaName: 'Like'
								});
								insert.setParameterValue('KnowledgeBase', recordId, Terrasoft.DataValueType.GUID);
								insert.setParameterValue('Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
									Terrasoft.DataValueType.GUID);
								insert.setParameterValue('LikeIt', 1, Terrasoft.DataValueType.INTEGER);
								insert.execute(this.setLikeItCount, this);
							}, this);

						} else {
							this.set('likeSet', false);
							this.set('LikeItIconConfig', resources.localizableImages.NoLikeItIcon);
							var likeDeleteQuery = Ext.create('Terrasoft.DeleteQuery', {
								rootSchemaName: 'Like'
							});
							likeDeleteQuery.filters.add('IdFilter',
								likeDeleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									'KnowledgeBase', recordId));
							likeDeleteQuery.filters.add('userFilter',
								likeDeleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									'Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
							likeDeleteQuery.execute(this.setLikeItCount, this);
						}

					},
					getLikeIt: function() {
						var likeIt = this.get('LikeItIconConfig');
						if (!likeIt) {
							var select = getLikeItSelect.call(this, this.get('recordId'));
							select.getEntityCollection(getLikeItValue, this);
						}
					},
					init: function(id, renderTo, externalScope) {
						var row = externalScope.collection.get(id);
						var scope = this;
						row.scope.subscribe('GetDetailItems', function(args) {
							scope.setCommentsCount(true, args.recordId);
						}, [id]);

						row.scope.subscribe('FileDeleted', function() {
							var fileCount = scope.get('FilesCount');
							if (fileCount) {
								scope.set('FilesCount', --fileCount);
							}
							if (!fileCount) {
								var recordId = scope.getId();
								var externalScope = scope.getItemScope();
								var filesVisible = externalScope.get('FileVisible' + recordId);
								var innerFileContainer = Ext.get('FileListContainer' + recordId);
								if (filesVisible &&
									filesVisible.visible &&
									filesVisible.id === recordId &&
									innerFileContainer) {
									scope.hideFiles(recordId, externalScope);
								}
							}
							scope.setFilesCount();
						}, [id]);
						var view = this.get('View');
						if (!view) {
							view = generateView(id);
							view.bind(this);
							this.set('View', view);
							view.render(renderTo);
						} else {
							view.reRender(null, renderTo);
						}
						this.set('scope', externalScope);
						this.set('recordId', id);
						//	this.setCommentsCount();
						//	this.setFilesCount();
						//	this.setLikeItCount();
						//	this.getLikeIt();
						this.onCommentViewChanged(false);
						this.setFileDetailVisible(false);
						var batch = Ext.create("Terrasoft.BatchQuery");
						batch.add(scope.getCommentSelect(id));//, setCommentsCountValue, this);
						batch.add(scope.getFilesSelect(id));//, setFilesCountValue, this);
						batch.add(getLikeItCountSelect(id));//, setLikeItCountValue, this);
						batch.add(getLikeItSelect(id));//, getLikeItValue, this);
						batch.add(getTagSelect(id));//, getLikeItValue, this);

						if (batch.queries.length > 0) {
							batch.execute(this.initialize, this);
						}
						//this.set('View', view);
					},
					initialize: function(response) {
						if (response.success) {
							this.setCommentsCountValue.call(this, response.queryResults[0]);
							this.setFilesCountValue.call(this, response.queryResults[1]);
							setLikeItCountValue.call(this, response.queryResults[2]);
							getLikeItValue.call(this, response.queryResults[3]);
							getTagsValue.call(this, response.queryResults[4]);
						}
					},
					getItemScope: function(id) {
						return this.getEntity(id).scope;
					},
					getId: function() {
						return this.get('recordId');
					},
					getEntity: function(id) {
						var scope = this.get('scope');
						var recordId = id || this.getId();
						var collection = scope.collection;
						return collection.get(recordId);
					}

				}
			};
			var commentsWithFilesViewModelConfig = CommentsWithFilesModulesHelper.getViewModelConfig(/*{
				entitySchema: KnowledgeBase,
				tagSchema: KnowledgeBaseTag,
				decouplingSchema: KnowledgeBaseTagDecoupling
			}*/);
			Ext.apply(viewModelConfig.methods, commentsWithFilesViewModelConfig.methods);
			Ext.apply(viewModelConfig.columns, commentsWithFilesViewModelConfig.columns);
			Ext.apply(viewModelConfig.values, commentsWithFilesViewModelConfig.values);

			var viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
	//		viewModel.readOnlyMode = true;
			return viewModel;
		};

		return structure;
	});
