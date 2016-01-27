define('CommentsModule', ['Comment', 'CommentsModuleResources', 'ConfigurationConstants', 'GridUtilities'],
	function(Comment, resources, ConfigurationConstants, GridUtilities) {
		function createConstructor(context) {
			var Ext = context.Ext;
			var sandbox = context.sandbox;
			var Terrasoft = context.Terrasoft;
			/*********************************************************************************************************/
			/*       ViewModel                                                                                       */
			/********************************************************************************************************/
			var getViewModel = function(scope) {
				var viewModel = Ext.create('Terrasoft.BaseViewModel', {
					entitySchema: Comment,
					values: {
						allCommentsGridData: new Terrasoft.BaseViewModelCollection(),
						commentsGridData: new Terrasoft.BaseViewModelCollection(),
						currentLength: 0,
						commentsAllCount: 0,
						visibleCommentsCount: Terrasoft.SysSettings.cachedSettings.CommentsN || 3,
						commentN: Terrasoft.SysSettings.cachedSettings.CommentsN || 3,
						commentsLoaded: false,
						firstLoad: false,
						gridEmpty: false,
						newCommentValue: '',
						knowledgeBaseRecordId: null,
						contactPhotoConfig: null
					},
					rowConfig: [
						{
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: 'activeRow',
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							visible: false
						},
						{
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: 'commentsGridData',
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							visible: true,
							isCollection: true
						},
						{
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: 'selectedRows',
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							visible: false
						},
						{
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: 'canLoadData',
							dataValueType: Terrasoft.DataValueType.BOOLEAN,
							visible: false
						}
					],
					methods: {
						getMoreCaptionButton: function() {
							var commentN = this.get('commentN');
							var currentLength = this.get('visibleCommentsCount');
							var commentsAllCount = this.get('commentsAllCount');
							var loadLength = commentsAllCount - currentLength;
							if (commentN > loadLength) {
								commentN = loadLength;
							}
							var caption = resources.localizableStrings.ViewMoreCaption;
							return Ext.String.format(caption, commentN);
						},
						loadMoreVisibility: function() {
							var commentsAllCount = this.get('commentsAllCount');
							var visibleCommentsCount = this.get('visibleCommentsCount');
							return commentsAllCount > visibleCommentsCount;
						},
						loadNext: function() {
							var visibleCommentsCount = this.get('visibleCommentsCount');
							var commentN = this.get('commentN');
							this.set('visibleCommentsCount', visibleCommentsCount + commentN);
							this.loadCommentsCollection();
						},
						setAllLoaded: function() {
							this.set('newCommentValue', '');
							this.changeGridView();
						},
						loadCommentsCollection: function() {
							if (instance.isDestroyed) {
								return;
							}
							this.set('commentsLoaded', false);
							var recordId = this.get('knowledgeBaseRecordId');
							if (Ext.isEmpty(recordId)) {
								return;
							}
							var select = Ext.create('Terrasoft.EntitySchemaQuery', {
								rootSchemaName: 'Comment'
							});
							select.isDistinct = true;
							select.addColumn('Id');
							select.addColumn('Contact');
							var column = select.addColumn('CreatedOn');
							column.orderDirection = Terrasoft.OrderDirection.DESC;
							select.addColumn('CommentKnowledgeBase');
							select.addColumn('KnowledgeBase');
							var filters = Terrasoft.createFilterGroup();
							filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								'KnowledgeBase', recordId));
							select.filters = filters;
							var visibleCommentsCount = this.get('visibleCommentsCount');
							var skipRowCount = visibleCommentsCount;
							select.getEntityCollection(function(response) {
								if (instance.isDestroyed) {
									return;
								}
								var comments = this.get('commentsGridData');
								comments.clear();
								if (response && response.success) {
									var responseItems = response.collection.getItems();
									this.set('allCommentsGridData', responseItems);
									var newCollection = new Terrasoft.BaseViewModelCollection();
									var length = responseItems.length;
									this.set('commentsAllCount', length);
									var slicedItems = responseItems.slice(0, skipRowCount);
									var canEditOrDeleteComment = this.get('CanEditOrDeleteComment');
									Terrasoft.each(slicedItems.reverse(), function(item) {
										item.entitySchema = this.entitySchema;
										item.id = item.get('Id');
										item.columns.captionResult = {
											dataValueType: Terrasoft.DataValueType.TEXT
										};
										item.editItem = function() {
											var id = this.get('Id');
											viewModel.editItem(id);
										};
										item.deleteItem = function() {
											var id = this.get('Id');
											var buttonsConfig = {
												buttons: [Terrasoft.MessageBoxButtons.YES.returnCode,
													Terrasoft.MessageBoxButtons.NO.returnCode],
												defaultButton: 0
											};
											this.showInformationDialog(resources.localizableStrings.DeleteMessage,
												function(result) {
													if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
														var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
															rootSchemaName: 'Comment'
														});
														var filters = deleteQuery.filters;
														var idFilter = Terrasoft.createColumnFilterWithParameter(
															Terrasoft.ComparisonType.EQUAL, 'Id', id);
														filters.add('IdFilter', idFilter);
														deleteQuery.execute(function(responce) {
															this.onDeleted(responce, id);
														}, viewModel);
													}
												}, buttonsConfig, this);
										};
										getCaption(item);
										checkCanEdit(item, canEditOrDeleteComment);
										newCollection.add(item.id, item);
									}, this);
									var currentLength = newCollection.getCount();
									this.set('visibleCommentsCount', currentLength);
									comments.loadAll(newCollection);
								}
								this.set('commentsLoaded', true);
								this.setAllLoaded();
							}, this);

						},
						onActiveRowAction: function(tag) {
							if (tag === 'Edit') {
								this.editItem();
							} else if (tag === 'Delete') {
								this.deleteItem();
							}
						},
						editItem: function(id) {
							this.set('editMode', true);
							var gridData = this.get('commentsGridData');
							this.set('activeRow', id);
							var row = gridData.get(id);
							var CommentKnowledgeBase = row.get('CommentKnowledgeBase');
							this.set('newCommentValue', CommentKnowledgeBase);
						},
						onDeleted: function(response, recordId) {
							if (!response.success) {
								return;
							}
							var collection = this.get('commentsGridData');
							collection.removeByKey(recordId);
							var visibleCommentsCount = this.get('visibleCommentsCount');
							this.set('visibleCommentsCount', --visibleCommentsCount);
							var commentsAllCount = this.get('commentsAllCount');

							this.set('commentsAllCount', --commentsAllCount);
							this.set('gridEmpty', !collection.getItems().length);
							this.set('editMode',false);
							var knowledgeBaseRecordId = this.get('knowledgeBaseRecordId');
							this.sandbox.publish('GetDetailItems', {
								recordId: knowledgeBaseRecordId
							}, [knowledgeBaseRecordId]);
						},
						addComment: function() {
							var isNewRecord = this.cardAction === 'add' || this.cardAction === 'copy';
							if (isNewRecord) {
								var historyState = sandbox.publish('GetHistoryState');
								var sandboxId = historyState.state.moduleId;
								var args = {
									callback: this.addingComment,
									scope: this,
									escope: this,
									moduleId: Ext.isEmpty(sandboxId) ? sandbox.id : sandboxId
								};
								sandbox.publish('SaveRecord', args);
								return;
							}
							this.addingComment();
						},
						addingComment: function(tag, customAction, scope) {
							scope = scope || this;
							var editMode = scope.get('editMode');
							var newCommentValue = scope.get('newCommentValue');
							scope.set('commentValue', newCommentValue);
							if (editMode) {
								var activeRow = scope.get('activeRow');
								var update = Ext.create("Terrasoft.UpdateQuery", {
									rootSchemaName: 'Comment'
								});
								var filters = update.filters;
								var idFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									'Id', activeRow);
								filters.add('IdFilter', idFilter);
								update.setParameterValue('CommentKnowledgeBase', newCommentValue,
									Terrasoft.DataValueType.TEXT);
								update.execute(scope.afterAddComment, scope);
							} else {
								var recordId = scope.get('knowledgeBaseRecordId');
								var insert = Ext.create('Terrasoft.InsertQuery', {
									rootSchemaName: 'Comment'
								});
								insert.setParameterValue('Contact', Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
									Terrasoft.DataValueType.GUID);
								insert.setParameterValue('KnowledgeBase', recordId, Terrasoft.DataValueType.GUID);
								insert.setParameterValue('CommentKnowledgeBase', newCommentValue,
									Terrasoft.DataValueType.TEXT);
								var visibleCommentsCount = this.get('visibleCommentsCount');
								this.set('visibleCommentsCount', visibleCommentsCount + 1);
								insert.execute(scope.afterAddComment, scope);
							}
						},
						afterAddComment: function(response) {
							var knowledgeBaseRecordId = this.get('knowledgeBaseRecordId');
							this.sandbox.publish('GetDetailItems', {
								recordId: knowledgeBaseRecordId
							}, [knowledgeBaseRecordId]);
							if (instance.isDestroyed) {
								return;
							}
							this.loadCommentsCollection(1);
							this.set('editMode', false);
						},
						getCommentsContactCaption: function() {
							var contactName = this.get('Contact');
							var createdDate = this.get('ModifiedOn');
							if (contactName && createdDate) {
								return contactName.displayValue + ' ' + createdDate.toLocaleDateString() +
									' ' + createdDate.toLocaleTimeString();
							}
							return '';
						},
						onAfterGridRowRender: function(id, renderTo) {
							if (id && renderTo) {
								var view = Ext.create('Terrasoft.Container', {
									id: 'comment-buttons-container-' + id,
									selectors: {
										wrapEl: '#comment-buttons-container-' + id
									},
									items: [
										{
											className: 'Terrasoft.Button',
											imageConfig: resources.localizableImages.EditIcon,
											style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
											tag: id,
											click: {
												bindTo: 'editItem'
											},
											classes: {
												wrapperClass: ['comment-edit-button']
											},
											visible: {
												bindTo: 'canEdit'
											}
										},
										{
											className: 'Terrasoft.Button',
											imageConfig: resources.localizableImages.DeleteIcon,
											style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
											tag: id,
											click: {
												bindTo: 'deleteItem'
											},
											classes: {
												wrapperClass: ['comment-remove-button']
											},
											visible: {
												bindTo: 'canEdit'
											}
										}
									]
								});
								var itemViewModel = viewModel.get('commentsGridData').get(id);
								view.bind(itemViewModel);
								view.render(renderTo);
							}
						}
					}
				});
				return viewModel;
			};

			function checkCanEdit(context, canEditOrDeleteComment) {
				var contact = context.get('Contact');
				if (canEditOrDeleteComment || contact.value === Terrasoft.SysValue.CURRENT_USER_CONTACT.value) {
					context.set('canEdit', true, {silent: true});
				} else {
					context.set('canEdit', false, {silent: true});
				}
			}

			function callServiceMethod(serviceName, methodName, callback, dataSend, context) {
				var data = dataSend || {};
				var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/' + serviceName + '/' + methodName;
				var request = Terrasoft.AjaxProvider.request({
					url: requestUrl,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'POST',
					jsonData: data,
					callback: function(request, success, response) {
						var responseObject = {};
						if (success) {
							responseObject = Terrasoft.decode(response.responseText);
						}
						callback.call(context, responseObject);
					},
					scope: context
				});
				return request;
			}

			function init(id, renderTo, externalScope) {
				this.externalScope = externalScope;

			}

			function getCaption(item) {
				var contactName = item.get('Contact');
				var createdDate = item.get('CreatedOn');
				var modifiedOn = item.get('ModifiedOn');
				var result = contactName.displayValue;
				if (contactName && (createdDate || modifiedOn)) {
					var date = Ext.isEmpty(modifiedOn) || modifiedOn === null ? createdDate : modifiedOn;
					result += ', ' + (createdDate.getDate() < 10 ? '0' : '') + createdDate.getDate() + '.' +
						((createdDate.getMonth() + 1) < 10 ? '0' : '') + (createdDate.getMonth() + 1) + '.' +
						createdDate.getFullYear() + resources.localizableStrings.InfoDataSeparator +
						(createdDate.getHours() < 10 ? '0' : '') + createdDate.getHours() + ':' +
						(createdDate.getMinutes() < 10 ? '0' : '') + createdDate.getMinutes();
				}
				item.set('captionResult', result);
			}

			function getContactPhotoConfig() {
				var contactImageConfig = {
					source: Terrasoft.ImageSources.ENTITY_COLUMN,
					params: {
						schemaName: 'Contact',
						primaryColumnValue: Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
						columnName: 'Photo32'
					}
				};
				var imageUrl = Terrasoft.ImageUrlBuilder.getUrl(contactImageConfig);
				var imageConfig = {
					source: Terrasoft.ImageSources.URL,
					url: imageUrl
				};
				return imageConfig;
			}

			/*********************************************************************************************************/
			/*       View                                                                                            */
			/********************************************************************************************************/

			function getMoreRecordsButtonConfig() {
				var buttonConfig = GridUtilities.getLoadButtonConfig();
				buttonConfig.classes = {
					wrapperClass: 'show-more-btn-user-class'
				};
				buttonConfig.caption = {
					bindTo: 'getMoreCaptionButton'
				};
				return buttonConfig;
			}

			function getGeneralItemsCongif(viewModel) {
				var photo = viewModel.get('contactPhoto');
				var generalItemsConfig = {
					className: 'Terrasoft.Container',
					id: 'general-items-container' + recordId,
					selectors: {
						wrapEl: '#general-items-container' + recordId
					},
					classes: {
						wrapClassName: [
							'comment-input-container'
						]
					},
					items: [
						{
							id: 'general-items-photo-button' + recordId,
							selectors: {
								wrapEl: '#general-items-photo-button' + recordId
							},
							className: 'Terrasoft.Button',
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
							imageConfig: getContactPhotoConfig(),
							caption: ''
						},
						{
							id: 'general-items-text-button' + recordId,
							selectors: {
								wrapEl: '#general-items-text-button' + recordId
							},
							placeholder: resources.localizableStrings.AddCommentWatermark,
							className: 'Terrasoft.TextEdit',
							enterkeypressed: {
								bindTo: 'addComment'
							},
							value: {
								bindTo: 'newCommentValue'
							}
						}
					]
				};
				return generalItemsConfig;
			}

			function getGridConfig() {
				return {
					className: 'Terrasoft.Grid',
					type: 'tiled',
					id: 'knowBaseCommentsGrid' + recordId,
					selectors: {
						wrapEl: '#knowBaseCommentsGrid' + recordId
					},
					multiSelect: false,
					watchRowInViewport: 2,
					collection: {
						bindTo: 'commentsGridData'
					},
					activeRow: {
						bindTo: 'activeRow'
					},
					/*
					isEmpty: {
					bindTo: 'gridEmpty'
					},*/
					useRowActionsExternal: true,
					isLoading: false,
					activeRowAction: {
						bindTo: 'onActiveRowAction'
					},
					selectedRows: {
						bindTo: 'selectedRows'
					}
				};
			}

			function getCommentsGridConfig(viewModel) {
				var gridConfig = getGridConfig();
				var commentsConfig = {
					columnsConfig: [
						[
							{
								cols: 20,
								key: [
									{
										type: 'listed-icon-32x32',
										name: {
											bindTo: 'Contact'
										}
									},
									{
										type: 'title',
										name: {
											bindTo: 'CommentKnowledgeBase'
										}
									}
								]
							},
							{
								cols: 20,
								key: [
									{
										name: {
											bindTo: 'captionResult'
										},
										type: 'text'
									}
								]
							}
						]
					]
				};
				Ext.apply(gridConfig, commentsConfig);
				return gridConfig;
			}

			function getCurrentGridConfig(viewModel) {
				return getCommentsGridConfig(viewModel);
			}

			function getRightConfigContainer(viewModel) {
				return Ext.create('Terrasoft.Container', {
					id: 'rightContainerComment' + recordId,
					classes: {
						wrapClassName: [
							'right-container-comment'
						]
					},
					selectors: {
						wrapEl: '#rightContainerComment' + recordId
					},
					items: getGeneralItemsCongif(viewModel)
				});
			}

			function getLeftConfigContainer() {
				return Ext.create('Terrasoft.Container', {
					id: 'leftContainer' + recordId,
					classes: {
						wrapClassName: [
							'left-container'
						]
					},
					selectors: {
						wrapEl: '#leftContainer' + recordId
					},
					items: []
				});
			}

			function generateMainView(viewModel) {
				var getMore = getMoreRecordsButtonConfig();
				var leftConfigContainer = getLeftConfigContainer();
				var rightConfigContainer = getRightConfigContainer(viewModel);
				return Ext.create('Terrasoft.Container', {
						id: 'topContainer' + recordId,
						selectors: {
							wrapEl: '#topContainer' + recordId
						},
						items: [
							getMore, leftConfigContainer, rightConfigContainer
						]
					});
			}

			/*********************************************************************************************************/
			/*       Model                                                                                          */
			/********************************************************************************************************/

			var currentGrid;
			var viewModel;
			var viewConfig;
			var oldRecord;
			var recordId;

			function changeGridView() {
				if (currentGrid) {
					currentGrid.destroy();
				}
				var itemViewConfig = getCurrentGridConfig(viewModel);
				currentGrid = Ext.create(itemViewConfig.className, itemViewConfig);
				currentGrid.on('afterRowRender', viewModel.onAfterGridRowRender);
				currentGrid.bind(viewModel);
				var renderContainer = Ext.get('leftContainer' + recordId);
				if (!Ext.isEmpty(renderContainer)) {
					currentGrid.render(renderContainer);
				}
			}

			function LoadView(renderTo, scope, sandboxExternal) {
				//if (instance.isDestroyed) { return; }
				if (viewModel && viewConfig/* && oldRecord === recordId*/) {
					//viewModel.destroy();
					viewConfig.destroy();
					viewConfig = generateMainView(viewModel);
					viewConfig.bind(viewModel);
					viewConfig.render(renderTo);
					changeGridView();
					return;
				}
				if (instance.isDestroyed) {
					instance.isDestroyed = false;
				}
				var sandbox = sandboxExternal;
				var cardModuleId = sandbox.id;
				sandbox.subscribe('DestroyCommentModule', function() {
					instance.isDestroyed = true;
					if (viewModel) {
						viewModel.destroy();
					}
					if (viewConfig) {
						viewConfig.destroy();
					}
					if (currentGrid) {
						currentGrid.destroy();
					}
				}, [sandbox.id]);
				oldRecord = recordId;
				var recordObj = sandbox.publish('GetRecordInfo', null, [sandbox.id]);
				recordId = recordObj.recordId;
				viewModel = getViewModel();
				viewModel.sandbox = sandbox;
				viewModel.cardAction = recordObj.operationType;
				viewModel.set('knowledgeBaseRecordId', recordId);
				viewModel.changeGridView = function() {
					changeGridView();
				};

				sandbox.subscribe('UpdateDetail', function(recordId) {
					viewModel.set('knowledgeBaseRecordId', recordId);
				}, [recordObj.cardModuleId]);
				viewConfig = generateMainView(viewModel);
				initViewModel(function() {
					this.loadCommentsCollection(0);
					viewConfig.bind(this);
					viewConfig.render(renderTo);
				}, viewModel);
			}

			function initViewModel(callback, scope) {
				callServiceMethod('RightsService', 'GetCanExecuteOperation', function(result) {
					if (instance.isDestroyed) {
						return;
					}
					scope.set('CanEditOrDeleteComment', result.GetCanExecuteOperationResult);
					callback.call(scope);
				}, {
					operation: 'CanEditOrDeleteComment'
				}, scope);
			}

			var instance = Ext.define('CommentsModule', {
				init: init,
				render: function(renderTo) {
					LoadView(renderTo, this, sandbox);
				}
			});
			return instance;
		}

		return createConstructor;
	}

);