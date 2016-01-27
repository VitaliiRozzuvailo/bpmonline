define("AddTagModule", ["AddTagViewModule", "AddTagView", "AddTagModuleResources"],
	function(AddTagViewModule, AddTagView) {
		var addTagModule = Ext.define("Terrasoft.configuration.AddTagModule", {
			extend: "Terrasoft.BaseModule",
			alternateClassName: "Terrasoft.AddTagModule",
			Ext: null,
			Terrasoft: null,
			sandbox: null,
			viewModel: null,
			view: null,

			adjustTagViewModel: function() {
				var viewModel = this.viewModel;
				viewModel.Ext = this.Ext;
				viewModel.Terrasoft = this.Terrasoft;
				viewModel.sandbox = this.sandbox;
				viewModel.set("editVisible", !viewModel.readOnlyMode);
				viewModel.showTagEdit = function(valueEditConfig, afterDestroy, renderIndex) {
					var tagContainer = this.Ext.get("tagCommonContainer");
					var addConditionView = this.Ext.getCmp("tagEditContainer");
					if (addConditionView) {
						if (this.afterDestroy) {
							this.afterDestroy();
						}
						if (renderIndex !== undefined) {
							addConditionView.reRender(renderIndex);
						}
						else {
							addConditionView.reRender(null, tagContainer);
						}
						addConditionView.items.getAt(0).getEl().focus();
					}
					else {
						var addConditionViewConfig = AddTagView.generateAddTagConfig();
						addConditionView = this.Ext.create("Terrasoft.Container", addConditionViewConfig);
						this.destroyTagAddingContainer = function() {
							addConditionView.destroy();
						};
						addConditionView.bind(this);
						if (renderIndex !== undefined) {
							addConditionView.render(tagContainer, renderIndex);
						} else {
							addConditionView.render(tagContainer);
						}
						addConditionView.items.getAt(0).getEl().focus();
						this.set("editVisible", false);
						var me = this;
						addConditionView.on("destroy", function() {
							if (me.afterDestroy) {
								me.afterDestroy();
							}
							me.set("editVisible", !me.readOnlyMode);
						});
					}
					this.afterDestroy = afterDestroy;
				};
				viewModel.getTagViewModel = function(tagName, config) {
					var tagViewModelConfig = this.Ext.create("Terrasoft.BaseViewModel", config);
					var tagViewsContainer = this.Ext.get("tagCommonContainer");
					var me = this;
					tagViewModelConfig.removeTag = function(a1, a2, a3, tag) {
						var tags = me.get("tags");
						tags.removeByKey(tag);
					};
					var tags = this.get("tags");
					var renderIndex = tags ? tags.collection.length : 0;
					var tagView = this.Ext.create("Terrasoft.Container",
					AddTagView.generateTagViewConfig(tagName, this.readOnlyMode ? "view" : ""));
					tagViewModelConfig.set("readOnlyMode", this.readOnlyMode);
					tagView.bind(tagViewModelConfig);
					tagViewModelConfig.set("view", tagView);
					tagViewModelConfig.set("editVisible", !this.readOnlyMode);
					if(tagViewsContainer != null) {
						tagView.render(tagViewsContainer, renderIndex);
					}
					return tagViewModelConfig;
				};
				viewModel.onTagsSaved = function() {
					this.sandbox.publish("GetTagsSaved", null, [this.sandbox.id]);
				};
				viewModel.goToSection = function(tagName) {
					var tags = this.get("tags");
					var tag = tags.find(tagName);
					var schema = this.getRootTagSchemaName();
					var sectionName = Terrasoft.configuration.ModuleStructure[schema].sectionSchema;
					var token = ["SectionModule", sectionName];
					var historyState = this.sandbox.publish("GetHistoryState");
					this.sandbox.publish("PushHistoryState", {
						hash: token.join("/") + (/^.*\/$/.test(historyState.hash.historyState) ? "" : "/"),
						stateObj: {
							filterState: {
								tagFilterState: [{
									value: tag.get("value"),
									displayValue: tag.get("displayValue")
								}]
							}

						}
					});

				};
			},

			init: function() {
				if (this.viewModel) {
					return;
				}
				var args = this.sandbox.publish("GetRecordInfo", null, [this.sandbox.id]);
				var readOnlyMode = args.readOnlyMode;
				var entitiesConfig = args.entitiesConfig;
				var modelConfig = AddTagViewModule.generate(entitiesConfig);
				var viewModel = this.viewModel = Ext.create("Terrasoft.BaseViewModel", modelConfig);
				viewModel.readOnlyMode = readOnlyMode;
				viewModel.sandbox = this.sandbox;
				this.adjustTagViewModel();
				viewModel.initialize(args.recordId);
				this.sandbox.subscribe("SaveTags", function(knowledgeBaseId) {
					var id = knowledgeBaseId || this.get("BaseRecordId");
					if (!this.readOnlyMode) {
						this.saveTags(id);
					}
					return true;
				}, viewModel, [this.sandbox.id]);
				this.sandbox.subscribe("ReRenderTagModule", function(renderTo) {
					this.reRender(renderTo);
				}, this, [this.sandbox.id]);

				this.sandbox.subscribe("AddTagModuleDataReload", function(recordId) {
					this.set("BaseRecordId", recordId);
					this.loadItemsFromRecord(recordId);
				}, viewModel, [this.sandbox.id]);
			},

			reRender: function(renderTo) {
				var view = this.view;
				if (view && !view.destroyed) {
					view.reRender(0, renderTo);
					var tags = this.viewModel.get("tags");
					tags.each(function(tagItem) {
						tagItem.get("view").reRender(null, this.Ext.get("tagCommonContainer"));
					}, this);
				}
			},

			render: function(renderTo) {
				var viewConfig = AddTagView.generate();
				var view = this.view = this.Ext.create("Terrasoft.Container", viewConfig);
				view.bind(this.viewModel);
				view.render(renderTo);
			}
		});
		return addTagModule;
	});
