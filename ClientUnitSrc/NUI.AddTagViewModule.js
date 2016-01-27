define('AddTagViewModule', ['ext-base', 'terrasoft', 'AddTagViewModuleResources'],
	function(Ext, Terrasoft, resources) {

		var tagPrefix = 'tagPrefix';

		function generate(config) {
			return {
				columns: {
					tagColumn: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'tagColumn'
					},
					tagColumnList: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'tagColumnList',
						isCollection: true
					},
					tagValueColumn: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'tagValueColumn'
					}
				},
				values: {
					tags: new Terrasoft.Collection(),
					filters: new Terrasoft.Collection(),
					tagsViews: new Terrasoft.Collection(),
					currentTagName: null,
					tagColumnList: new Terrasoft.Collection(),
					editVisible: false,
                    config: config || {}
				},
				methods: {
					addTag: addTag,
					applyTag: applyTag,
					generateTagViewModelConfig: generateTagViewModelConfig,
					getValueEditControlConfig: getValueEditControlConfig,
					addTagValue: addTagValue,
					editTag: editTag,
					clearTagProperties: clearTagProperties,
					loadTagViews: loadTagViews,
					addTagView: addTagView,
					removeTagView: removeTagView,
					clearTagViews: clearTagViews,
					subscribeForCollectionEvent: subscribeForCollectionEvent,
					initialize: initialize,
					saveTags: saveTags,
					getFilterValue: getFilterValue,
					getFilters: getFilters,
					updateFilterItems: updateFilterItems,
					getAddButtonCaption: getAddButtonCaption,
                    getTagSchemaName: getTagSchemaName,
                    getTagDecouplingSchemaName: getTagDecouplingSchemaName,
                    getRootTagSchemaName: getRootTagSchemaName,
					loadItemsFromRecord: loadItemsFromRecord,
					loadItemsFromState: loadItemsFromState
				}
			};
		}

		function getAddButtonCaption() {
			if (!this.isFilterMode) {
				return resources.localizableStrings.AddTagCaption;
			}
			return resources.localizableStrings.AddCaption;
		}

		function generateTagViewModelConfig() {
			return {
				columns: {
					displayValue: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'displayValue'
					},
					tagName: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'tagName'
					}
				},
				values: {
					columnCaption: '',
					columnName: null,
					value: null,
					dataValueType: null,
					view: null,
					viewVisible: true
				},
				methods: {
				}
			};
		}

        function getRootTagSchemaName() {
            var config = this.get('config');
            if (config.entitySchema) {
                return config.entitySchema.name;
            }
        }
        function getTagSchemaName() {
            var config = this.get('config');
            if (config.tagSchema) {
                return config.tagSchema.name;
            }
        }

        function getTagDecouplingSchemaName() {
            var config = this.get('config');
            if (config.decouplingSchema) {
                return config.decouplingSchema.name;
            }
        }
		function initialize(recordId) {
			this.set('BaseRecordId', recordId);
			this.set('editVisible', !this.readOnlyMode);
			this.subscribeForCollectionEvent();

            if (typeof recordId === 'string') {
                this.loadItemsFromRecord(recordId);
            } else {
                this.loadItemsFromState(this);
            }
		}
        function loadItemsFromState() {
            if (!('getFilterState' in this)) {
                return;
            }
            var filterState = this.getFilterState('Tag');
            if (!Ext.isEmpty(filterState)) {
                Terrasoft.each(filterState, function(item) {
                    this.addTagValue(item);
                }, this);
            }
        }
		function showTagEdit(valueEditConfig, afterDestroy, renderIndex) {
			var tagContainer = this.Ext.get('tagCommonContainer');
			var addConditionView = this.Ext.getCmp('tagEditContainer');
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
				this.set('editVisible', false);
				addConditionView.on('destroy', function() {
					if (this.afterDestroy) {
						this.afterDestroy();
					}
					this.set('editVisible', !this.readOnlyMode);
				});
			}
			this.afterDestroy = afterDestroy;
		}

        function loadItemsFromRecord(recordId) {
            this.recordId = recordId;
			var tags = this.get("tags");
			var filters = this.get('filters');
			tags.clear();
			filters.clear();
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
                rootSchemaName: this.getTagDecouplingSchemaName()
            });
            select.addColumn('Tag');
            var tagNameColumn = select.addColumn('Tag.Name');
            tagNameColumn.orderDirection = Terrasoft.OrderDirection.ASC;
            select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                this.getRootTagSchemaName(), recordId));
            select.getEntityCollection(function(response) {
                if (!this.isInstance) { return; }
                response.collection.each(function(item) {
                    this.addTagValue(item.get('Tag'), recordId);
                }, this);
            }, this);
        }
        function removeItem(value) {
            var itemIndex = this.indexOf(value);
            return this.splice(itemIndex, 1);
        }
		function insertToTagAndSave(existingItems, allItems, recordId) {
            var bq = Ext.create('Terrasoft.BatchQuery');
            existingItems.each(function(item) {
                var existingTagDisplayValue = item.get('Name');
                removeItem.call(allItems, existingTagDisplayValue);
                bq.add(getInsertToTagDecouplingQuery.call(this,
                    recordId,
                    item.get('Id')));
            }, this);

            Terrasoft.each(allItems, function(item) {
                var insertTag = Ext.create('Terrasoft.InsertQuery', {
                    rootSchemaName: this.getTagSchemaName()
                });
                insertTag.setParameterValue('Name', item, Terrasoft.DataValueType.TEXT);
                bq.add(insertTag);
            }, this);

            if (bq.queries.length) {
                bq.execute(function(response) {
                    var inserItemsBQ = Ext.create('Terrasoft.BatchQuery');
                    Terrasoft.each(response.queryResults, function(item, index) {
                        if (bq.queries[index].query.rootSchemaName === this.getTagSchemaName()) {
                            inserItemsBQ.add(getInsertToTagDecouplingQuery.call(this, recordId, item.id));
                        }
                    }, this);
                    if (inserItemsBQ.queries.length) {
                        inserItemsBQ.execute(function() {
                            this.onTagsSaved();
                        }, this);
                    } else {
                        this.onTagsSaved();
                    }
                }, this);
            }
		}

		function getInsertToTagDecouplingQuery(recordId, tagValue) {
			var insert = Ext.create('Terrasoft.InsertQuery', {
				rootSchemaName: this.getTagDecouplingSchemaName()
			});
			insert.setParameterValue(this.getRootTagSchemaName(), recordId, Terrasoft.DataValueType.GUID);
			insert.setParameterValue('Tag', tagValue, Terrasoft.DataValueType.GUID);
			return insert;
		}

		function saveTags(recordId) {
			var tags = this.get('tags');
			var elementRecordId = recordId;
			var tagCollection = [];
            var scope = this;
            var bq = Ext.create('Terrasoft.BatchQuery');
			var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
				rootSchemaName: this.getTagDecouplingSchemaName()
			});
			deleteQuery.filters.addItem(deleteQuery.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, this.getRootTagSchemaName(), this.recordId));
            bq.add(deleteQuery);

			var tagsLength = tags.getCount();
            var newTags = [];
            tags.each(function(item) {
				tagsLength = tagsLength - 1;
                var tagDisplayValue = item.get('displayValue');
				if (!Ext.isEmpty(item.get('value'))) {
                    bq.add(getInsertToTagDecouplingQuery.call(this,
                        elementRecordId,
                        item.get('value')));
				} else {
                    newTags.push(tagDisplayValue);
				}
                tagCollection.push(tagDisplayValue);
			}, this);
            if (!Ext.isEmpty(newTags)) {
                var select = Ext.create('Terrasoft.EntitySchemaQuery', {
                    rootSchemaName: this.getTagSchemaName()
                });
                select.addColumn('Id');
                select.addColumn('Name');
                select.filters.addItem(select.createColumnInFilterWithParameters('Name', newTags));
                bq.add(select, function(responce) {
                    var existingItems = responce.collection;
                    var allItems = newTags;
                    insertToTagAndSave.call(scope, existingItems, allItems, recordId);
                });
            }
			var update = Ext.create("Terrasoft.UpdateQuery", {
                rootSchemaName: this.getRootTagSchemaName()
            });
            update.setParameterValue('Keywords', tagCollection.join(', '), Terrasoft.DataValueType.TEXT);
            var idFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                'Id', elementRecordId);
            update.filters.add('IdFilter', idFilter);
            bq.add(update);
            if (bq.queries.length) {
                bq.execute(function() {
                    if (Ext.isEmpty(newTags)) {
                        this.onTagsSaved();
                    }
                }, this);
            }
        }

		function updateFilterItems() {
			var tags = this.get('tags');
			this.filterLoading = true;
			var filterItems = new Terrasoft.Collection();
			var tagsCollectionLength = tags.collection.length;
			if (tagsCollectionLength > 0) {
				Terrasoft.each(tags.getItems(), function(tag) {
					var tagName = tag.get('displayValue');
					var select = Ext.create('Terrasoft.EntitySchemaQuery', {
						rootSchemaName: this.getTagSchemaName()
					});
					select.addColumn('Id');
					select.addColumn('Name');
					select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.CONTAIN,
                        'Name', tagName));
					select.getEntityCollection(function(response) {
                        if (response.success) {
							Terrasoft.each(response.collection.getItems(), function(item) {
                                var vl = item.get('Id');
                                if (!filterItems.find(vl)) {
                                    filterItems.add(vl, vl);
                                }
                                this.set('filters', filterItems);
                            }, this);
                            this.filterChanged();
						} else {
							var empty = Terrasoft.GUID_EMPTY;
							filterItems.add(empty, empty);
							this.set('filters', filterItems);
							if (tagsCollectionLength === 0) {
								this.filterLoading = false;
								this.filterChanged();
							}
						}
					}, this);
				}, this);
			} else {
				this.set('filters', new Terrasoft.Collection());
				this.filterChanged();
			}
		}

		function addTag() {
			var valueEditConfig = this.getValueEditControlConfig();
			this.showTagEdit(valueEditConfig);
		}

		function addTagValue(item, recordId) {
			if (Ext.isEmpty(item.displayValue)) { return; }
			var tags = this.get('tags');
            var currentTagName = this.get('currentTagName');
			var tagName = tagPrefix + item.displayValue.replace(/[^a-zа-яё0-9_]/ig, '_');
			var tag = tags.find(currentTagName || tagName);
			if (!tag) {
				var config = this.generateTagViewModelConfig();
				var customTagViewModel = this;
				config.methods.editTag = function(tag) {
					if (customTagViewModel.get('editVisible')) {
						customTagViewModel.editTag(tag);
					}
					if (customTagViewModel.readOnlyMode) {
						//customTagViewModel.goToSection(tag);//todo add after tag filter will be enabled
					}
				};
				tag = this.getTagViewModel(tagName, config);
				tag.set('tagName', tagName);
				tag.set('displayValue', item.displayValue);
				tag.set('value', item.value);
				tag.set('recordId', recordId);
				tags.removeByKey(currentTagName);
                tags.add(tagName, tag);
                if (!Ext.isEmpty(item.value)) {
                    this.get('filters').add(item.value, item.value);
                }
				if (this.isFilterMode) {
					this.updateFilterItems(item, this);
				}
			} else {
				tag.set('displayValue', item.displayValue);
				tag.set('value', item.value);
				tag.set('recordId', recordId);
				if (this.isFilterMode) {
					this.updateFilterItems(item, this);
				}
			}
            this.set('currentTagName', null);
		}

		function applyTag() {
			var tagValue = this.get('tagValueColumn');
			if(tagValue.length >=100) {
				tagValue = tagValue.substr(0, 100);
			}
			var tagColumnValue = {
				displayValue: tagValue,
				value: ''
			};
			this.addTagValue(tagColumnValue);
			this.destroyTagAddingContainer();
			this.sandbox.publish("ChangeTags",null,[this.sandbox.id]);
		}

		function clearTagProperties() {
			this.set('tagColumn', null);
			this.set('tagValueColumn', null);
			this.set('currentTagName', null);
		}

		function getValueEditControlConfig() {
			return 'Terrasoft.TextEdit';
		}

		function subscribeForCollectionEvent() {
			var tags = this.get('tags');
			tags.on('dataLoaded', this.loadTagViews, this);
			if (!this.readOnlyMode) {
				tags.on('add', this.addTagView, this);
				tags.on('remove', this.removeTagView, this);
				tags.on('clear', this.clearTagViews, this);
			}
		}

		function loadTagViews() {
			var tagsViews = this.get('tagsViews');
			var tags = this.get('tags');
			tags.each(function(tagViewModel) {
				tagsViews.add(tagViewModel.get('tagName'), tagViewModel.get('view'));
			});
		}

		function addTagView(tagViewModel) {
			var tagsViews = this.get('tagsViews');
			tagsViews.add(tagViewModel.get('tagName'), tagViewModel.get('view'));
		}

		function removeTagView(tagViewModel) {
			var tagsViews = this.get('tagsViews');
			var view = tagsViews.removeByKey(tagViewModel.get('tagName'));
			view.destroy();

		this.sandbox.publish("ChangeTags",null,[this.sandbox.id]);

		}

		function clearTagViews() {
			var tagsViews = this.get('tagsViews');
			tagsViews.each(function(view) {
				view.destroy();
			});
			tagsViews.clear();
		}

		function editTag(tag) {
			if (this.readOnlyMode || tag === this.get('currentTagName')) {
				//this.goToSection(tag);//todo add after tag filter will be enabled
				return;
			}
			var tags = this.get('tags');
			var tagViewModel = tags.find(tag);
			if (tagViewModel) {
				var renderIndex = tags.indexOf(tagViewModel);
				this.set('currentTagName', tag);
				var value = tagViewModel.get('displayValue');
				this.set('tagValueColumn', value);
				var valueEditConfig = this.getValueEditControlConfig();
				tagViewModel.set('viewVisible', false);
				this.showTagEdit(valueEditConfig, function() {
					tagViewModel.set('viewVisible', true);
				}, renderIndex);
			}
		}
		function getFilterValue() {
			var result = [];
            var tags = this.get('tags');
            tags.each(function(item) {
                result.push({
                    value: item.get('value'),
                    displayValue: item.get('displayValue')
                });
            }, this);
			return Ext.isEmpty(result) ? null : result;
		}
		function getFilters() {
			var filters = this.get('filters');
			var filterCollection = Terrasoft.createFilterGroup();
			if (filters && filters.collection.length > 0) {
                var columnName =
                    '[' + this.getTagDecouplingSchemaName() + ':' + this.getRootTagSchemaName() + '].Tag.Id';
				filterCollection.add('tagsFilter', Terrasoft.createColumnInFilterWithParameters(
                    columnName, filters.getKeys()));
			}
			return filterCollection;
		}
		return {
			generate: generate
		};
	});