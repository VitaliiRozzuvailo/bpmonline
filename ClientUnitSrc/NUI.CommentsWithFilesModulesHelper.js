define('CommentsWithFilesModulesHelper', ['ext-base', 'terrasoft', 'CommentsWithFilesModulesHelperResources',
	'FileHelper'], function(Ext, Terrasoft, resources, FileHelper) {
		function getViewConfig(UId) {
			var fileButtonConfig = Terrasoft.deepClone(FileHelper.addFileButtonConfig);
			fileButtonConfig.tag = UId;
			var itemsConfig = [
				{
					className: 'Terrasoft.Container',
					id: 'CommentsButtonContainer' + UId,
					selectors: {
						wrapEl: '#CommentsButtonContainer' + UId
					},
					classes: {
						wrapClassName: ['comments-button-container']
					},
					items: [
						{
							id: 'comments-button-' + UId,
							selectors: {
								wrapEl: '#comments-button-' + UId
							},
							className: 'Terrasoft.Button',
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
							imageConfig: {
								bindTo: 'getCommentsIconConfig'
							},
							tag: UId,
							caption: {
								bindTo: 'CommentsCountCaption'
							},
							click: {
								bindTo: 'onCommentViewChanged'
							}
						},
						{
							id: 'selectedItemImage' + UId,
							className: 'Terrasoft.HtmlControl',
							html: '<img id="' + 'selectedItemImage' + UId +
								'" class="file-list-selected-image" src="' +
								Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.SelecteItemImage) + '"/>',
							selectors: {
								wrapEl: '#' + 'selectedItemImage' + UId
							},
							visible: {
								bindTo: 'commentsSelected'
							}
						}
					]
				},
				{
					className: 'Terrasoft.Container',
					id: 'FileButtonContainer' + UId,
					selectors: {
						wrapEl: '#FileButtonContainer' + UId
					},
					classes: {
						wrapClassName: ['files-button-container']
					},
					items: [
						{
							id: 'files-button-' + UId,
							selectors: {
								wrapEl: '#files-button-' + UId
							},
							className: 'Terrasoft.Button',
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
							imageConfig: {
								bindTo: 'FileIconConfig'
							},
							tag: UId,
							caption: {
								bindTo: 'FilesCount',
								bindConfig: {
									converter: function(value) {
										return value || '';
									}
								}
							},
							enabled: {
								bindTo: 'setFilesEnabled'
							},
							click: {
								bindTo: 'setFileDetailVisible'
							}
						},
						{
							id: 'selectedFileItemImage' + UId,
							className: 'Terrasoft.HtmlControl',
							html: '<img id="' + 'selectedFileItemImage' + UId +
								'" class="file-list-selected-image" src="' +
								Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.SelecteItemImage) + '"/>',
							selectors: {
								wrapEl: '#' + 'selectedFileItemImage' + UId
							},
							visible: {
								bindTo: 'filesSelected'
							}
						}
					]
				},
				fileButtonConfig
			];
			return itemsConfig;
		}

		function getViewModelConfig() {
			var config = {
				methods: {
					onFileSelect: function(files, tag) {
						tag = tag || this.get('Id');
						var scope = this;
						var cb = function() {
							scope.onFileLoaded.apply(scope, arguments);
						};
						if (this.isNew && this.save) {
							this.isSilentSave = true;
							this.silentArgs = {
								callback: function() {
									FileHelper.onFileSelect.call(this, files, 'KnowledgeBaseFile', 'KnowledgeBase',
										tag, cb);
								},
								scope: this
							};
							this.save();
						} else {
							FileHelper.onFileSelect.call(this, files, 'KnowledgeBaseFile', 'KnowledgeBase', tag, cb);
						}
					},
					onFileLoaded: function(responce, elementId) {
						if (!responce.success) {
							return;
						}
						var scope = this.getItemScope(elementId);
						var detailInstanceId = scope.getSandBoxId() + '_FileListModule' + elementId;
						/*var fileCount = this.get('FilesCount');
						if (fileCount) {
						this.set('FilesCount', ++fileCount);
						}*/
						this.setFilesCount();
						scope.getSandbox().publish('RefreshFiles', {
							addedIds: [responce.id]
						}, [detailInstanceId]);
					},
					setCommentsCount: function(needSelect, recordId) {
						var commentsCount = this.get('CommentsCount');
						if (!commentsCount || needSelect) {
							var select = this.getCommentSelect.call(this, recordId);
							select.getEntityCollection(this.setCommentsCountValue, this);
						}
					},
					setCommentsCountValue: function(response) {
						if (!this.isInstance) {
							return;
						}
						var count = 0;
						if ((response.success && response.collection &&
							response.collection.collection.items.length > 0)) {
							count = response.collection.collection.items[0].get('KnowledgeBaseCount');
						} else if (response.rowsAffected > 0) {
							count = response.rows[0].KnowledgeBaseCount;
						}
						this.set('CommentsCount', count);
						var commentCaption = '';
						if (count > 0) {
							commentCaption = count;
						}
						this.set('CommentsCountCaption', commentCaption);
					},
					setFilesCount: function() {
						var select = this.getFilesSelect(this.getId());
						select.getEntityCollection(this.setFilesCountValue, this);
					},
					getFilesSelect: function(KnowledgeBaseId) {
						var select = Ext.create('Terrasoft.EntitySchemaQuery', {
							rootSchemaName: 'KnowledgeBaseFile'
						});
						select.addAggregationSchemaColumn('KnowledgeBase', Terrasoft.AggregationType.COUNT,
							'KnowledgeBaseFileCount');
						select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							'KnowledgeBase', KnowledgeBaseId));
						return select;
					},
					setFilesCountValue: function(response) {
						if (!this.isInstance) {
							return;
						}
						var fileCount = 0;
						if ((response.success && response.collection &&
							response.collection.collection.items.length > 0)) {
							fileCount = response.collection.collection.items[0].get('KnowledgeBaseFileCount');
						} else if (response.rowsAffected > 0) {
							fileCount = response.rows[0].KnowledgeBaseFileCount;
						}
						this.set('FilesCount', fileCount);
						if (fileCount > 0) {
							this.set('FileIconConfig', resources.localizableImages.FileIcon);
						} else {
							this.set('FileIconConfig', resources.localizableImages.NoFileIcon);
						}
					},
					setFilesEnabled: function() {
						var fileCount = this.get('FilesCount');
						if (Ext.isEmpty(fileCount) || fileCount === 0) {
							return false;
						} else {
							return true;
						}
					},
					getCommentsIconConfig: function() {
						var commentsCount = this.get('CommentsCount');
						if (commentsCount && commentsCount > 0) {
							return resources.localizableImages.ExistCommentsIcon;
						}
						return resources.localizableImages.MissingCommentsIcon;
					},
					setFileDetailVisible: function(event) {
						event = Ext.isEmpty(event) || event;
						var recordId = this.getId();
						var externalScope = this.getItemScope();
						var entity = this.getEntity();
						var filesVisible = externalScope.get('FileVisible' + recordId);
						var commentVisible = externalScope.get('commentVisible' + recordId);

						var innerFileContainer = Ext.get('FileListContainer' + recordId);
						var innerCommentContainer = Ext.get('topContainer' + recordId);
						if (!innerFileContainer && event || filesVisible && filesVisible.id === recordId &&
							filesVisible.visible && !event) {
							if (commentVisible && innerCommentContainer && commentVisible.visible &&
								commentVisible.id === recordId && event) {
								this.hideComments(recordId, externalScope);
							}
							this.showFiles(recordId, entity, externalScope);
						} else {
							if (innerFileContainer && event) {
								this.hideFiles(recordId, externalScope);
							}
						}
					},
					showFiles: function(recordId, entity, externalScope) {
						var detailContainer = Ext.get(this.getCommentsAndFilesContainerName(recordId));
						var detailInstanceId = externalScope.getSandBoxId() + '_FileListModule' + recordId;
						var elementId = entity.get('Id');
						externalScope.subscribe('GetRecordInfo', function() {
							return {
								recordId: elementId
							};
						}, [detailInstanceId]);
						externalScope.loadModule('FileListModule', {
							renderTo: detailContainer,
							id: detailInstanceId,
							reload: false
						});
						this.set('filesSelected', true);
						externalScope.set('FileVisible' + elementId, { id: elementId, visible: true });
					},
					hideFiles: function(recordId, externalScope) {
						var detailInstanceId = externalScope.getSandBoxId() + '_FileListModule' + recordId;
						var detailTopContainer = Ext.get('FileListContainer' + recordId);
						externalScope.publishMessage('DestroyFilesModule', null, [detailInstanceId]);
						requirejs.undef('FileListModule');
						this.set('filesSelected', false);
						externalScope.set('FileVisible' + recordId, { id: recordId, visible: false });
						detailTopContainer.remove();
					},
					onCommentViewChanged: function(event) {
						event = Ext.isEmpty(event) || event;
						var recordId = this.getId();
						var externalScope = this.getItemScope();
						var entity = this.getEntity();
						var commentVisible = externalScope.get('commentVisible' + recordId);
						var filesVisible = externalScope.get('FileVisible' + recordId);

						var innerFileContainer = Ext.get('FileListContainer' + recordId);
						var innerCommentContainer = Ext.get('topContainer' + recordId);
						if (!innerCommentContainer && event || commentVisible && commentVisible.id === recordId &&
							commentVisible.visible && !event) {
							if (filesVisible && filesVisible.visible && filesVisible.id === recordId &&
								innerFileContainer && event) {
								this.hideFiles(recordId, externalScope);
							}
							this.showComments(recordId, entity, externalScope);
						} else {
							if (innerCommentContainer && event) {
								this.hideComments(recordId, externalScope);
							}
						}
					},
					showComments: function(recordId, entity, externalScope) {
						var detailContainer = Ext.get(this.getCommentsAndFilesContainerName(recordId));
						var detailInstanceId = externalScope.getSandBoxId() + '_CommentsModule' + recordId;
						var elementId = entity.get('Id');
						externalScope.subscribe('GetRecordInfo', function() {
							return {
								recordId: elementId
							};
						}, [detailInstanceId]);
						externalScope.loadModule('CommentsModule', {
							renderTo: detailContainer,
							id: detailInstanceId,
							reload: false
						});
						this.set('commentsSelected', true);
						externalScope.set('commentVisible' + elementId, { id: elementId, visible: true });
					},
					hideComments: function(recordId, externalScope) {
						var detailInstanceId = externalScope.getSandBoxId() + '_CommentsModule' + recordId;
						var detailTopContainer = Ext.get('topContainer' + recordId);
						externalScope.publishMessage('DestroyCommentModule', null, [detailInstanceId]);
						requirejs.undef('CommentsModule');
						detailTopContainer.remove();
						this.set('commentsSelected', false);
						externalScope.set('commentVisible' + recordId, { id: recordId, visible: false });

					},

					getCommentSelect: function(knowledgeBaseId) {
						var select = Ext.create('Terrasoft.EntitySchemaQuery', {
							rootSchemaName: 'Comment'
						});
						select.addAggregationSchemaColumn('KnowledgeBase', Terrasoft.AggregationType.COUNT,
							'KnowledgeBaseCount');
						select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							'KnowledgeBase', knowledgeBaseId));
						return select;
					}

				},
				values: {},
				columns: {}
			};
			return config;
		}

		return {
			getViewConfig: getViewConfig,
			getViewModelConfig: getViewModelConfig
		};
	});