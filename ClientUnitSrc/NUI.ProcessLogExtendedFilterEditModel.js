define('ProcessLogExtendedFilterEditModel', ['ext-base', 'terrasoft',
    'ProcessLogExtendedFilterEditModelResources', 'ExtendedFilterEditModel', 'LookupUtilities'],
    function(Ext, Terrasoft, resources, ExtendedFilterEditModel, LookupUtilities) {

        function generateModel(sandbox, renderTo) {
            var model = ExtendedFilterEditModel.generateModel(sandbox, renderTo);
            model.values.lookupSelectedValue = null;
            model.values.entitySchemaName = null;
            model.values.entitySchemaLookupEditList = new Terrasoft.Collection();
            model.methods.changedEntitySchemaName = function(filterValue, columnName) {
                var entitySchemaName = Ext.isEmpty(filterValue) ?   null : filterValue.Name;
				var entitySchemaCaption = Ext.isEmpty(filterValue) ?   null : filterValue.displayValue;
				this.set('entitySchemaName', entitySchemaName);
                this.assignFilterManager(null, entitySchemaCaption);
            };
            model.methods.getEntitySchemaName = function() {
                return this.get('entitySchemaName') || this.get('sectionEntitySchemaName');
            };
            model.methods.loadEntitySchemaNames = function(args, tag) {
                var config = {
                    entitySchemaName: 'VwSysEntitySchemaInWorkspace',
                    multiSelect: false,
                    columns: ['Name'],
                    filters: this.getLookupFilters(),
                    columnName: 'lookupSelectedValue',
                    searchValue: args.searchValue
                };
                var handler = function(args) {
                    var items = args.selectedRows.getItems() || [];
                    if (items.length > 0) {
                        var selectedValue = items[0];
                        this.set(args.columnName, selectedValue);
                        this.set('entitySchemaName', selectedValue.Name);
                        this.assignFilterManager(null, selectedValue.displayValue);
                    }
                };
                LookupUtilities.Open(this.get('sandbox'), config, handler, this, this.get('renderTo'));
            };
            model.methods.getLookupFilters = function() {
                var filterCollection = Terrasoft.createFilterGroup();
                filterCollection.add("SysWorkspace",
                    Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                        'SysWorkspace', Terrasoft.SysValue.CURRENT_WORKSPACE.value));
                return filterCollection;
            };
            model.methods.getEntitySchemaNames = function(filter, list) {
                if (Ext.isEmpty(filter)) {
                    return;
                }
                var esq = Ext.create('Terrasoft.EntitySchemaQuery', {
                    rootSchemaName: 'VwSysEntitySchemaInWorkspace'
                });
                esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, 'value');
                esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, 'displayValue');
                esq.addColumn('Name');
                esq.filters.add('CurrentWorkspace', this.getLookupFilters());
                esq.filters.add('CurrentDisplayValue', Terrasoft.createColumnFilterWithParameter(
                    Terrasoft.ComparisonType.START_WITH, 'Caption', filter));
                esq.getEntityCollection(function(result) {
                    if (result && result.success && result.collection) {
                        var columns = {};
                        Terrasoft.each(result.collection.getItems(), function(item) {
                            var itemId = item.get('value');
                            columns[itemId] = {
                                value: itemId,
                                displayValue: item.get('displayValue'),
                                Name: item.get('Name')
                            }
                        });
                        list.loadAll(columns);
                    }
                }, this);
            };
            model.methods.assignFilterManager = function(deserializedFilters, entitySchemaCaption) {
                var entitySchemaName = this.getEntitySchemaName();
                if (Ext.isEmpty(entitySchemaName)) {
                    return;
                }
                var map = {};
                map.EntitySchemaFilterProviderModule = {
                    sandbox: 'sandbox_' + this.get('sandbox').id,
                    'ext-base': 'ext_' + Ext.id
                };
                requirejs.config({
                    map: map
                });
                var filterModel = this;
                require(['EntitySchemaFilterProviderModule'], function(EntitySchemaFilterProviderModule) {
                    var entitySchemaProvider = new EntitySchemaFilterProviderModule({
                        rootSchemaName: entitySchemaName
                    });
                    entitySchemaProvider.renderTo = filterModel.get('renderTo');
                    filterModel.clearFilterView.call(filterModel);
                    var filterManager = Ext.create('Terrasoft.FilterManager', {
                        provider: entitySchemaProvider
                    });
                    filterModel.assignFilterManagerFilters.call(filterModel, filterManager, deserializedFilters);
					if (entitySchemaCaption) {
						filterManager.filters.rootSchemaCaption = entitySchemaCaption;
					}
                    filterModel.set('FilterManager', filterManager);
                });
            };
            model.methods.assignFilterManagerFilters = function(filterManager, deserializedFilters) {
                if (Ext.isEmpty(deserializedFilters)) {
                    filterManager.setFilters(Ext.create('Terrasoft.FilterGroup'));
                } else {
                    filterManager.setFilters(deserializedFilters);
                }
            };
            model.methods.assignFilterManagerEvents = function(filterManager) {
                filterManager.on('addFilter', this.changeFilter, this);
                filterManager.on('removeFilter', this.changeFilter, this);
                filterManager.on('changeFilter', this.changeFilter, this);
            };
            model.methods.renderFilter = function() {
                var entitySchemaName = this.getEntitySchemaName();
                if (Ext.isEmpty(entitySchemaName)) {
                    return;
                }
                var filterEditContainer = this.get('filterEditContainer');
                if (Ext.isEmpty(filterEditContainer)) {
                    return;
                }
                var viewConfig = ProcessLogFolderFilterView.getFolderView();
                this.clearFilterView.call(this);
                var filterView = Ext.create(viewConfig.className || 'Terrasoft.ControlGroup', viewConfig);
                filterView.bind(this);
                filterView.render(filterEditContainer);
                this.set('filterView', filterView);
            };
            model.methods.clearFilterView = function() {
                var filterView = this.get('filterView');
                if (filterView) {
                    filterView.destroy();
                    this.set('filterView', null);
                }
            };
            model.methods.assignEntitySchema = function(deserializedFilters, shouldAssignFilterManager) {
                var filterModel = this;
                var entitySchemaName = Ext.isEmpty(deserializedFilters)
                    ? null : deserializedFilters.rootSchemaName;
                filterModel.set('entitySchemaName', entitySchemaName);
                entitySchemaName = filterModel.getEntitySchemaName();
                if (entitySchemaName === filterModel.get('sectionEntitySchemaName')) {
                    var lookupSelectedValue = {
                        value: null,
                        displayValue: '',
                        Name: entitySchemaName
                    };
                    filterModel.set('lookupSelectedValue', lookupSelectedValue);
                    if (shouldAssignFilterManager) {
                        filterModel.assignFilterManager.call(filterModel, deserializedFilters);
                    }
                    return;
                }
                filterModel.get('sandbox').requireModuleDescriptors([entitySchemaName], function(descriptors) {
                    require([entitySchemaName], function(schema) {
                        var lookupSelectedValue = {
                            value: schema.instanceId,
                            displayValue: schema.caption,
                            Name: schema.name
                        };
                        filterModel.set('lookupSelectedValue', lookupSelectedValue);
						if (deserializedFilters) {
							deserializedFilters.rootSchemaCaption = schema.caption;
						}
                        if (shouldAssignFilterManager) {
                            filterModel.assignFilterManager.call(filterModel, deserializedFilters);
                        }
                    });
                });
            };
            return model;
        }

        return {
            generateModel: generateModel
        };
    });
